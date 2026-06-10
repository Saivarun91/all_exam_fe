import { notFound } from "next/navigation";

import OfficialExamDetailsView, {
  buildOfficialExamPageModel,
} from "@/components/exam/OfficialExamDetailsView";
import { fetchExamByIdentifier } from "@/lib/loadExamDetailPage";
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const dynamic = "force-dynamic";

const SITE_URL = "https://allexamquestions.com";

function decodePathSegment(value = "") {
  try {
    return decodeURIComponent(String(value ?? "").trim());
  } catch {
    return String(value ?? "").trim();
  }
}

function isOfficialDetailsExam(exam) {
  return (
    exam?.show_in_official_details === true ||
    exam?.show_in_official_details === "true"
  );
}

export async function generateMetadata({ params }) {
  const { examCode } = await params;
  const rawExamCode = decodePathSegment(examCode);
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam || !isOfficialDetailsExam(exam)) {
    return {
      title: "Official Exam Information | AllExamQuestions",
      robots: ROBOTS_NOINDEX,
    };
  }

  const model = buildOfficialExamPageModel(exam, rawExamCode);
  const metaTitle = exam.official_details_meta_title;
  const metaDescription = exam.official_details_meta_description;
  const metaKeywords = exam.official_details_meta_keywords;

  const title = metaTitle
    ? `${metaTitle} | All Exam Questions`
    : `${model.pageTitle} | All Exam Questions`;

  return {
    title,
    description:
      metaDescription ||
      `Official exam information for ${model.examData.title || model.examData.code}.`,
    keywords: metaKeywords || "",
    alternates: {
      canonical: `${SITE_URL}${model.officialDetailsUrl}`,
    },
    robots: ROBOTS_INDEX,
  };
}

export default async function OfficialExamDetailsPage({ params }) {
  const { examCode } = await params;
  const rawExamCode = decodePathSegment(examCode);
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam || !isOfficialDetailsExam(exam)) {
    notFound();
  }

  return (
    <OfficialExamDetailsView exam={exam} normalizedExamCode={rawExamCode} />
  );
}
