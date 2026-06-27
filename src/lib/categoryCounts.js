import { createSlug } from "@/lib/utils";
import { coursesListUrl, publicFetchOptions } from "@/lib/serverRevalidate";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function courseCategorySlug(course) {
  const explicit = String(course?.category_slug || "").trim().toLowerCase();
  if (explicit) return explicit;

  const fromName = createSlug(course?.category || "");
  return fromName ? fromName.toLowerCase() : "";
}

export async function fetchAllActiveCourses() {
  try {
    const res = await fetch(coursesListUrl(API_BASE_URL), publicFetchOptions());
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data)
      ? data.filter((course) => course.is_active !== false)
      : [];
  } catch {
    return [];
  }
}

export function buildCategoryExamCountMap(courses = []) {
  const counts = new Map();

  for (const course of courses) {
    const slug = courseCategorySlug(course);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) || 0) + 1);
  }

  return counts;
}

export async function getExamCountByCategorySlug(slug) {
  try {
    if (!slug) return 0;

    const res = await fetch(
      `${API_BASE_URL}/api/courses/category/${encodeURIComponent(slug)}/`,
      publicFetchOptions()
    );

    if (!res.ok) return 0;

    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export async function attachExamCounts(categories = []) {
  const courses = await fetchAllActiveCourses();
  const countMap = buildCategoryExamCountMap(courses);

  return categories.map((category) => ({
    ...category,
    examCount:
      countMap.get(String(category.slug || "").trim().toLowerCase()) || 0,
  }));
}
