"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import TipTapContent from "@/components/editor/TipTapContent";

export default function LocalizedHtml({ i18nKey, apiHtml = "", className = "" }) {
  const { lt } = useLanguage();

  const html = lt(i18nKey, apiHtml);

  if (!html) return null;

  return <TipTapContent content={html} className={className} />;
}
