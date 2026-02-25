import HomeFAQClient from "./HomeFAQClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getFAQData() {
  try {
    const sectionRes = await fetch(
      `${API_BASE_URL}/api/home/faqs-section/`,
      { cache: "no-store" }
    );

    const faqRes = await fetch(
      `${API_BASE_URL}/api/home/faqs/`,
      { cache: "no-store" }
    );

    // 🔴 VERY IMPORTANT: check fetch success
    if (!faqRes.ok) {
      console.error("FAQ API FAILED:", faqRes.status);
      return { section: {}, faqs: [] };
    }

    const sectionJson = await sectionRes.json();
    const faqJson = await faqRes.json();

    console.log("SERVER FAQ DATA:", faqJson); // ← shows in terminal

    return {
      section:
        sectionJson?.success && sectionJson?.data
          ? sectionJson.data
          : {
              heading: "Frequently Asked Questions",
              subtitle:
                "Clear answers to the most common questions our learners ask.",
            },

      faqs:
        faqJson?.success && Array.isArray(faqJson?.data)
          ? faqJson.data
          : [],
    };
  } catch (err) {
    console.error("SERVER FAQ ERROR:", err);
    return { section: {}, faqs: [] };
  }
}

export default async function HomeFAQ() {
  const { section, faqs } = await getFAQData();

  // 🔴 TEMP DEBUG (remove later)
  console.log("TOTAL FAQ COUNT:", faqs.length);

  return <HomeFAQClient section={section} faqs={faqs} />;
}