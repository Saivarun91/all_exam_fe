"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

export default function SeoIntroHeadingClient({ heading }) {
  const { lt } = useLanguage();

  return (
    <h2
      className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
      {...{ [REACT_I18N_ATTR]: "" }}
    >
      {lt("cms.seo.heading", heading)}
    </h2>
  );
}
