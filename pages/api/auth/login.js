// pages/api/auth/login.js
// ─────────────────────────────────────────────────────────────────────────────
// Reads users from the same GitHub Gist as signup.js.
// Verifies PBKDF2 password, updates lastLogin, returns safe user object.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "crypto";

const GIST_TOKEN = process.env.GIST_TOKEN;
const GIST_ID    = process.env.GIST_ID;

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
  await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${GIST_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: { "users.json": { content: JSON.stringify(users, null, 2) } },
    }),
  });
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(":");
    const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return verify === hash;
  } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!GIST_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: "Server not configured. Please contact the administrator." });
  }

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const users = await readUsers();
    const user = users.find(u => u.email === normalizedEmail);

    // Same generic message for missing user or wrong password (security best practice)
    if (!user || !verifyPassword(password, user.passwordHash))
      return res.status(401).json({ error: "Invalid email or password." });

    // Update lastLogin in Gist
    const updated = users.map(u =>
      u.email === normalizedEmail ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    await writeUsers(updated);

    const { passwordHash: _, ...safeUser } = { ...user, lastLogin: new Date().toISOString() };
    return res.status(200).json({ message: "Login successful", user: safeUser });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: `Login failed: ${err.message}` });
  }
}
