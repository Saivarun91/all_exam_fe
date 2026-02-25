import PopularProvidersClient from "./PopularProvidersClient";
import ItemListJsonLd from "@/components/ItemListJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getProviders() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/providers/`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.filter((p) => p.is_active !== false);
  } catch {
    return [];
  }
}

async function getSectionSettings() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/popular-providers-section/`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data?.data || {};
  } catch {
    return {};
  }
}

async function getCarouselSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/public/`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.success) return data;
  } catch {}

  return {};
}

export default async function PopularProviders() {
  const providers = await getProviders();

  if (!providers.length) return null;

  const sectionSettings = await getSectionSettings();
  const settings = await getCarouselSettings();

  const schemaItems = providers.map((provider) => ({
    name: provider.name,
    description: provider.description || "",
    url: `/exams/${provider.slug}`,
  }));

  return (
    <section id="popular-providers" className="py-12 md:py-20 bg-[#F5F8FC]">

      <ItemListJsonLd
        items={schemaItems}
        listName={sectionSettings.heading || "Popular Providers"}
        itemType="Organization"
        schemaId="popular-providers-json-ld-schema"
      />

      <div className="container mx-auto px-4">

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
          {sectionSettings.heading || "Popular Providers"}
        </h2>

        {sectionSettings.subtitle && (
          <p className="text-center text-[#0C1A35]/70 mb-8 md:mb-12 text-sm sm:text-base md:text-lg px-2">
            {sectionSettings.subtitle}
          </p>
        )}

        {/* CLIENT PART */}
        <PopularProvidersClient
          providers={providers}
          logoSize={settings.providers_logo_size || 80}
        />

        <p className="text-left text-[#0C1A35]/60 text-xs md:text-sm mt-6 md:mt-8 px-2">
          Logos and trademarks are the property of their respective owners.
          AllExamQuestions is not affiliated with or endorsed by these organizations.
        </p>

      </div>
    </section>
  );
}