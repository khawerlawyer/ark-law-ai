import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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

const QURAN_VERSE =
  `إِنِ الْحُكْمُ إِلَّا لِلَّهِ  —  "The Order / Decision / Judgment rests with ALLAH ALMIGHTY alone"  —  Surah Yusuf (12:40 & 12:67)  |  Surah Al-An'am (6:57)`;

export default function App() {
  const [user,               setUser]               = useState(null);
  const [userTokens,         setUserTokens]         = useState(500000);
  const [showSignupPopup,    setShowSignupPopup]    = useState(false);
  const [showLoginPopup,     setShowLoginPopup]     = useState(false);
  // ── FORGOT PASSWORD states ──


  const [showMyAccountPopup, setShowMyAccountPopup] = useState(false);
  const [showSuccessPopup,   setShowSuccessPopup]   = useState(false);
  const [showNewsPopup,      setShowNewsPopup]      = useState(false);
  const [showDraftPopup,     setShowDraftPopup]     = useState(false);
  const [showComparePopup,   setShowComparePopup]   = useState(false);
  const [showLinkedInPopup,  setShowLinkedInPopup]  = useState(false);
  const [showComingSoon,     setShowComingSoon]     = useState(false);
  const [showFeaturesPopup,  setShowFeaturesPopup]  = useState(false);
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

  const currentDate = useRef(
    new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  );

  const messagesEndRef    = useRef(null);
  const lastSavedCountRef = useRef(0);

  const PRACTICE_AREAS_PK = [
    { id: "general",      label: "General Legal",       icon: "⚖️"  },
    { id: "criminal",     label: "Criminal Law",         icon: "🔒"  },
    { id: "corporate",    label: "Corporate & Business", icon: "🏢"  },
    { id: "family",       label: "Family Law",           icon: "👨‍👩‍👧" },
    { id: "property",     label: "Property & Land",      icon: "🏠"  },
    { id: "labour",       label: "Labour Laws",          icon: "👷"  },
    { id: "taxation",     label: "Taxation",             icon: "💰"  },
    { id: "constitution", label: "Constitutional Law",   icon: "📜"  },
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

  const UR = {
    appTagline:      "پاکستان کا قانونی ذہانت انجن",
    appSubtitle:     "قانونی پیشہ ور افراد کے لیے · پاکستان کے لیے",
    byLine:          "از وکیل و اے آئی انوویٹر خاور ربانی",
    sessions:        "آپ اور ARK LAW سیشنز",
    newBtn:          "+ نیا",
    analyzeTitle:    "دستاویز تجزیہ",
    analyzeSubtitle: "تجزیہ کے لیے اپلوڈ کریں ↑",
    compareTitle:    "دستاویز موازنہ",
    compareSubtitle: "2 دستاویزیں موازنہ کے لیے",
    draftTitle:      "دستاویز ڈرافٹ",
    draftSubtitle:   "معاہدے، حلف نامے وغیرہ",
    quickLabel:      "فوری سوالات",
    quickSub:        "کوئی بھی سوال کلک کریں",
    areasLabel:      "قانونی شعبہ جات",
    placeholder:     "ARK Law AI سے پوچھیں یا مائیک کلک کریں...",
    send:            "بھیجیں",
    login:           "لاگ ان",
    signup:          "✨ مفت سائن اپ",
    greeting:        "ARK Law AI میں خوش آمدید — پاکستانی قانون کا آپ کا قابل اعتماد ساتھی۔\n\nآج میں آپ کی کیسے مدد کر سکتا ہوں؟",
    newChat:         "نیا سیشن",
    listening:       "سن رہا ہوں...",
    thinking:        "ARK سوچ رہا ہے...",
    listen:          "🔊 سنیں",
    stop:            "⏸️ رکیں",
    myAccount:       "میرا اکاؤنٹ",
    quickQueries: [
      "پاکستان میں کرایہ دار کے طور پر میرے کیا حقوق ہیں؟",
      "پاکستان میں FIR کیسے درج کروائیں؟",
      "پاکستان میں طلاق کا طریقہ کار کیا ہے؟",
      "پاکستان میں وراثت کے قوانین کی وضاحت کریں",
      "پاکستان میں ملازمت کے حقوق کیا ہیں؟",
      "پاکستان میں وصیت کا مسودہ کیسے تیار کریں؟",
      "توکیل نامہ کیا ہوتا ہے؟",
      "پاکستان میں معاہدے کا قانون بیان کریں",
    ],
    practiceAreas: [
      "عمومی قانون",
      "فوجداری قانون",
      "کارپوریٹ و تجارتی",
      "خاندانی قانون",
      "جائیداد و زمین",
      "محنت کے قوانین",
      "ٹیکس",
      "آئینی قانون",
    ],
  };

  const newsDatabase = [
    { headline: "🇵🇰 Supreme Court of Pakistan Ruling on Constitutional Rights", source: "Supreme Court of Pakistan Official Records", fullText: "The Supreme Court of Pakistan has issued a landmark ruling reaffirming citizens' fundamental rights under Articles 9 and 14 of the Constitution. The judgment emphasizes that all individuals have the right to life, liberty, and dignity. This ruling applies to all provincial and federal courts and establishes important precedent for cases involving human rights violations. The court also directed the government to ensure compliance across all institutions." },
    { headline: "🇵🇰 New Tax Amendment Affects Business Sector", source: "Federal Board of Revenue (FBR)", fullText: "The Federal Board of Revenue has announced new amendments to the Income Tax Ordinance, 2001, effective immediately. Key changes include: (1) Modified tax rates for small and medium enterprises, (2) Enhanced deductions for research and development, (3) Stricter compliance requirements for corporate entities. Businesses are advised to consult with tax professionals to ensure compliance. The FBR has set a grace period of 30 days for voluntary compliance." },
    { headline: "🇵🇰 Family Court Interprets Guardianship Laws", source: "District Court - Family Division", fullText: "In a significant judgment, the Family Court has clarified provisions of the Guardians and Wards Act, 1890. The court ruled that guardianship decisions must prioritize the best interests of the child above all considerations. The judgment emphasizes that courts must conduct thorough investigations, hear all parties, and consider the child's wishes in guardianship matters. This ruling affects all guardianship petitions pending in courts across Pakistan." },
    { headline: "🇵🇰 Labour Ministry Issues New Worker Protection Guidelines", source: "Ministry of Labour, Employment & Manpower", fullText: "The Labour Ministry has issued comprehensive guidelines under the Workers' Compensation Act for improved worker protection. New provisions include: (1) Enhanced compensation for workplace injuries, (2) Mandatory insurance coverage for all workers, (3) Faster claim processing mechanisms. Employers must comply within 60 days. Non-compliance may result in penalties and legal action. Workers can file complaints through the ministry's online portal." },
    { headline: "🇵🇰 High Court Decision on Property Disputes", source: "Lahore High Court - Civil Division", fullText: "The Lahore High Court has established important guidelines for resolving property disputes under the Transfer of Property Act, 1882. The judgment clarifies that possession must be clearly established through documentary evidence, witness testimony, or adverse possession principles. Courts are directed to expedite property cases to reduce pending litigation. The ruling also addresses issues of land grabbing and unlawful occupation." },
    { headline: "🇵🇰 Procedural Changes in Criminal Courts", source: "Supreme Judicial Council", fullText: "New procedural rules have been implemented in criminal courts across Pakistan to expedite trials under the Code of Criminal Procedure, 1898. Changes include: (1) Mandatory video conferencing for witness examination, (2) Electronic filing of documents, (3) Stricter time limits for adjournments. These reforms aim to reduce case backlogs and ensure speedy justice. All courts must implement these procedures immediately." },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    // PWA install prompt — fires when browser decides the site is installable
    const handleInstallPrompt = (e) => {
      e.preventDefault(); // stop browser showing its own mini bar
      setInstallPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Hide button once app is installed
    window.addEventListener("appinstalled", () => {
      setShowInstallBtn(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "Welcome to ARK Law AI - Your trusted legal companion for Pakistani law.\n\nHow may I assist you today?",
    };
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeChatId === null) return;
    setAllSessions(prev =>
      prev.map(s => {
        if (s.id !== activeChatId) return s;
        const firstUser = messages.find(m => m.role === "user");
        const title = firstUser
          ? firstUser.content.substring(0, 40) + (firstUser.content.length > 40 ? "…" : "")
          : "New Chat";
        return { ...s, messages, title };
      })
    );
  }, [messages, activeChatId]);







  useEffect(() => { fetchNewsHeadlines(); }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchNewsHeadlines = async () => {
    setNewsItems(newsDatabase.map(item => item.headline));
  };

  const startNewChat = () => {
    const greeting = {
      role: "assistant",
      content: "Welcome to ARK Law AI - Your trusted legal companion for Pakistani law.\n\nHow may I assist you today?",
    };
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

  // ── PWA Install handler ──
  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBtn(false);
      setInstallPrompt(null);
    }
  };

  const sendMessage = async (msg = null, skipNameCheck = false) => {
    const userMessage = msg || input;
    if (!userMessage.trim() && uploadedFiles.length === 0) return;
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) setUserTokens(prev => {
      const next = Math.max(0, prev - tokensToDeduct);
      // Persist updated token balance — saved against user ID so it survives logout/login
      const saved = localStorage.getItem("arklaw_user");
      if (saved) {
        try {
          const u = JSON.parse(saved);
          u.tokens = next;
          localStorage.setItem("arklaw_user", JSON.stringify(u));
          // Also save under user-specific key so balance is restored on next login
          if (u.id) localStorage.setItem("arklaw_user_tokens_" + u.id, String(next));
        } catch {}
      }
      return next;
    });
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
        if (file.type === "text")     messageContent += `\n--- ${file.name} ---\n${file.data}\n`;
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
      const systemNote = `[System: Today is ${currentDate.current}. You are ARK Law AI, expert Pakistani law assistant. Always title disclaimer sections "Professional Disclaimer by ARK LAW AI".]`;
      const conversationPairs = [];
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        if (!m.content || (typeof m.content === "string" && !m.content.trim())) continue;
        if (m.role === "user") conversationPairs.push(m);
        if (m.role === "assistant" && conversationPairs.length > 0 &&
            conversationPairs[conversationPairs.length - 1].role === "user") {
          conversationPairs.push(m);
        }
      }
      const newUserMsg = { role: "user", content: systemNote + "\n\n" + messageContent };
      const messagesWithContext = [...conversationPairs, newUserMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesWithContext }),
      });
      if (!res.ok) {
        let errText = `HTTP ${res.status}`;
        try { const j = await res.json(); errText = j.error || j.message || errText; } catch {}
        throw new Error(errText);
      }
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
    const cleanText = text
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/\*+/g, "")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/~~([^~]+)~~/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/[-]{3,}/g, ". ")
      .replace(/[•·]/g, " ")
      .replace(/\n+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.88; utterance.pitch = 0.92; utterance.volume = 1.0; utterance.lang = "en-US";
    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const maleVoice =
        voices.find(v => v.name === "Microsoft Guy Online (Natural) - en-US") ||
        voices.find(v => v.name === "Microsoft Davis Online (Natural) - en-US") ||
        voices.find(v => v.name === "Microsoft Ryan Online (Natural) - en-US") ||
        voices.find(v => v.name === "Microsoft Eric - en-US") ||
        voices.find(v => v.name === "Microsoft Mark - en-US") ||
        voices.find(v => v.name.includes("Guy") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("Davis") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("Reed") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("Eric") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("David") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("Mark") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("Alex") && v.lang === "en-US") ||
        voices.find(v => v.lang === "en-US" && !["Samantha","Zira","Susan","Linda","Jenny","Aria","Ana","Emma","Isabella","Ava","Michelle","Monica","Siri"].some(n => v.name.includes(n))) ||
        voices.find(v => v.lang === "en-US") ||
        voices.find(v => v.lang.startsWith("en"));
      if (maleVoice) utterance.voice = maleVoice;
    };
    selectVoice();
    if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.onvoiceschanged = selectVoice;
    utterance.onstart = () => { setIsSpeaking(true);  setCurrentSpeakingIndex(messageIndex); };
    utterance.onend   = () => { setIsSpeaking(false); setCurrentSpeakingIndex(null); };
    utterance.onerror = () => { setIsSpeaking(false); setCurrentSpeakingIndex(null); };
    window.speechSynthesis.speak(utterance);
  };

  const handleNewsClick = async (headline) => {
    const newsItem = newsDatabase.find(item => item.headline === headline);
    if (newsItem) {
      setSelectedNews(newsItem); setShowNewsPopup(true); setNewsLoading(true); setNewsAnalysis("");
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Analyze this legal news from Pakistan:\n\nHeadline: ${newsItem.headline}\n\nFull Text: ${newsItem.fullText}\n\nProvide a concise analysis of how this affects Pakistani citizens and businesses, relevant statutes, and practical implications.` }] }) });
        const data = await res.json();
        setNewsAnalysis(data.reply);
      } catch (error) { setNewsAnalysis("Unable to analyze this news item. Please try again."); }
      finally { setNewsLoading(false); }
    }
  };

  const generateDocument = async (requirements) => {
    setDraftGenerating(true); setDraftStep("generating");
    try {
      const prompt = `You are an expert Pakistani legal document drafter. Generate a complete, professionally formatted legal document based on these requirements:\n\nDocument Type: ${draftType}\nRequirements: ${JSON.stringify(requirements, null, 2)}\n\nCRITICAL INSTRUCTIONS:\n1. Follow Pakistani legal document format and conventions\n2. Include all necessary legal clauses as per Pakistani law\n3. Use proper Pakistani legal terminology\n4. Include all standard sections for this document type\n5. Add witness and notary sections where applicable\n6. Format with proper headings, numbering, and structure\n7. Make it court-ready and professionally formatted\n8. Include all parties' complete details\n9. Add governing law as Pakistani law\n10. Include jurisdiction clauses (Pakistani courts)\n\nGenerate the COMPLETE document text ready for immediate use.`;
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
    let content = `ARK LAW AI - LEGAL DOCUMENT DRAFT\n${"=".repeat(50)}\n\nDocument Type: ${draftType.toUpperCase()}\nTitle: ${draftTitle}\nCreated: ${timestamp}\nJurisdiction: Pakistan\n\n${"=".repeat(50)}\n\n${draftContent}\n\n${"=".repeat(50)}\nThis document was generated by ARK Law AI and should be reviewed by a qualified Pakistani lawyer before execution.`;
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
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: getMediaType(doc1.name), data: doc1Base64 } }, { type: "document", source: { type: "base64", media_type: getMediaType(doc2.name), data: doc2Base64 } }, { type: "text", text: `Compare these two documents with focal point: "${compareFocus}". Provide a comprehensive comparison report covering key differences, similarities, legal implications under Pakistani law, risk assessment, and recommendations.` }] }] }) });
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

  // ── Shared popup input/label styles ──
  const popupInp = { width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}50`, borderRadius: "7px", color: NAVY, fontSize: 13, boxSizing: "border-box", outline: "none" };
  const popupLbl = { color: "#5A7A56", fontSize: 11, display: "block", marginBottom: "5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" };
  const popupRow = { marginBottom: "11px" };

  // ── Watermark style reused in popups ──
  const popupWatermark = {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    opacity: 0.04, pointerEvents: "none", zIndex: 0,
    width: "220px", height: "220px",
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <Head>
        <title>ARK Law AI — Pakistan Legal Intelligence Engine by Khawer Rabbani</title>
        <meta name="description" content="ARK Law AI: Expert AI legal assistant for Pakistani law." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.svg" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B2E1A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ARK Law AI" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('SW registered:', reg.scope); })
                .catch(function(err) { console.log('SW failed:', err); });
            });
          }
        `}} />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; }
        #__next { height: 100%; overflow: hidden; }
        @keyframes glow      { 0%,100%{ box-shadow:0 0 15px rgba(201,168,76,.5); } 50%{ box-shadow:0 0 25px rgba(201,168,76,.8); } }
        @keyframes glowPulse { 0%,100%{ box-shadow:0 0 12px rgba(201,168,76,.7); transform:scale(1);    } 50%{ box-shadow:0 0 20px rgba(255,215,0,.9); transform:scale(1.02); } }
        @keyframes pulse     { 0%,100%{ transform:scale(1);   opacity:1;   } 50%{ transform:scale(1.1); opacity:.8; } }
        @keyframes typeCursor{ 0%,100%{ opacity:1; } 50%{ opacity:0; } }
        @media (max-width:768px){ .desktop-only{ display:none; } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: "Segoe UI, Tahoma, sans-serif", overflow: "hidden" }}>

        {/* ══ HEADER ══ */}
        <header style={{ background: "#1B2E1A", padding: isMobile ? "6px 10px" : "8px 20px", borderBottom: "1px solid #2E4A2C", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: isMobile ? "8px" : "12px" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <img src="/ark-logo.png" alt="ARK" style={{ width: isMobile ? "32px" : "48px", height: isMobile ? "32px" : "48px" }} />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: isMobile ? 14 : 18, fontWeight: 700, color: "#E8D97A" }}>ARK Law AI</div>
              {!isMobile && <div style={{ fontSize: 10, color: "#9DB89A", direction: isUrdu ? "rtl" : "ltr" }}>{isUrdu ? UR.appTagline : "The Legal Intelligence Engine"}</div>}
              {!isMobile && <div style={{ fontSize: 9, color: GOLD, fontStyle: "italic", marginTop: "2px" }}>میرا فاضل دوست</div>}
            </div>
          </div>

          {/* Quranic verse — hidden on mobile */}
          {!isMobile && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", borderRadius: "10px", border: `1px solid ${GOLD}50`, background: CREAM, boxShadow: `0 1px 6px ${GOLD}20`, position: "relative", minHeight: "44px" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "32px", background: `linear-gradient(to right, ${CREAM}, transparent)`, borderRadius: "10px 0 0 10px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
              <span style={{ fontSize: 14, color: GOLD }}>☪</span>
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "32px", background: `linear-gradient(to left, ${CREAM}, transparent)`, borderRadius: "0 10px 10px 0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
              <span style={{ fontSize: 14, color: GOLD }}>☪</span>
            </div>
            <div style={{ width: "100%", padding: "4px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontStyle: "italic", color: LIGHT_GREEN, fontFamily: "Georgia, serif", lineHeight: 1.5, letterSpacing: "0.02em", fontWeight: 600, textAlign: "center", display: "block" }}>{QURAN_VERSE}</span>
            </div>
          </div>
          )}

          {/* Lang + Auth */}
          <div style={{ display: "flex", gap: isMobile ? "4px" : "6px", alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => setIsUrdu(false)} style={{ padding: isMobile ? "4px 7px" : "5px 10px", background: !isUrdu ? "#2A432A" : "transparent", color: !isUrdu ? "#E8D97A" : "#9DB89A", border: "1px solid #3A5A38", borderRadius: "4px", cursor: "pointer", fontSize: isMobile ? 9 : 10, fontWeight: !isUrdu ? 700 : 400 }}>EN</button>
            <button onClick={() => setIsUrdu(true)} style={{ padding: isMobile ? "4px 7px" : "5px 10px", background: isUrdu ? "#2A432A" : "transparent", color: isUrdu ? "#E8D97A" : "#9DB89A", border: "1px solid #3A5A38", borderRadius: "4px", cursor: "pointer", fontSize: isMobile ? 9 : 10, fontWeight: isUrdu ? 700 : 400, fontFamily: "serif" }}>اردو</button>
            <div style={{ width: "1px", height: "20px", background: "#3A5A38", margin: "0 1px" }} />

            {/* PWA Install button — only shown when browser supports it */}
            {showInstallBtn && (
              <button onClick={handleInstallApp}
                title="Install ARK Law AI as an app on your device"
                style={{ padding: isMobile ? "5px 8px" : "5px 10px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: isMobile ? 9 : 10, fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px", animation: "pulse 2s infinite" }}>
                📲 {isMobile ? "Install" : "Install App"}
              </button>
            )}
            {!user ? (
              <>
                <button onClick={() => setShowLoginPopup(true)} style={{ padding: isMobile ? "5px 10px" : "6px 12px", background: LIGHT_GREEN, color: "white", border: `1px solid ${LG_HOVER}`, borderRadius: "4px", cursor: "pointer", fontSize: isMobile ? 10 : 11, fontWeight: 600, whiteSpace: "nowrap" }} onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER} onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}>{isUrdu ? UR.login : "Login"}</button>
                <button onClick={() => setShowSignupPopup(true)} style={{ padding: isMobile ? "5px 10px" : "6px 12px", background: LIGHT_GREEN, color: "white", border: `1px solid ${LG_HOVER}`, borderRadius: "4px", cursor: "pointer", fontSize: isMobile ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }} onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER} onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}>{isMobile ? "Sign Up" : "✨ Sign Up"}</button>
              </>
            ) : (
              <>
                {!isMobile && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 6px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "6px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: `conic-gradient(${GOLD} ${(userTokens/500000)*100}%, ${NAVY_BORDER} 0%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: NAVY_SURFACE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6px", fontWeight: 700, color: GOLD }}>{Math.round((userTokens/500000)*100)}%</div>
                    </div>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: GOLD, whiteSpace: "nowrap" }}>{userTokens.toLocaleString()}</div>
                  </div>
                )}
                <div style={{ padding: isMobile ? "3px 7px" : "4px 8px", background: `linear-gradient(135deg, ${ACCENT_PK}, #2D9B6E)`, color: "white", borderRadius: "4px", fontSize: isMobile ? 10 : 9, fontWeight: 700, whiteSpace: "nowrap" }}>👤 {user.name.split(" ")[0]}</div>
                <button onClick={() => setShowMyAccountPopup(true)} style={{ padding: isMobile ? "4px 9px" : "4px 8px", background: GOLD, color: NAVY, border: `1px solid ${GOLD}`, borderRadius: "4px", cursor: "pointer", fontSize: isMobile ? 10 : 9, fontWeight: 600, whiteSpace: "nowrap" }}>{isMobile ? "Account" : "Account"}</button>
              </>
            )}
          </div>
        </header>

        {/* ══ BODY ══ */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* LEFT SIDEBAR — always rendered, hidden on mobile unless tab=left */}
          <div style={{ width: "200px", background: CREAM, borderRight: `1px solid ${GOLD}40`, padding: "8px", display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>
              {/* Justice Rabbani dedication box */}
              <div style={{ marginBottom: "8px", flexShrink: 0, background: "white", border: `1px solid ${GOLD}40`, borderRadius: "8px", padding: "10px 8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
                <img
                  src="/rabbani.jpeg"
                  alt="Justice S. A. Rabbani"
                  style={{ width: "62px", height: "62px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${GOLD}`, boxShadow: `0 0 8px ${GOLD}50`, marginBottom: "8px", display: "block", margin: "0 auto 8px" }}
                />
                <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}60, transparent)`, marginBottom: "7px" }} />
                <p style={{ fontSize: 8.5, color: "#3A5A36", lineHeight: 1.55, fontStyle: "italic", fontFamily: "Georgia, serif", margin: 0 }}>
                  "This initiative is dedicated to the illustrious legacy of<br/>
                  <strong>Honorable Justice S. A. Rabbani</strong><br/>
                  <span style={{ fontStyle: "normal", fontSize: 8 }}>Former Judge, Superior Courts of Pakistan</span>"
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "white", borderRadius: "8px", border: "1px solid #E8E8E4", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F9F5"; e.currentTarget.style.borderColor = ACCENT_PK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.borderColor = "#E8E8E4"; }}>
                  <div style={{ width: "28px", height: "28px", flexShrink: 0, background: "#EDF7F0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📂</div>
                  <div style={{ flex: 1, minWidth: 0, direction: isUrdu ? "rtl" : "ltr" }}>
                    <div style={{ fontSize: 11, color: "#1A1A1A", fontWeight: 600, lineHeight: 1.3 }}>{isUrdu ? UR.analyzeTitle : "Analyze Documents"}</div>
                    <label style={{ fontSize: 9, color: ACCENT_PK, cursor: "pointer", fontWeight: 500 }}>
                      {isUrdu ? UR.analyzeSubtitle : "Upload to analyze ↑"}
                      <input type="file" accept=".pdf,.docx,.doc" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) alert(isUrdu ? "یہ فیچر جلد آ رہا ہے" : "Feature coming soon: Document analysis"); }} />
                    </label>
                  </div>
                  <span style={{ color: "#BBBBBB", fontSize: 12 }}>›</span>
                </div>

                <div onClick={() => setShowComparePopup(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "white", borderRadius: "8px", border: "1px solid #E8E8E4", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F9F5"; e.currentTarget.style.borderColor = ACCENT_PK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.borderColor = "#E8E8E4"; }}>
                  <div style={{ width: "28px", height: "28px", flexShrink: 0, background: "#EDF7F0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚖️</div>
                  <div style={{ flex: 1, minWidth: 0, direction: isUrdu ? "rtl" : "ltr" }}>
                    <div style={{ fontSize: 11, color: "#1A1A1A", fontWeight: 600, lineHeight: 1.3 }}>{isUrdu ? UR.compareTitle : "Compare Documents"}</div>
                    <div style={{ fontSize: 9, color: "#888", fontWeight: 400 }}>{isUrdu ? UR.compareSubtitle : "Upload 2 docs to compare"}</div>
                  </div>
                  <span style={{ color: "#BBBBBB", fontSize: 12 }}>›</span>
                </div>

                <div onClick={() => setShowDraftPopup(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "white", borderRadius: "8px", border: "1px solid #E8E8E4", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F9F5"; e.currentTarget.style.borderColor = ACCENT_PK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white";   e.currentTarget.style.borderColor = "#E8E8E4"; }}>
                  <div style={{ width: "28px", height: "28px", flexShrink: 0, background: "#EDF7F0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>✍️</div>
                  <div style={{ flex: 1, minWidth: 0, direction: isUrdu ? "rtl" : "ltr" }}>
                    <div style={{ fontSize: 11, color: "#1A1A1A", fontWeight: 600, lineHeight: 1.3 }}>{isUrdu ? UR.draftTitle : "Draft Documents"}</div>
                    <div style={{ fontSize: 9, color: "#888", fontWeight: 400 }}>{isUrdu ? UR.draftSubtitle : "Contracts, affidavits & more"}</div>
                  </div>
                  <span style={{ color: "#BBBBBB", fontSize: 12 }}>›</span>
                </div>
              </div>

              <div style={{ height: "1px", background: `${GOLD}40`, margin: "6px 0", flexShrink: 0 }} />

              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.5px", direction: isUrdu ? "rtl" : "ltr" }}>💬 {isUrdu ? UR.sessions : "You & ARK LAW Sessions"}</span>
                  <button onClick={startNewChat} style={{ fontSize: 8, padding: "2px 8px", background: LIGHT_GREEN, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 700, transition: "background 0.15s", fontFamily: isUrdu ? "serif" : "inherit" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER}
                    onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}
                    title={isUrdu ? "نیا سیشن" : "New Chat"}
                  >{isUrdu ? UR.newBtn : "+ New"}</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {allSessions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 8px", color: TEXT_MUTED }}>
                      <div style={{ fontSize: 20, marginBottom: "6px", opacity: 0.4 }}>💬</div>
                      <div style={{ fontSize: 8, lineHeight: 1.5 }}>Start a conversation!</div>
                    </div>
                  ) : (
                    allSessions.map((session) => {
                      const isActive = session.id === activeChatId;
                      return (
                        <div key={session.id} onClick={() => loadSession(session.id)} title={session.title}
                          style={{ padding: "6px 8px", borderRadius: "6px", background: isActive ? `${GOLD}22` : "transparent", border: isActive ? `1px solid ${GOLD}60` : "1px solid transparent", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: "6px" }}
                          onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = `${NAVY}08`; e.currentTarget.style.borderColor = NAVY_BORDER; } }}
                          onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                        >
                          <span style={{ fontSize: 10, flexShrink: 0, marginTop: "1px" }}>{isActive ? "🟡" : "💬"}</span>
                          <span style={{ fontSize: 8, color: isActive ? NAVY : "#444", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontWeight: isActive ? 600 : 400 }}>
                            {session.title}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          {/* CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: CREAM, position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.08, pointerEvents: "none", zIndex: 0 }}>
              <img src="/ark-logo.png" alt="ARK Watermark" style={{ width: "400px", height: "400px" }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column-reverse", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "10px" }}>
                    {msg.role === "assistant" && <img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}`, flexShrink: 0 }} />}
                    <div style={{ maxWidth: "70%", position: "relative" }}>
                      <div style={{ padding: "10px 14px", borderRadius: "8px", background: msg.role === "user" ? "#E8E0CC" : "white", color: msg.role === "user" ? NAVY : "#333", fontSize: 13, lineHeight: "1.4", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", position: "relative" }}>
                        {renderMessageContent(msg.content)}

                      </div>
                      {msg.role === "assistant" && (
                        <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
                          <button onClick={() => speakText(msg.content, i)} title={currentSpeakingIndex === i ? "Stop" : "Listen"}
                            style={{ width: "28px", height: "28px", borderRadius: "6px", background: currentSpeakingIndex === i ? LIGHT_GREEN : "white", border: `1px solid ${currentSpeakingIndex === i ? LIGHT_GREEN : "#D0D0C8"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
                            onMouseEnter={(e) => { if (currentSpeakingIndex !== i) { e.currentTarget.style.borderColor = LIGHT_GREEN; e.currentTarget.style.background = `${LIGHT_GREEN}15`; } }}
                            onMouseLeave={(e) => { if (currentSpeakingIndex !== i) { e.currentTarget.style.borderColor = "#D0D0C8"; e.currentTarget.style.background = "white"; } }}>
                            {currentSpeakingIndex === i
                              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                            }
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setReactions(prev => ({ ...prev, [i]: { ...prev[i], like: !prev[i]?.like, dislike: false } })); }} title="Like"
                            style={{ width: "28px", height: "28px", borderRadius: "6px", background: reactions[i]?.like ? "#E8F5E9" : "white", border: `1px solid ${reactions[i]?.like ? LIGHT_GREEN : "#D0D0C8"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontSize: 13 }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = LIGHT_GREEN; e.currentTarget.style.background = "#E8F5E9"; }}
                            onMouseLeave={(e) => { if (!reactions[i]?.like) { e.currentTarget.style.borderColor = "#D0D0C8"; e.currentTarget.style.background = "white"; } }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill={reactions[i]?.like ? LIGHT_GREEN : "none"} stroke={reactions[i]?.like ? LIGHT_GREEN : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setReactions(prev => ({ ...prev, [i]: { ...prev[i], dislike: !prev[i]?.dislike, like: false } })); }} title="Dislike"
                            style={{ width: "28px", height: "28px", borderRadius: "6px", background: reactions[i]?.dislike ? "#FEE2E2" : "white", border: `1px solid ${reactions[i]?.dislike ? "#EF4444" : "#D0D0C8"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontSize: 13 }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.background = "#FEE2E2"; }}
                            onMouseLeave={(e) => { if (!reactions[i]?.dislike) { e.currentTarget.style.borderColor = "#D0D0C8"; e.currentTarget.style.background = "white"; } }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill={reactions[i]?.dislike ? "#EF4444" : "none"} stroke={reactions[i]?.dislike ? "#EF4444" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{isUrdu ? UR.thinking : "ARK is thinking..."}</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ padding: "8px 12px", borderTop: `1px solid ${NAVY_BORDER}`, background: `${NAVY_SURFACE}aa`, display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: TEXT_MUTED, fontWeight: 600 }}>📎 Attached ({uploadedFiles.length}):</span>
                {uploadedFiles.map((file, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 8px", background: NAVY_SURFACE, border: `1px solid ${GOLD}`, borderRadius: "4px", fontSize: 10, color: CREAM }}>
                    <span>{file.name}</span><span style={{ color: TEXT_MUTED }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    <button onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: 12, padding: "0 2px", lineHeight: 1 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setUploadedFiles([])} style={{ padding: "3px 8px", background: `${GOLD}20`, border: `1px solid ${GOLD}`, borderRadius: "4px", color: GOLD, fontSize: 9, fontWeight: 600, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = NAVY; }} onMouseLeave={(e) => { e.currentTarget.style.background = `${GOLD}20`; e.currentTarget.style.color = GOLD; }}>Clear All</button>
              </div>
            )}

            <div style={{ padding: "12px 15px", borderTop: `1px solid ${NAVY_BORDER}`, display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={startVoiceInput} disabled={loading || isListening} title={isListening ? "Listening..." : "Click to speak"}
                style={{ width: "38px", height: "38px", background: isListening ? LIGHT_GREEN : "white", border: `1px solid ${isListening ? LIGHT_GREEN : GOLD}60`, borderRadius: "6px", cursor: loading || isListening ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", animation: isListening ? "pulse 1.5s infinite" : "none", boxShadow: isListening ? `0 0 0 3px ${LIGHT_GREEN}30` : "none" }}
                onMouseEnter={(e) => { if (!isListening && !loading) { e.currentTarget.style.borderColor = LIGHT_GREEN; e.currentTarget.style.background = `${LIGHT_GREEN}12`; } }}
                onMouseLeave={(e) => { if (!isListening) { e.currentTarget.style.borderColor = `${GOLD}60`; e.currentTarget.style.background = "white"; } }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isListening ? "white" : NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/>
                </svg>
              </button>
              <label htmlFor="file-upload" title="Attach files"
                style={{ width: "38px", height: "38px", background: "white", border: `1px solid ${GOLD}60`, borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = LIGHT_GREEN; e.currentTarget.style.background = `${LIGHT_GREEN}12`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${GOLD}60`; e.currentTarget.style.background = "white"; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 16.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                <input id="file-upload" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => { const files = Array.from(e.target.files); if (files.length > 0) { setUploadedFiles(prev => [...prev, ...files]); alert(files.length + " file(s) uploaded: " + files.map(f => f.name).join(", ")); } }} style={{ display: "none" }} />
              </label>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={isListening ? (isUrdu ? UR.listening : "Listening...") : uploadedFiles.length > 0 ? (isUrdu ? `اپنی ${uploadedFiles.length} فائل(وں) کے بارے میں پوچھیں...` : `Ask about your ${uploadedFiles.length} attached file(s)...`) : (isUrdu ? UR.placeholder : "Ask ARK Law AI or click mic to speak...")}
                style={{ flex: 1, padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}60`, color: NAVY, borderRadius: "4px", fontSize: 13, direction: isUrdu ? "rtl" : "ltr", fontFamily: isUrdu ? "serif" : "inherit" }} />
              <button onClick={() => sendMessage()} disabled={loading || isListening}
                style={{ padding: "9px 18px", background: loading || isListening ? "#9DB89A" : LIGHT_GREEN, color: "white", border: "none", borderRadius: "4px", cursor: loading || isListening ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, opacity: loading || isListening ? 0.6 : 1, fontFamily: isUrdu ? "serif" : "inherit", transition: "background 0.2s" }}
                onMouseEnter={(e) => { if (!loading && !isListening) e.currentTarget.style.background = LG_HOVER; }}
                onMouseLeave={(e) => { if (!loading && !isListening) e.currentTarget.style.background = LIGHT_GREEN; }}>{isUrdu ? UR.send : "SEND"}</button>
            </div>
          </div>

          {/* RIGHT SIDEBAR — always rendered, hidden on mobile unless tab=right */}
          <div style={{ width: "220px", background: CREAM, borderLeft: `1px solid ${GOLD}40`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "7px 12px", background: "#1B2E1A", flexShrink: 0 }}>
                <span style={{ fontSize: 11 }}>🚀</span>
                <span style={{ fontSize: 11, color: "#E8D97A", fontWeight: 700, fontFamily: "Georgia,serif", letterSpacing: "0.5px" }}>Test Launch</span>
                <span style={{ fontSize: 9, color: "#9DB89A", fontStyle: "italic" }}>— ARK Law AI</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
                <div style={{ marginBottom: "20px", direction: isUrdu ? "rtl" : "ltr" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexDirection: isUrdu ? "row-reverse" : "row" }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", fontFamily: isUrdu ? "serif" : "inherit" }}>{isUrdu ? UR.quickLabel : "Quick Queries"}</span>
                  </div>
                  <p style={{ fontSize: 9, color: "#888", margin: "0 0 10px 0", lineHeight: 1.4, fontFamily: isUrdu ? "serif" : "inherit" }}>{isUrdu ? "شروع کرنے کے لیے کوئی سوال کلک کریں" : "Click any question to get started"}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {(isUrdu ? UR.quickQueries : QUICK_QUERIES_PK).map((query, i) => (
                      <button key={i} onClick={() => sendMessage(isUrdu ? QUICK_QUERIES_PK[i] : query, true)}
                        style={{ display: "flex", alignItems: "flex-start", gap: "8px", width: "100%", padding: "8px 10px", background: "white", border: `1px solid ${GOLD}25`, borderRadius: "8px", cursor: "pointer", textAlign: isUrdu ? "right" : "left", fontSize: 10, color: "#2D2D2D", lineHeight: 1.4, fontWeight: 400, transition: "all 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", direction: isUrdu ? "rtl" : "ltr", fontFamily: isUrdu ? "serif" : "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FAF4"; e.currentTarget.style.borderColor = ACCENT_PK; e.currentTarget.style.color = "#1A5C36"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = `${GOLD}25`; e.currentTarget.style.color = "#2D2D2D"; }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#E8F5EE", border: "1px solid #C2E0CE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                          <span style={{ fontSize: 9, color: ACCENT_PK, fontWeight: 700 }}>?</span>
                        </div>
                        <span style={{ flex: 1 }}>{query}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: "1px", background: "#EBEBEB", margin: "0 0 16px 0" }} />
                <div style={{ direction: isUrdu ? "rtl" : "ltr" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexDirection: isUrdu ? "row-reverse" : "row" }}>
                    <span style={{ fontSize: 14 }}>⚖️</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.4px", fontFamily: isUrdu ? "serif" : "inherit" }}>{isUrdu ? UR.areasLabel : "Practice Areas"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {PRACTICE_AREAS_PK.map((area, i) => (
                      <button key={area.id} onClick={() => sendMessage(`Tell me about ${area.label} in Pakistan`, true)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 10px", background: "white", border: `1px solid ${GOLD}25`, borderRadius: "8px", cursor: "pointer", textAlign: isUrdu ? "right" : "left", fontSize: 11, color: "#1A1A1A", fontWeight: 500, transition: "all 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", flexDirection: isUrdu ? "row-reverse" : "row", fontFamily: isUrdu ? "serif" : "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FAF4"; e.currentTarget.style.borderColor = ACCENT_PK; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = `${GOLD}25`; }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "#EEF7F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>{area.icon}</div>
                        <span style={{ flex: 1 }}>{isUrdu ? UR.practiceAreas[i] : area.label}</span>
                        <span style={{ color: "#BBBBBB", fontSize: 13, fontWeight: 300 }}>{isUrdu ? "‹" : "›"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>


        {/* FOOTER */}
        <footer style={{ background: "#1B2E1A", borderTop: "1px solid #2E4A2C", flexShrink: 0 }}>
          <div style={{ padding: "3px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, flexWrap: "wrap", rowGap: "0" }}>
              <img src="/ark-logo.png" alt="ARK" style={{ width: "14px", height: "14px", opacity: 0.85, flexShrink: 0 }} />
              <span style={{ fontSize: 8, fontWeight: 700, color: "#E8D97A", fontFamily: "Georgia,serif", whiteSpace: "nowrap" }}>ARK LAW AI</span>
              <span style={{ color: "#3A5A38", fontSize: 8 }}>|</span>
              {[
                { heading: "Product",   links: ["Features", "Document Analysis", "AI Drafting"] },
                { heading: "Company",   links: ["About Us", "Careers", "Blog"] },
                { heading: "Resources", links: ["Help Center", "Guides", "Legal Updates"] },
              ].map(({ heading, links }, gi) => (
                <div key={heading} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {gi > 0 && <span style={{ color: "#3A5A38", fontSize: 8 }}>|</span>}
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#D4C97A", textTransform: "uppercase", letterSpacing: "0.4px" }}>{heading}:</span>
                  {links.map((link, li) => (
                    <span key={link} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      {li > 0 && <span style={{ color: "#3A5A38", fontSize: 7 }}>·</span>}
                      <span onClick={() => link === "Features" ? setShowFeaturesPopup(true) : setShowComingSoon(true)} style={{ fontSize: 7, color: "#9DB89A", cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#E8D97A"} onMouseLeave={(e) => e.currentTarget.style.color = "#9DB89A"}>{link}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
              {[
                { label: "Twitter",  svg: <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "LinkedIn", svg: <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: "YouTube",  svg: <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
              ].map(({ label, svg }) => (
                <button key={label} onClick={() => setShowComingSoon(true)} aria-label={label}
                  style={{ width: "16px", height: "16px", borderRadius: "3px", background: "#2A432A", border: "1px solid #3A5A38", display: "flex", alignItems: "center", justifyContent: "center", color: "#9DB89A", cursor: "pointer", transition: "all 0.18s", padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#3A5C38"; e.currentTarget.style.color = "#E8D97A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#2A432A"; e.currentTarget.style.color = "#9DB89A"; }}
                >{svg}</button>
              ))}
              <span style={{ fontSize: 6.5, color: "#6A8A68", whiteSpace: "nowrap" }}>© 2026 ARK Lex AI LLC.</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          POPUPS
      ═══════════════════════════════════════════════════════════════════ */}

      {showSuccessPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, padding: "40px", borderRadius: "12px", border: `2px solid ${ACCENT_PK}`, maxWidth: "450px", textAlign: "center" }}>
            <img src="/ark-logo.png" alt="ARK" style={{ width: "60px", height: "60px", margin: "0 auto 15px" }} />
            <div style={{ fontSize: 48, marginBottom: "15px" }}>✅</div>
            <h2 style={{ color: ACCENT_PK, fontSize: 18, marginBottom: "15px" }}>Correct Code!</h2>
            <div style={{ borderTop: `2px solid ${GOLD}`, borderBottom: `2px solid ${GOLD}`, padding: "20px", margin: "20px 0" }}>
              <p style={{ color: TEXT_PRIMARY, fontSize: 13, lineHeight: "1.6" }}>You have entered the correct magic code dedicated to Honorable Justice S. A. Rabbani, legendary jurist of Pakistan.</p>
            </div>
            <button onClick={() => setShowSuccessPopup(false)} style={{ padding: "12px 30px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>OK — Let's Go! ⚖️</button>
          </div>
        </div>
      )}

      {showNewsPopup && selectedNews && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY, borderRadius: "12px", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflow: "auto", border: `2px solid ${GOLD}`, boxShadow: "0 0 30px rgba(201,168,76,0.2)" }}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY_SURFACE}, ${NAVY_MID})`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "40px", height: "40px" }} />
                <div><div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>ARK Law AI</div><div style={{ color: TEXT_MUTED, fontSize: 9 }}>Legal News Analysis</div></div>
              </div>
              <button onClick={() => setShowNewsPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "25px" }}>
              <p style={{ color: GOLD, fontSize: 15, fontWeight: 700, marginBottom: "10px", lineHeight: "1.6" }}>{selectedNews.headline}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px", padding: "10px", background: NAVY_SURFACE, borderRadius: "4px", borderLeft: `3px solid ${ACCENT_PK}` }}>
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>📰 Source:</span>
                <span style={{ fontSize: 11, color: ACCENT_PK, fontWeight: 600 }}>{selectedNews.source}</span>
              </div>
              <div style={{ height: "1px", background: NAVY_BORDER, margin: "15px 0" }} />
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "8px" }}>Full News Details:</h4>
                <p style={{ color: TEXT_PRIMARY, fontSize: 13, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{selectedNews.fullText}</p>
              </div>
              <div style={{ height: "1px", background: NAVY_BORDER, margin: "15px 0" }} />
              <div>
                <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "8px" }}>⚖️ Legal Analysis & Impact:</h4>
                {newsLoading ? <div style={{ color: TEXT_MUTED, fontSize: 13, textAlign: "center", padding: "20px" }}>⏳ Analyzing legal significance...</div> : <div style={{ color: TEXT_SECONDARY, fontSize: 13, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{newsAnalysis}</div>}
              </div>
            </div>
            <div style={{ padding: "15px 25px", borderTop: `2px solid ${GOLD}`, background: NAVY_SURFACE, display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowNewsPopup(false)} style={{ padding: "10px 24px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {showDraftPopup && (
        // Backdrop — pointerEvents blocks all clicks outside popup
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, pointerEvents: "all" }}>
          <div style={{ background: CREAM, borderRadius: "14px", width: "90%", maxWidth: "800px", maxHeight: "92vh", overflow: "auto", border: `2px solid ${GOLD}60`, boxShadow: "0 12px 48px rgba(0,0,0,0.4)", position: "relative" }}>

            {/* Watermark */}
            <img src="/ark-logo.png" alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0, width: "260px", height: "260px" }} />

            {/* Header */}
            <div style={{ background: "transparent", padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${GOLD}40`, position: "sticky", top: 0, background: CREAM, zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "38px", height: "38px", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))" }} />
                <div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: NAVY }}>ARK Law AI</div>
                  <div style={{ fontSize: 11, color: "#5A7A56" }}>✍️ AI Legal Document Drafting</div>
                </div>
              </div>
              <button onClick={() => { setShowDraftPopup(false); setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }}
                style={{ background: "none", border: "none", color: "#6A8A66", fontSize: 22, cursor: "pointer", lineHeight: 1, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = NAVY}
                onMouseLeave={(e) => e.currentTarget.style.color = "#6A8A66"}>✕</button>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)` }} />

            <div style={{ padding: "22px 24px", position: "relative", zIndex: 1 }}>
              {draftStep === "type-selection" && (
                <div>
                  <h4 style={{ color: NAVY, fontSize: 15, marginBottom: "15px", fontWeight: 700, fontFamily: "Georgia,serif" }}>📋 Step 1: Select Document Type</h4>
                  <select value={draftType} onChange={(e) => setDraftType(e.target.value)} style={{ width: "100%", padding: "12px", background: CREAM, border: `1px solid ${GOLD}50`, color: NAVY, borderRadius: "8px", marginBottom: "20px", fontSize: 13, cursor: "pointer" }}>
                    <option value="">-- Select Document Type --</option>
                    <option value="rental-agreement">🏠 Rental/Lease Agreement</option>
                    <option value="contract">📄 General Contract</option>
                    <option value="nda">🔒 Non-Disclosure Agreement (NDA)</option>
                    <option value="affidavit">⚖️ Affidavit</option>
                    <option value="will">📜 Will / Testament</option>
                    <option value="power-of-attorney">🔑 Power of Attorney</option>
                    <option value="employment-agreement">💼 Employment Agreement</option>
                    <option value="partnership-deed">🤝 Partnership Deed</option>
                    <option value="sale-deed">🏘️ Sale Deed</option>
                    <option value="divorce-agreement">💔 Divorce Agreement</option>
                    <option value="loan-agreement">💰 Loan Agreement</option>
                    <option value="trust-deed">🏛️ Trust Deed</option>
                  </select>
                  <div style={{ background: "#EDE8DF", padding: "15px", borderRadius: "8px", borderLeft: `4px solid ${ACCENT_PK}`, marginBottom: "20px" }}>
                    <div style={{ color: "#3A6A55", fontSize: 11, fontWeight: 600, marginBottom: "8px" }}>ℹ️ How It Works:</div>
                    <div style={{ color: "#4A6A56", fontSize: 11, lineHeight: "1.6" }}>1. Select the document type<br/>2. Provide required information<br/>3. AI generates a complete, court-ready document<br/>4. Edit and download in Word or PDF format</div>
                  </div>
                  <button onClick={() => { if (!draftType) { alert("Please select a document type"); return; } setDraftStep("gathering-info"); }} disabled={!draftType}
                    style={{ width: "100%", padding: "13px", background: draftType ? LIGHT_GREEN : "#C8C0B0", color: "white", border: "none", borderRadius: "8px", cursor: draftType ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14, marginBottom: "10px", transition: "background 0.2s" }}
                    onMouseEnter={(e) => { if (draftType) e.currentTarget.style.background = LG_HOVER; }}
                    onMouseLeave={(e) => { if (draftType) e.currentTarget.style.background = LIGHT_GREEN; }}>
                    Next: Provide Information →
                  </button>
                  <button onClick={() => { setShowDraftPopup(false); setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }} className="cancel-btn"
                    style={{ width: "100%", padding: "10px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
                    Cancel
                  </button>
                </div>
              )}
              {draftStep === "gathering-info" && (
                <div>
                  <h4 style={{ color: NAVY, fontSize: 15, marginBottom: "8px", fontWeight: 700, fontFamily: "Georgia,serif" }}>📝 Step 2: Provide Document Information</h4>
                  <p style={{ color: "#5A7A56", fontSize: 11, marginBottom: "20px" }}>Fill in the details below. AI will generate a complete Pakistani legal document.</p>
                  <div style={{ maxHeight: "400px", overflowY: "auto", padding: "5px" }}>
                    {draftType === "rental-agreement" && (
                      <div>
                        {[
                          { heading: "🏠 Landlord Information", fields: [
                            { ph: "Landlord Full Name *", key: "landlordName" },
                            { ph: "Landlord CNIC Number *", key: "landlordCNIC" },
                            { ph: "Landlord Complete Address *", key: "landlordAddress" },
                          ]},
                          { heading: "👤 Tenant Information", fields: [
                            { ph: "Tenant Full Name *", key: "tenantName" },
                            { ph: "Tenant CNIC Number *", key: "tenantCNIC" },
                            { ph: "Tenant Complete Address *", key: "tenantAddress" },
                          ]},
                          { heading: "🏘️ Property Details", fields: [
                            { ph: "Property Complete Address *", key: "propertyAddress" },
                            { ph: "Property Type (House/Flat/Commercial) *", key: "propertyType" },
                            { ph: "Covered Area (sq ft/marla/kanal) *", key: "propertyArea" },
                          ]},
                          { heading: "💰 Rental Terms", fields: [
                            { ph: "Monthly Rent Amount (PKR) *", key: "monthlyRent" },
                            { ph: "Security Deposit (PKR) *", key: "securityDeposit" },
                            { ph: "Lease Duration (e.g., 1 year, 11 months) *", key: "leaseDuration" },
                            { ph: "Rent Payment Date (e.g., 1st of each month) *", key: "paymentDate" },
                            { ph: "Notice Period (e.g., 1 month) *", key: "noticePeriod" },
                          ]},
                        ].map(({ heading, fields }) => (
                          <div key={heading} style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: `1px solid ${GOLD}30` }}>
                            <h5 style={{ color: "#3A6A55", fontSize: 12, marginBottom: "10px", fontWeight: 600 }}>{heading}</h5>
                            {fields.map(({ ph, key }) => (
                              <input key={key} placeholder={ph} onChange={(e) => setDraftRequirements({...draftRequirements, [key]: e.target.value})}
                                style={{ width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", marginBottom: "8px", fontSize: 12 }} />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {draftType === "affidavit" && (
                      <div>
                        <div style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: `1px solid ${GOLD}30` }}>
                          <h5 style={{ color: "#3A6A55", fontSize: 12, marginBottom: "10px", fontWeight: 600 }}>⚖️ Deponent Information</h5>
                          {[["Deponent Full Name *","deponentName"],["CNIC Number *","deponentCNIC"],["Father's/Husband's Name *","deponentFatherName"],["Complete Address *","deponentAddress"]].map(([ph,key]) => (
                            <input key={key} placeholder={ph} onChange={(e) => setDraftRequirements({...draftRequirements, [key]: e.target.value})} style={{ width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", marginBottom: "8px", fontSize: 12 }} />
                          ))}
                        </div>
                        <div style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: `1px solid ${GOLD}30` }}>
                          <h5 style={{ color: "#3A6A55", fontSize: 12, marginBottom: "10px", fontWeight: 600 }}>📋 Affidavit Details</h5>
                          <input placeholder="Purpose of Affidavit *" onChange={(e) => setDraftRequirements({...draftRequirements, purpose: e.target.value})} style={{ width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", marginBottom: "8px", fontSize: 12 }} />
                          <textarea placeholder="Facts to be stated under oath *" onChange={(e) => setDraftRequirements({...draftRequirements, facts: e.target.value})} style={{ width: "100%", height: "100px", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", marginBottom: "8px", fontSize: 12, fontFamily: "inherit" }} />
                          <input placeholder="Authority/Court where to be filed *" onChange={(e) => setDraftRequirements({...draftRequirements, authority: e.target.value})} style={{ width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", fontSize: 12 }} />
                        </div>
                      </div>
                    )}
                    {draftType === "nda" && (
                      <div>
                        {[
                          { heading: "📤 Disclosing Party", fields: [["Party Name *","disclosingParty"],["Address *","disclosingAddress"]] },
                          { heading: "📥 Receiving Party",  fields: [["Party Name *","receivingParty"],["Address *","receivingAddress"]] },
                        ].map(({ heading, fields }) => (
                          <div key={heading} style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: `1px solid ${GOLD}30` }}>
                            <h5 style={{ color: "#3A6A55", fontSize: 12, marginBottom: "10px", fontWeight: 600 }}>{heading}</h5>
                            {fields.map(([ph,key]) => (
                              <input key={key} placeholder={ph} onChange={(e) => setDraftRequirements({...draftRequirements, [key]: e.target.value})} style={{ width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", marginBottom: "8px", fontSize: 12 }} />
                            ))}
                          </div>
                        ))}
                        <div style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: `1px solid ${GOLD}30` }}>
                          <h5 style={{ color: "#3A6A55", fontSize: 12, marginBottom: "10px", fontWeight: 600 }}>🔒 Confidentiality Terms</h5>
                          <textarea placeholder="Nature of Confidential Information *" onChange={(e) => setDraftRequirements({...draftRequirements, confidentialInfo: e.target.value})} style={{ width: "100%", height: "80px", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", marginBottom: "8px", fontSize: 12, fontFamily: "inherit" }} />
                          <input placeholder="Duration of Confidentiality (e.g., 3 years) *" onChange={(e) => setDraftRequirements({...draftRequirements, duration: e.target.value})} style={{ width: "100%", padding: "9px 12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", fontSize: 12 }} />
                        </div>
                      </div>
                    )}
                    {!["rental-agreement", "affidavit", "nda"].includes(draftType) && (
                      <div style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: `1px solid ${GOLD}30` }}>
                        <h5 style={{ color: "#3A6A55", fontSize: 12, marginBottom: "10px", fontWeight: 600 }}>📋 Document Information</h5>
                        <textarea placeholder={`Provide all necessary details for ${draftType}:

• Party names and addresses
• Terms and conditions
• Duration/timeline
• Special clauses
• Any other relevant information`} onChange={(e) => setDraftRequirements({...draftRequirements, generalInfo: e.target.value})} style={{ width: "100%", height: "220px", padding: "12px", background: CREAM, border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "6px", fontSize: 12, fontFamily: "inherit", lineHeight: "1.6" }} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button onClick={() => setDraftStep("type-selection")} style={{ flex: 1, padding: "11px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
                    <button onClick={() => generateDocument(draftRequirements)} disabled={draftGenerating}
                      style={{ flex: 2, padding: "11px", background: draftGenerating ? "#C8C0B0" : LIGHT_GREEN, color: "white", border: "none", borderRadius: "8px", cursor: draftGenerating ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, transition: "background 0.2s" }}
                      onMouseEnter={(e) => { if (!draftGenerating) e.currentTarget.style.background = LG_HOVER; }}
                      onMouseLeave={(e) => { if (!draftGenerating) e.currentTarget.style.background = draftGenerating ? "#C8C0B0" : LIGHT_GREEN; }}>
                      {draftGenerating ? "⏳ Generating..." : "🚀 Generate Document with AI"}
                    </button>
                  </div>
                  <button onClick={() => { setShowDraftPopup(false); setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }} className="cancel-btn"
                    style={{ width: "100%", padding: "10px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: "10px", transition: "background 0.2s" }}>
                    Cancel
                  </button>
                </div>
              )}
              {draftStep === "generating" && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <img src="/ark-logo.png" alt="ARK" style={{ width: "70px", height: "70px", marginBottom: "20px", opacity: 0.7, animation: "pulse 2s infinite" }} />
                  <h4 style={{ color: NAVY, fontSize: 16, marginBottom: "15px", fontWeight: 700, fontFamily: "Georgia,serif" }}>⏳ Generating Your Legal Document...</h4>
                  <p style={{ color: "#5A7A56", fontSize: 13, lineHeight: "1.6", marginBottom: "20px" }}>Our AI is drafting a comprehensive, Pakistani law-compliant document.</p>
                  <div style={{ background: "#EDE8DF", padding: "14px", borderRadius: "8px", border: `1px solid ${GOLD}30` }}>
                    {["Analyzing requirements","Applying Pakistani legal format","Including all necessary clauses"].map((t,i) => (
                      <div key={i} style={{ color: LIGHT_GREEN, fontSize: 11, marginBottom: i < 2 ? "6px" : 0 }}>✓ {t}</div>
                    ))}
                    <div style={{ color: "#8A9A86", fontSize: 11, marginTop: "6px" }}>⏳ Finalizing document...</div>
                  </div>
                </div>
              )}
              {draftStep === "completed" && (
                <div>
                  <h4 style={{ color: NAVY, fontSize: 15, marginBottom: "8px", fontWeight: 700, fontFamily: "Georgia,serif" }}>✅ Document Generated Successfully!</h4>
                  <p style={{ color: "#5A7A56", fontSize: 11, marginBottom: "14px" }}>Your {draftType} has been generated. Edit and download below.</p>
                  <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} style={{ width: "100%", height: "360px", padding: "14px", background: "white", border: `1px solid ${GOLD}50`, color: "#000", borderRadius: "8px", marginBottom: "12px", fontSize: 13, fontFamily: "'Times New Roman', serif", lineHeight: "1.8", whiteSpace: "pre-wrap" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", padding: "10px 14px", background: "#EDE8DF", borderRadius: "8px" }}>
                    <span style={{ color: "#5A7A56", fontSize: 11 }}>📝 Words: <strong>{draftContent.split(/\s+/).filter(Boolean).length}</strong></span>
                    <span style={{ color: "#5A7A56", fontSize: 11 }}>📊 Chars: <strong>{draftContent.length}</strong></span>
                    <span style={{ color: "#5A7A56", fontSize: 11 }}>📄 Pages: <strong>{Math.ceil(draftContent.split(/\s+/).filter(Boolean).length / 500)}</strong></span>
                  </div>
                  <div style={{ background: `${GOLD}18`, padding: "10px 14px", borderRadius: "8px", borderLeft: `4px solid ${GOLD}`, marginBottom: "16px" }}>
                    <div style={{ color: "#8A6A10", fontSize: 10, fontWeight: 600, marginBottom: "4px" }}>⚠️ IMPORTANT LEGAL DISCLAIMER</div>
                    <div style={{ color: "#6A5A30", fontSize: 10, lineHeight: "1.5" }}>This document is AI-generated for reference only. Please have it reviewed by a qualified Pakistani lawyer before execution.</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <button onClick={() => { setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }} style={{ flex: 1, padding: "11px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔄 New Document</button>
                    <button onClick={() => downloadDraft("docx")} style={{ flex: 1, padding: "11px", background: LIGHT_GREEN, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: 12, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER} onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}>📥 Download DOCX</button>
                    <button onClick={() => downloadDraft("pdf")} style={{ flex: 1, padding: "11px", background: GOLD, color: NAVY, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>📄 Download PDF</button>
                  </div>
                  <button onClick={() => { setShowDraftPopup(false); setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }} className="cancel-btn"
                    style={{ width: "100%", padding: "10px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showComparePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, pointerEvents: "all" }}>
          <div style={{ background: CREAM, borderRadius: "14px", width: "90%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto", border: `2px solid ${GOLD}60`, boxShadow: "0 12px 48px rgba(0,0,0,0.4)", position: "relative" }}>

            {/* Watermark */}
            <img src="/ark-logo.png" alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0, width: "220px", height: "220px" }} />

            {/* Header */}
            <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${GOLD}40`, position: "sticky", top: 0, background: CREAM, zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "36px", height: "36px", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))" }} />
                <div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: NAVY }}>ARK Law AI</div>
                  <div style={{ fontSize: 11, color: "#5A7A56" }}>⚖️ Compare Legal Documents</div>
                </div>
              </div>
              <button onClick={() => setShowComparePopup(false)}
                style={{ background: "none", border: "none", color: "#6A8A66", fontSize: 22, cursor: "pointer", lineHeight: 1, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = NAVY}
                onMouseLeave={(e) => e.currentTarget.style.color = "#6A8A66"}>✕</button>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)` }} />

            <div style={{ padding: "20px 24px", position: "relative", zIndex: 1 }}>

              {/* Doc 1 */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#5A7A56", fontSize: 11, fontWeight: 700, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>📄 Document 1</label>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setDoc1(e.target.files?.[0])}
                  style={{ width: "100%", padding: "8px 10px", background: "#EDE8DF", border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "7px", fontSize: 11 }} />
                {doc1 && <div style={{ marginTop: "5px", fontSize: 10, color: doc1.size > 5*1024*1024 ? "#C0392B" : LIGHT_GREEN }}>{doc1.name} — {(doc1.size/1024/1024).toFixed(2)}MB {doc1.size > 5*1024*1024 && "⚠️ TOO LARGE (Max 5MB)"}</div>}
              </div>

              {/* Doc 2 */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#5A7A56", fontSize: 11, fontWeight: 700, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>📄 Document 2</label>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setDoc2(e.target.files?.[0])}
                  style={{ width: "100%", padding: "8px 10px", background: "#EDE8DF", border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "7px", fontSize: 11 }} />
                {doc2 && <div style={{ marginTop: "5px", fontSize: 10, color: doc2.size > 5*1024*1024 ? "#C0392B" : LIGHT_GREEN }}>{doc2.name} — {(doc2.size/1024/1024).toFixed(2)}MB {doc2.size > 5*1024*1024 && "⚠️ TOO LARGE (Max 5MB)"}</div>}
              </div>

              {/* Info note */}
              <div style={{ marginBottom: "14px", padding: "10px 12px", background: "#EDE8DF", borderRadius: "7px", borderLeft: `3px solid ${ACCENT_PK}` }}>
                <div style={{ fontSize: 10, color: "#4A6A56", lineHeight: "1.6" }}>ℹ️ <strong>Supported:</strong> PDF, DOC, DOCX (max 5MB each) · ✓ Scanned PDFs supported</div>
              </div>

              {/* Focal point */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "#5A7A56", fontSize: 11, fontWeight: 700, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>🎯 Focal Point for Comparison</label>
                <input type="text" value={compareFocus} onChange={(e) => setCompareFocus(e.target.value)}
                  placeholder="e.g., payment terms, liability clauses, termination conditions..."
                  style={{ width: "100%", padding: "9px 12px", background: "#EDE8DF", border: `1px solid ${GOLD}40`, color: NAVY, borderRadius: "7px", fontSize: 12 }} />
              </div>

              {/* Loading */}
              {comparingDocs && (
                <div style={{ marginBottom: "14px", padding: "18px", background: "#EDE8DF", borderRadius: "8px", border: `1px solid ${GOLD}30`, textAlign: "center" }}>
                  <div style={{ color: NAVY, fontSize: 13, fontWeight: 600, marginBottom: "6px", fontFamily: "Georgia,serif" }}>⏳ Analyzing Documents...</div>
                  <div style={{ color: "#5A7A56", fontSize: 11 }}>AI is comparing the documents</div>
                </div>
              )}

              {/* Result */}
              {comparisonResult && !comparingDocs && (
                <div style={{ marginBottom: "14px", padding: "14px", background: "#EDE8DF", borderRadius: "8px", border: `1px solid ${GOLD}30` }}>
                  <div style={{ color: NAVY, fontSize: 12, fontWeight: 700, marginBottom: "8px", fontFamily: "Georgia,serif" }}>📊 Comparison Report</div>
                  <div style={{ color: "#3A3A2A", fontSize: 11, lineHeight: "1.6", whiteSpace: "pre-wrap", maxHeight: "320px", overflowY: "auto" }}>{comparisonResult}</div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button onClick={compareDocuments} disabled={comparingDocs}
                  style={{ flex: 1, padding: "11px", background: comparingDocs ? "#C8C0B0" : LIGHT_GREEN, color: "white", border: "none", borderRadius: "8px", cursor: comparingDocs ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 12, transition: "background 0.2s" }}
                  onMouseEnter={(e) => { if (!comparingDocs) e.currentTarget.style.background = LG_HOVER; }}
                  onMouseLeave={(e) => { if (!comparingDocs) e.currentTarget.style.background = comparingDocs ? "#C8C0B0" : LIGHT_GREEN; }}>
                  {comparingDocs ? "⏳ Analyzing..." : "🔍 Compare Documents"}
                </button>
                {comparisonResult && (
                  <button onClick={downloadComparisonPDF}
                    style={{ flex: 1, padding: "11px", background: GOLD, color: NAVY, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                    📄 Download PDF
                  </button>
                )}
              </div>

              {/* Cancel */}
              <button onClick={() => { setShowComparePopup(false); setDoc1(null); setDoc2(null); setCompareFocus(""); setComparisonResult(""); }} className="cancel-btn"
                style={{ width: "100%", padding: "10px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkedInPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: POPUP_DARK, borderRadius: "12px", width: "90%", maxWidth: "1000px", maxHeight: "90vh", overflow: "auto", border: `2px solid ${GOLD}`, boxShadow: "0 0 30px rgba(201,168,76,0.3)" }}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY_SURFACE}, ${NAVY_MID})`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "50px", height: "50px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <img src="/khawer-profile.jpeg" alt="Khawer Rabbani" style={{ width: "60px", height: "60px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  <div><div style={{ color: GOLD, fontWeight: 700, fontSize: 18 }}>Khawer Rabbani</div><div style={{ color: ACCENT_PK, fontSize: 12, marginTop: "3px" }}>Attorney & AI Innovator</div><div style={{ color: TEXT_MUTED, fontSize: 10, marginTop: "2px" }}>Founder & CEO, ARK LAW AI</div></div>
                </div>
              </div>
              <button onClick={() => setShowLinkedInPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "0", background: CREAM }}>
              <iframe src="/KRprofile.pdf#toolbar=0" style={{ width: "100%", height: "75vh", border: "none", background: "white" }} title="Khawer Rabbani Professional Profile" />
            </div>
            <div style={{ padding: "15px 25px", borderTop: `2px solid ${GOLD}`, background: NAVY_SURFACE, display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: TEXT_MUTED }}>📧 khawer.rabbani@gmail.com</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a href="https://www.linkedin.com/in/khawerrabbani/" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 20px", background: "#0077B5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12, textDecoration: "none", display: "inline-block" }}>🔗 LinkedIn Profile</a>
                <button onClick={() => window.open("/KRprofile.pdf", "_blank")} style={{ padding: "10px 20px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📄 Download Profile</button>
                <button onClick={() => setShowLinkedInPopup(false)} style={{ padding: "10px 20px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LOGIN POPUP — cream bg, watermark, backdrop locks, Cancel button
      ═══════════════════════════════════════════════════════════════════ */}
      {showLoginPopup && (
        // Backdrop: pointer-events: none so clicking outside does NOTHING
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, pointerEvents: "all" }}>
          <div style={{ background: CREAM, padding: "32px 28px 24px", borderRadius: "14px", width: "90%", maxWidth: "400px", border: `2px solid ${GOLD}60`, boxShadow: "0 8px 40px rgba(0,0,0,0.35)", position: "relative", overflow: "hidden" }}>

            {/* Watermark */}
            <img src="/ark-logo.png" alt="" style={popupWatermark} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", position: "relative", zIndex: 1 }}>
              <img src="/ark-logo.png" alt="ARK" style={{ width: "38px", height: "38px", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: NAVY }}>ARK Law AI</div>
                <div style={{ fontSize: 11, color: "#5A7A56" }}>Login to your account</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)`, marginBottom: "20px" }} />

            <form style={{ position: "relative", zIndex: 1 }} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const email = formData.get("email"); const password = formData.get("password");
              try {
                const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
                const data = await res.json();
                if (!res.ok) { alert(data.error || "Invalid email or password"); return; }
                // Restore saved token balance from previous session if it exists
                const existingKey = "arklaw_user_tokens_" + data.user.id;
                const savedTokens = localStorage.getItem(existingKey);
                const restoredTokens = savedTokens !== null ? parseInt(savedTokens, 10) : (data.user.tokens || 500000);
                const userWithTokens = { ...data.user, tokens: restoredTokens };
                localStorage.setItem("arklaw_user", JSON.stringify(userWithTokens));
                setUser(userWithTokens);
                setUserTokens(restoredTokens);
                setShowLoginPopup(false);
                alert("Welcome back, " + data.user.name + "! You have " + restoredTokens.toLocaleString() + " credits remaining.");
              } catch (error) { alert("Login failed. Please try again."); }
            }}>
              <div style={popupRow}>
                <label style={popupLbl}>Email Address</label>
                <input name="email" type="email" required className="ark-input" style={popupInp} placeholder="your.email@example.com" />
              </div>
              <div style={{ ...popupRow, marginBottom: "8px" }}>
                <label style={popupLbl}>Password</label>
                <input name="password" type="password" required className="ark-input" style={popupInp} placeholder="Enter your password" />
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", background: LIGHT_GREEN, color: "white", border: "none", borderRadius: "7px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: "10px", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}>Login</button>

              {/* Cancel button */}
              <button type="button" onClick={() => setShowLoginPopup(false)} className="cancel-btn"
                style={{ width: "100%", padding: "10px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "7px", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: "12px", transition: "background 0.2s" }}>
                Cancel
              </button>

              <p style={{ textAlign: "center", color: "#6A8A66", fontSize: 12, margin: 0 }}>
                Don't have an account?{" "}
                <span onClick={() => { setShowLoginPopup(false); setShowSignupPopup(true); }}
                  style={{ color: LIGHT_GREEN, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Sign up here</span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SIGNUP POPUP — cream bg, watermark, no Age field, compact, Cancel
      ═══════════════════════════════════════════════════════════════════ */}
      {showSignupPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, pointerEvents: "all" }}>
          <div style={{ background: CREAM, padding: "24px 28px 20px", borderRadius: "14px", width: "90%", maxWidth: "480px", border: `2px solid ${GOLD}60`, boxShadow: "0 8px 40px rgba(0,0,0,0.35)", maxHeight: "92vh", overflowY: "auto", position: "relative", overflow: "hidden" }}>

            {/* Watermark */}
            <img src="/ark-logo.png" alt="" style={popupWatermark} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", position: "relative", zIndex: 1 }}>
              <img src="/ark-logo.png" alt="ARK" style={{ width: "36px", height: "36px", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: NAVY }}>ARK Law AI</div>
                <div style={{ fontSize: 10, color: "#5A7A56" }}>Create your free account — 500,000 credits</div>
              </div>
            </div>

            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)`, marginBottom: "16px" }} />

            <form style={{ position: "relative", zIndex: 1 }} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              try {
                const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email"), password: formData.get("password"), name: formData.get("name"), profession: formData.get("profession"), barOfPractice: formData.get("barOfPractice"), city: formData.get("city"), province: formData.get("province"), country: formData.get("country") }) });
                const data = await res.json();
                if (res.ok) {
                  setShowSignupPopup(false);
                  alert("Account created! You have been awarded 500,000 FREE credits! Please login.");
                  setShowLoginPopup(true);
                } else { alert(data.error || "Signup failed. Please try again."); }
              } catch (error) { alert("Signup failed: " + error.message); }
            }}>
              {/* Row 1: Email */}
              <div style={popupRow}><label style={popupLbl}>Email *</label><input name="email" type="email" required className="ark-input" style={popupInp} placeholder="your.email@example.com" /></div>
              {/* Row 2: Password */}
              <div style={popupRow}><label style={popupLbl}>Password * (min 6 chars)</label><input name="password" type="password" required minLength={6} className="ark-input" style={popupInp} placeholder="Minimum 6 characters" /></div>
              {/* Row 3: Name */}
              <div style={popupRow}><label style={popupLbl}>Full Name *</label><input name="name" type="text" required className="ark-input" style={popupInp} placeholder="Your full name" /></div>
              {/* Row 4: Profession (full width, no age) */}
              <div style={popupRow}><label style={popupLbl}>Profession *</label>
                <select name="profession" required className="ark-input" style={{ ...popupInp, cursor: "pointer", background: CREAM }}>
                  <option value="">Select profession...</option>
                  <option>Lawyer</option><option>Legal Assistant</option><option>Paralegal</option>
                  <option>Law Clerk</option><option>Court Researcher</option><option>Law Student</option><option>Judge</option>
                </select>
              </div>
              {/* Row 5: Bar + City side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "11px" }}>
                <div><label style={popupLbl}>Bar of Practice</label><input name="barOfPractice" type="text" className="ark-input" style={popupInp} placeholder="e.g., Punjab Bar" /></div>
                <div><label style={popupLbl}>City *</label><input name="city" type="text" required className="ark-input" style={popupInp} placeholder="e.g., Lahore" /></div>
              </div>
              {/* Row 6: Province + Country side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div><label style={popupLbl}>Province *</label><input name="province" type="text" required className="ark-input" style={popupInp} placeholder="e.g., Punjab" /></div>
                <div><label style={popupLbl}>Country *</label><input name="country" type="text" required defaultValue="Pakistan" className="ark-input" style={popupInp} /></div>
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", background: LIGHT_GREEN, color: "white", border: "none", borderRadius: "7px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: "8px", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}>
                Create Account — 500,000 Free Credits ✨
              </button>

              {/* Cancel button */}
              <button type="button" onClick={() => setShowSignupPopup(false)} className="cancel-btn"
                style={{ width: "100%", padding: "9px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "7px", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: "10px", transition: "background 0.2s" }}>
                Cancel
              </button>

              <p style={{ textAlign: "center", color: "#6A8A66", fontSize: 11, margin: 0 }}>
                Already have an account?{" "}
                <span onClick={() => { setShowSignupPopup(false); setShowLoginPopup(true); }}
                  style={{ color: LIGHT_GREEN, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Login here</span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          FORGOT PASSWORD POPUP — same cream + watermark scheme
      ═══════════════════════════════════════════════════════════════════ */}
      {showMyAccountPopup && user && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, pointerEvents: "all" }}>
          <div style={{ background: CREAM, borderRadius: "16px", width: "90%", maxWidth: "680px", border: `2px solid ${GOLD}60`, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 12px 48px rgba(0,0,0,0.4)", position: "relative", overflow: "hidden" }}>

            {/* Watermark */}
            <img src="/ark-logo.png" alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0, width: "260px", height: "260px" }} />

            {/* Header */}
            <div style={{ padding: "22px 28px 18px", borderBottom: `1px solid ${GOLD}40`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "42px", height: "42px", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: NAVY }}>ARK Law AI</div>
                  <div style={{ fontSize: 11, color: "#5A7A56" }}>My Account</div>
                </div>
              </div>
              <button onClick={() => setShowMyAccountPopup(false)} style={{ background: "none", border: "none", color: "#6A8A66", fontSize: 22, cursor: "pointer", lineHeight: 1, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = NAVY} onMouseLeave={(e) => e.currentTarget.style.color = "#6A8A66"}>✕</button>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)`, flexShrink: 0 }} />

            {/* Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>

              {/* LEFT — user info */}
              <div style={{ flex: "0 0 55%", padding: "24px 28px", overflowY: "auto", borderRight: `1px solid ${GOLD}30` }}>

                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}, ${ACCENT_PK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: NAVY, flexShrink: 0 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: NAVY, fontSize: 17, fontWeight: 700, fontFamily: "Georgia,serif" }}>{user.name}</div>
                    <div style={{ color: "#6A8A66", fontSize: 11, marginTop: "2px" }}>{user.email}</div>
                  </div>
                </div>

                {/* Token balance card */}
                <div style={{ background: "#EDE8DF", border: `1px solid ${GOLD}50`, borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" }}>
                  <div style={{ fontSize: 10, color: "#5A7A56", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>⚡ Credit Balance</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Progress bar */}
                    <div style={{ flex: 1, height: "8px", background: "#D8D0C0", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.max(2, (userTokens / 500000) * 100)}%`, background: userTokens > 100000 ? LIGHT_GREEN : userTokens > 20000 ? GOLD : "#E74C3C", borderRadius: "4px", transition: "width 0.4s ease" }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, whiteSpace: "nowrap", fontFamily: "Georgia,serif" }}>
                      {userTokens.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#7A9A76", marginTop: "5px" }}>
                    {Math.round((userTokens / 500000) * 100)}% remaining of 500,000 credits
                  </div>
                </div>

                {/* Account details */}
                <div style={{ background: "#EDE8DF", border: `1px solid ${GOLD}30`, borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
                  <div style={{ fontSize: 10, color: "#5A7A56", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Account Details</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {[
                      { label: "Profession",     value: user.profession },
                      user.barOfPractice && { label: "Bar of Practice", value: user.barOfPractice },
                      { label: "City",           value: user.city },
                      { label: "Province",       value: user.province },
                      { label: "Country",        value: user.country },
                    ].filter(Boolean).map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${GOLD}20`, paddingBottom: "6px" }}>
                        <span style={{ fontSize: 10, color: "#7A9A76", textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</span>
                        <span style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                <button onClick={() => {
                  localStorage.removeItem("arklaw_user");
                  setUser(null);
                  setUserTokens(500000);
                  setShowMyAccountPopup(false);
                }} style={{ width: "100%", padding: "12px", background: "#C0392B", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#A93226"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#C0392B"}>
                  🚪 Logout
                </button>
              </div>

              {/* RIGHT — chat sessions */}
              <div style={{ flex: "0 0 45%", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GOLD}30`, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 You & ARK LAW Sessions</div>
                  <div style={{ fontSize: 10, color: "#7A9A76", marginTop: "3px" }}>This session's conversations</div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                  {allSessions.filter(s => s.messages.filter(m => m.role === "user").length > 0).length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#8A9A86" }}>
                      <div style={{ fontSize: 36, marginBottom: "10px", opacity: 0.5 }}>💬</div>
                      <div style={{ fontSize: 12 }}>No conversations yet</div>
                      <div style={{ fontSize: 10, marginTop: "4px" }}>Start asking questions!</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {allSessions.filter(s => s.messages.filter(m => m.role === "user").length > 0).map((session) => (
                        <div key={session.id} onClick={() => { loadSession(session.id); setShowMyAccountPopup(false); }}
                          style={{ background: "#EDE8DF", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${GOLD}25`, cursor: "pointer", transition: "all 0.18s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#E4DDD0"; e.currentTarget.style.borderColor = GOLD; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#EDE8DF"; e.currentTarget.style.borderColor = `${GOLD}25`; }}>
                          <div style={{ color: NAVY, fontSize: 12, lineHeight: 1.4, marginBottom: "4px", fontWeight: 600 }}>{session.title}</div>
                          <div style={{ color: "#7A9A76", fontSize: 10 }}>{session.messages.filter(m => m.role === "user").length} message(s)</div>
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

      {/* ══════════════════════════════════════════════════════════════════
          FEATURES POPUP
      ═══════════════════════════════════════════════════════════════════ */}
      {showFeaturesPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, pointerEvents: "all" }}>
          <div style={{ background: CREAM, borderRadius: "16px", width: "92%", maxWidth: "560px", maxHeight: "92vh", overflowY: "auto", border: `2px solid ${GOLD}60`, boxShadow: "0 12px 48px rgba(0,0,0,0.4)", position: "relative", display: "flex", flexDirection: "column" }}>

            {/* Watermark */}
            <img src="/ark-logo.png" alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0, width: "260px", height: "260px" }} />

            {/* ── Header ── */}
            <div style={{ padding: "22px 28px 16px", borderBottom: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: CREAM, zIndex: 2, borderRadius: "16px 16px 0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "38px", height: "38px", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: "0.5px" }}>FEATURES</div>
                  <div style={{ fontSize: 10, color: "#5A7A56" }}>ARK Law AI Platform</div>
                </div>
              </div>
              <button onClick={() => setShowFeaturesPopup(false)}
                style={{ background: "none", border: "none", color: "#6A8A66", fontSize: 22, cursor: "pointer", lineHeight: 1, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = NAVY}
                onMouseLeave={(e) => e.currentTarget.style.color = "#6A8A66"}>✕</button>
            </div>

            {/* Gold divider */}
            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)`, flexShrink: 0 }} />

            {/* ── Body ── */}
            <div style={{ padding: "22px 28px", position: "relative", zIndex: 1, flex: 1 }}>

              {/* Headline & subtext */}
              <div style={{ marginBottom: "24px", textAlign: "center" }}>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: "8px", lineHeight: 1.3 }}>
                  Powerful AI Tools for Legal Professionals
                </h2>
                <p style={{ fontSize: 13, color: "#5A7A56", lineHeight: 1.6, margin: 0 }}>
                  Streamline research, drafting, and case strategy<br />with one intelligent platform.
                </p>
              </div>

              {/* Gold divider */}
              <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}60, transparent)`, marginBottom: "22px" }} />

              {/* Feature cards */}
              {[
                {
                  icon: "🔍", title: "Legal Research Assistant",
                  points: ["Case law summaries", "Statute lookup", "Precedent identification"],
                },
                {
                  icon: "📝", title: "Smart Drafting Engine",
                  points: ["Contracts, petitions, notices", "Clause suggestions", "Format consistency"],
                },
                {
                  icon: "⚖️", title: "Case Analysis Tool",
                  points: ["Argument structuring", "Risk insights", "Strategy suggestions"],
                },
                {
                  icon: "🤖", title: "AI Legal Chat",
                  points: ["Ask legal questions", "Context-aware responses"],
                },
                {
                  icon: "📊", title: "Productivity Dashboard",
                  points: ["Usage insights", "Saved drafts"],
                },
              ].map(({ icon, title, points }, idx) => (
                <div key={title} style={{ display: "flex", gap: "14px", marginBottom: idx < 4 ? "18px" : "0", padding: "14px 16px", background: "white", borderRadius: "10px", border: `1px solid ${GOLD}25`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  {/* Icon circle */}
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}10)`, border: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>
                    {icon}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: "6px" }}>{title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {points.map(pt => (
                        <div key={pt} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: LIGHT_GREEN, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#4A6A56", lineHeight: 1.4 }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Gold divider */}
              <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}60, transparent)`, margin: "22px 0" }} />

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
                <button onClick={() => setShowComingSoon(true)}
                  style={{ flex: 1, padding: "12px", background: LIGHT_GREEN, color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Georgia,serif", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = LG_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.background = LIGHT_GREEN}>
                  Explore Platform
                </button>
                <button onClick={() => setShowComingSoon(true)}
                  style={{ flex: 1, padding: "12px", background: "white", color: NAVY, border: `2px solid ${GOLD}60`, borderRadius: "8px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Georgia,serif", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}15`; e.currentTarget.style.borderColor = GOLD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = `${GOLD}60`; }}>
                  Request Demo
                </button>
              </div>

              {/* Footer note */}
              <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
                <span style={{ fontSize: 11, color: "#7A9A76", fontStyle: "italic", fontFamily: "Georgia,serif" }}>
                  "Built for Pakistan's Legal Ecosystem"
                </span>
              </div>

              {/* Gold divider */}
              <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD}60, transparent)`, margin: "14px 0 16px" }} />

              {/* Close button */}
              <button onClick={() => setShowFeaturesPopup(false)} className="cancel-btn"
                style={{ width: "100%", padding: "11px", background: "#EDE8DF", color: "#5A6A55", border: `1px solid ${GOLD}40`, borderRadius: "8px", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showComingSoon && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000 }} onClick={() => setShowComingSoon(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0D1B2A", borderRadius: "16px", padding: "48px 40px", maxWidth: "420px", width: "90%", textAlign: "center", border: "2px solid #C9A84C", boxShadow: "0 0 60px rgba(201,168,76,0.35), 0 0 120px rgba(201,168,76,0.12)", position: "relative" }}>
            <button onClick={() => setShowComingSoon(false)} style={{ position: "absolute", top: "16px", right: "18px", background: "none", border: "none", color: "#C9A84C", fontSize: 26, cursor: "pointer", lineHeight: 1, transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(90deg)"} onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(0deg)"}>✕</button>
            <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "72px", height: "72px", marginBottom: "18px", filter: "drop-shadow(0 0 16px rgba(201,168,76,0.6))" }} />
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#C9A84C", marginBottom: "6px", letterSpacing: "1px", textShadow: "0 0 20px rgba(201,168,76,0.5)" }}>ARK LAW AI</div>
            <div style={{ fontSize: 11, color: "#3EB489", marginBottom: "28px", fontStyle: "italic" }}>Pakistan's Legal Intelligence Engine</div>
            <div style={{ height: "1px", background: "linear-gradient(to right, transparent, #C9A84C, transparent)", marginBottom: "28px" }} />
            <div style={{ fontSize: 28, marginBottom: "12px" }}>🚀</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#FAF6EE", marginBottom: "10px" }}>Coming Very Soon!</div>
            <div style={{ fontSize: 13, color: "#B8C4D0", lineHeight: 1.7, marginBottom: "28px" }}>We're working hard to bring you something amazing.<br/><span style={{ color: "#C9A84C", fontWeight: 600 }}>Please stay tuned.</span></div>
            <div style={{ height: "1px", background: "linear-gradient(to right, transparent, #C9A84C, transparent)", marginBottom: "24px" }} />
            <button onClick={() => setShowComingSoon(false)} style={{ padding: "11px 40px", background: "linear-gradient(135deg, #C9A84C, #FFD700)", color: "#0D1B2A", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.5px", boxShadow: "0 4px 16px rgba(201,168,76,0.4)", transition: "transform 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              ⚖️ Got it!
            </button>
          </div>
        </div>
      )}

    </>
  );
}
