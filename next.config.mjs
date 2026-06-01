// @ts-check
// Next.js 15 + React 19 config for @opennextjs/cloudflare deployment.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // OpenNext for Cloudflare handles its own runtime targeting.
  images: { unoptimized: true },
  // Tree-shake large packages — keeps the Cloudflare Worker under 3 MB
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion", "exceljs", "@supabase/supabase-js"],
  },
};

// Sentry disabled — no DSN configured and it adds ~300KB gzipped to the
// Cloudflare Worker bundle. Re-enable with withSentryConfig() once a DSN
// is set and the Worker is on a paid plan (10 MB limit).
export default nextConfig;
