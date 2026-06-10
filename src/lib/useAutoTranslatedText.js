"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useOptionalLanguage } from "@/contexts/LanguageContext";
import {
  DEFAULT_LANGUAGE_CODE,
  isEnglishLanguage,
} from "@/lib/defaultTranslations";
import { isAbortError } from "@/lib/isAbortError";
import { getVisiblePathname } from "@/lib/localeRouting";
import { getStoredPageTranslation } from "@/lib/pageRuntimeStorage";
import {
  getRuntimeCachedTranslation,
  translateRuntimeText,
} from "@/lib/runtimeTranslate";
import { localizeRuntimeTranslation } from "@/lib/termLocalizations";

function resolveInstantTranslation(source, language, pagePath) {
  if (!source || isEnglishLanguage(language)) return source || "";
  const stored = getStoredPageTranslation(pagePath, language, source);
  if (stored) return stored;
  const cached = getRuntimeCachedTranslation(source, language);
  if (cached) return cached;
  return localizeRuntimeTranslation(source, "", language);
}

export function useAutoTranslatedText(text) {
  const languageContext = useOptionalLanguage();
  const language = languageContext?.language || DEFAULT_LANGUAGE_CODE;
  const pathname = usePathname();
  const pagePath =
    typeof window !== "undefined"
      ? getVisiblePathname(pathname)
      : pathname || "/";
  const source = (text || "").trim();

  const [value, setValue] = useState(() => {
    if (!source) return "";
    if (isEnglishLanguage(language)) return source;
    return (
      resolveInstantTranslation(source, language, pagePath) || source
    );
  });

  useLayoutEffect(() => {
    if (!source) {
      setValue("");
      return;
    }
    if (isEnglishLanguage(language)) {
      setValue(source);
      return;
    }
    setValue(
      resolveInstantTranslation(source, language, pagePath) || source
    );
  }, [source, language, pagePath]);

  useEffect(() => {
    if (!source) {
      return undefined;
    }

    if (isEnglishLanguage(language)) {
      return undefined;
    }

    const instant = resolveInstantTranslation(source, language, pagePath);
    if (instant) {
      return undefined;
    }

    let cancelled = false;

    translateRuntimeText(source, language)
      .then((translated) => {
        if (cancelled) return;
        const next = (translated || "").trim();
        setValue(next && next !== source ? next : source);
      })
      .catch((error) => {
        if (!cancelled && !isAbortError(error)) {
          console.warn("Auto translation failed:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [source, language, pagePath]);

  useEffect(() => {
    if (typeof window === "undefined" || !source) return undefined;

    const refresh = () => {
      if (isEnglishLanguage(language)) {
        setValue(source);
        return;
      }
      const instant = resolveInstantTranslation(source, language, pagePath);
      setValue(instant || source);
    };

    window.addEventListener("languageChanged", refresh);
    window.addEventListener("translationsApplied", refresh);

    return () => {
      window.removeEventListener("languageChanged", refresh);
      window.removeEventListener("translationsApplied", refresh);
    };
  }, [source, language, pagePath]);

  if (!source) return "";
  if (isEnglishLanguage(language)) return source;
  return value || source;
}
