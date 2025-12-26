"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Edit, Trash2, Eye, Gift, Clock, Brain, CheckCircle, Users, FileText, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const AVAILABLE_ICONS = [
  { value: "Gift", label: "Gift 🎁", icon: Gift },
  { value: "Clock", label: "Clock ⏰", icon: Clock },
  { value: "Brain", label: "Brain 🧠", icon: Brain },
  { value: "CheckCircle", label: "Check Circle ✅", icon: CheckCircle },
  { value: "Users", label: "Users 👥", icon: Users },
  { value: "FileText", label: "File Text 📄", icon: FileText },
];

const ICON_MAP = {
  Gift,
  Clock,
  Brain,
  CheckCircle,
  Users,
  FileText,
};

export default function ValuePropositionsAdmin() {
  const router = useRouter();
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Why Choose AllExamQuestions?",
    subtitle: "Everything you need to ace your certification exam in one place",
    heading_font_family: "font-bold",
    heading_font_size: "text-4xl",
    heading_color: "text-[#0C1A35]",
    subtitle_font_size: "text-lg",
    subtitle_color: "text-[#0C1A35]/70",
    meta_title: "",
    meta_keywords: "",
    meta_description: ""
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "Gift",
    order: 0,
  });
  
  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      setMessage("❌ Authentication failed. Please log in as admin.");
      setTimeout(() => {
        router.push("/admin/auth");
      }, 2000);
      return;
    }
    
    fetchPropositions();
    fetchSectionSettings();
  }, []);
  
  const fetchPropositions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/value-propositions/`, {
        headers: getAuthHeaders()
      });
      
      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        setPropositions(data.data);
      } else {
        console.error("Failed to fetch propositions:", data);
      }
    } catch (error) {
      console.error("Error fetching propositions:", error);
      setMessage("❌ Error loading data. Check console for details.");
    }
  };
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/value-propositions-section/`, {
        headers: getAuthHeaders()
      });
      
      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        setSectionSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching section settings:", error);
    }
  };
  
  const handleSectionSettingsUpdate = async () => {
    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/value-propositions-section/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionSettings),
      });
      
      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }
      
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
  
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "Gift",
      order: 0,
    });
    setEditing(null);
  };
  
  const handleEdit = (prop) => {
    setEditing(prop);
    setFormData({
      title: prop.title || "",
      description: prop.description || "",
      icon: prop.icon || "Gift",
      order: prop.order || 0,
    });
    setDialogOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const url = editing
        ? `${API_BASE_URL}/api/home/admin/value-propositions/${editing.id}/`
        : `${API_BASE_URL}/api/home/admin/value-propositions/`;
      
      const method = editing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      
      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${editing ? "Updated" : "Added"} successfully!`);
        fetchPropositions();
        setDialogOpen(false);
        resetForm();
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
  
  const handleDelete = async (id) => {
    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }
    
    if (!confirm("Are you sure you want to delete this proposition?")) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/value-propositions/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Deleted successfully!");
        fetchPropositions();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to delete"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">Value Propositions Manager</h1>
        <p className="text-[#0C1A35]/60">Manage the "Why Choose AllExamQuestions?" section</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
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
                placeholder="Why Choose AllExamQuestions?"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Everything you need..."
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

      {/* Propositions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Value Propositions</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open("/", "_blank")}
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Home
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0]" onClick={resetForm}>
                    <Plus className="w-4 h-4" />
                    Add Proposition
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editing ? "Edit Value Proposition" : "Add New Value Proposition"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Feature Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="100% Free to Start"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Access practice questions at no cost"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label>Icon</Label>
                      <Select value={formData.icon} onValueChange={(value) => setFormData({...formData, icon: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ICONS.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={loading} className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                        {loading ? "Saving..." : editing ? "Update" : "Add"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propositions.map((prop) => {
                const IconComponent = ICON_MAP[prop.icon] || Gift;
                return (
                  <TableRow key={prop.id}>
                    <TableCell>{prop.order}</TableCell>
                    <TableCell>
                      <IconComponent className="w-5 h-5 text-[#1A73E8]" />
                    </TableCell>
                    <TableCell className="font-medium">{prop.title}</TableCell>
                    <TableCell className="max-w-md truncate">{prop.description}</TableCell>
                    <TableCell>
                      <Badge variant={prop.is_active ? "default" : "secondary"}>
                        {prop.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(prop)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(prop.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {propositions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No value propositions yet. Click "Add Proposition" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="border-[#D3E3FF] mt-6">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
          <CardTitle className="text-xl">Homepage Preview</CardTitle>
          <p className="text-sm text-gray-600 mt-1">How this section appears on the homepage</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-[#0F1F3C]/10 py-12 md:py-20 rounded-lg">
            <div className="container mx-auto px-4">
              <h2 className={`text-2xl sm:text-3xl md:${sectionSettings.heading_font_size || 'text-4xl'} ${sectionSettings.heading_font_family || 'font-bold'} ${sectionSettings.heading_color || 'text-[#0C1A35]'} text-center mb-3 md:mb-4 px-2`}>
                {sectionSettings.heading || "Why Choose AllExamQuestions?"}
              </h2>

              <p className={`text-center ${sectionSettings.subtitle_color || 'text-[#0C1A35]/70'} text-sm sm:text-base md:${sectionSettings.subtitle_font_size || 'text-lg'} mb-8 md:mb-12 max-w-2xl mx-auto px-2`}>
                {sectionSettings.subtitle || "Everything you need to ace your certification exam in one place"}
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propositions.filter(prop => prop.is_active).map((feature, index) => {
                  const Icon = ICON_MAP[feature.icon] || Gift;
                  return (
                    <Card
                      key={feature.id || index}
                      className="border-[#D3E3FF] bg-white hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] transition-shadow"
                    >
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mx-auto">
                          <Icon className="w-8 h-8 text-[#1A73E8]" />
                        </div>

                        <h3 className="text-xl font-bold text-[#0C1A35]">
                          {feature.title}
                        </h3>

                        <p className="text-[#0C1A35]/70">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {propositions.filter(prop => prop.is_active).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No active value propositions to preview</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
