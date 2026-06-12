/** Decode common HTML entities for plain-text display. */
export function decodeHtmlEntities(value = "") {
  if (!value) return "";
  return String(value)
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ");
}

/** Strip HTML tags and decode entities for visible text (headings, labels, etc.). */
export function htmlToPlainText(html = "") {
  if (!html || typeof html !== "string") return "";
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Escape plain text for safe inclusion inside HTML attributes or elements. */
export function escapeHtmlText(str = "") {
  const decoded = decodeHtmlEntities(str);
  return decoded
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
