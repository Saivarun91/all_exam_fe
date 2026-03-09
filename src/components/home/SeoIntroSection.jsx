import ReadMore from "@/components/common/ReadMore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getSeoIntro() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/home/seo-intro/`, {
      cache: "no-store",
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

  // ✅ Convert HTML content to array of paragraphs for ReadMore
  const paragraphs = seoIntro.content
    ? seoIntro.content
        .split(/<\/p>/i) // split by closing paragraph tags
        .map(p => p.replace(/<[^>]+>/g, "").trim()) // remove HTML tags
        .filter(Boolean) // remove empty strings
    : [];

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {seoIntro.heading}
          </h2>

          {/* <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div> */}
        </div>

        {/* Content Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 md:p-10">
          {/* ✅ Use ReadMore now */}
          <ReadMore paragraphs={paragraphs} />
        </div>

      </div>
    </section>
  );
}