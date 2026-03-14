import FeaturedExamsClient from "./FeaturedExamsClient";
import ItemListJsonLd from "@/components/ItemListJsonLd";
import { getExamUrl } from "@/lib/utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getData() {
  try {
    const [sectionRes, coursesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/home/featured-exams-section/`, {
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/api/courses/featured/`, {
        cache: "no-store",
      }),
    ]);

    const sectionJson = await sectionRes.json().catch(() => ({}));
    const coursesJson = await coursesRes.json().catch(() => []);

    const sectionSettings =
      sectionJson?.success && sectionJson?.data
        ? sectionJson.data
        : { heading: "Featured Exams", subtitle: "" };

    const courses = Array.isArray(coursesJson)
      ? coursesJson.filter(
          (c) => c.is_active !== false && c.is_featured !== false
        )
      : [];

    return { sectionSettings, courses };
  } catch {
    return {
      sectionSettings: { heading: "Featured Exams", subtitle: "" },
      courses: [],
    };
  }
}

export default async function FeaturedExams() {
  const { sectionSettings, courses } = await getData();

  if (!courses.length) return null;

  const schemaItems = courses.map((course) => ({
    title: course.title,
    description: course.description || course.excerpt || "",
    provider: course.provider || "",
    url: getExamUrl(course),
  }));

  return (
    <section id="featured-exams" className="py-12 md:py-20 bg-white">

      <ItemListJsonLd
        items={schemaItems}
        listName={sectionSettings.heading || "Featured Exams"}
        itemType="Course"
        schemaId="featured-exams-json-ld-schema"
      />

      <FeaturedExamsClient
        courses={courses}
        sectionSettings={sectionSettings}
      />

    </section>
  );
}