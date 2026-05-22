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
  const RED_US = "#006A4E";

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


// News Widget for Bangladesh
const BD_FALLBACK_NEWS = [
  { title: "Bangladesh Supreme Court issues landmark ruling on constitutional rights", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "High Court clarifies property law under Transfer of Property Act 1882", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "NBR announces new income tax filing guidelines", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "Labour Court rules on worker compensation under Labour Act 2006", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "Family Court streamlines divorce proceedings under Muslim Family Law", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "Anti-Corruption Commission files charges in major case", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "Bangladesh Bank issues new regulatory guidelines", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" },
  { title: "Land Reform Board announces new property registration rules", source: "Daily Star", url: "https://news.google.com/search?q=Bangladesh+legal+news" }
];

function BDNewsWidget() {
  const [h, setH] = useState(BD_FALLBACK_NEWS);
  const [pos, setPos] = useState(0);
  const [exp, setExp] = useState(false);
  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://www.thedailystar.net/rss.xml") + "&count=8");
        const d = await res.json();
        if (d && d.status === "ok" && d.items && d.items.length > 0)
          setH(d.items.map(x => ({ title: x.title, source: "Daily Star", url: x.link })));
      } catch(e) {}
    };
    go();
    const iv = setInterval(go, 300000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (!h.length || exp) return;
    const id = setInterval(() => setPos(p => (p + 1) % h.length), 4000);
    return () => clearInterval(id);
  }, [h, exp]);
  return (
    <div style={{ position:"absolute", top:"12px", right:"12px", zIndex:10, width:"230px", background:"rgba(240,234,220,0.97)", border:"1px solid rgba(120,120,180,0.4)", borderRadius:"10px", boxShadow:"0 4px 24px rgba(0,0,0,0.5)", overflow:"hidden", fontFamily:"Segoe UI,sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", background:"#006A4E", cursor:"pointer" }} onClick={() => setExp(e => !e)}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"white", animation:"pulse 1.5s infinite" }} />
          <span style={{ fontSize:10, fontWeight:700, color:"white", letterSpacing:"1px" }}>LIVE</span>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.85)" }}> · Bangladesh Legal News</span>
        </div>
        <span style={{ fontSize:12, color:"white" }}>{exp ? "▲" : "▼"}</span>
      </div>
      {!exp && h[pos] && (
        <div style={{ padding:"8px 10px", minHeight:"60px" }}>
          <div style={{ fontSize:11, color:"#1A1209", lineHeight:1.45, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{h[pos].title}</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"5px" }}>
            <span style={{ fontSize:9, color:"#88aaff", fontWeight:700 }}>{h[pos].source}</span>
            <a href={h[pos].url} target="_blank" rel="noopener noreferrer" style={{ fontSize:9, color:"#9DB8E8", textDecoration:"none" }}>Read ↗</a>
          </div>
          <div style={{ display:"flex", gap:"3px", marginTop:"5px", justifyContent:"center" }}>
            {h.slice(0,8).map((_, i) => <div key={i} onClick={() => setPos(i)} style={{ width:"5px", height:"5px", borderRadius:"50%", cursor:"pointer", background: i===pos ? "white" : "rgba(255,255,255,0.3)" }} />)}
          </div>
        </div>
      )}
      {exp && (
        <div style={{ maxHeight:"280px", overflowY:"auto" }}>
          {h.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ display:"block", padding:"8px 10px", textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.06)", background: i%2===0 ? "rgba(10,30,60,0.5)" : "transparent" }}>
              <div style={{ fontSize:11, color:"#1A1209", lineHeight:1.4, marginBottom:"3px" }}>{item.title}</div>
              <span style={{ fontSize:9, color:"#88aaff", fontWeight:700 }}>{item.source}</span>
            </a>
          ))}
        </div>
      )}
      <div style={{ padding:"4px 10px", background:"rgba(220,212,198,0.95)", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:8, color:"#556688", fontStyle:"italic" }}>Daily Star · 5 min</span>
        <a href="https://news.google.com/search?q=Bangladesh+legal+news" target="_blank" rel="noopener noreferrer" style={{ fontSize:8, color:"#88aaff", textDecoration:"none", fontWeight:700 }}>more ↗</a>
      </div>
    </div>
  );
}

const PRACTICE_AREAS_BD = [
  { id: "general", label: "General Legal", icon: "⚖️" },
  { id: "criminal", label: "Criminal Law", icon: "🔒" },
  { id: "corporate", label: "Corporate & Business", icon: "🏢" },
  { id: "family", label: "Family Law", icon: "👨‍👩‍👧" },
  { id: "property", label: "Property Law", icon: "🏠" },
  { id: "labour", label: "Labour Laws", icon: "👷" },
  { id: "taxation", label: "Taxation", icon: "💰" },
  { id: "constitution", label: "Constitutional Law", icon: "📜" },
];
const QUICK_QUERIES_BD = [
  "What are my rights as a tenant in Bangladesh?",
  "How do I file a case in Bangladesh court?",
  "What is the divorce procedure in Bangladesh?",
  "Explain inheritance laws in Bangladesh",
  "What are employment rights under Bangladesh law?",
  "How to draft a will in Bangladesh?",
  "What is a power of attorney in Bangladesh?",
  "Explain contract law in Bangladesh",
];
const BD_LOCAL_QUERIES = QUICK_QUERIES_BD;
const BD_LOCAL_AREAS = PRACTICE_AREAS_BD.map(a => a.label);

export default function AppBD() {
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
  const [sidebarOpen,        setSidebarOpen]        = useState(true);
  const [showSharePopup,     setShowSharePopup]     = useState(false);
  const [shareSelected,      setShareSelected]      = useState([]);
  const [shareSelectAll,     setShareSelectAll]     = useState(false);
  const [showChatMenu,       setShowChatMenu]       = useState(false);
  const [sessionMenu,       setSessionMenu]       = useState(null);
  const [searchQuery,       setSearchQuery]       = useState("");
  const [showSearchPopup,   setShowSearchPopup]   = useState(false);

  // ── Custom modal system (replaces alert/confirm/prompt) ──────────────────────
  const [arkModal, setArkModal] = useState(null);
  // arkModal: {type:"alert"|"confirm"|"prompt", title, message, icon, resolve, inputVal, inputPlaceholder, confirmLabel, confirmColor}

  const arkAlert = (message, title="ARK LAW AI", icon="ℹ️") => new Promise(resolve => {
    setArkModal({type:"alert", title, message, icon, resolve});
  });
  const arkConfirm = (message, title="ARK LAW AI", icon="❓", confirmLabel="Confirm", confirmColor="#1A1209") => new Promise(resolve => {
    setArkModal({type:"confirm", title, message, icon, confirmLabel, confirmColor, resolve});
  });
  const arkPrompt = (message, defaultVal="", title="ARK LAW AI", placeholder="") => new Promise(resolve => {
    setArkModal({type:"prompt", title, message, icon:"✏️", resolve, inputVal:defaultVal, inputPlaceholder:placeholder});
  });



  useEffect(()=>{
    const handler=(e)=>{
      if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setShowSearchPopup(true);}
      if(e.key==="Escape"){setShowSearchPopup(false);setSearchQuery("");}
    };
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[]);
  const [bdTheme, setBdTheme] = useState("chatgpt");
  useEffect(() => {
    try {
      const t = localStorage.getItem("arklaw_bd_theme");
      if (t === "classic" || t === "chatgpt") setBdTheme(t);
    } catch {}
  }, []);

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
      const savedTheme = localStorage.getItem("arklaw_bd_theme");
      if (savedTheme === "classic" || savedTheme === "chatgpt") setUsTheme(savedTheme);
    } catch {}
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("beforeinstallprompt", handleInstallPrompt); };
  }, []);

  useEffect(() => {
    const greeting = { role: "assistant", content: isUrdu ? "Welcome to ARK Law AI Bangladesh  -  How can I help you today?" : "Welcome to ARK Law AI Bangladesh  -  Your trusted AI legal companion for Bangladesh law.\n\nHow may I assist you today?" };
    try {
      const saved = JSON.parse(localStorage.getItem("arklaw_sessions_bd") || "[]");
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

  // Load shared chat from URL ?share=xxx
  useEffect(() => {
    const shareId = router.query?.share;
    if (!shareId) return;
    fetch("/api/share?id="+shareId)
      .then(r=>r.json())
      .then(data=>{
        if(!data.chat) return;
        try{
          const chat = data.chat;
          const msgs = typeof chat.messages==="string" ? JSON.parse(chat.messages) : chat.messages;
          const sharedId = Date.now();
          const sharedSession = {
            id: sharedId,
            title: chat.title || "Shared Chat",
            messages: msgs,
            isShared: true,
          };
          setAllSessions(prev=>[sharedSession,...prev]);
          setActiveChatId(sharedId);
          setMessages(msgs);
          router.replace("/bangladesh", undefined, {shallow:true});
          arkAlert("Shared conversation loaded! You can continue this chat below.", "Shared Chat Loaded", "✅");
        }catch(e){console.error("Failed to load shared chat",e);}
      })
      .catch(()=>{});
  }, [router.query?.share]);

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
      try { localStorage.setItem("arklaw_sessions_bd", JSON.stringify(updated.slice(0, 50))); } catch {}
      return updated;
    });
  }, [messages, activeChatId]);

  useEffect(() => { fetchNewsHeadlines(); }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchNewsHeadlines = async () => { setNewsItems(newsDatabase.map(item => item.headline)); };

  const startNewChat = () => {
    const greeting = { role: "assistant", content: isUrdu ? "Welcome to ARK Law AI Bangladesh  -  How can I help you today?" : "Welcome to ARK Law AI Bangladesh  -  Your trusted AI legal companion for Bangladesh law.\n\nHow may I assist you today?" };
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
    if (isIOS || isSafari) arkAlert("1. Tap the Share button ( ⎦↑ ) at the bottom of Safari\n2. Scroll down and tap \"Add to Home Screen\"\n3. Tap \"Add\" - done! ✅", "Install on iPhone / iPad", "📲");
    else if (isFirefox) arkAlert("1. Tap the three-dot menu ( ⋮ ) in the address bar\n2. Tap \"Install\" or \"Add to Home Screen\"\n3. Tap \"Add\" - done! ✅", "Install on Firefox", "📲");
    else if (isSamsungBrowser) arkAlert("1. Tap the three-line menu ( ☰ ) at the bottom\n2. Tap \"Add page to\" then \"Home screen\"\n3. Tap \"Add\" - done! ✅", "Install on Samsung Browser", "📲");
    else arkAlert("On Android Chrome:\n1. Tap the three-dot menu at top right\n2. Tap \"Add to Home screen\" then \"Add\"\n\nOn Desktop Chrome / Edge:\n1. Look for the install icon in the address bar\n2. Click it and follow the prompt.", "Install ARK LAW AI", "\xf0\x9f\x93\xb2");
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

  // ── Logout  -  saves tokens first ──
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
        ? "IMPORTANT: The user has selected Bangla. You MUST respond entirely in Bangla (Bengali). All your answers, explanations, disclaimers, and suggestions must be in Bangla. Do not switch to English unless the user explicitly asks."
        : "Respond in English.";
      const systemNote = `[System: Today is ${currentDate.current}. You are ARK Law AI Bangladesh, an expert legal assistant specializing EXCLUSIVELY in Bangladesh law  -  Constitution, IPC, CPC, and all applicable Bangladesh statutes. You ONLY answer questions about Bangladesh law. If asked about other countries, politely decline. Always title disclaimers "Professional Disclaimer by ARK LAW AI Bangladesh". Reference relevant Bangladesh statutes and case law. ${langInstruction}]`;
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
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) { arkAlert("Voice recognition is not supported on this browser.\nPlease use Chrome or Edge for best experience.", "ARK LAW AI", "🎤"); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart  = () => setIsListening(true);
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror  = (event) => { setIsListening(false); if (event.error === "no-speech") arkAlert("No speech detected. Please speak clearly and try again.", "Voice Input", "🎤"); };
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
    } catch (error) { arkAlert("Failed to generate document. Please try again.", "Draft Documents", "📄"); setDraftStep("gathering-info"); }
    finally { setDraftGenerating(false); }
  };

  const downloadDraft = (format) => {
    const timestamp = new Date().toLocaleDateString("en-PK");
    let content = `ARK LAW AI Bangladesh - LEGAL DOCUMENT DRAFT\n${"=".repeat(50)}\n\nDocument Type: ${draftType.toUpperCase()}\nTitle: ${draftTitle}\nCreated: ${timestamp}\nJurisdiction: United States of America\n\n${"=".repeat(50)}\n\n${draftContent}\n\n${"=".repeat(50)}\nThis document was generated by ARK Law AI USA and should be reviewed by a licensed US attorney before execution.`;
    if (format === "pdf") { window.print(); return; }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ARK_${draftType}_${Date.now()}.${format === "doc" ? "doc" : "docx"}`; a.click();
    URL.revokeObjectURL(url);
  };

  const compareDocuments = async () => {
    if (!doc1 || !doc2) { arkAlert("Please upload both documents before comparing.", "Compare Documents", "📋"); return; }
    if (!compareFocus.trim()) { arkAlert("Please specify a focal point for comparison.", "Compare Documents", "📋"); return; }
    const maxSize = 5 * 1024 * 1024;
    if (doc1.size > maxSize) { arkAlert("Document 1 exceeds the 5MB limit. Please upload a smaller file.", "File Too Large", "⚠️"); return; }
    if (doc2.size > maxSize) { arkAlert("Document 2 exceeds the 5MB limit. Please upload a smaller file.", "File Too Large", "⚠️"); return; }
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
        <title>ARK LAW AI Bangladesh - Legal Assistant</title>
        <meta name="description" content="ARK Law AI: Expert AI legal assistant for Bangladesh law." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-512.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-512.png" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Pro:ital,wght@0,300;1,300&family=DM+Sans:wght@700;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#212121" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="ARK Law AI" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');});}` }} />
      </Head>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;background:#F5F0E8;color:#1A1209;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
        #__next{height:100%;overflow:hidden;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#C0B49A;border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:#A89880;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes taglineShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
        @keyframes taglineFadeIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}
        .sb-item{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:13.5px;color:#2A1E10;transition:background 0.15s;text-decoration:none;width:100%;border:none;background:transparent;text-align:left;}
        .sb-item:hover{background:#D8D0C4;}.sb-item:hover button[id^="sm-"]{opacity:1!important;}
        .sb-item.active{background:#D8D0C4;}
        .msg-wrap{max-width:720px;margin:0 auto;padding:0 16px;}
        .msg-actions{opacity:0;transition:opacity 0.15s;}
        .msg-row:hover .msg-actions{opacity:1;}
        .qcard{background:#FFFFFF;border:1px solid #C0B49A;border-radius:10px;padding:9px 12px;cursor:pointer;transition:background 0.15s;text-align:left;}
        .qcard:hover{background:#F0EBE0;}
        .input-wrap{background:#FFFFFF;border:1px solid #C0B49A;border-radius:16px;transition:border-color 0.2s;}
        .input-wrap:focus-within{border-color:#006A4E;}
        @media(max-width:768px){.sidebar-desktop{display:none!important;}}
      `}</style>

      {/* ═══════════════════ CHATGPT THEME ═══════════════════ */}
      {bdTheme === "chatgpt" && (
      <div style={{display:"flex",height:"100vh",background:"#F5F0E8",color:"#1A1209",overflow:"hidden"}}>

        {/* ═══════════════════════════════════════════
            SIDEBAR
        ═══════════════════════════════════════════ */}
        {/* Sidebar toggle when closed */}
        {!sidebarOpen && !isMobile && (
          <div style={{width:"46px",background:"#EDE8DF",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:"10px",borderRight:"1px solid #C8BFB0",flexShrink:0,gap:"8px"}}>
            <button onClick={()=>setSidebarOpen(true)} title="Open sidebar"
              style={{width:"30px",height:"30px",background:"transparent",border:"none",cursor:"pointer",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",color:"#7A6A55",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#D8D0C4";e.currentTarget.style.color="#1A1209";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#7A6A55";}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button onClick={startNewChat} title="New chat"
              style={{width:"30px",height:"30px",background:"transparent",border:"none",cursor:"pointer",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",color:"#7A6A55",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#D8D0C4";e.currentTarget.style.color="#1A1209";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#7A6A55";}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        )}
        <div className="sidebar-desktop" style={{width:sidebarOpen?"260px":"0px",minWidth:sidebarOpen?"260px":"0px",background:"#EDE8DF",display:"flex",flexDirection:"column",height:"100%",flexShrink:0,borderRight:sidebarOpen?"1px solid #C8BFB0":"none",overflow:"hidden",transition:"width 0.25s ease,min-width 0.25s ease"}}>

          {/* Logo + New Chat */}
          <div style={{padding:"10px 10px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,minWidth:"260px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:"30px",height:"30px",objectFit:"contain"}} />
              <span style={{fontSize:13,fontWeight:800,color:"#1A1209",fontFamily:"DM Sans,sans-serif",letterSpacing:"0.8px"}}>ARK LAW AI <img src="https://flagcdn.com/w40/bd.png" alt="BD" style={{width:"18px",height:"12px",borderRadius:"2px",marginLeft:"5px",verticalAlign:"middle"}}/></span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
              <button onClick={()=>setSidebarOpen(o=>!o)} title={sidebarOpen?"Close sidebar":"Open sidebar"}
                style={{width:"30px",height:"30px",background:"transparent",border:"none",cursor:"pointer",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",color:"#7A6A55",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#D8D0C4";e.currentTarget.style.color="#1A1209";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#7A6A55";}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <button onClick={startNewChat} title="New chat"
              style={{width:"34px",height:"34px",background:"transparent",border:"none",cursor:"pointer",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"#4A3A28",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#2f2f2f";e.currentTarget.style.color="#ececec";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#b4b4b4";}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            </div>
          </div>

          {/* Tools */}
          <div style={{padding:"4px 6px",flexShrink:0}}>
            <button className="sb-item" onClick={()=>setShowSearchPopup(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Search chats</span>
            </button>
            <button className="sb-item" onClick={()=>setShowComparePopup(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>
              <span>{isUrdu ? "দলিল তুলনা" : "Compare Documents"}</span>
            </button>
            <button className="sb-item" onClick={()=>setShowDraftPopup(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>{isUrdu ? "দলিল তৈরি" : "Draft Documents"}</span>
            </button>
            <button className="sb-item" onClick={()=>setShowPracticeAreas(p=>!p)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{isUrdu ? "আইনি বিষয়" : "Practice Areas"}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{marginLeft:"auto",transform:showPracticeAreas?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showPracticeAreas && (
              <div style={{marginLeft:"14px",paddingLeft:"10px",borderLeft:"1px solid #2f2f2f"}}>
                {PRACTICE_AREAS_BD.map((area,i)=>(
                  <button key={area.id} className="sb-item" style={{fontSize:12.5,padding:"5px 8px",color:"#4A3A28"}}
                    onClick={()=>{sendMessage(isUrdu?`Cuéntame sobre ${area.label} en los Estados Unidos`:`Tell me about ${area.label} in the United States`,true);setShowPracticeAreas(false);}}>
                    <span style={{fontSize:13}}>{area.icon}</span>
                    <span>{isUrdu ? BD_LOCAL_AREAS[i] : area.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{height:"1px",background:"#DDD6CB",margin:"6px 12px",flexShrink:0}}/>

          {/* Recents label */}
          <div style={{padding:"2px 16px 4px",flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:600,color:"#7A6A55",textTransform:"uppercase",letterSpacing:"0.6px"}}>{searchQuery?"Results":"Recents"}</span>
          </div>

          {/* Sessions list */}
          <div style={{flex:1,overflowY:"auto",padding:"0 6px"}} onClick={()=>setSessionMenu(null)}>
            {[...allSessions.filter(s=>!s.archived)].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)).length===0 ? (
              <div style={{padding:"16px 12px",color:"#7A6A55",fontSize:13,textAlign:"center"}}>{searchQuery?"No results found":"No conversations yet"}</div>
            ) : [...allSessions.filter(s=>!s.archived)].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)).map(s=>{
              const active=s.id===activeChatId;
              return(
                <div key={s.id} style={{position:"relative",group:true}}
                  onMouseLeave={()=>{const el=document.getElementById("sm-"+s.id); if(el) el.style.opacity="0";}}>
                  <button className={"sb-item"+(active?" active":"")}
                    onClick={()=>{loadSession(s.id);setSessionMenu(null);}}
                    onContextMenu={e=>{e.preventDefault();setSessionMenu({id:s.id,x:e.clientX,y:e.clientY});}}
                    style={{fontSize:13,color:active?"#1A1209":"#4A3A28",width:"100%",paddingRight:"30px"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{s.title}</span>
                  </button>
                  {/* Hover three-dot button */}
                  <button id={"sm-"+s.id}
                    onClick={e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setSessionMenu({id:s.id,x:r.right,y:r.bottom});}}
                    style={{position:"absolute",right:"4px",top:"50%",transform:"translateY(-50%)",width:"22px",height:"22px",background:active?"#D8D0C4":"transparent",border:"none",borderRadius:"5px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#7A6A55",opacity:0,transition:"opacity 0.15s",zIndex:2}}
                    onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.background="#D8D0C4";}}
                    onMouseLeave={e=>{e.currentTarget.style.background=active?"#D8D0C4":"transparent";}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom user section */}
          <div style={{padding:"8px",borderTop:"1px solid #C8BFB0",flexShrink:0}}>
            {!user ? (
              <div style={{display:"flex",gap:"6px",padding:"2px 4px"}}>
                <button onClick={()=>setShowLoginPopup(true)}
                  style={{flex:1,padding:"9px 0",background:"transparent",color:"#1A1209",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:500,transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#2f2f2f"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {isUrdu ? "লগ ইন" : "Log in"}
                </button>
                <button onClick={()=>setShowSignupPopup(true)}
                  style={{flex:1,padding:"9px 0",background:"#1A1209",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:600,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#3A2A18"} onMouseLeave={e=>e.currentTarget.style.background="#1A1209"}>
                  Sign up
                </button>
              </div>
            ) : (
              <div style={{padding:"4px 6px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px",borderRadius:"10px",cursor:"pointer",transition:"background 0.15s",position:"relative"}}
                  onClick={()=>{saveHistory(allSessions,userTokens);setShowMyAccountPopup(true);}}
                  onMouseEnter={e=>e.currentTarget.style.background="#D8D0C4"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#006A4E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white",flexShrink:0,letterSpacing:"0.5px"}}>
                    {(user.name||"U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1A1209",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                    <div style={{fontSize:11,color:"#8A7A65",marginTop:"1px"}}>Free</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();arkAlert("Upgrade plans are coming soon!\nYou will be able to unlock unlimited credits, priority support, and more.", "Upgrade ARK LAW AI", "🚀");}}
                    style={{padding:"5px 11px",background:"#FFFFFF",color:"#1A1209",border:"1px solid #C0B49A",borderRadius:"7px",cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="#F0EBE0";e.currentTarget.style.borderColor="#A89880";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#FFFFFF";e.currentTarget.style.borderColor="#C0B49A";}}>
                    Upgrade
                  </button>
                  {user?.email?.toLowerCase()==="khawer.profession@gmail.com" && (
                    <button onClick={e=>{e.stopPropagation();window.open("/admin","_blank");}}
                      style={{position:"absolute",top:"-6px",right:"-4px",padding:"2px 6px",background:"#DC2626",color:"white",border:"none",borderRadius:"4px",cursor:"pointer",fontSize:9,fontWeight:700}}>
                      Admin
                    </button>
                  )}
                </div>
                <div style={{padding:"4px 10px 2px",display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{flex:1,height:"3px",background:"#C8BFB0",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:Math.max(2,(userTokens/500000)*100)+"%",background:userTokens>100000?"#006A4E":"#C9A84C",borderRadius:"2px"}}/>
                  </div>
                  <span style={{fontSize:9,color:"#9A8A75",whiteSpace:"nowrap"}}>{userTokens.toLocaleString()} credits</span>
                </div>
              </div>
            )}
            {/* Back + Language */}
            <div style={{display:"flex",gap:"4px",marginTop:"4px",padding:"0 2px"}}>
              <button onClick={()=>router.push("/")}
                style={{padding:"6px 8px",background:"transparent",color:"#8A7A65",border:"none",cursor:"pointer",borderRadius:"6px",fontSize:11,display:"flex",alignItems:"center",gap:"4px",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#2f2f2f";e.currentTarget.style.color="#ececec";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#666";}}>
                ← 🌍
              </button>
              <select value={isUrdu?"bn":"en"} onChange={e=>setIsUrdu(e.target.value==="bn")}
                style={{flex:1,padding:"5px 8px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"6px",cursor:"pointer",fontSize:12,outline:"none"}}>
                <option value="en">🌐 English</option>
                <option value="bn">Bangla</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════ */}
        <div style={{flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",position:"relative",background:"#F5F0E8"}}>

                    {/* Top bar */}
          <div style={{padding:isMobile?"10px 14px":"8px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #C8BFB0",flexShrink:0,minHeight:"52px",background:"#EDE8DF",gap:"8px"}}>


            {/* Mobile logo */}
            {isMobile && (
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"28px",height:"28px",objectFit:"contain"}}/>
                <span style={{fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"}}>ARK LAW AI</span>
              </div>
            )}
            {/* Desktop tagline */}
            {!isMobile && (
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:"clamp(15px,1.6vw,20px)",fontWeight:700,letterSpacing:"3px",background:"linear-gradient(135deg,#C9A84C 0%,#FFE08A 40%,#C9A84C 60%,#B8860B 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"taglineShimmer 4s linear infinite",whiteSpace:"nowrap"}}>Joy Bangla</div>
                <div style={{width:"80px",height:"1px",background:"linear-gradient(to right,transparent,#006A4E,transparent)",marginTop:"3px"}}/>
                <div style={{fontSize:"10px",fontStyle:"italic",color:"#6A5A45",letterSpacing:"1.2px",marginTop:"2px"}}>Constitution of Bangladesh</div>
              </div>
            )}
            {/* Right: share + menu + mobile auth */}
            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,position:"relative"}}>

              {/* Three-dot menu */}
              {!isMobile && (
                <div style={{position:"relative"}}>
                  <button onClick={()=>setShowChatMenu(m=>!m)}
                    style={{width:"34px",height:"34px",background:showChatMenu?"#D8D0C4":"transparent",border:"none",cursor:"pointer",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"#7A6A55",transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="#D8D0C4";e.currentTarget.style.color="#1A1209";}}
                    onMouseLeave={e=>{if(!showChatMenu){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#7A6A55";}}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                  {showChatMenu && (
                    <div style={{position:"absolute",top:"40px",right:"0",background:"#FFFFFF",border:"1px solid #C8BFB0",borderRadius:"10px",boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:200,minWidth:"200px",padding:"6px 0",animation:"fadeSlideUp 0.15s ease"}}>
                      {/* Share item at top */}
                      <button onClick={()=>{setShowChatMenu(false);setShareSelected(messages.map((_,i)=>i));setShareSelectAll(true);setShowSharePopup(true);}}
                        style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"9px 16px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#2A1E10",textAlign:"left",transition:"background 0.1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                        Share
                      </button>
                      <div style={{height:"1px",background:"#E4DDD0",margin:"4px 0"}}/>
                      {[
                        {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>, label:"Start a group chat", action:()=>{
                          setShowChatMenu(false);
                          const gId=Date.now();
                          const gSession={id:gId,title:"Group Chat "+new Date().toLocaleDateString(),messages:[{role:"assistant",content:"Welcome to Group Chat! You can invite others to collaborate on this legal research session. Share the session link or discuss together."}],isGroup:true};
                          setAllSessions(prev=>[gSession,...prev]);
                          setActiveChatId(gId);
                          setMessages(gSession.messages);
                        }},
                        {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, label:"Pin chat", action:()=>{setShowChatMenu(false);const s=allSessions.find(s=>s.id===activeChatId);if(s){const pinned={...s,pinned:true,title:"📌 "+s.title.replace("📌 ","")};setAllSessions(prev=>prev.map(x=>x.id===activeChatId?pinned:x));}}},
                        {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, label:"Archive", action:()=>{setShowChatMenu(false);const s=allSessions.find(s=>s.id===activeChatId);if(s){setAllSessions(prev=>prev.map(x=>x.id===activeChatId?{...x,archived:true}:x));startNewChat();}}},
                        {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>, label:"Delete", red:true, action:()=>{setShowChatMenu(false);arkConfirm("Are you sure you want to delete this conversation?\nThis action cannot be undone.", "Delete Conversation", "🗑️", "Delete", "#DC2626").then(ok=>{if(ok){setAllSessions(prev=>prev.filter(s=>s.id!==activeChatId));startNewChat();}});}},
                      ].map(({icon,label,action,red})=>(
                        <button key={label} onClick={action}
                          style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"9px 16px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:red?"#DC2626":"#2A1E10",textAlign:"left",transition:"background 0.1s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          {icon}{label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {isMobile && !user && (
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>setShowLoginPopup(true)} style={{padding:"6px 12px",background:"transparent",color:"#1A1209",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:12}}>Log in</button>
                  <button onClick={()=>setShowSignupPopup(true)} style={{padding:"6px 12px",background:"#006A4E",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:12,fontWeight:600}}>Sign up</button>
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
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 20px 8px",animation:"fadeSlideUp 0.4s ease"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"60px",height:"60px",objectFit:"contain",marginBottom:"10px",filter:"drop-shadow(0 0 20px rgba(191,10,48,0.25))"}}/>
                <h2 style={{fontSize:"clamp(20px,3vw,30px)",fontWeight:600,color:"#1A1209",marginBottom:"8px",fontFamily:"Georgia,serif",textAlign:"center"}}>
                  {isUrdu ? "How can I help you today?" : "How can I help you today?"}
                </h2>
                <p style={{fontSize:14,color:"#8A7A65",marginBottom:"16px",textAlign:"center"}}>
                  {isUrdu ? "ARK Law AI Bangladesh" : "ARK Law AI Bangladesh  -  your expert legal assistant"}
                </p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"8px",width:"100%",maxWidth:"560px"}}>
                  {(isUrdu ? BD_LOCAL_QUERIES : QUICK_QUERIES_BD).slice(0,4).map((q,i)=>(
                    <button key={i} className="qcard" onClick={()=>sendMessage(q,true)}>
                      <div style={{fontSize:12,color:"#2A1E10",lineHeight:1.4,marginBottom:"5px"}}>{q}</div>
                      <div style={{fontSize:10,color:"#6A5A45",display:"flex",alignItems:"center",gap:"3px"}}>
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
                          <img src="/ark-logo-us.png" alt="ARK" style={{width:"30px",height:"30px",objectFit:"contain",border:"1px solid #C8BFB0"}}/>
                        ) : (
                          <div style={{width:"30px",height:"30px",borderRadius:"50%",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>
                            {user?.name?.charAt(0)?.toUpperCase()||"U"}
                          </div>
                        )}
                      </div>
                      {/* Text */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#1A1209",marginBottom:"5px"}}>
                          {msg.role==="assistant" ? "ARK Law AI" : (user?.name||"You")}
                        </div>
                        <div style={{fontSize:14.5,color:"#2A1E10",lineHeight:1.7}}>
                          {renderMessageContent(msg.content)}
                        </div>
                        {/* Actions */}
                        {msg.role==="assistant" && msg.content && (
                          <div className="msg-actions" style={{display:"flex",gap:"4px",marginTop:"10px",flexWrap:"wrap"}}>
                            <button onClick={()=>speakText(msg.content,i)}
                              style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 9px",background:"transparent",color:currentSpeakingIndex===i?"#006A4E":"#8A7A65",border:"1px solid #C8BFB0",borderRadius:"6px",cursor:"pointer",fontSize:12,transition:"all 0.15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor="#555";e.currentTarget.style.color="#ececec";}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.color=currentSpeakingIndex===i?"#4CAF7D":"#666";}}>
                              {currentSpeakingIndex===i
                                ?<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
                              <span>{currentSpeakingIndex===i?"Stop":"Listen"}</span>
                            </button>
                            <button onClick={e=>{e.stopPropagation();setReactions(prev=>({...prev,[i]:{...prev[i],like:!prev[i]?.like,dislike:false}}));}}
                              style={{padding:"4px 9px",background:reactions[i]?.like?"#1a3a1a":"transparent",color:reactions[i]?.like?"#4CAF7D":"#666",border:"1px solid #C8BFB0",borderRadius:"6px",cursor:"pointer",fontSize:12,transition:"all 0.15s"}}
                              onMouseEnter={e=>e.currentTarget.style.borderColor="#555"} onMouseLeave={e=>e.currentTarget.style.borderColor="#333"}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={reactions[i]?.like?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            </button>
                            <button onClick={e=>{e.stopPropagation();setReactions(prev=>({...prev,[i]:{...prev[i],dislike:!prev[i]?.dislike,like:false}}));}}
                              style={{padding:"4px 9px",background:reactions[i]?.dislike?"#3a1a1a":"transparent",color:reactions[i]?.dislike?"#EF4444":"#666",border:"1px solid #C8BFB0",borderRadius:"6px",cursor:"pointer",fontSize:12,transition:"all 0.15s"}}
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
                      <img src="/ark-logo-us.png" alt="ARK" style={{width:"30px",height:"30px",objectFit:"contain",flexShrink:0}}/>
                      <div style={{paddingTop:"6px",display:"flex",gap:"5px",alignItems:"center"}}>
                        {[0,1,2].map(i=>(
                          <div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:"#8A7A65",animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
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
          <div style={{padding:isMobile?"10px 12px 14px":"12px 24px 18px",background:"#F5F0E8",flexShrink:0}}>

            {/* Attached files */}
            {uploadedFiles.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"8px",maxWidth:"720px",margin:"0 auto 8px"}}>
                {uploadedFiles.map((file,idx)=>(
                  <div key={idx} style={{display:"flex",alignItems:"center",gap:"6px",padding:"4px 10px",background:"#E4DDD0",border:"1px solid #C0B49A",borderRadius:"8px",fontSize:12,color:"#2A1E10"}}>
                    <span>📎 {file.name}</span>
                    <button onClick={()=>setUploadedFiles(prev=>prev.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",color:"#8A7A65",cursor:"pointer",fontSize:15,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Input box */}
            <div className="input-wrap" style={{maxWidth:"720px",margin:"0 auto",padding:"10px 12px",display:"flex",alignItems:"flex-end",gap:"8px"}}>
              {/* Attach */}
              <label htmlFor="file-us" style={{cursor:"pointer",color:"#8A7A65",display:"flex",alignItems:"center",padding:"4px",borderRadius:"6px",flexShrink:0,transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="#ececec"} onMouseLeave={e=>e.currentTarget.style.color="#666"}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 16.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <input id="file-us" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" style={{display:"none"}} onChange={e=>{const files=Array.from(e.target.files);if(files.length)setUploadedFiles(prev=>[...prev,...files]);}}/>
              </label>

              {/* Textarea */}
              <textarea
                value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(180,e.target.scrollHeight)+"px";}}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                placeholder={isListening?(isUrdu?UR.listening:"Listening..."):uploadedFiles.length>0?`Ask about ${uploadedFiles.length} file(s)...`:(isUrdu?UR.placeholder:"Ask ARK Law AI about Bangladesh law...")}
                rows={1}
                style={{flex:1,background:"transparent",border:"none",color:"#1A1209",fontSize:15,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",maxHeight:"180px",overflowY:"auto"}}
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
                style={{width:"32px",height:"32px",borderRadius:"8px",background:(loading||(!input.trim()&&!uploadedFiles.length))?"#C8BFB0":"#006A4E",border:"none",cursor:(loading||(!input.trim()&&!uploadedFiles.length))?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                {loading
                  ?<div style={{width:"13px",height:"13px",border:"2px solid #666",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={(!input.trim()&&!uploadedFiles.length)?"#8A7A65":"white"} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                }
              </button>
            </div>

            <div style={{textAlign:"center",marginTop:"8px",fontSize:11,color:"#9A8A75"}}>
              {isUrdu ? "ARK Law AI ভুল করতে পারে। Verify important legal information." : "ARK Law AI Bangladesh may make mistakes. Verify important legal information."}
            </div>
          </div>
        </div>
      </div>
      )} {/* end chatgpt theme */}

      {/* Classic theme redirect */}
      {bdTheme === "classic" && (
        <div style={{display:"flex",height:"100vh",background:"#001F5B",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"16px"}}>
          <img src="/ark-logo-us.png" style={{width:64,height:64,borderRadius:"50%"}}/>
          <div style={{color:"#1A1209",fontFamily:"Georgia,serif",fontSize:20,fontWeight:700}}>Classic Theme</div>
          <div style={{color:"#5A4A35",fontSize:13}}>Loading classic Bangladesh UI...</div>
          <button onClick={()=>{localStorage.setItem("arklaw_bd_theme","classic");window.location.href="/bangladesh-classic";}} style={{padding:"10px 24px",background:"#006A4E",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:700}}>Open Classic Version →</button>
          <button onClick={()=>{setBdTheme("chatgpt");localStorage.setItem("arklaw_bd_theme","chatgpt");}} style={{padding:"8px 20px",background:"transparent",color:"#8A7A65",border:"1px solid #C8BFB0",borderRadius:"8px",cursor:"pointer",fontSize:12}}>← Back to ChatGPT Theme</button>
        </div>
      )} {/* end classic theme */}

      {/* ═══════════════════════════════════════════
          POPUPS (US theme  -  navy/red)
      ═══════════════════════════════════════════ */}

      {showNewsPopup && selectedNews && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#F0EBE0",borderRadius:"12px",width:"90%",maxWidth:"700px",maxHeight:"85vh",overflow:"auto",border:"2px solid #006A4E",boxShadow:"0 0 30px rgba(191,10,48,0.2)"}}>
            <div style={{background:"linear-gradient(135deg,#001F5B,#0d0d2b)",padding:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #006A4E"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"40px",height:"40px",objectFit:"contain"}}/>
                <div><div style={{color:"#1A1209",fontWeight:700,fontSize:14}}>ARK LAW AI Bangladesh</div><div style={{color:"#5A4A35",fontSize:9}}>Legal News Analysis</div></div>
              </div>
              <button onClick={()=>setShowNewsPopup(false)} style={{background:"none",border:"none",color:GOLD,fontSize:28,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"25px"}}>
              <p style={{color:GOLD,fontSize:15,fontWeight:700,marginBottom:"10px",lineHeight:"1.6"}}>{selectedNews.headline}</p>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"15px",padding:"10px",background:"#001F5B",borderRadius:"4px",borderLeft:"3px solid #006A4E"}}>
                <span style={{fontSize:10,color:"#5A4A35"}}>📰 Source:</span>
                <span style={{fontSize:11,color:"#006A4E",fontWeight:600}}>{selectedNews.source}</span>
              </div>
              <p style={{color:"#2A1E10",fontSize:13,lineHeight:"1.8",marginBottom:"15px",whiteSpace:"pre-wrap"}}>{selectedNews.fullText}</p>
              <div style={{borderTop:"1px solid #333",paddingTop:"15px"}}>
                <h4 style={{color:GOLD,fontSize:12,fontWeight:600,marginBottom:"8px"}}>⚖️ Legal Analysis:</h4>
                {newsLoading?<div style={{color:"#8A7A65",fontSize:13,textAlign:"center",padding:"20px"}}>⏳ Analyzing...</div>:<div style={{color:"#4A3A28",fontSize:13,lineHeight:"1.8",whiteSpace:"pre-wrap"}}>{newsAnalysis}</div>}
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
          <div style={{background:"#F5F0E8",borderRadius:"14px",width:"90%",maxWidth:"800px",maxHeight:"92vh",overflow:"auto",border:"2px solid #006A4E",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",position:"relative"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"260px",height:"260px",objectFit:"contain"}}/>
            <div style={{padding:"18px 22px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #C8BFB0",position:"sticky",top:0,background:"#F5F0E8",zIndex:2}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"36px",height:"36px",objectFit:"contain"}}/>
                <div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1A1209"}}>ARK LAW AI Bangladesh</div><div style={{fontSize:11,color:"#5A4A35"}}>✍️ AI Legal Document Drafting</div></div>
              </div>
              <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{background:"none",border:"none",color:"#8A7A65",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"20px 22px",position:"relative",zIndex:1}}>
              {draftStep==="type-selection" && (
                <div>
                  <h4 style={{color:"#1A1209",fontSize:15,marginBottom:"14px",fontWeight:700}}>📋 Step 1: Select Document Type</h4>
                  <select value={draftType} onChange={e=>setDraftType(e.target.value)} style={{width:"100%",padding:"11px",background:"#DDD6CB",border:"1px solid #C0B49A",color:"#1A1209",borderRadius:"8px",marginBottom:"10px",fontSize:13,cursor:"pointer",outline:"none"}}>
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
                  <button onClick={()=>{if(!draftType){arkAlert("Please select a document type to continue.", "Draft Documents", "📄");return;}setDraftStep("gathering-info");}} disabled={!draftType}
                    style={{width:"100%",padding:"12px",background:draftType?"#006A4E":"#333",color:"white",border:"none",borderRadius:"8px",cursor:draftType?"pointer":"not-allowed",fontWeight:700,fontSize:14,marginBottom:"10px"}}
                    onMouseEnter={e=>{if(draftType)e.currentTarget.style.background="#004d38";}} onMouseLeave={e=>{if(draftType)e.currentTarget.style.background="#006A4E";}}>
                    Next: Provide Information →
                  </button>
                  <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{width:"100%",padding:"10px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Cancel</button>
                </div>
              )}
              {draftStep==="gathering-info" && (
                <div>
                  <h4 style={{color:"#1A1209",fontSize:15,marginBottom:"8px",fontWeight:700}}>📝 Step 2: Provide Information</h4>
                  <div style={{maxHeight:"400px",overflowY:"auto",padding:"4px"}}>
                    <div style={{background:"#DDD6CB",padding:"14px",borderRadius:"8px",marginBottom:"14px",border:"1px solid #C0B49A"}}>
                      <textarea placeholder={"Provide all necessary details for " + draftType + ":\n\n• Party names and addresses\n• Terms and conditions\n• Duration/timeline\n• Special clauses\n• Any other relevant information"} onChange={e=>setDraftRequirements({...draftRequirements,generalInfo:e.target.value})} style={{width:"100%",height:"200px",padding:"12px",background:"#F5F0E8",border:"1px solid #C0B49A",color:"#1A1209",borderRadius:"6px",fontSize:13,fontFamily:"inherit",lineHeight:"1.6",outline:"none",resize:"vertical"}}></textarea>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
                    <button onClick={()=>setDraftStep("type-selection")} style={{flex:1,padding:"11px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13}}>← Back</button>
                    <button onClick={()=>generateDocument(draftRequirements)} disabled={draftGenerating}
                      style={{flex:2,padding:"11px",background:draftGenerating?"#333":"#006A4E",color:"white",border:"none",borderRadius:"8px",cursor:draftGenerating?"not-allowed":"pointer",fontWeight:700,fontSize:13}}
                      onMouseEnter={e=>{if(!draftGenerating)e.currentTarget.style.background="#004d38";}} onMouseLeave={e=>{if(!draftGenerating)e.currentTarget.style.background="#006A4E";}}>
                      {draftGenerating?"⏳ Generating...":"🚀 Generate with AI"}
                    </button>
                  </div>
                  <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{width:"100%",padding:"10px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13,marginTop:"10px"}}>Cancel</button>
                </div>
              )}
              {draftStep==="generating" && (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <img src="/ark-logo-us.png" alt="ARK" style={{width:"60px",height:"60px",objectFit:"contain",marginBottom:"16px",opacity:0.7,animation:"pulse 2s infinite"}}/>
                  <h4 style={{color:"#1A1209",fontSize:16,marginBottom:"12px",fontWeight:700}}>⏳ Generating Your Document...</h4>
                  <p style={{color:"#8A7A65",fontSize:13}}>AI is drafting a comprehensive, US law-compliant document.</p>
                </div>
              )}
              {draftStep==="completed" && (
                <div>
                  <h4 style={{color:"#1A1209",fontSize:15,marginBottom:"8px",fontWeight:700}}>✅ Document Generated!</h4>
                  <textarea value={draftContent} onChange={e=>setDraftContent(e.target.value)} style={{width:"100%",height:"340px",padding:"14px",background:"#111",border:"1px solid #C0B49A",color:"#1A1209",borderRadius:"8px",marginBottom:"12px",fontSize:13,fontFamily:"'Times New Roman',serif",lineHeight:"1.8",outline:"none",resize:"vertical"}}></textarea>
                  <div style={{background:"rgba(191,10,48,0.15)",padding:"10px 14px",borderRadius:"8px",borderLeft:"3px solid #006A4E",marginBottom:"14px"}}>
                    <div style={{color:"#006A4E",fontSize:10,fontWeight:600,marginBottom:"3px"}}>⚠️ LEGAL DISCLAIMER</div>
                    <div style={{color:"#4A3A28",fontSize:10,lineHeight:"1.5"}}>AI-generated for reference only. Review with a licensed US attorney before use.</div>
                  </div>
                  <div style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
                    <button onClick={()=>{setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{flex:1,padding:"11px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:12}}>🔄 New</button>
                    <button onClick={()=>downloadDraft("docx")} style={{flex:1,padding:"11px",background:"#006A4E",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:12}} onMouseEnter={e=>e.currentTarget.style.background="#004d38"} onMouseLeave={e=>e.currentTarget.style.background="#006A4E"}>📥 DOCX</button>
                    <button onClick={()=>downloadDraft("pdf")} style={{flex:1,padding:"11px",background:GOLD,color:NAVY,border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:12}}>📄 PDF</button>
                  </div>
                  <button onClick={()=>{setShowDraftPopup(false);setDraftStep("type-selection");setDraftContent("");setDraftRequirements({});}} style={{width:"100%",padding:"10px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showComparePopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#F5F0E8",borderRadius:"14px",width:"90%",maxWidth:"600px",maxHeight:"90vh",overflow:"auto",border:"2px solid #006A4E",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",position:"relative"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"200px",height:"200px",objectFit:"contain"}}/>
            <div style={{padding:"18px 22px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #C8BFB0",position:"sticky",top:0,background:"#F5F0E8",zIndex:2}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"34px",height:"34px",objectFit:"contain"}}/>
                <div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1A1209"}}>ARK LAW AI Bangladesh</div><div style={{fontSize:11,color:"#5A4A35"}}>⚖️ Compare Legal Documents</div></div>
              </div>
              <button onClick={()=>setShowComparePopup(false)} style={{background:"none",border:"none",color:"#8A7A65",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"20px 22px",position:"relative",zIndex:1}}>
              {[{label:"Document 1",setter:setDoc1,file:doc1},{label:"Document 2",setter:setDoc2,file:doc2}].map(({label,setter,file})=>(
                <div key={label} style={{marginBottom:"14px"}}>
                  <label style={{color:"#3A2A18",fontSize:11,fontWeight:700,display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>📄 {label}</label>
                  <input type="file" accept=".pdf,.docx,.doc" onChange={e=>setter(e.target.files?.[0])} style={{width:"100%",padding:"8px 10px",background:"#DDD6CB",border:"1px solid #C0B49A",color:"#1A1209",borderRadius:"7px",fontSize:11,outline:"none"}}/>
                  {file && <div style={{marginTop:"4px",fontSize:10,color:file.size>5*1024*1024?"#EF4444":"#4CAF7D"}}>{file.name}  -  {(file.size/1024/1024).toFixed(2)}MB</div>}
                </div>
              ))}
              <div style={{marginBottom:"14px"}}>
                <label style={{color:"#3A2A18",fontSize:11,fontWeight:700,display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>🎯 Focal Point</label>
                <input type="text" value={compareFocus} onChange={e=>setCompareFocus(e.target.value)} placeholder="e.g., payment terms, liability clauses..." style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",color:"#1A1209",borderRadius:"7px",fontSize:12,outline:"none"}}/>
              </div>
              {comparingDocs && <div style={{padding:"16px",background:"#DDD6CB",borderRadius:"8px",textAlign:"center",marginBottom:"12px",color:"#4A3A28",fontSize:13}}>⏳ Analyzing documents...</div>}
              {comparisonResult && !comparingDocs && (
                <div style={{marginBottom:"14px",padding:"14px",background:"#DDD6CB",borderRadius:"8px",border:"1px solid #C0B49A"}}>
                  <div style={{color:"#1A1209",fontSize:12,fontWeight:700,marginBottom:"8px"}}>📊 Comparison Report</div>
                  <div style={{color:"#4A3A28",fontSize:11,lineHeight:"1.6",whiteSpace:"pre-wrap",maxHeight:"280px",overflowY:"auto"}}>{comparisonResult}</div>
                </div>
              )}
              <div style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
                <button onClick={compareDocuments} disabled={comparingDocs}
                  style={{flex:1,padding:"11px",background:comparingDocs?"#333":"#006A4E",color:"white",border:"none",borderRadius:"8px",cursor:comparingDocs?"not-allowed":"pointer",fontWeight:700,fontSize:12}}
                  onMouseEnter={e=>{if(!comparingDocs)e.currentTarget.style.background="#004d38";}} onMouseLeave={e=>{if(!comparingDocs)e.currentTarget.style.background="#006A4E";}}>
                  {comparingDocs?"⏳ Analyzing...":"🔍 Compare"}
                </button>
                {comparisonResult && <button onClick={downloadComparisonPDF} style={{flex:1,padding:"11px",background:GOLD,color:NAVY,border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:12}}>📄 Download</button>}
              </div>
              <button onClick={()=>{setShowComparePopup(false);setDoc1(null);setDoc2(null);setCompareFocus("");setComparisonResult("");}} style={{width:"100%",padding:"10px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#F5F0E8",padding:"28px 24px 22px",borderRadius:"14px",width:"90%",maxWidth:"400px",border:"2px solid #006A4E",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",position:"relative",overflow:"hidden"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"200px",height:"200px",objectFit:"contain"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",position:"relative",zIndex:1}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:"36px",height:"36px",objectFit:"contain",flexShrink:0}}/>
              <div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1A1209"}}>ARK LAW AI Bangladesh</div><div style={{fontSize:11,color:"#5A4A35"}}>Log in to your account</div></div>
            </div>
            <div style={{height:"1px",background:"linear-gradient(to right,transparent,#006A4E,transparent)",marginBottom:"18px"}}/>
            <form style={{position:"relative",zIndex:1}} onSubmit={async(e)=>{
              e.preventDefault();
              const fd=new FormData(e.target);
              const email=fd.get("email");const password=fd.get("password");
              try{
                const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
                const data=await res.json();
                if(!res.ok){arkAlert(data.error||"Invalid email or password. Please try again.", "Login Failed", "❌");return;}
                const restoredTokens=data.user.tokens||500000;
                const userWithTokens={...data.user,tokens:restoredTokens};
                localStorage.setItem("arklaw_user",JSON.stringify(userWithTokens));
                setUser(userWithTokens);setUserTokens(restoredTokens);
                const localBackupUs=(()=>{try{return JSON.parse(localStorage.getItem("arklaw_sessions_bd")||"[]");}catch{return [];}})();
                const serverHistoryUs=(data.user.chatHistory&&data.user.chatHistory.length>0)?data.user.chatHistory:localBackupUs;
                if(serverHistoryUs.length>0){
                  const greeting={role:"assistant",content:isUrdu?"Welcome to ARK Law AI Bangladesh  -  How can I help you today?":"Welcome to ARK Law AI Bangladesh  -  Your trusted AI legal companion for Bangladesh law.\n\nHow may I assist you today?"};
                  const restoredSessions=serverHistoryUs.map(s=>({...s,messages:s.messages||[greeting]}));
                  setAllSessions(restoredSessions.slice(0,50));
                  if(restoredSessions.length>0){setActiveChatId(restoredSessions[0].id);setMessages(restoredSessions[0].messages);}
                }
                setShowLoginPopup(false);
                arkAlert("Welcome back, "+data.user.name+"!\n\nYou have "+restoredTokens.toLocaleString()+" credits remaining.", "Welcome Back 👋", "✅");
              }catch(error){arkAlert("Login failed. Please check your connection and try again.", "Login Error", "❌");}
            }}>
              <div style={{marginBottom:"11px"}}>
                <label style={{color:"#3A2A18",fontSize:11,display:"block",marginBottom:"5px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Email Address</label>
                <input name="email" type="email" required style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"7px",color:"#1A1209",fontSize:13,outline:"none"}} placeholder="your@email.com"/>
              </div>
              <div style={{marginBottom:"16px"}}>
                <label style={{color:"#3A2A18",fontSize:11,display:"block",marginBottom:"5px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Password</label>
                <input name="password" type="password" required style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"7px",color:"#1A1209",fontSize:13,outline:"none"}} placeholder="Enter your password"/>
              </div>
              <button type="submit" style={{width:"100%",padding:"11px",background:"#1A1209",color:"white",border:"none",borderRadius:"7px",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:"10px"}} onMouseEnter={e=>e.currentTarget.style.background="#3A2A18"} onMouseLeave={e=>e.currentTarget.style.background="#1A1209"}>Log in</button>
              <button type="button" onClick={()=>setShowLoginPopup(false)} style={{width:"100%",padding:"9px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"7px",cursor:"pointer",fontSize:13,marginBottom:"12px"}}>Cancel</button>
              <p style={{textAlign:"center",color:"#8A7A65",fontSize:12,margin:0}}>Don't have an account?{" "}<span onClick={()=>{setShowLoginPopup(false);setShowSignupPopup(true);}} style={{color:"#4CAF7D",cursor:"pointer",textDecoration:"underline",fontWeight:600}}>Sign up</span></p>
            </form>
          </div>
        </div>
      )}

      {/* SIGNUP POPUP */}
      {showSignupPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,pointerEvents:"all"}}>
          <div style={{background:"#F5F0E8",padding:"22px 24px 18px",borderRadius:"14px",width:"90%",maxWidth:"480px",border:"2px solid #006A4E",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",maxHeight:"92vh",overflowY:"auto",position:"relative",overflow:"hidden"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"200px",height:"200px",objectFit:"contain"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px",position:"relative",zIndex:1}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:"34px",height:"34px",objectFit:"contain",flexShrink:0}}/>
              <div><div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1A1209"}}>ARK LAW AI Bangladesh</div><div style={{fontSize:10,color:"#5A4A35"}}>Create your free account  -  500,000 credits</div></div>
            </div>
            <div style={{height:"1px",background:"linear-gradient(to right,transparent,#006A4E,transparent)",marginBottom:"14px"}}/>
            <form style={{position:"relative",zIndex:1}} onSubmit={async(e)=>{
              e.preventDefault();
              const fd=new FormData(e.target);
              try{
                const res=await fetch("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fd.get("email"),password:fd.get("password"),name:fd.get("name"),profession:fd.get("profession"),barOfPractice:"",city:fd.get("city"),province:fd.get("province"),country:"Bangladesh"})});
                const data=await res.json();
                if(res.ok){setShowSignupPopup(false);arkAlert("Account created successfully!\n\n🎉 500,000 FREE credits awarded!\n\nPlease log in to start using ARK LAW AI.", "Account Created!", "🎉");setShowLoginPopup(true);}
                else{arkAlert(data.error||"Signup failed. Please try again.", "Signup Failed", "❌");}
              }catch(error){arkAlert("Signup failed: "+error.message, "Signup Error", "❌");}
            }}>
              {[{l:"Email *",n:"email",t:"email",ph:"your@email.com"},{l:"Password * (min 6 chars)",n:"password",t:"password",ph:"Minimum 6 characters"},{l:"Full Name *",n:"name",t:"text",ph:"Your full name"}].map(({l,n,t,ph})=>(
                <div key={n} style={{marginBottom:"10px"}}>
                  <label style={{color:"#3A2A18",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>{l}</label>
                  <input name={n} type={t} required={true} minLength={n==="password"?6:undefined} style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"7px",color:"#1A1209",fontSize:13,outline:"none"}} placeholder={ph}/>
                </div>
              ))}
              <div style={{marginBottom:"10px"}}>
                <label style={{color:"#3A2A18",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Profession *</label>
                <select name="profession" required style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"7px",color:"#1A1209",fontSize:13,outline:"none",cursor:"pointer"}}>
                  <option value="">Select profession...</option>
                  <option>Attorney</option><option>Paralegal</option><option>Legal Assistant</option><option>Law Clerk</option><option>Law Student</option><option>Judge</option><option>Other</option>
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <div>
                  <label style={{color:"#3A2A18",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>City *</label>
                  <input name="city" type="text" required style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"7px",color:"#1A1209",fontSize:13,outline:"none"}} placeholder="e.g., Dhaka"/>
                </div>
                <div>
                  <label style={{color:"#3A2A18",fontSize:11,display:"block",marginBottom:"4px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>State *</label>
                  <select name="province" required style={{width:"100%",padding:"9px 12px",background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"7px",color:"#1A1209",fontSize:13,outline:"none",cursor:"pointer"}}>
                    <option value="">Select state/province...</option>
                    <option key="Dhaka Division">Dhaka Division</option>
                    <option key="Chittagong Division">Chittagong Division</option>
                    <option key="Sylhet Division">Sylhet Division</option>
                    <option key="Rajshahi Division">Rajshahi Division</option>
                    <option key="Khulna Division">Khulna Division</option>
                    <option key="Barisal Division">Barisal Division</option>
                    <option key="Rangpur Division">Rangpur Division</option>
                    <option key="Mymensingh Division">Mymensingh Division</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{width:"100%",padding:"11px",background:"#1A1209",color:"white",border:"none",borderRadius:"7px",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:"8px"}} onMouseEnter={e=>e.currentTarget.style.background="#3A2A18"} onMouseLeave={e=>e.currentTarget.style.background="#1A1209"}>Create Account  -  500,000 Free Credits ✨</button>
              <button type="button" onClick={()=>setShowSignupPopup(false)} style={{width:"100%",padding:"9px",background:"#DDD6CB",color:"#4A3A28",border:"1px solid #C0B49A",borderRadius:"7px",cursor:"pointer",fontSize:13,marginBottom:"10px"}}>Cancel</button>
              <p style={{textAlign:"center",color:"#8A7A65",fontSize:11,margin:0}}>Already have an account?{" "}<span onClick={()=>{setShowSignupPopup(false);setShowLoginPopup(true);}} style={{color:"#4CAF7D",cursor:"pointer",textDecoration:"underline",fontWeight:600}}>Log in</span></p>
            </form>
          </div>
        </div>
      )}

      {/* MY ACCOUNT POPUP */}
      {showMyAccountPopup && user && (
        <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)",pointerEvents:"all"}}>
          <div style={{background:"#F5F0E8",borderRadius:"16px",width:"92%",maxWidth:"680px",maxHeight:"88vh",display:"flex",flexDirection:"column",border:"2px solid #006A4E",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",overflow:"hidden",position:"relative"}}>
            <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.04,pointerEvents:"none",zIndex:0,width:"260px",height:"260px",objectFit:"contain"}}/>
            <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #C8BFB0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,position:"relative",zIndex:1,background:"#F5F0E8"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:"32px",height:"32px",objectFit:"contain"}}/>
                <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1A1209"}}>ARK LAW AI Bangladesh <span style={{fontSize:11,fontWeight:400,color:"#5A4A35"}}>/ My Account</span></div>
              </div>
              <button onClick={()=>setShowMyAccountPopup(false)} style={{background:"none",border:"none",color:"#8A7A65",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{height:"1px",background:"linear-gradient(to right,transparent,#006A4E,transparent)",flexShrink:0}}/>
            <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative",zIndex:1}}>
              <div style={{flex:"0 0 52%",padding:"14px 16px",overflowY:"auto",borderRight:"1px solid #C8BFB0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                  <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,#006A4E,#8B0000)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"19px",fontWeight:700,color:"white",flexShrink:0}}>{user.name.charAt(0).toUpperCase()}</div>
                  <div><div style={{color:"#1A1209",fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"}}>{user.name}</div><div style={{color:"#8A7A65",fontSize:10,marginTop:"2px"}}>{user.email}</div></div>
                </div>
                <div style={{background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"10px",padding:"10px 12px",marginBottom:"10px"}}>
                  <div style={{fontSize:10,color:"#5A4A35",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"7px"}}>⚡ Credit Balance</div>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
                    <div style={{flex:1,height:"6px",background:"#D8D0C4",borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:String(Math.max(2,(userTokens/500000)*100))+"%",background:userTokens>100000?"#4CAF7D":"#C9A84C",borderRadius:"3px"}}></div>
                    </div>
                    <span style={{fontSize:13,fontWeight:800,color:"#1A1209",fontFamily:"Georgia,serif"}}>{userTokens.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize:9,color:"#8A7A65"}}>{Math.round((userTokens/500000)*100)}% of 500,000 credits remaining</div>
                </div>
                <div style={{background:"#DDD6CB",border:"1px solid #C0B49A",borderRadius:"10px",padding:"10px 12px",marginBottom:"12px"}}>
                  <div style={{fontSize:10,color:"#5A4A35",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Profile</div>
                  {[{k:"Profession",v:user.profession},{k:"City",v:user.city},{k:"State",v:user.province},{k:"Country",v:user.country||"United States"}].filter(x=>x.v).map(({k,v})=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #C8BFB0",paddingBottom:"5px",marginBottom:"5px"}}>
                      <span style={{fontSize:9,color:"#8A7A65",textTransform:"uppercase"}}>{k}</span>
                      <span style={{fontSize:11,color:"#1A1209",fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogout} style={{width:"100%",padding:"10px",background:"#006A4E",color:"white",border:"none",borderRadius:"8px",fontWeight:700,fontSize:13,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#004d38"} onMouseLeave={e=>e.currentTarget.style.background="#006A4E"}>🚪 Logout &amp; Save History</button>
              </div>
              <div style={{flex:"0 0 48%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <div style={{padding:"12px 14px",borderBottom:"1px solid #C8BFB0",flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#1A1209",textTransform:"uppercase",letterSpacing:"0.5px"}}>💬 Chat History</div>
                  <div style={{fontSize:9,color:"#8A7A65",marginTop:"2px"}}>Your saved conversations</div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
                  {allSessions.filter(s=>s.messages.some(m=>m.role==="user")).length===0
                    ?<div style={{textAlign:"center",padding:"24px 12px",color:"#8A7A65"}}><div style={{fontSize:28,marginBottom:"6px",opacity:0.4}}>💬</div><div style={{fontSize:11}}>No conversations yet</div></div>
                    :allSessions.filter(s=>s.messages.some(m=>m.role==="user")).map(session=>(
                      <div key={session.id} onClick={()=>{loadSession(session.id);setShowMyAccountPopup(false);}} style={{background:"#DDD6CB",padding:"8px 10px",borderRadius:"8px",border:"1px solid #C8BFB0",cursor:"pointer",marginBottom:"5px"}} onMouseEnter={e=>e.currentTarget.style.background="#333"} onMouseLeave={e=>e.currentTarget.style.background="#2a2a2a"}>
                        <div style={{color:"#1A1209",fontSize:11,fontWeight:600,marginBottom:"2px"}}>{session.title}</div>
                        <div style={{color:"#8A7A65",fontSize:9}}>{session.messages.filter(m=>m.role==="user").length} message(s)</div>
                      </div>
                    ))
                  }
                </div>
                <div style={{padding:"8px 10px",borderTop:"1px solid #C8BFB0",background:"#F5F0E8",flexShrink:0,textAlign:"center"}}>
                  <span style={{fontSize:9,color:"#8A7A65",fontStyle:"italic"}}>✓ History auto-saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComingSoon && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000}} onClick={()=>setShowComingSoon(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#F5F0E8",borderRadius:"16px",padding:"40px 36px",maxWidth:"400px",width:"90%",textAlign:"center",border:"2px solid #006A4E",boxShadow:"0 0 60px rgba(191,10,48,0.3)"}}>
            <button onClick={()=>setShowComingSoon(false)} style={{position:"absolute",top:"16px",right:"18px",background:"none",border:"none",color:"#8A7A65",fontSize:24,cursor:"pointer"}}>✕</button>
            <img src="/ark-logo-us.png" alt="ARK" style={{width:"64px",height:"64px",objectFit:"contain",marginBottom:"16px"}}/>
            <div style={{fontSize:20,fontWeight:700,color:"#1A1209",marginBottom:"8px"}}>Coming Soon!</div>
            <div style={{fontSize:13,color:"#8A7A65",lineHeight:1.7,marginBottom:"24px"}}>We're working on something great. Stay tuned.</div>
            <button onClick={()=>setShowComingSoon(false)} style={{padding:"10px 32px",background:"#006A4E",color:"white",border:"none",borderRadius:"8px",fontWeight:700,fontSize:14,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#004d38"} onMouseLeave={e=>e.currentTarget.style.background="#006A4E"}>Got it!</button>
          </div>
        </div>
      )}

      {/* ── Share Popup ── */}
      {showSharePopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000}} onClick={()=>setShowSharePopup(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#FFFFFF",borderRadius:"14px",width:"90%",maxWidth:"500px",border:"1px solid #C8BFB0",boxShadow:"0 12px 40px rgba(0,0,0,0.15)",overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #E4DDD0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#1A1209"}}>Share conversation</div>
              <button onClick={()=>setShowSharePopup(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#8A7A65",fontSize:20,lineHeight:1}}>✕</button>
            </div>
            {/* Message selection */}
            <div style={{padding:"16px 20px",maxHeight:"320px",overflowY:"auto"}}>
              <div style={{fontSize:12,color:"#7A6A55",marginBottom:"10px",fontWeight:600}}>Select messages to share:</div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                <label style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 12px",background:"#F5F0E8",borderRadius:"8px",cursor:"pointer",border:"1px solid #C8BFB0"}}>
                  <input type="checkbox" checked={shareSelectAll} onChange={e=>{setShareSelectAll(e.target.checked);setShareSelected(e.target.checked?messages.map((_,i)=>i):[]);}} style={{width:"15px",height:"15px",accentColor:"#1A1209"}}/>
                  <span style={{fontSize:12,fontWeight:600,color:"#2A1E10"}}>Select all messages</span>
                </label>
                {messages.map((msg,i)=>(
                  <label key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px",padding:"8px 12px",background:shareSelected.includes(i)?"#EDE8DF":"transparent",borderRadius:"8px",cursor:"pointer",border:"1px solid transparent",transition:"all 0.1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
                    onMouseLeave={e=>e.currentTarget.style.background=shareSelected.includes(i)?"#EDE8DF":"transparent"}>
                    <input type="checkbox" checked={shareSelected.includes(i)} onChange={e=>{setShareSelected(prev=>e.target.checked?[...prev,i]:prev.filter(x=>x!==i));setShareSelectAll(false);}} style={{width:"15px",height:"15px",marginTop:"2px",accentColor:"#1A1209",flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#7A6A55",marginBottom:"2px"}}>{msg.role==="user"?"You":"ARK Law AI"}</div>
                      <div style={{fontSize:12,color:"#2A1E10",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"340px"}}>{msg.content?.substring(0,100)}{msg.content?.length>100?"...":""}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {/* Footer actions */}
            <div style={{padding:"12px 20px",borderTop:"1px solid #E4DDD0",display:"flex",gap:"8px",justifyContent:"flex-end"}}>
              <button onClick={()=>{
                const selected = messages.filter((_,i)=>shareSelected.includes(i));
                const text = selected.map(m=>(m.role==="user"?"You: ":"ARK Law AI: ")+m.content).join("\n\n---\n\n");
                if(navigator.share){navigator.share({title:"ARK Law AI Chat",text}).catch(()=>{});}
                else{navigator.clipboard.writeText(text).then(()=>{setShowSharePopup(false);arkAlert("Conversation copied to clipboard!\nYou can now paste and share it.", "Copied!", "✅");}).catch(()=>{});}
              }} disabled={shareSelected.length===0}
                style={{padding:"8px 20px",background:shareSelected.length>0?"#1A1209":"#C8BFB0",color:"white",border:"none",borderRadius:"8px",cursor:shareSelected.length>0?"pointer":"not-allowed",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:"6px"}}
                onMouseEnter={e=>{if(shareSelected.length>0)e.currentTarget.style.background="#2A1E10";}}
                onMouseLeave={e=>{if(shareSelected.length>0)e.currentTarget.style.background="#1A1209";}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Share {shareSelected.length>0?`(${shareSelected.length})`:""} 
              </button>
              <button onClick={()=>setShowSharePopup(false)} style={{padding:"8px 16px",background:"transparent",color:"#7A6A55",border:"1px solid #C0B49A",borderRadius:"8px",cursor:"pointer",fontSize:13}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* ── ARK Modal ── */}
      {arkModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,animation:"fadeSlideUp 0.15s ease"}}>
          <div style={{background:"#FFFFFF",borderRadius:"18px",width:"90%",maxWidth:"400px",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",border:"1px solid #C8BFB0",overflow:"hidden"}}>
            <div style={{padding:"18px 20px 14px",borderBottom:"1px solid #EDE8DF",display:"flex",alignItems:"center",gap:"12px"}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:32,height:32,objectFit:"contain",flexShrink:0}}/>
              <div style={{fontSize:15,fontWeight:800,color:"#021A4A",fontFamily:"DM Sans,sans-serif"}}>{arkModal.title||"ARK LAW AI"}</div>
              <div style={{marginLeft:"auto",fontSize:22}}>{arkModal.icon}</div>
            </div>
            <div style={{padding:"18px 20px"}}>
              <div style={{fontSize:14,color:"#2A1E10",lineHeight:1.65,whiteSpace:"pre-line"}}>{arkModal.message}</div>
              {arkModal.type==="prompt" && (
                <input autoFocus value={arkModal.inputVal||""}
                  onChange={e=>setArkModal(m=>({...m,inputVal:e.target.value}))}
                  onKeyDown={e=>{if(e.key==="Enter"){const v=arkModal.inputVal;const r=arkModal.resolve;setArkModal(null);r(v);}if(e.key==="Escape"){setArkModal(null);arkModal.resolve(null);}}}
                  placeholder={arkModal.inputPlaceholder||""}
                  style={{width:"100%",marginTop:"12px",padding:"9px 12px",background:"#F5F0E8",border:"1px solid #C8BFB0",borderRadius:"8px",fontSize:14,color:"#1A1209",outline:"none",fontFamily:"DM Sans,sans-serif"}}/>
              )}
            </div>
            <div style={{padding:"12px 20px 16px",display:"flex",gap:"8px",justifyContent:"flex-end",background:"#F9F6F0",borderTop:"1px solid #EDE8DF"}}>
              {arkModal.type!=="alert" && (
                <button onClick={()=>{const r=arkModal.resolve;setArkModal(null);r(arkModal.type==="prompt"?null:false);}}
                  style={{padding:"8px 18px",background:"transparent",color:"#7A6A55",border:"1px solid #C8BFB0",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"DM Sans,sans-serif"}}>
                  Cancel
                </button>
              )}
              <button onClick={()=>{const val=arkModal.type==="prompt"?arkModal.inputVal:arkModal.type==="confirm"?true:undefined;const r=arkModal.resolve;setArkModal(null);r(val);}}
                style={{padding:"8px 20px",background:arkModal.confirmColor||"#1A1209",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"DM Sans,sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                {arkModal.confirmLabel||"OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Chats Popup ── */}
      {showSearchPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:3000,paddingTop:"60px"}}
          onClick={()=>{setShowSearchPopup(false);setSearchQuery("");}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#FFFFFF",borderRadius:"16px",width:"90%",maxWidth:"580px",boxShadow:"0 16px 60px rgba(0,0,0,0.18)",border:"1px solid #C8BFB0",overflow:"hidden",animation:"fadeSlideUp 0.2s ease"}}>

            {/* Search input row */}
            <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"14px 18px",borderBottom:"1px solid #E4DDD0"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7A65" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:16,color:"#1A1209",fontFamily:"DM Sans,sans-serif"}}/>
              {searchQuery && (
                <button onClick={()=>setSearchQuery("")} style={{background:"none",border:"none",cursor:"pointer",color:"#8A7A65",fontSize:20,lineHeight:1,padding:"0 4px"}}>&times;</button>
              )}
              <button onClick={()=>{setShowSearchPopup(false);setSearchQuery("");}}
                style={{background:"#F0EBE0",border:"none",cursor:"pointer",color:"#7A6A55",fontSize:11,padding:"5px 10px",borderRadius:"6px",fontWeight:600,flexShrink:0}}>
                ESC
              </button>
            </div>

            {/* Results */}
            <div style={{maxHeight:"420px",overflowY:"auto"}}>
              {searchQuery.trim() === "" ? (
                /* No query — show grouped by date */
                <div>
                  {/* New chat option */}
                  <div onClick={()=>{startNewChat();setShowSearchPopup(false);setSearchQuery("");}}
                    style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 18px",cursor:"pointer",transition:"background 0.12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F5F0E8"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1209" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    <span style={{fontSize:14,color:"#1A1209",fontWeight:500}}>New chat</span>
                  </div>
                  <div style={{height:"1px",background:"#E4DDD0",margin:"0 18px"}}/>
                  {/* Sessions grouped by date */}
                  {(()=>{
                    const now = new Date();
                    const today     = s => { const d=new Date(s.updatedAt||Date.now()); return d.toDateString()===now.toDateString(); };
                    const yesterday = s => { const d=new Date(s.updatedAt||0); const y=new Date(now); y.setDate(y.getDate()-1); return d.toDateString()===y.toDateString(); };
                    const prev7     = s => { const d=new Date(s.updatedAt||0); return d>new Date(now-7*86400000) && !today(s) && !yesterday(s); };
                    const older     = s => !today(s) && !yesterday(s) && !prev7(s);

                    const groups = [
                      {label:"Today",         sessions:allSessions.filter(s=>!s.archived&&today(s))},
                      {label:"Yesterday",     sessions:allSessions.filter(s=>!s.archived&&yesterday(s))},
                      {label:"Previous 7 Days",sessions:allSessions.filter(s=>!s.archived&&prev7(s))},
                      {label:"Older",         sessions:allSessions.filter(s=>!s.archived&&older(s))},
                    ].filter(g=>g.sessions.length>0);

                    if(allSessions.filter(s=>!s.archived).length===0) return(
                      <div style={{padding:"30px 18px",textAlign:"center",color:"#9A8A75",fontSize:13}}>No conversations yet</div>
                    );

                    return groups.map(({label,sessions})=>(
                      <div key={label}>
                        <div style={{padding:"10px 18px 4px",fontSize:11,fontWeight:700,color:"#9A8A75",letterSpacing:"0.4px"}}>{label}</div>
                        {sessions.map(s=>(
                          <div key={s.id} onClick={()=>{loadSession(s.id);setShowSearchPopup(false);setSearchQuery("");}}
                            style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 18px",cursor:"pointer",transition:"background 0.12s"}}
                            onMouseEnter={e=>e.currentTarget.style.background="#F5F0E8"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8A75" strokeWidth="1.8" strokeLinecap="round" style={{flexShrink:0}}>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span style={{fontSize:14,color:"#1A1209",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title||"Untitled"}</span>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                /* Search results */
                <div>
                  {(()=>{
                    const q = searchQuery.toLowerCase();
                    // Search in session titles AND message content
                    const results = allSessions.filter(s=>!s.archived).map(s=>{
                      const titleMatch = s.title?.toLowerCase().includes(q);
                      const msgMatch = (s.messages||[]).find(m=>m.content?.toLowerCase().includes(q));
                      if(!titleMatch && !msgMatch) return null;
                      return {s, titleMatch, msgMatch};
                    }).filter(Boolean);

                    if(results.length===0) return(
                      <div style={{padding:"30px 18px",textAlign:"center",color:"#9A8A75"}}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8BFB0" strokeWidth="1.5" style={{marginBottom:10,display:"block",margin:"0 auto 10px"}}>
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <div style={{fontSize:14,fontWeight:600,color:"#7A6A55",marginBottom:4}}>No results for "{searchQuery}"</div>
                        <div style={{fontSize:12}}>Try searching by title or message content</div>
                      </div>
                    );

                    return (
                      <div>
                        <div style={{padding:"10px 18px 4px",fontSize:11,fontWeight:700,color:"#9A8A75"}}>{results.length} result{results.length!==1?"s":""}</div>
                        {results.map(({s, titleMatch, msgMatch})=>{
                          // Highlight matching text
                          const highlight = (text, q) => {
                            if(!text) return text;
                            const idx = text.toLowerCase().indexOf(q);
                            if(idx<0) return text;
                            return <>{text.slice(0,idx)}<mark style={{background:"#FFE08A",borderRadius:2,padding:"0 1px"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
                          };
                          const snippet = msgMatch?.content;
                          const snipIdx = snippet?.toLowerCase().indexOf(q)||0;
                          const snipStart = Math.max(0, snipIdx-30);
                          const snipText = snippet?.substring(snipStart, snipStart+80)+(snippet?.length>(snipStart+80)?"...":"");

                          return(
                            <div key={s.id} onClick={()=>{loadSession(s.id);setShowSearchPopup(false);setSearchQuery("");}}
                              style={{display:"flex",alignItems:"flex-start",gap:"12px",padding:"10px 18px",cursor:"pointer",transition:"background 0.12s"}}
                              onMouseEnter={e=>e.currentTarget.style.background="#F5F0E8"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8A75" strokeWidth="1.8" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}>
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                              <div style={{minWidth:0}}>
                                <div style={{fontSize:14,color:"#1A1209",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {highlight(s.title||"Untitled", searchQuery)}
                                </div>
                                {msgMatch && (
                                  <div style={{fontSize:11,color:"#7A6A55",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                    {snipStart>0&&"..."}{highlight(snipText, searchQuery)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer branding */}
            <div style={{padding:"10px 18px",borderTop:"1px solid #E4DDD0",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F9F6F0"}}>
              <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:18,height:18,objectFit:"contain"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#021A4A",letterSpacing:"0.5px"}}>ARK LAW AI</span>
              </div>
              <span style={{fontSize:10,color:"#9A8A75"}}>Search by title or message content</span>
            </div>
          </div>
        </div>
      )}

      {/* Session context menu */}
      {sessionMenu && (
        <>
          <div style={{position:"fixed",inset:0,zIndex:500}} onClick={()=>setSessionMenu(null)}/>
          <div style={{position:"fixed",left:Math.min(sessionMenu.x, typeof window!=="undefined"?window.innerWidth-210:400),top:Math.min(sessionMenu.y, typeof window!=="undefined"?window.innerHeight-260:400),background:"#FFFFFF",border:"1px solid #C8BFB0",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.13)",zIndex:501,minWidth:"195px",padding:"5px 0",animation:"fadeSlideUp 0.15s ease"}}>
            {/* Share */}
            <button onClick={()=>{
                const s=allSessions.find(x=>x.id===sessionMenu.id);
                if(!s) return;
                setSessionMenu(null);
                loadSession(s.id);
                setTimeout(()=>{setShareSelected((s.messages||[]).map((_,i)=>i));setShareSelectAll(true);setShowSharePopup(true);},100);
              }}
              style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"8px 14px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#2A1E10",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Share
            </button>
            {/* Start a group chat */}
            <button onClick={()=>{
              setSessionMenu(null);
              const gId=Date.now();
              const s=allSessions.find(x=>x.id===sessionMenu?.id);
              const gSession={id:gId,title:"Group: "+(s?.title||"Chat"),messages:[{role:"assistant",content:"Group session started! This conversation can be shared with others. Use the Share button to copy and send."},...(s?.messages||[])],isGroup:true};
              setAllSessions(prev=>[gSession,...prev]);
              setActiveChatId(gId);
              setMessages(gSession.messages);
            }}
              style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"8px 14px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#2A1E10",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Start a group chat
            </button>
            <div style={{height:"1px",background:"#E4DDD0",margin:"4px 0"}}/>
            {/* Rename */}
            <button onClick={()=>{
                const s=allSessions.find(x=>x.id===sessionMenu.id);
                if(!s) return;
                arkPrompt("Enter a new name for this conversation:", s.title.replace("📌 ",""), "Rename Chat", "Conversation name...").then(t=>{
                if(t&&t.trim()) setAllSessions(prev=>prev.map(x=>x.id===sessionMenu.id?{...x,title:(x.pinned?"📌 ":"")+t.trim()}:x));
                setSessionMenu(null);});
              }}
              style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"8px 14px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#2A1E10",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Rename
            </button>
            <div style={{height:"1px",background:"#E4DDD0",margin:"4px 0"}}/>
            {/* Pin chat */}
            <button onClick={()=>{
                setAllSessions(prev=>prev.map(x=>{
                  if(x.id!==sessionMenu.id) return x;
                  const isPinned=x.title?.startsWith("📌 ");
                  return {...x,title:isPinned?x.title.replace("📌 ",""):"📌 "+x.title.replace("📌 ",""),pinned:!isPinned};
                }));
                setSessionMenu(null);
              }}
              style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"8px 14px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#2A1E10",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              {allSessions.find(x=>x.id===sessionMenu.id)?.pinned ? "Unpin chat" : "Pin chat"}
            </button>
            {/* Archive */}
            <button onClick={()=>{
                setAllSessions(prev=>prev.map(x=>x.id===sessionMenu.id?{...x,archived:true}:x));
                if(activeChatId===sessionMenu.id) startNewChat();
                setSessionMenu(null);
              }}
              style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"8px 14px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#2A1E10",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0EBE0"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              Archive
            </button>
            <div style={{height:"1px",background:"#E4DDD0",margin:"4px 0"}}/>
            {/* Delete */}
            <button onClick={()=>{
                arkConfirm("Are you sure you want to delete this conversation?\nThis action cannot be undone.", "Delete Conversation", "🗑️", "Delete", "#DC2626").then(ok=>{ if(ok){
                  setAllSessions(prev=>prev.filter(x=>x.id!==sessionMenu.id));
                  if(activeChatId===sessionMenu.id) startNewChat();
                }});  setSessionMenu(null);
              }}
              style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"8px 14px",background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:"#DC2626",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#FEF2F2"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </>
      )}

      {/* Click outside to close chat menu */}
      {showChatMenu && <div style={{position:"fixed",inset:0,zIndex:150}} onClick={()=>setShowChatMenu(false)}/>}

    </>
  );
}
