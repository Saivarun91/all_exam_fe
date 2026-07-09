import MarkdownIt from "markdown-it";
import { normalizeTiptapDisplayHtml } from "@/utils/tiptapDisplayContent";
import { contentToDisplayString } from "@/utils/testReviewDisplay";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
});

const SECTION_HEADINGS = [
  "Concept Being Tested",
  "Why the Correct Answer(s) Are Correct",
  "Key Exam Takeaways",
  "Common Mistakes Candidates Make",
  "Exam Tip / Memory Trick",
  "Related Certification Concepts",
  "Official Documentation References",
  "Difficulty Rating",
  "Estimated Exam Frequency",
  "Keywords to Remember",
];

const hasHtmlContent = (value) =>
  typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);

const looksLikeMarkdown = (value) => {
  if (!value || typeof value !== "string") return false;
  const text = value.trim();
  if (!text) return false;
  return (
    /^#{1,6}\s/m.test(text) ||
    /^\s*[-*+]\s+/m.test(text) ||
    /^\s*\d+\.\s+/m.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    text.includes("### ")
  );
};

function formatSectionBody(body) {
  let text = body.trim();
  if (!text) return "";

  text = text.replace(/(\d+)\.\s+/g, "\n\n$1. ");
  text = text.replace(/\*\s+/g, "\n\n* ");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function formatSpecialSectionBody(heading, body) {
  const text = body.trim();
  if (!text) return "";

  if (heading === "Difficulty Rating") {
    const match = text.match(/^(Easy|Medium|Hard)\.?(.*)$/s);
    if (match) {
      const rest = match[2].trim();
      return rest ? `**${match[1]}**\n\n${rest}` : `**${match[1]}**`;
    }
  }

  if (heading === "Estimated Exam Frequency") {
    for (const freq of ["Very Common", "Common", "Occasional", "Rare"]) {
      if (text.startsWith(freq)) {
        const rest = text.slice(freq.length).replace(/^\./, "").trim();
        return rest ? `**${freq}**\n\n${rest}` : `**${freq}**`;
      }
    }
  }

  if (heading === "Keywords to Remember") {
    const keywords = text.split(/,\s*/).map((k) => k.trim()).filter(Boolean);
    if (keywords.length > 1) {
      return keywords.map((k) => `* ${k}`).join("\n\n");
    }
  }

  return formatSectionBody(text);
}

/** Normalize AI-generated markdown that lacks line breaks between sections. */
export function preprocessExplanationMarkdown(raw) {
  if (!raw || typeof raw !== "string") return "";

  let text = raw.replace(/\r\n/g, "\n").trim();
  if (!text.includes("###")) return text;

  const parts = text.split(/(?=###\s)/).filter(Boolean);
  const sections = parts.map((part) => {
    if (!part.startsWith("###")) return part.trim();

    const content = part.replace(/^###\s*/, "").trim();
    for (const heading of SECTION_HEADINGS) {
      if (content.startsWith(heading)) {
        const body = formatSpecialSectionBody(
          heading,
          content.slice(heading.length)
        );
        return `### ${heading}\n\n${body}`;
      }
    }

    const fallback = content.match(
      /^(.+?)(?=(?:This|For|Amazon|AWS|The |When |While |Candidates|Understanding|Enforcing|Cross-|An |In |A |Setting|Streaming|Pre-signed|Multi-AZ|Compute|Securing|Distinguishing)\b)/
    );
    if (fallback) {
      const heading = fallback[1].trim();
      const body = formatSectionBody(content.slice(heading.length));
      return `### ${heading}\n\n${body}`;
    }

    return `### ${content}`;
  });

  return sections.join("\n\n").trim();
}

export function markdownToDisplayHtml(raw) {
  const source = preprocessExplanationMarkdown(raw);
  if (!source.trim()) return "";
  return normalizeTiptapDisplayHtml(markdown.render(source));
}

/** Convert stored explanation content to display-ready HTML. */
export function explanationToDisplayHtml(content) {
  if (content == null || content === "") return "";

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return "";
    if (hasHtmlContent(trimmed)) {
      return normalizeTiptapDisplayHtml(trimmed);
    }
    if (looksLikeMarkdown(trimmed)) {
      return markdownToDisplayHtml(trimmed);
    }
    return "";
  }

  if (typeof content === "object") {
    const plain = contentToDisplayString(content);
    if (!plain.trim()) return "";
    if (hasHtmlContent(plain)) {
      return normalizeTiptapDisplayHtml(plain);
    }
    if (looksLikeMarkdown(plain)) {
      return markdownToDisplayHtml(plain);
    }
  }

  return "";
}

export function hasFormattedExplanation(content) {
  if (explanationToDisplayHtml(content)) return true;
  return contentToDisplayString(content).trim().length > 0;
}
