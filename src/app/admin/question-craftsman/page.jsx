"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Sparkles, 
  Loader2, 
  Upload, 
  FileText, 
  Settings, 
  Play,
  Save,
  ChevronDown,
  Info,
  AlertCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Star,
  Copy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { checkAuth, getAuthHeaders, getAuthHeadersForUpload } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function QuestionCraftsmanSuite() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("admin-configuration");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  // Document Upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Configuration - initialized with defaults, will be loaded from backend
  const [configData, setConfigData] = useState({
    parsingInstructions: "",
    maxRetryCount: 3, // Default, will be replaced by backend value
    temperature: 0, // Locked at 0 for deterministic output
    modelSelector: "gpt-4",
  });
  
  // Prompts - initialized as empty, will be loaded from backend
  const [prompts, setPrompts] = useState({});
  const [promptsLoading, setPromptsLoading] = useState(true);
  
  // Counts
  const [counts, setCounts] = useState({
    inputQuestions: 0,
    generatedQuestions: 0,
    manualReviewQueue: 0,
  });

  // Questions for each tab
  const [inputQuestions, setInputQuestions] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [manualReviewQuestions, setManualReviewQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  
  // Search states
  const [inputSearch, setInputSearch] = useState("");
  const [generatedSearch, setGeneratedSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  
  // Edit and Delete states
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    question_text: "",
    options: [],
    correct_answers: [],
    explanation: "",
    question_type: "single-correct",
    status: "pending",
    tags: []
  });
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Bulk delete states
  const [selectedInputQuestions, setSelectedInputQuestions] = useState(new Set());
  const [selectedGeneratedQuestions, setSelectedGeneratedQuestions] = useState(new Set());
  const [selectedReviewQuestions, setSelectedReviewQuestions] = useState(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState(null); // 'input', 'generated', or 'review'

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }
    fetchConfiguration();
    fetchCounts();
  }, [router]);

  useEffect(() => {
    // Always fetch fresh data when switching tabs (dynamic, not static)
    if (activeTab === "input-questions") {
      fetchQuestionsByType("input");
      fetchCounts(); // Refresh counts too
    } else if (activeTab === "generated-questions") {
      fetchQuestionsByType("generated");
      fetchCounts(); // Refresh counts too
    } else if (activeTab === "manual-review") {
      fetchQuestionsByType("manual_review");
      fetchCounts(); // Refresh counts too
    }
  }, [activeTab]);

  const fetchConfiguration = async () => {
    setPromptsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/get-configuration/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      
      if (data.success && data.config) {
        setConfigData({
          parsingInstructions: data.config.parsing_instructions || "",
          maxRetryCount: data.config.max_retry_count || 3,
          temperature: data.config.temperature || 0,
          modelSelector: data.config.model_selector || "gpt-4",
        });
        
        // Always set prompts from backend (backend always returns prompts, with defaults if none saved)
        if (data.config.prompts) {
          setPrompts(data.config.prompts);
        }
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
    } finally {
      setPromptsLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/get-counts/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      
      if (data.success && data.counts) {
        setCounts({
          inputQuestions: data.counts.input_questions || 0,
          generatedQuestions: data.counts.generated_questions || 0,
          manualReviewQueue: data.counts.manual_review_queue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchQuestionsByType = async (type) => {
    setQuestionsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/questions-by-type/${type}/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      
      if (data.success && data.questions) {
        if (type === "input") {
          setInputQuestions(data.questions || []);
        } else if (type === "generated") {
          setGeneratedQuestions(data.questions || []);
        } else if (type === "manual_review") {
          setManualReviewQuestions(data.questions || []);
        }
      } else if (!data.success) {
        console.error(`Error fetching ${type} questions:`, data.error);
        // Set empty arrays on error
        if (type === "input") {
          setInputQuestions([]);
        } else if (type === "generated") {
          setGeneratedQuestions([]);
        } else if (type === "manual_review") {
          setManualReviewQuestions([]);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} questions:`, error);
      // Set empty arrays on error
      if (type === "input") {
        setInputQuestions([]);
      } else if (type === "generated") {
        setGeneratedQuestions([]);
      } else if (type === "manual_review") {
        setManualReviewQuestions([]);
      }
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type === "application/pdf" || 
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith('.pdf') || 
        file.name.endsWith('.docx')) {
      setUploadedFile(file);
      setMessage("✅ File selected successfully");
      setMessageType("success");
    } else {
      setMessage("❌ Please upload PDF or DOCX files only");
      setMessageType("error");
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleTestParse = async () => {
    if (!uploadedFile) {
      setMessage("❌ Please upload a document first");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('parsing_instructions', configData.parsingInstructions);
      formData.append('max_retries', configData.maxRetryCount);
      formData.append('temperature', configData.temperature);
      formData.append('model', configData.modelSelector);
      formData.append('test_mode', 'true');
      formData.append('limit', '5');

      const res = await fetch(`${API_BASE_URL}/api/questions/admin/parse-document/`, {
        method: "POST",
        headers: getAuthHeadersForUpload(),
        body: formData,
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Successfully parsed ${data.parsed_count || 0} questions (test mode - first 5)`);
        setMessageType("success");
        // Refresh counts after parsing
        fetchCounts();
        // Refresh questions if on input questions tab
        if (activeTab === "input-questions") {
          fetchQuestionsByType("input");
        }
      } else {
        setMessage(`❌ ${data.error || "Failed to parse document"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error parsing document:", error);
      setMessage(`❌ Error: ${error.message || "Failed to parse document. Please try again."}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleFullParse = async () => {
    if (!uploadedFile) {
      setMessage("❌ Please upload a document first");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('parsing_instructions', configData.parsingInstructions);
      formData.append('max_retries', configData.maxRetryCount);
      formData.append('temperature', configData.temperature);
      formData.append('model', configData.modelSelector);
      formData.append('test_mode', 'false');

      const res = await fetch(`${API_BASE_URL}/api/questions/admin/parse-document/`, {
        method: "POST",
        headers: getAuthHeadersForUpload(),
        body: formData,
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        const successMsg = data.message || `✅ Successfully parsed and saved ${data.saved_count || 0} questions to database`;
        setMessage(successMsg);
        setMessageType("success");
        
        // Show warning if there were errors saving some questions
        if (data.errors && data.errors.length > 0) {
          console.warn("Some questions had errors:", data.errors);
        }
        
        // Don't clear uploaded file - keep it visible so user knows what document was parsed
        // setUploadedFile(null);
        // if (fileInputRef.current) {
        //   fileInputRef.current.value = '';
        // }
        
        // Refresh counts and all question types in parallel for faster updates
        try {
          await Promise.all([
            fetchCounts(),
            fetchQuestionsByType("input"),
            fetchQuestionsByType("generated"),
            fetchQuestionsByType("manual_review")
          ]);
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
          // Still try to refresh individually if parallel fails
          await fetchCounts();
        if (activeTab === "input-questions") {
            await fetchQuestionsByType("input");
        } else if (activeTab === "generated-questions") {
            await fetchQuestionsByType("generated");
        } else if (activeTab === "manual-review") {
            await fetchQuestionsByType("manual_review");
          }
        }
        
        // Switch to input questions tab to show the parsed questions (only if not already on it)
        if (activeTab !== "input-questions") {
          setActiveTab("input-questions");
        }
        
        // Auto-hide success message after 8 seconds (longer if there are errors)
        setTimeout(() => setMessage(""), data.errors && data.errors.length > 0 ? 10000 : 8000);
      } else {
        const errorMsg = data.error || data.message || "Failed to parse document";
        setMessage(`❌ ${errorMsg}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error parsing document:", error);
      let errorMessage = "Failed to parse document. Please check your file and try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setMessage(`❌ Error: ${errorMessage}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/save-configuration/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          parsing_instructions: configData.parsingInstructions,
          max_retry_count: configData.maxRetryCount,
          temperature: configData.temperature,
          model_selector: configData.modelSelector,
          prompts: prompts,
        }),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Configuration saved successfully! Your prompts will be used for all future operations (parsing, generation, validation).");
        setMessageType("success");
        setTimeout(() => setMessage(""), 5000);
        // Reload configuration to get updated data
        await fetchConfiguration();
      } else {
        setMessage(`❌ ${data.error || "Failed to save configuration"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      setMessage(`❌ Error: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const updatePrompt = (promptKey, field, value) => {
    setPrompts(prev => ({
      ...prev,
      [promptKey]: {
        ...prev[promptKey],
        [field]: value,
        lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    }));
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    
    // Normalize options format - preserve both text and explanation
    const normalizedOptions = (question.options || [])
      .map(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return { 
            text: (opt.text || opt.get?.('text') || '').trim(),
            explanation: (opt.explanation || opt.get?.('explanation') || '').trim()
          };
        } else if (typeof opt === 'string') {
          return { text: opt.trim(), explanation: '' };
        } else {
          return { text: String(opt || '').trim(), explanation: '' };
        }
      })
      .filter(opt => opt.text && opt.text.trim()); // Remove empty options
    
    // Ensure at least 2 options (add empty ones if needed for editing)
    while (normalizedOptions.length < 2) {
      normalizedOptions.push({ text: "", explanation: "" });
    }
    
    // Normalize correct_answers format
    const normalizedCorrectAnswers = (question.correct_answers || []).map(ans => {
      return typeof ans === 'string' ? ans.trim() : String(ans).trim();
    }).filter(ans => ans); // Remove empty answers
    
    // Auto-determine question type based on correct answer count
    // Support both old format (single/multiple) and new format (single-correct/multi-correct)
    let questionType = question.question_type || "single-correct";
    // Normalize old format to new format
    if (questionType === "single") questionType = "single-correct";
    if (questionType === "multiple") questionType = "multi-correct";
    
    if (normalizedCorrectAnswers.length > 1) {
      questionType = "multi-correct";
    } else if (normalizedCorrectAnswers.length === 1) {
      questionType = "single-correct";
    }
    
    // Extract tags - if empty, infer from question text
    let tags = question.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(t => t);
    }
    
    // Use tags from AI response (Gemini/OpenAI) - ONLY show what AI provides, no static inference
    // Domain is dynamically determined by AI based on question content
    // If AI didn't provide tags, show empty (don't infer static values)
    
    setEditFormData({
      question_text: question.question_text || "",
      options: normalizedOptions,
      correct_answers: normalizedCorrectAnswers,
      explanation: question.explanation || "",
      question_type: questionType,
      status: question.status || "pending",
      tags: tags
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    // Validate form data
    if (!editFormData.question_text || !editFormData.question_text.trim()) {
      setMessage("❌ Question text is required");
      setMessageType("error");
      return;
    }

    // Filter out empty options
    const validOptions = editFormData.options.filter(opt => {
      const optText = typeof opt === 'object' ? opt.text : opt;
      return optText && optText.trim();
    });

    if (validOptions.length < 2) {
      setMessage("❌ At least 2 valid options are required");
      setMessageType("error");
      return;
    }

    const validCorrectAnswers = editFormData.correct_answers.filter(ans => ans && ans.trim());
    
    if (validCorrectAnswers.length === 0) {
      setMessage("❌ At least one correct answer is required");
      setMessageType("error");
      return;
    }

    // Validate question type matches correct answer count
    // Support both old and new formats
    const isSingle = editFormData.question_type === "single" || editFormData.question_type === "single-correct";
    const isMultiple = editFormData.question_type === "multiple" || editFormData.question_type === "multi-correct";
    
    if (isSingle && validCorrectAnswers.length !== 1) {
      setMessage(`❌ Single choice questions must have exactly 1 correct answer (currently ${validCorrectAnswers.length})`);
      setMessageType("error");
      return;
    }

    if (isMultiple && validCorrectAnswers.length < 2) {
      setMessage(`❌ Multiple choice questions must have at least 2 correct answers (currently ${validCorrectAnswers.length})`);
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Prepare data for API - normalize options format with explanations
      const normalizedOptions = validOptions.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return { 
            text: (opt.text || '').trim(),
            explanation: (opt.explanation || '').trim()
          };
        } else {
          return { text: String(opt).trim(), explanation: '' };
        }
      });

      // Prepare correct answers - match them to option texts
      const normalizedCorrectAnswers = validCorrectAnswers.map(ans => {
        const trimmedAns = ans.trim();
        // Find matching option text
        const matchingOption = normalizedOptions.find(opt => opt.text === trimmedAns);
        return matchingOption ? matchingOption.text : trimmedAns;
      }).filter(ans => normalizedOptions.some(opt => opt.text === ans));

      // Auto-adjust question type if needed - use new format
      let finalQuestionType = editFormData.question_type;
      if (normalizedCorrectAnswers.length === 1 && (editFormData.question_type === "multiple" || editFormData.question_type === "multi-correct")) {
        finalQuestionType = "single-correct";
      } else if (normalizedCorrectAnswers.length > 1 && (editFormData.question_type === "single" || editFormData.question_type === "single-correct")) {
        finalQuestionType = "multi-correct";
      }
      // Normalize to new format
      if (finalQuestionType === "single") finalQuestionType = "single-correct";
      if (finalQuestionType === "multiple") finalQuestionType = "multi-correct";

      // Normalize tags
      let tags = editFormData.tags || [];
      if (typeof tags === 'string') {
        tags = tags.split(',').map(t => t.trim()).filter(t => t);
      }

      const updateData = {
        question_text: editFormData.question_text.trim(),
        options: normalizedOptions,
        correct_answers: normalizedCorrectAnswers,
        explanation: editFormData.explanation.trim(),
        question_type: finalQuestionType,
        status: editFormData.status,
        tags: tags
      };

      const res = await fetch(`${API_BASE_URL}/api/questions/admin/parsed-question/${editingQuestion.id}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updateData),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Question updated successfully");
        setMessageType("success");
        setEditingQuestion(null);
        
        // Refresh ALL tabs dynamically (not just current tab)
        await Promise.all([
          fetchCounts(),
          fetchQuestionsByType("input"),
          fetchQuestionsByType("generated"),
          fetchQuestionsByType("manual_review")
        ]);
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "Failed to update question"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      setMessage(`❌ Error: ${error.message || "Failed to update question"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setDeleteQuestionId(questionId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteQuestionId) return;

    setLoading(true);
    setMessage("");
    setShowDeleteDialog(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/parsed-question/${deleteQuestionId}/delete/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Question deleted successfully");
        setMessageType("success");
        
        // Refresh ALL tabs dynamically (not just current tab)
        await Promise.all([
          fetchCounts(),
          fetchQuestionsByType("input"),
          fetchQuestionsByType("generated"),
          fetchQuestionsByType("manual_review")
        ]);
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "Failed to delete question"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      setMessage(`❌ Error: ${error.message || "Failed to delete question"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
      setDeleteQuestionId(null);
    }
  };

  // Bulk delete handlers
  const handleToggleSelect = (questionId, type) => {
    if (type === 'input') {
      setSelectedInputQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
    } else if (type === 'generated') {
      setSelectedGeneratedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
    } else if (type === 'review') {
      setSelectedReviewQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
    }
  };

  const handleSelectAll = (type) => {
    let questions = [];
    if (type === 'input') {
      questions = inputQuestions.filter(q => 
        !inputSearch || q.question_text?.toLowerCase().includes(inputSearch.toLowerCase())
      );
      const allSelected = questions.every(q => selectedInputQuestions.has(q.id));
      if (allSelected) {
        setSelectedInputQuestions(new Set());
      } else {
        setSelectedInputQuestions(new Set(questions.map(q => q.id)));
      }
    } else if (type === 'generated') {
      questions = generatedQuestions.filter(q => 
        !generatedSearch || q.question_text?.toLowerCase().includes(generatedSearch.toLowerCase())
      );
      const allSelected = questions.every(q => selectedGeneratedQuestions.has(q.id));
      if (allSelected) {
        setSelectedGeneratedQuestions(new Set());
      } else {
        setSelectedGeneratedQuestions(new Set(questions.map(q => q.id)));
      }
    } else if (type === 'review') {
      questions = manualReviewQuestions.filter(q => 
        !reviewSearch || q.question_text?.toLowerCase().includes(reviewSearch.toLowerCase())
      );
      const allSelected = questions.every(q => selectedReviewQuestions.has(q.id));
      if (allSelected) {
        setSelectedReviewQuestions(new Set());
      } else {
        setSelectedReviewQuestions(new Set(questions.map(q => q.id)));
      }
    }
  };

  const handleBulkDelete = (type) => {
    setBulkDeleteType(type);
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteType) return;

    let selectedIds = [];
    if (bulkDeleteType === 'input') {
      selectedIds = Array.from(selectedInputQuestions);
    } else if (bulkDeleteType === 'generated') {
      selectedIds = Array.from(selectedGeneratedQuestions);
    } else if (bulkDeleteType === 'review') {
      selectedIds = Array.from(selectedReviewQuestions);
    }

    if (selectedIds.length === 0) {
      setMessage("❌ No questions selected");
      setMessageType("error");
      setShowBulkDeleteDialog(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setShowBulkDeleteDialog(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/bulk-delete-parsed-questions/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ question_ids: selectedIds }),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Successfully deleted ${data.deleted_count || 0} question(s)`);
        setMessageType("success");
        
        // Clear selections
        if (bulkDeleteType === 'input') {
          setSelectedInputQuestions(new Set());
        } else if (bulkDeleteType === 'generated') {
          setSelectedGeneratedQuestions(new Set());
        } else if (bulkDeleteType === 'review') {
          setSelectedReviewQuestions(new Set());
        }
        
        // Refresh ALL tabs dynamically (not just current tab)
        await Promise.all([
          fetchCounts(),
          fetchQuestionsByType("input"),
          fetchQuestionsByType("generated"),
          fetchQuestionsByType("manual_review")
        ]);
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "Failed to delete questions"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error bulk deleting questions:", error);
      setMessage(`❌ Error: ${error.message || "Failed to delete questions"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
      setBulkDeleteType(null);
    }
  };

  const handleApproveQuestion = async (questionId) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/parsed-question/${questionId}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Question approved successfully");
        setMessageType("success");
        
        // Refresh questions
        await fetchCounts();
        await fetchQuestionsByType("manual_review");
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "Failed to approve question"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error approving question:", error);
      setMessage(`❌ Error: ${error.message || "Failed to approve question"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async (questionType = null) => {
    try {
      setLoading(true);
      setMessage("");
      
      // Map frontend tab names to backend type names
      const typeMap = {
        'input-questions': 'input',
        'generated-questions': 'generated',
        'manual-review': 'manual_review'
      };
      // Use provided questionType or determine from activeTab
      const backendType = questionType || typeMap[activeTab] || 'generated';
      
      const url = `${API_BASE_URL}/api/questions/admin/download-csv/?type=${backendType}`;
      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to download CSV");
      }

      // Get the CSV content
      const blob = await res.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      a.download = `questions_${backendType}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_blob);
      document.body.removeChild(a);
      
      setMessage(`✅ CSV file downloaded successfully`);
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setMessage(`❌ Error: ${error.message || "Failed to download CSV"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewQuestions = async () => {
    if (inputQuestions.length === 0) {
      setMessage("❌ No input questions available to generate from. Please parse a document first.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/generate-from-input/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          num_questions_per_source: 1  // Generate 1 new question per input question
        }),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        const successMsg = data.message || `✅ Successfully generated ${data.saved_count || 0} new question(s)`;
        setMessage(successMsg);
        setMessageType("success");
        
        if (data.errors && data.errors.length > 0) {
          console.warn("Some questions had errors:", data.errors);
        }
        
        // Refresh counts first
        await fetchCounts();
        
        // Switch to generated questions tab (this will trigger useEffect to fetch questions)
        setActiveTab("generated-questions");
        
        // Wait a moment for React to process the state change, then refresh all questions
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Refresh all questions (especially generated questions to show the new ones)
        await Promise.all([
          fetchQuestionsByType("input"),
          fetchQuestionsByType("generated"),
          fetchQuestionsByType("manual_review")
        ]);
        
        // Ensure generated questions are displayed (fetch again to be sure)
        await fetchQuestionsByType("generated");
        
        setTimeout(() => setMessage(""), data.errors && data.errors.length > 0 ? 10000 : 8000);
      } else {
        const errorMsg = data.error || data.message || "Failed to generate new questions";
        setMessage(`❌ ${errorMsg}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error generating new questions:", error);
      setMessage(`❌ Error: ${error.message || "Failed to generate new questions. Please try again."}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateParallelQuestion = async (questionId) => {
    if (!questionId) {
      setMessage("❌ Invalid question ID");
      setMessageType("error");
      return;
    }

    // Always generate 1 parallel question per click
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/generate-from-input/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          question_ids: [questionId], // Generate from this specific question
          num_questions_per_source: 1 // Always generate 1 parallel question per click
        }),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        const successMsg = data.message || `✅ Successfully generated 1 parallel question`;
        setMessage(successMsg);
        setMessageType("success");
        
        if (data.errors && data.errors.length > 0) {
          console.warn("Some questions had errors:", data.errors);
        }
        
        // Refresh counts and generated questions
        await Promise.all([
          fetchCounts(),
          fetchQuestionsByType("generated"),
          fetchQuestionsByType("manual_review")
        ]);
        
        setTimeout(() => setMessage(""), data.errors && data.errors.length > 0 ? 10000 : 5000);
      } else {
        const errorMsg = data.error || data.message || "Failed to generate parallel question";
        setMessage(`❌ ${errorMsg}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error generating parallel question:", error);
      setMessage(`❌ Error: ${error.message || "Failed to generate parallel question. Please try again."}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuestion = async (questionId) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/parsed-question/${questionId}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed");
        setMessageType("error");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Question rejected successfully");
        setMessageType("success");
        
        // Refresh questions
        await fetchCounts();
        await fetchQuestionsByType("manual_review");
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "Failed to reject question"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error rejecting question:", error);
      setMessage(`❌ Error: ${error.message || "Failed to reject question"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-0 px-6">
          <button
            onClick={() => setActiveTab("admin-configuration")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "admin-configuration"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Admin / Configuration</span>
            {activeTab === "admin-configuration" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("input-questions")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "input-questions"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Input Questions</span>
            <span className="ml-1 bg-gray-100 text-gray-700 text-xs font-normal px-2 py-0.5 rounded-full">
              {counts.inputQuestions || 0}
            </span>
            {activeTab === "input-questions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("generated-questions")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "generated-questions"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Generated Questions</span>
            <span className="ml-1 bg-gray-100 text-gray-700 text-xs font-normal px-2 py-0.5 rounded-full">
              {counts.generatedQuestions || 0}
            </span>
            {activeTab === "generated-questions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("manual-review")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "manual-review"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Manual Review Queue</span>
            <span className="ml-1 bg-gray-100 text-gray-700 text-xs font-normal px-2 py-0.5 rounded-full">
              {counts.manualReviewQueue || 0}
            </span>
            {activeTab === "manual-review" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === "admin-configuration" && (
            <div className="w-full max-w-7xl mx-auto">
              {/* Configuration Panel - Full Width */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure document ingestion, parsing behavior, prompt logic, and retry controls.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Document Upload */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Upload Document</Label>
                        <p className="text-xs text-gray-500 mt-1">Upload source document containing MCQs (questions + options only)</p>
                      </div>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadedFile ? (
                          <div className="space-y-2">
                            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <FileText className="h-6 w-6 text-green-600" />
                                <span className="text-lg font-semibold text-green-800">Document Uploaded</span>
                              </div>
                              <div className="text-sm text-green-700 font-medium">
                                {uploadedFile.name}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                Size: {(uploadedFile.size / 1024).toFixed(2)} KB
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                Remove File
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                        <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-1">Drop files here or click to upload</p>
                        <p className="text-xs text-gray-500">Accepts: PDF, DOCX</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>

                    {/* Custom Parsing Instructions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Custom Parsing Instructions (Optional)</Label>
                      <Textarea
                        placeholder="Optional instructions for handling formatting, numbering, or anomalies..."
                        value={configData.parsingInstructions}
                        onChange={(e) => setConfigData({ ...configData, parsingInstructions: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* Prompt Configuration */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Prompt Configuration</Label>
                      {promptsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                          <span className="ml-2 text-gray-600">Loading prompts...</span>
                        </div>
                      ) : (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="prompt1" className="border rounded-lg px-4 mb-2">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">Prompt 1: Parse & Separate Questions</span>
                                    <Badge variant="outline" className="text-xs">{prompts.prompt1?.version || ''}</Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 text-left mt-1">{prompts.prompt1?.description || ''}</p>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Parsing Prompt</Label>
                              <Textarea
                                value={prompts.prompt1?.prompt || ''}
                                onChange={(e) => updatePrompt('prompt1', 'prompt', e.target.value)}
                                rows={6}
                                className="resize-none font-mono text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Prompt Version Name</Label>
                                <Input
                                  value={prompts.prompt1?.version || ''}
                                  onChange={(e) => updatePrompt('prompt1', 'version', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Last Updated</Label>
                                <Input
                                  value={prompts.prompt1?.lastUpdated || ''}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="prompt2" className="border rounded-lg px-4 mb-2">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">Prompt 2: Generate New Question</span>
                                    <Badge variant="outline" className="text-xs">{prompts.prompt2?.version || ''}</Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 text-left mt-1">{prompts.prompt2?.description || ''}</p>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Parsing Prompt</Label>
                              <Textarea
                                value={prompts.prompt2?.prompt || ''}
                                onChange={(e) => updatePrompt('prompt2', 'prompt', e.target.value)}
                                rows={6}
                                className="resize-none font-mono text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Prompt Version Name</Label>
                                <Input
                                  value={prompts.prompt2?.version || ''}
                                  onChange={(e) => updatePrompt('prompt2', 'version', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Last Updated</Label>
                                <Input
                                  value={prompts.prompt2?.lastUpdated || ''}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="prompt3" className="border rounded-lg px-4 mb-2">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">Prompt 3: Validate Generated Answer</span>
                                    <Badge variant="outline" className="text-xs">{prompts.prompt3?.version || ''}</Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 text-left mt-1">{prompts.prompt3?.description || ''}</p>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Parsing Prompt</Label>
                              <Textarea
                                value={prompts.prompt3?.prompt || ''}
                                onChange={(e) => updatePrompt('prompt3', 'prompt', e.target.value)}
                                rows={6}
                                className="resize-none font-mono text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Prompt Version Name</Label>
                                <Input
                                  value={prompts.prompt3?.version || ''}
                                  onChange={(e) => updatePrompt('prompt3', 'version', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Last Updated</Label>
                                <Input
                                  value={prompts.prompt3?.lastUpdated || ''}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="prompt4" className="border rounded-lg px-4 mb-2">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">Prompt 4: Populate CSV Output</span>
                                    <Badge variant="outline" className="text-xs">{prompts.prompt4?.version || ''}</Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 text-left mt-1">{prompts.prompt4?.description || ''}</p>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Parsing Prompt</Label>
                              <Textarea
                                value={prompts.prompt4?.prompt || ''}
                                onChange={(e) => updatePrompt('prompt4', 'prompt', e.target.value)}
                                rows={6}
                                className="resize-none font-mono text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Prompt Version Name</Label>
                                <Input
                                  value={prompts.prompt4?.version || ''}
                                  onChange={(e) => updatePrompt('prompt4', 'version', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Last Updated</Label>
                                <Input
                                  value={prompts.prompt4?.lastUpdated || ''}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      )}
                    </div>

                    {/* Determinism Controls */}
                    <div className="space-y-4 border-t pt-4">
                      <Label className="text-sm font-semibold">Determinism Controls</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Max Retry Count</Label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={configData.maxRetryCount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setConfigData({ ...configData, maxRetryCount: Math.max(0, Math.min(10, value)) });
                            }}
                          />
                          <p className="text-xs text-gray-500">Number of retry attempts for failed parsing (0-10). Changes are saved when you click "Save Configuration".</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Temperature</Label>
                          <Input
                            type="number"
                            value={configData.temperature}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-gray-500">Locked for deterministic output</p>
                        </div>
                        {/* <div className="space-y-2">
                          <Label className="text-xs">Model Selector</Label>
                          <Select
                            value={configData.modelSelector}
                            onValueChange={(value) => setConfigData({ ...configData, modelSelector: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                              <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                            </SelectContent>
                          </Select>
                        </div> */}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleTestParse}
                          disabled={loading || !uploadedFile}
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Test Parse (First 5 Questions)
                        </Button>
                        <Button
                          onClick={handleFullParse}
                          disabled={loading || !uploadedFile}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Parsing...
                            </>
                          ) : (
                            <>
                          <Upload className="h-4 w-4 mr-2" />
                          Parse & Save All
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleSaveConfiguration}
                          disabled={loading}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        )}

        {activeTab === "input-questions" && (
          <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                    <div>
                  <h2 className="text-2xl font-bold text-gray-900">Input Questions (Parsed)</h2>
                  <p className="text-sm text-gray-600 mt-1">Review and clean questions parsed from the uploaded document before generation.</p>
                    </div>
                <div className="flex gap-2">
                  {selectedInputQuestions.size > 0 && (
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={() => handleBulkDelete('input')}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedInputQuestions.size})
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleDownloadCSV('input')}
                    disabled={loading || inputQuestions.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                    </div>
                    </div>
              
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search questions..."
                    value={inputSearch}
                    onChange={(e) => setInputSearch(e.target.value)}
                    className="pl-10"
                  />
                    </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {inputQuestions.filter(q => 
                      !inputSearch || q.question_text?.toLowerCase().includes(inputSearch.toLowerCase())
                    ).length} items
                  </span>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleGenerateNewQuestions}
                    disabled={loading || inputQuestions.length === 0}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                    Generate New Questions
                  </Button>
                    </div>
            </div>

              {questionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : inputQuestions.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No input questions found. Upload and parse a document to see questions here.</p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input 
                            type="checkbox" 
                            className="rounded" 
                            checked={inputQuestions.filter(q => 
                              !inputSearch || q.question_text?.toLowerCase().includes(inputSearch.toLowerCase())
                            ).length > 0 && inputQuestions.filter(q => 
                              !inputSearch || q.question_text?.toLowerCase().includes(inputSearch.toLowerCase())
                            ).every(q => selectedInputQuestions.has(q.id))}
                            onChange={() => handleSelectAll('input')}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QUESTION TEXT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OPTIONS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PARSING FLAG</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inputQuestions
                        .filter(q => !inputSearch || q.question_text?.toLowerCase().includes(inputSearch.toLowerCase()))
                        .map((question, index) => {
                          const optionsCount = question.options?.length || 0;
                          const validOptions = question.options?.filter(opt => {
                            const optText = typeof opt === 'object' ? (opt.text || '') : (opt || '');
                            return optText && optText.trim();
                          }).length || 0;
                          const validCorrectAnswers = question.correct_answers?.filter(ans => ans && ans.trim()).length || 0;
                          
                          // Support both old and new question type formats
                          const isSingle = question.question_type === 'single' || question.question_type === 'single-correct';
                          const isMultiple = question.question_type === 'multiple' || question.question_type === 'multi-correct';
                          
                          // Only show issues if there are actual problems
                          const hasIssues = validOptions < 2 || 
                                           !question.question_text || 
                                           question.question_text.trim().length < 10 ||
                                           validCorrectAnswers === 0 ||
                                           (isSingle && validCorrectAnswers !== 1) ||
                                           (isMultiple && validCorrectAnswers < 2);
                          
                          let parsingFlag = "OK";
                          let status = "Clean";
                          
                          if (hasIssues) {
                            if (validOptions < 2) {
                              parsingFlag = "Insufficient Options";
                            } else if (validCorrectAnswers === 0) {
                              parsingFlag = "Missing Correct Answer";
                            } else if (isSingle && validCorrectAnswers !== 1) {
                              parsingFlag = "Single Choice Validation";
                            } else if (isMultiple && validCorrectAnswers < 2) {
                              parsingFlag = "Multiple Choice Validation";
                            } else if (!question.question_text || question.question_text.trim().length < 10) {
                              parsingFlag = "Formatting Issue";
                            }
                            status = "Needs Fix";
                          }
                          
                                return (
                            <tr key={question.id || index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  className="rounded" 
                                  checked={selectedInputQuestions.has(question.id)}
                                  onChange={() => handleToggleSelect(question.id, 'input')}
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Q-{String(index + 1).padStart(3, '0')}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900 max-w-md">
                                <div className="truncate" title={question.question_text}>
                                  {question.question_text || "Question text appears to be malformed..."}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {optionsCount} options
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {parsingFlag === "OK" ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    OK
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    ▲ {parsingFlag}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {status === "Clean" ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Clean
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    ▲ {status}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleEditQuestion(question)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit question"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete question"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  </div>
                              </td>
                            </tr>
                                );
                              })}
                    </tbody>
                  </table>
                            </div>
              )}
                          </div>
                            </div>
                          )}

        {activeTab === "generated-questions" && (
          <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generated Questions (Validated)</h2>
                  <p className="text-sm text-gray-600 mt-1">View AI-generated questions that passed through validation logic.</p>
                          </div>
                <div className="flex gap-2">
                  {selectedGeneratedQuestions.size > 0 && (
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={() => handleBulkDelete('generated')}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedGeneratedQuestions.size})
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleDownloadCSV('generated')}
                    disabled={loading || generatedQuestions.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                        </div>
                </div>
              
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search generated questions..."
                    value={generatedSearch}
                    onChange={(e) => setGeneratedSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {generatedQuestions.filter(q => 
                    !generatedSearch || q.question_text?.toLowerCase().includes(generatedSearch.toLowerCase())
                  ).length} items
                </span>
              </div>

              {questionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : generatedQuestions.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No generated questions found. Generate questions using AI to see them here.</p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input 
                            type="checkbox" 
                            className="rounded" 
                            checked={generatedQuestions.filter(q => 
                              !generatedSearch || q.question_text?.toLowerCase().includes(generatedSearch.toLowerCase())
                            ).length > 0 && generatedQuestions.filter(q => 
                              !generatedSearch || q.question_text?.toLowerCase().includes(generatedSearch.toLowerCase())
                            ).every(q => selectedGeneratedQuestions.has(q.id))}
                            onChange={() => handleSelectAll('generated')}
                          />
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Question</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question Type</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 1</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 1</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 2</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 2</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 3</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 3</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 4</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 4</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 5</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 5</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 6</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 6</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Correct Answers</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Overall Explanation</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generatedQuestions
                        .filter(q => !generatedSearch || q.question_text?.toLowerCase().includes(generatedSearch.toLowerCase()))
                        .map((question, index) => {
                          // ============================================
                          // ALL DATA FROM OPENAI ANALYSIS
                          // These questions are generated using OpenAI (Prompt 2)
                          // All columns display OpenAI's analysis and generation
                          // ============================================
                          
                          // Question Text: From OpenAI analysis
                          const questionText = question.question_text || '';
                          
                          // Options with Explanations: From OpenAI analysis
                          // Each option includes both text and explanation generated by OpenAI
                          const options = question.options || [];
                          const optionData = [];
                          
                          for (let i = 0; i < 6; i++) {
                            if (i < options.length) {
                              const opt = options[i];
                              
                              // Extract option text and explanation from OpenAI response
                              if (typeof opt === 'object' && opt !== null && !Array.isArray(opt)) {
                                const optText = (opt.text || opt.get?.('text') || '').trim();
                                const optExplanation = (opt.explanation || opt.get?.('explanation') || '').trim();
                                
                                optionData.push({
                                  text: optText,           // OpenAI generated option text
                                  explanation: optExplanation  // OpenAI generated explanation for this option
                                });
                              } else if (typeof opt === 'string') {
                                optionData.push({
                                  text: opt.trim(),
                                  explanation: ''
                                });
                              } else {
                                optionData.push({
                                  text: String(opt || '').trim(),
                                  explanation: ''
                                });
                              }
                            } else {
                              optionData.push({ text: '', explanation: '' });
                            }
                          }
                          
                          // Question Type: Determined by OpenAI based on correct answers count
                          let questionType = question.question_type || 'single-correct';
                          if (questionType === 'single') questionType = 'single-correct';
                          if (questionType === 'multiple') questionType = 'multi-correct';
                          const displayQuestionType = questionType;
                          
                          // Correct Answers: From OpenAI analysis
                          let correctAnswers = question.correct_answers || [];
                          if (typeof correctAnswers === 'string') {
                            correctAnswers = correctAnswers.split(',').map(a => a.trim()).filter(a => a);
                          }
                          
                          // Map correct answers to option numbers for display
                          const correctOptionNumbers = [];
                          const optionTexts = optionData.map(opt => opt.text.trim());
                          
                          correctAnswers.forEach(ans => {
                            const ansText = String(ans).trim();
                            const optionIndex = optionTexts.findIndex(opt => opt.toLowerCase() === ansText.toLowerCase());
                            if (optionIndex !== -1) {
                              correctOptionNumbers.push(optionIndex + 1); // 1-based numbering
                            }
                          });
                          
                          const correctAnswersStr = correctOptionNumbers.length > 0 
                            ? correctOptionNumbers.join(', ') 
                            : (correctAnswers.length > 0 ? correctAnswers.join(', ') : '');
                          
                          // Domain/Tags: From OpenAI analysis - ONLY show what AI provides, no static inference
                          // OpenAI dynamically determines which domain the question relates to
                          let tags = question.tags || [];
                          if (typeof tags === 'string') {
                            tags = tags.split(',').map(t => t.trim()).filter(t => t);
                          }
                          
                          // Display ONLY the domain name from OpenAI analysis (dynamic, not static)
                          // If OpenAI didn't provide tags, show empty (don't infer static values)
                          const domainStr = Array.isArray(tags) && tags.length > 0 
                            ? tags.join(', ') 
                            : (tags && tags.length > 0 ? String(tags) : '—');
                          
                          // Overall Explanation: From OpenAI analysis
                          // OpenAI provides an overall explanation for the entire question
                          const overallExplanation = question.explanation || '';
                          
                                return (
                            <tr key={question.id || index} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  className="rounded" 
                                  checked={selectedGeneratedQuestions.has(question.id)}
                                  onChange={() => handleToggleSelect(question.id, 'generated')}
                                />
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                GQ-{String(index + 1).padStart(3, '0')}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[200px]">
                                <div className="max-w-[200px]" title={question.question_text}>
                                  {question.question_text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {displayQuestionType}
                                </Badge>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[0].text}>
                                  {optionData[0].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[0].explanation}>
                                  {optionData[0].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[1].text}>
                                  {optionData[1].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[1].explanation}>
                                  {optionData[1].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[2].text}>
                                  {optionData[2].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[2].explanation}>
                                  {optionData[2].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[3].text}>
                                  {optionData[3].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[3].explanation}>
                                  {optionData[3].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[4].text}>
                                  {optionData[4].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[4].explanation}>
                                  {optionData[4].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[5].text}>
                                  {optionData[5].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[5].explanation}>
                                  {optionData[5].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px] font-medium text-green-700" title={correctAnswersStr}>
                                  {correctAnswersStr || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-700 min-w-[200px]">
                                <div className="max-w-[200px]" title={overallExplanation}>
                                  {overallExplanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600">
                                <div className="max-w-[100px]" title={domainStr}>
                                  {domainStr || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleEditQuestion(question)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit question"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete question"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  </div>
                              </td>
                            </tr>
                                );
                              })}
                    </tbody>
                  </table>
                            </div>
              )}
                          </div>
                            </div>
                          )}

        {activeTab === "manual-review" && (
          <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manual Review Queue</h2>
                  <p className="text-sm text-gray-600 mt-1">Handle edge cases requiring human intervention.</p>
                          </div>
                <div className="flex gap-2">
                  {selectedReviewQuestions.size > 0 && (
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={() => handleBulkDelete('review')}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedReviewQuestions.size})
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleDownloadCSV('manual_review')}
                    disabled={loading || manualReviewQuestions.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                        </div>
                </div>
              
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search review queue..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {manualReviewQuestions.filter(q => 
                    !reviewSearch || q.question_text?.toLowerCase().includes(reviewSearch.toLowerCase())
                  ).length} items
                </span>
              </div>

              {questionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : manualReviewQuestions.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No questions pending manual review.</p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input 
                            type="checkbox" 
                            className="rounded" 
                            checked={manualReviewQuestions.filter(q => 
                              !reviewSearch || q.question_text?.toLowerCase().includes(reviewSearch.toLowerCase())
                            ).length > 0 && manualReviewQuestions.filter(q => 
                              !reviewSearch || q.question_text?.toLowerCase().includes(reviewSearch.toLowerCase())
                            ).every(q => selectedReviewQuestions.has(q.id))}
                            onChange={() => handleSelectAll('review')}
                          />
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Question</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question Type</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 1</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 1</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 2</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 2</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 3</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 3</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 4</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 4</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 5</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 5</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Answer Option 6</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Explanation 6</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Correct Answers</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Overall Explanation</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Review Reason</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {manualReviewQuestions
                        .filter(q => !reviewSearch || q.question_text?.toLowerCase().includes(reviewSearch.toLowerCase()))
                        .map((question, index) => {
                          // Get options with explanations - same as Generated Questions
                          const options = question.options || [];
                          const optionData = [];
                          
                          for (let i = 0; i < 6; i++) {
                            if (i < options.length) {
                              const opt = options[i];
                              if (typeof opt === 'object' && opt !== null && !Array.isArray(opt)) {
                                const optText = (opt.text || opt.get?.('text') || '').trim();
                                const optExplanation = (opt.explanation || opt.get?.('explanation') || '').trim();
                                optionData.push({
                                  text: optText,
                                  explanation: optExplanation
                                });
                              } else if (typeof opt === 'string') {
                                optionData.push({
                                  text: opt.trim(),
                                  explanation: ''
                                });
                              } else {
                                optionData.push({
                                  text: String(opt || '').trim(),
                                  explanation: ''
                                });
                              }
                            } else {
                              optionData.push({ text: '', explanation: '' });
                            }
                          }
                          
                          // Get question type
                          let questionType = question.question_type || 'single-correct';
                          if (questionType === 'single') questionType = 'single-correct';
                          if (questionType === 'multiple') questionType = 'multi-correct';
                          const displayQuestionType = questionType;
                          
                          // Get correct answers - convert to option numbers
                          let correctAnswers = question.correct_answers || [];
                          if (typeof correctAnswers === 'string') {
                            correctAnswers = correctAnswers.split(',').map(a => a.trim()).filter(a => a);
                          }
                          
                          // Map correct answers to option numbers
                          const correctOptionNumbers = [];
                          const optionTexts = optionData.map(opt => opt.text.trim());
                          
                          correctAnswers.forEach(ans => {
                            const ansText = String(ans).trim();
                            const optionIndex = optionTexts.findIndex(opt => opt.toLowerCase() === ansText.toLowerCase());
                            if (optionIndex !== -1) {
                              correctOptionNumbers.push(optionIndex + 1); // 1-based numbering
                            }
                          });
                          
                          const correctAnswersStr = correctOptionNumbers.length > 0 
                            ? correctOptionNumbers.join(', ') 
                            : (correctAnswers.length > 0 ? correctAnswers.join(', ') : '—');
                          
                          // Get domain (tags) from AI response (Gemini/OpenAI) - ONLY show what AI provides, no static inference
                          // AI dynamically determines which domain the question relates to
                          let tags = question.tags || [];
                          if (typeof tags === 'string') {
                            tags = tags.split(',').map(t => t.trim()).filter(t => t);
                          }
                          
                          // Display ONLY the domain name from AI response (dynamic, not static)
                          // If AI didn't provide tags, show empty (don't infer static values)
                          const domainStr = Array.isArray(tags) && tags.length > 0 
                            ? tags.join(', ') 
                            : (tags && tags.length > 0 ? String(tags) : '—');
                          const overallExplanation = question.explanation || '';
                          
                          // Validate question to determine if it needs review
                          // Only show "Low Confidence" if there are actual issues with the question data
                          let reviewReason = "";
                          let reasonSeverity = "";
                          
                          // First, check for critical issues (invalid question text)
                          if (!question.question_text || question.question_text.trim().length < 10 || question.question_text.includes("Unable to")) {
                            reviewReason = question.question_text?.includes("Unable to") ? "Retry Exhausted" : "Invalid Question Text";
                            reasonSeverity = "red";
                          }
                          // Check if options are valid (at least 2 non-empty options)
                          else if (optionData.filter(opt => opt.text && opt.text.trim()).length < 2) {
                            reviewReason = "Insufficient Options";
                            reasonSeverity = "red";
                          }
                          // Check if correct answers match options
                          else if (correctOptionNumbers.length === 0 && correctAnswers.length > 0) {
                            reviewReason = "Answer Mismatch";
                            reasonSeverity = "yellow";
                          }
                          // Check if correct answer count matches question type
                          else if (displayQuestionType === 'single-correct' && correctOptionNumbers.length !== 1) {
                            reviewReason = "Single Choice Validation";
                            reasonSeverity = "yellow";
                          }
                          else if (displayQuestionType === 'multi-correct' && correctOptionNumbers.length < 2) {
                            reviewReason = "Multiple Choice Validation";
                            reasonSeverity = "yellow";
                          }
                          // Check if status is rejected (definite issue)
                          else if (question.status === "rejected") {
                            reviewReason = "Validation Failed";
                            reasonSeverity = "red";
                          }
                          // If question data is correct, check status
                          // Only show "Low Confidence" if status is needs_review AND we can't verify the question is correct
                          else if (question.status === "needs_review") {
                            // Additional validation: check if explanations are missing (might indicate low confidence)
                            const hasMissingExplanations = optionData.some(opt => opt.text && opt.text.trim() && !opt.explanation?.trim());
                            const hasMissingOverallExplanation = !overallExplanation || !overallExplanation.trim();
                            
                            // If question has all required data (text, options, correct answers, explanations), it's likely correct
                            // Only show "Low Confidence" if there are missing explanations or other indicators
                            if (hasMissingExplanations || hasMissingOverallExplanation) {
                              reviewReason = "Low Confidence";
                              reasonSeverity = "yellow";
                            } else {
                              // Question appears correct - show as clean/approved
                              reviewReason = question.status === "approved" ? "Approved" : "Clean";
                              reasonSeverity = "green";
                            }
                          }
                          // If question is approved, show approved status
                          else if (question.status === "approved") {
                            reviewReason = "Approved";
                            reasonSeverity = "green";
                          }
                          // If no issues found and question data is correct, show as clean
                          else {
                            reviewReason = "Clean";
                            reasonSeverity = "green";
                          }
                          
                                return (
                            <tr key={question.id || index} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  className="rounded" 
                                  checked={selectedReviewQuestions.has(question.id)}
                                  onChange={() => handleToggleSelect(question.id, 'review')}
                                />
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                RQ-{String(index + 1).padStart(3, '0')}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[200px]">
                                <div className="max-w-[200px]" title={question.question_text}>
                                  {question.question_text || "—"}
                                  </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {displayQuestionType}
                                </Badge>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[0].text}>
                                  {optionData[0].text || "—"}
                            </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[0].explanation}>
                                  {optionData[0].explanation || "—"}
                          </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[1].text}>
                                  {optionData[1].text || "—"}
                            </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[1].explanation}>
                                  {optionData[1].explanation || "—"}
                          </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[2].text}>
                                  {optionData[2].text || "—"}
                        </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[2].explanation}>
                                  {optionData[2].explanation || "—"}
                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[3].text}>
                                  {optionData[3].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[3].explanation}>
                                  {optionData[3].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[4].text}>
                                  {optionData[4].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[4].explanation}>
                                  {optionData[4].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px]" title={optionData[5].text}>
                                  {optionData[5].text || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600 min-w-[120px]">
                                <div className="max-w-[120px]" title={optionData[5].explanation}>
                                  {optionData[5].explanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 min-w-[150px]">
                                <div className="max-w-[150px] font-medium text-green-700" title={correctAnswersStr}>
                                  {correctAnswersStr || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-700 min-w-[200px]">
                                <div className="max-w-[200px]" title={overallExplanation}>
                                  {overallExplanation || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-600">
                                <div className="max-w-[100px]" title={domainStr}>
                                  {domainStr || "General"}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap min-w-[150px]">
                                {reasonSeverity === "red" ? (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {reviewReason}
                                  </Badge>
                                ) : reasonSeverity === "yellow" ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {reviewReason}
                                  </Badge>
                                ) : reasonSeverity === "green" ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {reviewReason}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Info className="h-3 w-3 mr-1" />
                                    {reviewReason}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleEditQuestion(question)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit question"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete question"
                                    disabled={loading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                            </div>
              )}
                          </div>
                </div>
        )}

        {/* Message Alert */}
        {message && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            messageType === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            {message}
          </div>
        )}

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Update the question details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={editFormData.question_text}
                  onChange={(e) => setEditFormData({ ...editFormData, question_text: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
      </div>

              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={editFormData.question_type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-correct">Single Correct</SelectItem>
                    <SelectItem value="multi-correct">Multi Correct</SelectItem>
                  </SelectContent>
                </Select>
    </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options (with Explanations)</Label>
                  <span className="text-xs text-gray-500">
                    {editFormData.options.filter(opt => {
                      const optText = typeof opt === 'object' ? (opt.text || '') : (opt || '');
                      return optText.trim();
                    }).length} options
                  </span>
                </div>
                <div className="space-y-4">
                  {editFormData.options
                    .map((option, idx) => {
                      const optionText = typeof option === 'object' ? (option.text || '') : (option || '');
                      const optionExplanation = typeof option === 'object' ? (option.explanation || '') : '';
                      return { option, idx, optionText, optionExplanation };
                    })
                    .filter(({ optionText }) => optionText.trim()) // Only show non-empty options
                    .map(({ option, idx, optionText, optionExplanation }, displayIdx) => {
                      const isCorrect = editFormData.correct_answers.some(ans => 
                        ans === optionText || (typeof option === 'object' && ans === option.text)
                      );
                      
                      return (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 w-6">
                              {String.fromCharCode(65 + displayIdx)}.
                            </span>
                            <Input
                              value={optionText}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                const newOptions = [...editFormData.options];
                                const currentOpt = typeof option === 'object' ? option : { text: '', explanation: '' };
                                newOptions[idx] = { text: newValue, explanation: currentOpt.explanation || '' };
                                
                                // Update correct_answers if this option was marked as correct
                                let newCorrectAnswers = [...editFormData.correct_answers];
                                if (isCorrect) {
                                  // Remove old answer and add new one
                                  newCorrectAnswers = newCorrectAnswers.filter(ans => ans !== optionText);
                                  if (newValue.trim()) {
                                    newCorrectAnswers.push(newValue);
                                  }
                                }
                                
                                setEditFormData({ ...editFormData, options: newOptions, correct_answers: newCorrectAnswers });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + displayIdx)}`}
                              className="flex-1"
                            />
                            <input
                              type={(editFormData.question_type === "single" || editFormData.question_type === "single-correct") ? "radio" : "checkbox"}
                              checked={isCorrect}
                              onChange={(e) => {
                                let newCorrectAnswers = [...editFormData.correct_answers];
                                const currentOptionText = typeof option === 'object' ? option.text : option;
                                const isSingle = editFormData.question_type === "single" || editFormData.question_type === "single-correct";
                                
                                if (isSingle) {
                                  // For single choice, only one answer allowed
                                  newCorrectAnswers = [currentOptionText];
                                } else {
                                  // For multiple choice
                                  if (e.target.checked) {
                                    if (!newCorrectAnswers.includes(currentOptionText) && currentOptionText.trim()) {
                                      newCorrectAnswers.push(currentOptionText);
                                    }
                                  } else {
                                    newCorrectAnswers = newCorrectAnswers.filter(ans => ans !== currentOptionText);
                                  }
                                }
                                
                                // Auto-adjust question type based on correct answer count
                                let newQuestionType = editFormData.question_type;
                                const isMultiple = editFormData.question_type === "multiple" || editFormData.question_type === "multi-correct";
                                
                                if (newCorrectAnswers.length === 1 && isMultiple) {
                                  newQuestionType = "single-correct";
                                } else if (newCorrectAnswers.length > 1 && isSingle) {
                                  newQuestionType = "multi-correct";
                                }
                                
                                setEditFormData({ ...editFormData, correct_answers: newCorrectAnswers, question_type: newQuestionType });
                              }}
                              className="rounded"
                              disabled={!optionText.trim()}
                              name={(editFormData.question_type === "single" || editFormData.question_type === "single-correct") ? "correct-answer" : undefined}
                            />
                            <span className="text-xs text-gray-500 w-16">Correct</span>
                          </div>
                          <div className="ml-8">
                            <Label className="text-xs text-gray-600">Explanation for Option {String.fromCharCode(65 + displayIdx)}</Label>
                            <Textarea
                              value={optionExplanation}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                const newOptions = [...editFormData.options];
                                const currentOpt = typeof option === 'object' ? option : { text: optionText, explanation: '' };
                                newOptions[idx] = { text: currentOpt.text || optionText, explanation: newValue };
                                setEditFormData({ ...editFormData, options: newOptions });
                              }}
                              placeholder={`Explanation for why this option is correct or incorrect...`}
                              rows={2}
                              className="resize-none text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                {/* Validation messages */}
                {(() => {
                  const validOptions = editFormData.options.filter(opt => {
                    const optText = typeof opt === 'object' ? (opt.text || '') : (opt || '');
                    return optText.trim();
                  });
                  const validCorrectAnswers = editFormData.correct_answers.filter(ans => ans && ans.trim());
                  const issues = [];
                  
                  if (validOptions.length < 2) {
                    issues.push("At least 2 options are required");
                  }
                  if (validOptions.length > 6) {
                    issues.push("Too many options (maximum 6 recommended)");
                  }
                  if (validCorrectAnswers.length === 0) {
                    issues.push("At least one correct answer is required");
                  }
                  const isSingle = editFormData.question_type === "single" || editFormData.question_type === "single-correct";
                  const isMultiple = editFormData.question_type === "multiple" || editFormData.question_type === "multi-correct";
                  
                  if (isSingle && validCorrectAnswers.length !== 1) {
                    issues.push(`Single choice questions must have exactly 1 correct answer (currently ${validCorrectAnswers.length})`);
                  }
                  if (isMultiple && validCorrectAnswers.length < 2) {
                    issues.push(`Multiple choice questions must have at least 2 correct answers (currently ${validCorrectAnswers.length})`);
                  }
                  
                  return issues.length > 0 ? (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <div className="font-medium text-yellow-800 mb-1">Issues:</div>
                      <ul className="list-disc list-inside text-yellow-700 space-y-1">
                        {issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      ✓ All validations passed
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <Label>Overall Explanation</Label>
                <Textarea
                  value={editFormData.explanation}
                  onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                  rows={3}
                  className="resize-none"
                  placeholder="Overall explanation for the question..."
                />
              </div>

              <div className="space-y-2">
                <Label>Domain / Tags</Label>
                <Input
                  value={Array.isArray(editFormData.tags) ? editFormData.tags.join(', ') : (editFormData.tags || '')}
                  onChange={(e) => {
                    const tagsStr = e.target.value;
                    const tagsArray = tagsStr.split(',').map(t => t.trim()).filter(t => t);
                    setEditFormData({ ...editFormData, tags: tagsArray });
                  }}
                  placeholder="Enter tags separated by commas (e.g., Agile, Scrum, User Stories)"
                />
                <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="needs_review">Needs Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the question from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {
                  bulkDeleteType === 'input' ? selectedInputQuestions.size :
                  bulkDeleteType === 'generated' ? selectedGeneratedQuestions.size :
                  selectedReviewQuestions.size
                } selected question(s) from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowBulkDeleteDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Selected"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
