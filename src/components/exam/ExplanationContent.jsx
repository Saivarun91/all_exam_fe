import TipTapContent from "@/components/editor/TipTapContent";
import {
  explanationToDisplayHtml,
  hasFormattedExplanation,
} from "@/utils/explanationDisplay";
import { contentToDisplayString } from "@/utils/testReviewDisplay";

const hasHtmlContent = (value) =>
  typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);

/**
 * Renders question explanations with markdown structure (headings, lists, spacing).
 */
export default function ExplanationContent({ content, className = "" }) {
  const formattedHtml = explanationToDisplayHtml(content);

  if (formattedHtml) {
    return (
      <TipTapContent
        content={formattedHtml}
        className={`explanation-content break-words ${className}`}
      />
    );
  }

  const fallback = contentToDisplayString(content);
  if (!fallback.trim()) return null;

  if (hasHtmlContent(fallback)) {
    return (
      <TipTapContent
        content={fallback}
        className={`explanation-content break-words ${className}`}
      />
    );
  }

  return (
    <div className={`explanation-content whitespace-pre-wrap break-words ${className}`}>
      {fallback}
    </div>
  );
}

export { hasFormattedExplanation };
