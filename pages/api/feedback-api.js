// pages/api/feedback.js
// POST: save feedback | GET: retrieve all (admin only)

export default async function handler(req, res) {
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPA_URL || !SUPA_KEY)
    return res.status(500).json({ error: "Database not configured" });

  // ── POST: submit feedback ────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name, location, issue, version, timestamp } = req.body;
    if (!name || !location || !issue)
      return res.status(400).json({ error: "Missing required fields" });

    try {
      const response = await fetch(`${SUPA_URL}/rest/v1/ark_feedback`, {
        method: "POST",
        headers: {
          "apikey":        SUPA_KEY,
          "Authorization": `Bearer ${SUPA_KEY}`,
          "Content-Type":  "application/json",
          "Prefer":        "return=minimal",
        },
        body: JSON.stringify({
          name:      name.trim(),
          location:  location.trim(),
          issue:     issue.trim(),
          version:   version || "unknown",
          submitted_at: timestamp || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        // If table doesn't exist yet, return a clear message
        if (text.includes("does not exist") || text.includes("42P01")) {
          return res.status(500).json({ error: "TABLE_MISSING" });
        }
        return res.status(500).json({ error: text });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── GET: fetch all feedback (admin only) ─────────────────────────────────
  if (req.method === "GET") {
    try {
      const response = await fetch(
        `${SUPA_URL}/rest/v1/ark_feedback?select=*&order=submitted_at.desc`,
        {
          headers: {
            "apikey":        SUPA_KEY,
            "Authorization": `Bearer ${SUPA_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        return res.status(500).json({ error: text });
      }

      const data = await response.json();
      return res.status(200).json({ feedback: data, total: data.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
