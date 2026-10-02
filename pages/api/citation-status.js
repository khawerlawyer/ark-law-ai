// pages/api/citation-status.js
// Open https://arklaw.ai/api/citation-status in a browser to check the citation checker.
// Does not reveal the token.

export default async function handler(req, res) {
  const token = process.env.COURTLISTENER_API_TOKEN || "";
  const result = {
    courtlistener_token_set: !!token,
    courtlistener_test: "skipped (no token)",
    test_citation: "410 U.S. 113",
  };
  if (token) {
    try {
      const r = await fetch("https://www.courtlistener.com/api/rest/v4/citation-lookup/", {
        method: "POST",
        headers: { Authorization: "Token " + token.trim(), "Content-Type": "application/x-www-form-urlencoded" },
        body: "text=" + encodeURIComponent("410 U.S. 113"),
      });
      if (r.status === 401 || r.status === 403) {
        result.courtlistener_test = "FAILED - token rejected (HTTP " + r.status + "). Re-copy the token into Vercel.";
      } else if (!r.ok) {
        result.courtlistener_test = "FAILED - HTTP " + r.status;
      } else {
        const data = await r.json();
        const hit = Array.isArray(data) && data[0] && data[0].clusters && data[0].clusters[0];
        result.courtlistener_test = hit ? "OK - found " + hit.case_name : "Connected, but test citation not resolved";
      }
    } catch (e) {
      result.courtlistener_test = "FAILED - " + e.message;
    }
  }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(result);
}
