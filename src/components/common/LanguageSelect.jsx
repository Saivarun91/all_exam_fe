  "use client";

  import { useLanguage } from "@/contexts/LanguageContext";
  import { Globe } from "lucide-react";
  import { prefetchPageRuntimeTranslations } from "@/lib/domAutoTranslate";
  import { isEnglishLanguage } from "@/lib/defaultTranslations";
  import {
    languageCodesMatch,
    normalizeLanguageCode,
  } from "@/lib/supportedLocales";

  export default function LanguageSelect({ className = "" }) {
    const {
      language,
      setLanguage,
      languages,
      languagesLoading,
      loading: languageSwitching,
      t,
      translationsRefreshToken,
    } = useLanguage();
    void translationsRefreshToken;

    const selectableLanguages = languages.filter((lang) => (lang.name || "").trim());

    if (!selectableLanguages.length) {
      return null;
    }

    const selectedLang =
      selectableLanguages.find((lang) => languageCodesMatch(lang.code, language)) ||
      selectableLanguages[0];
    const selectedCode = normalizeLanguageCode(selectedLang.code);

    const warmLanguageRuntime = (code) => {
      const langCode = normalizeLanguageCode(code);
      if (isEnglishLanguage(langCode) || typeof document === "undefined") return;
      void prefetchPageRuntimeTranslations(langCode, document.body);
    };

    const formatLanguageLabel = (lang) => {
      const name = (lang?.name || "").trim();
      const code = normalizeLanguageCode(lang?.code);
      if (!name) return code || "";
      if (!code) return name;
      return `${name} (${code})`;
    };

    return (
      <div className="relative inline-flex items-center">
        <div className="pointer-events-none absolute left-2 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2]">
          <Globe
            className="h-3.5 w-3.5 text-cyan-300"
            aria-hidden
          />
        </div>
        <select
          value={selectedCode}
          onFocus={() => {
            selectableLanguages.forEach((lang) => warmLanguageRuntime(lang.code));
          }}
          onChange={(e) => {
            const picked = selectableLanguages.find(
              (lang) => normalizeLanguageCode(lang.code) === e.target.value
            );
            if (picked) {
              warmLanguageRuntime(picked.code);
              setLanguage(picked.code);
            }
          }}
          disabled={languagesLoading || languageSwitching}
          className={
            className ||
            "pl-10 pr-6 py-2 text-sm bg-transparent border-none outline-none shadow-none appearance-none cursor-pointer"
          }
          aria-label={t("common.select_language")}
        >
          {selectableLanguages.map((lang) => (
            <option key={lang.id || lang.code} value={normalizeLanguageCode(lang.code)}>
              {formatLanguageLabel(lang)}
            </option>
          ))}
        </select>
      </div>
    );
  }
