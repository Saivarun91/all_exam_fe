const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/** Canonical category detail URL (avoids /:slug middleware resolving to an exam). */
export function getCategoryPagePath(category) {
  const slug = String(category?.slug || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "/categories";
  return `/categories/${slug}`;
}

/** GridFS category images are always served from `/api/categories/{id}/image/`. */
const CATEGORY_IMAGE_PATH_RE =
  /\/api\/categories\/([a-fA-F0-9]{24})\/image\/?$/i;

function buildCategoryImageUrl(categoryId) {
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/api/categories/${categoryId}/image/`;
}

/** Resolve display image for a category record from API payload. */
export function getCategoryImageSrc(category) {
  if (!category || typeof category !== "object") return null;

  const fromField = resolveCategoryImageUrl(category.image_url);
  if (fromField) return fromField;

  const categoryId = category.id || category._id;
  if (categoryId && /^[a-fA-F0-9]{24}$/.test(String(categoryId))) {
    return buildCategoryImageUrl(String(categoryId));
  }

  return null;
}

export function resolveCategoryImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  let path = trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      path = new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  }

  const apiImageMatch = path.match(CATEGORY_IMAGE_PATH_RE);
  if (apiImageMatch) {
    return buildCategoryImageUrl(apiImageMatch[1]);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    const base = API_BASE_URL.replace(/\/$/, "");
    return `${base}${trimmed}`;
  }
  return trimmed;
}
