const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const CACHE_MS = 5 * 60 * 1000;

let cachedSettings = null;
let cacheTimestamp = 0;
let inflightRequest = null;

function isNetworkFailure(error) {
  if (!error) return false;
  const message = String(error.message || error);
  return (
    error.name === "TypeError" ||
    /failed to fetch/i.test(message) ||
    /network/i.test(message) ||
    /ECONNREFUSED/i.test(message)
  );
}

export function clearPublicSettingsCache() {
  cachedSettings = null;
  cacheTimestamp = 0;
  inflightRequest = null;
}

export async function fetchPublicSettings({ force = false } = {}) {
  const now = Date.now();

  if (!force && cachedSettings && now - cacheTimestamp < CACHE_MS) {
    return cachedSettings;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/public/`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          cachedSettings = data;
          cacheTimestamp = Date.now();
          return cachedSettings;
        }
      }
    } catch (error) {
      if (!isNetworkFailure(error)) {
        console.warn("Public settings fetch failed:", error);
      }
    }

    if (cachedSettings) {
      return cachedSettings;
    }

    return null;
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
}
