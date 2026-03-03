// import { notFound } from "next/navigation";
// import Link from "next/link";

// import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
// import ReviewsJsonLd from "@/components/ReviewsJsonLd";
// import RatingJsonLd from "@/components/RatingJsonLd";
// import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

// import PracticePageClient from "./PracticePageClient";

// export const dynamic = "force-dynamic";

// export default async function PracticePage(props) {
//     const { provider, examCode } = await props.params;
  
//     if (!provider || !examCode) return notFound();
  
//     const API_BASE =
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  
//     const normalizedProvider = provider.toLowerCase().replace(/_/g, "-");
//     const normalizedExamCode = examCode.toLowerCase().replace(/_/g, "-");
//     const slug = `${normalizedProvider}-${normalizedExamCode}`;
  
//     let examData = null;

//     try {
//     const res = await fetch(
//         `${API_BASE}/api/courses/exams/${slug}/`,
//         { cache: "no-store" }
//     );

//     if (!res.ok) throw new Error("Exam not found");

//     examData = await res.json();
//     } catch (err) {
//     console.error(err);
//     return notFound();
//     }

//     const practiceTests =
//     examData.practice_tests_list ||
//     examData.practice_tests ||
//     [];

//     const topics = Array.isArray(examData.topics)
//     ? examData.topics.map((t) => {
//         const raw =
//             t.percentage ??
//             t.weightage ??
//             t.percent ??
//             t.topic_weightage ??
//             t.weightage_percentage ??
//             t.weight ??
//             0;

//         let cleanValue = 0;

//         if (typeof raw === "string") {
//             cleanValue = parseFloat(raw.replace("%", "").trim());
//         } else if (typeof raw === "number") {
//             cleanValue = raw;
//         }

//         return {
//             name: t.name || "Topic",
//             percentage: isNaN(cleanValue) ? 0 : cleanValue,
//         };
//         })
//     : [];
//     const faqs = examData.faqs || [];
//     const testimonials = examData.testimonials || [];
  
//     const exam = {
//       title: examData.title || `${examData.provider} ${examData.code}`,
//       code: examData.code || examCode.toUpperCase(),
//       provider: examData.provider || provider.toUpperCase(),
//       category: examData.category ? [examData.category] : [],
//       difficulty: examData.difficulty || "Intermediate",
//       lastUpdated: examData.badge || "Recently updated",
//       passRate: examData.pass_rate || 90,
//       rating: examData.rating || 4.5,
//       practiceTests: practiceTests.length,
//       totalQuestions: practiceTests.reduce(
//         (sum, t) => sum + (parseInt(t.questions) || 0),
//         0
//       ),
//       duration: examData.duration || "130 minutes",
//       passingScore: examData.passing_score || "720/1000",
//       about:
//         examData.about ||
//         "Prepare for your certification exam with our comprehensive practice tests.",
//       whatsIncluded:
//         examData.whats_included || [
//           `${practiceTests.length} full-length practice tests`,
//           "Real exam-style difficulty and format",
//           "Detailed explanations for every question",
//           "Timed mode and Review mode available",
//           "Unlimited attempts on all practice tests",
//           "Performance tracking and analytics",
//           "Mobile-friendly interface",
//         ],
//       whyMatters:
//         examData.why_matters ||
//         "This certification validates your expertise and can significantly boost your career prospects.",
//     };
  
//     const breadcrumbItems = [
//       { name: "Home", url: "/" },
//       { name: "Exams", url: "/exams" },
//       { name: exam.provider, url: `/exams/${provider}` },
//       { name: exam.code, url: `/exams/${provider}/${examCode}` },
//       { name: "Practice Tests", url: `/exams/${provider}/${examCode}/practice` },
//     ];
  
//     return (
//       <div className="min-h-screen bg-white">
//         <PracticeTestJsonLd exam={exam} practiceTests={practiceTests} />
  
//         {exam.rating && (
//           <RatingJsonLd
//             rating={exam.rating}
//             reviewCount={testimonials.length}
//             itemName={exam.title}
//             itemType="Course"
//             schemaId="practice-rating-json-ld-schema"
//           />
//         )}
  
//         {testimonials.length > 0 && (
//           <ReviewsJsonLd
//             testimonials={testimonials}
//             itemName={exam.title}
//           />
//         )}
  
//         <BreadcrumbJsonLd items={breadcrumbItems} />

  
//         <PracticePageClient
//           exam={exam}
//           practiceTests={practiceTests}
//           topics={topics}
//           faqs={faqs}
//           testimonials={testimonials}
//           provider={provider}
//           examCode={examCode}
//           breadcrumbItems={breadcrumbItems}
//         />
//       </div>
//     );
//   }





// import { notFound } from "next/navigation";
// import Link from "next/link";

// import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
// import ReviewsJsonLd from "@/components/ReviewsJsonLd";
// import RatingJsonLd from "@/components/RatingJsonLd";
// import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

// import PracticePageClient from "./PracticePageClient";

// export const dynamic = "force-dynamic";

// export default async function PracticePage(props) {
//   const { provider, examCode } = await props.params;

//   if (!provider || !examCode) return notFound();

//   const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

//   const normalizedProvider = provider.toLowerCase().replace(/_/g, "-");
//   const normalizedExamCode = examCode.toLowerCase().replace(/_/g, "-");
//   const slug = `${normalizedProvider}-${normalizedExamCode}`;

//   let examData = null;

//   try {
//     const res = await fetch(`${API_BASE}/api/courses/exams/${slug}/`, { cache: "no-store" });
//     if (!res.ok) throw new Error("Exam not found");
//     examData = await res.json();
//   } catch (err) {
//     console.error(err);
//     return notFound();
//   }

//   const practiceTests = examData.practice_tests_list || examData.practice_tests || [];

//   const topics = Array.isArray(examData.topics)
//     ? examData.topics.map((t) => {
//         const raw = t.percentage ?? t.weightage ?? t.percent ?? t.topic_weightage ?? t.weightage_percentage ?? t.weight ?? 0;
//         let cleanValue = typeof raw === "string" ? parseFloat(raw.replace("%", "").trim()) : raw;
//         return { name: t.name || "Topic", percentage: isNaN(cleanValue) ? 0 : cleanValue };
//       })
//     : [];

//   const faqs = examData.faqs || [];
//   const testimonials = examData.testimonials || [];

//   const exam = {
//     title: examData.title || `${examData.provider} ${examData.code}`,
//     code: examData.code || examCode.toUpperCase(),
//     provider: examData.provider || provider.toUpperCase(),
//     category: examData.category ? [examData.category] : [],
//     difficulty: examData.difficulty || "Intermediate",
//     lastUpdated: examData.badge || "Recently updated",
//     passRate: examData.pass_rate || 90,
//     rating: examData.rating || 4.5,
//     practiceTests: practiceTests.length,
//     totalQuestions: practiceTests.reduce((sum, t) => sum + (parseInt(t.questions) || 0), 0),
//     duration: examData.duration || "130 minutes",
//     passingScore: examData.passing_score || "720/1000",
//     about: examData.about || "Prepare for your certification exam with our comprehensive practice tests.",
//     whatsIncluded: examData.whats_included || [
//       `${practiceTests.length} full-length practice tests`,
//       "Real exam-style difficulty and format",
//       "Detailed explanations for every question",
//       "Timed mode and Review mode available",
//       "Unlimited attempts on all practice tests",
//       "Performance tracking and analytics",
//       "Mobile-friendly interface",
//     ],
//     whyMatters: examData.why_matters || "This certification validates your expertise and can significantly boost your career prospects.",
//   };

//   const breadcrumbItems = [
//     { name: "Home", url: "/" },
//     { name: "Exams", url: "/exams" },
//     { name: exam.provider, url: `/exams/${provider}` },
//     { name: exam.code, url: `/exams/${provider}/${examCode}` },
//     { name: "Practice Tests", url: `/exams/${provider}/${examCode}/practice` },
//   ];

//   return (
//     <div className="min-h-screen bg-white">
//       {/* JSON-LD SEO */}
//       <PracticeTestJsonLd exam={exam} practiceTests={practiceTests} />
//       {exam.rating && <RatingJsonLd rating={exam.rating} reviewCount={testimonials.length} itemName={exam.title} itemType="Course" schemaId="practice-rating-json-ld-schema" />}
//       {testimonials.length > 0 && <ReviewsJsonLd testimonials={testimonials} itemName={exam.title} />}
//       <BreadcrumbJsonLd items={breadcrumbItems} />

//       {/* Hero Section (SSR rendered) */}
//       <div className="mb-8">
//         <div className="flex flex-wrap gap-2 mb-4">
//           <span className="badge bg-[#1A73E8] text-white border-0">{exam.code}</span>
//           <span className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{exam.provider}</span>
//           {exam.category.map((cat, idx) => (
//             <span key={idx} className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{cat}</span>
//           ))}
//           <span className="badge bg-green-100 text-green-700 border-0">{exam.difficulty}</span>
//         </div>
//         <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{exam.title}</h1>
//         <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
//           <span>Updated {exam.lastUpdated}</span>
//           <span className="text-green-600 font-semibold">{exam.passRate}% Pass Rate</span>
//           <Button asChild variant="outline" className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10">
//             <Link href={`/exams/${provider}/${examCode}/practice/pricing`}>View Pricing Plans →</Link>
//           </Button>
//         </div>
//       </div>

//       {/* All remaining sections (Practice Tests, Topics, About, FAQs, Testimonials) */}
//       {/* Practice Tests Section - moved to the top as requested */}
//         <section className="mb-12">
//           <h1 className="text-4xl font-bold text-[#0C1A35] mb-8">Practice Tests</h1>
//           {practiceTests.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {practiceTests.map((test, index) => (
//                 <Card key={test.id || index} className="border-[#DDE7FF] hover:shadow-lg transition-all">
//                 <CardContent className="p-6">
//                   <div className="flex justify-between items-start mb-4">
//                       <h3 className="text-xl font-bold text-[#0C1A35]">{test.name || `Practice Test ${index + 1}`}</h3>
//                       {test.difficulty && (
//                     <Badge
//                       variant="secondary"
//                       className={`${
//                         test.difficulty === "Advanced"
//                           ? "bg-orange-100 text-orange-700"
//                           : "bg-gray-100 text-gray-700"
//                       } border-0`}
//                     >
//                       {test.difficulty}
//                     </Badge>
//                       )}
//                   </div>
//                     <p className="text-sm text-[#0C1A35]/70 mb-3">{test.questions || 0} Questions</p>
//                   <Badge className="bg-[#1A73E8] text-white border-0 mb-4">Full-Length Test</Badge>
//                   <Button
//                     className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
//                     onClick={() => handleStartTest(test)}
//                   >
//                     Start Test →
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//           ) : (
//             <Card className="border-[#DDE7FF]">
//               <CardContent className="p-8 text-center">
//                 <p className="text-[#0C1A35]/70">No practice tests available yet. Please check back later.</p>
//               </CardContent>
//             </Card>
//           )}
//         </section>

//         {/* Exam Topics & Weightage Section - moved just after Practice Tests */}
//         {topics.length > 0 && (
//         <section className="mb-12">
//           <h2 className="text-3xl font-bold text-[#0C1A35] mb-6">Exam Topics & Weightage</h2>
//           <div className="space-y-4">
//             {topics.map((topic, idx) => (
//               <Card key={idx} className="border-[#DDE7FF]">
//                 <CardContent className="p-6">
//                   <div className="flex items-center gap-4">
//                     <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
//                     <div className="flex-1">
//                       <div className="flex justify-between mb-2">
//                         <span className="font-semibold text-[#0C1A35]">{topic.name}</span>
//                         <span className="text-sm text-[#0C1A35]/60">{topic.percentage}%</span>
//                       </div>
//                       <Progress value={topic.percentage} className="h-2" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </section>
//         )}

//         {/* About This Exam Section */}
//         <Card className="border-[#DDE7FF] mb-8">
//           <CardHeader>
//             <CardTitle className="text-[#0C1A35]">About This Exam</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div 
//               className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed"
//               dangerouslySetInnerHTML={{ __html: examData.about }}
//             />
//           </CardContent>
//         </Card>

//         {/* What's Included Section */}
//         <Card className="border-[#DDE7FF] mb-8">
//           <CardHeader>
//             <CardTitle className="text-[#0C1A35]">What's Included in This Practice Pack</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {examData.whatsIncluded.map((item, idx) => (
//                 <div 
//                   key={idx}
//                   className="tiptap-editor-content text-[#0C1A35]/80"
//                   dangerouslySetInnerHTML={{ __html: item }}
//                 />
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Why This Exam Matters Section */}
//         <Card className="border-[#DDE7FF] mb-8">
//           <CardHeader>
//             <CardTitle className="text-[#0C1A35]">Why This Exam Matters</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div 
//               className="text-[#0C1A35]/80 leading-relaxed tiptap-editor-content"
//               dangerouslySetInnerHTML={{ __html: examData.whyMatters }}
//             />
//           </CardContent>
//         </Card>

//         {/* Exam Format Summary Section */}
//         <Card className="border-[#DDE7FF] mb-12">
//           <CardHeader>
//             <CardTitle className="text-[#0C1A35]">Exam Format Summary</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                 <BookOpen className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                 <p className="text-2xl font-bold text-[#0C1A35]">{examData.totalQuestions}</p>
//                 <p className="text-sm text-[#0C1A35]/60">Questions</p>
//               </div>
//               <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                 <Clock className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                 <p className="text-2xl font-bold text-[#0C1A35]">{examData.duration}</p>
//                 <p className="text-sm text-[#0C1A35]/60">Duration</p>
//               </div>
//               <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                 <Target className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                 <p className="text-2xl font-bold text-[#0C1A35]">{examData.passingScore}</p>
//                 <p className="text-sm text-[#0C1A35]/60">Passing Score</p>
//               </div>
//               <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
//                 <Award className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
//                 <p className="text-2xl font-bold text-[#0C1A35]">{examData.difficulty}</p>
//                 <p className="text-sm text-[#0C1A35]/60">Difficulty</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Success Stories Section */}
//         {testimonials.length > 0 && (
//         <section className="mb-12">
//           <h2 className="text-3xl font-bold text-[#0C1A35] mb-2">Success Stories</h2>
//           <p className="text-[#0C1A35]/70 mb-6">
//             Real results from learners who used our practice tests
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {testimonials.map((testimonial, idx) => (
//               <Card key={idx} className="border-[#DDE7FF]">
//                 <CardContent className="p-6">
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="w-12 h-12 rounded-full bg-[#1A73E8] flex items-center justify-center text-white font-bold text-lg">
//                       {testimonial.initials}
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-[#0C1A35]">{testimonial.name}</h4>
//                       <p className="text-sm text-[#0C1A35]/60">{testimonial.role}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2 mb-3">
//                     {[...Array(testimonial.rating)].map((_, i) => (
//                       <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                     ))}
//                     {testimonial.verified && (
//                       <Badge className="bg-green-100 text-green-700 border-0 text-xs">
//                         Verified
//                       </Badge>
//                     )}
//                   </div>
//                   <p className="text-sm text-[#0C1A35]/80 leading-relaxed">
//                     "{testimonial.review}"
//                   </p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </section>
//         )}

//         {/* FAQ Section */}
//         {faqs.length > 0 && (
//         <section className="mb-12">
//           <h2 className="text-3xl font-bold text-[#0C1A35] mb-2">
//             Frequently Asked Questions
//           </h2>
//           <p className="text-[#0C1A35]/70 mb-6">
//             Everything you need to know about this exam preparation pack
//           </p>
//           <Accordion type="single" collapsible className="w-full">
//             {faqs.map((faq, idx) => (
//               <AccordionItem key={idx} value={`item-${idx}`} className="border-[#DDE7FF]">
//                 <AccordionTrigger className="text-[#0C1A35] hover:no-underline">
//                   {faq.question}
//                 </AccordionTrigger>
//                 <AccordionContent className="text-[#0C1A35]/80">
//                   <div 
//                     className="tiptap-editor-content"
//                     dangerouslySetInnerHTML={{ __html: faq.answer }}
//                   />
//                 </AccordionContent>
//               </AccordionItem>
//             ))}
//           </Accordion>
//         </section>
//         )}

//         {/* Login Modal */}
//         <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Login Required</DialogTitle>
//               <DialogDescription>
//                 You need to login to start taking tests.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="flex gap-3 mt-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowLoginModal(false)}
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => {
//                   router.push(`/auth/login?redirect=${encodeURIComponent(pendingTestUrl || `/exams/${provider}/${examCode}/practice`)}`);
//                 }}
//                 className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white"
//               >
//                 Login / Sign Up
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </main>
//     </div>
//   );
// }






import { notFound } from "next/navigation";
import Link from "next/link";

import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import RatingJsonLd from "@/components/RatingJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

import PracticePageClient from "./PracticePageClient";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }) {
  const { provider, examCode } = await params;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const normalizedProvider = provider.toLowerCase().replace(/_/g, "-");
  const normalizedExamCode = examCode.toLowerCase().replace(/_/g, "-");
  const slug = `${normalizedProvider}-${normalizedExamCode}`;

  try {
    const res = await fetch(
      `${API_BASE}/api/courses/exams/${slug}/`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        title: "Practice Tests | AllExamQuestions",
      };
    }

    const exam = await res.json();

    return {
      // title:
      //   exam.meta_title
      //     ? `${exam.meta_title} - Practice Tests`
      //     : `${exam.title} Practice Tests`,
      title: exam.meta_title
      ? exam.meta_title + " | All Exam Questions"
      : exam.title || `${examCode} Certification Exam`,

      description:
        exam.meta_description ||
        `Practice tests for ${exam.title}.`,

      keywords:
        exam.meta_keywords || "",

      alternates: {
        canonical: `https://allexamquestions.com/exams/${provider}/${examCode}`,
      },
    };
  } catch (error) {
    return {
      title: "Practice Tests | AllExamQuestions",
    };
  }
}

export default async function PracticePage(props) {
  const { provider, examCode } = await props.params;

  if (!provider || !examCode) return notFound();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const normalizedProvider = provider.toLowerCase().replace(/_/g, "-");
  const normalizedExamCode = examCode.toLowerCase().replace(/_/g, "-");
  const slug = `${normalizedProvider}-${normalizedExamCode}`;

  let examData = null;

  try {
    const res = await fetch(`${API_BASE}/api/courses/exams/${slug}/`, { cache: "no-store" });
    if (!res.ok) throw new Error("Exam not found");
    examData = await res.json();
  } catch (err) {
    console.error(err);
    return notFound();
  }

  // Ensure arrays are always arrays
  const practiceTests = Array.isArray(examData.practice_tests_list)
    ? examData.practice_tests_list
    : Array.isArray(examData.practice_tests)
    ? examData.practice_tests
    : [];

  const topics = Array.isArray(examData.topics)
    ? examData.topics.map((t) => {
        const raw =
          t.percentage ??
          t.weightage ??
          t.percent ??
          t.topic_weightage ??
          t.weightage_percentage ??
          t.weight ??
          0;
        const cleanValue = typeof raw === "string" ? parseFloat(raw.replace("%", "").trim()) : raw;
        return { name: t.name || "Topic", percentage: isNaN(cleanValue) ? 0 : cleanValue };
      })
    : [];

  const faqs = Array.isArray(examData.faqs) ? examData.faqs : [];
  const testimonials = Array.isArray(examData.testimonials) ? examData.testimonials : [];

  const exam = {
    title: examData.title || `${examData.provider} ${examData.code}`,
    code: examData.code || examCode.toUpperCase(),
    provider: examData.provider || provider.toUpperCase(),
    category: Array.isArray(examData.category) ? examData.category : examData.category ? [examData.category] : [],
    difficulty: examData.difficulty || "Intermediate",
    lastUpdated: examData.badge || "Recently updated",
    passRate: examData.pass_rate || 90,
    rating: examData.rating || 4.5,
    practiceTests: practiceTests.length,
    totalQuestions: practiceTests.reduce((sum, t) => sum + (parseInt(t.questions) || 0), 0),
    duration: examData.duration || "130 minutes",
    passingScore: examData.passing_score || "720/1000",
    about: examData.about || "Prepare for your certification exam with our comprehensive practice tests.",
    whatsIncluded:
      examData.whats_included ||
      [
        `${practiceTests.length} full-length practice tests`,
        "Real exam-style difficulty and format",
        "Detailed explanations for every question",
        "Timed mode and Review mode available",
        "Unlimited attempts on all practice tests",
        "Performance tracking and analytics",
        "Mobile-friendly interface",
      ],
    whyMatters:
      examData.why_matters ||
      "This certification validates your expertise and can significantly boost your career prospects.",
  };

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
    { name: exam.provider, url: `/exams/${provider}` },
    { name: exam.code, url: `/exams/${provider}/${examCode}` },
    { name: "Practice Tests", url: `/exams/${provider}/${examCode}/practice` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD SEO */}
      <PracticeTestJsonLd exam={exam} practiceTests={practiceTests} />
      {exam.rating && (
        <RatingJsonLd
          rating={exam.rating}
          reviewCount={testimonials.length}
          itemName={exam.title}
          itemType="Course"
          schemaId="practice-rating-json-ld-schema"
        />
      )}
      {testimonials.length > 0 && <ReviewsJsonLd testimonials={testimonials} itemName={exam.title} />}
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge bg-[#1A73E8] text-white border-0">{exam.code}</span>
          <span className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{exam.provider}</span>
          {exam.category.map((cat, idx) => (
            <span key={idx} className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{cat}</span>
          ))}
          <span className="badge bg-green-100 text-green-700 border-0">{exam.difficulty}</span>
        </div>
        <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{exam.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
          <span>Updated {exam.lastUpdated}</span>
          <span className="text-green-600 font-semibold">{exam.passRate}% Pass Rate</span>
          <Link href={`/exams/${provider}/${examCode}/practice/pricing`}>
            <button className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10 border px-4 py-2 rounded">
              View Pricing Plans →
            </button>
          </Link>
        </div>
      </div>


      {/* Client Component for interactions */}
      <PracticePageClient
         exam={exam}                   // use `exam` object, not examData
         practiceTests={practiceTests} // use the array we defined above
         topics={topics}               // safe array
         faqs={faqs}                   // safe array
         testimonials={testimonials}   // safe array
         provider={provider}
         examCode={examCode}
         breadcrumbItems={breadcrumbItems}
      />
    </div>
  );
}






// import { notFound } from "next/navigation";
// import Link from "next/link";

// // JSON-LD SEO
// import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
// import ReviewsJsonLd from "@/components/ReviewsJsonLd";
// import RatingJsonLd from "@/components/RatingJsonLd";
// import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
// import { Button } from "@/components/ui/button";
// import { Star } from "lucide-react";

// // Client Component
// import PracticePageClient from "./PracticePageClient";

// export const dynamic = "force-dynamic";

// export default async function PracticePage({ params }) {
//   const { provider, examCode } = await params;

//   if (!provider || !examCode) return notFound();

//   const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

//   const normalizedProvider = provider.toLowerCase().replace(/_/g, "-");
//   const normalizedExamCode = examCode.toLowerCase().replace(/_/g, "-");
//   const slug = `${normalizedProvider}-${normalizedExamCode}`;

//   let examData = null;

//   try {
//     const res = await fetch(`${API_BASE}/api/courses/exams/${slug}/`, { cache: "no-store" });
//     if (!res.ok) throw new Error("Exam not found");
//     examData = await res.json();
//   } catch (err) {
//     console.error(err);
//     return notFound();
//   }

//   const practiceTests = Array.isArray(examData.practice_tests_list)
//     ? examData.practice_tests_list
//     : Array.isArray(examData.practice_tests)
//     ? examData.practice_tests
//     : [];

//   const topics = Array.isArray(examData.topics)
//     ? examData.topics.map((t) => {
//         const raw =
//           t.percentage ?? t.weightage ?? t.percent ?? t.topic_weightage ?? t.weightage_percentage ?? t.weight ?? 0;
//         const cleanValue = typeof raw === "string" ? parseFloat(raw.replace("%", "").trim()) : raw;
//         return { name: t.name || "Topic", percentage: isNaN(cleanValue) ? 0 : cleanValue };
//       })
//     : [];

//   const faqs = Array.isArray(examData.faqs) ? examData.faqs : [];
//   const testimonials = Array.isArray(examData.testimonials) ? examData.testimonials : [];

//   const exam = {
//     title: examData.title || `${examData.provider} ${examData.code}`,
//     code: examData.code || examCode.toUpperCase(),
//     provider: examData.provider || provider.toUpperCase(),
//     category: Array.isArray(examData.category) ? examData.category : examData.category ? [examData.category] : [],
//     difficulty: examData.difficulty || "Intermediate",
//     lastUpdated: examData.badge || "Recently updated",
//     passRate: examData.pass_rate || 90,
//     rating: examData.rating || 4.5,
//     practiceTests: practiceTests.length,
//     totalQuestions: practiceTests.reduce((sum, t) => sum + (parseInt(t.questions) || 0), 0),
//     duration: examData.duration || "130 minutes",
//     passingScore: examData.passing_score || "720/1000",
//     about: examData.about || "Prepare for your certification exam with our comprehensive practice tests.",
//     whatsIncluded:
//       examData.whats_included ||
//       [
//         `${practiceTests.length} full-length practice tests`,
//         "Real exam-style difficulty and format",
//         "Detailed explanations for every question",
//         "Timed mode and Review mode available",
//         "Unlimited attempts on all practice tests",
//         "Performance tracking and analytics",
//         "Mobile-friendly interface",
//       ],
//     whyMatters:
//       examData.why_matters ||
//       "This certification validates your expertise and can significantly boost your career prospects.",
//   };

//   const breadcrumbItems = [
//     { name: "Home", url: "/" },
//     { name: "Exams", url: "/exams" },
//     { name: exam.provider, url: `/exams/${provider}` },
//     { name: exam.code, url: `/exams/${provider}/${examCode}` },
//     { name: "Practice Tests", url: `/exams/${provider}/${examCode}/practice` },
//   ];

//   return (
//     <div className="min-h-screen bg-white">
//       {/* JSON-LD SEO */}
//       <PracticeTestJsonLd exam={exam} practiceTests={practiceTests} />
//       {exam.rating && (
//         <RatingJsonLd
//           rating={exam.rating}
//           reviewCount={testimonials.length}
//           itemName={exam.title}
//           itemType="Course"
//           schemaId="practice-rating-json-ld-schema"
//         />
//       )}
//       {testimonials.length > 0 && <ReviewsJsonLd testimonials={testimonials} itemName={exam.title} />}
//       <BreadcrumbJsonLd items={breadcrumbItems} />

//       {/* Hero Section */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <div className="flex flex-wrap gap-2 mb-4">
//           <span className="badge bg-[#1A73E8] text-white border-0">{exam.code}</span>
//           <span className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{exam.provider}</span>
//           {exam.category.map((cat, idx) => (
//             <span key={idx} className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{cat}</span>
//           ))}
//           <span className="badge bg-green-100 text-green-700 border-0">{exam.difficulty}</span>
//         </div>
//         <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{exam.title}</h1>
//         <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
//           <span>Updated {exam.lastUpdated}</span>
//           <span className="text-green-600 font-semibold">{exam.passRate}% Pass Rate</span>
//           <Link href={`/exams/${provider}/${examCode}/practice/pricing`}>
//             <button className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10 border px-4 py-2 rounded">
//               View Pricing Plans →
//             </button>
//           </Link>
//         </div>
//       </div>

//       {/* Practice Tests */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Practice Tests Included</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {practiceTests.map((test, idx) => (
//             <div key={idx} className="card border-[#DDE7FF] p-4">
//               <h3 className="font-semibold text-[#0C1A35] mb-2">{test.title || `Practice Test ${idx + 1}`}</h3>
//               <p className="text-sm text-[#0C1A35]/70 mb-2">{test.questions || 0} Questions</p>
//               <Button className="w-full bg-[#1A73E8] text-white">Start Test</Button>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Topics */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Exam Topics & Weightage</h2>
//         <div className="space-y-4">
//           {topics.map((topic, idx) => (
//             <div key={idx} className="card border-[#DDE7FF] p-4">
//               <div className="flex justify-between mb-2">
//                 <span className="font-semibold text-[#0C1A35]">{topic.name}</span>
//                 <span className="text-sm text-[#0C1A35]/60">{topic.percentage}%</span>

//                 <div className="h-2 w-full bg-[#DDE7FF] rounded">
//                   <div className="h-2 bg-green-500 rounded" style={{ width: `${topic.percentage}%` }}></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>


//       {/* About This Exam */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">About This Exam</h2>
//         <div className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: exam.about }} />
//       </section>

//       {/* FAQs */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Frequently Asked Questions</h2>
//         <div className="space-y-4">
//           {faqs.map((faq, idx) => (
//             <div key={idx} className="card border-[#DDE7FF] p-4">
//               <h3 className="font-semibold text-[#0C1A35] mb-2">{faq.question}</h3>
//               <div className="text-[#0C1A35]/80 mt-2" dangerouslySetInnerHTML={{ __html: faq.answer }} />
//             </div>
//           ))}
//         </div>
//       </section>

      

//       {/* Why This Exam Matters */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Why This Exam Matters</h2>
//         <div className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: exam.whyMatters }} />
//       </section>

      
//       {/* What's Included in This Practice Pack */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">What's Included in This Practice Pack</h2>
//         <div className="space-y-3">
//           {(exam.whatsIncluded || []).map((item, idx) => (
//             <div key={idx} className="tiptap-editor-content text-[#0C1A35]/80" dangerouslySetInnerHTML={{ __html: item }} />
//           ))}
//         </div>
//       </section>

//       {/* Exam Format Summary */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Exam Format Summary</h2>
//         <div className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: exam.format || "" }} />
//       </section>


//       {/* Testimonials */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Success Stories</h2>
//         <div className="space-y-4">
//           {testimonials.map((testimonial, idx) => (
//             <div key={idx} className="card border-[#DDE7FF] p-4">
//               <h3 className="font-semibold text-[#0C1A35] mb-2">{testimonial.name}</h3>
//               <p className="text-sm text-[#0C1A35]/60 mb-2">{testimonial.role}</p>
//               <div className="flex gap-1 mb-2">
//                 {Array.from({ length: testimonial.rating }).map((_, i) => (
//                   <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                 ))}
//               </div>
//               <p className="text-[#0C1A35]/80">{testimonial.review}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* FAQs */}
//       <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
//         <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Frequently Asked Questions</h2>
//         <div className="space-y-4">
//           {faqs.map((faq, idx) => (
//             <div key={idx} className="card border-[#DDE7FF] p-4">
//               <h3 className="font-semibold text-[#0C1A35] mb-2">{faq.question}</h3>
//               <div className="text-[#0C1A35]/80 mt-2" dangerouslySetInnerHTML={{ __html: faq.answer }} />
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Client Component only for interactive features (Start Test, Login Modal) */}
//       <PracticePageClient
//         exam={exam}
//         practiceTests={practiceTests}
//         topics={topics}
//         faqs={faqs}
//         testimonials={testimonials}
//         provider={provider}
//         examCode={examCode}
//         breadcrumbItems={breadcrumbItems}
//       />
//     </div>
//   );
// }