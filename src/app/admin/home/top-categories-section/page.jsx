"use client";

import { useState, useEffect } from "react";
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
import { Eye, Save } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const FONT_SIZES = [
  { value: "text-2xl", label: "2XL" },
  { value: "text-3xl", label: "3XL" },
  { value: "text-4xl", label: "4XL (Default)" },
  { value: "text-5xl", label: "5XL" },
  { value: "text-6xl", label: "6XL" },
];

const FONT_FAMILIES = [
  { value: "font-normal", label: "Normal" },
  { value: "font-medium", label: "Medium" },
  { value: "font-semibold", label: "Semibold" },
  { value: "font-bold", label: "Bold (Default)" },
  { value: "font-extrabold", label: "Extrabold" },
];

const TEXT_COLORS = [
  { value: "text-[#0C1A35]", label: "Dark Blue (Default)" },
  { value: "text-gray-900", label: "Gray 900" },
  { value: "text-gray-800", label: "Gray 800" },
  { value: "text-[#1A73E8]", label: "Primary Blue" },
  { value: "text-indigo-600", label: "Indigo" },
  { value: "text-purple-600", label: "Purple" },
];

const SUBTITLE_SIZES = [
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Base" },
  { value: "text-lg", label: "Large (Default)" },
  { value: "text-xl", label: "XL" },
];

export default function TopCategoriesSectionAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    heading: "Top Certification Categories",
    subtitle: "Explore certifications by category",
    heading_font_family: "font-bold",
    heading_font_size: "text-4xl",
    heading_color: "text-[#0C1A35]",
    subtitle_font_size: "text-lg",
    subtitle_color: "text-[#0C1A35]/70",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/top-categories-section/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/top-categories-section/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success || res.ok) {
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">
            Top Categories Section Settings
          </h1>
          <p className="text-[#0C1A35]/60 mt-1">
            Customize the heading, subtitle, and styling for the Top Categories section
          </p>
        </div>
        <Button
          onClick={() => window.open("/", "_blank")}
          variant="outline"
          className="gap-2"
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

      <div className="grid gap-6">
        {/* Main Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Section Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Heading */}
              <div>
                <Label htmlFor="heading">Section Heading *</Label>
                <Input
                  id="heading"
                  value={formData.heading}
                  onChange={(e) =>
                    setFormData({ ...formData, heading: e.target.value })
                  }
                  placeholder="Top Certification Categories"
                  required
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Main heading displayed at the top of the section
                </p>
              </div>

              {/* Subtitle */}
              <div>
                <Label htmlFor="subtitle">Section Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Explore certifications by category"
                  rows={2}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional subtitle shown below the heading
                </p>
              </div>

              {/* Heading Font Styling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="heading_font_size">Heading Font Size</Label>
                  <Select
                    value={formData.heading_font_size}
                    onValueChange={(value) =>
                      setFormData({ ...formData, heading_font_size: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="heading_font_family">Heading Font Weight</Label>
                  <Select
                    value={formData.heading_font_family}
                    onValueChange={(value) =>
                      setFormData({ ...formData, heading_font_family: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((family) => (
                        <SelectItem key={family.value} value={family.value}>
                          {family.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="heading_color">Heading Color</Label>
                  <Select
                    value={formData.heading_color}
                    onValueChange={(value) =>
                      setFormData({ ...formData, heading_color: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subtitle Font Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtitle_font_size">Subtitle Font Size</Label>
                  <Select
                    value={formData.subtitle_font_size}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subtitle_font_size: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBTITLE_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subtitle_color">Subtitle Color</Label>
                  <Select
                    value={formData.subtitle_color}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subtitle_color: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-[#0C1A35]/70">
                        Dark Blue 70% (Default)
                      </SelectItem>
                      <SelectItem value="text-gray-600">Gray 600</SelectItem>
                      <SelectItem value="text-gray-500">Gray 500</SelectItem>
                      <SelectItem value="text-[#1A73E8]/80">
                        Primary Blue 80%
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* SEO Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                  placeholder="Best Certification Categories 2024"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_keywords: e.target.value })
                  }
                  placeholder="certification, categories, IT exams, cloud computing"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Comma-separated keywords</p>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description: e.target.value })
                  }
                  placeholder="Explore top certification categories including Cloud, Security, Networking, and more..."
                  rows={3}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 150-160 characters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#F5F8FC] p-12 rounded-lg">
              <div className="text-center">
                <h2
                  className={`${formData.heading_font_size} ${formData.heading_font_family} ${formData.heading_color} mb-4`}
                >
                  {formData.heading}
                </h2>
                {formData.subtitle && (
                  <p
                    className={`${formData.subtitle_font_size} ${formData.subtitle_color} max-w-2xl mx-auto`}
                  >
                    {formData.subtitle}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              This is how your section heading and subtitle will appear on the home page
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
