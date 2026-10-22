// instrumentation-client.js - error tracking in visitors' browsers. Off until NEXT_PUBLIC_SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { scrubEvent, scrubTransaction } from "./lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "production",
  tracesSampleRate: 0, // errors only; page speed is measured by Vercel Speed Insights
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubTransaction,
  // Known, harmless hydration warnings that React recovers from by itself.
  // Without this they would be reported on every page view.
  ignoreErrors: [
    /Minified React error #(418|423|425)/,
    /Hydration failed/i,
    /Text content does not match/i,
    /There was an error while hydrating/i,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
