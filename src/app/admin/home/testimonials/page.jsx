"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Star, Quote, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    text: "",
    image_url: "",
    rating: 5,
    is_featured: false,
    order: 0,
  });
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "What Our Students Say",
    subtitle: "Real feedback from certified professionals",
  });
  
  useEffect(() => {
    fetchTestimonials();
    fetchSectionSettings();
  }, []);
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/testimonials-section/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/home/admin/testimonials-section/`, {
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
  
  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/testimonials/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        } 
      });
      
      const data = await res.json();
      
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      text: "",
      image_url: "",
      rating: 5,
      is_featured: false,
      order: 0,
    });
    setEditing(null);
  };
  
  const handleEdit = (testimonial) => {
    setEditing(testimonial);
    setFormData({
      name: testimonial.name || "",
      role: testimonial.role || "",
      text: testimonial.review || testimonial.text || "",  // Backend sends 'review'
      image_url: testimonial.image_url || "",
      rating: testimonial.rating || 5,
      is_featured: testimonial.is_featured || false,
      order: testimonial.order || 0,
    });
    setDialogOpen(true);
  };
  console.log("editing", editing);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    console.log("formData", formData);
    console.log("editing", editing);
    try {
      const url = editing
        ? `${API_BASE_URL}/api/home/admin/testimonials/${editing.id}/`
        : `${API_BASE_URL}/api/home/admin/testimonials/`;

      console.log("url", url);
      
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          review: formData.text,  // Send as 'review' (backend expects this)
          rating: formData.rating,
          is_featured: formData.is_featured,
          is_active: formData.is_active !== undefined ? formData.is_active : true
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Testimonial ${editing ? 'updated' : 'created'} successfully!`);
        setDialogOpen(false);
        resetForm();
        fetchTestimonials();
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
  
  const handleDelete = async (testimonialId) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/testimonials/${testimonialId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Testimonial deleted successfully!");
        fetchTestimonials();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Error deleting: " + error.message);
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Testimonials Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage customer testimonials and reviews on home page</p>
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]" onClick={resetForm}>
                <Plus className="w-4 h-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0C1A35]">
                  {editing ? "Edit Testimonial" : "Add New Testimonial"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-[#D3E3FF]">
                  <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
                    <CardTitle className="text-lg">Testimonial Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Customer Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="John Smith"
                          required
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Role/Title *</Label>
                        <Input
                          id="role"
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          placeholder="Cloud Engineer, ABC Corp"
                          required
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="text">Testimonial Text *</Label>
                      <Textarea
                        id="text"
                        value={formData.text}
                        onChange={(e) => setFormData({...formData, text: e.target.value})}
                        placeholder="This platform helped me pass my certification exam on the first try! The questions were very similar to the real exam..."
                        rows={4}
                        required
                        className="mt-2 border-[#D3E3FF]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image_url">Profile Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        placeholder="https://example.com/profile.jpg"
                        className="mt-2 border-[#D3E3FF]"
                      />
                      <p className="text-sm text-gray-500 mt-1">Optional customer photo</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rating">Rating</Label>
                        <Select 
                          value={formData.rating.toString()} 
                          onValueChange={(val) => setFormData({...formData, rating: parseInt(val)})}
                        >
                          <SelectTrigger className="mt-2 border-[#D3E3FF]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Star{num > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="order">Display Order</Label>
                        <Input
                          id="order"
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                          placeholder="0"
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="is_featured">Featured</Label>
                        <Select 
                          value={formData.is_featured.toString()} 
                          onValueChange={(val) => setFormData({...formData, is_featured: val === 'true'})}
                        >
                          <SelectTrigger className="mt-2 border-[#D3E3FF]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Live Preview */}
                <Card className="border-[#D3E3FF]">
                  <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border border-[#D3E3FF] rounded-lg p-6 bg-white relative">
                      <Quote className="absolute top-4 right-4 w-8 h-8 text-[#1A73E8]/10" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A73E8] to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[#0C1A35]">
                              {formData.name || "Customer Name"}
                            </h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < formData.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-[#0C1A35]/60 mb-3">
                            {formData.role || "Role/Title"}
                          </p>
                          <p className="text-[#0C1A35]/80 italic">
                            "{formData.text || "Testimonial text will appear here..."}"
                          </p>
                        </div>
                      </div>
                      {formData.is_featured && (
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                    {loading ? "Saving..." : (editing ? "Update Testimonial" : "Create Testimonial")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                placeholder="What Our Students Say"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Real feedback from certified professionals"
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
      
      {/* Testimonials Table */}
      <Card className="border-[#D3E3FF]">
        <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-purple-500/5">
          <CardTitle>All Testimonials ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Testimonial</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="w-24">Featured</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Quote className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">No testimonials found</p>
                        <p className="text-sm text-gray-500">Click "Add Testimonial" to add customer reviews</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell className="text-center font-mono text-sm">{testimonial.order}</TableCell>
                      <TableCell className="font-medium">{testimonial.name}</TableCell>
                      <TableCell className="text-sm">{testimonial.role}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-600 line-clamp-2 italic">"{testimonial.review || testimonial.text}"</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < testimonial.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimonial.is_featured ? (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400">Featured</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={testimonial.is_active ? "default" : "secondary"} className="bg-[#10B981]">
                          {testimonial.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(testimonial)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(testimonial.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
