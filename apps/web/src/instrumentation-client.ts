import * as Sentry from "@sentry/nextjs";
import {
  getSentryEnvironment,
  getSentryReplayOnErrorSampleRate,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
} from "@/lib/sentry-utils";
import { scrubSentryEvent } from "@/lib/sentry-scrubber";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    sendDefaultPii: false,
    tracesSampleRate: getSentryTracesSampleRate(),
    replaysSessionSampleRate: getSentryReplaySessionSampleRate(),
    replaysOnErrorSampleRate: getSentryReplayOnErrorSampleRate(),
    integrations: [
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        autoInject: false,
        colorScheme: "system",
      }),
    ],
    beforeSend(event) {
      return scrubSentryEvent(event);
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
