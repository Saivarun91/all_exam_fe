// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Plus, Edit, Trash2, Eye, FileText, Image as ImageIcon, Settings, ArrowLeft } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { motion } from "framer-motion";
// import { getOptimizedImageUrl } from "@/utils/imageUtils";
// import TipTapEditor from "@/components/editor/TipTapEditor";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// export default function BlogPostsAdmin() {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [message, setMessage] = useState("");
  
//   const [formData, setFormData] = useState({
//     title: "",
//     excerpt: "",
//     content: "",
//     image_url: "",
//     thumbnail_url: "",
//     category: "",
//     reading_time: "5 min read",
//     slug: "",
//     is_featured: false,
//     is_active: true,
//   });
  
//   const [sectionSettings, setSectionSettings] = useState({
//     heading: "Latest Blog Posts",
//     subtitle: "Stay updated with certification tips and news",
//   });
  
//   useEffect(() => {
//     fetchPosts();
//     fetchSectionSettings();
//   }, []);
  
//   const fetchSectionSettings = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts-section/`, {
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         }
//       });
      
//       if (res.ok) {
//         const data = await res.json();
//         if (data.success && data.data) {
//           setSectionSettings(data.data);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching section settings:", error);
//     }
//   };
  
//   const handleSectionSettingsUpdate = async () => {
//     setLoading(true);
//     setMessage("");
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts-section/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify(sectionSettings),
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         setMessage("✅ Section settings updated successfully!");
//         setTimeout(() => setMessage(""), 3000);
//       } else {
//         setMessage("❌ Error: " + (data.error || "Failed to save"));
//       }
//     } catch (err) {
//       setMessage("❌ Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//     // Cloudinary
//     const CLOUD_NAME = "dhy0krkef";
//     const UPLOAD_PRESET = "preptara";
  
//   const handleImageUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     setMessage("Uploading image...");

//     const imageData = new FormData();
//     imageData.append("file", file);
//     imageData.append("upload_preset", UPLOAD_PRESET);

//     try {
//       const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
//         method: "POST",
//         body: imageData,
//       });

//       const data = await res.json();
//       if (data.secure_url) {
//         setFormData((prev) => ({ ...prev, image_url: data.secure_url, thumbnail_url: data.secure_url }));
//         setMessage("✅ Image uploaded successfully!");
//       } else {
//         setMessage("❌ Image upload failed!");
//       }
//     } catch (err) {
//       console.error("Cloudinary Upload Error:", err);
//       setMessage("❌ Image upload failed!");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const fetchPosts = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts/`, {
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         }
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         setPosts(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching blog posts:", error);
//     }
//   };
  
//   const resetForm = () => {
//     setFormData({
//       title: "",
//       excerpt: "",
//       content: "",
//       image_url: "",
//       thumbnail_url: "",
//       category: "",
//       reading_time: "5 min read",
//       slug: "",
//       is_featured: false,
//       is_active: true,
//     });
//     setEditing(null);
//     setShowForm(false);
//   };
  
//   const handleEdit = (post) => {
//     setEditing(post);
//     setFormData({
//       title: post.title || "",
//       excerpt: post.excerpt || "",
//       content: post.content || "",
//       image_url: post.image_url || post.thumbnail_url || "",
//       thumbnail_url: post.thumbnail_url || post.image_url || "",
//       category: post.category || "",
//       reading_time: post.reading_time || "5 min read",
//       slug: post.slug || "",
//       is_featured: post.is_featured || false,
//       is_active: post.is_active !== undefined ? post.is_active : true,
//     });
//     setShowForm(true);
//   };
  
//   const generateSlug = (title) => {
//     return title
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)/g, '');
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
    
//     // Auto-generate slug if not provided
//     const slug = formData.slug || generateSlug(formData.title);
//     const dataToSend = {
//       title: formData.title,
//       excerpt: formData.excerpt,
//       content: formData.content,
//       image_url: formData.image_url || formData.thumbnail_url,
//       thumbnail_url: formData.thumbnail_url || formData.image_url,
//       category: formData.category,
//       reading_time: formData.reading_time,
//       slug: slug,
//       is_featured: formData.is_featured,
//       is_active: formData.is_active,
//     };
    
//     try {
//       const url = editing
//         ? `${API_BASE_URL}/api/home/admin/blog-posts/${editing.id}/`
//         : `${API_BASE_URL}/api/home/admin/blog-posts/`;
      
//       const res = await fetch(url, {
//         method: editing ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify(dataToSend),
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         setMessage(`✅ Blog post ${editing ? 'updated' : 'created'} successfully!`);
//         setShowForm(false);
//         resetForm();
//         fetchPosts();
//         setTimeout(() => setMessage(""), 3000);
//       } else {
//         setMessage("❌ Error: " + (data.error || "Failed to save"));
//       }
//     } catch (err) {
//       setMessage("❌ Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleDelete = async (postId) => {
//     if (!confirm("Are you sure you want to delete this blog post?")) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts/${postId}/`, {
//         method: "DELETE",
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         }
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         setMessage("✅ Blog post deleted successfully!");
//         fetchPosts();
//         setTimeout(() => setMessage(""), 3000);
//       }
//     } catch (error) {
//       setMessage("❌ Error deleting: " + error.message);
//     }
//   };
  
//   // Show form view or list view
//   if (showForm) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-4">
//             <Button
//               variant="outline"
//               onClick={resetForm}
//               className="gap-2"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to List
//             </Button>
//             <div>
//               <h1 className="text-3xl font-bold text-[#0C1A35]">
//                 {editing ? "Edit Blog Post" : "Add New Blog Post"}
//               </h1>
//               <p className="text-[#0C1A35]/60 mt-1">Manage blog post content and settings</p>
//             </div>
//           </div>
//         </div>

//         {message && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`p-4 rounded-lg mb-6 ${
//               message.includes("✅")
//                 ? "bg-green-50 text-green-700 border border-green-200"
//                 : "bg-red-50 text-red-700 border border-red-200"
//             }`}
//           >
//             {message}
//           </motion.div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Main Content */}
//           <Card className="border-[#D3E3FF]">
//             <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
//               <CardTitle className="text-lg">Blog Post Content</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4 pt-6">
//               <div>
//                 <Label htmlFor="title">Blog Title *</Label>
//                 <Input
//                   id="title"
//                   value={formData.title}
//                   onChange={(e) => setFormData({...formData, title: e.target.value})}
//                   placeholder="How to Pass AWS SAA-C03 Exam in 30 Days"
//                   required
//                   className="mt-2 border-[#D3E3FF]"
//                 />
//                 <p className="text-sm text-gray-500 mt-1">Main heading for the blog post</p>
//               </div>
              
//               <div>
//                 <Label htmlFor="excerpt">Excerpt / Summary *</Label>
//                 <Textarea
//                   id="excerpt"
//                   value={formData.excerpt}
//                   onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
//                   placeholder="A comprehensive guide to passing your AWS certification exam in just 30 days..."
//                   rows={3}
//                   required
//                   className="mt-2 border-[#D3E3FF]"
//                 />
//                 <p className="text-sm text-gray-500 mt-1">Short description shown on cards</p>
//               </div>
              
//               <div>
//                 <Label htmlFor="content">Blog Content</Label>
//                 <div className="mt-2">
//                   <TipTapEditor
//                     content={formData.content || ""}
//                     onChange={(html) => setFormData({...formData, content: html})}
//                     placeholder="Full blog post content..."
//                   />
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">Full blog post content with rich text formatting</p>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="category">Category</Label>
//                   <Input
//                     id="category"
//                     value={formData.category}
//                     onChange={(e) => setFormData({...formData, category: e.target.value})}
//                     placeholder="AWS, Azure, Certification, etc."
//                     className="mt-2 border-[#D3E3FF]"
//                   />
//                   <p className="text-sm text-gray-500 mt-1">Blog category/topic</p>
//                 </div>
                
//                 <div>
//                   <Label htmlFor="reading_time">Reading Time</Label>
//                   <Input
//                     id="reading_time"
//                     value={formData.reading_time}
//                     onChange={(e) => setFormData({...formData, reading_time: e.target.value})}
//                     placeholder="5 min read"
//                     className="mt-2 border-[#D3E3FF]"
//                   />
//                   <p className="text-sm text-gray-500 mt-1">Estimated reading time</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="is_featured">Featured on Homepage</Label>
//                   <select
//                     id="is_featured"
//                     value={formData.is_featured.toString()}
//                     onChange={(e) => setFormData({...formData, is_featured: e.target.value === 'true'})}
//                     className="mt-2 w-full h-10 px-3 border border-[#D3E3FF] rounded-md"
//                   >
//                     <option value="true">Yes - Show on Homepage</option>
//                     <option value="false">No - Hide</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <Label htmlFor="is_active">Status</Label>
//                   <select
//                     id="is_active"
//                     value={formData.is_active.toString()}
//                     onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
//                     className="mt-2 w-full h-10 px-3 border border-[#D3E3FF] rounded-md"
//                   >
//                     <option value="true">Active</option>
//                     <option value="false">Inactive</option>
//                   </select>
//                 </div>
//               </div>
              
//               <div>
//                 <Label htmlFor="image_url">Featured Image URL *</Label>
//                 <Input
//                   type="file"
//                   accept="image/*"
//                   id="image_url"
//                   onChange={handleImageUpload}
//                   disabled={uploading}
//                   className="mt-2 border-[#D3E3FF]"
//                 />
//                 {uploading && <p className="text-sm text-blue-500 mt-1">Uploading image...</p>}
//                 {formData.image_url && (
//                   <div className="mt-3">
//                     <div className="w-full aspect-[16/9] rounded-md overflow-hidden border border-[#D3E3FF] bg-gray-100">
//                       <img 
//                         src={getOptimizedImageUrl(formData.image_url, 600, 338)} 
//                         alt="Featured image preview" 
//                         width={600}
//                         height={338}
//                         className="w-full h-full object-contain"
//                         style={{ objectFit: 'contain' }}
//                         loading="lazy"
//                         sizes="(max-width: 768px) 100vw, 600px"
//                         decoding="async"
//                       />
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">Uploaded image URL: {formData.image_url}</p>
//                   </div>
//                 )}
//                 <p className="text-sm text-gray-500 mt-1">Main image displayed with the blog post</p>
//               </div>
              
//               <div>
//                 <Label htmlFor="slug">URL Slug</Label>
//                 <Input
//                   id="slug"
//                   value={formData.slug}
//                   onChange={(e) => setFormData({...formData, slug: e.target.value})}
//                   placeholder="aws-saa-c03-guide (auto-generated if empty)"
//                   className="mt-2 border-[#D3E3FF]"
//                 />
//                 <p className="text-sm text-gray-500 mt-1">SEO-friendly URL slug (auto-generated from title if left empty)</p>
//               </div>
//             </CardContent>
//           </Card>
          
//           {/* Live Preview */}
//           <Card className="border-[#D3E3FF]">
//             <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <Eye className="w-5 h-5 text-[#10B981]" />
//                 Live Preview - How it appears on homepage
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <div className="border border-[#D3E3FF] rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
//                 {formData.image_url ? (
//                   <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
//                     <img 
//                       src={getOptimizedImageUrl(formData.image_url, 600, 338)} 
//                       alt="Blog preview" 
//                       width={600}
//                       height={338}
//                       className="w-full h-full object-contain"
//                       style={{ objectFit: 'contain' }}
//                       loading="lazy"
//                       sizes="(max-width: 768px) 100vw, 600px"
//                       decoding="async"
//                     />
//                   </div>
//                 ) : (
//                   <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center">
//                     <p className="text-gray-400">No image URL provided</p>
//                   </div>
//                 )}
//                 <div className="p-6">
//                   <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
//                     {formData.category && (
//                       <>
//                         <Badge className="bg-[#1A73E8] text-white text-xs">
//                           {formData.category}
//                         </Badge>
//                         <span>•</span>
//                       </>
//                     )}
//                     <span>{formData.reading_time || "5 min read"}</span>
//                     {formData.is_featured && (
//                       <>
//                         <span>•</span>
//                         <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-xs">
//                           Featured
//                         </Badge>
//                       </>
//                     )}
//                   </div>
//                   <h3 className="text-xl font-bold text-[#0C1A35] mb-3 line-clamp-2">
//                     {formData.title || "Blog Post Title"}
//                   </h3>
//                   <p className="text-[#0C1A35]/70 line-clamp-3 mb-4">
//                     {formData.excerpt || "Blog post excerpt will appear here..."}
//                   </p>
//                   <Button variant="outline" size="sm" className="text-[#1A73E8] border-[#1A73E8]">
//                     Read More →
//                   </Button>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-4 text-center">
//                 Preview of how this blog post will appear on the home page
//               </p>
//             </CardContent>
//           </Card>
          
//           <div className="flex gap-3 pt-4">
//             <Button type="submit" disabled={loading || uploading} className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
//               {loading ? "Saving..." : uploading ? "Uploading..." : (editing ? "Update Blog Post" : "Create Blog Post")}
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={resetForm}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-[#0C1A35]">Blog Posts Management</h1>
//           <p className="text-[#0C1A35]/60 mt-1">Manage blog articles and news on home page</p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             onClick={() => window.open("/", "_blank")}
//             variant="outline"
//             className="gap-2 border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10"
//           >
//             <Eye className="w-4 h-4" />
//             Preview Home
//           </Button>
//           <Button 
//             className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]" 
//             onClick={() => {
//               resetForm();
//               setShowForm(true);
//             }}
//           >
//             <Plus className="w-4 h-4" />
//             Add Blog Post
//           </Button>
//         </div>
//       </div>
      
//       {message && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className={`p-4 rounded-lg mb-6 ${
//             message.includes("✅")
//               ? "bg-green-50 text-green-700 border border-green-200"
//               : "bg-red-50 text-red-700 border border-red-200"
//           }`}
//         >
//           {message}
//         </motion.div>
//       )}

//       {/* Section Settings */}
//       <Card className="mb-6">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Settings className="w-5 h-5 text-[#1A73E8]" />
//               <CardTitle>Section Settings</CardTitle>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label>Section Heading</Label>
//               <Input
//                 value={sectionSettings.heading}
//                 onChange={(e) => setSectionSettings({...sectionSettings, heading: e.target.value})}
//                 placeholder="Latest Blog Posts"
//               />
//             </div>
//             <div>
//               <Label>Section Subtitle</Label>
//               <Input
//                 value={sectionSettings.subtitle}
//                 onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
//                 placeholder="Stay updated with certification tips and news"
//               />
//             </div>
//           </div>
          
//           <Button 
//             onClick={handleSectionSettingsUpdate} 
//             disabled={loading}
//             className="bg-[#1A73E8] hover:bg-[#1557B0]"
//           >
//             {loading ? "Saving..." : "Save Section Settings"}
//           </Button>
//         </CardContent>
//       </Card>
      
//       {/* Blog Posts Table */}
//       <Card className="border-[#D3E3FF]">
//         <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-purple-500/5">
//           <CardTitle>All Blog Posts ({posts.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Excerpt</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead className="w-24">Featured</TableHead>
//                   <TableHead className="w-24">Status</TableHead>
//                   <TableHead className="text-right w-32">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {posts.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-12">
//                       <div className="flex flex-col items-center gap-3">
//                         <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
//                           <FileText className="w-8 h-8 text-gray-400" />
//                         </div>
//                         <p className="font-medium text-gray-700">No blog posts found</p>
//                         <p className="text-sm text-gray-500">Click "Add Blog Post" to create your first article</p>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   posts.map((post) => (
//                     <TableRow key={post.id}>
//                       <TableCell className="font-medium max-w-xs">
//                         <p className="line-clamp-2">{post.title}</p>
//                       </TableCell>
//                       <TableCell>
//                         {post.category ? (
//                           <Badge className="bg-blue-100 text-blue-700">{post.category}</Badge>
//                         ) : (
//                           <span className="text-gray-400 text-sm">—</span>
//                         )}
//                       </TableCell>
//                       <TableCell className="max-w-md">
//                         <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
//                       </TableCell>
//                       <TableCell className="text-sm text-gray-500">
//                         {post.created_at ? new Date(post.created_at).toLocaleDateString() : "—"}
//                       </TableCell>
//                       <TableCell>
//                         {post.is_featured ? (
//                           <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400">Featured</Badge>
//                         ) : (
//                           <span className="text-gray-400 text-sm">No</span>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={post.is_active ? "default" : "secondary"} className={post.is_active ? "bg-[#10B981]" : "bg-gray-400"}>
//                           {post.is_active ? "Active" : "Inactive"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex gap-2 justify-end">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleEdit(post)}
//                             className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
//                           >
//                             <Edit className="w-3 h-3" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleDelete(post.id)}
//                             className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
//                           >
//                             <Trash2 className="w-3 h-3" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
      
//       {/* Home Page Preview */}
//       {posts.filter(p => p.is_featured).length > 0 && (
//         <Card className="mt-6 border-[#D3E3FF]">
//           <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10">
//             <CardTitle>Homepage Preview - Featured Blog Posts</CardTitle>
//           </CardHeader>
//           <CardContent className="pt-6">
//             <div className="mb-6">
//               <h2 className="text-3xl font-bold text-center mb-3 text-[#0C1A35]">
//                 {sectionSettings.heading || "Latest Blog Posts"}
//               </h2>
//               <p className="text-center text-[#0C1A35]/70 text-lg mb-8 max-w-2xl mx-auto">
//                 {sectionSettings.subtitle || "Stay updated with certification tips and news"}
//               </p>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {posts.filter(p => p.is_featured && p.is_active).slice(0, 3).map((post) => (
//                 <div key={post.id} className="border border-[#D3E3FF] rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
//                   <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1A73E8]/10 to-purple-500/10 flex items-center justify-center">
//                     <FileText className="w-12 h-12 text-[#1A73E8]/30" />
//                   </div>
//                   <div className="p-4">
//                     <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
//                       <span>{post.author}</span>
//                       <span>•</span>
//                       <span>{new Date(post.published_date).toLocaleDateString()}</span>
//                     </div>
//                     <h3 className="text-lg font-bold text-[#0C1A35] mb-2 line-clamp-2">
//                       {post.title}
//                     </h3>
//                     <p className="text-sm text-[#0C1A35]/70 line-clamp-3">
//                       {post.excerpt}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {posts.filter(p => p.is_featured && p.is_active).length > 3 && (
//               <p className="text-center text-sm text-gray-500 mt-6">
//                 + {posts.filter(p => p.is_featured && p.is_active).length - 3} more featured posts
//               </p>
//             )}
//             <p className="text-sm text-gray-500 mt-4 text-center">
//               Preview showing featured blog posts as they appear on home page
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, FileText, Image as ImageIcon, Settings, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import {
  convertImageFileToWebp,
  ensureCloudinaryWebpUrl,
} from "@/utils/convertImageToWebp";
import TipTapEditor from "@/components/editor/TipTapEditor";
import AdminTablePagination, { ADMIN_TABLE_PAGE_SIZE } from "@/components/admin/AdminTablePagination";
import {
  buildAdminListUrl,
  DEFAULT_ADMIN_PAGINATION,
  normalizeAdminPagination,
  useDebouncedValue,
} from "@/lib/adminPagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function BlogPostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [sliderCategories, setSliderCategories] = useState([]);
  const [sliderProviders, setSliderProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [listPage, setListPage] = useState(1);
  const [listPagination, setListPagination] = useState(DEFAULT_ADMIN_PAGINATION);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    thumbnail_url: "",
    category: "",
    slug: "",
    is_featured: false,
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    faqs: [
      {
        question: "",
        answer: "",
      },
    ],
    content_slider_type: "",
    content_slider_ref: "",
  });
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Latest Blog Posts",
    subtitle: "Stay updated with certification tips and news",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });
  
  useEffect(() => {
    fetchSectionSettings();
    fetchSliderOptions();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [listPage, debouncedSearchQuery]);

  const fetchSliderOptions = async () => {
    try {
      const [categoriesRes, providersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/categories/`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/providers/`, { cache: "no-store" }),
      ]);

      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        setSliderCategories(
          Array.isArray(categories)
            ? categories.filter((c) => c.is_active !== false)
            : []
        );
      }

      if (providersRes.ok) {
        const providers = await providersRes.json();
        setSliderProviders(
          Array.isArray(providers)
            ? providers.filter((p) => p.is_active !== false)
            : []
        );
      }
    } catch (error) {
      console.error("Error fetching slider options:", error);
    }
  };
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts-section/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSectionSettings((prev) => ({ ...prev, ...data.data }));
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
      const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts-section/`, {
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
  
    // Cloudinary
    const CLOUD_NAME = "dhy0krkef";
    const UPLOAD_PRESET = "preptara";
  
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading image...");

    try {
      const webpFile = await convertImageFileToWebp(file);
      const imageData = new FormData();
      imageData.append("file", webpFile);
      imageData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: imageData,
      });

      const data = await res.json();
      if (data.secure_url) {
        const webpUrl = ensureCloudinaryWebpUrl(data.secure_url);
        setFormData((prev) => ({
          ...prev,
          image_url: webpUrl,
          thumbnail_url: webpUrl,
        }));
        setMessage("✅ Image uploaded successfully as WebP!");
      } else {
        setMessage("❌ Image upload failed!");
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setMessage(
        `❌ ${err instanceof Error ? err.message : "Image upload failed!"}`
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(
        buildAdminListUrl(`${API_BASE_URL}/api/home/admin/blog-posts/`, {
          page: listPage,
          page_size: ADMIN_TABLE_PAGE_SIZE,
          search: debouncedSearchQuery.trim(),
        }),
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          cache: "no-store",
        }
      );
      
      const data = await res.json();
      
      if (data.success) {
        setPosts(data.data);
        setListPagination(normalizeAdminPagination(data.pagination));
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };

  useEffect(() => {
    setListPage(1);
  }, [searchQuery]);
  
  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image_url: "",
      thumbnail_url: "",
      category: "",
      slug: "",
      is_featured: false,
      faqs: [
        {
          question: "",
          answer: "",
        },
      ],
      content_slider_type: "",
      content_slider_ref: "",
    });
    setEditing(null);
    setShowForm(false);
  };
  
  const handleEdit = (post) => {
    setEditing(post);
    setFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      image_url: post.image_url || post.thumbnail_url || "",
      thumbnail_url: post.thumbnail_url || post.image_url || "",
      category: post.category || "",
      slug: post.slug || "",
      is_featured: post.is_featured || false,
      meta_title: post.meta_title || "",
      meta_keywords: post.meta_keywords || "",
      meta_description: post.meta_description || "",
      faqs:
        Array.isArray(post.faqs) && post.faqs.length > 0
          ? post.faqs.map((faq) => ({
              question: faq?.question || "",
              answer: faq?.answer || "",
            }))
          : [{ question: "", answer: "" }],
      content_slider_type: post.content_slider_type || "",
      content_slider_ref: post.content_slider_ref || "",
    });
    setShowForm(true);
  };
  
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    // Auto-generate slug if not provided
    const slug = formData.slug || generateSlug(formData.title);
    const dataToSend = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      image_url: formData.image_url || formData.thumbnail_url,
      thumbnail_url: formData.thumbnail_url || formData.image_url,
      category: formData.category,
      slug: slug,
      is_featured: formData.is_featured,
      meta_title: formData.meta_title,
      meta_keywords: formData.meta_keywords,
      meta_description: formData.meta_description,
      faqs: (formData.faqs || []).filter(
        (faq) => String(faq?.question || "").trim()
      ),
      content_slider_type: formData.content_slider_type || "",
      content_slider_ref: formData.content_slider_ref || "",
    };
    
    try {
      const url = editing
        ? `${API_BASE_URL}/api/home/admin/blog-posts/${editing.id}/`
        : `${API_BASE_URL}/api/home/admin/blog-posts/`;
      
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(dataToSend),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Blog post ${editing ? 'updated' : 'created'} successfully!`);
        setShowForm(false);
        resetForm();
        fetchPosts();
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
  
  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/blog-posts/${postId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Blog post deleted successfully!");
        fetchPosts();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Error deleting: " + error.message);
    }
  };
  
  // Show form view or list view
  if (showForm) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={resetForm}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#0C1A35]">
                {editing ? "Edit Blog Post" : "Add New Blog Post"}
              </h1>
              <p className="text-[#0C1A35]/60 mt-1">Manage blog post content and settings</p>
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content */}
          <Card className="border-[#D3E3FF]">
            <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
              <CardTitle className="text-lg">Blog Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="title">Blog Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="How to Pass AWS SAA-C03 Exam in 30 Days"
                  required
                  className="mt-2 border-[#D3E3FF]"
                />
                <p className="text-sm text-gray-500 mt-1">Main heading for the blog post</p>
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt / Summary *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="A comprehensive guide to passing your AWS certification exam in just 30 days..."
                  rows={3}
                  required
                  className="mt-2 border-[#D3E3FF]"
                />
                <p className="text-sm text-gray-500 mt-1">Short description shown on cards</p>
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="aws-saa-c03-guide (auto-generated if empty)"
                  className="mt-2 border-[#D3E3FF]"
                />
                <p className="text-sm text-gray-500 mt-1">SEO-friendly URL slug (auto-generated from title if left empty)</p>
              </div>
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                  placeholder="SEO optimized title for Google"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description: e.target.value })
                  }
                  rows={3}
                  placeholder="SEO description shown in Google results"
                />
              </div>

              <div>
                <Label>Meta Keywords</Label>
                <Input
                  value={formData.meta_keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_keywords: e.target.value })
                  }
                  placeholder="aws certification, cloud exam, saa-c03"
                />
              </div>
              <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="AWS, Azure, Certification, etc."
                    className="mt-2 border-[#D3E3FF]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Blog category/topic</p>
              </div>
              
              <div>
                <Label htmlFor="content">Blog Content</Label>
                <div className="mt-2">
                  <TipTapEditor
                    content={formData.content || ""}
                    onChange={(html) => setFormData({...formData, content: html})}
                    placeholder="Full blog post content..."
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Full blog post content with rich text formatting</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="is_featured">Featured on Homepage</Label>
                  <select
                    id="is_featured"
                    value={formData.is_featured.toString()}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.value === 'true'})}
                    className="mt-2 w-full h-10 px-3 border border-[#D3E3FF] rounded-md"
                  >
                    <option value="true">Yes - Show on Homepage</option>
                    <option value="false">No - Hide</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Only featured posts appear on the homepage</p>
                </div>
              </div>

              <div>
                <Label htmlFor="content_slider_type">Content Slider (mid-article)</Label>
                <select
                  id="content_slider_type"
                  value={formData.content_slider_type || ""}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    const keepRef =
                      nextType === formData.content_slider_type &&
                      (nextType === "categories" || nextType === "providers");
                    setFormData({
                      ...formData,
                      content_slider_type: nextType,
                      content_slider_ref: keepRef ? formData.content_slider_ref : "",
                    });
                  }}
                  className="mt-2 w-full h-10 px-3 border border-[#D3E3FF] rounded-md"
                >
                  <option value="">None</option>
                  <option value="providers">Providers</option>
                  <option value="categories">Categories</option>
                  <option value="popular_exams">Popular Exams</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Shows a slider between blog content. For Providers or Categories,
                  pick one below to show its latest 10 exams.
                </p>
              </div>

              {formData.content_slider_type === "categories" ? (
                <div>
                  <Label htmlFor="content_slider_ref_category">Select Category</Label>
                  <select
                    id="content_slider_ref_category"
                    value={formData.content_slider_ref || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content_slider_ref: e.target.value,
                      })
                    }
                    className="mt-2 w-full h-10 px-3 border border-[#D3E3FF] rounded-md"
                  >
                    <option value="">All categories (default slider)</option>
                    {sliderCategories.map((category) => {
                      const slug = category.slug || "";
                      const label = category.title || category.name || slug;
                      return (
                        <option key={category.id || slug} value={slug}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    When selected, the blog slider shows the latest 10 exams from
                    this category.
                  </p>
                </div>
              ) : null}

              {formData.content_slider_type === "providers" ? (
                <div>
                  <Label htmlFor="content_slider_ref_provider">Select Provider</Label>
                  <select
                    id="content_slider_ref_provider"
                    value={formData.content_slider_ref || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content_slider_ref: e.target.value,
                      })
                    }
                    className="mt-2 w-full h-10 px-3 border border-[#D3E3FF] rounded-md"
                  >
                    <option value="">All providers (default slider)</option>
                    {sliderProviders.map((provider) => {
                      const slug = provider.slug || "";
                      return (
                        <option key={provider.id || slug} value={slug}>
                          {provider.name || slug}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    When selected, the blog slider shows the latest 10 exams from
                    this provider.
                  </p>
                </div>
              ) : null}
              
              <div>
                <Label htmlFor="image_url">Featured Image URL *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  id="image_url"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="mt-2 border-[#D3E3FF]"
                />
                {uploading && <p className="text-sm text-blue-500 mt-1">Uploading image...</p>}
                {formData.image_url && (
                  <div className="mt-3">
                    <div className="w-full aspect-[16/9] rounded-md overflow-hidden border border-[#D3E3FF] bg-gray-100">
                      <img 
                        src={getOptimizedImageUrl(formData.image_url, 600, 338)} 
                        alt="Featured image preview" 
                        width={600}
                        height={338}
                        className="w-full h-full object-contain"
                        style={{ objectFit: 'contain' }}
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 600px"
                        decoding="async"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploaded image URL: {formData.image_url}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">Main image displayed with the blog post</p>
              </div>
              
              
            </CardContent>
          </Card>
          
          
          <Card className="border-[#D3E3FF]">
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {formData.faqs?.map((faq, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div>
                    <Label>Question {index + 1}</Label>
                    <Input
                      value={faq.question}
                      onChange={(e) => {
                        const updatedFaqs = [...formData.faqs];
                        updatedFaqs[index].question = e.target.value;

                        setFormData({
                          ...formData,
                          faqs: updatedFaqs,
                        });
                      }}
                      placeholder="Enter FAQ question"
                    />
                  </div>

                  <div>
                    <Label>Answer</Label>
                    <Textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => {
                        const updatedFaqs = [...formData.faqs];
                        updatedFaqs[index].answer = e.target.value;

                        setFormData({
                          ...formData,
                          faqs: updatedFaqs,
                        });
                      }}
                      placeholder="Enter FAQ answer"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const updatedFaqs = formData.faqs.filter(
                        (_, i) => i !== index
                      );

                      setFormData({
                        ...formData,
                        faqs: updatedFaqs,
                      });
                    }}
                  >
                    Remove FAQ
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    faqs: [
                      ...formData.faqs,
                      {
                        question: "",
                        answer: "",
                      },
                    ],
                  })
                }
              >
                + Add FAQ
              </Button>

            </CardContent>
          </Card>


          
          {/* Live Preview */}
          <Card className="border-[#D3E3FF]">
            <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#10B981]" />
                Live Preview - How it appears on homepage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border border-[#D3E3FF] rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                {formData.image_url ? (
                  <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <img 
                      src={getOptimizedImageUrl(formData.image_url, 600, 338)} 
                      alt="Blog preview" 
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
                  <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">No image URL provided</p>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    {formData.category && (
                      <>
                        <Badge className="bg-[#1A73E8] text-white text-xs">
                          {formData.category}
                        </Badge>
                        <span>•</span>
                      </>
                    )}
                    {formData.is_featured && (
                      <>
                        <span>•</span>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-xs">
                          Featured
                        </Badge>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#0C1A35] mb-3 line-clamp-2">
                    {formData.title || "Blog Post Title"}
                  </h3>
                  <p className="text-[#0C1A35]/70 line-clamp-3 mb-4">
                    {formData.excerpt || "Blog post excerpt will appear here..."}
                  </p>
                  <Button variant="outline" size="sm" className="text-[#1A73E8] border-[#1A73E8]">
                    Read More →
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Preview of how this blog post will appear on the home page
              </p>
            </CardContent>
          </Card>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || uploading} className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
              {loading ? "Saving..." : uploading ? "Uploading..." : (editing ? "Update Blog Post" : "Create Blog Post")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Blog Posts Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage blog articles and news on home page</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open("/", "_blank")}
            variant="outline"
            className="gap-2 border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10"
          >
            <Eye className="w-4 h-4" />
            Preview Home
          </Button>
          <Button 
            className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]" 
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Blog Post
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
                placeholder="Latest Blog Posts"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Stay updated with certification tips and news"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={sectionSettings.meta_title}
                onChange={(e) => setSectionSettings({ ...sectionSettings, meta_title: e.target.value })}
                placeholder="Blog - Certification Exam Tips & Guides | AllExamQuestions"
              />
            </div>
            <div>
              <Label>Meta Keywords</Label>
              <Input
                value={sectionSettings.meta_keywords}
                onChange={(e) => setSectionSettings({ ...sectionSettings, meta_keywords: e.target.value })}
                placeholder="certification exams, practice tests, exam guides"
              />
            </div>
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea
              value={sectionSettings.meta_description}
              onChange={(e) => setSectionSettings({ ...sectionSettings, meta_description: e.target.value })}
              rows={3}
              placeholder="Expert advice and strategies to maximize your exam success"
            />
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
      
      {/* Blog Posts Table */}
      <Card className="border-[#D3E3FF]">
        <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-purple-500/5">
          <CardTitle>All Blog Posts ({listPagination.count})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blog posts by title, slug, category, or excerpt..."
              className="max-w-md"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Slider</TableHead>
                  <TableHead>Excerpt</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Featured</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">No blog posts found</p>
                        <p className="text-sm text-gray-500">Click &quot;Add Blog Post&quot; to create your first article</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs">
                        <p className="line-clamp-2">{post.title}</p>
                      </TableCell>
                      <TableCell>
                        {post.category ? (
                          <Badge className="bg-blue-100 text-blue-700">{post.category}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.content_slider_type ? (
                          <div className="space-y-1">
                            <Badge variant="secondary" className="capitalize">
                              {String(post.content_slider_type).replace(/_/g, " ")}
                            </Badge>
                            {post.content_slider_ref ? (
                              <p className="text-xs text-gray-500 truncate max-w-[140px]">
                                {post.content_slider_ref}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {post.is_featured ? (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400">Featured</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <AdminTablePagination
            currentPage={listPagination.page}
            totalPages={listPagination.total_pages}
            totalItems={listPagination.count}
            onPageChange={setListPage}
            itemLabel="blog posts"
          />
        </CardContent>
      </Card>
      
      {/* Home Page Preview */}
      {posts.filter(p => p.is_featured).length > 0 && (
        <Card className="mt-6 border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10">
            <CardTitle>Homepage Preview - Featured Blog Posts</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-center mb-3 text-[#0C1A35]">
                {sectionSettings.heading || "Latest Blog Posts"}
              </h2>
              <p className="text-center text-[#0C1A35]/70 text-lg mb-8 max-w-2xl mx-auto">
                {sectionSettings.subtitle || "Stay updated with certification tips and news"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.filter(p => p.is_featured).slice(0, 3).map((post) => (
                <div key={post.id} className="border border-[#D3E3FF] rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    {post.image_url || post.thumbnail_url ? (
                      <img
                        src={getOptimizedImageUrl(
                          post.image_url || post.thumbnail_url,
                          600,
                          338
                        )}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FileText className="w-12 h-12 text-[#1A73E8]/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.published_date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0C1A35] mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[#0C1A35]/70 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {posts.filter(p => p.is_featured).length > 3 && (
              <p className="text-center text-sm text-gray-500 mt-6">
                + {posts.filter(p => p.is_featured).length - 3} more featured posts
              </p>
            )}
            <p className="text-sm text-gray-500 mt-4 text-center">
              Preview showing featured blog posts as they appear on home page
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

