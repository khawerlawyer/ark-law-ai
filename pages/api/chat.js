import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  var auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Please sign in to use ARK Law AI." });

  var createdAt = auth.sessionClaims && auth.sessionClaims.createdAt
    ? new Date(auth.sessionClaims.createdAt)
    : null;

  if (createdAt) {
    var msPerDay = 1000 * 60 * 60 * 24;
    var daysSince = Math.floor((Date.now() - createdAt.getTime()) / msPerDay);
    if (daysSince > 7) {
      return res.status(403).json({ error: "Your 7-day free trial has expired. Please upgrade to continue using ARK Law AI." });
    }
  }

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
