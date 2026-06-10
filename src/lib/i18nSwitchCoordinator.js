import { isEnglishLanguage } from "@/lib/defaultTranslations";
import {
  captureOriginalTexts,
  restoreAutoTranslatedEnglish,
  restoreEnglishPageMeta,
} from "@/lib/domAutoTranslate";

/** Wait for I18nLanguageBoundary remount to commit after flushSync. */
export function waitForReactRemount() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Restore English sources and snapshot originals on the post-remount DOM.
 * Must run after waitForReactRemount() during an active language switch.
 */
export function prepareDomAfterLanguageRemount(nextLanguage) {
  if (typeof document === "undefined") return;

  if (isEnglishLanguage(nextLanguage)) {
    restoreEnglishPageMeta();
    restoreAutoTranslatedEnglish(document.body);
    return;
  }

  restoreAutoTranslatedEnglish(document.body);
  captureOriginalTexts(document.body);
}
