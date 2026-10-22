// lib/ai-monitor.js - records each ARK LAW AI answer in Langfuse (AI monitoring).
//
// Off until LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY are set in Vercel.
// By default it records ONLY: country, chat vs legal tool, model, tokens, response
// time, citation-check result and errors. It does NOT record users' questions or
// ARK's answers unless LANGFUSE_LOG_CONTENT is set to "true".
import crypto from "crypto";

const HOST = () => (process.env.LANGFUSE_HOST || process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com").trim().replace(/\/+$/, "");
const PK = () => (process.env.LANGFUSE_PUBLIC_KEY || "").trim();
const SK = () => (process.env.LANGFUSE_SECRET_KEY || "").trim();
const ENABLED = () => Boolean(PK() && SK());
const LOG_CONTENT = () => (process.env.LANGFUSE_LOG_CONTENT || "").trim().toLowerCase() === "true";

const COUNTRY_BY_PATH = { usa: "United States", pakistan: "Pakistan", india: "India", bangladesh: "Bangladesh" };

export function countryFromReferer(referer) {
  try {
    const seg = new URL(referer).pathname.split("/").filter(Boolean)[0] || "";
    return COUNTRY_BY_PATH[seg.toLowerCase()] || "Other";
  } catch { return "Unknown"; }
}

// Names which ARK feature made the request, from the opening words only.
// The text itself is not stored.
const FEATURES = [
  [/^Summarize this judgment/i, "Judgment Summary"],
  [/^Redline this contract/i, "Contract Redlining"],
  [/^Assess compliance/i, "Compliance Check"],
  [/^Provide clause library/i, "Clause Library"],
  [/^Analyze this .*legal news/i, "News Analysis"],
  [/^You are an expert .*legal document drafter/i, "Document Drafting"],
  [/^Compare these two documents/i, "Document Comparison"],
];

export function featureOf(message) {
  if (!message) return "Chat";
  let text = message.content;
  if (Array.isArray(text)) {
    const t = text.find((b) => b && b.type === "text");
    if (text.some((b) => b && b.type === "document") && !t) return "Document Chat";
    text = t ? t.text : "";
  }
  text = String(text || "").replace(/^\[System:[\s\S]*?\]\s*/, "").trim();
  for (const [re, name] of FEATURES) if (re.test(text)) return name;
  return "Chat";
}

export function startTrace({ name, country, kind, model }) {
  const t = {
    id: crypto.randomUUID(),
    genId: crypto.randomUUID(),
    name, country, kind, model,
    start: new Date(),
    firstToken: null,
    usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    stopReason: null,
    citationCheck: "not run",
    input: null,
    output: null,
  };
  return t;
}

// Feed every Anthropic stream event here; it picks out token counts and timing.
export function onStreamEvent(t, evt) {
  if (!t || !evt) return;
  if (evt.type === "message_start" && evt.message && evt.message.usage) {
    const u = evt.message.usage;
    t.usage.input = u.input_tokens || 0;
    t.usage.cacheRead = u.cache_read_input_tokens || 0;
    t.usage.cacheWrite = u.cache_creation_input_tokens || 0;
  }
  if (evt.type === "content_block_delta" && !t.firstToken) t.firstToken = new Date();
  if (evt.type === "message_delta") {
    if (evt.usage && evt.usage.output_tokens != null) t.usage.output = evt.usage.output_tokens;
    if (evt.delta && evt.delta.stop_reason) t.stopReason = evt.delta.stop_reason;
  }
}

// Only used when LANGFUSE_LOG_CONTENT=true. Uploaded documents are never sent, only a
// placeholder, and ARK's own [System: ...] instructions are left out.
export function setContent(t, input, output) {
  if (!t || !LOG_CONTENT()) return;
  let text = input;
  if (Array.isArray(input)) {
    text = input.map((b) => (b && b.type === "text" ? b.text : "[" + ((b && b.type) || "attachment") + " not recorded]")).join("\n");
  }
  text = String(text || "").replace(/^\[System:[\s\S]*?\]\s*/, "");
  t.input = text.slice(0, 20000);
  t.output = String(output || "").slice(0, 40000);
}

// Sends the record. Never throws, and gives up after 2 seconds so users are never kept waiting.
export async function finishTrace(t, { error } = {}) {
  if (!t || !ENABLED()) return;
  const end = new Date();
  const level = error ? "ERROR" : t.stopReason === "max_tokens" ? "WARNING" : "DEFAULT";
  const metadata = {
    country: t.country,
    kind: t.kind,
    stopReason: t.stopReason,
    citationCheck: t.citationCheck,
    responseMs: end - t.start,
    firstTokenMs: t.firstToken ? t.firstToken - t.start : null,
    cacheReadTokens: t.usage.cacheRead,
    cacheWriteTokens: t.usage.cacheWrite,
    environment: process.env.VERCEL_ENV || "development",
  };
  const ts = end.toISOString();
  const batch = [
    {
      id: crypto.randomUUID(), timestamp: ts, type: "trace-create",
      body: {
        id: t.id, name: t.name, timestamp: t.start.toISOString(),
        tags: [t.country, t.kind].filter(Boolean),
        metadata,
        ...(t.input != null ? { input: t.input } : {}),
        ...(t.output != null ? { output: t.output } : {}),
      },
    },
    {
      id: crypto.randomUUID(), timestamp: ts, type: "generation-create",
      body: {
        id: t.genId, traceId: t.id, name: "claude", model: t.model,
        startTime: t.start.toISOString(), endTime: ts,
        ...(t.firstToken ? { completionStartTime: t.firstToken.toISOString() } : {}),
        usageDetails: { input: t.usage.input, output: t.usage.output, cache_read_input_tokens: t.usage.cacheRead, cache_creation_input_tokens: t.usage.cacheWrite },
        level,
        ...(error ? { statusMessage: String(error).slice(0, 500) } : {}),
        metadata,
        ...(t.input != null ? { input: t.input } : {}),
        ...(t.output != null ? { output: t.output } : {}),
      },
    },
  ];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
  try {
    const r = await fetch(HOST() + "/api/public/ingestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(PK() + ":" + SK()).toString("base64"),
      },
      body: JSON.stringify({ batch }),
      signal: ctrl.signal,
    });
    if (!r.ok && r.status !== 207) console.warn("AI monitor: Langfuse returned", r.status);
  } catch (e) {
    console.warn("AI monitor: could not reach Langfuse");
  } finally {
    clearTimeout(timer);
  }
}
