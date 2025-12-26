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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, HelpCircle, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function FAQsAdmin() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
  });
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Frequently Asked Questions",
    subtitle: "Find answers to common questions",
  });
  
  useEffect(() => {
    fetchFAQs();
    fetchSectionSettings();
  }, []);
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/faqs-section/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/home/admin/faqs-section/`, {
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
  
  const fetchFAQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/faqs/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      order: 0,
    });
    setEditing(null);
  };
  
  const handleEdit = (faq) => {
    setEditing(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      order: faq.order || 0,
    });
    setDialogOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const url = editing
        ? `${API_BASE_URL}/api/home/admin/faqs/${editing.id}/`
        : `${API_BASE_URL}/api/home/admin/faqs/`;
      
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ FAQ ${editing ? 'updated' : 'created'} successfully!`);
        setDialogOpen(false);
        resetForm();
        fetchFAQs();
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
  
  const handleDelete = async (faqId) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/faqs/${faqId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ FAQ deleted successfully!");
        fetchFAQs();
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
          <h1 className="text-3xl font-bold text-[#0C1A35]">FAQs Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage Frequently Asked Questions on home page</p>
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
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0C1A35]">
                  {editing ? "Edit FAQ" : "Add New FAQ"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-[#D3E3FF]">
                  <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
                    <CardTitle className="text-lg">FAQ Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <Label htmlFor="question">Question *</Label>
                      <Input
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        placeholder="How do I start practicing for an exam?"
                        required
                        className="mt-2 border-[#D3E3FF]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="answer">Answer *</Label>
                      <Textarea
                        id="answer"
                        value={formData.answer}
                        onChange={(e) => setFormData({...formData, answer: e.target.value})}
                        placeholder="Simply search for your desired certification exam..."
                        rows={5}
                        required
                        className="mt-2 border-[#D3E3FF]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                        placeholder="0, 1, 2, 3..."
                        className="mt-2 border-[#D3E3FF]"
                      />
                      <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Live Preview */}
                <Card className="border-[#D3E3FF]">
                  <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border border-[#D3E3FF] rounded-lg p-4 bg-white">
                      <div className="flex gap-3">
                        <HelpCircle className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-[#0C1A35] mb-2">
                            {formData.question || "Your question will appear here..."}
                          </h4>
                          <p className="text-[#0C1A35]/70 text-sm">
                            {formData.answer || "Your answer will appear here..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                    {loading ? "Saving..." : (editing ? "Update FAQ" : "Create FAQ")}
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
                placeholder="Frequently Asked Questions"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Find answers to common questions"
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
      
      {/* FAQs Table */}
      <Card className="border-[#D3E3FF]">
        <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-purple-500/5">
          <CardTitle>All FAQs ({faqs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <HelpCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">No FAQs found</p>
                        <p className="text-sm text-gray-500">Click "Add FAQ" to create your first question</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="text-center font-mono text-sm">{faq.order}</TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <p className="line-clamp-2">{faq.question}</p>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={faq.is_active ? "default" : "secondary"} className="bg-[#10B981]">
                          {faq.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(faq)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(faq.id)}
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
