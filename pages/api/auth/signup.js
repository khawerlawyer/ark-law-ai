// ARK Law AI — Signup handler using Clerk backend API
// Clerk stores users permanently in the cloud — works across all Vercel instances

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, password, profession, city } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    // Create user via Clerk Backend API
    const response = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || "",
        email_address: [email],
        password: password,
        // Store extra fields in public metadata
        public_metadata: {
          profession: profession || "",
          city: city || "",
          signupDate: new Date().toISOString(),
          tokens: 500000,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clerk returns errors array
      const msg = data.errors?.[0]?.long_message || data.errors?.[0]?.message || "Signup failed";
      return res.status(400).json({ error: msg });
    }

    // Return safe user object (no password)
    return res.status(200).json({
      success: true,
      user: {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email_addresses?.[0]?.email_address || email,
        profession: profession || "",
        city: city || "",
        tokens: 500000,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
