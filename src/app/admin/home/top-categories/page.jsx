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
import { Plus, Edit, Eye, Cloud, Shield, Briefcase, Database, Code, TrendingUp, Trash2, X, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const ICON_MAP = {
  Cloud,
  Shield,
  Briefcase,
  Database,
  Code,
  TrendingUp,
};

const ICON_OPTIONS = [
  "Cloud",
  "Shield",
  "Briefcase",
  "Database",
  "Code",
  "TrendingUp",
];

export default function TopCategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryData, setCategoryData] = useState({
    title: "",
    description: "",
    icon: ICON_OPTIONS[0],
  });
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Top Certification Categories",
    subtitle: "Browse exams by category",
  });
  
  useEffect(() => {
    fetchCategories();
    fetchSectionSettings();
  }, []);
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/top-categories-section/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/home/admin/top-categories-section/`, {
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
  
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage("❌ Error fetching categories: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to Categories section for management
  const handleManageCategories = () => {
    window.location.href = "/admin/categories";
  };
  
  const handleDelete = async (slug, title) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently remove the category from the system. All courses in this category will lose their category association. This action cannot be undone.`)) {
      return;
    }
    
    setDeletingSlug(slug);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${slug}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });
      
      const data = await res.json();
      
      if (data.message || res.ok) {
        setMessage(`✅ Category "${title}" deleted successfully!`);
        fetchCategories();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to delete category"));
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryData.title.trim()) {
      setMessage("❌ Please enter a category title");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: categoryData.title,
          description: categoryData.description,
          icon: categoryData.icon,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Category "${categoryData.title}" added successfully!`);
        setShowAddModal(false);
        setCategoryData({
          title: "",
          description: "",
          icon: ICON_OPTIONS[0],
        });
        fetchCategories();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to create category"));
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
      setTimeout(() => setMessage(""), 5000);
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Top Categories Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">
            Categories shown on home page. All categories added in "Categories" section automatically appear here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open("/", "_blank")}
            variant="outline"
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button 
            className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
          <Button 
            className="gap-2 bg-gray-600 hover:bg-gray-700" 
            onClick={handleManageCategories}
          >
            Manage Categories
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
                placeholder="Top Certification Categories"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Browse exams by category"
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
      
      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium">No categories found</p>
                        <p className="text-sm">Go to "Categories" section to add categories. They will automatically appear here.</p>
                        <Button onClick={handleManageCategories} className="mt-2">
                          Go to Categories Section
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => {
                    const IconComp = ICON_MAP[category.icon] || Cloud;
                    
                    return (
                      <TableRow key={category.slug}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                            <IconComp className="w-5 h-5 text-[#1A73E8]" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{category.title}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = "/admin/categories"}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit in Categories
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(category.slug, category.title)}
                              disabled={deletingSlug === category.slug}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {deletingSlug === category.slug ? "Deleting..." : "Delete"}
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
      
      {/* Preview Section */}
      {categories.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Home Page Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#F5F8FC] p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-center mb-3 text-[#0C1A35]">
                {sectionSettings.heading || "Top Certification Categories"}
              </h2>
              <p className="text-center text-[#0C1A35]/70 text-lg mb-8 max-w-2xl mx-auto">
                {sectionSettings.subtitle || "Browse exams by category"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.slice(0, 6).map((category) => {
                  const IconComp = ICON_MAP[category.icon] || Cloud;
                  return (
                    <Card
                      key={category.slug}
                      className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-[#DDE7FF] bg-white"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                          <IconComp className="w-6 h-6 text-[#1A73E8]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0C1A35]">
                          {category.title}
                        </h3>
                        <p className="text-[#0C1A35]/70 line-clamp-2">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {categories.length > 6 && (
                <p className="text-center text-sm text-gray-500 mt-6">
                  + {categories.length - 6} more categories
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Live preview of how categories appear on the home page (showing first 6)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-[#0C1A35]">Add New Category</CardTitle>
                  <p className="text-sm text-[#0C1A35]/60 mt-1">Fill in the category details below</p>
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
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0C1A35] pb-2 border-b">Category Details</h3>
                  
                  <div>
                    <Label htmlFor="title">Category Title *</Label>
                    <Input
                      id="title"
                      value={categoryData.title}
                      onChange={(e) => setCategoryData({ ...categoryData, title: e.target.value })}
                      placeholder="e.g., Cloud Certifications"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={categoryData.description}
                      onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                      placeholder="Brief description of the category"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <select
                      id="icon"
                      value={categoryData.icon}
                      onChange={(e) => setCategoryData({ ...categoryData, icon: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setCategoryData({
                        title: "",
                        description: "",
                        icon: ICON_OPTIONS[0],
                        meta_title: "",
                        meta_keywords: "",
                        meta_description: "",
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


