import { isEnglishLanguage } from "@/lib/defaultTranslations";
import { isReactManagedNode, REACT_MANAGED_ATTR } from "@/lib/domI18nUtils";
import { normalizeLanguageCode } from "@/lib/supportedLocales";
import {
  hydrateRuntimeCacheFromMap,
  getRuntimeCachedTranslation,
  rememberRuntimeTranslation,
  translateRuntimeTexts,
} from "@/lib/runtimeTranslate";
import {
  mergeStoredPageRuntimeMap,
  readStoredPageRuntimeMap,
} from "@/lib/pageRuntimeStorage";

import { isDomAutoTranslateReady } from "@/lib/i18nHydrationGate";
import { shouldApplyDomTranslation } from "@/lib/i18nSwitchGuard";

const AUTO_ATTR_SRC_PREFIX = "data-i18n-auto-attr-";
const TRACKED_ATTR_NAMES = ["title", "aria-label", "placeholder", "alt"];

/** Original attribute values — kept in memory to avoid hydration mismatches from DOM markers. */
const originalAttrsByElement = new WeakMap();
const trackedAttrElements = new Set();

function rememberOriginalAttribute(element, attrName, value) {
  if (!element || !attrName) return;
  const trimmed = (value || "").trim();
  if (!trimmed) return;

  let bag = originalAttrsByElement.get(element);
  if (!bag) {
    bag = {};
    originalAttrsByElement.set(element, bag);
  }
  if (!(attrName in bag)) {
    bag[attrName] = trimmed;
    trackedAttrElements.add(element);
  }
}

function readOriginalAttribute(element, attrName) {
  const stored = originalAttrsByElement.get(element)?.[attrName];
  if (stored != null && stored !== "") return stored;

  const legacyAttr = `${AUTO_ATTR_SRC_PREFIX}${attrName}`;
  const legacy = element.getAttribute?.(legacyAttr);
  if (legacy != null && legacy !== "") {
    rememberOriginalAttribute(element, attrName, legacy);
    element.removeAttribute(legacyAttr);
    return legacy.trim();
  }

  return (element.getAttribute?.(attrName) || "").trim();
}

export function stripLegacyAutoAttrMarkers(root = document.body) {
  if (typeof document === "undefined" || !root) return;

  TRACKED_ATTR_NAMES.forEach((attrName) => {
    const legacyAttr = `${AUTO_ATTR_SRC_PREFIX}${attrName}`;
    root.querySelectorAll(`[${legacyAttr}]`).forEach((element) => {
      element.removeAttribute(legacyAttr);
    });
  });
}

function restoreTrackedAttributes(root = document.body) {
  trackedAttrElements.forEach((element) => {
    if (!element?.isConnected) {
      trackedAttrElements.delete(element);
      return;
    }
    if (root && !root.contains(element)) return;

    const bag = originalAttrsByElement.get(element);
    if (!bag) return;

    for (const [attrName, source] of Object.entries(bag)) {
      if (source != null && element.getAttribute(attrName) !== source) {
        element.setAttribute(attrName, source);
      }
    }
  });

  if (!root) return;

  TRACKED_ATTR_NAMES.forEach((attrName) => {
    const legacyAttr = `${AUTO_ATTR_SRC_PREFIX}${attrName}`;
    root.querySelectorAll(`[${legacyAttr}]`).forEach((element) => {
      const source = element.getAttribute(legacyAttr);
      element.removeAttribute(legacyAttr);
      if (source) element.setAttribute(attrName, source);
    });
  });
}

const RICH_CONTENT_SELECTOR = [
  ".tiptap-editor-content",
  '[class*="tiptap-editor"]',
].join(",");

const SKIP_CLOSEST_SELECTOR = [
  "script",
  "style",
  "noscript",
  "svg",
  "code",
  "pre",
  "kbd",
  "var",
  `[${REACT_MANAGED_ATTR}]`,
  "[data-i18n-ignore]",
  "[data-i18n]",
  "[data-i18n-html]",
  "[data-i18n-placeholder]",
  "[data-i18n-aria-label]",
  "[contenteditable='true']",
].join(",");

const BATCH_SIZE = 50;
const PARALLEL_BATCHES = 3;

/** Original English text per DOM text node (never overwritten after first capture). */
const originalTextByNode = new WeakMap();

/** When false, never lock live DOM text as the English source outside captureOriginalTexts. */
let originalTextCapturePhase = false;

function beginOriginalTextCapture() {
  originalTextCapturePhase = true;
}

function endOriginalTextCapture() {
  originalTextCapturePhase = false;
}

export function shouldAutoTranslateText(text) {
  const value = (text || "").trim();
  if (value.length < 2) return false;
  if (/^https?:\/\//i.test(value)) return false;
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) return false;
  if (!/[a-zA-Z]/.test(value)) return false;
  if (/^[\d\s.,+\-/%$€£¥:;!?()[\]{}]+$/.test(value)) return false;
  if (/^[A-Z]{2,6}[- ]?\d{2,4}[A-Z]?$/i.test(value)) return false;
  return true;
}

const HARD_SKIP_SELECTOR =
  "script, style, noscript, svg, code, pre, kbd, var, [contenteditable='true'], [data-i18n-ignore]";

function shouldSkipTextParent(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return true;
  if (isReactManagedNode(element)) return true;
  if (element.closest("[data-i18n-ignore]")) return true;
  if (element.closest(HARD_SKIP_SELECTOR)) return true;
  if (element.closest(SKIP_CLOSEST_SELECTOR)) return true;
  if (element.closest("select")) return true;
  return false;
}

/** Allow walking text inside a CMS host (`data-i18n` / `data-i18n-html`) subtree. */
function shouldSkipTextParentInsideHost(host, element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return true;
  if (isReactManagedNode(element)) return true;
  if (element.closest(HARD_SKIP_SELECTOR)) return true;
  if (element.closest("select")) return true;

  const marker = element.closest(
    "[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-aria-label]"
  );
  if (marker && marker !== host) return true;

  return false;
}

function shouldSkipElement(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return true;
  if (isReactManagedNode(element)) return true;
  if (element.closest(SKIP_CLOSEST_SELECTOR)) return true;
  if (element.closest("select")) return true;
  return false;
}

function readFallbackFromAncestors(textNode) {
  let element = textNode.parentElement;
  while (element) {
    const fallback = (element.getAttribute("data-i18n-fallback") || "").trim();
    if (fallback && !fallback.includes("<") && shouldAutoTranslateText(fallback)) {
      return fallback;
    }
    const translateFallback = (
      element.getAttribute("data-translate-fallback") || ""
    ).trim();
    if (
      translateFallback &&
      !translateFallback.includes("<") &&
      shouldAutoTranslateText(translateFallback)
    ) {
      return translateFallback;
    }
    element = element.parentElement;
  }
  return "";
}

function getOriginalText(textNode) {
  const stored = originalTextByNode.get(textNode);
  if (stored) return stored;

  const fromAncestor = readFallbackFromAncestors(textNode);
  if (fromAncestor) {
    originalTextByNode.set(textNode, fromAncestor);
    return fromAncestor;
  }

  if (!originalTextCapturePhase) {
    return "";
  }

  const current = (textNode.textContent || "").trim();
  if (shouldAutoTranslateText(current)) {
    originalTextByNode.set(textNode, current);
    return current;
  }

  return "";
}

function captureTextNodesInTree(root, shouldSkip) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (getOriginalText(node)) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    getOriginalText(node);
    node = walker.nextNode();
  }
}

/** Snapshot English sources before any DOM text is cleared for translation. */
export function captureOriginalTexts(root = document.body) {
  if (!root) return;

  beginOriginalTextCapture();
  try {
    captureTextNodesInTree(root, shouldSkipTextParent);

    root.querySelectorAll("[data-i18n-html], [data-i18n]").forEach((host) => {
      captureTextNodesInTree(host, (parent) =>
        shouldSkipTextParentInsideHost(host, parent)
      );
    });
  } finally {
    endOriginalTextCapture();
  }
}

function reconcileTextNodesInTree(language, root, shouldSkip) {
  let changed = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    const original = getOriginalText(node);
    if (original) {
      const current = (node.textContent || "").trim();
      const cached = getRuntimeCachedTranslation(original, language);
      if (cached && cached !== original && current !== cached) {
        node.textContent = cached;
        changed = true;
      }
    }
    node = walker.nextNode();
  }

  return changed;
}

/** Re-apply cached translations when React re-renders English source text. */
export function reconcileTranslatedTextNodes(language, root = document.body) {
  if (
    !root ||
    isEnglishLanguage(language) ||
    !isDomAutoTranslateReady() ||
    !shouldApplyDomTranslation(language)
  ) {
    return false;
  }

  let changed = reconcileTextNodesInTree(language, root, shouldSkipTextParent);

  root.querySelectorAll("[data-i18n-html], [data-i18n]").forEach((host) => {
    changed =
      reconcileTextNodesInTree(language, host, (parent) =>
        shouldSkipTextParentInsideHost(host, parent)
      ) || changed;
  });

  return changed;
}

function queueTextNode(textNode, language, pending) {
  const source = getOriginalText(textNode);
  if (!source) return;

  const cached = getRuntimeCachedTranslation(source, language);
  if (cached && cached !== source) {
    if (isDomAutoTranslateReady() && textNode.textContent !== cached) {
      textNode.textContent = cached;
    }
    return;
  }

  pending.push({ textNode, source, mode: "text" });
}

/** Walk and queue text nodes inside a subtree (e.g. rich HTML / CMS blocks). */
export function collectTextNodesInElement(element, language, pending) {
  if (!element || isEnglishLanguage(language)) return;

  const shouldSkip = (parent) => shouldSkipTextParentInsideHost(element, parent);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) {
        return NodeFilter.FILTER_REJECT;
      }
      const source = getOriginalText(node);
      if (!source) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    queueTextNode(node, language, pending);
    node = walker.nextNode();
  }
}

function collectTextNodeTargets(root, language, pending) {
  if (!root || isEnglishLanguage(language)) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkipTextParent(parent)) {
        return NodeFilter.FILTER_REJECT;
      }
      const source = getOriginalText(node);
      if (!source) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    queueTextNode(node, language, pending);
    node = walker.nextNode();
  }
}

function collectRichContentTargets(root, language, pending) {
  if (!root || isEnglishLanguage(language)) return;

  root.querySelectorAll(RICH_CONTENT_SELECTOR).forEach((element) => {
    if (isReactManagedNode(element)) return;
    if (
      element.hasAttribute("data-i18n-ignore") &&
      !element.hasAttribute("data-i18n-html")
    ) {
      return;
    }
    if (element.closest("[data-i18n-ignore]")) return;
    if (element.closest(HARD_SKIP_SELECTOR)) return;
    if (element.closest("select")) return;
    collectTextNodesInElement(element, language, pending);
  });

  root.querySelectorAll("[data-i18n-html]").forEach((host) => {
    collectTextNodesInElement(host, language, pending);
  });
}

function resolvePlaceholderElement(element) {
  if (!element) return null;
  if (element.matches("input, textarea")) return element;
  return element.querySelector("input, textarea");
}

function collectPlaceholderTargets(root, language, pending) {
  if (!root || isEnglishLanguage(language)) return;

  const seen = new Set();

  const queuePlaceholder = (element, fallbackHint = "") => {
    if (!element || seen.has(element) || shouldSkipElement(element)) return;
    seen.add(element);

    const source = (
      readOriginalAttribute(element, "placeholder") ||
      fallbackHint ||
      ""
    ).trim();

    if (!shouldAutoTranslateText(source)) return;
    rememberOriginalAttribute(element, "placeholder", source);

    const cached = getRuntimeCachedTranslation(source, language);
    if (cached && cached !== source) {
      if (isDomAutoTranslateReady()) {
        element.setAttribute("placeholder", cached);
      }
      return;
    }

    pending.push({ element, source, mode: "placeholder" });
  };

  root
    .querySelectorAll("input[placeholder], textarea[placeholder]")
    .forEach((element) => queuePlaceholder(element));

  root.querySelectorAll("[data-i18n-placeholder]").forEach((host) => {
    const input = resolvePlaceholderElement(host);
    if (!input) return;
    const hint = (host.getAttribute("data-i18n-fallback") || "").trim();
    queuePlaceholder(input, hint);
  });
}

function collectAltTargets(root, language, pending) {
  if (!root || isEnglishLanguage(language)) return;

  root.querySelectorAll("img[alt]").forEach((element) => {
    if (shouldSkipElement(element)) return;

    const source = readOriginalAttribute(element, "alt");
    if (!shouldAutoTranslateText(source)) return;
    rememberOriginalAttribute(element, "alt", source);

    const cached = getRuntimeCachedTranslation(source, language);
    if (cached && cached !== source) {
      if (isDomAutoTranslateReady()) {
        element.setAttribute("alt", cached);
      }
      return;
    }

    pending.push({ element, source, mode: "alt" });
  });
}

function collectAttributeTargets(root, language, pending) {
  if (isEnglishLanguage(language) || !root) return;

  ["title", "aria-label"].forEach((attrName) => {
    root.querySelectorAll(`[${attrName}]`).forEach((element) => {
      if (shouldSkipElement(element)) return;
      if (element.tagName === "SELECT") return;
      if (attrName === "aria-label" && element.hasAttribute("data-i18n-aria-label")) {
        return;
      }

      const source = readOriginalAttribute(element, attrName);
      if (!shouldAutoTranslateText(source)) return;
      rememberOriginalAttribute(element, attrName, source);

      const cached = getRuntimeCachedTranslation(source, language);
      if (cached && cached !== source) {
        if (isDomAutoTranslateReady()) {
          element.setAttribute(attrName, cached);
        }
        return;
      }

      pending.push({ element, source, mode: "attr", attrName });
    });
  });
}

export function collectAutoTranslateTargets(root, language) {
  const pending = [];

  if (!root || isEnglishLanguage(language)) {
    return pending;
  }

  collectTextNodeTargets(root, language, pending);
  collectRichContentTargets(root, language, pending);
  collectPlaceholderTargets(root, language, pending);
  collectAltTargets(root, language, pending);
  collectAttributeTargets(root, language, pending);

  return pending;
}

export function restoreAutoTranslatedEnglish(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const original = originalTextByNode.get(node);
    if (original && node.textContent !== original) {
      node.textContent = original;
    }
    node = walker.nextNode();
  }

  restoreTrackedAttributes(root);
}

async function translateSourcesInParallel(uniqueSources, language, translateRuntimeTexts) {
  const translatedBySource = new Map();
  const batches = [];

  for (let i = 0; i < uniqueSources.length; i += BATCH_SIZE) {
    batches.push(uniqueSources.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
    const chunk = batches.slice(i, i + PARALLEL_BATCHES);
    const results = await Promise.all(
      chunk.map((batch) => translateRuntimeTexts(batch, language))
    );

    chunk.forEach((batch, batchIndex) => {
      const translated = results[batchIndex] || [];
      batch.forEach((source, index) => {
        const value = (translated[index] || "").trim();
        if (value && value !== source) {
          translatedBySource.set(source, value);
        }
      });
    });
  }

  return translatedBySource;
}

function resolvePagePathname(pathname = "") {
  if (pathname) return pathname;
  if (!originalPageMeta.captured) {
    captureOriginalPageMeta();
  }
  return originalPageMeta.pathname || "/";
}

function applyStoredMapToPending(pending, language, map) {
  if (!pending.length || !map || isEnglishLanguage(language) || !isDomAutoTranslateReady()) {
    return false;
  }

  let changed = false;

  pending.forEach((item) => {
    const value = (map[item.source] || getRuntimeCachedTranslation(item.source, language) || "").trim();
    if (!value || value === item.source) return;

    changed = true;

    if (item.mode === "text" && item.textNode) {
      if (item.textNode.textContent !== value) {
        item.textNode.textContent = value;
      }
    } else if (item.mode === "placeholder" && item.element) {
      if (item.element.getAttribute("placeholder") !== value) {
        item.element.setAttribute("placeholder", value);
      }
    } else if (item.mode === "alt" && item.element) {
      if (item.element.getAttribute("alt") !== value) {
        item.element.setAttribute("alt", value);
      }
    } else if (item.mode === "attr" && item.element && item.attrName) {
      if (item.element.getAttribute(item.attrName) !== value) {
        item.element.setAttribute(item.attrName, value);
      }
    }
  });

  return changed;
}

function applyMapToCapturedTextNodes(language, root, map, shouldSkip) {
  if (!root || isEnglishLanguage(language) || !isDomAutoTranslateReady()) return false;

  let changed = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) {
        return NodeFilter.FILTER_REJECT;
      }
      return getOriginalText(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    const original = getOriginalText(node);
    const value = (
      map[original] ||
      getRuntimeCachedTranslation(original, language) ||
      ""
    ).trim();
    if (value && value !== original && node.textContent !== value) {
      node.textContent = value;
      changed = true;
    }
    node = walker.nextNode();
  }

  return changed;
}

function applyMapToAllCapturedTextNodes(language, root, map) {
  if (!root) return false;

  let changed = applyMapToCapturedTextNodes(
    language,
    root,
    map,
    shouldSkipTextParent
  );

  root.querySelectorAll("[data-i18n-html], [data-i18n]").forEach((host) => {
    changed =
      applyMapToCapturedTextNodes(language, host, map, (parent) =>
        shouldSkipTextParentInsideHost(host, parent)
      ) || changed;
  });

  return changed;
}

/** Apply target language from cache/storage without flashing English in between. */
export function applyDirectLanguageTranslations(
  pathname,
  language,
  root = document.body
) {
  if (typeof document === "undefined" || !root || !isDomAutoTranslateReady()) {
    return false;
  }

  if (isEnglishLanguage(language)) {
    restoreEnglishPageMeta();
    restoreAutoTranslatedEnglish(root);
    return true;
  }

  if (!shouldApplyDomTranslation(language)) {
    return false;
  }

  const path = resolvePagePathname(pathname);
  const map = readStoredPageRuntimeMap(path, language);
  hydrateRuntimeCacheFromMap(language, map);
  applyCachedLocalizedPageMeta(language);

  let changed = applyMapToAllCapturedTextNodes(language, root, map);

  const pending = collectAutoTranslateTargets(root, language);
  changed = applyStoredMapToPending(pending, language, map) || changed;

  return changed;
}

/** Synchronously apply persisted page translations (body + warm runtime cache). */
export function applyStoredPageRuntimeTranslations(
  pathname,
  language,
  root = document.body
) {
  return applyDirectLanguageTranslations(pathname, language, root);
}

export async function applyAutoTranslateTargets(
  pending,
  language,
  translateRuntimeTexts,
  pathname = ""
) {
  if (
    !pending.length ||
    isEnglishLanguage(language) ||
    !isDomAutoTranslateReady() ||
    !shouldApplyDomTranslation(language)
  ) {
    return false;
  }

  const path = resolvePagePathname(pathname);
  const storedMap = readStoredPageRuntimeMap(path, language);
  hydrateRuntimeCacheFromMap(language, storedMap);
  applyStoredMapToPending(pending, language, storedMap);

  const stillPending = pending.filter((item) => {
    const value = getRuntimeCachedTranslation(item.source, language);
    return !value || value === item.source;
  });

  if (!stillPending.length) {
    return pending.length > 0;
  }

  const uniqueSources = [...new Set(stillPending.map((item) => item.source))];
  const translatedBySource = await translateSourcesInParallel(
    uniqueSources,
    language,
    translateRuntimeTexts
  );

  const persisted = {};
  let changed = false;

  stillPending.forEach((item) => {
    const value = translatedBySource.get(item.source);
    if (!value) return;

    persisted[item.source] = value;
    rememberRuntimeTranslation(language, item.source, value);
    changed = true;

    if (item.mode === "text" && item.textNode) {
      if (item.textNode.textContent !== value) {
        item.textNode.textContent = value;
      }
    } else if (item.mode === "placeholder" && item.element) {
      if (item.element.getAttribute("placeholder") !== value) {
        item.element.setAttribute("placeholder", value);
      }
    } else if (item.mode === "alt" && item.element) {
      if (item.element.getAttribute("alt") !== value) {
        item.element.setAttribute("alt", value);
      }
    } else if (item.mode === "attr" && item.element && item.attrName) {
      if (item.element.getAttribute(item.attrName) !== value) {
        item.element.setAttribute(item.attrName, value);
      }
    }
  });

  if (Object.keys(persisted).length) {
    mergeStoredPageRuntimeMap(path, language, persisted);
  }

  return changed || Object.keys(storedMap).length > 0;
}

const PAGE_META_FIELDS = [
  { key: "title", kind: "title" },
  { key: "description", name: "description" },
  { key: "keywords", name: "keywords" },
  { key: "ogTitle", property: "og:title" },
  { key: "ogDescription", property: "og:description" },
  { key: "twitterTitle", name: "twitter:title" },
  { key: "twitterDescription", name: "twitter:description" },
];

const originalPageMeta = {
  captured: false,
  pathname: "",
  title: "",
  description: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  twitterTitle: "",
  twitterDescription: "",
};

const PAGE_META_STORAGE_PREFIX = "pageMetaV1:";

function pageMetaStorageKey(pathname, language) {
  const path = (pathname || "").trim() || "/";
  const lang = normalizeLanguageCode(language);
  return `${PAGE_META_STORAGE_PREFIX}${path}|${lang}`;
}

function readStoredPageMeta(pathname, language) {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(pageMetaStorageKey(pathname, language));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredPageMeta(pathname, language, fields) {
  if (typeof localStorage === "undefined" || !fields) return;
  try {
    localStorage.setItem(
      pageMetaStorageKey(pathname, language),
      JSON.stringify(fields)
    );
  } catch {
    // Ignore quota errors.
  }
}

function readHeadMetaContent({ name, property } = {}) {
  if (typeof document === "undefined") return "";
  const selector = property
    ? `meta[property="${property}"]`
    : `meta[name="${name}"]`;
  return (document.querySelector(selector)?.getAttribute("content") || "").trim();
}

function writeHeadMetaContent({ name, property, kind } = {}, value) {
  if (typeof document === "undefined" || value == null) return;
  if (kind === "title") {
    document.title = value;
    return;
  }
  const selector = property
    ? `meta[property="${property}"]`
    : `meta[name="${name}"]`;
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute("content", value);
  }
}

function localizedMetaValue(source, language) {
  const trimmed = (source || "").trim();
  if (!trimmed || isEnglishLanguage(language)) return trimmed;
  return getRuntimeCachedTranslation(trimmed, language) || "";
}

export function captureOriginalPageMeta(pathname = "") {
  if (typeof document === "undefined") return;

  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "") ||
    "";

  if (originalPageMeta.captured && originalPageMeta.pathname === path) {
    return;
  }

  originalPageMeta.pathname = path;
  originalPageMeta.title = (document.title || "").trim();
  originalPageMeta.description = readHeadMetaContent({ name: "description" });
  originalPageMeta.keywords = readHeadMetaContent({ name: "keywords" });
  originalPageMeta.ogTitle = readHeadMetaContent({ property: "og:title" });
  originalPageMeta.ogDescription = readHeadMetaContent({
    property: "og:description",
  });
  originalPageMeta.twitterTitle = readHeadMetaContent({ name: "twitter:title" });
  originalPageMeta.twitterDescription = readHeadMetaContent({
    name: "twitter:description",
  });
  originalPageMeta.captured = true;
}

export function restoreEnglishPageMeta() {
  if (!originalPageMeta.captured || typeof document === "undefined") return;

  PAGE_META_FIELDS.forEach((field) => {
    const original = originalPageMeta[field.key];
    if (!original) return;
    writeHeadMetaContent(field, original);
  });
}

export function applyCachedLocalizedPageMeta(language) {
  if (typeof document === "undefined" || !shouldApplyDomTranslation(language)) {
    return;
  }
  if (!originalPageMeta.captured) {
    captureOriginalPageMeta();
  }

  if (isEnglishLanguage(language)) {
    restoreEnglishPageMeta();
    return;
  }

  const stored = readStoredPageMeta(originalPageMeta.pathname, language);

  PAGE_META_FIELDS.forEach((field) => {
    const original = originalPageMeta[field.key];
    if (!original) return;

    const fromStore = (stored?.[field.key] || "").trim();
    if (fromStore) {
      writeHeadMetaContent(field, fromStore);
      return;
    }

    const localized = localizedMetaValue(original, language);
    if (localized) {
      writeHeadMetaContent(field, localized);
    }
  });
}

export async function syncLocalizedPageMeta(language) {
  if (typeof document === "undefined" || !shouldApplyDomTranslation(language)) {
    return;
  }
  if (!originalPageMeta.captured) {
    captureOriginalPageMeta();
  }

  if (isEnglishLanguage(language)) {
    restoreEnglishPageMeta();
    return;
  }

  applyCachedLocalizedPageMeta(language);

  const pending = PAGE_META_FIELDS.map((field) => ({
    field,
    source: (originalPageMeta[field.key] || "").trim(),
  })).filter(
    ({ source }) =>
      source &&
      shouldAutoTranslateText(source) &&
      !getRuntimeCachedTranslation(source, language)
  );

  if (!pending.length) return;

  const translated = await translateRuntimeTexts(
    pending.map((item) => item.source),
    language
  );

  const storedFields = {};

  pending.forEach((item, index) => {
    const value = (translated[index] || "").trim();
    if (!value || value === item.source) return;
    writeHeadMetaContent(item.field, value);
    rememberRuntimeTranslation(language, item.source, value);
    storedFields[item.field.key] = value;
  });

  if (Object.keys(storedFields).length) {
    const existing =
      readStoredPageMeta(originalPageMeta.pathname, language) || {};
    writeStoredPageMeta(originalPageMeta.pathname, language, {
      ...existing,
      ...storedFields,
    });
  }
}

/** Unique English strings on the page (body + meta) that still need runtime translation. */
export function collectPageRuntimeSources(root, language) {
  if (!root || isEnglishLanguage(language)) return [];

  const pending = collectAutoTranslateTargets(root, language);
  const sources = new Set(
    pending.map((item) => item.source).filter((value) => value && value.trim())
  );

  if (!originalPageMeta.captured) {
    captureOriginalPageMeta();
  }

  PAGE_META_FIELDS.forEach((field) => {
    const source = (originalPageMeta[field.key] || "").trim();
    if (
      source &&
      shouldAutoTranslateText(source) &&
      !getRuntimeCachedTranslation(source, language)
    ) {
      sources.add(source);
    }
  });

  return [...sources];
}

/** Warm runtime cache for all visible page strings (best-effort, non-blocking). */
export async function prefetchPageRuntimeTranslations(language, root = null) {
  if (
    typeof document === "undefined" ||
    isEnglishLanguage(language) ||
    !shouldApplyDomTranslation(language)
  ) {
    return;
  }

  const targetRoot = root || document.body;
  if (!targetRoot) return;

  captureOriginalTexts(targetRoot);
  const sources = collectPageRuntimeSources(targetRoot, language);
  if (!sources.length) return;

  const path = resolvePagePathname();
  const translated = await translateRuntimeTexts(sources, language);
  const entries = {};

  sources.forEach((source, index) => {
    const value = (translated[index] || "").trim();
    if (value && value !== source) {
      entries[source] = value;
      rememberRuntimeTranslation(language, source, value);
    }
  });

  if (Object.keys(entries).length) {
    mergeStoredPageRuntimeMap(path, language, entries);
  }
}
