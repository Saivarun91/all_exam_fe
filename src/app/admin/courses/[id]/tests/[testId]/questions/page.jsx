"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "@/lib/navigation/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Upload, FileText, X, ArrowLeft, BookOpen, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { checkAuth, getAuthHeaders, getAuthHeadersForUpload } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Cloudinary configuration
const CLOUD_NAME = "dhy0krkef";
const UPLOAD_PRESET = "preptara";

const toBackendQuestionType = (questionType) => {
  if (questionType === "single") return "SINGLE";
  if (questionType === "multiple") return "MCQ";
  return questionType || "SINGLE";
};

const toUiQuestionType = (questionType) => {
  const normalized = String(questionType || "").toUpperCase();
  if (normalized === "SINGLE" || normalized === "TRUE_FALSE") return "single";
  if (normalized === "MCQ" || normalized === "MULTIPLE") return "multiple";
  return "single";
};

/** Next may pass dynamic segments as string | string[] */
const segment = (value) => {
  if (value === undefined || value === null) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  return v === undefined || v === null || v === "" ? undefined : String(v);
};

/** When useParams() is empty, recover id from query (?test_id= / ?category_id=) or path (.../tests/<id>/questions) */
const readTestIdFromUrl = () => {
  if (typeof window === "undefined") return undefined;
  const sp = new URLSearchParams(window.location.search);
  const fromQuery = sp.get("test_id") || sp.get("category_id");
  if (fromQuery && fromQuery.trim()) return fromQuery.trim();
  const m = window.location.pathname.match(/\/tests\/([^/]+)\/questions(?:\/|$)/);
  return m?.[1];
};

/** Walk ProseMirror/TipTap-like JSON and return plain text (no [object Object] in UI). */
const extractPlainFromProseMirrorLike = (node) => {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node !== "object") return "";
  let out = "";
  if (typeof node.text === "string") out += node.text;
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const piece = extractPlainFromProseMirrorLike(child);
      if (!piece) continue;
      out = out ? `${out} ${piece}` : piece;
    }
  }
  return out.replace(/\s+/g, " ").trim();
};

/** API may return `text` as string, TipTap doc object, or other shapes — always coerce for forms and .trim(). */
const optionTextToString = (text) => {
  if (text == null || text === "") return "";
  if (typeof text === "string") return text;
  if (typeof text !== "object") return "";
  const fromRoot = extractPlainFromProseMirrorLike(text);
  if (fromRoot) return fromRoot;
  if (typeof text.text === "string") return text.text;
  if (text.text && typeof text.text === "object") {
    const inner = extractPlainFromProseMirrorLike(text.text);
    if (inner) return inner;
  }
  return "";
};

const optionDisplayValue = (option) => {
  const t = optionTextToString(option?.text);
  const img = option?.image_url || option?.image || "";
  return t || img || "";
};

const optionHasContent = (option) => {
  const t = optionTextToString(option?.text);
  return Boolean((t && t.trim()) || option?.image_url || option?.image);
};

export default function TestQuestionsManager() {
  const params = useParams();
  const courseId = segment(params?.id);
  const testId = segment(params?.testId) || readTestIdFromUrl();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "single",
    options: [{ text: "", explanation: "", image_url: "" }], 
    correct_answers: [],
    explanation: "",
    question_image: "",
    marks: 1,
    tags: ""
  });
  const [questionImageFile, setQuestionImageFile] = useState(null);
  const [questionImagePreview, setQuestionImagePreview] = useState(null);
  const [optionImageFiles, setOptionImageFiles] = useState({});
  const [optionImagePreviews, setOptionImagePreviews] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const isLikelyMongoObjectId = (s) =>
    typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s.trim());

  const resolvePracticeTestId = (courseData = course) => {
    const tests = courseData?.practice_tests_list || [];
    const fromQuestion = questions.find((q) => q?.category_id)?.category_id;
    if (fromQuestion && isLikelyMongoObjectId(String(fromQuestion))) {
      return String(fromQuestion).trim();
    }
    if (currentTest?.id != null && isLikelyMongoObjectId(String(currentTest.id))) {
      return String(currentTest.id).trim();
    }
    const candidate = (segment(params?.testId) || readTestIdFromUrl() || "").trim();
    if (candidate && isLikelyMongoObjectId(candidate)) return candidate;
    if (candidate && tests.length) {
      const bySlug = tests.find(
        (t) => t?.slug != null && String(t.slug) === candidate
      );
      if (bySlug?.id && isLikelyMongoObjectId(String(bySlug.id))) {
        return String(bySlug.id).trim();
      }
      const byId = tests.find((t) => String(t.id) === candidate);
      if (byId?.id && isLikelyMongoObjectId(String(byId.id))) {
        return String(byId.id).trim();
      }
      const asIndex = Number.parseInt(candidate, 10);
      if (!Number.isNaN(asIndex) && asIndex > 0 && tests[asIndex - 1]?.id) {
        const indexedId = String(tests[asIndex - 1].id);
        if (isLikelyMongoObjectId(indexedId)) return indexedId;
      }
    }
    if (currentTest?.id != null && isLikelyMongoObjectId(String(currentTest.id))) {
      return String(currentTest.id).trim();
    }
    if (fromQuestion != null && isLikelyMongoObjectId(String(fromQuestion))) {
      return String(fromQuestion).trim();
    }
    return candidate || undefined;
  };

  const fetchCourse = async () => {
    if (!courseId) return null;
    try {
      const candidateUrls = [
        `${API_BASE_URL}/api/courses/admin/${courseId}/`,
        `${API_BASE_URL}/api/courses/admin/${courseId}/detail/`,
      ];

      for (const url of candidateUrls) {
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) continue;
        const data = await res.json();
        const foundCourse =
          data?.success && data?.data ? data.data : data?.id ? data : null;
        if (!foundCourse) continue;

        setCourse(foundCourse);
        const candidate = (segment(params?.testId) || readTestIdFromUrl() || "").trim();
        const test = (foundCourse.practice_tests_list || []).find(
          (t) =>
            String(t.id) === candidate ||
            String(t.slug) === candidate ||
            (Number.parseInt(candidate, 10) > 0 &&
              foundCourse.practice_tests_list[
                Number.parseInt(candidate, 10) - 1
              ]?.id === t.id)
        );
        if (test) setCurrentTest(test);
        return foundCourse;
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
    return null;
  };

  const fetchQuestions = async (resolvedTestId) => {
    const practiceTestId = resolvedTestId || resolvePracticeTestId();
    if (!practiceTestId) return;
    try {
      setLoading(true);
      const query = new URLSearchParams({
        test_id: practiceTestId,
      });
      if (courseId) query.set("course_id", courseId);

      const res = await fetch(
        `${API_BASE_URL}/api/exams/questions/?${query.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const questionsList = (data.questions || data.data || []).map((q) => ({
          ...q,
          question_type: toUiQuestionType(q.question_type),
        }));
        setQuestions(questionsList);
      } else {
        console.error("Error fetching questions:", data.message || data.error);
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }

    const loadPageData = async () => {
      const courseData = await fetchCourse();
      const resolvedTestId = resolvePracticeTestId(courseData);
      if (resolvedTestId) {
        await fetchQuestions(resolvedTestId);
      }
    };

    loadPageData();
  }, [courseId, testId]);

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "single",
      options: [{ text: "", explanation: "", image_url: "" }, { text: "", explanation: "", image_url: "" }, { text: "", explanation: "", image_url: "" }, { text: "", explanation: "", image_url: "" }],
      correct_answers: [],
      explanation: "",
      question_image: "",
      marks: 1,
      tags: ""
    });
    setQuestionImageFile(null);
    setQuestionImagePreview(null);
    setOptionImageFiles({});
    setOptionImagePreviews({});
    setEditing(null);
  };

  const handleEdit = (question) => {
    setEditing(question);
    // Ensure options have explanation and image_url fields
    const optionsWithFields = question.options.length > 0 
      ? question.options.map((opt) => ({
          text: optionTextToString(opt?.text),
          explanation:
            typeof opt?.explanation === "string"
              ? opt.explanation
              : optionTextToString(opt?.explanation),
          image_url: opt.image_url || opt.image || ""
        }))
      : [{ text: "", explanation: "", image_url: "" }, { text: "", explanation: "", image_url: "" }, { text: "", explanation: "", image_url: "" }, { text: "", explanation: "", image_url: "" }];
    
    setFormData({
      question_text: question.question_text || "",
      question_type: toUiQuestionType(question.question_type),
      options: optionsWithFields,
      correct_answers: (question.correct_answers || []).map((ans) => {
        if (typeof ans === "string") return ans;
        if (ans && typeof ans === "object") {
          return (
            optionTextToString(ans.text) ||
            ans.image_url ||
            ans.image ||
            ""
          );
        }
        return ans != null ? String(ans) : "";
      }),
      explanation: question.explanation || "",
      question_image: question.question_image || "",
      marks: question.marks || 1,
      tags: question.tags?.join(", ") || ""
    });
    
    // Set image previews if images exist
    if (question.question_image) {
      setQuestionImagePreview(question.question_image);
    }
    
    const previews = {};
    optionsWithFields.forEach((opt, idx) => {
      if (opt.image_url) {
        previews[idx] = opt.image_url;
      }
    });
    setOptionImagePreviews(previews);
    
    setQuestionImageFile(null);
    setOptionImageFiles({});
    setDialogOpen(true);
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: imageData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await res.json();
    return data.secure_url;
  };

  // Handle question image upload
  const handleQuestionImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setQuestionImageFile(file);

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData({ ...formData, question_image: imageUrl });
      setMessage("✅ Question image uploaded successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage("❌ Error uploading question image: " + err.message);
      setQuestionImageFile(null);
      setQuestionImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle option image upload
  const handleOptionImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionImagePreviews({ ...optionImagePreviews, [index]: reader.result });
      };
      reader.readAsDataURL(file);
      setOptionImageFiles({ ...optionImageFiles, [index]: file });

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      const newOptions = [...formData.options];
      newOptions[index] = { ...newOptions[index], image_url: imageUrl };
      setFormData({ ...formData, options: newOptions });
      setMessage(`✅ Option ${String.fromCharCode(65 + index)} image uploaded successfully!`);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(`❌ Error uploading option image: ${err.message}`);
      const newFiles = { ...optionImageFiles };
      delete newFiles[index];
      setOptionImageFiles(newFiles);
      const newPreviews = { ...optionImagePreviews };
      delete newPreviews[index];
      setOptionImagePreviews(newPreviews);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const practiceTestId = resolvePracticeTestId();
      if (!practiceTestId) {
        setMessage(
          "❌ Practice test id is missing. Open this screen from the course’s practice tests list (View Questions), then try again."
        );
        setLoading(false);
        return;
      }

      // Validate: must have either question_text or question_image
      if (!formData.question_text.trim() && !formData.question_image) {
        setMessage("❌ Please provide either question text or question image");
        setLoading(false);
        return;
      }

      // Upload images if files are selected but not yet uploaded
      let finalQuestionImage = formData.question_image;
      if (questionImageFile && !finalQuestionImage) {
        finalQuestionImage = await uploadImageToCloudinary(questionImageFile);
      }

      // Upload option images that haven't been uploaded yet
      const finalOptions = await Promise.all(
        formData.options.map(async (opt, idx) => {
          let finalImageUrl = opt.image_url || "";
          if (optionImageFiles[idx] && !finalImageUrl) {
            finalImageUrl = await uploadImageToCloudinary(optionImageFiles[idx]);
          }
          
          const textStr = optionTextToString(opt.text);
          // Validate: option must have either text or image
          const hasText = textStr.trim() !== "";
          const hasImage = finalImageUrl !== "";
          
          if (!hasText && !hasImage) {
            return null; // Skip empty options
          }

          return {
            text: textStr.trim(),
            explanation:
              typeof opt.explanation === "string"
                ? opt.explanation.trim()
                : optionTextToString(opt.explanation).trim(),
            image_url: finalImageUrl || undefined
          };
        })
      );

      // Filter out null options
      const validOptions = finalOptions.filter(opt => opt !== null);
      
      if (validOptions.length < 2) {
        setMessage("❌ At least 2 options with text or image are required");
        setLoading(false);
        return;
      }

      // Map correct answers to match final processed options
      // Build a map from original option identifier to final option identifier
      const answerMap = new Map();
      let validIndex = 0;
      
      formData.options.forEach((opt, originalIndex) => {
        const textStr = optionTextToString(opt.text);
        const hasText = textStr.trim() !== "";
        const hasImage = opt.image_url && String(opt.image_url).trim() !== "";
        
        if (hasText || hasImage) {
          if (validIndex < validOptions.length) {
            const originalIdentifier = textStr || opt.image_url;
            const finalOpt = validOptions[validIndex];
            const finalIdentifier = finalOpt.text || finalOpt.image_url;
            if (originalIdentifier && finalIdentifier) {
              answerMap.set(originalIdentifier, finalIdentifier);
            }
            validIndex++;
          }
        }
      });
      
      // Map correct answers using the map
      const mappedCorrectAnswers = formData.correct_answers.map((rawAns) => {
        const ans =
          typeof rawAns === "string"
            ? rawAns
            : optionTextToString(rawAns) ||
              (rawAns && typeof rawAns === "object"
                ? rawAns.image_url || rawAns.image || ""
                : rawAns != null
                  ? String(rawAns)
                  : "");
        // Try to find in the map first
        if (answerMap.has(ans)) {
          return answerMap.get(ans);
        }
        
        // Fallback: try to find by direct match in final options
        const directMatch = validOptions.find((opt) => {
          const ot = optionTextToString(opt.text);
          return (
            ot === ans ||
            opt.image_url === ans ||
            (ot || opt.image_url) === ans ||
            optionTextToString(rawAns) === ot
          );
        });
        if (directMatch) {
          return directMatch.text || directMatch.image_url;
        }
        
        // Return as-is (for backward compatibility with existing questions)
        return ans;
      });

      const payload = {
        category_id: practiceTestId,
        test_id: practiceTestId,
        course_id: courseId || course?.id,
        question_text: formData.question_text.trim() || "",
        question_type: toBackendQuestionType(formData.question_type),
        options: validOptions,
        correct_answers: mappedCorrectAnswers,
        explanation: formData.explanation || "",
        question_image: finalQuestionImage || null,
        marks: parseInt(formData.marks) || 1,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "")
      };

      const url = editing
        ? `${API_BASE_URL}/api/exams/questions/update/${editing.id}/`
        : `${API_BASE_URL}/api/exams/questions/create/`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Question ${editing ? 'updated' : 'created'} successfully!`);
        setDialogOpen(false);
        resetForm();
        fetchQuestions();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.message || data.error || "Failed to save"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/questions/delete/${questionId}/`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Question deleted successfully!");
        fetchQuestions();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Error deleting: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      setMessage("❌ Please select questions to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/questions/bulk-delete/`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question_ids: selectedQuestions })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${data.deleted_count} questions deleted successfully!`);
        setSelectedQuestions([]);
        fetchQuestions();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage("❌ Please select a CSV file");
      return;
    }

    const practiceTestId = resolvePracticeTestId();
    if (!practiceTestId) {
      setMessage(
        "❌ Practice test id is missing. Go back and open View Questions from the practice test list."
      );
      return;
    }

    setLoading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", csvFile);
      formDataUpload.append("test_id", practiceTestId);
      if (courseId || course?.id) {
        formDataUpload.append("course_id", courseId || course.id);
      }

      const res = await fetch(`${API_BASE_URL}/api/exams/questions/upload-csv/`, {
        method: "POST",
        headers: getAuthHeadersForUpload(),
        body: formDataUpload,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: `HTTP error! status: ${res.status}`,
        }));
        throw new Error(
          errorData.message || errorData.error || `HTTP error! status: ${res.status}`
        );
      }

      const data = await res.json();

      if (data.success || data.questions_created > 0) {
        let message = `✅ ${data.questions_created} question(s) uploaded successfully!`;
        if (data.questions_skipped > 0) {
          message += ` ${data.questions_skipped} question(s) skipped (test limit reached).`;
        }
        if (data.errors && data.errors.length > 0) {
          message += `\n⚠️ ${data.errors.length} row(s) had errors. Check console for details.`;
          console.error("Upload errors:", data.errors);
          console.error("First 5 errors:", data.errors.slice(0, 5));
        }
        setMessage(message);
        setCsvFile(null);
        setCsvDialogOpen(false);
        const refreshTestId = data.test_id || practiceTestId;
        await fetchQuestions(refreshTestId);
        setTimeout(() => setMessage(""), 10000);
      } else {
        let errorMsg = data.error || data.message || "Failed to upload";
        if (data.errors && data.errors.length > 0) {
          errorMsg += `\n\nErrors found:\n${data.errors.slice(0, 5).join("\n")}`;
          if (data.errors.length > 5) {
            errorMsg += `\n... and ${data.errors.length - 5} more errors. Check console for full list.`;
          }
          console.error("All upload errors:", data.errors);
        }
        setMessage("❌ " + errorMsg);
        await fetchQuestions(data.test_id || practiceTestId);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      console.error("CSV upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", explanation: "", image_url: "" }]
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index, value, field = 'text') => {
    const newOptions = [...formData.options];
    if (!newOptions[index]) {
      newOptions[index] = { text: "", explanation: "", image_url: "" };
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const toggleCorrectAnswer = (optionValue) => {
    if (formData.question_type === "single") {
      setFormData({ ...formData, correct_answers: [optionValue] });
    } else {
      const current = formData.correct_answers;
      if (current.includes(optionValue)) {
        setFormData({ ...formData, correct_answers: current.filter(a => a !== optionValue) });
      } else {
        setFormData({ ...formData, correct_answers: [...current, optionValue] });
      }
    }
  };

  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const testQuestionsNeeded = currentTest?.questions || 0;
  const questionsAvailable = questions.length;
  const questionsShortfall = Math.max(0, testQuestionsNeeded - questionsAvailable);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tests
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">
            Questions for {currentTest?.name || `Test ${testId}`}
          </h1>
          <p className="text-[#0C1A35]/60 mt-1">
            {course?.provider} • {course?.code} • {course?.title}
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes("Error") || message.includes("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      {/* Info Card */}
      <Card className={`mb-6 ${questionsShortfall > 0 ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {questionsShortfall > 0 ? (
              <AlertCircle className="w-8 h-8 text-orange-600" />
            ) : (
              <BookOpen className="w-8 h-8 text-[#1A73E8]" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-[#0C1A35] mb-2">Test Configuration</h3>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-bold text-[#0C1A35]">{testQuestionsNeeded}</div>
                  <div className="text-sm text-[#0C1A35]/60">Questions Needed</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${questionsAvailable >= testQuestionsNeeded ? 'text-green-600' : 'text-orange-600'}`}>
                    {questionsAvailable}
                  </div>
                  <div className="text-sm text-[#0C1A35]/60">Questions Available</div>
                </div>
                {questionsShortfall > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-red-600">{questionsShortfall}</div>
                    <div className="text-sm text-[#0C1A35]/60">Still Needed</div>
                  </div>
                )}
              </div>
              <p className="text-sm text-[#0C1A35]/70">
                {questionsShortfall > 0 ? (
                  <span className="text-orange-700 font-medium">
                    ⚠️ You need to add {questionsShortfall} more question(s) to meet the test requirement.
                  </span>
                ) : questionsAvailable > testQuestionsNeeded ? (
                  <span className="text-green-700">
                    ✓ You have {questionsAvailable - testQuestionsNeeded} extra questions. The test will use the first {testQuestionsNeeded} questions from the pool.
                  </span>
                ) : (
                  <span className="text-green-700">
                    ✓ Perfect! You have exactly the right number of questions for this test.
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Questions CSV</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCSVUpload} className="space-y-4">
                <div>
                  <Label>CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload questions for this test. The test will use the first {testQuestionsNeeded} questions.
                  </p>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#1A73E8] hover:bg-[#1557B0]">
                  {loading ? "Uploading..." : "Upload Questions"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          {selectedQuestions.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedQuestions.length})
            </Button>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]">
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#0C1A35]">
                {editing ? "Edit Question" : "Add New Question"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Question Text {!formData.question_image && "*"}</Label>
                <Textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                  placeholder="Enter your question here..."
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Required if no image is uploaded</p>
              </div>

              <div>
                <Label>Question Image {!formData.question_text.trim() && "*"}</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleQuestionImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    />
                    {formData.question_image && (
                      <Input
                        type="text"
                        value={formData.question_image}
                        onChange={(e) => setFormData({...formData, question_image: e.target.value})}
                        placeholder="Or enter image URL"
                        className="flex-1"
                      />
                    )}
                  </div>
                  {questionImagePreview && (
                    <div className="relative inline-block">
                      <img 
                        src={questionImagePreview} 
                        alt="Question preview" 
                        className="max-w-full max-h-48 rounded-lg border border-gray-300"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setQuestionImagePreview(null);
                          setQuestionImageFile(null);
                          setFormData({...formData, question_image: ""});
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {formData.question_image && !questionImagePreview && (
                    <div className="relative inline-block">
                      <img 
                        src={formData.question_image} 
                        alt="Question" 
                        className="max-w-full max-h-48 rounded-lg border border-gray-300"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFormData({...formData, question_image: ""});
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Required if no question text is provided</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Question Type *</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value) => setFormData({...formData, question_type: value, correct_answers: []})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Choice</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                    placeholder="1"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Options * (Check correct answer{formData.question_type === 'multiple' ? 's' : ''})</Label>
                  <Button type="button" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-1" /> Add Option
                  </Button>
                </div>
                {formData.question_type === "single" ? (
                  <RadioGroup
                    value={formData.correct_answers[0] || ""}
                    onValueChange={(value) => toggleCorrectAnswer(value)}
                  >
                {formData.options.map((option, index) => {
                      const optionValue = optionDisplayValue(option);
                      const hasContent = optionHasContent(option);
                      return (
                      <div key={index} className="mb-4 p-3 border rounded-lg">
                        <div className="flex gap-2 mb-2 items-center">
                          <RadioGroupItem
                            value={optionValue}
                            id={`option-${index}`}
                            disabled={!hasContent}
                          />
                          <Input
                            value={optionTextToString(option.text)}
                            onChange={(e) => updateOption(index, e.target.value, 'text')}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          {formData.options.length > 2 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOption(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="ml-6 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleOptionImageUpload(e, index)}
                              disabled={uploadingImage}
                              className="flex-1 text-sm"
                            />
                            {option.image_url && (
                              <Input
                                type="text"
                                value={option.image_url}
                                onChange={(e) => updateOption(index, e.target.value, 'image_url')}
                                placeholder="Or enter image URL"
                                className="flex-1 text-sm"
                              />
                            )}
                          </div>
                          {(optionImagePreviews[index] || option.image_url) && (
                            <div className="relative inline-block">
                              <img 
                                src={optionImagePreviews[index] || option.image_url} 
                                alt={`Option ${String.fromCharCode(65 + index)}`}
                                className="max-w-xs max-h-32 rounded-lg border border-gray-300"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => {
                                  const newOptions = [...formData.options];
                                  newOptions[index] = { ...newOptions[index], image_url: "" };
                                  setFormData({...formData, options: newOptions});
                                  const newPreviews = { ...optionImagePreviews };
                                  delete newPreviews[index];
                                  setOptionImagePreviews(newPreviews);
                                  const newFiles = { ...optionImageFiles };
                                  delete newFiles[index];
                                  setOptionImageFiles(newFiles);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          <Textarea
                            value={option.explanation || ""}
                            onChange={(e) => updateOption(index, e.target.value, 'explanation')}
                            placeholder={`Explanation for Option ${String.fromCharCode(65 + index)} (optional)`}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )})}
                  </RadioGroup>
                ) : (
                  formData.options.map((option, index) => {
                    const optionValue = optionDisplayValue(option);
                    const hasContent = optionHasContent(option);
                    return (
                    <div key={index} className="mb-4 p-3 border rounded-lg">
                      <div className="flex gap-2 mb-2 items-center">
                    <Checkbox
                          checked={formData.correct_answers.includes(optionValue)}
                          onCheckedChange={() => toggleCorrectAnswer(optionValue)}
                          disabled={!hasContent}
                    />
                    <Input
                          value={optionTextToString(option.text)}
                          onChange={(e) => updateOption(index, e.target.value, 'text')}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                      <div className="ml-6 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOptionImageUpload(e, index)}
                            disabled={uploadingImage}
                            className="flex-1 text-sm"
                          />
                          {option.image_url && (
                            <Input
                              type="text"
                              value={option.image_url}
                              onChange={(e) => updateOption(index, e.target.value, 'image_url')}
                              placeholder="Or enter image URL"
                              className="flex-1 text-sm"
                            />
                          )}
                        </div>
                        {(optionImagePreviews[index] || option.image_url) && (
                          <div className="relative inline-block">
                            <img 
                              src={optionImagePreviews[index] || option.image_url} 
                              alt={`Option ${String.fromCharCode(65 + index)}`}
                              className="max-w-xs max-h-32 rounded-lg border border-gray-300"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => {
                                const newOptions = [...formData.options];
                                newOptions[index] = { ...newOptions[index], image_url: "" };
                                setFormData({...formData, options: newOptions});
                                const newPreviews = { ...optionImagePreviews };
                                delete newPreviews[index];
                                setOptionImagePreviews(newPreviews);
                                const newFiles = { ...optionImageFiles };
                                delete newFiles[index];
                                setOptionImageFiles(newFiles);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <Textarea
                          value={option.explanation || ""}
                          onChange={(e) => updateOption(index, e.target.value, 'explanation')}
                          placeholder={`Explanation for Option ${String.fromCharCode(65 + index)} (optional)`}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )})
                )}
              </div>

              <div>
                <Label>Explanation</Label>
                <Textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  placeholder="Explain why the correct answer is correct..."
                  rows={3}
                  className="mt-2"
                />
              </div>


              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="aws, cloud, architecture"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
                >
                  {loading ? "Saving..." : editing ? "Update Question" : "Create Question"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions Table */}
      {loading ? (
        <p className="text-center py-8 text-[#0C1A35]/60">Loading questions...</p>
      ) : !questions || questions.length === 0 ? (
        <Card className="border-[#DDE7FF]">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#0C1A35]/60 mb-4">No questions added yet</p>
            <p className="text-sm text-gray-500 mb-6">Add questions manually or upload a CSV file</p>
            <p className="text-sm text-orange-600 font-medium">
              This test needs {testQuestionsNeeded} questions
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#DDE7FF]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedQuestions.length === questions.length && questions.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedQuestions(questions.map(q => q.id));
                        } else {
                          setSelectedQuestions([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, idx) => (
                  <TableRow key={question.id} className={idx >= testQuestionsNeeded ? 'bg-gray-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => toggleQuestionSelection(question.id)}
                      />
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex items-center gap-2">
                        {idx < testQuestionsNeeded && (
                          <Badge className="bg-green-100 text-green-700 text-xs border-0">
                            In Test
                          </Badge>
                        )}
                        <div className="truncate font-medium text-[#0C1A35]">{question.question_text}</div>
                      </div>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {question.tags.map((tag, tagIdx) => (
                            <Badge key={tagIdx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={question.question_type === 'multiple' ? 'bg-purple-100 text-purple-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}>
                        {question.question_type === 'single' ? 'Single' : 'Multiple'}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.options?.length || 0}</TableCell>
                    <TableCell>{question.marks || 1}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

