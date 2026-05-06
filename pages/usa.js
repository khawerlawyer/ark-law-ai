import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const GOLD         = "#C9A84C";
const NAVY         = "#0D1B2A";
const NAVY_MID     = "#162032";
const NAVY_SURFACE = "#1E2D40";
const NAVY_BORDER  = "#2B3F57";
const ACCENT_PK    = "#3EB489";
const TEXT_PRIMARY = "#FAF6EE";
const TEXT_SECONDARY = "#B8C4D0";
const TEXT_MUTED   = "#6E8099";
const CREAM        = "#F5F1E8";
const POPUP_DARK   = "#0A1118";
const LIGHT_GREEN  = "#4CAF7D";
const LG_HOVER     = "#3D9B6A";


// ─── Live US News Widget ──────────────────────────────────────────────────────
function USNewsWidget() {
  const [headlines, setHeadlines] = useState([]);
  const [tickerPos, setTickerPos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const tickerRef = useRef(null);

  // Fallback headlines in case fetch fails
  const fallbackHeadlines = [
    { title: "Supreme Court hears landmark First Amendment case", source: "Reuters", url: "https://reuters.com" },
    { title: "Senate advances bipartisan judicial reform bill", source: "AP News", url: "https://apnews.com" },
    { title: "Federal court rules on immigration policy challenge", source: "NPR", url: "https://npr.org" },
    { title: "DOJ announces new white-collar crime enforcement unit", source: "Bloomberg Law", url: "https://bloomberg.com" },
    { title: "IRS updates tax filing guidelines for 2026", source: "Reuters", url: "https://reuters.com" },
    { title: "SCOTUS takes up Fourth Amendment digital privacy case", source: "AP News", url: "https://apnews.com" },
    { title: "New federal labor regulations take effect this week", source: "NPR", url: "https://npr.org" },
    { title: "Class action lawsuit filed against major tech firm", source: "Bloomberg Law", url: "https://bloomberg.com" },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Use RSS2JSON to fetch Reuters legal news (no API key needed)
        const rss = "https://feeds.reuters.com/reuters/topNews";
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=8`);
        const data = await res.json();
        if (data.status === "ok" && data.items?.length) {
          setHeadlines(data.items.map(item => ({
            title: item.title,
            source: "Reuters",
            url: item.link,
          })));
        } else {
          setHeadlines(fallbackHeadlines);
        }
      } catch {
        setHeadlines(fallbackHeadlines);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll ticker
  useEffect(() => {
    if (!headlines.length || expanded) return;
    const id = setInterval(() => {
      setTickerPos(prev => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(id);
  }, [headlines, expanded]);

  const NAVY_D = "#001F5B";
  const RED_US = "#BF0A30";

  return (
    <div style={{
      position: "absolute", top: "12px", right: "12px", zIndex: 10,
      width: "230px",
      background: "rgba(0,20,70,0.97)",
      border: `1px solid ${RED_US}80`,
      borderRadius: "10px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      overflow: "hidden",
      fontFamily: "Segoe UI, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", background: RED_US, cursor: "pointer",
      }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "white", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "white", letterSpacing: "1px" }}>LIVE</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.85)" }}>· US Legal News</span>
        </div>
        <span style={{ fontSize: 12, color: "white", lineHeight: 1 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Ticker / Expanded view */}
      {!expanded ? (
        /* ── Ticker mode ── */
        <div style={{ padding: "8px 10px", minHeight: "54px" }}>
          {loading ? (
            <div style={{ color: "#A8C0E8", fontSize: 10, fontStyle: "italic" }}>Loading headlines...</div>
          ) : headlines.length > 0 ? (
            <div>
              <div style={{
                fontSize: 11, color: "#E8F0FF", lineHeight: 1.45,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {headlines[tickerPos]?.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "5px" }}>
                <span style={{ fontSize: 9, color: RED_US, fontWeight: 700 }}>{headlines[tickerPos]?.source}</span>
                <a href={headlines[tickerPos]?.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 9, color: "#A8C0E8", textDecoration: "none" }}>Read ↗</a>
              </div>
              {/* Dot indicators */}
              <div style={{ display: "flex", gap: "3px", marginTop: "5px", justifyContent: "center" }}>
                {headlines.slice(0, 8).map((_, i) => (
                  <div key={i} onClick={() => setTickerPos(i)} style={{
                    width: "5px", height: "5px", borderRadius: "50%", cursor: "pointer",
                    background: i === tickerPos ? "white" : "rgba(255,255,255,0.3)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* ── Expanded list mode ── */
        <div style={{ maxHeight: "280px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "12px 10px", color: "#A8C0E8", fontSize: 10, fontStyle: "italic" }}>Loading...</div>
          ) : headlines.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", padding: "8px 10px", textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: i % 2 === 0 ? "rgba(0,30,80,0.5)" : "transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(191,10,48,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(0,30,80,0.5)" : "transparent"}
            >
              <div style={{ fontSize: 11, color: "#E8F0FF", lineHeight: 1.4, marginBottom: "3px" }}>{item.title}</div>
              <span style={{ fontSize: 9, color: RED_US, fontWeight: 700 }}>{item.source}</span>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "4px 10px", background: "rgba(0,10,40,0.9)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 8, color: "#6A8AAA", fontStyle: "italic" }}>Reuters · Updates every 5 min</span>
        <a href="https://reuters.com" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 8, color: RED_US, textDecoration: "none", fontWeight: 700 }}>reuters.com ↗</a>
      </div>
    </div>
  );
}

export default function AppUSA() {
  const router = useRouter();
  const [user,               setUser]               = useState(null);
  const [userTokens,         setUserTokens]         = useState(500000);
  const [showSignupPopup,    setShowSignupPopup]    = useState(false);
  const [showLoginPopup,     setShowLoginPopup]     = useState(false);
  const [showMyAccountPopup, setShowMyAccountPopup] = useState(false);
  const [showSuccessPopup,   setShowSuccessPopup]   = useState(false);
  const [showNewsPopup,      setShowNewsPopup]      = useState(false);
  const [showDraftPopup,     setShowDraftPopup]     = useState(false);
  const [showComparePopup,   setShowComparePopup]   = useState(false);
  const [showLinkedInPopup,  setShowLinkedInPopup]  = useState(false);
  const [showComingSoon,     setShowComingSoon]     = useState(false);
  const [showFeaturesPopup,  setShowFeaturesPopup]  = useState(false);
  const [showPracticeAreas,  setShowPracticeAreas]  = useState(false);
  const [isUrdu,             setIsUrdu]             = useState(false);

  const [newsItems,          setNewsItems]          = useState([]);
  const [selectedNews,       setSelectedNews]       = useState(null);
  const [newsAnalysis,       setNewsAnalysis]       = useState("");
  const [newsLoading,        setNewsLoading]        = useState(false);

  const [draftContent,       setDraftContent]       = useState("");
  const [draftTitle,         setDraftTitle]         = useState("");
  const [draftType,          setDraftType]          = useState("affidavit");
  const [draftStep,          setDraftStep]          = useState("type-selection");
  const [draftRequirements,  setDraftRequirements]  = useState({});
  const [draftGenerating,    setDraftGenerating]    = useState(false);

  const [doc1,               setDoc1]               = useState(null);
  const [doc2,               setDoc2]               = useState(null);
  const [compareFocus,       setCompareFocus]       = useState("");
  const [comparisonResult,   setComparisonResult]   = useState("");
  const [comparingDocs,      setComparingDocs]      = useState(false);

  const [isListening,        setIsListening]        = useState(false);
  const [isSpeaking,         setIsSpeaking]         = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(null);

  const [messages,           setMessages]           = useState([]);
  const [input,              setInput]              = useState("");
  const [loading,            setLoading]            = useState(false);
  const [reactions,          setReactions]          = useState({});
  const [uploadedFiles,      setUploadedFiles]      = useState([]);

  const [allSessions,        setAllSessions]        = useState([]);
  const [activeChatId,       setActiveChatId]       = useState(null);

  const [isMobile,           setIsMobile]           = useState(false);
  const [installPrompt,      setInstallPrompt]      = useState(null);
  const [showInstallBtn,     setShowInstallBtn]     = useState(false);
  const [nameAsked,          setNameAsked]          = useState(false);
  const [usTheme,            setUsTheme]            = useState("chatgpt"); // "chatgpt" | "classic"

  const currentDate = useRef(
    new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  );
  const messagesEndRef    = useRef(null);
  const lastSavedCountRef = useRef(0);

  const PRACTICE_AREAS_PK = [
    { id: "general",        label: "General Legal",          icon: "⚖️"  },
    { id: "criminal",       label: "Criminal Law",            icon: "🔒"  },
    { id: "corporate",      label: "Corporate & Business",    icon: "🏢"  },
    { id: "family",         label: "Family Law",              icon: "👨‍👩‍👧" },
    { id: "immigration",    label: "Immigration Law",         icon: "🗽"  },
    { id: "employment",     label: "Employment Law",          icon: "👷"  },
    { id: "taxation",       label: "Tax & IRS",               icon: "💰"  },
    { id: "constitution",   label: "Constitutional Law",      icon: "📜"  },
  ];

  const QUICK_QUERIES_PK = [
    "What are my rights as a tenant in the US?",
    "How do I file a police report in the US?",
    "What is the divorce procedure in the US?",
    "Explain inheritance laws in the US",
    "What are employment rights under US law?",
    "How to draft a will in the US?",
    "What is a power of attorney in the US?",
    "Explain contract law in the US",
  ];

  // Spanish translations (used when isUrdu === true, which means Spanish is active)
  const UR = {
    appTagline:      "Motor de Inteligencia Legal de EE.UU.",
    sessions:        "Tus Sesiones con ARK LAW",
    newBtn:          "+ Nueva",
    compareTitle:    "Comparar Documentos",
    compareSubtitle: "Sube 2 docs para comparar",
    draftTitle:      "Redactar Documentos",
    draftSubtitle:   "Contratos, declaraciones y más",
    areasLabel:      "Áreas de Práctica",
    placeholder:     "Pregúntale a ARK Law AI sobre leyes de EE.UU. o haz clic en el micrófono...",
    send:            "Enviar",
    login:           "Iniciar sesión",
    listening:       "Escuchando...",
    thinking:        "ARK está pensando...",
    myAccount:       "Mi Cuenta",
    newChat:         "Nueva sesión",
    quickQueries: [
      "¿Cuáles son mis derechos como inquilino en EE.UU.?",
      "¿Cómo presento una demanda en EE.UU.?",
      "¿Cuál es el proceso de divorcio en EE.UU.?",
      "Explica las leyes de herencia en EE.UU.",
      "¿Cuáles son mis derechos laborales en EE.UU.?",
      "¿Cómo redacto un testamento en EE.UU.?",
      "¿Qué es un poder notarial?",
      "Explica la ley de contratos en EE.UU.",
    ],
    practiceAreas: [
      "Derecho General", "Derecho Penal", "Corporativo y Negocios",
      "Derecho de Familia", "Inmigración", "Derecho Laboral", "Impuestos", "Derecho Constitucional",
    ],
  };

  const newsDatabase = [
    { headline: "🇺🇸 Supreme Court Rules on Fourth Amendment Digital Privacy", source: "United States Supreme Court", fullText: "The Supreme Court of the United States has issued a landmark ruling expanding Fourth Amendment protections to digital data stored in the cloud. The decision requires law enforcement to obtain a warrant before accessing stored digital communications and cloud-based files. The ruling has wide implications for federal and state investigations, tech companies, and individual privacy rights. Lower courts must now apply this standard retroactively to pending cases." },
    { headline: "🇺🇸 IRS Announces Major Changes to Tax Filing Rules", source: "Internal Revenue Service (IRS)", fullText: "The IRS has announced significant changes to federal tax filing requirements for individuals and businesses. Key updates include: (1) New thresholds for reporting gig economy income, (2) Expanded child tax credit eligibility, (3) Updated standard deduction amounts for all filing categories. Taxpayers are advised to consult a certified tax professional for compliance. The changes take effect for the upcoming tax year and apply to all federal filings." },
    { headline: "🇺🇸 Federal Court Clarifies Employment Discrimination Standards", source: "US Court of Appeals - Ninth Circuit", fullText: "A significant ruling from the Ninth Circuit Court of Appeals has clarified standards for proving employment discrimination under Title VII of the Civil Rights Act. The court held that circumstantial evidence, when taken in totality, can be sufficient to establish discriminatory intent. This ruling affects workplace discrimination claims across all federal jurisdictions and provides clearer guidance for plaintiffs and employers navigating Title VII claims." },
    { headline: "🇺🇸 DOL Issues New Overtime and Minimum Wage Guidelines", source: "US Department of Labor", fullText: "The Department of Labor has issued updated guidelines on overtime eligibility and minimum wage requirements under the Fair Labor Standards Act (FLSA). New provisions include: (1) Raised salary threshold for exempt employees, (2) Expanded coverage for remote workers, (3) Stricter enforcement mechanisms for wage theft violations. Employers must update their payroll policies within 90 days. Non-compliance may result in back-pay liability and civil penalties." },
    { headline: "🇺🇸 Real Estate: New Federal Rules on Landlord-Tenant Disputes", source: "Department of Housing and Urban Development (HUD)", fullText: "HUD has issued new federal guidelines governing landlord-tenant disputes, with emphasis on eviction protections and habitability standards. The rules clarify that tenants have enforceable rights to safe and sanitary housing, and that retaliatory evictions are prohibited under federal law. State and local housing courts are directed to apply these standards in pending eviction proceedings. Tenants may file complaints with HUD's Office of Fair Housing." },
    { headline: "🇺🇸 Immigration Court Backlogs Prompt Emergency Procedural Reforms", source: "Executive Office for Immigration Review (EOIR)", fullText: "The EOIR has announced emergency procedural reforms to address a record backlog of over 3 million pending immigration cases. Changes include: (1) Expanded use of video hearings, (2) Priority scheduling for asylum cases older than two years, (3) New guidelines for continuance requests. Immigration attorneys and advocates are encouraged to review the updated procedural manual. The reforms aim to reduce average case wait times from 5 years to under 3 years." },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    const handleInstallPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstallBtn(true); };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", () => { setShowInstallBtn(false); setInstallPrompt(null); });
    // Read theme preference set by admin panel
    try {
      const savedTheme = localStorage.getItem("arklaw_us_theme");
      if (savedTheme === "classic" || savedTheme === "chatgpt") setUsTheme(savedTheme);
    } catch {}
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("beforeinstallprompt", handleInstallPrompt); };
  }, []);

  useEffect(() => {
    const greeting = { role: "assistant", content: isUrdu ? "Bienvenido a ARK Law AI USA — Su asistente legal de confianza para las leyes federales y estatales de EE.UU.\n\n¿En qué puedo ayudarle hoy?" : "Welcome to ARK Law AI USA — Your trusted AI legal companion for US federal and state law.\n\nHow may I assist you today?" };
    try {
      const saved = JSON.parse(localStorage.getItem("arklaw_sessions_us") || "[]");
      if (saved.length > 0) {
        setAllSessions(saved);
        setActiveChatId(saved[0].id);
        setMessages(saved[0].messages);
        setNameAsked(true);
        return;
      }
    } catch {}
    const firstSession = { id: Date.now(), title: "New Chat", messages: [greeting] };
    setAllSessions([firstSession]);
    setActiveChatId(firstSession.id);
    setMessages([greeting]);
    setNameAsked(true);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("arklaw_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        if (userData.tokens !== undefined) setUserTokens(userData.tokens);
      } catch (e) { console.error("Failed to parse user data"); }
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (activeChatId === null) return;
    setAllSessions(prev => {
      const updated = prev.map(s => {
        if (s.id !== activeChatId) return s;
        const firstUser = messages.find(m => m.role === "user");
        const title = firstUser ? firstUser.content.substring(0, 40) + (firstUser.content.length > 40 ? "…" : "") : "New Chat";
        return { ...s, messages, title };
      });
      try { localStorage.setItem("arklaw_sessions_us", JSON.stringify(updated.slice(0, 50))); } catch {}
      return updated;
    });
  }, [messages, activeChatId]);

  useEffect(() => { fetchNewsHeadlines(); }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchNewsHeadlines = async () => { setNewsItems(newsDatabase.map(item => item.headline)); };

  const startNewChat = () => {
    const greeting = { role: "assistant", content: isUrdu ? "Bienvenido a ARK Law AI USA — Su asistente legal de confianza para las leyes federales y estatales de EE.UU.\n\n¿En qué puedo ayudarle hoy?" : "Welcome to ARK Law AI USA — Your trusted AI legal companion for US federal and state law.\n\nHow may I assist you today?" };
    const newSession = { id: Date.now(), title: "New Chat", messages: [greeting] };
    setAllSessions(prev => [newSession, ...prev]);
    setActiveChatId(newSession.id);
    setMessages([greeting]);
    setInput("");
    setUploadedFiles([]);
    lastSavedCountRef.current = 0;
  };

  const loadSession = (sessionId) => {
    const session = allSessions.find(s => s.id === sessionId);
    if (!session) return;
    setActiveChatId(session.id);
    setMessages(session.messages);
    setInput("");
    setUploadedFiles([]);
    lastSavedCountRef.current = session.messages.filter(m => m.role === "user").length;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") { setShowInstallBtn(false); setInstallPrompt(null); }
      return;
    }
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
    const isFirefox = /firefox/.test(ua);
    const isSamsungBrowser = /samsungbrowser/.test(ua);
    if (isIOS || isSafari) alert("📲 Install ARK LAW AI on iPhone / iPad:\n\n1. Tap the Share button ( ⎦↑ ) at the bottom of Safari\n2. Scroll down and tap \"Add to Home Screen\"\n3. Tap \"Add\" — done! ✅");
    else if (isFirefox) alert("📲 Install ARK LAW AI on Firefox:\n\n1. Tap the three-dot menu ( ⋮ ) in the address bar\n2. Tap \"Install\" or \"Add to Home Screen\"\n3. Tap \"Add\" — done! ✅");
    else if (isSamsungBrowser) alert("📲 Install ARK LAW AI on Samsung Browser:\n\n1. Tap the three-line menu ( ☰ ) at the bottom\n2. Tap \"Add page to\" → \"Home screen\"\n3. Tap \"Add\" — done! ✅");
    else alert("📲 Install ARK LAW AI:\n\nOn Android Chrome:\n1. Tap the three-dot menu ( ⋮ ) at the top right\n2. Tap \"Add to Home screen\"\n3. Tap \"Add\" — done! ✅\n\nOn Desktop Chrome / Edge:\n1. Look for the install icon ( ⊕ ) in the address bar\n2. Click it and follow the prompt");
  };

  // ── Save chat history to server ──
  const saveHistory = async (sessionsToSave, tokensToSave) => {
    if (!user?.id) return;
    try {
      const sessions = sessionsToSave.filter(s => s.messages.some(m => m.role === "user")).slice(0, 50).map(s => ({
        id: s.id, title: s.title, messages: s.messages.slice(-20), savedAt: new Date().toISOString(),
      }));
      await fetch("/api/auth/save-history", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, chatHistory: sessions, tokens: tokensToSave }),
      });
    } catch (err) { console.error("History save failed:", err); }
  };

  // ── Persist tokens to Supabase immediately (fire-and-forget) ──
  const saveTokensToServer = (newTokens) => {
    const saved = localStorage.getItem("arklaw_user");
    if (!saved) return;
    try {
      const u = JSON.parse(saved);
      if (!u?.id) return;
      u.tokens = newTokens;
      localStorage.setItem("arklaw_user", JSON.stringify(u));
      fetch("/api/auth/save-history", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, tokens: newTokens }),
      }).catch(() => {});
    } catch {}
  };

  // ── Logout — saves tokens first ──
  const handleLogout = async () => {
    await saveHistory(allSessions, userTokens);
    localStorage.removeItem("arklaw_user");
    setUser(null);
    setUserTokens(500000);
    setShowMyAccountPopup(false);
  };

  const sendMessage = async (msg = null, skipNameCheck = false) => {
    const userMessage = msg || input;
    if (!userMessage.trim() && uploadedFiles.length === 0) return;
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) {
      const newTokens = Math.max(0, userTokens - tokensToDeduct);
      setUserTokens(newTokens);
      saveTokensToServer(newTokens);
    }
    let fileContents = [];
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          if (file.type.startsWith("image/")) {
            const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
            fileContents.push({ type: "image", name: file.name, data: base64 });
          } else if (file.type.includes("text") || file.name.endsWith(".txt")) {
            const text = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsText(file); });
            fileContents.push({ type: "text", name: file.name, data: text });
          } else {
            fileContents.push({ type: "document", name: file.name, size: file.size, message: `[Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Content extraction not yet supported.]` });
          }
        } catch (error) { console.error("Error reading file:", error); }
      }
    }
    let messageContent = userMessage.trim();
    if (fileContents.length > 0) {
      messageContent += "\n\n📎 Attached Files:\n";
      fileContents.forEach(file => {
        if (file.type === "text")          messageContent += `\n--- ${file.name} ---\n${file.data}\n`;
        else if (file.type === "document") messageContent += `\n${file.message}\n`;
        else if (file.type === "image")    messageContent += `\n[Image: ${file.name}]\n`;
      });
    }
    const updatedMessages = [...messages, { role: "user", content: messageContent }];
    setMessages(updatedMessages);
    setInput("");
    setUploadedFiles([]);
    setLoading(true);
    const streamingMessageIndex = updatedMessages.length;
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);
    try {
      const langInstruction = isUrdu
        ? "IMPORTANT: The user has selected Spanish. You MUST respond entirely in Spanish (Español). All your answers, explanations, disclaimers, and suggestions must be in Spanish. Do not switch to English unless the user explicitly asks."
        : "Respond in English.";
      const systemNote = `[System: Today is ${currentDate.current}. You are ARK Law AI USA, an expert legal assistant specializing EXCLUSIVELY in United States law — federal law, state law across all 50 states, US constitutional law, and US court procedures. You ONLY answer questions about US law and legal matters. If a user asks about the law of any other country, politely decline and redirect them. Always title disclaimer sections "Professional Disclaimer by ARK LAW AI USA". Always reference relevant US statutes, federal regulations, or case law where applicable. ${langInstruction}]`;
      const conversationPairs = [];
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        if (!m.content || (typeof m.content === "string" && !m.content.trim())) continue;
        if (m.role === "user") conversationPairs.push(m);
        if (m.role === "assistant" && conversationPairs.length > 0 && conversationPairs[conversationPairs.length - 1].role === "user") conversationPairs.push(m);
      }
      const newUserMsg = { role: "user", content: systemNote + "\n\n" + messageContent };
      const messagesWithContext = [...conversationPairs, newUserMsg];
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: messagesWithContext }) });
      if (!res.ok) { let errText = `HTTP ${res.status}`; try { const j = await res.json(); errText = j.error || j.message || errText; } catch {} throw new Error(errText); }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try { const parsed = JSON.parse(data); if (parsed.content) { accumulatedContent += parsed.content; setMessages(prev => { const n = [...prev]; n[streamingMessageIndex] = { role: "assistant", content: accumulatedContent }; return n; }); } } catch (e) {}
          }
        }
      }
      setLoading(false);
    } catch (error) {
      setMessages(prev => { const n = [...prev]; n[streamingMessageIndex] = { role: "assistant", content: `❌ Error: ${error.message}. Please try again.` }; return n; });
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) { alert("Voice recognition not supported. Please use Chrome or Edge."); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart  = () => setIsListening(true);
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror  = (event) => { setIsListening(false); if (event.error === "no-speech") alert("No speech detected."); };
    recognition.onend    = () => setIsListening(false);
    recognition.start();
  };

  const speakText = (text, messageIndex) => {
    if (isSpeaking && currentSpeakingIndex === messageIndex) { window.speechSynthesis.cancel(); setIsSpeaking(false); setCurrentSpeakingIndex(null); return; }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/#{1,6}\s*/g,"").replace(/\*{1,3}([^*]+)\*{1,3}/g,"$1").replace(/\*+/g,"").replace(/_([^_]+)_/g,"$1").replace(/`{1,3}[^`]*`{1,3}/g,"").replace(/~~([^~]+)~~/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/!\[[^\]]*\]\([^)]+\)/g,"").replace(/^[-*+]\s+/gm,"").replace(/^\d+\.\s+/gm,"").replace(/^>\s+/gm,"").replace(/[-]{3,}/g,". ").replace(/[•·]/g," ").replace(/\n+/g," ").replace(/\s{2,}/g," ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.88; utterance.pitch = 0.92; utterance.volume = 1.0; utterance.lang = "en-US";
    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(v => v.name === "Microsoft Guy Online (Natural) - en-US") || voices.find(v => v.name === "Microsoft Davis Online (Natural) - en-US") || voices.find(v => v.name === "Microsoft Ryan Online (Natural) - en-US") || voices.find(v => v.name === "Microsoft Eric - en-US") || voices.find(v => v.name === "Microsoft Mark - en-US") || voices.find(v => v.name.includes("Guy") && v.lang === "en-US") || voices.find(v => v.name.includes("Davis") && v.lang === "en-US") || voices.find(v => v.name.includes("Eric") && v.lang === "en-US") || voices.find(v => v.name.includes("David") && v.lang === "en-US") || voices.find(v => v.name.includes("Mark") && v.lang === "en-US") || voices.find(v => v.lang === "en-US" && !["Samantha","Zira","Susan","Linda","Jenny","Aria","Ana","Emma","Isabella","Ava","Michelle","Monica","Siri"].some(n => v.name.includes(n))) || voices.find(v => v.lang === "en-US") || voices.find(v => v.lang.startsWith("en"));
      if (maleVoice) utterance.voice = maleVoice;
    };
    selectVoice();
    if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.onvoiceschanged = selectVoice;
    utterance.onstart = () => { setIsSpeaking(true); setCurrentSpeakingIndex(messageIndex); };
    utterance.onend   = () => { setIsSpeaking(false); setCurrentSpeakingIndex(null); };
    utterance.onerror = () => { setIsSpeaking(false); setCurrentSpeakingIndex(null); };
    window.speechSynthesis.speak(utterance);
  };

  const handleNewsClick = async (headline) => {
    const newsItem = newsDatabase.find(item => item.headline === headline);
    if (newsItem) {
      setSelectedNews(newsItem); setShowNewsPopup(true); setNewsLoading(true); setNewsAnalysis("");
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Analyze this US legal news:\n\nHeadline: ${newsItem.headline}\n\nFull Text: ${newsItem.fullText}\n\nProvide a concise analysis of how this affects US citizens and businesses, relevant federal/state statutes, and practical implications.` }] }) });
        const data = await res.json();
        setNewsAnalysis(data.reply);
      } catch (error) { setNewsAnalysis("Unable to analyze this news item. Please try again."); }
      finally { setNewsLoading(false); }
    }
  };

  const generateDocument = async (requirements) => {
    setDraftGenerating(true); setDraftStep("generating");
    try {
      const prompt = `You are an expert US legal document drafter. Generate a complete, professionally formatted legal document based on these requirements:\n\nDocument Type: ${draftType}\nRequirements: ${JSON.stringify(requirements, null, 2)}\n\nCRITICAL INSTRUCTIONS:\n1. Follow US legal document format and conventions\n2. Include all necessary legal clauses as per US federal and state law\n3. Use proper US legal terminology\n4. Include all standard sections for this document type\n5. Add witness and notary sections where applicable\n6. Format with proper headings, numbering, and structure\n7. Make it court-ready and professionally formatted\n8. Include all parties' complete details\n9. Add governing law as applicable US state or federal law\n10. Include jurisdiction clauses (US federal or state courts)\n\nGenerate the COMPLETE document text ready for immediate use.`;
      const res  = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      setDraftContent(data.reply);
      setDraftTitle(`${draftType.charAt(0).toUpperCase() + draftType.slice(1)} - ${new Date().toLocaleDateString("en-PK")}`);
      setDraftStep("completed");
    } catch (error) { alert("Failed to generate document. Please try again."); setDraftStep("gathering-info"); }
    finally { setDraftGenerating(false); }
  };

  const downloadDraft = (format) => {
    const timestamp = new Date().toLocaleDateString("en-PK");
    let content = `ARK LAW AI USA - LEGAL DOCUMENT DRAFT\n${"=".repeat(50)}\n\nDocument Type: ${draftType.toUpperCase()}\nTitle: ${draftTitle}\nCreated: ${timestamp}\nJurisdiction: United States of America\n\n${"=".repeat(50)}\n\n${draftContent}\n\n${"=".repeat(50)}\nThis document was generated by ARK Law AI USA and should be reviewed by a licensed US attorney before execution.`;
    if (format === "pdf") { window.print(); return; }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ARK_${draftType}_${Date.now()}.${format === "doc" ? "doc" : "docx"}`; a.click();
    URL.revokeObjectURL(url);
  };

  const compareDocuments = async () => {
    if (!doc1 || !doc2) { alert("Please upload both documents"); return; }
    if (!compareFocus.trim()) { alert("Please specify a focal point for comparison"); return; }
    const maxSize = 5 * 1024 * 1024;
    if (doc1.size > maxSize) { alert("Document 1 is too large. Maximum size is 5MB."); return; }
    if (doc2.size > maxSize) { alert("Document 2 is too large. Maximum size is 5MB."); return; }
    setComparingDocs(true); setComparisonResult("");
    try {
      const readFileAsBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result.split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      const doc1Base64 = await readFileAsBase64(doc1);
      const doc2Base64 = await readFileAsBase64(doc2);
      const getMediaType = (filename) => { const ext = filename.toLowerCase().split(".").pop(); if (ext === "pdf") return "application/pdf"; if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; return "application/msword"; };
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: getMediaType(doc1.name), data: doc1Base64 } }, { type: "document", source: { type: "base64", media_type: getMediaType(doc2.name), data: doc2Base64 } }, { type: "text", text: `Compare these two documents with focal point: "${compareFocus}". Provide a comprehensive comparison report covering key differences, similarities, legal implications under US law, risk assessment, and recommendations.` }] }] }) });
      if (!res.ok) { const errorData = await res.json().catch(() => ({})); if (res.status === 413) throw new Error("Files are too large. Try compressing the PDFs (max 5MB each)."); throw new Error(errorData.error || `API returned status ${res.status}`); }
      const data = await res.json();
      if (!data.reply) throw new Error("No response received from AI");
      setComparisonResult(data.reply);
    } catch (error) { setComparisonResult(`❌ Error comparing documents: ${error.message}`); }
    finally { setComparingDocs(false); }
  };

  const downloadComparisonPDF = () => {
    if (!comparisonResult) return;
    const timestamp = new Date().toLocaleDateString("en-PK");
    const pdfContent = `ARK LAW AI - LEGAL DOCUMENT COMPARISON REPORT\n${"=".repeat(80)}\n\nDate: ${timestamp}\nFocal Point: ${compareFocus}\nDocument 1: ${doc1?.name || "Document 1"}\nDocument 2: ${doc2?.name || "Document 2"}\n\n${"=".repeat(80)}\n\n${comparisonResult}\n\n${"=".repeat(80)}\nGenerated by: ARK Law AI`.trim();
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `ARK_Document_Comparison_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>ARK Law AI - Document Comparison Report</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;color:#000;max-width:800px;margin:0 auto;padding:20px;}.header{text-align:center;border-bottom:3px solid #C9A84C;padding-bottom:20px;margin-bottom:30px;}.header h1{color:#0D1B2A;font-size:24pt;}.content{white-space:pre-wrap;text-align:justify;}.footer{margin-top:50px;padding-top:20px;border-top:2px solid #C9A84C;text-align:center;font-size:9pt;color:#666;}</style></head><body><div class="header"><h1>ARK LAW AI</h1><h2>LEGAL DOCUMENT COMPARISON REPORT</h2></div><div class="content">${comparisonResult.replace(/\n/g, "<br>")}</div><div class="footer"><p>Generated by ARK Law AI</p></div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const renderMessageContent = (content) => {
    const lines = content.split("\n");
    const elements = [];
    let currentParagraph = [];
    const parseMarkdown = (text) => {
      const parts = []; let remaining = text; let key = 0;
      while (remaining.length > 0) {
        const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/);
        if (boldItalicMatch) { parts.push(<strong key={key++} style={{ fontStyle: "italic" }}>{boldItalicMatch[1]}</strong>); remaining = remaining.slice(boldItalicMatch[0].length); continue; }
        const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
        if (boldMatch) { parts.push(<strong key={key++}>{boldMatch[1]}</strong>); remaining = remaining.slice(boldMatch[0].length); continue; }
        const italicMatch = remaining.match(/^\*(.+?)\*/);
        if (italicMatch) { parts.push(<em key={key++}>{italicMatch[1]}</em>); remaining = remaining.slice(italicMatch[0].length); continue; }
        const nextSpecial = remaining.search(/\*/);
        if (nextSpecial === -1) { parts.push(remaining); break; }
        else if (nextSpecial > 0) { parts.push(remaining.slice(0, nextSpecial)); remaining = remaining.slice(nextSpecial); }
        else { parts.push(remaining[0]); remaining = remaining.slice(1); }
      }
      return parts;
    };
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const imageMatch  = trimmedLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      const urlMatch    = trimmedLine.match(/^(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))$/i);
      if (imageMatch || urlMatch) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: "12px", lineHeight: "1.6" }}>{parseMarkdown(currentParagraph.join(" "))}</p>); currentParagraph = []; }
        const imgUrl = imageMatch ? imageMatch[2] : urlMatch[1];
        const imgAlt = imageMatch ? imageMatch[1] : "Image";
        elements.push(<div key={`img-${index}`} style={{ marginBottom: "16px", marginTop: "16px" }}><img src={imgUrl} alt={imgAlt} style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", border: `2px solid ${GOLD}`, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} onError={(e) => { e.target.style.display = "none"; }} /></div>);
      } else if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-")) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: "12px", lineHeight: "1.6" }}>{parseMarkdown(currentParagraph.join(" "))}</p>); currentParagraph = []; }
        elements.push(<div key={`bullet-${index}`} style={{ display: "flex", gap: "8px", marginBottom: "8px", lineHeight: "1.6" }}><span style={{ color: GOLD, fontWeight: "bold", flexShrink: 0 }}>•</span><span>{parseMarkdown(trimmedLine.substring(1).trim())}</span></div>);
      } else if (trimmedLine.length > 0 && ((trimmedLine.startsWith("***") && trimmedLine.endsWith("***")) || (trimmedLine.endsWith(":") && trimmedLine.length < 60))) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: "12px", lineHeight: "1.6" }}>{parseMarkdown(currentParagraph.join(" "))}</p>); currentParagraph = []; }
        elements.push(<h3 key={`h-${index}`} style={{ fontWeight: "bold", fontStyle: "italic", color: "#0D1B2A", marginTop: "16px", marginBottom: "8px", fontSize: "15px" }}>{trimmedLine.replace(/^\*\*\*|\*\*\*$/g, "")}</h3>);
      } else if (trimmedLine.length === 0) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: "12px", lineHeight: "1.6" }}>{parseMarkdown(currentParagraph.join(" "))}</p>); currentParagraph = []; }
      } else { currentParagraph.push(trimmedLine); }
    });
    if (currentParagraph.length > 0) elements.push(<p key="p-final" style={{ marginBottom: "12px", lineHeight: "1.6" }}>{parseMarkdown(currentParagraph.join(" "))}</p>);
    return <div style={{ whiteSpace: "normal" }}>{elements}</div>;
  };

  const popupInp = { width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}50`, borderRadius: "7px", color: NAVY, fontSize: 13, boxSizing: "border-box", outline: "none" };
  const popupLbl = { color: "#6A90C8", fontSize: 11, display: "block", marginBottom: "5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" };
  const popupRow = { marginBottom: "11px" };
  const popupWatermark = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0, width: "220px", height: "220px" };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <Head>
        <title>ARK LAW AI USA - Your Trusted US Legal Assistant</title>
        <meta name="description" content="ARK Law AI: Expert AI legal assistant for US law." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Pro:ital,wght@0,300;1,300&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#212121" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="ARK Law AI" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');});}` }} />
      </Head>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;background:#212121;color:#ececec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
        #__next{height:100%;overflow:hidden;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#444;border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:#555;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes taglineShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
        @keyframes taglineFadeIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}
        .sb-item{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:13.5px;color:#ececec;transition:background 0.15s;text-decoration:none;width:100%;border:none;background:transparent;text-align:left;}
        .sb-item:hover{background:#2f2f2f;}
        .sb-item.active{background:#2f2f2f;}
        .msg-wrap{max-width:720px;margin:0 auto;padding:0 16px;}
        .msg-actions{opacity:0;transition:opacity 0.15s;}
        .msg-row:hover .msg-actions{opacity:1;}
        .qcard{background:#2f2f2f;border:1px solid #3a3a3a;border-radius:12px;padding:14px 16px;cursor:pointer;transition:background 0.15s;text-align:left;}
        .qcard:hover{background:#333;}
        .input-wrap{background:#2f2f2f;border:1px solid #3a3a3a;border-radius:16px;transition:border-color 0.2s;}
        .input-wrap:focus-within{border-color:#555;}
        @media(max-width:768px){.sidebar-desktop{display:none!important;}}
      `}</style>

      {/* ═══════════════════ CHATGPT THEME ═══════════════════ */}
      {usTheme === "chatgpt" && (
      <div style={{display:"flex",height:"100vh",background:"#212121",color:"#ececec",overflow:"hidden"}}>

        {/* ═══════════════════════════════════════════
            SIDEBAR
        ═══════════════════════════════════════════ */}
        <div className="sidebar-desktop" style={{width:"260px",background:"#171717",display:"flex",flexDirection:"column",height:"100%",flexShrink:0,borderRight:"1px solid #2a2a2a",overflowY:"auto"}}>

          {/* Logo + New Chat */}
          <div style={{padding:"12px 10px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover"}} />
              <span style={{fontSize:14,fontWeight:700,color:"#ececec",fontFamily:"Georgia,serif",letterSpacing:"0.5px"}}>ARK LAW AI</span>
            </div>
            <button onClick={startNewChat} title={isUrdu ? "Nueva conversación" : "New chat"}
              style={{width:"34px",height:"34px",background:"transparent",border:"none",cursor:"pointer",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"#b4b4b4",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#2f2f2f";e.currentTarget.style.color="#ececec";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#b4b4b4";}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

          {/* Tools */}
          <div style={{padding:"4px 6px",flexShrink:0}}>
            <button className="sb-item" onClick={()=>setShowComparePopup(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>
              <span>{isUrdu ? UR.compareTitle : "Compare Documents"}</span>
            </button>
            <button className="sb-item" onClick={()=>setShowDraftPopup(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>{isUrdu ? UR.draftTitle : "Draft Documents"}</span>
            </button>
            <button className="sb-item" onClick={()=>setShowPracticeAreas(p=>!p)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{isUrdu ? UR.areasLabel : "Practice Areas"}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{marginLeft:"auto",transform:showPracticeAreas?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showPracticeAreas && (
              <div style={{marginLeft:"14px",paddingLeft:"10px",borderLeft:"1px solid #2f2f2f"}}>
                {PRACTICE_AREAS_PK.map((area,i)=>(
                  <button key={area.id} className="sb-item" style={{fontSize:12.5,padding:"5px 8px",color:"#b4b4b4"}}
                    onClick={()=>{sendMessage(isUrdu?`Cuéntame sobre ${area.label} en los Estados Unidos`:`Tell me about ${area.label} in the United States`,true);setShowPracticeAreas(false);}}>
                    <span style={{fontSize:13}}>{area.icon}</span>
                    <span>{isUrdu ? UR.practiceAreas[i] : area.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{height:"1px",background:"#2a2a2a",margin:"6px 12px",flexShrink:0}}/>

          {/* Recents label */}
          <div style={{padding:"2px 16px 4px",flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:600,color:"#8e8ea0",textTransform:"uppercase",letterSpacing:"0.6px"}}>Recents</span>
          </div>

          {/* Sessions list */}
          <div style={{flex:1,overflowY:"auto",padding:"0 6px"}}>
            {allSessions.length===0 ? (
              <div style={{padding:"16px 12px",color:"#555",fontSize:13,textAlign:"center"}}>No conversations yet</div>
            ) : allSessions.map(s=>{
              const active=s.id===activeChatId;
              return(
                <button key={s.id} className={"sb-item"+(active?" active":"")} onClick={()=>loadSession(s.id)}
                  style={{fontSize:13,color:active?"#ececec":"#b4b4b4",width:"100%"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom user section */}
          <div style={{padding:"8px",borderTop:"1px solid #2a2a2a",flexShrink:0}}>
            {!user ? (
              <div style={{display:"flex",gap:"6px",padding:"2px 4px"}}>
                <button onClick={()=>setShowLoginPopup(true)}
                  style={{flex:1,padding:"9px 0",background:"transparent",color:"#ececec",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:500,transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#2f2f2f"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {isUrdu ? UR.login : "Log in"}
                </button>
                <button onClick={()=>setShowSignupPopup(true)}
                  style={{flex:1,padding:"9px 0",background:"white",color:"#212121",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:600,transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#e8e8e8"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                  Sign up
                </button>
              </div>
            ) : (
              <div>
                {/* Token bar */}
                <div style={{padding:"5px 10px",marginBottom:"4px",background:"#2a2a2a",borderRadius:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{flex:1,height:"3px",background:"#3a3a3a",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:Math.max(2,(userTokens/500000)*100)+"%",background:userTokens>100000?"#4CAF7D":"#C9A84C",borderRadius:"2px"}}/>
                  </div>
                  <span style={{fontSize:10,color:"#666",whiteSpace:"nowrap"}}>{userTokens.toLocaleString()}</span>
                </div>
                {/* User row */}
                <button className="sb-item" onClick={()=>{saveHistory(allSessions,userTokens);setShowMyAccountPopup(true);}} style={{width:"100%"}}>
                  <div style={{width:"26px",height:"26px",borderRadius:"50%",background:"linear-gradient(135deg,#C9A84C,#B8860B)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#111",flexShrink:0}}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                    <div style={{fontSize:11,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
                  </div>
                  {user?.email?.toLowerCase()==="khawer.profession@gmail.com" && (
                    <button onClick={e=>{e.stopPropagation();window.open("/admin","_blank");}}
                      style={{padding:"2px 6px",background:"#DC2626",color:"white",border:"none",borderRadius:"4px",cursor:"pointer",fontSize:9,fontWeight:700,flexShrink:0}}>
                      Admin
                    </button>
                  )}
                </button>
              </div>
            )}
            {/* Back + Language */}
            <div style={{display:"flex",gap:"4px",marginTop:"4px",padding:"0 2px"}}>
              <button onClick={()=>router.push("/")}
                style={{padding:"6px 8px",background:"transparent",color:"#666",border:"none",cursor:"pointer",borderRadius:"6px",fontSize:11,display:"flex",alignItems:"center",gap:"4px",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#2f2f2f";e.currentTarget.style.color="#ececec";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#666";}}>
                ← 🌍
              </button>
              <select value={isUrdu?"es":"en"} onChange={e=>setIsUrdu(e.target.value==="es")}
                style={{flex:1,padding:"5px 8px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"6px",cursor:"pointer",fontSize:12,outline:"none"}}>
                <option value="en">🌐 English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════ */}
        <div style={{flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",position:"relative",background:"#212121"}}>

          {/* Top bar — tagline + news widget */}
          <div style={{padding:isMobile?"10px 14px":"8px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #2a2a2a",flexShrink:0,minHeight:"52px"}}>
            {/* Mobile logo */}
            {isMobile && (
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"28px",height:"28px",borderRadius:"50%",objectFit:"cover"}}/>
                <span style={{fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"}}>ARK LAW AI</span>
              </div>
            )}
            {/* Desktop tagline */}
            {!isMobile && (
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(15px,1.6vw,20px)",fontWeight:700,letterSpacing:"3px",background:"linear-gradient(135deg,#C9A84C 0%,#FFE08A 40%,#C9A84C 60%,#B8860B 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"taglineShimmer 4s linear infinite,taglineFadeIn 0.6s ease both",whiteSpace:"nowrap"}}>We the People</div>
                <div style={{width:"80px",height:"1px",background:"linear-gradient(to right,transparent,#BF0A30,transparent)",marginTop:"3px"}}/>
                <div style={{fontFamily:"'Crimson Pro',serif",fontSize:"10px",fontStyle:"italic",color:"#555",letterSpacing:"1.2px",marginTop:"2px",animation:"taglineFadeIn 0.6s ease 0.2s both"}}>Constitution of the United States</div>
              </div>
            )}
            {/* Right: news + mobile auth */}
            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
              {!isMobile && <USNewsWidget />}
              {isMobile && !user && (
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>setShowLoginPopup(true)} style={{padding:"6px 12px",background:"transparent",color:"#ececec",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:12}}>Log in</button>
                  <button onClick={()=>setShowSignupPopup(true)} style={{padding:"6px 12px",background:"white",color:"#212121",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:12,fontWeight:600}}>Sign up</button>
                </div>
              )}
              {isMobile && user && (
                <button onClick={()=>{saveHistory(allSessions,userTokens);setShowMyAccountPopup(true);}}
                  style={{width:"32px",height:"32px",borderRadius:"50%",background:"linear-gradient(135deg,#C9A84C,#B8860B)",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#111"}}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </button>
              )}
            </div>
          </div>

          {/* Chat scroll area */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

            {/* Empty state */}
            {messages.filter(m=>m.role==="user").length===0 && !loading && (
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",animation:"fadeSlideUp 0.4s ease"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"60px",height:"60px",borderRadius:"50%",objectFit:"cover",marginBottom:"18px",filter:"drop-shadow(0 0 20px rgba(191,10,48,0.25))"}}/>
                <h2 style={{fontSize:"clamp(20px,3vw,30px)",fontWeight:600,color:"#ececec",marginBottom:"8px",fontFamily:"Georgia,serif",textAlign:"center"}}>
                  {isUrdu ? "¿En qué puedo ayudarle hoy?" : "How can I help you today?"}
                </h2>
                <p style={{fontSize:14,color:"#666",marginBottom:"28px",textAlign:"center"}}>
                  {isUrdu ? "ARK Law AI USA — su asistente legal experto" : "ARK Law AI USA — your expert US legal assistant"}
                </p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:"10px",width:"100%",maxWidth:"660px"}}>
                  {(isUrdu ? UR.quickQueries : QUICK_QUERIES_PK).slice(0,4).map((q,i)=>(
                    <button key={i} className="qcard" onClick={()=>sendMessage(q,true)}>
                      <div style={{fontSize:13.5,color:"#d1d1d1",lineHeight:1.45,marginBottom:"8px"}}>{q}</div>
                      <div style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:"4px"}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Ask ARK
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{padding:"8px 0 0"}}>
              {messages.map((msg,i)=>(
                <div key={i} className="msg-row" style={{padding:"14px 0",animation:"fadeSlideUp 0.25s ease"}}>
                  <div className="msg-wrap">
                    <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                      {/* Avatar */}
                      <div style={{flexShrink:0,marginTop:"2px"}}>
                        {msg.role==="assistant" ? (
                          <img src="/ark-logo-us.png" alt="ARK" style={{width:"30px",height:"30px",borderRadius:"50%",objectFit:"cover",border:"1px solid #333"}}/>
                        ) : (
                          <div style={{width:"30px",height:"30px",borderRadius:"50%",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>
                            {user?.name?.charAt(0)?.toUpperCase()||"U"}
                          </div>
                        )}
                      </div>
                      {/* Text */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#ececec",marginBottom:"5px"}}>
                          {msg.role==="assistant" ? "ARK Law AI" : (user?.name||"You")}
                        </div>
                        <div style={{fontSize:14.5,color:"#d1d1d1",lineHeight:1.7}}>
                          {renderMessageContent(msg.content)}
                        </div>
                        {/* Actions */}
                        {msg.role==="assistant" && msg.content && (
                          <div className="msg-actions" style={{display:"flex",gap:"4px",marginTop:"10px",flexWrap:"wrap"}}>
                            <button onClick={()=>speakText(msg.content,i)}
                              style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 9px",background:"transparent",color:currentSpeakingIndex===i?"#4CAF7D":"#666",border:"1px solid #333",borderRadius:"6px",cursor:"pointer",fontSize:12,transition:"all 0.15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor="#555";e.currentTarget.style.color="#ececec";}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.color=currentSpeakingIndex===i?"#4CAF7D":"#666";}}>
                              {currentSpeakingIndex===i
                                ?<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
                              <span>{currentSpeakingIndex===i?"Stop":"Listen"}</span>
                            </button>
                            <button onClick={e=>{e.stopPropagation();setReactions(prev=>({...prev,[i]:{...prev[i],like:!prev[i]?.like,dislike:false}}));}}
                              style={{padding:"4px 9px",background:reactions[i]?.like?"#1a3a1a":"transparent",color:reactions[i]?.like?"#4CAF7D":"#666",border:"1px solid #333",borderRadius:"6px",cursor:"pointer",fontSize:12,transition:"all 0.15s"}}
                              onMouseEnter={e=>e.currentTarget.style.borderColor="#555"} onMouseLeave={e=>e.currentTarget.style.borderColor="#333"}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={reactions[i]?.like?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            </button>
                            <button onClick={e=>{e.stopPropagation();setReactions(prev=>({...prev,[i]:{...prev[i],dislike:!prev[i]?.dislike,like:false}}));}}
                              style={{padding:"4px 9px",background:reactions[i]?.dislike?"#3a1a1a":"transparent",color:reactions[i]?.dislike?"#EF4444":"#666",border:"1px solid #333",borderRadius:"6px",cursor:"pointer",fontSize:12,transition:"all 0.15s"}}
                              onMouseEnter={e=>e.currentTarget.style.borderColor="#555"} onMouseLeave={e=>e.currentTarget.style.borderColor="#333"}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={reactions[i]?.dislike?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Loading dots */}
              {loading && (
                <div style={{padding:"14px 0"}}>
                  <div className="msg-wrap">
                    <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                      <img src="/ark-logo-us.png" alt="ARK" style={{width:"30px",height:"30px",borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                      <div style={{paddingTop:"6px",display:"flex",gap:"5px",alignItems:"center"}}>
                        {[0,1,2].map(i=>(
                          <div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:"#666",animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} style={{height:"16px"}}/>
            </div>
          </div>

          {/* ═══════════════════ INPUT AREA ═══════════════════ */}
          <div style={{padding:isMobile?"10px 12px 14px":"12px 24px 18px",background:"#212121",flexShrink:0}}>

            {/* Attached files */}
            {uploadedFiles.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"8px",maxWidth:"720px",margin:"0 auto 8px"}}>
                {uploadedFiles.map((file,idx)=>(
                  <div key={idx} style={{display:"flex",alignItems:"center",gap:"6px",padding:"4px 10px",background:"#2f2f2f",border:"1px solid #3a3a3a",borderRadius:"8px",fontSize:12,color:"#d1d1d1"}}>
                    <span>📎 {file.name}</span>
                    <button onClick={()=>setUploadedFiles(prev=>prev.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:15,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Input box */}
            <div className="input-wrap" style={{maxWidth:"720px",margin:"0 auto",padding:"10px 12px",display:"flex",alignItems:"flex-end",gap:"8px"}}>
              {/* Attach */}
              <label htmlFor="file-us" style={{cursor:"pointer",color:"#666",display:"flex",alignItems:"center",padding:"4px",borderRadius:"6px",flexShrink:0,transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="#ececec"} onMouseLeave={e=>e.currentTarget.style.color="#666"}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 16.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <input id="file-us" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" style={{display:"none"}} onChange={e=>{const files=Array.from(e.target.files);if(files.length)setUploadedFiles(prev=>[...prev,...files]);}}/>
              </label>

              {/* Textarea */}
              <textarea
                value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(180,e.target.scrollHeight)+"px";}}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                placeholder={isListening?(isUrdu?UR.listening:"Listening..."):uploadedFiles.length>0?`Ask about ${uploadedFiles.length} file(s)...`:(isUrdu?UR.placeholder:"Ask ARK Law AI about US law...")}
                rows={1}
                style={{flex:1,background:"transparent",border:"none",color:"#ececec",fontSize:15,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",maxHeight:"180px",overflowY:"auto"}}
              />

              {/* Mic */}
              <button onClick={startVoiceInput} disabled={loading||isListening}
                style={{color:isListening?"#4CAF7D":"#666",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0,padding:"4px",borderRadius:"6px",transition:"color 0.15s",animation:isListening?"pulse 1.5s infinite":"none"}}
                onMouseEnter={e=>{if(!isListening)e.currentTarget.style.color="#ececec";}}
                onMouseLeave={e=>{if(!isListening)e.currentTarget.style.color="#666";}}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg>
              </button>

              {/* Send */}
              <button onClick={()=>sendMessage()} disabled={loading||(!input.trim()&&!uploadedFiles.length)}
                style={{width:"32px",height:"32px",borderRadius:"8px",background:(loading||(!input.trim()&&!uploadedFiles.length))?"#333":"white",border:"none",cursor:(loading||(!input.trim()&&!uploadedFiles.length))?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                {loading
                  ?<div style={{width:"13px",height:"13px",border:"2px solid #666",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={(!input.trim()&&!uploadedFiles.length)?"#555":"#212121"} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                }
              </button>
            </div>

            <div style={{textAlign:"center",marginTop:"8px",fontSize:11,color:"#444"}}>
              {isUrdu ? "ARK Law AI USA puede cometer errores. Verifique la información legal importante." : "ARK Law AI USA may make mistakes. Verify important legal information."}
            </div>
          </div>
        </div>
      </div>

      </div>
      )} {/* end chatgpt theme */}

      {/* ═══════════════════ CLASSIC ARK THEME ═══════════════════ */}
      {usTheme === "classic" && (
        <div style={{ display:"flex", flexDirection:"column", height: isMobile ? "100dvh" : "100vh", background:"#001F5B", color:"#FAF6EE", fontFamily:"Segoe UI, Tahoma, sans-serif", overflow:"hidden" }}>
          {/* Header */}
          <header style={{ background:"#001F5B", padding: isMobile ? "6px 10px" : "8px 20px", borderBottom:"2px solid #BF0A30", display:"flex", alignItems:"center", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
              <img src="/ark-logo-us.png" alt="ARK USA" style={{ width:"52px", height:"52px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
              <div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#E8D97A" }}>ARK LAW AI</div>
                <div style={{ fontSize:10, color:"#A8C0E8" }}>US Legal Intelligence Engine</div>
                <div style={{ fontSize:9, color:GOLD, fontStyle:"italic", marginTop:"2px" }}>My Learned Assistant</div>
              </div>
            </div>
            {!isMobile && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(14px,1.8vw,20px)", fontWeight:700, letterSpacing:"3px", background:"linear-gradient(135deg,#C9A84C 0%,#FFE08A 40%,#C9A84C 60%,#B8860B 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"taglineShimmer 4s linear infinite", whiteSpace:"nowrap" }}>We the People</div>
                <div style={{ width:"120px", height:"1px", background:"linear-gradient(to right,transparent,#BF0A30,transparent)", marginTop:"4px" }} />
                <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:"10px", fontStyle:"italic", color:"#A8C0E8", letterSpacing:"1.5px", marginTop:"2px" }}>Constitution of the United States</div>
              </div>
            )}
            <div style={{ display:"flex", gap:"8px", alignItems:"center", flexShrink:0 }}>
              <button onClick={()=>router.push("/")} style={{ padding:"5px 8px", background:"rgba(255,255,255,0.08)", color:"#A8C0E8", border:"1px solid #2A3A5A", borderRadius:"4px", cursor:"pointer", fontSize:10, fontWeight:600, display:"flex", alignItems:"center", gap:"4px" }}>← 🌍</button>
              <select value={isUrdu?"es":"en"} onChange={e=>setIsUrdu(e.target.value==="es")} style={{ padding:"4px 6px", background:"#002868", color:"#E8D97A", border:"1px solid #003399", borderRadius:"4px", cursor:"pointer", fontSize:10, fontWeight:600, outline:"none" }}>
                <option value="en">🌐 English</option>
                <option value="es">Español</option>
              </select>
              {!user ? (
                <>
                  <button onClick={()=>setShowLoginPopup(true)} style={{ padding:"5px 12px", background:"transparent", color:LIGHT_GREEN, border:`1px solid ${LIGHT_GREEN}`, borderRadius:"4px", cursor:"pointer", fontSize:10, fontWeight:600 }} onMouseEnter={e=>{e.currentTarget.style.background=LIGHT_GREEN;e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=LIGHT_GREEN;}}>{isUrdu?UR.login:"Login"}</button>
                  <button onClick={()=>setShowSignupPopup(true)} style={{ padding:"5px 12px", background:LIGHT_GREEN, color:"white", border:`1px solid ${LIGHT_GREEN}`, borderRadius:"4px", cursor:"pointer", fontSize:10, fontWeight:600 }} onMouseEnter={e=>e.currentTarget.style.background=LG_HOVER} onMouseLeave={e=>e.currentTarget.style.background=LIGHT_GREEN}>Signup</button>
                </>
              ) : (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"4px 8px", background:"#001F5B", border:"1px solid #003399", borderRadius:"6px" }}>
                    <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:`conic-gradient(${GOLD} ${(userTokens/500000)*100}%, #003399 0%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:"#001F5B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"7px", fontWeight:700, color:GOLD }}>{Math.round((userTokens/500000)*100)}%</div>
                    </div>
                    <div style={{ fontSize:"10px", fontWeight:700, color:GOLD }}>{userTokens.toLocaleString()}</div>
                  </div>
                  <div style={{ padding:"5px 10px", background:"linear-gradient(135deg,#BF0A30,#8B0000)", color:"white", border:"1px solid #BF0A30", borderRadius:"4px", fontSize:10, fontWeight:700 }}>👤 {user.name}</div>
                  {user?.email?.toLowerCase()==="khawer.profession@gmail.com" && (
                    <button onClick={()=>window.open("/admin","_blank")} style={{ padding:"5px 10px", background:"#DC2626", color:"white", border:"1px solid #991B1B", borderRadius:"4px", cursor:"pointer", fontSize:10, fontWeight:700 }}>🔑 Admin</button>
                  )}
                  <button onClick={()=>{saveHistory(allSessions,userTokens);setShowMyAccountPopup(true);}} title="My Account"
                    style={{ width:"34px", height:"34px", borderRadius:"50%", background:`linear-gradient(135deg,${GOLD},#B8860B)`, border:`2px solid ${GOLD}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#001F5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Body */}
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            {/* Left Sidebar */}
            {!isMobile && (
            <div style={{ width:"200px", background:"#F5F1E8", borderRight:`1px solid ${GOLD}40`, padding:"8px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"3px", flexShrink:0 }}>
                <div onClick={()=>setShowComparePopup(true)} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", background:"white", borderRadius:"8px", border:"1px solid #E8E8E4", cursor:"pointer", transition:"all 0.18s" }} onMouseEnter={e=>{e.currentTarget.style.background="#F5F9F5";e.currentTarget.style.borderColor="#3EB489";}} onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.borderColor="#E8E8E4";}}>
                  <div style={{ width:"28px", height:"28px", background:"#EDF7F0", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>⚖️</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color:"#1A1A1A", fontWeight:600, lineHeight:1.3 }}>{isUrdu?UR.compareTitle:"Compare Documents"}</div>
                    <div style={{ fontSize:9, color:"#888" }}>{isUrdu?UR.compareSubtitle:"Upload 2 docs to compare"}</div>
                  </div>
                  <span style={{ color:"#BBBBBB", fontSize:12 }}>›</span>
                </div>
                <div onClick={()=>setShowDraftPopup(true)} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", background:"white", borderRadius:"8px", border:"1px solid #E8E8E4", cursor:"pointer", transition:"all 0.18s" }} onMouseEnter={e=>{e.currentTarget.style.background="#F5F9F5";e.currentTarget.style.borderColor="#3EB489";}} onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.borderColor="#E8E8E4";}}>
                  <div style={{ width:"28px", height:"28px", background:"#EDF7F0", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>✍️</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color:"#1A1A1A", fontWeight:600, lineHeight:1.3 }}>{isUrdu?UR.draftTitle:"Draft Documents"}</div>
                    <div style={{ fontSize:9, color:"#888" }}>{isUrdu?UR.draftSubtitle:"Contracts, affidavits & more"}</div>
                  </div>
                  <span style={{ color:"#BBBBBB", fontSize:12 }}>›</span>
                </div>
                <div style={{ borderRadius:"8px", border:"1px solid #E8E8E4", background:"white", overflow:"hidden" }}>
                  <div onClick={()=>setShowPracticeAreas(p=>!p)} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background="#F5F9F5"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                    <div style={{ width:"28px", height:"28px", background:"#EDF7F0", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>⚖️</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, color:"#1A1A1A", fontWeight:600 }}>{isUrdu?UR.areasLabel:"Practice Areas"}</div>
                    </div>
                    <span style={{ color:"#BBBBBB", fontSize:11, transition:"transform 0.2s", transform:showPracticeAreas?"rotate(90deg)":"rotate(0deg)" }}>›</span>
                  </div>
                  {showPracticeAreas && (
                    <div style={{ borderTop:"1px solid #F0EDE6", maxHeight:"180px", overflowY:"auto" }}>
                      {PRACTICE_AREAS_PK.map((area,i)=>(
                        <button key={area.id} onClick={()=>{sendMessage(isUrdu?`Cuéntame sobre ${area.label} en los Estados Unidos`:`Tell me about ${area.label} in the United States`,true);setShowPracticeAreas(false);}} style={{ display:"flex", alignItems:"center", gap:"8px", width:"100%", padding:"7px 10px", background:"transparent", border:"none", borderBottom:"1px solid #F5F2EC", cursor:"pointer", textAlign:"left", fontSize:10, color:"#1A1A1A" }} onMouseEnter={e=>e.currentTarget.style.background="#F0FAF4"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{ fontSize:12 }}>{area.icon}</span><span style={{ flex:1 }}>{isUrdu?UR.practiceAreas[i]:area.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ height:"1px", background:`${GOLD}40`, margin:"6px 0", flexShrink:0 }}/>
              <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px", flexShrink:0 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:NAVY, textTransform:"uppercase", letterSpacing:"0.5px" }}>💬 {isUrdu?UR.sessions:"You & ARK LAW Sessions"}</span>
                  <button onClick={startNewChat} style={{ fontSize:8, padding:"2px 8px", background:LIGHT_GREEN, color:"white", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:700 }} onMouseEnter={e=>e.currentTarget.style.background=LG_HOVER} onMouseLeave={e=>e.currentTarget.style.background=LIGHT_GREEN}>{isUrdu?UR.newBtn:"+ New"}</button>
                </div>
                <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"2px" }}>
                  {allSessions.map(session=>{
                    const isActive=session.id===activeChatId;
                    return(
                      <div key={session.id} onClick={()=>loadSession(session.id)} style={{ padding:"6px 8px", borderRadius:"6px", background:isActive?`${GOLD}22`:"transparent", border:isActive?`1px solid ${GOLD}60`:"1px solid transparent", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:"6px" }} onMouseEnter={e=>{if(!isActive){e.currentTarget.style.background=`${NAVY}08`;}}} onMouseLeave={e=>{if(!isActive){e.currentTarget.style.background="transparent";}}}>
                        <span style={{ fontSize:10, flexShrink:0 }}>{isActive?"🟡":"💬"}</span>
                        <span style={{ fontSize:8, color:isActive?NAVY:"#444", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", fontWeight:isActive?600:400 }}>{session.title}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:"8px" }}>
                  <USNewsWidget />
                </div>
              </div>
            </div>
            )}
            {/* Chat area */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", background:"white", position:"relative" }}>
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", opacity:0.08, pointerEvents:"none", zIndex:0 }}>
                <img src="/ark-logo-us.png" alt="" style={{ width:"380px", height:"380px", borderRadius:"50%", objectFit:"cover" }}/>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column-reverse", position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {messages.map((msg,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"flex-start", gap:"10px" }}>
                      {msg.role==="assistant"?<img src="/ark-logo-us.png" alt="ARK" style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover", border:`2px solid ${GOLD}`, flexShrink:0 }}/>:<div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white" }}>{user?.name?.charAt(0)?.toUpperCase()||"U"}</div>}
                      <div style={{ maxWidth:"75%", position:"relative" }}>
                        <div style={{ padding:"10px 14px", borderRadius:"8px", background:"white", color:"#1A1A1A", fontSize:13, lineHeight:"1.6" }}>{renderMessageContent(msg.content)}</div>
                        {msg.role==="assistant" && (
                          <div style={{ marginTop:"6px", display:"flex", gap:"4px" }}>
                            <button onClick={()=>speakText(msg.content,i)} style={{ width:"28px", height:"28px", borderRadius:"6px", background:currentSpeakingIndex===i?LIGHT_GREEN:"white", border:`1px solid ${currentSpeakingIndex===i?LIGHT_GREEN:"#D0D0C8"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                              {currentSpeakingIndex===i?<svg width="13" height="13" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
                            </button>
                            <button onClick={e=>{e.stopPropagation();setReactions(prev=>({...prev,[i]:{...prev[i],like:!prev[i]?.like,dislike:false}}));}} style={{ width:"28px", height:"28px", borderRadius:"6px", background:reactions[i]?.like?"#E8F5E9":"white", border:`1px solid ${reactions[i]?.like?LIGHT_GREEN:"#D0D0C8"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill={reactions[i]?.like?LIGHT_GREEN:"none"} stroke={reactions[i]?.like?LIGHT_GREEN:"#666"} strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && <div style={{ display:"flex", alignItems:"center", gap:"8px" }}><img src="/ark-logo-us.png" alt="ARK" style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover", border:`2px solid ${GOLD}` }}/><div style={{ color:"#6E8099", fontSize:12 }}>{isUrdu?UR.thinking:"ARK is thinking..."}</div></div>}
                  <div ref={messagesEndRef}/>
                </div>
              </div>
              <div style={{ padding:"12px 15px", borderTop:`1px solid #2B3F57`, display:"flex", gap:"8px", alignItems:"center", background:"white" }}>
                <button onClick={startVoiceInput} disabled={loading||isListening} style={{ width:"38px", height:"38px", background:isListening?LIGHT_GREEN:"white", border:`1px solid ${isListening?LIGHT_GREEN:GOLD}60`, borderRadius:"6px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, animation:isListening?"pulse 1.5s infinite":"none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isListening?"white":NAVY} strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg>
                </button>
                <label htmlFor="file-classic" style={{ width:"38px", height:"38px", background:"white", border:`1px solid ${GOLD}60`, borderRadius:"6px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 16.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <input id="file-classic" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" style={{ display:"none" }} onChange={e=>{const files=Array.from(e.target.files);if(files.length)setUploadedFiles(prev=>[...prev,...files]);}}/>
                </label>
                <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==="Enter"&&sendMessage()} placeholder={isListening?(isUrdu?UR.listening:"Listening..."):(isUrdu?UR.placeholder:"Ask ARK Law AI about US law...")} style={{ flex:1, padding:"9px 12px", background:"white", border:`1px solid ${GOLD}60`, color:NAVY, borderRadius:"4px", fontSize:13 }}/>
                <button onClick={()=>sendMessage()} disabled={loading||isListening} style={{ padding:"9px 18px", background:loading||isListening?"#9DB89A":LIGHT_GREEN, color:"white", border:"none", borderRadius:"4px", cursor:loading||isListening?"not-allowed":"pointer", fontWeight:600, fontSize:13, transition:"background 0.2s" }} onMouseEnter={e=>{if(!loading&&!isListening)e.currentTarget.style.background=LG_HOVER;}} onMouseLeave={e=>{if(!loading&&!isListening)e.currentTarget.style.background=LIGHT_GREEN;}}>{isUrdu?UR.send:"SEND"}</button>
              </div>
            </div>
          </div>
        </div>
      )} {/* end classic theme */}

      {/* ═══════════════════════════════════════════
          POPUPS (US theme — navy/red)
      ═══════════════════════════════════════════ */}

      {showNewsPopup && selectedNews && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#1a1a2e",borderRadius:"12px",width:"90%",maxWidth:"700px",maxHeight:"85vh",overflow:"auto",border:"2px solid #BF0A30",boxShadow:"0 0 30px rgba(191,10,48,0.2)"}}>
            <div style={{background:"linear-gradient(135deg,#001F5B,#0d0d2b)",padding:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #BF0A30"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover"}}/>
                <div><div style={{color:GOLD,fontWeight:700,fontSize:14}}>ARK LAW AI USA</div><div style={{color:"#A8C0E8",fontSize:9}}>Legal News Analysis</div></div>
              </div>
              <button onClick={()=>setShowNewsPopup(false)} style={{background:"none",border:"none",color:GOLD,fontSize:28,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"25px"}}>
              <p style={{color:GOLD,fontSize:15,fontWeight:700,marginBottom:"10px",lineHeight:"1.6"}}>{selectedNews.headline}</p>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"15px",padding:"10px",background:"#001F5B",borderRadius:"4px",borderLeft:"3px solid #BF0A30"}}>
                <span style={{fontSize:10,color:"#A8C0E8"}}>📰 Source:</span>
                <span style={{fontSize:11,color:"#BF0A30",fontWeight:600}}>{selectedNews.source}</span>
              </div>
              <p style={{color:"#d1d1d1",fontSize:13,lineHeight:"1.8",marginBottom:"15px",whiteSpace:"pre-wrap"}}>{selectedNews.fullText}</p>
              <div style={{borderTop:"1px solid #333",paddingTop:"15px"}}>
                <h4 style={{color:GOLD,fontSize:12,fontWeight:600,marginBottom:"8px"}}>⚖️ Legal Analysis:</h4>
                {newsLoading?<div style={{color:"#666",fontSize:13,textAlign:"center",padding:"20px"}}>⏳ Analyzing...</div>:<div style={{color:"#b4b4b4",fontSize:13,lineHeight:"1.8",whiteSpace:"pre-wrap"}}>{newsAnalysis}</div>}
              </div>
            </div>
            <div style={{padding:"15px 25px",borderTop:"1px solid #333",display:"flex",justifyContent:"flex-end"}}>
              <button onClick={()=>setShowNewsPopup(false)} style={{padding:"10px 24px",background:GOLD,color:NAVY,border:"none",borderRadius:"4px",cursor:"pointer",fontWeight:600,fontSize:12}}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {showDraftPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#1a1a1a",borderRadius:"14px",width:"90%",maxWidth:"800px",maxHeight:"92vh",overflow:"auto",border:"2px solid #BF0A30",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",position:"relative"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"260px",height:"260px",borderRadius:"50%",objectFit:"cover"}}/>
            <div style={{padding:"18px 22px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #333",position:"sticky",top:0,background:"#1a1a1a",zIndex:2}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"36px",height:"36px",borderRadius:"50%",objectFit:"cover"}}/>
                <div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:GOLD}}>ARK LAW AI USA</div><div style={{fontSize:11,color:"#A8C0E8"}}>✍️ AI Legal Document Drafting</div></div>
              </div>
              <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"20px 22px",position:"relative",zIndex:1}}>
              {draftStep==="type-selection" && (
                <div>
                  <h4 style={{color:"#ececec",fontSize:15,marginBottom:"14px",fontWeight:700}}>📋 Step 1: Select Document Type</h4>
                  <select value={draftType} onChange={e=>setDraftType(e.target.value)} style={{width:"100%",padding:"11px",background:"#2a2a2a",border:"1px solid #3a3a3a",color:"#ececec",borderRadius:"8px",marginBottom:"18px",fontSize:13,cursor:"pointer",outline:"none"}}>
                    <option value="">-- Select Document Type --</option>
                    <option value="rental-agreement">🏠 Rental/Lease Agreement</option>
                    <option value="contract">📄 General Contract</option>
                    <option value="nda">🔒 Non-Disclosure Agreement (NDA)</option>
                    <option value="affidavit">⚖️ Affidavit</option>
                    <option value="will">📜 Will / Testament</option>
                    <option value="power-of-attorney">🔑 Power of Attorney</option>
                    <option value="employment-agreement">💼 Employment Agreement</option>
                    <option value="partnership-deed">🤝 Partnership Agreement</option>
                    <option value="sale-deed">🏘️ Real Estate Purchase Agreement</option>
                    <option value="divorce-agreement">💔 Divorce Settlement Agreement</option>
                    <option value="loan-agreement">💰 Loan Agreement</option>
                    <option value="trust-deed">🏛️ Trust Agreement</option>
                  </select>
                  <button onClick={()=>{if(!draftType){alert("Please select a document type");return;}setDraftStep("gathering-info");}} disabled={!draftType}
                    style={{width:"100%",padding:"12px",background:draftType?"#BF0A30":"#333",color:"white",border:"none",borderRadius:"8px",cursor:draftType?"pointer":"not-allowed",fontWeight:700,fontSize:14,marginBottom:"10px"}}
                    onMouseEnter={e=>{if(draftType)e.currentTarget.style.background="#a00828";}} onMouseLeave={e=>{if(draftType)e.currentTarget.style.background="#BF0A30";}}>
                    Next: Provide Information →
                  </button>
                  <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{width:"100%",padding:"10px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Cancel</button>
                </div>
              )}
              {draftStep==="gathering-info" && (
                <div>
                  <h4 style={{color:"#ececec",fontSize:15,marginBottom:"8px",fontWeight:700}}>📝 Step 2: Provide Information</h4>
                  <div style={{maxHeight:"400px",overflowY:"auto",padding:"4px"}}>
                    <div style={{background:"#2a2a2a",padding:"14px",borderRadius:"8px",marginBottom:"14px",border:"1px solid #3a3a3a"}}>
                      <textarea placeholder={`Provide all necessary details for ${draftType}:

• Party names and addresses
• Terms and conditions
• Duration/timeline
• Special clauses
• Any other relevant information`} onChange={e=>setDraftRequirements({...draftRequirements,generalInfo:e.target.value})} style={{width:"100%",height:"200px",padding:"12px",background:"#1a1a1a",border:"1px solid #3a3a3a",color:"#ececec",borderRadius:"6px",fontSize:13,fontFamily:"inherit",lineHeight:"1.6",outline:"none",resize:"vertical"}}></textarea>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
                    <button onClick={()=>setDraftStep("type-selection")} style={{flex:1,padding:"11px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:13}}>← Back</button>
                    <button onClick={()=>generateDocument(draftRequirements)} disabled={draftGenerating}
                      style={{flex:2,padding:"11px",background:draftGenerating?"#333":"#BF0A30",color:"white",border:"none",borderRadius:"8px",cursor:draftGenerating?"not-allowed":"pointer",fontWeight:700,fontSize:13}}
                      onMouseEnter={e=>{if(!draftGenerating)e.currentTarget.style.background="#a00828";}} onMouseLeave={e=>{if(!draftGenerating)e.currentTarget.style.background="#BF0A30";}}>
                      {draftGenerating?"⏳ Generating...":"🚀 Generate with AI"}
                    </button>
                  </div>
                  <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{width:"100%",padding:"10px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:13,marginTop:"10px"}}>Cancel</button>
                </div>
              )}
              {draftStep==="generating" && (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <img src="/ark-logo-us.png" alt="ARK" style={{width:"60px",height:"60px",borderRadius:"50%",objectFit:"cover",marginBottom:"16px",opacity:0.7,animation:"pulse 2s infinite"}}/>
                  <h4 style={{color:"#ececec",fontSize:16,marginBottom:"12px",fontWeight:700}}>⏳ Generating Your Document...</h4>
                  <p style={{color:"#666",fontSize:13}}>AI is drafting a comprehensive, US law-compliant document.</p>
                </div>
              )}
              {draftStep==="completed" && (
                <div>
                  <h4 style={{color:"#ececec",fontSize:15,marginBottom:"8px",fontWeight:700}}>✅ Document Generated!</h4>
                  <textarea value={draftContent} onChange={e=>setDraftContent(e.target.value)} style={{width:"100%",height:"340px",padding:"14px",background:"#111",border:"1px solid #3a3a3a",color:"#ececec",borderRadius:"8px",marginBottom:"12px",fontSize:13,fontFamily:"'Times New Roman',serif",lineHeight:"1.8",outline:"none",resize:"vertical"}}></textarea>
                  <div style={{background:"rgba(191,10,48,0.15)",padding:"10px 14px",borderRadius:"8px",borderLeft:"3px solid #BF0A30",marginBottom:"14px"}}>
                    <div style={{color:"#BF0A30",fontSize:10,fontWeight:600,marginBottom:"3px"}}>⚠️ LEGAL DISCLAIMER</div>
                    <div style={{color:"#b4b4b4",fontSize:10,lineHeight:"1.5"}}>AI-generated for reference only. Review with a licensed US attorney before use.</div>
                  </div>
                  <div style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
                    <button onClick={()=>{setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{flex:1,padding:"11px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:12}}>🔄 New</button>
                    <button onClick={()=>downloadDraft("docx")} style={{flex:1,padding:"11px",background:"#BF0A30",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:12}} onMouseEnter={e=>e.currentTarget.style.background="#a00828"} onMouseLeave={e=>e.currentTarget.style.background="#BF0A30"}>📥 DOCX</button>
                    <button onClick={()=>downloadDraft("pdf")} style={{flex:1,padding:"11px",background:GOLD,color:NAVY,border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:12}}>📄 PDF</button>
                  </div>
                  <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{width:"100%",padding:"10px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showComparePopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#1a1a1a",borderRadius:"14px",width:"90%",maxWidth:"600px",maxHeight:"90vh",overflow:"auto",border:"2px solid #BF0A30",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",position:"relative"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"200px",height:"200px",borderRadius:"50%",objectFit:"cover"}}/>
            <div style={{padding:"18px 22px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #333",position:"sticky",top:0,background:"#1a1a1a",zIndex:2}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"34px",height:"34px",borderRadius:"50%",objectFit:"cover"}}/>
                <div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:GOLD}}>ARK LAW AI USA</div><div style={{fontSize:11,color:"#A8C0E8"}}>⚖️ Compare Legal Documents</div></div>
              </div>
              <button onClick={()=>setShowComparePopup(false)} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"20px 22px",position:"relative",zIndex:1}}>
              {[{label:"Document 1",setter:setDoc1,file:doc1},{label:"Document 2",setter:setDoc2,file:doc2}].map(({label,setter,file})=>(
                <div key={label} style={{marginBottom:"14px"}}>
                  <label style={{color:"#A8C0E8",fontSize:11,fontWeight:700,display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>📄 {label}</label>
                  <input type="file" accept=".pdf,.docx,.doc" onChange={e=>setter(e.target.files?.[0])} style={{width:"100%",padding:"8px 10px",background:"#2a2a2a",border:"1px solid #3a3a3a",color:"#ececec",borderRadius:"7px",fontSize:11,outline:"none"}}/>
                  {file && <div style={{marginTop:"4px",fontSize:10,color:file.size>5*1024*1024?"#EF4444":"#4CAF7D"}}>{file.name} — {(file.size/1024/1024).toFixed(2)}MB</div>}
                </div>
              ))}
              <div style={{marginBottom:"14px"}}>
                <label style={{color:"#A8C0E8",fontSize:11,fontWeight:700,display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>🎯 Focal Point</label>
                <input type="text" value={compareFocus} onChange={e=>setCompareFocus(e.target.value)} placeholder="e.g., payment terms, liability clauses..." style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",color:"#ececec",borderRadius:"7px",fontSize:12,outline:"none"}}/>
              </div>
              {comparingDocs && <div style={{padding:"16px",background:"#2a2a2a",borderRadius:"8px",textAlign:"center",marginBottom:"12px",color:"#b4b4b4",fontSize:13}}>⏳ Analyzing documents...</div>}
              {comparisonResult && !comparingDocs && (
                <div style={{marginBottom:"14px",padding:"14px",background:"#2a2a2a",borderRadius:"8px",border:"1px solid #3a3a3a"}}>
                  <div style={{color:"#ececec",fontSize:12,fontWeight:700,marginBottom:"8px"}}>📊 Comparison Report</div>
                  <div style={{color:"#b4b4b4",fontSize:11,lineHeight:"1.6",whiteSpace:"pre-wrap",maxHeight:"280px",overflowY:"auto"}}>{comparisonResult}</div>
                </div>
              )}
              <div style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
                <button onClick={compareDocuments} disabled={comparingDocs}
                  style={{flex:1,padding:"11px",background:comparingDocs?"#333":"#BF0A30",color:"white",border:"none",borderRadius:"8px",cursor:comparingDocs?"not-allowed":"pointer",fontWeight:700,fontSize:12}}
                  onMouseEnter={e=>{if(!comparingDocs)e.currentTarget.style.background="#a00828";}} onMouseLeave={e=>{if(!comparingDocs)e.currentTarget.style.background="#BF0A30";}}>
                  {comparingDocs?"⏳ Analyzing...":"🔍 Compare"}
                </button>
                {comparisonResult && <button onClick={downloadComparisonPDF} style={{flex:1,padding:"11px",background:GOLD,color:NAVY,border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:12}}>📄 Download</button>}
              </div>
              <button onClick={()=>{setShowComparePopup(false);setDoc1(null);setDoc2(null);setCompareFocus("");setComparisonResult("");}} style={{width:"100%",padding:"10px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#1a1a1a",padding:"28px 24px 22px",borderRadius:"14px",width:"90%",maxWidth:"400px",border:"2px solid #BF0A30",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",position:"relative",overflow:"hidden"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"200px",height:"200px",borderRadius:"50%",objectFit:"cover"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",position:"relative",zIndex:1}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:"36px",height:"36px",borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
              <div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:GOLD}}>ARK LAW AI USA</div><div style={{fontSize:11,color:"#A8C0E8"}}>Log in to your account</div></div>
            </div>
            <div style={{height:"1px",background:"linear-gradient(to right,transparent,#BF0A30,transparent)",marginBottom:"18px"}}/>
            <form style={{position:"relative",zIndex:1}} onSubmit={async(e)=>{
              e.preventDefault();
              const fd=new FormData(e.target);
              const email=fd.get("email");const password=fd.get("password");
              try{
                const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
                const data=await res.json();
                if(!res.ok){alert(data.error||"Invalid email or password");return;}
                const restoredTokens=data.user.tokens||500000;
                const userWithTokens={...data.user,tokens:restoredTokens};
                localStorage.setItem("arklaw_user",JSON.stringify(userWithTokens));
                setUser(userWithTokens);setUserTokens(restoredTokens);
                const localBackupUs=(()=>{try{return JSON.parse(localStorage.getItem("arklaw_sessions_us")||"[]");}catch{return [];}})();
                const serverHistoryUs=(data.user.chatHistory&&data.user.chatHistory.length>0)?data.user.chatHistory:localBackupUs;
                if(serverHistoryUs.length>0){
                  const greeting={role:"assistant",content:isUrdu?"Bienvenido a ARK Law AI USA — Su asistente legal de confianza para las leyes federales y estatales de EE.UU.

¿En qué puedo ayudarle hoy?":"Welcome to ARK Law AI USA — Your trusted AI legal companion for US federal and state law.

How may I assist you today?"};
                  const restoredSessions=serverHistoryUs.map(s=>({...s,messages:s.messages||[greeting]}));
                  setAllSessions(restoredSessions.slice(0,50));
                  if(restoredSessions.length>0){setActiveChatId(restoredSessions[0].id);setMessages(restoredSessions[0].messages);}
                }
                setShowLoginPopup(false);
                alert("Welcome back, "+data.user.name+"! You have "+restoredTokens.toLocaleString()+" credits remaining.");
              }catch(error){alert("Login failed. Please try again.");}
            }}>
              <div style={{marginBottom:"11px"}}>
                <label style={{color:"#A8C0E8",fontSize:11,display:"block",marginBottom:"5px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Email Address</label>
                <input name="email" type="email" required style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"7px",color:"#ececec",fontSize:13,outline:"none"}} placeholder="your@email.com"/>
              </div>
              <div style={{marginBottom:"16px"}}>
                <label style={{color:"#A8C0E8",fontSize:11,display:"block",marginBottom:"5px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Password</label>
                <input name="password" type="password" required style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"7px",color:"#ececec",fontSize:13,outline:"none"}} placeholder="Enter your password"/>
              </div>
              <button type="submit" style={{width:"100%",padding:"11px",background:"#BF0A30",color:"white",border:"none",borderRadius:"7px",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:"10px"}} onMouseEnter={e=>e.currentTarget.style.background="#a00828"} onMouseLeave={e=>e.currentTarget.style.background="#BF0A30"}>Log in</button>
              <button type="button" onClick={()=>setShowLoginPopup(false)} style={{width:"100%",padding:"9px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"7px",cursor:"pointer",fontSize:13,marginBottom:"12px"}}>Cancel</button>
              <p style={{textAlign:"center",color:"#666",fontSize:12,margin:0}}>Don't have an account?{" "}<span onClick={()=>{setShowLoginPopup(false);setShowSignupPopup(true);}} style={{color:"#4CAF7D",cursor:"pointer",textDecoration:"underline",fontWeight:600}}>Sign up</span></p>
            </form>
          </div>
        </div>
      )}

      {/* SIGNUP POPUP */}
      {showSignupPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#1a1a1a",padding:"22px 24px 18px",borderRadius:"14px",width:"90%",maxWidth:"480px",border:"2px solid #BF0A30",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",maxHeight:"92vh",overflowY:"auto",position:"relative",overflow:"hidden"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"200px",height:"200px",borderRadius:"50%",objectFit:"cover"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px",position:"relative",zIndex:1}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:"34px",height:"34px",borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
              <div><div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:GOLD}}>ARK LAW AI USA</div><div style={{fontSize:10,color:"#A8C0E8"}}>Create your free account — 500,000 credits</div></div>
            </div>
            <div style={{height:"1px",background:"linear-gradient(to right,transparent,#BF0A30,transparent)",marginBottom:"14px"}}/>
            <form style={{position:"relative",zIndex:1}} onSubmit={async(e)=>{
              e.preventDefault();
              const fd=new FormData(e.target);
              try{
                const res=await fetch("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fd.get("email"),password:fd.get("password"),name:fd.get("name"),profession:fd.get("profession"),barOfPractice:"",city:fd.get("city"),province:fd.get("province"),country:"United States"})});
                const data=await res.json();
                if(res.ok){setShowSignupPopup(false);alert("Account created! 500,000 FREE credits awarded! Please log in.");setShowLoginPopup(true);}
                else{alert(data.error||"Signup failed.");}
              }catch(error){alert("Signup failed: "+error.message);}
            }}>
              {[{l:"Email *",n:"email",t:"email",ph:"your@email.com"},{l:"Password * (min 6 chars)",n:"password",t:"password",ph:"Minimum 6 characters"},{l:"Full Name *",n:"name",t:"text",ph:"Your full name"}].map(({l,n,t,ph})=>(
                <div key={n} style={{marginBottom:"10px"}}>
                  <label style={{color:"#A8C0E8",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>{l}</label>
                  <input name={n} type={t} required={true} minLength={n==="password"?6:undefined} style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"7px",color:"#ececec",fontSize:13,outline:"none"}} placeholder={ph}/>
                </div>
              ))}
              <div style={{marginBottom:"10px"}}>
                <label style={{color:"#A8C0E8",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Profession *</label>
                <select name="profession" required style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"7px",color:"#ececec",fontSize:13,outline:"none",cursor:"pointer"}}>
                  <option value="">Select profession...</option>
                  <option>Attorney</option><option>Paralegal</option><option>Legal Assistant</option><option>Law Clerk</option><option>Law Student</option><option>Judge</option><option>Other</option>
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <div>
                  <label style={{color:"#A8C0E8",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>City *</label>
                  <input name="city" type="text" required style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"7px",color:"#ececec",fontSize:13,outline:"none"}} placeholder="e.g., New York"/>
                </div>
                <div>
                  <label style={{color:"#A8C0E8",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>State *</label>
                  <select name="province" required style={{width:"100%",padding:"9px 12px",background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"7px",color:"#ececec",fontSize:13,outline:"none",cursor:"pointer"}}>
                    <option value="">Select state...</option>
                    {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" style={{width:"100%",padding:"11px",background:"#BF0A30",color:"white",border:"none",borderRadius:"7px",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:"8px"}} onMouseEnter={e=>e.currentTarget.style.background="#a00828"} onMouseLeave={e=>e.currentTarget.style.background="#BF0A30"}>Create Account — 500,000 Free Credits ✨</button>
              <button type="button" onClick={()=>setShowSignupPopup(false)} style={{width:"100%",padding:"9px",background:"#2a2a2a",color:"#b4b4b4",border:"1px solid #3a3a3a",borderRadius:"7px",cursor:"pointer",fontSize:13,marginBottom:"10px"}}>Cancel</button>
              <p style={{textAlign:"center",color:"#666",fontSize:11,margin:0}}>Already have an account?{" "}<span onClick={()=>{setShowSignupPopup(false);setShowLoginPopup(true);}} style={{color:"#4CAF7D",cursor:"pointer",textDecoration:"underline",fontWeight:600}}>Log in</span></p>
            </form>
          </div>
        </div>
      )}

      {/* MY ACCOUNT POPUP */}
      {showMyAccountPopup && user && (
        <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)",pointerEvents:"all"}}>
          <div style={{background:"#1a1a1a",borderRadius:"16px",width:"92%",maxWidth:"680px",maxHeight:"88vh",display:"flex",flexDirection:"column",border:"2px solid #BF0A30",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",overflow:"hidden",position:"relative"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"260px",height:"260px",borderRadius:"50%",objectFit:"cover"}}/>
            <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #333",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,position:"relative",zIndex:1,background:"#1a1a1a"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover"}}/>
                <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:GOLD}}>ARK LAW AI USA <span style={{fontSize:11,fontWeight:400,color:"#A8C0E8"}}>/ My Account</span></div>
              </div>
              <button onClick={()=>setShowMyAccountPopup(false)} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{height:"1px",background:"linear-gradient(to right,transparent,#BF0A30,transparent)",flexShrink:0}}/>
            <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative",zIndex:1}}>
              <div style={{flex:"0 0 52%",padding:"14px 16px",overflowY:"auto",borderRight:"1px solid #2a2a2a"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                  <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,#BF0A30,#8B0000)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"19px",fontWeight:700,color:"white",flexShrink:0}}>{user.name.charAt(0).toUpperCase()}</div>
                  <div><div style={{color:"#ececec",fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"}}>{user.name}</div><div style={{color:"#666",fontSize:10,marginTop:"2px"}}>{user.email}</div></div>
                </div>
                <div style={{background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"10px",padding:"10px 12px",marginBottom:"10px"}}>
                  <div style={{fontSize:10,color:"#A8C0E8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"7px"}}>⚡ Credit Balance</div>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
                    <div style={{flex:1,height:"6px",background:"#333",borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:String(Math.max(2,(userTokens/500000)*100))+"%",background:userTokens>100000?"#4CAF7D":"#C9A84C",borderRadius:"3px"}}></div>
                    </div>
                    <span style={{fontSize:13,fontWeight:800,color:"#ececec",fontFamily:"Georgia,serif"}}>{userTokens.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize:9,color:"#666"}}>{Math.round((userTokens/500000)*100)}% of 500,000 credits remaining</div>
                </div>
                <div style={{background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"10px",padding:"10px 12px",marginBottom:"12px"}}>
                  <div style={{fontSize:10,color:"#A8C0E8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Profile</div>
                  {[{k:"Profession",v:user.profession},{k:"City",v:user.city},{k:"State",v:user.province},{k:"Country",v:user.country||"United States"}].filter(x=>x.v).map(({k,v})=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #333",paddingBottom:"5px",marginBottom:"5px"}}>
                      <span style={{fontSize:9,color:"#666",textTransform:"uppercase"}}>{k}</span>
                      <span style={{fontSize:11,color:"#ececec",fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogout} style={{width:"100%",padding:"10px",background:"#DC2626",color:"white",border:"none",borderRadius:"8px",fontWeight:700,fontSize:13,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#b91c1c"} onMouseLeave={e=>e.currentTarget.style.background="#DC2626"}>🚪 Logout &amp; Save History</button>
              </div>
              <div style={{flex:"0 0 48%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <div style={{padding:"12px 14px",borderBottom:"1px solid #2a2a2a",flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#ececec",textTransform:"uppercase",letterSpacing:"0.5px"}}>💬 Chat History</div>
                  <div style={{fontSize:9,color:"#666",marginTop:"2px"}}>Your saved conversations</div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
                  {allSessions.filter(s=>s.messages.some(m=>m.role==="user")).length===0
                    ?<div style={{textAlign:"center",padding:"24px 12px",color:"#444"}}><div style={{fontSize:28,marginBottom:"6px",opacity:0.4}}>💬</div><div style={{fontSize:11}}>No conversations yet</div></div>
                    :allSessions.filter(s=>s.messages.some(m=>m.role==="user")).map(session=>(
                      <div key={session.id} onClick={()=>{loadSession(session.id);setShowMyAccountPopup(false);}} style={{background:"#2a2a2a",padding:"8px 10px",borderRadius:"8px",border:"1px solid #333",cursor:"pointer",marginBottom:"5px"}} onMouseEnter={e=>e.currentTarget.style.background="#333"} onMouseLeave={e=>e.currentTarget.style.background="#2a2a2a"}>
                        <div style={{color:"#ececec",fontSize:11,fontWeight:600,marginBottom:"2px"}}>{session.title}</div>
                        <div style={{color:"#666",fontSize:9}}>{session.messages.filter(m=>m.role==="user").length} message(s)</div>
                      </div>
                    ))
                  }
                </div>
                <div style={{padding:"8px 10px",borderTop:"1px solid #2a2a2a",background:"#1a1a1a",flexShrink:0,textAlign:"center"}}>
                  <span style={{fontSize:9,color:"#444",fontStyle:"italic"}}>✓ History auto-saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComingSoon && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000}} onClick={()=>setShowComingSoon(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1a1a1a",borderRadius:"16px",padding:"40px 36px",maxWidth:"400px",width:"90%",textAlign:"center",border:"2px solid #BF0A30",boxShadow:"0 0 60px rgba(191,10,48,0.3)"}}>
            <button onClick={()=>setShowComingSoon(false)} style={{position:"absolute",top:"16px",right:"18px",background:"none",border:"none",color:"#666",fontSize:24,cursor:"pointer"}}>✕</button>
            <img src="/ark-logo-us.png" alt="ARK" style={{width:"64px",height:"64px",borderRadius:"50%",objectFit:"cover",marginBottom:"16px"}}/>
            <div style={{fontSize:20,fontWeight:700,color:"#ececec",marginBottom:"8px"}}>Coming Soon!</div>
            <div style={{fontSize:13,color:"#666",lineHeight:1.7,marginBottom:"24px"}}>We're working on something great. Stay tuned.</div>
            <button onClick={()=>setShowComingSoon(false)} style={{padding:"10px 32px",background:"#BF0A30",color:"white",border:"none",borderRadius:"8px",fontWeight:700,fontSize:14,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#a00828"} onMouseLeave={e=>e.currentTarget.style.background="#BF0A30"}>Got it!</button>
          </div>
        </div>
      )}

    </>
  );
}
