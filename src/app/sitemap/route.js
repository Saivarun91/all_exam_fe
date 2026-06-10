import { NextResponse } from "next/server";
import {
  buildLanguageAllPagesUrl,
  buildRootSitemapIndexXml,
  fetchActiveSitemapLanguages,
  formatSitemapLastmod,
  prefersHtmlResponse,
  renderSitemapHtml,
  SITEMAP_SECTIONS,
  withSitemapStylesheet,
} from "@/lib/sitemapUtils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const targetOrigin = new URL(request.url).origin;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  try {
    const languages = await fetchActiveSitemapLanguages(API_BASE_URL);
    const lastmod = formatSitemapLastmod();

    if (prefersHtmlResponse(request)) {
      const entries = languages.map((code) => ({
        type: "Language",
        url: buildLanguageAllPagesUrl(targetOrigin, code),
        lastmod,
      }));

      return new NextResponse(
        renderSitemapHtml({
          title: "Sitemap",
          entries,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    const xml = buildRootSitemapIndexXml(targetOrigin, languages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap index error:", error);
    const fallbackLastmod = formatSitemapLastmod();
    const fallbackLanguages = await fetchActiveSitemapLanguages(API_BASE_URL);

    const legacyEntries = SITEMAP_SECTIONS.map(
      (section) => `  <sitemap>
    <loc>${targetOrigin}/${section.file}</loc>
    <lastmod>${fallbackLastmod}</lastmod>
  </sitemap>`
    ).join("\n\n");

    const xml = withSitemapStylesheet(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <sitemap>
    <loc>${targetOrigin}/en/sitemap.xml</loc>
    <lastmod>${fallbackLastmod}</lastmod>
  </sitemap>

${legacyEntries}

</sitemapindex>`);

    if (prefersHtmlResponse(request)) {
      const entries = fallbackLanguages.length
        ? fallbackLanguages.map((code) => ({
            type: "Language",
            url: buildLanguageAllPagesUrl(targetOrigin, code),
            lastmod: fallbackLastmod,
          }))
        : [
            {
              type: "Language",
              url: buildLanguageAllPagesUrl(targetOrigin, "en"),
              lastmod: fallbackLastmod,
            },
          ];

      return new NextResponse(
        renderSitemapHtml({
          title: "Sitemap",
          entries,
        }),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
