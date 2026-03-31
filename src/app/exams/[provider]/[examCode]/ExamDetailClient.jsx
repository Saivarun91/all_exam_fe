// "use client";

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







import Link from "next/link";

import { Star, Clock, TrendingUp, CheckCircle2, BookOpen, Target, Award, ArrowRight } from "lucide-react";

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

function cellPlain(inner) {
  return inner
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** TipTap exam details are usually a <table>: label and value live in separate cells — flattening breaks regex. */
function extractRowMapFromHtml(html) {
  const map = {};
  if (!html || typeof html !== "string") return map;

  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRe.exec(html)) !== null) {
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    const cells = [];
    let cMatch;
    while ((cMatch = cellRe.exec(trMatch[1])) !== null) {
      const t = cellPlain(cMatch[1]);
      if (t) cells.push(t);
    }
    if (cells.length === 4) {
      const pairs = [
        [cells[0], cells[1]],
        [cells[2], cells[3]],
      ];
      for (const [lb, val] of pairs) {
        const label = lb.replace(/:\s*$/i, "").trim();
        const value = String(val).trim();
        if (!label || !value) continue;
        const key = label.toLowerCase().replace(/\s+/g, " ");
        if (!Object.prototype.hasOwnProperty.call(map, key)) map[key] = value;
      }
      continue;
    }
    if (cells.length < 2) continue;
    const label = cells[0].replace(/:\s*$/i, "").trim();
    const value = cells.slice(1).join(" ").trim();
    if (!label || !value) continue;
    const key = label.toLowerCase().replace(/\s+/g, " ");
    if (!Object.prototype.hasOwnProperty.call(map, key)) map[key] = value;
  }
  return map;
}

function pickRowValue(map, candidatesExactThenContains) {
  const keys = Object.keys(map);
  for (const phrase of candidatesExactThenContains) {
    const p = phrase.toLowerCase().replace(/\s+/g, " ");
    const hit = keys.find((k) => k === p);
    if (hit) return map[hit].trim();
  }
  for (const phrase of candidatesExactThenContains) {
    const p = phrase.toLowerCase().replace(/\s+/g, " ");
    const hit = keys.find((k) => k.includes(p));
    if (hit) return map[hit].trim();
  }
  return null;
}

function extractExamInfo(html) {
  if (!html || typeof html !== "string") return {};

  const rowMap = extractRowMapFromHtml(html);

  const fromRows = {
    duration: pickRowValue(rowMap, [
      "duration",
      "exam duration",
      "test duration",
      "time allowed",
      "exam time",
    ]),
    totalQuestions: pickRowValue(rowMap, [
      "number of questions",
      "no. of questions",
      "no of questions",
      "total questions",
      "question count",
      "questions",
    ]),
    passingScore: pickRowValue(rowMap, [
      "passing score",
      "pass score",
      "pass mark",
      "passing marks",
      "cutoff",
      "cut-off",
      "cut off",
    ]),
    examCostDisplay: pickRowValue(rowMap, [
      "cost",
      "price",
      "exam fee",
      "fee",
    ]),
    provider: pickRowValue(rowMap, [
      "certification body",
      "certifying body",
      "provider",
      "exam provider",
    ]),
    examCode: pickRowValue(rowMap, ["exam code", "code", "exam id"]),
  };

  // Fallback: single-line / prose (no <tr> pairs) — same string the user sees after flattening
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const NEXT_LABEL_STOP =
    "(?=\\s*(?:Number of Questions|Certification Body|Passing Score|Cost|Price|Provider|Exam Code|Duration)\\b|$)";

  const getValueFlat = (labelAlternation) => {
    const re = new RegExp(
      `(?:${labelAlternation})\\s*:?\\s*(.*?)${NEXT_LABEL_STOP}`,
      "is"
    );
    const match = text.match(re);
    return match ? match[1].trim() : null;
  };

  const fromFlat = {
    duration: getValueFlat("Duration"),
    totalQuestions: getValueFlat("Number of Questions|Questions"),
    passingScore: getValueFlat("Passing Score"),
    examCostDisplay: getValueFlat("Cost|Price"),
    provider: getValueFlat("Certification Body|Provider"),
    examCode: getValueFlat("Exam Code"),
  };

  const merge = (a, b) => (a && String(a).trim() ? String(a).trim() : b && String(b).trim() ? String(b).trim() : null);

  return {
    duration: merge(fromRows.duration, fromFlat.duration),
    totalQuestions: merge(fromRows.totalQuestions, fromFlat.totalQuestions),
    passingScore: merge(fromRows.passingScore, fromFlat.passingScore),
    examCostDisplay: merge(fromRows.examCostDisplay, fromFlat.examCostDisplay),
    provider: merge(fromRows.provider, fromFlat.provider),
    examCode: merge(fromRows.examCode, fromFlat.examCode),
  };
}


export default function ExamDetailClient({ examData, provider, examCode }) {
  const getHeadingText = (headingHtml, fallback) => {
    if (!headingHtml || typeof headingHtml !== "string") return fallback;
    const plainText = headingHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plainText || fallback;
  };


  // Breadcrumb items
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
    { name: examData.provider, url: `/${provider}` },
    { name: examData.code, url: `/exams/${provider}/${examCode}` },
  ];
  const extractedFromHtml = extractExamInfo(
    examData?.exam_details ||
      examData?.details ||
      examData?.testDescription
  );

  /** Prefer text parsed from the same HTML as the Exam Details card so the stat card matches the section. */
  const preferDetailsThenApi = (fromHtml, fromApi) => {
    const h =
      fromHtml != null && String(fromHtml).trim() !== ""
        ? String(fromHtml).trim()
        : null;
    const a =
      fromApi != null && String(fromApi).trim() !== ""
        ? String(fromApi).trim()
        : null;
    return h || a || null;
  };

  const sidebarStats = {
    examCode: preferDetailsThenApi(
      extractedFromHtml.examCode,
      examData.code || examCode
    ),
    duration: preferDetailsThenApi(extractedFromHtml.duration, examData.duration),
    totalQuestions: preferDetailsThenApi(
      extractedFromHtml.totalQuestions,
      examData.totalQuestions > 0 ? String(examData.totalQuestions) : null
    ),
    passingScore: preferDetailsThenApi(
      extractedFromHtml.passingScore,
      examData.passingScore && examData.passingScore !== "Not specified"
        ? examData.passingScore
        : null
    ),
    examCostDisplay: preferDetailsThenApi(
      extractedFromHtml.examCostDisplay,
      examData.examCostDisplay
    ),
    provider: preferDetailsThenApi(
      extractedFromHtml.provider,
      examData.provider
    ),
  };

  return (
    <div className="min-h-screen bg-white">
      {examData && <BreadcrumbJsonLd items={breadcrumbItems} />}
      <div className="container mx-auto px-4 py-8">

        {/* Breadcrumb */}
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
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${provider}`} className="text-[#0C1A35] hover:text-[#1A73E8]">
                  {examData.provider}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-[#0C1A35]">{examData.code}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-[#1A73E8] text-white border-0">{examData.code}</Badge>
            <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{examData.provider}</Badge>
            {examData.category.map((cat, idx) => (
              <Badge key={idx} className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{cat}</Badge>
            ))}
            <Badge className="bg-green-100 text-green-700 border-0">{examData.difficulty}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{examData.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-[#1A73E8]" />
              <span>Updated {examData.lastUpdated}</span>
            </div>
            {examData.passRate !== null && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-semibold">{examData.passRate}% Pass Rate</span>
              </div>
            )}
          </div>
        </div>

        {examData.rating !== null && (
          <RatingJsonLd 
            rating={examData.rating} 
            reviewCount={examData.reviews || (examData.testimonials && examData.testimonials.length) || null}
            itemName={examData.title}
            itemType="Product"
            schemaId="exam-rating-json-ld-schema"
          />
        )}

        {examData.testimonials && examData.testimonials.length > 0 && (
          <ReviewsJsonLd testimonials={examData.testimonials} itemName={examData.title} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Summary Card */}
            {/* <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">Duration</p>
                    {examData.duration && (
                        <p className="font-semibold text-[#0C1A35]">
                            {examData.duration}
                        </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">Passing Score</p>
                    <p className="font-semibold text-[#0C1A35]">{examData.passingScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">Practice Tests</p>
                    <p className="font-semibold text-[#0C1A35]">{examData.practiceTests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">Total Questions</p>
                    <p className="font-semibold text-[#0C1A35]">{examData.totalQuestions}</p>
                  </div>
                </div>
                {examData.passRate !== null && (
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-2">Pass Rate</p>
                    <div className="flex items-center gap-2">
                      <Progress value={examData.passRate} className="flex-1" />
                      <span className="text-sm font-semibold text-[#0C1A35]">{examData.passRate}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card> */}

            {/* About Section */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                  {getHeadingText(examData.about_heading, "About This Exam")}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: examData.about }} />
              </CardContent>
            </Card>

            {/* Exam Details */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                  {getHeadingText(examData.exam_details_heading, "Exam Details")}
                </h2>
              </CardHeader>
              <CardContent>
                <div
                  className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      examData.exam_details ||
                      examData.details ||
                      examData.testDescription ||
                      "Detailed exam information will be updated soon.",
                  }}
                />
              </CardContent>
            </Card>

            
            {/* Topics Covered */}
            {examData.topics && examData.topics.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader className="py-6 px-6">
                  <h2 className="text-[#0C1A35] text-2xl font-bold tracking-tight">
                    {getHeadingText(examData.topics_heading, "Topics Covered")}
                  </h2>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-6">
                  {examData.topics.map((topic, idx) => {
                    const percentage = Math.round((topic.startPercentage + topic.endPercentage) / 2);
                    const topicExplanation =
                      typeof topic.explanation === "string" && topic.explanation.trim()
                        ? topic.explanation.trim()
                        : typeof topic.description === "string" && topic.description.trim()
                          ? topic.description.trim()
                          : "";

                    return (
                      <div key={idx} className="bg-[#F9FAFE] rounded-lg p-4 hover:bg-[#EEF4FF] transition-colors duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-[#0C1A35]">{topic.name}</span>
                          <span className="text-sm font-medium text-[#4F46E5]">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-3 rounded-full bg-[#E0E7FF] progress-bar-[#4F46E5]" />
                        {topicExplanation && (
                          <p className="text-sm text-[#0C1A35]/70 mt-3 leading-relaxed whitespace-pre-wrap">
                            {topicExplanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            {/* What's Included */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                  {getHeadingText(examData.whats_included_heading, "Whats Included in This Practice Pack")}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {examData.whatsIncluded.map((item, idx) => (
                    <div key={idx} className="tiptap-editor-content text-[#0C1A35]/80" dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why This Exam Matters */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                  {getHeadingText(examData.why_matters_heading, "Why This Exam Matters")}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="text-[#0C1A35]/80 leading-relaxed tiptap-editor-content" dangerouslySetInnerHTML={{ __html: examData.whyMatters }} />
              </CardContent>
            </Card>

            {/* Exam Format Summary */}
            {/* <Card className="border-[#DDE7FF]">
              <CardHeader>
                <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">Exam Format Summary</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
                    <BookOpen className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0C1A35]">{examData.totalQuestions}</p>
                    <p className="text-sm text-[#0C1A35]/60">Questions</p>
                  </div>
                  <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
                    <Clock className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0C1A35]">{examData.duration}</p>
                    <p className="text-sm text-[#0C1A35]/60">Duration</p>
                  </div>
                  <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
                    <Target className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0C1A35]">{examData.passingScore}</p>
                    <p className="text-sm text-[#0C1A35]/60">Passing Score</p>
                  </div>
                  <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
                    <Award className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0C1A35]">{examData.difficulty}</p>
                    <p className="text-sm text-[#0C1A35]/60">Difficulty</p>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Practice Tests List */}
            {/* {examData.practiceTestsList && examData.practiceTestsList.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                    {getHeadingText(examData.practice_tests_heading, "Available Practice Tests")}
                  </h2>
                  <CardDescription>Choose a practice test to start your preparation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {examData.practiceTestsList.map((test, idx) => (
                    <div key={test.id || test.name || idx} className="p-4 border border-[#DDE7FF] rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#0C1A35]">{test.name || `Practice Test ${idx + 1}`}</h4>
                        <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">{test.difficulty || "Intermediate"}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#0C1A35]/70 mb-3">
                        <span>{test.questions || 0} Questions</span>
                        {test.duration && <span>• {test.duration}</span>}
                      </div>
                      {test.progress !== undefined && (
                        <div className="mb-3">
                          <Progress value={test.progress || 0} className="h-2" />
                        </div>
                      )}
                      <StartTestButton
                        url={`/exams/${provider}/${examCode}/practice/${test.slug || test.id || idx + 1}`}
                      />
                        
                    </div>
                  ))}
                </CardContent>
              </Card>
            )} */}

            {examData.practiceTestsList && examData.practiceTestsList.length > 0 && (
              <Card className="relative overflow-hidden border-0 shadow-lg rounded-2xl bg-gradient-to-br from-[#EEF4FF] via-[#F8FAFF] to-[#FFFFFF]">
                
                {/* Background Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1A73E8]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#4F8CFF]/10 rounded-full blur-3xl"></div>

                <CardHeader className="text-center space-y-3">
                  <h2 className="text-[#0C1A35] text-2xl font-bold tracking-tight">
                    🚀 Start Your Practice
                  </h2>

                  <CardDescription className="text-[#4A5A7A] text-sm">
                    Practice real exam-style questions and boost your confidence
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center gap-5 pb-8">
                  
                <p className="text-sm text-[#0C1A35]/70 leading-relaxed w-full">
                    Get access to high-quality practice tests designed to simulate the real exam. 
                    Improve accuracy, track progress, and increase your chances of passing on the first attempt.
                  </p>

                  <StartTestButton
                    url={`/${examCode}/practice`}
                    label="Start Practicing"
                    className="bg-[#1A73E8] hover:bg-[#1557C0] text-white px-8 py-3 rounded-lg text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  />

                  {/* Optional trust line */}
                  <span className="text-xs text-[#0C1A35]/50">
                    ✔ Real exam questions • ✔ Instant results • ✔ Track progress
                  </span>

                </CardContent>
              </Card>
            )}



            {/* Testimonials */}
            {examData.testimonials && examData.testimonials.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                    {getHeadingText(examData.testimonials_heading, "Student Success Stories")}
                  </h2>
                  <CardDescription>Hear from those who passed with our practice tests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {examData.testimonials.map((testimonial, idx) => (
                    <div key={idx} className="p-4 border border-[#DDE7FF] rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-[#0C1A35]/80 mb-3 italic">"{testimonial.review || testimonial.comment}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#0C1A35]">{testimonial.name}</p>
                          <p className="text-sm text-[#0C1A35]/60">{testimonial.role || testimonial.title}</p>
                        </div>
                        {testimonial.verified && (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {examData.faqs && examData.faqs.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <h2 className="text-[#0C1A35] text-xl font-semibold leading-none tracking-tight">
                    {getHeadingText(examData.faqs_heading, "Frequently Asked Questions")}
                  </h2>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {examData.faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-[#0C1A35] font-medium">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-[#0C1A35]/80" >
                          <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-[#DDE7FF] sticky top-24">
              <CardHeader>
                {/* {examData.rating !== null && examData.rating !== undefined && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-[#0C1A35]">{examData.rating}</span>
                    {examData.reviews && examData.reviews > 0 && (
                      <span className="text-sm text-[#0C1A35]/60">({examData.reviews.toLocaleString()} reviews)</span>
                    )}
                  </div>
                )} */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between gap-3 items-start">
                    <span className="text-sm text-[#0C1A35]/70 shrink-0">Exam code</span>
                    <span className="font-semibold text-[#0C1A35] text-sm text-right min-w-0 break-words">
                      {sidebarStats.examCode}
                    </span>
                  </div>
                  {sidebarStats.duration ? (
                    <div className="flex justify-between gap-3 items-start">
                      <span className="text-sm text-[#0C1A35]/70 shrink-0">Duration</span>
                      <span className="font-semibold text-[#0C1A35] text-sm text-right min-w-0 break-words">
                        {sidebarStats.duration}
                      </span>
                    </div>
                  ) : null}
                  {sidebarStats.totalQuestions ? (
                    <div className="flex justify-between gap-3 items-start">
                      <span className="text-sm text-[#0C1A35]/70 shrink-0">Number of questions</span>
                      <span className="font-semibold text-[#0C1A35] text-sm text-right min-w-0 break-words">
                        {sidebarStats.totalQuestions}
                      </span>
                    </div>
                  ) : null}
                  {sidebarStats.passingScore ? (
                    <div className="flex justify-between gap-3 items-start">
                      <span className="text-sm text-[#0C1A35]/70 shrink-0">Passing score</span>
                      <span className="font-semibold text-[#0C1A35] text-sm text-right min-w-0 break-words">
                        {sidebarStats.passingScore}
                      </span>
                    </div>
                  ) : null}
                  {sidebarStats.examCostDisplay ? (
                    <div className="flex justify-between gap-3 items-start">
                      <span className="text-sm text-[#0C1A35]/70 shrink-0">Cost</span>
                      <span className="font-semibold text-[#0C1A35] text-sm text-right min-w-0 break-words">
                        {sidebarStats.examCostDisplay}
                      </span>
                    </div>
                  ) : null}
                  {sidebarStats.provider ? (
                    <div className="flex justify-between gap-3 items-start">
                      <span className="text-sm text-[#0C1A35]/70 shrink-0">Certification body</span>
                      <span className="font-semibold text-[#0C1A35] text-sm text-right min-w-0 break-words">
                        {sidebarStats.provider}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="pt-4 border-t border-[#DDE7FF]">
                <StartTestButton
                  url={`/${examCode}/practice`}
                />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      
    </div>
  );
}
