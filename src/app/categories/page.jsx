import CategoriesListClient from "@/components/category/CategoriesListClient";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import {
  CategoriesBreadcrumbClient,
  CategoriesCtaClient,
  CategoriesHeroClient,
} from "@/components/category/CategoriesPageChromeClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const dynamic = "force-dynamic";

// Fetch categories on server
async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories/`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();

    return Array.isArray(data)
      ? data.filter((cat) => cat.is_active !== false)
      : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function getExamCountByCategorySlug(slug) {
  try {
    if (!slug) return 0;

    const res = await fetch(
      `${API_BASE_URL}/api/courses/category/${encodeURIComponent(slug)}/`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return 0;

    const data = await res.json();

    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

async function getCategoriesPageSeo() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/categories-page-seo/`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch {
    return null;
  }
}

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

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      examCount: await getExamCountByCategorySlug(category.slug),
    }))
  );

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

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
        ]}
      />
      <div className="min-h-screen bg-[#f5f7fa] overflow-hidden">
      <CategoriesBreadcrumbClient />
      <CategoriesHeroClient
        heroTitle={heroTitle}
        heroDescription={heroDescription}
        heroStats={heroStats}
      />

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
      <CategoriesCtaClient />
      </div>
    </>
  );
}