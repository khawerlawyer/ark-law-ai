import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  var auth = getAuth(req);
  var userId = auth.userId;

  // ── Guest access: 30-minute free window ──────────────────────
  if (!userId) {
    var now = Date.now();
    var cookieHeader = req.headers.cookie || "";
    var match = cookieHeader.match(/ark_guest_start=(\d+)/);
    var guestStart = match ? parseInt(match[1]) : null;

    if (!guestStart) {
      // First visit — set the timer cookie
      res.setHeader("Set-Cookie", "ark_guest_start=" + now + "; Path=/; Max-Age=3600; SameSite=Lax");
      guestStart = now;
    }

    var minutesUsed = (now - guestStart) / 60000;
    if (minutesUsed > 30) {
      return res.status(403).json({
        error: "Your 30-minute free session has ended. Please sign up for a free 7-day trial to continue using ARK Law AI."
      });
    }
  }

  // ── Signed-in users: check 7-day trial ───────────────────────
  if (userId) {
    var createdAt = auth.sessionClaims && auth.sessionClaims.createdAt
      ? new Date(auth.sessionClaims.createdAt)
      : null;
    if (createdAt) {
      var msPerDay = 1000 * 60 * 60 * 24;
      var daysSince = Math.floor((Date.now() - createdAt.getTime()) / msPerDay);
      if (daysSince > 7) {
        return res.status(403).json({
          error: "Your 7-day free trial has expired. Please upgrade to continue using ARK Law AI."
        });
      }
    }
  }

  // ── Call Anthropic API ────────────────────────────────────────
  var messages = req.body.messages;
  var system = req.body.system;

  try {
    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: system,
        messages: messages,
      }),
    });

    var data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error ? data.error.message : "API error" });
    var reply = (data.content || []).map(function(b) { return b.text || ""; }).join("").trim();
    res.status(200).json({ reply: reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
