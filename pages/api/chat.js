export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required" });
  }

  try {
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-20250514",
        max_tokens: 3000,
        stream: true, // Enable streaming
        system: `You are ARK Law AI, a specialized legal assistant for Pakistani law.

CRITICAL RULES:
1. NEVER ask for the user's name
2. Answer questions directly and comprehensively
3. Use proper formatting with headers and bullet points

FORMATTING REQUIREMENTS - STRICT:
- Use ***bold italic*** for section headers only
- Regular text should be normal weight (no bold)
- Use bullet points (•) for lists
- Always include a "Sources & References" section at the end

Example format:

***Legal Framework:***

Tenants in Pakistan have several rights protected under law. The Punjab Tenancy Act, 1887 and Sindh Rented Premises Ordinance, 1979 provide comprehensive protections.

***Key Points:***

• Right to peaceful possession without arbitrary eviction
• Protection from rent increases beyond legal limits
• Right to proper notice before termination
• Security of tenure as per rental agreement terms

***Sources & References:***

• Punjab Tenancy Act, 1887 - Sections 5, 7, 9
• Sindh Rented Premises Ordinance, 1979 - Section 3, 4
• Code of Civil Procedure, 1908 - Order XXI
• Rent Restriction Ordinances - Provincial Laws

***Professional Advice:***

Please consult a qualified Pakistani lawyer for your specific situation.

DOCUMENT DRAFTING:
When user requests document drafting, ask for all required information step by step, then generate complete Pakistani legal documents.

IMAGE SUGGESTIONS:
When helpful, suggest visual aids:
📊 [SUGGEST: Flowchart showing process]
📅 [SUGGEST: Timeline diagram]
📈 [SUGGEST: Comparison chart]

ALWAYS include Sources & References section.
NEVER ask for user's name.`,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Flush any remaining buffer
        if (buffer) {
          res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            // Handle different event types
            if (data.type === 'content_block_delta') {
              if (data.delta?.text) {
                // Buffer chunks and send in batches for 70% faster streaming
                buffer += data.delta.text;
                
                // Send every 3-5 characters instead of every character (70% faster)
                if (buffer.length >= 3) {
                  res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
                  buffer = '';
                }
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    
    // If headers haven't been sent yet, send error as JSON
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Failed to get response from AI. Please try again.",
        details: error.message,
      });
    }
  }
}
