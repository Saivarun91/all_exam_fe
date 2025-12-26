"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    category_ref_id: "",
    course_ref_id: "",
    author: "",
    date: "",
    readTime: "",
    image_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const API_BASE = `${API_BASE_URL}/api/blogs/`;

  // Cloudinary
  const CLOUD_NAME = "dhy0krkef";
  const UPLOAD_PRESET = "preptara";

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const res = await axios.get(API_BASE);
      if (res.data.success) {
        const courseBlogs = res.data.blogs.filter(
          (blog) => blog.course_ref && blog.course_ref.id
        );
        setBlogs(courseBlogs);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses/`);
      if (Array.isArray(res.data)) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCourses();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cloudinary Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading image...");

    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: imageData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, image_url: data.secure_url }));
        setMessage("✅ Image uploaded successfully!");
      } else {
        setMessage("❌ Image upload failed!");
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setMessage("❌ Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_ref_id) {
      setMessage("❌ Please select a Course for this blog");
      return;
    }

    const submitData = { ...formData, category_ref_id: "" };

    setLoading(true);
    setMessage("");

    try {
      if (editingId) {
        const res = await axios.put(`${API_BASE}${editingId}/update/`, submitData);
        if (res.data.success) {
          setMessage("✅ Blog updated successfully!");
          setEditingId(null);
        }
      } else {
        const res = await axios.post(`${API_BASE}create/`, submitData);
        if (res.data.success) {
          setMessage("✅ Blog created successfully!");
        }
      }

      setFormData({
        title: "",
        excerpt: "",
        category: "",
        category_ref_id: "",
        course_ref_id: "",
        author: "",
        date: "",
        readTime: "",
        image_url: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
      });

      fetchBlogs();
    } catch (err) {
      console.error("Error submitting blog:", err);
      setMessage("❌ Error submitting blog");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      category: blog.category || "",
      category_ref_id: blog.category_ref?.id || "",
      course_ref_id: blog.course_ref?.id || "",
      author: blog.author,
      date: blog.date,
      readTime: blog.readTime,
      image_url: blog.image_url || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
      meta_keywords: blog.meta_keywords || "",
    });
    setEditingId(blog.id);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await axios.delete(`${API_BASE}${id}/delete/`);
      if (res.data.success) {
        setMessage("🗑️ Blog deleted successfully!");
        fetchBlogs();
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  // Reset
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      excerpt: "",
      category: "",
      category_ref_id: "",
      course_ref_id: "",
      author: "",
      date: "",
      readTime: "",
      image_url: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-2 text-center">📝 Admin Blog Management</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Create and manage blogs for courses
      </p>

      {message && <p className="text-center text-green-600 mb-4">{message}</p>}

      {/* Blog Form */}
      <Card className="max-w-2xl mx-auto mb-10 shadow-md">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 p-4">
            <Input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />

            <Textarea name="excerpt" placeholder="Excerpt" value={formData.excerpt} onChange={handleChange} required />

            {/* Course Select */}
            <div className="space-y-2">
              <Label>Select Course *</Label>
              <Select
                value={formData.course_ref_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, course_ref_id: value, category_ref_id: "" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Course --" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input name="author" placeholder="Author" value={formData.author} onChange={handleChange} required />

            <Input name="date" type="date" value={formData.date} onChange={handleChange} required />

            <Input name="readTime" placeholder="Read Time (e.g., 5 min)" value={formData.readTime} onChange={handleChange} />

            <Input name="meta_title" placeholder="Meta Title" value={formData.meta_title} onChange={handleChange} />

            <Textarea
              name="meta_description"
              placeholder="Meta Description"
              value={formData.meta_description}
              onChange={handleChange}
            />

            <Input
              name="meta_keywords"
              placeholder="Meta Keywords (comma separated)"
              value={formData.meta_keywords}
              onChange={handleChange}
            />

            {/* Image Upload */}
            <div>
              <label className="block mb-1 font-medium">Upload Blog Image</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
              {formData.image_url && (
                <div className="mt-2 w-full aspect-[16/9] rounded-md overflow-hidden bg-gray-100">
                  <img 
                    src={getOptimizedImageUrl(formData.image_url, 600, 338)} 
                    alt="Blog image preview"
                    width={600}
                    height={338}
                    className="w-full h-full object-contain"
                    style={{ objectFit: 'contain' }}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 600px"
                    decoding="async"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button type="submit" disabled={loading || uploading}>
                {loading ? "Saving..." : editingId ? "Update Blog" : "Create Blog"}
              </Button>

              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Blog List */}
      <h2 className="text-2xl font-semibold mb-4 text-center">📚 All Blogs</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {blogs.length === 0 ? (
          <p className="text-center text-gray-500 w-full">No blogs found.</p>
        ) : (
          blogs.map((blog) => (
            <Card key={blog.id} className="shadow-md">
              <CardContent className="p-4">
                {blog.image_url ? (
                  <div className="w-full aspect-[16/9] rounded-md overflow-hidden mb-3 bg-gray-100">
                    <img 
                      src={getOptimizedImageUrl(blog.image_url, 600, 338)} 
                      alt={blog.title || "Blog image"}
                      width={600}
                      height={338}
                      className="w-full h-full object-contain"
                      style={{ objectFit: 'contain' }}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 600px"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center rounded-md mb-3 text-gray-500">
                    No Image Available
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                <p className="text-gray-600 mb-2">{blog.excerpt}</p>

                <div className="text-sm text-gray-500 mb-2">
                  {blog.course_ref && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded mr-2">
                      Course: {blog.course_ref.name}
                    </span>
                  )}
                  <span>{blog.readTime} • By {blog.author}</span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Meta Title: {blog.meta_title || "-"} <br />
                  Meta Description: {blog.meta_description || "-"} <br />
                  Meta Keywords: {blog.meta_keywords || "-"}
                </p>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleEdit(blog)}>✏️ Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(blog.id)}>🗑️ Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
