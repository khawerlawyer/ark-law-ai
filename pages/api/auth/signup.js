// pages/api/auth/signup.js
// Works in ALL environments:
// - Local dev: saves to data/users.json
// - Vercel (no env vars): saves to /tmp/users.json (writable, shared in same region)
// - Vercel (with GIST_TOKEN + GIST_ID): saves to GitHub Gist (permanent)

import crypto from "crypto";
import fs from "fs";
import path from "path";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function getFilePath() {
  // /tmp is writable on Vercel; use data/users.json locally
  try {
    const localPath = path.join(process.cwd(), "data", "users.json");
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    return localPath;
  } catch {
    return "/tmp/ark_users.json";
  }
}

function readUsersFromFile() {
  try {
    const file = getFilePath();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf8").trim();
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  // Also check /tmp as fallback
  try {
    if (fs.existsSync("/tmp/ark_users.json")) {
      const raw = fs.readFileSync("/tmp/ark_users.json", "utf8").trim();
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function writeUsersToFile(users) {
  const json = JSON.stringify(users, null, 2);
  // Try project data dir first
  try {
    const localPath = path.join(process.cwd(), "data", "users.json");
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, json, "utf8");
  } catch {}
  // Always also write to /tmp (works on Vercel)
  try {
    fs.writeFileSync("/tmp/ark_users.json", json, "utf8");
  } catch {}
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
    writeUsersToFile(users); // local backup too
  } else {
    writeUsersToFile(users);
  }
}

// ─── Password hashing (built-in crypto, no npm) ───────────────────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, name, age, profession, barOfPractice, city, province, country } = req.body;

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
