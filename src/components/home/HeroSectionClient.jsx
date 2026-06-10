"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";
import WebSiteJsonLd from "@/components/WebSiteJsonLd";
import HeroSearchClient from "./HeroSearchClient";
import HeroSocialProof from "./HeroSocialProof";

export default function HeroSectionClient({
  heroData,
  providers,
  stats,
  title,
  subtitle,
  backgroundStyle,
  bgUrl,
}) {
  const { lt } = useLanguage();

  return (
    <section
      className="relative min-h-[450px] md:min-h-[550px] flex items-center overflow-hidden"
      style={bgUrl ? backgroundStyle : {}}
    >
      <WebSiteJsonLd heroData={heroData} siteName="AllExamQuestions" />

      {bgUrl ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35]/90 via-[#0F2847]/85 to-[#132A54]/90"></div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35] via-[#0F2847] to-[#132A54]"></div>
      )}

      <div className="container mx-auto px-4 relative z-10 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#F5F8FF] px-2"
              {...{ [REACT_I18N_ATTR]: "" }}
            >
              {lt("cms.hero.title", title)}
            </h1>

            <p
              className="text-sm sm:text-base md:text-lg text-[#E7ECF6] max-w-2xl mx-auto leading-relaxed px-2"
              {...{ [REACT_I18N_ATTR]: "" }}
            >
              {lt("cms.hero.subtitle", subtitle)}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-3 md:py-4">
            {stats.map((stat, index) => (
              <div key={stat.label || index} className="text-center space-y-1">
                <div className="text-3xl font-bold text-[#E7ECF6]">
                  {stat.value}
                </div>
                <div
                  className="text-xs text-[#EEF2FA] border-b border-[#4A8FFF]/55 pb-1"
                  {...{ [REACT_I18N_ATTR]: "" }}
                >
                  {lt(`cms.hero.stat${index + 1}.label`, stat.label)}
                </div>
              </div>
            ))}
          </div>

          <HeroSearchClient providers={providers} />

          <HeroSocialProof />
        </div>
      </div>
    </section>
  );
}
