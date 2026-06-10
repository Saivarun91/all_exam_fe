import HomeFAQClient from "./HomeFAQClient";
import FAQJsonLd from "@/components/FAQJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const DEFAULT_FAQ_SECTION = {
  heading: "Frequently Asked Questions",
  subtitle: "Clear answers to the most common questions our learners ask.",
};

function normalizeFaqSection(section = {}) {
  return {
    heading: (section.heading || DEFAULT_FAQ_SECTION.heading).trim(),
    subtitle: (section.subtitle || DEFAULT_FAQ_SECTION.subtitle).trim(),
  };
}

async function getFAQData() {
  try {
    const sectionRes = await fetch(
      `${API_BASE_URL}/api/home/faqs-section/`,
      { next: { revalidate: 300 } }
    );
    const contentRes = await fetch(
      `${API_BASE_URL}/api/home/section-content/`,
      { next: { revalidate: 300 } }
    );

    const faqRes = await fetch(
      `${API_BASE_URL}/api/home/faqs/`,
      { next: { revalidate: 300 } }
    );

    if (!faqRes.ok) {
      return { section: {}, faqs: [] };
    }

    const sectionJson = await sectionRes.json();
    const contentJson = await contentRes.json();
    const faqJson = await faqRes.json();


    return {
      section: normalizeFaqSection(
        sectionJson?.success && sectionJson?.data
          ? sectionJson.data
          : DEFAULT_FAQ_SECTION
      ),
      sectionContent:
        contentJson?.success && contentJson?.data
          ? {
              heading: contentJson.data.heading || "Section Content",
              content: contentJson.data.content || "",
            }
          : {
              heading: "Section Content",
              content: "",
            },
      faqs:
        faqJson?.success && Array.isArray(faqJson?.data)
          ? faqJson.data
          : [],
    };
  } catch (err) {
    return { section: normalizeFaqSection(), faqs: [], sectionContent: null };
  }
}

export default async function HomeFAQ() {
  const { section, faqs, sectionContent } = await getFAQData();

  // 🔴 TEMP DEBUG (remove later)
  // console.log("TOTAL FAQ COUNT:", faqs.length);

  // return <HomeFAQClient section={section} faqs={faqs} />;
  return (
    <>
      <FAQJsonLd faqs={faqs} />  
      <HomeFAQClient section={section} faqs={faqs} sectionContent={sectionContent} />
    </>
  );
}