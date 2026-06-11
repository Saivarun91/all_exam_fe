import { NextResponse } from "next/server";
import {
  fetchSectionSitemap,
  htmlResponseForSitemapXml,
  prefersHtmlResponse,
} from "@/lib/sitemapUtils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const xml = await fetchSectionSitemap({
      request,
      apiPath: "blogs-sitemap.xml",
    });

    if (prefersHtmlResponse(request)) {
      return htmlResponseForSitemapXml(request, xml, {
        title: "Blogs Sitemap",
        description: "All blog pages on AllExamQuestions.",
      });
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
