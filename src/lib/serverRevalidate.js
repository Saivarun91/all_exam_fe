/** Shared ISR window for public listing pages (same data, faster repeat navigations). */
export const PUBLIC_PAGE_REVALIDATE = 60;

/** Exam detail pages — balance freshness with TTFB / SEO crawl speed. */
export const EXAM_PAGE_REVALIDATE = 300;

/** Middleware slug lookups — short cache avoids blocking every request on Django. */
export const MIDDLEWARE_FETCH_REVALIDATE = 300;

export function publicFetchOptions() {
  return { next: { revalidate: PUBLIC_PAGE_REVALIDATE } };
}

/** Listing pages only need id/name/slug/logo — keeps payloads under Next.js 2MB fetch cache. */
export function providersListUrl(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000") {
  const root = String(baseUrl || "").replace(/\/$/, "");
  return `${root}/api/providers/?lite=1`;
}

export function publicProvidersFetchOptions() {
  return publicFetchOptions();
}

export function examFetchOptions() {
  return { next: { revalidate: EXAM_PAGE_REVALIDATE } };
}

export function middlewareFetchOptions() {
  return { next: { revalidate: MIDDLEWARE_FETCH_REVALIDATE } };
}
