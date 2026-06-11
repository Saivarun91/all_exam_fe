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
  return /-sitemap(\.xml)?$/i.test(path);
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

export function buildSectionSitemapUrl(origin, sectionFile) {
  return `${origin}/${sectionFile || "categories-sitemap.xml"}`;
}

export function buildRootSitemapIndexXml(origin) {
  const lastmod = formatSitemapLastmod();
  const entries = SITEMAP_SECTIONS.map(
    (section) => `  <sitemap>
    <loc>${buildSectionSitemapUrl(origin, section.file)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
  ).join("\n\n");

  return withSitemapStylesheet(`${XML_HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries}

</sitemapindex>`);
}

export function wantsXmlSitemapResponse(request) {
  const url = new URL(request.url);
  if (url.searchParams.get("format") === "xml") return true;
  if (url.searchParams.get("view") === "all") return false;
  return !prefersHtmlResponse(request);
}

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

export function rewriteSitemapLocs(xml, targetOrigin) {
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

export async function fetchSectionSitemap({ request, apiPath }) {
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
  xml = rewriteSitemapLocs(xml, targetOrigin);
  return withSitemapStylesheet(xml);
}

export async function fetchAllPageEntries(request) {
  const combined = [];

  await Promise.all(
    SITEMAP_SECTIONS.map(async (section) => {
      try {
        const xml = await fetchSectionSitemap({
          request,
          apiPath: section.file,
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

export function buildPagesUrlsetXml(entries = []) {
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
  showTypeColumn = true,
}) {
  const useSectionColumn =
    showSectionColumn || entries.some((entry) => entry.section);
  const useTypeColumn =
    showTypeColumn && entries.some((entry) => entry.type);
  const colSpan =
    (useTypeColumn ? 1 : 0) + (useSectionColumn ? 1 : 0) + 2;

  const rows = entries
    .map(
      (entry) => `<tr>
  ${useTypeColumn ? `<td><span class="badge ${escapeHtml(entry.badgeClass || "")}">${escapeHtml(entry.type || "Link")}</span></td>` : ""}
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
    <thead><tr>${useTypeColumn ? "<th>Type</th>" : ""}${useSectionColumn ? "<th>Section</th>" : ""}<th>URL</th><th>Last modified</th></tr></thead>
    <tbody>
      ${rows || `<tr><td colspan="${colSpan}">No entries found.</td></tr>`}
    </tbody>
  </table>
</body>
</html>`;
}

export function htmlResponseForSitemapXml(
  request,
  xml,
  { title = "Sitemap", description = "" } = {}
) {
  const entries = parsePageUrlsFromSitemapXml(xml);

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

export async function buildAllPagesHtmlResponse(request) {
  const entries = await fetchAllPageEntries(request);

  return new Response(
    renderSitemapHtml({
      title: "Sitemap — All Pages",
      entries,
      showSectionColumn: true,
      showTypeColumn: false,
      backLink: "/sitemap",
      xmlPath: "/sitemap/pages?format=xml",
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
