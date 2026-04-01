import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { UserButton, SignUpButton, useUser } from "@clerk/nextjs";

const GOLD = "#C9A84C";
const NAVY = "#0D1B2A";
const NAVY_MID = "#162032";
const NAVY_SURFACE = "#1E2D40";
const NAVY_BORDER = "#2B3F57";
const ACCENT_PK = "#3EB489";
const TEXT_PRIMARY = "#FAF6EE";
const TEXT_SECONDARY = "#B8C4D0";
const TEXT_MUTED = "#6E8099";

export default function App() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [nameAsked, setNameAsked] = useState(false);
  const [sidebarOpen, setOpenSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [guestTime, setGuestTime] = useState(180);
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsAnalysis, setNewsAnalysis] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);
  const [showDraftPopup, setShowDraftPopup] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState("affidavit");
  const [newsItems, setNewsItems] = useState([]);
  const messagesEndRef = useRef(null);

  const PRACTICE_AREAS_PK = [
    { id: "general", label: "General Legal", icon: "⚖️" },
    { id: "criminal", label: "Criminal Law", icon: "🔒" },
    { id: "corporate", label: "Corporate & Business", icon: "🏢" },
    { id: "family", label: "Family Law", icon: "👨‍👩‍👧" },
    { id: "property", label: "Property & Land", icon: "🏠" },
    { id: "labour", label: "Labour Laws", icon: "👷" },
    { id: "taxation", label: "Taxation", icon: "💰" },
    { id: "constitution", label: "Constitutional Law", icon: "📜" },
  ];

  const QUICK_QUERIES_PK = [
    "What are my rights as a tenant in Pakistan?",
    "How do I file an FIR in Pakistan?",
    "What is the procedure for divorce in Pakistan?",
    "Explain inheritance laws in Pakistan",
    "What are employment rights in Pakistan?",
    "How to draft a will in Pakistan?",
    "What is a power of attorney?",
    "Explain contract law in Pakistan",
  ];

  const CONDUCT_PK = [
    "Maintain integrity and honesty in all professional dealings",
    "Provide competent and ethical legal counsel",
    "Protect client confidentiality and privilege",
    "Avoid conflicts of interest",
    "Charge fair and reasonable fees",
    "Respect the rule of law and Constitution",
    "Promote access to justice for all",
    "Continue professional development and training",
    "Treat opposing counsel with respect and courtesy",
    "Disclose material facts and evidence",
    "Never mislead courts or clients",
    "Uphold the honour and dignity of the profession",
  ];

  const DOCUMENT_TYPES = [
    "affidavit",
    "contract",
    "nda",
    "will",
    "trust",
    "deed",
    "lease",
    "employment",
    "settlement",
    "power-of-attorney",
    "divorce",
    "complaint",
  ];

  // Initialize guest timer
  useEffect(() => {
    const startStr = localStorage.getItem("ark_guest_start");
    if (!user && startStr) {
      const start = parseInt(startStr);
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000 / 60);
      const remaining = Math.max(0, 180 - elapsed);
      setGuestTime(remaining);
    } else if (!user) {
      localStorage.setItem("ark_guest_start", Date.now().toString());
    }
  }, [user]);

  // Update timer every minute
  useEffect(() => {
    if (!user && guestTime > 0) {
      const timer = setInterval(() => {
        setGuestTime((prev) => Math.max(0, prev - 1));
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [user, guestTime]);

  // Mobile detection
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-send greeting
  useEffect(() => {
    if (messages.length === 0 && !nameAsked) {
      setNameAsked(true);
      const greeting = {
        role: "assistant",
        content: "السلام علیکم! Welcome to ARK Law AI. Before we begin, may I know your name?",
      };
      setMessages([greeting]);
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch news on mount
  useEffect(() => {
    fetchNewsHeadlines();
  }, []);

  const newsDatabase = [
    {
      headline: "🇵🇰 Supreme Court of Pakistan Ruling on Constitutional Rights",
      source: "Supreme Court of Pakistan Official Records",
      fullText: "The Supreme Court of Pakistan has issued a landmark ruling reaffirming citizens' fundamental rights under Articles 9 and 14 of the Constitution. The judgment emphasizes that all individuals have the right to life, liberty, and dignity. This ruling applies to all provincial and federal courts and establishes important precedent for cases involving human rights violations. The court also directed the government to ensure compliance across all institutions."
    },
    {
      headline: "🇵🇰 New Tax Amendment Affects Business Sector",
      source: "Federal Board of Revenue (FBR)",
      fullText: "The Federal Board of Revenue has announced new amendments to the Income Tax Ordinance, 2001, effective immediately. Key changes include: (1) Modified tax rates for small and medium enterprises, (2) Enhanced deductions for research and development, (3) Stricter compliance requirements for corporate entities. Businesses are advised to consult with tax professionals to ensure compliance. The FBR has set a grace period of 30 days for voluntary compliance."
    },
    {
      headline: "🇵🇰 Family Court Interprets Guardianship Laws",
      source: "District Court - Family Division",
      fullText: "In a significant judgment, the Family Court has clarified provisions of the Guardians and Wards Act, 1890. The court ruled that guardianship decisions must prioritize the best interests of the child above all considerations. The judgment emphasizes that courts must conduct thorough investigations, hear all parties, and consider the child's wishes in guardianship matters. This ruling affects all guardianship petitions pending in courts across Pakistan."
    },
    {
      headline: "🇵🇰 Labour Ministry Issues New Worker Protection Guidelines",
      source: "Ministry of Labour, Employment & Manpower",
      fullText: "The Labour Ministry has issued comprehensive guidelines under the Workers' Compensation Act for improved worker protection. New provisions include: (1) Enhanced compensation for workplace injuries, (2) Mandatory insurance coverage for all workers, (3) Faster claim processing mechanisms. Employers must comply within 60 days. Non-compliance may result in penalties and legal action. Workers can file complaints through the ministry's online portal."
    },
    {
      headline: "🇵🇰 High Court Decision on Property Disputes",
      source: "Lahore High Court - Civil Division",
      fullText: "The Lahore High Court has established important guidelines for resolving property disputes under the Transfer of Property Act, 1882. The judgment clarifies that possession must be clearly established through documentary evidence, witness testimony, or adverse possession principles. Courts are directed to expedite property cases to reduce pending litigation. The ruling also addresses issues of land grabbing and unlawful occupation."
    },
    {
      headline: "🇵🇰 Procedural Changes in Criminal Courts",
      source: "Supreme Judicial Council",
      fullText: "New procedural rules have been implemented in criminal courts across Pakistan to expedite trials under the Code of Criminal Procedure, 1898. Changes include: (1) Mandatory video conferencing for witness examination, (2) Electronic filing of documents, (3) Stricter time limits for adjournments. These reforms aim to reduce case backlogs and ensure speedy justice. All courts must implement these procedures immediately."
    }
  ];

  const fetchNewsHeadlines = async () => {
    setNewsItems(newsDatabase.map(item => item.headline));
  };

  const sendMessage = async (msg = null) => {
    const userMessage = msg || input;
    if (!userMessage.trim()) return;

    // Check guest session
    if (!user && guestTime <= 0) {
      alert("Your 3-hour free trial has ended. Please sign up for 7-day free trial!");
      return;
    }

    const updatedMessages = [...messages, { role: "user", content: userMessage }];

    // Name collection
    if (!nameAsked) {
      setName(userMessage);
      setNameAsked(true);
      const response = {
        role: "assistant",
        content: `Wonderful to meet you, ${userMessage}! 🙏 Now, how can ARK Law AI assist you with Pakistani legal matters today?`,
      };
      setMessages([...updatedMessages, response]);
      setInput("");
      return;
    }

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get response");
      }

      const data = await res.json();
      const personalizedResponse = name ? data.reply.replace(/Ahmed/g, name) : data.reply;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: personalizedResponse },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = () => {
    if (codeInput === "JUSTICESARABBANI") {
      setShowCodePopup(false);
      setShowSuccessPopup(true);
      setGuestTime(1440);
      localStorage.setItem("ark_guest_start", Date.now().toString());
      setCodeInput("");
    } else {
      alert("Incorrect code. Please try again.");
      setCodeInput("");
    }
  };

  const handleNewsClick = async (headline) => {
    const newsItem = newsDatabase.find(item => item.headline === headline);
    if (newsItem) {
      setSelectedNews(newsItem);
      setShowNewsPopup(true);
      setNewsLoading(true);
      setNewsAnalysis("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Analyze this legal news from Pakistan and explain its legal significance and impact:\n\nHeadline: ${newsItem.headline}\n\nFull Text: ${newsItem.fullText}\n\nProvide a concise analysis of how this affects Pakistani citizens and businesses, relevant statutes, and practical implications.`,
              },
            ],
            userId: user?.id,
          }),
        });

        const data = await res.json();
        setNewsAnalysis(data.reply);
      } catch (error) {
        setNewsAnalysis("Unable to analyze this news item. Please try again.");
      } finally {
        setNewsLoading(false);
      }
    }
  };

  const downloadDraft = (format) => {
    const timestamp = new Date().toLocaleDateString("en-PK");
    let content = `ARK LAW AI - LEGAL DOCUMENT DRAFT\n${"=".repeat(50)}\n\nDocument Type: ${draftType.toUpperCase()}\nTitle: ${draftTitle}\nCreated: ${timestamp}\nJurisdiction: Pakistan\n\n${"=".repeat(50)}\n\n${draftContent}\n\n${"=".repeat(50)}\nThis document was generated by ARK Law AI and should be reviewed by a qualified Pakistani lawyer before execution.`;

    if (format === "pdf") {
      window.print();
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ARK_${draftType}_${Date.now()}.${format === "doc" ? "doc" : "docx"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const guestMinutes = Math.floor(guestTime % 60);
  const guestHours = Math.floor(guestTime / 60);

  return (
    <>
      <Head>
        <title>ARK Law AI — Pakistan Legal Intelligence Engine by Khawer Rabbani</title>
        <meta
          name="description"
          content="ARK Law AI: Expert AI legal assistant for Pakistani law. Free 3-hour trial, 7-day free access."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes conductScroll {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
        .conduct-ticker { 
          animation: conductScroll 45s linear infinite;
          will-change: transform;
        }
        .conduct-ticker:hover { animation-play-state: paused; }
        @media (max-width: 768px) {
          .desktop-only { display: none; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
        {/* HEADER */}
        <header style={{ background: NAVY, padding: "10px 20px", borderBottom: `1px solid ${NAVY_BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* LEFT - LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/favicon.svg" alt="ARK" style={{ width: "54px", height: "54px" }} />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: GOLD }}>ARK Law AI</div>
              <div style={{ fontSize: 10, color: TEXT_MUTED }}>Pakistan Legal Intelligence Engine by Khawer Rabbani</div>
            </div>
          </div>

          {/* CENTER - LOGIN & TRIAL BUTTONS */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {!user ? (
              <>
                <div style={{ fontSize: 12, color: guestTime > 60 ? ACCENT_PK : "#ff6b6b", fontWeight: 600 }}>
                  ⏱ {guestHours}h {guestMinutes}m free
                </div>
                <button onClick={() => setShowCodePopup(true)} style={{ padding: "6px 12px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  ✨ Need more time?
                </button>
                <SignUpButton>
                  <button style={{ padding: "6px 12px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                    ⭐ FREE TRIAL
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div style={{ fontSize: 12, color: ACCENT_PK, fontWeight: 600 }}>
                {user.firstName || "User"}
              </div>
            )}
            <UserButton />
          </div>

          {/* RIGHT - LANGUAGE TOGGLE */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button style={{ padding: "6px 12px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
              EN
            </button>
            <button style={{ padding: "6px 12px", background: NAVY_SURFACE, color: TEXT_MUTED, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", cursor: "pointer", fontSize: 11, opacity: 0.4, title: "Urdu — Coming Soon" }}>
              اردو
            </button>
          </div>
        </header>

        {/* NEWS TICKER */}
        <div style={{ background: NAVY_MID, padding: "8px 20px", borderBottom: `1px solid ${NAVY_BORDER}`, overflow: "hidden", display: "flex", alignItems: "center", height: "40px", width: "100%" }}>
          <span style={{ color: GOLD, fontWeight: 600, flexShrink: 0, marginRight: "20px" }}>⚖ LEGAL NEWS</span>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "50px", whiteSpace: "nowrap", animation: "scroll 80s linear infinite", width: "fit-content" }} onMouseEnter={(e) => e.currentTarget.style.animationPlayState = "paused"} onMouseLeave={(e) => e.currentTarget.style.animationPlayState = "running"}>
              {newsItems.length > 0 ? (
                <>
                  {newsItems.map((item, i) => (
                    <button key={i} onClick={() => handleNewsClick(item)} style={{ background: "none", border: "none", color: ACCENT_PK, cursor: "pointer", fontSize: 12, padding: "0", flexShrink: 0, fontWeight: 500, textDecoration: "underline" }}>
                      {item}
                    </button>
                  ))}
                  {newsItems.map((item, i) => (
                    <button key={`dup-${i}`} onClick={() => handleNewsClick(item)} style={{ background: "none", border: "none", color: ACCENT_PK, cursor: "pointer", fontSize: 12, padding: "0", flexShrink: 0, fontWeight: 500, textDecoration: "underline" }}>
                      {item}
                    </button>
                  ))}
                </>
              ) : (
                <div style={{ color: TEXT_MUTED, fontSize: 12 }}>Loading legal news...</div>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* LEFT SIDEBAR - Code of Conduct */}
          {!isMobile && (
            <div style={{ width: "200px", background: NAVY_SURFACE, borderRight: `1px solid ${NAVY_BORDER}`, padding: "15px", overflowY: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <img src="/jinnah.jpeg" alt="Jinnah" style={{ width: "60px", height: "60px", borderRadius: "50%", border: `2px solid ${ACCENT_PK}` }} />
                <div style={{ fontSize: 10, color: ACCENT_PK, fontWeight: 600, marginTop: "5px" }}>FOUNDER OF PAKISTAN</div>
                <div style={{ fontSize: 9, color: TEXT_MUTED }}>Quaid-e-Azam M. A. Jinnah</div>
              </div>
              <div style={{ fontSize: 9, color: GOLD, fontWeight: 600, marginBottom: "10px", textAlign: "center" }}>Code of Conduct Points for Attorneys in Pakistan</div>
              <div style={{ overflow: "hidden", height: "calc(100% - 140px)", width: "100%", position: "relative" }}>
                <div className="conduct-ticker" style={{ fontSize: 9, color: TEXT_MUTED, lineHeight: "1.6", width: "100%", paddingRight: "10px" }}>
                  {CONDUCT_PK.concat(CONDUCT_PK).map((conduct, i) => (
                    <div key={i} style={{ marginBottom: "10px", paddingLeft: "8px", borderLeft: `2px solid ${ACCENT_PK}`, whiteSpace: "normal" }}>
                      • {conduct}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: NAVY_MID }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "10px" }}>
                  {msg.role === "assistant" && (
                    <img src="/khawer.jpeg" alt="ARK" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  )}
                  <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: "8px", background: msg.role === "user" ? GOLD : NAVY_SURFACE, color: msg.role === "user" ? NAVY : TEXT_PRIMARY, fontSize: 13, lineHeight: "1.4" }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src="/khawer.jpeg" alt="ARK" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  <div style={{ color: TEXT_MUTED, fontSize: 12 }}>ARK is thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div style={{ padding: "15px", borderTop: `1px solid ${NAVY_BORDER}`, display: "flex", gap: "8px" }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask ARK Law AI..." style={{ flex: 1, padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 13 }} />
              <button onClick={() => sendMessage()} disabled={loading} style={{ padding: "10px 20px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                SEND
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Practice Areas & Tools */}
          {!isMobile && (
            <div style={{ width: "220px", background: NAVY_SURFACE, borderLeft: `1px solid ${NAVY_BORDER}`, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Document Drafting */}
              <div style={{ padding: "12px", background: `linear-gradient(135deg, ${GOLD}20, ${ACCENT_PK}20)`, borderRadius: "6px", border: `1px solid ${GOLD}`, cursor: "pointer" }} onClick={() => setShowDraftPopup(true)}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GOLD }}>✍️ DRAFT LEGAL DOCUMENTS</div>
                <div style={{ fontSize: 9, color: TEXT_MUTED, marginTop: "4px" }}>Create contracts, affidavits, and more</div>
                <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, borderRadius: "3px" }}>📄 DOC</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: ACCENT_PK, color: NAVY, borderRadius: "3px" }}>📋 PDF</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, borderRadius: "3px" }}>📑 DOCX</span>
                </div>
              </div>

              {/* Document Analyzer */}
              <div style={{ padding: "12px", background: NAVY, borderRadius: "6px", border: `1px solid ${ACCENT_PK}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginBottom: "8px" }}>📂 ANALYZE DOCUMENTS</div>
                <input type="file" accept=".pdf,.docx,.doc" style={{ fontSize: 10, marginBottom: "8px" }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => alert("Feature coming soon: Document analysis");
                    reader.readAsArrayBuffer(file);
                  }
                }} />
              </div>

              {/* Practice Areas */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginBottom: "8px" }}>⚖️ PRACTICE AREAS</div>
                {PRACTICE_AREAS_PK.map((area) => (
                  <button key={area.id} onClick={() => sendMessage(`Tell me about ${area.label} in Pakistan`)} style={{ display: "block", width: "100%", padding: "8px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, cursor: "pointer", marginBottom: "6px", borderRadius: "4px", fontSize: 11, textAlign: "left" }}>
                    {area.icon} {area.label}
                  </button>
                ))}
              </div>

              {/* Quick Queries */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginBottom: "8px" }}>💬 QUICK QUERIES</div>
                {QUICK_QUERIES_PK.map((query, i) => (
                  <button key={i} onClick={() => sendMessage(query)} style={{ display: "block", width: "100%", padding: "8px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_SECONDARY, cursor: "pointer", marginBottom: "6px", borderRadius: "4px", fontSize: 10, textAlign: "left", lineHeight: "1.3" }}>
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ padding: "10px 20px", borderTop: `1px solid ${NAVY_BORDER}`, fontSize: 10, color: TEXT_MUTED, textAlign: "center" }}>
          <div>⚠️ For legal information only — not a substitute for consulting a qualified Pakistani lawyer</div>
          <div style={{ color: GOLD, marginTop: "4px", fontSize: 9 }}>This AI Initiative is Dedicated to the Legacy, Legal Acumen and Wisdom of Honorable Mr. Justice S. A. Rabbani, Legendary Jurist of Pakistan</div>
        </footer>
      </div>

      {/* CODE POPUP */}
      {showCodePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, padding: "40px", borderRadius: "12px", border: `2px solid ${GOLD}`, maxWidth: "400px", textAlign: "center" }}>
            <img src="/favicon.svg" alt="ARK" style={{ width: "60px", height: "60px", margin: "0 auto 20px" }} />
            <h2 style={{ color: GOLD, fontSize: 18, marginBottom: "15px" }}>Extend Your Access</h2>
            <p style={{ color: TEXT_SECONDARY, fontSize: 12, marginBottom: "20px" }}>Enter the magic code to extend your session to 24 hours</p>
            <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ color: GOLD, fontSize: 28, fontWeight: 700, letterSpacing: "2px" }}>JUSTICESARABBANI</div>
            </div>
            <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="Type the code above..." style={{ width: "100%", padding: "10px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "15px", fontSize: 12 }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowCodePopup(false)} style={{ flex: 1, padding: "10px", background: NAVY_BORDER, color: TEXT_PRIMARY, border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Close
              </button>
              <button onClick={handleCodeSubmit} style={{ flex: 1, padding: "10px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, padding: "40px", borderRadius: "12px", border: `2px solid ${ACCENT_PK}`, maxWidth: "450px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: "15px" }}>✅</div>
            <h2 style={{ color: ACCENT_PK, fontSize: 18, marginBottom: "15px" }}>Correct Code!</h2>
            <div style={{ borderTop: `2px solid ${GOLD}`, borderBottom: `2px solid ${GOLD}`, padding: "20px", margin: "20px 0" }}>
              <p style={{ color: TEXT_PRIMARY, fontSize: 13, lineHeight: "1.6" }}>
                You have entered the correct magic code dedicated to Honorable Justice S. A. Rabbani, legendary jurist of Pakistan. Now you are able to utilize this AI Legal Assistant for 24 hours without signing up for a trial.
              </p>
            </div>
            <button onClick={() => setShowSuccessPopup(false)} style={{ padding: "12px 30px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>
              OK — Let's Go! ⚖️
            </button>
          </div>
        </div>
      )}

      {/* NEWS POPUP */}
      {showNewsPopup && selectedNews && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY, borderRadius: "12px", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflow: "auto", border: `2px solid ${GOLD}`, boxShadow: `0 0 30px rgba(201,168,76,0.2)` }}>
            {/* POPUP HEADER */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY_SURFACE}, ${NAVY_MID})`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/favicon.svg" alt="ARK" style={{ width: "40px", height: "40px" }} />
                <div>
                  <div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>ARK Law AI</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 9 }}>Legal News Analysis</div>
                </div>
              </div>
              <button onClick={() => setShowNewsPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer", padding: "0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>

            {/* POPUP CONTENT */}
            <div style={{ padding: "25px" }}>
              {/* HEADLINE */}
              <p style={{ color: GOLD, fontSize: 15, fontWeight: 700, marginBottom: "10px", lineHeight: "1.6" }}>
                {selectedNews.headline}
              </p>

              {/* SOURCE */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px", padding: "10px", background: NAVY_SURFACE, borderRadius: "4px", borderLeft: `3px solid ${ACCENT_PK}` }}>
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>📰 Source:</span>
                <span style={{ fontSize: 11, color: ACCENT_PK, fontWeight: 600 }}>{selectedNews.source}</span>
              </div>

              {/* DIVIDER */}
              <div style={{ height: "1px", background: NAVY_BORDER, margin: "15px 0" }}></div>

              {/* FULL TEXT */}
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "8px" }}>Full News Details:</h4>
                <p style={{ color: TEXT_PRIMARY, fontSize: 13, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                  {selectedNews.fullText}
                </p>
              </div>

              {/* DIVIDER */}
              <div style={{ height: "1px", background: NAVY_BORDER, margin: "15px 0" }}></div>

              {/* LEGAL ANALYSIS */}
              <div>
                <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "8px" }}>⚖️ Legal Analysis & Impact:</h4>
                {newsLoading ? (
                  <div style={{ color: TEXT_MUTED, fontSize: 13, textAlign: "center", padding: "20px" }}>
                    ⏳ Analyzing legal significance...
                  </div>
                ) : (
                  <div style={{ color: TEXT_SECONDARY, fontSize: 13, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {newsAnalysis}
                  </div>
                )}
              </div>
            </div>

            {/* POPUP FOOTER */}
            <div style={{ padding: "15px 25px", borderTop: `2px solid ${GOLD}`, background: NAVY_SURFACE, display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowNewsPopup(false)} style={{ padding: "10px 24px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT DRAFTING POPUP */}
      {showDraftPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, borderRadius: "12px", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflow: "auto", border: `2px solid ${GOLD}` }}>
            <div style={{ background: NAVY, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${NAVY_BORDER}` }}>
              <h3 style={{ color: GOLD, margin: 0 }}>✍️ Legal Document Drafting</h3>
              <button onClick={() => setShowDraftPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 24, cursor: "pointer" }}>
                ✕
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <select value={draftType} onChange={(e) => setDraftType(e.target.value)} style={{ width: "100%", padding: "10px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "15px", fontSize: 12 }}>
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt.toUpperCase()}
                  </option>
                ))}
              </select>

              <input type="text" placeholder="Document Title" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} style={{ width: "100%", padding: "10px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "15px", fontSize: 12 }} />

              <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} placeholder="Start typing your document content here..." style={{ width: "100%", height: "300px", padding: "10px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "15px", fontSize: 12, fontFamily: "Arial, sans-serif" }} />

              <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: "15px" }}>
                Words: {draftContent.split(/\s+/).filter(Boolean).length} | Characters: {draftContent.length}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowDraftPopup(false)} style={{ flex: 1, padding: "10px", background: NAVY_BORDER, color: TEXT_PRIMARY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 12 }}>
                  Close
                </button>
                <button onClick={() => downloadDraft("doc")} style={{ flex: 1, padding: "10px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                  ⬇️ DOC
                </button>
                <button onClick={() => downloadDraft("pdf")} style={{ flex: 1, padding: "10px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                  ⬇️ PDF
                </button>
                <button onClick={() => downloadDraft("docx")} style={{ flex: 1, padding: "10px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                  ⬇️ DOCX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
