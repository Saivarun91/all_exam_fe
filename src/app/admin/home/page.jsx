"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Award,
  Star,
  Layers,
  Building2,
  Quote,
  FileText,
  Clock,
  HelpCircle,
  Mail,
  Home,
  Save,
  Search as SearchIcon,
} from "lucide-react";
import { motion } from "framer-motion";

// Import all page components
import HeroSectionAdmin from "../home/hero/page";
import FeaturedExamsAdmin from "../home/featured-exams/page";
import ValuePropositionsAdmin from "../home/value-propositions/page";
import TopCategoriesAdmin from "../home/top-categories/page";
import PopularProvidersAdmin from "../home/popular-providers/page";
import TestimonialsAdmin from "../home/testimonials/page";
import BlogPostsAdmin from "../home/blog-posts/page";
import RecentlyUpdatedAdmin from "../home/recently-updated/page";
import FAQsAdmin from "../home/faqs/page";
import EmailSubscribeSectionAdmin from "../home/email-subscribe/page";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function AdminHomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [activeTab, setActiveTab] = useState("hero");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoMessage, setSeoMessage] = useState("");
  const [seoData, setSeoData] = useState({
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  // ------------------ Auth Check ------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "admin") {
      setIsAuthenticated(true);
      fetchSeoData();
    } else {
      router.push("/admin/auth");
    }
  }, [router]);

  // ------------------ Fetch SEO Data ------------------
  const fetchSeoData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/home-page-seo/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401) {
        router.push("/admin/auth");
        return;
      }

      if (res.status === 404) {
        // Endpoint doesn't exist yet, use default empty values
        console.log("SEO endpoint not found, using default values");
        return;
      }

      if (!res.ok) {
        console.error("Error fetching SEO data:", res.statusText);
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
      // Don't show error to user if endpoint doesn't exist yet
    }
  };

  // ------------------ Save SEO Data ------------------
  const handleSaveSeo = async () => {
    setSeoLoading(true);
    setSeoMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/home-page-seo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
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
        setSeoMessage("❌ API endpoint not found. Please ensure the backend endpoint is configured.");
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

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "hero",
      name: "Hero Section",
      icon: Sparkles,
      component: HeroSectionAdmin,
    },
    {
      id: "featured-exams",
      name: "Featured Exams",
      icon: Award,
      component: FeaturedExamsAdmin,
    },
    {
      id: "value-propositions",
      name: "Value Propositions",
      icon: Star,
      component: ValuePropositionsAdmin,
    },
    {
      id: "top-categories",
      name: "Top Categories",
      icon: Layers,
      component: TopCategoriesAdmin,
    },
    {
      id: "popular-providers",
      name: "Popular Providers",
      icon: Building2,
      component: PopularProvidersAdmin,
    },
    {
      id: "testimonials",
      name: "Testimonials",
      icon: Quote,
      component: TestimonialsAdmin,
    },
    {
      id: "blog-posts",
      name: "Blog Posts",
      icon: FileText,
      component: BlogPostsAdmin,
    },
    {
      id: "recently-updated",
      name: "Recently Updated",
      icon: Clock,
      component: RecentlyUpdatedAdmin,
    },
    {
      id: "faqs",
      name: "FAQs",
      icon: HelpCircle,
      component: FAQsAdmin,
    },
    {
      id: "email-subscribe",
      name: "Email Subscribe",
      icon: Mail,
      component: EmailSubscribeSectionAdmin,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Home className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Home Page Management</h1>
          </div>
          <p className="text-gray-600">
            Manage all sections and content of your homepage
          </p>
        </div>

      {/* Main Content Area */}
      <div className="px-8 py-6">
        {/* SEO Meta Information Section */}
        <Card className="mb-6 border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
            <div className="flex items-center gap-2">
              <SearchIcon className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-xl text-[#0C1A35]">SEO Meta Information</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Configure SEO meta tags for the home page
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {seoMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  seoMessage.includes("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {seoMessage}
              </motion.div>
            )}

            <div>
              <Label htmlFor="meta_title" className="text-[#0C1A35] font-semibold">
                Meta Title
              </Label>
              <Input
                id="meta_title"
                value={seoData.meta_title}
                onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                placeholder="AllExamQuestions - Best Certification Exam Practice Questions"
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
              <p className="text-sm text-gray-500 mt-1">
                The title that appears in search engine results (recommended: 50-60 characters)
              </p>
            </div>

            <div>
              <Label htmlFor="meta_keywords" className="text-[#0C1A35] font-semibold">
                Meta Keywords
              </Label>
              <Input
                id="meta_keywords"
                value={seoData.meta_keywords}
                onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                placeholder="certification exams, practice questions, AWS, Azure, Cisco, IT certification"
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Comma-separated keywords relevant to your home page
              </p>
                    </div>

            <div>
              <Label htmlFor="meta_description" className="text-[#0C1A35] font-semibold">
                Meta Description
              </Label>
              <Textarea
                id="meta_description"
                value={seoData.meta_description}
                onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                placeholder="Ace your certification exams with accurate, updated practice questions. Trusted by thousands of professionals preparing for AWS, Azure, Cisco, and more."
                rows={3}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
              <p className="text-sm text-gray-500 mt-1">
                A brief description that appears in search results (recommended: 150-160 characters)
                    </p>
                  </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSeo}
                disabled={seoLoading}
                className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] hover:from-[#1557B0] hover:to-[#1A73E8]"
              >
                <Save className="w-4 h-4 mr-2" />
                {seoLoading ? "Saving..." : "Save SEO Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto mb-6 bg-white border border-gray-200 rounded-lg p-1 h-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <div className="bg-white rounded-lg">
                  <Component />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
        </div>
    </div>
  );
}
