import {
  buildOfficialDetailsPublicUrl,
  getOfficialDetailsPath,
} from "@/app/exams/[provider]/[examCode]/examInfoUtils";
import { hasOfficialDetailsData } from "@/components/exam/OfficialExamDetailsView";
import {
  getExamLandingPath,
  getExamPracticePath,
  stripExamPublicPathSuffix,
  trimPublicPathSegment,
} from "@/utils/practiceTestRouting";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function toExamSlug(value = "") {
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

export async function fetchExamByIdentifier(identifier) {
  const raw = trimPublicPathSegment(identifier);
  if (!raw) return null;

  const candidates = [raw];
  const normalized = toExamSlug(raw);
  if (normalized && normalized !== raw && !candidates.includes(normalized)) {
    candidates.push(normalized);
  }

  const stripped = stripExamPublicPathSuffix(raw);
  if (stripped && stripped !== raw && !candidates.includes(stripped)) {
    candidates.push(stripped);
  }

  const parts = (stripped || normalized || raw).split("-").filter(Boolean);
  for (let take = 1; take <= Math.min(7, parts.length); take += 1) {
    const candidate = parts.slice(parts.length - take).join("-");
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
  }

  for (const candidate of candidates) {
    try {
      const res = await fetch(
        `${API_BASE}/api/courses/exams/${encodeURIComponent(candidate)}/`,
        { cache: "no-store" }
      );
      if (!res.ok) continue;
      const exam = await res.json();
      if (exam && typeof exam === "object") return exam;
    } catch {
      // try next candidate
    }
  }

  return null;
}

function pickFromExam(exam, ...keys) {
  for (const k of keys) {
    const val = exam?.[k];
    if (val !== undefined && val !== null && val !== "" && val !== "null") {
      return val;
    }
  }
  return null;
}

function pickArrayFromExam(exam, ...keys) {
  for (const k of keys) {
    if (Array.isArray(exam?.[k]) && exam[k].length) return exam[k];
  }
  return [];
}

function getTotalDuration(obj) {
  if (!obj || typeof obj !== "object") return 0;

  let total = 0;
  for (const key in obj) {
    const value = obj[key];
    if (key.toLowerCase().includes("duration")) {
      if (typeof value === "number") {
        total += value;
      } else if (typeof value === "string") {
        const match = value.match(/\d+/g);
        if (match) total += match.reduce((sum, n) => sum + Number(n), 0);
      }
    }
    if (typeof value === "object" && value !== null) {
      total += getTotalDuration(value);
    }
  }
  return total;
}

export function buildExamDetailPayload(exam, { provider = "", examCode = "" } = {}) {
  const pick = (...keys) => pickFromExam(exam, ...keys);
  const pickArray = (...keys) => pickArrayFromExam(exam, ...keys);

  const practiceTestsList = pickArray(
    "practice_tests_list",
    "practice_tests",
    "tests",
    "exam_tests"
  );

  const totalQuestions = practiceTestsList.length
    ? practiceTestsList.reduce(
        (sum, t) => sum + Number(t.questions || t.total_questions || 0),
        0
      )
    : Number(
        pick("total_questions", "questions", "question_count") || 0
      );

  let totalPracticeMinutes = 0;
  if (practiceTestsList.length) {
    for (const test of practiceTestsList) {
      totalPracticeMinutes += getTotalDuration(test);
    }
  }

  const adminDurationRaw = pick("duration");
  const adminDurationTrim =
    adminDurationRaw != null && String(adminDurationRaw).trim() !== ""
      ? String(adminDurationRaw).trim()
      : null;
  const computedMinutesLabel =
    totalPracticeMinutes > 0 ? `${totalPracticeMinutes} minutes` : null;
  const durationMerged = adminDurationTrim || computedMinutesLabel || null;

  const currencyRaw = pick("currency");
  const currency =
    currencyRaw != null && String(currencyRaw).trim() !== ""
      ? String(currencyRaw).trim()
      : "INR";
  const offerNum = Number(pick("offer_price"));
  const actualNum = Number(pick("actual_price"));
  let examCostDisplay = null;
  if (Number.isFinite(offerNum) && offerNum > 0) {
    examCostDisplay = `${currency} ${offerNum.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  } else if (Number.isFinite(actualNum) && actualNum > 0) {
    examCostDisplay = `${currency} ${actualNum.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  }

  const rawTopics = exam.topics || [];
  const topics = rawTopics.map((t) => {
    const name = t.name || t.title || t.topic || "";
    let rawPercentage = t.weight ?? t.percentage ?? t.percent ?? t.value ?? "0";
    rawPercentage = rawPercentage.toString().trim();

    let startPercentage = 0;
    let endPercentage = 0;
    const numbers = rawPercentage.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      startPercentage = Number(numbers[0]);
      endPercentage = numbers.length > 1 ? Number(numbers[1]) : startPercentage;
    }

    startPercentage = Math.min(Math.max(startPercentage, 0), 100);
    endPercentage = Math.min(Math.max(endPercentage, 0), 100);

    const explanationRaw = t.explanation ?? t.description ?? "";
    const explanation =
      typeof explanationRaw === "string" ? explanationRaw.trim() : "";

    return {
      name,
      rawPercentage: rawPercentage + (rawPercentage.includes("%") ? "" : "%"),
      startPercentage,
      endPercentage,
      explanation,
    };
  });

  const aboutContent = pick("about", "description") || "";
  const examDetailsContent = pick("exam_details", "details") || aboutContent;

  const passingPick = pick("passing_score", "pass_score", "cutoff", "pass_mark");
  const passingScoreResolved =
    passingPick !== null &&
    passingPick !== undefined &&
    String(passingPick).trim() !== ""
      ? String(passingPick).trim()
      : "Not specified";

  const slug = exam?.slug != null ? String(exam.slug).trim() : null;
  const providerSlug = pick("provider_slug") || provider || "";
  const resolvedExamCode = examCode || slug || pick("code", "exam_code") || "";
  const lastUpdated = pick("badge") || null;

  const examData = {
    ...exam,
    provider: pick("provider") || provider || "",
    providerSlug,
    slug,
    lastUpdated,
    landingUrl:
      getExamLandingPath({
        slug,
        title: pick("title", "name") || "",
        code: pick("code", "exam_code") || resolvedExamCode,
      }) ||
      (slug ? `/${slug}` : `/${resolvedExamCode}`),
    practiceUrl:
      getExamPracticePath({
        slug,
        title: pick("title", "name") || "",
        code: pick("code", "exam_code") || resolvedExamCode,
      }) || (slug ? `/${slug}/practice` : `/${resolvedExamCode}/practice`),
    hasOfficialDetails: hasOfficialDetailsData(exam),
    officialDetailsUrl:
      buildOfficialDetailsPublicUrl(exam) ||
      getOfficialDetailsPath(
        slug || resolvedExamCode,
        pick("official_details_url_slug") || "official-details"
      ),
    code: pick("code", "exam_code") || resolvedExamCode,
    title: pick("title", "name") || "",
    page_heading: pick("page_heading") || null,
    duration: durationMerged,
    examCostDisplay,
    passingScore: passingScoreResolved,
    difficulty: pick("difficulty", "level", "exam_level") || "Beginner",
    practiceTests: practiceTestsList.length,
    totalQuestions,
    passRate: Number(pick("pass_rate", "passRate")) || null,
    rating: Number(pick("rating")) || null,
    about: aboutContent,
    about_heading: pick("about_heading") || null,
    exam_details_heading: pick("exam_details_heading") || null,
    exam_details: examDetailsContent,
    testDescription: pick("test_description") || "",
    why_matters_heading: pick("why_matters_heading") || null,
    whats_included_heading: pick("whats_included_heading") || null,
    topics_heading: pick("topics_heading") || null,
    practice_tests_heading: pick("practice_tests_heading") || null,
    testimonials_heading: pick("testimonials_heading") || null,
    faqs_heading: pick("faqs_heading") || null,
    whyMatters: pick("why_matters", "whyMatters") || "",
    practiceTestsList,
    category: pickArray("category", "categories"),
    topics,
    whatsIncluded: pickArray("whats_included"),
    testimonials: pickArray("testimonials"),
    faqs: pickArray("faqs"),
  };

  return {
    examData,
    provider: providerSlug,
    examCode: resolvedExamCode,
  };
}
