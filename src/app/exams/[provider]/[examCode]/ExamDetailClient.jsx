"use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Star, Clock, TrendingUp, CheckCircle2, BookOpen, Target, Award, ArrowRight } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
// import RatingJsonLd from "@/components/RatingJsonLd";
// import ReviewsJsonLd from "@/components/ReviewsJsonLd";
// import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// export default function ExamDetailClient({ examData, provider, examCode }) {
//   const router = useRouter();
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [pendingTestUrl, setPendingTestUrl] = useState(null);

//   // Check if user is logged in
//   const checkLogin = () => typeof window !== "undefined" && !!localStorage.getItem("token");

//   // Handle Start Test button click
//   const handleStartTest = (test, index = 0) => {
//     let testIdentifier = (test && test.slug) ? test.slug : (test && test.id) ? test.id : (test || (index + 1));
//     if (typeof testIdentifier === "string") testIdentifier = testIdentifier.replace(/-[a-f0-9]{8}$/i, "");
//     const testUrl = `/exams/${provider}/${examCode}/practice/${testIdentifier}`;
//     if (!checkLogin()) {
//       setPendingTestUrl(testUrl);
//       setShowLoginModal(true);
//     } else {
//       router.push(testUrl);
//     }
//   };

//   // Listen for login events to redirect after login
//   useEffect(() => {
//     const handleLoginSuccess = () => {
//       if (pendingTestUrl) {
//         setShowLoginModal(false);
//         router.push(pendingTestUrl);
//         setPendingTestUrl(null);
//       }
//     };
//     window.addEventListener("userLoggedIn", handleLoginSuccess);
//     return () => window.removeEventListener("userLoggedIn", handleLoginSuccess);
//   }, [pendingTestUrl, router]);

//   // Breadcrumb items
//   const breadcrumbItems = [
//     { name: "Home", url: "/" },
//     { name: "Exams", url: "/exams" },
//     { name: examData.provider, url: `/exams/${provider}` },
//     { name: examData.code, url: `/exams/${provider}/${examCode}` },
//   ];

//   return (
//     <div className="min-h-screen bg-white">
//       {examData && <BreadcrumbJsonLd items={breadcrumbItems} />}
//       <div className="container mx-auto px-4 py-8">

//         {/* Breadcrumb */}
//         <Breadcrumb className="mb-6">
//           <BreadcrumbList>
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/" className="text-[#0C1A35] hover:text-[#1A73E8]">Home</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/exams" className="text-[#0C1A35] hover:text-[#1A73E8]">Exams</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href={`/exams/${provider}`} className="text-[#0C1A35] hover:text-[#1A73E8]">
//                   {examData.provider}
//                 </Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbPage className="text-[#0C1A35]">{examData.code}</BreadcrumbPage>
//           </BreadcrumbList>
//         </Breadcrumb>

//         {/* Hero Section */}
//         <div className="mb-8">
//           <div className="flex flex-wrap gap-2 mb-4">
//             <Badge className="bg-[#1A73E8] text-white border-0">{examData.code}</Badge>
//             <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{examData.provider}</Badge>
//             {examData.category.map((cat, idx) => (
//               <Badge key={idx} className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{cat}</Badge>
//             ))}
//             <Badge className="bg-green-100 text-green-700 border-0">{examData.difficulty}</Badge>
//           </div>
//           <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{examData.title}</h1>
//           <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
//             <div className="flex items-center gap-1">
//               <Clock className="w-4 h-4 text-[#1A73E8]" />
//               <span>Updated {examData.lastUpdated}</span>
//             </div>
//             {examData.passRate !== null && (
//               <div className="flex items-center gap-1">
//                 <TrendingUp className="w-4 h-4 text-green-500" />
//                 <span className="text-green-600 font-semibold">{examData.passRate}% Pass Rate</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {examData.rating !== null && (
//           <RatingJsonLd 
//             rating={examData.rating} 
//             reviewCount={examData.reviews || (examData.testimonials && examData.testimonials.length) || null}
//             itemName={examData.title}
//             itemType="Product"
//             schemaId="exam-rating-json-ld-schema"
//           />
//         )}

//         {examData.testimonials && examData.testimonials.length > 0 && (
//           <ReviewsJsonLd testimonials={examData.testimonials} itemName={examData.title} />
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">

//             {/* Summary Card */}
//             <Card className="border-[#DDE7FF]">
//               <CardHeader>
//                 <CardTitle className="text-[#0C1A35]">Exam Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Duration</p>
//                     {examData.duration && (
//                         <p className="font-semibold text-[#0C1A35]">
//                             {examData.duration}
//                         </p>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Passing Score</p>
//                     <p className="font-semibold text-[#0C1A35]">{examData.passingScore}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Practice Tests</p>
//                     <p className="font-semibold text-[#0C1A35]">{examData.practiceTests}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Total Questions</p>
//                     <p className="font-semibold text-[#0C1A35]">{examData.totalQuestions}</p>
//                   </div>
//                 </div>
//                 {examData.passRate !== null && (
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-2">Pass Rate</p>
//                     <div className="flex items-center gap-2">
//                       <Progress value={examData.passRate} className="flex-1" />
//                       <span className="text-sm font-semibold text-[#0C1A35]">{examData.passRate}%</span>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* About Section */}
//             <Card className="border-[#DDE7FF]">
//               <CardHeader>
//                 {examData.about_heading ? (
//                   <div className="text-[#0C1A35]" dangerouslySetInnerHTML={{ __html: examData.about_heading }} />
//                 ) : (
//                   <CardTitle className="text-[#0C1A35]">About This Exam</CardTitle>
//                 )}
//               </CardHeader>
//               <CardContent>
//                 <div className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: examData.about }} />
//               </CardContent>
//             </Card>

//             {/* Topics Covered */}
//             {/* Topics Covered */}
//             {examData.topics && examData.topics.length > 0 && (
//             <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                 {examData.topics_heading ? (
//                     <div
//                     className="text-[#0C1A35]"
//                     dangerouslySetInnerHTML={{ __html: examData.topics_heading }}
//                     />
//                 ) : (
//                     <CardTitle className="text-[#0C1A35]">Topics Covered</CardTitle>
//                 )}
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                 {examData.topics.map((topic, idx) => {
//                     // Use average of startPercentage and endPercentage for display
//                     const percentage = Math.round((topic.startPercentage + topic.endPercentage) / 2);

//                     return (
//                     <div key={idx}>
//                         <div className="flex justify-between mb-2">
//                         <span className="text-sm font-medium text-[#0C1A35]">{topic.name}</span>
//                         <span className="text-sm text-[#0C1A35]/60">{percentage}%</span>
//                         </div>
//                         <Progress value={percentage} className="h-2" />
//                     </div>
//                     );
//                 })}
//                 </CardContent>
//             </Card>
//             )}
            
//             {/* What's Included */}
//             <Card className="border-[#DDE7FF]">
//               <CardHeader>
//                 {examData.whats_included_heading ? (
//                   <div className="text-[#0C1A35]" dangerouslySetInnerHTML={{ __html: examData.whats_included_heading }} />
//                 ) : (
//                   <CardTitle className="text-[#0C1A35]">What's Included in This Practice Pack</CardTitle>
//                 )}
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {examData.whatsIncluded.map((item, idx) => (
//                     <div key={idx} className="tiptap-editor-content text-[#0C1A35]/80" dangerouslySetInnerHTML={{ __html: item }} />
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Why This Exam Matters */}
//             <Card className="border-[#DDE7FF]">
//               <CardHeader>
//                 {examData.why_matters_heading ? (
//                   <div className="text-[#0C1A35]" dangerouslySetInnerHTML={{ __html: examData.why_matters_heading }} />
//                 ) : (
//                   <CardTitle className="text-[#0C1A35]">Why This Exam Matters</CardTitle>
//                 )}
//               </CardHeader>
//               <CardContent>
//                 <div className="text-[#0C1A35]/80 leading-relaxed tiptap-editor-content" dangerouslySetInnerHTML={{ __html: examData.whyMatters }} />
//               </CardContent>
//             </Card>

//             {/* Exam Format Summary */}
//             <Card className="border-[#DDE7FF]">
//               <CardHeader>
//                 <CardTitle className="text-[#0C1A35]">Exam Format Summary</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                     <BookOpen className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-[#0C1A35]">{examData.totalQuestions}</p>
//                     <p className="text-sm text-[#0C1A35]/60">Questions</p>
//                   </div>
//                   <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                     <Clock className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-[#0C1A35]">{examData.duration}</p>
//                     <p className="text-sm text-[#0C1A35]/60">Duration</p>
//                   </div>
//                   <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                     <Target className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-[#0C1A35]">{examData.passingScore}</p>
//                     <p className="text-sm text-[#0C1A35]/60">Passing Score</p>
//                   </div>
//                   <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                     <Award className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-[#0C1A35]">{examData.difficulty}</p>
//                     <p className="text-sm text-[#0C1A35]/60">Difficulty</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Practice Tests List */}
//             {examData.practiceTestsList && examData.practiceTestsList.length > 0 && (
//               <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                   {examData.practice_tests_heading ? (
//                     <div className="text-[#0C1A35]" dangerouslySetInnerHTML={{ __html: examData.practice_tests_heading }} />
//                   ) : (
//                     <CardTitle className="text-[#0C1A35]">Available Practice Tests</CardTitle>
//                   )}
//                   <CardDescription>Choose a practice test to start your preparation</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   {examData.practiceTestsList.map((test, idx) => (
//                     <div key={test.id || test.name || idx} className="p-4 border border-[#DDE7FF] rounded-lg hover:shadow-md transition-shadow">
//                       <div className="flex items-center justify-between mb-2">
//                         <h4 className="font-semibold text-[#0C1A35]">{test.name || `Practice Test ${idx + 1}`}</h4>
//                         <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{test.difficulty || "Intermediate"}</Badge>
//                       </div>
//                       <div className="flex items-center gap-4 text-sm text-[#0C1A35]/70 mb-3">
//                         <span>{test.questions || 0} Questions</span>
//                         {test.duration && <span>• {test.duration}</span>}
//                       </div>
//                       {test.progress !== undefined && (
//                         <div className="mb-3">
//                           <Progress value={test.progress || 0} className="h-2" />
//                         </div>
//                       )}
//                       <Button className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]" onClick={() => handleStartTest(test, idx)}>
//                         {test.progress ? "Continue Test" : "Start Test"} <ArrowRight className="w-4 h-4 ml-2" />
//                       </Button>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             )}

//             {/* Testimonials */}
//             {examData.testimonials && examData.testimonials.length > 0 && (
//               <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                   {examData.testimonials_heading ? (
//                     <div className="text-[#0C1A35]" dangerouslySetInnerHTML={{ __html: examData.testimonials_heading }} />
//                   ) : (
//                     <CardTitle className="text-[#0C1A35]">Student Success Stories</CardTitle>
//                   )}
//                   <CardDescription>Hear from those who passed with our practice tests</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {examData.testimonials.map((testimonial, idx) => (
//                     <div key={idx} className="p-4 border border-[#DDE7FF] rounded-lg bg-gray-50">
//                       <div className="flex items-center gap-2 mb-2">
//                         {[...Array(5)].map((_, i) => (
//                           <Star key={i} className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
//                         ))}
//                       </div>
//                       <p className="text-[#0C1A35]/80 mb-3 italic">"{testimonial.review || testimonial.comment}"</p>
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="font-semibold text-[#0C1A35]">{testimonial.name}</p>
//                           <p className="text-sm text-[#0C1A35]/60">{testimonial.role || testimonial.title}</p>
//                         </div>
//                         {testimonial.verified && (
//                           <Badge className="bg-green-100 text-green-700 border-0">
//                             <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             )}

//             {/* FAQs */}
//             {examData.faqs && examData.faqs.length > 0 && (
//               <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                   <CardTitle className="text-[#0C1A35]">Frequently Asked Questions</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <Accordion type="single" collapsible>
//                     {examData.faqs.map((faq, idx) => (
//                       <AccordionItem key={idx} value={`faq-${idx}`}>
//                         <AccordionTrigger className="text-[#0C1A35] font-medium">{faq.question}</AccordionTrigger>
//                         <AccordionContent className="text-[#0C1A35]/80" >
//                           <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
//                         </AccordionContent>
//                       </AccordionItem>
//                     ))}
//                   </Accordion>
//                 </CardContent>
//               </Card>
//             )}

//           </div>

//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <Card className="border-[#DDE7FF] sticky top-24">
//               <CardHeader>
//                 {examData.rating !== null && examData.rating !== undefined && (
//                   <div className="flex items-center gap-2 mb-4">
//                     <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
//                     <span className="text-2xl font-bold text-[#0C1A35]">{examData.rating}</span>
//                     {examData.reviews && examData.reviews > 0 && (
//                       <span className="text-sm text-[#0C1A35]/60">({examData.reviews.toLocaleString()} reviews)</span>
//                     )}
//                   </div>
//                 )}
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-[#0C1A35]/70">Practice Tests</span>
//                     <span className="font-semibold text-[#0C1A35]">{examData.practiceTests}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-[#0C1A35]/70">Total Questions</span>
//                     <span className="font-bold text-[#0C1A35]">{examData.totalQuestions}</span>
//                   </div>
//                   {examData.passRate !== null && examData.passRate !== undefined && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-[#0C1A35]/70">Pass Rate</span>
//                       <span className="font-semibold text-green-600">{examData.passRate}%</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-[#0C1A35]/70">Duration</span>
//                     <span className="font-semibold text-[#0C1A35]">{examData.duration}</span>
//                   </div>
//                 </div>
//                 <div className="pt-4 border-t border-[#DDE7FF]">
//                   <Button
//                     className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg"
//                     asChild
//                   >
//                     <Link href={`/exams/${provider}/${examCode}/practice`}>
//                       Start Practicing →
//                     </Link>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* Login Modal */}
//       <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Login Required</DialogTitle>
//             <DialogDescription>
//               You need to login to start taking tests.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="flex gap-3 mt-4">
//             <Button variant="outline" onClick={() => setShowLoginModal(false)} className="flex-1">
//               Cancel
//             </Button>
//             <Button
//               onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(pendingTestUrl || `/exams/${provider}/${examCode}/practice`)}`)}
//               className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white"
//             >
//               Login / Sign Up
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




// import Link from "next/link";
// import { useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

// import { Star, Clock, CheckCircle2, FileText } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
// import RatingJsonLd from "@/components/RatingJsonLd";
// import ReviewsJsonLd from "@/components/ReviewsJsonLd";
// import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
// import StartTestButton from "./StartTestButton";
// import TipTapContent from "@/components/editor/TipTapContent";
// import ExamPlatformSidebar from "./ExamPlatformSidebar";
// import SuccessStoriesCarousel from "./SuccessStoriesCarousel";
// import {
//   formatLastUpdatedLabel,
//   getOfficialExamInfoPathFromExam,
// } from "./examInfoUtils";
// import {
//   buildPracticeTestSeoSegment,
//   getExamLandingPath,
//   getExamPracticePath,
// } from "@/utils/practiceTestRouting";

// export default function ExamDetailClient({ examData, provider, examCode }) {
//   const router = useRouter();
//   const getHeadingText = (headingHtml, fallback) => {
//     if (!headingHtml || typeof headingHtml !== "string") return fallback;
//     const plainText = headingHtml
//       .replace(/<[^>]+>/g, " ")
//       .replace(/&nbsp;/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//     return plainText || fallback;
//   };

//   const [startModalOpen, setStartModalOpen] = useState(false);
//   const [startModalTest, setStartModalTest] = useState(null);
//   const [startModalUrl, setStartModalUrl] = useState("");

//   const startModalMeta = useMemo(() => {
//     const test = startModalTest || {};
//     const questions = test.questions ?? test.total_questions ?? test.totalQuestions ?? 0;
//     const duration = test.duration ?? test.time ?? test.time_limit ?? "";
//     const difficulty = test.difficulty ?? test.level ?? "Intermediate";
//     const title = test.title || test.name || "Practice Test";
//     return {
//       title,
//       questions: Number.isFinite(Number(questions)) ? String(Number(questions)) : String(questions || 0),
//       duration: String(duration || "").trim(),
//       difficulty: String(difficulty || "").trim() || "Intermediate",
//     };
//   }, [startModalTest]);

//   const openStartModalForTest = (test, idx) => {
//     const testSlug = buildPracticeTestSeoSegment({
//       examName: examData?.title,
//       examCode: examData?.code || examCode,
//       examSlug: examData?.slug,
//       test,
//       index: idx,
//     });
//     const url = `/${testSlug}`;
//     setStartModalTest(test || null);
//     setStartModalUrl(url);
//     setStartModalOpen(true);
//   };


//   // Breadcrumb items
//   const hasProvider =
//     Boolean(String(examData?.provider || "").trim()) &&
//     Boolean(String(provider || examData?.providerSlug || "").trim());

//   const breadcrumbItems = [
//     { name: "Home", url: "/" },
//     { name: "Exams", url: "/exams" },
//     ...(hasProvider
//       ? [
//           {
//             name: examData.provider,
//             url: `/providers/${examData.providerSlug || provider}`,
//           },
//         ]
//       : []),
//     {
//       name: examData.title || examData.code,
//       url: examData.slug
//         ? `/${examData.slug}`
//         : hasProvider
//           ? `/exams/${provider}/${examCode}`
//           : `/${examCode}`,
//     },
//   ];
//   const practiceUrl =
//     examData.practiceUrl ||
//     getExamPracticePath({
//       slug: examData.slug,
//       title: examData.title,
//       code: examData.code || examCode,
//     }) ||
//     `/${examCode}/practice`;

//   const lastUpdatedLabel = formatLastUpdatedLabel(examData);
//   const providerSlug = examData.providerSlug || provider;
  
//   const officialDetailsUrl =
//     examData.officialDetailsUrl ||
//     getOfficialExamInfoPathFromExam({
//       slug: examData.slug,
//       title: examData.title || examData.code || examCode,
//       code: examData.code || examCode,
//     });
//     const showOfficialDetailsButton =
//       Boolean(examData?.hasOfficialDetails) &&
//       examData?.officialDetailsUrl;

//   const platformRows = [
//     ...(hasProvider
//       ? [
//           {
//             label: "Provider",
//             value: examData.provider,
//             isLink: true,
//             href: `/providers/${providerSlug}`,
//           },
//         ]
//       : []),
//     { label: "Exam Code", value: examData.code || examCode },
//     { label: "Exam Name", value: examData.title },
//     {
//       label: "Exam Questions",
//       value:
//         examData.totalQuestions > 0 ? String(examData.totalQuestions) : null,
//     },
//     { label: "Last Updated", value: lastUpdatedLabel },
//   ].filter((row) => row.value);

//   const matchPercent = examData.passRate ?? 94;
//   const statCardTitle =
//     getHeadingText(examData.page_heading, null) ||
//     examData.title ||
//     examData.code;

//   return (
//     <div className="min-h-screen bg-white">
//       {examData && <BreadcrumbJsonLd items={breadcrumbItems} />}
//       <div className="container mx-auto px-4 py-8">

//         {/* Breadcrumb */}
//         <Breadcrumb className="mb-6">
//           <BreadcrumbList>
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/" className="text-[#0C1A35] hover:text-[#1A73E8]">Home</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/exams" className="text-[#0C1A35] hover:text-[#1A73E8]">Exams</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             {hasProvider ? (
//               <>
//                 <BreadcrumbItem>
//                   <BreadcrumbLink asChild>
//                     <Link
//                       href={`/providers/${providerSlug}`}
//                       className="text-[#0C1A35] hover:text-[#1A73E8]"
//                     >
//                       {examData.provider}
//                     </Link>
//                   </BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator />
//               </>
//             ) : null}
//             <BreadcrumbPage className="text-[#0C1A35]">
//               {examData.title || examData.code}
//             </BreadcrumbPage>
//           </BreadcrumbList>
//         </Breadcrumb>

//         {/* Hero Section */}
//         <div className="mb-8">
//           <div className="flex flex-wrap gap-2 mb-4">
//             <Badge className="bg-[#1A73E8] text-white border-0">{examData.code}</Badge>
//             {hasProvider ? (
//               <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
//                 {examData.provider}
//               </Badge>
//             ) : null}
//             {examData.category.map((cat, idx) => (
//               <Badge key={idx} className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{cat}</Badge>
//             ))}
//             <Badge className="bg-green-100 text-green-700 border-0">{examData.difficulty}</Badge>
//           </div>
//           <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">
//             {getHeadingText(examData.page_heading, examData.title)}
//           </h1>
//           {lastUpdatedLabel ? (
//             <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
//               <div className="flex items-center gap-1.5">
//                 <Clock className="w-4 h-4 text-[#1A73E8] shrink-0" />
//                 <span>Last updated on {lastUpdatedLabel}</span>
//               </div>
//             </div>
//           ) : null}
//         </div>

//         {examData.rating !== null && (
//           <RatingJsonLd 
//             rating={examData.rating} 
//             reviewCount={examData.reviews || (examData.testimonials && examData.testimonials.length) || null}
//             itemName={examData.title}
//             itemType="Product"
//             schemaId="exam-rating-json-ld-schema"
//           />
//         )}

//         {examData.testimonials && examData.testimonials.length > 0 && (
//           <ReviewsJsonLd testimonials={examData.testimonials} itemName={examData.title} />
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">

//             {/* Summary Card */}
//             {/* <Card className="border-[#DDE7FF]">
//               <CardHeader>
//                 <CardTitle className="text-[#0C1A35]">Exam Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Duration</p>
//                     {examData.duration && (
//                         <p className="font-semibold text-[#0C1A35]">
//                             {examData.duration}
//                         </p>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Passing Score</p>
//                     <p className="font-semibold text-[#0C1A35]">{examData.passingScore}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Practice Tests</p>
//                     <p className="font-semibold text-[#0C1A35]">{examData.practiceTests}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-1">Total Questions</p>
//                     <p className="font-semibold text-[#0C1A35]">{examData.totalQuestions}</p>
//                   </div>
//                 </div>
//                 {examData.passRate !== null && (
//                   <div>
//                     <p className="text-sm text-[#0C1A35]/60 mb-2">Pass Rate</p>
//                     <div className="flex items-center gap-2">
//                       <Progress value={examData.passRate} className="flex-1" />
//                       <span className="text-sm font-semibold text-[#0C1A35]">{examData.passRate}%</span>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card> */}

//             {/* About Section */}
//             {/* Main Content From Admin */}
//             {(examData.about || examData.exam_details) && (
//               <Card className="border-[#DDE7FF]">
//                 <CardContent className="pt-6">
//                   <TipTapContent
//                     className="text-[#0C1A35]/80 leading-relaxed"
//                     content={
//                       examData.about ||
//                       examData.exam_details ||
//                       examData.details ||
//                       ""
//                     }
//                   />
//                 </CardContent>
//               </Card>
// )}

//             {/* Practice Tests (from admin data) */}
//             {examData.practiceTestsList && examData.practiceTestsList.length > 0 && (
//               <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                   <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
//                     {getHeadingText(examData.practice_tests_heading, "Available Practice Tests")}
//                   </h2>
//                   {examData.testDescription ? (
//                     <CardDescription>{examData.testDescription}</CardDescription>
//                   ) : null}
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {examData.practiceTestsList.map((test, idx) => (
//                     <div key={test.id || test.name || idx} className="p-4 border border-[#DDE7FF] rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
//                       <div className="flex items-center justify-between mb-2">
//                         <h4 className="font-semibold text-[#0C1A35]">{test.name || `Practice Test ${idx + 1}`}</h4>
//                         <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{test.difficulty || "Intermediate"}</Badge>
//                       </div>
//                       <div className="flex items-center gap-4 text-sm text-[#0C1A35]/70 mb-3">
//                         <span>{test.questions || 0} Questions</span>
//                         {test.duration && <span>• {test.duration}</span>}
//                       </div>
//                       <Button
//                         type="button"
//                         onClick={() => openStartModalForTest(test, idx)}
//                         className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg mt-auto"
//                       >
//                         Start Practicing →
//                       </Button>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             )}



//             {/* Testimonials */}
//             {examData.testimonials && examData.testimonials.length > 0 && (
//               <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                   <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
//                     {getHeadingText(examData.testimonials_heading, "Student Success Stories")}
//                   </h2>
//                   <CardDescription>Hear from those who passed with our practice tests</CardDescription>
//                 </CardHeader>
//                 <CardContent className="pt-0 pb-4">
//                   <SuccessStoriesCarousel testimonials={examData.testimonials} />
//                 </CardContent>
//               </Card>
//             )}

//             {/* FAQs */}
//             {examData.faqs && examData.faqs.length > 0 && (
//               <Card className="border-[#DDE7FF]">
//                 <CardHeader>
//                   <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
//                     {getHeadingText(examData.faqs_heading, "Frequently Asked Questions")}
//                   </h2>
//                 </CardHeader>
//                 <CardContent>
//                   <Accordion type="single" collapsible>
//                     {examData.faqs.map((faq, idx) => (
//                       <AccordionItem key={idx} value={`faq-${idx}`}>
//                         <AccordionTrigger className="text-[#0C1A35] font-medium">{faq.question}</AccordionTrigger>
//                         <AccordionContent className="text-[#0C1A35]/80" >
//                           <TipTapContent content={faq.answer} />
//                         </AccordionContent>
//                       </AccordionItem>
//                     ))}
//                   </Accordion>
//                 </CardContent>
//               </Card>
//             )}

//           </div>

//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <ExamPlatformSidebar
//               statCardTitle={statCardTitle}
//               lastUpdatedLabel={lastUpdatedLabel}
//               platformRows={platformRows}
//               practiceUrl={practiceUrl}
//               officialDetailsUrl={officialDetailsUrl}
//               hasOfficialDetails={examData?.hasOfficialDetails}  
//               matchPercent={matchPercent}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Login Modal */}
      
//       <Dialog open={startModalOpen} onOpenChange={setStartModalOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A73E8]/10 text-[#1A73E8]">
//               <FileText className="h-7 w-7" aria-hidden />
//             </div>
//             <DialogTitle className="text-center text-[#0C1A35]">
//               Ready to Start Your Test?
//             </DialogTitle>
//             <DialogDescription className="text-center">
//               This practice test contains questions to help you prepare for the exam.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="mt-2">
//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//               <div className="rounded-xl border border-[#DDE7FF] bg-[#F3F8FF] px-4 py-3 text-center">
//                 <div className="text-lg font-bold text-[#1A73E8]">
//                   {startModalMeta.questions}
//                 </div>
//                 <div className="text-xs text-[#0C1A35]/65">Questions</div>
//               </div>
//               <div className="rounded-xl border border-[#DDE7FF] bg-[#F4FFF6] px-4 py-3 text-center">
//                 <div className="text-lg font-bold text-emerald-600">
//                   {startModalMeta.duration || "—"}
//                 </div>
//                 <div className="text-xs text-[#0C1A35]/65">Duration</div>
//               </div>
//               <div className="rounded-xl border border-[#DDE7FF] bg-[#FBF5FF] px-4 py-3 text-center">
//                 <div className="text-lg font-bold text-purple-600">
//                   {startModalMeta.difficulty}
//                 </div>
//                 <div className="text-xs text-[#0C1A35]/65">Difficulty</div>
//               </div>
//             </div>

//             <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="sm:min-w-[160px]"
//                 onClick={() => setStartModalOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="button"
//                 className="bg-[#1A73E8] hover:bg-[#1557B0] text-white sm:min-w-[160px]"
//                 onClick={() => {
//                   if (!startModalUrl) return;
//                   if (typeof window !== "undefined") {
//                     sessionStorage.setItem(`autostart:${startModalUrl}`, "1");
//                   }
//                   router.push(startModalUrl);
//                 }}
//               >
//                 Start Test Now
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//     </div>
//   );
// }





import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Star, Clock, CheckCircle2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import RatingJsonLd from "@/components/RatingJsonLd";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import StartTestButton from "./StartTestButton";
import TipTapContent from "@/components/editor/TipTapContent";
import ExamPlatformSidebar from "./ExamPlatformSidebar";
import SuccessStoriesCarousel from "./SuccessStoriesCarousel";
import {
  formatLastUpdatedLabel,
  getOfficialExamInfoPathFromExam,
} from "./examInfoUtils";
import {
  buildPracticeTestSeoSegment,
  getExamLandingPath,
  getExamPracticePath,
} from "@/utils/practiceTestRouting";

export default function ExamDetailClient({ examData, provider, examCode }) {
  const router = useRouter();

  const getHeadingText = (headingHtml, fallback) => {
    if (!headingHtml || typeof headingHtml !== "string") return fallback;
    const plainText = headingHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plainText || fallback;
  };

  const [startModalOpen, setStartModalOpen] = useState(false);
  const [startModalTest, setStartModalTest] = useState(null);
  const [startModalUrl, setStartModalUrl] = useState("");

  const startModalMeta = useMemo(() => {
    const test = startModalTest || {};
    const questions = test.questions ?? test.total_questions ?? test.totalQuestions ?? 0;
    const duration = test.duration ?? test.time ?? test.time_limit ?? "";
    const difficulty = test.difficulty ?? test.level ?? "Intermediate";
    const title = test.title || test.name || "Practice Test";

    return {
      title,
      questions: Number.isFinite(Number(questions)) ? String(Number(questions)) : String(questions || 0),
      duration: String(duration || "").trim(),
      difficulty: String(difficulty || "").trim() || "Intermediate",
    };
  }, [startModalTest]);

  const openStartModalForTest = (test, idx) => {
    const testSlug = buildPracticeTestSeoSegment({
      examName: examData?.title,
      examCode: examData?.code || examCode,
      examSlug: examData?.slug,
      test,
      index: idx,
    });

    const url = `/${testSlug}`;

    setStartModalTest(test || null);
    setStartModalUrl(url);
    setStartModalOpen(true);
  };

  const hasProvider =
    Boolean(String(examData?.provider || "").trim()) &&
    Boolean(String(provider || examData?.providerSlug || "").trim());

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
    ...(hasProvider
      ? [
          {
            name: examData.provider,
            url: `/providers/${examData.providerSlug || provider}`,
          },
        ]
      : []),
    {
      name: examData.title || examData.code,
      url: examData.slug
        ? `/${examData.slug}`
        : hasProvider
          ? `/exams/${provider}/${examCode}`
          : `/${examCode}`,
    },
  ];

  const practiceUrl =
    examData.practiceUrl ||
    getExamPracticePath({
      slug: examData.slug,
      title: examData.title,
      code: examData.code || examCode,
    }) ||
    `/${examCode}/practice`;

  const lastUpdatedLabel = formatLastUpdatedLabel(examData);
  const providerSlug = examData.providerSlug || provider;

  const officialDetailsUrl =
    examData.officialDetailsUrl ||
    getOfficialExamInfoPathFromExam({
      slug: examData.slug,
      title: examData.title || examData.code || examCode,
      code: examData.code || examCode,
    });

  const platformRows = [
    ...(hasProvider
      ? [
          {
            label: "Provider",
            value: examData.provider,
            isLink: true,
            href: `/providers/${providerSlug}`,
          },
        ]
      : []),
    { label: "Exam Code", value: examData.code || examCode },
    { label: "Exam Name", value: examData.title },
    {
      label: "Exam Questions",
      value: examData.totalQuestions > 0 ? String(examData.totalQuestions) : null,
    },
    { label: "Last Updated", value: lastUpdatedLabel },
  ].filter((row) => row.value);

  const matchPercent = examData.passRate ?? 94;

  const statCardTitle =
    getHeadingText(examData.page_heading, null) ||
    examData.title ||
    examData.code;

  return (
    <div className="min-h-screen bg-white">
      {examData && <BreadcrumbJsonLd items={breadcrumbItems} />}

      <div className="container mx-auto px-4 py-8">

        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-[#0C1A35] hover:text-[#1A73E8]">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/exams" className="text-[#0C1A35] hover:text-[#1A73E8]">Exams</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {hasProvider ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/providers/${providerSlug}`}
                      className="text-[#0C1A35] hover:text-[#1A73E8]"
                    >
                      {examData.provider}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : null}

            <BreadcrumbPage className="text-[#0C1A35]">
              {examData.title || examData.code}
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-[#1A73E8] text-white border-0">{examData.code}</Badge>

            {hasProvider ? (
              <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
                {examData.provider}
              </Badge>
            ) : null}

            {examData.category.map((cat, idx) => (
              <Badge key={idx} className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
                {cat}
              </Badge>
            ))}

            <Badge className="bg-green-100 text-green-700 border-0">
              {examData.difficulty}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">
            {getHeadingText(examData.page_heading, examData.title)}
          </h1>

          {lastUpdatedLabel ? (
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1A73E8] shrink-0" />
                <span>Last updated on {lastUpdatedLabel}</span>
              </div>
            </div>
          ) : null}
        </div>

        {examData.rating !== null && (
          <RatingJsonLd
            rating={examData.rating}
            reviewCount={
              examData.reviews ||
              (examData.testimonials && examData.testimonials.length) ||
              null
            }
            itemName={examData.title}
            itemType="Product"
            schemaId="exam-rating-json-ld-schema"
          />
        )}

        {examData.testimonials && examData.testimonials.length > 0 && (
          <ReviewsJsonLd
            testimonials={examData.testimonials}
            itemName={examData.title}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            {(examData.about || examData.exam_details) && (
              <Card className="border-[#DDE7FF]">
                <CardContent className="pt-0">
                  <TipTapContent
                    className="text-[#0C1A35]/80 leading-relaxed"
                    content={
                      examData.about ||
                      examData.exam_details ||
                      examData.details ||
                      ""
                    }
                  />
                </CardContent>
              </Card>
            )}

            {examData.practiceTestsList && examData.practiceTestsList.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                    {getHeadingText(
                      examData.practice_tests_heading,
                      "Available Practice Tests"
                    )}
                  </h2>

                  {examData.testDescription ? (
                    <CardDescription>{examData.testDescription}</CardDescription>
                  ) : null}
                </CardHeader>

                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {examData.practiceTestsList.map((test, idx) => (
                    <div
                      key={test.id || test.name || idx}
                      className="p-4 border border-[#DDE7FF] rounded-lg hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#0C1A35]">
                          {test.name || `Practice Test ${idx + 1}`}
                        </h4>
                        <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
                          {test.difficulty || "Intermediate"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[#0C1A35]/70 mb-3">
                        <span>{test.questions || 0} Questions</span>
                        {test.duration && <span>• {test.duration}</span>}
                      </div>

                      <Button
                        type="button"
                        onClick={() => openStartModalForTest(test, idx)}
                        className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg mt-auto"
                      >
                        Start Practicing →
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {examData.testimonials && examData.testimonials.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                    {getHeadingText(
                      examData.testimonials_heading,
                      "Student Success Stories"
                    )}
                  </h2>
                  <CardDescription>
                    Hear from those who passed with our practice tests
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-4">
                  <SuccessStoriesCarousel testimonials={examData.testimonials} />
                </CardContent>
              </Card>
            )}

            {examData.faqs && examData.faqs.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                    {getHeadingText(
                      examData.faqs_heading,
                      "Frequently Asked Questions"
                    )}
                  </h2>
                </CardHeader>

                <CardContent>
                  <Accordion type="single" collapsible>
                    {examData.faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-[#0C1A35] font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#0C1A35]/80">
                          <TipTapContent content={faq.answer} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

          </div>

          <div className="lg:col-span-1">
            <ExamPlatformSidebar
              statCardTitle={statCardTitle}
              lastUpdatedLabel={lastUpdatedLabel}
              platformRows={platformRows}
              practiceUrl={practiceUrl}
              officialDetailsUrl={officialDetailsUrl}
              hasOfficialDetails={examData?.hasOfficialDetails === true}
              matchPercent={matchPercent}
            />
          </div>

        </div>
      </div>

      <Dialog open={startModalOpen} onOpenChange={setStartModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A73E8]/10 text-[#1A73E8]">
              <FileText className="h-7 w-7" aria-hidden />
            </div>

            <DialogTitle className="text-center text-[#0C1A35]">
              Ready to Start Your Test?
            </DialogTitle>

            <DialogDescription className="text-center">
              This practice test contains questions to help you prepare for the exam.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#DDE7FF] bg-[#F3F8FF] px-4 py-3 text-center">
                <div className="text-lg font-bold text-[#1A73E8]">
                  {startModalMeta.questions}
                </div>
                <div className="text-xs text-[#0C1A35]/65">Questions</div>
              </div>

              <div className="rounded-xl border border-[#DDE7FF] bg-[#F4FFF6] px-4 py-3 text-center">
                <div className="text-lg font-bold text-emerald-600">
                  {startModalMeta.duration || "—"}
                </div>
                <div className="text-xs text-[#0C1A35]/65">Duration</div>
              </div>

              <div className="rounded-xl border border-[#DDE7FF] bg-[#FBF5FF] px-4 py-3 text-center">
                <div className="text-lg font-bold text-purple-600">
                  {startModalMeta.difficulty}
                </div>
                <div className="text-xs text-[#0C1A35]/65">Difficulty</div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                variant="outline"
                className="sm:min-w-[160px]"
                onClick={() => setStartModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="bg-[#1A73E8] hover:bg-[#1557B0] text-white sm:min-w-[160px]"
                onClick={() => {
                  if (!startModalUrl) return;
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(`autostart:${startModalUrl}`, "1");
                  }
                  router.push(startModalUrl);
                }}
              >
                Start Test Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}