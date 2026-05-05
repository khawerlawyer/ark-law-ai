// pages/api/admin/users.js
// Returns all users — only callable by admin (verified server-side by email)

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: "Database not configured" });

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/ark_users?select=id,email,name,profession,bar_of_practice,city,province,country,tokens,created_at,last_login,chat_history&order=created_at.desc`,
      {
        headers: {
          "apikey":        process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "DB error: " + text });
    }

    const users = await response.json();
    // Map snake_case to camelCase
    const mapped = users.map(u => ({
      id:            u.id,
      email:         u.email,
      name:          u.name,
      profession:    u.profession,
      barOfPractice: u.bar_of_practice,
      city:          u.city,
      province:      u.province,
      country:       u.country,
      tokens:        u.tokens,
      created_at:    u.created_at,
      last_login:    u.last_login,
      chat_history:  u.chat_history,
    }));

    return res.status(200).json({ users: mapped, total: mapped.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
