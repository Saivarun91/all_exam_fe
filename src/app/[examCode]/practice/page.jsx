import { notFound, redirect } from "next/navigation";
import PracticeTestJsonLd from "@/components/PracticeTestJsonLd";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";
import RatingJsonLd from "@/components/RatingJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

import PracticePageClient from "@/app/exams/[provider]/[examCode]/practice/PracticePageClient";
import PracticePageBreadcrumbs, {
  PRACTICE_PAGE_CONTAINER,
} from "@/app/exams/[provider]/[examCode]/practice/PracticePageBreadcrumbs";
import {
  getExamLandingPath,
  getExamPracticePath,
  resolveExamPublicPathBase,
} from "@/utils/practiceTestRouting";
import {
  fetchExamByExactSlug,
  fetchExamByIdentifier,
} from "@/lib/loadExamDetailPage";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({ params }) {
  const { examCode } = await params;
  const normalizedExamCode = toSlug(examCode);
  const exam =
    (await fetchExamByExactSlug(normalizedExamCode)) ||
    (await fetchExamByIdentifier(normalizedExamCode));

  if (!exam) {
    return { title: "Practice Tests | AllExamQuestions" };
  }

  const practicePath = getExamPracticePath(exam);
  const pageTitle = exam.meta_title
    ? `${exam.meta_title} | All Exam Questions`
    : exam.title || `${normalizedExamCode} Certification Exam`;
  const pageDescription = exam.meta_description || `Practice tests for ${exam.title}.`;
  const pageUrl = `https://allexamquestions.com${practicePath}`;

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
  const examData =
    (await fetchExamByExactSlug(normalizedExamCode)) ||
    (await fetchExamByIdentifier(normalizedExamCode));

  if (!examData) return notFound();

  const canonicalPracticePath = getExamPracticePath(examData);
  if (canonicalPracticePath && canonicalPracticePath !== `/${normalizedExamCode}/practice`) {
    redirect(canonicalPracticePath);
  }

  const publicPathBase = resolveExamPublicPathBase(examData);
  const provider = toSlug(examData.provider || "");

  const practiceTests = Array.isArray(examData.practice_tests_list)
    ? examData.practice_tests_list
    : Array.isArray(examData.practice_tests)
    ? examData.practice_tests
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
    { name: exam.title || exam.code, url: getExamLandingPath(examData) || `/${publicPathBase}` },
    { name: "Practice Tests", url: canonicalPracticePath || `/${publicPathBase}/practice` },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
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

      <div className={`${PRACTICE_PAGE_CONTAINER} py-6 pb-12`}>
        <PracticePageBreadcrumbs items={breadcrumbItems} />

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-[#1A73E8] px-3 py-1 text-xs font-semibold text-white">
              {exam.code}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#1A73E8]/10 px-3 py-1 text-xs font-medium text-[#1A73E8]">
              {exam.provider}
            </span>
            {exam.category.map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-[#1A73E8]/10 px-3 py-1 text-xs font-medium text-[#1A73E8]"
              >
                {cat}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {exam.difficulty}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0C1A35] leading-tight">
            {exam.title}
          </h1>
        </header>

      <PracticePageClient
        practiceTests={practiceTests}
        provider={provider}
        examCode={examData.code || normalizedExamCode}
        examTitle={exam.title}
        examSlug={examData.slug || publicPathBase}
      />
      </div>
    </div>
  );
}
