// The live domain, matching the default in backend/lib/site.ts.
//
// Deliberately NOT read from process.env: redirects() and serverActions run
// through next.config at BUILD time and get frozen into routes-manifest.json,
// so a build on a machine with a dev SITE_URL would bake localhost into the
// production artifact. The public domain is stable, so it is pinned here.
const SITE_HOST = "ojaskaraabuilders.com";
const SITE_URL = `https://${SITE_HOST}`;
const WWW_HOST = `www.${SITE_HOST}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone/server.js — a self-contained Node server this
  // app can run under a plain host process (e.g. cPanel's Node.js Selector /
  // Passenger), instead of requiring the `next start` CLI.
  // Only set for `next build` — Turbopack's dev-mode font loader breaks when
  // this is on during `next dev` (NODE_ENV is always "development" there,
  // forced by the Next.js CLI, so this can't accidentally leak into dev).
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Admin-uploaded media is stored in Vercel Blob and served from a
      // per-store public subdomain of blob.vercel-storage.com.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    // Next.js 16 caps request bodies passing through middleware.ts at 10MB by
    // default. Our middleware matches /api/admin/:path*, which includes the
    // media upload route — so without raising this, any video upload over
    // 10MB gets cut off before it reaches our own 200MB size check, and fails
    // with a misleading "Missing file or section" error. Match our route's
    // own cap (see MAX_SIZE_BYTES in app/api/admin/upload/route.ts).
    proxyClientMaxBodySize: "200mb",
    serverActions: {
      // The admin panel is built almost entirely on Server Actions, and Next.js
      // rejects an action whose Origin doesn't match the host it believes it is
      // serving. Behind a reverse proxy (cPanel/Passenger, nginx) the forwarded
      // host often doesn't survive, which would break every admin save on the
      // live domain. Listing the real hosts makes that check pass regardless.
      allowedOrigins: [SITE_HOST, WWW_HOST, "localhost:3000"],
    },
  },
  async redirects() {
    // One canonical hostname: www -> apex, matching the canonical/sitemap URLs.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: WWW_HOST }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          // The admin panel is state-changing, so disallow off-origin framing.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
