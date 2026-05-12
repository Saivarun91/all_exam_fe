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

  return decoded;
}
