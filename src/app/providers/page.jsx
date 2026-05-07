// app/providers/page.jsx
import Link from "next/link";
import { logServerFetchError } from "@/lib/serverFetchLog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SITE_URL = "https://allexamquestions.com";

async function fetchProvidersPageSeo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/home/providers-page-seo/`, {
      cache: "no-store",
    });
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
}

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
      fetch(`${API_BASE_URL}/api/providers/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/courses/`, { cache: "no-store" }),
    ]);

    if (providersRes.ok) providers = await providersRes.json();
    if (coursesRes.ok) courses = await coursesRes.json();
  } catch (err) {
    logServerFetchError("Failed to fetch providers/courses:", err);
  }

  const normalizedProviders = Array.isArray(providers) ? providers : [];
  const normalizedCourses = Array.isArray(courses) ? courses : [];

  const providerExamCountMap = normalizedCourses.reduce((acc, course) => {
    if (course?.is_active === false) return acc;

    const providerSlugKey = String(course?.provider_slug || "")
      .toLowerCase()
      .trim();
    const providerNameKey = String(course?.provider || "")
      .toLowerCase()
      .trim();

    if (providerSlugKey) {
      acc[providerSlugKey] = (acc[providerSlugKey] || 0) + 1;
    } else if (providerNameKey) {
      acc[providerNameKey] = (acc[providerNameKey] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        All Providers
      </h1>

      {normalizedProviders.length === 0 ? (
        <p className="text-center">No providers found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {normalizedProviders.map((provider) => {
            const providerLogo =
              provider?.logo_url || provider?.logoUrl || provider?.logo || "";
            const providerSlugKey = String(provider?.slug || "")
              .toLowerCase()
              .trim();
            const providerNameKey = String(provider?.name || "")
              .toLowerCase()
              .trim();
            const examCount =
              providerExamCountMap[providerSlugKey] ??
              providerExamCountMap[providerNameKey] ??
              0;

            return (
              <div
                key={provider.id}
                className="border rounded-lg p-3 shadow-sm hover:shadow-md bg-white"
              >
                {providerLogo && (
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="block mb-2"
                    aria-label={`View exams by ${provider.name}`}
                  >
                    <img
                      src={providerLogo}
                      alt={provider.name}
                      className="w-full h-20 sm:h-24 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                )}
              <div className="mt-1 flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-semibold min-w-0">
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="inline-block text-[#1A73E8] hover:underline font-medium truncate"
                  >
                    {provider.name}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-[#0C1A35]/70 whitespace-nowrap">
                  {examCount} Exam{examCount === 1 ? "" : "s"}
                </p>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}