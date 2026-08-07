
// src/app/api/banners/route.ts
import { NextResponse } from "next/server";

// NOTE: intentionally no query string here — the WP host's nginx proxy cache
// (X-Proxy-Cache) keys on the full URL including query params, so the
// previous "?placement=...&limit=50&paged=1" variant was stuck serving a
// stale cached response after banner images were updated. The plain
// no-query-string URL was a cache miss and returned live data. This is a
// workaround, not a real fix — once this exact URL gets cached too, the same
// staleness can recur. The proxy cache config on the WP host needs fixing
// for a durable solution.
const BANNERS_URL = "https://admin.motorhomesforsale.com.au/wp-json/ads-manager/v1/banners/";

export async function GET() {
  try {
    const res = await fetch(BANNERS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`❌ banners fetch failed: ${res.status}`);
      return NextResponse.json([], { status: 500 });
    }

    const raw = await res.text();
    const idx = raw.search(/[[{]/);
    let data: any = [];
    if (idx !== -1) {
      try {
        data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
      } catch {
        data = [];
      }
    }

    const all = Array.isArray(data) ? data : data.data || [];
    const unique = all.filter(
      (banner: { id: unknown }, index: number, self: { id: unknown }[]) =>
        index === self.findIndex((b) => b.id === banner.id)
    );

    console.log(`✅ Total banners: ${unique.length}`);
    return NextResponse.json(unique);

  } catch (error) {
    console.error("🔴 Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}