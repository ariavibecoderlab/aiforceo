// @ts-check
// Next.js 15 + React 19 config for @opennextjs/cloudflare deployment.
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // OpenNext for Cloudflare handles its own runtime targeting.
  images: { unoptimized: true }
};

// Sentry is only active when NEXT_PUBLIC_SENTRY_DSN is set.
// Without a DSN it's a no-op — no overhead in dev or CI.
export default withSentryConfig(nextConfig, {
  silent: true,          // suppress Sentry CLI output during build
  disableLogger: true,
  tunnelRoute: undefined,
  widenClientFileUpload: false,
  hideSourceMaps: true,
  sourcemaps: { disable: true },
});
