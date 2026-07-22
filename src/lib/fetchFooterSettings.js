import {
  DEFAULT_FOOTER_SETTINGS,
  normalizeFooterSettings,
} from "@/lib/footerDefaults";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const CACHE_MS = 5 * 60 * 1000;

let cachedFooter = null;
let cacheTimestamp = 0;
let inflightRequest = null;

export function clearFooterSettingsCache() {
  cachedFooter = null;
  cacheTimestamp = 0;
  inflightRequest = null;
}

export async function fetchFooterSettings({ force = false } = {}) {
  const now = Date.now();

  if (!force && cachedFooter && now - cacheTimestamp < CACHE_MS) {
    return cachedFooter;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/footer/`, {
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success) {
          cachedFooter = normalizeFooterSettings(json.data || {});
          cacheTimestamp = Date.now();
          return cachedFooter;
        }
      }
    } catch (error) {
      console.warn("Footer settings fetch failed:", error);
    }

    if (cachedFooter) {
      return cachedFooter;
    }

    return normalizeFooterSettings(DEFAULT_FOOTER_SETTINGS);
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
}
