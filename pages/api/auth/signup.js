// pages/api/auth/signup.js
// ─────────────────────────────────────────────────────────────────────────────
// Persistent auth using a SECRET GitHub Gist as storage.
// Works on Vercel serverless — no database, no npm packages needed.
// Each function call reads/writes the same Gist → data is always shared.
//
// ONE-TIME SETUP (5 minutes):
//   1. Go to github.com → Settings → Developer settings → Personal access tokens
//      → Tokens (classic) → Generate new token (classic)
//      Tick only: gist
//      Expiration: No expiration
//      Copy the token.
//
//   2. Create a secret Gist:
//      Go to gist.github.com
//      Filename: users.json
//      Content: []
//      Click "Create secret gist"
//      Copy the Gist ID from the URL:
//      https://gist.github.com/YOUR_USERNAME/GIST_ID  ← copy GIST_ID
//
//   3. Add to Vercel Environment Variables:
//      GIST_TOKEN = your personal access token
//      GIST_ID    = your gist ID
//
//   4. No npm install needed — uses built-in crypto + fetch (Node 18+)
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "crypto";

const GIST_TOKEN = process.env.GIST_TOKEN;
const GIST_ID    = process.env.GIST_ID;

// ── GitHub Gist helpers ───────────────────────────────────────────────────────

async function readUsers() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${GIST_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`Gist read failed: ${res.status}`);
  const data = await res.json();
  const content = data.files["users.json"]?.content || "[]";
  return JSON.parse(content);
}

async function writeUsers(users) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${GIST_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        "users.json": {
          content: JSON.stringify(users, null, 2),
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Gist write failed: ${res.status}`);
}

// ── Password hashing (built-in crypto — no bcrypt needed) ────────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!GIST_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: "Server not configured. Please contact the administrator." });
  }

  const { email, password, name, age, profession, barOfPractice, city, province, country } = req.body;

  // Validation
  if (!email || !password || !name || !age || !profession || !city || !province || !country)
    return res.status(400).json({ error: "All required fields must be filled." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Please enter a valid email address." });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const users = await readUsers();

    if (users.find(u => u.email === normalizedEmail))
      return res.status(409).json({ error: "An account with this email already exists. Please login." });

    const newUser = {
      id:            `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email:         normalizedEmail,
      passwordHash:  hashPassword(password),
      name:          name.trim(),
      age:           parseInt(age, 10),
      profession:    profession.trim(),
      barOfPractice: barOfPractice?.trim() || "",
      city:          city.trim(),
      province:      province.trim(),
      country:       (country || "Pakistan").trim(),
      tokens:        500000,
      createdAt:     new Date().toISOString(),
      lastLogin:     null,
    };

    await writeUsers([...users, newUser]);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ message: "Account created!", user: safeUser });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: `Signup failed: ${err.message}` });
  }
}
