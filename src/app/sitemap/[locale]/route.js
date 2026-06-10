import { NextResponse } from "next/server";
import {
  buildLanguageAllPagesHtmlResponse,
  buildLanguageSitemapIndexXml,
  fetchActiveSitemapLanguages,
  wantsXmlSitemapResponse,
} from "@/lib/sitemapUtils";
import {
  languageCodesMatch,
  normalizeLanguageCode,
} from "@/lib/supportedLocales";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const targetOrigin = new URL(request.url).origin;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const locale = normalizeLanguageCode((await params)?.locale || "en");
  const activeLocales = await fetchActiveSitemapLanguages(API_BASE_URL);

  if (!activeLocales.some((code) => languageCodesMatch(code, locale))) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!wantsXmlSitemapResponse(request)) {
    return buildLanguageAllPagesHtmlResponse(request, locale, activeLocales);
  }

  const xml = buildLanguageSitemapIndexXml(
    targetOrigin,
    locale,
    activeLocales
  );

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
