import { languageCodesMatch, normalizeLanguageCode } from "@/lib/supportedLocales";

let switching = false;
let switchGeneration = 0;
let activeTargetLanguage = null;
let unlockTimer = null;

export function beginLanguageSwitch(targetLanguage) {
  switching = true;
  switchGeneration += 1;
  activeTargetLanguage = normalizeLanguageCode(
    targetLanguage || ""
  );

  if (unlockTimer) {
    clearTimeout(unlockTimer);
    unlockTimer = null;
  }

  if (typeof window !== "undefined") {
    window.__LANG_SWITCHING__ = true;
    window.dispatchEvent(
      new CustomEvent("languageSwitchBegin", {
        detail: {
          language: activeTargetLanguage,
          generation: switchGeneration,
        },
      })
    );
  }

  return switchGeneration;
}

export function endLanguageSwitch(delayMs = 300) {
  if (typeof window === "undefined") {
    switching = false;
    return;
  }

  if (unlockTimer) {
    clearTimeout(unlockTimer);
  }

  unlockTimer = window.setTimeout(() => {
    switching = false;
    unlockTimer = null;
    window.__LANG_SWITCHING__ = false;
    window.dispatchEvent(
      new CustomEvent("languageSwitchEnd", {
        detail: {
          language: activeTargetLanguage,
          generation: switchGeneration,
        },
      })
    );
  }, delayMs);
}

export function isLanguageSwitchLocked() {
  if (typeof window !== "undefined" && window.__LANG_SWITCHING__) {
    return true;
  }
  return switching;
}

export function getLanguageSwitchGeneration() {
  return switchGeneration;
}

export function getActiveSwitchTargetLanguage() {
  return activeTargetLanguage;
}

export function isStaleLanguageSwitch(generation, langCode) {
  if (generation != null && generation !== switchGeneration) {
    return true;
  }

  if (
    isLanguageSwitchLocked() &&
    langCode &&
    activeTargetLanguage &&
    !languageCodesMatch(langCode, activeTargetLanguage)
  ) {
    return true;
  }

  return false;
}

export function shouldApplyDomTranslation(langCode) {
  if (!isLanguageSwitchLocked()) {
    return true;
  }

  if (!langCode || !activeTargetLanguage) {
    return false;
  }

  return languageCodesMatch(langCode, activeTargetLanguage);
}
