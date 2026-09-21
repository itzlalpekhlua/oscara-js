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
  },
};

module.exports = nextConfig;
