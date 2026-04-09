// ARK Law AI — Forgot Password handler using Clerk Backend API
// Sends a password reset email to the registered user's email address

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email address is required" });

  try {
    // Step 1: Find user by email in Clerk
    const searchRes = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
      {
        headers: { "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}` },
      }
    );

    const users = await searchRes.json();

    // Always return success even if email not found — prevents email enumeration attacks
    if (!searchRes.ok || !Array.isArray(users) || users.length === 0) {
      // Return success so attackers can't probe which emails are registered
      return res.status(200).json({ success: true });
    }

    const clerkUser = users[0];

    // Step 2: Trigger password reset email via Clerk
    const resetRes = await fetch(
      `https://api.clerk.com/v1/users/${clerkUser.id}/send_reset_password_email`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resetRes.ok) {
      const errData = await resetRes.json().catch(() => ({}));
      console.error("Clerk reset email error:", errData);
      return res.status(500).json({ error: "Failed to send reset email. Please try again." });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
