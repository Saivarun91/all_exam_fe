"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Target,
  Award,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import RatingJsonLd from "@/components/RatingJsonLd";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ExamDetail({ examData, provider, examCode }) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTestUrl, setPendingTestUrl] = useState(null);

  const checkLogin = () =>
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const handleStartTest = (test, index = 0) => {
    let testIdentifier = test && test.slug
      ? test.slug
      : test && test.id
      ? test.id
      : test || index + 1;
    if (typeof testIdentifier === "string") {
      testIdentifier = testIdentifier.replace(/-[a-f0-9]{8}$/i, "");
    }
    const testUrl = `/exams/${provider}/${examCode}/practice/${testIdentifier}`;
    if (!checkLogin()) {
      setPendingTestUrl(testUrl);
      setShowLoginModal(true);
    } else {
      router.push(testUrl);
    }
  };

  useEffect(() => {
    const handleLoginSuccess = () => {
      if (pendingTestUrl) {
        setShowLoginModal(false);
        router.push(pendingTestUrl);
        setPendingTestUrl(null);
      }
    };
    window.addEventListener("userLoggedIn", handleLoginSuccess);
    return () => window.removeEventListener("userLoggedIn", handleLoginSuccess);
  }, [pendingTestUrl, router]);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
    { name: examData.provider, url: `/${provider}` },
    { name: examData.code, url: `/exams/${provider}/${examCode}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {examData && <BreadcrumbJsonLd items={breadcrumbItems} />}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-[#0C1A35] hover:text-[#1A73E8]"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/exams"
                  className="text-[#0C1A35] hover:text-[#1A73E8]"
                >
                  Exams
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${provider}`}
                  className="text-[#0C1A35] hover:text-[#1A73E8]"
                >
                  {examData.provider}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-[#0C1A35]">
              {examData.code}
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-[#1A73E8] text-white border-0">
              {examData.code}
            </Badge>
            <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0">
              {examData.provider}
            </Badge>
            {examData.category.map((cat, idx) => (
              <Badge
                key={idx}
                className="bg-[#1A73E8]/10 text-[#1A73E8] border-0"
              >
                {cat}
              </Badge>
            ))}
            <Badge className="bg-green-100 text-green-700 border-0">
              {examData.difficulty}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">
            {examData.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/70">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-[#1A73E8]" />
              <span>Updated {examData.lastUpdated}</span>
            </div>
            {examData.passRate !== null && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-semibold">
                  {examData.passRate}% Pass Rate
                </span>
              </div>
            )}
          </div>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Card */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">
                  Exam Summary
                </CardTitle>
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
                    <p className="text-sm text-[#0C1A35]/60 mb-1">
                      Passing Score
                    </p>
                    <p className="font-semibold text-[#0C1A35]">
                      {examData.passingScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">
                      Practice Tests
                    </p>
                    <p className="font-semibold text-[#0C1A35]">
                      {examData.practiceTests}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">
                      Total Questions
                    </p>
                    <p className="font-semibold text-[#0C1A35]">
                      {examData.totalQuestions}
                    </p>
                  </div>
                </div>
                {examData.passRate !== null && (
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-2">Pass Rate</p>
                    <div className="flex items-center gap-2">
                      <Progress value={examData.passRate} className="flex-1" />
                      <span className="text-sm font-semibold text-[#0C1A35]">
                        {examData.passRate}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                {examData.about_heading ? (
                  <div
                    className="text-[#0C1A35]"
                    dangerouslySetInnerHTML={{
                      __html: examData.about_heading,
                    }}
                  />
                ) : (
                  <CardTitle className="text-[#0C1A35]">
                    About This Exam
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: examData.about }}
                />
              </CardContent>
            </Card>

            {/* Topics Covered */}
            {examData.topics && examData.topics.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  {examData.topics_heading ? (
                    <div
                      className="text-[#0C1A35]"
                      dangerouslySetInnerHTML={{
                        __html: examData.topics_heading,
                      }}
                    />
                  ) : (
                    <CardTitle className="text-[#0C1A35]">
                      Topics Covered
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {examData.topics.map((topic, idx) => {
                    const percentage = Math.round(
                      (topic.startPercentage + topic.endPercentage) / 2
                    );
                    const topicExplanation =
                      typeof topic.explanation === "string" && topic.explanation.trim()
                        ? topic.explanation.trim()
                        : typeof topic.description === "string" && topic.description.trim()
                          ? topic.description.trim()
                          : "";

                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-[#0C1A35]">
                            {topic.name}
                          </span>
                          <span className="text-sm text-[#0C1A35]/60">
                            {percentage}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {topicExplanation ? (
                          <p className="text-sm text-[#0C1A35]/70 mt-2 leading-relaxed whitespace-pre-wrap">
                            {topicExplanation}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* What's Included */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                {examData.whats_included_heading ? (
                  <div
                    className="text-[#0C1A35]"
                    dangerouslySetInnerHTML={{
                      __html: examData.whats_included_heading,
                    }}
                  />
                ) : (
                  <CardTitle className="text-[#0C1A35]">
                    What's Included in This Practice Pack
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {examData.whatsIncluded.map((item, idx) => (
                    <div
                      key={idx}
                      className="tiptap-editor-content text-[#0C1A35]/80"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why This Exam Matters */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                {examData.why_matters_heading ? (
                  <div
                    className="text-[#0C1A35]"
                    dangerouslySetInnerHTML={{
                      __html: examData.why_matters_heading,
                    }}
                  />
                ) : (
                  <CardTitle className="text-[#0C1A35]">
                    Why This Exam Matters
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="text-[#0C1A35]/80 leading-relaxed tiptap-editor-content"
                  dangerouslySetInnerHTML={{ __html: examData.whyMatters }}
                />
              </CardContent>
            </Card>

            {/* Exam Format Summary */}
            <Card className="border-[#DDE7FF]">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">
                  Exam Format Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mt-1">
                      <BookOpen className="w-4 h-4 text-[#1A73E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0C1A35] mb-1">
                        Question Format
                      </h3>
                      <p className="text-sm text-[#0C1A35]/70">
                        Multiple-choice, multiple response, and scenario-based
                        questions that reflect the real exam.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mt-1">
                      <Clock className="w-4 h-4 text-[#1A73E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0C1A35] mb-1">
                        Time Limit
                      </h3>
                      <p className="text-sm text-[#0C1A35]/70">
                        Timed mode helps you get used to the pressure of the
                        real exam environment.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mt-1">
                      <Target className="w-4 h-4 text-[#1A73E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0C1A35] mb-1">
                        Passing Criteria
                      </h3>
                      <p className="text-sm text-[#0C1A35]/70">
                        Understand the scoring system and target score required
                        to pass the certification exam.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mt-1">
                      <TrendingUp className="w-4 h-4 text-[#1A73E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0C1A35] mb-1">
                        Difficulty Progression
                      </h3>
                      <p className="text-sm text-[#0C1A35]/70">
                        Questions range from foundational concepts to advanced
                        scenarios to fully prepare you.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            {examData.faqs && examData.faqs.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  {examData.faqs_heading ? (
                    <div
                      className="text-[#0C1A35]"
                      dangerouslySetInnerHTML={{
                        __html: examData.faqs_heading,
                      }}
                    />
                  ) : (
                    <CardTitle className="text-[#0C1A35]">
                      Frequently Asked Questions
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {examData.faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-left text-[#0C1A35]">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div
                            className="tiptap-editor-content text-[#0C1A35]/80"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="border-[#DDE7FF] sticky top-4">
              <CardHeader>
                <CardTitle className="text-[#0C1A35]">
                  Start Practicing Now
                </CardTitle>
                <CardDescription className="text-[#0C1A35]/70">
                  Access all practice tests and detailed explanations to boost
                  your exam readiness.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">
                      Practice Tests
                    </p>
                    <p className="text-lg font-semibold text-[#0C1A35]">
                      {examData.practiceTests}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#0C1A35]/60 mb-1">
                      Total Questions
                    </p>
                    <p className="text-lg font-semibold text-[#0C1A35]">
                      {examData.totalQuestions}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                  onClick={() => handleStartTest(examData.practiceTestsList[0])}
                >
                  Start First Practice Test
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <p className="text-xs text-[#0C1A35]/60 text-center">
                  No credit card required. Start practicing instantly.
                </p>
              </CardContent>
            </Card>

            {/* Testimonials */}
            {examData.testimonials && examData.testimonials.length > 0 && (
              <Card className="border-[#DDE7FF]">
                <CardHeader>
                  {examData.testimonials_heading ? (
                    <div
                      className="text-[#0C1A35]"
                      dangerouslySetInnerHTML={{
                        __html: examData.testimonials_heading,
                      }}
                    />
                  ) : (
                    <CardTitle className="text-[#0C1A35]">
                      What Learners Say
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {examData.testimonials.slice(0, 3).map((testimonial, idx) => (
                    <div key={idx} className="border-b last:border-b-0 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-[#0C1A35]">
                          {testimonial.name}
                        </span>
                      </div>
                      <p className="text-sm text-[#0C1A35]/70">
                        {testimonial.message}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Login Modal */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#0C1A35]">
                Sign in to start practicing
              </DialogTitle>
              <DialogDescription className="text-[#0C1A35]/70">
                Please log in to access all practice tests and track your
                progress.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                asChild
              >
                <Link href="/login">
                  Go to Login
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

