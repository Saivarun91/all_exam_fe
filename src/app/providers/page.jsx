// app/providers/page.jsx
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import SiteBreadcrumbs, {
  SiteBreadcrumbBar,
  toBreadcrumbJsonLdItems,
} from "@/components/common/SiteBreadcrumbs";
import { cache } from "react";
import { logServerFetchError } from "@/lib/serverFetchLog";
import ProvidersListClient from "@/components/provider/ProvidersListClient";
import { publicFetchOptions, providersListUrl } from "@/lib/serverRevalidate";

const PROVIDERS_BREADCRUMB_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Providers", href: "/providers" },
];

const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SITE_URL = "https://allexamquestions.com";
const PROVIDERS_PAGE_SIZE = 24;

function firstSearchParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePositiveInt(value, fallback) {
  const parsed = Number.parseInt(firstSearchParamValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeProvidersPayload(data) {
  if (Array.isArray(data)) {
    return {
      providers: data,
      pagination: {
        count: data.length,
        page: 1,
        page_size: PROVIDERS_PAGE_SIZE,
        total_pages: Math.max(1, Math.ceil(data.length / PROVIDERS_PAGE_SIZE)),
      },
    };
  }

  const results = Array.isArray(data?.results) ? data.results : [];
  return {
    providers: results,
    pagination: {
      count: Number(data?.count) || results.length,
      page: Number(data?.page) || 1,
      page_size: Number(data?.page_size) || PROVIDERS_PAGE_SIZE,
      total_pages: Number(data?.total_pages) || 1,
    },
  };
}

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

export default async function ProvidersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = normalizePositiveInt(resolvedSearchParams?.page, 1);
  const search = String(firstSearchParamValue(resolvedSearchParams?.q) || "").trim();
  let providers = [];
  let providersPagination = {
    count: 0,
    page,
    page_size: PROVIDERS_PAGE_SIZE,
    total_pages: 1,
  };
  try {
    const providersUrl = providersListUrl(API_BASE_URL, {
        page,
        page_size: PROVIDERS_PAGE_SIZE,
        q: search,
        include_exam_counts: 1,
        include_exam_preview: 1,
        exam_preview_limit: 5,
      });
    if (process.env.NODE_ENV !== "production") {
      console.log("[/providers] providers API hit:", providersUrl);
    }
    const providersRes = await fetch(
      providersUrl,
      publicFetchOptions()
    );

    if (providersRes.ok) {
      const payload = normalizeProvidersPayload(await providersRes.json());
      providers = payload.providers;
      providersPagination = payload.pagination;
      if (process.env.NODE_ENV !== "production") {
        console.log("[/providers] providers API data:", {
          pagination: providersPagination,
          itemCount: providers.length,
          sample: providers.slice(0, 3).map((provider) => ({
            id: provider.id,
            name: provider.name,
            slug: provider.slug,
            examCount: provider.exam_count,
            previewCount: Array.isArray(provider.exams) ? provider.exams.length : 0,
          })),
        });
      }
    }
  } catch (err) {
    logServerFetchError("Failed to fetch providers:", err);
  }

  const normalizedProviders = Array.isArray(providers) ? providers : [];

  const providerItems = normalizedProviders.map((provider) => {
    return {
      id: provider.id,
      slug: provider.slug,
      name: provider.name,
      description: provider.description || "",
      logo: provider?.logo_url || provider?.logoUrl || provider?.logo || "",
      examCount: Number(provider.exam_count) || 0,
      exams: Array.isArray(provider.exams) ? provider.exams : [],
    };
  });

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

        <ProvidersListClient
          providers={providerItems}
          initialSearchTerm={search}
          pagination={providersPagination}
        />
      </div>
    </>
  );
}