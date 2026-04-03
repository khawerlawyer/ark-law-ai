import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ARK Law AI v4.0 - Professional Legal SaaS Dashboard
// Design System
const DESIGN = {
  colors: {
    primary: "#1E3A5F",      // Professional navy
    primaryLight: "#2D4A6F",
    accent: "#C9A84C",       // Subtle gold
    accentGreen: "#3EB489",  // Legal green
    bg: "#F8F9FA",           // Light professional grey
    white: "#FFFFFF",
    cardBg: "#FEFEFE",
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    borderDark: "#D1D5DB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px"
  },
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "20px",
    full: "9999px"
  }
};

export default function ARKLawAI() {
  // State Management - ALL from working version
  const [user, setUser] = useState(null);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showMyAccountPopup, setShowMyAccountPopup] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showDraftPopup, setShowDraftPopup] = useState(false);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userTokens, setUserTokens] = useState(500000);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [draftContent, setDraftContent] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState("affidavit");
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [comparisonResult, setComparisonResult] = useState("");
  const [comparingDocs, setComparingDocs] = useState(false);
  const messagesEndRef = useRef(null);

  // Constants
  const LEGAL_FEATURES = [
    { id: "chat", icon: "💬", title: "AI Legal Chat", desc: "Ask any legal question", color: DESIGN.colors.primary },
    { id: "draft", icon: "📝", title: "Draft Document", desc: "Generate legal documents", color: DESIGN.colors.accent },
    { id: "research", icon: "🔍", title: "Legal Research", desc: "Search case law & statutes", color: DESIGN.colors.accentGreen },
    { id: "translate", icon: "🌐", title: "Urdu ↔ English", desc: "Translate legal text", color: DESIGN.colors.primary },
    { id: "compare", icon: "⚖️", title: "Compare Docs", desc: "Analyze differences", color: DESIGN.colors.accent }
  ];

  const QUICK_PROMPTS = [
    { text: "Draft a legal notice", icon: "📄" },
    { text: "Explain Section 420 PPC", icon: "📚" },
    { text: "Summarize a judgment", icon: "⚖️" },
    { text: "Property inheritance laws", icon: "🏠" },
    { text: "Employment contract terms", icon: "💼" },
    { text: "Tenant rights in Pakistan", icon: "🔑" }
  ];

  const QUICK_ACTIONS = [
    { text: "Draft Agreement", icon: "📋", action: () => { setDraftType("agreement"); setShowDraftPopup(true); } },
    { text: "Summarize Judgment", icon: "⚖️", action: () => setInput("Please help me summarize a legal judgment") },
    { text: "Legal Research", icon: "🔍", action: () => setInput("I need help with legal research on ") },
    { text: "Translate Legal Text", icon: "🌐", action: () => setInput("Please translate this legal text from Urdu to English: ") },
    { text: "Generate Petition", icon: "📜", action: () => { setDraftType("petition"); setShowDraftPopup(true); } }
  ];

  // Send Message Function - PRESERVED from working version
  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) {
      setUserTokens(prev => Math.max(0, prev - tokensToDeduct));
    }

    let messageContent = input.trim();
    
    if (uploadedFiles.length > 0) {
      messageContent += "\n\n📎 Attached files: " + uploadedFiles.map(f => f.name).join(", ");
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

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      const streamingMessageIndex = updatedMessages.length;
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
                accumulatedContent += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[streamingMessageIndex] = {
                    role: "assistant",
                    content: accumulatedContent
                  };
                  return newMessages;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev.slice(0, -1), {
        role: "assistant",
        content: "⚠️ I apologize, but I encountered an error. Please try again or contact support if this persists."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input logic from working version would go here
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Effects
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "السلام علیکم! Welcome to ARK Law AI - Your trusted Pakistani legal companion. How may I assist you today?",
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Head>
        <title>ARK Law AI - Professional Pakistani Legal Assistant</title>
        <meta name="description" content="AI-powered legal research and document drafting for Pakistani law" />
      </Head>

      <div style={{ 
        minHeight: "100vh", 
        background: DESIGN.colors.bg,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        
        {/* HEADER */}
        <header style={{ 
          background: DESIGN.colors.white, 
          padding: isMobile ? "12px 20px" : "16px 40px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderBottom: "1px solid " + DESIGN.colors.border,
          boxShadow: DESIGN.shadows.sm,
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "24px", 
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                ☰
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, " + DESIGN.colors.primary + ", " + DESIGN.colors.accent + ")",
                borderRadius: DESIGN.borderRadius.md,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DESIGN.colors.white,
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                ⚖
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: DESIGN.colors.text }}>
                  ARK Law AI
                </div>
                <div style={{ fontSize: "11px", color: DESIGN.colors.textMuted }}>
                  Professional Legal Intelligence
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!user ? (
              <>
                <button 
                  onClick={() => setShowLoginPopup(true)} 
                  style={{ 
                    padding: "10px 20px", 
                    background: "transparent", 
                    border: "1px solid " + DESIGN.colors.border, 
                    color: DESIGN.colors.text, 
                    fontWeight: 600, 
                    cursor: "pointer", 
                    fontSize: "14px",
                    borderRadius: DESIGN.borderRadius.sm,
                    transition: "all 0.2s"
                  }}
                >
                  Log in
                </button>
                <button 
                  onClick={() => setShowSignupPopup(true)} 
                  style={{ 
                    padding: "10px 20px", 
                    background: DESIGN.colors.primary, 
                    color: DESIGN.colors.white, 
                    border: "none", 
                    borderRadius: DESIGN.borderRadius.sm, 
                    fontWeight: 700, 
                    cursor: "pointer", 
                    fontSize: "14px",
                    boxShadow: DESIGN.shadows.sm,
                    transition: "all 0.2s"
                  }}
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                <div style={{ 
                  padding: "8px 16px", 
                  background: DESIGN.colors.cardBg, 
                  borderRadius: DESIGN.borderRadius.sm, 
                  fontSize: "13px", 
                  fontWeight: 600,
                  border: "1px solid " + DESIGN.colors.border,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span style={{ color: DESIGN.colors.accent }}>⚡</span>
                  <span>{userTokens.toLocaleString()} Credits</span>
                </div>
                <button 
                  onClick={() => setShowMyAccountPopup(true)} 
                  style={{ 
                    padding: "8px 16px", 
                    background: DESIGN.colors.primary, 
                    color: DESIGN.colors.white, 
                    border: "none", 
                    borderRadius: DESIGN.borderRadius.sm, 
                    fontWeight: 600, 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>👤</span>
                  <span>{user.name}</span>
                </button>
              </>
            )}
          </div>
        </header>


        {/* MAIN LAYOUT */}
        <div style={{ 
          maxWidth: "1600px", 
          margin: "0 auto", 
          padding: isMobile ? "16px" : "24px", 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : (sidebarOpen ? "280px 1fr 320px" : "1fr 320px"),
          gap: "24px",
          alignItems: "start"
        }}>
          
          {/* LEFT SIDEBAR - Navigation & Features */}
          {(!isMobile || sidebarOpen) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Navigation Features */}
              <div style={{ 
                background: DESIGN.colors.white, 
                borderRadius: DESIGN.borderRadius.lg, 
                padding: "20px", 
                border: "1px solid " + DESIGN.colors.border,
                boxShadow: DESIGN.shadows.sm
              }}>
                <h3 style={{ 
                  fontSize: "14px", 
                  fontWeight: 700, 
                  marginBottom: "16px",
                  color: DESIGN.colors.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Legal Tools
                </h3>
                
                {LEGAL_FEATURES.map((feature) => (
                  <div 
                    key={feature.id}
                    onClick={() => {
                      if (feature.id === "draft") setShowDraftPopup(true);
                      if (feature.id === "compare") setShowComparePopup(true);
                      if (feature.id === "translate") setInput("Please translate this legal text: ");
                      if (feature.id === "research") setInput("I need legal research on ");
                    }}
                    style={{ 
                      padding: "14px", 
                      marginBottom: "8px",
                      background: DESIGN.colors.cardBg,
                      borderRadius: DESIGN.borderRadius.md,
                      cursor: "pointer",
                      border: "1px solid " + DESIGN.colors.border,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.borderColor = feature.color;
                      e.currentTarget.style.boxShadow = DESIGN.shadows.md;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.borderColor = DESIGN.colors.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ 
                      fontSize: "20px",
                      width: "36px",
                      height: "36px",
                      background: feature.color + "15",
                      borderRadius: DESIGN.borderRadius.sm,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {feature.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: DESIGN.colors.text }}>{feature.title}</div>
                      <div style={{ fontSize: "11px", color: DESIGN.colors.textMuted }}>{feature.desc}</div>
                    </div>
                    <div style={{ color: DESIGN.colors.textMuted, fontSize: "12px" }}>→</div>
                  </div>
                ))}
              </div>

              {/* Feature Cards */}
              <div style={{ 
                background: DESIGN.colors.white, 
                borderRadius: DESIGN.borderRadius.lg, 
                padding: "24px", 
                border: "1px solid " + DESIGN.colors.border,
                boxShadow: DESIGN.shadows.sm
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: DESIGN.colors.primary + "15", 
                    borderRadius: DESIGN.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "12px"
                  }}>
                    💡
                  </div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: DESIGN.colors.text }}>
                    Smart Legal Insights
                  </h4>
                  <p style={{ fontSize: "12px", color: DESIGN.colors.textSecondary, lineHeight: "1.5", marginBottom: "12px" }}>
                    Ask any legal question. Get accurate, data-backed answers from Pakistani law.
                  </p>
                  <button style={{
                    width: "100%",
                    padding: "10px",
                    background: DESIGN.colors.primary + "10",
                    border: "1px solid " + DESIGN.colors.primary + "30",
                    borderRadius: DESIGN.borderRadius.sm,
                    color: DESIGN.colors.primary,
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}>
                    Explore Insights →
                  </button>
                </div>

                <div style={{ marginBottom: "20px", paddingTop: "20px", borderTop: "1px solid " + DESIGN.colors.border }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: DESIGN.colors.accentGreen + "15", 
                    borderRadius: DESIGN.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "12px"
                  }}>
                    🛡️
                  </div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: DESIGN.colors.text }}>
                    Trusted Legal Data
                  </h4>
                  <p style={{ fontSize: "12px", color: DESIGN.colors.textSecondary, lineHeight: "1.5", marginBottom: "12px" }}>
                    We connect to verified Pakistani legal sources for reliable information.
                  </p>
                  <button style={{
                    width: "100%",
                    padding: "10px",
                    background: DESIGN.colors.accentGreen + "10",
                    border: "1px solid " + DESIGN.colors.accentGreen + "30",
                    borderRadius: DESIGN.borderRadius.sm,
                    color: DESIGN.colors.accentGreen,
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}>
                    View Sources →
                  </button>
                </div>

                <div style={{ paddingTop: "20px", borderTop: "1px solid " + DESIGN.colors.border }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: DESIGN.colors.accent + "15", 
                    borderRadius: DESIGN.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "12px"
                  }}>
                    ⚡
                  </div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: DESIGN.colors.text }}>
                    Instant Drafting
                  </h4>
                  <p style={{ fontSize: "12px", color: DESIGN.colors.textSecondary, lineHeight: "1.5", marginBottom: "12px" }}>
                    AI analyzes and drafts legal documents in seconds, not hours.
                  </p>
                  <button 
                    onClick={() => setShowDraftPopup(true)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: DESIGN.colors.accent + "10",
                      border: "1px solid " + DESIGN.colors.accent + "30",
                      borderRadius: DESIGN.borderRadius.sm,
                      color: DESIGN.colors.accent,
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Try Drafting →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CENTER PANEL - Main Workspace */}
          <div style={{ minHeight: "600px" }}>
            
            {/* Welcome Screen */}
            {messages.length <= 1 && (
              <div style={{ 
                background: DESIGN.colors.white, 
                borderRadius: DESIGN.borderRadius.lg, 
                padding: isMobile ? "40px 24px" : "60px 40px", 
                textAlign: "center", 
                marginBottom: "24px", 
                border: "1px solid " + DESIGN.colors.border,
                boxShadow: DESIGN.shadows.md
              }}>
                <div style={{ 
                  fontSize: "56px", 
                  marginBottom: "20px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                }}>
                  ⚖️
                </div>
                <h1 style={{ 
                  fontSize: isMobile ? "28px" : "36px", 
                  fontWeight: 800, 
                  marginBottom: "12px",
                  color: DESIGN.colors.text,
                  lineHeight: "1.2"
                }}>
                  Hello! I'm ARK Law AI
                </h1>
                <p style={{ 
                  fontSize: "16px", 
                  color: DESIGN.colors.textSecondary, 
                  marginBottom: "32px",
                  maxWidth: "600px",
                  margin: "0 auto 32px"
                }}>
                  Ask legal questions, draft documents, and analyze case law instantly with Pakistan's most advanced legal AI.
                </p>
                
                {/* Suggested Prompts */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
                  gap: "12px",
                  maxWidth: "800px",
                  margin: "0 auto"
                }}>
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt.text)}
                      style={{ 
                        padding: "16px", 
                        background: DESIGN.colors.cardBg, 
                        border: "1px solid " + DESIGN.colors.border, 
                        borderRadius: DESIGN.borderRadius.md, 
                        fontSize: "13px", 
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = DESIGN.colors.primary;
                        e.currentTarget.style.boxShadow = DESIGN.shadows.md;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = DESIGN.colors.border;
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{prompt.icon}</span>
                      <span style={{ fontWeight: 500, color: DESIGN.colors.text }}>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* Chat Messages */}
            {messages.length > 1 && (
              <div style={{ marginBottom: "24px" }}>
                {messages.slice(1).map((msg, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      background: msg.role === "user" ? DESIGN.colors.primary + "08" : DESIGN.colors.white, 
                      borderRadius: DESIGN.borderRadius.lg, 
                      padding: "20px 24px", 
                      marginBottom: "16px", 
                      border: "1px solid " + DESIGN.colors.border,
                      borderLeft: "4px solid " + (msg.role === "user" ? DESIGN.colors.primary : DESIGN.colors.accent),
                      boxShadow: DESIGN.shadows.sm
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      marginBottom: "12px" 
                    }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: msg.role === "user" ? DESIGN.colors.primary : DESIGN.colors.accent,
                        color: DESIGN.colors.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold"
                      }}>
                        {msg.role === "user" ? "👤" : "⚖️"}
                      </div>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: "13px",
                        color: DESIGN.colors.text 
                      }}>
                        {msg.role === "user" ? (user ? user.name : "You") : "ARK Law AI"}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      lineHeight: "1.7", 
                      whiteSpace: "pre-wrap",
                      color: DESIGN.colors.text,
                      paddingLeft: "42px"
                    }}>
                      {msg.content}
                    </div>
                    
                    {/* Feedback buttons for assistant messages */}
                    {msg.role === "assistant" && i === messages.length - 2 && (
                      <div style={{ 
                        paddingLeft: "42px", 
                        marginTop: "16px", 
                        display: "flex", 
                        gap: "8px",
                        alignItems: "center"
                      }}>
                        <button style={{
                          padding: "6px 12px",
                          background: DESIGN.colors.cardBg,
                          border: "1px solid " + DESIGN.colors.border,
                          borderRadius: DESIGN.borderRadius.sm,
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          👍 Helpful
                        </button>
                        <button style={{
                          padding: "6px 12px",
                          background: DESIGN.colors.cardBg,
                          border: "1px solid " + DESIGN.colors.border,
                          borderRadius: DESIGN.borderRadius.sm,
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          👎 Not helpful
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading State */}
                {loading && (
                  <div style={{ 
                    background: DESIGN.colors.white, 
                    borderRadius: DESIGN.borderRadius.lg, 
                    padding: "20px 24px", 
                    border: "1px solid " + DESIGN.colors.border,
                    borderLeft: "4px solid " + DESIGN.colors.accent,
                    boxShadow: DESIGN.shadows.sm,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      background: DESIGN.colors.accent,
                      color: DESIGN.colors.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "pulse 1.5s ease-in-out infinite"
                    }}>
                      ⚖️
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        ARK Law AI
                      </div>
                      <div style={{ fontSize: "12px", color: DESIGN.colors.textMuted }}>
                        Analyzing legal data...
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            <div style={{ 
              background: DESIGN.colors.white, 
              borderRadius: DESIGN.borderRadius.lg, 
              padding: "20px", 
              border: "1px solid " + DESIGN.colors.border,
              boxShadow: DESIGN.shadows.lg,
              position: "sticky",
              bottom: isMobile ? "16px" : "24px"
            }}>
              
              {/* File Uploads */}
              {uploadedFiles.length > 0 && (
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "12px", 
                  background: DESIGN.colors.cardBg, 
                  borderRadius: DESIGN.borderRadius.md,
                  border: "1px solid " + DESIGN.colors.border
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, marginBottom: "8px", color: DESIGN.colors.textMuted }}>
                    ATTACHED FILES ({uploadedFiles.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {uploadedFiles.map((file, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          padding: "8px 12px", 
                          background: DESIGN.colors.white, 
                          border: "1px solid " + DESIGN.colors.border, 
                          borderRadius: DESIGN.borderRadius.sm, 
                          fontSize: "12px", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "8px"
                        }}
                      >
                        <span>📎</span>
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                        <button 
                          onClick={() => removeFile(i)} 
                          style={{ 
                            background: "none", 
                            border: "none", 
                            cursor: "pointer", 
                            color: DESIGN.colors.textMuted,
                            fontWeight: "bold",
                            padding: "0 4px"
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Usage Indicator */}
              {user && (
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "8px 12px", 
                  background: DESIGN.colors.cardBg,
                  borderRadius: DESIGN.borderRadius.sm,
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <span style={{ color: DESIGN.colors.textMuted }}>Credits remaining:</span>
                  <span style={{ fontWeight: 700, color: userTokens < 10000 ? DESIGN.colors.warning : DESIGN.colors.accentGreen }}>
                    {userTokens.toLocaleString()} / 500,000
                  </span>
                </div>
              )}

              {/* Input Row */}
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask your legal question here..." 
                    style={{ 
                      width: "100%",
                      minHeight: "56px",
                      maxHeight: "200px",
                      padding: "16px", 
                      border: "1px solid " + DESIGN.colors.border, 
                      borderRadius: DESIGN.borderRadius.md, 
                      fontSize: "14px", 
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit"
                    }} 
                  />
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <label style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: DESIGN.colors.cardBg, 
                    border: "1px solid " + DESIGN.colors.border, 
                    borderRadius: DESIGN.borderRadius.md, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = DESIGN.colors.primary + "10";
                    e.currentTarget.style.borderColor = DESIGN.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = DESIGN.colors.cardBg;
                    e.currentTarget.style.borderColor = DESIGN.colors.border;
                  }}
                  >
                    <span style={{ fontSize: "20px" }}>📎</span>
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileUpload}
                      style={{ display: "none" }} 
                    />
                  </label>
                  
                  <button 
                    onClick={startVoiceInput} 
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      background: isListening ? DESIGN.colors.error : DESIGN.colors.cardBg, 
                      color: isListening ? DESIGN.colors.white : DESIGN.colors.text, 
                      border: "1px solid " + (isListening ? DESIGN.colors.error : DESIGN.colors.border), 
                      borderRadius: DESIGN.borderRadius.md, 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "20px",
                      transition: "all 0.2s"
                    }}
                  >
                    {isListening ? "🔴" : "🎤"}
                  </button>
                  
                  <button 
                    onClick={sendMessage} 
                    disabled={loading || (!input.trim() && uploadedFiles.length === 0)}
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      background: loading || (!input.trim() && uploadedFiles.length === 0) 
                        ? DESIGN.colors.border 
                        : "linear-gradient(135deg, " + DESIGN.colors.primary + ", " + DESIGN.colors.accent + ")", 
                      border: "none", 
                      borderRadius: DESIGN.borderRadius.md, 
                      cursor: loading || (!input.trim() && uploadedFiles.length === 0) ? "not-allowed" : "pointer", 
                      color: DESIGN.colors.white,
                      fontSize: "20px",
                      fontWeight: "bold",
                      boxShadow: loading || (!input.trim() && uploadedFiles.length === 0) ? "none" : DESIGN.shadows.md,
                      transition: "all 0.2s"
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
              
              {/* Disclaimer */}
              <div style={{ 
                marginTop: "12px", 
                fontSize: "11px", 
                color: DESIGN.colors.textMuted, 
                textAlign: "center",
                lineHeight: "1.4"
              }}>
                ⚠️ ARK Law AI is an AI-assisted legal tool and does not replace professional legal advice.
              </div>
            </div>
          </div>


          {/* RIGHT SIDEBAR - Upgrade & Quick Actions */}
          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Upgrade to Pro */}
              <div style={{ 
                background: "linear-gradient(135deg, " + DESIGN.colors.accent + " 0%, #E5C887 100%)", 
                borderRadius: DESIGN.borderRadius.lg, 
                padding: "28px 24px",
                boxShadow: DESIGN.shadows.lg,
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "100px",
                  height: "100px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%"
                }} />
                
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>👑</div>
                  <h3 style={{ 
                    fontSize: "20px", 
                    fontWeight: 800, 
                    marginBottom: "8px",
                    color: DESIGN.colors.navy
                  }}>
                    Upgrade to Pro
                  </h3>
                  <p style={{ 
                    fontSize: "13px", 
                    marginBottom: "20px", 
                    opacity: 0.9,
                    color: DESIGN.colors.navy,
                    lineHeight: "1.5"
                  }}>
                    Unlock advanced insights, deeper data sources, and priority access.
                  </p>
                  
                  <div style={{ marginBottom: "20px" }}>
                    {[
                      "✓ Unlimited queries",
                      "✓ Advanced data sources", 
                      "✓ Priority support",
                      "✓ API access",
                      "✓ Team collaboration"
                    ].map((benefit, i) => (
                      <div 
                        key={i}
                        style={{ 
                          fontSize: "13px", 
                          marginBottom: "8px",
                          color: DESIGN.colors.navy,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>✓</span>
                        <span>{benefit.slice(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setShowUpgradePopup(true)}
                    style={{ 
                      width: "100%", 
                      padding: "14px", 
                      background: DESIGN.colors.white, 
                      color: DESIGN.colors.navy, 
                      border: "none", 
                      borderRadius: DESIGN.borderRadius.md, 
                      fontWeight: 700, 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: "8px",
                      fontSize: "14px",
                      boxShadow: DESIGN.shadows.md,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = DESIGN.shadows.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = DESIGN.shadows.md;
                    }}
                  >
                    <span>✨</span> Go Pro
                  </button>
                  
                  <div style={{ 
                    marginTop: "12px", 
                    fontSize: "11px", 
                    textAlign: "center", 
                    opacity: 0.8,
                    color: DESIGN.colors.navy
                  }}>
                    Cancel anytime.
                  </div>
                </div>
              </div>

              {/* Quick Legal Actions */}
              <div style={{ 
                background: DESIGN.colors.white, 
                borderRadius: DESIGN.borderRadius.lg, 
                padding: "24px", 
                border: "1px solid " + DESIGN.colors.border,
                boxShadow: DESIGN.shadows.sm
              }}>
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: 700, 
                  marginBottom: "8px",
                  color: DESIGN.colors.text
                }}>
                  Quick Legal Actions
                </h3>
                <p style={{ 
                  fontSize: "12px", 
                  color: DESIGN.colors.textMuted, 
                  marginBottom: "16px" 
                }}>
                  Try these examples to get started
                </p>
                
                {QUICK_ACTIONS.map((action, i) => (
                  <button 
                    key={i}
                    onClick={action.action}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      background: DESIGN.colors.cardBg, 
                      border: "1px solid " + DESIGN.colors.border, 
                      borderRadius: DESIGN.borderRadius.md, 
                      marginBottom: "10px", 
                      fontSize: "13px", 
                      cursor: "pointer", 
                      textAlign: "left", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = DESIGN.colors.primary + "08";
                      e.currentTarget.style.borderColor = DESIGN.colors.primary;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = DESIGN.colors.cardBg;
                      e.currentTarget.style.borderColor = DESIGN.colors.border;
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{action.icon}</span>
                      <span style={{ fontWeight: 500, color: DESIGN.colors.text }}>{action.text}</span>
                    </span>
                    <span style={{ color: DESIGN.colors.textMuted, fontSize: "16px" }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ 
          background: DESIGN.colors.primary, 
          color: DESIGN.colors.white, 
          padding: isMobile ? "32px 20px" : "48px 40px", 
          marginTop: "80px" 
        }}>
          <div style={{ 
            maxWidth: "1600px", 
            margin: "0 auto", 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", 
            gap: "40px" 
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: DESIGN.colors.accent,
                  borderRadius: DESIGN.borderRadius.md,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px"
                }}>
                  ⚖
                </div>
                <span style={{ fontSize: "20px", fontWeight: 700 }}>ARK Law AI</span>
              </div>
              <p style={{ fontSize: "14px", opacity: 0.8, lineHeight: "1.6" }}>
                AI-powered legal insights. Trusted data. Professional decisions for Pakistani law.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", opacity: 0.6 }}>
                PRODUCT
              </h4>
              <div style={{ fontSize: "13px", opacity: 0.8, lineHeight: "2" }}>
                <div style={{ cursor: "pointer" }}>Features</div>
                <div style={{ cursor: "pointer" }}>Sources</div>
                <div style={{ cursor: "pointer" }}>Enterprise</div>
                <div style={{ cursor: "pointer" }}>Pricing</div>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", opacity: 0.6 }}>
                COMPANY
              </h4>
              <div style={{ fontSize: "13px", opacity: 0.8, lineHeight: "2" }}>
                <div style={{ cursor: "pointer" }}>About Us</div>
                <div style={{ cursor: "pointer" }}>Careers</div>
                <div style={{ cursor: "pointer" }}>Blog</div>
                <div style={{ cursor: "pointer" }}>Contact</div>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", opacity: 0.6 }}>
                RESOURCES
              </h4>
              <div style={{ fontSize: "13px", opacity: 0.8, lineHeight: "2" }}>
                <div style={{ cursor: "pointer" }}>Docs</div>
                <div style={{ cursor: "pointer" }}>Guides</div>
                <div style={{ cursor: "pointer" }}>API</div>
                <div style={{ cursor: "pointer" }}>Support</div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            textAlign: "center", 
            marginTop: "40px", 
            paddingTop: "20px", 
            borderTop: "1px solid rgba(255,255,255,0.1)", 
            fontSize: "13px", 
            opacity: 0.7 
          }}>
            © 2025 ARK Law AI. All rights reserved. | Built for Pakistani Legal Professionals
          </div>
        </footer>

      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

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
