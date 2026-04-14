// pages/api/auth/save-history.js
// Saves/updates chat sessions + token balance to Supabase

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { userId, chatHistory, tokens } = req.body;
  if (!userId)
    return res.status(400).json({ error: "userId required" });

  try {
    // Update token balance
    if (tokens !== undefined) {
      await supabase
        .from("users")
        .update({ tokens })
        .eq("id", userId);
    }

    // Upsert each session
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const upserts = chatHistory
        .filter(s => s.messages && s.messages.some(m => m.role === "user"))
        .slice(0, 50)
        .map(s => ({
          user_id:     userId,
          session_key: String(s.id),
          title:       s.title || "Chat Session",
          messages:    s.messages.slice(-30),  // keep last 30 messages
          updated_at:  new Date().toISOString(),
        }));

      if (upserts.length > 0) {
        const { error } = await supabase
          .from("chat_sessions")
          .upsert(upserts, { onConflict: "user_id,session_key" });

        if (error) {
          console.error("Session upsert error:", error);
          return res.status(500).json({ error: "Failed to save sessions" });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("save-history error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
