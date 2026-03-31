import { notFound } from "next/navigation";
import Link from "next/link";

import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import RatingJsonLd from "@/components/RatingJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import PracticePageClient from "@/app/exams/[provider]/[examCode]/practice/PracticePageClient";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/** ASCII URL slugs: maps Unicode hyphens/dashes and spaces to a single "-" */
function toSlug(value = "") {
  let s = String(value).trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded */
  }
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getExamByCode(examCode) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/exams/${examCode}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { examCode } = await params;
  const normalizedExamCode = toSlug(examCode);
  const exam = await getExamByCode(normalizedExamCode);

  if (!exam) {
    return { title: "Practice Tests | AllExamQuestions" };
  }

  const pageTitle = exam.meta_title
    ? `${exam.meta_title} | All Exam Questions`
    : exam.title || `${normalizedExamCode} Certification Exam`;
  const pageDescription = exam.meta_description || `Practice tests for ${exam.title}.`;
  const pageUrl = `https://allexamquestions.com/${normalizedExamCode}/practice`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: exam.meta_keywords || "",
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: exam.meta_image || "https://allexamquestions.com/alleq_logo.png",
          width: 1200,
          height: 630,
          alt: exam.meta_title || "All Exam Questions Exam Page",
        },
      ],
    },
  };
}

export default async function CleanPracticePage({ params }) {
  const { examCode } = await params;
  const normalizedExamCode = toSlug(examCode);
  const examData = await getExamByCode(normalizedExamCode);

  if (!examData) return notFound();

  const provider = toSlug(examData.provider || "");

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
        const expl = t.explanation ?? t.description ?? "";
        return {
          name: t.name || "Topic",
          percentage: isNaN(cleanValue) ? 0 : cleanValue,
          explanation: typeof expl === "string" ? expl.trim() : "",
        };
      })
    : [];

  const faqs = Array.isArray(examData.faqs) ? examData.faqs : [];
  const testimonials = Array.isArray(examData.testimonials) ? examData.testimonials : [];

  const exam = {
    title: examData.title || `${examData.provider} ${examData.code}`,
    code: examData.code || normalizedExamCode.toUpperCase(),
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
    { name: exam.code, url: `/exams/${provider}/${normalizedExamCode}` },
    { name: "Practice Tests", url: `/${normalizedExamCode}/practice` },
  ];

  return (
    <div className="min-h-screen bg-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-1 py-4">
        {/* Visible Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {breadcrumbItems.map((item, idx) => {
              const isLast = idx === breadcrumbItems.length - 1;

              return (
                <BreadcrumbItem key={`${item.name}-${idx}`}>
                  {isLast ? (
                    <BreadcrumbPage className="text-[#0C1A35]">{item.name}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.url}
                          className="text-[#0C1A35] hover:text-[#1A73E8]"
                        >
                          {item.name}
                        </Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge bg-[#1A73E8] text-white border-0">{exam.code}</span>
          <span className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">{exam.provider}</span>
          {exam.category.map((cat, idx) => (
            <span key={idx} className="badge bg-[#1A73E8]/10 text-[#1A73E8] border-0">
              {cat}
            </span>
          ))}
          <span className="badge bg-green-100 text-green-700 border-0">{exam.difficulty}</span>
        </div>
        <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{exam.title}</h1>
      </div>

      <PracticePageClient
        exam={exam}
        practiceTests={practiceTests}
        topics={topics}
        faqs={faqs}
        testimonials={testimonials}
        provider={provider}
        examCode={normalizedExamCode}
        breadcrumbItems={breadcrumbItems}
        practicePageSection1Heading={examData.practice_page_section_1_heading || ""}
        practicePageSection1Content={examData.practice_page_section_1_content || ""}
        practicePageSection2Heading={examData.practice_page_section_2_heading || ""}
        practicePageSection2Content={examData.practice_page_section_2_content || ""}
      />
    </div>
  );
}
