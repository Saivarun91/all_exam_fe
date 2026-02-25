import TestimonialsClient from "./TestimonialsClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getTestimonialsData() {
  try {
    const [sectionRes, testimonialsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/home/testimonials-section/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/home/testimonials/`, { cache: "no-store" }),
    ]);

    const sectionJson = await sectionRes.json();
    const testimonialsJson = await testimonialsRes.json();

    return {
      section:
        sectionJson?.success && sectionJson?.data
          ? sectionJson.data
          : {
              heading: "Success Stories From Real Learners",
              subtitle:
                "Real experiences from professionals who passed using AllExamQuestions",
            },

      testimonials:
        testimonialsJson?.success && testimonialsJson?.data
          ? testimonialsJson.data.filter((t) => t.is_active !== false)
          : [],
    };
  } catch (err) {
    console.error("Testimonials fetch error", err);
    return { section: {}, testimonials: [] };
  }
}

export default async function Testimonials() {
  const { section, testimonials } = await getTestimonialsData();

  if (!testimonials.length) return null;

  return <TestimonialsClient section={section} testimonials={testimonials} />;
}