"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Award, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getExamUrl } from "@/lib/utils";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CategoryDetail({
  slug,
  category,
  courses,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">
            Category Not Found
          </h1>
          <p className="text-[#0C1A35]/70 mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Button
            asChild
            className="bg-[#1A73E8] text-white hover:bg-[#1557B0]"
          >
            <Link href="/exams">Browse All Exams</Link>
          </Button>
        </div>
      </div>
    );
  }

  const safeCourses = Array.isArray(courses) ? courses : [];
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return safeCourses;
    return safeCourses.filter((course) => {
      const title = String(course?.title || "").toLowerCase();
      const code = String(course?.code || "").toLowerCase();
      const provider = String(course?.provider || "").toLowerCase();
      return (
        title.includes(query) || code.includes(query) || provider.includes(query)
      );
    });
  }, [safeCourses, searchTerm]);
  const categoryContent = (category?.content || "").trim();
  const hasRenderableContent = Boolean(
    categoryContent.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim()
  );
  const safeFaqs = Array.isArray(category?.faqs)
    ? category.faqs.filter(
        (faq) =>
          faq &&
          String(faq.question || "").trim() &&
          String(faq.answer || "").trim()
      )
    : [];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
    { name: category?.title || "Category", url: `/categories/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {category && <BreadcrumbJsonLd items={breadcrumbItems} />}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-[#0C1A35]/60 hover:text-[#1A73E8]"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/categories"
                  className="text-[#0C1A35]/60 hover:text-[#1A73E8]"
                >
                  Categories
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-[#0C1A35] font-medium">
              {category.title}
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">
            {category.title}
          </h1>
          {category.description && (
            <p className="text-lg text-[#0C1A35]/70 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="text-3xl font-bold text-[#1A73E8]">
              {filteredCourses.length}
            </div>
            <div className="text-sm text-[#0C1A35]/60">Exams Available</div>
          </div>
        </div>

        <div className="mb-8 max-w-lg">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exams by title, code, or provider..."
            className="border-[#DDE7FF] focus-visible:ring-[#1A73E8]"
          />
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF] cursor-pointer h-full"
                onClick={() => {
                  window.location.href = getExamUrl(course);
                }}
              >
                <CardContent className="p-6 h-full flex flex-col gap-4">
                  {/* Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#1A73E8]" />
                    </div>
                    {course.badge && (
                      <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] text-xs">
                        {course.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="space-y-1 min-h-[88px]">
                    <p className="text-sm text-[#0C1A35]/60 font-medium">
                      {course.provider}
                    </p>
                    <h3 className="text-xl font-bold text-[#0C1A35] leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#0C1A35]/60">{course.code}</p>
                  </div>

                  {/* Stats */}
                  <div className="pt-2">
                    <p className="text-sm text-[#0C1A35]/60">
                      {(() => {
                        if (
                          course.practice_tests_list &&
                          Array.isArray(course.practice_tests_list) &&
                          course.practice_tests_list.length > 0
                        ) {
                          return course.practice_tests_list.length;
                        }
                        return course.practice_exams || 0;
                      })()}{" "}
                      Practice Exams ·{" "}
                      {(() => {
                        if (
                          course.practice_tests_list &&
                          Array.isArray(course.practice_tests_list) &&
                          course.practice_tests_list.length > 0
                        ) {
                          const totalQuestions =
                            course.practice_tests_list.reduce(
                              (sum, test) => {
                                const testQuestions =
                                  parseInt(test.questions) || 0;
                                return sum + testQuestions;
                              },
                              0
                            );
                          return totalQuestions > 0
                            ? totalQuestions
                            : course.questions || 0;
                        }
                        return course.questions || 0;
                      })()}{" "}
                      Questions
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: "auto" }}
                  >
                    <Link href={getExamUrl(course)}>
                      Start Practicing
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0C1A35] mb-2">
              No Exams Found
            </h3>
            <p className="text-[#0C1A35]/60 mb-6">
              {searchTerm.trim()
                ? `No exams match "${searchTerm}".`
                : "No exams are currently available in this category."}
            </p>
            <Button
              asChild
              className="bg-[#1A73E8] text-white hover:bg-[#1557B0]"
            >
              <Link href="/exams">Browse All Exams</Link>
            </Button>
          </div>
        )}

        {hasRenderableContent ? (
          <section className="mt-10 pt-8 border-t border-gray-200">
            <div className="prose prose-slate max-w-none">
              <div
                className="text-[#0C1A35]/80 leading-7"
                dangerouslySetInnerHTML={{ __html: categoryContent }}
              />
            </div>
          </section>
        ) : null}

        {safeFaqs.length > 0 ? (
          <section className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-[#0C1A35] mb-4">FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              {safeFaqs.map((faq, index) => (
                <AccordionItem key={`faq-${index}`} value={`faq-${index}`}>
                  <AccordionTrigger className="text-base text-[#0C1A35] no-underline hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-[#0C1A35]/70 whitespace-pre-line break-words not-italic">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}
      </div>
    </div>
  );
}

