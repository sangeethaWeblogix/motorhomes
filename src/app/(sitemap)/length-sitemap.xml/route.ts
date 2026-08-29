    import { NextResponse } from "next/server";
  
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.motorhomesforsale.com.au/listings/";
    const API_KEY = process.env.CFS_API_KEY; // ✅ Added

  export async function GET() {
    try {
      const res = await fetch(
        "https://admin.motorhomesforsale.com.au/wp-json/cfs/v1/sitemap/length",
         {
        headers: {
          Accept: "application/json",
          ...(API_KEY && { "X-API-Key": API_KEY }), // ✅ Added
        },
      }
       
      );
  
      const data = await res.json();

      if (!data?.success || !Array.isArray(data.paths)) {
        throw new Error("Invalid sitemap API response");
      }

      // The site's current "By Size (Length)" bands (home page + /listings/
      // browse section) — merged in since the backend's auto-generated length
      // list hasn't caught up to these yet.
      const HOMEPAGE_LENGTH_BANDS = [
        "under-20-length-in-feet/",
        "between-20-23-length-in-feet/",
        "between-23-26-length-in-feet/",
        "between-26-30-length-in-feet/",
        "over-30-length-in-feet/",
      ];
      const paths = Array.from(new Set([...data.paths, ...HOMEPAGE_LENGTH_BANDS]));

      const urls = paths
        .map(
          (path: string) => `
    <url>
      <loc>${SITE_URL}${path}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
             <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`
        )
        .join("");
  
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
  </urlset>`;
  
      return new NextResponse(sitemap, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      });
    } catch (error) {
      console.error("❌ Sitemap error:", error);
      return new NextResponse("Failed to generate sitemap", { status: 500 });
    }
  }
  