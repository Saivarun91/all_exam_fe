"use client";

import { Fragment } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Subscribes to language context and remounts the public page tree on language
 * changes so stale DOM translations cannot survive a switch.
 */
export default function I18nLanguageBoundary({ children }) {
  const { language, translations, translationsRefreshToken } = useLanguage();
  void translations;
  void translationsRefreshToken;
  return <Fragment key={language}>{children}</Fragment>;
}
