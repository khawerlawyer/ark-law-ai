import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  var auth = getAuth(req);
  var userId = auth.userId;

  if (!userId) {
    var now = Date.now();
    var cookieHeader = req.headers.cookie || "";
    var match = cookieHeader.match(/ark_guest_start=(\d+)/);
    var guestStart = match ? parseInt(match[1]) : null;
    if (!guestStart) {
      res.setHeader("Set-Cookie", "ark_guest_start=" + now + "; Path=/; Max-Age=14400; SameSite=Lax");
      guestStart = now;
    }
    var minutesUsed = (now - guestStart) / 60000;
    if (minutesUsed > 180) {
      return res.status(403).json({ error: "Your 3-hour free session has ended. Please sign up for a free 7-day trial to continue." });
    }
  }

  if (userId) {
    var createdAt = auth.sessionClaims && auth.sessionClaims.createdAt ? new Date(auth.sessionClaims.createdAt) : null;
    if (createdAt) {
      var msPerDay = 1000 * 60 * 60 * 24;
      var daysSince = Math.floor((Date.now() - createdAt.getTime()) / msPerDay);
      if (daysSince > 7) {
        return res.status(403).json({ error: "Your 7-day free trial has expired. Please upgrade to continue." });
      }
    }
  }

  var messages = req.body.messages;
  var system = req.body.system;
  var docContent = req.body.docContent || null;

  // If document content provided, prepend it to the last message
  if (docContent && messages && messages.length > 0) {
    var lastMsg = messages[messages.length - 1];
    messages = messages.slice(0, -1).concat([{
      role: lastMsg.role,
      content: lastMsg.content + "\n\n--- DOCUMENT CONTENT ---\n" + docContent.slice(0, 8000) + "\n--- END DOCUMENT ---"
    }]);
  }

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
        max_tokens: 2000,
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
