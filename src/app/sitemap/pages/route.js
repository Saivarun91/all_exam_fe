import { NextResponse } from "next/server";
import {
  buildAllPagesHtmlResponse,
  buildPagesUrlsetXml,
  fetchAllPageEntries,
  wantsXmlSitemapResponse,
} from "@/lib/sitemapUtils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (wantsXmlSitemapResponse(request)) {
    const entries = await fetchAllPageEntries(request);
    const xml = buildPagesUrlsetXml(entries);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  return buildAllPagesHtmlResponse(request);
}
