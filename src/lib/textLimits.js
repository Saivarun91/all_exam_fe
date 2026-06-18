export const DESCRIPTION_WORD_LIMIT = 50;

export function countWords(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function clampToWordLimit(text, limit = DESCRIPTION_WORD_LIMIT) {
  const value = String(text ?? "");
  const trimmed = value.trim();
  if (!trimmed) return value;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length <= limit) return value;
  return parts.slice(0, limit).join(" ");
}
