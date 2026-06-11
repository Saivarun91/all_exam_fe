/** Admin pages one segment under /admin/* (avoid [examCode]/[pageSlug] 404). */
export const ADMIN_SUBROUTE_LOADERS = {
  analytics: () => import("@/app/admin/analytics/page"),
  auth: () => import("@/app/admin/auth/page"),
  blog: () => import("@/app/admin/blog/page"),
  categories: () => import("@/app/admin/categories/page"),
  coupons: () => import("@/app/admin/coupons/page"),
  enrollments: () => import("@/app/admin/enrollments/page"),
  "email-templates": () => import("@/app/admin/email-templates/page"),
  home: () => import("@/app/admin/home/page"),
  leads: () => import("@/app/admin/leads/page"),
  "legal-pages": () => import("@/app/admin/legal-pages/page"),
  "parsing-suite": () => import("@/app/admin/parsing-suite/page"),
  "pricing-plans": () => import("@/app/admin/pricing-plans/page"),
  questions: () => import("@/app/admin/questions/page"),
  reviews: () => import("@/app/admin/reviews/page"),
  "search-logs": () => import("@/app/admin/search-logs/page"),
  settings: () => import("@/app/admin/settings/page"),
  subscribers: () => import("@/app/admin/subscribers/page"),
  "test-details": () => import("@/app/admin/test-details/page"),
};

export async function loadAdminSubroutePage(pageSlug) {
  const segment = String(pageSlug || "")
    .toLowerCase()
    .trim()
    .replace(/\/+$/, "");

  const loader = ADMIN_SUBROUTE_LOADERS[segment];
  if (!loader) return null;

  const mod = await loader();
  return mod.default || null;
}
