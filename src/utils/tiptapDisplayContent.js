import { normalizeTiptapImagesForDisplay } from "@/utils/tiptapImageUtils";

const INLINE_TAGS = "strong|b|em|i|u|mark|a|span|code|sub|sup";
const WORD_BOUNDARY_TAGS = "strong|b|em|i|u|mark|span";

const ATTR_PLACEHOLDER_PREFIX = "___TIPTAP_ATTR_";
const ATTR_PLACEHOLDER_SUFFIX = "___";

/** Temporarily replace HTML attribute values so text-normalization never corrupts URLs. */
function withProtectedAttributes(html, transform) {
  const placeholders = [];

  const protectedHtml = html.replace(
    /(\s[\w:-]+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/gi,
    (match) => {
      const token = `${ATTR_PLACEHOLDER_PREFIX}${placeholders.length}${ATTR_PLACEHOLDER_SUFFIX}`;
      placeholders.push(match);
      return token;
    }
  );

  let result = transform(protectedHtml);

  placeholders.forEach((original, index) => {
    const token = `${ATTR_PLACEHOLDER_PREFIX}${index}${ATTR_PLACEHOLDER_SUFFIX}`;
    result = result.split(token).join(original);
  });

  return result;
}

function applyTextSpacingFixes(html) {
  let result = html;

  // Insert missing spaces around inline tags (saved/pasted HTML without gaps)
  result = result.replace(
    new RegExp(`([\\w,.])(<(?:${INLINE_TAGS})\\b)`, "gi"),
    "$1 $2"
  );

  result = result.replace(
    new RegExp(`(</(?:${INLINE_TAGS})>)([\\w])`, "gi"),
    "$1 $2"
  );

  result = result.replace(
    new RegExp(`([:;,.])(<(?:${INLINE_TAGS})\\b)`, "gi"),
    "$1 $2"
  );

  // Use non-breaking spaces at formatted-text boundaries so word gaps
  // stay visible (regular spaces can collapse visually with Poppins bold)
  result = result.replace(
    new RegExp(`([\\w,.])\\s+(<(?:${WORD_BOUNDARY_TAGS})\\b)`, "gi"),
    "$1&nbsp;$2"
  );

  result = result.replace(
    new RegExp(`([\\w,.])(<(?:${WORD_BOUNDARY_TAGS})\\b)`, "gi"),
    "$1&nbsp;$2"
  );

  result = result.replace(
    new RegExp(`(</(?:${WORD_BOUNDARY_TAGS})>)\\s+([\\w])`, "gi"),
    "$1&nbsp;$2"
  );

  result = result.replace(
    new RegExp(`(</(?:${WORD_BOUNDARY_TAGS})>)([\\w])`, "gi"),
    "$1&nbsp;$2"
  );

  // fix empty paragraphs from TipTap
  result = result.replace(/<p>\s*<\/p>/g, "<p><br/></p>");

  // normalize multiple nbsp inside HTML text safely
  result = result.replace(/&nbsp;\s*&nbsp;/g, "&nbsp;");

  // fix empty divs sometimes created by editors
  result = result.replace(/<div>\s*<\/div>/g, "<div><br/></div>");

  return result;
}

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function isEmptyTableRow(trHtml) {
  const cells = trHtml.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
  if (!cells.length) return true;
  return cells.every((cell) => stripTags(cell).length === 0);
}

/** Clean tables for public display: drop empty rows and wrap for horizontal scroll. */
function normalizeTiptapTablesForDisplay(html) {
  if (!/<table\b/i.test(html)) return html;

  let result = html.replace(
    /<div class="tableWrapper">\s*(<table[\s\S]*?<\/table>)\s*<\/div>/gi,
    "$1"
  );

  result = result.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    let cleaned = tableHtml
      .replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (tr) =>
        isEmptyTableRow(tr) ? "" : tr
      )
      .replace(/\sclass="[^"]*selectedCell[^"]*"/gi, "")
      .replace(/<div class="column-resize-handle"><\/div>/gi, "");

    cleaned = cleaned.replace(
      /\sstyle="min-width:\s*\d+px;?"/gi,
      ""
    );

    return `<div class="tableWrapper">${cleaned}</div>`;
  });

  return result;
}

/**
 * Normalize TipTap HTML for public display: restore spaces that can be lost
 * around inline formatting tags when content is saved or pasted.
 * SSR-safe — attribute values (image src, links) are never modified.
 */
export function normalizeTiptapDisplayHtml(html) {
  if (!html || typeof html !== "string") return "";

  const withImages = normalizeTiptapImagesForDisplay(html);
  const withText = withProtectedAttributes(withImages, applyTextSpacingFixes);
  return normalizeTiptapTablesForDisplay(withText);
}

export function hasRenderableTiptapHtml(content) {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  if (!trimmed) return false;
  const stripped = trimmed
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  return stripped.length > 0;
}
