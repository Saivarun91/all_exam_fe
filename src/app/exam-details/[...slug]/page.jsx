"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Clock, Users, TrendingUp, CheckCircle2, BookOpen, Target, Award, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FAQJsonLd from "@/components/FAQJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // Handle catch-all route: slug can be a string or array
  const slugParam = params?.slug;
  // Join with hyphen for proper slug format (e.g., "azure-az-104")
  // Normalize to SEO-friendly format: convert underscores to hyphens
  const rawSlug = Array.isArray(slugParam) ? slugParam.join('-') : slugParam;
  const slug = rawSlug ? rawSlug.replace(/_/g, '-').toLowerCase() : null;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTestUrl, setPendingTestUrl] = useState(null);

  // Extract provider and examCode from slug (e.g., "aws-saa-c03" -> provider: "aws", examCode: "saa-c03")
  const getProviderAndCode = () => {
    if (!slug) return { provider: null, examCode: null };
    const parts = slug.split('-');
    // Find provider (first part) and examCode (rest)
    // This is a simple approach - adjust based on your slug format
    const provider = parts[0];
    const examCode = parts.slice(1).join('-');
    return { provider, examCode };
  };

  // Check if user is logged in
  const checkLogin = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  };

  // Handle Start Test button click
  const handleStartTest = (test, index = 0, practiceUrl) => {
    const { provider, examCode } = getProviderAndCode();
    // Use slug if available, otherwise fallback to id or index
    let testIdentifier = (test && test.slug) ? test.slug : (test && test.id) ? test.id : (test || index + 1);
    // Remove ObjectId hash from slug (e.g., "test-name-694e3de3" -> "test-name")
    if (testIdentifier && typeof testIdentifier === 'string') {
      // Match pattern: ends with hyphen followed by 8 hex characters (ObjectId hash)
      testIdentifier = testIdentifier.replace(/-[a-f0-9]{8}$/i, '');
    }
    const testUrl = practiceUrl ? `${practiceUrl}/${testIdentifier}` : `/exams/${provider}/${examCode}/practice/${testIdentifier}`;
    
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

  // Fetch exam data dynamically from backend
  useEffect(() => {
    if (!slug) return;

    const fetchExam = async () => {
      try {
        // Use slug directly (backend handles URL decoding)
        const res = await fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`);
        if (!res.ok) {
          throw new Error("Exam not found");
        }
        const data = await res.json();
        setExam(data);
        
        // Redirect to new URL format: /exams/[provider]/[examCode]
        if (data && data.provider && data.code) {
          const providerSlug = data.provider.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const codeSlug = data.code.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          if (providerSlug && codeSlug) {
            const newUrl = `/exams/${providerSlug}/${codeSlug}`;
            // Only redirect if we're not already on the new URL format
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/exam-details/')) {
              router.replace(newUrl);
              return;
            }
          }
        }
        
        setLoading(false);

        // Set SEO meta tags dynamically
        const metaTitle = data.meta_title || `${data.title} (${data.code}) - Practice Exam | AllExamQuestions`;
        document.title = metaTitle;

        const practiceTestsCount = (data.practice_tests_list && Array.isArray(data.practice_tests_list)) ? data.practice_tests_list.length : (data.practice_exams || 0);
        const metaDescription = data.meta_description || `Practice for ${data.title} (${data.code}) with ${practiceTestsCount} practice exams and ${data.questions || 0}+ questions. Pass rate: ${data.pass_rate || 'N/A'}%`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement("meta");
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute("content", metaDescription);

        const metaKeywords = data.meta_keywords || `${data.provider}, ${data.code}, ${data.title}, practice exam, certification`;
        let metaKeys = document.querySelector('meta[name="keywords"]');
        if (!metaKeys) {
          metaKeys = document.createElement("meta");
          metaKeys.name = "keywords";
          document.head.appendChild(metaKeys);
        }
        metaKeys.setAttribute("content", metaKeywords);

        // Set canonical URL
        const currentPath = window.location.pathname;
        const canonicalUrl = `https://allexamquestions.com${currentPath}`;
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement("link");
          canonicalLink.setAttribute("rel", "canonical");
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute("href", canonicalUrl);
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchExam();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading exam details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">Exam Not Found</h1>
          <p className="text-gray-600 mb-6">
            The exam you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="bg-[#1A73E8] hover:bg-[#1557B0]">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Construct practice URL from provider and code
  // Use provider.slug or provider.name, and exam.code
  const practiceProvider = exam.provider?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') || 'provider';
  // Handle exam code: convert to lowercase, replace spaces and underscores with hyphens
  const practiceExamCode = exam.code?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') || exam.slug?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') || 'exam';
  const practiceUrl = practiceProvider && practiceExamCode ? `/exams/${practiceProvider}/${practiceExamCode}/practice` : null;

  // Prepare breadcrumb items for schema
  const breadcrumbItems = exam
    ? [
        { name: "Home", url: "/" },
        { name: exam.provider || "Provider", url: `/exams?provider=${exam.provider?.toLowerCase()}` },
        { name: exam.code || "Exam", url: typeof window !== "undefined" ? window.location.pathname : "" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white">
      {exam && <BreadcrumbJsonLd items={breadcrumbItems} />}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-[#0C1A35]/60 hover:text-[#1A73E8]">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/exams?provider=${exam.provider?.toLowerCase()}`} className="text-[#0C1A35]/60 hover:text-[#1A73E8]">
                  {exam.provider}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-[#0C1A35] font-medium">{exam.code}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Main Info */}
          <div className="lg:col-span-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-sm px-3 py-1">
                {exam.code}
              </Badge>
              <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-sm px-3 py-1">
                {exam.provider}
              </Badge>
              {exam.category && (
                <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-sm px-3 py-1">
                  {exam.category}
                </Badge>
              )}
              {exam.difficulty && (
                <Badge className="bg-green-100 text-green-700 border-0 text-sm px-3 py-1">
                  {exam.difficulty}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#0C1A35] mb-4">
              {exam.title}
            </h1>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mb-6">
              {exam.updated_at && (
                <div className="flex items-center gap-2 text-[#0C1A35]/70">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Updated {new Date(exam.updated_at).toLocaleDateString()}</span>
                </div>
              )}
              {exam.pass_rate && (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{exam.pass_rate}% Pass Rate</span>
                </div>
              )}
            </div>

            {/* About Section */}
            {exam.about && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C1A35] mb-4">About This Exam</h2>
                <div 
                  className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: exam.about }}
                />
              </div>
            )}
          </div>

          {/* Right: CTA Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-[#DDE7FF] shadow-lg">
              <CardContent className="p-6 space-y-4">
                {/* Rating */}
                {exam.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-[#0C1A35]">{exam.rating}</span>
                    <span className="text-sm text-[#0C1A35]/60">(2,847 reviews)</span>
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-3 py-4 border-y border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0C1A35]/60">Practice Tests</span>
                    <span className="font-semibold text-[#0C1A35]">{(exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) ? exam.practice_tests_list.length : (exam.practice_exams || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0C1A35]/60">Total Questions</span>
                    <span className="font-semibold text-[#0C1A35]">{exam.questions || 0}+</span>
                  </div>
                  {exam.pass_rate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0C1A35]/60">Pass Rate</span>
                      <span className="font-semibold text-green-600">{exam.pass_rate}%</span>
                    </div>
                  )}
                  {exam.duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#0C1A35]/60">Duration</span>
                      <span className="font-semibold text-[#0C1A35]">{exam.duration}</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {practiceUrl && (
                <Button
                  asChild
                  className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white h-12 text-base font-semibold shadow-[0_4px_14px_rgba(26,115,232,0.4)]"
                >
                  <Link href={practiceUrl}>
                    Start Practicing
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What's Included Section */}
        {exam.whats_included && exam.whats_included.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">What's Included in This Practice Pack</h2>
            <Card className="border-[#DDE7FF]">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {exam.whats_included.map((item, index) => (
                    <div 
                      key={index}
                      className="tiptap-editor-content text-[#0C1A35]/80"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Why It Matters Section */}
        {exam.why_matters && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Why This Exam Matters</h2>
            <Card className="border-[#DDE7FF]">
              <CardContent className="p-6">
                <div 
                  className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: exam.why_matters }}
                />
              </CardContent>
            </Card>
          </section>
        )}

        {/* Eligibility Section */}
        {exam.eligibility && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Eligibility</h2>
            <Card className="border-[#DDE7FF]">
              <CardContent className="p-6">
                <p className="text-[#0C1A35]/80 leading-relaxed whitespace-pre-line">
                  {exam.eligibility}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Exam Pattern Section */}
        {exam.exam_pattern && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Exam Format Summary</h2>
            <Card className="border-[#DDE7FF]">
              <CardContent className="p-6">
                <p className="text-[#0C1A35]/80 leading-relaxed whitespace-pre-line mb-6">
                  {exam.exam_pattern}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {exam.questions && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <BookOpen className="w-8 h-8 text-[#1A73E8] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0C1A35]">{exam.questions}+</p>
                      <p className="text-sm text-[#0C1A35]/60">Questions</p>
                    </div>
                  )}
                  {exam.duration && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0C1A35]">{exam.duration}</p>
                      <p className="text-sm text-[#0C1A35]/60">Duration</p>
                    </div>
                  )}
                  {exam.passing_score && (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <Target className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0C1A35]">{exam.passing_score}</p>
                      <p className="text-sm text-[#0C1A35]/60">Passing Score</p>
                    </div>
                  )}
                  {exam.difficulty && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0C1A35]">{exam.difficulty}</p>
                      <p className="text-sm text-[#0C1A35]/60">Difficulty</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Topics Covered Section */}
        {exam.topics && exam.topics.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Exam Topics & Weightage</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {exam.topics.map((topic, index) => (
                <Card key={index} className="border-[#DDE7FF]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[#0C1A35]">{topic.name}</h3>
                      <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-sm">
                        {topic.weight}%
                      </Badge>
                    </div>
                    <Progress value={topic.weight} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Practice Tests Section */}
        {exam.practice_tests_list && exam.practice_tests_list.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">Practice Tests</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exam.practice_tests_list
                .filter((test, index, self) => 
                  // Deduplicate by ID or name to prevent showing same test multiple times
                  index === self.findIndex(t => 
                    (t.id && test.id && t.id === test.id) || 
                    (!t.id && !test.id && t.name === test.name)
                  )
                )
                .map((test, index) => (
                <Card key={test.id || test.name || index} className="border-[#DDE7FF] hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-[#0C1A35]">{test.name}</h3>
                      {test.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {test.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#0C1A35]/60 mb-4">
                      {test.questions} Questions
                    </p>
                    <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-xs mb-4">
                      Full-Length Test
                    </Badge>
                    {practiceUrl && (
                    <Button
                      className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white"
                      onClick={() => handleStartTest(test, index, practiceUrl)}
                    >
                      Start Test
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {exam.testimonials && exam.testimonials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-4">Success Stories</h2>
            <p className="text-[#0C1A35]/60 mb-6">Real results from learners who used our practice tests</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exam.testimonials.map((testimonial, index) => (
                <Card key={index} className="border-[#DDE7FF]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A73E8] to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0C1A35] flex items-center gap-1">
                          {testimonial.name}
                          {testimonial.verified && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </h3>
                        <p className="text-sm text-[#0C1A35]/60">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <Badge className="bg-green-100 text-green-700 border-0 mb-3 text-xs">
                        Verified
                      </Badge>
                    )}
                    <p className="text-[#0C1A35]/80 italic text-sm">
                      "{testimonial.review}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {exam.faqs && exam.faqs.length > 0 && (
          <section className="mb-12">
            <FAQJsonLd faqs={exam.faqs} />
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#0C1A35]/60 mb-6">Everything you need to know about this exam preparation pack</p>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {exam.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-[#DDE7FF] rounded-lg px-6 bg-white"
                >
                  <AccordionTrigger className="text-left font-semibold text-[#0C1A35] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#0C1A35]/70">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        {practiceUrl && (
        <Button
          asChild
          className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-[0_4px_14px_rgba(26,115,232,0.4)] h-12 text-base font-semibold"
        >
          <Link href={practiceUrl}>
            Start Practicing
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
        )}
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
                const { provider, examCode } = getProviderAndCode();
                const redirectUrl = pendingTestUrl || (provider && examCode ? `/exams/${provider}/${examCode}/practice` : '/');
                router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
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
