/** Shared rules for public exam listings (aligned with Exam Details Manager). */

import { decodeHtmlEntities } from "./htmlTextUtils";

export function stripHtmlText(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
  );
}

export function isOfficialDetailsCourse(course) {
  return (
    course?.show_in_official_details === true ||
    course?.show_in_official_details === "true"
  );
}

export function courseHasExamDetails(course) {
  if (course?.has_exam_details === true || course?.hasExamDetails === true) {
    return true;
  }

  return !!(
    stripHtmlText(course?.about) ||
    stripHtmlText(course?.page_heading) ||
    stripHtmlText(course?.exam_details) ||
    stripHtmlText(course?.details) ||
    stripHtmlText(course?.meta_title) ||
    (Array.isArray(course?.topics) &&
      course.topics.some((topic) => stripHtmlText(topic?.name))) ||
    (Array.isArray(course?.testimonials) &&
      course.testimonials.some((item) => stripHtmlText(item?.name))) ||
    (Array.isArray(course?.faqs) &&
      course.faqs.some((faq) => stripHtmlText(faq?.question)))
  );
}

function trimSlug(value) {
  return String(value ?? "").trim();
}

/**
 * Shared exams can use a different exam-details slug than the official public URL.
 * If both slugs exist and differ, the course belongs in Exam Details Manager even
 * before exam page content is filled in.
 */
export function hasDistinctExamDetailsSlug(course) {
  const examSlug = trimSlug(course?.slug);
  const officialSlug = trimSlug(course?.official_details_url_slug);
  return Boolean(examSlug && officialSlug && examSlug !== officialSlug);
}

/** Official-details-only entries (from Official Details Manager, no exam page content). */
export function isOfficialDetailsOnlyCourse(course) {
  if (!isOfficialDetailsCourse(course)) return false;
  if (courseHasExamDetails(course)) return false;
  if (hasDistinctExamDetailsSlug(course)) return false;
  return true;
}

/** Same visibility rules as Exam Details Manager list. */
export function belongsInExamDetailsManager(course) {
  return !isOfficialDetailsOnlyCourse(course);
}

/** Active courses that belong on /exams and related listing pages. */
export function filterPublicExamListings(courses) {
  if (!Array.isArray(courses)) return [];
  return courses.filter(
    (course) => course?.is_active !== false && belongsInExamDetailsManager(course)
  );
}
