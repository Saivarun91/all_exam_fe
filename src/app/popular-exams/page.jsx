import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createSlug, getExamUrl } from "@/lib/utils";
import {
  categoriesListUrl,
  coursesListUrl,
  publicFetchOptions,
} from "@/lib/serverRevalidate";

export const revalidate = 60;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchData() {
  try {
    const [categoriesRes, coursesRes] = await Promise.all([
      fetch(categoriesListUrl(API_BASE_URL), publicFetchOptions()),
      fetch(coursesListUrl(API_BASE_URL), publicFetchOptions()),
    ]);

    const categoriesData = await categoriesRes.json();
    const coursesData = await coursesRes.json();

    return {
      categories: Array.isArray(categoriesData)
        ? categoriesData.filter((c) => c.is_active !== false)
        : [],
      exams: Array.isArray(coursesData)
        ? coursesData.filter((c) => c.is_active !== false)
        : [],
    };
  } catch {
    return {
      categories: [],
      exams: [],
    };
  }
}

export async function generateMetadata() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/home/exams-page-seo/`, {
      ...publicFetchOptions(),
    });

    if (!res.ok) throw new Error("SEO fetch failed");

    const seoData = await res.json();
    const title = seoData?.meta_title
      ? `${seoData.meta_title} | All Exam Questions`
      : "Popular Exams | All Exam Questions";
    const description =
      seoData?.meta_description || "Explore all popular exams and categories.";

    return {
      title,
      description,
      keywords: seoData?.meta_keywords || "",
      alternates: { canonical: "https://allexamquestions.com/popular-exams" },
    };
  } catch {
    return {
      title: "Popular Exams | All Exam Questions",
      description: "Explore all popular exams and categories.",
      alternates: { canonical: "https://allexamquestions.com/popular-exams" },
    };
  }
}

export default async function PopularExamsPage() {
  const data = await fetchData();
  // const heading = "Popular Exam Categories & Exams";

  const categoryLinkItems = (Array.isArray(data.categories) ? data.categories : [])
    .map((category) => {
      const label = category?.name || category?.title || "";
      const slug = category?.slug || createSlug(label);
      return {
        label: String(label || "").trim(),
        href: `/categories/${slug}`,
      };
    })
    .filter((item) => item.label && item.href !== "/categories/")
    .slice(0, 40);

  const examLinkItems = [];
  const seen = new Set();
  const exams = Array.isArray(data.exams) ? data.exams : [];
  for (const exam of exams) {
    const label = exam?.title || exam?.name || exam?.code || "";
    const href = getExamUrl(exam);
    if (!label || !href || href === "#") continue;
    const key = `${String(label).toLowerCase()}::${href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    examLinkItems.push({ label, href });
    if (examLinkItems.length >= 60) break;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] via-white to-white">
      <section className="px-4 pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="container mx-auto max-w-7xl">
          <div className="relative mb-8 md:mb-10 overflow-hidden rounded-2xl border border-[#DDE7FF] bg-gradient-to-r from-[#0C1A35] via-[#123469] to-[#1A73E8] p-6 md:p-8 shadow-md">
            <div className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 max-w-4xl">
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 mb-4">
                Explore and Practice
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                Popular Exam Categories & Exams
              </h1>
              <p className="text-sm md:text-base text-white/90 max-w-3xl">
                Find the right category and start with the exam you need. All links below
                take you directly to the relevant page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-[#DDE7FF] bg-white shadow-sm overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-[#E8EEFF] bg-[#F8FBFF]">
                <h2 className="text-xl font-semibold text-[#0C1A35]">Categories</h2>
                <p className="text-xs text-[#0C1A35]/60 mt-1">
                  {categoryLinkItems.length} available
                </p>
              </div>
              <div className="p-5 md:p-6">
                {categoryLinkItems.length > 0 ? (
                  <div className="space-y-2">
                    {categoryLinkItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        prefetch={false}
                        className="block w-full rounded-md border border-[#CFE0FF] bg-[#F5F9FF] px-3 py-2 text-sm text-[#1557B0] underline underline-offset-2 hover:bg-[#EAF2FF] hover:border-[#BBD3FF] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0C1A35]/60">No categories available.</p>
                )}
              </div>
            </Card>

            <Card className="border border-[#DDE7FF] bg-white shadow-sm overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-[#E8EEFF] bg-[#F8FBFF]">
                <h2 className="text-xl font-semibold text-[#0C1A35]">Popular Exams</h2>
                <p className="text-xs text-[#0C1A35]/60 mt-1">
                  {examLinkItems.length} available
                </p>
              </div>
              <div className="p-5 md:p-6">
                {examLinkItems.length > 0 ? (
                  <div className="space-y-2">
                    {examLinkItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        prefetch={false}
                        className="block w-full rounded-md border border-[#CFE0FF] bg-[#F5F9FF] px-3 py-2 text-sm text-[#1557B0] underline underline-offset-2 hover:bg-[#EAF2FF] hover:border-[#BBD3FF] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0C1A35]/60">No exams available.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
