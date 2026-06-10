"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { normalizeLanguageCode } from "@/lib/supportedLocales";
import {
  isDefaultLocale,
  localizeHref,
  shouldLocalizePath,
} from "@/lib/localeRouting";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Prefixes internal links with the active locale (e.g. /ko/categories).
 * English keeps unprefixed URLs (/categories).
 */
export default function LocaleUrlSync() {
  const { language, languages } = useLanguage();
  const activeLocaleCodes = languages.map((lang) =>
    normalizeLanguageCode(lang.code)
  );
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return undefined;
    if (!shouldLocalizePath(pathname)) return undefined;

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target?.closest?.("a[href]");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("http://") ||
        rawHref.startsWith("https://") ||
        rawHref.startsWith("//")
      ) {
        return;
      }

      if (!rawHref.startsWith("/")) return;
      if (!shouldLocalizePath(rawHref)) return;

      const localized = localizeHref(rawHref, language);
      if (localized === rawHref) return;

      event.preventDefault();
      router.push(localized);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [hydrated, language, router, pathname, activeLocaleCodes]);

  useEffect(() => {
    if (!hydrated) return;
    if (!shouldLocalizePath(pathname)) return;
    if (!isDefaultLocale(language)) {
      document.documentElement.lang = language;
    }
  }, [hydrated, language, pathname]);

  return null;
}
