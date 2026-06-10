"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

/**
 * Client-only label from the active language catalog (no inline English).
 */
export default function LocalizedText({
  i18nKey,
  as: Component = "span",
  className = "",
  ...props
}) {
  const { t } = useLanguage();

  return (
    <Component className={className} {...{ [REACT_I18N_ATTR]: "" }} {...props}>
      {t(i18nKey)}
    </Component>
  );
}
