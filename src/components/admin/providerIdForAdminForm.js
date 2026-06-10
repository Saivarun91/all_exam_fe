/** Course API returns provider name as `provider` and id as `provider_id`; dropdowns need id. */
export function providerIdForAdminForm(course, providersList) {
  const rawId = course?.provider_id;
  if (rawId != null && String(rawId).trim() !== "") {
    return rawId;
  }
  const name = String(course?.provider || "").trim().toLowerCase();
  if (!name || !Array.isArray(providersList)) return "";
  const match = providersList.find(
    (p) => String(p.name || "").trim().toLowerCase() === name
  );
  return match?.id ?? "";
}

export const EMPTY_EXAM_BASIC_FORM = {
  name: "",
  slug: "",
  description: "",
  code: "",
  provider: "",
  category: "",
  badge: "",
  meta_title: "",
  meta_keywords: "",
  meta_description: "",
  is_featured: false,
  show_in_official_details: false,
};
