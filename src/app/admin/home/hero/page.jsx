"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Eye, Save, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function HeroSectionAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    background_image_url: "",
    stats: []
  });
  
  useEffect(() => {
    fetchHeroSection();
  }, []);
  
  const fetchHeroSection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/hero/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        // Ensure stats is always an array
        setFormData({
          ...data.data,
          stats: data.data.stats || []
        });
      }
    } catch (error) {
      console.error("Error fetching hero section:", error);
    }
  };
  
  const handleAddStat = () => {
    setFormData({
      ...formData,
      stats: [...(formData.stats || []), { value: "", label: "" }]
    });
  };
  
  const handleRemoveStat = (index) => {
    const newStats = formData.stats.filter((_, i) => i !== index);
    setFormData({ ...formData, stats: newStats });
  };
  
  const handleStatChange = (index, field, value) => {
    const newStats = [...formData.stats];
    newStats[index][field] = value;
    setFormData({ ...formData, stats: newStats });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/hero/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Hero section updated successfully!");
        fetchHeroSection();
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
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Hero Section Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage the main hero banner with title, subtitle, and analytics stats</p>
        </div>
        <Button
          onClick={() => window.open("/", "_blank")}
          variant="outline"
          className="gap-2 border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10"
        >
          <Eye className="w-4 h-4" />
          Preview Home
        </Button>
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
            <CardTitle className="text-xl text-[#0C1A35]">Hero Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="title" className="text-[#0C1A35] font-semibold">Hero Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Your Shortcut to Passing Any Certification Exam"
                required
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
              <p className="text-sm text-gray-500 mt-1">Main heading displayed prominently on home page</p>
            </div>
            
            <div>
              <Label htmlFor="subtitle" className="text-[#0C1A35] font-semibold">Hero Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                placeholder="Accurate, updated, exam-style questions trusted by thousands..."
                rows={3}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
              <p className="text-sm text-gray-500 mt-1">Descriptive text below the title</p>
            </div>
            
            <div>
              <Label htmlFor="background_image_url" className="text-[#0C1A35] font-semibold">Background Image URL</Label>
              <Input
                id="background_image_url"
                value={formData.background_image_url}
                onChange={(e) => setFormData({...formData, background_image_url: e.target.value})}
                placeholder="https://example.com/hero-bg.jpg"
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
              <p className="text-sm text-gray-500 mt-1">Optional background image for hero section</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Analytics Stats */}
        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
                <CardTitle className="text-xl text-[#0C1A35]">Analytics Stats</CardTitle>
              </div>
              <Button
                type="button"
                onClick={handleAddStat}
                size="sm"
                className="gap-2 bg-[#10B981] hover:bg-[#059669]"
              >
                <Plus className="w-4 h-4" />
                Add Stat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {formData.stats && formData.stats.length > 0 ? (
              <div className="space-y-4">
                {formData.stats.map((stat, index) => (
                  <Card key={index} className="border-[#D3E3FF] bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`stat-value-${index}`} className="text-sm">Value *</Label>
                            <Input
                              id={`stat-value-${index}`}
                              value={stat.value}
                              onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                              placeholder="94% or 1.8M+"
                              required
                              className="mt-1 border-[#D3E3FF]"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`stat-label-${index}`} className="text-sm">Label *</Label>
                            <Input
                              id={`stat-label-${index}`}
                              value={stat.label}
                              onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                              placeholder="matched real exam difficulty"
                              required
                              className="mt-1 border-[#D3E3FF]"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveStat(index)}
                          className="mt-6 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No analytics stats added yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Stat" to add success metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Live Preview */}
        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-purple-500/5">
            <CardTitle className="text-xl text-[#0C1A35]">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-gradient-to-br from-[#0C1A35] to-[#1A73E8] p-8 rounded-lg text-white">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {formData.title || "Your Hero Title Here"}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8">
                  {formData.subtitle || "Your hero subtitle will appear here..."}
                </p>
                {formData.stats && formData.stats.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {formData.stats.map((stat, index) => (
                      <div key={index} className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-white/80 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Preview of how the hero section will appear on the home page
            </p>
          </CardContent>
        </Card>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-6 text-lg bg-gradient-to-r from-[#1A73E8] to-[#1557B0] hover:from-[#1557B0] hover:to-[#1A73E8]"
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? "Saving..." : "Save Hero Section"}
        </Button>
      </form>
    </div>
  );
}

