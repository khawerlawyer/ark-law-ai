// pages/api/auth/login.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure Node.js — ZERO external dependencies.
// Reads users from data/users.json, verifies PBKDF2 password hash.
// ─────────────────────────────────────────────────────────────────────────────

import fs   from "fs";
import path from "path";
import crypto from "crypto";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// ── Verify password against stored PBKDF2 hash ───────────────────────────────
function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(":");
    const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return verify === hash;
  } catch {
    return false;
  }
}

// ── Read users from JSON file ─────────────────────────────────────────────────
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const users = readUsers();

    // ── Find user ─────────────────────────────────────────────────────────
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // ── Verify password ───────────────────────────────────────────────────
    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // ── Update lastLogin in file ──────────────────────────────────────────
    const updatedUsers = users.map(u =>
      u.email === normalizedEmail
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    );
    writeUsers(updatedUsers);

    // ── Return safe user (no passwordHash) ───────────────────────────────
    const { passwordHash: _removed, ...safeUser } = { ...user, lastLogin: new Date().toISOString() };
    return res.status(200).json({ message: "Login successful", user: safeUser });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}
