// sentry.edge.config.js - error tracking for edge code (middleware). Off until SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { scrubEvent, scrubTransaction } from "./lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.VERCEL_ENV || "development",
  tracesSampleRate: 0, // errors only; page speed is measured by Vercel Speed Insights
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubTransaction,
});
