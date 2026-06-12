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
} from "@/utils/practiceTestRouting";

const EXAM_INFO_SUFFIX = "-exam-info";

export function getOfficialDetailsPath(examSlug, urlSlug) {
  const base = String(examSlug || "").trim().replace(/^\/+|\/+$/g, "");
  const segment = trimOfficialDetailsPathSegment(urlSlug);
  return base ? `/${base}/${segment}` : `/${segment}`;
}

/** Same public URL as exam pages / admin official-details manager. */
export function buildOfficialDetailsPublicUrl(exam = {}) {
  const slug = getStoredExamSlug(exam) || exam.slug || exam.code || "";
  const officialPublicSlug = trimPublicPathSegment(
    exam.official_details_url_slug || ""
  );
  if (officialPublicSlug) {
    return `/${officialPublicSlug}`;
  }
  return getOfficialDetailsPath(
    slug,
    exam.official_details_url_slug || "official-details"
  );
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
  const stored = getStoredExamSlug(exam);
  return stored ? `/${stored}` : "";
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
