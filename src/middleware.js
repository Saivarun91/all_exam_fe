import { NextResponse } from "next/server";

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

const TOP_LEVEL_RESERVED_SEGMENTS = new Set([
  "exams",
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

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const pathname = url.pathname;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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
        const [categoryRes, providerRes, examRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories/${slug}/`, { cache: "no-store" }),
          fetch(`${API_BASE_URL}/api/providers/${slug}/`, { cache: "no-store" }),
          fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`, { cache: "no-store" }),
        ]);

        if (categoryRes.ok) {
          return NextResponse.rewrite(new URL(`/categories/${slug}`, request.url));
        }

        if (providerRes.ok) {
          return NextResponse.rewrite(new URL(`/exams/${slug}`, request.url));
        }

        if (examRes.ok) {
          const exam = await examRes.json();
          const providerSlug =
            exam?.provider_slug || toSlug(exam?.provider || "");
          const examSlug = exam?.slug || slug;
          const examCode = examSlug.startsWith(`${providerSlug}-`)
            ? examSlug.slice(providerSlug.length + 1)
            : examSlug;

          if (providerSlug && examCode) {
            return NextResponse.rewrite(
              new URL(`/exams/${providerSlug}/${examCode}`, request.url)
            );
          }
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
          return NextResponse.rewrite(
            new URL(
              `/exams/${providerSlug}/search/${keywordSeg}`,
              request.url
            )
          );
        }
      } catch {
        // Fall through
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/FAQ",

    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon-new\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};