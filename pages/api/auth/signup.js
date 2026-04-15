// pages/api/auth/signup.js
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // ── Env var check ──
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)
    return res.status(500).json({ error: "Server misconfigured: Supabase env vars missing" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { name, email, password, profession, barOfPractice, city, province, country } = req.body || {};

  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // ── Check duplicate email ──
    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (checkError)
      return res.status(500).json({ error: "DB check failed: " + checkError.message + " | code: " + checkError.code });

    if (existing)
      return res.status(400).json({ error: "An account with this email already exists" });

    // ── Hash password ──
    const password_hash = await bcrypt.hash(password, 10);

    // ── Insert ──
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        email:           email.toLowerCase().trim(),
        password_hash,
        name:            name.trim(),
        profession:      profession      || "",
        bar_of_practice: barOfPractice   || "",
        city:            city            || "",
        province:        province        || "",
        country:         country         || "Pakistan",
        tokens:          500000,
        signup_date:     new Date().toISOString(),
      })
      .select("id, email, name, profession, bar_of_practice, city, province, country, tokens, signup_date")
      .single();

    if (insertError)
      return res.status(500).json({ error: "Insert failed: " + insertError.message + " | code: " + insertError.code + " | hint: " + insertError.hint });

    return res.status(200).json({
      success: true,
      message: "Account created! Please log in.",
      user: {
        id:            user.id,
        name:          user.name,
        email:         user.email,
        profession:    user.profession,
        barOfPractice: user.bar_of_practice,
        city:          user.city,
        province:      user.province,
        country:       user.country,
        tokens:        user.tokens,
        signupDate:    user.signup_date,
      },
    });

  } catch (err) {
    return res.status(500).json({ error: "Unexpected error: " + err.message });
  }
}
