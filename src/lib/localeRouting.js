import { DEFAULT_LANGUAGE_CODE, isEnglishLanguage } from "@/lib/defaultTranslations";
import {
  languageCodesMatch,
  normalizeLanguageCode,
} from "@/lib/supportedLocales";

export const LANGUAGE_COOKIE = "language";

const LOCALE_SEGMENT_PATTERN = /^[a-z]{2,8}(-[a-z]{2,4})?$/;

const RESERVED_PATH_SEGMENTS = new Set([
  "exams",
  "popular-exams",
  "categories",
  "providers",
  "blog",
  "admin",
  "auth",
  "login",
  "signup",
  "dashboard",
  "faq",
  "contact-us",
  "privacy-policy",
  "terms-and-conditions",
  "refund-and-cancellation-policy",
  "disclaimer",
  "editor-policy",
  "checkout",
  "payment-success",
  "profile",
  "testimonials",
  "test-review",
  "searchresults",
  "notfound",
  "pricing",
  "sitemap",
  "testpage",
  "test-player",
  "search",
]);

export function isDefaultLocale(code) {
  return isEnglishLanguage(code);
}

export function isValidLocaleCode(code) {
  const normalized = normalizeLanguageCode(code);
  if (!LOCALE_SEGMENT_PATTERN.test(normalized)) return false;
  if (RESERVED_PATH_SEGMENTS.has(normalized)) return false;
  return true;
}

function segmentMatchesActiveLocale(segment, activeLocales = []) {
  if (!segment || !activeLocales?.length) return false;
  const normalized = normalizeLanguageCode(segment);
  if (RESERVED_PATH_SEGMENTS.has(normalized)) return false;
  if (!LOCALE_SEGMENT_PATTERN.test(normalized)) return false;
  return activeLocales.some((code) => languageCodesMatch(code, normalized));
}

export function isLocalePathSegment(segment, activeLocales = null) {
  if (!segment) return false;
  if (Array.isArray(activeLocales) && activeLocales.length > 0) {
    return segmentMatchesActiveLocale(segment, activeLocales);
  }
  return isValidLocaleCode(segment);
}

export function parseLocalePath(pathname, activeLocales = null) {
  const safePath = pathname || "/";
  const segments = safePath.split("/").filter(Boolean);
  const locales = Array.isArray(activeLocales) ? activeLocales : [];

  if (segments.length && segmentMatchesActiveLocale(segments[0], locales)) {
    const locale = normalizeLanguageCode(segments[0]);
    const rest = segments.slice(1).join("/");
    return {
      locale,
      pathnameWithoutLocale: rest ? `/${rest}` : "/",
    };
  }

  if (
    !locales.length &&
    segments.length > 1 &&
    isValidLocaleCode(segments[0])
  ) {
    const locale = normalizeLanguageCode(segments[0]);
    const rest = segments.slice(1).join("/");
    return {
      locale,
      pathnameWithoutLocale: rest ? `/${rest}` : "/",
    };
  }

  return {
    locale: DEFAULT_LANGUAGE_CODE,
    pathnameWithoutLocale: safePath === "" ? "/" : safePath,
  };
}

export function getLocaleFromPathname(pathname, activeLocales = null) {
  return parseLocalePath(pathname, activeLocales).locale;
}

export function stripLocaleFromPathname(pathname, activeLocales = null) {
  return parseLocalePath(pathname, activeLocales).pathnameWithoutLocale;
}

export function shouldLocalizePath(pathname, activeLocales = null) {
  const path = stripLocaleFromPathname(pathname || "/", activeLocales);
  if (path === "/" || path === "") return true;
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  return true;
}

function canUseLocaleInUrl(code, activeLocales = null) {
  const normalized = normalizeLanguageCode(code);
  if (isDefaultLocale(normalized)) return false;
  if (RESERVED_PATH_SEGMENTS.has(normalized)) return false;
  if (!LOCALE_SEGMENT_PATTERN.test(normalized)) return false;
  if (Array.isArray(activeLocales) && activeLocales.length > 0) {
    return activeLocales.some((item) => languageCodesMatch(item, normalized));
  }
  return true;
}

export function addLocaleToPathname(pathname, locale, activeLocales = null) {
  const internal = stripLocaleFromPathname(pathname || "/", activeLocales);
  const normalized = normalizeLanguageCode(locale || DEFAULT_LANGUAGE_CODE);

  if (isDefaultLocale(normalized)) {
    return internal === "/" ? "/" : internal;
  }

  if (!canUseLocaleInUrl(normalized, activeLocales)) {
    return internal === "/" ? "/" : internal;
  }

  if (internal === "/") {
    return `/${normalized}`;
  }

  return `/${normalized}${internal}`;
}

export function localizeHref(href, language, activeLocales = null) {
  if (!href || typeof href !== "string") return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (href.startsWith("/#")) return href;

  const hashIndex = href.indexOf("#");
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";

  const queryIndex = withoutHash.indexOf("?");
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";

  const localized = addLocaleToPathname(path, language, activeLocales);
  return `${localized}${query}${hash}`;
}

export function pathsMatchLocalized(pathA, pathB, activeLocales = null) {
  return (
    stripLocaleFromPathname(pathA, activeLocales) ===
    stripLocaleFromPathname(pathB, activeLocales)
  );
}

export function getVisiblePathname(fallbackPathname = "/") {
  if (typeof window !== "undefined" && window.location?.pathname) {
    return window.location.pathname;
  }
  return fallbackPathname || "/";
}

export function buildLocalizedUrl(
  pathname,
  locale,
  { search = "", hash = "", activeLocales = null } = {}
) {
  const localizedPath = addLocaleToPathname(pathname, locale, activeLocales);
  return `${localizedPath}${search || ""}${hash || ""}`;
}

export function syncLanguageCookie(locale) {
  if (typeof document === "undefined") return;
  const normalized = normalizeLanguageCode(locale || DEFAULT_LANGUAGE_CODE);
  if (isDefaultLocale(normalized)) {
    document.cookie = `${LANGUAGE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function syncBrowserLocaleUrl(
  pathname,
  locale,
  { search = "", hash = "", activeLocales = null } = {}
) {
  if (typeof window === "undefined") return false;

  const visiblePath = pathname || window.location.pathname || "/";
  const nextUrl = buildLocalizedUrl(visiblePath, locale, {
    search,
    hash,
    activeLocales,
  });
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl === currentUrl) return false;

  window.history.replaceState(window.history.state, "", nextUrl);
  syncLanguageCookie(locale);
  window.dispatchEvent(
    new CustomEvent("localeUrlChanged", {
      detail: { locale: normalizeLanguageCode(locale), url: nextUrl },
    })
  );
  return true;
}
