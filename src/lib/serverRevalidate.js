/** Shared ISR window for public listing pages (same data, faster repeat navigations). */
export const PUBLIC_PAGE_REVALIDATE = 60;

export function publicFetchOptions() {
  return { next: { revalidate: PUBLIC_PAGE_REVALIDATE } };
}
