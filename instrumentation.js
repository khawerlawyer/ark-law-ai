// instrumentation.js - Next.js loads this once when the server starts.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

// Reports crashes in API routes and pages to Sentry
export const onRequestError = Sentry.captureRequestError;
