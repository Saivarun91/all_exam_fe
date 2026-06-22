import { fetchExamByIdentifier } from "@/lib/loadExamDetailPage";
import { probeExamLookupCandidates } from "@/utils/practiceTestRouting";
import { normalizePracticeTestUrlSegment } from "@/utils/practiceTestRouting";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function fetchExamNoStore(key) {
  const normalized = String(key || "").trim();
  if (!normalized) return null;
  try {
    const res = await fetch(
      `${API_BASE}/api/courses/exams/${encodeURIComponent(normalized)}/`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const exam = await res.json();
    return exam && typeof exam === "object" ? exam : null;
  } catch {
    return null;
  }
}

export async function loadPracticeTestPageData({ exam, testId }) {
  if (!exam?.id) return null;

  const rawSegment = String(testId ?? "").trim();
  let resolvedTestId = normalizePracticeTestUrlSegment(rawSegment, exam);
  if (!resolvedTestId) resolvedTestId = rawSegment;

  if (
    !resolvedTestId ||
    resolvedTestId.includes("GridFS") ||
    resolvedTestId.includes("gridfs")
  ) {
    return null;
  }

  let questions = [];
  let test = null;

  try {
    const questionsRes = await fetch(
      `${API_BASE}/api/questions/test/${exam.id}/${encodeURIComponent(resolvedTestId)}/`,
      { cache: "no-store" }
    );

    if (questionsRes.ok) {
      const data = await questionsRes.json();
      questions = data.questions || [];
      test = data.test || null;
    }
  } catch {
    // Return exam + empty questions; TestPlayerClient shows a friendly empty state.
  }

  return { exam, questions, test, resolvedTestId };
}

/** Resolve exam from legacy /exams/:provider/:examCode route params. */
export async function resolveExamForPracticeRoute(provider, examCode) {
  const providerKey = String(provider || "").trim();
  const examKey = String(examCode || "").trim();
  if (!examKey) return null;

  const tried = new Set();
  const keys = [
    examKey,
    providerKey && examKey ? `${providerKey}-${examKey}` : "",
  ];
  probeExamLookupCandidates(examKey).forEach((key) => keys.push(key));
  if (providerKey) {
    probeExamLookupCandidates(`${providerKey}-${examKey}`).forEach((key) =>
      keys.push(key)
    );
  }

  for (const key of keys) {
    const normalized = String(key || "").trim();
    if (!normalized || tried.has(normalized)) continue;
    tried.add(normalized);
    const exam =
      (await fetchExamByIdentifier(normalized)) ||
      (await fetchExamNoStore(normalized));
    if (exam) return exam;
  }

  return null;
}
