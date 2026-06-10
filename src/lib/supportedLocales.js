import { toTranslateLanguageCode } from "@/lib/translateLanguageCode";

/** Preserve admin/API codes like zh-cn, pt-br (do not strip the region). */
export function normalizeLanguageCode(code) {
  return (code || "en").toLowerCase().trim().replace(/_/g, "-");
}

export function languageCodesMatch(a, b) {
  const left = normalizeLanguageCode(a);
  const right = normalizeLanguageCode(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.startsWith(`${right}-`) || right.startsWith(`${left}-`)) return true;
  return toTranslateLanguageCode(left) === toTranslateLanguageCode(right);
}

export function isLanguageInList(code, languageCodes = []) {
  return (languageCodes || []).some((item) => languageCodesMatch(code, item));
}
