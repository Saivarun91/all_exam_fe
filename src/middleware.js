import { NextResponse } from "next/server";
import {
  addLocaleToPathname,
  isDefaultLocale,
  isValidLocaleCode,
  LANGUAGE_COOKIE,
  parseLocalePath,
  shouldLocalizePath,
} from "./lib/localeRouting";
import { isSitemapPathname } from "./lib/sitemapUtils";
import { trimOfficialDetailsPathSegment } from "./app/exams/[provider]/[examCode]/examInfoUtils";
import { isOfficialDetailsOnlyCourse } from "./lib/examListingFilters";
import {
  FREE_PRACTICE_TEST_LANDING_SUFFIX,
  getExamLandingPath,
  getExamPracticePath,
  pathsMatchPublicUrl,
  probeExamLookupCandidates,
} from "./utils/practiceTestRouting";

async function fetchExamByPathProbe(apiBaseUrl, pathSegment) {
  for (const candidate of probeExamLookupCandidates(pathSegment)) {
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/courses/exams/${encodeURIComponent(candidate)}/`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const exam = await res.json();
        if (exam && typeof exam === "object") return exam;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

function attachLocaleCookie(response, locale) {
  if (!response) return response;
  if (isDefaultLocale(locale)) {
    response.cookies.set(LANGUAGE_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return response;
  }
  response.cookies.set(LANGUAGE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

/** Single-segment paths like /favicon-new.ico must not hit category/provider/exam APIs. */
function isStaticAssetSegment(segment) {
  return /\.(ico|png|jpe?g|gif|webp|svg|css|js|mjs|map|txt|xml|woff2?|ttf|eot|pdf|zip)$/i.test(
    segment
  );
}

function toSlug(value) {
  if (!value) return "";
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function normalizeOfficialDetailsUrlSlug(value = "") {
  let s = String(value ?? "").trim();
  if (!s) return "official-details";
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded */
  }
  s = s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "official-details";
}

const EXAM_INFO_SUFFIX = "-exam-info";
const FREE_PRACTICE_TEST_SUFFIX_REGEX = /-free-practice-test-(\d+)$/i;

const TOP_LEVEL_RESERVED_SEGMENTS = new Set([
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

function reservedTopLevelSegment(segment) {
  return TOP_LEVEL_RESERVED_SEGMENTS.has(String(segment || "").toLowerCase());
}

let activeLocaleCodesCache = null;
let activeLocaleCodesCacheAt = 0;
const ACTIVE_LOCALE_CACHE_MS = 5 * 60 * 1000;

async function getActiveLocaleCodes(apiBaseUrl) {
  const now = Date.now();
  if (
    activeLocaleCodesCache &&
    now - activeLocaleCodesCacheAt < ACTIVE_LOCALE_CACHE_MS
  ) {
    return activeLocaleCodesCache;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/api/languages/?active=true`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        activeLocaleCodesCache = data.data
          .map((lang) =>
            String(lang?.code || "")
              .toLowerCase()
              .trim()
              .replace(/_/g, "-")
          )
          .filter(Boolean);
        activeLocaleCodesCacheAt = now;
        return activeLocaleCodesCache;
      }
    }
  } catch {
    // Fall through to last known list.
  }

  return activeLocaleCodesCache || [];
}

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const requestPathname = url.pathname;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const activeLocaleCodes = await getActiveLocaleCodes(API_BASE_URL);
  const { locale: urlLocale, pathnameWithoutLocale } = parseLocalePath(
    requestPathname,
    activeLocaleCodes
  );
  const pathname = pathnameWithoutLocale || "/";

  if (isSitemapPathname(pathname)) {
    return attachLocaleCookie(NextResponse.next(), urlLocale);
  }

  const cookieLang = request.cookies.get(LANGUAGE_COOKIE)?.value;
  if (
    isDefaultLocale(urlLocale) &&
    cookieLang &&
    !isDefaultLocale(cookieLang) &&
    isValidLocaleCode(cookieLang) &&
    shouldLocalizePath(pathname, activeLocaleCodes)
  ) {
    url.pathname = addLocaleToPathname(pathname, cookieLang, activeLocaleCodes);
    return NextResponse.redirect(url, 302);
  }

  // 1️⃣ Redirect www → non-www
  if (hostname === "www.allexamquestions.com") {
    url.hostname = "allexamquestions.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // 2️⃣ Convert only FAQ and Dashboard paths to lowercase
  if ( pathname === "/FAQ") {
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 301);
  }

  const segments = pathname.split("/").filter(Boolean);

  // Canonical practice hub: /exams/:provider/:examCode/practice → /[exam-name]-[exam-code]/practice
  const examsPracticeLegacy = pathname.match(
    /^\/exams\/([^/]+)\/([^/]+)\/practice\/?$/
  );
  if (examsPracticeLegacy) {
    const prov = examsPracticeLegacy[1];
    const ec = examsPracticeLegacy[2];
    if (prov && ec && !isStaticAssetSegment(prov)) {
      const lookupSlug = `${toSlug(prov)}-${toSlug(ec)}`;
      const exam = await fetchExamByPathProbe(API_BASE_URL, lookupSlug);
      if (exam) {
        const practicePath = getExamPracticePath(exam);
        if (practicePath) {
          url.pathname = practicePath;
          return NextResponse.redirect(url, 308);
        }
      }
    }
  }

  // Two-segment official details: internal rewrite for official-details-only exams.
  if (
    segments.length === 2 &&
    !reservedTopLevelSegment(segments[0]) &&
    segments[1].toLowerCase() !== "practice"
  ) {
    const exam = await fetchExamByPathProbe(API_BASE_URL, segments[0]);
    if (exam && isOfficialDetailsOnlyCourse(exam)) {
      const officialSlug = trimOfficialDetailsPathSegment(
        exam?.official_details_url_slug || "official-details"
      );
      if (segments[1] === officialSlug) {
        return attachLocaleCookie(
          NextResponse.rewrite(
            new URL(`/${segments[0]}/${officialSlug}`, request.url)
          ),
          urlLocale
        );
      }
    }
  }

  // Canonical practice hub: /:segment/practice → /[exam-name]-[exam-code]/practice
  if (
    segments.length === 2 &&
    segments[1].toLowerCase() === "practice" &&
    !reservedTopLevelSegment(segments[0])
  ) {
    const exam = await fetchExamByPathProbe(API_BASE_URL, segments[0]);
    if (exam) {
      const practicePath = getExamPracticePath(exam);
      if (practicePath && pathname !== practicePath) {
        url.pathname = practicePath;
        return NextResponse.redirect(url, 308);
      }
    }
  }

  // Canonical provider listing URLs: /exams/:provider → /:provider (visible URL has no /exams prefix)
  const examsSingleProviderMatch = pathname.match(/^\/exams\/([^/]+)\/?$/);
  if (examsSingleProviderMatch) {
    const slug = examsSingleProviderMatch[1];
    if (slug && slug.toLowerCase() !== "search" && !isStaticAssetSegment(slug)) {
      try {
        const providerRes = await fetch(
          `${API_BASE_URL}/api/providers/${slug}/`,
          { cache: "no-store" }
        );
        if (providerRes.ok) {
          url.pathname = `/${slug}`;
          return NextResponse.redirect(url, 308);
        }
      } catch {
        // Fall through to app /exams/[provider] route
      }
    }
  }

  // /exams/:provider/search/:keyword → /:provider/search/:keyword
  const examsProviderSearchLegacy = pathname.match(
    /^\/exams\/([^/]+)\/search\/(.+?)\/?$/
  );
  if (examsProviderSearchLegacy) {
    const prov = examsProviderSearchLegacy[1];
    const kw = examsProviderSearchLegacy[2];
    if (prov && prov.toLowerCase() !== "search") {
      try {
        const providerRes = await fetch(
          `${API_BASE_URL}/api/providers/${prov}/`,
          { cache: "no-store" }
        );
        if (providerRes.ok) {
          url.pathname = `/${prov}/search/${kw}`;
          return NextResponse.redirect(url, 308);
        }
      } catch {
        // Fall through
      }
    }
  }

  // Resolve top-level slugs without changing visible URL (rewrite to internal routes).
  if (segments.length === 1) {
    const slug = segments[0];

    if (!reservedTopLevelSegment(slug) && !isStaticAssetSegment(slug)) {
      try {
        // Pretty practice-test URL:
        // /<exam-name>-<exam-code>-free-practice-test-<n>
        // Keep visible URL, internally render existing test player route.
        // Pretty exam landing: /<exam-name>-<exam-code>-free-practice-test
        if (
          slug.toLowerCase().endsWith(FREE_PRACTICE_TEST_LANDING_SUFFIX) &&
          !FREE_PRACTICE_TEST_SUFFIX_REGEX.test(slug)
        ) {
          const withoutSuffix = slug.slice(
            0,
            -FREE_PRACTICE_TEST_LANDING_SUFFIX.length
          );
          const examForLanding = await fetchExamByPathProbe(
            API_BASE_URL,
            withoutSuffix
          );
          if (examForLanding) {
            const canonical = getExamLandingPath(examForLanding);
            if (canonical && !pathsMatchPublicUrl(pathname, canonical)) {
              url.pathname = canonical;
              return NextResponse.redirect(url, 308);
            }
            const examSlug =
              examForLanding?.slug ||
              withoutSuffix.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
            if (examSlug) {
              return attachLocaleCookie(
                NextResponse.rewrite(new URL(`/${examSlug}`, request.url)),
                urlLocale
              );
            }
          }
        }

        const practiceMatch = slug.match(FREE_PRACTICE_TEST_SUFFIX_REGEX);
        if (practiceMatch) {
          const testNum = practiceMatch[1];
          let withoutSuffix = slug.replace(FREE_PRACTICE_TEST_SUFFIX_REGEX, "");
          // Legacy URLs duplicated exam slug (name-code when both were identical)
          const duplicatedBase = withoutSuffix.match(/^(.+)-\1$/);
          if (duplicatedBase) {
            withoutSuffix = duplicatedBase[1];
          }
          const examForCanonical = await fetchExamByPathProbe(
            API_BASE_URL,
            withoutSuffix
          );
          if (examForCanonical) {
            const { buildPracticeTestSeoSegment } = await import(
              "./utils/practiceTestRouting"
            );
            const canonical = `/${buildPracticeTestSeoSegment({
              examName: examForCanonical.title,
              examCode: examForCanonical.code,
              examSlug: examForCanonical.slug,
              index: Math.max(0, parseInt(testNum, 10) - 1),
            })}`;
            if (pathname !== canonical) {
              url.pathname = canonical;
              return NextResponse.redirect(url, 308);
            }
          } else if (duplicatedBase) {
            url.pathname = `/${duplicatedBase[1]}-free-practice-test-${testNum}`;
            return NextResponse.redirect(url, 308);
          }
          const parts = withoutSuffix.split("-").filter(Boolean);
          const maxProbe = Math.min(7, parts.length);
          for (let take = 1; take <= maxProbe; take += 1) {
            const candidate = parts.slice(parts.length - take).join("-");
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/courses/exams/${encodeURIComponent(candidate)}/`,
                { cache: "no-store" }
              );
              if (!res.ok) continue;
              const exam = await res.json();
              if (!exam || typeof exam !== "object") continue;

              const providerSlug = exam?.provider_slug || toSlug(exam?.provider || "");
              const examSlug = exam?.slug || candidate;
              const examCode = examSlug.startsWith(`${providerSlug}-`)
                ? examSlug.slice(providerSlug.length + 1)
                : examSlug;

              if (providerSlug && examCode) {
                return attachLocaleCookie(
                  NextResponse.rewrite(
                    new URL(`/exams/${providerSlug}/${examCode}/practice/${slug}`, request.url)
                  ),
                  urlLocale
                );
              }
            } catch {
              // Continue probing suffix candidates.
            }
          }
        }

        // Legacy official-details URLs ending in -exam-info (official-details-only exams).
        if (slug.toLowerCase().endsWith(EXAM_INFO_SUFFIX)) {
          const directExam = await fetchExamByPathProbe(API_BASE_URL, slug);
          if (directExam && isOfficialDetailsOnlyCourse(directExam)) {
            const examSlug = directExam?.slug || slug;
            const officialSlug = trimOfficialDetailsPathSegment(
              directExam?.official_details_url_slug || "official-details"
            );

            return attachLocaleCookie(
              NextResponse.rewrite(new URL(`/${examSlug}/${officialSlug}`, request.url)),
              urlLocale
            );
          }

          const withoutSuffix = slug.slice(0, -EXAM_INFO_SUFFIX.length);
          const parts = withoutSuffix.split("-").filter(Boolean);

          const maxProbe = Math.min(7, parts.length);
          for (let take = 1; take <= maxProbe; take += 1) {
            const candidate = parts.slice(parts.length - take).join("-");
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/courses/exams/${encodeURIComponent(candidate)}/`,
                { cache: "no-store" }
              );
              if (!res.ok) continue;
              const exam = await res.json();
              if (!exam || typeof exam !== "object") continue;
              if (!isOfficialDetailsOnlyCourse(exam)) continue;

              const examSlug = exam?.slug || candidate;
              const officialSlug = trimOfficialDetailsPathSegment(
                exam?.official_details_url_slug || "official-details"
              );

              return attachLocaleCookie(
                NextResponse.rewrite(new URL(`/${examSlug}/${officialSlug}`, request.url)),
                urlLocale
              );
            } catch {
              // Continue probing suffix candidates.
            }
          }
        }

        // Resolve slug as category, then exam, then provider (sequential to avoid
        // spurious 404s when the slug only matches one entity, e.g. an exam slug).
        const categoryUrl = `${API_BASE_URL}/api/categories/${slug}/`;
        const providerUrl = `${API_BASE_URL}/api/providers/${slug}/`;

        const categoryRes = await fetch(categoryUrl, { cache: "no-store" }).catch(
          () => null
        );

        // Category before exam: a slug that is both must open the category page, not an exam.
        if (categoryRes?.ok) {
          return attachLocaleCookie(
            NextResponse.rewrite(new URL(`/categories/${slug}`, request.url)),
            urlLocale
          );
        }

        const exam = await fetchExamByPathProbe(API_BASE_URL, slug);

        if (exam) {
          const officialPublicSlug = trimOfficialDetailsPathSegment(
            exam?.official_details_url_slug || ""
          );

          // If user opened the official-details public slug, keep that exact visible URL.
          if (officialPublicSlug && slug === officialPublicSlug) {
            const examSlug = exam?.slug || slug;
            return attachLocaleCookie(
              NextResponse.rewrite(
                new URL(`/${examSlug}/${officialPublicSlug}`, request.url)
              ),
              urlLocale
            );
          }

          if (isOfficialDetailsOnlyCourse(exam)) {
            const examSlug = exam?.slug || slug;
            const officialSlug = trimOfficialDetailsPathSegment(
              exam?.official_details_url_slug || "official-details"
            );
            if (examSlug) {
              return attachLocaleCookie(
                NextResponse.rewrite(
                  new URL(`/${examSlug}/${officialSlug}`, request.url)
                ),
                urlLocale
              );
            }
          }

          const canonicalLanding = getExamLandingPath(exam);
          if (
            canonicalLanding &&
            !pathsMatchPublicUrl(pathname, canonicalLanding)
          ) {
            url.pathname = canonicalLanding;
            return NextResponse.redirect(url, 308);
          }

          const examSlug = exam?.slug || slug;
          if (examSlug) {
            return attachLocaleCookie(
              NextResponse.rewrite(new URL(`/${examSlug}`, request.url)),
              urlLocale
            );
          }
        }

        const providerRes = await fetch(providerUrl, { cache: "no-store" }).catch(
          () => null
        );

        if (providerRes?.ok) {
          return attachLocaleCookie(
            NextResponse.rewrite(new URL(`/providers/${slug}`, request.url)),
            urlLocale
          );
        }
      } catch {
        // Fail open: allow normal routing if API is unavailable.
      }
    }
  }

  // /:provider/search/:keyword → exams listing with filters (internal /exams/... route)
  if (
    segments.length === 3 &&
    segments[1].toLowerCase() === "search" &&
    segments[2]
  ) {
    const providerSlug = segments[0];
    if (!reservedTopLevelSegment(providerSlug)) {
      try {
        const providerRes = await fetch(
          `${API_BASE_URL}/api/providers/${providerSlug}/`,
          { cache: "no-store" }
        );
        if (providerRes.ok) {
          const keywordSeg = segments[2];
          return attachLocaleCookie(
            NextResponse.rewrite(
              new URL(
                `/exams/${providerSlug}/search/${keywordSeg}`,
                request.url
              )
            ),
            urlLocale
          );
        }
      } catch {
        // Fall through
      }
    }
  }

  if (
    !isDefaultLocale(urlLocale) &&
    shouldLocalizePath(pathname, activeLocaleCodes) &&
    requestPathname !== pathname
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname;
    return attachLocaleCookie(NextResponse.rewrite(rewriteUrl), urlLocale);
  }

  return attachLocaleCookie(NextResponse.next(), urlLocale);
}

export const config = {
  matcher: [
    "/FAQ",

    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon-new\\.ico|robots\\.txt|sitemap\\.xml|sitemap-[a-z]{2}(?:-[a-z]{2})?\\.xml|.*-sitemap\\.xml).*)",
  ],
};