export const DEFAULT_FOOTER_SETTINGS = {
  providers_title: "Exam Providers Covered",
  resources_title: "Resources",
  legal_title: "Legal",
  contact_title: "Contact Us",
  blogs_label: "Blogs",
  faq_label: "FAQ",
  privacy_policy_label: "Privacy Policy",
  terms_label: "Terms & Conditions",
  refund_policy_label: "Refund & Cancellation Policy",
  disclaimer_link_label: "Disclaimer",
  editor_policy_label: "Editor Policy",
  contact_us_label: "Contact Us",
  copyright: "© 2025 AllExamQuestions. All rights reserved.",
  brand_line: "A Brand of TutorKhoj Private Limited",
  disclaimer_label: "Disclaimer:",
  disclaimer_text:
    "All trademarks, certification names, course titles, and logos displayed on this website are the property of their respective owners and are used solely for identification and informational purposes. AllExamQuestions is an independent exam preparation platform and is not affiliated with, endorsed by, authorized by, or sponsored by any exam provider, certification body, or brand mentioned on this website. Any brand names, product names, or service names are used only to describe the corresponding exams or content. Some graphics used on this website are sourced from royalty-free or publicly available resources and are believed to be free for commercial use.",
  ssl_secure: "SSL Secure",
  no_providers: "No providers available",
  loading: "Loading...",
  providers_limit: 5,
  show_social_links: true,
  show_disclaimer: true,
};

export function normalizeFooterSettings(raw = {}) {
  const data = { ...DEFAULT_FOOTER_SETTINGS, ...(raw || {}) };

  const limit = Number(data.providers_limit);
  data.providers_limit = Number.isFinite(limit)
    ? Math.max(1, Math.min(20, Math.trunc(limit)))
    : DEFAULT_FOOTER_SETTINGS.providers_limit;

  data.show_social_links = data.show_social_links !== false;
  data.show_disclaimer = data.show_disclaimer !== false;

  Object.keys(DEFAULT_FOOTER_SETTINGS).forEach((key) => {
    if (typeof DEFAULT_FOOTER_SETTINGS[key] === "string") {
      const value = data[key];
      data[key] =
        typeof value === "string" && value.trim()
          ? value.trim()
          : DEFAULT_FOOTER_SETTINGS[key];
    }
  });

  return data;
}
