    import { NextResponse } from "next/server";
  
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.motorhomesforsale.com.au/listings/";
      const API_KEY = process.env.CFS_API_KEY; // ✅ Added

  
  export async function GET() {
    try {
      const res = await fetch(
        "https://admin.motorhomesforsale.com.au/wp-json/cfs/v1/sitemap/gvm",
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

      // The site's current "By Weight (GVM)" bands (home page + /listings/
      // browse section) — merged in since the backend's auto-generated GVM
      // list hasn't caught up to these yet.
      const HOMEPAGE_GVM_BANDS = [
        "under-3500-kg-gvm/",
        "between-3500-kg-4500-kg-gvm/",
        "between-4500-kg-6000-kg-gvm/",
        "between-6000-kg-8000-kg-gvm/",
        "over-8000-kg-gvm/",
      ];
      const paths = Array.from(new Set([...data.paths, ...HOMEPAGE_GVM_BANDS]));

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
  