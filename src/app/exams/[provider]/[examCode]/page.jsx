"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Clock, Users, TrendingUp, CheckCircle2, BookOpen, Target, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const provider = params?.provider;
  const examCode = params?.examCode;


  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTestUrl, setPendingTestUrl] = useState(null);

  // Check if user is logged in
  const checkLogin = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  };

  // Handle Start Test button click
  const handleStartTest = (test, index = 0) => {
    // Use slug if available, otherwise fallback to id or index
    let testIdentifier = (test && test.slug) ? test.slug : (test && test.id) ? test.id : (test || (index + 1));
    // Remove ObjectId hash from slug (e.g., "test-name-694e3de3" -> "test-name")
    if (testIdentifier && typeof testIdentifier === 'string') {
      // Match pattern: ends with hyphen followed by 8 hex characters (ObjectId hash)
      testIdentifier = testIdentifier.replace(/-[a-f0-9]{8}$/i, '');
    }
    const testUrl = `/exams/${provider}/${examCode}/practice/${testIdentifier}`;
    
    if (!checkLogin()) {
      setPendingTestUrl(testUrl);
      setShowLoginModal(true);
    } else {
      router.push(testUrl);
    }
  };

  // Listen for login events to redirect after login
  useEffect(() => {
    const handleLoginSuccess = () => {
      if (pendingTestUrl) {
        setShowLoginModal(false);
        router.push(pendingTestUrl);
        setPendingTestUrl(null);
      }
    };

    window.addEventListener('userLoggedIn', handleLoginSuccess);
    return () => window.removeEventListener('userLoggedIn', handleLoginSuccess);
  }, [pendingTestUrl, router]);

  useEffect(() => {
    if (!provider || !examCode) return;

    const fetchExam = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        // Construct slug from provider and examCode (e.g., "aws" + "saa-c03" = "aws-saa-c03")
        const slug = `${provider}-${examCode}`.toLowerCase();
        const res = await fetch(`${API_BASE}/api/courses/exams/${slug}/`);
        
        if (!res.ok) {
          throw new Error("Exam not found");
        }
        
        const data = await res.json();
        // Debug: Log the received data to check pass_rate and rating
        console.log("Full exam data from API:", data);
        console.log("pass_rate value:", data.pass_rate, "type:", typeof data.pass_rate);
        console.log("rating value:", data.rating, "type:", typeof data.rating);
        setExam(data);
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
        console.error("Error fetching exam:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchExam();
  }, [provider, examCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-[#0C1A35]">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">Exam Not Found</h1>
          <p className="text-[#0C1A35]/70 mb-6">
            The exam you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="bg-[#1A73E8] text-white hover:bg-[#1557B0]">
            <Link href="/exams">Return to Exams</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total questions from practice tests list
  const practiceTestsList = exam.practice_tests_list || [];
  const calculatedTotalQuestions = practiceTestsList.reduce((sum, test) => {
    const testQuestions = parseInt(test.questions) || 0;
    return sum + testQuestions;
  }, 0);
  
  // Calculate total duration from all practice tests - sum all durations
  let calculatedDuration = null;
  if (practiceTestsList.length > 0) {
    // Extract numeric values from all practice test durations and sum them
    const durations = practiceTestsList
      .map(test => {
        if (!test.duration || test.duration.trim() === "") return null;
        // Extract number from duration string (e.g., "120", "60 min", "120 minutes" -> 120)
        const durationStr = test.duration.toString().trim();
        const match = durationStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(d => d !== null);
    
    if (durations.length > 0) {
      const totalMinutes = durations.reduce((sum, d) => sum + d, 0);
      calculatedDuration = `${totalMinutes}${totalMinutes === 1 ? ' minute' : ' minutes'}`;
    }
  }

  // Map backend data to display format
  // Convert pass_rate and rating to numbers if they exist
  let passRateValue = null;
  if (exam.pass_rate !== null && exam.pass_rate !== undefined && exam.pass_rate !== "") {
    const parsed = Number(exam.pass_rate);
    if (!isNaN(parsed)) {
      passRateValue = parsed;
    }
  }
  
  let ratingValue = null;
  if (exam.rating !== null && exam.rating !== undefined && exam.rating !== "") {
    const parsed = Number(exam.rating);
    if (!isNaN(parsed)) {
      ratingValue = parsed;
    }
  }
  
  const examData = {
    title: exam.title || `${exam.provider} ${exam.code}`,
    code: exam.code || examCode.toUpperCase(),
    provider: exam.provider || provider.toUpperCase(),
    category: exam.category ? [exam.category] : [],
    difficulty: exam.difficulty || "Intermediate",
    lastUpdated: exam.badge || "Recently updated",
    passRate: passRateValue,
    rating: ratingValue,
    // reviews: 2847, // Could be added to backend model later
    // learners: 145000, // Could be added to backend model later
    practiceTests: exam.practice_exams || 0,
    totalQuestions: calculatedTotalQuestions || exam.questions || 0,
    duration: calculatedDuration || exam.duration || null,
    passingScore: exam.passing_score || "720/1000",
    about: exam.about || "Prepare for your certification exam with our comprehensive practice tests.",
    whatsIncluded: exam.whats_included && exam.whats_included.length > 0 
      ? exam.whats_included 
      : [
        `${exam.practice_exams || 0} full-length practice tests`,
      "Real exam-style difficulty and format",
      "Detailed explanations for every question",
      "Timed mode and Review mode available",
      "Unlimited attempts on all practice tests",
      "Performance tracking and analytics",
      "Mobile-friendly interface"
    ],
    whyMatters: exam.why_matters || "This certification validates your expertise and can significantly boost your career prospects.",
    topics: exam.topics && exam.topics.length > 0 
      ? exam.topics.map(t => ({ 
          name: t.name || t.topic || "", 
          percentage: t.weight || t.percentage || 0 
        }))
      : [],
    practiceTestsList: exam.practice_tests_list || [],
    testimonials: exam.testimonials || [],
    faqs: exam.faqs || []
  };

  return (
    <div className="min-h-screen bg-white">
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
                <Link href={`/exams/${provider}`} className="text-[#0C1A35] hover:text-[#1A73E8]">
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
              <Badge key={idx} className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
                {cat}
              </Badge>
            ))}
            <Badge className="bg-green-100 text-green-700 border-0">{examData.difficulty}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{examData.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-[#1A73E8]" />
              <span>Updated {examData.lastUpdated}</span>
            </div>
            {examData.passRate !== null && examData.passRate !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-semibold">{examData.passRate}% Pass Rate</span>
              </div>
            )}
          </div>
        </div>
        {examData.testimonials && examData.testimonials.length > 0 && (
          <ReviewsJsonLd testimonials={examData.testimonials} itemName={examData.title} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Card */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">Duration</p>
                    <p className="font-semibold text-[#0C1A35]">{examData.duration}</p>
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
                {examData.passRate !== null && examData.passRate !== undefined && (
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-2">Pass Rate</p>
                    <div className="flex items-center gap-2">
                      <Progress value={examData.passRate} className="flex-1" />
                      <span className="text-sm font-semibold text-[#0C1A35]">{examData.passRate}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">About This Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#0C1A35]/80 leading-relaxed whitespace-pre-line">{examData.about}</p>
              </CardContent>
            </Card>

            {/* Topics Covered */}
            {examData.topics && examData.topics.length > 0 && (
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">Topics Covered</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {examData.topics.map((topic, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-[#0C1A35]">{topic.name}</span>
                      <span className="text-sm text-[#0C1A35]/60">{topic.percentage}%</span>
                    </div>
                    <Progress value={topic.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            )}

            {/* What's Included */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">What's Included in This Practice Pack</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {examData.whatsIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#0C1A35]/80">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Why This Exam Matters */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">Why This Exam Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#0C1A35]/80 leading-relaxed whitespace-pre-line">{examData.whyMatters}</p>
              </CardContent>
            </Card>

            {/* Exam Format Summary */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">Exam Format Summary</CardTitle>
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
            </Card>

            {/* Practice Tests List */}
            {examData.practiceTestsList && examData.practiceTestsList.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <CardTitle className="text-[#0C1A35]">Available Practice Tests</CardTitle>
                  <CardDescription>Choose a practice test to start your preparation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {examData.practiceTestsList
                    .filter((test, index, self) => 
                      // Deduplicate by ID or name to prevent showing same test multiple times
                      index === self.findIndex(t => 
                        (t.id && test.id && t.id === test.id) || 
                        (!t.id && !test.id && t.name === test.name)
                      )
                    )
                    .map((test, idx) => (
                    <div key={test.id || test.name || idx} className="p-4 border border-[#DDE7FF] rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#0C1A35]">{test.name || `Practice Test ${idx + 1}`}</h4>
                        <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
                          {test.difficulty || "Intermediate"}
                        </Badge>
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
                      <Button 
                        className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                        onClick={() => handleStartTest(test, idx)}
                      >
                        {test.progress ? "Continue Test" : "Start Test"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Testimonials */}
            {examData.testimonials && examData.testimonials.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  <CardTitle className="text-[#0C1A35]">Student Success Stories</CardTitle>
                  <CardDescription>Hear from those who passed with our practice tests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {examData.testimonials.map((testimonial, idx) => (
                    <div key={idx} className="p-4 border border-[#DDE7FF] rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
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
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
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
                  <CardTitle className="text-[#0C1A35]">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {examData.faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-left text-[#0C1A35]">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#0C1A35]/80">
                          {faq.answer}
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
                {examData.rating !== null && examData.rating !== undefined && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-[#0C1A35]">{examData.rating}</span>
                    {examData.reviews && examData.reviews > 0 && (
                      <span className="text-sm text-[#0C1A35]/60">({examData.reviews.toLocaleString()} reviews)</span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0C1A35]/70">Practice Tests</span>
                    <span className="font-semibold text-[#0C1A35]">{examData.practiceTests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0C1A35]/70">Total Questions</span>
                    <span className="font-bold text-[#0C1A35]">{examData.totalQuestions}</span>
                  </div>
                  {examData.passRate !== null && examData.passRate !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0C1A35]/70">Pass Rate</span>
                      <span className="font-semibold text-green-600">{examData.passRate}%</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0C1A35]/70">Duration</span>
                    <span className="font-semibold text-[#0C1A35]">{examData.duration}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#DDE7FF]">
                  <Button
                    className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg"
                    asChild
                  >
                    <Link href={`/exams/${provider}/${examCode}/practice`}>
                      Start Practicing →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to login to start taking tests.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLoginModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                router.push(`/auth/login?redirect=${encodeURIComponent(pendingTestUrl || `/exams/${provider}/${examCode}/practice`)}`);
              }}
              className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white"
            >
              Login / Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

