
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: false,

  images: {
    unoptimized: true, // keep (since you use CDN)

    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.caravansforsale.com.au",
      },
      {
        protocol: "https",
        hostname: "www.caravansforsale.com.au",
      },
      {
        protocol: "https",
        hostname: "admin.caravansforsale.com.au",
      },
      {
        protocol: "https",
        hostname: "caravansforsale.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "wb79vudhmjvv4ng6.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "caravansforsale.imagestack.net",
      },
    ],

    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },

  compress: true,

  async rewrites() {
    return [
      {
        source: "/blob/:path*",
        destination:
          "https://wb79vudhmjvv4ng6.public.blob.vercel-storage.com/:path*",
      },
    ];
  },

  experimental: {
    optimizeCss: true,
    // ❌ removed staleTimes (not needed now)
  },

  compiler: {
    removeConsole: true,
  },

  async redirects() {
    return [
      {
        source: "/:path*/feed/:rest*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/:path*/feedfeed/:rest*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/:path*/feedfeedfeed/:rest*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // 🔥 LISTINGS (your SEO pages)
      {
        source: "/listings/:path*/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },

      // CATEGORY / STATE / CONDITION
      {
        source: "/:slug-category/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:state-state/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },

      // IMAGES
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },

      // API (no cache)
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "weblogix",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});