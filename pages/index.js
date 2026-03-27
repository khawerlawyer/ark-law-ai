import { useState, useRef, useEffect } from "react";

const GOLD = "#C9A84C";
const NAVY = "#0D1B2A";
const NAVY_MID = "#162032";
const NAVY_SURFACE = "#1E2D40";
const NAVY_BORDER = "#2B3F57";
const TEXT_PRIMARY = "#FAF6EE";
const TEXT_SECONDARY = "#B8C4D0";
const TEXT_MUTED = "#6E8099";
const ACCENT_PK = "#3EB489";
const ACCENT_US = "#5B8DD9";

const CONTENT = {
  en: {
    title: "ARK Law AI",
    subtitle: "Legal Intelligence Platform",
    disclaimer: "For research & reference only — not a substitute for legal counsel",
    footer: "ARK Law AI — Justice S. A. Rabbani Law",
    placeholder: "Ask about Pakistani or US law — statutes, procedures, case law, drafting...",
    send: "SEND",
    thinking: "ARK is thinking...",
    welcome_title: "Welcome to ARK Law AI",
    welcome_desc: "AI-powered legal research for Pakistani and US law.",
    welcome_hint: "Tap ☰ for practice areas & quick queries",
    areas_label: "PRACTICE AREAS",
    quick_label: "QUICK QUERIES",
    statutes_label: "KEY STATUTES",
    banners: {
      pk: "Answering under Pakistani law",
      us: "Answering under US law",
      both: "Answering under both Pakistani and US law",
    },
    jur: { pk: "🇵🇰 PK", both: "⚖ Both", us: "🇺🇸 US" },
    jurLabels: { pk: "🇵🇰 Pakistan Law", us: "🇺🇸 US Law", both: "🇵🇰🇺🇸 Both" },
    areas: [
      { id: "general", label: "General Legal", icon: "⚖️" },
      { id: "criminal", label: "Criminal Law", icon: "🔒" },
      { id: "corporate", label: "Corporate & Business", icon: "🏢" },
      { id: "family", label: "Family & Matrimonial", icon: "👨‍👩‍👧" },
      { id: "property", label: "Property & Real Estate", icon: "🏠" },
      { id: "labour", label: "Labour & Employment", icon: "👷" },
      { id: "constitutional", label: "Constitutional Law", icon: "📜" },
      { id: "ip", label: "IP & Technology", icon: "💡" },
      { id: "immigration", label: "Immigration", icon: "✈️" },
    ],
    quick: [
      "Criminal procedure differences: Pakistan vs USA?",
      "Bail laws: Pakistan CrPC vs US federal law?",
      "Divorce grounds: Pakistan vs USA?",
      "Draft an NDA clause valid in both Pakistan and USA.",
      "IP registration: IPO-Pakistan vs USPTO?",
      "Rights of accused: Article 10-A vs US 5th & 6th Amendments?",
    ],
    areaLabels: {
      general: "general legal matters",
      criminal: "criminal law and criminal procedure",
      corporate: "corporate, business, and commercial law",
      family: "family law, matrimonial law, and succession",
      property: "property law, real estate, and land acquisition",
      labour: "labour law and employment law",
      constitutional: "constitutional law and fundamental rights",
      ip: "intellectual property and technology law",
      immigration: "immigration and nationality law",
    },
  },
  ur: {
    title: "اے آر کے لاء اے آئی",
    subtitle: "قانونی ذہانت کا پلیٹ فارم",
    disclaimer: "صرف تحقیق و حوالہ کے لیے — قانونی مشورے کا متبادل نہیں",
    footer: "اے آر کے لاء اے آئی — جسٹس ایس اے ربانی لاء",
    placeholder: "پاکستانی یا امریکی قانون کے بارے میں سوال کریں...",
    send: "بھیجیں",
    thinking: "جواب تیار ہو رہا ہے...",
    welcome_title: "اے آر کے لاء اے آئی میں خوش آمدید",
    welcome_desc: "پاکستانی اور امریکی قانون کی اے آئی تحقیق۔",
    welcome_hint: "پریکٹس ایریا کے لیے ☰ دبائیں",
    areas_label: "پریکٹس ایریاز",
    quick_label: "فوری سوالات",
    statutes_label: "اہم قوانین",
    banners: {
      pk: "پاکستانی قانون کے تحت جواب",
      us: "امریکی قانون کے تحت جواب",
      both: "پاکستانی اور امریکی دونوں قوانین کے تحت جواب",
    },
    jur: { pk: "🇵🇰 پاکستان", both: "⚖ دونوں", us: "🇺🇸 امریکہ" },
    jurLabels: { pk: "🇵🇰 پاکستانی قانون", us: "🇺🇸 امریکی قانون", both: "🇵🇰🇺🇸 دونوں" },
    areas: [
      { id: "general", label: "عمومی قانون", icon: "⚖️" },
      { id: "criminal", label: "فوجداری قانون", icon: "🔒" },
      { id: "corporate", label: "کارپوریٹ و کاروبار", icon: "🏢" },
      { id: "family", label: "خاندانی قانون", icon: "👨‍👩‍👧" },
      { id: "property", label: "جائیداد و رئیل اسٹیٹ", icon: "🏠" },
      { id: "labour", label: "محنت و روزگار", icon: "👷" },
      { id: "constitutional", label: "آئینی قانون", icon: "📜" },
      { id: "ip", label: "دانشورانہ ملکیت", icon: "💡" },
      { id: "immigration", label: "امیگریشن", icon: "✈️" },
    ],
    quick: [
      "پاکستان اور امریکہ میں فوجداری طریقہ کار کا فرق؟",
      "پاکستانی ضابطہ فوجداری اور امریکی وفاقی ضمانت قوانین؟",
      "پاکستانی اور امریکی خاندانی قانون میں طلاق کی بنیادیں؟",
      "پاکستان اور امریکہ دونوں میں NDA شق تیار کریں۔",
      "IPO پاکستان بمقابلہ USPTO رجسٹریشن؟",
      "آرٹیکل 10-A بمقابلہ 5th اور 6th ترمیم — ملزم کے حقوق؟",
    ],
    areaLabels: {
      general: "عمومی قانونی معاملات",
      criminal: "فوجداری قانون اور طریقہ کار",
      corporate: "کارپوریٹ، کاروبار اور تجارتی قانون",
      family: "خاندانی قانون، ازدواجی قانون اور جانشینی",
      property: "جائیداد کا قانون، رئیل اسٹیٹ اور زمین کا حصول",
      labour: "محنت کا قانون اور روزگار کا قانون",
      constitutional: "آئینی قانون اور بنیادی حقوق",
      ip: "دانشورانہ ملکیت اور ٹیکنالوجی کا قانون",
      immigration: "امیگریشن اور شہریت کا قانون",
    },
  },
};

function buildSystemPrompt(practiceArea, jurisdiction, lang, areaLabels) {
  const jurInstructions = {
    pk: `You are answering ONLY under Pakistani law. Cite relevant Pakistani legislation (Pakistan Penal Code, CrPC, CPC, Muslim Family Laws Ordinance 1961, Companies Act 2017, Constitution of Pakistan 1973), Supreme Court of Pakistan and High Court precedents.`,
    us: `You are answering ONLY under US law. Cite relevant federal and state legislation, FRCP, FRCRP, UCC, US Constitution, US Supreme Court and Circuit Court precedents.`,
    both: `You are answering under BOTH Pakistani and US law. Structure your response with clear sections for each jurisdiction. Provide comparative analysis.`,
  };
  const langInstruction = lang === "ur"
    ? "IMPORTANT: Respond entirely in Urdu (اردو). Use formal legal Urdu terminology."
    : "Respond in English.";
  return `You are ARK Law AI, an expert AI legal assistant specializing in ${areaLabels[practiceArea]}. ${jurInstructions[jurisdiction]}\n\n${langInstruction}\n\nGuidelines:\n- Be precise, citing specific statutes, sections, and case law\n- Use clear headings when comparing jurisdictions\n- Flag areas where law may have recently changed\n- End with a brief disclaimer that this is for research purposes only\n- Maintain a formal but accessible tone`;
}

function formatMessage(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${GOLD}">$1</strong>`)
    .replace(/^#{1,3} (.+)$/gm, `<div style="color:${GOLD};font-weight:600;margin:10px 0 5px">$1</div>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:8px;margin:3px 0"><span style="color:${GOLD}">•</span><span>$1</span></div>`)
    .replace(/\n\n/g, "<br/>").replace(/\n/g, "<br/>");
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [jurisdiction, setJurisdiction] = useState("both");
  const [practiceArea, setPracticeArea] = useState("general");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const historyRef = useRef([]);
  const c = CONTENT[lang];
  const isUrdu = lang === "ur";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const jurConfig = {
    pk: { color: ACCENT_PK, bg: "rgba(62,180,137,0.08)" },
    us: { color: ACCENT_US, bg: "rgba(91,141,217,0.08)" },
    both: { color: GOLD, bg: "rgba(201,168,76,0.08)" },
  };

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    historyRef.current = [...historyRef.current, userMsg];
    setMessages(prev => [...prev, { type: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: buildSystemPrompt(practiceArea, jurisdiction, lang, c.areaLabels),
          messages: historyRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      const reply = data.reply;
      historyRef.current = [...historyRef.current, { role: "assistant", content: reply }];
      setMessages(prev => [...prev, { type: "ai", text: reply, jur: jurisdiction }]);
    } catch (err) {
      historyRef.current = historyRef.current.slice(0, -1);
      setMessages(prev => [...prev, { type: "error", text: `❌ ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  const rtl = isUrdu ? { direction: "rtl", textAlign: "right" } : {};

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${NAVY}; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:${NAVY_BORDER};border-radius:3px}
        input::placeholder, textarea::placeholder { color: ${TEXT_MUTED}; }
        .qbtn:hover { border-color: ${GOLD} !important; color: ${GOLD} !important; }
        .abtn:hover { background: ${NAVY_SURFACE} !important; color: ${GOLD} !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: isUrdu ? "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" : "'Segoe UI', sans-serif", ...rtl }}>

        {/* HEADER */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem", height: 58, borderBottom: `1px solid ${NAVY_BORDER}`, background: NAVY_MID, flexShrink: 0, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isUrdu ? "row-reverse" : "row" }}>
            <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "transparent", border: "none", color: GOLD, fontSize: 20, cursor: "pointer", padding: "4px 6px" }}>☰</button>
            <div style={{ textAlign: isUrdu ? "right" : "left" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: GOLD }}>{c.title}</div>
              <div style={{ fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: isUrdu ? 0 : ".1em" }}>{c.subtitle}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Language Toggle */}
            <div style={{ display: "flex", gap: 2, background: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: 30, padding: 3 }}>
              {["en", "ur"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ border: "none", borderRadius: 30, padding: "3px 10px", fontSize: 11, cursor: "pointer", background: lang === l ? "rgba(201,168,76,0.2)" : "transparent", color: lang === l ? GOLD : TEXT_MUTED, fontFamily: "inherit", fontWeight: 500 }}>
                  {l === "en" ? "EN" : "اردو"}
                </button>
              ))}
            </div>
            {/* Jurisdiction */}
            <div style={{ display: "flex", gap: 2, background: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: 30, padding: 3 }}>
              {["pk", "both", "us"].map(j => (
                <button key={j} onClick={() => setJurisdiction(j)} style={{
                  border: "none", borderRadius: 30, padding: "3px 10px", fontSize: 11, cursor: "pointer",
                  background: jurisdiction === j ? (j === "pk" ? "rgba(62,180,137,0.15)" : j === "us" ? "rgba(91,141,217,0.15)" : "rgba(201,168,76,0.15)") : "transparent",
                  color: jurisdiction === j ? jurConfig[j].color : TEXT_MUTED,
                  fontFamily: "inherit", fontWeight: 500
                }}>{c.jur[j]}</button>
              ))}
            </div>
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
          {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10 }} />}

          {/* SIDEBAR */}
          <aside style={{
            position: "absolute", top: 0, bottom: 0, zIndex: 20, width: 240,
            [isUrdu ? "right" : "left"]: 0,
            background: NAVY_MID, borderRight: isUrdu ? "none" : `1px solid ${NAVY_BORDER}`,
            borderLeft: isUrdu ? `1px solid ${NAVY_BORDER}` : "none",
            display: "flex", flexDirection: "column", overflowY: "auto",
            transform: sidebarOpen ? "translateX(0)" : isUrdu ? "translateX(100%)" : "translateX(-100%)",
            transition: "transform .25s"
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: ".1em", textTransform: "uppercase", margin: "14px 12px 6px", textAlign: isUrdu ? "right" : "left" }}>{c.areas_label}</div>
            {c.areas.map(a => (
              <button key={a.id} className="abtn" onClick={() => { setPracticeArea(a.id); setSidebarOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", border: "none", textAlign: isUrdu ? "right" : "left",
                flexDirection: isUrdu ? "row-reverse" : "row",
                background: practiceArea === a.id ? NAVY_SURFACE : "transparent",
                color: practiceArea === a.id ? GOLD : TEXT_SECONDARY,
                fontFamily: "inherit", fontSize: isUrdu ? 14 : 13, padding: "7px 10px", borderRadius: 7, cursor: "pointer",
              }}>
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
            <div style={{ height: 1, background: NAVY_BORDER, margin: "8px 10px" }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: ".1em", textTransform: "uppercase", margin: "6px 12px", textAlign: isUrdu ? "right" : "left" }}>{c.quick_label}</div>
            {c.quick.map((q, i) => (
              <button key={i} className="qbtn" onClick={() => { sendMessage(q); setSidebarOpen(false); }} style={{
                display: "block", width: "calc(100% - 16px)", margin: "0 8px 4px",
                background: "transparent", border: `1px solid ${NAVY_BORDER}`,
                color: TEXT_MUTED, fontFamily: "inherit",
                fontSize: isUrdu ? 13 : 11, padding: "6px 8px", borderRadius: 7,
                cursor: "pointer", textAlign: isUrdu ? "right" : "left", lineHeight: 1.6
              }}>{q}</button>
            ))}
          </aside>

          {/* CHAT */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, borderBottom: `1px solid ${NAVY_BORDER}`, flexShrink: 0, background: jurConfig[jurisdiction].bg, color: jurConfig[jurisdiction].color, display: "flex", alignItems: "center", gap: 8, flexDirection: isUrdu ? "row-reverse" : "row" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: jurConfig[jurisdiction].color, flexShrink: 0 }} />
              {c.banners[jurisdiction]}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 && (
                <div style={{ background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, borderRadius: 14, padding: "1.5rem", textAlign: "center", maxWidth: 480, margin: "1rem auto", width: "100%" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>⚖️</div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 8 }}>{c.welcome_title}</div>
                  <div style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.7 }}>{c.welcome_desc}</div>
                  <div style={{ marginTop: 12, fontSize: 11, color: TEXT_MUTED }}>{c.welcome_hint}</div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: msg.type === "user" ? "row-reverse" : "row", gap: 8, maxWidth: 760, marginLeft: msg.type === "user" ? "auto" : 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.type === "user" ? NAVY_SURFACE : `linear-gradient(135deg,${GOLD},#8A6A1F)`, border: msg.type === "user" ? `1px solid ${NAVY_BORDER}` : "none", color: msg.type === "user" ? TEXT_SECONDARY : NAVY, fontSize: msg.type === "user" ? 13 : 9, fontWeight: 700, fontFamily: "Georgia,serif" }}>
                    {msg.type === "user" ? "👤" : "ARK"}
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: msg.type === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: msg.type === "user" ? "rgba(91,141,217,0.1)" : msg.type === "error" ? "rgba(224,85,85,0.1)" : NAVY_SURFACE, border: `1px solid ${msg.type === "user" ? "rgba(91,141,217,0.2)" : msg.type === "error" ? "rgba(224,85,85,0.3)" : NAVY_BORDER}`, fontSize: 13, lineHeight: 1.8, color: TEXT_PRIMARY, maxWidth: 640, direction: isUrdu ? "rtl" : "ltr" }}
                    dangerouslySetInnerHTML={{ __html: msg.type === "user" ? msg.text.replace(/&/g, "&amp;").replace(/</g, "&lt;") : formatMessage(msg.text) }}
                  />
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},#8A6A1F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", flexShrink: 0 }}>ARK</div>
                  <div style={{ padding: "10px 14px", borderRadius: "4px 12px 12px 12px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, animation: `bounce 1.2s ${d}s infinite ease-in-out` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div style={{ padding: "10px 12px 12px", borderTop: `1px solid ${NAVY_BORDER}`, background: NAVY_MID, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: NAVY_SURFACE, border: `1px solid ${GOLD}`, borderRadius: 10, padding: "6px 10px", flexDirection: isUrdu ? "row-reverse" : "row" }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
                  placeholder={c.placeholder}
                  dir={isUrdu ? "rtl" : "ltr"}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT_PRIMARY, fontFamily: "inherit", fontSize: 13, height: 34, textAlign: isUrdu ? "right" : "left" }}
                />
                <button onClick={() => sendMessage()} style={{ background: GOLD, border: "none", borderRadius: 8, padding: "6px 18px", color: NAVY, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", height: 34, flexShrink: 0 }}>
                  {c.send}
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: 5, fontSize: 10, color: TEXT_MUTED }}>
                ⚠️ {c.disclaimer} &nbsp;|&nbsp; <span style={{ color: GOLD, opacity: 0.7 }}>{c.footer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
