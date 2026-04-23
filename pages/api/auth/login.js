// pages/api/auth/login.js
// Storage priority matches signup.js:
//   1. Supabase (if SUPABASE_URL + SUPABASE_SERVICE_KEY set)
//   2. GitHub Gist (if GIST_TOKEN + GIST_ID set)
//   3. File system fallback

import crypto from "crypto";
import fs from "fs";
import path from "path";

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function supabaseRequest(endpoint, method = "GET", body = null) {
  const url  = `${process.env.SUPABASE_URL}/rest/v1/${endpoint}`;
  const opts = {
    method,
    headers: {
      "Content-Type":  "application/json",
      "apikey":        process.env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(url, opts);
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

async function getUserByEmailSupabase(email) {
  const r = await supabaseRequest(
    `ark_users?email=eq.${encodeURIComponent(email)}&select=*&limit=1`
  );
  if (!r.ok || !r.data?.length) return null;
  const u = r.data[0];
  // Map snake_case DB columns → camelCase for frontend
  return {
    id:            u.id,
    email:         u.email,
    passwordHash:  u.password_hash,
    name:          u.name,
    profession:    u.profession,
    barOfPractice: u.bar_of_practice || "",
    city:          u.city,
    province:      u.province,
    country:       u.country,
    tokens:        u.tokens ?? 500000,
    createdAt:     u.created_at,
    lastLogin:     u.last_login,
    chatHistory:   (() => { try { return JSON.parse(u.chat_history || "[]"); } catch { return []; } })(),
  };
}

async function updateLastLoginSupabase(email) {
  await supabaseRequest(
    `ark_users?email=eq.${encodeURIComponent(email)}`,
    "PATCH",
    { last_login: new Date().toISOString() }
  );
}

async function updateTokensSupabase(email, tokens) {
  await supabaseRequest(
    `ark_users?email=eq.${encodeURIComponent(email)}`,
    "PATCH",
    { tokens }
  );
}

// ─── Gist helpers ─────────────────────────────────────────────────────────────

async function readUsersFromGist() {
  const res = await fetch(`https://api.github.com/gists/${process.env.GIST_ID}`, {
    headers: { Authorization: `Bearer ${process.env.GIST_TOKEN}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`Gist read failed: ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.files["users.json"]?.content || "[]");
}

async function writeUsersToGist(users) {
  await fetch(`https://api.github.com/gists/${process.env.GIST_ID}`, {
    method:  "PATCH",
    headers: { Authorization: `Bearer ${process.env.GIST_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body:    JSON.stringify({ files: { "users.json": { content: JSON.stringify(users, null, 2) } } }),
  });
}

// ─── File helpers ─────────────────────────────────────────────────────────────

function readUsersFromFile() {
  const paths = [path.join(process.cwd(), "data", "users.json"), "/tmp/ark_users.json"];
  for (const file of paths) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf8").trim();
        if (raw) return JSON.parse(raw);
      }
    } catch {}
  }
  return [];
}

function writeUsersToFile(users) {
  const json = JSON.stringify(users, null, 2);
  try {
    const p = path.join(process.cwd(), "data", "users.json");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, json, "utf8");
  } catch {}
  try { fs.writeFileSync("/tmp/ark_users.json", json, "utf8"); } catch {}
}

// ─── Password verification ────────────────────────────────────────────────────

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(":");
    const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return verify === hash;
  } catch { return false; }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = email.toLowerCase().trim();

  try {

    // ══ PATH 1: Supabase ══════════════════════════════════════════════════════
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const user = await getUserByEmailSupabase(normalizedEmail);

      if (!user || !verifyPassword(password, user.passwordHash))
        return res.status(401).json({ error: "Invalid email or password." });

      await updateLastLoginSupabase(normalizedEmail);

      const { passwordHash: _, ...safeUser } = { ...user, lastLogin: new Date().toISOString() };
      return res.status(200).json({ message: "Login successful", user: safeUser });
    }

    // ══ PATH 2: GitHub Gist ═══════════════════════════════════════════════════
    if (process.env.GIST_TOKEN && process.env.GIST_ID) {
      const users = await readUsersFromGist();
      const user  = users.find(u => u.email === normalizedEmail);

      if (!user || !verifyPassword(password, user.passwordHash))
        return res.status(401).json({ error: "Invalid email or password." });

      const updated = users.map(u =>
        u.email === normalizedEmail ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      await writeUsersToGist(updated);
      writeUsersToFile(updated);

      const { passwordHash: _, ...safeUser } = { ...user, lastLogin: new Date().toISOString() };
      return res.status(200).json({ message: "Login successful", user: safeUser });
    }

    // ══ PATH 3: File system ═══════════════════════════════════════════════════
    const users = readUsersFromFile();
    const user  = users.find(u => u.email === normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordHash))
      return res.status(401).json({ error: "Invalid email or password." });

    const updated = users.map(u =>
      u.email === normalizedEmail ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    writeUsersToFile(updated);

    const { passwordHash: _, ...safeUser } = { ...user, lastLogin: new Date().toISOString() };
    return res.status(200).json({ message: "Login successful", user: safeUser });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: `Login failed: ${err.message}` });
  }
}
