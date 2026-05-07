// app/providers/[slug]/page.jsx
import { createSlug } from "@/lib/utils";
import ProviderDetail from "@/components/provider/ProviderDetail";

export const dynamic = "force-dynamic";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SITE_URL = "https://allexamquestions.com";

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ");
}

async function fetchProviderAndExams(slug) {
  // 1) Fetch provider info
  let provider = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/providers/${slug}/`, {
      cache: "no-store",
    });
    if (res.ok) provider = await res.json();
  } catch (err) {
    console.error("Failed to fetch provider:", err);
  }

  // 2) Fetch exams/courses for this provider
  let exams = [];
  try {
    const examsRes = await fetch(`${API_BASE_URL}/api/courses/?provider=${slug}`, {
      cache: "no-store",
    });
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

  exams = exams.filter((exam) => {
    const examProviderSlug = String(exam?.provider_slug || "").toLowerCase().trim();
    if (examProviderSlug && examProviderSlug === providerSlug) return true;

    const examNameSlug = createSlug(exam?.provider || "");
    if (examNameSlug && examNameSlug === providerSlug) return true;

    const examNameKey = normalizeName(exam?.provider || "");
    return providerNameKey && examNameKey === providerNameKey;
  });
  return { provider, exams };
}

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
  const ogImage = provider?.meta_image || provider?.logoUrl || `${SITE_URL}/logo.png`;

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

export default async function ProviderPage({ params }) {
  const { slug } = await params;
  const { provider, exams } = await fetchProviderAndExams(slug);

  return <ProviderDetail slug={slug} provider={provider} exams={exams} />;
}