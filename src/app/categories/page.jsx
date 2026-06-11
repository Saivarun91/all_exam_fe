import { cache } from "react";
import CategoriesListClient from "@/components/category/CategoriesListClient";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import SiteBreadcrumbs, {
  SiteBreadcrumbBar,
  toBreadcrumbJsonLdItems,
} from "@/components/common/SiteBreadcrumbs";
import { attachExamCounts } from "@/lib/categoryCounts";
import { publicFetchOptions } from "@/lib/serverRevalidate";
import { t } from "@/lib/uiStrings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const getCategories = cache(async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories/`, publicFetchOptions());

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();

    return Array.isArray(data)
      ? data.filter((cat) => cat.is_active !== false)
      : [];
  } catch (err) {
    console.error(err);
    return [];
  }
});

const getCategoriesPageSeo = cache(async function getCategoriesPageSeo() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/categories-page-seo/`,
      publicFetchOptions()
    );

    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch {
    return null;
  }
});

function getMainCategoryHeading(category) {
  const rawHeading =
    category?.main_category ||
    category?.category ||
    category?.parent_category ||
    category?.group ||
    "";

  const heading = String(rawHeading || "").trim();

  return heading || "Other Categories";
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;

  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return ["true", "1", "yes", "y", "on"].includes(normalized);
  }

  return false;
}

// Generate dynamic SEO metadata
export async function generateMetadata() {
  const pageSeo = await getCategoriesPageSeo();
  const categories = await getCategories();

  const titles = categories
    .map((cat) => cat.title)
    .filter(Boolean)
    .join(", ");

  const descriptions = categories
    .map((cat) => cat.description || "")
    .filter(Boolean)
    .join(" | ");

  const seoTitle = categories
    .find((cat) => cat.meta_title?.trim())
    ?.meta_title?.trim();

  const seoDescription = categories
    .find((cat) => cat.meta_description?.trim())
    ?.meta_description?.trim();

  const seoKeywords = categories
    .map((cat) => cat.meta_keywords || "")
    .filter(Boolean)
    .join(", ");

  if (
    pageSeo?.meta_title?.trim() ||
    pageSeo?.meta_description?.trim() ||
    pageSeo?.meta_keywords?.trim()
  ) {
    return {
      title:
        pageSeo.meta_title?.trim() ||
        (titles
          ? `All Categories | ${titles}`
          : "All Categories | AllExamQuestions"),

      description:
        pageSeo.meta_description?.trim() ||
        descriptions ||
        "Browse certification categories including cloud, security, networking, and more.",

      keywords: pageSeo.meta_keywords?.trim() || seoKeywords || titles,

      alternates: {
        canonical: "https://allexamquestions.com/categories",
      },

      openGraph: {
        title:
          pageSeo.meta_title?.trim() ||
          (titles
            ? `All Categories | ${titles}`
            : "All Categories | AllExamQuestions"),

        description:
          pageSeo.meta_description?.trim() ||
          descriptions ||
          "Browse certification categories including cloud, security, networking, and more.",

        url: "https://allexamquestions.com/categories",

        type: "website",

        images: [
          {
            url: "https://allexamquestions.com/alleq_logo.png",
            width: 1200,
            height: 630,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",

        title:
          pageSeo.meta_title?.trim() ||
          (titles
            ? `All Categories | ${titles}`
            : "All Categories | AllExamQuestions"),

        description:
          pageSeo.meta_description?.trim() ||
          descriptions ||
          "Browse certification categories including cloud, security, networking, and more.",

        images: ["https://allexamquestions.com/alleq_logo.png"],
      },
    };
  }

  return {
    title:
      seoTitle ||
      (titles
        ? `All Categories | ${titles}`
        : "All Categories | AllExamQuestions"),

    description:
      seoDescription ||
      descriptions ||
      "Browse certification categories including cloud, security, networking, and more.",

    keywords: seoKeywords || titles,

    alternates: {
      canonical: "https://allexamquestions.com/categories",
    },
  };
}

// Server component
export default async function CategoriesPage() {
  const [categories, pageSeo] = await Promise.all([
    getCategories(),
    getCategoriesPageSeo(),
  ]);

  const categoriesWithCounts = await attachExamCounts(categories);

  const topCertificationCategories = categoriesWithCounts.filter((category) =>
    parseBoolean(category?.is_top_certification)
  );

  // Group categories
  const groupedCategories = categoriesWithCounts.reduce((acc, category) => {
    const heading = getMainCategoryHeading(category);

    if (!acc[heading]) acc[heading] = [];

    acc[heading].push(category);

    return acc;
  }, {});

  // Dynamic Counts
  const totalCategories = categoriesWithCounts.length;

  const totalTopCategories = topCertificationCategories.length;

  const totalExams = categoriesWithCounts.reduce(
    (acc, item) => acc + (item.examCount || 0),
    0
  );

  const totalMainDomains = Object.keys(groupedCategories).length;

  const heroStats = [
    {
      value: totalCategories,
      label: "Total Categories",
      labelKey: "categories.page.stat_total",
      barClass: "from-slate-400 to-slate-200",
      valueClass: "text-slate-100",
      cardClass:
        "border-white/10 bg-gradient-to-br from-slate-900/20 to-slate-800/10",
    },
    {
      value: totalTopCategories,
      label: "Top Certifications",
      labelKey: "categories.page.stat_top",
      barClass: "from-cyan-300 to-blue-400",
      valueClass: "text-cyan-300",
      cardClass:
        "border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20",
    },
    {
      value: totalExams,
      label: "Practice Exams",
      labelKey: "categories.page.stat_exams",
      barClass: "from-slate-400 to-slate-200",
      valueClass: "text-slate-100",
      cardClass:
        "border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20",
    },
    {
      value: totalMainDomains,
      label: "Main Domains",
      labelKey: "categories.page.stat_domains",
      barClass: "from-cyan-300 to-blue-400",
      valueClass: "text-cyan-300",
      cardClass:
        "border-white/10 bg-gradient-to-br from-slate-900/20 to-slate-800/10",
    },
  ];

  const maxHeroStat = Math.max(...heroStats.map((stat) => stat.value), 1);

  const getHeroStatBarWidth = (value) => {
    if (!value) return "0%";
    const percent = Math.round((value / maxHeroStat) * 100);
    return `${Math.min(100, Math.max(percent, value > 0 ? 12 : 0))}%`;
  };

  const heroTitle = pageSeo?.hero_title?.trim() || "";

  const heroDescription = pageSeo?.hero_subtitle?.trim() || "";

  const ctaTitle = t("categories.page.cta_title");
  const ctaSubtitle = t("categories.page.cta_subtitle");
  const exploreExamsLabel = t("common.explore_exams");
  const browseProvidersLabel = t("common.browse_providers");

  return (
    <>
      <BreadcrumbJsonLd
        items={toBreadcrumbJsonLdItems([
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
        ])}
      />
      <div className="min-h-screen bg-[#f5f7fa] overflow-hidden">
      <SiteBreadcrumbBar>
        <SiteBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
          ]}
        />
      </SiteBreadcrumbBar>
      {/* ================= HERO SECTION ================= */}
      <section className="relative">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e40af_0%,_transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#06b6d4_0%,_transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_#071120,_#0B1730)]" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative container mx-auto px-4 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT CONTENT */}
            <div>
              {/* Badge */}
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 text-sm font-medium backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Trusted Certification Preparation Platform
              </div> */}

              {/* Heading */}
              <h1 className="mt-8 text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] text-white">
                <span
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400"
                  data-i18n="cms.categories_page.hero_title"
                  data-i18n-fallback={heroTitle}
                >
                  {heroTitle}
                </span>
              </h1>

              <p
                className="mt-8 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl"
                data-i18n="cms.categories_page.hero_subtitle"
                data-i18n-fallback={heroDescription}
              >
                {heroDescription}
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                {/* <button className="px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_10px_40px_rgba(14,165,233,0.35)] hover:scale-[1.02] transition-all duration-300">
                  Browse Categories
                </button> */}

                {/* <button className="px-7 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all duration-300">
                  Explore Certifications
                </button> */}
              </div>
            </div>

            {/* RIGHT SIDE PREMIUM STATS UI */}
            <div className="relative">
              {/* Glow */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>

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
                      data-i18n={stat.labelKey}
                      data-i18n-fallback={stat.label}
                    >
                      {stat.label}
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

      {/* ================= MAIN CONTENT ================= */}
      <section className="relative -mt-8 z-20">
        <div className="container mx-auto px-4 pb-20">

          {/* Simple Section Header Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mb-6"></div>

          {/* Content Area (clean, not card style) */}
          <div className="py-6 md:py-10">
            <CategoriesListClient
              groupedCategories={groupedCategories}
              topCertificationCategories={topCertificationCategories}
            />
          </div>

        </div>
      </section>
      {/* ================= SIMPLE CTA SECTION ================= */}
      <section className="py-16 bg-gradient-to-r from-[#eaf2ff] via-[#e6f0ff] to-[#f1f5f9]">
        <div className="container mx-auto px-4 text-center">

          <h2
            className="text-3xl md:text-4xl font-black text-slate-900"
            data-i18n="categories.page.cta_title"
            data-i18n-fallback={ctaTitle}
          >
            {ctaTitle}
          </h2>

          <p
            className="mt-4 text-slate-600 max-w-2xl mx-auto"
            data-i18n="categories.page.cta_subtitle"
            data-i18n-fallback={ctaSubtitle}
          >
            {ctaSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/exams"
              className="px-7 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all"
              data-i18n="common.explore_exams"
              data-i18n-fallback={exploreExamsLabel}
            >
              {exploreExamsLabel}
            </a>

            <a
              href="/providers"
              className="px-7 py-3 rounded-xl border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100 transition-all"
              data-i18n="common.browse_providers"
              data-i18n-fallback={browseProvidersLabel}
            >
              {browseProvidersLabel}
            </a>
          </div>

        </div>
      </section>
      </div>
    </>
  );
}