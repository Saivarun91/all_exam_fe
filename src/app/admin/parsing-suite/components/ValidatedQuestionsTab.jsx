"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, RefreshCw, CheckCircle, Download } from "lucide-react";

function matchesSearch(q, search) {
  const s = (search || "").toLowerCase();
  if (!s) return true;
  if ((q.question_text || "").toLowerCase().includes(s)) return true;
  for (const o of q.options || []) {
    const t = typeof o === "object" ? (o.text || o.value || "") : String(o);
    if (t.toLowerCase().includes(s)) return true;
  }
  for (const a of q.openai_answers || []) {
    if (String(a).toLowerCase().includes(s)) return true;
  }
  for (const a of q.gemini_answers || []) {
    if (String(a).toLowerCase().includes(s)) return true;
  }
  if ((q.explanation || "").toLowerCase().includes(s)) return true;
  return false;
}

export default function ValidatedQuestionsTab({
  validatedQuestions,
  validatedLoading,
  loading,
  selectedValidatedIds,
  toggleSelectValidated,
  toggleSelectAllValidated,
  toggleSelectAllValidatedFiltered,
  setShowBulkDeleteValidatedConfirm,
  openEditValidated,
  openDeleteValidated,
  handleRegenerateSelected,
  handleRevalidateSelected,
  searchQuery,
  onSearchChange,
  // handleDownloadValidatedQuestionsCSV,
  currentSessionId,
}) {
  const displayList = validatedQuestions;
  const filtered = !searchQuery?.trim() ? displayList : displayList.filter((q) => matchesSearch(q, searchQuery));
  const maxOpts = displayList.length
    ? Math.max(4, ...displayList.map((q) => (q.options || []).length))
    : 4;

  function getQuestionType(q) {
    const n = (q.openai_answers || []).length;
    return n <= 1 ? "single-correct" : "multiple-correct";
  }
  function handleDownloadValidatedQuestionsCSV() {
    console.log("Downloading validated questions CSV (session-based)");
  
    const token = localStorage.getItem("token");
    console.log("token : ",token)
    fetch(
      `http://localhost:8000/api/question-validation/validated-questions/download-csv/?session_id=${currentSessionId}`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        
        credentials: "include", // 🔥 THIS IS REQUIRED
      }
    )
    
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "validated_questions.csv"; // backend can rename if needed
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error(err);
        alert("CSV download failed");
      });
  }
  
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Validated Questions</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Questions appear here only after you click &quot;Validate with Gemini AI&quot; in the Generated Questions tab. OpenAI answers, Gemini answers, and status.
            </p>
          </div>
          {validatedQuestions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || selectedValidatedIds.size === 0}
                onClick={handleRegenerateSelected}
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={handleRevalidateSelected}
              > 
                <CheckCircle className="w-4 h-4 mr-1" /> Revalidate
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={selectedValidatedIds.size === 0}
                onClick={() => setShowBulkDeleteValidatedConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Bulk Delete {selectedValidatedIds.size ? `(${selectedValidatedIds.size})` : ""}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadValidatedQuestionsCSV}// this prop
              >
                <Download className="w-4 h-4 mr-1" /> Download CSV
              </Button>


            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {validatedQuestions.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by question, options, answers, explanation..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
        {validatedLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : validatedQuestions.length === 0 ? (
          <p className="text-gray-500">
            No validated questions yet. Go to Generated Questions and click &quot;Validate with Gemini AI&quot; to see results here.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No questions match your search.</p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left font-medium p-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((q) => q.id && selectedValidatedIds.has(q.id))}
                      onChange={() =>
                        toggleSelectAllValidatedFiltered
                          ? toggleSelectAllValidatedFiltered(filtered.map((q) => q.id).filter(Boolean))
                          : toggleSelectAllValidated()
                      }
                      className="rounded"
                    />
                  </th>
                  <th className="text-left font-medium p-3 w-12">#</th>
                  <th className="text-left font-medium p-3 min-w-[200px]">Question Text</th>
                  <th className="text-left font-medium p-3 w-36">Question Type</th>
                  {Array.from({ length: maxOpts }, (_, j) => (
                    <React.Fragment key={j}>
                      <th className="text-left font-medium p-3 min-w-[140px]">Option {j + 1}</th>
                      <th className="text-left font-medium p-3 min-w-[140px] text-gray-600">Option {j + 1} Explanation</th>
                    </React.Fragment>
                  ))}
                  <th className="text-left font-medium p-3 min-w-[140px]">Correct Answers (OpenAI)</th>
                  <th className="text-left font-medium p-3 min-w-[140px]">Gemini AI Answer(s)</th>
                  <th className="text-left font-medium p-3 min-w-[200px]">Overall Explanation</th>
                  <th className="text-left font-medium p-3 w-28">Status</th>
                  <th className="text-left font-medium p-3 w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const opts = (q.options || []).map((o) =>
                    typeof o === "object"
                      ? { text: o.text || o.value || "", explanation: o.explanation || "" }
                      : { text: String(o), explanation: "" }
                  );
                  return (
                    <tr key={q.id || i} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="p-3 align-top">
                        <input
                          type="checkbox"
                          checked={q.id ? selectedValidatedIds.has(q.id) : false}
                          onChange={() => q.id && toggleSelectValidated(q.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 text-gray-600">{i + 1}</td>
                      <td className="p-3 text-gray-900 align-top">{q.question_text || "—"}</td>
                      <td className="p-3 align-top">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800">
                          {getQuestionType(q)}
                        </span>
                      </td>
                      {Array.from({ length: maxOpts }, (_, j) => (
                        <React.Fragment key={j}>
                          <td className="p-3 text-gray-800 align-top font-medium">
                            {opts[j] ? opts[j].text : ""}
                          </td>
                          <td className="p-3 text-gray-600 text-xs align-top italic">
                            {opts[j] ? opts[j].explanation : ""}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="p-3 text-gray-700 align-top font-medium">
                        {(q.openai_answers || []).length ? (q.openai_answers || []).join(", ") : "—"}
                      </td>
                      <td className="p-3 text-gray-700 align-top font-medium">
                        {(q.gemini_answers || []).length ? (q.gemini_answers || []).join(", ") : "—"}
                      </td>
                      <td className="p-3 text-gray-600 text-sm align-top min-w-[200px] whitespace-pre-wrap">
                        {(q.explanation != null && String(q.explanation).trim() !== "") ? String(q.explanation).trim() : "—"}
                      </td>
                      <td className="p-3 align-top">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            q.is_valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {q.is_valid ? "Valid" : "Non valid"}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditValidated(q)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteValidated(q.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
