// pages/api/auth/save-history.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // ── PASTE YOUR SUPABASE VALUES HERE ──────────────────────────────────
  const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
  const SUPABASE_KEY = "PASTE_YOUR_ANON_KEY_HERE";
  // ─────────────────────────────────────────────────────────────────────

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { userId, chatHistory, tokens } = req.body || {};
  if (!userId)
    return res.status(400).json({ error: "userId required" });

  try {
    if (tokens !== undefined)
      await supabase.from("users").update({ tokens }).eq("id", userId);

    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const upserts = chatHistory
        .filter(s => s.messages && s.messages.some(m => m.role === "user"))
        .slice(0, 50)
        .map(s => ({
          user_id:     userId,
          session_key: String(s.id),
          title:       s.title || "Chat Session",
          messages:    s.messages.slice(-30),
          updated_at:  new Date().toISOString(),
        }));
      if (upserts.length > 0)
        await supabase.from("chat_sessions").upsert(upserts, { onConflict: "user_id,session_key" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Error: " + err.message });
  }
}
