"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

export default function PopularProvidersIntroClient({
  heading,
  subtitle,
}) {
  const { lt } = useLanguage();

  return (
    <>
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2"
        {...{ [REACT_I18N_ATTR]: "" }}
      >
        {lt("cms.providers.heading", heading || "Popular Providers")}
      </h2>

      {subtitle && (
        <p
          className="text-center text-[#0C1A35]/70 mb-8 md:mb-12 text-sm sm:text-base md:text-lg px-2"
          {...{ [REACT_I18N_ATTR]: "" }}
        >
          {lt("cms.providers.subtitle", subtitle)}
        </p>
      )}
    </>
  );
}
