"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Eye, Award, ArrowRight, Trash2, X, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function FeaturedExamsAdmin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    code: "",
    provider: "",
    category: "",
    badge: "",
  });
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Featured Certification Exams",
    subtitle: "Explore our most popular certification exams",
  });
  
  useEffect(() => {
    fetchCourses();
    fetchProviders();
    fetchCategories();
    fetchSectionSettings();
  }, []);
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/featured-exams-section/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSectionSettings(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching section settings:", error);
    }
  };
  
  const handleSectionSettingsUpdate = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/featured-exams-section/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(sectionSettings),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Section settings updated successfully!");
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

  const fetchProviders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/providers/`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProviders(data.filter(p => p.is_active !== false));
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Fetch only featured courses
      const res = await fetch(`${API_BASE_URL}/api/courses/featured/`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Filter only active and featured courses
        const featuredCourses = data.filter(course => course.is_active !== false && course.is_featured !== false);
        setCourses(featuredCourses);
      }
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      setMessage("❌ Error fetching featured courses: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFeatured = async (courseId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          is_featured: !currentStatus
        }),
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        setMessage(`✅ Course ${!currentStatus ? 'added to' : 'removed from'} featured exams!`);
        fetchCourses();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to update"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };
  
  const handleManageCourses = () => {
    window.location.href = "/admin/categories";
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    const { name, provider, category } = newCourse;
    if (!name) {
      setMessage("❌ Please enter course name");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!provider) {
      setMessage("❌ Please select a provider");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!category) {
      setMessage("❌ Please select a category");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/create/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          provider: provider,
          title: name,
          code: newCourse.code || slug.toUpperCase().substring(0, 10),
          slug: slug,
          category: category,
          short_description: newCourse.description || "",
          badge: newCourse.badge || "",
          is_featured: true, // Automatically mark as featured
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");

      setMessage(`✅ Course "${name}" added successfully and marked as featured!`);
      setShowAddModal(false);
      setNewCourse({
        name: "",
        description: "",
        code: "",
        provider: "",
        category: "",
        badge: "",
      });
      fetchCourses();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : "An unexpected error occurred"}`);
      setTimeout(() => setMessage(""), 5000);
    }
  };
  
  const handleDelete = async (courseId, courseTitle) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?\n\nThis will permanently remove the course from the system. This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(courseId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        setMessage(`✅ Course "${courseTitle}" deleted successfully!`);
        fetchCourses();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to delete course"));
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setDeletingId(null);
    }
  };
  
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Featured Exams Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">
            Courses with "Featured" status shown on home page. Mark courses as featured in "Categories" section to add them here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open("/", "_blank")}
            variant="outline"
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Home
          </Button>
          <Button 
            className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add Exam
          </Button>
          <Button 
            className="gap-2 bg-gray-600 hover:bg-gray-700" 
            onClick={handleManageCourses}
          >
            Manage Courses
          </Button>
        </div>
      </div>
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-6 ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Section Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#1A73E8]" />
              <CardTitle>Section Settings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={sectionSettings.heading}
                onChange={(e) => setSectionSettings({...sectionSettings, heading: e.target.value})}
                placeholder="Featured Certification Exams"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Explore our most popular certification exams"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSectionSettingsUpdate} 
            disabled={loading}
            className="bg-[#1A73E8] hover:bg-[#1557B0]"
          >
            {loading ? "Saving..." : "Save Section Settings"}
          </Button>
        </CardContent>
      </Card>
      
      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Featured Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead className="text-center">Practice/Questions</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      Loading featured courses...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Award className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">No featured courses found</p>
                        <p className="text-sm text-gray-500">Mark courses as featured in "Categories" section to add them here.</p>
                        <Button onClick={handleManageCourses} className="mt-2">
                          Go to Categories Section
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => {
                    return (
                      <TableRow key={course.id || course._id}>
                        <TableCell className="font-medium">{course.provider || "N/A"}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="line-clamp-2">{course.title || "Untitled"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{course.code || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          {course.badge ? (
                            <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-none">
                              {course.badge}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div>{course.practice_exams || 0} exams</div>
                            <div className="text-gray-500">{course.questions || 0} questions</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`featured-${course.id || course._id}`}
                              checked={course.is_featured !== false}
                              onCheckedChange={() => toggleFeatured(course.id || course._id, course.is_featured)}
                            />
                            <label
                              htmlFor={`featured-${course.id || course._id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {course.is_featured !== false ? "Featured" : "Not Featured"}
                            </label>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Navigate to the category's courses page if category exists
                                const categorySlug = course.category_slug || course.category;
                                if (categorySlug) {
                                  window.location.href = `/admin/categories/${categorySlug}/courses`;
                                } else {
                                  // Fallback to categories page if no category
                                  window.location.href = "/admin/categories";
                                }
                              }}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(course.id || course._id, course.title || "Untitled")}
                              disabled={deletingId === (course.id || course._id)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {deletingId === (course.id || course._id) ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Home Page Preview */}
      {courses.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Home Page Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-center mb-3 text-[#0C1A35]">
                {sectionSettings.heading || "Featured Certification Exams"}
              </h2>
              <p className="text-center text-[#0C1A35]/70 text-lg mb-8 max-w-2xl mx-auto">
                {sectionSettings.subtitle || "Explore our most popular certification exams"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF] bg-white"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                          <Award className="w-6 h-6 text-[#1A73E8]" />
                        </div>
                        {course.badge && (
                          <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-none">
                            {course.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-[#0C1A35]/60 mb-1">{course.provider}</p>
                        <h3 className="text-xl font-bold text-[#0C1A35] mb-1">{course.title}</h3>
                        <p className="text-sm text-[#0C1A35]/60">{course.code}</p>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm text-[#0C1A35]/60 mb-4">
                          {(() => {
                            // Use actual count from practice_tests_list if available
                            if (course.practice_tests_list && Array.isArray(course.practice_tests_list) && course.practice_tests_list.length > 0) {
                              return course.practice_tests_list.length;
                            }
                            return course.practice_exams || 0;
                          })()} Practice Exams · {(() => {
                            // Calculate total questions from practice tests list if available
                            if (course.practice_tests_list && Array.isArray(course.practice_tests_list) && course.practice_tests_list.length > 0) {
                              const totalQuestions = course.practice_tests_list.reduce((sum, test) => {
                                const testQuestions = parseInt(test.questions) || 0;
                                return sum + testQuestions;
                              }, 0);
                              return totalQuestions > 0 ? totalQuestions : (course.questions || 0);
                            }
                            return course.questions || 0;
                          })()} Questions
                        </p>
                        <Button className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]">
                          Start Practicing
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {courses.length > 6 && (
                <p className="text-center text-sm text-gray-500 mt-6">
                  + {courses.length - 6} more courses
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Live preview showing first 6 courses as they appear on home page with carousel
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-[#0C1A35]">Add New Exam</CardTitle>
                  <p className="text-sm text-[#0C1A35]/60 mt-1">Fill in the exam details below. The exam will be automatically marked as featured.</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddExam} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">Exam Details</h3>
                  
                  <div>
                    <Label htmlFor="name">Exam Name *</Label>
                    <Input
                      id="name"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      placeholder="e.g., AWS Solutions Architect Associate"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="provider">Provider *</Label>
                      <select
                        id="provider"
                        value={newCourse.provider}
                        onChange={(e) => setNewCourse({ ...newCourse, provider: e.target.value })}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                      >
                        <option value="">Select Provider</option>
                        {providers.map((provider) => (
                          <option key={provider.id || provider._id} value={provider.id || provider._id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.slug || category.id} value={category.slug || category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="code">Exam Code</Label>
                    <Input
                      id="code"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      placeholder="e.g., SAA-C03 (auto-generated if empty)"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="Brief description of the exam"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={newCourse.badge}
                      onChange={(e) => setNewCourse({ ...newCourse, badge: e.target.value })}
                      placeholder="e.g., New, Updated, Popular, Best Seller"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional badge text to display on the exam card (e.g., "New", "Updated this week", "Best Seller")
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exam
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewCourse({
                        name: "",
                        description: "",
                        code: "",
                        provider: "",
                        category: "",
                        badge: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

