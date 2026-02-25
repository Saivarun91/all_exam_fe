// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
// import PricingJsonLd from "@/components/PricingJsonLd";
// import {
//   CheckCircle2, Clock, BookOpen, RefreshCw, BarChart3, Target, TrendingUp, Bell,
//   ArrowRight, Check, X, Star
// } from "lucide-react";

// const iconMap = { BookOpen, CheckCircle2, Clock, RefreshCw, Target, BarChart3, TrendingUp, Bell, Star };

// export default function PricingPageClient({ provider, examCode, pricingData, error }) {
//   const router = useRouter();
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [checkingEnrollment, setCheckingEnrollment] = useState(true);

//   // Enrollment check
//   useEffect(() => {
//     if (!pricingData || !pricingData.course_id) {
//       setCheckingEnrollment(false);
//       return;
//     }

//     const checkEnrollment = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           setIsEnrolled(false);
//           return;
//         }
//         const res = await fetch(`${API_BASE_URL}/api/enrollments/check/${pricingData.course_id}/`, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//         });
//         const data = await res.json();
//         setIsEnrolled(data.already_enrolled || false);
//       } catch {
//         setIsEnrolled(false);
//       } finally {
//         setCheckingEnrollment(false);
//       }
//     };
//     checkEnrollment();
//   }, [pricingData?.course_id]);

//   const handleUpgrade = (plan) => {
//     const planSlug = plan.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
//     router.push(`/checkout/${provider}/${examCode}/${planSlug}/pay`);
//   };

//   const scrollToPricing = () => {
//     const el = document.getElementById("pricing-cards");
//     if (el) el.scrollIntoView({ behavior: "smooth" });
//   };

//   if (!pricingData || error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Pricing Not Available</h2>
//           <p className="text-gray-600 mb-4">{error || "No pricing information configured for this exam"}</p>
//           <Button onClick={() => router.back()}>Go Back</Button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     course_title,
//     course_code,
//     hero_title,
//     hero_subtitle,
//     pricing_plans = [],
//     pricing_features = [],
//     pricing_testimonials = [],
//     pricing_faqs = [],
//     pricing_comparison = [],
//   } = pricingData;

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F5F8FC] to-white">
//       {pricingData && <PricingJsonLd pricingData={pricingData} courseTitle={course_title} courseCode={course_code} />}

//       {/* Hero Section */}
//       <section className="py-16 px-4 bg-gradient-to-br from-[#1A73E8]/5 via-[#F5F8FF] to-white">
//         <div className="container mx-auto max-w-4xl text-center">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
//             {hero_title}
//           </h1>
//           <p className="text-lg md:text-xl text-[#0C1A35]/80 mb-6">{hero_subtitle}</p>
//           <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A73E8]/10 to-[#4A90E2]/10 text-[#0C1A35] px-4 py-2 rounded-lg border border-[#1A73E8]/20 backdrop-blur-sm">
//             <BookOpen className="h-5 w-5 text-[#1A73E8]" />
//             <span className="font-medium">{course_title} ({course_code})</span>
//           </div>
//         </div>
//       </section>

//       {/* Already Enrolled */}
//       {!checkingEnrollment && isEnrolled && (
//         <section id="pricing-cards" className="py-16 px-4">
//           <div className="container mx-auto max-w-4xl">
//             <Card className="border-2 border-[#10B981] bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 shadow-lg">
//               <CardContent className="p-8 text-center">
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center">
//                     <CheckCircle2 className="w-10 h-10 text-white" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-[#0C1A35] mb-3">You're Already Enrolled!</h2>
//                 <p className="text-lg text-[#0C1A35]/80 mb-6">
//                   You have full access to <span className="font-semibold text-[#1A73E8]">{course_title}</span>. Start practicing now!
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Button onClick={() => router.push(`/exams/${provider}/${examCode}/practice`)} className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold px-8 py-6 text-lg">
//                     <BookOpen className="w-5 h-5 mr-2" /> Go to Practice Tests
//                   </Button>
//                   <Button onClick={() => router.push(`/dashboard`)} variant="outline" className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10 font-semibold px-8 py-6 text-lg">
//                     <ArrowRight className="w-5 h-5 mr-2" /> View Dashboard
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       )}

//       {/* Pricing Cards */}
//       {!checkingEnrollment && !isEnrolled && pricing_plans && pricing_plans.length > 0 && pricing_plans.filter(p => !p.status || p.status !== "inactive").length > 0 ? (
//           <section id="pricing-cards" className="py-16 px-4">
//             <div className="container mx-auto max-w-7xl">
//               <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
//                 {pricing_plans
//                   .filter(plan => plan.status !== "inactive")
//                   .map((plan, idx) => {
//                     // Calculate daily price - handle both string and number formats
//                     const days = plan.duration_days || (parseInt(plan.duration_months) * 30) || 30;
                    
//                     // Extract numeric price value (handle both "₹299" and 299 formats)
//                     let priceNum = 0;
//                     if (typeof plan.price === 'string') {
//                       priceNum = parseFloat(plan.price.replace(/[₹,]/g, '')) || 0;
//                     } else if (typeof plan.price === 'number') {
//                       priceNum = plan.price;
//                     }
                    
//                     // Format price with currency symbol
//                     const formattedPrice = `₹${priceNum}`;
                    
//                     // Extract original price
//                     let originalPriceNum = 0;
//                     let formattedOriginalPrice = '';
//                     if (plan.original_price) {
//                       if (typeof plan.original_price === 'string') {
//                         originalPriceNum = parseFloat(plan.original_price.replace(/[₹,]/g, '')) || 0;
//                       } else if (typeof plan.original_price === 'number') {
//                         originalPriceNum = plan.original_price;
//                       }
//                       formattedOriginalPrice = `₹${originalPriceNum}`;
//                     }
                    
//                     // Calculate daily price
//                     const dailyPrice = days > 0 && priceNum > 0 ? `₹${(priceNum / days).toFixed(2)}/day` : plan.per_day_cost || "";
                    
//                     // Format duration if not already formatted
//                     let durationText = plan.duration;
//                     if (!durationText && plan.duration_months) {
//                       const months = plan.duration_months;
//                       const daysCount = plan.duration_days || (months * 30);
//                       durationText = `${months} month${months > 1 ? 's' : ''} (${daysCount} days)`;
//                     }
                    
//                     return (
//                       <Card
//                         key={idx}
//                         className={`relative transition-all duration-300 ${
//                           plan.popular 
//                             ? "border-2 border-[#1A73E8] shadow-xl scale-105 bg-gradient-to-br from-white to-[#1A73E8]/5 ring-2 ring-[#1A73E8]/20" 
//                             : "border border-[#E0E7FF] bg-white shadow-md hover:shadow-lg hover:border-[#1A73E8]/30"
//                         }`}
//                       >
//                         {plan.popular && (
//                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
//                             <Badge className="bg-gradient-to-r from-[#1A73E8] to-[#4A90E2] text-white border-0 px-4 py-1 text-xs font-semibold shadow-md">
//                               Most Popular
//                             </Badge>
//                           </div>
//                         )}
//                         <CardHeader className="text-center pb-4">
//                           <CardTitle className={`text-2xl mb-2 ${plan.popular ? 'text-[#0C1A35]' : 'text-[#0C1A35]'}`}>
//                             {plan.name}
//                           </CardTitle>
//                           <CardDescription className="text-base text-[#0C1A35]/70">{durationText}</CardDescription>
//                           <div className="mt-4">
//                             <div className="flex items-center justify-center gap-2">
//                               <span className={`text-4xl font-bold ${plan.popular ? 'text-[#1A73E8]' : 'text-[#0C1A35]'}`}>
//                                 {formattedPrice}
//                               </span>
//                               {formattedOriginalPrice && originalPriceNum > priceNum && (
//                                 <span className="text-lg text-[#0C1A35]/50 line-through">
//                                   {formattedOriginalPrice}
//                                 </span>
//                               )}
//                             </div>
//                             {dailyPrice && (
//                               <p className="text-sm text-[#10B981] mt-1 font-medium">{dailyPrice}</p>
//                             )}
//                             {plan.discount_percentage > 0 && (
//                               <Badge className="mt-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 shadow-sm">
//                                 {plan.discount_percentage}% OFF
//                               </Badge>
//                             )}
//                           </div>
//                         </CardHeader>
//                         <CardContent>
//                           <ul className="space-y-3 mb-6">
//                             {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
//                               plan.features.map((feature, fIdx) => (
//                                 <li key={fIdx} className="flex items-start gap-2">
//                                   <Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? 'text-[#1A73E8]' : 'text-[#10B981]'}`} />
//                                   <span className="text-sm text-[#0C1A35]/80">{feature}</span>
//                                 </li>
//                               ))
//                             ) : (
//                               <li className="text-sm text-[#0C1A35]/60">No features listed</li>
//                             )}
//                           </ul>
//                           <Button
//                             onClick={() => handleUpgrade(plan)}
//                             className={`w-full font-semibold transition-all duration-200 ${
//                               plan.popular
//                                 ? "bg-gradient-to-r from-[#1A73E8] to-[#4A90E2] hover:from-[#1557B0] hover:to-[#1A73E8] text-white shadow-lg hover:shadow-xl"
//                                 : "bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-md hover:shadow-lg"
//                             }`}
//                           >
//                             Upgrade – {plan.name}
//                           </Button>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//               </div>
//             </div>
//           </section>
//         ) : (
//           <section id="pricing-cards" className="py-16 px-4">
//             <div className="container mx-auto max-w-7xl">
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground text-lg mb-4">
//                   No pricing plans configured for this course.
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   Please add pricing plans in the admin panel under "Pricing Plans Management".
//                 </p>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Features Section */}
//         {pricing_features && pricing_features.length > 0 && (
//           <section className="py-16 px-4 bg-gradient-to-br from-[#F5F8FF] via-white to-[#E0E7FF]/30">
//             <div className="container mx-auto max-w-7xl">
//               <div className="text-center mb-12">
//                 <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
//                   Everything Included in Above Plans
//                 </h2>
//               </div>
//               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {pricing_features.map((feature, idx) => {
//                   const IconComponent = iconMap[feature.icon] || BookOpen;
//                   return (
//                     <Card 
//                       key={idx} 
//                       className="bg-white border border-[#E0E7FF] hover:border-[#1A73E8]/40 hover:shadow-lg transition-all duration-300 group"
//                     >
//                       <CardHeader>
//                         <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1A73E8]/10 to-[#4A90E2]/10 flex items-center justify-center mb-3 group-hover:from-[#1A73E8]/20 group-hover:to-[#4A90E2]/20 transition-all duration-300">
//                           <IconComponent className="h-6 w-6 text-[#1A73E8]" />
//                         </div>
//                         <CardTitle className="text-lg text-[#0C1A35]">{feature.title}</CardTitle>
//                         <CardDescription className="text-[#0C1A35]/70">{feature.description}</CardDescription>
//                       </CardHeader>
//                     </Card>
//                   );
//                 })}
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Comparison Table */}
//         {pricing_comparison && pricing_comparison.length > 0 && (
//           <section className="py-16 px-4 bg-white">
//             <div className="container mx-auto max-w-4xl">
//               <div className="text-center mb-12">
//                 <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
//                   Compare Free vs Paid Access
//                 </h2>
//               </div>
//               <Card className="bg-white border-2 border-[#E0E7FF] shadow-lg">
//                 <CardContent className="p-0">
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="border-b-2 border-[#E0E7FF] bg-gradient-to-r from-[#1A73E8]/5 to-[#4A90E2]/5">
//                           <th className="text-left p-4 font-semibold text-[#0C1A35]">Feature</th>
//                           <th className="text-center p-4 font-semibold text-[#0C1A35]">Free</th>
//                           <th className="text-center p-4 font-semibold text-[#1A73E8]">Paid</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {pricing_comparison.map((row, idx) => (
//                           <tr key={idx} className={`border-b border-[#E0E7FF] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F8FF]/30'}`}>
//                             <td className="p-4 text-[#0C1A35] font-medium">{row.feature}</td>
//                             <td className="p-4 text-center text-[#0C1A35]/60">
//                               {row.free_value === "✗" || row.free_value === "No" ? (
//                                 <X className="h-5 w-5 text-red-400 mx-auto" />
//                               ) : row.free_value === "✓" || row.free_value === "Yes" ? (
//                                 <Check className="h-5 w-5 text-[#10B981] mx-auto" />
//                               ) : (
//                                 row.free_value
//                               )}
//                             </td>
//                             <td className="p-4 text-center text-[#0C1A35] font-semibold">
//                               {row.paid_value === "✓" || row.paid_value === "Yes" ? (
//                                 <Check className="h-5 w-5 text-[#1A73E8] mx-auto" />
//                               ) : row.paid_value === "✗" || row.paid_value === "No" ? (
//                                 <X className="h-5 w-5 text-red-400 mx-auto" />
//                               ) : (
//                                 row.paid_value
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </section>
//         )}

//         {/* Testimonials */}
//         {pricing_testimonials && pricing_testimonials.length > 0 && (
//           <section className="py-16 px-4 bg-gradient-to-br from-[#E0E7FF]/20 via-[#F5F8FF] to-white">
//             <div className="container mx-auto max-w-6xl">
//               <div className="text-center mb-12">
//                 <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
//                   What Our Users Say
//                 </h2>
//               </div>
//               <div className="grid md:grid-cols-3 gap-6">
//                 {pricing_testimonials.map((testimonial, idx) => (
//                   <Card 
//                     key={idx} 
//                     className="bg-white border border-[#E0E7FF] hover:border-[#1A73E8]/40 hover:shadow-lg transition-all duration-300"
//                   >
//                     <CardHeader>
//                       <div className="flex gap-1 mb-2">
//                         {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
//                           <Star key={i} className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
//                         ))}
//                       </div>
//                       <CardDescription className="text-[#0C1A35]/80 italic">
//                         "{testimonial.text}"
//                       </CardDescription>
//                       <p className="text-sm font-semibold text-[#0C1A35] mt-3">— {testimonial.name}</p>
//                     </CardHeader>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           </section>
//         )}

//         {/* FAQ Section */}
//         {pricing_faqs && pricing_faqs.length > 0 && (
//           <section className="py-16 px-4 bg-white">
//             <div className="container mx-auto max-w-3xl">
//               <div className="text-center mb-12">
//                 <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
//                   Frequently Asked Questions
//                 </h2>
//               </div>
//               <Accordion type="single" collapsible className="w-full">
//                 {pricing_faqs.map((faq, idx) => (
//                   <AccordionItem 
//                     key={idx} 
//                     value={`item-${idx}`}
//                     className="border border-[#E0E7FF] rounded-lg mb-3 bg-white hover:border-[#1A73E8]/40 transition-colors"
//                   >
//                     <AccordionTrigger className="text-left text-[#0C1A35] font-semibold px-4 hover:text-[#1A73E8]">
//                       {faq.question}
//                     </AccordionTrigger>
//                     <AccordionContent className="text-[#0C1A35]/70 px-4 pb-4">
//                       {faq.answer}
//                     </AccordionContent>
//                   </AccordionItem>
//                 ))}
//               </Accordion>
//             </div>
//           </section>
//         )}

//         {/* Final CTA - Only show if not enrolled */}
//         {!isEnrolled && (
//           <section className="py-16 px-4 bg-gradient-to-br from-[#1A73E8] via-[#4A90E2] to-[#1A73E8]">
//             <div className="container mx-auto max-w-3xl text-center">
//               <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
//                 Ready to Unlock the Full Exam?
//               </h2>
//               <p className="text-lg text-white/90 mb-8">
//                 Join thousands of successful students who passed their exams with our platform
//               </p>
//               <Button 
//                 size="lg" 
//                 onClick={scrollToPricing} 
//                 className="gap-2 bg-white text-[#1A73E8] hover:bg-[#F5F8FF] font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 px-8 py-6 text-lg"
//               >
//                 Upgrade Now
//                 <ArrowRight className="h-5 w-5" />
//               </Button>
//             </div>
//           </section>
//         )}
//       </main>
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import PricingJsonLd from "@/components/PricingJsonLd";
import {
  CheckCircle2, Clock, BookOpen, RefreshCw, BarChart3, Target, TrendingUp, Bell,
  ArrowRight, Check, X, Star
} from "lucide-react";

const iconMap = { BookOpen, CheckCircle2, Clock, RefreshCw, Target, BarChart3, TrendingUp, Bell, Star };

export default function PricingPageClient({ provider, examCode, pricingData, error }) {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    if (!pricingData?.course_id) {
      setCheckingEnrollment(false);
      return;
    }
    const checkEnrollment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsEnrolled(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/enrollments/check/${pricingData.course_id}/`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();
        setIsEnrolled(data.already_enrolled || false);
      } catch {
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };
    checkEnrollment();
  }, [pricingData?.course_id]);

  const handleUpgrade = (plan) => {
    const planSlug = plan.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    router.push(`/checkout/${provider}/${examCode}/${planSlug}/pay`);
  };

  const scrollToPricing = () => {
    const el = document.getElementById("pricing-cards");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (!pricingData || error) {
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

  const {
    course_title,
    course_code,
    hero_title,
    hero_subtitle,
    pricing_plans = [],
    pricing_features = [],
    pricing_testimonials = [],
    pricing_faqs = [],
    pricing_comparison = [],
  } = pricingData;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F5F8FC] to-white">
      {pricingData && <PricingJsonLd pricingData={pricingData} courseTitle={course_title} courseCode={course_code} />}

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#1A73E8]/5 via-[#F5F8FF] to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#0C1A35] to-[#1A73E8] bg-clip-text text-transparent">
            {hero_title}
          </h1>
          <p className="text-lg md:text-xl text-[#0C1A35]/80 mb-6">{hero_subtitle}</p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A73E8]/10 to-[#4A90E2]/10 text-[#0C1A35] px-4 py-2 rounded-lg border border-[#1A73E8]/20 backdrop-blur-sm">
            <BookOpen className="h-5 w-5 text-[#1A73E8]" />
            <span className="font-medium">{course_title} ({course_code})</span>
          </div>
        </div>
      </section>

      {/* Already Enrolled */}
      {!checkingEnrollment && isEnrolled && (
        <section id="pricing-cards" className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-[#10B981] bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-[#0C1A35] mb-3">You're Already Enrolled!</h2>
                <p className="text-lg text-[#0C1A35]/80 mb-6">
                  You have full access to <span className="font-semibold text-[#1A73E8]">{course_title}</span>. Start practicing now!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => router.push(`/exams/${provider}/${examCode}/practice`)} className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold px-8 py-6 text-lg">
                    <BookOpen className="w-5 h-5 mr-2" /> Go to Practice Tests
                  </Button>
                  <Button onClick={() => router.push(`/dashboard`)} variant="outline" className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10 font-semibold px-8 py-6 text-lg">
                    <ArrowRight className="w-5 h-5 mr-2" /> View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Pricing Cards */}
      {!checkingEnrollment && !isEnrolled && (
        <section id="pricing-cards" className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {pricing_plans.filter(p => p.status !== "inactive").map((plan, idx) => {
                const days = plan.duration_days || (parseInt(plan.duration_months) * 30) || 30;
                let priceNum = typeof plan.price === "string" ? parseFloat(plan.price.replace(/[₹,]/g, "")) || 0 : plan.price || 0;
                const formattedPrice = `₹${priceNum}`;
                let originalPriceNum = plan.original_price ? (typeof plan.original_price === "string" ? parseFloat(plan.original_price.replace(/[₹,]/g, "")) : plan.original_price) : 0;
                const formattedOriginalPrice = originalPriceNum > priceNum ? `₹${originalPriceNum}` : "";
                const dailyPrice = days > 0 ? `₹${(priceNum / days).toFixed(2)}/day` : "";

                const durationText = plan.duration || (plan.duration_months ? `${plan.duration_months} month${plan.duration_months>1?'s':''} (${plan.duration_months*30} days)` : "");

                return (
                  <Card key={idx} className={`relative transition-all duration-300 ${plan.popular ? "border-2 border-[#1A73E8] shadow-xl scale-105 bg-gradient-to-br from-white to-[#1A73E8]/5 ring-2 ring-[#1A73E8]/20" : "border border-[#E0E7FF] bg-white shadow-md hover:shadow-lg hover:border-[#1A73E8]/30"}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-[#1A73E8] to-[#4A90E2] text-white border-0 px-4 py-1 text-xs font-semibold shadow-md">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                      <CardDescription className="text-base text-[#0C1A35]/70">{durationText}</CardDescription>
                      <div className="mt-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold text-[#1A73E8]">{formattedPrice}</span>
                          {formattedOriginalPrice && <span className="text-lg text-[#0C1A35]/50 line-through">{formattedOriginalPrice}</span>}
                        </div>
                        {dailyPrice && <p className="text-sm text-[#10B981] mt-1 font-medium">{dailyPrice}</p>}
                        {plan.discount_percentage > 0 && (
                          <Badge className="mt-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 shadow-sm">{plan.discount_percentage}% OFF</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features && plan.features.length > 0 ? plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 shrink-0 mt-0.5 text-[#1A73E8]" />
                            <span className="text-sm text-[#0C1A35]/80">{f}</span>
                          </li>
                        )) : <li className="text-sm text-[#0C1A35]/60">No features listed</li>}
                      </ul>
                      <Button onClick={() => handleUpgrade(plan)} className="w-full bg-gradient-to-r from-[#1A73E8] to-[#4A90E2] text-white font-semibold shadow-lg hover:shadow-xl">Upgrade – {plan.name}</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features, Comparison, Testimonials, FAQ, and CTA sections */}
      {/* Keep all sections from your previous code, as they are correct */}
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

        {/* Final CTA - Only show if not enrolled */}
        {!isEnrolled && (
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
        )}
    </div>
  );
}