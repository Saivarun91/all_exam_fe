"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Save, Mail } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function EmailSubscribeSectionAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    privacy_text: ""
  });
  
  useEffect(() => {
    fetchSection();
  }, []);
  
  const fetchSection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/email-subscribe-section/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setFormData(data.data || {
          title: "",
          subtitle: "",
          button_text: "",
          privacy_text: ""
        });
      }
    } catch (error) {
      console.error("Error fetching section:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/email-subscribe-section/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Email subscribe section updated successfully!");
        fetchSection();
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Email Subscribe Section (CTA)</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage the email subscription call-to-action on home page</p>
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

      <div className="max-w-4xl">
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Content */}
            <Card className="border-[#D3E3FF]">
              <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
                <CardTitle className="text-xl text-[#0C1A35]">Section Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="title" className="text-[#0C1A35] font-semibold">Section Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Get Free Weekly Exam Updates"
                    required
                    className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Main heading for the email subscription section</p>
                </div>
                
                <div>
                  <Label htmlFor="subtitle" className="text-[#0C1A35] font-semibold">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    placeholder="Latest dumps, new questions & exam alerts delivered to your inbox"
                    rows={2}
                    className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Descriptive text below title</p>
                </div>
                
                <div>
                  <Label htmlFor="button_text" className="text-[#0C1A35] font-semibold">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    placeholder="Subscribe"
                    className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Text displayed on the subscribe button</p>
                </div>
                
                <div>
                  <Label htmlFor="privacy_text" className="text-[#0C1A35] font-semibold">Privacy Text</Label>
                  <Textarea
                    id="privacy_text"
                    value={formData.privacy_text}
                    onChange={(e) => setFormData({...formData, privacy_text: e.target.value})}
                    placeholder="No spam. Unsubscribe anytime. Your privacy is protected."
                    rows={2}
                    className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Privacy assurance text shown below form</p>
                </div>
              </CardContent>
            </Card>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg bg-gradient-to-r from-[#1A73E8] to-[#1557B0] hover:from-[#1557B0] hover:to-[#1A73E8]"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? "Saving..." : "Save Email Subscribe Section"}
            </Button>
          </form>

          {/* Live Preview */}
          <Card className="border-[#D3E3FF]">
            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
              <CardTitle className="text-xl text-[#0C1A35]">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-[#1A73E8]/10 via-purple-500/10 to-[#10B981]/10 p-8 rounded-lg border border-[#D3E3FF]">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-16 h-16 bg-[#1A73E8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#0C1A35] mb-3">
                    {formData.title || "Email Subscribe Title"}
                  </h2>
                  <p className="text-lg text-[#0C1A35]/70 mb-6">
                    {formData.subtitle || "Subtitle will appear here..."}
                  </p>
                  <div className="flex gap-3 max-w-md mx-auto mb-4">
                    <Input 
                      placeholder="Enter your email" 
                      className="flex-1 border-[#D3E3FF]"
                      disabled
                    />
                    <Button className="bg-[#1A73E8] hover:bg-[#1557B0]" disabled>
                      {formData.button_text || "Subscribe"}
                    </Button>
                  </div>
                  <p className="text-sm text-[#0C1A35]/60">
                    {formData.privacy_text || "Privacy text will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
