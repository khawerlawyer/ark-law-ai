// pages/api/blog.js
// GET: list posts | POST: submit post

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: "Supabase not configured" });

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" };

  // GET — fetch approved posts
  if (req.method === "GET") {
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/ark_blog_posts?status=eq.approved&select=*&order=published_at.desc&limit=50`, { headers });
      const data = await r.json();
      return res.status(200).json({ posts: Array.isArray(data) ? data : [] });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // POST — submit new post (pending review)
  if (req.method === "POST") {
    const { title, author_name, author_email, profession, country, content, excerpt, category } = req.body;
    if (!title || !author_name || !author_email || !content) return res.status(400).json({ error: "Missing required fields" });
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/ark_blog_posts`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({
          title: title.substring(0, 200),
          author_name: author_name.substring(0, 100),
          author_email: author_email.substring(0, 200),
          profession: (profession || "").substring(0, 100),
          country: (country || "").substring(0, 100),
          content: content.substring(0, 20000),
          excerpt: (excerpt || content.substring(0, 300)).substring(0, 500),
          category: (category || "General").substring(0, 50),
          status: "pending",
          submitted_at: new Date().toISOString(),
        }),
      });
      if (!r.ok) { const e = await r.text(); return res.status(500).json({ error: e }); }
      return res.status(200).json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
