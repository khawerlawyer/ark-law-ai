// pages/api/auth/signup.js
// Zero dependencies. Works on Vercel + local.
// Uses global in-memory store (survives requests) + optional file backup.

import fs   from "fs";
import path from "path";
import crypto from "crypto";

// In-memory store — persists across requests in the same Vercel instance
if (!global.arkUsers) global.arkUsers = [];

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function loadFromFile() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8").trim();
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveToFile(users) {
  try {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch {} // silently skip if filesystem is read-only (Vercel)
}

function getUsers() {
  // Merge file users into memory store on first load
  if (global.arkUsers.length === 0) {
    const fileUsers = loadFromFile();
    if (fileUsers.length > 0) global.arkUsers = fileUsers;
  }
  return global.arkUsers;
}

function saveUsers(users) {
  global.arkUsers = users;
  saveToFile(users); // best-effort file backup
}

export default function handler(req, res) {
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
    const users = getUsers();

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

    saveUsers([...users, newUser]);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ message: "Account created!", user: safeUser });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: `Signup failed: ${err.message}` });
  }
}
