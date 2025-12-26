"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PricingJsonLd from "@/components/PricingJsonLd";
import {
  CheckCircle2, Clock, BookOpen, RefreshCw, BarChart3, Target, TrendingUp, Bell,
  ArrowRight, Check, X, Star
} from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const params = useParams();
  const provider = params.provider;
  const examCode = params.examCode;

  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState(null);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Icon mapping
  const iconMap = {
    BookOpen, CheckCircle2, Clock, RefreshCw, Target, BarChart3, TrendingUp, Bell, Star
  };

  useEffect(() => {
    const fetchPricingData = async () => {
      if (!provider || !examCode) {
        setError("Provider and exam code are required");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching pricing data for:", provider, examCode);
        
        // Normalize provider and examCode for URL
        const normalizedProvider = provider.toLowerCase().replace(/_/g, '-');
        const normalizedExamCode = examCode.toLowerCase().replace(/_/g, '-');
        
        const url = `${API_BASE_URL}/api/courses/pricing/${normalizedProvider}/${normalizedExamCode}/`;
        console.log("Pricing API URL:", url);
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          let errorData = {};
          try {
            errorData = await res.json();
          } catch (e) {
            // If response is not JSON, use status text
            errorData = { error: res.statusText || `HTTP ${res.status}` };
          }
          console.error("Pricing API error:", res.status, errorData);
          
          if (res.status === 404) {
            throw new Error("Pricing data not found for this exam");
          } else if (res.status >= 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(errorData.error || "Failed to load pricing information");
          }
        }
        
        const data = await res.json();
        console.log("Pricing data received:", data);
        
        // Ensure we have the data structure
        if (!data) {
          throw new Error("No pricing data received");
        }
        
        setPricingData(data);
        setLoading(false);

        // Set canonical URL
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const canonicalUrl = `https://allexamquestions.com${currentPath}`;
          let canonicalLink = document.querySelector('link[rel="canonical"]');
          if (!canonicalLink) {
            canonicalLink = document.createElement("link");
            canonicalLink.setAttribute("rel", "canonical");
            document.head.appendChild(canonicalLink);
          }
          canonicalLink.setAttribute("href", canonicalUrl);
        }
      } catch (err) {
        console.error("Error fetching pricing:", err);
        
        // Handle different error types
        if (err.name === 'AbortError' || err.name === 'TimeoutError' || err.message?.includes('aborted')) {
          setError("Request timed out. Please check your connection and try again.");
        } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Network error')) {
          setError("Network error. Please ensure the backend server is running on " + API_BASE_URL);
        } else {
          setError(err.message || "Failed to load pricing information");
        }
        
        setLoading(false);
      }
    };

    fetchPricingData();
  }, [provider, examCode, API_BASE_URL]);

  const handleUpgrade = (plan) => {
    // Navigate to checkout with plan data (SEO-friendly URL, no query strings)
    console.log("Plan:", plan);
    const planSlug = plan.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    console.log("Plan slug:", planSlug);
    const checkoutUrl = `/checkout/${provider}/${examCode}/${planSlug}/pay`;
    console.log("Navigating to checkout:", checkoutUrl, { provider, examCode, planSlug, planName: plan.name });
    router.push(checkoutUrl);
  };

  const scrollToPricing = () => {
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      const el = document.getElementById("pricing-cards");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading pricing...</div>
      </div>
    );
  }

  if (error || !pricingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pricing Not Available</h2>
          <p className="text-gray-600 mb-4">{error || "No pricing information configured for this exam"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Extract data with proper defaults - ensure we're using dynamic data from API
  const course_title = pricingData?.course_title || pricingData?.title || "Course";
  const course_code = pricingData?.course_code || pricingData?.code || "";
  const hero_title = pricingData?.hero_title || "Choose Your Access Plan";
  const hero_subtitle = pricingData?.hero_subtitle || "Unlock full access for this exam — all questions, explanations, analytics, and unlimited attempts.";
  const pricing_plans = Array.isArray(pricingData?.pricing_plans) ? pricingData.pricing_plans : [];
  const pricing_features = Array.isArray(pricingData?.pricing_features) ? pricingData.pricing_features : [];
  const pricing_testimonials = Array.isArray(pricingData?.pricing_testimonials) ? pricingData.pricing_testimonials : [];
  const pricing_faqs = Array.isArray(pricingData?.pricing_faqs) ? pricingData.pricing_faqs : [];
  const pricing_comparison = Array.isArray(pricingData?.pricing_comparison) ? pricingData.pricing_comparison : [];

  // Debug: Log the data to see what we're getting
  if (typeof window !== 'undefined') {
    console.log("📊 Pricing Data from API:", {
      course_title,
      course_code,
      hero_title,
      hero_subtitle,
      plans_count: pricing_plans.length,
      features_count: pricing_features.length,
      testimonials_count: pricing_testimonials.length,
      faqs_count: pricing_faqs.length,
      comparison_count: pricing_comparison.length,
      raw_data: pricingData
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F5F8FC] to-white">
      {pricingData && (
        <PricingJsonLd
          pricingData={pricingData}
          courseTitle={course_title}
          courseCode={course_code}
        />
      )}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-[#1A73E8]/5 via-[#F5F8FF] to-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
              {hero_title}
            </h1>
            <p className="text-lg md:text-xl text-[#0C1A35]/80 mb-6">
              {hero_subtitle}
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A73E8]/10 to-[#4A90E2]/10 text-[#0C1A35] px-4 py-2 rounded-lg border border-[#1A73E8]/20 backdrop-blur-sm">
              <BookOpen className="h-5 w-5 text-[#1A73E8]" />
              <span className="font-medium">{course_title} ({course_code})</span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        {pricing_plans && pricing_plans.length > 0 && pricing_plans.filter(p => !p.status || p.status !== "inactive").length > 0 ? (
          <section id="pricing-cards" className="py-16 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {pricing_plans
                  .filter(plan => plan.status !== "inactive")
                  .map((plan, idx) => {
                    // Calculate daily price - handle both string and number formats
                    const days = plan.duration_days || (parseInt(plan.duration_months) * 30) || 30;
                    
                    // Extract numeric price value (handle both "₹299" and 299 formats)
                    let priceNum = 0;
                    if (typeof plan.price === 'string') {
                      priceNum = parseFloat(plan.price.replace(/[₹,]/g, '')) || 0;
                    } else if (typeof plan.price === 'number') {
                      priceNum = plan.price;
                    }
                    
                    // Format price with currency symbol
                    const formattedPrice = `₹${priceNum}`;
                    
                    // Extract original price
                    let originalPriceNum = 0;
                    let formattedOriginalPrice = '';
                    if (plan.original_price) {
                      if (typeof plan.original_price === 'string') {
                        originalPriceNum = parseFloat(plan.original_price.replace(/[₹,]/g, '')) || 0;
                      } else if (typeof plan.original_price === 'number') {
                        originalPriceNum = plan.original_price;
                      }
                      formattedOriginalPrice = `₹${originalPriceNum}`;
                    }
                    
                    // Calculate daily price
                    const dailyPrice = days > 0 && priceNum > 0 ? `₹${(priceNum / days).toFixed(2)}/day` : plan.per_day_cost || "";
                    
                    // Format duration if not already formatted
                    let durationText = plan.duration;
                    if (!durationText && plan.duration_months) {
                      const months = plan.duration_months;
                      const daysCount = plan.duration_days || (months * 30);
                      durationText = `${months} month${months > 1 ? 's' : ''} (${daysCount} days)`;
                    }
                    
                    return (
                      <Card
                        key={idx}
                        className={`relative transition-all duration-300 ${
                          plan.popular 
                            ? "border-2 border-[#1A73E8] shadow-xl scale-105 bg-gradient-to-br from-white to-[#1A73E8]/5 ring-2 ring-[#1A73E8]/20" 
                            : "border border-[#E0E7FF] bg-white shadow-md hover:shadow-lg hover:border-[#1A73E8]/30"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                            <Badge className="bg-gradient-to-r from-[#1A73E8] to-[#4A90E2] text-white border-0 px-4 py-1 text-xs font-semibold shadow-md">
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="text-center pb-4">
                          <CardTitle className={`text-2xl mb-2 ${plan.popular ? 'text-[#0C1A35]' : 'text-[#0C1A35]'}`}>
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="text-base text-[#0C1A35]/70">{durationText}</CardDescription>
                          <div className="mt-4">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`text-4xl font-bold ${plan.popular ? 'text-[#1A73E8]' : 'text-[#0C1A35]'}`}>
                                {formattedPrice}
                              </span>
                              {formattedOriginalPrice && originalPriceNum > priceNum && (
                                <span className="text-lg text-[#0C1A35]/50 line-through">
                                  {formattedOriginalPrice}
                                </span>
                              )}
                            </div>
                            {dailyPrice && (
                              <p className="text-sm text-[#10B981] mt-1 font-medium">{dailyPrice}</p>
                            )}
                            {plan.discount_percentage > 0 && (
                              <Badge className="mt-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 shadow-sm">
                                {plan.discount_percentage}% OFF
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3 mb-6">
                            {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
                              plan.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2">
                                  <Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? 'text-[#1A73E8]' : 'text-[#10B981]'}`} />
                                  <span className="text-sm text-[#0C1A35]/80">{feature}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-[#0C1A35]/60">No features listed</li>
                            )}
                          </ul>
                          <Button
                            onClick={() => handleUpgrade(plan)}
                            className={`w-full font-semibold transition-all duration-200 ${
                              plan.popular
                                ? "bg-gradient-to-r from-[#1A73E8] to-[#4A90E2] hover:from-[#1557B0] hover:to-[#1A73E8] text-white shadow-lg hover:shadow-xl"
                                : "bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-md hover:shadow-lg"
                            }`}
                          >
                            Upgrade – {plan.name}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </section>
        ) : (
          <section id="pricing-cards" className="py-16 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No pricing plans configured for this course.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please add pricing plans in the admin panel under "Pricing Plans Management".
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {pricing_features && pricing_features.length > 0 && (
          <section className="py-16 px-4 bg-gradient-to-br from-[#F5F8FF] via-white to-[#E0E7FF]/30">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
                  Everything Included in Above Plans
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricing_features.map((feature, idx) => {
                  const IconComponent = iconMap[feature.icon] || BookOpen;
                  return (
                    <Card 
                      key={idx} 
                      className="bg-white border border-[#E0E7FF] hover:border-[#1A73E8]/40 hover:shadow-lg transition-all duration-300 group"
                    >
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1A73E8]/10 to-[#4A90E2]/10 flex items-center justify-center mb-3 group-hover:from-[#1A73E8]/20 group-hover:to-[#4A90E2]/20 transition-all duration-300">
                          <IconComponent className="h-6 w-6 text-[#1A73E8]" />
                        </div>
                        <CardTitle className="text-lg text-[#0C1A35]">{feature.title}</CardTitle>
                        <CardDescription className="text-[#0C1A35]/70">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Comparison Table */}
        {pricing_comparison && pricing_comparison.length > 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
                  Compare Free vs Paid Access
                </h2>
              </div>
              <Card className="bg-white border-2 border-[#E0E7FF] shadow-lg">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[#E0E7FF] bg-gradient-to-r from-[#1A73E8]/5 to-[#4A90E2]/5">
                          <th className="text-left p-4 font-semibold text-[#0C1A35]">Feature</th>
                          <th className="text-center p-4 font-semibold text-[#0C1A35]">Free</th>
                          <th className="text-center p-4 font-semibold text-[#1A73E8]">Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing_comparison.map((row, idx) => (
                          <tr key={idx} className={`border-b border-[#E0E7FF] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F8FF]/30'}`}>
                            <td className="p-4 text-[#0C1A35] font-medium">{row.feature}</td>
                            <td className="p-4 text-center text-[#0C1A35]/60">
                              {row.free_value === "✗" || row.free_value === "No" ? (
                                <X className="h-5 w-5 text-red-400 mx-auto" />
                              ) : row.free_value === "✓" || row.free_value === "Yes" ? (
                                <Check className="h-5 w-5 text-[#10B981] mx-auto" />
                              ) : (
                                row.free_value
                              )}
                            </td>
                            <td className="p-4 text-center text-[#0C1A35] font-semibold">
                              {row.paid_value === "✓" || row.paid_value === "Yes" ? (
                                <Check className="h-5 w-5 text-[#1A73E8] mx-auto" />
                              ) : row.paid_value === "✗" || row.paid_value === "No" ? (
                                <X className="h-5 w-5 text-red-400 mx-auto" />
                              ) : (
                                row.paid_value
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {pricing_testimonials && pricing_testimonials.length > 0 && (
          <section className="py-16 px-4 bg-gradient-to-br from-[#E0E7FF]/20 via-[#F5F8FF] to-white">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
                  What Our Users Say
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {pricing_testimonials.map((testimonial, idx) => (
                  <Card 
                    key={idx} 
                    className="bg-white border border-[#E0E7FF] hover:border-[#1A73E8]/40 hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
                        ))}
                      </div>
                      <CardDescription className="text-[#0C1A35]/80 italic">
                        "{testimonial.text}"
                      </CardDescription>
                      <p className="text-sm font-semibold text-[#0C1A35] mt-3">— {testimonial.name}</p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {pricing_faqs && pricing_faqs.length > 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
                  Frequently Asked Questions
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {pricing_faqs.map((faq, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`}
                    className="border border-[#E0E7FF] rounded-lg mb-3 bg-white hover:border-[#1A73E8]/40 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-[#0C1A35] font-semibold px-4 hover:text-[#1A73E8]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#0C1A35]/70 px-4 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-16 px-4 bg-gradient-to-br from-[#1A73E8] via-[#4A90E2] to-[#1A73E8]">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Unlock the Full Exam?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of successful students who passed their exams with our platform
            </p>
            <Button 
              size="lg" 
              onClick={scrollToPricing} 
              className="gap-2 bg-white text-[#1A73E8] hover:bg-[#F5F8FF] font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 px-8 py-6 text-lg"
            >
              Upgrade Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

