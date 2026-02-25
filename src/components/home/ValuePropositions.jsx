import ValuePropositionsClient from "./ValuePropositionsClient";
import ItemListJsonLd from "@/components/ItemListJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getData() {
  try {
    const [sectionRes, propositionsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/home/value-propositions-section/`, {
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/api/home/value-propositions/`, {
        cache: "no-store",
      }),
    ]);

    const [sectionData, propositionsData] = await Promise.all([
      sectionRes.json().catch(() => ({})),
      propositionsRes.json().catch(() => ({})),
    ]);

    const section =
      sectionData?.success && sectionData?.data
        ? sectionData.data
        : {
            heading: "Why Choose AllExamQuestions?",
            subtitle:
              "Everything you need to ace your certification exam in one place",
          };

    const features =
      propositionsData?.success && propositionsData?.data
        ? propositionsData.data.filter((f) => f.is_active !== false)
        : [];

    return { section, features };
  } catch {
    return { section: {}, features: [] };
  }
}

export default async function ValuePropositions() {
  const { section, features } = await getData();

  if (!features.length) return null;

  const schemaItems = features.map((feature) => ({
    title: feature.title || feature.heading || "",
    description: feature.description || feature.text || "",
  }));

  return (
    <section className="py-12 md:py-20 bg-[#0F1F3C]/10">

      <ItemListJsonLd
        items={schemaItems}
        listName={section.heading || "Why Choose AllExamQuestions?"}
        itemType="Thing"
        schemaId="value-propositions-json-ld-schema"
      />

      <ValuePropositionsClient
        section={section}
        features={features}
      />

    </section>
  );
}