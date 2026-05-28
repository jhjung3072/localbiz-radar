import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-scrubber";
import { getSentryEnvironment, getSentryTracesSampleRate } from "@/lib/sentry-utils";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    sendDefaultPii: false,
    tracesSampleRate: getSentryTracesSampleRate(),
    beforeSend(event) {
      return scrubSentryEvent(event);
    },
  });
}
