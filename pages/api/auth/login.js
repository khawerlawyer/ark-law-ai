// pages/api/auth/login.js
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !user)
      return res.status(401).json({ error: "Invalid email or password" });

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password" });

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Load chat sessions
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("session_key, title, messages, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    const chatHistory = (sessions || []).map(s => ({
      id:       s.session_key,
      title:    s.title,
      messages: s.messages || [],
      savedAt:  s.updated_at,
    }));

    return res.status(200).json({
      success: true,
      user: {
        id:            user.id,
        name:          user.name,
        email:         user.email,
        profession:    user.profession      || "",
        barOfPractice: user.bar_of_practice || "",
        city:          user.city            || "",
        province:      user.province        || "",
        country:       user.country         || "Pakistan",
        tokens:        user.tokens          ?? 500000,
        signupDate:    user.signup_date      || "",
        lastLogin:     user.last_login       || "",
        chatHistory,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
