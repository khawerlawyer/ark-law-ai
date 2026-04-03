import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ARK Law AI v4.2 - DataNexus Layout with Traditional Menu
const DESIGN = {
  colors: {
    primary: "#1E3A5F",
    accent: "#C9A84C",
    accentGreen: "#3EB489",
    bg: "#F8F9FA",
    white: "#FFFFFF",
    cardBg: "#FEFEFE",
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  },
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "16px"
  }
};

export default function ARKLawAI() {
  // State
  const [user, setUser] = useState(null);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showMyAccountPopup, setShowMyAccountPopup] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showDraftPopup, setShowDraftPopup] = useState(false);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userTokens, setUserTokens] = useState(500000);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef(null);

  const MENU_ITEMS = [
    { label: "Home", href: "#" },
    { label: "About Us", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Resources", href: "#resources" },
    { label: "Contact Us", href: "#contact" }
  ];

  const QUICK_PROMPTS = [
    { text: "Draft a legal notice", icon: "📄" },
    { text: "Explain Section 420 PPC", icon: "📚" },
    { text: "Summarize a judgment", icon: "⚖️" }
  ];

  // Send Message
  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) {
      setUserTokens(prev => Math.max(0, prev - tokensToDeduct));
    }

    let messageContent = input.trim();
    if (uploadedFiles.length > 0) {
      messageContent += "\n\n📎 Attached: " + uploadedFiles.map(f => f.name).join(", ");
    }

    const updatedMessages = [...messages, { role: "user", content: messageContent }];
    setMessages(updatedMessages);
    setInput("");
    setUploadedFiles([]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      const idx = updatedMessages.length;
      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[idx] = { role: "assistant", content: accumulated };
                  return newMsgs;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev.slice(0, -1), {
        role: "assistant",
        content: "⚠️ Error occurred. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "السلام علیکم! Welcome to ARK Law AI - Your trusted Pakistani legal companion.",
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Head>
        <title>ARK Law AI - Professional Pakistani Legal Assistant</title>
      </Head>

      <div style={{ minHeight: "100vh", background: DESIGN.colors.bg, display: "flex", flexDirection: "column" }}>
        
        {/* HEADER */}
        <header style={{ 
          background: DESIGN.colors.white, 
          borderBottom: "1px solid " + DESIGN.colors.border,
          boxShadow: DESIGN.shadows.sm,
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}>
          {/* Logo & Auth Row */}
          <div style={{ padding: isMobile ? "12px 20px" : "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "40px", height: "40px" }} />
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: DESIGN.colors.text }}>ARK Law AI</div>
                <div style={{ fontSize: "11px", color: DESIGN.colors.textMuted }}>Professional Legal Intelligence</div>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {!user ? (
                <>
                  <button onClick={() => setShowLoginPopup(true)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid " + DESIGN.colors.border, color: DESIGN.colors.text, fontWeight: 600, cursor: "pointer", fontSize: "14px", borderRadius: DESIGN.borderRadius.sm }}>
                    Log in
                  </button>
                  <button onClick={() => setShowSignupPopup(true)} style={{ padding: "10px 20px", background: DESIGN.colors.primary, color: DESIGN.colors.white, border: "none", borderRadius: DESIGN.borderRadius.sm, fontWeight: 700, cursor: "pointer", fontSize: "14px", boxShadow: DESIGN.shadows.sm }}>
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  <div style={{ padding: "8px 16px", background: DESIGN.colors.cardBg, borderRadius: DESIGN.borderRadius.sm, fontSize: "13px", fontWeight: 600, border: "1px solid " + DESIGN.colors.border }}>
                    ⚡ {userTokens.toLocaleString()} Credits
                  </div>
                  <button onClick={() => setShowMyAccountPopup(true)} style={{ padding: "8px 16px", background: DESIGN.colors.primary, color: DESIGN.colors.white, border: "none", borderRadius: DESIGN.borderRadius.sm, fontWeight: 600, cursor: "pointer" }}>
                    👤 {user.name}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Menu Bar */}
          <div style={{ 
            padding: "0 40px", 
            borderTop: "1px solid " + DESIGN.colors.border,
            background: DESIGN.colors.cardBg,
            display: "flex",
            gap: "4px",
            overflowX: "auto"
          }}>
            {MENU_ITEMS.map((item, i) => (
              <a
                key={i}
                href={item.href}
                style={{
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "3px solid transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: DESIGN.colors.textSecondary,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = DESIGN.colors.primary;
                  e.currentTarget.style.color = DESIGN.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = "transparent";
                  e.currentTarget.style.color = DESIGN.colors.textSecondary;
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </header>


        {/* MAIN LAYOUT - 3 Column DataNexus Style */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
          
          {/* Watermark Logo */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.025,
            pointerEvents: "none",
            zIndex: 0
          }}>
            <img src="/ark-logo.png" alt="" style={{ width: isMobile ? "300px" : "600px", height: isMobile ? "300px" : "600px", filter: "grayscale(100%) brightness(1.2)" }} />
          </div>

          {/* 3-Column Grid */}
          <div style={{ 
            flex: 1,
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "280px 1fr 320px",
            gap: "24px",
            padding: isMobile ? "16px" : "24px 40px",
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
            position: "relative",
            zIndex: 1,
            overflow: "hidden"
          }}>
            
            {/* LEFT SIDEBAR - Feature Buttons */}
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto" }}>
                
                {/* Feature Cards */}
                <div style={{ background: DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: "20px", border: "1px solid " + DESIGN.colors.border, boxShadow: DESIGN.shadows.sm }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: DESIGN.colors.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Legal Tools
                  </h3>
                  
                  <button onClick={() => setShowDraftPopup(true)} style={{ width: "100%", padding: "16px", background: DESIGN.colors.cardBg, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, marginBottom: "12px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "24px", width: "40px", height: "40px", background: DESIGN.colors.accent + "15", borderRadius: DESIGN.borderRadius.sm, display: "flex", alignItems: "center", justifyContent: "center" }}>📝</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: DESIGN.colors.text }}>Draft Document</div>
                      <div style={{ fontSize: "11px", color: DESIGN.colors.textMuted }}>Generate legal documents</div>
                    </div>
                  </button>

                  <button onClick={() => setShowComparePopup(true)} style={{ width: "100%", padding: "16px", background: DESIGN.colors.cardBg, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, marginBottom: "12px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "24px", width: "40px", height: "40px", background: DESIGN.colors.primary + "15", borderRadius: DESIGN.borderRadius.sm, display: "flex", alignItems: "center", justifyContent: "center" }}>⚖️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: DESIGN.colors.text }}>Compare Documents</div>
                      <div style={{ fontSize: "11px", color: DESIGN.colors.textMuted }}>Analyze differences</div>
                    </div>
                  </button>

                  <button style={{ width: "100%", padding: "16px", background: DESIGN.colors.cardBg, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "24px", width: "40px", height: "40px", background: DESIGN.colors.accentGreen + "15", borderRadius: DESIGN.borderRadius.sm, display: "flex", alignItems: "center", justifyContent: "center" }}>🔍</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: DESIGN.colors.text }}>Legal Research</div>
                      <div style={{ fontSize: "11px", color: DESIGN.colors.textMuted }}>Search case law</div>
                    </div>
                  </button>
                </div>

                {/* Info Cards */}
                <div style={{ background: DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: "24px", border: "1px solid " + DESIGN.colors.border, boxShadow: DESIGN.shadows.sm }}>
                  <div style={{ width: "48px", height: "48px", background: DESIGN.colors.primary + "15", borderRadius: DESIGN.borderRadius.md, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "12px" }}>💡</div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: DESIGN.colors.text }}>Smart Legal Insights</h4>
                  <p style={{ fontSize: "12px", color: DESIGN.colors.textSecondary, lineHeight: "1.5", marginBottom: "12px" }}>Ask anything. Get accurate, data-backed answers from Pakistani law.</p>
                  <button style={{ width: "100%", padding: "10px", background: DESIGN.colors.primary + "10", border: "1px solid " + DESIGN.colors.primary + "30", borderRadius: DESIGN.borderRadius.sm, color: DESIGN.colors.primary, fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                    Explore Insights →
                  </button>
                </div>
              </div>
            )}

            {/* CENTER - Chat Area */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              
              {/* Chat Messages - Scrollable */}
              <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
                
                {messages.length <= 1 ? (
                  <div style={{ background: DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: isMobile ? "40px 24px" : "60px 40px", textAlign: "center", border: "1px solid " + DESIGN.colors.border, boxShadow: DESIGN.shadows.md }}>
                    <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "80px", height: "80px", margin: "0 auto 20px", display: "block" }} />
                    <h1 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: 800, marginBottom: "12px", color: DESIGN.colors.text }}>Hello! I'm ARK Law AI</h1>
                    <p style={{ fontSize: "16px", color: DESIGN.colors.textSecondary, marginBottom: "32px" }}>Ask legal questions, draft documents, and analyze case law with Pakistan's most advanced legal AI.</p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button key={i} onClick={() => setInput(prompt.text)} style={{ padding: "16px", background: DESIGN.colors.cardBg, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "18px" }}>{prompt.icon}</span>
                          <span style={{ fontWeight: 500, fontSize: "13px" }}>{prompt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {messages.slice(1).map((msg, i) => (
                      <div key={i} style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        {msg.role === "assistant" && <img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px", flexShrink: 0, marginTop: "4px" }} />}
                        <div style={{ flex: 1, background: msg.role === "user" ? DESIGN.colors.primary + "08" : DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: "16px 20px", border: "1px solid " + DESIGN.colors.border, borderLeft: "4px solid " + (msg.role === "user" ? DESIGN.colors.primary : DESIGN.colors.accent), boxShadow: DESIGN.shadows.sm }}>
                          <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px", color: DESIGN.colors.text }}>
                            {msg.role === "user" ? (user ? user.name : "You") : "ARK Law AI"}
                          </div>
                          <div style={{ fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: DESIGN.colors.text }}>{msg.content}</div>
                        </div>
                        {msg.role === "user" && <div style={{ width: "32px", height: "32px", background: DESIGN.colors.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: DESIGN.colors.white, fontSize: "16px", flexShrink: 0, marginTop: "4px" }}>👤</div>}
                      </div>
                    ))}
                    
                    {loading && (
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px", flexShrink: 0, marginTop: "4px" }} />
                        <div style={{ flex: 1, background: DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: "16px 20px", border: "1px solid " + DESIGN.colors.border, borderLeft: "4px solid " + DESIGN.colors.accent }}>
                          <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>ARK Law AI</div>
                          <div style={{ fontSize: "12px", color: DESIGN.colors.textMuted }}>Analyzing legal data...</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div style={{ background: DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: "20px", border: "1px solid " + DESIGN.colors.border, boxShadow: DESIGN.shadows.lg }}>
                {uploadedFiles.length > 0 && (
                  <div style={{ marginBottom: "12px", padding: "12px", background: DESIGN.colors.cardBg, borderRadius: DESIGN.borderRadius.md, border: "1px solid " + DESIGN.colors.border }}>
                    {uploadedFiles.map((file, i) => (
                      <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: DESIGN.colors.white, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.sm, marginRight: "8px", fontSize: "12px" }}>
                        📎 {file.name}
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask your legal question..." style={{ flex: 1, minHeight: "56px", maxHeight: "150px", padding: "16px", border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  
                  <label style={{ width: "48px", height: "48px", background: DESIGN.colors.cardBg, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px" }}>
                    📎
                    <input type="file" multiple onChange={(e) => { const files = Array.from(e.target.files); if (files.length) setUploadedFiles(prev => [...prev, ...files]); }} style={{ display: "none" }} />
                  </label>
                  
                  <button onClick={() => setIsListening(!isListening)} style={{ width: "48px", height: "48px", background: isListening ? DESIGN.colors.error : DESIGN.colors.cardBg, color: isListening ? DESIGN.colors.white : DESIGN.colors.text, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, cursor: "pointer", fontSize: "20px" }}>
                    {isListening ? "🔴" : "🎤"}
                  </button>
                  
                  <button onClick={sendMessage} disabled={loading || (!input.trim() && !uploadedFiles.length)} style={{ width: "48px", height: "48px", background: loading || (!input.trim() && !uploadedFiles.length) ? DESIGN.colors.border : "linear-gradient(135deg, " + DESIGN.colors.primary + ", " + DESIGN.colors.accent + ")", border: "none", borderRadius: DESIGN.borderRadius.md, cursor: loading ? "not-allowed" : "pointer", color: DESIGN.colors.white, fontSize: "20px", fontWeight: "bold" }}>→</button>
                </div>
                
                <div style={{ marginTop: "12px", fontSize: "11px", color: DESIGN.colors.textMuted, textAlign: "center" }}>
                  ⚠️ ARK Law AI is an AI-assisted legal tool and does not replace professional legal advice.
                </div>
              </div>
            </div>


            {/* RIGHT SIDEBAR - Upgrade & Quick Actions */}
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto" }}>
                
                {/* Upgrade to Pro */}
                <div style={{ background: "linear-gradient(135deg, " + DESIGN.colors.accent + ", #E5C887)", borderRadius: DESIGN.borderRadius.lg, padding: "28px 24px", boxShadow: DESIGN.shadows.lg, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                  
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>👑</div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px", color: DESIGN.colors.primary }}>Upgrade to Pro</h3>
                    <p style={{ fontSize: "13px", marginBottom: "20px", opacity: 0.9, color: DESIGN.colors.primary, lineHeight: "1.5" }}>
                      Unlock advanced insights, deeper data sources, and priority access.
                    </p>
                    
                    <div style={{ marginBottom: "20px" }}>
                      {["✓ Unlimited queries", "✓ Advanced data sources", "✓ Priority support"].map((benefit, i) => (
                        <div key={i} style={{ fontSize: "13px", marginBottom: "8px", color: DESIGN.colors.primary, fontWeight: 500 }}>
                          {benefit}
                        </div>
                      ))}
                    </div>
                    
                    <button onClick={() => setShowUpgradePopup(true)} style={{ width: "100%", padding: "14px", background: DESIGN.colors.white, color: DESIGN.colors.primary, border: "none", borderRadius: DESIGN.borderRadius.md, fontWeight: 700, cursor: "pointer", fontSize: "14px", boxShadow: DESIGN.shadows.md }}>
                      ✨ Go Pro
                    </button>
                    
                    <div style={{ marginTop: "12px", fontSize: "11px", textAlign: "center", opacity: 0.8, color: DESIGN.colors.primary }}>
                      Cancel anytime.
                    </div>
                  </div>
                </div>

                {/* Quick Legal Actions */}
                <div style={{ background: DESIGN.colors.white, borderRadius: DESIGN.borderRadius.lg, padding: "24px", border: "1px solid " + DESIGN.colors.border, boxShadow: DESIGN.shadows.sm }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: DESIGN.colors.text }}>Quick Legal Actions</h3>
                  <p style={{ fontSize: "12px", color: DESIGN.colors.textMuted, marginBottom: "16px" }}>Try these examples to get started</p>
                  
                  {[
                    { text: "Draft Agreement", icon: "📋", action: () => { setShowDraftPopup(true); } },
                    { text: "Summarize Judgment", icon: "⚖️", action: () => setInput("Please help me summarize a judgment") },
                    { text: "Legal Research", icon: "🔍", action: () => setInput("I need legal research on ") },
                    { text: "Translate Text", icon: "🌐", action: () => setInput("Please translate: ") },
                    { text: "Generate Petition", icon: "📜", action: () => { setShowDraftPopup(true); } }
                  ].map((action, i) => (
                    <button key={i} onClick={action.action} style={{ width: "100%", padding: "14px 16px", background: DESIGN.colors.cardBg, border: "1px solid " + DESIGN.colors.border, borderRadius: DESIGN.borderRadius.md, marginBottom: "10px", fontSize: "13px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{action.icon}</span>
                        <span style={{ fontWeight: 500 }}>{action.text}</span>
                      </span>
                      <span style={{ color: DESIGN.colors.textMuted }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ padding: "12px 40px", borderTop: "1px solid " + DESIGN.colors.border, fontSize: "11px", color: DESIGN.colors.textMuted, background: DESIGN.colors.white, position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "4px" }}>
            ⚠️ For legal information only — not a substitute for consulting a qualified Pakistani lawyer
          </div>
          <div style={{ textAlign: "center", color: DESIGN.colors.accent, fontSize: "10px" }}>
            This AI Initiative is Dedicated to the Legacy, Legal Acumen and Wisdom of Honorable Mr. Justice S. A. Rabbani, Legendary Jurist of Pakistan
          </div>
          
          <div style={{ position: "absolute", bottom: "12px", right: "40px", padding: "6px 16px", background: "linear-gradient(135deg, " + DESIGN.colors.accent + ", #E5C887)", color: DESIGN.colors.primary, borderRadius: DESIGN.borderRadius.sm, fontSize: "10px", fontWeight: 700, boxShadow: DESIGN.shadows.sm }}>
            ✨ Designed & Developed by ARK Lex AI LLC.
          </div>
        </footer>

      </div>

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, padding: "35px", borderRadius: "12px", width: "90%", maxWidth: "450px", border: `3px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}50` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "45px", height: "45px" }} />
                <h2 style={{ color: GOLD, margin: 0, fontSize: "20px" }}>Login to ARK Law AI</h2>
              </div>
              <button onClick={() => setShowLoginPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 26, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              
              const email = formData.get('email');
              const password = formData.get('password');
              
              try {
                // Call login API
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password }),
                });
                
                const data = await res.json();
                
                if (!res.ok) {
                  alert(data.error || 'Invalid email or password');
                  return;
                }
                
                // Login successful
                const userWithoutPassword = data.user;
                
                // Set user and tokens
                localStorage.setItem('arklaw_user', JSON.stringify(userWithoutPassword));
                setUser(userWithoutPassword);
                setUserTokens(userWithoutPassword.tokens || 500000); // Load user's token count
                
                // Load chat history if exists
                if (userWithoutPassword.chatHistory && userWithoutPassword.chatHistory.length > 0) {
                  setChatHistory(userWithoutPassword.chatHistory);
                }
                
                setShowLoginPopup(false);
                
                console.log('✅ Login successful:', email);
                console.log('💰 User tokens:', userWithoutPassword.tokens);
                alert(`Welcome back, ${userWithoutPassword.name}! You have ${userWithoutPassword.tokens?.toLocaleString() || '500,000'} credits.`);
              } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
              }
            }}>
              
              <div style={{ marginBottom: "18px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Email Address</label>
                <input name="email" type="email" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="your.email@example.com" />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Password</label>
                <input name="password" type="password" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="Enter your password" />
              </div>

              <button type="submit" style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${GOLD}, #E5C887)`, color: NAVY, border: "none", borderRadius: "6px", fontWeight: 700, fontSize: 16, cursor: "pointer", marginBottom: "15px", boxShadow: `0 4px 15px ${GOLD}40` }}>
                Login
              </button>

              <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 12 }}>
                Don't have an account? <span onClick={() => { setShowLoginPopup(false); setShowSignupPopup(true); }} style={{ color: ACCENT_PK, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Sign up here</span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* SIGNUP POPUP */}
      {showSignupPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "600px", border: `3px solid ${GOLD}`, maxHeight: "90vh", overflowY: "auto", boxShadow: `0 0 30px ${GOLD}50` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "50px", height: "50px" }} />
                <h2 style={{ color: GOLD, margin: 0, fontSize: "22px" }}>Join ARK Law AI</h2>
              </div>
              <button onClick={() => setShowSignupPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              
              const email = formData.get('email');
              const password = formData.get('password');
              const name = formData.get('name');
              const age = formData.get('age');
              const profession = formData.get('profession');
              const barOfPractice = formData.get('barOfPractice');
              const city = formData.get('city');
              const province = formData.get('province');
              const country = formData.get('country');
              
              try {
                // Call backend API
                const res = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email,
                    password,
                    name,
                    age,
                    profession,
                    barOfPractice,
                    city,
                    province,
                    country,
                  }),
                });

                const data = await res.json();

                if (res.ok) {
                  console.log('✅ User created successfully:', email);
                  setShowSignupPopup(false);
                  alert('🎉 Account created successfully! You have been awarded 500,000 FREE credits! Please login.');
                  setShowLoginPopup(true);
                } else {
                  alert(data.error || 'Signup failed. Please try again.');
                }
              } catch (error) {
                console.error('Signup error:', error);
                alert('Signup failed. Please try again.');
              }
            }}>
              
              <div style={{ marginBottom: "18px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Email Address (Username) *</label>
                <input name="email" type="email" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="your.email@example.com" />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Password *</label>
                <input name="password" type="password" required minLength={6} style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="Minimum 6 characters" />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Full Name *</label>
                <input name="name" type="text" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="Your full name" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Age *</label>
                  <input name="age" type="number" required min={18} max={100} style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} />
                </div>
                
                <div>
                  <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Profession *</label>
                  <select name="profession" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }}>
                    <option value="">Select...</option>
                    <option>Lawyer</option>
                    <option>Legal Assistant</option>
                    <option>Paralegal</option>
                    <option>Law Clerk</option>
                    <option>Court Researcher</option>
                    <option>Law Student</option>
                    <option>Judge</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Bar of Practice (Optional)</label>
                <input name="barOfPractice" type="text" placeholder="e.g., Punjab Bar Council" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>City *</label>
                  <input name="city" type="text" required placeholder="e.g., Lahore" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} />
                </div>
                
                <div>
                  <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Province/State *</label>
                  <input name="province" type="text" required placeholder="e.g., Punjab" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} />
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Country *</label>
                <input name="country" type="text" required defaultValue="Pakistan" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} />
              </div>

              <button type="submit" style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${ACCENT_PK}, #2D9B6E)`, color: "white", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `0 4px 15px ${ACCENT_PK}40` }}>
                Create Account
              </button>

              <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 12, marginTop: "15px" }}>
                Already have an account? <span onClick={() => { setShowSignupPopup(false); setShowLoginPopup(true); }} style={{ color: GOLD, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Login here</span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* MY ACCOUNT POPUP */}
      {showMyAccountPopup && user && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, borderRadius: "12px", width: "90%", maxWidth: "1000px", border: `3px solid ${GOLD}`, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: `0 0 40px ${GOLD}50` }}>
            
            {/* Header with Logo */}
            <div style={{ padding: "25px 35px", borderBottom: `2px solid ${NAVY_BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "50px", height: "50px", filter: `drop-shadow(0 0 10px ${GOLD}60)` }} />
                <div>
                  <h2 style={{ color: GOLD, margin: 0, fontSize: "22px", fontWeight: 700 }}>ARK Law AI</h2>
                  <p style={{ color: ACCENT_PK, margin: "4px 0 0 0", fontSize: "12px" }}>My Account</p>
                </div>
              </div>
              <button onClick={() => setShowMyAccountPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            {/* Main Content - Two Column Layout */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              
              {/* LEFT COLUMN - User Information */}
              <div style={{ flex: "0 0 60%", padding: "30px", overflowY: "auto", borderRight: `2px solid ${NAVY_BORDER}` }}>
                
                {/* User Avatar & Name */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}, ${ACCENT_PK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 700, color: NAVY, boxShadow: `0 4px 15px ${GOLD}40` }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ color: CREAM, margin: 0, fontSize: "24px", fontWeight: 700 }}>{user.name}</h3>
                    <p style={{ color: TEXT_MUTED, margin: "5px 0 0 0", fontSize: "12px" }}>
                      ⭐ Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Account Information */}
                <div style={{ background: NAVY_SURFACE, padding: "20px", borderRadius: "8px", marginBottom: "20px", border: `1px solid ${NAVY_BORDER}` }}>
                  <h4 style={{ color: ACCENT_PK, fontSize: 14, marginBottom: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Account Information</h4>
                  
                  <div style={{ display: "grid", gap: "14px" }}>
                    <div>
                      <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                      <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.email}</div>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Age</label>
                        <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.age}</div>
                      </div>
                      <div>
                        <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Profession</label>
                        <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.profession}</div>
                      </div>
                    </div>
                    
                    {user.barOfPractice && (
                      <div>
                        <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bar of Practice</label>
                        <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.barOfPractice}</div>
                      </div>
                    )}
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>City</label>
                        <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.city}</div>
                      </div>
                      <div>
                        <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Province</label>
                        <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.province}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Country</label>
                      <div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.country}</div>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={() => {
                    localStorage.removeItem('arklaw_user');
                    localStorage.removeItem(`chat_history_${user.id}`);
                    setUser(null);
                    setChatHistory([]);
                    setShowMyAccountPopup(false);
                    alert('You have been logged out successfully.');
                  }}
                  style={{ 
                    width: "100%", 
                    padding: "14px", 
                    background: `linear-gradient(135deg, #DC2626, #991B1B)`, 
                    color: "white", 
                    border: "none", 
                    borderRadius: "8px", 
                    fontWeight: 700, 
                    fontSize: 15, 
                    cursor: "pointer", 
                    boxShadow: `0 4px 15px rgba(220, 38, 38, 0.4)`,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                >
                  🚪 Logout
                </button>
              </div>

              {/* RIGHT COLUMN - Chat History */}
              <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", background: NAVY_SURFACE }}>
                <div style={{ padding: "20px", borderBottom: `1px solid ${NAVY_BORDER}` }}>
                  <h4 style={{ color: GOLD, fontSize: 14, margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>📜 Chat History</h4>
                  <p style={{ color: TEXT_MUTED, fontSize: 10, margin: "5px 0 0 0" }}>Your previous conversations</p>
                </div>
                
                <div style={{ flex: 1, overflowY: "auto", padding: "15px" }}>
                  {chatHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: TEXT_MUTED }}>
                      <div style={{ fontSize: 40, marginBottom: "10px" }}>💬</div>
                      <p style={{ fontSize: 12, margin: 0 }}>No chat history yet</p>
                      <p style={{ fontSize: 10, margin: "5px 0 0 0" }}>Start asking questions!</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {chatHistory.slice().reverse().map((item, idx) => (
                        <div 
                          key={item.id || idx} 
                          style={{ 
                            background: NAVY, 
                            padding: "12px", 
                            borderRadius: "6px", 
                            border: `1px solid ${NAVY_BORDER}`,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = GOLD;
                            e.currentTarget.style.background = `${NAVY}dd`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = NAVY_BORDER;
                            e.currentTarget.style.background = NAVY;
                          }}
                        >
                          <div style={{ color: CREAM, fontSize: 12, lineHeight: "1.4", marginBottom: "6px" }}>
                            {item.question}
                          </div>
                          <div style={{ color: TEXT_MUTED, fontSize: 9, display: "flex", alignItems: "center", gap: "5px" }}>
                            <span>🕒</span>
                            {new Date(item.timestamp).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* UPGRADE TO PRO POPUP */}
      {showUpgradePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ 
            background: NAVY, 
            padding: "40px", 
            borderRadius: "16px", 
            width: "90%", 
            maxWidth: "500px", 
            border: `3px solid ${GOLD}`, 
            boxShadow: `0 0 40px ${GOLD}60`,
            textAlign: "center"
          }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowUpgradePopup(false)} 
              style={{ 
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none", 
                border: "none", 
                color: GOLD, 
                fontSize: 32, 
                cursor: "pointer", 
                lineHeight: 1,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotate(90deg)";
                e.currentTarget.style.color = ACCENT_PK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotate(0deg)";
                e.currentTarget.style.color = GOLD;
              }}
            >
              ✕
            </button>

            {/* Logo and App Name */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
              <img 
                src="/ark-logo.png" 
                alt="ARK Law AI" 
                style={{ 
                  width: "100px", 
                  height: "100px",
                  filter: `drop-shadow(0 0 20px ${GOLD}60)`
                }} 
              />
              <h2 style={{ 
                color: GOLD, 
                margin: 0, 
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "1px"
              }}>
                ARK Law AI
              </h2>
            </div>

            {/* Icon */}
            <div style={{ 
              width: "80px", 
              height: "80px", 
              margin: "0 auto 20px",
              background: `linear-gradient(135deg, #4A90E2, #6B5CE7)`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              boxShadow: `0 8px 20px rgba(74, 144, 226, 0.4)`,
              animation: "pulse 2s infinite"
            }}>
              ✨
            </div>

            {/* Title */}
            <h3 style={{ 
              color: CREAM, 
              fontSize: "28px", 
              fontWeight: 700, 
              margin: "0 0 15px 0" 
            }}>
              Upgrade to Pro
            </h3>

            {/* Description */}
            <p style={{ 
              color: TEXT_MUTED, 
              fontSize: "16px", 
              lineHeight: "1.6",
              marginBottom: "30px"
            }}>
              Get more tools, faster AI, and exclusive features
            </p>

            {/* Coming Soon Badge */}
            <div style={{ 
              display: "inline-block",
              padding: "20px 40px",
              background: `linear-gradient(135deg, ${GOLD}, ${ACCENT_PK})`,
              borderRadius: "12px",
              boxShadow: `0 4px 20px ${GOLD}40`
            }}>
              <div style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                color: NAVY,
                marginBottom: "5px"
              }}>
                🚀 COMING SOON
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: `${NAVY}cc`
              }}>
                Stay tuned for exciting updates!
              </div>
            </div>

            {/* Features List */}
            <div style={{ 
              marginTop: "30px",
              textAlign: "left",
              background: NAVY_SURFACE,
              padding: "20px",
              borderRadius: "10px",
              border: `1px solid ${NAVY_BORDER}`
            }}>
              <div style={{ color: GOLD, fontSize: "14px", fontWeight: 700, marginBottom: "15px" }}>
                ✨ Pro Features:
              </div>
              {[
                "Priority AI Response Time",
                "Advanced Document Analysis",
                "Unlimited Chat History",
                "Export Chat as PDF",
                "Premium Legal Templates",
                "24/7 Priority Support"
              ].map((feature, i) => (
                <div key={i} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px",
                  marginBottom: "10px",
                  color: TEXT_MUTED,
                  fontSize: "13px"
                }}>
                  <span style={{ color: ACCENT_PK, fontSize: "16px" }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </>
  );
}
