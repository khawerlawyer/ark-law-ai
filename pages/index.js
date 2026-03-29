import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";

var GOLD = "#C9A84C";
var NAVY = "#0D1B2A";
var NAVY_MID = "#162032";
var NAVY_SURFACE = "#1E2D40";
var NAVY_BORDER = "#2B3F57";
var TEXT_PRIMARY = "#FAF6EE";
var TEXT_SECONDARY = "#B8C4D0";
var TEXT_MUTED = "#6E8099";
var ACCENT_PK = "#3EB489";
var ACCENT_US = "#5B8DD9";

var CONDUCT = [
  { text: "Maintain absolute honesty and integrity in all court dealings.", pk: true },
  { text: "Preserve client confidentiality at all times without exception.", pk: true },
  { text: "Disclose any conflicts of interest promptly to the client.", pk: true },
  { text: "Charge only fair and reasonable fees for services rendered.", pk: true },
  { text: "Never mislead the court through false statements or omissions.", pk: true },
  { text: "Uphold the dignity and decorum of the legal profession always.", pk: true },
  { text: "Provide competent and diligent representation to every client.", pk: true },
  { text: "Respect opposing counsel and maintain courteous conduct.", pk: true },
  { text: "Withdraw from representation if instructed to act dishonestly.", pk: true },
  { text: "Comply fully with Pakistan Bar Council rules and regulations.", pk: true },
  { text: "Never accept a case without adequate competence or preparation.", pk: true },
  { text: "Protect client funds in trust and maintain separate accounts.", pk: true },
  { text: "Advocate zealously for clients within the bounds of the law.", pk: false },
  { text: "Maintain candor toward the tribunal — never make false statements.", pk: false },
  { text: "Preserve client confidentiality under ABA Model Rules.", pk: false },
  { text: "Avoid conflicts of interest between current and former clients.", pk: false },
  { text: "Communicate promptly and keep clients reasonably informed.", pk: false },
  { text: "Charge reasonable fees and explain billing arrangements clearly.", pk: false },
  { text: "Provide competent representation with relevant legal knowledge.", pk: false },
  { text: "Never obstruct opposing party access to evidence.", pk: false },
  { text: "Maintain independence of professional judgment at all times.", pk: false },
  { text: "Comply with state bar rules and continuing legal education.", pk: false },
  { text: "Safeguard client property and funds held in trust accounts.", pk: false },
  { text: "Respect rights of third persons and avoid harassment or threats.", pk: false },
];

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

var DEFAULT_NEWS = [
  { text: "Pakistan Supreme Court issues landmark ruling on digital privacy rights", pk: true },
  { text: "US Supreme Court reviews AI liability in landmark tech case", pk: false },
  { text: "Lahore High Court strengthens tenants rights in property disputes", pk: true },
  { text: "US Congress passes new cybersecurity legislation for financial sector", pk: false },
  { text: "Pakistan enacts amendments to Companies Act improving corporate governance", pk: true },
  { text: "Federal court upholds new US immigration processing reforms", pk: false },
  { text: "Pakistan Federal Shariat Court reviews family law inheritance provisions", pk: true },
  { text: "US Department of Justice announces major antitrust enforcement action", pk: false },
  { text: "Islamabad High Court rules on constitutional right to information", pk: true },
  { text: "US Senate passes bipartisan criminal justice reform legislation", pk: false },
  { text: "Pakistan Labour Court strengthens worker protections in tech sector", pk: true },
  { text: "Supreme Court of US decides major intellectual property case", pk: false },
  { text: "Pakistan Securities Commission issues new fintech regulatory framework", pk: true },
  { text: "US courts expand protections for whistleblowers in corporate cases", pk: false },
  { text: "Pakistan bar councils push for legal aid expansion nationwide", pk: true },
  { text: "New US federal rules on AI-generated evidence in court proceedings", pk: false },
];

function buildSystem(area, jur, lang) {
  var areaLabel = lang === "ur" ? AREA_LABELS_UR[area] : AREA_LABELS_EN[area];
  var jurMap = {
    pk: "You are answering ONLY under Pakistani law. Cite Pakistani legislation (PPC, CrPC, CPC, MFLO 1961, Companies Act 2017, Constitution 1973) and court precedents.",
    us: "You are answering ONLY under US law. Cite federal legislation, FRCP, FRCRP, UCC, US Constitution and court precedents.",
    both: "You are answering under BOTH Pakistani and US law with clear sections for each jurisdiction and comparative analysis.",
  };
  var langText = lang === "ur" ? "IMPORTANT: Respond entirely in Urdu. Use formal legal Urdu terminology." : "Respond in English.";
  return "You are ARK Law AI, a warm and professional AI legal assistant specializing in " + areaLabel + ". " + jurMap[jur] + "\n\n" + langText + "\n\nCONVERSATION RULES:\n1. FIRST MESSAGE: On the very first user message, greet warmly and ask their name before anything else.\n2. PERSONALIZATION: Once you know the name, address the user by name in every reply.\n3. ONE CLARIFYING QUESTION: Ask a maximum of ONE clarifying question per topic, then give a full detailed answer. Never ask more than one clarifying question before answering.\n4. FOCUSED ANSWERS: After at most one clarifying question, give a complete, helpful answer. Cite specific statutes and case law.\n5. WARM TONE: Be warm and natural like a knowledgeable legal advisor.\n6. DISCLAIMER: End every detailed answer with: This is for research only and not a substitute for legal counsel.";
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

function ArkLogo(props) {
  var s = props.size || 44;
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

export default function App() {
  var langS = useState("en"); var lang = langS[0]; var setLang = langS[1];
  var jurS = useState("both"); var jur = jurS[0]; var setJur = jurS[1];
  var areaS = useState("general"); var area = areaS[0]; var setArea = areaS[1];
  var msgS = useState([]); var messages = msgS[0]; var setMessages = msgS[1];
  var inpS = useState(""); var input = inpS[0]; var setInput = inpS[1];
  var loadS = useState(false); var loading = loadS[0]; var setLoading = loadS[1];
  var greetS = useState(false); var greeted = greetS[0]; var setGreeted = greetS[1];
  var newsS = useState(DEFAULT_NEWS.concat(DEFAULT_NEWS)); var newsItems = newsS[0]; var setNewsItems = newsS[1];
  var messagesEnd = useRef(null);
  var history = useRef([]);
  var timerS = useState(180); var guestMinsLeft = timerS[0]; var setGuestMinsLeft = timerS[1];

  var isUrdu = lang === "ur";
  var areas = isUrdu ? AREAS_UR : AREAS_EN;
  var quick = isUrdu ? QUICK_UR : QUICK_EN;
  var conductDouble = CONDUCT.concat(CONDUCT);
  var userInfo = useUser();
  var clerk = useClerk();
  var router = useRouter();
  var user = userInfo.user;
  var trialDaysLeft = 7;
  if (user && user.createdAt) {
    var msPerDay = 1000 * 60 * 60 * 24;
    var daysSince = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / msPerDay);
    trialDaysLeft = Math.max(0, 7 - daysSince);
  }

  var jurConfig = {
    pk: { color: ACCENT_PK, bg: "rgba(62,180,137,0.08)", banner: isUrdu ? "پاکستانی قانون کے تحت جواب" : "Answering under Pakistani law" },
    us: { color: ACCENT_US, bg: "rgba(91,141,217,0.08)", banner: isUrdu ? "امریکی قانون کے تحت جواب" : "Answering under US law" },
    both: { color: GOLD, bg: "rgba(201,168,76,0.08)", banner: isUrdu ? "پاکستانی اور امریکی دونوں قوانین کے تحت جواب" : "Answering under both Pakistani and US law" },
  };

  // Guest countdown timer
  useEffect(function() {
    if (user) return;
    var cookieMatch = document.cookie.match(/ark_guest_start=(\d+)/);
    var start = cookieMatch ? parseInt(cookieMatch[1]) : Date.now();
    if (!cookieMatch) {
      document.cookie = "ark_guest_start=" + start + "; path=/; max-age=3600";
    }
    var interval = setInterval(function() {
      var mins = Math.max(0, 180 - Math.floor((Date.now() - start) / 60000));
      setGuestMinsLeft(mins);
    }, 10000);
    return function() { clearInterval(interval); };
  }, [user]);

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
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: "You are a legal news aggregator. Return ONLY a JSON array of 16 legal news headlines, 8 from Pakistan and 8 from the USA. Each item: {\"text\":\"headline max 80 chars\",\"pk\":true or false}. No other text, just the JSON array.",
        messages: [{ role: "user", content: "Give me 16 current legal news headlines as JSON array." }],
      }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        try {
          var clean = data.reply.replace(/```json/g, "").replace(/```/g, "").trim();
          var items = JSON.parse(clean);
          if (Array.isArray(items) && items.length > 0) setNewsItems(items.concat(items));
        } catch(e) {}
      })
      .catch(function() {});
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
    <div>
      <Head>
        <title>ARK LAW AI — The Legal Intelligence Engine by Attorney & AI Innovator Khawer Rabbani</title>
        <meta name="description" content="ARK LAW AI — The Legal Intelligence Engine for Pakistani and US law by Attorney and AI Innovator Khawer Rabbani." />
        <meta property="og:title" content="ARK LAW AI — The Legal Intelligence Engine by Attorney & AI Innovator Khawer Rabbani" />
        <meta property="og:description" content="AI-powered legal research for Pakistani and US law." />
      </Head>

      <style>{[
        "* { box-sizing: border-box; margin: 0; padding: 0; }",
        "html, body { height: 100%; background: #0D1B2A; }",
        "#__next { height: 100%; }",
        "@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }",
        "@keyframes tickerScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }",
        "::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#2B3F57;border-radius:3px}",
        "input::placeholder { color: #6E8099; }",
        ".qbtn:hover { border-color: #C9A84C !important; color: #C9A84C !important; }",
        ".abtn:hover { background: #1E2D40 !important; color: #C9A84C !important; }",
        "#news-ticker { animation: tickerScroll 80s linear infinite; }",
        "#news-ticker:hover { animation-play-state: paused; }",
        "#conduct-ticker { animation: tickerScroll 70s linear infinite; }",
        "#conduct-ticker:hover { animation-play-state: paused; }",
      ].join(" ")}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: isUrdu ? "serif" : "'Segoe UI', sans-serif", direction: isUrdu ? "rtl" : "ltr" }}>

        {/* HEADER */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem", height: 58, borderBottom: "1px solid " + NAVY_BORDER, background: NAVY_MID, flexShrink: 0, gap: 8 }}>

          {/* LEFT: Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ArkLogo size={42} />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: GOLD }}>ARK LAW AI</div>
              <div style={{ fontSize: 9, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: ".05em" }}>The Legal Intelligence Engine</div>
              <div style={{ fontSize: 9, color: ACCENT_PK }}>by Attorney & AI Innovator Khawer Rabbani</div>
            </div>
          </div>

          {/* CENTRE: Auth buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!user && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: guestMinsLeft > 10 ? "rgba(62,180,137,0.1)" : "rgba(224,85,85,0.1)", border: "1px solid " + (guestMinsLeft > 10 ? ACCENT_PK : "#E05555"), borderRadius: 20, padding: "4px 12px", fontSize: 11, color: guestMinsLeft > 10 ? ACCENT_PK : "#E05555", fontWeight: 600 }}>
                  {"⏱ " + guestMinsLeft + " min free"}
                </div>
                <button onClick={function() { window.location.href = "/sign-up"; }} style={{ background: "linear-gradient(135deg,#C9A84C,#a07830)", border: "none", borderRadius: 20, padding: "6px 14px", color: NAVY, fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  ⭐ FREE TRIAL
                </button>
                <button onClick={function() { window.location.href = "/sign-in"; }} style={{ background: "transparent", border: "1px solid " + NAVY_BORDER, borderRadius: 20, padding: "6px 14px", color: TEXT_SECONDARY, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>
                  🔑 Login
                </button>
              </div>
            )}
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: trialDaysLeft > 0 ? "rgba(62,180,137,0.15)" : "rgba(224,85,85,0.15)", border: "1px solid " + (trialDaysLeft > 0 ? ACCENT_PK : "#E05555"), borderRadius: 20, padding: "4px 12px", fontSize: 11, color: trialDaysLeft > 0 ? ACCENT_PK : "#E05555", fontWeight: 600 }}>
                  {trialDaysLeft > 0 ? "⭐ Trial: " + trialDaysLeft + " days left" : "⚠️ Trial expired"}
                </div>
                <div style={{ background: NAVY_SURFACE, border: "1px solid " + NAVY_BORDER, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: TEXT_SECONDARY }}>
                  {"👤 " + (user.firstName || user.emailAddresses[0].emailAddress.split("@")[0])}
                </div>
                <button onClick={function() { clerk.signOut(); }} style={{ background: "transparent", border: "1px solid " + NAVY_BORDER, borderRadius: 20, padding: "5px 12px", color: TEXT_MUTED, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Language + Jurisdiction */}
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

        {/* BODY */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* LEFT BAR — Code of Conduct */}
          <div style={{ width: 270, flexShrink: 0, borderRight: "1px solid " + NAVY_BORDER, background: NAVY_MID, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 8px 8px", borderBottom: "1px solid " + NAVY_BORDER, flexShrink: 0, background: NAVY }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", border: "2px solid " + ACCENT_PK, overflow: "hidden", margin: "0 auto 4px" }}>
                  <img src="/jinnah.jpeg" alt="Muhammad Ali Jinnah" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
                <div style={{ fontSize: 9, color: ACCENT_PK, fontWeight: 600 }}>QUAID-E-AZAM</div>
                <div style={{ fontSize: 8, color: TEXT_MUTED }}>M. A. Jinnah</div>
              </div>
              <div style={{ fontSize: 14, color: GOLD, fontWeight: 700 }}>⚖</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", border: "2px solid " + ACCENT_US, overflow: "hidden", margin: "0 auto 4px" }}>
                  <img src="/washington.jpeg" alt="George Washington" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
                <div style={{ fontSize: 9, color: ACCENT_US, fontWeight: 600 }}>FOUNDING FATHER</div>
                <div style={{ fontSize: 8, color: TEXT_MUTED }}>G. Washington</div>
              </div>
            </div>
            <div style={{ padding: "6px 10px", borderBottom: "1px solid " + NAVY_BORDER, flexShrink: 0, textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: ".1em", textTransform: "uppercase" }}>Attorney Code of Conduct</div>
            </div>
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <div id="conduct-ticker" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                {conductDouble.map(function(item, i) {
                  return (
                    <div key={i} style={{ padding: "7px 12px", borderBottom: "1px solid rgba(43,63,87,0.5)", display: "flex", gap: 7, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>{item.pk ? "🇵🇰" : "🇺🇸"}</span>
                      <span style={{ fontSize: 11, color: TEXT_SECONDARY, lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CHAT — centre */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, borderBottom: "1px solid " + NAVY_BORDER, flexShrink: 0, background: jurConfig[jur].bg, color: jurConfig[jur].color, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: jurConfig[jur].color, flexShrink: 0 }} />
              {jurConfig[jur].banner}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map(function(msg, i) {
                var isUser = msg.type === "user";
                var isError = msg.type === "error";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 8, maxWidth: 760, marginLeft: isUser ? "auto" : 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isUser ? NAVY_SURFACE : "linear-gradient(135deg,#C9A84C,#8A6A1F)", border: isUser ? "1px solid " + NAVY_BORDER : "none", color: isUser ? TEXT_SECONDARY : NAVY, fontSize: isUser ? 13 : 9, fontWeight: 700, fontFamily: "Georgia,serif" }}>
                      {isUser ? "👤" : "ARK"}
                    </div>
                    <div style={{ padding: "10px 14px", borderRadius: isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: isUser ? "rgba(91,141,217,0.1)" : isError ? "rgba(224,85,85,0.1)" : NAVY_SURFACE, border: "1px solid " + (isUser ? "rgba(91,141,217,0.2)" : isError ? "rgba(224,85,85,0.3)" : NAVY_BORDER), fontSize: 13, lineHeight: 1.8, color: TEXT_PRIMARY, maxWidth: 640 }}
                      dangerouslySetInnerHTML={{ __html: isUser ? msg.text.replace(/&/g, "&amp;").replace(/</g, "&lt;") : fmt(msg.text) }}
                    />
                  </div>
                );
              })}
              {loading && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#8A6A1F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", flexShrink: 0 }}>ARK</div>
                  <div style={{ padding: "10px 14px", borderRadius: "4px 12px 12px 12px", background: NAVY_SURFACE, border: "1px solid " + NAVY_BORDER, display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map(function(d, i) {
                      return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, animation: "bounce 1.2s " + d + "s infinite ease-in-out" }} />;
                    })}
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
            <div style={{ padding: "10px 12px 12px", borderTop: "1px solid " + NAVY_BORDER, background: NAVY_MID, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: NAVY_SURFACE, border: "1px solid " + GOLD, borderRadius: 10, padding: "6px 10px" }}>
                <input
                  value={input}
                  onChange={function(e) { setInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter") { e.preventDefault(); send(); } }}
                  placeholder={isUrdu ? "پاکستانی یا امریکی قانون کے بارے میں سوال کریں..." : "Ask about Pakistani or US law..."}
                  dir={isUrdu ? "rtl" : "ltr"}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT_PRIMARY, fontFamily: "inherit", fontSize: 13, height: 34 }}
                />
                <button onClick={function() { send(); }} style={{ background: GOLD, border: "none", borderRadius: 8, padding: "6px 18px", color: NAVY, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", height: 34, flexShrink: 0 }}>
                  {isUrdu ? "بھیجیں" : "SEND"}
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: 5, fontSize: 10, color: TEXT_MUTED }}>
                {isUrdu ? "⚠️ صرف تحقیق و حوالہ کے لیے — قانونی مشورے کا متبادل نہیں" : "⚠️ For research & reference only — not a substitute for legal counsel"}
                &nbsp;|&nbsp;
                <span style={{ color: GOLD, opacity: 0.7 }}>{isUrdu ? "اے آر کے لاء اے آئی — جسٹس ایس اے ربانی لاء" : "ARK Law AI — Justice S. A. Rabbani Law"}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ width: 270, flexShrink: 0, borderLeft: "1px solid " + NAVY_BORDER, display: "flex", flexDirection: "row", overflow: "hidden" }}>
            <div style={{ flex: 1, background: NAVY_MID, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: ".1em", textTransform: "uppercase", margin: "14px 12px 6px" }}>{isUrdu ? "پریکٹس ایریاز" : "PRACTICE AREAS"}</div>
              {areas.map(function(a) {
                return (
                  <button key={a.id} className="abtn" onClick={function() { setArea(a.id); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: "none", textAlign: "left", background: area === a.id ? NAVY_SURFACE : "transparent", color: area === a.id ? GOLD : TEXT_SECONDARY, fontFamily: "inherit", fontSize: 13, padding: "7px 10px", borderRadius: 7, cursor: "pointer", fontWeight: area === a.id ? 600 : 400 }}>
                    <span>{a.icon}</span>{a.label}
                  </button>
                );
              })}
              <div style={{ height: 1, background: NAVY_BORDER, margin: "8px 10px" }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: ".1em", textTransform: "uppercase", margin: "6px 12px" }}>{isUrdu ? "فوری سوالات" : "QUICK QUERIES"}</div>
              {quick.map(function(q, i) {
                return (
                  <button key={i} className="qbtn" onClick={function() { send(q); }} style={{ display: "block", width: "calc(100% - 16px)", margin: "0 8px 4px", background: "transparent", border: "1px solid " + NAVY_BORDER, color: TEXT_MUTED, fontFamily: "inherit", fontSize: 11, padding: "6px 8px", borderRadius: 7, cursor: "pointer", textAlign: "left", lineHeight: 1.6 }}>{q}</button>
                );
              })}
            </div>
            <div style={{ width: 40, flexShrink: 0, background: NAVY, borderLeft: "1px solid " + NAVY_BORDER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: GOLD, letterSpacing: ".1em", textTransform: "uppercase", padding: "8px 2px", textAlign: "center", borderBottom: "1px solid " + NAVY_BORDER, flexShrink: 0, writingMode: "vertical-rl" }}>LEGAL NEWS</div>
              <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <div id="news-ticker" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                  {newsItems.map(function(item, i) {
                    return (
                      <div key={i} onClick={function() { send("Tell me more about this legal news: " + item.text); }} title={item.text} style={{ padding: "10px 4px", borderBottom: "1px solid " + NAVY_BORDER, writingMode: "vertical-rl", textOrientation: "mixed", fontSize: 10, color: item.pk ? ACCENT_PK : ACCENT_US, lineHeight: 1.4, cursor: "pointer", userSelect: "none" }}>
                        {(item.pk ? "🇵🇰 " : "🇺🇸 ") + (item.text.length > 55 ? item.text.slice(0, 55) + "..." : item.text)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
