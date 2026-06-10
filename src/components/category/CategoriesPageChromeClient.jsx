"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import Trans from "@/components/i18n/Trans";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

export function CategoriesBreadcrumbClient() {
  const { t } = useLanguage();

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-[#0C1A35]/60 hover:text-[#1A73E8]"
                  {...{ [REACT_I18N_ATTR]: "" }}
                >
                  {t("breadcrumb.home")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className="text-[#0C1A35] font-medium"
                {...{ [REACT_I18N_ATTR]: "" }}
              >
                {t("nav.categories")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

export function CategoriesHeroClient({
  heroTitle,
  heroDescription,
  heroStats,
}) {
  const { lt } = useLanguage();
  const maxHeroStat = Math.max(...heroStats.map((stat) => stat.value), 1);

  const getHeroStatBarWidth = (value) => {
    if (!value) return "0%";
    const percent = Math.round((value / maxHeroStat) * 100);
    return `${Math.min(100, Math.max(percent, value > 0 ? 12 : 0))}%`;
  };

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e40af_0%,_transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#06b6d4_0%,_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_#071120,_#0B1730)]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative container mx-auto px-4 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="mt-8 text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] text-white">
              <span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400"
                {...{ [REACT_I18N_ATTR]: "" }}
              >
                {lt("cms.categories_page.hero_title", heroTitle)}
              </span>
            </h1>

            <p
              className="mt-8 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl"
              {...{ [REACT_I18N_ATTR]: "" }}
            >
              {lt("cms.categories_page.hero_subtitle", heroDescription)}
            </p>

            <div className="mt-10 flex flex-wrap gap-4" />
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" />

            <div className="relative grid grid-cols-2 gap-5">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`h-full rounded-3xl border backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 ${stat.cardClass}`}
                >
                  <div className={`text-5xl font-black ${stat.valueClass}`}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div
                    className="mt-3 text-slate-300 font-medium"
                    {...{ [REACT_I18N_ATTR]: "" }}
                  >
                    {lt(stat.labelKey, stat.label)}
                  </div>
                  <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.barClass} rounded-full transition-all duration-500`}
                      style={{ width: getHeroStatBarWidth(stat.value) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoriesCtaClient() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#eaf2ff] via-[#e6f0ff] to-[#f1f5f9]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900">
          <Trans i18nKey="categories.page.cta_title" />
        </h2>

        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          <Trans i18nKey="categories.page.cta_subtitle" />
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/exams"
            className="px-7 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all"
          >
            <Trans i18nKey="common.explore_exams" />
          </a>

          <a
            href="/providers"
            className="px-7 py-3 rounded-xl border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100 transition-all"
          >
            <Trans i18nKey="common.browse_providers" />
          </a>
        </div>
      </div>
    </section>
  );
}
