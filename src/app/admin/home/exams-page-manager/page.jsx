"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const AVAILABLE_ICONS = [
  { value: "CheckCircle2", label: "Check Circle ✅" },
  { value: "Clock", label: "Clock ⏰" },
  { value: "Users", label: "Users 👥" },
  { value: "BarChart3", label: "Bar Chart 📊" },
  { value: "TrendingUp", label: "Trending Up 📈" },
  { value: "Star", label: "Star ⭐" },
  { value: "Sparkles", label: "Sparkles ✨" },
];

export default function ExamsPageManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // SEO states
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoMessage, setSeoMessage] = useState("");
  const [seoData, setSeoData] = useState({
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  // Trust Bar State
  const [trustBarItems, setTrustBarItems] = useState([
    { icon: "CheckCircle2", label: "94% Match", description: "Real exam difficulty" },
    { icon: "Clock", label: "Daily Updates", description: "Fresh content" },
    { icon: "Users", label: "Trusted by 1000s", description: "Active learners" },
    { icon: "BarChart3", label: "Real Exam Style", description: "Authentic questions" }
  ]);

  // About Section State
  const [aboutHeading, setAboutHeading] = useState("About All Popular Exams Preparation");
  const [aboutContent, setAboutContent] = useState("");

  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      setMessage("❌ Authentication failed. Please log in as admin.");
      setTimeout(() => {
        router.push("/admin/auth");
      }, 2000);
      return;
    }

    fetchData();
    fetchSeoData();
  }, []);

  // Fetch SEO Data
  const fetchSeoData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/exams-page-seo/`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 404 || !res.ok) {
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setSeoData({
          meta_title: data.data.meta_title || "",
          meta_keywords: data.data.meta_keywords || "",
          meta_description: data.data.meta_description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
    }
  };

  // Save SEO Data
  const handleSaveSeo = async () => {
    setSeoLoading(true);
    setSeoMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/exams-page-seo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(seoData),
      });
      if (res.status === 401) {
        setSeoMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setSeoLoading(false);
        return;
      }
      if (res.status === 404) {
        setSeoMessage("❌ API endpoint not found.");
        setSeoLoading(false);
        return;
      }
      if (!res.ok) {
        setSeoMessage("❌ Error: " + res.statusText);
        setSeoLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSeoMessage("✅ SEO meta information saved successfully!");
        setTimeout(() => setSeoMessage(""), 3000);
      } else {
        setSeoMessage("❌ Error: " + (data.error || "Failed to save"));
      }
    } catch (error) {
      setSeoMessage("❌ Error: " + error.message);
    } finally {
      setSeoLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch trust bar
      const trustBarRes = await fetch(`${API_BASE_URL}/api/home/admin/exams-trust-bar/`, {
        headers: getAuthHeaders()
      });

      if (trustBarRes.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const trustBarData = await trustBarRes.json();
      if (trustBarData.success && trustBarData.data.length > 0) {
        setTrustBarItems(trustBarData.data);
      }

      // Fetch about section
      const aboutRes = await fetch(`${API_BASE_URL}/api/home/admin/exams-about/`, {
        headers: getAuthHeaders()
      });

      const aboutData = await aboutRes.json();
      if (aboutData.success) {
        setAboutHeading(aboutData.data.heading || "About All Popular Exams Preparation");
        setAboutContent(aboutData.data.content || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("❌ Error loading data. Check console for details.");
    }
  };

  const handleSaveTrustBar = async () => {
    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/exams-trust-bar/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ items: trustBarItems })
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Trust bar updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to update"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/exams-about/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          heading: aboutHeading,
          content: aboutContent
        })
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ About section updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to update"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for trust bar items
  const addTrustBarItem = () => {
    setTrustBarItems([...trustBarItems, { icon: "CheckCircle2", label: "", description: "" }]);
  };

  const removeTrustBarItem = (index) => {
    setTrustBarItems(trustBarItems.filter((_, i) => i !== index));
  };

  const updateTrustBarItem = (index, field, value) => {
    const updated = [...trustBarItems];
    updated[index][field] = value;
    setTrustBarItems(updated);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">Exams Page Manager</h1>
        <p className="text-[#0C1A35]/60">Manage content displayed on the /exams page</p>
      </div>

      {/* SEO Meta Information Card */}
      <Card className="mb-6 border border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-[#0C1A35]">SEO Meta Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo_meta_title">Meta Title</Label>
            <Input
              id="seo_meta_title"
              value={seoData.meta_title}
              onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
              placeholder="Enter meta title (50-60 characters recommended)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Appears in search engine results</p>
          </div>
          <div>
            <Label htmlFor="seo_meta_keywords">Meta Keywords</Label>
            <Input
              id="seo_meta_keywords"
              value={seoData.meta_keywords}
              onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
              placeholder="Enter meta keywords (comma-separated)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
          </div>
          <div>
            <Label htmlFor="seo_meta_description">Meta Description</Label>
            <Textarea
              id="seo_meta_description"
              value={seoData.meta_description}
              onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
              placeholder="Enter meta description (150-160 characters recommended)"
              className="mt-1"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Brief description for search engines</p>
          </div>
          {seoMessage && (
            <div className={`p-3 rounded-lg ${seoMessage.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {seoMessage}
            </div>
          )}
          <Button
            onClick={handleSaveSeo}
            disabled={seoLoading}
            className="w-fit"
          >
            {seoLoading ? "Saving..." : "Save SEO Meta Information"}
          </Button>
        </CardContent>
      </Card>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => window.open("/exams", "_blank")}
          variant="outline"
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview Exams Page
        </Button>
      </div>

      <Tabs defaultValue="trust-bar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trust-bar">Trust Bar</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
        </TabsList>

        <TabsContent value="trust-bar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trust Bar Items</CardTitle>
              <p className="text-sm text-gray-500">Shown below the search bar on exams page</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {trustBarItems.map((item, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Select
                        value={item.icon}
                        onValueChange={(value) => updateTrustBarItem(index, "icon", value)}
                      >
                        <SelectTrigger className="w-48">
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
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeTrustBarItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={item.label}
                      onChange={(e) => updateTrustBarItem(index, "label", e.target.value)}
                      placeholder="Label (e.g., 94% Match)"
                    />
                    <Input
                      value={item.description}
                      onChange={(e) => updateTrustBarItem(index, "description", e.target.value)}
                      placeholder="Description (e.g., Real exam difficulty)"
                    />
                  </div>
                </Card>
              ))}

              <Button onClick={addTrustBarItem} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Trust Bar Item
              </Button>

              <Button
                onClick={handleSaveTrustBar}
                disabled={loading}
                className="w-full bg-[#1A73E8] hover:bg-[#1557B0]"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Trust Bar"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <p className="text-sm text-gray-500">Shown at the bottom of exams page</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input
                  value={aboutHeading}
                  onChange={(e) => setAboutHeading(e.target.value)}
                  placeholder="About All Popular Exams Preparation"
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  placeholder="Enter content here. Use double line breaks (press Enter twice) to separate paragraphs."
                  rows={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use two line breaks (press Enter twice) to create separate paragraphs
                </p>
              </div>

              <Button
                onClick={handleSaveAbout}
                disabled={loading}
                className="w-full bg-[#1A73E8] hover:bg-[#1557B0]"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save About Section"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

