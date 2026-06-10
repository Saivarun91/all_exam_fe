"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageLoadingOverlay() {
  const { loading } = useLanguage();

  if (!loading) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9998] pointer-events-none"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Translating page"
    >
      <div className="h-1 w-full bg-blue-100/80 overflow-hidden">
        <div className="h-full w-1/3 bg-[#1A73E8] animate-[languageBar_1.1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
