import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.CFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE || "https://admin.motorhomesforsale.com.au/wp-json/mfs/v1";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = `${API_BASE}/product_exists_check?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(
        `[product-exists-check] WP API returned HTTP ${response.status} for "${searchParams.toString()}".`
      );
      return NextResponse.json({ count: 0, exists: false }, { status: response.status });
    }
    const raw = await response.text();
    const idx = raw.indexOf("{");
    try {
      const data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
      return NextResponse.json(data);
    } catch {
      console.error("[product-exists-check] WP API returned unparseable body.");
      return NextResponse.json({ count: 0, exists: false });
    }
  } catch (err) {
    console.error("[product-exists-check] WP API request failed:", err);
    return NextResponse.json({ count: 0, exists: false }, { status: 502 });
  }
}
