import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ARK Law AI v3.0 - Complete DataNexus Design
const COLORS = {
  primary: "#5A7A3D",
  lime: "#C4D600",
  bg: "#F5F5F0",
  white: "#FFFFFF",
  cardBg: "#FAFAF8",
  text: "#2C3E1F",
  textGray: "#6B7C5E",
  border: "#E8E8E0",
  gold: "#C9A84C",
  navy: "#0D1B2A"
};

export default function App() {
  // All state
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
  const messagesEndRef = useRef(null);

  const QUICK_QUERIES = [
    "Market trends in AI",
    "Customer churn analysis",
    "Cloud cost optimization",
    "Top performing products",
    "Industry benchmarks",
    "Data privacy regulations"
  ];

  // Send message function
  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) {
      setUserTokens(prev => Math.max(0, prev - tokensToDeduct));
    }

    let messageContent = input.trim();
    
    if (uploadedFiles.length > 0) {
      messageContent += "\n\nAttached files: " + uploadedFiles.map(f => f.name).join(", ");
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
        content: "I apologize, but I encountered an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(!isListening);
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
      content: "Welcome to ARK Law AI - Your trusted Pakistani legal companion.",
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Head>
        <title>ARK Law AI - Pakistani Legal Assistant</title>
      </Head>

      <div style={{ minHeight: "100vh", background: COLORS.bg }}>
        
        {/* HEADER */}
        <header style={{ background: COLORS.white, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + COLORS.border }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "32px", height: "32px" }} />
            <span style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text }}>ARK Law AI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!user ? (
              <>
                <button onClick={() => setShowLoginPopup(true)} style={{ padding: "10px 24px", background: "transparent", border: "none", color: COLORS.textGray, fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>Log in</button>
                <button onClick={() => setShowSignupPopup(true)} style={{ padding: "10px 24px", background: COLORS.lime, color: COLORS.text, border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}><span>👤</span> Sign up</button>
              </>
            ) : (
              <>
                <div style={{ padding: "8px 16px", background: COLORS.cardBg, borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>{userTokens.toLocaleString()} Credits</div>
                <button onClick={() => setShowMyAccountPopup(true)} style={{ padding: "8px 16px", background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>{user.name}</button>
              </>
            )}
          </div>
        </header>

        {/* BANNER */}
        <div style={{ background: COLORS.cardBg, padding: "12px 40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", borderBottom: "1px solid " + COLORS.border }}>
          <span style={{ background: COLORS.lime, color: COLORS.text, padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>New</span>
          <span style={{ fontSize: "14px", color: COLORS.text }}>ARK Law AI just got smarter! Explore improved answers, new data sources, and Pro features.</span>
          <button onClick={() => setShowUpgradePopup(true)} style={{ background: "transparent", border: "none", color: COLORS.primary, fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>See what's new →</button>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr 320px", gap: "24px" }}>
          
          {/* LEFT SIDEBAR */}
          {!isMobile && (
            <div>
              <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", marginBottom: "24px", border: "1px solid " + COLORS.border }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Meet the Founder</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src="/khawer-profile.jpeg" alt="Founder" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>Khawer Rizvi</div>
                    <div style={{ fontSize: "11px", color: COLORS.textGray }}>Co-Founder & CEO</div>
                  </div>
                </div>
              </div>

              <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: "1px solid " + COLORS.border }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Explore Features</h3>
                
                <div onClick={() => setShowDraftPopup(true)} style={{ background: COLORS.cardBg, padding: "20px", borderRadius: "12px", marginBottom: "16px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: COLORS.primary + "20", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📊</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>Smart Insights</div>
                      <div style={{ fontSize: "12px", color: COLORS.textGray }}>Ask anything. Get accurate answers.</div>
                    </div>
                  </div>
                  <button style={{ width: "100%", padding: "8px", background: COLORS.lime, border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>Explore Insights →</button>
                </div>

                <div style={{ background: COLORS.cardBg, padding: "20px", borderRadius: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: COLORS.primary + "20", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🛡️</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>Trusted Data</div>
                      <div style={{ fontSize: "12px", color: COLORS.textGray }}>Verified Pakistani legal sources.</div>
                    </div>
                  </div>
                  <button style={{ width: "100%", padding: "8px", background: COLORS.lime, border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>Explore Sources →</button>
                </div>

                <div onClick={() => setShowComparePopup(true)} style={{ background: COLORS.cardBg, padding: "20px", borderRadius: "12px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: COLORS.primary + "20", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>Instant Results</div>
                      <div style={{ fontSize: "12px", color: COLORS.textGray }}>AI analyzes in seconds.</div>
                    </div>
                  </div>
                  <button style={{ width: "100%", padding: "8px", background: COLORS.lime, border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>Try it Now →</button>
                </div>
              </div>
            </div>
          )}

          {/* CENTER */}
          <div>
            {messages.length <= 1 && (
              <div style={{ background: COLORS.white, borderRadius: "16px", padding: "60px 40px", textAlign: "center", marginBottom: "24px", border: "1px solid " + COLORS.border }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✨</div>
                <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>Hello! I'm ARK Law AI</h1>
                <p style={{ fontSize: "16px", color: COLORS.textGray, marginBottom: "32px" }}>Ask questions, get insights, and explore Pakistani law like never before.</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <div style={{ padding: "12px 20px", background: COLORS.cardBg, border: "1px solid " + COLORS.border, borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><span>📊</span> What are tenant rights?</div>
                  <div style={{ padding: "12px 20px", background: COLORS.cardBg, border: "1px solid " + COLORS.border, borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><span>📈</span> How to register a company?</div>
                  <div style={{ padding: "12px 20px", background: COLORS.cardBg, border: "1px solid " + COLORS.border, borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><span>☁️</span> Property inheritance laws</div>
                </div>
              </div>
            )}

            {messages.length > 1 && (
              <div style={{ marginBottom: "24px" }}>
                {messages.slice(1).map((msg, i) => (
                  <div key={i} style={{ background: msg.role === "user" ? COLORS.primary + "10" : COLORS.white, borderRadius: "16px", padding: "24px", marginBottom: "16px", border: "1px solid " + COLORS.border, borderLeft: "4px solid " + (msg.role === "user" ? COLORS.primary : COLORS.gold) }}>
                    <div style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "20px", border: "1px solid " + COLORS.border }}>
              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: "12px", padding: "12px", background: COLORS.cardBg, borderRadius: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {uploadedFiles.map((file, i) => (
                    <div key={i} style={{ padding: "6px 12px", background: COLORS.white, border: "1px solid " + COLORS.border, borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{file.name}</span>
                      <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textGray }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask anything about your data..." style={{ flex: 1, padding: "14px 16px", border: "1px solid " + COLORS.border, borderRadius: "10px", fontSize: "14px", outline: "none" }} />
                <label style={{ width: "44px", height: "44px", background: COLORS.cardBg, border: "1px solid " + COLORS.border, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <span>🎤</span>
                  <input type="file" multiple onChange={(e) => { const files = Array.from(e.target.files); if (files.length > 0) setUploadedFiles(prev => [...prev, ...files]); }} style={{ display: "none" }} />
                </label>
                <button onClick={startVoiceInput} style={{ width: "44px", height: "44px", background: isListening ? COLORS.primary : COLORS.cardBg, color: isListening ? COLORS.white : COLORS.text, border: "1px solid " + COLORS.border, borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🔊</button>
                <button onClick={() => sendMessage()} disabled={loading} style={{ width: "44px", height: "44px", background: COLORS.lime, border: "none", borderRadius: "10px", cursor: "pointer", opacity: loading ? 0.6 : 1, fontSize: "18px", fontWeight: "bold" }}>→</button>
              </div>
              <div style={{ marginTop: "12px", fontSize: "11px", color: COLORS.textGray, textAlign: "center" }}>ARK Law AI can make mistakes. Please verify important information.</div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          {!isMobile && (
            <div>
              <div style={{ background: "linear-gradient(135deg, " + COLORS.gold + ", #E5C887)", borderRadius: "16px", padding: "24px", marginBottom: "24px", color: COLORS.navy }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>👑</div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Upgrade to Pro</h3>
                <p style={{ fontSize: "13px", marginBottom: "16px", opacity: 0.9 }}>Unlock advanced insights, deeper data sources, and priority access.</p>
                <div style={{ marginBottom: "16px", fontSize: "13px" }}>
                  <div style={{ marginBottom: "6px" }}>✓ Unlimited queries</div>
                  <div style={{ marginBottom: "6px" }}>✓ Advanced data sources</div>
                  <div style={{ marginBottom: "6px" }}>✓ Priority support</div>
                </div>
                <button onClick={() => setShowUpgradePopup(true)} style={{ width: "100%", padding: "12px", background: COLORS.white, color: COLORS.navy, border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><span>✨</span> Go Pro</button>
                <div style={{ marginTop: "12px", fontSize: "11px", textAlign: "center", opacity: 0.8 }}>Cancel anytime.</div>
              </div>

              <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: "1px solid " + COLORS.border }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Quick Domain Queries</h3>
                <p style={{ fontSize: "12px", color: COLORS.textGray, marginBottom: "16px" }}>Try these examples to get started</p>
                {QUICK_QUERIES.map((q, i) => (
                  <button key={i} onClick={() => setInput(q)} style={{ width: "100%", padding: "12px 16px", background: COLORS.cardBg, border: "1px solid " + COLORS.border, borderRadius: "8px", marginBottom: "8px", fontSize: "13px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>🔍</span> {q}</span>
                    <span style={{ color: COLORS.textGray }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ background: "#3B4F2E", color: COLORS.white, padding: "40px", marginTop: "60px" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: "40px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "32px", height: "32px" }} />
                <span style={{ fontSize: "20px", fontWeight: 700 }}>ARK Law AI</span>
              </div>
              <p style={{ fontSize: "14px", opacity: 0.8 }}>AI-powered insights. Trusted data. Smarter decisions.</p>
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Product</h4>
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Features<br/>Sources<br/>Enterprise</div>
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Company</h4>
              <div style={{ fontSize: "13px", opacity: 0.8 }}>About Us<br/>Careers<br/>Blog</div>
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Resources</h4>
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Docs<br/>Guides<br/>API</div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "13px", opacity: 0.7 }}>© 2025 ARK Law AI. All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}
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
