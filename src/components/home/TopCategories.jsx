import ItemListJsonLd from "@/components/ItemListJsonLd";
import TopCategoriesClient from "./TopCategoriesClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "y", "on"].includes(normalized);
  }
  return false;
}

async function getData() {
  try {
    const [catRes, sectionRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories/`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE_URL}/api/home/top-categories-section/`, { next: { revalidate: 300 } }),
    ]);

    const categories = await catRes.json();
    const section = await sectionRes.json();

    return {
      categories: Array.isArray(categories) ? categories : [],
      sectionSettings: section?.success ? section.data : null,
    };
  } catch {
    return { categories: [], sectionSettings: null };
  }
}

export default async function TopCategories() {
  const { categories, sectionSettings } = await getData();

  const topCategories = categories.filter((category) =>
    parseBoolean(category?.is_top_certification)
  );

  if (topCategories.length === 0) {
    return null;
  }

  const settings = sectionSettings || {
    heading: "Top Certification Categories",
    subtitle: "Explore certifications by category",
  };

  const schemaItems = topCategories.map((cat) => ({
    name: cat.name,
    description: cat.description || "",
    // url: `/categories/${cat.slug}`,
    url: `/${cat.slug}`,
  }));

  return (
    <>
      <ItemListJsonLd
        items={schemaItems}
        listName={settings.heading}
        itemType="Category"
        schemaId="top-categories-json-ld-schema"
      />

      <TopCategoriesClient
        categories={topCategories}
        sectionSettings={sectionSettings}
      />
    </>
  );
}