import { shouldApplyDomTranslation } from "@/lib/i18nSwitchGuard";

/** Lets LanguageContext trigger the same instant DOM pass as I18nDomSync without a circular import. */
let instantHandler = null;

export function setInstantLanguageHandler(handler) {
  instantHandler = typeof handler === "function" ? handler : null;
}

export function runInstantLanguageSync(translations, language) {
  if (
    !instantHandler ||
    typeof document === "undefined" ||
    !shouldApplyDomTranslation(language)
  ) {
    return;
  }
  instantHandler(translations, language);
}
