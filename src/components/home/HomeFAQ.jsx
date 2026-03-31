import HomeFAQClient from "./HomeFAQClient";
import FAQJsonLd from "@/components/FAQJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getFAQData() {
  try {
    const sectionRes = await fetch(
      `${API_BASE_URL}/api/home/faqs-section/`,
      { cache: "no-store" }
    );
    const contentRes = await fetch(
      `${API_BASE_URL}/api/home/section-content/`,
      { cache: "no-store" }
    );

    const faqRes = await fetch(
      `${API_BASE_URL}/api/home/faqs/`,
      { cache: "no-store" }
    );

    if (!faqRes.ok) {
      return { section: {}, faqs: [] };
    }

    const sectionJson = await sectionRes.json();
    const contentJson = await contentRes.json();
    const faqJson = await faqRes.json();


    return {
      section:
        sectionJson?.success && sectionJson?.data
          ? sectionJson.data
          : {
              heading: "Frequently Asked Questions",
              subtitle:
                "Clear answers to the most common questions our learners ask.",
            },
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
    return { section: {}, faqs: [] };
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