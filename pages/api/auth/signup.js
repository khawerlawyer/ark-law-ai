// pages/api/auth/signup.js
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, password } = req.body || {};

    // Step 1 — test basic response
    // return res.status(200).json({ ok: true, received: { name, email } });

    // Step 2 — test supabase import
    const { createClient } = await import("@supabase/supabase-js");
    // return res.status(200).json({ ok: true, step: "supabase imported" });

    // Step 3 — test bcrypt import
    const { hash } = await import("bcrypt-ts");
    // return res.status(200).json({ ok: true, step: "bcrypt imported" });

    // Step 4 — test hashing
    const password_hash = await hash(password || "test", 10);
    // return res.status(200).json({ ok: true, step: "hash done" });

    // Step 5 — test supabase connection
    const SUPABASE_URL = "https://xxxxxxxxxxxx.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (error) return res.status(500).json({ error: "Supabase error: " + error.message });

    return res.status(200).json({ ok: true, step: "all good", supabase_connected: true });

  } catch (err) {
    return res.status(500).json({ error: "CATCH: " + err.message + " | stack: " + err.stack?.slice(0, 200) });
  }
}
