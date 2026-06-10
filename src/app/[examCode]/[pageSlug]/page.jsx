import { notFound } from "next/navigation";

import OfficialExamDetailsView, {
  buildOfficialExamPageModel,
} from "@/components/exam/OfficialExamDetailsView";
import { fetchExamByIdentifier } from "@/lib/loadExamDetailPage";
import { loadAdminSubroutePage } from "@/lib/adminSubrouteLoaders";
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

export async function generateMetadata({ params }) {
  const { examCode, pageSlug } = await params;
  const rawExamCode = decodePathSegment(examCode);
  const rawPageSlug = decodePathSegment(pageSlug);
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam) {
    return {
      title: "Official Exam Information | AllExamQuestions",
      robots: ROBOTS_NOINDEX,
    };
  }

  const model = buildOfficialExamPageModel(exam, rawExamCode);
  if (rawPageSlug !== model.officialUrlSlug) {
    return {
      title: "Page Not Found | AllExamQuestions",
      robots: ROBOTS_NOINDEX,
    };
  }

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

export default async function ExamCustomOfficialDetailsPage({ params }) {
  const { examCode, pageSlug } = await params;

  if (String(examCode || "").toLowerCase() === "admin") {
    const AdminPage = await loadAdminSubroutePage(pageSlug);
    if (AdminPage) {
      return <AdminPage />;
    }
    notFound();
  }

  const rawExamCode = decodePathSegment(examCode);
  const rawPageSlug = decodePathSegment(pageSlug);
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam) notFound();

  const model = buildOfficialExamPageModel(exam, rawExamCode);

  if (rawPageSlug !== model.officialUrlSlug) {
    notFound();
  }

  return (
    <OfficialExamDetailsView exam={exam} normalizedExamCode={rawExamCode} />
  );
}
