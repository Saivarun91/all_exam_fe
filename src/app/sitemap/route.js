import { NextResponse } from "next/server";
import {
  buildRootSitemapIndexXml,
  buildSectionSitemapUrl,
  formatSitemapLastmod,
  prefersHtmlResponse,
  renderSitemapHtml,
  resolveSitemapOrigin,
  SITEMAP_SECTIONS,
} from "@/lib/sitemapUtils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const targetOrigin = resolveSitemapOrigin(request);
  const lastmod = formatSitemapLastmod();

  if (prefersHtmlResponse(request)) {
    const entries = SITEMAP_SECTIONS.map((section) => ({
      url: buildSectionSitemapUrl(targetOrigin, section.file),
      lastmod,
      section: section.label,
    }));

    return new NextResponse(
      renderSitemapHtml({
        title: "Sitemap",
        entries,
        showSectionColumn: true,
        showTypeColumn: false,
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

  const xml = buildRootSitemapIndexXml(targetOrigin);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
