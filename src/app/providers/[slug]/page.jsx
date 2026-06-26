// app/providers/[slug]/page.jsx
import { cache } from "react";
import { createSlug } from "@/lib/utils";
import Link from "next/link";
import ProviderDetail from "@/components/provider/ProviderDetail";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import SiteBreadcrumbs, {
  toBreadcrumbJsonLdItems,
} from "@/components/common/SiteBreadcrumbs";
import { publicFetchOptions } from "@/lib/serverRevalidate";

export const revalidate = 60;
import { filterPublicExamListings } from "@/lib/examListingFilters";
import OptimizedImage from "@/components/common/OptimizedImage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SITE_URL = "https://allexamquestions.com";
const PAGE_CONTAINER = "container mx-auto px-4";

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ");
}

function getProviderExamStats(exams) {
  const safeExams = Array.isArray(exams) ? exams : [];
  let practiceTests = 0;
  let questions = 0;
  const categories = new Set();

  safeExams.forEach((exam) => {
    const category = String(exam?.category || "").trim();
    if (category) categories.add(category);

    if (
      exam?.practice_tests_list &&
      Array.isArray(exam.practice_tests_list) &&
      exam.practice_tests_list.length > 0
    ) {
      practiceTests += exam.practice_tests_list.length;
      questions += exam.practice_tests_list.reduce(
        (sum, test) => sum + (parseInt(test?.questions, 10) || 0),
        0
      );
    } else {
      practiceTests += parseInt(exam?.practice_exams, 10) || 0;
      questions += parseInt(exam?.questions, 10) || 0;
    }
  });

  return {
    totalExams: safeExams.length,
    practiceTests,
    questions,
    categories: categories.size,
  };
}

const fetchProviderAndExams = cache(async function fetchProviderAndExams(slug) {
  // 1) Fetch provider info
  let provider = null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/providers/${slug}/`,
      publicFetchOptions()
    );
    if (res.ok) provider = await res.json();
  } catch (err) {
    console.error("Failed to fetch provider:", err);
  }

  // 2) Fetch exams/courses for this provider
  let exams = [];
  try {
    const examsRes = await fetch(
      `${API_BASE_URL}/api/courses/?provider=${slug}`,
      publicFetchOptions()
    );
    if (examsRes.ok) {
      const data = await examsRes.json();
      exams = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];
    }
  } catch (err) {
    console.error("Failed to fetch exams:", err);
  }

  const normalizedSlug = String(slug || "").toLowerCase().trim();
  const providerSlug = String(provider?.slug || normalizedSlug).toLowerCase().trim();
  const providerNameKey = normalizeName(provider?.name || "");

  exams = filterPublicExamListings(exams).filter((exam) => {
    const examProviderSlug = String(exam?.provider_slug || "").toLowerCase().trim();
    if (examProviderSlug && examProviderSlug === providerSlug) return true;

    const examNameSlug = createSlug(exam?.provider || "");
    if (examNameSlug && examNameSlug === providerSlug) return true;

    const examNameKey = normalizeName(exam?.provider || "");
    return providerNameKey && examNameKey === providerNameKey;
  });
  return { provider, exams };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const canonicalUrl = `${SITE_URL}/providers/${slug || ""}`.replace(/\/$/, "");

  if (!slug) {
    return {
      title: "Provider Not Found | AllExamQuestions",
      description: "The requested provider does not exist.",
      alternates: {
        canonical: `${SITE_URL}/providers`,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "Provider Not Found | AllExamQuestions",
        description: "The requested provider does not exist.",
        url: `${SITE_URL}/providers`,
        type: "website",
      },
    };
  }

  const { provider } = await fetchProviderAndExams(slug);

  if (!provider) {
    return {
      title: "Provider Not Found | AllExamQuestions",
      description: "The requested provider does not exist.",
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "Provider Not Found | AllExamQuestions",
        description: "The requested provider does not exist.",
        url: canonicalUrl,
        type: "website",
      },
    };
  }

  const providerName = provider?.name || "Provider";
  const title =
    provider?.meta_title?.trim() ||
    `${providerName} Certification Exams | AllExamQuestions`;
  const description =
    provider?.meta_description?.trim() ||
    provider?.description?.trim() ||
    `Practice ${providerName} certification exams with updated questions and realistic mock tests.`;
  const keywords =
    provider?.meta_keywords?.trim() ||
    `${providerName}, certification exams, practice tests, mock tests`;
  const ogImage =
    provider?.meta_image || provider?.logo_url || provider?.logoUrl || `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
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

export default async function ProviderPage({ params }) {
  const { slug } = await params;
  const { provider, exams } = await fetchProviderAndExams(slug);

  const providerName = provider?.name || "Provider";
  const stats = getProviderExamStats(exams);
  const { totalExams, practiceTests, questions, categories } = stats;

  const heroTitle = provider?.page_title?.trim() || providerName;

  const heroDescription =
    provider?.description?.trim() ||
    `Practice updated ${providerName} certification exams with realistic mock tests, latest questions, and detailed explanations.`;

  const dynamicFeatureTags = [
    totalExams > 0 ? `${totalExams}+ Exams` : null,
    practiceTests > 0 ? `${practiceTests}+ Practice Tests` : null,
    questions > 0 ? `${questions}+ Questions` : null,
    categories > 0 ? `${categories}+ Categories` : null,
  ].filter(Boolean);

  const overviewStats = [
    { value: totalExams, label: "Available Exams" },
    { value: practiceTests, label: "Practice Tests" },
    { value: questions, label: "Questions" },
    { value: categories, label: "Categories" },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Providers", href: "/providers" },
    { label: providerName, href: `/providers/${slug || ""}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <BreadcrumbJsonLd items={toBreadcrumbJsonLdItems(breadcrumbItems)} />
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
          <SiteBreadcrumbs
            className="mb-6"
            variant="dark"
            items={breadcrumbItems}
          />

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-200 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-300"></span>
                {totalExams}+ Certification Practice Tests Available
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
                  href="#exams"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
                >
                  Explore Exams
                </a>

                <Link
                  href="/providers"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Browse Providers
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 blur-2xl"></div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(provider?.logo_url || provider?.logoUrl) ? (
                      <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10 p-1">
                        <OptimizedImage
                          src={provider.logo_url || provider.logoUrl}
                          alt={`${providerName} logo`}
                          fill
                          sizes="40px"
                          className="rounded-lg object-contain"
                          crop="fit"
                        />
                      </span>
                    ) : null}
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-cyan-300">
                        Provider Overview
                      </div>
                      <h2 className="mt-1 text-2xl font-bold text-white">
                        {providerName}
                      </h2>
                    </div>
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

      <section id="exams" className={`${PAGE_CONTAINER} pb-16 pt-10`}>
        <ProviderDetail
          slug={slug}
          provider={provider}
          exams={exams}
          embedded={true}
          showBreadcrumb={false}
        />
      </section>
    </div>
  );
}
