"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Award,
  FileText,
  Briefcase,
  GraduationCap,
  BookOpen,
  Trash2,
  Edit,
  PlusCircle,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Icon map
const Icons = {
  Award,
  FileText,
  Briefcase,
  GraduationCap,
  BookOpen,
};

export default function AdminTestsSection() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    icon: "Award",
    gradient: "from-blue-500 via-cyan-500 to-teal-600",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const BASE_URL = `${API_BASE_URL}/api/categories`;

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Unknown error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create or update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast({
        title: "Error ❌",
        description: "Name and description are required",
      });
      return;
    }

    const url = isEditing
      ? `${BASE_URL}/${formData.id}/update/`
      : `${BASE_URL}/create/`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        gradient: formData.gradient,
        meta_title: formData.meta_title || "",
        meta_keywords: formData.meta_keywords || "",
        meta_description: formData.meta_description || "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to save category: ${errText}`);
      }

      toast({
        title: isEditing ? "✅ Category Updated" : "✅ Category Created",
      });

      setFormData({
        id: "",
        name: "",
        description: "",
        icon: "Award",
        gradient: "from-blue-500 via-cyan-500 to-teal-600",
        meta_title: "",
        meta_keywords: "",
        meta_description: "",
      });
      setIsEditing(false);
      fetchCategories();
    } catch (err) {
      toast({
        title: "Error ❌",
        description: err.message || "An unexpected error occurred while saving.",
      });
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`${BASE_URL}/${id}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");

      toast({ title: "🗑️ Category deleted" });
      fetchCategories();
    } catch (err) {
      toast({
        title: "Error ❌",
        description: err.message || "An unexpected error occurred while deleting.",
      });
    }
  };

  // Edit category
  const handleEdit = (cat) => {
    setFormData({
      ...cat,
      meta_title: cat.meta_title || "",
      meta_keywords: cat.meta_keywords || "",
      meta_description: cat.meta_description || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      description: "",
      icon: "Award",
      gradient: "from-blue-500 via-cyan-500 to-teal-600",
      meta_title: "",
      meta_keywords: "",
      meta_description: "",
    });
  };

  // UI states
  if (loading)
    return <p className="text-center py-20 text-gray-600">Loading categories...</p>;
  if (error)
    return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <section className="py-10 px-6 md:px-16">
      {/* Back Button and Search Logs Link */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/home")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/search-logs")}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" /> View Search Logs
        </Button>
      </div>

      <motion.h2
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🧠 Manage Test Categories (Admin)
      </motion.h2>

      {/* Form */}
      <Card className="mb-10 max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
                required
              />
            </div>

            <div>
              <Label>Icon</Label>
              <Input
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="Award, FileText, Briefcase..."
                list="iconList"
              />
              <datalist id="iconList">
                {Object.keys(Icons).map((key) => (
                  <option key={key} value={key} />
                ))}
              </datalist>
            </div>

            <div>
              <Label>Gradient (Tailwind)</Label>
              <Input
                name="gradient"
                value={formData.gradient}
                onChange={handleChange}
                placeholder="from-blue-500 via-cyan-500 to-teal-600"
              />
            </div>

            {/* SEO Meta Tags */}
            <div className="border-t pt-6 mt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-2xl">🔍</span> SEO Meta Tags
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Meta Title
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      (Appears in search engine results)
                    </span>
                  </Label>
                  <Input
                    name="meta_title"
                    value={formData.meta_title || ""}
                    onChange={handleChange}
                    placeholder="e.g., Best Practice Tests for Competitive Exams"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Meta Keywords
                    <span className="text-xs font-normal text-gray-500 ml-2">(Comma-separated keywords)</span>
                  </Label>
                  <Input
                    name="meta_keywords"
                    value={formData.meta_keywords || ""}
                    onChange={handleChange}
                    placeholder="e.g., practice tests, competitive exams, mock tests"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Meta Description
                    <span className="text-xs font-normal text-gray-500 ml-2">(Brief description for search results)</span>
                  </Label>
                  <Textarea
                    name="meta_description"
                    value={formData.meta_description || ""}
                    onChange={handleChange}
                    placeholder="e.g., Access comprehensive practice tests for competitive exams..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                {isEditing ? (
                  <>Update Category <Edit className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Add Category <PlusCircle className="ml-2 h-4 w-4" /></>
                )}
              </Button>

              {isEditing && (
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List of Categories */}
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComp = Icons[cat.icon] || Award;
          return (
            <Card key={cat.id} className="group relative hover:shadow-lg border border-gray-200 rounded-2xl">
              <CardContent className="p-6 space-y-3">
                <div className={`p-3 inline-block bg-gradient-to-br ${cat.gradient || "from-blue-500 via-cyan-500 to-teal-600"} rounded-xl`}>
                  <IconComp className="h-6 w-6 text-white" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{cat.description}</p>

                <div className="flex flex-col gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => router.push(`/admin/categories/${cat.id}/courses`)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View Courses
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
