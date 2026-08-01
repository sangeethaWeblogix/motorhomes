import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.CFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE || "https://admin.motorhomesforsale.com.au/wp-json/mfs/v1";

async function fetchFromWP(searchParams: URLSearchParams): Promise<NextResponse> {
  const url = `${API_BASE}/params_count?${searchParams.toString()}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
    });
    if (!response.ok) {
      console.error(
        `[params-count] WP API returned HTTP ${response.status} for ` +
          `"${searchParams.toString()}". Check CFS_API_KEY.`
      );
      return NextResponse.json({}, { status: response.status });
    }
    const raw = await response.text();
    const idx = raw.indexOf('{"');
    try {
      const data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
      return NextResponse.json(data, { headers: { "X-Params-Cache": "MISS" } });
    } catch {
      console.error("[params-count] WP API returned unparseable body.");
      return NextResponse.json({});
    }
  } catch (err) {
    console.error("[params-count] WP API request failed:", err);
    return NextResponse.json({}, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  return fetchFromWP(searchParams);
}
