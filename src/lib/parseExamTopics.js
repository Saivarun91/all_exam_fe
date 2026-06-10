/**
 * Normalize exam topic rows from API/admin (name + weight/percentage).
 * Supports values like "20", "20%", "10-20", "11 - 20%".
 */
export function parseExamTopics(rawTopics = []) {
  if (!Array.isArray(rawTopics)) return [];

  return rawTopics
    .map((t) => {
      const name = String(t?.name || t?.title || t?.topic || "").trim();
      if (!name) return null;

      const rawWeight = String(
        t?.weight ??
          t?.percentage ??
          t?.percent ??
          t?.weightage ??
          t?.topic_weightage ??
          t?.weightage_percentage ??
          t?.value ??
          ""
      ).trim();

      const numbers = rawWeight.match(/\d+/g);
      let startPercentage = 0;
      let endPercentage = 0;

      if (numbers?.length) {
        startPercentage = Number(numbers[0]);
        endPercentage = numbers.length > 1 ? Number(numbers[1]) : startPercentage;
      }

      startPercentage = Math.min(Math.max(startPercentage, 0), 100);
      endPercentage = Math.min(Math.max(endPercentage, 0), 100);

      const labelPercentage = formatTopicWeightLabel(
        rawWeight,
        startPercentage,
        endPercentage
      );

      const explanationRaw = t?.explanation ?? t?.description ?? "";
      const explanation =
        typeof explanationRaw === "string" ? explanationRaw.trim() : "";

      return {
        name,
        rawWeight,
        labelPercentage,
        startPercentage,
        endPercentage,
        progressValue: Math.round((startPercentage + endPercentage) / 2),
        explanation,
      };
    })
    .filter(Boolean);
}

function formatTopicWeightLabel(raw, start, end) {
  const trimmed = String(raw || "").trim();
  if (trimmed) {
    if (trimmed.includes("%")) return trimmed;
    if (/\d+\s*-\s*\d+/.test(trimmed)) return `${trimmed}%`;
    return `${trimmed}%`;
  }
  if (start === end) return `${start}%`;
  return `${start}-${end}%`;
}
