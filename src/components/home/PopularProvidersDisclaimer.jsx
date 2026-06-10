"use client";

import Trans from "@/components/i18n/Trans";

export default function PopularProvidersDisclaimer() {
  return (
    <p className="text-left text-[#0C1A35]/60 text-xs md:text-sm mt-6 md:mt-8 px-2">
      <Trans i18nKey="home.providers.disclaimer" />
    </p>
  );
}
