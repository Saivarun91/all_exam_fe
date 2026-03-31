import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF]"
            >
              <CardContent className="p-6 space-y-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-[#1A73E8]" />
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="text-xl font-bold text-[#0C1A35]">
                    {category.title}
                  </h3>

                  {category.description && (
                    <p className="text-sm text-[#0C1A35]/60 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Button */}
                <Button
                  asChild
                  className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                >
                  <Link href={`/${category.slug}`}>
                    View Exams
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}