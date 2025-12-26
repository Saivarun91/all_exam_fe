"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";

const AVAILABLE_ICONS = [
  "Target",
  "Eye",
  "Heart",
  "Users",
  "Award",
  "Lightbulb",
  "Quote",
  "BookOpen",
  "Clock",
  "CheckCircle",
  "UserCheck",
  "FileText",
  "BarChart3",
  "MessageSquare",
  "HelpCircle",
  "MousePointerClick",
  "TestTubes",
  "GraduationCap",
  "Briefcase",
  "TrendingUp",
  "Star",
  "Zap",
  "Shield",
  "Globe",
  "Rocket",
];

export default function AdminAboutPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [aboutData, setAboutData] = useState({
    hero_title: "About PrepTara",
    hero_subtitle: "Empowering learners. Inspiring success.",
    mission_title: "Our Mission",
    mission_description:
      "To democratize quality education and make competitive exam preparation accessible to every aspiring student across India. We believe that with the right guidance and tools, every student can achieve their dreams.",
    vision_title: "Our Vision",
    vision_description:
      "To become India's most trusted and comprehensive platform for competitive exam preparation, helping millions of students transform their aspirations into achievements through technology and innovation.",
    stats: [
      { icon: "UserCheck", number: "50,000+", label: "Active Students" },
      { icon: "BookOpen", number: "1,000+", label: "Practice Tests" },
      { icon: "CheckCircle", number: "98%", label: "Success Rate" },
      { icon: "Clock", number: "24/7", label: "Support" },
    ],
    values_title: "Our Values",
    values_subtitle: "The principles that guide everything we do",
    values: [
      {
        icon: "Lightbulb",
        title: "Innovation",
        description: "Continuously improving our platform with cutting-edge technology",
      },
      {
        icon: "Heart",
        title: "Student First",
        description: "Every decision we make puts student success at the center",
      },
      {
        icon: "Award",
        title: "Excellence",
        description: "Committed to delivering the highest quality education",
      },
      {
        icon: "Users",
        title: "Community",
        description: "Building a supportive network of learners and educators",
      },
    ],
    story_title: "Our Story",
    story_paragraphs: [
      "PrepTara was born from a simple observation: millions of talented students across India struggle to access quality preparation resources for competitive exams. In 2020, a group of educators and technologists came together with a mission to change this.",
      "We started with a vision to create a platform that combines the best of technology and pedagogy. Today, PrepTara serves over 50,000 students across India, offering comprehensive preparation for UPSC, SSC, Banking, NEET, JEE, CAT, and many other competitive examinations.",
      "Our journey has just begun, and we're committed to continuously evolving our platform to meet the changing needs of students and the education landscape.",
    ],
    story_image_url: "",
    quote_text: "Empowering learners. Inspiring success.",
    quote_author: "PrepTara Team",
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/home/about/`);
        const data = await res.json();
        if (data.success && data.data) {
          const sanitizedData = {
            ...data.data,
            hero_title: data.data.hero_title || "",
            hero_subtitle: data.data.hero_subtitle || "",
            mission_title: data.data.mission_title || "",
            mission_description: data.data.mission_description || "",
            vision_title: data.data.vision_title || "",
            vision_description: data.data.vision_description || "",
            values_title: data.data.values_title || "",
            values_subtitle: data.data.values_subtitle || "",
            story_title: data.data.story_title || "",
            story_image_url: data.data.story_image_url || "",
            quote_text: data.data.quote_text || "",
            quote_author: data.data.quote_author || "",
            stats: (data.data.stats || []).map((stat) => ({
              icon: stat.icon || "",
              number: stat.number || "",
              label: stat.label || "",
            })),
            values: (data.data.values || []).map((value) => ({
              icon: value.icon || "",
              title: value.title || "",
              description: value.description || "",
            })),
            story_paragraphs: (data.data.story_paragraphs || []).map((para) => para || ""),
          };

          setAboutData(sanitizedData);
        }
      } catch (err) {
        console.error("Failed to fetch about data:", err);
      }
    };

    fetchAboutData();
  }, []);

  const handleChange = (field, value) => {
    setAboutData({ ...aboutData, [field]: value });
  };

  const handleStatChange = (index, field, value) => {
    const newStats = [...aboutData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    handleChange("stats", newStats);
  };

  const addStat = () => {
    handleChange("stats", [...aboutData.stats, { icon: "Award", number: "", label: "" }]);
  };

  const removeStat = (index) => {
    handleChange(
      "stats",
      aboutData.stats.filter((_, i) => i !== index)
    );
  };

  const handleValueChange = (index, field, value) => {
    const newValues = [...aboutData.values];
    newValues[index] = { ...newValues[index], [field]: value };
    handleChange("values", newValues);
  };

  const addValue = () => {
    handleChange("values", [...aboutData.values, { icon: "Award", title: "", description: "" }]);
  };

  const removeValue = (index) => {
    handleChange(
      "values",
      aboutData.values.filter((_, i) => i !== index)
    );
  };

  const handleStoryParagraphChange = (index, value) => {
    const newParagraphs = [...aboutData.story_paragraphs];
    newParagraphs[index] = value;
    handleChange("story_paragraphs", newParagraphs);
  };

  const addStoryParagraph = () => {
    handleChange("story_paragraphs", [...aboutData.story_paragraphs, ""]);
  };

  const removeStoryParagraph = (index) => {
    handleChange(
      "story_paragraphs",
      aboutData.story_paragraphs.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/about/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ About section saved successfully!");
        if (data.id) {
          setAboutData({ ...aboutData, id: data.id });
        }
      } else {
        setMessage(`❌ ${data.message || "Failed to save"}`);
      }
    } catch (err) {
      setMessage("❌ Failed to save about section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Manage About Page</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <Card id="hero">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Hero Section</h2>
            <div>
              <Label>Hero Title</Label>
              <Input
                value={aboutData.hero_title || ""}
                onChange={(e) => handleChange("hero_title", e.target.value)}
              />
            </div>

            <div>
              <Label>Hero Subtitle</Label>
              <Input
                value={aboutData.hero_subtitle || ""}
                onChange={(e) => handleChange("hero_subtitle", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <Card id="mission">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Mission & Vision</h2>

            <div>
              <Label>Mission Title</Label>
              <Input
                value={aboutData.mission_title || ""}
                onChange={(e) => handleChange("mission_title", e.target.value)}
              />
            </div>

            <div>
              <Label>Mission Description</Label>
              <Textarea
                value={aboutData.mission_description || ""}
                onChange={(e) => handleChange("mission_description", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Vision Title</Label>
              <Input
                value={aboutData.vision_title || ""}
                onChange={(e) => handleChange("vision_title", e.target.value)}
              />
            </div>

            <div>
              <Label>Vision Description</Label>
              <Textarea
                value={aboutData.vision_description || ""}
                onChange={(e) => handleChange("vision_description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card id="stats">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Stats</h2>
              <Button type="button" onClick={addStat} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Stat
              </Button>
            </div>

            {aboutData.stats.map((stat, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Stat {index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStat(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Icon</Label>
                    <select
                      className="w-full border px-3 py-2 rounded-md"
                      value={stat.icon || ""}
                      onChange={(e) => handleStatChange(index, "icon", e.target.value)}
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Number</Label>
                    <Input
                      value={stat.number || ""}
                      onChange={(e) => handleStatChange(index, "number", e.target.value)}
                      placeholder="50,000+"
                    />
                  </div>

                  <div>
                    <Label>Label</Label>
                    <Input
                      value={stat.label || ""}
                      onChange={(e) => handleStatChange(index, "label", e.target.value)}
                      placeholder="Active Students"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Values */}
        <Card id="values">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Values</h2>
              <Button type="button" onClick={addValue} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Value
              </Button>
            </div>

            <div>
              <Label>Values Title</Label>
              <Input
                value={aboutData.values_title || ""}
                onChange={(e) => handleChange("values_title", e.target.value)}
              />
            </div>

            <div>
              <Label>Values Subtitle</Label>
              <Input
                value={aboutData.values_subtitle || ""}
                onChange={(e) => handleChange("values_subtitle", e.target.value)}
              />
            </div>

            {aboutData.values.map((value, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Value {index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeValue(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Icon</Label>
                    <select
                      className="w-full border px-3 py-2 rounded-md"
                      value={value.icon || ""}
                      onChange={(e) => handleValueChange(index, "icon", e.target.value)}
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={value.title || ""}
                      onChange={(e) => handleValueChange(index, "title", e.target.value)}
                      placeholder="Innovation"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={value.description || ""}
                      onChange={(e) => handleValueChange(index, "description", e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Story Section */}
        <Card id="story">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Story Section</h2>

            <div>
              <Label>Story Title</Label>
              <Input
                value={aboutData.story_title || ""}
                onChange={(e) => handleChange("story_title", e.target.value)}
              />
            </div>

            <div>
              <Label>Story Image URL</Label>
              <Input
                value={aboutData.story_image_url || ""}
                onChange={(e) => handleChange("story_image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Story Paragraphs</Label>
                <Button type="button" onClick={addStoryParagraph} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Paragraph
                </Button>
              </div>

              {aboutData.story_paragraphs.map((para, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <Textarea
                    value={para || ""}
                    onChange={(e) => handleStoryParagraphChange(index, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStoryParagraph(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quote */}
        <Card id="quote">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Quote</h2>

            <div>
              <Label>Quote Text</Label>
              <Input
                value={aboutData.quote_text || ""}
                onChange={(e) => handleChange("quote_text", e.target.value)}
              />
            </div>

            <div>
              <Label>Quote Author</Label>
              <Input
                value={aboutData.quote_author || ""}
                onChange={(e) => handleChange("quote_author", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save About Section"}
        </Button>
      </form>
    </div>
  );
}
