// pages/api/auth/login.js
// Zero dependencies. Reads from global store + file backup.

import fs   from "fs";
import path from "path";
import crypto from "crypto";

if (!global.arkUsers) global.arkUsers = [];

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(":");
    const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return verify === hash;
  } catch { return false; }
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
  } catch {}
}

function getUsers() {
  if (global.arkUsers.length === 0) {
    const fileUsers = loadFromFile();
    if (fileUsers.length > 0) global.arkUsers = fileUsers;
  }
  return global.arkUsers;
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const users = getUsers();
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    if (!verifyPassword(password, user.passwordHash))
      return res.status(401).json({ error: "Invalid email or password." });

    // Update lastLogin
    const updated = users.map(u =>
      u.email === normalizedEmail ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    global.arkUsers = updated;
    saveToFile(updated);

    const { passwordHash: _, ...safeUser } = { ...user, lastLogin: new Date().toISOString() };
    return res.status(200).json({ message: "Login successful", user: safeUser });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: `Login failed: ${err.message}` });
  }
}
