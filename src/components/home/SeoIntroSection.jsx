import TipTapContent from "@/components/editor/TipTapContent";
import SeoIntroHeadingClient from "./SeoIntroHeadingClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getSeoIntro() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/home/seo-intro/`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("SEO Intro fetch error:", error);
    return null;
  }
}

export default async function SeoIntroSection() {
  const seoIntro = await getSeoIntro();

  if (!seoIntro) return null;

  const rawContent = (seoIntro.content && String(seoIntro.content).trim()) || "";
  const hasHtmlBody =
    rawContent &&
    rawContent !== "<p></p>" &&
    rawContent.replace(/<[^>]+>/g, "").trim().length > 0;

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-10">
          <SeoIntroHeadingClient heading={seoIntro.heading} />

          {/* <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div> */}
        </div>

        {/* Content Card — same HTML as admin (tables, lists, not only </p>-split text) */}
        {hasHtmlBody ? (
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 md:p-10">
            <TipTapContent
              content={rawContent}
              className="text-gray-700 text-lg leading-relaxed max-w-none"
              data-i18n-html="cms.seo.content"
              data-i18n-fallback={rawContent}
              suppressHydrationWarning
            />
          </div>
        ) : null}

      </div>
    </section>
  );
}