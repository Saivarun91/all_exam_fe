// app/providers/page.jsx
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import SiteBreadcrumbs, {
  SiteBreadcrumbBar,
  toBreadcrumbJsonLdItems,
} from "@/components/common/SiteBreadcrumbs";
import { cache } from "react";
import { logServerFetchError } from "@/lib/serverFetchLog";
import ProviderCardExams from "@/components/provider/ProviderCardExams";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { publicFetchOptions } from "@/lib/serverRevalidate";
import { filterPublicExamListings } from "@/lib/examListingFilters";

const PROVIDERS_BREADCRUMB_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Providers", href: "/providers" },
];

/** Every provider logo uses the same height; width scales within this box (fits wide logos). */
const PROVIDER_LOGO_HEIGHT = 72;
const PROVIDER_LOGO_MAX_WIDTH = 220;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SITE_URL = "https://allexamquestions.com";

const fetchProvidersPageSeo = cache(async function fetchProvidersPageSeo() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/providers-page-seo/`,
      publicFetchOptions()
    );
    if (!res.ok) {
      return {
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
      };
    }
    const data = await res.json();
    return {
      meta_title: data?.meta_title || "",
      meta_description: data?.meta_description || "",
      meta_keywords: data?.meta_keywords || "",
    };
  } catch (error) {
    logServerFetchError("Failed to fetch providers page SEO:", error);
    return {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    };
  }
});

export async function generateMetadata() {
  const seo = await fetchProvidersPageSeo();
  const title = seo.meta_title || "All Providers | AllExamQuestions";
  const description =
    seo.meta_description ||
    "Browse all certification providers and discover available exams.";
  const keywords =
    seo.meta_keywords ||
    "providers, certification exams, practice tests, mock exams";
  const canonicalUrl = `${SITE_URL}/providers`;

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
          url: `${SITE_URL}/logo.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/logo.png`],
    },
  };
}

export default async function ProvidersPage() {
  // Fetch all providers
  let providers = [];
  let courses = [];
  try {
    const [providersRes, coursesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/providers/`, publicFetchOptions()),
      fetch(`${API_BASE_URL}/api/courses/`, publicFetchOptions()),
    ]);

    if (providersRes.ok) providers = await providersRes.json();
    if (coursesRes.ok) courses = await coursesRes.json();
  } catch (err) {
    logServerFetchError("Failed to fetch providers/courses:", err);
  }

  const normalizedProviders = Array.isArray(providers) ? providers : [];
  const normalizedCourses = filterPublicExamListings(
    Array.isArray(courses) ? courses : []
  );

  const courseProviderKeys = (course) => {
    const keys = [];

    const providerIdKey = String(course?.provider_id || "").trim();
    if (providerIdKey) keys.push(providerIdKey);

    const providerSlugKey = String(course?.provider_slug || "")
      .toLowerCase()
      .trim();
    if (providerSlugKey) keys.push(providerSlugKey);

    const providerNameKey = String(course?.provider || "")
      .toLowerCase()
      .trim();
    if (providerNameKey) keys.push(providerNameKey);

    return keys;
  };

  const providerExamsMap = normalizedCourses.reduce((acc, course) => {
    if (course?.is_active === false) return acc;

    for (const key of courseProviderKeys(course)) {
      if (!acc[key]) acc[key] = [];
      acc[key].push(course);
    }
    return acc;
  }, {});

  const providerExamCountMap = normalizedCourses.reduce((acc, course) => {
    if (course?.is_active === false) return acc;

    for (const key of courseProviderKeys(course)) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <>
      <BreadcrumbJsonLd items={toBreadcrumbJsonLdItems(PROVIDERS_BREADCRUMB_ITEMS)} />
      <SiteBreadcrumbBar>
        <SiteBreadcrumbs items={PROVIDERS_BREADCRUMB_ITEMS} />
      </SiteBreadcrumbBar>
      <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        All Providers
      </h1>

      {normalizedProviders.length === 0 ? (
        <p className="text-center">No providers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {normalizedProviders.map((provider) => {
            const providerLogo =
              provider?.logo_url || provider?.logoUrl || provider?.logo || "";
            const providerIdKey = String(provider?.id || "").trim();
            const providerSlugKey = String(provider?.slug || "")
              .toLowerCase()
              .trim();
            const providerNameKey = String(provider?.name || "")
              .toLowerCase()
              .trim();
            const examCount =
              providerExamCountMap[providerIdKey] ??
              providerExamCountMap[providerSlugKey] ??
              providerExamCountMap[providerNameKey] ??
              0;

            const examsForProvider = (
              providerExamsMap[providerIdKey] ??
              providerExamsMap[providerSlugKey] ??
              providerExamsMap[providerNameKey] ??
              []
            )
              .slice()
              .sort((a, b) =>
                String(a?.title || a?.name || "")
                  .localeCompare(String(b?.title || b?.name || ""), undefined, {
                    sensitivity: "base",
                  })
              );

            return (
              <div
                key={provider.id}
                className="flex flex-col h-full border border-[#DDE7FF] rounded-lg p-5 shadow-sm hover:shadow-md bg-white"
              >
                {providerLogo && (
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="mb-4 flex w-full shrink-0 items-center justify-center"
                    style={{
                      height: PROVIDER_LOGO_HEIGHT,
                      minHeight: PROVIDER_LOGO_HEIGHT,
                    }}
                    aria-label={`View exams by ${provider.name}`}
                  >
                    <img
                      src={getOptimizedImageUrl(
                        providerLogo,
                        PROVIDER_LOGO_MAX_WIDTH,
                        PROVIDER_LOGO_HEIGHT,
                        "fit"
                      )}
                      alt={provider.name}
                      width={PROVIDER_LOGO_MAX_WIDTH}
                      height={PROVIDER_LOGO_HEIGHT}
                      className="block object-contain object-center"
                      style={{
                        height: PROVIDER_LOGO_HEIGHT,
                        minHeight: PROVIDER_LOGO_HEIGHT,
                        maxHeight: PROVIDER_LOGO_HEIGHT,
                        width: "auto",
                        maxWidth: PROVIDER_LOGO_MAX_WIDTH,
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                )}
                <div className="flex items-start justify-between gap-3 border-b border-[#E8EEF5] pb-3">
                  <h2 className="text-base font-semibold min-w-0 flex-1">
                    <Link
                      href={`/providers/${provider.slug}`}
                      className="text-[#1A73E8] hover:underline font-semibold leading-snug"
                    >
                      {provider.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-[#0C1A35]/70 whitespace-nowrap shrink-0">
                    {examCount} Exam{examCount === 1 ? "" : "s"}
                  </p>
                </div>

                <ProviderCardExams exams={examsForProvider} />
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}