export const CMS_KEY_ALIASES = {
  "cms.hero.title": "home.hero.title",
  "cms.hero.subtitle": "home.hero.subtitle",
  "cms.seo.heading": "home.seo.heading",
  "cms.categories.heading": "home.categories.heading",
  "cms.categories.subtitle": "home.categories.subtitle",
  "cms.featured.heading": "home.featured.heading",
  "cms.featured.subtitle": "home.featured.subtitle",
  "cms.value.heading": "home.value.heading",
  "cms.value.subtitle": "home.value.subtitle",
  "cms.blog.heading": "home.blog.heading",
  "cms.blog.subtitle": "home.blog.subtitle",
  "cms.testimonials.heading": "home.testimonials.heading",
  "cms.testimonials.subtitle": "home.testimonials.subtitle",
  "cms.faq.heading": "home.faq.heading",
  "cms.faq.subtitle": "home.faq.subtitle",
  "cms.faq.section.heading": "home.faq.section.heading",
  "cms.recent.heading": "home.recent.heading",
  "cms.recent.subtitle": "home.recent.subtitle",
  "cms.providers.heading": "home.providers.heading",
  "cms.providers.subtitle": "home.providers.subtitle",
  "cms.subscribe.title": "home.subscribe.title",
  "cms.subscribe.subtitle": "home.subscribe.subtitle",
  "cms.categories_page.hero_title": "categories.page.hero_title",
  "cms.categories_page.hero_subtitle": "categories.page.hero_subtitle",
  "cms.exams_page.hero_title": "exams.page.hero_title",
  "cms.exams_page.hero_subtitle": "exams.page.hero_subtitle",
  "cms.exams_page.page_heading": "exams.page.page_heading",
  "cms.providers_page.hero_title": "providers.page.hero_title",
  "cms.providers_page.hero_subtitle": "providers.page.hero_subtitle",
};

for (let i = 1; i <= 6; i += 1) {
  CMS_KEY_ALIASES[`cms.hero.stat${i}.label`] = `home.hero.stat${i}.label`;
}

export const STATIC_KEY_TO_CMS = Object.fromEntries(
  Object.entries(CMS_KEY_ALIASES).map(([cmsKey, staticKey]) => [staticKey, cmsKey])
);

export const CMS_MANAGED_STATIC_KEYS = new Set(Object.values(CMS_KEY_ALIASES));

export function isCmsContentKey(key) {
  return (key || "").startsWith("cms.");
}

export function isCmsManagedKey(key) {
  return isCmsContentKey(key) || CMS_MANAGED_STATIC_KEYS.has(key);
}

export function resolveAliasKey(key) {
  if (!key) return null;
  return CMS_KEY_ALIASES[key] || STATIC_KEY_TO_CMS[key] || null;
}

export function lookupTranslation(translations, key) {
  if (!key || !translations) return null;

  if (translations[key]) {
    return translations[key];
  }

  const alias = resolveAliasKey(key);
  if (alias && translations[alias]) {
    return translations[alias];
  }

  return null;
}

export function mirrorAliasKeys(translations) {
  const result = { ...translations };

  for (const [cmsKey, staticKey] of Object.entries(CMS_KEY_ALIASES)) {
    const cmsValue = result[cmsKey];
    const staticValue = result[staticKey];

    if (cmsValue && !staticValue) {
      result[staticKey] = cmsValue;
    } else if (staticValue && !cmsValue) {
      result[cmsKey] = staticValue;
    }
  }

  return result;
}
