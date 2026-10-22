// pages/_app.js - wraps every page of ARK LAW AI
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Privacy: record only the page path (e.g. /usa), never the part after "?"
// so shared-chat links (?share=...) and anything else in the address stay private.
function stripQuery(event) {
  try {
    const u = new URL(event.url);
    return { ...event, url: u.origin + u.pathname };
  } catch {
    return event;
  }
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics beforeSend={stripQuery} />
      <SpeedInsights beforeSend={stripQuery} />
    </>
  );
}
