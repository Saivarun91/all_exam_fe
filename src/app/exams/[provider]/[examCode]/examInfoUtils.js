function cellPlain(inner) {
  return inner
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRowMapFromHtml(html) {
  const map = {};
  if (!html || typeof html !== "string") return map;

  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRe.exec(html)) !== null) {
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    const cells = [];
    let cMatch;
    while ((cMatch = cellRe.exec(trMatch[1])) !== null) {
      const t = cellPlain(cMatch[1]);
      if (t) cells.push(t);
    }
    if (cells.length === 4) {
      const pairs = [
        [cells[0], cells[1]],
        [cells[2], cells[3]],
      ];
      for (const [lb, val] of pairs) {
        const label = lb.replace(/:\s*$/i, "").trim();
        const value = String(val).trim();
        if (!label || !value) continue;
        const key = label.toLowerCase().replace(/\s+/g, " ");
        if (!Object.prototype.hasOwnProperty.call(map, key)) map[key] = value;
      }
      continue;
    }
    if (cells.length < 2) continue;
    const label = cells[0].replace(/:\s*$/i, "").trim();
    const value = cells.slice(1).join(" ").trim();
    if (!label || !value) continue;
    const key = label.toLowerCase().replace(/\s+/g, " ");
    if (!Object.prototype.hasOwnProperty.call(map, key)) map[key] = value;
  }
  return map;
}

function pickRowValue(map, candidatesExactThenContains) {
  const keys = Object.keys(map);
  for (const phrase of candidatesExactThenContains) {
    const p = phrase.toLowerCase().replace(/\s+/g, " ");
    const hit = keys.find((k) => k === p);
    if (hit) return map[hit].trim();
  }
  for (const phrase of candidatesExactThenContains) {
    const p = phrase.toLowerCase().replace(/\s+/g, " ");
    const hit = keys.find((k) => k.includes(p));
    if (hit) return map[hit].trim();
  }
  return null;
}

export function extractExamInfo(html) {
  if (!html || typeof html !== "string") return {};

  const rowMap = extractRowMapFromHtml(html);

  const fromRows = {
    duration: pickRowValue(rowMap, [
      "duration",
      "exam duration",
      "test duration",
      "time allowed",
      "exam time",
    ]),
    totalQuestions: pickRowValue(rowMap, [
      "number of questions",
      "no. of questions",
      "no of questions",
      "total questions",
      "question count",
      "questions",
    ]),
    passingScore: pickRowValue(rowMap, [
      "passing score",
      "pass score",
      "pass mark",
      "passing marks",
      "cutoff",
      "cut-off",
      "cut off",
    ]),
    examCostDisplay: pickRowValue(rowMap, [
      "cost",
      "price",
      "exam fee",
      "fee",
    ]),
    provider: pickRowValue(rowMap, [
      "certification body",
      "certifying body",
      "provider",
      "exam provider",
    ]),
    examCode: pickRowValue(rowMap, ["exam code", "code", "exam id"]),
  };

  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const NEXT_LABEL_STOP =
    "(?=\\s*(?:Number of Questions|Certification Body|Passing Score|Cost|Price|Provider|Exam Code|Duration)\\b|$)";

  const getValueFlat = (labelAlternation) => {
    const re = new RegExp(
      `(?:${labelAlternation})\\s*:?\\s*(.*?)${NEXT_LABEL_STOP}`,
      "is"
    );
    const match = text.match(re);
    return match ? match[1].trim() : null;
  };

  const fromFlat = {
    duration: getValueFlat("Duration"),
    totalQuestions: getValueFlat("Number of Questions|Questions"),
    passingScore: getValueFlat("Passing Score"),
    examCostDisplay: getValueFlat("Cost|Price"),
    provider: getValueFlat("Certification Body|Provider"),
    examCode: getValueFlat("Exam Code"),
  };

  const merge = (a, b) =>
    a && String(a).trim()
      ? String(a).trim()
      : b && String(b).trim()
        ? String(b).trim()
        : null;

  return {
    duration: merge(fromRows.duration, fromFlat.duration),
    totalQuestions: merge(fromRows.totalQuestions, fromFlat.totalQuestions),
    passingScore: merge(fromRows.passingScore, fromFlat.passingScore),
    examCostDisplay: merge(fromRows.examCostDisplay, fromFlat.examCostDisplay),
    provider: merge(fromRows.provider, fromFlat.provider),
    examCode: merge(fromRows.examCode, fromFlat.examCode),
  };
}

export function preferDetailsThenApi(fromHtml, fromApi) {
  const h =
    fromHtml != null && String(fromHtml).trim() !== ""
      ? String(fromHtml).trim()
      : null;
  const a =
    fromApi != null && String(fromApi).trim() !== ""
      ? String(fromApi).trim()
      : null;
  return h || a || null;
}

export function getExamDetailsHtml(examData) {
  return (
    examData?.exam_details ||
    examData?.details ||
    examData?.testDescription ||
    ""
  );
}

export function trimOfficialDetailsPathSegment(value = "") {
  const s = String(value ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s || "official-details";
}

export function normalizeOfficialDetailsUrlSlug(value = "") {
  let s = String(value ?? "").trim();
  if (!s) return "official-details";
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded */
  }
  s = s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "official-details";
}

import {
  resolveExamPublicPathBase,
  getStoredExamSlug,
  trimPublicPathSegment,
  getDisplayExamCode,
} from "@/utils/practiceTestRouting";

const EXAM_INFO_SUFFIX = "-exam-info";

const OFFICIAL_INFO_SLUG_SUFFIXES = [
  "-info",
  "-exam-info",
  "-certification-information",
];

/** Strip practice/landing suffixes to recover shared exam base slug. */
const PRACTICE_HUB_STRIP_SUFFIXES = [
  "-certification-information",
  "-exam-info",
  "-certification",
  "-information",
  "-info",
  "-free-practice-exams",
  "-free-practice-tests",
  "-free-practice-test",
  "-practice-exams",
  "-practice-tests",
  "-practice-exam",
  "-practice-test",
  "-free-test",
];

function stripToOfficialDetailsBaseSlug(slug = "") {
  let base = String(slug || "").trim().toLowerCase();
  if (!base) return "";

  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of PRACTICE_HUB_STRIP_SUFFIXES) {
      if (base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length).replace(/-+$/g, "");
        changed = true;
        break;
      }
    }
  }

  return base;
}

/** Derive sibling official-details slug candidates from a practice/landing slug. */
export function deriveOfficialInfoSlugCandidates(slug = "") {
  const stored = trimPublicPathSegment(slug);
  if (!stored) return [];

  const lower = stored.toLowerCase();
  if (OFFICIAL_INFO_SLUG_SUFFIXES.some((suffix) => lower.endsWith(suffix))) {
    return [stored];
  }

  const base = stripToOfficialDetailsBaseSlug(stored);
  if (!base) return [];

  return OFFICIAL_INFO_SLUG_SUFFIXES.map((suffix) => `${base}${suffix}`);
}

/** Derive sibling official-details slug from a practice/landing slug (no exam code needed). */
export function deriveOfficialInfoSlugFromExamSlug(slug = "") {
  const candidates = deriveOfficialInfoSlugCandidates(slug);
  return candidates[0] || "";
}

/** Pull official-details page candidates from exam HTML content links. */
export function extractOfficialDetailsHrefCandidates(exam = {}) {
  const htmlFields = [
    exam?.about,
    exam?.exam_details,
    exam?.details,
    exam?.why_matters,
    exam?.short_description,
    exam?.test_description,
  ];

  const candidates = [];
  const add = (value) => {
    const trimmed = trimPublicPathSegment(value);
    if (!trimmed) return;
    if (trimmed.toLowerCase() === "official-details") return;
    if (!candidates.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      candidates.push(trimmed);
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
          const url = new URL(href);
          href = url.pathname || "";
        }
      } catch {
        // keep raw href
      }

      href = href.split("?")[0].split("#")[0];
      const parts = href.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
      if (parts.length !== 1) continue;

      const segment = parts[0];
      const lower = segment.toLowerCase();
      if (
        OFFICIAL_INFO_SLUG_SUFFIXES.some((suffix) => lower.endsWith(suffix)) ||
        lower.includes("exam-info") ||
        lower.includes("official")
      ) {
        add(segment);
      }
    }
  }

  return candidates;
}

export function isOfficialDetailsSlug(slug = "") {
  const normalized = trimPublicPathSegment(slug).toLowerCase();
  if (!normalized) return false;
  return OFFICIAL_INFO_SLUG_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

export function getOfficialDetailsPath(examSlug, urlSlug) {
  const base = String(examSlug || "").trim().replace(/^\/+|\/+$/g, "");
  const segment = trimOfficialDetailsPathSegment(urlSlug);
  return base ? `/${base}/${segment}` : `/${segment}`;
}

/** Same public URL as exam pages / admin official-details manager. */
export function buildOfficialDetailsPublicUrl(exam = {}) {
  const officialPublicSlug = trimPublicPathSegment(
    exam.official_details_url_slug || ""
  );
  if (officialPublicSlug && officialPublicSlug.toLowerCase() !== "official-details") {
    return `/${officialPublicSlug}`;
  }

  const contentCandidates = extractOfficialDetailsHrefCandidates(exam);
  if (contentCandidates[0]) {
    return `/${contentCandidates[0]}`;
  }

  const slug = getStoredExamSlug(exam) || trimPublicPathSegment(exam.slug || "");
  const derivedInfoSlug = deriveOfficialInfoSlugFromExamSlug(slug);
  if (derivedInfoSlug) {
    return `/${derivedInfoSlug}`;
  }

  const pathFromTitle = getOfficialExamInfoPath(
    exam.title || exam.name || exam.examName || exam.exam_name || "",
    getDisplayExamCode(exam)
  );
  if (pathFromTitle && pathFromTitle !== "/exam-info") {
    return pathFromTitle;
  }

  return slug
    ? getOfficialDetailsPath(slug, "official-details")
    : "/official-details";
}

/** Resolve official-details href for exam details sidebar (slug/title first, not URL exam code). */
export function resolveOfficialDetailsLink(exam = {}) {
  return (
    buildOfficialDetailsPublicUrl(exam) ||
    getOfficialExamInfoPathFromExam(exam) ||
    ""
  ).trim();
}

export function isResolvableOfficialDetailsLink(url = "") {
  const path = String(url || "").trim();
  if (!path || path === "/official-details" || path === "/exam-info") return false;

  const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  // Public official pages are single-segment slugs (e.g. /exam-name-info).
  if (segments.length !== 1) return false;

  const slug = segments[0].toLowerCase();
  if (slug === "official-details" || slug === "exam-info") return false;

  return true;
}

/** Public pretty URL: /[exam-name]-[exam-code]-exam-info */
export function getOfficialExamInfoPath(examTitle, examCode) {
  const base = resolveExamPublicPathBase({
    title: examTitle,
    name: examTitle,
    code: examCode,
  });
  return base ? `/${base}-exam-info` : "/exam-info";
}

export function getOfficialExamInfoPathFromExam(exam = {}) {
  const officialPublicSlug = trimPublicPathSegment(
    exam.official_details_url_slug || ""
  );
  if (officialPublicSlug) {
    return `/${officialPublicSlug}`;
  }

  const stored = getStoredExamSlug(exam) || trimPublicPathSegment(exam.slug || "");
  if (stored) {
    const lower = stored.toLowerCase();
    if (
      lower.endsWith(EXAM_INFO_SUFFIX) ||
      OFFICIAL_INFO_SLUG_SUFFIXES.some((suffix) => lower.endsWith(suffix))
    ) {
      return `/${stored}`;
    }

    const derived = deriveOfficialInfoSlugFromExamSlug(stored);
    if (derived) {
      return `/${derived}`;
    }
  }

  return getOfficialExamInfoPath(
    exam.title || exam.name || exam.examName || exam.exam_name || "",
    getDisplayExamCode(exam)
  );
}

export function buildOfficialExamStats(examData, examCode) {
  const extractedFromHtml = extractExamInfo(getExamDetailsHtml(examData));

  return {
    examCode: preferDetailsThenApi(
      extractedFromHtml.examCode,
      examData.code || examCode
    ),
    duration: preferDetailsThenApi(
      extractedFromHtml.duration,
      examData.duration
    ),
    totalQuestions: preferDetailsThenApi(
      extractedFromHtml.totalQuestions,
      examData.totalQuestions > 0 ? String(examData.totalQuestions) : null
    ),
    passingScore: preferDetailsThenApi(
      extractedFromHtml.passingScore,
      examData.passingScore && examData.passingScore !== "Not specified"
        ? examData.passingScore
        : null
    ),
    examCostDisplay: preferDetailsThenApi(
      extractedFromHtml.examCostDisplay,
      examData.examCostDisplay
    ),
    provider: preferDetailsThenApi(
      extractedFromHtml.provider,
      examData.provider
    ),
  };
}

export function formatLastUpdatedLabel(examData) {
  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const format = (d) => {
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month}, ${day} ${year}`;
  };

  // Prefer real timestamps from API (dynamic)
  const ts =
    examData?.updated_at ||
    examData?.updatedAt ||
    examData?.updated ||
    null;

  const parsedTs = parseDate(ts);
  if (parsedTs) return format(parsedTs);

  // If lastUpdated is a real date string, allow it; otherwise ignore generic/static labels.
  const lastUpdatedRaw = examData?.lastUpdated;
  const parsedLast = parseDate(lastUpdatedRaw);
  if (parsedLast) return format(parsedLast);

  const label = String(lastUpdatedRaw || examData?.badge || "").trim();
  const lowered = label.toLowerCase();
  const generic = [
    "recently updated",
    "updated this week",
    "updated",
    "popular",
    "best seller",
    "bestseller",
    "new",
  ];
  if (!label || generic.includes(lowered)) return null;

  // If it contains a year/month/day hint, keep it.
  if (/\d{4}|\d{1,2}\/\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec/i.test(label)) {
    return label;
  }

  return null;
}
