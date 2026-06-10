"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";
import SubscribeForm from "./SubscribeForm";

export default function EmailSubscribeClient({
  title,
  subtitle,
  buttonText,
  privacyText,
}) {
  const { lt } = useLanguage();

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4C1D95]">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2"
            {...{ [REACT_I18N_ATTR]: "" }}
          >
            {lt("home.subscribe.title", title)}
          </h2>

          <p
            className="text-base sm:text-lg md:text-xl text-white/80 px-2"
            {...{ [REACT_I18N_ATTR]: "" }}
          >
            {lt("home.subscribe.subtitle", subtitle)}
          </p>

          <SubscribeForm buttonText={buttonText} />

          <p
            className="text-sm text-white/70"
            {...{ [REACT_I18N_ATTR]: "" }}
          >
            {lt(
              "home.subscribe.privacy",
              privacyText ||
                "No spam. Unsubscribe anytime. Your privacy is protected."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
