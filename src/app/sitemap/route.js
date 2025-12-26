/**
 * Sitemap Route Handler
 * Fetches sitemap from backend API and serves it as XML
 * Accessible at /sitemap (Next.js limitation - cannot use dots in folder names)
 * For /sitemap.xml access, use Next.js rewrite or access via /sitemap
 */

// Mark route as dynamic to prevent static generation errors during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const sitemapUrl = `${API_BASE_URL}/sitemap.xml`;

    // Fetch sitemap from backend
    const response = await fetch(sitemapUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/xml",
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }

    const xmlContent = await response.text();

    // Return XML response
    return new Response(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    
    // Return error response
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://allexamquestions.com/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}

