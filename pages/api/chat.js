// pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages || !messages.length) return res.status(400).json({ error: "No messages" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "API key not configured in Vercel env vars" });

  const firstMsg = messages[0];
  const isSystemNote = firstMsg?.role === "user" && firstMsg?.content?.startsWith("[System:");

  const conversation = isSystemNote ? messages.slice(1) : messages;
  const trimmed = conversation.slice(-6);

  const systemPrompt = isSystemNote
    ? firstMsg.content.replace(/^\[System:\s*/, "").replace(/\]$/, "")
    : "You are ARK Law AI, an expert legal assistant. Answer clearly and concisely.";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        stream:     true,
        system:     systemPrompt,
        messages:   trimmed,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return res.status(response.status).json({ 
        error: `Anthropic API error ${response.status}: ${err}` 
      });
    }

    res.setHeader("Content-Type",      "text/event-stream");
    res.setHeader("Cache-Control",     "no-cache");
    res.setHeader("Connection",        "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") { res.write("data: [DONE]\n\n"); continue; }
        try {
          const evt = JSON.parse(data);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            res.write(`data: ${JSON.stringify({ content: evt.delta.text })}\n\n`);
          }
          if (evt.type === "message_stop") {
            res.write("data: [DONE]\n\n");
          }
        } catch {}
      }
    }
    res.end();
  } catch (err) {
    console.error("Chat API error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
    else res.end();
  }
}
