"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2, Eye, Clock, Award, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function RecentlyUpdatedAdmin() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    code: "",
    updated: "",
    practice_exams: 0,
    questions: 0,
    slug: "",
    order: 0,
  });
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Recently Updated Exams",
    subtitle: "Stay current with the latest exam updates",
  });
  
  useEffect(() => {
    fetchExams();
    fetchSectionSettings();
  }, []);
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/recently-updated-section/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/home/admin/recently-updated-section/`, {
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
  
  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/recently-updated-exams/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setExams(data.data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      provider: "",
      code: "",
      updated: "",
      practice_exams: 0,
      questions: 0,
      slug: "",
      order: 0,
    });
    setEditing(null);
  };
  
  const handleEdit = (exam) => {
    setEditing(exam);
    setFormData({
      name: exam.name || "",
      provider: exam.provider || "",
      code: exam.code || "",
      updated: exam.updated || "",
      practice_exams: exam.practice_exams || 0,
      questions: exam.questions || 0,
      slug: exam.slug || "",
      order: exam.order || 0,
    });
    setDialogOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const url = editing
        ? `${API_BASE_URL}/api/home/admin/recently-updated-exams/${editing.id}/`
        : `${API_BASE_URL}/api/home/admin/recently-updated-exams/`;
      
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
        setMessage(`✅ Exam ${editing ? 'updated' : 'created'} successfully!`);
        setDialogOpen(false);
        resetForm();
        fetchExams();
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
  
  const handleDelete = async (examId) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/recently-updated-exams/${examId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Exam deleted successfully!");
        fetchExams();
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
          <h1 className="text-3xl font-bold text-[#0C1A35]">Recently Updated Exams</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage recently updated certification exams on home page</p>
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
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0C1A35]">
                  {editing ? "Edit Exam" : "Add New Exam"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-[#D3E3FF]">
                  <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
                    <CardTitle className="text-lg">Exam Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Exam Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="AWS Solutions Architect Associate"
                          required
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="provider">Provider *</Label>
                        <Input
                          id="provider"
                          value={formData.provider}
                          onChange={(e) => setFormData({...formData, provider: e.target.value})}
                          placeholder="AWS, Microsoft, Cisco, CompTIA..."
                          required
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="code">Exam Code *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          placeholder="SAA-C03"
                          required
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="updated">Last Updated *</Label>
                        <Input
                          id="updated"
                          value={formData.updated}
                          onChange={(e) => setFormData({...formData, updated: e.target.value})}
                          placeholder="2 hours ago, 1 day ago..."
                          required
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="practice_exams">Practice Exams</Label>
                        <Input
                          id="practice_exams"
                          type="number"
                          value={formData.practice_exams}
                          onChange={(e) => setFormData({...formData, practice_exams: parseInt(e.target.value) || 0})}
                          placeholder="3"
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="questions">Total Questions</Label>
                        <Input
                          id="questions"
                          type="number"
                          value={formData.questions}
                          onChange={(e) => setFormData({...formData, questions: parseInt(e.target.value) || 0})}
                          placeholder="850"
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
                          placeholder="0, 1, 2..."
                          className="mt-2 border-[#D3E3FF]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="slug">SEO Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        placeholder="aws-saa-c03"
                        required
                        className="mt-2 border-[#D3E3FF]"
                      />
                      <p className="text-sm text-gray-500 mt-1">URL-friendly identifier (e.g., aws-saa-c03)</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Live Preview */}
                <Card className="border-[#D3E3FF]">
                  <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border border-[#D3E3FF] rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0C1A35] mb-1">
                            {formData.name || "Exam Name"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-[#0C1A35]/70 mb-2">
                            <span className="font-medium">{formData.provider || "Provider"}</span>
                            <span>•</span>
                            <span>{formData.code || "CODE"}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#0C1A35]/60">
                            <span>{formData.practice_exams || 0} Practice Exams</span>
                            <span>{formData.questions || 0} Questions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#10B981]">
                          <Clock className="w-3 h-3" />
                          <span>{formData.updated || "Just now"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                    {loading ? "Saving..." : (editing ? "Update Exam" : "Create Exam")}
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
                placeholder="Recently Updated Exams"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Stay current with the latest exam updates"
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
      
      {/* Exams Table */}
      <Card className="border-[#D3E3FF]">
        <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#10B981]/5">
          <CardTitle>All Recently Updated Exams ({exams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-center">Exams/Questions</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">No exams found</p>
                        <p className="text-sm text-gray-500">Click "Add Exam" to add a recently updated exam</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="text-center font-mono text-sm">{exam.order ?? 0}</TableCell>
                      <TableCell className="font-medium">{exam.name || exam.title || "N/A"}</TableCell>
                      <TableCell>{exam.provider || "N/A"}</TableCell>
                      <TableCell><Badge variant="outline">{exam.code || "N/A"}</Badge></TableCell>
                      <TableCell className="text-sm text-[#10B981]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exam.updated || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {exam.practice_exams || 0} / {exam.questions || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={exam.is_active ? "default" : "secondary"} className="bg-[#10B981]">
                          {exam.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(exam)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(exam.id)}
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

      {/* Preview Section */}
      <Card className="border-[#D3E3FF] mt-6">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
          <CardTitle className="text-xl">Homepage Preview</CardTitle>
          <p className="text-sm text-gray-600 mt-1">How this section appears on the homepage</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-gradient-to-b from-[#0C1A35]/2 to-white py-8 rounded-lg">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
              {sectionSettings.heading || "Recently Updated Exams"}
            </h2>
            <p className="text-center text-[#0C1A35]/70 text-sm sm:text-base md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto px-2">
              {sectionSettings.subtitle || "Stay current with the latest exam updates"}
            </p>
            <div className="max-w-5xl mx-auto">
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {exams.filter(exam => exam.is_active).slice(0, 3).map((exam, index) => (
                  <div
                    key={exam.id || index}
                    className="bg-white border border-[#DDE7FF] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-[0_6px_20px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all shadow-[0_2px_8px_rgba(26,115,232,0.08)]"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-[#1A73E8]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-[#0C1A35] text-lg">{exam.title || exam.name}</h3>
                          <Badge
                            variant="outline"
                            className="text-xs border-[#D3E3FF] text-[#0C1A35] font-medium"
                          >
                            {exam.code}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#0C1A35]/60 mb-2">{exam.provider}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          {exam.badge && (
                            <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] text-xs">
                              {exam.badge}
                            </Badge>
                          )}
                          <p className="text-sm text-[#0C1A35]/60">
                            {(() => {
                              // Use actual count from practice_tests_list if available
                              if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
                                return exam.practice_tests_list.length;
                              }
                              return exam.practice_exams || 0;
                            })()} Practice Exams · {(() => {
                              // Calculate total questions from practice tests list if available
                              if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
                                const totalQuestions = exam.practice_tests_list.reduce((sum, test) => {
                                  const testQuestions = parseInt(test.questions) || 0;
                                  return sum + testQuestions;
                                }, 0);
                                return totalQuestions > 0 ? totalQuestions : (exam.questions || 0);
                              }
                              return exam.questions || 0;
                            })()} Questions
                          </p>
                        </div>
                      </div>
                    </div>
                    {exam.slug && (
                      <Button
                        size="default"
                        className="bg-[#1A73E8] text-white hover:bg-[#1557B0] whitespace-nowrap"
                        asChild
                      >
                        <Link href={`/exam-details/${exam.slug}`}>
                          Practice Now
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
                {exams.filter(exam => exam.is_active).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active exams to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

