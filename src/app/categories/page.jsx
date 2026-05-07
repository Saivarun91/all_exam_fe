import CategoriesListClient from "@/components/category/CategoriesListClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Fetch categories on server
async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories/`, {
      next: { revalidate: 60 },
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
        next: { revalidate: 60 },
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
      { next: { revalidate: 60 } }
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

// Generate dynamic SEO metadata
export async function generateMetadata() {
  const pageSeo = await getCategoriesPageSeo();
  const categories = await getCategories();
  const titles = categories.map((cat) => cat.title).filter(Boolean).join(", ");
  const descriptions = categories
    .map((cat) => cat.description || "")
    .filter(Boolean)
    .join(" | ");
  const seoTitle = categories.find((cat) => cat.meta_title?.trim())?.meta_title?.trim();
  const seoDescription = categories
    .find((cat) => cat.meta_description?.trim())
    ?.meta_description?.trim();
  const seoKeywords = categories
    .map((cat) => cat.meta_keywords || "")
    .filter(Boolean)
    .join(", ");

  if (pageSeo?.meta_title?.trim() || pageSeo?.meta_description?.trim() || pageSeo?.meta_keywords?.trim()) {
    return {
      title:
        pageSeo.meta_title?.trim() ||
        (titles ? `All Categories | ${titles}` : "All Categories | AllExamQuestions"),
      description:
        pageSeo.meta_description?.trim() ||
        descriptions ||
        "Browse certification categories including cloud, security, networking, and more.",
      keywords: pageSeo.meta_keywords?.trim() || seoKeywords || titles,
      alternates: {
        canonical: "https://allexamquestions.com/categories", // canonical URL
      },
      openGraph: {
        title: pageSeo.meta_title?.trim() || (titles ? `All Categories | ${titles}` : "All Categories | AllExamQuestions"),
        description: pageSeo.meta_description?.trim() || descriptions || "Browse certification categories including cloud, security, networking, and more.",
        url: "https://allexamquestions.com/categories",
        type: "website",
        images: [
          { url: "https://allexamquestions.com/alleq_logo.png", width: 1200, height: 630 },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: pageSeo.meta_title?.trim() || (titles ? `All Categories | ${titles}` : "All Categories | AllExamQuestions"),
        description: pageSeo.meta_description?.trim() || descriptions || "Browse certification categories including cloud, security, networking, and more.",
        images: [ "https://allexamquestions.com/alleq_logo.png"],
      },
    };
    
  }

  return {
    title: seoTitle || (titles ? `All Categories | ${titles}` : "All Categories | AllExamQuestions"),
    description:
      seoDescription ||
      descriptions ||
      "Browse certification categories including cloud, security, networking, and more.",
    keywords: seoKeywords || titles,
    alternates: {
      canonical: "https://allexamquestions.com/categories", // canonical URL
    },
  };
}

// Server component
export default async function CategoriesPage() {
  const categories = await getCategories();
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      examCount: await getExamCountByCategorySlug(category.slug),
    }))
  );
  const groupedCategories = categoriesWithCounts.reduce((acc, category) => {
    const heading = getMainCategoryHeading(category);
    if (!acc[heading]) acc[heading] = [];
    acc[heading].push(category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-3">
            All Categories
          </h1>
          <p className="text-[#0C1A35]/70 max-w-2xl">
            Browse certification categories including cloud, security,
            networking, and more.
          </p>
        </div>

        <CategoriesListClient groupedCategories={groupedCategories} />
      </div>
    </div>
  );
}