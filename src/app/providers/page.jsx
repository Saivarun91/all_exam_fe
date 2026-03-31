// app/providers/page.jsx
import Link from "next/link";

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
    console.error("Failed to fetch providers page SEO:", error);
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
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/providers/`,
      { cache: "no-store" }
    );
    if (res.ok) providers = await res.json();
  } catch (err) {
    console.error("Failed to fetch providers:", err);
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        All Providers
      </h1>

      {providers.length === 0 ? (
        <p className="text-center">No providers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-lg bg-white"
            >
              {provider.logoUrl && (
                <img
                  src={provider.logoUrl}
                  alt={provider.name}
                  className="w-full h-32 object-contain mb-4"
                />
              )}
              <h2 className="text-lg font-semibold">
                <Link href={`/${provider.slug}`} className="mt-3 inline-block text-[#1A73E8] hover:underline text-m font-medium">

                  {provider.name}
                </Link>
              </h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}