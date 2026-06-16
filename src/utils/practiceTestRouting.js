/**
 * Build the `[testId]` path segment for /exams/.../practice/[testId].
 * Never use values that look like MongoEngine GridFS / repr strings.
 */
export function pickPracticeTestPathSegment(test, index = 0) {
  if (test == null || typeof test !== "object") {
    return String((Number(index) || 0) + 1);
  }

  const toxic = (s) =>
    typeof s === "string" &&
    (s.includes("GridFS") || s.includes("gridfs") || s.includes("ObjectId("));

  const slugRaw = test.slug != null ? String(test.slug).trim() : "";
  if (slugRaw && !toxic(slugRaw)) {
    return slugRaw.replace(/-[a-f0-9]{8}$/i, "");
  }

  const rawId =
    test.id != null
      ? String(test.id).trim()
      : test._id != null
        ? String(test._id).trim()
        : "";
  if (rawId && /^[a-fA-F0-9]{24}$/.test(rawId) && !toxic(rawId)) {
    return rawId;
  }

  return String((Number(index) || 0) + 1);
}

function slugifySegment(value) {
  if (value == null) return "";
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Trim admin-entered slug for URLs (no case/spacing transforms). */
export function getPublicPageUrlFromSlug(slug = "") {
  const s = trimPublicPathSegment(slug);
  return s ? `/${s}` : "/your-page-url-slug";
}

/** Backend requires code; use slug when admin leaves code empty. */
export function resolveCourseCodeForSave(code = "", slug = "", existingCode = "") {
  const trimmed = trimPublicPathSegment(code);
  if (trimmed) return trimmed;
  const existing = trimPublicPathSegment(existingCode);
  if (existing) return existing;
  return trimPublicPathSegment(slug) || "exam";
}

export function pathsMatchPublicUrl(pathA = "", pathB = "") {
  const normalize = (p) => {
    try {
      return decodeURIComponent(String(p || "").trim());
    } catch {
      return String(p || "").trim();
    }
  };
  return normalize(pathA) === normalize(pathB);
}

export function trimPublicPathSegment(value = "") {
  let s = String(value ?? "").trim();
  if (!s) return "";
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded */
  }
  return s.replace(/^\/+|\/+$/g, "");
}

export function getStoredExamSlug(exam = {}) {
  if (exam == null || typeof exam !== "object") return "";
  return trimPublicPathSegment(exam.slug || exam.examSlug || "");
}

/** Normalize legacy/generated public page slug (lowercase, hyphen rules). */
export function normalizePublicPageSlug(value = "") {
  let s = String(value ?? "").trim();
  if (!s) return "";
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded */
  }
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const FREE_PRACTICE_TEST_LANDING_SUFFIX = "-free-practice-test";
const EXAM_INFO_SUFFIX = "-exam-info";

/**
 * Ordered API lookup keys for a public path segment (longest first, then suffix probes).
 */
export function probeExamLookupCandidates(pathSegment) {
  const raw = trimPublicPathSegment(pathSegment);
  if (!raw) return [];

  const candidates = [raw];
  const normalized = slugifySegment(raw);
  if (normalized && normalized !== raw && !candidates.includes(normalized)) {
    candidates.push(normalized);
  }

  const parts = (normalized || raw).split("-").filter(Boolean);
  for (let take = 1; take <= Math.min(7, parts.length); take += 1) {
    const candidate = parts.slice(parts.length - take).join("-");
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
  }
  return candidates;
}

/**
 * Public URL base: [exam-name]-[exam-code] (exam code included when different from name).
 */
export function resolveExamPublicPathBase(exam = {}) {
  if (typeof exam === "string") {
    const trimmed = trimPublicPathSegment(exam);
    if (trimmed) return trimmed;
    return normalizePublicPageSlug(exam) || slugifySegment(exam);
  }

  const storedSlug = getStoredExamSlug(exam);
  if (storedSlug) return storedSlug;

  const name = slugifySegment(exam.title || exam.name || exam.examName || "");
  const code = slugifySegment(
    exam.code || exam.exam_code || exam.examCode || ""
  );

  if (name && code) {
    if (name === code) return name;
    return `${name}-${code}`;
  }

  return name || code || "exam";
}

/** @deprecated alias */
export function resolveExamBaseSlug(params) {
  return resolveExamPublicPathBase(params);
}

/**
 * Build SEO URL segment: [exam-name]-[exam-code]-free-practice-test-[number]
 */
export function buildPracticeTestSeoSegment({
  examName,
  examCode,
  examSlug,
  test,
  index = 0,
}) {
  const base = resolveExamPublicPathBase({
    title: examName,
    name: examName,
    code: examCode,
    slug: examSlug,
  });
  const fallbackNumber = (Number(index) || 0) + 1;

  const testNumberSources = [
    test?.test_number,
    test?.number,
    test?.order,
    test?.position,
  ];
  let testNumber = fallbackNumber;
  for (const source of testNumberSources) {
    const parsed = parseInt(source, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      testNumber = parsed;
      break;
    }
  }

  return `${base}-free-practice-test-${testNumber}`;
}

/** Public practice hub path: /[exam-name]-[exam-code]/practice */
export function getExamPracticePath(examOrSlug) {
  const base = resolveExamPublicPathBase(examOrSlug);
  return base ? `/${base}/practice` : "";
}

/** Public pricing page path: /[exam-name]-[exam-code]/practice/pricing */
export function getExamPricingPath(examOrSlug) {
  const practicePath = getExamPracticePath(examOrSlug);
  return practicePath ? `${practicePath}/pricing` : "";
}

/** Public exam landing page — uses admin slug exactly when stored. */
export function getExamLandingPath(examOrSlug) {
  if (typeof examOrSlug === "object" && examOrSlug !== null) {
    const stored = getStoredExamSlug(examOrSlug);
    if (stored) return `/${stored}`;
  }

  if (typeof examOrSlug === "string") {
    const trimmed = trimPublicPathSegment(examOrSlug);
    if (trimmed) return `/${trimmed}`;
  }

  const base = resolveExamPublicPathBase(examOrSlug);
  return base ? `/${base}${FREE_PRACTICE_TEST_LANDING_SUFFIX}` : "";
}

/** Strip pretty URL suffixes to recover the exam lookup key (legacy URLs). */
export function stripExamPublicPathSuffix(pathSegment = "") {
  const raw = trimPublicPathSegment(pathSegment);
  if (!raw) return "";

  let s = raw;
  s = s.replace(/-free-practice-test-\d+$/i, "");
  if (s.endsWith(FREE_PRACTICE_TEST_LANDING_SUFFIX)) {
    s = s.slice(0, -FREE_PRACTICE_TEST_LANDING_SUFFIX.length);
  }
  if (s.endsWith(EXAM_INFO_SUFFIX)) {
    s = s.slice(0, -EXAM_INFO_SUFFIX.length);
  }
  return s;
}

/**
 * Recover a usable test key when the URL segment is corrupted (e.g. old GridFS repr in path).
 */
export function normalizePracticeTestUrlSegment(rawTestId, exam) {
  const decoded = decodeURIComponent(String(rawTestId ?? "").trim());
  if (!decoded) return decoded;

  if (decoded.includes("GridFS") || decoded.includes("gridfs")) {
    const tests = exam?.practice_tests_list || exam?.practice_tests || [];
    const t0 = tests[0];
    if (t0) {
      const seg = pickPracticeTestPathSegment(t0, 0);
      if (seg && !seg.includes("GridFS")) return seg;
    }
    return "";
  }

  const seoMatch = decoded.match(/-free-practice-test-(\d+)$/i);
  if (seoMatch) {
    const tests = exam?.practice_tests_list || exam?.practice_tests || [];
    const requestedIndex = Math.max(0, parseInt(seoMatch[1], 10) - 1);
    if (tests[requestedIndex]) {
      return pickPracticeTestPathSegment(tests[requestedIndex], requestedIndex);
    }
    return String(requestedIndex + 1);
  }

  return decoded;
}
