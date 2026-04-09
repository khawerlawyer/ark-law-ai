// pages/api/auth/login.js
// Works in ALL environments — mirrors storage strategy of signup.js

import crypto from "crypto";
import fs from "fs";
import path from "path";

function readUsersFromFile() {
  // Try both locations
  const paths = [
    path.join(process.cwd(), "data", "users.json"),
    "/tmp/ark_users.json",
  ];
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
    const localPath = path.join(process.cwd(), "data", "users.json");
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, json, "utf8");
  } catch {}
  try { fs.writeFileSync("/tmp/ark_users.json", json, "utf8"); } catch {}
}

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
    method: "PATCH",
    headers: { Authorization: `Bearer ${process.env.GIST_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ files: { "users.json": { content: JSON.stringify(users, null, 2) } } }),
  });
}

async function readUsers() {
  if (process.env.GIST_TOKEN && process.env.GIST_ID) return readUsersFromGist();
  return readUsersFromFile();
}

async function writeUsers(users) {
  if (process.env.GIST_TOKEN && process.env.GIST_ID) {
    await writeUsersToGist(users);
    writeUsersToFile(users);
  } else {
    writeUsersToFile(users);
  }
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

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const users = await readUsers();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordHash))
      return res.status(401).json({ error: "Invalid email or password." });

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
