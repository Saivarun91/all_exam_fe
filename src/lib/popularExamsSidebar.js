import {
  FEATURED_COURSES_API_PATH,
  filterAdminFeaturedCourses,
} from "@/lib/featuredCourses";
import { getExamUrl } from "@/lib/utils";

export function normalizeExamSegment(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPopularExamsSidebarItems(
  courses,
  { excludeProvider = "", excludeCode = "" } = {}
) {
  const currentExamKey = `${normalizeExamSegment(excludeProvider)}::${normalizeExamSegment(excludeCode)}`;
  const list = filterAdminFeaturedCourses(
    Array.isArray(courses) ? courses : []
  );

  return list
    .map((c) => {
      const providerPart = normalizeExamSegment(
        c?.provider_slug || c?.providerSlug || c?.provider
      );
      const codePart = normalizeExamSegment(c?.code || c?.exam_code || "");
      const href = getExamUrl(c) || null;

      return {
        id: c?.id || `${providerPart}-${codePart}`,
        title: c?.title || c?.name || codePart,
        provider: c?.provider || "",
        code: c?.code || c?.exam_code || "",
        badge: c?.badge || "",
        href,
        _key: `${providerPart}::${codePart}`,
      };
    })
    .filter((c) => c.href && c._key !== currentExamKey);
}

export async function fetchPopularExamsCourses() {
  const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
  ).replace(/\/\/localhost(?=[:/])/i, "//127.0.0.1");

  try {
    const res = await fetch(`${API_BASE}${FEATURED_COURSES_API_PATH}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
