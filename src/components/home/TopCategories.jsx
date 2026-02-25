import ItemListJsonLd from "@/components/ItemListJsonLd";
import TopCategoriesClient from "./TopCategoriesClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getData() {
  try {
    const [catRes, sectionRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/home/top-categories-section/`, { cache: "no-store" }),
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

  const settings = sectionSettings || {
    heading: "Top Certification Categories",
    subtitle: "Explore certifications by category",
  };

  const schemaItems = categories.map((cat) => ({
    name: cat.name,
    description: cat.description || "",
    url: `/categories/${cat.slug}`,
  }));

  return (
    <>
      {categories.length > 0 && (
        <ItemListJsonLd
          items={schemaItems}
          listName={settings.heading}
          itemType="Category"
          schemaId="top-categories-json-ld-schema"
        />
      )}

      <TopCategoriesClient
        categories={categories}
        sectionSettings={sectionSettings}
      />
    </>
  );
}