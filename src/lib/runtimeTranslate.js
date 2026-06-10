import { isEnglishLanguage } from "@/lib/defaultTranslations";
import { isAbortError } from "@/lib/isAbortError";
import {
  getLanguageSwitchGeneration,
  isStaleLanguageSwitch,
} from "@/lib/i18nSwitchGuard";
import { localizeRuntimeTranslation } from "@/lib/termLocalizations";
import { toTranslateLanguageCode } from "@/lib/translateLanguageCode";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const cache = new Map();
const pending = new Map();

function cacheKey(language, text) {
  return `${toTranslateLanguageCode(language)}::${text}`;
}

export function clearRuntimeTranslationCache(language) {
  if (!language) {
    cache.clear();
    pending.clear();
    return;
  }

  const prefix = `${toTranslateLanguageCode(language)}::`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  for (const key of pending.keys()) {
    if (key.startsWith(prefix)) pending.delete(key);
  }
}

export async function translateRuntimeTexts(texts, language) {
  const requestGeneration = getLanguageSwitchGeneration();
  const target = toTranslateLanguageCode(language);
  const unique = [];
  const indexMap = [];

  (texts || []).forEach((text, index) => {
    const value = (text || "").trim();
    if (!value) {
      indexMap[index] = -1;
      return;
    }

    if (target === "en") {
      indexMap[index] = unique.push(value) - 1;
      return;
    }

    const key = cacheKey(target, value);
    if (cache.has(key)) {
      indexMap[index] = -2;
      return;
    }

    indexMap[index] = unique.push(value) - 1;
  });

  if (!isEnglishLanguage(language) && unique.length > 0) {
    const requestKey = `${target}::${unique.join("\u0001")}`;
    let request = pending.get(requestKey);

    if (!request) {
      request = fetch(`${API_BASE}/api/translations/runtime/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_lang: language,
          texts: unique,
        }),
      })
        .then(async (res) => {
          if (!res.ok) return unique;
          const data = await res.json();
          const translated = Array.isArray(data?.translations)
            ? data.translations
            : unique;

          unique.forEach((source, idx) => {
            const result = localizeRuntimeTranslation(
              source,
              translated[idx],
              language
            );
            if (result && result !== source) {
              rememberRuntimeTranslation(language, source, result);
            }
          });

          return translated;
        })
        .catch((error) => {
          if (!isAbortError(error)) {
            console.warn("Runtime translation request failed:", error);
          }
          return unique;
        })
        .finally(() => {
          pending.delete(requestKey);
        });

      pending.set(requestKey, request);
    }

    await request;

    if (isStaleLanguageSwitch(requestGeneration, language)) {
      return (texts || []).map((text) => text || "");
    }
  }

  return (texts || []).map((text, index) => {
    const value = (text || "").trim();
    if (!value) return text || "";

    if (isEnglishLanguage(language)) {
      return value;
    }

    const key = cacheKey(target, value);
    if (cache.has(key)) {
      return cache.get(key);
    }

    if (indexMap[index] >= 0) {
      const source = unique[indexMap[index]];
      const translated = cache.get(cacheKey(target, source));
      if (translated) return translated;
      return localizeRuntimeTranslation(source, "", language);
    }

    return localizeRuntimeTranslation(value, "", language);
  });
}

export async function translateRuntimeText(text, language) {
  const results = await translateRuntimeTexts([text], language);
  return results[0] || text || "";
}

export function rememberRuntimeTranslation(language, source, translated) {
  const src = (source || "").trim();
  const dst = (translated || "").trim();
  if (!src || !dst || dst === src || isEnglishLanguage(language)) return;

  const target = toTranslateLanguageCode(language);
  cache.set(cacheKey(target, src), dst);
}

export function hydrateRuntimeCacheFromMap(language, map = {}) {
  if (!map || typeof map !== "object" || isEnglishLanguage(language)) return;

  Object.entries(map).forEach(([source, translated]) => {
    rememberRuntimeTranslation(language, source, translated);
  });
}

export function getRuntimeCachedTranslation(text, language) {
  const value = (text || "").trim();
  const target = toTranslateLanguageCode(language);

  if (!value || target === "en" || target.startsWith("en")) {
    return "";
  }

  const cached = cache.get(cacheKey(target, value));
  if (cached) return cached;

  const localized = localizeRuntimeTranslation(value, "", language);
  return localized !== value ? localized : "";
}
