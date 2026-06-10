import {

  DEFAULT_TRANSLATIONS,

  getEnglishSourceForKey,

  isEnglishLanguage,

} from "@/lib/defaultTranslations";

import { SITE_UI_EN } from "@/lib/siteUiTranslations";
import { CMS_KEY_ALIASES } from "@/lib/i18nAliases";

import { normalizeLanguageCode } from "@/lib/supportedLocales";

import { translateRuntimeTexts } from "@/lib/runtimeTranslate";



/** Keys applied first on language switch (nav, footer, hero, common). */

const PRIORITY_UI_KEYS = [

  "nav.home",

  "nav.categories",

  "nav.all_exams",

  "nav.providers",

  "nav.blogs",

  "nav.blog",

  "nav.testimonials",

  "nav.popular_exams",

  "auth.login",

  "auth.signup",

  "auth.logout",

  "auth.dashboard",

  "auth.my_dashboard",

  "auth.profile",

  "footer.providers_title",

  "footer.resources_title",

  "footer.legal_title",

  "footer.contact_title",

  "footer.blogs",

  "footer.faq",

  "footer.privacy_policy",

  "footer.terms",

  "footer.loading",

  "footer.copyright",

  "common.loading",

  "common.read_more",

  "common.view_all",

  "common.practice_now",

  "common.start_practicing",

  "common.select_language",

  "common.toggle_menu",

  "home.hero.title",

  "home.hero.subtitle",

  "home.search.provider",

  "home.search.placeholder",

  "home.search.button",

  "home.categories.heading",

  "home.featured.heading",

  "home.value.heading",

  "home.providers.heading",

  "home.testimonials.heading",

  "home.blog.heading",

  "home.faq.heading",

  "home.subscribe.title",
  "home.subscribe.subtitle",
  "home.subscribe.button",
  "home.subscribe.placeholder",
  "home.hero.stat1.label",
  "home.hero.stat2.label",
  "home.hero.stat3.label",
  "home.hero.stat4.label",
  "home.hero.stat5.label",
  "home.hero.stat6.label",
  ...Object.values(CMS_KEY_ALIASES).filter((key) => key.startsWith("home.")),
];



const BATCH_SIZE = 50;

const BATCH_CONCURRENCY = 6;



/** Minimum keys in cache before we skip a full translation fetch. */

export const MIN_TRANSLATION_CACHE_KEYS = 20;



const memoryBootstrapCache = new Map();

const inflightBootstrap = new Map();



function getAllStaticEnglishKeys() {

  return [

    ...new Set([

      ...Object.keys(DEFAULT_TRANSLATIONS),

      ...Object.keys(SITE_UI_EN),

    ]),

  ].filter((key) => getEnglishSourceForKey(key));

}



function mergeTranslatedKeys(keys, englishTexts, translated) {

  const result = {};

  keys.forEach((key, index) => {

    const value = (translated[index] || "").trim();

    const english = englishTexts[index];

    if (value && value !== english) {

      result[key] = value;

    }

  });

  return result;

}



async function translateKeysOnce(language, keys) {

  const pairs = keys

    .map((key) => ({ key, english: getEnglishSourceForKey(key) }))

    .filter((item) => item.english);



  if (!pairs.length) return {};



  const englishTexts = pairs.map((item) => item.english);

  const translated = await translateRuntimeTexts(englishTexts, language);



  return mergeTranslatedKeys(

    pairs.map((item) => item.key),

    englishTexts,

    translated

  );

}



async function translateKeysInParallel(language, keys, onBatch) {

  const batches = [];

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {

    batches.push(keys.slice(i, i + BATCH_SIZE));

  }



  const result = {};



  for (let i = 0; i < batches.length; i += BATCH_CONCURRENCY) {

    const chunk = batches.slice(i, i + BATCH_CONCURRENCY);

    const chunkResults = await Promise.all(

      chunk.map((batch) => translateKeysOnce(language, batch))

    );



    chunkResults.forEach((partial) => {

      Object.assign(result, partial);

      if (onBatch && Object.keys(partial).length) {

        onBatch(partial);

      }

    });

  }



  return result;

}



export function countTranslationKeys(translations = {}) {

  return Object.keys(translations || {}).filter(

    (key) => (translations[key] || "").trim()

  ).length;

}



export function hasSubstantialTranslationCache(translations = {}) {

  return countTranslationKeys(translations) >= MIN_TRANSLATION_CACHE_KEYS;

}



export function getMemoryBootstrapCache(language) {

  const code = normalizeLanguageCode(language);

  return memoryBootstrapCache.get(code) || null;

}



export function mergeMemoryBootstrapCache(language, partial = {}) {

  const code = normalizeLanguageCode(language);

  if (!code || !partial || typeof partial !== "object") return {};



  const merged = {

    ...(memoryBootstrapCache.get(code) || {}),

    ...partial,

  };

  memoryBootstrapCache.set(code, merged);

  return merged;

}



export function clearMemoryBootstrapCache(language) {

  if (!language) {

    memoryBootstrapCache.clear();

    inflightBootstrap.clear();

    return;

  }



  const code = normalizeLanguageCode(language);

  memoryBootstrapCache.delete(code);

  inflightBootstrap.delete(code);

}



/** Drop in-flight bootstrap work so stale partials cannot merge after a switch. */
export function cancelInflightBootstrap(language) {
  if (!language) {
    inflightBootstrap.clear();
    return;
  }

  inflightBootstrap.delete(normalizeLanguageCode(language));
}



export async function bootstrapInstantNavTranslations(language) {

  if (isEnglishLanguage(language)) return {};

  return translateKeysOnce(language, PRIORITY_UI_KEYS);

}



export async function bootstrapAllStaticTranslations(language, onBatch) {

  if (isEnglishLanguage(language)) return {};



  const prioritySet = new Set(PRIORITY_UI_KEYS);

  const remaining = getAllStaticEnglishKeys().filter((key) => !prioritySet.has(key));

  return translateKeysInParallel(language, remaining, onBatch);

}



/**

 * Load translations for a language: priority UI first, then the rest in parallel.

 * Reuses in-flight work and memory cache for instant re-selection.

 */

export async function ensureLanguageTranslations(language, { onProgress } = {}) {

  const code = normalizeLanguageCode(language);

  if (isEnglishLanguage(code)) return {};



  const cached = memoryBootstrapCache.get(code);

  if (cached && hasSubstantialTranslationCache(cached)) {

    onProgress?.(cached, { complete: true });

    return cached;

  }



  const inflight = inflightBootstrap.get(code);

  if (inflight) {

    return inflight;

  }



  const task = (async () => {

    const priority = await bootstrapInstantNavTranslations(code);

    if (Object.keys(priority).length) {

      mergeMemoryBootstrapCache(code, priority);

      onProgress?.(priority, { complete: false });

    }



    const rest = await bootstrapAllStaticTranslations(code, (partial) => {

      mergeMemoryBootstrapCache(code, partial);

      onProgress?.(partial, { complete: false });

    });



    if (Object.keys(rest).length) {

      mergeMemoryBootstrapCache(code, rest);

      onProgress?.(rest, { complete: false });

    }



    const finalCache = memoryBootstrapCache.get(code) || {};

    onProgress?.(finalCache, { complete: true });

    return finalCache;

  })();



  inflightBootstrap.set(code, task);



  try {

    return await task;

  } finally {

    inflightBootstrap.delete(code);

  }

}



/** @deprecated Use ensureLanguageTranslations for progressive loading. */

export async function bootstrapLanguageTranslations(language) {

  return ensureLanguageTranslations(language);

}


