const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function getExamCountByCategorySlug(slug) {
  try {
    if (!slug) return 0;

    const res = await fetch(
      `${API_BASE_URL}/api/courses/category/${encodeURIComponent(slug)}/`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return 0;

    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export async function attachExamCounts(categories = []) {
  return Promise.all(
    categories.map(async (category) => ({
      ...category,
      examCount: await getExamCountByCategorySlug(category.slug),
    }))
  );
}
