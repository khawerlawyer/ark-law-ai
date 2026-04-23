// pages/api/auth/signup.js
// Storage priority:
//   1. Supabase (if SUPABASE_URL + SUPABASE_SERVICE_KEY are set)  ← recommended for Vercel
//   2. GitHub Gist (if GIST_TOKEN + GIST_ID are set)
//   3. File system fallback (/tmp on Vercel, data/users.json locally)

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
      "Prefer":        method === "POST" ? "return=representation" : "",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(url, opts);
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
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

// ─── Password hashing (zero npm deps) ────────────────────────────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, name, profession, barOfPractice, city, province, country } = req.body;

  // age removed — matches current index.js signup form
  if (!email || !password || !name || !profession || !city || !province || !country)
    return res.status(400).json({ error: "All required fields must be filled." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Please enter a valid email address." });

  const normalizedEmail = email.toLowerCase().trim();

  try {

    // ══ PATH 1: Supabase ══════════════════════════════════════════════════════
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      // Check duplicate
      const check = await supabaseRequest(
        `ark_users?email=eq.${encodeURIComponent(normalizedEmail)}&select=id`
      );
      if (check.ok && check.data?.length > 0)
        return res.status(409).json({ error: "An account with this email already exists. Please login." });

      const newUser = {
        id:              `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        email:           normalizedEmail,
        password_hash:   hashPassword(password),
        name:            name.trim(),
        profession:      profession.trim(),
        bar_of_practice: barOfPractice?.trim() || "",
        city:            city.trim(),
        province:        province.trim(),
        country:         (country || "Pakistan").trim(),
        tokens:          500000,
        created_at:      new Date().toISOString(),
        last_login:      null,
        chat_history:    "[]",
      };

      const insert = await supabaseRequest("ark_users", "POST", newUser);
      if (!insert.ok)
        throw new Error(`DB insert failed: ${JSON.stringify(insert.data)}`);

      return res.status(201).json({
        message: "Account created!",
        user: {
          id:            newUser.id,
          email:         newUser.email,
          name:          newUser.name,
          profession:    newUser.profession,
          barOfPractice: newUser.bar_of_practice,
          city:          newUser.city,
          province:      newUser.province,
          country:       newUser.country,
          tokens:        newUser.tokens,
          createdAt:     newUser.created_at,
          chatHistory:   [],
        },
      });
    }

    // ══ PATH 2: GitHub Gist ═══════════════════════════════════════════════════
    if (process.env.GIST_TOKEN && process.env.GIST_ID) {
      const users = await readUsersFromGist();
      if (users.find(u => u.email === normalizedEmail))
        return res.status(409).json({ error: "An account with this email already exists. Please login." });

      const newUser = {
        id:            `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        email:         normalizedEmail,
        passwordHash:  hashPassword(password),
        name:          name.trim(),
        profession:    profession.trim(),
        barOfPractice: barOfPractice?.trim() || "",
        city:          city.trim(),
        province:      province.trim(),
        country:       (country || "Pakistan").trim(),
        tokens:        500000,
        createdAt:     new Date().toISOString(),
        lastLogin:     null,
        chatHistory:   [],
      };

      await writeUsersToGist([...users, newUser]);
      writeUsersToFile([...users, newUser]);

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({ message: "Account created!", user: safeUser });
    }

    // ══ PATH 3: File system (local dev / last resort) ═════════════════════════
    const users = readUsersFromFile();
    if (users.find(u => u.email === normalizedEmail))
      return res.status(409).json({ error: "An account with this email already exists. Please login." });

    const newUser = {
      id:            `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email:         normalizedEmail,
      passwordHash:  hashPassword(password),
      name:          name.trim(),
      profession:    profession.trim(),
      barOfPractice: barOfPractice?.trim() || "",
      city:          city.trim(),
      province:      province.trim(),
      country:       (country || "Pakistan").trim(),
      tokens:        500000,
      createdAt:     new Date().toISOString(),
      lastLogin:     null,
      chatHistory:   [],
    };

    writeUsersToFile([...users, newUser]);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ message: "Account created!", user: safeUser });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: `Signup failed: ${err.message}` });
  }
}
