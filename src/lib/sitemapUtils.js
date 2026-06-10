import {
  languageCodesMatch,
  normalizeLanguageCode,
} from "@/lib/supportedLocales";
import { addLocaleToPathname, isDefaultLocale } from "@/lib/localeRouting";

export const SITEMAP_SECTIONS = [
  { id: "categories", label: "Categories", file: "categories-sitemap.xml" },
  { id: "providers", label: "Providers", file: "providers-sitemap.xml" },
  { id: "exams", label: "Exams", file: "exams-sitemap.xml" },
  { id: "blogs", label: "Blogs", file: "blogs-sitemap.xml" },
];

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

export function isSitemapPathname(pathname = "") {
  const path = pathname || "";
  if (path === "/sitemap" || path.startsWith("/sitemap/")) return true;
  if (path === "/sitemap.xml" || path.endsWith("/sitemap.xml")) return true;
  if (/^\/sitemap-[a-z]{2}(-[a-z]{2})?\.xml$/i.test(path)) return true;
  return /-sitemap(\.xml)?$/i.test(path);
}

export async function fetchActiveSitemapLanguages(apiBaseUrl) {
  const fallback = ["en"];
  try {
    const res = await fetch(`${apiBaseUrl}/api/languages/?active=true`, {
      cache: "no-store",
    });
    if (!res.ok) return fallback;

    const data = await res.json();
    if (!data?.success || !Array.isArray(data.data)) return fallback;

    const codes = data.data
      .map((lang) =>
        String(lang?.code || "")
          .toLowerCase()
          .trim()
          .replace(/_/g, "-")
      )
      .filter(Boolean);

    const unique = [...new Set(codes)];
    if (!unique.some((code) => isDefaultLocale(code))) {
      unique.unshift("en");
    }
    return unique.length ? unique : fallback;
  } catch {
    return fallback;
  }
}

export function withSitemapStylesheet(xml) {
  if (!xml || xml.includes("xml-stylesheet")) return xml;
  if (xml.startsWith(XML_HEADER)) {
    return xml.replace(
      XML_HEADER,
      `${XML_HEADER}\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`
    );
  }
  return `${XML_HEADER}\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n${xml}`;
}

export function formatSitemapLastmod(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

/** Per-language sitemap index: /en/sitemap.xml, /ko/sitemap.xml */
export function buildLanguageSitemapIndexUrl(origin, locale) {
  const code = normalizeLanguageCode(locale);
  if (isDefaultLocale(code)) {
    return `${origin}/en/sitemap.xml`;
  }
  return `${origin}/${code}/sitemap.xml`;
}

/** Per-language sitemap file: /sitemap-en.xml, /sitemap-ko.xml */
export function buildLanguageSitemapFileUrl(origin, locale) {
  return `${origin}/sitemap-${normalizeLanguageCode(locale)}.xml`;
}

/** Human-readable view: all page URLs for one language (fetched live from API). */
export function buildLanguageAllPagesUrl(origin, locale) {
  return buildLanguageSitemapFileUrl(origin, locale);
}

export function wantsXmlSitemapResponse(request) {
  const url = new URL(request.url);
  if (url.searchParams.get("format") === "xml") return true;
  if (url.searchParams.get("view") === "all") return false;
  return !prefersHtmlResponse(request);
}

export async function buildLanguageAllPagesHtmlResponse(
  request,
  locale,
  activeLocales
) {
  const targetOrigin = new URL(request.url).origin;
  const normalized = normalizeLanguageCode(locale);
  const entries = await fetchAllPageEntriesForLocale(
    request,
    normalized,
    activeLocales
  );

  return new Response(
    renderSitemapHtml({
      title: "Sitemap",
      entries,
      showSectionColumn: true,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

/** Section sitemap for a locale: /categories-sitemap.xml or /ko/categories-sitemap.xml */
export function buildSectionSitemapUrl(origin, locale, sectionFile, activeLocales) {
  const file = sectionFile || "categories-sitemap.xml";
  const routePath = `/${file.replace(/\.xml$/i, "")}`;
  const localized = addLocaleToPathname(routePath, locale, activeLocales);
  return `${origin}${localized}.xml`;
}

export function resolveSitemapLocale(request, activeLocales = []) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("locale");
  if (fromQuery) {
    return normalizeLanguageCode(fromQuery);
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (
    segments.length &&
    activeLocales.some((code) => languageCodesMatch(code, segments[0]))
  ) {
    return normalizeLanguageCode(segments[0]);
  }

  return "en";
}

export function rewriteSitemapIndexLocs(xml, targetOrigin) {
  return xml.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/g, (_, absoluteUrl) => {
    try {
      const parsed = new URL(absoluteUrl);
      let path = parsed.pathname;
      if (path.startsWith("/api/")) {
        path = path.replace(/^\/api/, "");
      }
      return `<loc>${targetOrigin}${path}${parsed.search}</loc>`;
    } catch {
      return `<loc>${absoluteUrl}</loc>`;
    }
  });
}

/** Localize page URLs inside a urlset for the active language. */
export function rewriteSitemapUrlsetLocs(
  xml,
  targetOrigin,
  locale,
  activeLocales
) {
  return xml.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/g, (_, absoluteUrl) => {
    try {
      const parsed = new URL(absoluteUrl);
      let path = parsed.pathname;
      if (path.startsWith("/api/")) {
        path = path.replace(/^\/api/, "");
      }
      const localized = addLocaleToPathname(path, locale, activeLocales);
      return `<loc>${targetOrigin}${localized}${parsed.search}</loc>`;
    } catch {
      return `<loc>${absoluteUrl}</loc>`;
    }
  });
}

export function buildLanguageSitemapIndexXml(origin, locale, activeLocales) {
  const lastmod = formatSitemapLastmod();
  const entries = SITEMAP_SECTIONS.map(
    (section) => `  <sitemap>
    <loc>${buildSectionSitemapUrl(origin, locale, section.file, activeLocales)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
  ).join("\n\n");

  return withSitemapStylesheet(`${XML_HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries}

</sitemapindex>`);
}

export function buildRootSitemapIndexXml(origin, languages) {
  const lastmod = formatSitemapLastmod();
  const entries = languages
    .map((code) => {
      const label = normalizeLanguageCode(code);
      return `  <sitemap>
    <loc>${buildLanguageSitemapFileUrl(origin, label)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join("\n\n");

  return withSitemapStylesheet(`${XML_HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries}

</sitemapindex>`);
}

/** Browsers (especially Chrome) often render a blank page for XML+XSL; serve HTML instead. */
export function prefersHtmlResponse(request) {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  if (/googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebot/i.test(ua)) {
    return false;
  }

  if (request.headers.get("sec-fetch-dest") === "document") {
    return true;
  }

  if (!accept.includes("text/html")) return false;
  if (!accept.includes("xml")) return true;

  const q = (part) => {
    const match = part.match(/;q=([\d.]+)/);
    return match ? parseFloat(match[1]) : 1;
  };

  const parts = accept.split(",").map((p) => p.trim());
  const htmlPart = parts.find((p) => p.startsWith("text/html"));
  const xmlPart = parts.find((p) => p.includes("xml"));
  if (!htmlPart || !xmlPart) return Boolean(htmlPart);
  return q(htmlPart) >= q(xmlPart);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function parsePageUrlsFromSitemapXml(xml) {
  const entries = [];
  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  let match;

  while ((match = urlRe.exec(xml)) !== null) {
    const chunk = match[1];
    const loc = chunk.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;
    const lastmod =
      chunk.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]?.trim() || "";
    entries.push({
      type: "Page",
      badgeClass: "page",
      url: loc,
      lastmod,
    });
  }

  return entries;
}

export async function fetchAllPageEntriesForLocale(
  request,
  locale,
  activeLocales
) {
  const combined = [];

  await Promise.all(
    SITEMAP_SECTIONS.map(async (section) => {
      try {
        const xml = await fetchAndLocalizeSectionSitemap({
          request,
          apiPath: section.file,
          locale,
          activeLocales,
        });
        const pages = parsePageUrlsFromSitemapXml(xml);
        pages.forEach((page) => {
          combined.push({
            ...page,
            section: section.label,
          });
        });
      } catch (error) {
        console.warn(`Sitemap section ${section.id} failed:`, error);
      }
    })
  );

  combined.sort((a, b) => {
    const sectionCmp = (a.section || "").localeCompare(b.section || "");
    if (sectionCmp !== 0) return sectionCmp;
    return (a.url || "").localeCompare(b.url || "");
  });

  return combined;
}

export function buildLanguagePagesUrlsetXml(entries = []) {
  const rows = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeHtml(entry.url || "")}</loc>${entry.lastmod ? `\n    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>` : ""}
  </url>`
    )
    .join("\n\n");

  return withSitemapStylesheet(`${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${rows}

</urlset>`);
}

export function renderSitemapHtml({
  title = "Sitemap",
  description = "",
  entries = [],
  xmlPath = "",
  backLink = "",
  showSectionColumn = false,
}) {
  const useSectionColumn =
    showSectionColumn || entries.some((entry) => entry.section);
  const colSpan = useSectionColumn ? 4 : 3;

  const rows = entries
    .map(
      (entry) => `<tr>
  <td><span class="badge ${escapeHtml(entry.badgeClass || "")}">${escapeHtml(entry.type || "Link")}</span></td>
  ${useSectionColumn ? `<td>${escapeHtml(entry.section || "—")}</td>` : ""}
  <td><a href="${escapeHtml(entry.url)}">${escapeHtml(entry.url)}</a></td>
  <td>${escapeHtml(entry.lastmod || "")}</td>
</tr>`
    )
    .join("\n");

  const navParts = [];
  if (backLink) {
    navParts.push(`<a href="${escapeHtml(backLink)}">← Back to sitemap index</a>`);
  }
  if (xmlPath) {
    navParts.push(
      `<a href="${escapeHtml(xmlPath)}">View XML</a> (for search engines)`
    );
  }
  const navHtml = navParts.length
    ? `<p class="meta">${navParts.join(" · ")}</p>`
    : "";
  const descHtml = description
    ? `<p class="desc">${escapeHtml(description)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f9fafb; color: #111827; }
    h1 { margin: 0 0 16px; font-size: 24px; }
    p.desc, p.meta { margin: 0 0 16px; color: #4b5563; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.05); }
    th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; vertical-align: top; }
    th { background: #111827; color: #fff; }
    tr:nth-child(even) { background: #f3f4f6; }
    a { color: #2563eb; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1e40af; }
    .badge.section { background: #dcfce7; color: #166534; }
    .badge.page { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${descHtml}
  ${navHtml}
  <table>
    <thead><tr><th>Type</th>${useSectionColumn ? "<th>Section</th>" : ""}<th>URL</th><th>Last modified</th></tr></thead>
    <tbody>
      ${rows || `<tr><td colspan="${colSpan}">No entries found.</td></tr>`}
    </tbody>
  </table>
</body>
</html>`;
}

export function parseUrlEntriesFromSitemapXml(xml) {
  const entries = [];

  const readBlock = (chunk) => {
    const loc = chunk.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (!loc) return null;
    const lastmod =
      chunk.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]?.trim() || "";
    return { loc, lastmod };
  };

  let match;
  const sitemapRe = /<sitemap>([\s\S]*?)<\/sitemap>/g;
  while ((match = sitemapRe.exec(xml)) !== null) {
    const row = readBlock(match[1]);
    if (!row) continue;
    const isLanguage =
      /\/sitemap-[a-z]{2}(-[a-z]{2})?\.xml$/i.test(row.loc) ||
      (row.loc.includes("/sitemap.xml") && !row.loc.includes("-sitemap.xml"));
    entries.push({
      type: isLanguage ? "Language" : "Section",
      badgeClass: isLanguage ? "" : "section",
      url: row.loc,
      lastmod: row.lastmod,
    });
  }

  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  while ((match = urlRe.exec(xml)) !== null) {
    const row = readBlock(match[1]);
    if (!row) continue;
    entries.push({
      type: "Page",
      badgeClass: "page",
      url: row.loc,
      lastmod: row.lastmod,
    });
  }

  return entries;
}

export function htmlResponseForSitemapXml(
  request,
  xml,
  { title = "Sitemap", description = "" } = {}
) {
  let entries = parsePageUrlsFromSitemapXml(xml);
  if (!entries.length) {
    entries = parseUrlEntriesFromSitemapXml(xml).filter(
      (entry) => entry.type === "Page"
    );
  }

  return new Response(
    renderSitemapHtml({
      title,
      description,
      entries,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export async function fetchAndLocalizeSectionSitemap({
  request,
  apiPath,
  locale,
  activeLocales,
}) {
  const targetOrigin = new URL(request.url).origin;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE_URL}/api/${apiPath}`, {
    method: "GET",
    headers: { Accept: "application/xml" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${apiPath}: ${res.status}`);
  }

  let xml = await res.text();
  xml = rewriteSitemapIndexLocs(xml, targetOrigin);
  xml = rewriteSitemapUrlsetLocs(xml, targetOrigin, locale, activeLocales);
  return withSitemapStylesheet(xml);
}
