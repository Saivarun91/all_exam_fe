"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Upload, Play, Save, Sparkles, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { checkAuth, getAuthHeaders, getAuthHeadersForUpload } from "@/utils/authCheck";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import AdminConfigTab from "./components/AdminConfigTab";
import InputQuestionsTab from "./components/InputQuestionsTab";
import GeneratedQuestionsTab from "./components/GeneratedQuestionsTab";
import ValidatedQuestionsTab from "./components/ValidatedQuestionsTab";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const PARSING_BASE = `${API_BASE}/api/parsing-suite`;
const GENERATOR_BASE = `${API_BASE}/api/question-generator`;
const VALIDATION_BASE = `${API_BASE}/api/question-validation`;

export default function ParsingSuitePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("admin-configuration");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [configData, setConfigData] = useState({
    parsingInstructions: "",
    maxRetryCount: 3,
    temperature: 0.3,
    topP: 0.9,
    frequencyPenalty: 0.2,
    presencePenalty: 0,
    geminiModelSelector: "gemini-1.5-flash-latest",
    modelSelector: "gpt-4",
    parsing_prompt: "",
    generate_prompt: "",
    validation_prompt: "",
  });
  const [inputQuestions, setInputQuestions] = useState([]);
  const [currentInputBatchId, setCurrentInputBatchId] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generatedLoading, setGeneratedLoading] = useState(false);
  const [validatedQuestions, setValidatedQuestions] = useState([]);
  const [validatedLoading, setValidatedLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [editForm, setEditForm] = useState({ question_text: "", options: [], parsing_flag: "VALID" });
  const [selectedInputIds, setSelectedInputIds] = useState(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [editingGeneratedQuestion, setEditingGeneratedQuestion] = useState(null);
  const [deleteGeneratedId, setDeleteGeneratedId] = useState(null);
  const [editGeneratedForm, setEditGeneratedForm] = useState({
    question_text: "",
    options: [],
    correct_answers: [],
    explanation: "",
  });
  const [selectedGeneratedIds, setSelectedGeneratedIds] = useState(new Set());
  const [showBulkDeleteGeneratedConfirm, setShowBulkDeleteGeneratedConfirm] = useState(false);
  const [promptConfigOpen, setPromptConfigOpen] = useState(false);
  const [prompt2Open, setPrompt2Open] = useState(false);
  const [prompt3Open, setPrompt3Open] = useState(false);
  const [inputSearch, setInputSearch] = useState("");
  const [generatedSearch, setGeneratedSearch] = useState("");
  const [validatedSearch, setValidatedSearch] = useState("");
  const [selectedValidatedIds, setSelectedValidatedIds] = useState(new Set());
  const [showBulkDeleteValidatedConfirm, setShowBulkDeleteValidatedConfirm] = useState(false);
  const [editingValidatedQuestion, setEditingValidatedQuestion] = useState(null);
  const [deleteValidatedId, setDeleteValidatedId] = useState(null);
  const [editValidatedForm, setEditValidatedForm] = useState({
    question_text: "",
    options: [],
    openai_answers: [],
    gemini_answers: [],
    explanation: "",
    is_valid: false,
  });

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }
    fetchConfig();
  }, [router]);

  // Input questions: load only when we have a session and user is on the tab
  useEffect(() => {
    if (activeTab !== "input-questions") return;
    if (currentSessionId) {
      fetchInputQuestions(currentSessionId);
    } else {
      setInputQuestions([]);
      setCurrentInputBatchId("");
    }
  }, [activeTab, currentSessionId]);

  // Generated questions: load only when we have a session and user is on the tab
  useEffect(() => {
    if (activeTab !== "generated-questions") return;
    if (currentSessionId) {
      fetchGeneratedQuestions();
    } else {
      setGeneratedQuestions([]);
    }
  }, [activeTab, currentSessionId]);

  // Validated questions: load only when we have a session and user is on the tab
  useEffect(() => {
    if (activeTab !== "validated-questions") return;
    if (currentSessionId) {
      fetchValidatedQuestions();
    } else {
      setValidatedQuestions([]);
    }
  }, [activeTab, currentSessionId]);

  function handleDownloadValidatedQuestionsCSV() {
    if (!currentSessionId) {
      setMessage("No active session. Parse and save a document first.");
      setMessageType("error");
      return;
    }
    fetch(`${VALIDATION_BASE}/download-validated-questions-csv/?session_id=${encodeURIComponent(currentSessionId)}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),   // 🔥 REQUIRED
      },
      credentials: "include", // 🔥 REQUIRED for Django session
    })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "validated_questions.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("CSV download failed"));
  }



  function fetchConfig() {
    fetch(`${PARSING_BASE}/get-config/`, { headers: getAuthHeaders() })
      .then((res) => (res.status === 401 ? router.push("/admin/auth") : res.json()))
      .then((data) => {
        if (data.success && data.config) {
          const c = data.config;
          setConfigData({
            parsingInstructions: c.parsing_instructions || "",
            maxRetryCount: c.max_retry_count ?? 3,
            temperature: c.temperature ?? 0.3,
            topP: c.top_p ?? 0.9,
            frequencyPenalty: c.frequency_penalty ?? 0.2,
            presencePenalty: c.presence_penalty ?? 0,
            geminiModelSelector: c.gemini_model_selector || "gemini-1.5-flash-latest",
            modelSelector: c.model_selector || "gpt-4",
            parsing_prompt: c.parsing_prompt || "",
            generate_prompt: c.generate_prompt || "",
            validation_prompt: c.validation_prompt || "",
          });
        }
      })
      .catch((err) => console.error("fetchConfig", err));
  }

  function saveConfig() {
    setLoading(true);
    setMessage("");
    fetch(`${PARSING_BASE}/save-config/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        parsing_instructions: configData.parsingInstructions,
        max_retry_count: configData.maxRetryCount,
        temperature: configData.temperature,
        top_p: configData.topP,
        frequency_penalty: configData.frequencyPenalty,
        presence_penalty: configData.presencePenalty,
        gemini_model_selector: configData.geminiModelSelector,
        model_selector: configData.modelSelector,
        parsing_prompt: configData.parsing_prompt,
        generate_prompt: configData.generate_prompt,
        validation_prompt: configData.validation_prompt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Configuration saved.");
          setMessageType("success");
        } else {
          setMessage(data.error || "Failed to save.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err.message || "Failed to save.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  /** @param {string} [sessionIdOverride] - If provided, fetch for this session (e.g. right after parse-save-all). */
  function fetchInputQuestions(sessionIdOverride) {
    const sid = sessionIdOverride ?? currentSessionId;
    if (!sid) {
      setInputQuestions([]);
      setCurrentInputBatchId("");
      return;
    }
    setQuestionsLoading(true);
    fetch(`${PARSING_BASE}/input-questions/?session_id=${encodeURIComponent(sid)}`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) {
          setInputQuestions(data.questions);
          setCurrentInputBatchId(data.batch_id != null ? String(data.batch_id) : "");
        } else {
          setInputQuestions([]);
          setCurrentInputBatchId("");
        }
      })
      .catch(() => {
        setInputQuestions([]);
        setCurrentInputBatchId("");
      })
      .finally(() => setQuestionsLoading(false));
  }

  function fetchGeneratedQuestions() {
    if (!currentSessionId) {
      setGeneratedQuestions([]);
      return;
    }
    setGeneratedLoading(true);
    const url = `${GENERATOR_BASE}/generated-questions/?session_id=${encodeURIComponent(currentSessionId)}`;
    fetch(url, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) setGeneratedQuestions(data.questions);
        else setGeneratedQuestions([]);
      })
      .catch(() => setGeneratedQuestions([]))
      .finally(() => setGeneratedLoading(false));
  }

  function fetchValidatedQuestions() {
    if (!currentSessionId) {
      setValidatedQuestions([]);
      return;
    }
    setValidatedLoading(true);
    fetch(`${VALIDATION_BASE}/validated-questions/?session_id=${encodeURIComponent(currentSessionId)}`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) setValidatedQuestions(data.questions);
        else setValidatedQuestions([]);
      })
      .catch(() => setValidatedQuestions([]))
      .finally(() => setValidatedLoading(false));
  }

  function handleGenerateNewQuestions() {
    if (!currentSessionId) {
      setMessage("Parse and save a document first to create a session.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    fetch(`${GENERATOR_BASE}/generate-from-input/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: currentSessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(data.message || `Generated ${data.saved_count ?? data.count ?? 0} question(s).`);
          setMessageType("success");
          setActiveTab("generated-questions");
          // setCurrentSessionId(data.session_id);
          fetchGeneratedQuestions();
        } else {
          setMessage(data.error || "Generation failed.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err?.message || "Generation failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function handleTestParse() {
    if (!uploadedFile) {
      setMessage("Please upload a document first.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.append("file", uploadedFile);
    form.append("parsing_instructions", configData.parsingInstructions);
    form.append("parsing_prompt", configData.parsing_prompt);
    fetch(`${PARSING_BASE}/test-parse/`, {
      method: "POST",
      headers: getAuthHeadersForUpload(),
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(data.message || `Test parse: ${data.parsed_count || 0} question(s) parsed.`);
          setMessageType("success");
        } else {
          setMessage(data.error || "Test parse failed.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err.message || "Test parse failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function handleParseSaveAll() {
    if (!uploadedFile) {
      setMessage("Please upload a document first.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.append("file", uploadedFile);
    form.append("parsing_instructions", configData.parsingInstructions);
    form.append("parsing_prompt", configData.parsing_prompt);
    fetch(`${PARSING_BASE}/parse-save-all/`, {
      method: "POST",
      headers: getAuthHeadersForUpload(),
      body: form,
    })
      .then((res) => {
        // console.log("res for parsing : ",res)
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setMessage(data.message || `Saved ${data.saved_count || 0} question(s) to Input Questions.`);
          setMessageType("success");
          setActiveTab("input-questions");
          setCurrentSessionId(data.session_id);
          fetchInputQuestions(data.session_id);
        } else {
          setMessage(data.error || "Parse & Save failed.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err.message || "Parse & Save failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function openEdit(q) {
    setEditingQuestion(q);
    setEditForm({
      question_text: q.question_text || "",
      options: (q.options || []).map((o) => (typeof o === "object" && o?.text != null ? o.text : String(o))),
      parsing_flag: q.parsing_flag || "VALID",
    });
  }
  function closeEdit() {
    setEditingQuestion(null);
    setEditForm({ question_text: "", options: [], parsing_flag: "VALID" });
  }
  function saveEdit() {
    if (!editingQuestion?.id) return;
    setLoading(true);
    fetch(`${PARSING_BASE}/input-question/${editingQuestion.id}/update/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question_text: editForm.question_text,
        options: editForm.options.filter((s) => s.trim() !== ""),
        parsing_flag: editForm.parsing_flag,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Question updated.");
          setMessageType("success");
          closeEdit();
          fetchInputQuestions();
        } else {
          setMessage(data.error || "Update failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Update failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }
  function openDelete(id) {
    setDeleteQuestionId(id);
  }
  function toggleSelectQuestion(id) {
    setSelectedInputIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    if (selectedInputIds.size === inputQuestions.length) setSelectedInputIds(new Set());
    else setSelectedInputIds(new Set(inputQuestions.map((q) => q.id).filter(Boolean)));
  }
  function toggleSelectAllInputFiltered(filteredIds) {
    if (!filteredIds.length) return;
    setSelectedInputIds((prev) => {
      const allSelected = filteredIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(filteredIds);
    });
  }
  function confirmBulkDelete() {
    const ids = Array.from(selectedInputIds);
    if (!ids.length) return;
    setLoading(true);
    fetch(`${PARSING_BASE}/input-questions/bulk-delete/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(`Deleted ${data.deleted_count || ids.length} question(s).`);
          setMessageType("success");
          setSelectedInputIds(new Set());
          setShowBulkDeleteConfirm(false);
          fetchInputQuestions();
        } else {
          setMessage(data.error || "Bulk delete failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Bulk delete failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }
  function confirmDelete() {
    if (!deleteQuestionId) return;
    setLoading(true);
    fetch(`${PARSING_BASE}/input-question/${deleteQuestionId}/delete/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Question deleted.");
          setMessageType("success");
          setDeleteQuestionId(null);
          fetchInputQuestions();
        } else {
          setMessage(data.error || "Delete failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Delete failed.");
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
        setDeleteQuestionId(null);
      });
  }

  function openEditGenerated(q) {
    if (!q) return;
    const opts = (q.options || []).map((o) =>
      typeof o === "object" ? { text: o.text || o.value || "", explanation: o.explanation || "" } : { text: String(o), explanation: "" }
    );
    setEditingGeneratedQuestion(q);
    setEditGeneratedForm({
      question_text: q.question_text || "",
      options: opts.length ? opts : [{ text: "", explanation: "" }],
      correct_answers: (q.correct_answers || []).map(String),
      explanation: q.explanation || "",
    });
  }
  function closeEditGenerated() {
    setEditingGeneratedQuestion(null);
    setEditGeneratedForm({ question_text: "", options: [], correct_answers: [], explanation: "" });
  }
  function saveEditGenerated() {
    if (!editingGeneratedQuestion?.id) return;
    setLoading(true);
    fetch(`${GENERATOR_BASE}/generated-question/${editingGeneratedQuestion.id}/update/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question_text: editGeneratedForm.question_text,
        options: editGeneratedForm.options.filter((o) => (o.text || "").trim() !== "").map((o) => ({ text: (o.text || "").trim(), explanation: (o.explanation || "").trim() })),
        correct_answers: editGeneratedForm.correct_answers.filter((s) => (s || "").trim() !== ""),
        explanation: editGeneratedForm.explanation || "",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Generated question updated.");
          setMessageType("success");
          closeEditGenerated();
          fetchGeneratedQuestions();
        } else {
          setMessage(data.error || "Update failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Update failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function openDeleteGenerated(id) {
    setDeleteGeneratedId(id);
  }
  function confirmDeleteGenerated() {
    if (!deleteGeneratedId) return;
    setLoading(true);
    fetch(`${GENERATOR_BASE}/generated-question/${deleteGeneratedId}/delete/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Generated question deleted.");
          setMessageType("success");
          setDeleteGeneratedId(null);
          fetchGeneratedQuestions();
        } else {
          setMessage(data.error || "Delete failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Delete failed.");
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
        setDeleteGeneratedId(null);
      });
  }

  function toggleSelectGenerated(id) {
    setSelectedGeneratedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAllGenerated() {
    if (selectedGeneratedIds.size === generatedQuestions.length) setSelectedGeneratedIds(new Set());
    else setSelectedGeneratedIds(new Set(generatedQuestions.map((q) => q.id).filter(Boolean)));
  }
  function toggleSelectAllGeneratedFiltered(filteredIds) {
    if (!filteredIds?.length) return;
    setSelectedGeneratedIds((prev) => {
      const allSelected = filteredIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(filteredIds);
    });
  }
  function confirmBulkDeleteGenerated() {
    const ids = Array.from(selectedGeneratedIds);
    if (!ids.length) return;
    setLoading(true);
    fetch(`${GENERATOR_BASE}/generated-questions/bulk-delete/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(`Deleted ${data.deleted_count ?? ids.length} generated question(s).`);
          setMessageType("success");
          setSelectedGeneratedIds(new Set());
          setShowBulkDeleteGeneratedConfirm(false);
          fetchGeneratedQuestions();
        } else {
          setMessage(data.error || "Bulk delete failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Bulk delete failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function handleValidateWithGemini() {
    if (!currentSessionId) {
      setMessage("Parse and save a document first to create a session.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    const body = selectedGeneratedIds.size > 0 ? { ids: Array.from(selectedGeneratedIds) } : {};
    fetch(`${VALIDATION_BASE}/run-validation/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...body, session_id: currentSessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const count = data.validated_count ?? 0;
          setMessage(data.message || `Validation complete: ${count} question(s) validated.`);
          setMessageType("success");
          setActiveTab("validated-questions");
          fetchValidatedQuestions();
        } else {
          setMessage(data.error || "Validation failed.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err?.message || "Validation failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  // function handleRegenerateSelected() {
  //   const ids = Array.from(selectedValidatedIds);
  //   if (!ids.length) {
  //     setMessage("Select validated questions first.");
  //     setMessageType("error");
  //     return;
  //   }
  //   const generatedIds = validatedQuestions
  //     .filter((q) => ids.includes(q.id) && q.generated_question_id)
  //     .map((q) => q.generated_question_id);
  //   if (!generatedIds.length) {
  //     setMessage("No generated question IDs found for selected.");
  //     setMessageType("error");
  //     return;
  //   }
  //   setLoading(true);
  //   setMessage("");
  //   fetch(`${GENERATOR_BASE}/regenerate-questions/`, {
  //     method: "POST",
  //     headers: getAuthHeaders(),
  //     body: JSON.stringify({ ids: generatedIds }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.success) {
  //         setMessage(data.message || "Regenerated. Click Revalidate to validate with Gemini.");
  //         setMessageType("success");
  //         fetchValidatedQuestions();
  //       } else {
  //         setMessage(data.error || "Regenerate failed.");
  //         setMessageType("error");
  //       }
  //     })
  //     .catch((err) => {
  //       setMessage(err?.message || "Regenerate failed.");
  //       setMessageType("error");
  //     })
  //     .finally(() => setLoading(false));
  // }
  function handleRegenerateSelected() {
    const ids = Array.from(selectedValidatedIds);
    if (!ids.length) {
      setMessage("Select validated questions first.");
      setMessageType("error");
      return;
    }

    const generatedIds = validatedQuestions
      .filter((q) => ids.includes(q.id) && q.generated_question_id)
      .map((q) => q.generated_question_id);

    if (!generatedIds.length) {
      setMessage("No generated question IDs found.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    fetch(`${GENERATOR_BASE}/regenerate-questions/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: generatedIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(data.message || "Regenerated.");
          setMessageType("success");

          // ✅ Switch tab + reload regenerated questions
          setActiveTab("generated-questions");
          fetchGeneratedQuestions();
        } else {
          setMessage(data.error || "Regenerate failed.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err?.message || "Regenerate failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function handleRevalidateSelected() {
    if (!currentSessionId) {
      setMessage("No active session. Parse and save a document first.");
      setMessageType("error");
      return;
    }
    const ids = Array.from(selectedValidatedIds);
    const generatedIds = ids.length
      ? validatedQuestions.filter((q) => ids.includes(q.id) && q.generated_question_id).map((q) => q.generated_question_id)
      : null;
    setLoading(true);
    setMessage("");
    const body = generatedIds && generatedIds.length > 0 ? { ids: generatedIds, session_id: currentSessionId } : { session_id: currentSessionId };
    fetch(`${VALIDATION_BASE}/run-validation/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(data.message || "Revalidated.");
          setMessageType("success");
          fetchValidatedQuestions();
        } else {
          setMessage(data.error || "Revalidate failed.");
          setMessageType("error");
        }
      })
      .catch((err) => {
        setMessage(err?.message || "Revalidate failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }

  function openEditValidated(q) {
    if (!q) return;
    const opts = (q.options || []).map((o) =>
      typeof o === "object" ? { text: o.text || o.value || "", explanation: o.explanation || "" } : { text: String(o), explanation: "" }
    );
    setEditingValidatedQuestion(q);
    setEditValidatedForm({
      question_text: q.question_text || "",
      options: opts.length ? opts : [{ text: "", explanation: "" }],
      openai_answers: (q.openai_answers || []).map(String),
      gemini_answers: (q.gemini_answers || []).map(String),
      explanation: q.explanation || "",
      is_valid: !!q.is_valid,
    });
  }
  function closeEditValidated() {
    setEditingValidatedQuestion(null);
    setEditValidatedForm({
      question_text: "",
      options: [],
      openai_answers: [],
      gemini_answers: [],
      explanation: "",
      is_valid: false,
    });
  }
  function saveEditValidated() {
    if (!editingValidatedQuestion?.id) return;
    setLoading(true);
    fetch(`${VALIDATION_BASE}/validated-question/${editingValidatedQuestion.id}/update/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question_text: editValidatedForm.question_text,
        options: editValidatedForm.options.filter((o) => (o.text || "").trim() !== "").map((o) => ({ text: (o.text || "").trim(), explanation: (o.explanation || "").trim() })),
        openai_answers: editValidatedForm.openai_answers.filter((s) => (s || "").trim() !== ""),
        gemini_answers: editValidatedForm.gemini_answers.filter((s) => (s || "").trim() !== ""),
        explanation: editValidatedForm.explanation || "",
        is_valid: editValidatedForm.is_valid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Validated question updated.");
          setMessageType("success");
          closeEditValidated();
          fetchValidatedQuestions();
        } else {
          setMessage(data.error || "Update failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Update failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }
  function openDeleteValidated(id) {
    setDeleteValidatedId(id);
  }
  function confirmDeleteValidated() {
    if (!deleteValidatedId) return;
    setLoading(true);
    fetch(`${VALIDATION_BASE}/validated-question/${deleteValidatedId}/delete/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Validated question deleted.");
          setMessageType("success");
          setDeleteValidatedId(null);
          fetchValidatedQuestions();
        } else {
          setMessage(data.error || "Delete failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Delete failed.");
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
        setDeleteValidatedId(null);
      });
  }
  function toggleSelectValidated(id) {
    setSelectedValidatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAllValidated() {
    if (validatedQuestions.length === 0) return;
    if (selectedValidatedIds.size === validatedQuestions.length) setSelectedValidatedIds(new Set());
    else setSelectedValidatedIds(new Set(validatedQuestions.map((q) => q.id).filter(Boolean)));
  }
  function toggleSelectAllValidatedFiltered(filteredIds) {
    if (!filteredIds?.length) return;
    setSelectedValidatedIds((prev) => {
      const allSelected = filteredIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(filteredIds);
    });
  }
  function confirmBulkDeleteValidated() {
    const ids = Array.from(selectedValidatedIds);
    if (!ids.length) return;
    setLoading(true);
    fetch(`${VALIDATION_BASE}/validated-questions/bulk-delete/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(`Deleted ${data.deleted_count ?? ids.length} validated question(s).`);
          setMessageType("success");
          setSelectedValidatedIds(new Set());
          setShowBulkDeleteValidatedConfirm(false);
          fetchValidatedQuestions();
        } else {
          setMessage(data.error || "Bulk delete failed.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Bulk delete failed.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }


  function handleFileSelect(file) {
    if (
      file?.type === "application/pdf" ||
      file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file?.name?.endsWith(".pdf") ||
      file?.name?.endsWith(".docx")
    ) {
      setUploadedFile(file);
      setMessage("File selected.");
      setMessageType("success");
    } else {
      setMessage("Please upload PDF or DOCX only.");
      setMessageType("error");
    }
  }

  const tabs = [
    { id: "admin-configuration", label: "Admin / Configuration" },
    { id: "input-questions", label: `Input Questions (${inputQuestions.length})` },
    { id: "generated-questions", label: `Generated Questions (${generatedQuestions.length})` },
    { id: "validated-questions", label: `Validated Questions (${validatedQuestions.length})` },
  ];

  const maxOptionCols = inputQuestions.length
    ? Math.max(4, ...inputQuestions.map((q) => (q.options || []).length))
    : 4;

  return (
    <div className="w-full min-h-screen p-6">
      <div className="flex gap-2 border-b mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t font-medium ${activeTab === t.id ? "bg-gray-100 border border-b-0" : "text-gray-600"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <p className={`mb-4 text-sm ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {activeTab === "admin-configuration" && (
        <AdminConfigTab
          configData={configData}
          setConfigData={setConfigData}
          loading={loading}
          setLoading={setLoading}
          setMessage={setMessage}
          setMessageType={setMessageType}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          fileInputRef={fileInputRef}
          fetchConfig={fetchConfig}
          saveConfig={saveConfig}
          handleTestParse={handleTestParse}
          handleParseSaveAll={handleParseSaveAll}
          handleFileSelect={handleFileSelect}
          promptConfigOpen={promptConfigOpen}
          setPromptConfigOpen={setPromptConfigOpen}
          prompt2Open={prompt2Open}
          setPrompt2Open={setPrompt2Open}
          prompt3Open={prompt3Open}
          setPrompt3Open={setPrompt3Open}
        // handleDownloadValidatedQuestionsCSV={handleDownloadValidatedQuestionsCSV} // ✅ Add this prop
        />
      )}

      {activeTab === "input-questions" && (
        <InputQuestionsTab
          inputQuestions={inputQuestions}
          questionsLoading={questionsLoading}
          maxOptionCols={maxOptionCols}
          selectedInputIds={selectedInputIds}
          toggleSelectQuestion={toggleSelectQuestion}
          toggleSelectAll={toggleSelectAll}
          toggleSelectAllFiltered={toggleSelectAllInputFiltered}
          setShowBulkDeleteConfirm={setShowBulkDeleteConfirm}
          openEdit={openEdit}
          openDelete={openDelete}
          handleGenerateNewQuestions={handleGenerateNewQuestions}
          loading={loading}
          searchQuery={inputSearch}
          onSearchChange={setInputSearch}
        />
      )}

      {activeTab === "generated-questions" && (
        <GeneratedQuestionsTab
          generatedQuestions={generatedQuestions}
          generatedLoading={generatedLoading}
          loading={loading}
          selectedGeneratedIds={selectedGeneratedIds}
          toggleSelectGenerated={toggleSelectGenerated}
          toggleSelectAllGenerated={toggleSelectAllGenerated}
          toggleSelectAllGeneratedFiltered={toggleSelectAllGeneratedFiltered}
          setShowBulkDeleteGeneratedConfirm={setShowBulkDeleteGeneratedConfirm}
          openEditGenerated={openEditGenerated}
          openDeleteGenerated={openDeleteGenerated}
          handleValidateWithGemini={handleValidateWithGemini}
          searchQuery={generatedSearch}
          onSearchChange={setGeneratedSearch}
        />
      )}

      {activeTab === "validated-questions" && (
        <ValidatedQuestionsTab
          validatedQuestions={validatedQuestions}
          validatedLoading={validatedLoading}
          loading={loading}
          selectedValidatedIds={selectedValidatedIds}
          toggleSelectValidated={toggleSelectValidated}
          toggleSelectAllValidated={toggleSelectAllValidated}
          toggleSelectAllValidatedFiltered={toggleSelectAllValidatedFiltered}
          setShowBulkDeleteValidatedConfirm={setShowBulkDeleteValidatedConfirm}
          openEditValidated={openEditValidated}
          openDeleteValidated={openDeleteValidated}
          handleRegenerateSelected={handleRegenerateSelected}
          handleRevalidateSelected={handleRevalidateSelected}
          searchQuery={validatedSearch}
          onSearchChange={setValidatedSearch}
          currentSessionId={currentSessionId}
        />
      )}

      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Parsing Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={editForm.question_text}
                onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                rows={3}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-1">
                {(editForm.options.length ? editForm.options : [""]).map((val, j) => (
                  <div key={j} className="flex gap-2">
                    <span className="text-sm text-gray-500 w-16 shrink-0 pt-2">Option {j + 1}:</span>
                    <Input
                      value={val}
                      onChange={(e) => {
                        const next = [...(editForm.options.length ? editForm.options : [""])];
                        next[j] = e.target.value;
                        setEditForm({ ...editForm, options: next });
                      }}
                      placeholder={`Option ${j + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = editForm.options.filter((_, i) => i !== j);
                        setEditForm({ ...editForm, options: next.length ? next : [] });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditForm({ ...editForm, options: [...editForm.options, ""] })}
                >
                  Add Option
                </Button>
              </div>
            </div>
            <div>
              <Label>Parsing Flag</Label>
              <Select
                value={editForm.parsing_flag}
                onValueChange={(v) => setEditForm({ ...editForm, parsing_flag: v })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VALID">VALID</SelectItem>
                  <SelectItem value="INVALID">INVALID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>Cancel</Button>
            <Button onClick={saveEdit} disabled={loading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingGeneratedQuestion} onOpenChange={(open) => !open && closeEditGenerated()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Generated Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={editGeneratedForm.question_text}
                onChange={(e) => setEditGeneratedForm({ ...editGeneratedForm, question_text: e.target.value })}
                rows={3}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <Label>Options (text + explanation per option)</Label>
              <div className="space-y-3 mt-1">
                {(editGeneratedForm.options.length ? editGeneratedForm.options : [{ text: "", explanation: "" }]).map((opt, j) => (
                  <div key={j} className="border rounded p-2 space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-20 shrink-0">Option {j + 1}:</span>
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const next = [...(editGeneratedForm.options.length ? editGeneratedForm.options : [{ text: "", explanation: "" }])];
                          next[j] = { ...next[j], text: e.target.value };
                          setEditGeneratedForm({ ...editGeneratedForm, options: next });
                        }}
                        placeholder="Option text"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const next = editGeneratedForm.options.filter((_, i) => i !== j);
                          setEditGeneratedForm({ ...editGeneratedForm, options: next.length ? next : [] });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="pl-[5.5rem]">
                      <Input
                        value={opt.explanation}
                        onChange={(e) => {
                          const next = [...(editGeneratedForm.options.length ? editGeneratedForm.options : [{ text: "", explanation: "" }])];
                          next[j] = { ...next[j], explanation: e.target.value };
                          setEditGeneratedForm({ ...editGeneratedForm, options: next });
                        }}
                        placeholder="Explanation for this option"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditGeneratedForm({
                      ...editGeneratedForm,
                      options: [...editGeneratedForm.options, { text: "", explanation: "" }],
                    })
                  }
                >
                  Add Option
                </Button>
              </div>
            </div>
            <div>
              <Label>Correct Answers (comma-separated)</Label>
              <Input
                value={(editGeneratedForm.correct_answers || []).join(", ")}
                onChange={(e) =>
                  setEditGeneratedForm({
                    ...editGeneratedForm,
                    correct_answers: (e.target.value || "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. A, B"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Overall Explanation</Label>
              <Textarea
                value={editGeneratedForm.explanation}
                onChange={(e) => setEditGeneratedForm({ ...editGeneratedForm, explanation: e.target.value })}
                rows={3}
                className="mt-1 w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditGenerated}>Cancel</Button>
            <Button onClick={saveEditGenerated} disabled={loading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteQuestionId} onOpenChange={(open) => !open && setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteGeneratedId} onOpenChange={(open) => !open && setDeleteGeneratedId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete generated question?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGenerated} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteGeneratedConfirm} onOpenChange={(open) => !open && setShowBulkDeleteGeneratedConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected generated questions?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This will delete {selectedGeneratedIds.size} question(s). This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDeleteGenerated} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingValidatedQuestion} onOpenChange={(open) => !open && closeEditValidated()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Validated Question (manual fix)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={editValidatedForm.question_text}
                onChange={(e) => setEditValidatedForm({ ...editValidatedForm, question_text: e.target.value })}
                rows={3}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <Label>Options (text + explanation per option)</Label>
              <div className="space-y-3 mt-1">
                {(editValidatedForm.options.length ? editValidatedForm.options : [{ text: "", explanation: "" }]).map((opt, j) => (
                  <div key={j} className="border rounded p-2 space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-20 shrink-0">Option {j + 1}:</span>
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const next = [...(editValidatedForm.options.length ? editValidatedForm.options : [{ text: "", explanation: "" }])];
                          next[j] = { ...next[j], text: e.target.value };
                          setEditValidatedForm({ ...editValidatedForm, options: next });
                        }}
                        placeholder="Option text"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const next = editValidatedForm.options.filter((_, i) => i !== j);
                          setEditValidatedForm({ ...editValidatedForm, options: next.length ? next : [] });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="pl-[5.5rem]">
                      <Input
                        value={opt.explanation}
                        onChange={(e) => {
                          const next = [...(editValidatedForm.options.length ? editValidatedForm.options : [{ text: "", explanation: "" }])];
                          next[j] = { ...next[j], explanation: e.target.value };
                          setEditValidatedForm({ ...editValidatedForm, options: next });
                        }}
                        placeholder="Explanation"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditValidatedForm({
                      ...editValidatedForm,
                      options: [...editValidatedForm.options, { text: "", explanation: "" }],
                    })
                  }
                >
                  Add Option
                </Button>
              </div>
            </div>
            <div>
              <Label>OpenAI Answer(s) (comma-separated)</Label>
              <Input
                value={(editValidatedForm.openai_answers || []).join(", ")}
                onChange={(e) =>
                  setEditValidatedForm({
                    ...editValidatedForm,
                    openai_answers: (e.target.value || "").split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Correct answers from OpenAI"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gemini AI Answer(s) (comma-separated)</Label>
              <Input
                value={(editValidatedForm.gemini_answers || []).join(", ")}
                onChange={(e) =>
                  setEditValidatedForm({
                    ...editValidatedForm,
                    gemini_answers: (e.target.value || "").split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Answers from Gemini"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Overall Explanation</Label>
              <Textarea
                value={editValidatedForm.explanation}
                onChange={(e) => setEditValidatedForm({ ...editValidatedForm, explanation: e.target.value })}
                rows={3}
                className="mt-1 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="validated-is-valid"
                checked={editValidatedForm.is_valid}
                onChange={(e) => setEditValidatedForm({ ...editValidatedForm, is_valid: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="validated-is-valid">Mark as Valid (OpenAI and Gemini match)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditValidated}>Cancel</Button>
            <Button onClick={saveEditValidated} disabled={loading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteValidatedId} onOpenChange={(open) => !open && setDeleteValidatedId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete validated question?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteValidated} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteValidatedConfirm} onOpenChange={(open) => !open && setShowBulkDeleteValidatedConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected validated questions?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This will delete {selectedValidatedIds.size} question(s). This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDeleteValidated} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={(open) => !open && setShowBulkDeleteConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected questions?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This will delete {selectedInputIds.size} question(s). This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
