"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getEnglishSourceForKey,
  getLocalizedContent,
  isEnglishLanguage,
} from "@/lib/defaultTranslations";
import {
  applyAutoTranslateTargets,
  applyCachedLocalizedPageMeta,
  applyDirectLanguageTranslations,
  captureOriginalPageMeta,
  captureOriginalTexts,
  collectAutoTranslateTargets,
  collectTextNodesInElement,
  prefetchPageRuntimeTranslations,
  reconcileTranslatedTextNodes,
  restoreAutoTranslatedEnglish,
  restoreEnglishPageMeta,
  stripLegacyAutoAttrMarkers,
  syncLocalizedPageMeta,
} from "@/lib/domAutoTranslate";
import { readStoredPageRuntimeMap } from "@/lib/pageRuntimeStorage";
import { hydrateRuntimeCacheFromMap } from "@/lib/runtimeTranslate";
import { normalizeLanguageCode } from "@/lib/supportedLocales";
import {
  isReactManagedNode,
  updateElementTextSafe,
} from "@/lib/domI18nUtils";
import {
  getRuntimeCachedTranslation,
  translateRuntimeTexts,
} from "@/lib/runtimeTranslate";
import { isAbortError } from "@/lib/isAbortError";
import { useHydrated } from "@/lib/useHydrated";
import {
  isDomAutoTranslateReady,
  markDomAutoTranslateReady,
} from "@/lib/i18nHydrationGate";
import { setInstantLanguageHandler } from "@/lib/i18nSyncBridge";
import {
  endLanguageSwitch,
  isLanguageSwitchLocked,
  shouldApplyDomTranslation,
} from "@/lib/i18nSwitchGuard";
import {
  collectPageSections,
  isElementInViewport,
  markSectionTranslating,
  orderSectionsForTranslation,
} from "@/lib/sectionTranslate";

function readFallback(element, attributeName, currentValue = "") {
  const fromAttribute = element.getAttribute(attributeName);
  if (fromAttribute != null && fromAttribute !== "") {
    return fromAttribute;
  }
  return currentValue;
}

function collectPendingRuntime(pending, language, source, element, mode, attrName) {
  const value = (source || "").trim();
  if (isEnglishLanguage(language) || !value) return;
  pending.push({ element, mode, source: value, attrName });
}

function queueRuntimeIfUntranslated(
  pending,
  language,
  fallback,
  nextValue,
  element,
  mode,
  attrName
) {
  const trimmedFallback = (fallback || "").trim();
  const trimmedNext = (nextValue || "").trim();
  if (!trimmedFallback) return;
  if (!trimmedNext || trimmedNext === trimmedFallback) {
    collectPendingRuntime(pending, language, fallback, element, mode, attrName);
  }
}

function resolveEffectiveLocalized(nextValue, fallback, language) {
  const trimmedNext = (nextValue || "").trim();
  if (trimmedNext) return nextValue;

  const trimmedFallback = (fallback || "").trim();
  if (!trimmedFallback || isEnglishLanguage(language)) {
    return fallback || "";
  }

  const runtime = getRuntimeCachedTranslation(trimmedFallback, language);
  if (runtime) return runtime;

  return fallback || "";
}

function isInsideSelect(element) {
  return Boolean(element?.closest?.("select"));
}

const BREADCRUMB_LABEL_TO_KEY = {
  Home: "breadcrumb.home",
  Categories: "nav.categories",
  Providers: "nav.providers",
  "All Exams": "nav.all_exams",
  Exams: "nav.all_exams",
  Blog: "nav.blog",
  Blogs: "nav.blogs",
  Testimonials: "nav.testimonials",
};

function syncBreadcrumbDom(translations, language) {
  if (typeof document === "undefined" || isEnglishLanguage(language)) return;

  document
    .querySelectorAll('[data-slot="breadcrumb"], nav[aria-label="breadcrumb"]')
    .forEach((root) => {
      root
        .querySelectorAll(
          "a, [data-slot='breadcrumb-page'], [data-slot='breadcrumb-link']"
        )
        .forEach((element) => {
          if (isReactManagedNode(element)) return;

          const key = element.getAttribute("data-i18n");
          const current = (element.textContent || "").trim();
          const catalogKey = key || BREADCRUMB_LABEL_TO_KEY[current];
          if (!catalogKey) return;

          const fallback =
            readFallback(element, "data-i18n-fallback", current) ||
            getEnglishSourceForKey(catalogKey) ||
            current;

          const nextText = getLocalizedContent(
            translations,
            language,
            catalogKey,
            fallback
          );
          const effectiveText = resolveEffectiveLocalized(
            nextText,
            fallback,
            language
          );

          if (effectiveText) {
            updateElementTextSafe(element, effectiveText);
          }
        });
    });
}

function queryWithinScope(scopeRoot, selector) {
  if (!scopeRoot || scopeRoot === document) {
    return [...document.querySelectorAll(selector)];
  }
  return [...scopeRoot.querySelectorAll(selector)];
}

function applyI18nDomSync(translations, language, scopeRoot = null) {
  if (typeof document === "undefined") return [];

  const pendingRuntime = [];

  queryWithinScope(scopeRoot, "[data-i18n]").forEach((element) => {
    if (isReactManagedNode(element)) return;
    if (isInsideSelect(element)) return;

    const key = element.getAttribute("data-i18n");
    if (!key) return;

    const fallback =
      readFallback(element, "data-i18n-fallback", element.textContent || "") ||
      getEnglishSourceForKey(key);

    const nextText = getLocalizedContent(translations, language, key, fallback);
    const effectiveText = resolveEffectiveLocalized(nextText, fallback, language);

    if (!updateElementTextSafe(element, effectiveText)) {
      collectTextNodesInElement(element, language, pendingRuntime);
    }

    queueRuntimeIfUntranslated(
      pendingRuntime,
      language,
      fallback,
      nextText,
      element,
      "text"
    );
  });

  queryWithinScope(scopeRoot, "[data-i18n-html]").forEach((element) => {
    if (isReactManagedNode(element)) return;
    if (isInsideSelect(element)) return;

    const key = element.getAttribute("data-i18n-html");
    if (!key) return;

    const fallback = readFallback(
      element,
      "data-i18n-fallback",
      element.innerHTML || ""
    );

    const nextHtml = getLocalizedContent(translations, language, key, fallback);
    const effectiveHtml = resolveEffectiveLocalized(nextHtml, fallback, language);

    if (effectiveHtml && element.innerHTML !== effectiveHtml) {
      element.innerHTML = effectiveHtml;
    } else if (!isEnglishLanguage(language)) {
      collectTextNodesInElement(element, language, pendingRuntime);
    }

    const htmlSource = (fallback || "").trim();
    if (
      !isEnglishLanguage(language) &&
      htmlSource &&
      (!effectiveHtml || effectiveHtml === fallback)
    ) {
      collectPendingRuntime(pendingRuntime, language, htmlSource, element, "html");
    }
  });

  queryWithinScope(scopeRoot, "[data-i18n-placeholder]").forEach((element) => {
    if (isReactManagedNode(element)) return;
    if (isInsideSelect(element)) return;

    const key = element.getAttribute("data-i18n-placeholder");
    if (!key) return;

    const inputEl =
      element.matches("input, textarea")
        ? element
        : element.querySelector("input, textarea");

    const fallback =
      readFallback(
        element,
        "data-i18n-fallback",
        inputEl?.getAttribute("placeholder") || ""
      ) || getEnglishSourceForKey(key);

    const nextPlaceholder = getLocalizedContent(
      translations,
      language,
      key,
      fallback
    );
    const effectivePlaceholder = resolveEffectiveLocalized(
      nextPlaceholder,
      fallback,
      language
    );

    const target = inputEl || element;
    if (target.getAttribute("placeholder") !== effectivePlaceholder) {
      target.setAttribute("placeholder", effectivePlaceholder);
    }

    queueRuntimeIfUntranslated(
      pendingRuntime,
      language,
      fallback,
      nextPlaceholder,
      target,
      "placeholder"
    );
  });

  queryWithinScope(scopeRoot, "[data-i18n-aria-label]").forEach((element) => {
    if (isReactManagedNode(element)) return;
    if (isInsideSelect(element)) return;

    const key = element.getAttribute("data-i18n-aria-label");
    if (!key) return;

    const fallback = readFallback(
      element,
      "data-i18n-fallback",
      element.getAttribute("aria-label") || ""
    );

    const nextLabel = getLocalizedContent(translations, language, key, fallback);
    const effectiveLabel = resolveEffectiveLocalized(nextLabel, fallback, language);

    if (element.getAttribute("aria-label") !== effectiveLabel) {
      element.setAttribute("aria-label", effectiveLabel);
    }

    queueRuntimeIfUntranslated(
      pendingRuntime,
      language,
      fallback,
      nextLabel,
      element,
      "aria-label"
    );
  });

  return pendingRuntime;
}

async function applyRuntimeTranslations(pendingRuntime, language) {
  if (!pendingRuntime.length || isEnglishLanguage(language)) return false;

  const uniqueSources = [...new Set(pendingRuntime.map((item) => item.source))];
  const translated = await translateRuntimeTexts(uniqueSources, language);
  const translatedBySource = new Map(
    uniqueSources.map((source, index) => [
      source,
      (translated[index] || "").trim(),
    ])
  );

  let changed = false;

  pendingRuntime.forEach((item) => {
    const { element, mode, source, attrName, textNode } = item;
    const value = translatedBySource.get(source) || "";
    if (!value || value === source) return;

    changed = true;

    if (mode === "text" && textNode) {
      if (textNode.textContent !== value) {
        textNode.textContent = value;
      }
    } else if (mode === "text" && element) {
      updateElementTextSafe(element, value);
    } else if (mode === "html" && element) {
      if (element.innerHTML !== value) element.innerHTML = value;
    } else if (mode === "placeholder" && element) {
      element.setAttribute("placeholder", value);
    } else if (mode === "aria-label" && element) {
      element.setAttribute("aria-label", value);
    } else if (mode === "attr" && element && attrName) {
      element.setAttribute(attrName, value);
    }
  });

  return changed;
}

const MAX_SECTION_PASSES = 5;

async function translateSection(
  sectionRoot,
  translations,
  language,
  requestId,
  refs,
  pagePath
) {
  let changed = false;

  for (let pass = 0; pass < MAX_SECTION_PASSES; pass += 1) {
    if (refs.runtimeRequestRef.current !== requestId) return changed;

    captureOriginalTexts(sectionRoot);

    const pendingRuntime = applyI18nDomSync(translations, language, sectionRoot);
    const pendingAuto = collectAutoTranslateTargets(sectionRoot, language);

    if (!pendingRuntime.length && !pendingAuto.length) {
      break;
    }

    if (pendingRuntime.length) {
      changed =
        (await applyRuntimeTranslations(pendingRuntime, language)) || changed;
    }

    if (refs.runtimeRequestRef.current !== requestId) return changed;

    if (pendingAuto.length) {
      changed =
        (await applyAutoTranslateTargets(
          pendingAuto,
          language,
          translateRuntimeTexts,
          pagePath
        )) || changed;
    }

    if (refs.runtimeRequestRef.current !== requestId) return changed;

    applyI18nDomSync(translations, language, sectionRoot);
    changed =
      reconcileTranslatedTextNodes(language, sectionRoot) || changed;
  }

  reconcileTranslatedTextNodes(language, sectionRoot);
  return changed;
}

async function runSectionPageTranslation(
  translations,
  language,
  requestId,
  refs,
  { onViewportSectionsComplete, showSectionProgress = false } = {}
) {
  let changed = false;
  const pagePath = window.location?.pathname || "";
  const sections = orderSectionsForTranslation(collectPageSections());
  const visibleSectionCount = sections.filter((item) =>
    isElementInViewport(item.root)
  ).length;
  let completedVisibleSections = 0;
  let viewportSectionsDone = false;

  captureOriginalTexts(document.body);
  captureOriginalPageMeta(pagePath);

  if (!visibleSectionCount) {
    onViewportSectionsComplete?.();
  }

  for (const section of sections) {
    if (refs.runtimeRequestRef.current !== requestId) return changed;

    const wasInViewport = isElementInViewport(section.root);
    if (showSectionProgress) {
      markSectionTranslating(section.root, true);
    }

    try {
      applyDirectLanguageTranslations(pagePath, language, section.root);
      changed = (await translateSection(
        section.root,
        translations,
        language,
        requestId,
        refs,
        pagePath
      )) || changed;
    } finally {
      if (showSectionProgress) {
        markSectionTranslating(section.root, false);
      }
    }

    if (wasInViewport) {
      completedVisibleSections += 1;
      if (
        !viewportSectionsDone &&
        completedVisibleSections >= visibleSectionCount
      ) {
        viewportSectionsDone = true;
        onViewportSectionsComplete?.();
      }
    }
  }

  syncBreadcrumbDom(translations, language);
  await syncLocalizedPageMeta(language);
  applyCachedLocalizedPageMeta(language);
  reconcileTranslatedTextNodes(language, document.body);

  return changed;
}

async function runFullPageLanguageTranslation(
  translations,
  language,
  requestId,
  refs,
  { showSectionProgress = false } = {}
) {
  let changed = false;
  const pagePath = window.location?.pathname || "";
  const root = document.body;

  captureOriginalTexts(root);
  captureOriginalPageMeta(pagePath);

  if (showSectionProgress) {
    markSectionTranslating(root, true);
  }

  try {
    applyDirectLanguageTranslations(pagePath, language, root);
    changed =
      (await translateSection(
        root,
        translations,
        language,
        requestId,
        refs,
        pagePath
      )) || changed;
  } finally {
    if (showSectionProgress) {
      markSectionTranslating(root, false);
    }
  }

  syncBreadcrumbDom(translations, language);
  await syncLocalizedPageMeta(language);
  applyCachedLocalizedPageMeta(language);
  reconcileTranslatedTextNodes(language, root);

  return changed;
}

function dispatchViewportComplete(language) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("languageTranslationViewportComplete", {
      detail: { language },
    })
  );
}

function dispatchTranslationComplete(language, changed) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("languageTranslationComplete", {
      detail: { language, changed },
    })
  );
  endLanguageSwitch();
}

function applySyncTier12(catalog, lang, visiblePath, scopeRoot = null) {
  const root = scopeRoot || document.body;

  captureOriginalPageMeta(visiblePath);
  restoreAutoTranslatedEnglish(document.body);
  captureOriginalTexts(document.body);

  applyDirectLanguageTranslations(visiblePath, lang, root);
  applyI18nDomSync(catalog, lang, root);
  syncBreadcrumbDom(catalog, lang);
  reconcileTranslatedTextNodes(lang, root);
  applyCachedLocalizedPageMeta(lang);
}

export default function I18nDomSync() {
  const { translations, language, languages } = useLanguage();
  const pathname = usePathname();
  const runtimeRequestRef = useRef(0);
  const syncInFlightRef = useRef(false);
  const syncQueuedRef = useRef(false);
  const sectionTranslationInFlightRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const prevLanguageRef = useRef(null);
  const instantCoalesceFrameRef = useRef(0);
  const pendingInstantArgsRef = useRef(null);
  const hydrated = useHydrated();

  const isAdminRoute = (pathname || "").startsWith("/admin");

  const sync = useCallback(async () => {
    if (
      !hydrated ||
      isAdminRoute ||
      !isDomAutoTranslateReady() ||
      isLanguageSwitchLocked() ||
      !shouldApplyDomTranslation(language)
    ) {
      return;
    }

    if (syncInFlightRef.current) {
      syncQueuedRef.current = true;
      return;
    }

    syncInFlightRef.current = true;

    try {
      if (isEnglishLanguage(language)) {
        restoreEnglishPageMeta();
        restoreAutoTranslatedEnglish(document.body);
        applyI18nDomSync(translations, language);
        return;
      }

      restoreAutoTranslatedEnglish(document.body);
      captureOriginalTexts(document.body);

      const visiblePath = pathname || window.location?.pathname || "";
      captureOriginalPageMeta(visiblePath);
      applyDirectLanguageTranslations(visiblePath, language, document.body);

      const requestId = runtimeRequestRef.current + 1;
      runtimeRequestRef.current = requestId;
      sectionTranslationInFlightRef.current = true;

      const changed = await runSectionPageTranslation(
        translations,
        language,
        requestId,
        { runtimeRequestRef },
        {
          showSectionProgress: isLanguageSwitchLocked(),
          onViewportSectionsComplete: () => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("languageTranslationViewportComplete", {
                  detail: { language },
                })
              );
            }
          },
        }
      );

      if (changed && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("translationsApplied", {
            detail: { language, source: "runtime-dom" },
          })
        );
      }
    } catch (error) {
      if (!isAbortError(error)) {
        console.warn("I18nDomSync failed:", error);
      }
    } finally {
      syncInFlightRef.current = false;
      sectionTranslationInFlightRef.current = false;
      if (syncQueuedRef.current) {
        syncQueuedRef.current = false;
        window.requestAnimationFrame(() => {
          sync();
        });
      }
    }
  }, [translations, language, hydrated, isAdminRoute]);

  const applyInstantToPageInner = useCallback(
    (pack, lang) => {
      if (typeof document === "undefined" || !isDomAutoTranslateReady()) return;

      const catalog = pack || translations;
      const visiblePath = window.location?.pathname || pathname || "";
      const switchLocked = isLanguageSwitchLocked();

      if (isEnglishLanguage(lang)) {
        if (switchLocked) return;
        restoreEnglishPageMeta();
        restoreAutoTranslatedEnglish(document.body);
        applyI18nDomSync(catalog, lang);
        dispatchTranslationComplete(lang, false);
        return;
      }

      if (!shouldApplyDomTranslation(lang)) return;

      applySyncTier12(catalog, lang, visiblePath, document.body);
      dispatchViewportComplete(lang);

      const requestId = runtimeRequestRef.current + 1;
      runtimeRequestRef.current = requestId;
      sectionTranslationInFlightRef.current = true;

      const runTranslation = switchLocked
        ? runFullPageLanguageTranslation(
            catalog,
            lang,
            requestId,
            { runtimeRequestRef },
            { showSectionProgress: true }
          )
        : runSectionPageTranslation(
            catalog,
            lang,
            requestId,
            { runtimeRequestRef },
            { showSectionProgress: true }
          );

      void runTranslation
        .then((changed) => {
          if (runtimeRequestRef.current !== requestId) return;

          applyI18nDomSync(catalog, lang);
          syncBreadcrumbDom(catalog, lang);
          reconcileTranslatedTextNodes(lang, document.body);

          if (changed && typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("translationsApplied", {
                detail: {
                  language: lang,
                  immediate: true,
                  source: "runtime-dom",
                },
              })
            );
          }

          dispatchTranslationComplete(lang, changed);
        })
        .finally(() => {
          sectionTranslationInFlightRef.current = false;
        });
    },
    [translations, pathname]
  );

  const applyInstantToPage = useCallback(
    (pack, lang) => {
      pendingInstantArgsRef.current = { pack, lang };

      if (instantCoalesceFrameRef.current) {
        return;
      }

      instantCoalesceFrameRef.current = window.requestAnimationFrame(() => {
        instantCoalesceFrameRef.current = 0;
        const args = pendingInstantArgsRef.current;
        pendingInstantArgsRef.current = null;
        if (!args) return;
        applyInstantToPageInner(args.pack, args.lang);
      });
    },
    [applyInstantToPageInner]
  );

  const applyCatalogImmediately = useCallback(
    (event) => {
      const pack = event?.detail?.translations;
      const lang = event?.detail?.language || language;
      applyInstantToPage(pack, lang);
    },
    [applyInstantToPage, language]
  );

  useEffect(() => {
    setInstantLanguageHandler(applyInstantToPage);
    return () => setInstantLanguageHandler(null);
  }, [applyInstantToPage]);

  const scheduleSync = useCallback(
    ({ immediate = false } = {}) => {
      if (isLanguageSwitchLocked()) {
        return;
      }

      if (immediate) {
        void sync();
        return;
      }
      window.requestAnimationFrame(() => {
        void sync();
      });
    },
    [sync]
  );

  useEffect(() => {
    const handleSwitchBegin = () => {
      runtimeRequestRef.current += 1;
    };

    const handleSwitchEnd = () => {
      if (sectionTranslationInFlightRef.current) return;
      runtimeRequestRef.current += 1;
      scheduleSync({ immediate: true });
    };

    window.addEventListener("languageSwitchBegin", handleSwitchBegin);
    window.addEventListener("languageSwitchEnd", handleSwitchEnd);

    return () => {
      window.removeEventListener("languageSwitchBegin", handleSwitchBegin);
      window.removeEventListener("languageSwitchEnd", handleSwitchEnd);
    };
  }, [scheduleSync]);

  useEffect(() => {
    if (!hydrated || isAdminRoute) return;
    captureOriginalPageMeta(pathname || window.location?.pathname || "");
    scheduleSync();

    const handleLanguageChange = (event) => {
      const immediate = Boolean(event?.detail?.immediate);
      if (immediate) {
        applyCatalogImmediately(event);
        return;
      }
      scheduleSync();
    };
    window.addEventListener("languageChanged", handleLanguageChange);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, [
    translations,
    language,
    pathname,
    scheduleSync,
    applyCatalogImmediately,
    hydrated,
    isAdminRoute,
  ]);

  useEffect(() => {
    if (!hydrated || typeof document === "undefined" || isAdminRoute) return;

    const handleLanguageChange = (event) => {
      const immediate = Boolean(event?.detail?.immediate);
      if (immediate) {
        applyCatalogImmediately(event);
        return;
      }
      scheduleSync();
    };

    const handleTranslationsApplied = (event) => {
      if (event?.detail?.source === "runtime-dom") return;
      const immediate = Boolean(event?.detail?.immediate);
      if (immediate) {
        applyCatalogImmediately(event);
        return;
      }
      scheduleSync();
    };

    const observer = new MutationObserver(() => {
      if (
        isEnglishLanguage(language) ||
        isLanguageSwitchLocked() ||
        sectionTranslationInFlightRef.current
      ) {
        return;
      }
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        scheduleSync();
      }, 120);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const handleLocaleUrlChanged = () => {
      captureOriginalPageMeta(window.location?.pathname || pathname || "");
      scheduleSync();
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    window.addEventListener("translationsApplied", handleTranslationsApplied);
    window.addEventListener("localeUrlChanged", handleLocaleUrlChanged);

    return () => {
      observer.disconnect();
      clearTimeout(debounceTimerRef.current);
      window.removeEventListener("languageChanged", handleLanguageChange);
      window.removeEventListener(
        "translationsApplied",
        handleTranslationsApplied
      );
      window.removeEventListener("localeUrlChanged", handleLocaleUrlChanged);
    };
  }, [scheduleSync, applyCatalogImmediately, hydrated, isAdminRoute, language]);

  useEffect(() => {
    if (!hydrated || isAdminRoute || typeof document === "undefined") return;

    let cancelled = false;
    let outerFrame = 0;
    let innerFrame = 0;

    outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        if (cancelled) return;

        stripLegacyAutoAttrMarkers(document.body);
        markDomAutoTranslateReady();

        const visiblePath = pathname || window.location?.pathname || "";
        captureOriginalPageMeta(visiblePath);

        const languageChanged = prevLanguageRef.current !== language;
        if (languageChanged) {
          restoreAutoTranslatedEnglish(document.body);
          prevLanguageRef.current = language;
        }

        captureOriginalTexts(document.body);

        if (!isEnglishLanguage(language)) {
          const cachedMap = readStoredPageRuntimeMap(visiblePath, language);
          hydrateRuntimeCacheFromMap(language, cachedMap);
          const pack = translations;
          applyDirectLanguageTranslations(visiblePath, language, document.body);
          applyI18nDomSync(pack, language);
          syncBreadcrumbDom(pack, language);
        }

        scheduleSync({ immediate: true });
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
      if (instantCoalesceFrameRef.current) {
        window.cancelAnimationFrame(instantCoalesceFrameRef.current);
        instantCoalesceFrameRef.current = 0;
      }
    };
  }, [pathname, language, hydrated, isAdminRoute, translations, scheduleSync]);

  useEffect(() => {
    if (!hydrated || isAdminRoute || typeof document === "undefined") return;

    const visiblePath = pathname || window.location?.pathname || "";
    captureOriginalPageMeta(visiblePath);
    captureOriginalTexts(document.body);

    const warmRuntimeCaches = () => {
      const saved = normalizeLanguageCode(
        typeof localStorage !== "undefined"
          ? localStorage.getItem("language") || ""
          : ""
      );
      if (saved && !isEnglishLanguage(saved)) {
        void prefetchPageRuntimeTranslations(saved, document.body);
      }

      (languages || []).forEach((lang) => {
        const code = normalizeLanguageCode(lang.code);
        if (!isEnglishLanguage(code)) {
          void prefetchPageRuntimeTranslations(code, document.body);
        }
      });
    };

    warmRuntimeCaches();
    const followUp = window.setTimeout(warmRuntimeCaches, 150);

    return () => window.clearTimeout(followUp);
  }, [pathname, hydrated, isAdminRoute, languages]);

  return null;
}
