"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"; 
import { flushSync } from "react-dom";
import {
  DEFAULT_LANGUAGE_CODE,
  buildTranslationsForLanguage,
  getLocalizedContent,
  isEnglishLanguage,
  resolveTranslation,
} from "@/lib/defaultTranslations";
import { formatTranslation } from "@/lib/formatTranslation";
import {
  languageCodesMatch,
  normalizeLanguageCode,
} from "@/lib/supportedLocales";
import {
  bootstrapInstantNavTranslations,
  cancelInflightBootstrap,
  clearMemoryBootstrapCache,
  ensureLanguageTranslations,
  getMemoryBootstrapCache,
  hasSubstantialTranslationCache,
  mergeMemoryBootstrapCache,
} from "@/lib/bootstrapTranslations";
import {
  clearStoredApiLayer,
  loadStoredApiLayer,
  saveStoredApiLayer,
} from "@/lib/translationStorage";
import { isAbortError } from "@/lib/isAbortError";
import { useHydrated } from "@/lib/useHydrated";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  getVisiblePathname,
  shouldLocalizePath,
  syncBrowserLocaleUrl,
  syncLanguageCookie,
} from "@/lib/localeRouting";
import {
  applyCachedLocalizedPageMeta,
  applyDirectLanguageTranslations,
  captureOriginalPageMeta,
  restoreAutoTranslatedEnglish,
  restoreEnglishPageMeta,
} from "@/lib/domAutoTranslate";
import {
  beginLanguageSwitch,
  endLanguageSwitch,
  getActiveSwitchTargetLanguage,
  isLanguageSwitchLocked,
} from "@/lib/i18nSwitchGuard";
import { isDomAutoTranslateReady } from "@/lib/i18nHydrationGate";
import { readStoredPageRuntimeMap } from "@/lib/pageRuntimeStorage";
import { runInstantLanguageSync } from "@/lib/i18nSyncBridge";
import { hydrateRuntimeCacheFromMap } from "@/lib/runtimeTranslate";

const LanguageContext = createContext();

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

async function parseJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return res.json();
}

function applyLanguageFont(languageOption) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const fontFamily = languageOption?.font_family?.trim();

  if (fontFamily) {
    const cleanFont = fontFamily.replace(/['"]/g, "");
    root.style.setProperty("--admin-font-family", cleanFont, "important");
    return;
  }

  window.dispatchEvent(new CustomEvent("fontSettingsUpdated"));
}

function buildLanguageOptions(apiLanguages) {
  return (apiLanguages || [])
    .filter((lang) => lang.is_active !== false && (lang.name || "").trim())
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, {
      sensitivity: "base",
    }));
}

function resolveLanguageOption(languageOptions, langCode) {
  return (
    languageOptions.find((lang) => languageCodesMatch(lang.code, langCode)) ||
    languageOptions[0] ||
    null
  );
}

function notifyLanguageApplied(
  langCode,
  languageOption,
  { immediate = false, translations = null } = {}
) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = langCode;
  applyLanguageFont(languageOption);
  window.dispatchEvent(
    new CustomEvent("languageChanged", {
      detail: { language: langCode, immediate, translations },
    })
  );
  window.dispatchEvent(
    new CustomEvent("translationsApplied", {
      detail: { language: langCode, immediate, translations },
    })
  );
}

function countUsableKeys(translations = {}) {
  return Object.keys(translations || {}).filter(
    (key) => (translations[key] || "").trim()
  ).length;
}

export function LanguageProvider({ children }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE_CODE);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [translations, setTranslations] = useState(() =>
    buildTranslationsForLanguage("en", {})
  );
  const initializedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [translationsRefreshToken, setTranslationsRefreshToken] = useState(0);
  const translationsCacheRef = useRef({ en: buildTranslationsForLanguage("en", {}) });
  const apiLayerRef = useRef({ en: {} });
  const prefetchStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("siteTranslationsV1");
      if (!raw) return;

      const stored = JSON.parse(raw);
      Object.entries(stored).forEach(([langCode, apiLayer]) => {
        if (!apiLayer || typeof apiLayer !== "object") return;
        const code = normalizeLanguageCode(langCode);
        apiLayerRef.current[code] = apiLayer;
        translationsCacheRef.current[code] = buildTranslationsForLanguage(
          code,
          apiLayer
        );
        mergeMemoryBootstrapCache(code, apiLayer);
      });
    } catch {
      // Ignore invalid storage payloads.
    }
  }, []);

  const languageOptions = useMemo(
    () => buildLanguageOptions(languages),
    [languages]
  );

  const activeLocaleCodes = useMemo(
    () => languageOptions.map((lang) => normalizeLanguageCode(lang.code)),
    [languageOptions]
  );

  const currentLanguage = useMemo(
    () => resolveLanguageOption(languageOptions, language),
    [languageOptions, language]
  );

  const translationsRequestRef = useRef(0);
  const translationsFetchAbortRef = useRef(null);
  const languagesFetchAbortRef = useRef(null);
  const activeLanguageRef = useRef(DEFAULT_LANGUAGE_CODE);
  const userLanguagePickRef = useRef(null);

  const applyTranslations = useCallback((langCode, apiTranslations = {}) => {
    const incoming =
      apiTranslations && typeof apiTranslations === "object" ? apiTranslations : {};

    apiLayerRef.current[langCode] = {
      ...(apiLayerRef.current[langCode] || {}),
      ...incoming,
    };

    mergeMemoryBootstrapCache(langCode, incoming);

    const merged = buildTranslationsForLanguage(
      langCode,
      apiLayerRef.current[langCode]
    );
    translationsCacheRef.current[langCode] = merged;
    saveStoredApiLayer(langCode, apiLayerRef.current[langCode]);

    const isActiveLanguage = languageCodesMatch(
      activeLanguageRef.current,
      langCode
    );
    const switchTarget = getActiveSwitchTargetLanguage();
    const canApplyDuringSwitch =
      isLanguageSwitchLocked() &&
      switchTarget &&
      languageCodesMatch(langCode, switchTarget);

    if (isActiveLanguage && (!isLanguageSwitchLocked() || canApplyDuringSwitch)) {
      setTranslations(merged);
    }

    return merged;
  }, []);

  const applyLanguageInstantly = useCallback(
    (langCode, languageOption, { immediate = false } = {}) => {
      const notify = () =>
        notifyLanguageApplied(langCode, languageOption, {
          immediate,
          translations: translationsCacheRef.current[langCode] || null,
        });

      const memoryCache = getMemoryBootstrapCache(langCode);
      if (memoryCache && countUsableKeys(memoryCache) > 0) {
        applyTranslations(langCode, memoryCache);
        notify();
        return hasSubstantialTranslationCache(
          translationsCacheRef.current[langCode]
        );
      }

      const cached = translationsCacheRef.current[langCode];
      if (cached && countUsableKeys(cached) > 0) {
        setTranslations(cached);
        notify();
        return hasSubstantialTranslationCache(cached);
      }

      const stored = loadStoredApiLayer(langCode);
      if (stored && countUsableKeys(stored) > 0) {
        apiLayerRef.current[langCode] = stored;
        applyTranslations(langCode, {});
        notify();
        return hasSubstantialTranslationCache(
          translationsCacheRef.current[langCode]
        );
      }

      const immediatePack = buildTranslationsForLanguage(langCode, {});
      setTranslations(immediatePack);
      translationsCacheRef.current[langCode] = immediatePack;
      notify();
      return false;
    },
    [applyTranslations]
  );

  const warmLanguageTranslations = useCallback(
    (langCode, requestId, { hadCache = false } = {}) => {
      if (isEnglishLanguage(langCode)) return;

      ensureLanguageTranslations(langCode, {
        onProgress: (partial) => {
          if (translationsRequestRef.current !== requestId) return;
          if (isLanguageSwitchLocked()) return;
          if (!partial || !Object.keys(partial).length) return;

          applyTranslations(langCode, partial);
          notifyLanguageApplied(
            langCode,
            resolveLanguageOption(languageOptions, langCode)
          );
        },
      })
        .then(() => {
          if (translationsRequestRef.current !== requestId) return;
          if (!hadCache) {
            notifyLanguageApplied(
              langCode,
              resolveLanguageOption(languageOptions, langCode)
            );
          }
        })
        .catch((error) => {
          if (!isAbortError(error)) {
            console.warn("Bootstrap translation failed:", error);
          }
        });
    },
    [applyTranslations, languageOptions]
  );

  const refreshTranslationsInBackground = useCallback(
    async (langCode, requestId, { forceFull = false, retryOnce = false } = {}) => {
      if (isEnglishLanguage(langCode)) {
        return;
      }

      const useFast =
        !forceFull &&
        !retryOnce &&
        hasSubstantialTranslationCache(translationsCacheRef.current[langCode]);

      const url = useFast
        ? `${API_BASE}/api/translations/language/${langCode}/?fast=1`
        : `${API_BASE}/api/translations/language/${langCode}/`;

      translationsFetchAbortRef.current?.abort();
      const controller = new AbortController();
      translationsFetchAbortRef.current = controller;

      try {
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (translationsRequestRef.current !== requestId) return;

        if (res.ok) {
          const data = await parseJsonResponse(res);
          if (data && typeof data === "object" && !Array.isArray(data)) {
            applyTranslations(langCode, data);
            notifyLanguageApplied(
              langCode,
              resolveLanguageOption(languageOptions, langCode)
            );

            if (
              !useFast &&
              !forceFull &&
              !hasSubstantialTranslationCache(
                translationsCacheRef.current[langCode]
              )
            ) {
              window.setTimeout(() => {
                if (translationsRequestRef.current !== requestId) return;
                refreshTranslationsInBackground(langCode, requestId, {
                  forceFull: true,
                  retryOnce: true,
                });
              }, 2000);
            }
          }
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("Translation Error:", error);
        }
      }
    },
    [applyTranslations, languageOptions]
  );

  const prefetchLanguagePack = useCallback(async (langCode) => {
    if (isEnglishLanguage(langCode)) return;
    if (hasSubstantialTranslationCache(translationsCacheRef.current[langCode])) {
      return;
    }

    const controller = new AbortController();

    try {
      const res = await fetch(
        `${API_BASE}/api/translations/language/${langCode}/?fast=1`,
        { cache: "no-store", signal: controller.signal }
      );

      if (!res.ok) return;

      const data = await parseJsonResponse(res);
      if (data && typeof data === "object" && !Array.isArray(data)) {
        applyTranslations(langCode, data);
      }
    } catch (error) {
      if (!isAbortError(error)) {
        // Prefetch is best-effort.
      }
    }

    if (!hasSubstantialTranslationCache(translationsCacheRef.current[langCode])) {
      ensureLanguageTranslations(langCode, {
        onProgress: (partial) => {
          if (!partial || !Object.keys(partial).length) return;
          applyTranslations(langCode, partial);
        },
      }).catch(() => {});
    }
  }, [applyTranslations]);

  useEffect(() => {
    async function fetchLanguages(signal) {
      setLanguagesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/languages/?active=true`, {
          signal,
        });

        if (!res.ok) return;

        const data = await parseJsonResponse(res);
        if (data?.success && Array.isArray(data.data)) {
          setLanguages(data.data);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("Failed to load languages:", error);
        }
      } finally {
        if (!signal.aborted) {
          setLanguagesLoading(false);
        }
      }
    }

    const controller = new AbortController();
    languagesFetchAbortRef.current = controller;
    fetchLanguages(controller.signal);

    const refreshLanguages = () => {
      languagesFetchAbortRef.current?.abort();
      const nextController = new AbortController();
      languagesFetchAbortRef.current = nextController;
      fetchLanguages(nextController.signal);
    };

    window.addEventListener("focus", refreshLanguages);
    window.addEventListener("languagesUpdated", refreshLanguages);

    return () => {
      controller.abort();
      window.removeEventListener("focus", refreshLanguages);
      window.removeEventListener("languagesUpdated", refreshLanguages);
    };
  }, []);

  useEffect(() => {
    const handleTranslationsUpdated = (event) => {
      const updatedCode = normalizeLanguageCode(event?.detail?.languageCode);

      if (updatedCode) {
        const cacheKeys = [
          ...Object.keys(translationsCacheRef.current),
          ...Object.keys(apiLayerRef.current),
        ];

        for (const key of new Set(cacheKeys)) {
          if (!languageCodesMatch(key, updatedCode)) continue;
          delete translationsCacheRef.current[key];
          delete apiLayerRef.current[key];
          clearStoredApiLayer(key);
          clearMemoryBootstrapCache(key);
        }
      } else {
        translationsCacheRef.current = {};
        apiLayerRef.current = {};
        clearStoredApiLayer();
        clearMemoryBootstrapCache();
      }

      setTranslationsRefreshToken((token) => token + 1);
    };

    window.addEventListener("translationsUpdated", handleTranslationsUpdated);

    return () => {
      window.removeEventListener("translationsUpdated", handleTranslationsUpdated);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !languageOptions.length) return;
  
    // prevent multiple execution
    if (initializedRef.current) return;
    initializedRef.current = true;
  
    // if user manually selected language → do nothing
    if (
      userLanguagePickRef.current &&
      languageOptions.some((lang) =>
        languageCodesMatch(lang.code, userLanguagePickRef.current)
      )
    ) {
      return;
    }
  
    const visiblePath = getVisiblePathname(pathname);
  
    const urlLanguage = shouldLocalizePath(visiblePath)
      ? getLocaleFromPathname(visiblePath)
      : DEFAULT_LANGUAGE_CODE;
  
    const urlAvailable = languageOptions.some((lang) =>
      languageCodesMatch(lang.code, urlLanguage)
    );
  
    // 1. URL language (highest priority)
    if (urlAvailable && !userLanguagePickRef.current) {
      const normalized = normalizeLanguageCode(urlLanguage);
      setLanguageState(normalized);
      localStorage.setItem("language", normalized);
      return;
    }
  
    // 2. saved language
    const savedLanguage = normalizeLanguageCode(
      localStorage.getItem("language")
    );
  
    const isAvailable = languageOptions.some((lang) =>
      languageCodesMatch(lang.code, savedLanguage)
    );
  
    if (isAvailable && !userLanguagePickRef.current) {
      setLanguageState(savedLanguage);
      return;
    }
  
    // 3. fallback language
    const fallback = normalizeLanguageCode(
      languageOptions[0]?.code || DEFAULT_LANGUAGE_CODE
    );
  
    setLanguageState(fallback);
    localStorage.setItem("language", fallback);
  }, [languageOptions, hydrated, pathname, activeLocaleCodes]);

  useEffect(() => {
    if (!hydrated) return;
    if (prefetchStartedRef.current || languageOptions.length <= 1) return;
    prefetchStartedRef.current = true;

    languageOptions.forEach((lang) => {
      const langCode = normalizeLanguageCode(lang.code);
      prefetchLanguagePack(langCode);
    });
  }, [languageOptions, hydrated, prefetchLanguagePack]);

  useEffect(() => {
    activeLanguageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSwitchBegin = () => setLoading(true);
    const handleViewportComplete = () => setLoading(false);
    const handleTranslationComplete = () => setLoading(false);

    window.addEventListener("languageSwitchBegin", handleSwitchBegin);
    window.addEventListener(
      "languageTranslationViewportComplete",
      handleViewportComplete
    );
    window.addEventListener(
      "languageTranslationComplete",
      handleTranslationComplete
    );

    return () => {
      window.removeEventListener("languageSwitchBegin", handleSwitchBegin);
      window.removeEventListener(
        "languageTranslationViewportComplete",
        handleViewportComplete
      );
      window.removeEventListener(
        "languageTranslationComplete",
        handleTranslationComplete
      );
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const requestId = translationsRequestRef.current + 1;
    translationsRequestRef.current = requestId;

    const langOption = resolveLanguageOption(languageOptions, language);
    if (!langOption) {
      setTranslations({});
      return;
    }

    const langCode = normalizeLanguageCode(langOption.code);
    const hadCache = applyLanguageInstantly(langCode, langOption);
    localStorage.setItem("language", langCode);

    if (isEnglishLanguage(langCode)) {
      return;
    }

    warmLanguageTranslations(langCode, requestId, { hadCache });
    refreshTranslationsInBackground(langCode, requestId, { forceFull: !hadCache });
  }, [
    language,
    languageOptions,
    applyLanguageInstantly,
    warmLanguageTranslations,
    refreshTranslationsInBackground,
    translationsRefreshToken,
    hydrated,
  ]);

  const setLanguage = useCallback(
    (code) => {
      const nextLanguageOption =
        resolveLanguageOption(languageOptions, code) || languageOptions[0];
      const nextLanguage = normalizeLanguageCode(
        nextLanguageOption?.code || DEFAULT_LANGUAGE_CODE
      );

      const completeSwitch = async () => {
        setLoading(true);
        beginLanguageSwitch(nextLanguage);
        translationsFetchAbortRef.current?.abort();
        languagesFetchAbortRef.current?.abort();
        cancelInflightBootstrap();

        translationsRequestRef.current += 1;
        const requestId = translationsRequestRef.current;

        userLanguagePickRef.current = nextLanguage;
        activeLanguageRef.current = nextLanguage;
        localStorage.setItem("language", nextLanguage);

        if (!isEnglishLanguage(nextLanguage)) {
          try {
            const priorityPack =
              await bootstrapInstantNavTranslations(nextLanguage);
            if (
              priorityPack &&
              Object.keys(priorityPack).length &&
              languageCodesMatch(activeLanguageRef.current, nextLanguage)
            ) {
              mergeMemoryBootstrapCache(nextLanguage, priorityPack);
            }
          } catch (error) {
            if (!isAbortError(error)) {
              console.warn("Priority nav translation failed:", error);
            }
          }
        }

        if (typeof window !== "undefined") {
          const visiblePath = getVisiblePathname(pathname);
          captureOriginalPageMeta(visiblePath);

          if (isEnglishLanguage(nextLanguage)) {
            restoreEnglishPageMeta();
            restoreAutoTranslatedEnglish(document.body);
          } else {
            hydrateRuntimeCacheFromMap(
              nextLanguage,
              readStoredPageRuntimeMap(visiblePath, nextLanguage)
            );
            applyCachedLocalizedPageMeta(nextLanguage);
          }
        }

        let hadCache = false;
        flushSync(() => {
          hadCache = applyLanguageInstantly(nextLanguage, nextLanguageOption, {
            immediate: true,
          });
          setLanguageState(nextLanguage);
          setTranslationsRefreshToken((token) => token + 1);
        });

        const instantPack = translationsCacheRef.current[nextLanguage];
        if (
          typeof document !== "undefined" &&
          !isEnglishLanguage(nextLanguage) &&
          isDomAutoTranslateReady()
        ) {
          applyDirectLanguageTranslations(
            getVisiblePathname(pathname),
            nextLanguage,
            document.body
          );
        }
        runInstantLanguageSync(instantPack, nextLanguage);

        if (typeof window !== "undefined") {
          const visiblePath = getVisiblePathname(pathname);
          if (shouldLocalizePath(visiblePath, activeLocaleCodes)) {
            syncBrowserLocaleUrl(visiblePath, nextLanguage, {
              search: window.location.search,
              hash: window.location.hash,
              activeLocales: activeLocaleCodes,
            });
          } else {
            syncLanguageCookie(nextLanguage);
          }
        }

        window.setTimeout(() => {
          if (userLanguagePickRef.current === nextLanguage) {
            userLanguagePickRef.current = null;
          }
        }, 0);

        if (isEnglishLanguage(nextLanguage)) {
          setLoading(false);
          endLanguageSwitch();
          return;
        }

        warmLanguageTranslations(nextLanguage, requestId, { hadCache });
        refreshTranslationsInBackground(nextLanguage, requestId, {
          forceFull: !hadCache,
        });

        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            if (!languageCodesMatch(activeLanguageRef.current, nextLanguage)) {
              return;
            }
            if (isLanguageSwitchLocked()) {
              endLanguageSwitch();
              setLoading(false);
            }
          }, 45000);
        }
      };

      void completeSwitch();
    },
    [
      languageOptions,
      applyLanguageInstantly,
      warmLanguageTranslations,
      refreshTranslationsInBackground,
      language,
      pathname,
      activeLocaleCodes,
    ]
  );

  const t = useCallback(
    (key) => resolveTranslation(translations, key, language),
    [translations, language]
  );

  const tf = useCallback(
    (key, vars = {}) => formatTranslation(t(key), vars),
    [t]
  );

  const lt = useCallback(
    (key, apiValue = "") =>
      getLocalizedContent(translations, language, key, apiValue),
    [translations, language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: languageOptions,
      languagesLoading,
      currentLanguage,
      translations,
      loading,
      t,
      tf,
      lt,
      translationsRefreshToken,
    }),
    [
      language,
      setLanguage,
      languageOptions,
      languagesLoading,
      currentLanguage,
      translations,
      loading,
      t,
      tf,
      lt,
      translationsRefreshToken,
    ]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useOptionalLanguage() {
  return useContext(LanguageContext);
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}

export function useLocalizedContent(key, apiValue = "") {
  const { lt } = useLanguage();
  return lt(key, apiValue);
}
