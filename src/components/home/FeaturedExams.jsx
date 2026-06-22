import FeaturedExamsClient from "./FeaturedExamsClient";
import ItemListJsonLd from "@/components/ItemListJsonLd";
import { getExamUrl } from "@/lib/utils";
import {
  FEATURED_COURSES_API_PATH,
  filterAdminFeaturedCourses,
} from "@/lib/featuredCourses";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getData() {
  try {
    const [sectionRes, coursesRes, providersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/home/featured-exams-section/`, {
        next: { revalidate: 300 },
      }),
      fetch(`${API_BASE_URL}${FEATURED_COURSES_API_PATH}`, {
        next: { revalidate: 300 },
      }),
      fetch(`${API_BASE_URL}/api/providers/?lite=1`, {
        next: { revalidate: 300 },
      }),
    ]);

    const sectionJson = await sectionRes.json().catch(() => ({}));
    const coursesJson = await coursesRes.json().catch(() => []);
    const providersJson = await providersRes.json().catch(() => []);

    const sectionSettings =
      sectionJson?.success && sectionJson?.data
        ? sectionJson.data
        : { heading: "Featured Exams", subtitle: "" };

    const courses = filterAdminFeaturedCourses(coursesJson);

    const providerSlugByName = Array.isArray(providersJson)
      ? providersJson.reduce((acc, provider) => {
          if (provider?.name && provider?.slug) {
            acc[provider.name.toLowerCase().trim()] = provider.slug;
          }
          return acc;
        }, {})
      : {};

    return { sectionSettings, courses, providerSlugByName };
  } catch {
    return {
      sectionSettings: { heading: "Featured Exams", subtitle: "" },
      courses: [],
      providerSlugByName: {},
    };
  }
}

export default async function FeaturedExams() {
  const { sectionSettings, courses, providerSlugByName } = await getData();

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
        providerSlugByName={providerSlugByName}
      />

    </section>
  );
}