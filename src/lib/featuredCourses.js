/** True when admin marked the course as Popular / Featured (checkbox in categories courses). */
export function isCourseFeatured(course) {
  const value = course?.is_featured;
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return false;
}

/** Active courses explicitly featured in admin — used on Home + Popular Exams sections. */
export function filterAdminFeaturedCourses(courses, { limit } = {}) {
  const list = (Array.isArray(courses) ? courses : []).filter(
    (course) => course && course.is_active !== false && isCourseFeatured(course)
  );
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export const FEATURED_COURSES_API_PATH = "/api/courses/featured/";
