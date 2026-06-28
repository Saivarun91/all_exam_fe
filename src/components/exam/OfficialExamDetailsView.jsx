import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  buildOfficialDetailsPublicUrl,
  getOfficialDetailsPath,
  trimOfficialDetailsPathSegment,
} from "@/app/exams/[provider]/[examCode]/examInfoUtils";
import StartTestButton from "@/app/exams/[provider]/[examCode]/StartTestButton";
import TipTapContent from "@/components/editor/TipTapContent";
import PopularExamsStickySidebar from "@/components/exam/PopularExamsStickySidebar";
import {
  buildPopularExamsSidebarItems,
  fetchPopularExamsCourses,
} from "@/lib/popularExamsSidebar";
import {
  getExamLandingPath,
  getExamPracticePath,
} from "@/utils/practiceTestRouting";

function pick(exam, ...keys) {
  for (const k of keys) {
    const val = exam?.[k];
    if (val !== undefined && val !== null && val !== "" && val !== "null") {
      return val;
    }
  }
  return null;
}

function officialContentIsMeaningful(rawContent) {
  const normalizedRaw = String(rawContent || "").trim();
  if (!normalizedRaw) return false;

  const lowered = normalizedRaw.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return false;

  const textOnly = lowered
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return textOnly.length > 0;
}

function formatOfficialStatDuration(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/minute|hour|min\b|sec\b/i.test(value)) return value;
  if (/^\d+(\.\d+)?$/.test(value)) return `${value} Minutes`;
  return value;
}

function formatOfficialStatValidity(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/year/i.test(value)) return value;
  const num = Number(value);
  if (!Number.isNaN(num)) {
    return `${num} ${num === 1 ? "Year" : "Years"}`;
  }
  return value;
}

export function hasOfficialDetailsData(exam) {
  const rawContent =
    typeof exam?.official_details_content === "string"
      ? exam.official_details_content
      : "";

  const contentIsMeaningful = officialContentIsMeaningful(rawContent);

  const faqs = Array.isArray(exam?.official_details_faqs)
    ? exam.official_details_faqs.filter(
        (f) => f && String(f.question || "").trim() !== ""
      )
    : [];

  const hasAnyStat = [
    exam?.official_details_stat_exam_code,
    exam?.official_details_stat_duration,
    exam?.official_details_stat_total_questions,
    exam?.official_details_stat_cost,
    exam?.official_details_stat_certification_body,
    exam?.official_details_stat_validity,
  ].some((v) => String(v || "").trim() !== "");

  // Only consider the page "available" if admin actually provided real official details
  // (meaningful content text OR at least 1 official FAQ OR at least 1 official stat row).
  return contentIsMeaningful || faqs.length > 0 || hasAnyStat;
}

export function buildOfficialExamPageModel(exam, normalizedExamCode) {
  const slug = pick(exam, "slug") || normalizedExamCode;
  const officialUrlSlug = trimOfficialDetailsPathSegment(
    pick(exam, "official_details_url_slug") || "official-details"
  );
  const title = pick(exam, "title", "name") || "";
  const code = pick(exam, "code", "exam_code") || normalizedExamCode;
  const practiceBaseSlug =
    slug &&
    slug !== officialUrlSlug &&
    !String(slug).toLowerCase().endsWith("-exam-info")
      ? slug
      : "";
  const officialContent = pick(exam, "official_details_content") || "";
  const pageTitle =
    pick(exam, "official_details_page_title") ||
    pick(exam, "official_details_meta_title") ||
    "Official Exam Information";

  const examData = {
    provider: pick(exam, "provider") || "",
    code,
    title,
    exam_details: pick(exam, "exam_details", "details") || "",
    details: pick(exam, "details", "exam_details") || "",
    testDescription: pick(exam, "test_description", "testDescription") || "",
    slug,
  };

  const practiceUrl =
    getExamPracticePath({
      slug: practiceBaseSlug,
      title,
      code,
    }) || `/${practiceBaseSlug || slug}/practice`;
  const examDetailUrl =
    getExamLandingPath({
      slug,
      title,
      code,
    }) || `/${slug}`;
  const officialDetailsUrl = buildOfficialDetailsPublicUrl({
    slug,
    title,
    code,
    official_details_url_slug: pick(exam, "official_details_url_slug") || "",
  });
  const internalOfficialDetailsUrl = getOfficialDetailsPath(
    slug,
    officialUrlSlug
  );

  const statRows = [
    {
      label: "Exam code",
      value: String(exam?.official_details_stat_exam_code || "").trim(),
    },
    {
      label: "Duration",
      value: formatOfficialStatDuration(exam?.official_details_stat_duration),
    },
    {
      label: "Number of questions",
      value: String(exam?.official_details_stat_total_questions || "").trim(),
    },
    {
      label: "Cost",
      value: String(exam?.official_details_stat_cost || "").trim(),
    },
    {
      label: "Certification body",
      value: String(exam?.official_details_stat_certification_body || "").trim(),
    },
    {
      label: "Validity",
      value: formatOfficialStatValidity(exam?.official_details_stat_validity),
    },
  ].filter((row) => row.value);

  const hasRichContent = officialContentIsMeaningful(officialContent);

  const officialFaqs = Array.isArray(exam.official_details_faqs)
    ? exam.official_details_faqs.filter(
        (f) => f && String(f.question || "").trim() !== ""
      )
    : [];

  return {
    examData,
    officialContent,
    hasRichContent,
    officialFaqs,
    hasOfficialDetailsData: hasOfficialDetailsData(exam),
    pageTitle,
    statRows,
    practiceUrl,
    examDetailUrl,
    officialDetailsUrl,
    internalOfficialDetailsUrl,
    officialUrlSlug,
  };
}
export async function generateMetadata({ params }) {
  const { provider, examCode } = params || {};

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  let exam = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/courses/exams/${provider}-${examCode}/`,
      { cache: "no-store" }
    );

    if (res.ok) {
      exam = await res.json();
    }
  } catch (e) {}

  const title =
    exam?.meta_title ||
    `${examCode?.toUpperCase()} Official Exam Details | ${provider?.toUpperCase()}`;

  const description =
    exam?.meta_description ||
    `Official details, syllabus, duration, cost and certification info for ${examCode?.toUpperCase()} exam by ${provider?.toUpperCase()}.`;

  const keywords =
    exam?.meta_keywords ||
    `${examCode}, ${provider}, exam details, certification, syllabus`;

  const canonicalUrl =
    `https://allexamquestions.com/exams/${provider}/${examCode}`;

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function OfficialExamDetailsView({
  exam,
  normalizedExamCode,
}) {
  const {
    officialContent,
    hasRichContent,
    officialFaqs,
    hasOfficialDetailsData: hasAnyOfficialDetailsData,
    pageTitle,
    statRows,
    practiceUrl,
    examData,
  } = buildOfficialExamPageModel(exam, normalizedExamCode);

  const popularExamsCourses = await fetchPopularExamsCourses();
  const popularExams = buildPopularExamsSidebarItems(popularExamsCourses, {
    excludeProvider: examData.provider,
    excludeCode: examData.code,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">{pageTitle}</h1>
        <p className="text-[#0C1A35]/70 mb-8">
          Official details for {examData.title || examData.code} as published by
          the certification body.
        </p>

        {!hasAnyOfficialDetailsData ? (
          <Card className="max-w-3xl mx-auto border border-[#DDE7FF]">
            <CardHeader>
              <CardTitle className="text-[#0C1A35]">No official details found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#0C1A35]/70">
                Official exam details are not available yet. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
        <>
          {/* Stats table — centered above content */}
          {statRows.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-8 mb-8">
              <CardContent>
                <div className="overflow-hidden rounded-lg border border-[#DDE7FF]">
                  {statRows.map((row, index) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-[140px_1fr] gap-4 px-4 py-3 items-center ${
                        index !== statRows.length - 1
                          ? "border-b border-[#DDE7FF]"
                          : ""
                      } ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-[#F8FAFF]"
                      }`}
                    >
                      <div className="text-sm font-medium text-[#0C1A35]/70">
                        {row.label}
                      </div>

                      <div className="text-sm font-semibold text-[#0C1A35] text-right break-words">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="flex justify-center">
                <StartTestButton url={practiceUrl} label="Start Practicing Tests" />
              </div>
            </div>
          ) : null}

          {/* Content + sticky popular exams — sidebar aligns with content start */}
          {(hasRichContent || officialFaqs.length > 0) ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8 min-w-0">
                {hasRichContent ? (
                  <section
                    className={`w-full ${statRows.length > 0 ? "pt-8 border-t border-[#DDE7FF]" : ""}`}
                  >
                    <TipTapContent
                      content={officialContent}
                      className="w-full max-w-none text-[#0C1A35]/85 leading-relaxed break-words [&_img]:max-w-full [&_img]:h-auto [&_.tableWrapper]:overflow-x-auto [&_table]:max-w-full"
                    />
                  </section>
                ) : null}

                {officialFaqs.length > 0 ? (
                  <section
                    className={`w-full ${hasRichContent || statRows.length > 0 ? "pt-8 border-t border-[#DDE7FF]" : ""}`}
                  >
                    <h2 className="text-2xl font-bold text-[#0C1A35] mb-4">
                      Frequently Asked Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                      {officialFaqs.map((faq, idx) => (
                        <AccordionItem key={idx} value={`official-faq-${idx}`}>
                          <AccordionTrigger className="text-[#0C1A35] font-medium text-left no-underline hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-[#0C1A35]/80 leading-relaxed whitespace-pre-wrap break-words">
                              {faq.answer || ""}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                ) : null}
              </div>

              <aside className="lg:col-span-1 hidden lg:block">
                <PopularExamsStickySidebar exams={popularExams} sticky />
              </aside>
            </div>
          ) : null}

          {/* Mobile: popular exams below content */}
          {(hasRichContent || officialFaqs.length > 0) ? (
            <div className="lg:hidden mt-8">
              <PopularExamsStickySidebar exams={popularExams} sticky={false} />
            </div>
          ) : popularExams.length > 0 ? (
            <div className="mt-8 lg:flex lg:justify-end">
              <div className="w-full lg:max-w-sm">
                <PopularExamsStickySidebar exams={popularExams} sticky />
              </div>
            </div>
          ) : null}
        </>
        )}
      </div>
    </div>
  );
}
