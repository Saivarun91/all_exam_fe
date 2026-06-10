import PopularProvidersClient from "./PopularProvidersClient";
import PopularProvidersIntroClient from "./PopularProvidersIntroClient";
import PopularProvidersDisclaimer from "./PopularProvidersDisclaimer";
import ItemListJsonLd from "@/components/ItemListJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getProviders() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/providers/`, {
      next: { revalidate: 300 },
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

  const sectionSettings = await getSectionSettings();
  const settings = await getCarouselSettings();

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

        <PopularProvidersIntroClient
          heading={sectionSettings.heading || ""}
          subtitle={sectionSettings.subtitle}
        />

        <PopularProvidersClient
          providers={providers}
          logoSize={settings.providers_logo_size || 80}
        />

        <PopularProvidersDisclaimer />

      </div>
    </section>
  );
}