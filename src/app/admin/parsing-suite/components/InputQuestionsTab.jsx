"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Sparkles, Search } from "lucide-react";

export default function InputQuestionsTab({
  inputQuestions,
  questionsLoading,
  maxOptionCols,
  selectedInputIds,
  toggleSelectQuestion,
  toggleSelectAll,
  toggleSelectAllFiltered,
  setShowBulkDeleteConfirm,
  openEdit,
  openDelete,
  handleGenerateNewQuestions,
  loading,
  searchQuery,
  onSearchChange,
}) {
  const filtered = !searchQuery.trim()
    ? inputQuestions
    : inputQuestions.filter(
        (q) =>
          (q.question_text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.options || []).some((o) => String(typeof o === "object" ? o.text ?? o.value : o).toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Input Questions (current document)</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Questions from the last parsed document only.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={selectedInputIds.size === 0}
            onClick={() => setShowBulkDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Bulk Delete {selectedInputIds.size ? `(${selectedInputIds.size})` : ""}
          </Button>
          <Button onClick={handleGenerateNewQuestions} variant="default" disabled={loading || inputQuestions.length === 0}>
            <Sparkles className="w-4 h-4 mr-2" /> Generate New Questions
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {inputQuestions.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by question text or options..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
        {questionsLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : inputQuestions.length === 0 ? (
          <p className="text-gray-500">No questions yet. Use Parse & Save All from Configuration.</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No questions match your search.</p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left font-medium p-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((q) => q.id && selectedInputIds.has(q.id))}
                      onChange={() => toggleSelectAllFiltered(filtered.map((q) => q.id).filter(Boolean))}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left font-medium p-3 w-12">#</th>
                  <th className="text-left font-medium p-3 min-w-[200px]">Question Text</th>
                  {Array.from({ length: maxOptionCols }, (_, j) => (
                    <th key={j} className="text-left font-medium p-3 min-w-[120px]">Option {j + 1}</th>
                  ))}
                  <th className="text-left font-medium p-3 w-28">Parsing Flag</th>
                  <th className="text-left font-medium p-3 w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const opts = (q.options || []).map((o) => (typeof o === "object" && o?.text != null ? o.text : String(o)));
                  return (
                    <tr key={q.id || i} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="p-3 align-top">
                        <input
                          type="checkbox"
                          checked={q.id ? selectedInputIds.has(q.id) : false}
                          onChange={() => q.id && toggleSelectQuestion(q.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 text-gray-600">{i + 1}</td>
                      <td className="p-3 text-gray-900">{q.question_text}</td>
                      {Array.from({ length: maxOptionCols }, (_, j) => (
                        <td key={j} className="p-3 text-gray-700 align-top">{opts[j] ?? ""}</td>
                      ))}
                      <td className="p-3 align-top">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${q.parsing_flag === "VALID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {q.parsing_flag || "VALID"}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(q)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openDelete(q.id)}>
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
