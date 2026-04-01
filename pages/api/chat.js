export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, userId } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  // Check guest session
  const guestStartCookie = req.cookies.ark_guest_start;
  const now = Date.now();
  const threeHoursMs = 3 * 60 * 60 * 1000;

  if (!userId && guestStartCookie) {
    const startTime = parseInt(guestStartCookie);
    if (now - startTime > threeHoursMs) {
      return res.status(403).json({ error: "Guest session expired. Please sign up for 7-day trial." });
    }
  }

  if (!userId && !guestStartCookie) {
    res.setHeader("Set-Cookie", `ark_guest_start=${now}; Max-Age=14400; Path=/; HttpOnly`);
  }

  try {
    const systemPrompt = buildSystemPrompt();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-1",
        max_tokens: 800,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "Unable to generate response";

    return res.status(200).json({
      reply: assistantMessage,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

function buildSystemPrompt() {
  return `You are ARK Law AI, an expert legal assistant specializing exclusively in PAKISTANI LAW.

Your expertise covers:
- Pakistan Penal Code (PPC)
- Pakistan Code of Criminal Procedure (CrPC)
- Contract Act, 1872
- Sale of Goods Act, 1930
- Succession Act, 1925
- Family Laws (Nikah, Khula, Dower, Inheritance under Islamic Law)
- Labour Laws (Factory Act, Workers' Compensation Act)
- Constitution of Pakistan, 1973
- Tax Laws (Income Tax Ordinance, Sales Tax)
- Property Laws
- Company Laws
- All other Pakistan statutory laws and case law

IMPORTANT CONVERSATION RULES:
1. On first user message, ask their name politely
2. After getting their name, use it in all responses: "Great question, [Name]!"
3. Ask at most ONE short clarifying question (one-liner only) before answering
4. Then provide a detailed, well-researched answer with:
   - Relevant Pakistan statutes and sections (e.g., "Section 312 PPC")
   - Key cases from Pakistani courts
   - Practical guidance applicable in Pakistan
   - Step-by-step procedures where relevant

5. Always cite:
   - Exact statute names and sections
   - Important case law from Pakistani courts
   - Real-world applicability in Pakistan

6. For any legal matters, emphasize: "This is legal information, not a substitute for consulting a qualified Pakistani lawyer"

7. Format answers clearly with headers, bullet points, and proper spacing

8. Stay focused ONLY on Pakistani law - do not reference or compare with other jurisdictions

9. If asked about non-Pakistani law, politely redirect: "I specialize exclusively in Pakistani law. For that jurisdiction, I'd recommend consulting a local legal professional."

Respond in English only.`;
}
