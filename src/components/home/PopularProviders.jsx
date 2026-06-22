import PopularProvidersClient from "./PopularProvidersClient";
import ItemListJsonLd from "@/components/ItemListJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getProviders() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/providers/?popular_only=true&lite=1`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.filter(
      (p) =>
        p.is_active !== false &&
        (p.show_in_popular_providers === true ||
          p.show_in_popular_providers === undefined ||
          p.show_in_popular_providers === null)
    );
  } catch {
    return [];
  }
}

async function getSectionSettings() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/popular-providers-section/`,
      { next: { revalidate: 300 } }
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
      next: { revalidate: 300 },
    });
    const data = await res.json();
    if (data.success) return data;
  } catch {}

  return {};
}

export default async function PopularProviders() {
  const providers = await getProviders();

  if (!providers.length) return null;

  const [sectionSettings, settings] = await Promise.all([
    getSectionSettings(),
    getCarouselSettings(),
  ]);

  const schemaItems = providers.map((provider) => ({
    name: provider.name,
    description: provider.description || "",
    url: `/providers/${provider.slug}`,
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

        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2"
          data-i18n="home.providers.heading"
          data-i18n-fallback={sectionSettings.heading || ""}
        >
          {sectionSettings.heading || "Popular Providers"}
        </h2>

        {sectionSettings.subtitle && (
          <p
            className="text-center text-[#0C1A35]/70 mb-8 md:mb-12 text-sm sm:text-base md:text-lg px-2"
            data-i18n="home.providers.subtitle"
            data-i18n-fallback={sectionSettings.subtitle}
          >
            {sectionSettings.subtitle}
          </p>
        )}

        {/* CLIENT PART */}
        <PopularProvidersClient
          providers={providers}
          logoSize={settings.providers_logo_size || 80}
        />

        <p
          className="text-left text-[#0C1A35]/60 text-xs md:text-sm mt-6 md:mt-8 px-2"
          data-i18n="home.providers.disclaimer"
          data-i18n-fallback="Logos and trademarks are the property of their respective owners. AllExamQuestions is not affiliated with or endorsed by these organizations."
        >
          Logos and trademarks are the property of their respective owners.
          AllExamQuestions is not affiliated with or endorsed by these organizations.
        </p>

      </div>
    </section>
  );
}