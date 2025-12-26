"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiTrash2, FiEdit } from "react-icons/fi";
import { Cloud, Shield, Briefcase, Database, Code, TrendingUp, Eye } from "lucide-react";

const ICON_OPTIONS = [
  "Cloud",
  "Shield",
  "Briefcase",
  "Database",
  "Code",
  "TrendingUp",
];

const ICON_MAP = {
  Cloud,
  Shield,
  Briefcase,
  Database,
  Code,
  TrendingUp,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [categoryData, setCategoryData] = useState({
    title: "",
    description: "",
    icon: ICON_OPTIONS[0],
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });
  const [editSlug, setEditSlug] = useState(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const BASE_URL = `${API_BASE_URL}/api/categories`;

  // Fetch categories and course counts
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/`);
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response format");
        
        // Fetch course counts for each category
        const categoriesWithCounts = await Promise.all(
          data.map(async (c) => {
            const slug = c.slug || (c.id || c._id ? String(c.id || c._id) : "");
            let courseCount = 0;
            
            try {
              const coursesRes = await fetch(`${API_BASE_URL}/api/courses/category/${slug}/`);
              if (coursesRes.ok) {
                const courses = await coursesRes.json();
                courseCount = Array.isArray(courses) ? courses.length : 0;
              }
            } catch (err) {
              console.error(`Error fetching courses for ${slug}:`, err);
            }
            
            return {
          title: c.title || c.name || "",
          description: c.description || "",
          icon: c.icon || ICON_OPTIONS[0],
              slug: slug,
          meta_title: c.meta_title || "",
          meta_keywords: c.meta_keywords || "",
          meta_description: c.meta_description || "",
              courseCount: courseCount,
            };
          })
        );
        
        if (mounted) {
          setCategories(categoriesWithCounts);
          setFilteredCategories(categoriesWithCounts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, [BASE_URL, API_BASE_URL]);

  // Search - searches in title, description, and slug
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }
    const query = searchTerm.toLowerCase();
    const filtered = categories.filter((cat) => {
      const title = (cat.title || "").toLowerCase();
      const description = (cat.description || "").toLowerCase();
      const slug = (cat.slug || "").toLowerCase();
      return title.includes(query) || description.includes(query) || slug.includes(query);
    });
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  // Save (create or update)
  const handleSaveCategory = async () => {
    if (!categoryData.title.trim()) {
      alert("Please enter a category title");
      return;
    }

    const url = editMode
      ? `${BASE_URL}/${encodeURIComponent(editSlug)}/update/`
      : `${BASE_URL}/create/`;
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: categoryData.title,
          description: categoryData.description,
          icon: categoryData.icon,
          meta_title: categoryData.meta_title,
          meta_keywords: categoryData.meta_keywords,
          meta_description: categoryData.meta_description,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to save category: ${res.status} - ${errText}`);
      }

      const saved = await res.json();

      // backend returns saved object with slug
      const normalized = {
        title: saved.title || categoryData.title,
        description: saved.description || categoryData.description,
        icon: saved.icon || categoryData.icon,
        slug: saved.slug || saved.id || "",
        meta_title: saved.meta_title || categoryData.meta_title,
        meta_keywords: saved.meta_keywords || categoryData.meta_keywords,
        meta_description: saved.meta_description || categoryData.meta_description,
      };

      if (editMode) {
        setCategories((prev) => prev.map((p) => (p.slug === editSlug ? normalized : p)));
        setFilteredCategories((prev) => prev.map((p) => (p.slug === editSlug ? normalized : p)));
        alert("✅ Category updated successfully!");
      } else {
        setCategories((prev) => [...prev, normalized]);
        setFilteredCategories((prev) => [...prev, normalized]);
        alert("✅ Category added successfully!");
      }

      setShowModal(false);
      setEditMode(false);
      setEditSlug(null);
      setCategoryData({
        title: "",
        description: "",
        icon: ICON_OPTIONS[0],
        meta_title: "",
        meta_keywords: "",
        meta_description: "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`❌ ${message}`);
    }
  };

  // Delete single category by slug
  const handleDeleteCategory = async (slug) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${encodeURIComponent(slug)}/delete/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to delete: ${res.status} - ${errText}`);
      }
      setCategories((prev) => prev.filter((c) => c.slug !== slug));
      setFilteredCategories((prev) => prev.filter((c) => c.slug !== slug));
      alert("✅ Category deleted successfully!");
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  // Edit
  const handleEditCategory = (cat) => {
    setCategoryData({
      title: cat.title || "",
      description: cat.description || "",
      icon: cat.icon || ICON_OPTIONS[0],
      meta_title: cat.meta_title || "",
      meta_keywords: cat.meta_keywords || "",
      meta_description: cat.meta_description || "",
    });
    setEditSlug(cat.slug);
    setEditMode(true);
    setShowModal(true);
  };

  // Select for bulk
  const handleSelect = (slug) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // Bulk delete (calls delete per slug)
  const handleBulkDelete = async () => {
    if (selectedSlugs.length === 0) {
      alert("Please select at least one category to delete.");
      return;
    }
    if (!confirm(`Delete ${selectedSlugs.length} selected categories?`)) return;

    try {
      for (const slug of selectedSlugs) {
        await fetch(`${BASE_URL}/${encodeURIComponent(slug)}/delete/`, { method: "DELETE" });
      }
      setCategories((prev) => prev.filter((c) => !selectedSlugs.includes(c.slug)));
      setFilteredCategories((prev) => prev.filter((c) => !selectedSlugs.includes(c.slug)));
      setSelectedSlugs([]);
      alert("✅ Selected categories deleted successfully!");
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-600">
        Loading categories...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-600 text-lg">
        {String(error)}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Manage Categories
        </motion.h2>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Input
            placeholder="🔍 Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-indigo-200 px-4 py-2"
          />

          <div className="flex gap-3">
            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setEditMode(false);
                setCategoryData({
                  title: "",
                  description: "",
                  icon: ICON_OPTIONS[0],
                  meta_title: "",
                  meta_keywords: "",
                  meta_description: "",
                });
                setEditSlug(null);
                setShowModal(true);
              }}
            >
              <FiPlus /> Add Category
            </Button>

            {selectedSlugs.length > 0 && (
              <Button
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleBulkDelete}
              >
                <FiTrash2 /> Delete Selected ({selectedSlugs.length})
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, idx) => {
            const IconComp = ICON_MAP[cat.icon] || Cloud;
            return (
              <motion.div key={cat.slug || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card className="rounded-2xl border hover:shadow-2xl transition overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <IconComp className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-indigo-700">{cat.title}</h3>
                          <p className="text-sm text-gray-600">{cat.description || "No description."}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              cat.courseCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {cat.courseCount > 0 ? `${cat.courseCount} Exam${cat.courseCount !== 1 ? 's' : ''}` : 'No Exams'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <input type="checkbox" checked={selectedSlugs.includes(cat.slug)} onChange={() => handleSelect(cat.slug)} />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => router.push(`/admin/categories/${cat.slug}/courses`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Eye className="w-4 h-4 mr-1" /> View Courses
                      </Button>
                      <Button onClick={() => handleEditCategory(cat)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"><FiEdit /> Edit</Button>
                      <Button onClick={() => handleDeleteCategory(cat.slug)} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Delete</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl relative">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <button 
                className="absolute top-4 right-4 text-white/80 hover:text-white transition" 
                onClick={() => setShowModal(false)}
              >
                <FiX size={24} />
              </button>
              <h3 className="text-3xl font-bold">{editMode ? "Edit Category" : "Add New Category"}</h3>
              <p className="text-white/80 mt-1">Fill in the details below to {editMode ? "update" : "create"} a category</p>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b-2 border-indigo-100">
                  📝 Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Title *
                    </label>
                    <Input 
                      value={categoryData.title} 
                      onChange={(e) => setCategoryData({ ...categoryData, title: e.target.value })} 
                      placeholder="e.g., Cloud Certifications, IT Security"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be displayed as the main category name</p>
              </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea 
                      value={categoryData.description} 
                      onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      rows={4}
                      placeholder="Describe what this category includes..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Brief description of the category</p>
              </div>

              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Icon
                    </label>
                    <select 
                      value={categoryData.icon} 
                      onChange={(e) => setCategoryData({ ...categoryData, icon: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                    >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                    <p className="text-xs text-gray-500 mt-1">Visual icon for the category</p>
                  </div>
                </div>
              </div>

              {/* SEO Meta Tags Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b-2 border-indigo-100">
                  🔍 SEO Meta Tags
                </h4>
                <p className="text-sm text-gray-600">Optimize for search engines and social media</p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <Input 
                      value={categoryData.meta_title} 
                      onChange={(e) => setCategoryData({ ...categoryData, meta_title: e.target.value })} 
                      placeholder="Category Name - Best Practice Tests | AllExamQuestions"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Keywords
                    </label>
                    <Input 
                      value={categoryData.meta_keywords} 
                      onChange={(e) => setCategoryData({ ...categoryData, meta_keywords: e.target.value })} 
                      placeholder="cloud, certification, aws, azure, practice tests"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea 
                      value={categoryData.meta_description} 
                      onChange={(e) => setCategoryData({ ...categoryData, meta_description: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      rows={3}
                      placeholder="Concise description for search results (150-160 characters)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryData.meta_description.length}/160 characters recommended
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <Button 
                  onClick={handleSaveCategory} 
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition"
                >
                  {editMode ? "✓ Update Category" : "+ Add Category"}
                </Button>
                <Button 
                  onClick={() => { setShowModal(false); setEditMode(false); }} 
                  className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 text-base transition"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
