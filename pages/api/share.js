// pages/api/share.js

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL
                   || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
                   || process.env.SUPABASE_ANON_KEY
                   || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase env vars not set. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel." });
  }

  // ── GET: retrieve shared chat ──────────────────────────────
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    try {
      const r = await fetch(
        `${supabaseUrl}/rest/v1/ark_shared_chats?share_id=eq.${id}&select=*`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const rows = await r.json();
      if (!rows?.length) return res.status(404).json({ error: "Not found or expired" });
      const data = rows[0];
      await fetch(`${supabaseUrl}/rest/v1/ark_shared_chats?share_id=eq.${id}`, {
        method: "PATCH",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ views: (data.views || 0) + 1 }),
      });
      return res.status(200).json({ chat: data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: create shared chat ───────────────────────────────
  if (req.method === "POST") {
    const { messages, title, country, sharedBy } = req.body || {};
    if (!messages?.length) return res.status(400).json({ error: "No messages" });

    const shareId = Math.random().toString(36).substring(2, 6)
                  + Math.random().toString(36).substring(2, 6);

    const trimmed = messages.slice(-50).map(m => ({
      role: m.role,
      content: (m.content || "").substring(0, 2000),
    }));

    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/ark_shared_chats`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          share_id:   shareId,
          title:      (title || "ARK Law AI Chat").substring(0, 200),
          messages:   JSON.stringify(trimmed),
          country:    country || "USA",
          shared_by:  (sharedBy || "Anonymous").substring(0, 100),
          views:      0,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        return res.status(500).json({ error: "DB error: " + err });
      }
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arklaw.ai";
      // Route to the correct country page so chat loads in-app
      const countryRoutes = {
        "United States": "/usa",
        "USA": "/usa",
        "Pakistan": "/pakistan",
        "India": "/india",
        "Bangladesh": "/bangladesh",
      };
      const page = countryRoutes[country] || "/usa";
      const shareUrl = `${siteUrl}${page}?share=${shareId}`;
      return res.status(200).json({ shareId, shareUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
