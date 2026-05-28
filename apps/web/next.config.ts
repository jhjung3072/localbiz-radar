import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  env: {
    NEXT_PUBLIC_SENTRY_ORG: process.env.SENTRY_ORG ?? "",
    NEXT_PUBLIC_SENTRY_PROJECT: process.env.SENTRY_PROJECT ?? "",
  },
};

const isSentrySourceMapUploadEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: isSentrySourceMapUploadEnabled,
  bundleSizeOptimizations: {
    excludeDebugStatements: process.env.NODE_ENV === "production",
  },
  sourcemaps: {
    disable: !isSentrySourceMapUploadEnabled,
    deleteSourcemapsAfterUpload: true,
  },
  release: {
    create: isSentrySourceMapUploadEnabled,
    finalize: isSentrySourceMapUploadEnabled,
  },
  errorHandler(error) {
    console.warn("Sentry source map upload was skipped or failed:", error.message);
  },
});
