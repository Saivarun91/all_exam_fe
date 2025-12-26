"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlusCircle, Edit, Trash2, ArrowLeft, Save, Eye, Star,
  BookOpen, CheckCircle2, Clock, RefreshCw, Target, BarChart3, TrendingUp, Bell
} from "lucide-react";

export default function AdminCoursePricingPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState("");

  // Pricing Plans State
  const [pricingPlans, setPricingPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({
    name: "",
    duration_months: "",
    duration_days: "",
    original_price: "",
    price: "",
    discount_percentage: "",
    popular: false,
    status: "active",
    features: [""]
  });

  // Pricing Features State
  const [pricingFeatures, setPricingFeatures] = useState([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [newFeature, setNewFeature] = useState({
    icon: "BookOpen",
    title: "",
    description: ""
  });

  // Pricing Testimonials State
  const [pricingTestimonials, setPricingTestimonials] = useState([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    text: "",
    rating: 5
  });

  // Pricing FAQs State
  const [pricingFaqs, setPricingFaqs] = useState([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: ""
  });

  // Pricing Comparison State
  const [pricingComparison, setPricingComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [editingComparison, setEditingComparison] = useState(null);
  const [newComparison, setNewComparison] = useState({
    feature: "",
    free_value: "",
    paid_value: ""
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Icon options for features
  const iconOptions = [
    "BookOpen", "CheckCircle2", "Clock", "RefreshCw", "Target", 
    "BarChart3", "TrendingUp", "Bell", "Star"
  ];

  // Fetch course and pricing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/`);
        if (!courseRes.ok) throw new Error("Course not found");
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Fetch pricing data
        const pricingRes = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/pricing/`);
        if (pricingRes.ok) {
          const pricingData = await pricingRes.json();
          setPricingPlans(pricingData.pricing_plans || []);
          setPricingFeatures(pricingData.pricing_features || []);
          setPricingTestimonials(pricingData.pricing_testimonials || []);
          setPricingFaqs(pricingData.pricing_faqs || []);
          setPricingComparison(pricingData.pricing_comparison || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage("❌ Error loading pricing data");
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Save all pricing data
  const handleSavePricingData = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${courseId}/pricing/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          pricing_plans: pricingPlans,
          pricing_features: pricingFeatures,
          pricing_testimonials: pricingTestimonials,
          pricing_faqs: pricingFaqs,
          pricing_comparison: pricingComparison
        })
      });

      if (!res.ok) throw new Error("Failed to save pricing data");

      setMessage("✅ Pricing data saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving:", err);
      setMessage("❌ Error saving pricing data");
    } finally {
      setSaving(false);
    }
  };

  // Calculate discount percentage
  const calculateDiscount = (original, current) => {
    if (!original || !current) return 0;
    const orig = parseFloat(original.replace(/[₹,]/g, ''));
    const curr = parseFloat(current.replace(/[₹,]/g, ''));
    if (orig === 0) return 0;
    return Math.round(((orig - curr) / orig) * 100);
  };

  // Calculate daily price
  const calculateDailyPrice = (price, days) => {
    if (!price || !days) return "";
    const priceNum = parseFloat(price.replace(/[₹,]/g, ''));
    const daysNum = parseFloat(days);
    if (daysNum === 0) return "";
    const daily = priceNum / daysNum;
    return `₹${daily.toFixed(2)}/day`;
  };

  // Pricing Plan Functions
  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price) {
      alert("Please fill in required fields");
      return;
    }

    // Auto-calculate discount if original price is provided
    let discount = newPlan.discount_percentage;
    if (newPlan.original_price && newPlan.price && !discount) {
      discount = calculateDiscount(newPlan.original_price, newPlan.price);
    }

    // Format duration
    const duration = newPlan.duration_months 
      ? `${newPlan.duration_months} months (${newPlan.duration_days || (parseInt(newPlan.duration_months) * 30)} days)`
      : newPlan.duration_days 
        ? `${newPlan.duration_days} days`
        : "";

    const plan = {
      ...newPlan,
      duration,
      discount_percentage: discount || 0,
      features: newPlan.features.filter(f => f.trim() !== "")
    };

    if (editingPlan !== null) {
      const updated = [...pricingPlans];
      updated[editingPlan] = plan;
      setPricingPlans(updated);
      setEditingPlan(null);
    } else {
      setPricingPlans([...pricingPlans, plan]);
    }

    setNewPlan({ 
      name: "", 
      duration_months: "", 
      duration_days: "",
      original_price: "",
      price: "", 
      discount_percentage: "",
      popular: false, 
      status: "active",
      features: [""] 
    });
    setShowPlanModal(false);
  };

  const handleEditPlan = (index) => {
    const plan = pricingPlans[index];
    // Parse duration to extract months and days
    let months = "";
    let days = "";
    if (plan.duration) {
      const monthMatch = plan.duration.match(/(\d+)\s*months?/i);
      const dayMatch = plan.duration.match(/(\d+)\s*days?/i);
      if (monthMatch) months = monthMatch[1];
      if (dayMatch) days = dayMatch[1];
    }
    
    setEditingPlan(index);
    setNewPlan({
      ...plan,
      duration_months: months || plan.duration_months || "",
      duration_days: days || plan.duration_days || ""
    });
    setShowPlanModal(true);
  };

  const handleDeletePlan = (index) => {
    if (!confirm("Delete this pricing plan?")) return;
    setPricingPlans(pricingPlans.filter((_, i) => i !== index));
  };

  const addPlanFeature = () => {
    setNewPlan({ ...newPlan, features: [...newPlan.features, ""] });
  };

  const updatePlanFeature = (index, value) => {
    const updated = [...newPlan.features];
    updated[index] = value;
    setNewPlan({ ...newPlan, features: updated });
  };

  const removePlanFeature = (index) => {
    setNewPlan({ ...newPlan, features: newPlan.features.filter((_, i) => i !== index) });
  };

  // Feature Functions
  const handleAddFeature = () => {
    if (!newFeature.title) {
      alert("Please fill in the title");
      return;
    }

    if (editingFeature !== null) {
      const updated = [...pricingFeatures];
      updated[editingFeature] = newFeature;
      setPricingFeatures(updated);
      setEditingFeature(null);
    } else {
      setPricingFeatures([...pricingFeatures, newFeature]);
    }

    setNewFeature({ icon: "BookOpen", title: "", description: "" });
    setShowFeatureModal(false);
  };

  const handleEditFeature = (index) => {
    setEditingFeature(index);
    setNewFeature(pricingFeatures[index]);
    setShowFeatureModal(true);
  };

  const handleDeleteFeature = (index) => {
    if (!confirm("Delete this feature?")) return;
    setPricingFeatures(pricingFeatures.filter((_, i) => i !== index));
  };

  // Testimonial Functions
  const handleAddTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.text) {
      alert("Please fill in required fields");
      return;
    }

    if (editingTestimonial !== null) {
      const updated = [...pricingTestimonials];
      updated[editingTestimonial] = newTestimonial;
      setPricingTestimonials(updated);
      setEditingTestimonial(null);
    } else {
      setPricingTestimonials([...pricingTestimonials, newTestimonial]);
    }

    setNewTestimonial({ name: "", text: "", rating: 5 });
    setShowTestimonialModal(false);
  };

  const handleEditTestimonial = (index) => {
    setEditingTestimonial(index);
    setNewTestimonial(pricingTestimonials[index]);
    setShowTestimonialModal(true);
  };

  const handleDeleteTestimonial = (index) => {
    if (!confirm("Delete this testimonial?")) return;
    setPricingTestimonials(pricingTestimonials.filter((_, i) => i !== index));
  };

  // FAQ Functions
  const handleAddFaq = () => {
    if (!newFaq.question || !newFaq.answer) {
      alert("Please fill in required fields");
      return;
    }

    if (editingFaq !== null) {
      const updated = [...pricingFaqs];
      updated[editingFaq] = newFaq;
      setPricingFaqs(updated);
      setEditingFaq(null);
    } else {
      setPricingFaqs([...pricingFaqs, newFaq]);
    }

    setNewFaq({ question: "", answer: "" });
    setShowFaqModal(false);
  };

  const handleEditFaq = (index) => {
    setEditingFaq(index);
    setNewFaq(pricingFaqs[index]);
    setShowFaqModal(true);
  };

  const handleDeleteFaq = (index) => {
    if (!confirm("Delete this FAQ?")) return;
    setPricingFaqs(pricingFaqs.filter((_, i) => i !== index));
  };

  // Comparison Functions
  const handleAddComparison = () => {
    if (!newComparison.feature) {
      alert("Please fill in the feature name");
      return;
    }

    if (editingComparison !== null) {
      const updated = [...pricingComparison];
      updated[editingComparison] = newComparison;
      setPricingComparison(updated);
      setEditingComparison(null);
    } else {
      setPricingComparison([...pricingComparison, newComparison]);
    }

    setNewComparison({ feature: "", free_value: "", paid_value: "" });
    setShowComparisonModal(false);
  };

  const handleEditComparison = (index) => {
    setEditingComparison(index);
    setNewComparison(pricingComparison[index]);
    setShowComparisonModal(true);
  };

  const handleDeleteComparison = (index) => {
    if (!confirm("Delete this comparison row?")) return;
    setPricingComparison(pricingComparison.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading pricing data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/courses/${courseId}/tests`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage Pricing Plans</h1>
              <p className="text-gray-600 mt-1">
                {course?.title} ({course?.code})
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/exams/${course?.slug?.split('-')[0]}/${course?.slug?.split('-').slice(1).join('-')}/practice/pricing`)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSavePricingData} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          {/* Pricing Plans Tab */}
          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pricing Plans</CardTitle>
                    <CardDescription>Configure subscription plans for this course</CardDescription>
                  </div>
                  <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { 
                        setEditingPlan(null); 
                        setNewPlan({ 
                          name: "", 
                          duration_months: "", 
                          duration_days: "",
                          original_price: "",
                          price: "", 
                          discount_percentage: "",
                          popular: false, 
                          status: "active",
                          features: [""] 
                        }); 
                      }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        + Add Pricing Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingPlan !== null ? "Edit" : "Add"} Pricing Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="plan-name">Plan Name *</Label>
                          <Input
                            id="plan-name"
                            value={newPlan.name}
                            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                            placeholder="Premium, Basic, Pro, etc."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="plan-duration-months">Duration (Months)</Label>
                            <Input
                              id="plan-duration-months"
                              type="number"
                              value={newPlan.duration_months}
                              onChange={(e) => setNewPlan({ ...newPlan, duration_months: e.target.value })}
                              placeholder="3"
                            />
                          </div>
                          <div>
                            <Label htmlFor="plan-duration-days">Duration (Days)</Label>
                            <Input
                              id="plan-duration-days"
                              type="number"
                              value={newPlan.duration_days}
                              onChange={(e) => {
                                const days = e.target.value;
                                setNewPlan({ 
                                  ...newPlan, 
                                  duration_days: days,
                                  duration_months: days ? Math.round(parseInt(days) / 30 * 10) / 10 : newPlan.duration_months
                                });
                              }}
                              placeholder="90"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-calculates months if not set</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="plan-original-price">Original Price</Label>
                            <Input
                              id="plan-original-price"
                              value={newPlan.original_price}
                              onChange={(e) => {
                                const orig = e.target.value;
                                setNewPlan({ 
                                  ...newPlan, 
                                  original_price: orig,
                                  discount_percentage: orig && newPlan.price 
                                    ? calculateDiscount(orig, newPlan.price).toString()
                                    : newPlan.discount_percentage
                                });
                              }}
                              placeholder="₹299"
                            />
                            <p className="text-xs text-gray-500 mt-1">For discount calculation</p>
                          </div>
                          <div>
                            <Label htmlFor="plan-price">Current Price *</Label>
                            <Input
                              id="plan-price"
                              value={newPlan.price}
                              onChange={(e) => {
                                const price = e.target.value;
                                setNewPlan({ 
                                  ...newPlan, 
                                  price,
                                  discount_percentage: newPlan.original_price && price
                                    ? calculateDiscount(newPlan.original_price, price).toString()
                                    : newPlan.discount_percentage
                                });
                              }}
                              placeholder="₹199"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="plan-discount">Discount %</Label>
                            <Input
                              id="plan-discount"
                              type="number"
                              value={newPlan.discount_percentage}
                              onChange={(e) => setNewPlan({ ...newPlan, discount_percentage: e.target.value })}
                              placeholder="50"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-calculated if original price set</p>
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <input
                              type="checkbox"
                              id="plan-popular"
                              checked={newPlan.popular}
                              onChange={(e) => setNewPlan({ ...newPlan, popular: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="plan-popular" className="font-normal">Mark as Popular</Label>
                          </div>
                          <div>
                            <Label htmlFor="plan-status">Status</Label>
                            <Select value={newPlan.status} onValueChange={(value) => setNewPlan({ ...newPlan, status: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Features</Label>
                          {newPlan.features.map((feature, idx) => (
                            <div key={idx} className="flex gap-2 mt-2">
                              <Input
                                value={feature}
                                onChange={(e) => updatePlanFeature(idx, e.target.value)}
                                placeholder="Feature description"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePlanFeature(idx)}
                                disabled={newPlan.features.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={addPlanFeature} className="mt-2">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Feature
                          </Button>
                        </div>
                        <Button onClick={handleAddPlan} className="w-full">
                          {editingPlan !== null ? "Update" : "Add"} Plan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {pricingPlans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pricing plans added yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-semibold text-gray-700">Plan Name</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Duration</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Price</th>
                          <th className="text-center p-3 font-semibold text-gray-700">Discount</th>
                          <th className="text-center p-3 font-semibold text-gray-700">Popular</th>
                          <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                          <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingPlans.map((plan, idx) => {
                          const days = plan.duration_days || (parseInt(plan.duration_months) * 30) || 30;
                          const dailyPrice = calculateDailyPrice(plan.price, days);
                          return (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="font-medium text-gray-900">{plan.name}</div>
                                {dailyPrice && (
                                  <div className="text-xs text-gray-500 mt-1">{dailyPrice}</div>
                                )}
                              </td>
                              <td className="p-3 text-gray-700">{plan.duration || `${plan.duration_months} months (${days} days)`}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{plan.price}</span>
                                  {plan.original_price && plan.original_price !== plan.price && (
                                    <span className="text-sm text-gray-400 line-through">{plan.original_price}</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {plan.discount_percentage > 0 ? (
                                  <Badge className="bg-green-100 text-green-700 border-0">
                                    {plan.discount_percentage}% OFF
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {plan.popular ? (
                                  <Badge className="bg-blue-100 text-blue-700 border-0">
                                    <Star className="h-3 w-3 mr-1 inline" />
                                    Popular
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <Badge className={plan.status === "active" ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-700 border-0"}>
                                  {plan.status === "active" ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2 justify-center">
                                  <Button variant="outline" size="sm" onClick={() => handleEditPlan(idx)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(idx)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pricing Features</CardTitle>
                    <CardDescription>Features included in paid access</CardDescription>
                  </div>
                  <Dialog open={showFeatureModal} onOpenChange={setShowFeatureModal}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingFeature(null); setNewFeature({ icon: "BookOpen", title: "", description: "" }); }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingFeature !== null ? "Edit" : "Add"} Feature</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="feature-icon">Icon</Label>
                          <Select value={newFeature.icon} onValueChange={(value) => setNewFeature({ ...newFeature, icon: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map((icon) => (
                                <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="feature-title">Title *</Label>
                          <Input
                            id="feature-title"
                            value={newFeature.title}
                            onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                            placeholder="Full question bank"
                          />
                        </div>
                        <div>
                          <Label htmlFor="feature-description">Description</Label>
                          <Textarea
                            id="feature-description"
                            value={newFeature.description}
                            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                            placeholder="Access all questions for this exam"
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleAddFeature} className="w-full">
                          {editingFeature !== null ? "Update" : "Add"} Feature
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {pricingFeatures.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No features added yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pricingFeatures.map((feature, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-blue-600 mb-2">{feature.icon}</div>
                              <CardTitle className="text-base">{feature.title}</CardTitle>
                              <CardDescription className="text-xs">{feature.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditFeature(idx)} className="flex-1">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteFeature(idx)} className="flex-1">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Free vs Paid Comparison</CardTitle>
                    <CardDescription>Comparison table for free and paid access</CardDescription>
                  </div>
                  <Dialog open={showComparisonModal} onOpenChange={setShowComparisonModal}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingComparison(null); setNewComparison({ feature: "", free_value: "", paid_value: "" }); }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Row
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingComparison !== null ? "Edit" : "Add"} Comparison Row</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="comp-feature">Feature Name *</Label>
                          <Input
                            id="comp-feature"
                            value={newComparison.feature}
                            onChange={(e) => setNewComparison({ ...newComparison, feature: e.target.value })}
                            placeholder="Questions"
                          />
                        </div>
                        <div>
                          <Label htmlFor="comp-free">Free Value</Label>
                          <Input
                            id="comp-free"
                            value={newComparison.free_value}
                            onChange={(e) => setNewComparison({ ...newComparison, free_value: e.target.value })}
                            placeholder="5 only"
                          />
                        </div>
                        <div>
                          <Label htmlFor="comp-paid">Paid Value</Label>
                          <Input
                            id="comp-paid"
                            value={newComparison.paid_value}
                            onChange={(e) => setNewComparison({ ...newComparison, paid_value: e.target.value })}
                            placeholder="Full access"
                          />
                        </div>
                        <Button onClick={handleAddComparison} className="w-full">
                          {editingComparison !== null ? "Update" : "Add"} Row
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {pricingComparison.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comparison rows added yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3">Feature</th>
                          <th className="text-center p-3">Free</th>
                          <th className="text-center p-3">Paid</th>
                          <th className="text-center p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingComparison.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-3">{row.feature}</td>
                            <td className="p-3 text-center text-gray-600">{row.free_value}</td>
                            <td className="p-3 text-center font-medium">{row.paid_value}</td>
                            <td className="p-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button variant="outline" size="sm" onClick={() => handleEditComparison(idx)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteComparison(idx)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pricing Testimonials</CardTitle>
                    <CardDescription>User testimonials for the pricing page</CardDescription>
                  </div>
                  <Dialog open={showTestimonialModal} onOpenChange={setShowTestimonialModal}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingTestimonial(null); setNewTestimonial({ name: "", text: "", rating: 5 }); }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingTestimonial !== null ? "Edit" : "Add"} Testimonial</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="test-name">Name *</Label>
                          <Input
                            id="test-name"
                            value={newTestimonial.name}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="test-text">Testimonial *</Label>
                          <Textarea
                            id="test-text"
                            value={newTestimonial.text}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                            placeholder="This helped me pass my exam..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="test-rating">Rating</Label>
                          <Select value={String(newTestimonial.rating)} onValueChange={(value) => setNewTestimonial({ ...newTestimonial, rating: parseInt(value) })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <SelectItem key={rating} value={String(rating)}>
                                  {rating} Star{rating > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddTestimonial} className="w-full">
                          {editingTestimonial !== null ? "Update" : "Add"} Testimonial
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {pricingTestimonials.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No testimonials added yet</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {pricingTestimonials.map((testimonial, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex gap-1 mb-2">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <CardDescription className="italic">"{testimonial.text}"</CardDescription>
                          <p className="text-sm font-medium mt-2">— {testimonial.name}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditTestimonial(idx)} className="flex-1">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTestimonial(idx)} className="flex-1">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pricing FAQs</CardTitle>
                    <CardDescription>Frequently asked questions about pricing</CardDescription>
                  </div>
                  <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingFaq(null); setNewFaq({ question: "", answer: "" }); }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add FAQ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingFaq !== null ? "Edit" : "Add"} FAQ</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="faq-question">Question *</Label>
                          <Input
                            id="faq-question"
                            value={newFaq.question}
                            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                            placeholder="Do I get all practice tests?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="faq-answer">Answer *</Label>
                          <Textarea
                            id="faq-answer"
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                            placeholder="Yes, you get access to..."
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleAddFaq} className="w-full">
                          {editingFaq !== null ? "Update" : "Add"} FAQ
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {pricingFaqs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No FAQs added yet</p>
                ) : (
                  <div className="space-y-4">
                    {pricingFaqs.map((faq, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-base">{faq.question}</CardTitle>
                          <CardDescription>{faq.answer}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditFaq(idx)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteFaq(idx)}>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

