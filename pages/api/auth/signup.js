// pages/api/auth/signup.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure Node.js — ZERO external dependencies.
// Passwords hashed with built-in crypto (PBKDF2).
// Users saved permanently to data/users.json in your project.
//
// SETUP (one time):
//   1. Create an empty file at:  data/users.json  with contents:  []
//   2. That's it — no npm install needed.
//
// NOTE: On Vercel, the filesystem is read-only in production.
// This works perfectly for local dev. For Vercel production, use the
// GitHub-based signup.js provided separately (same API, same format).
// ─────────────────────────────────────────────────────────────────────────────

import fs   from "fs";
import path from "path";
import crypto from "crypto";

// Path to the users JSON file — sits in your project root /data/ folder
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// ── Hash password using built-in crypto (PBKDF2 — secure, no npm needed) ────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// ── Read users from JSON file ─────────────────────────────────────────────────
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Auto-create the file if it doesn't exist
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
      fs.writeFileSync(USERS_FILE, "[]", "utf8");
    }
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ── Write users to JSON file ──────────────────────────────────────────────────
function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    email, password, name, age,
    profession, barOfPractice,
    city, province, country,
  } = req.body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!email || !password || !name || !age || !profession || !city || !province || !country) {
    return res.status(400).json({ error: "All required fields must be filled." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const users = readUsers();

    // ── Check duplicate ───────────────────────────────────────────────────
    if (users.find(u => u.email === normalizedEmail)) {
      return res.status(409).json({
        error: "An account with this email already exists. Please login.",
      });
    }

    // ── Hash password ─────────────────────────────────────────────────────
    const passwordHash = hashPassword(password);

    // ── Build user record ─────────────────────────────────────────────────
    const newUser = {
      id:            `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email:         normalizedEmail,
      passwordHash,                          // never returned to client
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

    // ── Save to file ──────────────────────────────────────────────────────
    writeUsers([...users, newUser]);

    // ── Return safe user (no passwordHash) ───────────────────────────────
    const { passwordHash: _removed, ...safeUser } = newUser;
    return res.status(201).json({
      message: "Account created! You have been awarded 500,000 FREE credits.",
      user: safeUser,
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed. Please try again." });
  }
}
