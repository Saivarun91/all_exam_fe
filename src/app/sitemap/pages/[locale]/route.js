import { NextResponse } from "next/server";
import {
  buildLanguageAllPagesHtmlResponse,
  buildLanguagePagesUrlsetXml,
  fetchActiveSitemapLanguages,
  fetchAllPageEntriesForLocale,
  wantsXmlSitemapResponse,
} from "@/lib/sitemapUtils";
import {
  languageCodesMatch,
  normalizeLanguageCode,
} from "@/lib/supportedLocales";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const locale = normalizeLanguageCode((await params)?.locale || "en");
  const activeLocales = await fetchActiveSitemapLanguages(API_BASE_URL);

  if (!activeLocales.some((code) => languageCodesMatch(code, locale))) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (wantsXmlSitemapResponse(request)) {
    const entries = await fetchAllPageEntriesForLocale(
      request,
      locale,
      activeLocales
    );
    const xml = buildLanguagePagesUrlsetXml(entries);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  return buildLanguageAllPagesHtmlResponse(request, locale, activeLocales);
}
