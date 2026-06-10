import { normalizeLanguageCode } from "@/lib/supportedLocales";

const STORAGE_KEY = "pageRuntimeV1";
const MAX_ENTRIES_PER_PAGE = 800;

function readStore() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota errors.
  }
}

export function pageRuntimeStorageKey(pathname, language) {
  const path = (pathname || "").trim() || "/";
  const lang = normalizeLanguageCode(language);
  return `${path}|${lang}`;
}

export function readStoredPageRuntimeMap(pathname, language) {
  const key = pageRuntimeStorageKey(pathname, language);
  const map = readStore()[key];
  return map && typeof map === "object" ? map : {};
}

export function getStoredPageTranslation(pathname, language, source) {
  const value = (source || "").trim();
  if (!value) return "";
  const map = readStoredPageRuntimeMap(pathname, language);
  return (map[value] || "").trim();
}

export function mergeStoredPageRuntimeMap(pathname, language, entries = {}) {
  if (!entries || typeof entries !== "object") return;

  const key = pageRuntimeStorageKey(pathname, language);
  const store = readStore();
  const current =
    store[key] && typeof store[key] === "object" ? { ...store[key] } : {};

  Object.entries(entries).forEach(([source, translated]) => {
    const src = (source || "").trim();
    const dst = (translated || "").trim();
    if (!src || !dst || dst === src) return;
    current[src] = dst;
  });

  const keys = Object.keys(current);
  if (keys.length > MAX_ENTRIES_PER_PAGE) {
    const trimmed = {};
    keys.slice(keys.length - MAX_ENTRIES_PER_PAGE).forEach((entryKey) => {
      trimmed[entryKey] = current[entryKey];
    });
    store[key] = trimmed;
  } else {
    store[key] = current;
  }

  writeStore(store);
}

export function rememberPageRuntimeTranslation(
  pathname,
  language,
  source,
  translated
) {
  const src = (source || "").trim();
  const dst = (translated || "").trim();
  if (!src || !dst || dst === src) return;
  mergeStoredPageRuntimeMap(pathname, language, { [src]: dst });
}
