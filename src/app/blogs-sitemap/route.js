import { NextResponse } from "next/server";
import {
  fetchActiveSitemapLanguages,
  fetchAndLocalizeSectionSitemap,
  htmlResponseForSitemapXml,
  prefersHtmlResponse,
  resolveSitemapLocale,
} from "@/lib/sitemapUtils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  try {
    const activeLocales = await fetchActiveSitemapLanguages(API_BASE_URL);
    const locale = resolveSitemapLocale(request, activeLocales);
    const xml = await fetchAndLocalizeSectionSitemap({
      request,
      apiPath: "blogs-sitemap.xml",
      locale,
      activeLocales,
    });

    if (prefersHtmlResponse(request)) {
      return htmlResponseForSitemapXml(request, xml);
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Blogs sitemap error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
