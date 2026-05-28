import * as Sentry from "@sentry/nextjs";

export function getSentryEnvironment() {
  return process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
}

export function getSentryTracesSampleRate() {
  return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
}

export function getSentryReplaySessionSampleRate() {
  return process.env.NODE_ENV === "production" ? 0.05 : 0;
}

export function getSentryReplayOnErrorSampleRate() {
  return process.env.NODE_ENV === "production" ? 1.0 : 1.0;
}

export function addSafeBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, boolean | number | string | null | undefined>,
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level: "info",
    data,
  });
}
