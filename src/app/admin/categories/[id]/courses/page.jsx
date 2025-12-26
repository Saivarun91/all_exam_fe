"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Eye, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function AdminCategoryCoursesPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [providers, setProviders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    code: "",
    provider: "",
    price: 0,
    offer_price: null,
    badge: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // ✅ Fetch category, providers, and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category details
        const catRes = await fetch(`${API_BASE_URL}/api/categories/${id}/`);
        if (!catRes.ok) throw new Error("Category not found");
        const catData = await catRes.json();
        setCategoryName(catData.title || catData.name || "Category");
        setCategorySlug(catData.slug || id);

        // Fetch all providers for dropdown
        const providersRes = await fetch(`${API_BASE_URL}/api/providers/`);
        if (providersRes.ok) {
          const providersData = await providersRes.json();
          setProviders(Array.isArray(providersData) ? providersData.filter(p => p.is_active !== false) : []);
        }

        // Fetch courses in this category
        const coursesRes = await fetch(`${API_BASE_URL}/api/courses/category/${id}/`);
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesRes.json();
        // Map backend fields (title, short_description) to frontend fields (name, description)
        const mappedCourses = coursesData.map((course) => ({
          ...course,
          name: course.title || course.name,
          description: course.short_description || course.description,
        }));
        setCourses(mappedCourses);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_BASE_URL]);

  // ✅ Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const { name, description, provider, price, offer_price } = newCourse;
    if (!name) {
      alert("Please enter course name");
      return;
    }
    if (!provider) {
      alert("Please select a provider");
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
          provider: provider,  // Use selected provider ID
          title: name,  // Backend expects 'title' not 'name'
          code: newCourse.code || slug.toUpperCase().substring(0, 10),  // Generate code if not provided
          slug: slug,
          category: categorySlug || id,  // Category slug or ID
          short_description: description || "",  // Backend expects 'short_description'
          badge: newCourse.badge || "",
          actual_price: price || 0,
          offer_price: offer_price || 0,
          meta_title: newCourse.meta_title || "",
          meta_keywords: newCourse.meta_keywords || "",
          meta_description: newCourse.meta_description || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");

      // Backend returns {success: true, data: {...}}
      const newCourseData = data.data || data;
      // Map backend fields to frontend display fields
      const mappedCourse = {
        ...newCourseData,
        name: newCourseData.title || newCourseData.name,
        description: newCourseData.short_description || newCourseData.description,
      };
      setCourses((prev) => [...prev, mappedCourse]);
      setShowAddModal(false);
      setProviderDropdownOpen(false);
      setNewCourse({ name: "", description: "", code: "", provider: "", price: 0, offer_price: null, badge: "", meta_title: "", meta_keywords: "", meta_description: "" });
      setMessage("✅ Course added successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : "An unexpected error occurred"}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ✅ Edit modal open
  const handleEditClick = (course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  // ✅ Save edited course
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${editingCourse.id}/update/`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: editingCourse.name || editingCourse.title,  // Backend expects 'title'
          code: editingCourse.code || "",
          short_description: editingCourse.description || editingCourse.short_description || "",  // Backend expects 'short_description'
          badge: editingCourse.badge || "",
          actual_price: editingCourse.price || editingCourse.actual_price || 0,
          offer_price: editingCourse.offer_price || 0,
          meta_title: editingCourse.meta_title || "",
          meta_keywords: editingCourse.meta_keywords || "",
          meta_description: editingCourse.meta_description || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update course");

      // Backend returns {success: true, message: "..."}
      // Fetch updated course or use existing data
      const updatedCourse = {
        ...editingCourse,
        name: editingCourse.name || editingCourse.title,
        description: editingCourse.description || editingCourse.short_description,
      };
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updatedCourse : c)));
      setShowEditModal(false);
      setEditingCourse(null);
      setMessage("✅ Course updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : "An unexpected error occurred"}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ✅ Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete course");

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setMessage("🗑️ Course deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : "An unexpected error occurred"}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ✅ Filter courses by search (searches in name, code, and description)
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (course.name || course.title || "").toLowerCase();
    const code = (course.code || "").toLowerCase();
    const description = (course.description || course.short_description || "").toLowerCase();
    return name.includes(query) || code.includes(query) || description.includes(query);
  });

  if (loading) return <p className="text-center py-20">Loading courses...</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-16">
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes("Error") || message.includes("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-3xl font-bold">Courses in {categoryName}</h2>
      </div>

      {/* Search and Add Button */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => setShowAddModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Course
        </Button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{course.name}</CardTitle>
                {course.code && (
                  <Badge className="bg-blue-100 text-blue-800 font-semibold">
                    {course.code}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {course.description || "No description"}
              </p>
              
              {/* Price Display */}
              {((course.price !== undefined && course.price !== null) || course.offer_price) && (
                <div className="mb-4 pb-4 border-b">
                  {course.offer_price ? (
                    <div>
                      <div className="text-sm text-gray-400 line-through">
                        ₹{course.price?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{course.offer_price.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-green-600">
                      ₹{course.price?.toFixed(2) || "0.00"}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => router.push(`/admin/courses/${course.id}/tests`)}
                >
                  <Eye className="h-4 w-4 mr-1" /> View Practice Tests
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(course)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <p className="text-center py-20 text-gray-500">No courses found</p>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
              <CardTitle className="text-2xl text-[#0C1A35]">Add New Course</CardTitle>
              <p className="text-sm text-[#0C1A35]/60 mt-1">Fill in the course details below</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddCourse} className="space-y-6">
                {/* Course Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">Course Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Course Name *</Label>
                      <Input
                        id="name"
                        value={newCourse.name}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, name: e.target.value })
                        }
                        placeholder="AWS Solutions Architect Associate"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="code">Course Code <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Input
                        id="code"
                        value={newCourse.code}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, code: e.target.value })
                        }
                        placeholder="e.g., SAA-C03, AZ-104"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        value={categoryName}
                        readOnly
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Category is pre-selected based on current page</p>
                    </div>

                    <div>
                      <Label htmlFor="provider">Provider *</Label>
                      <Popover open={providerDropdownOpen} onOpenChange={setProviderDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={providerDropdownOpen}
                            className="w-full justify-between mt-1"
                          >
                            {newCourse.provider
                              ? providers.find((provider) => provider.id === newCourse.provider)?.name
                              : "Select a provider..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search provider..." />
                            <CommandList>
                              <CommandEmpty>No provider found.</CommandEmpty>
                              <CommandGroup>
                                {providers.map((provider) => (
                                  <CommandItem
                                    key={provider.id}
                                    value={provider.name}
                                    onSelect={() => {
                                      setNewCourse({ ...newCourse, provider: provider.id });
                                      setProviderDropdownOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        newCourse.provider === provider.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {provider.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 mt-1">Search and select the certification provider</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCourse.description}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, description: e.target.value })
                      }
                      placeholder="Enter a detailed course description..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={newCourse.badge}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, badge: e.target.value })
                      }
                      placeholder="e.g., New, Updated, Popular, Best Seller"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional badge text to display on the course card (e.g., "New", "Updated this week", "Best Seller")
                    </p>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">Pricing</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                <div>
                      <Label htmlFor="price">Regular Price (₹) *</Label>
                  <Input
                        id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCourse.price || 0}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })
                    }
                        placeholder="999.00"
                    required
                        className="mt-1"
                  />
                      <p className="text-xs text-gray-500 mt-1">Base price for the course</p>
                </div>
                    
                <div>
                      <Label htmlFor="offer_price">Offer Price (₹) <span className="text-gray-500 text-sm">(Optional)</span></Label>
                  <Input
                        id="offer_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCourse.offer_price || ""}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, offer_price: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    placeholder="Leave empty if no offer"
                        className="mt-1"
                  />
                      <p className="text-xs text-gray-500 mt-1">Discounted price (if applicable)</p>
                    </div>
                  </div>
                </div>

                {/* SEO Meta Tags Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">SEO Meta Tags</h3>
                  <p className="text-sm text-gray-500">Optimize for search engines</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={newCourse.meta_title}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, meta_title: e.target.value })
                        }
                        placeholder="Course Name - Certification Prep | AllExamQuestions"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_keywords">Meta Keywords</Label>
                      <Input
                        id="meta_keywords"
                        value={newCourse.meta_keywords}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, meta_keywords: e.target.value })
                        }
                        placeholder="course, exam, certification, practice test"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={newCourse.meta_description}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, meta_description: e.target.value })
                        }
                        placeholder="Brief description for search results (150-160 characters)"
                        rows={3}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newCourse.meta_description.length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Course"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setProviderDropdownOpen(false);
                      setNewCourse({ name: "", description: "", code: "", provider: "", price: 0, offer_price: null, badge: "", meta_title: "", meta_keywords: "", meta_description: "" });
                    }}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
              <CardTitle className="text-2xl text-[#0C1A35]">Edit Course</CardTitle>
              <p className="text-sm text-[#0C1A35]/60 mt-1">Update course information</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveEdit} className="space-y-6">
                {/* Course Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">Course Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                <div>
                      <Label htmlFor="edit_name">Course Name *</Label>
                  <Input
                        id="edit_name"
                    value={editingCourse.name}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, name: e.target.value })
                    }
                    placeholder="Enter course name"
                    required
                        className="mt-1"
                  />
                </div>
                    
                <div>
                      <Label htmlFor="edit_code">Course Code <span className="text-gray-500 text-sm">(Optional)</span></Label>
                  <Input
                        id="edit_code"
                    value={editingCourse.code || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, code: e.target.value })
                    }
                        placeholder="e.g., SAA-C03, AZ-104"
                        className="mt-1"
                  />
                </div>
                  </div>

                <div>
                    <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                      id="edit_description"
                    value={editingCourse.description || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, description: e.target.value })
                    }
                    placeholder="Enter course description"
                      rows={4}
                      className="mt-1"
                  />
                  </div>

                  <div>
                    <Label htmlFor="edit_badge">Badge</Label>
                    <Input
                      id="edit_badge"
                      value={editingCourse.badge || ""}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, badge: e.target.value })
                      }
                      placeholder="e.g., New, Updated, Popular, Best Seller"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional badge text to display on the course card (e.g., "New", "Updated this week", "Best Seller")
                    </p>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">Pricing</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                <div>
                      <Label htmlFor="edit_price">Regular Price (₹) *</Label>
                  <Input
                        id="edit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingCourse.price || 0}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) || 0 })
                    }
                        placeholder="999.00"
                    required
                        className="mt-1"
                  />
                      <p className="text-xs text-gray-500 mt-1">Base price for the course</p>
                </div>
                    
                <div>
                      <Label htmlFor="edit_offer_price">Offer Price (₹) <span className="text-gray-500 text-sm">(Optional)</span></Label>
                  <Input
                        id="edit_offer_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingCourse.offer_price || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, offer_price: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    placeholder="Leave empty if no offer"
                        className="mt-1"
                  />
                      <p className="text-xs text-gray-500 mt-1">Discounted price (if applicable)</p>
                    </div>
                  </div>
                </div>

                {/* SEO Meta Tags Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">SEO Meta Tags</h3>
                  <p className="text-sm text-gray-500">Optimize for search engines</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit_meta_title">Meta Title</Label>
                      <Input
                        id="edit_meta_title"
                        value={editingCourse.meta_title || ""}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, meta_title: e.target.value })
                        }
                        placeholder="Course Name - Certification Prep | AllExamQuestions"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit_meta_keywords">Meta Keywords</Label>
                      <Input
                        id="edit_meta_keywords"
                        value={editingCourse.meta_keywords || ""}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, meta_keywords: e.target.value })
                        }
                        placeholder="course, exam, certification, practice test"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit_meta_description">Meta Description</Label>
                      <Textarea
                        id="edit_meta_description"
                        value={editingCourse.meta_description || ""}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, meta_description: e.target.value })
                        }
                        placeholder="Brief description for search results (150-160 characters)"
                        rows={3}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingCourse.meta_description || "").length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCourse(null);
                    }}
                    className="px-6"
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

