"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

/**
 * Renders static UI copy from the active language dictionary.
 * All strings live in translation catalogs — never pass English here.
 */
export default function Trans({
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
