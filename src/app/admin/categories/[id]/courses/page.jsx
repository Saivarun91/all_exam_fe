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
import { Checkbox } from "@/components/ui/checkbox";
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


function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Course API returns provider name as `provider` and id as `provider_id`; dropdowns need id. */
function providerIdForAdminForm(course, providersList) {
  const rawId = course?.provider_id;
  if (rawId != null && String(rawId).trim() !== "") {
    return rawId;
  }
  const name = String(course?.provider || "").trim().toLowerCase();
  if (!name || !Array.isArray(providersList)) return "";
  const match = providersList.find(
    (p) => String(p.name || "").trim().toLowerCase() === name
  );
  return match?.id ?? "";
}
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
    slug: "",
    description: "",
    code: "",
    provider: "",
    badge: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    is_featured: false,
    show_in_official_details: false,

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
        let providersList = [];
        const providersRes = await fetch(`${API_BASE_URL}/api/providers/`);
        if (providersRes.ok) {
          const providersData = await providersRes.json();
          providersList = Array.isArray(providersData)
            ? providersData.filter((p) => p.is_active !== false)
            : [];
          setProviders(providersList);
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
          provider: providerIdForAdminForm(course, providersList),
          show_in_official_details:
            course.show_in_official_details === true ||
            course.show_in_official_details === "true",

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
    const { name, description, provider } = newCourse;
    if (!name) {
      alert("Please enter course name");
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
          provider: provider || null,
          title: name,  // Backend expects 'title' not 'name'
          code: newCourse.code || slug.toUpperCase().substring(0, 10),  // Generate code if not provided
          slug: slug,
          category: categorySlug || id,  // Category slug or ID
          short_description: description || "",  // Backend expects 'short_description'
          badge: newCourse.badge || "",
          actual_price: 0,
          offer_price: 0,
          meta_title: newCourse.meta_title || "",
          meta_keywords: newCourse.meta_keywords || "",
          meta_description: newCourse.meta_description || "",
          is_featured: !!newCourse.is_featured,
          show_in_official_details:!!newCourse.show_in_official_details,
          
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fieldError =
          data?.errors?.slug?.[0] ||
          data?.errors?.code?.[0] ||
          data?.errors?.title?.[0];
        throw new Error(
          data?.error || data?.message || fieldError || "Failed to create course"
        );
      }

      // Backend returns {success: true, data: {...}}
      const newCourseData = data.data || data;
      // Map backend fields to frontend display fields
      const mappedCourse = {
        ...newCourseData,
        name: newCourseData.title || newCourseData.name,
        description: newCourseData.short_description || newCourseData.description,
        provider: providerIdForAdminForm(newCourseData, providers),
      };
      setCourses((prev) => [...prev, mappedCourse]);
      setShowAddModal(false);
      setProviderDropdownOpen(false);
      setNewCourse({ name: "", slug: "", description: "", code: "", provider: "", badge: "", meta_title: "", meta_keywords: "", meta_description: "", is_featured: false, show_in_official_details: false });
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
          slug: editingCourse.slug,
          code: editingCourse.code || "",
          provider: editingCourse.provider || null,
          short_description: editingCourse.short_description || "",  // Backend expects 'short_description'
          badge: editingCourse.badge || "",
          actual_price: editingCourse.actual_price || 0,
          offer_price: editingCourse.offer_price || 0,
          meta_title: editingCourse.meta_title || "",
          meta_keywords: editingCourse.meta_keywords || "",
          meta_description: editingCourse.meta_description || "",
          is_featured: !!editingCourse.is_featured,
          show_in_official_details: !!editingCourse.show_in_official_details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fieldError =
          data?.errors?.slug?.[0] ||
          data?.errors?.code?.[0] ||
          data?.errors?.title?.[0];
        throw new Error(
          data?.error || data?.message || fieldError || "Failed to update course"
        );
      }

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

      {/* Courses Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">
                  Course Name
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">
                  Course Slug
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">
                  Exam Code
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-gray-500 text-sm"
                  >
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3 align-middle font-medium text-gray-900">
                      {course.name}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {course.slug}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {course.code ? (
                        <Badge className="bg-blue-100 text-blue-800 font-semibold">
                          {course.code}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                      {course.is_featured ? (
                        <Badge className="ml-2 bg-green-100 text-green-700 border-0">
                          Popular
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() =>
                            router.push(`/admin/courses/${course.id}/tests`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" /> Practice Tests
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(course)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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
                      <Label htmlFor="slug">Course Slug *</Label>
                      <Input
                        id="slug"
                        value={newCourse.slug}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, slug: e.target.value })
                        }
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
                      <Label htmlFor="provider">Provider (Optional)</Label>
                      <Popover open={providerDropdownOpen} onOpenChange={setProviderDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={providerDropdownOpen}
                            className="w-full justify-between mt-1"
                          >
                            {newCourse.provider
                              ? providers.find(
                                  (p) => String(p.id) === String(newCourse.provider)
                                )?.name
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
                                <CommandItem
                                  value="no provider"
                                  onSelect={() => {
                                    setNewCourse({ ...newCourse, provider: "" });
                                    setProviderDropdownOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      !newCourse.provider ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  No provider
                                </CommandItem>
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
                                        String(newCourse.provider) === String(provider.id)
                                          ? "opacity-100"
                                          : "opacity-0"
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
                      <p className="text-xs text-gray-500 mt-1">Search and select the certification provider (optional)</p>
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

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="is_featured"
                      checked={!!newCourse.is_featured}
                      onCheckedChange={(checked) =>
                        setNewCourse({
                          ...newCourse,
                          is_featured: checked === true,
                        })
                      }
                    />
                    <div>
                      <Label htmlFor="is_featured">Popular Exam (Featured)</Label>
                      <p className="text-xs text-gray-500">
                        If enabled, this exam will appear in the Home page Featured Exams and the
                        Exam sidebar Popular Exams.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="show_in_official_details"
                      checked={!!newCourse.show_in_official_details}
                      onCheckedChange={(checked) =>
                        setNewCourse({
                          ...newCourse,
                          show_in_official_details: checked === true,
                        })
                      }
                    />

                    <div>
                      <Label htmlFor="show_in_official_details">
                        Add To Official Details
                      </Label>

                      <p className="text-xs text-gray-500">
                        If enabled, this exam will appear in Official Details Manager.
                      </p>
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
                      setNewCourse({ name: "", slug: "", description: "", code: "", provider: "", badge: "", meta_title: "", meta_keywords: "", meta_description: "", is_featured: false , show_in_official_details: false });
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
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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
                      setEditingCourse({ ...editingCourse, name: e.target.value  })
                    }
                    placeholder="Enter course name"
                    required
                        className="mt-1"
                  />
                </div>
                <div>
                      <Label htmlFor="edit_slug">Course Slug *</Label>
                      <Input
                        id="edit_slug"
                        value={editingCourse.slug}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, slug: e.target.value })
                        }
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
                  <div className="grid grid-cols-2 gap-4">
                    <div></div>
                  </div>
                  <div>
                    <Label htmlFor="edit_provider">Provider (Optional)</Label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between mt-1"
                        >
                          {editingCourse.provider
                            ? providers.find(
                                (provider) =>
                                  String(provider.id) === String(editingCourse.provider)
                              )?.name || "Select provider..."
                            : "Select provider..."}

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search provider..." />

                          <CommandList>
                            <CommandEmpty>No provider found.</CommandEmpty>

                            <CommandGroup>
                              <CommandItem
                                value="no provider"
                                onSelect={() => {
                                  setEditingCourse({
                                    ...editingCourse,
                                    provider: "",
                                  });
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    !editingCourse.provider ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                No provider
                              </CommandItem>
                              {providers.map((provider) => (
                                <CommandItem
                                  key={provider.id}
                                  value={provider.name}
                                  onSelect={() => {
                                    setEditingCourse({
                                      ...editingCourse,
                                      provider: provider.id,
                                    });
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      String(editingCourse.provider) === String(provider.id)
                                        ? "opacity-100"
                                        : "opacity-0"
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

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="edit_is_featured"
                      checked={!!editingCourse.is_featured}
                      onCheckedChange={(checked) =>
                        setEditingCourse({
                          ...editingCourse,
                          is_featured: checked === true,
                        })
                      }
                    />
                    <div>
                      <Label htmlFor="edit_is_featured">Popular Exam (Featured)</Label>
                      <p className="text-xs text-gray-500">
                        Shows this exam in the Home page Featured Exams and the Exam sidebar Popular Exams.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="edit_show_in_official_details"
                      checked={!!editingCourse.show_in_official_details}
                      onCheckedChange={(checked) =>
                        setEditingCourse({
                          ...editingCourse,
                          show_in_official_details: checked === true,
                        })
                      }
                    />

                    <div>
                      <Label htmlFor="edit_show_in_official_details">
                        Add To Official Details
                      </Label>

                      <p className="text-xs text-gray-500">
                        If enabled, this exam will appear in Official Details Manager.
                      </p>
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

