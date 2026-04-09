// ARK Law AI — Login handler using Clerk Backend API
// Verifies credentials against Clerk's permanent cloud user store

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Step 1 — Find user by email using Clerk Backend API
    const searchRes = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    const users = await searchRes.json();

    if (!searchRes.ok || !Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const clerkUser = users[0];

    // Step 2 — Verify password using Clerk's verify_password endpoint
    const verifyRes = await fetch(
      `https://api.clerk.com/v1/users/${clerkUser.id}/verify_password`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.verified) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Step 3 — Update lastLogin in metadata
    await fetch(`https://api.clerk.com/v1/users/${clerkUser.id}/metadata`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          ...clerkUser.public_metadata,
          lastLogin: new Date().toISOString(),
        },
      }),
    });

    // Step 4 — Return safe user object
    const meta = clerkUser.public_metadata || {};
    return res.status(200).json({
      success: true,
      user: {
        id: clerkUser.id,
        name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim(),
        email: clerkUser.email_addresses?.[0]?.email_address || email,
        profession: meta.profession || "",
        city: meta.city || "",
        tokens: meta.tokens ?? 500000,
        signupDate: meta.signupDate || "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
