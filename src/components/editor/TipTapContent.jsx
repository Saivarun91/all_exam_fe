import { normalizeTiptapDisplayHtml } from "@/utils/tiptapDisplayContent";

export default function TipTapContent({
  content,
  className = "",
  translatable = true,
  ...props
}) {
  const html = normalizeTiptapDisplayHtml(content);
  if (!html.trim()) return null;

  return (
    <div
      className={["tiptap-editor-content", className].filter(Boolean).join(" ")}
      {...(!translatable ? { "data-i18n-ignore": "" } : {})}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}
