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

function ArkLogo({ size }) {
  var s = size || 44;
  return (
    <svg width={s} height={s} viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="sc2">
          <path d="M100 8 L175 32 L175 105 C175 158 140 188 100 205 C60 188 25 158 25 105 L25 32 Z" />
        </clipPath>
      </defs>
      <path d="M100 8 L175 32 L175 105 C175 158 140 188 100 205 C60 188 25 158 25 105 L25 32 Z" fill="#0D1B2A" />
      <rect x="25" y="8" width="75" height="200" fill="#01411C" clipPath="url(#sc2)" />
      <rect x="100" y="8" width="75" height="200" fill="#B22234" clipPath="url(#sc2)" />
      <rect x="100" y="32" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="52" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="72" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="92" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="112" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="8" width="38" height="48" fill="#3C3B6E" clipPath="url(#sc2)" />
      <circle cx="108" cy="20" r="2.5" fill="white" />
      <circle cx="120" cy="20" r="2.5" fill="white" />
      <circle cx="132" cy="20" r="2.5" fill="white" />
      <circle cx="108" cy="34" r="2.5" fill="white" />
      <circle cx="120" cy="34" r="2.5" fill="white" />
      <circle cx="132" cy="34" r="2.5" fill="white" />
      <circle cx="62" cy="108" r="22" fill="none" stroke="white" strokeWidth="2" clipPath="url(#sc2)" />
      <circle cx="70" cy="108" r="16" fill="#01411C" clipPath="url(#sc2)" />
      <polygon points="78,95 80,103 89,103 82,108 85,117 78,112 71,117 74,108 67,103 76,103" fill="white" clipPath="url(#sc2)" />
      <line x1="100" y1="9" x2="100" y2="203" stroke="#C9A84C" strokeWidth="1.2" opacity="0.9" />
      <g transform="translate(100,118)">
        <line x1="-32" y1="0" x2="32" y2="0" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="-22" x2="0" y2="12" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="-25" r="3" fill="#C9A84C" />
        <line x1="-32" y1="0" x2="-27" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-32" y1="0" x2="-37" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-39" y1="14" x2="-25" y2="14" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="0" x2="27" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="32" y1="0" x2="37" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="25" y1="14" x2="39" y2="14" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <path d="M100 8 L175 32 L175 105 C175 158 140 188 100 205 C60 188 25 158 25 105 L25 32 Z" fill="none" stroke="#C9A84C" strokeWidth="2" />
      <text x="100" y="218" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" fill="#C9A84C" letterSpacing="4">ARK</text>
    </svg>
  );
}

var AREAS_EN = [
  { id: "general", label: "General Legal", icon: "⚖️" },
  { id: "criminal", label: "Criminal Law", icon: "🔒" },
  { id: "corporate", label: "Corporate & Business", icon: "🏢" },
  { id: "family", label: "Family & Matrimonial", icon: "👨‍👩‍👧" },
  { id: "property", label: "Property & Real Estate", icon: "🏠" },
  { id: "labour", label: "Labour & Employment", icon: "👷" },
  { id: "constitutional", label: "Constitutional Law", icon: "📜" },
  { id: "ip", label: "IP & Technology", icon: "💡" },
  { id: "immigration", label: "Immigration", icon: "✈️" },
];

var AREAS_UR = [
  { id: "general", label: "عمومی قانون", icon: "⚖️" },
  { id: "criminal", label: "فوجداری قانون", icon: "🔒" },
  { id: "corporate", label: "کارپوریٹ و کاروبار", icon: "🏢" },
  { id: "family", label: "خاندانی قانون", icon: "👨‍👩‍👧" },
  { id: "property", label: "جائیداد و رئیل اسٹیٹ", icon: "🏠" },
  { id: "labour", label: "محنت و روزگار", icon: "👷" },
  { id: "constitutional", label: "آئینی قانون", icon: "📜" },
  { id: "ip", label: "دانشورانہ ملکیت", icon: "💡" },
  { id: "immigration", label: "امیگریشن", icon: "✈️" },
];

var QUICK_EN = [
  "Criminal procedure differences: Pakistan vs USA?",
  "Bail laws: Pakistan CrPC vs US federal law?",
  "Divorce grounds: Pakistan vs USA?",
  "Draft an NDA clause valid in both Pakistan and USA.",
  "IP registration: IPO-Pakistan vs USPTO?",
  "Rights of accused: Article 10-A vs US 5th and 6th Amendments?",
];

var QUICK_UR = [
  "پاکستان اور امریکہ میں فوجداری طریقہ کار کا فرق؟",
  "پاکستانی ضابطہ فوجداری اور امریکی وفاقی ضمانت قوانین؟",
  "پاکستانی اور امریکی خاندانی قانون میں طلاق کی بنیادیں؟",
  "پاکستان اور امریکہ دونوں میں NDA شق تیار کریں۔",
  "IPO پاکستان بمقابلہ USPTO رجسٹریشن؟",
  "آرٹیکل 10-A بمقابلہ 5th اور 6th ترمیم — ملزم کے حقوق؟",
];

var AREA_LABELS_EN = {
  general: "general legal matters",
  criminal: "criminal law and criminal procedure",
  corporate: "corporate, business, and commercial law",
  family: "family law, matrimonial law, and succession",
  property: "property law, real estate, and land acquisition",
  labour: "labour law and employment law",
  constitutional: "constitutional law and fundamental rights",
  ip: "intellectual property and technology law",
  immigration: "immigration and nationality law",
};

var AREA_LABELS_UR = {
  general: "عمومی قانونی معاملات",
  criminal: "فوجداری قانون اور طریقہ کار",
  corporate: "کارپوریٹ، کاروبار اور تجارتی قانون",
  family: "خاندانی قانون، ازدواجی قانون اور جانشینی",
  property: "جائیداد کا قانون، رئیل اسٹیٹ اور زمین کا حصول",
  labour: "محنت کا قانون اور روزگار کا قانون",
  constitutional: "آئینی قانون اور بنیادی حقوق",
  ip: "دانشورانہ ملکیت اور ٹیکنالوجی کا قانون",
  immigration: "امیگریشن اور شہریت کا قانون",
};

function buildSystem(area, jur, lang) {
  var areaLabel = lang === "ur" ? AREA_LABELS_UR[area] : AREA_LABELS_EN[area];
  var jurMap = {
    pk: "You are answering ONLY under Pakistani law. Cite Pakistani legislation (PPC, CrPC, CPC, MFLO 1961, Companies Act 2017, Constitution 1973) and court precedents.",
    us: "You are answering ONLY under US law. Cite federal legislation, FRCP, FRCRP, UCC, US Constitution and court precedents.",
    both: "You are answering under BOTH Pakistani and US law with clear sections for each jurisdiction and comparative analysis.",
  };
  var langText = lang === "ur" ? "IMPORTANT: Respond entirely in Urdu. Use formal legal Urdu terminology." : "Respond in English.";
  return "You are ARK Law AI, a warm and professional AI legal assistant specializing in " + areaLabel + ". " + jurMap[jur] + "\n\n" + langText + "\n\nCONVERSATION RULES:\n1. FIRST MESSAGE: On the very first user message, greet warmly and ask their name before anything else.\n2. PERSONALIZATION: Once you know the name, address the user by name in every reply.\n3. NO LONG ANSWERS: Never give a long answer immediately. Ask ONE short follow-up question to find exactly what is needed.\n4. ONE QUESTION ONLY: Never ask more than one question at a time. Keep follow-up questions to one line.\n5. FOCUSED ANSWERS: Only give a detailed answer once you understand the specific need. Cite specific statutes and case law.\n6. WARM TONE: Be warm and natural like a knowledgeable legal advisor.\n7. DISCLAIMER: End every detailed answer with: This is for research only and not a substitute for legal counsel.";
}

function fmt(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong style=\"color:#C9A84C\">$1</strong>")
    .replace(/^#{1,3} (.+)$/gm, "<div style=\"color:#C9A84C;font-weight:600;margin:10px 0 5px\">$1</div>")
    .replace(/^- (.+)$/gm, "<div style=\"display:flex;gap:8px;margin:3px 0\"><span style=\"color:#C9A84C\">&#8226;</span><span>$1</span></div>")
    .replace(/\n\n/g, "<br/>")
    .replace(/\n/g, "<br/>");
}

export default function App() {
  var langState = useState("en");
  var lang = langState[0]; var setLang = langState[1];
  var jurState = useState("both");
  var jur = jurState[0]; var setJur = jurState[1];
  var areaState = useState("general");
  var area = areaState[0]; var setArea = areaState[1];
  var msgState = useState([]);
  var messages = msgState[0]; var setMessages = msgState[1];
  var inputState = useState("");
  var input = inputState[0]; var setInput = inputState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var sidebarState = useState(false);
  var sidebarOpen = sidebarState[0]; var setSidebarOpen = sidebarState[1];
  var greetedState = useState(false);
  var greeted = greetedState[0]; var setGreeted = greetedState[1];
  var messagesEnd = useRef(null);
  var history = useRef([]);

  var isUrdu = lang === "ur";
  var areas = isUrdu ? AREAS_UR : AREAS_EN;
  var quick = isUrdu ? QUICK_UR : QUICK_EN;

  var jurConfig = {
    pk: { color: ACCENT_PK, bg: "rgba(62,180,137,0.08)", banner: isUrdu ? "پاکستانی قانون کے تحت جواب" : "Answering under Pakistani law" },
    us: { color: ACCENT_US, bg: "rgba(91,141,217,0.08)", banner: isUrdu ? "امریکی قانون کے تحت جواب" : "Answering under US law" },
    both: { color: GOLD, bg: "rgba(201,168,76,0.08)", banner: isUrdu ? "پاکستانی اور امریکی دونوں قوانین کے تحت جواب" : "Answering under both Pakistani and US law" },
  };

  useEffect(function() {
    if (messagesEnd.current) messagesEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(function() {
    if (!greeted) {
      setGreeted(true);
      var greeting = "Welcome to ARK Law AI! Before we begin, may I know your name?";
      history.current = [{ role: "assistant", content: greeting }];
      setMessages([{ type: "ai", text: greeting, jur: "both" }]);
    }
  }, []);

  function send(text) {
    var msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    history.current = history.current.concat([{ role: "user", content: msg }]);
    setMessages(function(prev) { return prev.concat([{ type: "user", text: msg }]); });
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: buildSystem(area, jur, lang), messages: history.current }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) throw new Error(data.error);
        history.current = history.current.concat([{ role: "assistant", content: data.reply }]);
        setMessages(function(prev) { return prev.concat([{ type: "ai", text: data.reply, jur: jur }]); });
      })
      .catch(function(err) {
        history.current = history.current.slice(0, -1);
        setMessages(function(prev) { return prev.concat([{ type: "error", text: "Error: " + err.message }]); });
      })
      .finally(function() { setLoading(false); });
  }

  return (
    <>
      <style>{[
        "* { box-sizing: border-box; margin: 0; padding: 0; }",
        "body { background: #0D1B2A; }",
        "@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }",
        "::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#2B3F57;border-radius:3px}",
        "input::placeholder { color: #6E8099; }",
        ".qbtn:hover { border-color: #C9A84C !important; color: #C9A84C !important; }",
        ".abtn:hover { background: #1E2D40 !important; color: #C9A84C !important; }",
      ].join(" ")}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: isUrdu ? "serif" : "'Segoe UI', sans-serif", direction: isUrdu ? "rtl" : "ltr" }}>

        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem", height: 58, borderBottom: "1px solid " + NAVY_BORDER, background: NAVY_MID, flexShrink: 0, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={function() { setSidebarOpen(function(v) { return !v; }); }} style={{ background: "transparent", border: "none", color: GOLD, fontSize: 20, cursor: "pointer", padding: "4px 6px" }}>☰</button>
            <ArkLogo size={42} />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: GOLD }}>{isUrdu ? "اے آر کے لاء اے آئی" : "ARK Law AI"}</div>
              <div style={{ fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: ".1em" }}>{isUrdu ? "قانونی ذہانت کا پلیٹ فارم" : "Legal Intelligence Platform"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 2, background: NAVY, border: "1px solid " + NAVY_BORDER, borderRadius: 30, padding: 3 }}>
              {["en", "ur"].map(function(l) {
                return (
                  <button key={l} onClick={function() { setLang(l); }} style={{ border: "none", borderRadius: 30, padding: "3px 10px", fontSize: 11, cursor: "pointer", background: lang === l ? "rgba(201,168,76,0.2)" : "transparent", color: lang === l ? GOLD : TEXT_MUTED, fontFamily: "inherit", fontWeight: 500 }}>
                    {l === "en" ? "EN" : "اردو"}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 2, background: NAVY, border: "1px solid " + NAVY_BORDER, borderRadius: 30, padding: 3 }}>
              {[["pk", "🇵🇰 PK"], ["both", "⚖ Both"], ["us", "🇺🇸 US"]].map(function(item) {
                var j = item[0]; var lbl = item[1];
                return (
                  <button key={j} onClick={function() { setJur(j); }} style={{ border: "none", borderRadius: 30, padding: "3px 10px", fontSize: 11, cursor: "pointer", background: jur === j ? (j === "pk" ? "rgba(62,180,137,0.15)" : j === "us" ? "rgba(91,141,217,0.15)" : "rgba(201,168,76,0.15)") : "transparent", color: jur === j ? jurConfig[j].color : TEXT_MUTED, fontFamily: "inherit", fontWeight: 500 }}>
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
          {sidebarOpen && <div onClick={function() { setSidebarOpen(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10 }} />}

          <aside style={{ position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 20, width: 230, background: NAVY_MID, borderRight: "1px solid " + NAVY_BORDER, display: "flex", flexDirection: "column", overflowY: "auto", transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .25s" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: ".1em", textTransform: "uppercase", margin: "14px 12px 6px" }}>{isUrdu ? "پریکٹس ایریاز" : "PRACTICE AREAS"}</div>
            {areas.map(function(a) {
              return (
                <button key={a.id} className="abtn" onClick={function() { setArea(a.id); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: "none", textAlign: "left", background: area === a.id ? NAVY_SURFACE : "transparent", color: area === a.id ? GOLD : TEXT_SECONDARY, fontFamily: "inherit", fontSize: 13, padding: "7px 10px", borderRadius: 7, cursor: "pointer", fontWeight: area === a.id ? 600 : 400 }}>
                  <span>{a.icon}</span>{a.label}
                </button>
              );
            })}
            <div style={{ height: 1, background: NAVY_BORDER, margin: "8px 10px" }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: ".1em", textTransform: "uppercase", margin: "6px 12px" }}>{isUrdu ? "فوری سوالات" : "QUICK QUERIES"}</div>
            {quick.map(function(q, i) {
              return (
                <button key={i} className="qbtn" onClick={function() { send(q); setSidebarOpen(false); }} style={{ display: "block", width: "calc(100% - 16px)", margin: "0 8px 4px", background: "transparent", border: "1px solid " + NAVY_BORDER, color: TEXT_MUTED, fontFamily: "inherit", fontSize: 11, padding: "6px 8px", borderRadius: 7, cursor: "pointer", textAlign: "left", lineHeight: 1.6 }}>{
