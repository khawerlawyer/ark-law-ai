// pages/api/share.js
// POST: save shared chat, return shareId
// GET:  retrieve shared chat by id

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ── GET: retrieve shared chat ──────────────────────────────
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    try {
      const { data, error } = await supabase
        .from("ark_shared_chats")
        .select("*")
        .eq("share_id", id)
        .single();
      if (error || !data) return res.status(404).json({ error: "Share not found or expired" });
      // Increment view count
      await supabase.from("ark_shared_chats")
        .update({ views: (data.views || 0) + 1 })
        .eq("share_id", id);
      return res.status(200).json({ chat: data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: create shared chat ───────────────────────────────
  if (req.method === "POST") {
    const { messages, title, country, sharedBy } = req.body;
    if (!messages?.length) return res.status(400).json({ error: "No messages" });

    // Generate unique share ID (8 chars)
    const shareId = Math.random().toString(36).substring(2, 6) +
                    Math.random().toString(36).substring(2, 6);

    try {
      const { error } = await supabase.from("ark_shared_chats").insert({
        share_id:   shareId,
        title:      title || "ARK Law AI Chat",
        messages:   JSON.stringify(messages),
        country:    country || "USA",
        shared_by:  sharedBy || "Anonymous",
        views:      0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });
      if (error) throw error;
      const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://arklaw.ai"}/shared/${shareId}`;
      return res.status(200).json({ shareId, shareUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
