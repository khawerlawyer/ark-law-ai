// pages/api/share.js

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {

  // ── GET: retrieve shared chat ──────────────────────────────
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data, error } = await supabase
        .from("ark_shared_chats")
        .select("*")
        .eq("share_id", id)
        .single();
      if (error || !data) return res.status(404).json({ error: "Share not found or expired" });
      await supabase.from("ark_shared_chats").update({ views: (data.views||0)+1 }).eq("share_id", id);
      return res.status(200).json({ chat: data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: create shared chat ───────────────────────────────
  if (req.method === "POST") {
    const { messages, title, country, sharedBy } = req.body;
    if (!messages?.length) return res.status(400).json({ error: "No messages provided" });

    // Check env vars
    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
                      || process.env.SUPABASE_SERVICE_KEY
                      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Supabase not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars." });
    }

    // Generate unique 8-char share ID
    const shareId = Math.random().toString(36).substring(2,6) + Math.random().toString(36).substring(2,6);

    // Trim messages - only keep role+content, max 50 messages
    const trimmedMessages = messages.slice(-50).map(m => ({
      role: m.role,
      content: (m.content || "").substring(0, 2000) // cap each message at 2000 chars
    }));

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("ark_shared_chats").insert({
        share_id:   shareId,
        title:      (title || "ARK Law AI Chat").substring(0, 200),
        messages:   JSON.stringify(trimmedMessages),
        country:    country || "USA",
        shared_by:  (sharedBy || "Anonymous").substring(0, 100),
        views:      0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      });
      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Database error: " + error.message });
      }
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arklaw.ai";
      return res.status(200).json({ shareId, shareUrl: siteUrl + "/shared/" + shareId });
    } catch (e) {
      console.error("Share API error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
