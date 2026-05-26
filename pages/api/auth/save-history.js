// pages/api/auth/save-history.js
// Encrypts chat history before saving to Supabase

import crypto from "crypto";

const ALGO      = "aes-256-gcm";
const ENC_KEY   = process.env.CHAT_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_KEY?.substring(0, 32).padEnd(32, "0");

function encrypt(text) {
  if (!ENC_KEY) return text; // fallback: no encryption if key missing
  const key = Buffer.from(ENC_KEY.substring(0, 32).padEnd(32, "0"), "utf8");
  const iv  = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let encrypted = cipher.update(typeof text === "string" ? text : JSON.stringify(text), "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  // Format: iv:tag:data — all hex
  return `enc:${iv.toString("hex")}:${tag}:${encrypted}`;
}

function decrypt(text) {
  if (!text || !text.startsWith("enc:")) return text; // not encrypted
  if (!ENC_KEY) return text;
  try {
    const key  = Buffer.from(ENC_KEY.substring(0, 32).padEnd(32, "0"), "utf8");
    const parts = text.split(":");
    // enc : iv(32 hex chars) : tag(32 hex chars) : data
    const iv        = Buffer.from(parts[1], "hex");
    const tag       = Buffer.from(parts[2], "hex");
    const encrypted = parts.slice(3).join(":"); // rejoin in case data had colons
    const decipher  = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.error("Decrypt error:", e.message);
    return text; // return as-is if decryption fails
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, tokens, chatHistory } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: "Supabase not configured" });

  try {
    const updateData = {};
    if (tokens !== undefined)      updateData.tokens = tokens;
    if (chatHistory !== undefined) {
      const raw = typeof chatHistory === "string" ? chatHistory : JSON.stringify(chatHistory);
      // Encrypt before saving
      updateData.chat_history = encrypt(raw);
    }
    if (Object.keys(updateData).length === 0) return res.status(200).json({ ok: true });

    const r = await fetch(
      `${supabaseUrl}/rest/v1/ark_users?id=eq.${userId}`,
      {
        method: "PATCH",
        headers: {
          apikey:          supabaseKey,
          Authorization:   `Bearer ${supabaseKey}`,
          "Content-Type":  "application/json",
          Prefer:          "return=minimal",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!r.ok) {
      const text = await r.text();
      console.error("Supabase save-history error:", text);
      return res.status(500).json({ error: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("save-history error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Export decrypt for use in login.js to decrypt on load
export { decrypt };
