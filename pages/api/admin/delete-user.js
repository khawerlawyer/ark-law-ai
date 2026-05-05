// pages/api/admin/delete-user.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: "Database not configured" });

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/ark_users?id=eq.${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          "apikey":        process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "Delete failed: " + text });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
