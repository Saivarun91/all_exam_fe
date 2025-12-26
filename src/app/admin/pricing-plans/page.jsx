"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, Edit, Trash2, Star, Eye, Save, BookOpen, CheckCircle2, Clock, RefreshCw, Target, BarChart3, TrendingUp, Bell, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const AVAILABLE_ICONS = [
  { value: "BookOpen", label: "Book Open", icon: BookOpen },
  { value: "CheckCircle2", label: "Check Circle", icon: CheckCircle2 },
  { value: "Clock", label: "Clock", icon: Clock },
  { value: "RefreshCw", label: "Refresh", icon: RefreshCw },
  { value: "Target", label: "Target", icon: Target },
  { value: "BarChart3", label: "Bar Chart", icon: BarChart3 },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "Bell", label: "Bell", icon: Bell },
];

const ICON_MAP = {
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  Target,
  BarChart3,
  TrendingUp,
  Bell,
};

export default function PricingPlansAdmin() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("hero");
  
  // SEO states
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoMessage, setSeoMessage] = useState("");
  const [seoData, setSeoData] = useState({
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  // Hero Section
  const [heroData, setHeroData] = useState({
    title: "Choose Your Access Plan",
    subtitle: "Unlock full access for this exam — all questions, explanations, analytics, and unlimited attempts.",
  });

  // Pricing Plans
  const [pricingPlans, setPricingPlans] = useState([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    duration: "",
    duration_months: 1,
    duration_days: 30,
    price: "",
    original_price: "",
    discount_percentage: 0,
    per_day_cost: "",
    popular: false,
    features: [],
    status: "active",
  });

  // Features Section
  const [features, setFeatures] = useState([]);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureFormData, setFeatureFormData] = useState({
    icon: "BookOpen",
    title: "",
    description: "",
  });

  // Comparison Table
  const [comparisonRows, setComparisonRows] = useState([]);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [editingComparison, setEditingComparison] = useState(null);
  const [comparisonFormData, setComparisonFormData] = useState({
    feature: "",
    free_value: "",
    paid_value: "",
  });

  // Testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialFormData, setTestimonialFormData] = useState({
    name: "",
    text: "",
    rating: 5,
  });

  // FAQs
  const [faqs, setFaqs] = useState([]);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: "",
  });

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }
    fetchCourses();
    fetchSeoData();
  }, []);

  // Fetch SEO Data
  const fetchSeoData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/pricing-plans-seo/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/home/admin/pricing-plans-seo/`, {
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

  useEffect(() => {
    if (selectedCourse) {
      fetchPricingData();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Try admin endpoint first
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
        headers: getAuthHeaders()
      });
      
      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        setCourses(Array.isArray(data.data) ? data.data : []);
      } else if (data.success && data.courses) {
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      } else if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        // Fallback to public endpoint
        const publicRes = await fetch(`${API_BASE_URL}/api/courses/`);
        if (publicRes.ok) {
          const publicData = await publicRes.json();
          if (publicData.success && publicData.courses) {
            setCourses(Array.isArray(publicData.courses) ? publicData.courses : []);
          } else if (publicData.success && publicData.data) {
            setCourses(Array.isArray(publicData.data) ? publicData.data : []);
          } else if (Array.isArray(publicData)) {
            setCourses(publicData);
          } else {
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fallback to public endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.courses) {
            setCourses(Array.isArray(data.courses) ? data.courses : []);
          } else if (data.success && data.data) {
            setCourses(Array.isArray(data.data) ? data.data : []);
          } else if (Array.isArray(data)) {
            setCourses(data);
          } else {
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Error fetching courses from public endpoint:", err);
        setCourses([]);
        setMessage("❌ Error loading courses. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingData = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const courseId = selectedCourse.id || selectedCourse._id || String(selectedCourse.id) || String(selectedCourse._id);
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/pricing/`, {
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Set hero data
        setHeroData({
          title: data.hero_title || "Choose Your Access Plan",
          subtitle: data.hero_subtitle || "Unlock full access for this exam — all questions, explanations, analytics, and unlimited attempts.",
        });
        
        // Set pricing plans
        setPricingPlans(data.pricing_plans || []);
        
        // Set features
        setFeatures(data.pricing_features || []);
        
        // Set comparison
        setComparisonRows(data.pricing_comparison || []);
        
        // Set testimonials
        setTestimonials(data.pricing_testimonials || []);
        
        // Set FAQs
        setFaqs(data.pricing_faqs || []);
      }
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      setMessage("❌ Error loading pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedCourse) {
      setMessage("❌ Please select a course first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        hero_title: heroData.title,
        hero_subtitle: heroData.subtitle,
        pricing_plans: pricingPlans.map(plan => {
          // Format price with currency symbol if it's a number
          let formattedPrice = plan.price;
          if (typeof plan.price === 'number') {
            formattedPrice = `₹${plan.price}`;
          } else if (typeof plan.price === 'string' && !plan.price.includes('₹')) {
            formattedPrice = `₹${plan.price}`;
          }
          
          // Format original price with currency symbol if it's a number
          let formattedOriginalPrice = plan.original_price;
          if (plan.original_price) {
            if (typeof plan.original_price === 'number') {
              formattedOriginalPrice = `₹${plan.original_price}`;
            } else if (typeof plan.original_price === 'string' && !plan.original_price.includes('₹')) {
              formattedOriginalPrice = `₹${plan.original_price}`;
            }
          }
          
          // Format duration
          let durationText = plan.duration;
          if (!durationText && plan.duration_months) {
            const months = plan.duration_months;
            const days = plan.duration_days || (months * 30);
            durationText = `${months} month${months > 1 ? 's' : ''} (${days} days)`;
          }
          
          return {
            name: plan.name,
            duration: durationText,
            duration_months: plan.duration_months,
            duration_days: plan.duration_days,
            price: formattedPrice,
            original_price: formattedOriginalPrice,
            discount_percentage: plan.discount_percentage || 0,
            per_day_cost: plan.per_day_cost || "",
            popular: plan.popular || false,
            features: Array.isArray(plan.features) ? plan.features : [],
            status: plan.status || "active",
          };
        }),
        pricing_features: features,
        pricing_comparison: comparisonRows,
        pricing_testimonials: testimonials,
        pricing_faqs: faqs,
      };

      const courseId = selectedCourse.id || selectedCourse._id || String(selectedCourse.id) || String(selectedCourse._id);
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/pricing/`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ All pricing data saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to save"));
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Pricing Plan Handlers
  const resetPlanForm = () => {
    setPlanFormData({
      name: "",
      duration: "",
      duration_months: 1,
      duration_days: 30,
      price: "",
      original_price: "",
      discount_percentage: 0,
      per_day_cost: "",
      popular: false,
      features: [],
      status: "active",
    });
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    resetPlanForm();
    setPlanDialogOpen(true);
  };

  const handleEditPlan = (plan, index) => {
    setEditingPlan(index);
    setPlanFormData({
      name: plan.name || "",
      duration: plan.duration || "",
      duration_months: plan.duration_months || 1,
      duration_days: plan.duration_days || 30,
      price: plan.price || "",
      original_price: plan.original_price || "",
      discount_percentage: plan.discount_percentage || 0,
      per_day_cost: plan.per_day_cost || "",
      popular: plan.popular || plan.is_popular || false,
      features: Array.isArray(plan.features) ? plan.features : [],
      status: plan.status || "active",
    });
    setPlanDialogOpen(true);
  };

  const handleSavePlan = () => {
    const planData = {
      ...planFormData,
      features: planFormData.features.filter(f => f.trim()),
    };

    if (editingPlan !== null) {
      const updated = [...pricingPlans];
      updated[editingPlan] = planData;
      setPricingPlans(updated);
    } else {
      setPricingPlans([...pricingPlans, planData]);
    }

    setPlanDialogOpen(false);
    resetPlanForm();
  };

  const handleDeletePlan = (index) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      setPricingPlans(pricingPlans.filter((_, i) => i !== index));
    }
  };

  // Feature Handlers
  const resetFeatureForm = () => {
    setFeatureFormData({
      icon: "BookOpen",
      title: "",
      description: "",
    });
    setEditingFeature(null);
  };

  const handleAddFeature = () => {
    resetFeatureForm();
    setFeatureDialogOpen(true);
  };

  const handleEditFeature = (feature, index) => {
    setEditingFeature(index);
    setFeatureFormData({
      icon: feature.icon || "BookOpen",
      title: feature.title || "",
      description: feature.description || "",
    });
    setFeatureDialogOpen(true);
  };

  const handleSaveFeature = () => {
    if (editingFeature !== null) {
      const updated = [...features];
      updated[editingFeature] = featureFormData;
      setFeatures(updated);
    } else {
      setFeatures([...features, featureFormData]);
    }

    setFeatureDialogOpen(false);
    resetFeatureForm();
  };

  const handleDeleteFeature = (index) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  // Comparison Handlers
  const resetComparisonForm = () => {
    setComparisonFormData({
      feature: "",
      free_value: "",
      paid_value: "",
    });
    setEditingComparison(null);
  };

  const handleAddComparison = () => {
    resetComparisonForm();
    setComparisonDialogOpen(true);
  };

  const handleEditComparison = (row, index) => {
    setEditingComparison(index);
    setComparisonFormData({
      feature: row.feature || "",
      free_value: row.free_value || "",
      paid_value: row.paid_value || "",
    });
    setComparisonDialogOpen(true);
  };

  const handleSaveComparison = () => {
    if (editingComparison !== null) {
      const updated = [...comparisonRows];
      updated[editingComparison] = comparisonFormData;
      setComparisonRows(updated);
    } else {
      setComparisonRows([...comparisonRows, comparisonFormData]);
    }

    setComparisonDialogOpen(false);
    resetComparisonForm();
  };

  const handleDeleteComparison = (index) => {
    if (confirm("Are you sure you want to delete this comparison row?")) {
      setComparisonRows(comparisonRows.filter((_, i) => i !== index));
    }
  };

  // Testimonial Handlers
  const resetTestimonialForm = () => {
    setTestimonialFormData({
      name: "",
      text: "",
      rating: 5,
    });
    setEditingTestimonial(null);
  };

  const handleAddTestimonial = () => {
    resetTestimonialForm();
    setTestimonialDialogOpen(true);
  };

  const handleEditTestimonial = (testimonial, index) => {
    setEditingTestimonial(index);
    setTestimonialFormData({
      name: testimonial.name || "",
      text: testimonial.text || "",
      rating: testimonial.rating || 5,
    });
    setTestimonialDialogOpen(true);
  };

  const handleSaveTestimonial = () => {
    if (editingTestimonial !== null) {
      const updated = [...testimonials];
      updated[editingTestimonial] = testimonialFormData;
      setTestimonials(updated);
    } else {
      setTestimonials([...testimonials, testimonialFormData]);
    }

    setTestimonialDialogOpen(false);
    resetTestimonialForm();
  };

  const handleDeleteTestimonial = (index) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      setTestimonials(testimonials.filter((_, i) => i !== index));
    }
  };

  // FAQ Handlers
  const resetFaqForm = () => {
    setFaqFormData({
      question: "",
      answer: "",
    });
    setEditingFaq(null);
  };

  const handleAddFaq = () => {
    resetFaqForm();
    setFaqDialogOpen(true);
  };

  const handleEditFaq = (faq, index) => {
    setEditingFaq(index);
    setFaqFormData({
      question: faq.question || "",
      answer: faq.answer || "",
    });
    setFaqDialogOpen(true);
  };

  const handleSaveFaq = () => {
    if (editingFaq !== null) {
      const updated = [...faqs];
      updated[editingFaq] = faqFormData;
      setFaqs(updated);
    } else {
      setFaqs([...faqs, faqFormData]);
    }

    setFaqDialogOpen(false);
    resetFaqForm();
  };

  const handleDeleteFaq = (index) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      setFaqs(faqs.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Pricing Plans Management</h1>
          <p className="text-[#0C1A35]/70 mt-1">Manage all pricing page sections for courses</p>
        </div>
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3 items-center">
          <Select 
            value={selectedCourse ? (selectedCourse.id || selectedCourse._id || String(selectedCourse.id) || String(selectedCourse._id)) : ""} 
            onValueChange={(value) => {
              const course = courses.find(c => {
                const cId = c.id || c._id || String(c.id) || String(c._id);
                return cId === value || String(cId) === String(value);
              });
              setSelectedCourse(course);
            }}
          >
            <SelectTrigger className="w-64 border-gray-300">
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No courses available</div>
              ) : (
                courses.map((course) => {
                  const courseId = course.id || course._id || String(course.id) || String(course._id);
                  const courseTitle = course.title || course.name || "Untitled Course";
                  const courseCode = course.code || "";
                  return (
                    <SelectItem key={courseId} value={String(courseId)}>
                      {courseTitle} {courseCode && `(${courseCode})`}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
          {selectedCourse && (
            <Button
              onClick={() => {
                const provider = selectedCourse.provider?.slug || 
                               selectedCourse.provider?.name?.toLowerCase() || 
                               (typeof selectedCourse.provider === 'string' ? selectedCourse.provider.toLowerCase() : 'aws');
                window.open(`/exams/${provider}/${selectedCourse.code}/practice/pricing`, "_blank");
              }}
              variant="outline"
              className="gap-2 border-gray-300"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {!selectedCourse ? (
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 text-base">Please select a course to manage pricing sections</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {["hero", "plans", "features", "comparison", "testimonials", "faqs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#1A73E8] text-[#1A73E8]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Hero Section Tab */}
          {activeTab === "hero" && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-[#0C1A35]">Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    placeholder="Choose Your Access Plan"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Textarea
                    value={heroData.subtitle}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                    placeholder="Unlock full access for this exam..."
                    rows={2}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans Tab */}
          {activeTab === "plans" && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-[#0C1A35]">Pricing Plans</CardTitle>
                <Button onClick={handleAddPlan} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Plan
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          {plan.popular && (
                            <Badge className="bg-yellow-100 text-yellow-700">Most Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{plan.duration || `${plan.duration_months} month(s) (${plan.duration_days} days)`}</p>
                        <p className="text-sm font-medium">₹{plan.price} {plan.original_price && <span className="line-through text-gray-500">₹{plan.original_price}</span>}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan, idx)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePlan(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pricingPlans.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No pricing plans added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-[#0C1A35]">Features Section</CardTitle>
                <Button onClick={handleAddFeature} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map((feature, idx) => {
                    const IconComponent = ICON_MAP[feature.icon] || BookOpen;
                    return (
                      <Card key={idx} className="relative">
                        <CardContent className="p-4">
                          <IconComponent className="w-8 h-8 text-[#1A73E8] mb-2" />
                          <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                          <div className="flex gap-2 mt-3">
                            <Button variant="ghost" size="sm" onClick={() => handleEditFeature(feature, idx)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFeature(idx)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {features.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No features added yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comparison Tab */}
          {activeTab === "comparison" && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-[#0C1A35]">Comparison Table</CardTitle>
                <Button onClick={handleAddComparison} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Row
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Free</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.feature}</TableCell>
                        <TableCell>{row.free_value}</TableCell>
                        <TableCell>{row.paid_value}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditComparison(row, idx)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteComparison(idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {comparisonRows.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No comparison rows added yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Testimonials Tab */}
          {activeTab === "testimonials" && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-[#0C1A35]">Testimonials</CardTitle>
                <Button onClick={handleAddTestimonial} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {testimonials.map((testimonial, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex gap-1 mb-2">
                          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm italic mb-2">"{testimonial.text}"</p>
                        <p className="text-xs font-medium text-gray-600">— {testimonial.name}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTestimonial(testimonial, idx)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTestimonial(idx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {testimonials.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No testimonials added yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-[#0C1A35]">FAQs</CardTitle>
                <Button onClick={handleAddFaq} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </Button>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <div className="flex items-center justify-between w-full pr-4">
                        <AccordionTrigger className="flex-1">{faq.question}</AccordionTrigger>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditFaq(faq, idx)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {faqs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No FAQs added yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveAll}
              disabled={loading}
              className="bg-[#1A73E8] hover:bg-[#1557B0] px-8"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </>
      )}

      {/* Pricing Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan !== null ? "Edit Pricing Plan" : "Add Pricing Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Plan Name *</Label>
              <Input
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                placeholder="Basic, Premium, Pro"
                className="mt-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (Months) *</Label>
                <Input
                  type="number"
                  value={planFormData.duration_months}
                  onChange={(e) => {
                    const months = parseInt(e.target.value) || 1;
                    setPlanFormData({
                      ...planFormData,
                      duration_months: months,
                      duration_days: months * 30,
                      duration: `${months} month${months > 1 ? 's' : ''} (${months * 30} days)`,
                    });
                  }}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label>Duration (Days) *</Label>
                <Input
                  type="number"
                  value={planFormData.duration_days}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 30;
                    const price = parseFloat(planFormData.price) || 0;
                    const perDayCost = days > 0 && price > 0 ? (price / days).toFixed(2) : "";
                    setPlanFormData({
                      ...planFormData,
                      duration_days: days,
                      per_day_cost: perDayCost,
                    });
                  }}
                  className="mt-2"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={planFormData.price}
                  onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                  placeholder="299"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label>Original Price (₹) *</Label>
                <Input
                  type="number"
                  value={planFormData.original_price}
                  onChange={(e) => {
                    const original = e.target.value;
                    const price = parseFloat(planFormData.price) || 0;
                    const discount = original ? Math.round(((parseFloat(original) - price) / parseFloat(original)) * 100) : 0;
                    setPlanFormData({
                      ...planFormData,
                      original_price: original,
                      discount_percentage: discount,
                    });
                  }}
                  placeholder="599"
                  className="mt-2"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  value={planFormData.discount_percentage}
                  onChange={(e) => setPlanFormData({ ...planFormData, discount_percentage: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Per Day Cost (Auto-calculated)</Label>
                <Input
                  value={planFormData.per_day_cost || (() => {
                    const price = parseFloat(planFormData.price) || 0;
                    const days = planFormData.duration_days || 30;
                    return days > 0 ? (price / days).toFixed(2) : "";
                  })()}
                  onChange={(e) => setPlanFormData({ ...planFormData, per_day_cost: e.target.value })}
                  placeholder="Auto-calculated"
                  className="mt-2 bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Automatically calculated from price and duration</p>
              </div>
            </div>
            <div>
              <Label>Features (One per line) *</Label>
              <Textarea
                value={planFormData.features.join("\n")}
                onChange={(e) => setPlanFormData({
                  ...planFormData,
                  features: e.target.value.split("\n").filter(f => f.trim()),
                })}
                placeholder="Full question bank&#10;Detailed explanations&#10;Unlimited attempts"
                rows={6}
                className="mt-2"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mark as Most Popular</Label>
              <Switch
                checked={planFormData.popular}
                onCheckedChange={(checked) => setPlanFormData({ ...planFormData, popular: checked })}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan} className="bg-[#1A73E8]">
                {editingPlan !== null ? "Update" : "Add"} Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
      <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFeature !== null ? "Edit Feature" : "Add Feature"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Icon</Label>
              <Select value={featureFormData.icon} onValueChange={(value) => setFeatureFormData({ ...featureFormData, icon: value })}>
                <SelectTrigger className="mt-2">
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
              <Label>Title *</Label>
              <Input
                value={featureFormData.title}
                onChange={(e) => setFeatureFormData({ ...featureFormData, title: e.target.value })}
                placeholder="Full question bank"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={featureFormData.description}
                onChange={(e) => setFeatureFormData({ ...featureFormData, description: e.target.value })}
                placeholder="Access all questions for this exam"
                rows={2}
                className="mt-2"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFeature} className="bg-[#1A73E8]">
                {editingFeature !== null ? "Update" : "Add"} Feature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingComparison !== null ? "Edit Comparison Row" : "Add Comparison Row"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Feature *</Label>
              <Input
                value={comparisonFormData.feature}
                onChange={(e) => setComparisonFormData({ ...comparisonFormData, feature: e.target.value })}
                placeholder="Questions"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Free Value *</Label>
              <Input
                value={comparisonFormData.free_value}
                onChange={(e) => setComparisonFormData({ ...comparisonFormData, free_value: e.target.value })}
                placeholder="5 only"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Paid Value *</Label>
              <Input
                value={comparisonFormData.paid_value}
                onChange={(e) => setComparisonFormData({ ...comparisonFormData, paid_value: e.target.value })}
                placeholder="Full access"
                className="mt-2"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setComparisonDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveComparison} className="bg-[#1A73E8]">
                {editingComparison !== null ? "Update" : "Add"} Row
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTestimonial !== null ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={testimonialFormData.name}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                placeholder="Priya Sharma"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Rating</Label>
              <Select value={testimonialFormData.rating.toString()} onValueChange={(value) => setTestimonialFormData({ ...testimonialFormData, rating: parseInt(value) })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Review Text *</Label>
              <Textarea
                value={testimonialFormData.text}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, text: e.target.value })}
                placeholder="Helped me clear the exam on first attempt! The explanations were incredibly detailed."
                rows={3}
                className="mt-2"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setTestimonialDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTestimonial} className="bg-[#1A73E8]">
                {editingTestimonial !== null ? "Update" : "Add"} Testimonial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq !== null ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question *</Label>
              <Input
                value={faqFormData.question}
                onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                placeholder="Do I get all practice tests for this exam?"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Answer *</Label>
              <Textarea
                value={faqFormData.answer}
                onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                placeholder="Yes, with full access you get..."
                rows={4}
                className="mt-2"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFaq} className="bg-[#1A73E8]">
                {editingFaq !== null ? "Update" : "Add"} FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
