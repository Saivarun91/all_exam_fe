/** Replace `{key}` placeholders in translated strings. */
export function formatTranslation(template, vars = {}) {
  if (!template) return "";
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key];
    return value != null ? String(value) : `{${key}}`;
  });
}
