import { notFound, redirect } from "next/navigation";

import ExamDetailClient from "@/app/exams/[provider]/[examCode]/ExamDetailClient";
import TestPlayerClient from "@/components/TestPlayerClient";
import {
  buildExamDetailPayload,
  fetchExamByExactSlug,
  fetchExamByIdentifier,
  resolveOfficialDetailsAvailability,
} from "@/lib/loadExamDetailPage";
import { loadPracticeTestPageData } from "@/lib/loadPracticeTestPage";
import {
  getExamLandingPath,
  pathsMatchPublicUrl,
  stripExamPublicPathSuffix,
} from "@/utils/practiceTestRouting";
import { isOfficialDetailsOnlyCourse } from "@/lib/examListingFilters";
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const revalidate = 300;

const SITE_URL = "https://allexamquestions.com";
const PRACTICE_TEST_URL = /-free-practice-test-(\d+)$/i;

export async function generateMetadata({ params }) {
  const { examCode } = await params;
  const rawExamCode = decodeURIComponent(String(examCode || "").trim());
  const exam =
    (await fetchExamByExactSlug(rawExamCode)) ||
    (await fetchExamByIdentifier(rawExamCode));

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

  if (PRACTICE_TEST_URL.test(rawExamCode)) {
    const examKey = stripExamPublicPathSuffix(rawExamCode);
    const exam = await fetchExamByIdentifier(examKey || rawExamCode);
    if (!exam) {
      notFound();
    }

    const data = await loadPracticeTestPageData({ exam, testId: rawExamCode });
    if (!data) {
      notFound();
    }

    return (
      <TestPlayerClient
        exam={data.exam}
        questions={data.questions}
        test={data.test}
        provider={exam.provider_slug || ""}
        examCode={exam.slug || examKey}
        testId={data.resolvedTestId ?? rawExamCode}
      />
    );
  }

  const exam =
    (await fetchExamByExactSlug(rawExamCode)) ||
    (await fetchExamByIdentifier(rawExamCode));

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

  const officialMeta = await resolveOfficialDetailsAvailability(exam, {
    slug,
    examCode: slug,
  });
  examData.hasOfficialDetails = officialMeta.hasOfficialDetails;
  examData.officialDetailsUrl = officialMeta.officialDetailsUrl;

  return (
    <ExamDetailClient
      examData={examData}
      provider={provider || ""}
      examCode={resolvedExamCode || rawExamCode}
    />
  );
}
