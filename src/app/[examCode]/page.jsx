import { notFound, redirect } from "next/navigation";

import ExamDetailClient from "@/app/exams/[provider]/[examCode]/ExamDetailClient";
import {
  buildExamDetailPayload,
  fetchExamByIdentifier,
  toExamSlug,
} from "@/lib/loadExamDetailPage";
import { getExamLandingPath, pathsMatchPublicUrl } from "@/utils/practiceTestRouting";
import { isOfficialDetailsOnlyCourse } from "@/lib/examListingFilters";
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const dynamic = "force-dynamic";

const SITE_URL = "https://allexamquestions.com";

export async function generateMetadata({ params }) {
  const { examCode } = await params;
  const rawExamCode = decodeURIComponent(String(examCode || "").trim());
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam) {
    return {
      title: "Exam | AllExamQuestions",
      robots: ROBOTS_NOINDEX,
    };
  }

  const pageTitle = exam.meta_title
    ? `${exam.meta_title} | All Exam Questions`
    : exam.title || `${rawExamCode} Certification Exam`;

  return {
    title: pageTitle,
    description:
      exam.meta_description ||
      exam.description ||
      `Prepare for ${exam.title || rawExamCode} with practice questions.`,
    keywords: exam.meta_keywords || "",
    alternates: {
      canonical: `${SITE_URL}${getExamLandingPath(exam) || `/${rawExamCode}`}`,
    },
    robots: ROBOTS_INDEX,
  };
}

export default async function SlugExamDetailPage({ params }) {
  const { examCode } = await params;

  if (String(examCode || "").toLowerCase() === "admin") {
    notFound();
  }

  const rawExamCode = decodeURIComponent(String(examCode || "").trim());
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam) {
    notFound();
  }

  if (isOfficialDetailsOnlyCourse(exam)) {
    notFound();
  }

  const canonicalLanding = getExamLandingPath(exam);
  if (
    canonicalLanding &&
    !pathsMatchPublicUrl(`/${rawExamCode}`, canonicalLanding)
  ) {
    redirect(canonicalLanding);
  }

  const slug = exam.slug ? String(exam.slug).trim() : rawExamCode;
  const { examData, provider, examCode: resolvedExamCode } = buildExamDetailPayload(
    exam,
    {
      provider: exam.provider_slug || "",
      examCode: slug,
    }
  );

  return (
    <ExamDetailClient
      examData={examData}
      provider={provider || ""}
      examCode={resolvedExamCode || rawExamCode}
    />
  );
}
