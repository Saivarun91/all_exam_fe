"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, BookOpen, Clock, Target, Plus, Edit, Trash2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CourseTestsPage() {
  const params = useParams();
  const courseId = params?.id;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState({
    name: "",
    description: "",
    questions: 0,
    duration: "",
    difficulty: "Intermediate",
    pass_rate: 94,
    rating: 4.5,
    reviews_count: 0,
  });

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
          headers: getAuthHeaders()
      });

      const data = await res.json();
        if (data.success) {
          const foundCourse = data.data.find(c => c.id === courseId);
          if (foundCourse) {
            setCourse(foundCourse);
    }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#0C1A35]/70">Loading...</p>
      </div>
    );
      }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error || "Course not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
    }

  const practiceTests = course.practice_tests_list || [];

  const handleAddTest = async () => {
    try {
      const updatedTests = [...practiceTests, { ...testForm, id: Date.now().toString() }];
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/update/`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          practice_tests_list: updatedTests,
        }),
      });

      if (res.ok) {
        setCourse({ ...course, practice_tests_list: updatedTests });
        setShowAddDialog(false);
        setTestForm({
          name: "",
          description: "",
          questions: 0,
          duration: "",
          difficulty: "Intermediate",
          pass_rate: 94,
          rating: 4.5,
          reviews_count: 0,
        });
        setMessage("✅ Practice test added successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUpdateTest = async () => {
    try {
      const updatedTests = practiceTests.map((t) =>
        t.id === editingTest.id ? { ...testForm, id: editingTest.id } : t
      );
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/update/`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          practice_tests_list: updatedTests,
        }),
      });

      if (res.ok) {
        setCourse({ ...course, practice_tests_list: updatedTests });
        setShowEditDialog(false);
        setEditingTest(null);
        setMessage("✅ Practice test updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm("Are you sure you want to delete this practice test?")) return;

    try {
      const updatedTests = practiceTests.filter((t) => t.id !== testId);
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/update/`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          practice_tests_list: updatedTests,
        }),
      });

      if (res.ok) {
        setCourse({ ...course, practice_tests_list: updatedTests });
        setMessage("✅ Practice test deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const openEditDialog = (test) => {
    setEditingTest(test);
    setTestForm({
      name: test.name || "",
      description: test.description || "",
      questions: test.questions || 0,
      duration: test.duration || "",
      difficulty: test.difficulty || "Intermediate",
      pass_rate: test.pass_rate || 94,
      rating: test.rating || 4.5,
      reviews_count: test.reviews_count || 0,
    });
    setShowEditDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes("Error") || message.includes("❌")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0C1A35]">
              Practice Tests for {course.title}
            </h1>
            <p className="text-[#0C1A35]/60 mt-1">
              {course.provider} • {course.code}
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex gap-3">
          <Button
            className="bg-[#1A73E8] hover:bg-[#1557B0]"
            onClick={() => router.push(`/admin/courses/${courseId}/questions`)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Manage All Questions
          </Button>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Practice Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Practice Test</DialogTitle>
              </DialogHeader>
              {renderTestForm(testForm, setTestForm, handleAddTest)}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-[#DDE7FF]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#1A73E8]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0C1A35]">{practiceTests.length}</div>
                <div className="text-sm text-[#0C1A35]/60">Practice Tests</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0C1A35]">{course.questions || 0}</div>
                <div className="text-sm text-[#0C1A35]/60">Total Questions</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0C1A35]">{course.duration || "N/A"}</div>
                <div className="text-sm text-[#0C1A35]/60">Duration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          className="bg-[#1A73E8] hover:bg-[#1557B0]"
          onClick={() => router.push(`/admin/courses/${courseId}/questions`)}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Manage All Questions
        </Button>
      </div>

      {/* Practice Tests List */}
      {practiceTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceTests.map((test, index) => (
            <Card key={test.id || index} className="border-[#DDE7FF] hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#0C1A35] flex items-center justify-between">
                  <span>{test.name || `Test ${index + 1}`}</span>
                  {test.difficulty && (
                    <Badge className="bg-[#1A73E8]/10 text-[#1A73E8]">
                      {test.difficulty}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating */}
                {test.rating && (
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{test.rating}</span>
                    {test.reviews_count > 0 && (
                      <span className="text-sm text-gray-500">({test.reviews_count.toLocaleString()} reviews)</span>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#0C1A35]/60">Practice Tests:</span>
                    <span className="font-semibold text-[#0C1A35]">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0C1A35]/60">Total Questions:</span>
                    <span className="font-semibold text-[#0C1A35]">{test.questions || 0}+</span>
                  </div>
                  {test.pass_rate && (
                    <div className="flex justify-between">
                      <span className="text-[#0C1A35]/60">Pass Rate:</span>
                      <span className="font-semibold text-green-600">{test.pass_rate}%</span>
                    </div>
                  )}
                  {test.duration && (
                    <div className="flex justify-between">
                      <span className="text-[#0C1A35]/60">Duration:</span>
                      <span className="font-semibold text-[#0C1A35]">{test.duration}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <Button
                    className="w-full bg-[#1A73E8] hover:bg-[#1557B0]"
                    onClick={() => router.push(`/admin/courses/${courseId}/tests/${test.id || index + 1}/questions`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Questions
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => openEditDialog(test)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[#DDE7FF]">
          <CardContent className="p-12 text-center">
            <p className="text-[#0C1A35]/60 mb-4">No practice tests configured yet</p>
            <Button
              className="bg-[#1A73E8] hover:bg-[#1557B0]"
              onClick={() => router.push(`/admin/home/exam-details-manager`)}
            >
              Configure Practice Tests
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Practice Test</DialogTitle>
          </DialogHeader>
          {renderTestForm(testForm, setTestForm, handleUpdateTest, true)}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-[#0C1A35] mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}/questions`)}
          >
            Manage All Questions for This Course
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}/pricing`)}
          >
            Manage Pricing Plans
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/home/exam-details-manager`)}
          >
            Configure Course Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// Test Form Component
function renderTestForm(form, setForm, onSubmit, isEdit = false) {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Test Information</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Test Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Practice Test 1, Mock Exam A"
              required
            />
          </div>

          <div>
            <Label htmlFor="questions">Number of Questions *</Label>
            <Input
              id="questions"
              type="number"
              value={form.questions}
              onChange={(e) => setForm({ ...form, questions: parseInt(e.target.value) || 0 })}
              placeholder="65"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g., 90 minutes"
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(val) => setForm({ ...form, difficulty: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of this practice test..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Statistics</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="pass_rate">Pass Rate (%)</Label>
            <Input
              id="pass_rate"
              type="number"
              value={form.pass_rate}
              onChange={(e) => setForm({ ...form, pass_rate: parseInt(e.target.value) || 0 })}
              placeholder="94"
              min="0"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="rating">Rating (out of 5)</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
              placeholder="4.5"
              min="0"
              max="5"
            />
          </div>

          <div>
            <Label htmlFor="reviews_count">Reviews Count</Label>
            <Input
              id="reviews_count"
              type="number"
              value={form.reviews_count}
              onChange={(e) => setForm({ ...form, reviews_count: parseInt(e.target.value) || 0 })}
              placeholder="2847"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isEdit ? "Update Test" : "Add Test"}
        </Button>
      </div>
    </div>
  );
}
