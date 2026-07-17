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
  fetchExamByExactSlug,
} from "@/lib/loadExamDetailPage";
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

function hasPracticeHubContent(exam) {
  const practiceTests = Array.isArray(exam?.practice_tests_list)
    ? exam.practice_tests_list
    : Array.isArray(exam?.practice_tests)
      ? exam.practice_tests
      : [];
  const topics = Array.isArray(exam?.topics) ? exam.topics : [];

  return practiceTests.length > 0 || topics.length > 0;
}

const OFFICIAL_PRACTICE_BASE_SUFFIXES = [
  "-certification-information",
  "-exam-info",
  "-certification",
  "-information",
  "-info",
  "-practice-test",
  "-practice-exam",
  "-free-practice-test",
  "-free-test",
];

/** Practice-hub slug suffixes derived from the shared base (longest first). */
const OFFICIAL_PRACTICE_HUB_SUFFIXES = [
  "-practice-test",
  "-practice-exam",
  "-free-practice-test",
  "-free-test",
];

/** Normalize sibling slugs to a shared base before probing practice hubs. */
function stripToPracticeBaseSlug(slug = "") {
  let base = String(slug || "").trim().toLowerCase();
  if (!base) return "";

  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of OFFICIAL_PRACTICE_BASE_SUFFIXES) {
      if (base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length).replace(/-+$/g, "");
        changed = true;
        break;
      }
    }
  }

  return base;
}

/**
 * Official-details entries often use an `-exam-info` slug while the practice
 * hub lives on a sibling slug (`-free-test`, `-practice-exam`, etc.).
 */
function resolveOfficialDetailsPracticeSlug(exam, normalizedExamCode) {
  const storedSlug = pick(exam, "slug") || normalizedExamCode || "";
  const coreBase = stripToPracticeBaseSlug(storedSlug);
  if (coreBase) return `${coreBase}-practice-test`;
  return storedSlug;
}

function isSiblingPracticeSlug(candidateSlug, coreBase) {
  const candidate = String(candidateSlug || "").trim().toLowerCase();
  const base = String(coreBase || "").trim().toLowerCase();
  if (!candidate || !base) return false;
  if (candidate === base) return true;
  return OFFICIAL_PRACTICE_HUB_SUFFIXES.some(
    (suffix) => candidate === `${base}${suffix}`
  );
}

function deriveOfficialPracticeExamCandidates(exam, normalizedExamCode) {
  const storedSlug = pick(exam, "slug") || normalizedExamCode || "";
  const candidates = [];

  const add = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    if (
      !candidates.some((candidate) => candidate.toLowerCase() === trimmed.toLowerCase())
    ) {
      candidates.push(trimmed);
    }
  };

  const coreBase = stripToPracticeBaseSlug(storedSlug);
  if (coreBase) {
    for (const suffix of OFFICIAL_PRACTICE_HUB_SUFFIXES) {
      add(`${coreBase}${suffix}`);
    }
    add(coreBase);
  }

  if (storedSlug.toLowerCase().endsWith("-exam-info")) {
    const examInfoBase = storedSlug.replace(/-exam-info$/i, "");
    for (const suffix of OFFICIAL_PRACTICE_HUB_SUFFIXES) {
      add(`${examInfoBase}${suffix}`);
    }
    add(examInfoBase);
  }

  add(resolveOfficialDetailsPracticeSlug(exam, normalizedExamCode));

  return candidates;
}

function extractPracticeHubUrlsFromExam(exam = {}) {
  const htmlFields = [
    exam?.official_details_content,
    exam?.about,
    exam?.exam_details,
    exam?.details,
    exam?.why_matters,
  ];

  const urls = [];
  const add = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    if (!urls.some((u) => u.toLowerCase() === trimmed.toLowerCase())) {
      urls.push(trimmed);
    }
  };

  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi;
  for (const raw of htmlFields) {
    const html = String(raw || "");
    if (!html) continue;
    let match;
    while ((match = hrefRe.exec(html)) !== null) {
      let href = String(match[1] || "").trim();
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue;

      try {
        if (/^https?:\/\//i.test(href)) {
          href = new URL(href).pathname || "";
        }
      } catch {
        // keep raw
      }

      href = href.split("?")[0].split("#")[0].replace(/\/+$/g, "");
      if (!href.startsWith("/")) href = `/${href}`;

      // Practice hub or pricing links for this exam family
      if (/\/practice(?:\/pricing)?$/i.test(href)) {
        add(href.replace(/\/pricing$/i, ""));
        continue;
      }

      const segment = href.replace(/^\//, "");
      if (
        segment &&
        !segment.includes("/") &&
        OFFICIAL_PRACTICE_HUB_SUFFIXES.some((suffix) =>
          segment.toLowerCase().endsWith(suffix)
        )
      ) {
        add(`/${segment}/practice`);
      }
    }
  }

  return urls;
}

function buildPracticeUrlFromExam(practiceExam, fallbackExamCode = "") {
  const slug = pick(practiceExam, "slug") || "";
  const title = pick(practiceExam, "title", "name") || "";
  const code =
    pick(practiceExam, "code", "exam_code", "examCode") || fallbackExamCode || "";

  return (
    getExamPracticePath({
      slug,
      title,
      code,
    }) || (slug ? `/${slug}/practice` : "")
  );
}

function normalizeCompare(value = "") {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
}

function titleTokenSet(value = "") {
  return new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

function scorePracticeExamMatch(officialExam, candidateExam, coreBase = "") {
  if (!candidateExam || !hasPracticeHubContent(candidateExam)) return -1;

  let score = 0;
  const candidateSlug = normalizeCompare(pick(candidateExam, "slug") || "");
  const officialSlug = normalizeCompare(
    pick(officialExam, "slug") || ""
  );

  if (coreBase && isSiblingPracticeSlug(candidateSlug, coreBase)) {
    score += 1000;
  }

  const officialCode = normalizeCompare(
    pick(officialExam, "code", "exam_code") ||
      officialExam?.official_details_stat_exam_code ||
      ""
  );
  const candidateCode = normalizeCompare(
    pick(candidateExam, "code", "exam_code") || ""
  );
  if (officialCode && candidateCode && officialCode === candidateCode) {
    score += 500;
  }

  const officialProvider = normalizeCompare(
    pick(officialExam, "provider_slug", "providerSlug", "provider") || ""
  );
  const candidateProvider = normalizeCompare(
    pick(candidateExam, "provider_slug", "providerSlug", "provider") || ""
  );
  if (officialProvider && candidateProvider && officialProvider === candidateProvider) {
    score += 200;
  }

  const officialTokens = titleTokenSet(
    pick(officialExam, "title", "name", "exam_name") ||
      officialExam?.official_details_page_title ||
      ""
  );
  const candidateTokens = titleTokenSet(
    pick(candidateExam, "title", "name", "exam_name") || ""
  );
  let overlap = 0;
  for (const token of officialTokens) {
    if (candidateTokens.has(token)) overlap += 1;
  }
  score += overlap * 20;

  // Prefer dedicated practice hubs over landing-only records.
  const practiceCount = Array.isArray(candidateExam?.practice_tests_list)
    ? candidateExam.practice_tests_list.length
    : Array.isArray(candidateExam?.practice_tests)
      ? candidateExam.practice_tests.length
      : 0;
  score += Math.min(practiceCount, 10) * 5;

  // Never pick the official-details slug itself as the practice destination.
  if (
    candidateSlug &&
    officialSlug &&
    candidateSlug === officialSlug &&
    (officialSlug.endsWith("-info") ||
      officialSlug.endsWith("-exam-info") ||
      officialSlug.endsWith("-certification-information"))
  ) {
    return -1;
  }

  return score;
}

/**
 * Resolve the practice exam linked to this official-details page, then return
 * that exam's practice-hub URL — same destination as exam-details
 * "Start Practicing tests" (never another exam, never invent unverified URLs).
 */
async function resolveOfficialPracticeUrl(exam, normalizedExamCode) {
  const coreBase = stripToPracticeBaseSlug(
    pick(exam, "slug") || normalizedExamCode || ""
  );

  const verifiedPracticeFromSlug = async (slugCandidate) => {
    const slug = String(slugCandidate || "")
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .replace(/\/practice(?:\/pricing)?$/i, "");
    if (!slug) return "";

    const fetched = await fetchExamByExactSlug(slug);
    if (!fetched || !hasPracticeHubContent(fetched)) return "";

    // Must be same family: sibling slug OR same exam code. Provider-only is not enough.
    const score = scorePracticeExamMatch(exam, fetched, coreBase);
    const officialCode = normalizeCompare(
      pick(exam, "code", "exam_code") ||
        exam?.official_details_stat_exam_code ||
        ""
    );
    const fetchedCode = normalizeCompare(pick(fetched, "code", "exam_code") || "");
    const codeMatch = Boolean(officialCode && fetchedCode && officialCode === fetchedCode);
    const siblingMatch = Boolean(
      coreBase && isSiblingPracticeSlug(normalizeCompare(fetched.slug || ""), coreBase)
    );

    if (!siblingMatch && !codeMatch && score < 1000) {
      return "";
    }

    return buildPracticeUrlFromExam(fetched, normalizedExamCode);
  };

  // 1) Backend-verified linked practice slug (authoritative).
  const linkedPracticeSlug = pick(exam, "linked_practice_slug") || "";
  if (linkedPracticeSlug) {
    const linkedPractice = await verifiedPracticeFromSlug(linkedPracticeSlug);
    if (linkedPractice) return linkedPractice;
    // Trust backend slug when it is clearly a practice-hub slug.
    if (
      OFFICIAL_PRACTICE_HUB_SUFFIXES.some((suffix) =>
        String(linkedPracticeSlug).toLowerCase().endsWith(suffix)
      )
    ) {
      return `/${String(linkedPracticeSlug).replace(/^\/+|\/+$/g, "")}/practice`;
    }
  }

  // 2) Content links → verify exact practice exam, then use practice hub URL.
  const contentPracticeUrls = extractPracticeHubUrlsFromExam(exam);
  for (const practicePath of contentPracticeUrls) {
    const practiceUrl = await verifiedPracticeFromSlug(practicePath);
    if (practiceUrl) return practiceUrl;

    // Same-family content path without needing API when slug is an exact sibling.
    const slug = String(practicePath || "")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\/practice(?:\/pricing)?$/i, "");
    if (coreBase && isSiblingPracticeSlug(slug, coreBase)) {
      return `/${slug}/practice`;
    }
  }

  // 3) Current course is itself a practice hub.
  if (hasPracticeHubContent(exam)) {
    const selfPractice = buildPracticeUrlFromExam(exam, normalizedExamCode);
    if (selfPractice) return selfPractice;
  }

  const preferredPracticeSlugs = [];
  const addPreferred = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    if (
      !preferredPracticeSlugs.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      preferredPracticeSlugs.push(trimmed);
    }
  };

  if (coreBase) {
    for (const suffix of OFFICIAL_PRACTICE_HUB_SUFFIXES) {
      addPreferred(`${coreBase}${suffix}`);
    }
    addPreferred(coreBase);
  }
  addPreferred(resolveOfficialDetailsPracticeSlug(exam, normalizedExamCode));
  deriveOfficialPracticeExamCandidates(exam, normalizedExamCode).forEach(addPreferred);

  // 4) Probe sibling candidates and pick best VERIFIED match only.
  const settled = await Promise.all(
    preferredPracticeSlugs.map(async (candidate, index) => {
      const practiceUrl = await verifiedPracticeFromSlug(candidate);
      if (!practiceUrl) return null;
      const fetched = await fetchExamByExactSlug(candidate);
      const score = fetched ? scorePracticeExamMatch(exam, fetched, coreBase) : 0;
      return {
        score: score * 1000 - index,
        practiceUrl,
      };
    })
  );

  const best = settled
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)[0];

  if (best?.practiceUrl) {
    return best.practiceUrl;
  }

  // 5) Do NOT invent unverified URLs (middleware fuzzy-match can open another exam).
  return "";
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

  const practiceUrl = buildPracticeUrlFromExam(
    {
      slug: resolveOfficialDetailsPracticeSlug(exam, normalizedExamCode),
      title,
      code,
    },
    normalizedExamCode
  );
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
    examData,
  } = buildOfficialExamPageModel(exam, normalizedExamCode);
  // "Start Practicing Tests" button is only shown when we have at least one
  // meaningful stat row. Avoid expensive practice-hub probing on pages where
  // the button isn't rendered. Popular exams can load from cache in parallel.
  const [resolvedPracticeUrl, popularExamsCourses] = await Promise.all([
    statRows.length > 0
      ? resolveOfficialPracticeUrl(exam, normalizedExamCode)
      : Promise.resolve(""),
    fetchPopularExamsCourses({ limit: 8 }),
  ]);
  // Exact same destination as exam-details "Start Practicing tests":
  // /[exam-slug]/practice (never /practice/pricing).
  const practiceUrl = String(resolvedPracticeUrl || "")
    .trim()
    .replace(/\/practice\/pricing\/?$/i, "/practice");
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
                <StartTestButton
                  url={practiceUrl}
                  label="Start Practicing Tests"
                  className="bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg px-8"
                />
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
