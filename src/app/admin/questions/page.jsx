"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Upload, Download, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { checkAuth, getAuthHeaders, getAuthHeadersForUpload } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function QuestionsManager() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "single",
    options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correct_answers: [],
    explanation: "",
    question_image: "",
    marks: 1,
    tags: ""
  });

  useEffect(() => {
    if (!checkAuth()) {
      setMessage("❌ Authentication failed. Please log in as admin.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setMessage("❌ Error loading courses.");
    }
  };

  const fetchQuestions = async (courseId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/course/${courseId}/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setMessage("❌ Error loading questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setQuestions([]);
    setSelectedQuestions([]);
    fetchQuestions(course.id);
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "single",
      options: [{ text: "", explanation: "" }, { text: "", explanation: "" }, { text: "", explanation: "" }, { text: "", explanation: "" }],
      correct_answers: [],
      explanation: "",
      question_image: "",
      marks: 1,
      tags: ""
    });
    setEditing(null);
  };

  const handleEdit = (question) => {
    setEditing(question);
    // Ensure options have explanation field
    const optionsWithExplanations = question.options.length > 0 
      ? question.options.map(opt => ({ 
          text: opt.text || opt, 
          explanation: opt.explanation || "" 
        }))
      : [{ text: "", explanation: "" }, { text: "", explanation: "" }, { text: "", explanation: "" }, { text: "", explanation: "" }];
    
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options: optionsWithExplanations,
      correct_answers: question.correct_answers,
      explanation: question.explanation || "",
      question_image: question.question_image || "",
      marks: question.marks || 1,
      tags: question.tags?.join(", ") || ""
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        course_id: selectedCourse.id,
        question_text: formData.question_text,
        question_type: formData.question_type,
        options: formData.options.filter(opt => opt.text && opt.text.trim() !== "").map(opt => ({
          text: opt.text.trim(),
          explanation: opt.explanation ? opt.explanation.trim() : ""
        })),
        correct_answers: formData.correct_answers,
        explanation: formData.explanation,
        question_image: formData.question_image || null,
        marks: parseInt(formData.marks) || 1,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "")
      };

      const url = editing
        ? `${API_BASE_URL}/api/questions/admin/${editing.id}/update/`
        : `${API_BASE_URL}/api/questions/admin/create/`;

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
        fetchQuestions(selectedCourse.id);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to save"));
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
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/${questionId}/delete/`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Question deleted successfully!");
        fetchQuestions(selectedCourse.id);
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
      const res = await fetch(`${API_BASE_URL}/api/questions/admin/bulk-delete/`, {
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
        fetchQuestions(selectedCourse.id);
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('course_id', selectedCourse.id);

      const res = await fetch(`${API_BASE_URL}/api/questions/admin/upload-csv/`, {
        method: "POST",
        headers: getAuthHeadersForUpload(),
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success || data.created_count > 0) {
        let message = `✅ ${data.created_count} questions uploaded successfully!`;
        if (data.errors && data.errors.length > 0) {
          message += `\n⚠️ ${data.errors.length} rows had errors. Check console for details.`;
          console.error("Upload errors:", data.errors);
          console.error("First 5 errors:", data.errors.slice(0, 5));
        }
        setMessage(message);
        setCsvFile(null);
        fetchQuestions(selectedCourse.id);
        setTimeout(() => setMessage(""), 8000);
      } else {
        let errorMsg = data.error || data.message || "Failed to upload";
        if (data.errors && data.errors.length > 0) {
          errorMsg += `\n\nErrors found:\n${data.errors.slice(0, 5).join('\n')}`;
          if (data.errors.length > 5) {
            errorMsg += `\n... and ${data.errors.length - 5} more errors. Check console for full list.`;
          }
          console.error("All upload errors:", data.errors);
        }
        setMessage("❌ " + errorMsg);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", explanation: "" }]
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index, value, field = 'text') => {
    const newOptions = [...formData.options];
    if (!newOptions[index]) {
      newOptions[index] = { text: "", explanation: "" };
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const toggleCorrectAnswer = (optionText) => {
    if (formData.question_type === "single") {
      setFormData({ ...formData, correct_answers: [optionText] });
    } else {
      const current = formData.correct_answers;
      if (current.includes(optionText)) {
        setFormData({ ...formData, correct_answers: current.filter(a => a !== optionText) });
      } else {
        setFormData({ ...formData, correct_answers: [...current, optionText] });
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

  const downloadCSVTemplate = () => {
    const csvContent = `question,question type,Answer Option A,explanation,Answer Option B,explanation,Answer Option C,explanation,Answer Option D,explanation,Answer Option E,explanation,Answer Option F,explanation,correct answers,overall explanation,domain
"What is AWS?","single","Amazon Web Services","AWS is a cloud computing platform","A cloud platform","Generic cloud service","A database","Database system","A programming language","Programming language","","","Amazon Web Services","AWS stands for Amazon Web Services, a comprehensive cloud computing platform.","aws"
"Select cloud providers (multiple)","multiple","AWS","Amazon Web Services","Azure","Microsoft cloud platform","Google Cloud","Google cloud platform","Oracle","Oracle cloud","IBM Cloud","IBM cloud platform","","AWS,Azure,Google Cloud","Major cloud providers include AWS, Azure, and Google Cloud.","cloud"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">Questions Manager</h1>
        <p className="text-[#0C1A35]/60">Manage questions for practice tests</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes("Error") || message.includes("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left: Course Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCourse?.id === course.id
                      ? "border-[#1A73E8] bg-[#1A73E8]/10"
                      : "border-gray-200 hover:border-[#1A73E8]/50"
                  }`}
                >
                  <div className="font-semibold text-[#0C1A35] text-sm">{course.title}</div>
                  <div className="text-xs text-[#0C1A35]/60">{course.code}</div>
                  <Badge variant="secondary" className="mt-1 text-xs">{course.provider}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Questions List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedCourse ? `Questions for ${selectedCourse.title}` : "Select a course"}
              </CardTitle>
              {selectedCourse && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadCSVTemplate}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV Template
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
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
                            Upload a CSV file with columns: question_text, question_type, options, correct_answers, explanation, marks, tags
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
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete ({selectedQuestions.length})
                    </Button>
                  )}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={resetForm} className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]">
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
                          <Label>Question Text *</Label>
                          <Textarea
                            value={formData.question_text}
                            onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                            placeholder="Enter your question here..."
                            rows={4}
                            required
                            className="mt-2"
                          />
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
                          {formData.options.map((option, index) => (
                                <div key={index} className="mb-4 p-3 border rounded-lg">
                                  <div className="flex gap-2 mb-2 items-center">
                                    <RadioGroupItem
                                      value={option.text || ""}
                                      id={`option-${index}`}
                                      disabled={!option.text?.trim()}
                                    />
                                    <Input
                                      value={option.text || ""}
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
                                  <Textarea
                                    value={option.explanation || ""}
                                    onChange={(e) => updateOption(index, e.target.value, 'explanation')}
                                    placeholder={`Explanation for Option ${String.fromCharCode(65 + index)} (optional)`}
                                    rows={2}
                                    className="ml-6 text-sm"
                                  />
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            formData.options.map((option, index) => (
                              <div key={index} className="mb-4 p-3 border rounded-lg">
                                <div className="flex gap-2 mb-2 items-center">
                              <Checkbox
                                    checked={formData.correct_answers.includes(option.text || "")}
                                    onCheckedChange={() => toggleCorrectAnswer(option.text || "")}
                                    disabled={!option.text?.trim()}
                              />
                              <Input
                                    value={option.text || ""}
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
                                <Textarea
                                  value={option.explanation || ""}
                                  onChange={(e) => updateOption(index, e.target.value, 'explanation')}
                                  placeholder={`Explanation for Option ${String.fromCharCode(65 + index)} (optional)`}
                                  rows={2}
                                  className="ml-6 text-sm"
                                />
                              </div>
                            ))
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
                          <Label>Question Image URL (optional)</Label>
                          <Input
                            value={formData.question_image}
                            onChange={(e) => setFormData({...formData, question_image: e.target.value})}
                            placeholder="https://example.com/image.png"
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
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedCourse ? (
              <p className="text-[#0C1A35]/60 text-center py-8">
                Please select a course from the left to manage its questions
              </p>
            ) : loading ? (
              <p className="text-[#0C1A35]/60 text-center py-8">Loading questions...</p>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#0C1A35]/60 mb-4">No questions added yet</p>
                <p className="text-sm text-gray-500 mb-6">Add questions manually or upload a CSV file</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => toggleQuestionSelection(question.id)}
                          />
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate">{question.question_text}</div>
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {question.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={question.question_type === 'multiple' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

