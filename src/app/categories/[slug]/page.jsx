// app/categories/[slug]/page.jsx

import CategoryDetail from "@/components/category/CategoryDetail";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const SITE_URL = "https://allexamquestions.com";

const PAGE_CONTAINER = "container mx-auto px-4";

function getCategoryCourseStats(courses) {
  const safeCourses = Array.isArray(courses) ? courses : [];
  let practiceTests = 0;
  let questions = 0;
  const providers = new Set();

  safeCourses.forEach((course) => {
    const provider = String(course?.provider || "").trim();
    if (provider) providers.add(provider);

    if (
      course?.practice_tests_list &&
      Array.isArray(course.practice_tests_list) &&
      course.practice_tests_list.length > 0
    ) {
      practiceTests += course.practice_tests_list.length;
      questions += course.practice_tests_list.reduce(
        (sum, test) => sum + (parseInt(test?.questions, 10) || 0),
        0
      );
    } else {
      practiceTests += parseInt(course?.practice_exams, 10) || 0;
      questions += parseInt(course?.questions, 10) || 0;
    }
  });

  return {
    totalCourses: safeCourses.length,
    practiceTests,
    questions,
    providers: providers.size,
  };
}

async function fetchCategoryData(slug) {
  if (!slug) {
    return { category: null, courses: [], error: true };
  }

  try {
    const [categoryRes, coursesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories/${slug}/`, {
        next: { revalidate: 60 },
      }),
      fetch(`${API_BASE_URL}/api/courses/category/${slug}/`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (!categoryRes.ok) {
      return { category: null, courses: [], error: true };
    }

    const category = await categoryRes.json();

    let courses = [];

    if (coursesRes.ok) {
      const coursesData = await coursesRes.json();

      courses = Array.isArray(coursesData)
        ? coursesData.filter((course) => course.is_active !== false)
        : [];
    }

    return {
      category,
      courses,
      error: false,
    };
  } catch (err) {
    console.error("Error fetching category page data:", err);

    return {
      category: null,
      courses: [],
      error: true,
    };
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  const canonicalUrl = `${SITE_URL}/categories/${slug || ""}`.replace(
    /\/$/,
    ""
  );

  if (!slug) {
    return {
      title: "Category Not Found | AllExamQuestions",
      description: "The requested category does not exist.",
      alternates: {
        canonical: `${SITE_URL}/categories`,
      },
      openGraph: {
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
        url: `${SITE_URL}/categories`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
      },
    };
  }

  const { category } = await fetchCategoryData(slug);

  if (!category) {
    return {
      title: "Category Not Found | AllExamQuestions",
      description: "The requested category does not exist.",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
        url: canonicalUrl,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
      },
    };
  }

  const categoryTitle = category?.title || category?.name || "Category";

  const title =
    category?.meta_title?.trim() ||
    `${categoryTitle} - Certification Exams | AllExamQuestions`;

  const description =
    category?.meta_description?.trim() ||
    category?.description?.trim() ||
    `Practice ${categoryTitle} certification exams with updated questions and realistic mock tests.`;

  const keywords =
    category?.meta_keywords?.trim() ||
    `${categoryTitle}, certification exams, practice tests, mock tests`;

  const ogImage = category?.meta_image || `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  const { category, courses, error } = await fetchCategoryData(slug);

  const categoryTitle = category?.title || category?.name || "Category";

  const stats = getCategoryCourseStats(courses);
  const { totalCourses, practiceTests, questions, providers } = stats;

  const heroTitle =
    category?.hero_title?.trim() || categoryTitle;

  const heroDescription =
    category?.hero_subtitle?.trim() ||
    category?.description?.trim() ||
    `Practice updated ${categoryTitle} certification exams with realistic mock tests, latest questions, and detailed explanations.`;

  const dynamicFeatureTags = [
    totalCourses > 0 ? `${totalCourses}+ Exams` : null,
    practiceTests > 0 ? `${practiceTests}+ Practice Tests` : null,
    questions > 0 ? `${questions}+ Questions` : null,
    providers > 0 ? `${providers}+ Providers` : null,
  ].filter(Boolean);

  const overviewStats = [
    { value: totalCourses, label: "Available Exams" },
    { value: practiceTests, label: "Practice Tests" },
    { value: questions, label: "Questions" },
    { value: providers, label: "Providers" },
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    {
      name: categoryTitle,
      url: `/categories/${slug || ""}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <section className="relative overflow-hidden border-b border-white/10 bg-[#071028]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className={`relative ${PAGE_CONTAINER} py-10 lg:py-14`}>
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-500" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/categories"
                    className="text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    Categories
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-cyan-200 font-medium truncate max-w-[200px] sm:max-w-none">
                  {categoryTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-200 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-300"></span>
                {totalCourses}+ Certification Practice Tests Available
              </div>

              <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {heroTitle}
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {heroDescription}
              </p>

              {dynamicFeatureTags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {dynamicFeatureTags.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#courses"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
                >
                  Explore Exams
                </a>

                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Browse Categories
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 blur-2xl"></div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-cyan-300">
                      Category Overview
                    </div>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {categoryTitle}
                    </h2>
                  </div>
                  <div className="rounded-xl bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    Active
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {overviewStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-[#0b1736] p-4"
                    >
                      <div className="text-2xl font-black text-white">
                        {stat.value}+
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className={`${PAGE_CONTAINER} pb-16 pt-10`}>
        {/* <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {categoryTitle} Exams & Practice Tests
            </h2>
            <p className="mt-2 text-slate-600">
              {heroDescription}
            </p>
          </div>
          <div className="inline-flex items-center rounded-2xl bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700">
            {totalCourses} Exams Available
          </div>
        </div> */}

        <CategoryDetail
          slug={slug}
          category={category}
          courses={courses}
          loading={false}
          error={error}
          embedded={true}
          showBreadcrumb={false}
        />
      </section>
    </div>
  );
}
