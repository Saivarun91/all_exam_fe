"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Target, Award, CheckCircle2, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function PracticePage() {
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
  const handleStartTest = (test) => {
    // Use slug if available, otherwise fallback to id or index
    const testIdentifier = test.slug || test.id || test;
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
        // Construct slug from provider and examCode (e.g., "aws-saa-c03")
        const slug = `${provider}-${examCode}`.toLowerCase();
        const res = await fetch(`${API_BASE}/api/courses/exams/${slug}/`);
        
        if (!res.ok) {
          throw new Error("Exam not found");
        }
        
        const data = await res.json();
        setExam(data);
        setLoading(false);
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
          <p className="text-[#0C1A35]">Loading practice tests...</p>
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
  console.log("exam :",exam)

  // Get dynamic data from backend or use defaults
  const practiceTests = exam.practice_tests_list || [];
console.log("practice exams :",practiceTests)
  const topics = exam.topics && exam.topics.length > 0 
    ? exam.topics.map(t => ({
        name: t.name || t.topic || "",
        percentage: t.weight || t.percentage || 0
      }))
    : [];

  const testimonials = exam.testimonials && exam.testimonials.length > 0
    ? exam.testimonials.map(t => ({
        name: t.name,
        role: t.role,
        initials: t.name ? t.name.split(' ').map(n => n[0]).join('').toUpperCase() : "??",
        rating: t.rating || 5,
        review: t.review,
        verified: t.verified || false
      }))
    : [];

  const faqs = exam.faqs || [];

  // Exam data structure for display - using dynamic data from backend
  const examData = {
    title: exam.title || `${exam.provider} ${exam.code}`,
    code: exam.code || examCode.toUpperCase(),
    provider: exam.provider || provider.toUpperCase(),
    category: exam.category ? [exam.category] : [],
    difficulty: exam.difficulty || "Intermediate",
    lastUpdated: exam.badge || "Recently updated",
    passRate: exam.pass_rate || 90,
    rating: exam.rating || 4.5,
    reviews: 2847, // Could be added to backend model later
    learners: 145000, // Could be added to backend model later
    practiceTests: exam.practice_exams || 0,
    totalQuestions: exam.questions || 0,
    duration: exam.duration || "130 minutes",
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
    whyMatters: exam.why_matters || "This certification validates your expertise and can significantly boost your career prospects."
  };

  return (
    <div className="min-h-screen bg-white">
      {exam && <PracticeTestJsonLd exam={exam} practiceTests={practiceTests} />}
      {testimonials.length > 0 && <ReviewsJsonLd testimonials={testimonials} itemName={exam.title} />}
      <main className="container mx-auto px-4 py-8">
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
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/exams/${provider}/${examCode}`} className="text-[#0C1A35] hover:text-[#1A73E8]">
                  {examData.code}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-[#0C1A35]">Practice Tests</BreadcrumbPage>
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
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold">{examData.passRate}% Pass Rate</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-[#1A73E8]" />
              <span>{examData.learners.toLocaleString()}+ learners</span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              asChild
              variant="outline"
              className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10"
            >
              <Link href={`/exams/${provider}/${examCode}/practice/pricing`}>
                View Pricing Plans →
              </Link>
            </Button>
          </div>
        </div>

        {/* About This Exam Section */}
        <Card className="border-[#DDE7FF] mb-8">
          <CardHeader>
            <CardTitle className="text-[#0C1A35]">About This Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0C1A35]/80 leading-relaxed">{examData.about}</p>
          </CardContent>
        </Card>

        {/* What's Included Section */}
        <Card className="border-[#DDE7FF] mb-8">
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

        {/* Why This Exam Matters Section */}
        <Card className="border-[#DDE7FF] mb-8">
          <CardHeader>
            <CardTitle className="text-[#0C1A35]">Why This Exam Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0C1A35]/80 leading-relaxed">{examData.whyMatters}</p>
          </CardContent>
        </Card>

        {/* Exam Format Summary Section */}
        <Card className="border-[#DDE7FF] mb-12">
          <CardHeader>
            <CardTitle className="text-[#0C1A35]">Exam Format Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-[#DDE7FF] rounded-lg">
                <BookOpen className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#0C1A35]">{examData.totalQuestions}+</p>
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

        {/* Practice Tests Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-8">Practice Tests</h1>
          {practiceTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceTests.map((test, index) => (
                <Card key={test.id || index} className="border-[#DDE7FF] hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-[#0C1A35]">{test.name || `Practice Test ${index + 1}`}</h3>
                      {test.difficulty && (
                    <Badge
                      variant="secondary"
                      className={`${
                        test.difficulty === "Advanced"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      } border-0`}
                    >
                      {test.difficulty}
                    </Badge>
                      )}
                  </div>
                    <p className="text-sm text-[#0C1A35]/70 mb-3">{test.questions || 0} Questions</p>
                  <Badge className="bg-[#1A73E8] text-white border-0 mb-4">Full-Length Test</Badge>
                  <Button
                    className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                    onClick={() => handleStartTest(test)}
                  >
                    Start Test →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <Card className="border-[#DDE7FF]">
              <CardContent className="p-8 text-center">
                <p className="text-[#0C1A35]/70">No practice tests available yet. Please check back later.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Exam Topics & Weightage Section */}
        {topics.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#0C1A35] mb-6">Exam Topics & Weightage</h2>
          <div className="space-y-4">
            {topics.map((topic, idx) => (
              <Card key={idx} className="border-[#DDE7FF]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-[#0C1A35]">{topic.name}</span>
                        <span className="text-sm text-[#0C1A35]/60">{topic.percentage}%</span>
                      </div>
                      <Progress value={topic.percentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        )}

        {/* Success Stories Section */}
        {testimonials.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#0C1A35] mb-2">Success Stories</h2>
          <p className="text-[#0C1A35]/70 mb-6">
            Real results from learners who used our practice tests
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-[#DDE7FF]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A73E8] flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.initials}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#0C1A35]">{testimonial.name}</h4>
                      <p className="text-sm text-[#0C1A35]/60">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {testimonial.verified && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#0C1A35]/80 leading-relaxed">
                    "{testimonial.review}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#0C1A35] mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-[#0C1A35]/70 mb-6">
            Everything you need to know about this exam preparation pack
          </p>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-[#DDE7FF]">
                <AccordionTrigger className="text-[#0C1A35] hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#0C1A35]/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        )}

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
      </main>
    </div>
  );
}

