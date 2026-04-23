// pages/api/auth/save-history.js
// Updates user's token balance (and optionally chat history) in Supabase

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, tokens, chatHistory } = req.body;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  // ── Supabase update ──────────────────────────────────────────────────────────
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const updateData = {};

      // Only update fields that were provided
      if (tokens !== undefined) updateData.tokens = tokens;
      if (chatHistory !== undefined) {
        updateData.chat_history = typeof chatHistory === "string"
          ? chatHistory
          : JSON.stringify(chatHistory);
      }

      if (Object.keys(updateData).length === 0)
        return res.status(200).json({ message: "Nothing to update" });

      const url = `${process.env.SUPABASE_URL}/rest/v1/ark_users?id=eq.${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type":  "application/json",
          "apikey":        process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Prefer":        "return=minimal",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Supabase save-history error:", text);
        return res.status(500).json({ error: "Failed to save to database" });
      }

      return res.status(200).json({ message: "Saved successfully" });
    } catch (err) {
      console.error("save-history error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Fallback: no DB configured, just acknowledge ──────────────────────────
  return res.status(200).json({ message: "No database configured — tokens saved locally only" });
}
