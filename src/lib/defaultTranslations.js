import {
  isCmsContentKey,
  isCmsManagedKey,
  lookupTranslation,
  mirrorAliasKeys,
  resolveAliasKey,
} from "@/lib/i18nAliases";
import { LOCALE_TEMPLATES } from "@/lib/localeTemplates";
import { getRuntimeCachedTranslation } from "@/lib/runtimeTranslate";
import { localizeRuntimeTranslation } from "@/lib/termLocalizations";
import { SITE_UI_EN, SITE_UI_FR } from "@/lib/siteUiTranslations";

const SITE_UI_BY_LANG = {
  en: SITE_UI_EN,
  fr: SITE_UI_FR,
};

/** Internal fallback when resolving English UI; not shown in the language dropdown. */
export const DEFAULT_LANGUAGE_CODE = "en";

export const DEFAULT_TRANSLATIONS = {
  "nav.home": "Home",
  "nav.categories": "Categories",
  "nav.all_exams": "All Exams",
  "nav.providers": "Providers",
  "nav.blogs": "Blogs",
  "nav.blog": "Blog",
  "nav.testimonials": "Testimonials",
  "nav.popular_exams": "Popular Exams",
  "auth.login": "Login",
  "auth.signup": "Sign Up",
  "auth.dashboard": "Dashboard",
  "auth.my_dashboard": "My Dashboard",
  "auth.profile": "View Profile",
  "auth.logout": "Logout",
  "footer.providers_title": "Exam Providers Covered",
  "footer.resources_title": "Resources",
  "footer.legal_title": "Legal",
  "footer.contact_title": "Contact Us",
  "footer.blogs": "Blogs",
  "footer.faq": "FAQ",
  "footer.privacy_policy": "Privacy Policy",
  "footer.terms": "Terms & Conditions",
  "footer.refund_policy": "Refund & Cancellation Policy",
  "footer.disclaimer": "Disclaimer",
  "footer.editor_policy": "Editor Policy",
  "footer.contact_us": "Contact Us",
  "footer.loading": "Loading...",
  "footer.no_providers": "No providers available",
  "footer.ssl_secure": "SSL Secure",
  "footer.copyright": "© 2025 AllExamQuestions. All rights reserved.",
  "footer.brand_line": "A Brand of TutorKhoj Private Limited",
  "home.hero.title": "Your Shortcut to Passing Any Certification Exam",
  "home.hero.subtitle":
    "Accurate, updated, exam-style questions trusted by thousands of professionals preparing for their next big certification.",
  "home.hero.stat1.label": "matched real exam difficulty",
  "home.hero.stat2.label": "passed using our practice",
  "home.hero.stat3.label": "monthly practice sessions",
  "home.faq.section.heading": "Section Content",
  "home.search.provider": "Select Provider",
  "home.search.placeholder": "Search exams, codes, or keywords...",
  "home.search.button": "Search",
  "home.categories.heading": "Top Certification Categories",
  "home.categories.subtitle": "Explore certifications by category",
  "home.featured.heading": "Featured Exams",
  "home.featured.subtitle": "",
  "home.value.heading": "Why Choose AllExamQuestions?",
  "home.value.subtitle":
    "Everything you need to ace your certification exam in one place",
  "home.providers.heading": "Popular Providers",
  "home.providers.subtitle": "Trusted by professionals worldwide",
  "home.providers.disclaimer":
    "Logos and trademarks are the property of their respective owners. AllExamQuestions is not affiliated with or endorsed by these organizations.",
  "home.recent.heading": "Recently Updated Exams",
  "home.recent.subtitle": "",
  "home.testimonials.heading": "Success Stories From Real Learners",
  "home.testimonials.subtitle":
    "Real experiences from professionals who passed using AllExamQuestions",
  "home.blog.heading": "Latest Blog Posts",
  "home.blog.subtitle": "Stay updated with certification tips and news",
  "home.faq.heading": "Frequently Asked Questions",
  "home.faq.subtitle":
    "Clear answers to the most common questions our learners ask.",
  "home.subscribe.title": "Get Free Weekly Exam Updates",
  "home.subscribe.subtitle":
    "Latest dumps, new questions & exam alerts delivered to your inbox",
  "home.subscribe.button": "Subscribe",
  "home.subscribe.privacy":
    "No spam. Unsubscribe anytime. Your privacy is protected.",
  "home.subscribe.placeholder": "Enter your email address",
  "home.subscribe.loading": "Subscribing...",
  "home.subscribe.success": "Successfully subscribed!",
  "home.subscribe.error": "Subscription failed. Please try again.",
  "home.featured.practice_exams": "Practice Exams",
  "home.featured.questions": "Questions",
  "home.featured.start_practicing": "Start Practicing",
  "home.recent.practice_now": "Practice Now",
  "home.recent.meta": "Practice Exams · {questions} Questions",
  "home.blog.read_more": "Read More",
  "home.seo.heading": "All Exam Questions for Top Certification Exams",
  "footer.disclaimer_text": "All trademarks, certification names, course titles, and logos displayed on this website are the property of their respective owners and are used solely for identification and informational purposes. AllExamQuestions is an independent exam preparation platform and is not affiliated with, endorsed by, authorized by, or sponsored by any exam provider, certification body, or brand mentioned on this website.",
  "common.loading": "Loading...",
  "common.read_more": "Read More",
  "common.view_all": "View All",
  "common.practice_now": "Practice Now",
  "common.start_practicing": "Start Practicing",
};

function resolveRuntimeFallback(language, apiValue) {
  const value = (apiValue || "").trim();
  if (!value) return "";
  const cached = getRuntimeCachedTranslation(value, language);
  if (cached) return cached;
  return localizeRuntimeTranslation(value, "", language);
}

function lookupCatalogTranslation(language, key) {
  const langCode = (language || "en").toLowerCase().split("-")[0];
  const alias = resolveAliasKey(key);

  return (
    LOCALE_TEMPLATES[langCode]?.[key] ||
    LOCALE_TEMPLATES[langCode]?.[alias] ||
    SITE_UI_BY_LANG[langCode]?.[key] ||
    SITE_UI_BY_LANG[langCode]?.[alias] ||
    ""
  );
}

export function getEnglishSourceForKey(key) {
  return (DEFAULT_TRANSLATIONS[key] || SITE_UI_EN[key] || "").trim();
}

/** Core chrome labels (nav, auth, footer) — must never render empty. */
export function isCoreUiKey(key) {
  if (!key || isCmsContentKey(key) || isCmsManagedKey(key)) return false;
  return Object.prototype.hasOwnProperty.call(DEFAULT_TRANSLATIONS, key);
}

export function sanitizeTranslationsForLanguage(language, translations = {}) {
  if (isEnglishLanguage(language)) {
    return translations;
  }

  const result = { ...translations };

  for (const key of Object.keys(result)) {
    const english = getEnglishSourceForKey(key);
    const value = (result[key] || "").trim();
    if (english && value === english) {
      delete result[key];
    }
  }

  return result;
}

export function buildTranslationsForLanguage(language, apiTranslations = {}) {
  const langCode = (language || "en").toLowerCase().split("-")[0];
  const siteUi = SITE_UI_BY_LANG[langCode] || {};
  const api =
    apiTranslations && typeof apiTranslations === "object" ? apiTranslations : {};
  const sanitizedApi =
    langCode === "en" ? api : sanitizeTranslationsForLanguage(langCode, api);
  const base =
    langCode === "en"
      ? { ...DEFAULT_TRANSLATIONS, ...siteUi }
      : { ...(LOCALE_TEMPLATES[langCode] || {}), ...siteUi };

  return mirrorAliasKeys({
    ...base,
    ...sanitizedApi,
  });
}

export function isEnglishLanguage(language) {
  return (language || "en").toLowerCase().split("-")[0] === "en";
}

/** True when a non-English locale still carries the default English UI string. */
export function isStaleEnglishTranslation(language, key, value, englishHint = "") {
  if (isEnglishLanguage(language)) return false;
  const trimmed = (value || "").trim();
  if (!trimmed) return true;
  const english = (englishHint || getEnglishSourceForKey(key) || "").trim();
  return Boolean(english && trimmed === english);
}

export { isCmsContentKey } from "@/lib/i18nAliases";

export function resolveTranslation(translations, key, language = "en") {
  if (isEnglishLanguage(language)) {
    const fromTranslations = lookupTranslation(translations, key);
    if (fromTranslations) {
      return fromTranslations;
    }
    return DEFAULT_TRANSLATIONS[key] || SITE_UI_EN[key] || "";
  }

  if (isCmsManagedKey(key)) {
    const fromTranslations = lookupTranslation(translations, key);
    if (
      fromTranslations &&
      !isStaleEnglishTranslation(language, key, fromTranslations)
    ) {
      return fromTranslations;
    }

    const fromCatalog = lookupCatalogTranslation(language, key);
    if (fromCatalog && !isStaleEnglishTranslation(language, key, fromCatalog)) {
      return fromCatalog;
    }

    const runtimeValue = resolveRuntimeFallback(
      language,
      getEnglishSourceForKey(key)
    );
    if (runtimeValue) return runtimeValue;

    return "";
  }

  const fromTranslations = lookupTranslation(translations, key);
  if (
    fromTranslations &&
    !isStaleEnglishTranslation(language, key, fromTranslations)
  ) {
    return fromTranslations;
  }

  const fromCatalog = lookupCatalogTranslation(language, key);
  if (fromCatalog && !isStaleEnglishTranslation(language, key, fromCatalog)) {
    return fromCatalog;
  }

  const runtimeValue = resolveRuntimeFallback(
    language,
    getEnglishSourceForKey(key)
  );
  if (runtimeValue) return runtimeValue;

  if (isCoreUiKey(key)) {
    return getEnglishSourceForKey(key) || "";
  }

  return "";
}

// Phase D: prefer API per-lang fields when backend adds them (e.g. hero.title_hi).
export function getLocalizedContent(translations, language, key, apiValue = "") {
  const adminValue = (apiValue || "").trim();

  if (isEnglishLanguage(language)) {
    if (adminValue) return apiValue;
    const fromTranslations = lookupTranslation(translations, key);
    if (fromTranslations) return fromTranslations;
    return DEFAULT_TRANSLATIONS[key] || SITE_UI_EN[key] || "";
  }

  if (isCmsManagedKey(key)) {
    const fromTranslations = lookupTranslation(translations, key);
    if (
      fromTranslations &&
      !isStaleEnglishTranslation(language, key, fromTranslations, adminValue)
    ) {
      return fromTranslations;
    }

    const fromCatalog = lookupCatalogTranslation(language, key);
    if (
      fromCatalog &&
      !isStaleEnglishTranslation(language, key, fromCatalog, adminValue)
    ) {
      return fromCatalog;
    }

    const runtimeValue = resolveRuntimeFallback(language, apiValue);
    if (runtimeValue) return runtimeValue;

    return "";
  }

  const fromTranslations = lookupTranslation(translations, key);
  if (
    fromTranslations &&
    !isStaleEnglishTranslation(language, key, fromTranslations, adminValue)
  ) {
    return fromTranslations;
  }

  const fromCatalog = lookupCatalogTranslation(language, key);
  if (
    fromCatalog &&
    !isStaleEnglishTranslation(language, key, fromCatalog, adminValue)
  ) {
    return fromCatalog;
  }

  const runtimeValue = resolveRuntimeFallback(
    language,
    adminValue || getEnglishSourceForKey(key)
  );
  if (runtimeValue) return runtimeValue;

  if (adminValue) return apiValue;

  if (isCoreUiKey(key)) {
    return getEnglishSourceForKey(key) || "";
  }

  return "";
}
