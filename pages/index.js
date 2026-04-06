import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const GOLD = "#C9A84C";
const NAVY = "#0D1B2A";
const NAVY_MID = "#162032";
const NAVY_SURFACE = "#1E2D40";
const NAVY_BORDER = "#2B3F57";
const ACCENT_PK = "#3EB489";
const TEXT_PRIMARY = "#FAF6EE";
const TEXT_SECONDARY = "#B8C4D0";
const TEXT_MUTED = "#6E8099";
const CREAM = "#F5F1E8";
const POPUP_DARK = "#0A1118";

export default function App() {
  const [user, setUser] = useState(null);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showMyAccountPopup, setShowMyAccountPopup] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userTokens, setUserTokens] = useState(500000);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [nameAsked, setNameAsked] = useState(false);
  const [sidebarOpen, setOpenSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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
  const [draftStep, setDraftStep] = useState("type-selection");
  const [draftRequirements, setDraftRequirements] = useState({});
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [doc1, setDoc1] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [compareFocus, setCompareFocus] = useState("");
  const [comparisonResult, setComparisonResult] = useState("");
  const [comparingDocs, setComparingDocs] = useState(false);
  const [showLinkedInPopup, setShowLinkedInPopup] = useState(false);
  const messagesEndRef = useRef(null);
  const lastSavedCountRef = useRef(0);

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

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "Welcome to ARK Law AI - Your trusted legal companion for Pakistani law.\n\nHow may I assist you today?",
    };
    setMessages([greeting]);
    setNameAsked(true);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('arklaw_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        if (userData.tokens !== undefined) setUserTokens(userData.tokens);
        if (userData.chatHistory && userData.chatHistory.length > 0) setChatHistory(userData.chatHistory);
      } catch (e) { console.error('Failed to parse user data'); }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user && messages.length > 1) {
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length > lastSavedCountRef.current) {
        const newMessages = userMessages.slice(lastSavedCountRef.current);
        if (newMessages.length > 0) {
          const newHistory = newMessages.map((msg) => ({
            id: Date.now() + Math.random(),
            question: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
            timestamp: new Date().toISOString(),
          }));
          const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
          const mergedHistory = [...existingHistory, ...newHistory].slice(-50);
          localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(mergedHistory));
          setChatHistory(mergedHistory);
          lastSavedCountRef.current = userMessages.length;
        }
      }
    }
  }, [messages, user]);

  useEffect(() => {
    if (user) {
      const history = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
      setChatHistory(history);
      const userMessages = messages.filter(m => m.role === 'user');
      lastSavedCountRef.current = userMessages.length;
    }
  }, [user]);

  useEffect(() => { fetchNewsHeadlines(); }, []);

  const newsDatabase = [
    { headline: "🇵🇰 Supreme Court of Pakistan Ruling on Constitutional Rights", source: "Supreme Court of Pakistan Official Records", fullText: "The Supreme Court of Pakistan has issued a landmark ruling reaffirming citizens' fundamental rights under Articles 9 and 14 of the Constitution. The judgment emphasizes that all individuals have the right to life, liberty, and dignity. This ruling applies to all provincial and federal courts and establishes important precedent for cases involving human rights violations. The court also directed the government to ensure compliance across all institutions." },
    { headline: "🇵🇰 New Tax Amendment Affects Business Sector", source: "Federal Board of Revenue (FBR)", fullText: "The Federal Board of Revenue has announced new amendments to the Income Tax Ordinance, 2001, effective immediately. Key changes include: (1) Modified tax rates for small and medium enterprises, (2) Enhanced deductions for research and development, (3) Stricter compliance requirements for corporate entities. Businesses are advised to consult with tax professionals to ensure compliance. The FBR has set a grace period of 30 days for voluntary compliance." },
    { headline: "🇵🇰 Family Court Interprets Guardianship Laws", source: "District Court - Family Division", fullText: "In a significant judgment, the Family Court has clarified provisions of the Guardians and Wards Act, 1890. The court ruled that guardianship decisions must prioritize the best interests of the child above all considerations. The judgment emphasizes that courts must conduct thorough investigations, hear all parties, and consider the child's wishes in guardianship matters. This ruling affects all guardianship petitions pending in courts across Pakistan." },
    { headline: "🇵🇰 Labour Ministry Issues New Worker Protection Guidelines", source: "Ministry of Labour, Employment & Manpower", fullText: "The Labour Ministry has issued comprehensive guidelines under the Workers' Compensation Act for improved worker protection. New provisions include: (1) Enhanced compensation for workplace injuries, (2) Mandatory insurance coverage for all workers, (3) Faster claim processing mechanisms. Employers must comply within 60 days. Non-compliance may result in penalties and legal action. Workers can file complaints through the ministry's online portal." },
    { headline: "🇵🇰 High Court Decision on Property Disputes", source: "Lahore High Court - Civil Division", fullText: "The Lahore High Court has established important guidelines for resolving property disputes under the Transfer of Property Act, 1882. The judgment clarifies that possession must be clearly established through documentary evidence, witness testimony, or adverse possession principles. Courts are directed to expedite property cases to reduce pending litigation. The ruling also addresses issues of land grabbing and unlawful occupation." },
    { headline: "🇵🇰 Procedural Changes in Criminal Courts", source: "Supreme Judicial Council", fullText: "New procedural rules have been implemented in criminal courts across Pakistan to expedite trials under the Code of Criminal Procedure, 1898. Changes include: (1) Mandatory video conferencing for witness examination, (2) Electronic filing of documents, (3) Stricter time limits for adjournments. These reforms aim to reduce case backlogs and ensure speedy justice. All courts must implement these procedures immediately." }
  ];

  const fetchNewsHeadlines = async () => { setNewsItems(newsDatabase.map(item => item.headline)); };

  const sendMessage = async (msg = null, skipNameCheck = false) => {
    const userMessage = msg || input;
    if (!userMessage.trim() && uploadedFiles.length === 0) return;
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) setUserTokens(prev => Math.max(0, prev - tokensToDeduct));
    let fileContents = [];
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          if (file.type.startsWith('image/')) {
            const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
            fileContents.push({ type: 'image', name: file.name, data: base64 });
          } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
            const text = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsText(file); });
            fileContents.push({ type: 'text', name: file.name, data: text });
          } else {
            fileContents.push({ type: 'document', name: file.name, size: file.size, message: `[Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Content extraction not yet supported.]` });
          }
        } catch (error) { console.error('Error reading file:', error); }
      }
    }
    let messageContent = userMessage.trim();
    if (fileContents.length > 0) {
      messageContent += "\n\n📎 Attached Files:\n";
      fileContents.forEach(file => {
        if (file.type === 'text') messageContent += `\n--- ${file.name} ---\n${file.data}\n`;
        else if (file.type === 'document') messageContent += `\n${file.message}\n`;
        else if (file.type === 'image') messageContent += `\n[Image: ${file.name}]\n`;
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
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: updatedMessages }) });
      if (!res.ok) throw new Error("Failed to get response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try { const parsed = JSON.parse(data); if (parsed.content) { accumulatedContent += parsed.content; setMessages(prev => { const newMessages = [...prev]; newMessages[streamingMessageIndex] = { role: "assistant", content: accumulatedContent }; return newMessages; }); } } catch (e) {}
          }
        }
      }
      setLoading(false);
      if (user) {
        const historyItem = { id: Date.now() + Math.random(), question: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''), timestamp: new Date().toISOString() };
        const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
        const updatedHistory = [...existingHistory, historyItem].slice(-50);
        localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedHistory));
        setChatHistory(updatedHistory);
      }
    } catch (error) {
      setMessages((prev) => { const newMessages = [...prev]; newMessages[streamingMessageIndex] = { role: "assistant", content: `❌ Error: ${error.message}. Please try again.` }; return newMessages; });
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Voice recognition not supported. Please use Chrome or Edge.'); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = (event) => { setIsListening(false); if (event.error === 'no-speech') alert('No speech detected.'); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const speakText = (text, messageIndex) => {
    if (isSpeaking && currentSpeakingIndex === messageIndex) { window.speechSynthesis.cancel(); setIsSpeaking(false); setCurrentSpeakingIndex(null); return; }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[•\n]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85; utterance.pitch = 1.1; utterance.volume = 1.0; utterance.lang = 'en-IN';
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => (v.lang.includes('en-IN') || v.lang.includes('en-PK')) && (v.name.toLowerCase().includes('female') || v.name.includes('Heera') || v.name.includes('Swara'))) || voices.find(v => v.name.includes('Veena') || v.name.includes('Heera') || v.name.includes('Swara') || v.name.includes('Neerja')) || voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('male')) || voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')) || voices.find(v => v.name.includes('Microsoft Zira')) || voices.find(v => v.name.includes('Google US English Female')) || voices.find(v => v.lang.includes('en'));
      if (femaleVoice) utterance.voice = femaleVoice;
    };
    setVoice();
    if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.onvoiceschanged = setVoice;
    utterance.onstart = () => { setIsSpeaking(true); setCurrentSpeakingIndex(messageIndex); };
    utterance.onend = () => { setIsSpeaking(false); setCurrentSpeakingIndex(null); };
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
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }) });
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
    if (doc1.size > maxSize) { alert(`Document 1 is too large. Maximum size is 5MB.`); return; }
    if (doc2.size > maxSize) { alert(`Document 2 is too large. Maximum size is 5MB.`); return; }
    setComparingDocs(true); setComparisonResult("");
    try {
      const readFileAsBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      const doc1Base64 = await readFileAsBase64(doc1);
      const doc2Base64 = await readFileAsBase64(doc2);
      const getMediaType = (filename) => { const ext = filename.toLowerCase().split('.').pop(); if (ext === 'pdf') return 'application/pdf'; if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; return 'application/msword'; };
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: getMediaType(doc1.name), data: doc1Base64 } }, { type: "document", source: { type: "base64", media_type: getMediaType(doc2.name), data: doc2Base64 } }, { type: "text", text: `Compare these two documents with focal point: "${compareFocus}". Provide a comprehensive comparison report covering key differences, similarities, legal implications under Pakistani law, risk assessment, and recommendations.` }] }] }) });
      if (!res.ok) { const errorData = await res.json().catch(() => ({})); if (res.status === 413) throw new Error(`Files are too large. Try compressing the PDFs (max 5MB each).`); throw new Error(errorData.error || `API returned status ${res.status}`); }
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ARK_Document_Comparison_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>ARK Law AI - Document Comparison Report</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;color:#000;max-width:800px;margin:0 auto;padding:20px;}.header{text-align:center;border-bottom:3px solid #C9A84C;padding-bottom:20px;margin-bottom:30px;}.header h1{color:#0D1B2A;font-size:24pt;}.content{white-space:pre-wrap;text-align:justify;}.footer{margin-top:50px;padding-top:20px;border-top:2px solid #C9A84C;text-align:center;font-size:9pt;color:#666;}</style></head><body><div class="header"><h1>ARK LAW AI</h1><h2>LEGAL DOCUMENT COMPARISON REPORT</h2></div><div class="content">${comparisonResult.replace(/\n/g, '<br>')}</div><div class="footer"><p>Generated by ARK Law AI</p></div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const openConductSource = (conduct) => {
    const newWindow = window.open("", "_blank", "width=900,height=700");
    newWindow.document.write(`<!DOCTYPE html><html><head><title>${conduct.title} - ARK Law AI</title></head><body style="font-family:Segoe UI,sans-serif;background:#F5F1E8;margin:0;"><div style="background:#0D1B2A;padding:20px;border-bottom:3px solid #C9A84C;display:flex;align-items:center;gap:15px;"><img src="/ark-logo.png" width="40" height="40"/><div><div style="color:#C9A84C;font-size:20px;font-weight:700;">ARK Law AI</div></div></div><div style="padding:10px 20px;background:#162032;border-bottom:1px solid #2B3F57;display:flex;gap:10px;"><button onclick="window.print()" style="padding:8px 16px;background:#C9A84C;color:#0D1B2A;border:none;border-radius:4px;cursor:pointer;font-weight:600;">🖨️ Print</button><button onclick="window.close()" style="padding:8px 16px;background:#C9A84C;color:#0D1B2A;border:none;border-radius:4px;cursor:pointer;font-weight:600;">✕ Close</button></div><div style="padding:40px;max-width:800px;margin:0 auto;"><div style="background:white;padding:30px;border-radius:8px;border-left:5px solid #C9A84C;"><h2 style="color:#0D1B2A;border-bottom:2px solid #3EB489;padding-bottom:10px;">${conduct.title}</h2><p style="font-size:16px;line-height:1.8;">${conduct.text}</p><div style="background:#f5f5f5;padding:15px;border-left:3px solid #3EB489;margin-top:20px;"><strong>Source:</strong> <a href="${conduct.source}" target="_blank" style="color:#3EB489;">${conduct.source}</a></div></div></div></body></html>`);
  };

  const openLinkInNewWindow = (url) => {
    const newWindow = window.open("", "_blank", "width=900,height=700");
    newWindow.document.write(`<!DOCTYPE html><html><head><title>ARK Law AI - Link Viewer</title></head><body style="margin:0;font-family:Segoe UI,sans-serif;"><div style="background:#0D1B2A;padding:20px;border-bottom:2px solid #C9A84C;display:flex;align-items:center;gap:15px;"><img src="/ark-logo.png" width="40" height="40"/><h1 style="color:#C9A84C;margin:0;font-size:20px;">ARK Law AI - Link Viewer</h1></div><div style="background:#162032;padding:15px 20px;border-bottom:1px solid #2B3F57;display:flex;gap:10px;"><button onclick="window.print()" style="padding:8px 16px;background:#C9A84C;color:#0D1B2A;border:none;border-radius:4px;cursor:pointer;font-weight:600;">🖨️ Print</button><button onclick="history.back()" style="padding:8px 16px;background:#C9A84C;color:#0D1B2A;border:none;border-radius:4px;cursor:pointer;font-weight:600;">⬅️ Go Back</button><button onclick="window.close()" style="padding:8px 16px;background:#C9A84C;color:#0D1B2A;border:none;border-radius:4px;cursor:pointer;font-weight:600;">✕ Close</button></div><div style="padding:20px;"><iframe src="${url}" frameborder="0" style="width:100%;height:calc(100vh - 150px);border:1px solid #2B3F57;border-radius:4px;background:white;"></iframe></div></body></html>`);
  };

  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let currentParagraph = [];
    const parseMarkdown = (text) => {
      const parts = []; let remaining = text; let key = 0;
      while (remaining.length > 0) {
        const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/);
        if (boldItalicMatch) { parts.push(<strong key={key++} style={{ fontStyle: 'italic' }}>{boldItalicMatch[1]}</strong>); remaining = remaining.slice(boldItalicMatch[0].length); continue; }
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
      const imageMatch = trimmedLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      const urlMatch = trimmedLine.match(/^(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))$/i);
      if (imageMatch || urlMatch) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>{parseMarkdown(currentParagraph.join(' '))}</p>); currentParagraph = []; }
        const imgUrl = imageMatch ? imageMatch[2] : urlMatch[1];
        const imgAlt = imageMatch ? imageMatch[1] : 'Image';
        elements.push(<div key={`img-${index}`} style={{ marginBottom: '16px', marginTop: '16px' }}><img src={imgUrl} alt={imgAlt} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: `2px solid ${GOLD}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onError={(e) => { e.target.style.display = 'none'; }} /></div>);
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>{parseMarkdown(currentParagraph.join(' '))}</p>); currentParagraph = []; }
        elements.push(<div key={`bullet-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px', lineHeight: '1.6' }}><span style={{ color: GOLD, fontWeight: 'bold', flexShrink: 0 }}>•</span><span>{parseMarkdown(trimmedLine.substring(1).trim())}</span></div>);
      } else if (trimmedLine.length > 0 && ((trimmedLine.startsWith('***') && trimmedLine.endsWith('***')) || (trimmedLine.endsWith(':') && trimmedLine.length < 60))) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>{parseMarkdown(currentParagraph.join(' '))}</p>); currentParagraph = []; }
        elements.push(<h3 key={`h-${index}`} style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#0D1B2A', marginTop: '16px', marginBottom: '8px', fontSize: '15px' }}>{trimmedLine.replace(/^\*\*\*|\*\*\*$/g, '')}</h3>);
      } else if (trimmedLine.length === 0) {
        if (currentParagraph.length > 0) { elements.push(<p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>{parseMarkdown(currentParagraph.join(' '))}</p>); currentParagraph = []; }
      } else { currentParagraph.push(trimmedLine); }
    });
    if (currentParagraph.length > 0) elements.push(<p key="p-final" style={{ marginBottom: '12px', lineHeight: '1.6' }}>{parseMarkdown(currentParagraph.join(' '))}</p>);
    return <div style={{ whiteSpace: 'normal' }}>{elements}</div>;
  };

  return (
    <>
      <Head>
        <title>ARK Law AI — Pakistan Legal Intelligence Engine by Khawer Rabbani</title>
        <meta name="description" content="ARK Law AI: Expert AI legal assistant for Pakistani law." />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; margin: 0; padding: 0; }
        #__next { height: 100%; overflow: hidden; }


        @keyframes glow { 0%, 100% { box-shadow: 0 0 15px rgba(201,168,76,0.5); } 50% { box-shadow: 0 0 25px rgba(201,168,76,0.8); } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 12px rgba(201,168,76,0.7); transform: scale(1); } 50% { box-shadow: 0 0 20px rgba(255,215,0,0.9); transform: scale(1.02); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        @media (max-width: 768px) { .desktop-only { display: none; } }

        /* ── Law Animation Strip ── */
        @keyframes lawScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .law-anim-track { animation: lawScroll 28s linear infinite; display: flex; align-items: center; gap: 0; width: max-content; will-change: transform; }
        .law-anim-track:hover { animation-play-state: paused; }

        @keyframes scalesBob  { 0%,100%{ transform:translateY(0) rotate(-2deg); } 50%{ transform:translateY(-3px) rotate(2deg); } }
        @keyframes hammerSwing{ 0%,100%{ transform:rotate(0deg) translateX(0); } 40%{ transform:rotate(-28deg) translateX(2px); } 70%{ transform:rotate(8deg) translateX(-1px); } }
        @keyframes scrollUnroll{ 0%{ clip-path:inset(0 100% 0 0); opacity:0; } 60%{ opacity:1; } 100%{ clip-path:inset(0 0% 0 0); opacity:1; } }
        @keyframes aiPulseRing { 0%,100%{ transform:scale(1);   opacity:0.7; } 50%{ transform:scale(1.18); opacity:1; } }
        @keyframes brainSpark  { 0%,100%{ filter:drop-shadow(0 0 2px #C9A84C); } 50%{ filter:drop-shadow(0 0 8px #FFD700); } }
        @keyframes gavel3d     { 0%,100%{ transform:rotateZ(0deg) rotateY(0deg); } 35%{ transform:rotateZ(-35deg) rotateY(20deg); } 65%{ transform:rotateZ(10deg) rotateY(-10deg); } }
        @keyframes floatDoc    { 0%,100%{ transform:translateY(0) rotate(-1deg); } 50%{ transform:translateY(-4px) rotate(1deg); } }
        @keyframes neonBlink   { 0%,100%{ opacity:1; } 45%,55%{ opacity:0.4; } }
        @keyframes orbitDot    { 0%{ transform:rotate(0deg)   translateX(12px) rotate(0deg);   } 100%{ transform:rotate(360deg) translateX(12px) rotate(-360deg); } }
        @keyframes typeCursor  { 0%,100%{ opacity:1; } 50%{ opacity:0; } }
        @keyframes pillPulse   { 0%,100%{ transform:scaleX(1);   } 50%{ transform:scaleX(1.06); } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: "Segoe UI, Tahoma, sans-serif", overflow: "hidden" }}>

        {/* ═══════════════════════════════════════════════════════
            HEADER
            LEFT: Logo  |  CENTER: Contact email  |  RIGHT: Flag + Lang + Auth
        ════════════════════════════════════════════════════════ */}
        <header style={{ background: CREAM, padding: "8px 20px", borderBottom: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>

          {/* LEFT - LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/ark-logo.png" alt="ARK" style={{ width: "48px", height: "48px" }} />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: NAVY }}>ARK Law AI</div>
              <div style={{ fontSize: 10, color: NAVY }}>The Legal Intelligence Engine</div>
              <div style={{ fontSize: 9, color: GOLD, fontStyle: "italic", marginTop: "2px" }}>میرا فاضل دوست</div>
              <div onClick={() => setShowLinkedInPopup(true)} style={{ fontSize: 8, color: ACCENT_PK, cursor: "pointer", textDecoration: "underline", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = NAVY} onMouseLeave={(e) => e.currentTarget.style.color = ACCENT_PK}>
                by Attorney & AI Innovator Khawer Rabbani
              </div>
            </div>
          </div>

          {/* CENTER - Scrolling Law Animation Strip */}
          <div style={{ flex: 1, overflow: "hidden", margin: "0 16px", height: "48px", display: "flex", alignItems: "center", borderRadius: "8px", border: `1px solid ${GOLD}50`, background: `linear-gradient(135deg, ${NAVY}08, ${GOLD}08)` }}>
            <div className="law-anim-track">
              {/* Render items twice for seamless infinite loop */}
              {[0, 1].map(copyIdx => (
                <div key={copyIdx} style={{ display: "flex", alignItems: "center", gap: "0" }}>

                  {/* ① Scales of Justice */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" style={{ animation:"scalesBob 2.4s ease-in-out infinite", flexShrink:0 }}>
                      <line x1="16" y1="4" x2="16" y2="28" stroke={GOLD} strokeWidth="1.5"/>
                      <line x1="6" y1="10" x2="26" y2="10" stroke={GOLD} strokeWidth="1.5"/>
                      <ellipse cx="16" cy="4" rx="2" ry="2" fill={GOLD}/>
                      <path d="M6 10 L2 19 Q6 22 10 19 Z" fill="none" stroke={GOLD} strokeWidth="1.2"/>
                      <path d="M26 10 L22 19 Q26 22 30 19 Z" fill="none" stroke={GOLD} strokeWidth="1.2"/>
                      <line x1="10" y1="28" x2="22" y2="28" stroke={GOLD} strokeWidth="2"/>
                    </svg>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Justice & Balance</span>
                  </div>

                  {/* ② AI Brain Pulse */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <div style={{ position:"relative", width:30, height:30, flexShrink:0 }}>
                      <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`1.5px solid ${ACCENT_PK}`, animation:"aiPulseRing 2s ease-in-out infinite" }}/>
                      <div style={{ position:"absolute", inset:4, borderRadius:"50%", border:`1px solid ${GOLD}`, animation:"aiPulseRing 2s ease-in-out infinite 0.3s" }}/>
                      <svg width="30" height="30" viewBox="0 0 30 30" style={{ position:"absolute", inset:0, animation:"brainSpark 2s ease-in-out infinite" }}>
                        <text x="15" y="20" textAnchor="middle" fontSize="14" fill={NAVY}>⚖</text>
                      </svg>
                    </div>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>AI Legal Intelligence</span>
                  </div>

                  {/* ③ Gavel Strike */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" style={{ animation:"hammerSwing 1.8s ease-in-out infinite", transformOrigin:"28px 28px", flexShrink:0 }}>
                      <rect x="4" y="4" width="14" height="8" rx="2" fill={NAVY} stroke={GOLD} strokeWidth="1.2"/>
                      <line x1="14" y1="12" x2="24" y2="24" stroke={NAVY} strokeWidth="4" strokeLinecap="round"/>
                      <line x1="14" y1="12" x2="24" y2="24" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
                      <line x1="4" y1="28" x2="22" y2="28" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Court Proceedings</span>
                  </div>

                  {/* ④ Scrolling Document */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <svg width="26" height="32" viewBox="0 0 26 32" style={{ animation:"floatDoc 2.2s ease-in-out infinite", flexShrink:0 }}>
                      <rect x="2" y="2" width="22" height="28" rx="3" fill="white" stroke={GOLD} strokeWidth="1.5"/>
                      <rect x="2" y="2" width="22" height="6" rx="3" fill={NAVY}/>
                      <line x1="6" y1="14" x2="20" y2="14" stroke={GOLD} strokeWidth="1.2"/>
                      <line x1="6" y1="18" x2="20" y2="18" stroke={NAVY_BORDER} strokeWidth="1"/>
                      <line x1="6" y1="22" x2="16" y2="22" stroke={NAVY_BORDER} strokeWidth="1"/>
                      <circle cx="21" cy="26" r="3" fill={ACCENT_PK}/>
                      <text x="21" y="28" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">✓</text>
                    </svg>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Legal Documents</span>
                  </div>

                  {/* ⑤ Pakistani Law Badge */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:NAVY, display:"flex", alignItems:"center", justifyContent:"center", animation:"pillPulse 2s ease-in-out infinite", flexShrink:0, border:`2px solid ${GOLD}` }}>
                      <span style={{ fontSize:14 }}>🇵🇰</span>
                    </div>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Pakistani Law</span>
                  </div>

                  {/* ⑥ AI Orbiting Node */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <div style={{ position:"relative", width:30, height:30, flexShrink:0 }}>
                      <div style={{ position:"absolute", inset:8, borderRadius:"50%", background:NAVY, border:`2px solid ${GOLD}` }}/>
                      <div style={{ position:"absolute", top:"50%", left:"50%", marginTop:-15, marginLeft:-15, width:30, height:30 }}>
                        <div style={{ position:"absolute", top:"50%", left:"50%", width:6, height:6, marginTop:-3, marginLeft:-3, borderRadius:"50%", background:ACCENT_PK, animation:"orbitDot 1.6s linear infinite" }}/>
                      </div>
                    </div>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Smart Analysis</span>
                  </div>

                  {/* ⑦ Constitution Scroll */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <svg width="26" height="32" viewBox="0 0 26 32" style={{ animation:"floatDoc 2.8s ease-in-out infinite 0.4s", flexShrink:0 }}>
                      <path d="M4 4 Q4 2 6 2 L22 2 Q24 2 24 4 L24 28 Q24 30 22 30 L6 30 Q4 30 4 28 Z" fill={CREAM} stroke={GOLD} strokeWidth="1.5"/>
                      <path d="M4 6 Q2 6 2 8 L2 28 Q2 30 4 30" fill="none" stroke={GOLD} strokeWidth="1.5"/>
                      <line x1="8" y1="10" x2="20" y2="10" stroke={NAVY} strokeWidth="1.2"/>
                      <line x1="8" y1="14" x2="20" y2="14" stroke={NAVY} strokeWidth="1"/>
                      <line x1="8" y1="18" x2="17" y2="18" stroke={NAVY} strokeWidth="1"/>
                      <text x="13" y="27" textAnchor="middle" fontSize="6" fill={GOLD} fontWeight="bold">آئین</text>
                    </svg>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Constitution 1973</span>
                  </div>

                  {/* ⑧ Typing AI */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 22px", borderRight:`1px solid ${GOLD}30` }}>
                    <div style={{ background:NAVY, borderRadius:6, padding:"4px 8px", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <span style={{ fontSize:9, color:GOLD, fontFamily:"monospace", letterSpacing:1 }}>ARK</span>
                      <span style={{ width:1.5, height:12, background:GOLD, display:"inline-block", animation:"typeCursor 1s step-end infinite" }}/>
                    </div>
                    <span style={{ fontSize:10, color:NAVY, fontWeight:600, whiteSpace:"nowrap" }}>Drafting Docs</span>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - Language + Auth buttons */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

            {/* Language toggles */}
            <button style={{ padding: "5px 10px", background: NAVY, color: CREAM, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>EN</button>
            <button style={{ padding: "5px 10px", background: "transparent", color: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", cursor: "pointer", fontSize: 10, opacity: 0.4 }} title="Urdu — Coming Soon">اردو</button>

            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: NAVY_BORDER, margin: "0 2px", opacity: 0.4 }} />

            {/* Auth: Login / Signup OR token + name + My Account */}
            {!user ? (
              <>
                <button onClick={() => setShowLoginPopup(true)} style={{ padding: "6px 14px", background: "transparent", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: "4px", cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s", whiteSpace: "nowrap" }} onMouseEnter={(e) => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = CREAM; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = NAVY; }}>
                  Login
                </button>
                <button onClick={() => setShowSignupPopup(true)} style={{ padding: "6px 14px", background: `linear-gradient(135deg, ${GOLD}, #FFD700)`, color: NAVY, border: `1px solid ${GOLD}`, borderRadius: "4px", cursor: "pointer", fontSize: 11, fontWeight: 700, animation: "glowPulse 2s infinite", whiteSpace: "nowrap", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                  ✨ Sign Up Free
                </button>
              </>
            ) : (
              <>
                {/* Token Counter (compact) */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "6px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: `conic-gradient(${GOLD} ${(userTokens/500000)*100}%, ${NAVY_BORDER} 0%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: NAVY_SURFACE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", fontWeight: 700, color: GOLD }}>{Math.round((userTokens/500000)*100)}%</div>
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: GOLD, whiteSpace: "nowrap" }}>{userTokens.toLocaleString()}</div>
                </div>
                <div style={{ padding: "5px 10px", background: `linear-gradient(135deg, ${ACCENT_PK}, #2D9B6E)`, color: "white", border: `1px solid ${ACCENT_PK}`, borderRadius: "4px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                  👤 {user.name}
                </div>
                <button onClick={() => setShowMyAccountPopup(true)} style={{ padding: "5px 10px", background: GOLD, color: NAVY, border: `1px solid ${GOLD}`, borderRadius: "4px", cursor: "pointer", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
                  My Account
                </button>
              </>
            )}
          </div>
        </header>

        {/* BODY */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ═══ LEFT SIDEBAR ═══ */}
          {!isMobile && (
            <div style={{ width: "200px", background: CREAM, borderRight: `1px solid ${GOLD}40`, padding: "8px", display: "flex", flexDirection: "column", gap: "0", overflow: "hidden" }}>

              {/* ── Photos (compact) ── */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "6px", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <img src="/jinnah.jpeg" alt="Jinnah" style={{ width: "36px", height: "36px", borderRadius: "50%", border: `2px solid ${ACCENT_PK}` }} />
                  <div style={{ fontSize: 6, color: ACCENT_PK, fontWeight: 600, marginTop: "2px" }}>FOUNDER OF PAKISTAN</div>
                  <div style={{ fontSize: 5, color: TEXT_MUTED }}>Quaid-e-Azam M. A. Jinnah</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <img src="/rabbani.jpeg" alt="Justice Rabbani" style={{ width: "36px", height: "36px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  <div style={{ fontSize: 6, color: ACCENT_PK, fontWeight: 600, marginTop: "2px" }}>HON. JUSTICE</div>
                  <div style={{ fontSize: 5, color: TEXT_MUTED }}>S. A. Rabbani</div>
                  <div style={{ fontSize: 5, color: ACCENT_PK, fontStyle: "italic" }}>Inspiration for ARK LAW AI</div>
                </div>
              </div>

              {/* ── 3 MINI TOOL CARDS (50% smaller = horizontal row style) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>

                {/* Analyze */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 7px", background: "white", borderRadius: "6px", border: `1px solid ${GOLD}`, cursor: "pointer", transition: "all 0.2s", boxShadow: `0 1px 4px ${GOLD}20` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}15`; e.currentTarget.style.boxShadow = `0 2px 8px ${GOLD}50`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = `0 1px 4px ${GOLD}20`; }}
                >
                  <div style={{ width: "22px", height: "22px", flexShrink: 0, background: "linear-gradient(135deg, #4A90E2, #6B5CE7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>📂</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: NAVY, fontWeight: 700, lineHeight: 1.2 }}>Analyze Docs</div>
                    <label style={{ fontSize: 7, color: ACCENT_PK, cursor: "pointer", whiteSpace: "nowrap" }}>
                      Upload ↑
                      <input type="file" accept=".pdf,.docx,.doc" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) alert("Feature coming soon: Document analysis"); }} />
                    </label>
                  </div>
                </div>

                {/* Compare */}
                <div onClick={() => setShowComparePopup(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 7px", background: "white", borderRadius: "6px", border: `1px solid ${GOLD}`, cursor: "pointer", transition: "all 0.2s", boxShadow: `0 1px 4px ${GOLD}20` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}15`; e.currentTarget.style.boxShadow = `0 2px 8px ${GOLD}50`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = `0 1px 4px ${GOLD}20`; }}
                >
                  <div style={{ width: "22px", height: "22px", flexShrink: 0, background: "linear-gradient(135deg, #4A90E2, #6B5CE7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>⚖️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: NAVY, fontWeight: 700, lineHeight: 1.2 }}>Compare Docs</div>
                    <div style={{ fontSize: 7, color: ACCENT_PK }}>Upload 2 to compare</div>
                  </div>
                </div>

                {/* Draft */}
                <div onClick={() => setShowDraftPopup(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 7px", background: "white", borderRadius: "6px", border: `1px solid ${GOLD}`, cursor: "pointer", transition: "all 0.2s", boxShadow: `0 1px 4px ${GOLD}20` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}15`; e.currentTarget.style.boxShadow = `0 2px 8px ${GOLD}50`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = `0 1px 4px ${GOLD}20`; }}
                >
                  <div style={{ width: "22px", height: "22px", flexShrink: 0, background: "linear-gradient(135deg, #4A90E2, #6B5CE7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>✍️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: NAVY, fontWeight: 700, lineHeight: 1.2 }}>Draft Docs</div>
                    <div style={{ fontSize: 7, color: ACCENT_PK }}>Contracts, affidavits…</div>
                  </div>
                </div>
              </div>

              {/* ── DIVIDER ── */}
              <div style={{ height: "1px", background: `${GOLD}40`, margin: "6px 0", flexShrink: 0 }} />

              {/* ── CHAT HISTORY (like ChatGPT / Claude) ── */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Chats</span>
                  <button
                    onClick={() => {
                      setMessages([{ role: "assistant", content: "Welcome to ARK Law AI - Your trusted legal companion for Pakistani law.\n\nHow may I assist you today?" }]);
                    }}
                    style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 700 }}
                    title="New Chat"
                  >+ New</button>
                </div>

                {/* Chat instances list */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
                  {/* Current active chat */}
                  {messages.filter(m => m.role === "user").length > 0 ? (
                    <>
                      {/* Group messages into "sessions" — for now show each user message as a chat entry */}
                      <div style={{ fontSize: 8, color: TEXT_MUTED, padding: "2px 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Today</div>
                      {messages
                        .filter(m => m.role === "user")
                        .slice()
                        .reverse()
                        .slice(0, 20)
                        .map((msg, idx) => (
                          <div
                            key={idx}
                            title={msg.content}
                            style={{
                              padding: "5px 7px",
                              borderRadius: "5px",
                              background: idx === 0 ? `${GOLD}20` : "transparent",
                              border: idx === 0 ? `1px solid ${GOLD}50` : "1px solid transparent",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "5px",
                            }}
                            onMouseEnter={(e) => { if (idx !== 0) { e.currentTarget.style.background = `${NAVY}08`; e.currentTarget.style.borderColor = `${NAVY_BORDER}`; } }}
                            onMouseLeave={(e) => { if (idx !== 0) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                          >
                            <span style={{ fontSize: 9, flexShrink: 0, marginTop: "1px" }}>💬</span>
                            <span style={{ fontSize: 8, color: NAVY, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {msg.content.substring(0, 60)}{msg.content.length > 60 ? "…" : ""}
                            </span>
                          </div>
                        ))
                      }
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 8px", color: TEXT_MUTED }}>
                      <div style={{ fontSize: 20, marginBottom: "6px", opacity: 0.4 }}>💬</div>
                      <div style={{ fontSize: 8, lineHeight: 1.5 }}>Your chats will appear here. Start a conversation!</div>
                    </div>
                  )}

                  {/* Saved chat history from localStorage (logged-in users) */}
                  {chatHistory.length > 0 && messages.filter(m => m.role === "user").length === 0 && (
                    <>
                      <div style={{ fontSize: 8, color: TEXT_MUTED, padding: "2px 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginTop: "4px" }}>Previous</div>
                      {chatHistory.slice().reverse().slice(0, 15).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          title={item.question}
                          style={{ padding: "5px 7px", borderRadius: "5px", background: "transparent", border: "1px solid transparent", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: "5px" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = `${NAVY}08`; e.currentTarget.style.borderColor = NAVY_BORDER; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                        >
                          <span style={{ fontSize: 9, flexShrink: 0, marginTop: "1px" }}>🕒</span>
                          <span style={{ fontSize: 8, color: NAVY, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {item.question}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CHAT AREA ═══ */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: CREAM, position: "relative" }}>
            {/* Watermark */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.08, pointerEvents: "none", zIndex: 0 }}>
              <img src="/ark-logo.png" alt="ARK Watermark" style={{ width: "400px", height: "400px" }} />
            </div>

            {/* Messages — flex column-reverse so newest is at bottom, scrolls upward */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column-reverse", gap: "12px", position: "relative", zIndex: 1 }}>
              {/* Reverse-render so last message shows at bottom */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "10px" }}>
                    {msg.role === "assistant" && <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}`, flexShrink: 0 }} />}
                    <div style={{ maxWidth: "70%", position: "relative" }}>
                      <div style={{ padding: "10px 14px", borderRadius: "8px", background: msg.role === "user" ? GOLD : "white", color: msg.role === "user" ? NAVY : "#333", fontSize: 13, lineHeight: "1.4", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                        {renderMessageContent(msg.content)}
                      </div>
                      {msg.role === "assistant" && (
                        <button onClick={() => speakText(msg.content, i)} style={{ marginTop: "6px", padding: "5px 10px", background: currentSpeakingIndex === i ? ACCENT_PK : GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                          {currentSpeakingIndex === i ? "⏸️ Stop" : "🔊 Listen"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>ARK is thinking...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Uploaded files */}
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

            {/* Input */}
            <div style={{ padding: "12px 15px", borderTop: `1px solid ${NAVY_BORDER}`, display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={startVoiceInput} disabled={loading || isListening} style={{ padding: "9px 14px", background: isListening ? ACCENT_PK : NAVY_SURFACE, color: isListening ? NAVY : TEXT_PRIMARY, border: `1px solid ${isListening ? ACCENT_PK : NAVY_BORDER}`, borderRadius: "4px", cursor: loading || isListening ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 15, animation: isListening ? "pulse 1.5s infinite" : "none" }} title="Click to speak">{isListening ? "🎤 Listening..." : "🎤"}</button>
              <label htmlFor="file-upload" style={{ padding: "9px 14px", background: NAVY_SURFACE, color: TEXT_PRIMARY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center" }} onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}20`; e.currentTarget.style.borderColor = GOLD; }} onMouseLeave={(e) => { e.currentTarget.style.background = NAVY_SURFACE; e.currentTarget.style.borderColor = NAVY_BORDER; }} title="Upload files">
                📎
                <input id="file-upload" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => { const files = Array.from(e.target.files); if (files.length > 0) { setUploadedFiles(prev => [...prev, ...files]); alert(files.length + ' file(s) uploaded: ' + files.map(f => f.name).join(', ')); } }} style={{ display: "none" }} />
              </label>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder={isListening ? "Listening..." : uploadedFiles.length > 0 ? `Ask about your ${uploadedFiles.length} attached file(s)...` : "Ask ARK Law AI or click mic to speak..."} style={{ flex: 1, padding: "9px 12px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 13 }} />
              <button onClick={() => sendMessage()} disabled={loading || isListening} style={{ padding: "9px 18px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: loading || isListening ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, opacity: loading || isListening ? 0.5 : 1 }}>SEND</button>
            </div>
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          {!isMobile && (
            <div style={{ width: "200px", background: CREAM, borderLeft: `1px solid ${GOLD}40`, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* ── CARD: Upgrade to Pro (50% smaller, horizontal) ── */}
              <div onClick={() => setShowUpgradePopup(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 7px", background: "white", borderRadius: "6px", border: `1px solid ${GOLD}`, cursor: "pointer", transition: "all 0.2s", boxShadow: `0 1px 4px ${GOLD}20`, flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}15`; e.currentTarget.style.boxShadow = `0 2px 8px ${GOLD}50`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = `0 1px 4px ${GOLD}20`; }}
              >
                <div style={{ width: "22px", height: "22px", flexShrink: 0, background: "linear-gradient(135deg, #4A90E2, #6B5CE7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>✨</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: NAVY, fontWeight: 700, lineHeight: 1.2 }}>Upgrade to Pro</div>
                  <div style={{ fontSize: 7, color: ACCENT_PK }}>Faster AI & more tools</div>
                </div>
                <div style={{ fontSize: 7, padding: "2px 5px", background: `linear-gradient(135deg, ${GOLD}, #FFD700)`, borderRadius: "3px", color: NAVY, fontWeight: 700, flexShrink: 0 }}>GO PRO</div>
              </div>

              {/* Quick Queries */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: GOLD, marginBottom: "7px", textAlign: "center" }}>💬 QUICK LEGAL QUERIES</div>
                {QUICK_QUERIES_PK.map((query, i) => (
                  <button key={i} onClick={() => sendMessage(query, true)} style={{ display: "block", width: "100%", padding: "7px 8px", background: "white", border: `1px solid ${NAVY_BORDER}`, color: NAVY, cursor: "pointer", marginBottom: "5px", borderRadius: "4px", fontSize: 9, textAlign: "left", lineHeight: "1.4", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = NAVY; }} onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = NAVY_BORDER; e.currentTarget.style.color = NAVY; }}>{query}</button>
                ))}
              </div>

              {/* Practice Areas */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: GOLD, marginBottom: "6px" }}>⚖️ PRACTICE AREAS</div>
                {PRACTICE_AREAS_PK.map((area) => (
                  <button key={area.id} onClick={() => sendMessage(`Tell me about ${area.label} in Pakistan`, true)} style={{ display: "block", width: "100%", padding: "5px 7px", background: "white", border: `1px solid ${NAVY_BORDER}`, color: NAVY, cursor: "pointer", marginBottom: "3px", borderRadius: "4px", fontSize: 9, textAlign: "left", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = NAVY; }} onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = NAVY; }}>
                    {area.icon} {area.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ background: NAVY_MID, borderTop: `1px solid ${NAVY_BORDER}`, color: TEXT_SECONDARY, padding: "8px 20px", flexShrink: 0 }}>
          <div style={{ maxWidth: "1600px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1", minWidth: "180px" }}>
              <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "20px", height: "20px", opacity: 0.85 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "9px", color: GOLD, fontStyle: "italic", lineHeight: "1.3" }}>Dedicated to the Legacy of Hon. Justice S. A. Rabbani, Legendary Jurist of Pakistan</span>
                <a href="mailto:contact@arklaw.ai" style={{ fontSize: "9px", color: ACCENT_PK, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = GOLD} onMouseLeave={(e) => e.currentTarget.style.color = ACCENT_PK}>
                  <span style={{ color: TEXT_MUTED }}>Contact us:</span> 📧 contact@arklaw.ai
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              {["Features", "About Us", "Docs", "Contact"].map((link) => (
                <span key={link} style={{ fontSize: "10px", color: TEXT_MUTED, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = GOLD} onMouseLeave={(e) => e.currentTarget.style.color = TEXT_MUTED}>{link}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1", justifyContent: "flex-end", minWidth: "180px" }}>
              <span style={{ fontSize: "9px", color: TEXT_MUTED }}>© 2025 ARK Lex AI LLC. All rights reserved.</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href="https://twitter.com/arklawai" target="_blank" rel="noopener noreferrer" style={{ color: TEXT_MUTED, fontSize: "13px", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = GOLD} onMouseLeave={(e) => e.currentTarget.style.color = TEXT_MUTED}>🐦</a>
                <a href="https://linkedin.com/company/arklawai" target="_blank" rel="noopener noreferrer" style={{ color: TEXT_MUTED, fontSize: "13px", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = GOLD} onMouseLeave={(e) => e.currentTarget.style.color = TEXT_MUTED}>💼</a>
                <a href="https://github.com/arklawai" target="_blank" rel="noopener noreferrer" style={{ color: TEXT_MUTED, fontSize: "13px", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = GOLD} onMouseLeave={(e) => e.currentTarget.style.color = TEXT_MUTED}>💻</a>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* ═══ POPUPS ═══ */}

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
              <div style={{ height: "1px", background: NAVY_BORDER, margin: "15px 0" }}></div>
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "8px" }}>Full News Details:</h4>
                <p style={{ color: TEXT_PRIMARY, fontSize: 13, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{selectedNews.fullText}</p>
              </div>
              <div style={{ height: "1px", background: NAVY_BORDER, margin: "15px 0" }}></div>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, borderRadius: "12px", width: "90%", maxWidth: "800px", maxHeight: "90vh", overflow: "auto", border: `3px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}50` }}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_MID})`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "40px", height: "40px" }} />
                <div><h3 style={{ color: GOLD, margin: 0, fontSize: 18 }}>✍️ AI Legal Document Drafting</h3><div style={{ color: ACCENT_PK, fontSize: 10, marginTop: "3px" }}>Powered by ARK Law AI - Pakistani Law Compliant</div></div>
              </div>
              <button onClick={() => { setShowDraftPopup(false); setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "25px" }}>
              {draftStep === "type-selection" && (
                <div>
                  <h4 style={{ color: GOLD, fontSize: 15, marginBottom: "15px", fontWeight: 700 }}>📋 Step 1: Select Document Type</h4>
                  <select value={draftType} onChange={(e) => setDraftType(e.target.value)} style={{ width: "100%", padding: "12px", background: NAVY, border: `2px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "6px", marginBottom: "20px", fontSize: 13, cursor: "pointer" }}>
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
                  <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", borderLeft: `4px solid ${ACCENT_PK}`, marginBottom: "20px" }}>
                    <div style={{ color: ACCENT_PK, fontSize: 11, fontWeight: 600, marginBottom: "8px" }}>ℹ️ How It Works:</div>
                    <div style={{ color: TEXT_SECONDARY, fontSize: 11, lineHeight: "1.6" }}>1. Select the document type<br/>2. Provide required information<br/>3. AI generates a complete, court-ready document<br/>4. Edit and download in Word or PDF format</div>
                  </div>
                  <button onClick={() => { if (!draftType) { alert("Please select a document type"); return; } setDraftStep("gathering-info"); }} disabled={!draftType} style={{ width: "100%", padding: "14px", background: draftType ? `linear-gradient(135deg, ${GOLD}, #E5C887)` : NAVY_BORDER, color: NAVY, border: "none", borderRadius: "6px", cursor: draftType ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14 }}>Next: Provide Information →</button>
                </div>
              )}
              {draftStep === "gathering-info" && (
                <div>
                  <h4 style={{ color: GOLD, fontSize: 15, marginBottom: "8px", fontWeight: 700 }}>📝 Step 2: Provide Document Information</h4>
                  <p style={{ color: TEXT_MUTED, fontSize: 11, marginBottom: "20px" }}>Fill in the details below. AI will generate a complete Pakistani legal document.</p>
                  <div style={{ maxHeight: "400px", overflowY: "auto", padding: "5px" }}>
                    {draftType === "rental-agreement" && (
                      <div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>🏠 Landlord Information</h5>
                          <input placeholder="Landlord Full Name *" onChange={(e) => setDraftRequirements({...draftRequirements, landlordName: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Landlord CNIC Number *" onChange={(e) => setDraftRequirements({...draftRequirements, landlordCNIC: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Landlord Complete Address *" onChange={(e) => setDraftRequirements({...draftRequirements, landlordAddress: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>👤 Tenant Information</h5>
                          <input placeholder="Tenant Full Name *" onChange={(e) => setDraftRequirements({...draftRequirements, tenantName: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Tenant CNIC Number *" onChange={(e) => setDraftRequirements({...draftRequirements, tenantCNIC: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Tenant Complete Address *" onChange={(e) => setDraftRequirements({...draftRequirements, tenantAddress: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>🏘️ Property Details</h5>
                          <input placeholder="Property Complete Address *" onChange={(e) => setDraftRequirements({...draftRequirements, propertyAddress: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Property Type (House/Flat/Commercial) *" onChange={(e) => setDraftRequirements({...draftRequirements, propertyType: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Covered Area (sq ft/marla/kanal) *" onChange={(e) => setDraftRequirements({...draftRequirements, propertyArea: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>💰 Rental Terms</h5>
                          <input placeholder="Monthly Rent Amount (PKR) *" onChange={(e) => setDraftRequirements({...draftRequirements, monthlyRent: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Security Deposit (PKR) *" onChange={(e) => setDraftRequirements({...draftRequirements, securityDeposit: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Lease Duration (e.g., 1 year, 11 months) *" onChange={(e) => setDraftRequirements({...draftRequirements, leaseDuration: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Rent Payment Date (e.g., 1st of each month) *" onChange={(e) => setDraftRequirements({...draftRequirements, paymentDate: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Notice Period (e.g., 1 month) *" onChange={(e) => setDraftRequirements({...draftRequirements, noticePeriod: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                      </div>
                    )}
                    {draftType === "affidavit" && (
                      <div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>⚖️ Deponent Information</h5>
                          <input placeholder="Deponent Full Name *" onChange={(e) => setDraftRequirements({...draftRequirements, deponentName: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="CNIC Number *" onChange={(e) => setDraftRequirements({...draftRequirements, deponentCNIC: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Father's/Husband's Name *" onChange={(e) => setDraftRequirements({...draftRequirements, deponentFatherName: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Complete Address *" onChange={(e) => setDraftRequirements({...draftRequirements, deponentAddress: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>📋 Affidavit Details</h5>
                          <input placeholder="Purpose of Affidavit *" onChange={(e) => setDraftRequirements({...draftRequirements, purpose: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <textarea placeholder="Facts to be stated under oath *" onChange={(e) => setDraftRequirements({...draftRequirements, facts: e.target.value})} style={{ width: "100%", height: "120px", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12, fontFamily: "Arial, sans-serif" }} />
                          <input placeholder="Authority/Court where to be filed *" onChange={(e) => setDraftRequirements({...draftRequirements, authority: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                      </div>
                    )}
                    {draftType === "nda" && (
                      <div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>📤 Disclosing Party</h5>
                          <input placeholder="Party Name *" onChange={(e) => setDraftRequirements({...draftRequirements, disclosingParty: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Address *" onChange={(e) => setDraftRequirements({...draftRequirements, disclosingAddress: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>📥 Receiving Party</h5>
                          <input placeholder="Party Name *" onChange={(e) => setDraftRequirements({...draftRequirements, receivingParty: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12 }} />
                          <input placeholder="Address *" onChange={(e) => setDraftRequirements({...draftRequirements, receivingAddress: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>🔒 Confidentiality Terms</h5>
                          <textarea placeholder="Nature of Confidential Information *" onChange={(e) => setDraftRequirements({...draftRequirements, confidentialInfo: e.target.value})} style={{ width: "100%", height: "80px", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12, fontFamily: "Arial, sans-serif" }} />
                          <input placeholder="Duration of Confidentiality (e.g., 3 years) *" onChange={(e) => setDraftRequirements({...draftRequirements, duration: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                      </div>
                    )}
                    {!["rental-agreement", "affidavit", "nda"].includes(draftType) && (
                      <div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>📋 Document Information</h5>
                          <textarea placeholder={`Provide all necessary details for ${draftType}:\n\n• Party names and addresses\n• Terms and conditions\n• Duration/timeline\n• Special clauses\n• Any other relevant information`} onChange={(e) => setDraftRequirements({...draftRequirements, generalInfo: e.target.value})} style={{ width: "100%", height: "250px", padding: "12px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12, fontFamily: "Arial, sans-serif", lineHeight: "1.6" }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button onClick={() => setDraftStep("type-selection")} style={{ flex: 1, padding: "12px", background: NAVY_SURFACE, color: TEXT_PRIMARY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "6px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
                    <button onClick={() => generateDocument(draftRequirements)} disabled={draftGenerating} style={{ flex: 2, padding: "12px", background: draftGenerating ? NAVY_BORDER : `linear-gradient(135deg, ${ACCENT_PK}, #2D9B6E)`, color: draftGenerating ? TEXT_MUTED : "white", border: "none", borderRadius: "6px", cursor: draftGenerating ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14 }}>{draftGenerating ? "⏳ Generating Document..." : "🚀 Generate Document with AI"}</button>
                  </div>
                </div>
              )}
              {draftStep === "generating" && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <img src="/ark-logo.png" alt="ARK" style={{ width: "80px", height: "80px", marginBottom: "20px", opacity: 0.8, animation: "pulse 2s infinite" }} />
                  <h4 style={{ color: GOLD, fontSize: 16, marginBottom: "15px", fontWeight: 700 }}>⏳ Generating Your Legal Document...</h4>
                  <p style={{ color: TEXT_SECONDARY, fontSize: 13, lineHeight: "1.6" }}>Our AI is drafting a comprehensive, Pakistani law-compliant document.</p>
                  <div style={{ marginTop: "20px", padding: "15px", background: NAVY, borderRadius: "6px", border: `1px solid ${GOLD}30` }}>
                    <div style={{ color: ACCENT_PK, fontSize: 11, marginBottom: "8px" }}>✓ Analyzing requirements</div>
                    <div style={{ color: ACCENT_PK, fontSize: 11, marginBottom: "8px" }}>✓ Applying Pakistani legal format</div>
                    <div style={{ color: ACCENT_PK, fontSize: 11, marginBottom: "8px" }}>✓ Including all necessary clauses</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>⏳ Finalizing document...</div>
                  </div>
                </div>
              )}
              {draftStep === "completed" && (
                <div>
                  <h4 style={{ color: GOLD, fontSize: 15, marginBottom: "8px", fontWeight: 700 }}>✅ Document Generated Successfully!</h4>
                  <p style={{ color: TEXT_MUTED, fontSize: 11, marginBottom: "15px" }}>Your {draftType} has been generated. Edit and download below.</p>
                  <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} style={{ width: "100%", height: "400px", padding: "15px", background: "white", border: `2px solid ${GOLD}`, color: "#000", borderRadius: "6px", marginBottom: "15px", fontSize: 13, fontFamily: "'Times New Roman', serif", lineHeight: "1.8", whiteSpace: "pre-wrap" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", padding: "10px", background: NAVY, borderRadius: "4px" }}>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>📝 Words: <span style={{ color: ACCENT_PK, fontWeight: 600 }}>{draftContent.split(/\s+/).filter(Boolean).length}</span></div>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>📊 Chars: <span style={{ color: ACCENT_PK, fontWeight: 600 }}>{draftContent.length}</span></div>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>📄 Pages: <span style={{ color: ACCENT_PK, fontWeight: 600 }}>{Math.ceil(draftContent.split(/\s+/).filter(Boolean).length / 500)}</span></div>
                  </div>
                  <div style={{ background: `${GOLD}15`, padding: "12px", borderRadius: "6px", borderLeft: `4px solid ${GOLD}`, marginBottom: "20px" }}>
                    <div style={{ color: GOLD, fontSize: 10, fontWeight: 600, marginBottom: "5px" }}>⚠️ IMPORTANT LEGAL DISCLAIMER</div>
                    <div style={{ color: TEXT_SECONDARY, fontSize: 10, lineHeight: "1.5" }}>This document is AI-generated for reference purposes only. Please have it reviewed by a qualified Pakistani lawyer before execution.</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => { setDraftStep("type-selection"); setDraftContent(""); setDraftRequirements({}); }} style={{ flex: 1, padding: "12px", background: NAVY_SURFACE, color: TEXT_PRIMARY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "6px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔄 New Document</button>
                    <button onClick={() => downloadDraft("docx")} style={{ flex: 1, padding: "12px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>📥 Download DOCX</button>
                    <button onClick={() => downloadDraft("pdf")} style={{ flex: 1, padding: "12px", background: `linear-gradient(135deg, ${GOLD}, #E5C887)`, color: NAVY, border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>📄 Download PDF</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showComparePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: POPUP_DARK, borderRadius: "12px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto", border: `2px solid ${GOLD}` }}>
            <div style={{ background: NAVY, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${NAVY_BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px" }} /><h3 style={{ color: GOLD, margin: 0 }}>⚖️ Compare Legal Documents</h3></div>
              <button onClick={() => setShowComparePopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 24, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ color: GOLD, fontSize: 12, fontWeight: 600, display: "block", marginBottom: "8px" }}>📄 Document 1</label>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setDoc1(e.target.files?.[0])} style={{ width: "100%", padding: "8px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 11 }} />
                {doc1 && <div style={{ marginTop: "5px", fontSize: 10, color: doc1.size > 5*1024*1024 ? "#ff6b6b" : ACCENT_PK }}>{doc1.name} - {(doc1.size / 1024 / 1024).toFixed(2)}MB {doc1.size > 5*1024*1024 && "⚠️ TOO LARGE (Max 5MB)"}</div>}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ color: GOLD, fontSize: 12, fontWeight: 600, display: "block", marginBottom: "8px" }}>📄 Document 2</label>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setDoc2(e.target.files?.[0])} style={{ width: "100%", padding: "8px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 11 }} />
                {doc2 && <div style={{ marginTop: "5px", fontSize: 10, color: doc2.size > 5*1024*1024 ? "#ff6b6b" : ACCENT_PK }}>{doc2.name} - {(doc2.size / 1024 / 1024).toFixed(2)}MB {doc2.size > 5*1024*1024 && "⚠️ TOO LARGE (Max 5MB)"}</div>}
              </div>
              <div style={{ marginBottom: "15px", padding: "10px", background: NAVY_SURFACE, borderRadius: "4px", borderLeft: `3px solid ${ACCENT_PK}` }}>
                <div style={{ fontSize: 10, color: TEXT_MUTED, lineHeight: "1.6" }}>ℹ️ <strong>Supported:</strong> PDF, DOC, DOCX (max 5MB each)<br/>✓ Scanned PDFs supported (OCR enabled)</div>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ color: GOLD, fontSize: 12, fontWeight: 600, display: "block", marginBottom: "8px" }}>🎯 Focal Point for Comparison</label>
                <input type="text" value={compareFocus} onChange={(e) => setCompareFocus(e.target.value)} placeholder="e.g., payment terms, liability clauses, termination conditions..." style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
              </div>
              {comparingDocs && <div style={{ marginBottom: "15px", padding: "20px", background: NAVY, borderRadius: "6px", border: `1px solid ${GOLD}`, textAlign: "center" }}><div style={{ color: GOLD, fontSize: 14, fontWeight: 600, marginBottom: "10px" }}>⏳ Analyzing Documents...</div><div style={{ color: TEXT_MUTED, fontSize: 11 }}>AI is comparing the documents</div></div>}
              {comparisonResult && !comparingDocs && <div style={{ marginBottom: "15px", padding: "15px", background: NAVY, borderRadius: "6px", border: `1px solid ${ACCENT_PK}` }}><div style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "10px" }}>📊 Comparison Report</div><div style={{ color: TEXT_PRIMARY, fontSize: 11, lineHeight: "1.6", whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto" }}>{comparisonResult}</div></div>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { setShowComparePopup(false); setDoc1(null); setDoc2(null); setCompareFocus(""); setComparisonResult(""); }} style={{ flex: 1, padding: "10px", background: NAVY_SURFACE, color: TEXT_PRIMARY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", cursor: "pointer", fontSize: 12 }}>Close</button>
                <button onClick={compareDocuments} disabled={comparingDocs} style={{ flex: 1, padding: "10px", background: comparingDocs ? NAVY_BORDER : GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: comparingDocs ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 12 }}>{comparingDocs ? "⏳ Analyzing..." : "🔍 Compare Documents"}</button>
                {comparisonResult && <button onClick={downloadComparisonPDF} style={{ flex: 1, padding: "10px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📄 Download PDF</button>}
              </div>
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
                <button onClick={() => window.open('/KRprofile.pdf', '_blank')} style={{ padding: "10px 20px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📄 Download Profile</button>
                <button onClick={() => setShowLinkedInPopup(false)} style={{ padding: "10px 20px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, padding: "35px", borderRadius: "12px", width: "90%", maxWidth: "450px", border: `3px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}50` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "45px", height: "45px" }} /><h2 style={{ color: GOLD, margin: 0, fontSize: "20px" }}>Login to ARK Law AI</h2></div>
              <button onClick={() => setShowLoginPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 26, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const email = formData.get('email'); const password = formData.get('password');
              try {
                const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
                const data = await res.json();
                if (!res.ok) { alert(data.error || 'Invalid email or password'); return; }
                const userWithoutPassword = data.user;
                localStorage.setItem('arklaw_user', JSON.stringify(userWithoutPassword));
                setUser(userWithoutPassword);
                setUserTokens(userWithoutPassword.tokens || 500000);
                if (userWithoutPassword.chatHistory && userWithoutPassword.chatHistory.length > 0) setChatHistory(userWithoutPassword.chatHistory);
                setShowLoginPopup(false);
                alert('Welcome back, ' + userWithoutPassword.name + '! You have ' + (userWithoutPassword.tokens?.toLocaleString() || '500,000') + ' credits.');
              } catch (error) { alert('Login failed. Please try again.'); }
            }}>
              <div style={{ marginBottom: "18px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Email Address</label><input name="email" type="email" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="your.email@example.com" /></div>
              <div style={{ marginBottom: "25px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Password</label><input name="password" type="password" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="Enter your password" /></div>
              <button type="submit" style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${GOLD}, #E5C887)`, color: NAVY, border: "none", borderRadius: "6px", fontWeight: 700, fontSize: 16, cursor: "pointer", marginBottom: "15px" }}>Login</button>
              <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 12 }}>Don't have an account? <span onClick={() => { setShowLoginPopup(false); setShowSignupPopup(true); }} style={{ color: ACCENT_PK, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Sign up here</span></p>
            </form>
          </div>
        </div>
      )}

      {showSignupPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "600px", border: `3px solid ${GOLD}`, maxHeight: "90vh", overflowY: "auto", boxShadow: `0 0 30px ${GOLD}50` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}><img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "50px", height: "50px" }} /><h2 style={{ color: GOLD, margin: 0, fontSize: "22px" }}>Join ARK Law AI</h2></div>
              <button onClick={() => setShowSignupPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              try {
                const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.get('email'), password: formData.get('password'), name: formData.get('name'), age: formData.get('age'), profession: formData.get('profession'), barOfPractice: formData.get('barOfPractice'), city: formData.get('city'), province: formData.get('province'), country: formData.get('country') }) });
                const data = await res.json();
                if (res.ok) { setShowSignupPopup(false); alert('Account created! You have been awarded 500,000 FREE credits! Please login.'); setShowLoginPopup(true); }
                else { alert(data.error || 'Signup failed. Please try again.'); }
              } catch (error) { alert('Signup failed. Please try again.'); }
            }}>
              <div style={{ marginBottom: "18px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Email Address (Username) *</label><input name="email" type="email" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="your.email@example.com" /></div>
              <div style={{ marginBottom: "18px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Password *</label><input name="password" type="password" required minLength={6} style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="Minimum 6 characters" /></div>
              <div style={{ marginBottom: "18px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Full Name *</label><input name="name" type="text" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} placeholder="Your full name" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Age *</label><input name="age" type="number" required min={18} max={100} style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} /></div>
                <div><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Profession *</label><select name="profession" required style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }}><option value="">Select...</option><option>Lawyer</option><option>Legal Assistant</option><option>Paralegal</option><option>Law Clerk</option><option>Court Researcher</option><option>Law Student</option><option>Judge</option></select></div>
              </div>
              <div style={{ marginBottom: "18px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Bar of Practice (Optional)</label><input name="barOfPractice" type="text" placeholder="e.g., Punjab Bar Council" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>City *</label><input name="city" type="text" required placeholder="e.g., Lahore" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} /></div>
                <div><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Province/State *</label><input name="province" type="text" required placeholder="e.g., Punjab" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} /></div>
              </div>
              <div style={{ marginBottom: "25px" }}><label style={{ color: GOLD, fontSize: 13, display: "block", marginBottom: "6px", fontWeight: 600 }}>Country *</label><input name="country" type="text" required defaultValue="Pakistan" style={{ width: "100%", padding: "12px", background: NAVY_SURFACE, border: `2px solid ${NAVY_BORDER}`, borderRadius: "6px", color: CREAM, fontSize: 14 }} /></div>
              <button type="submit" style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${ACCENT_PK}, #2D9B6E)`, color: "white", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Create Account</button>
              <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 12, marginTop: "15px" }}>Already have an account? <span onClick={() => { setShowSignupPopup(false); setShowLoginPopup(true); }} style={{ color: GOLD, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Login here</span></p>
            </form>
          </div>
        </div>
      )}

      {showMyAccountPopup && user && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, borderRadius: "12px", width: "90%", maxWidth: "1000px", border: `3px solid ${GOLD}`, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: `0 0 40px ${GOLD}50` }}>
            <div style={{ padding: "25px 35px", borderBottom: `2px solid ${NAVY_BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "50px", height: "50px", filter: `drop-shadow(0 0 10px ${GOLD}60)` }} />
                <div><h2 style={{ color: GOLD, margin: 0, fontSize: "22px", fontWeight: 700 }}>ARK Law AI</h2><p style={{ color: ACCENT_PK, margin: "4px 0 0 0", fontSize: "12px" }}>My Account</p></div>
              </div>
              <button onClick={() => setShowMyAccountPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              <div style={{ flex: "0 0 60%", padding: "30px", overflowY: "auto", borderRight: `2px solid ${NAVY_BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}, ${ACCENT_PK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 700, color: NAVY }}>{user.name.charAt(0).toUpperCase()}</div>
                  <div><h3 style={{ color: CREAM, margin: 0, fontSize: "24px", fontWeight: 700 }}>{user.name}</h3><p style={{ color: TEXT_MUTED, margin: "5px 0 0 0", fontSize: "12px" }}>⭐ Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                </div>
                <div style={{ background: NAVY_SURFACE, padding: "20px", borderRadius: "8px", marginBottom: "20px", border: `1px solid ${NAVY_BORDER}` }}>
                  <h4 style={{ color: ACCENT_PK, fontSize: 14, marginBottom: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Account Information</h4>
                  <div style={{ display: "grid", gap: "14px" }}>
                    <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Email Address</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.email}</div></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Age</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.age}</div></div>
                      <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Profession</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.profession}</div></div>
                    </div>
                    {user.barOfPractice && <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Bar of Practice</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.barOfPractice}</div></div>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>City</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.city}</div></div>
                      <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Province</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.province}</div></div>
                    </div>
                    <div><label style={{ color: TEXT_MUTED, fontSize: 10, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Country</label><div style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{user.country}</div></div>
                  </div>
                </div>
                <button onClick={() => { localStorage.removeItem('arklaw_user'); localStorage.removeItem(`chat_history_${user.id}`); setUser(null); setChatHistory([]); setShowMyAccountPopup(false); alert('You have been logged out successfully.'); }} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #DC2626, #991B1B)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}>🚪 Logout</button>
              </div>
              <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", background: NAVY_SURFACE }}>
                <div style={{ padding: "20px", borderBottom: `1px solid ${NAVY_BORDER}` }}>
                  <h4 style={{ color: GOLD, fontSize: 14, margin: 0, fontWeight: 700, textTransform: "uppercase" }}>📜 Chat History</h4>
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
                        <div key={item.id || idx} style={{ background: NAVY, padding: "12px", borderRadius: "6px", border: `1px solid ${NAVY_BORDER}`, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = `${NAVY}dd`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = NAVY_BORDER; e.currentTarget.style.background = NAVY; }}>
                          <div style={{ color: CREAM, fontSize: 12, lineHeight: "1.4", marginBottom: "6px" }}>{item.question}</div>
                          <div style={{ color: TEXT_MUTED, fontSize: 9, display: "flex", alignItems: "center", gap: "5px" }}><span>🕒</span>{new Date(item.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
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

      {showUpgradePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: NAVY, padding: "40px", borderRadius: "16px", width: "90%", maxWidth: "500px", border: `3px solid ${GOLD}`, boxShadow: `0 0 40px ${GOLD}60`, textAlign: "center", position: "relative" }}>
            <button onClick={() => setShowUpgradePopup(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: GOLD, fontSize: 32, cursor: "pointer", lineHeight: 1, transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(90deg)"; e.currentTarget.style.color = ACCENT_PK; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "rotate(0deg)"; e.currentTarget.style.color = GOLD; }}>✕</button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
              <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "100px", height: "100px", filter: `drop-shadow(0 0 20px ${GOLD}60)` }} />
              <h2 style={{ color: GOLD, margin: 0, fontSize: "32px", fontWeight: 800, letterSpacing: "1px" }}>ARK Law AI</h2>
            </div>
            <div style={{ width: "80px", height: "80px", margin: "0 auto 20px", background: "linear-gradient(135deg, #4A90E2, #6B5CE7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", boxShadow: "0 8px 20px rgba(74, 144, 226, 0.4)", animation: "pulse 2s infinite" }}>✨</div>
            <h3 style={{ color: CREAM, fontSize: "28px", fontWeight: 700, margin: "0 0 15px 0" }}>Upgrade to Pro</h3>
            <p style={{ color: TEXT_MUTED, fontSize: "16px", lineHeight: "1.6", marginBottom: "30px" }}>Get more tools, faster AI, and exclusive features</p>
            <div style={{ display: "inline-block", padding: "20px 40px", background: `linear-gradient(135deg, ${GOLD}, ${ACCENT_PK})`, borderRadius: "12px", boxShadow: `0 4px 20px ${GOLD}40` }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: NAVY, marginBottom: "5px" }}>🚀 COMING SOON</div>
              <div style={{ fontSize: "13px", color: `${NAVY}cc` }}>Stay tuned for exciting updates!</div>
            </div>
            <div style={{ marginTop: "30px", textAlign: "left", background: NAVY_SURFACE, padding: "20px", borderRadius: "10px", border: `1px solid ${NAVY_BORDER}` }}>
              <div style={{ color: GOLD, fontSize: "14px", fontWeight: 700, marginBottom: "15px" }}>✨ Pro Features:</div>
              {["Priority AI Response Time","Advanced Document Analysis","Unlimited Chat History","Export Chat as PDF","Premium Legal Templates","24/7 Priority Support"].map((feature, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: TEXT_MUTED, fontSize: "13px" }}><span style={{ color: ACCENT_PK, fontSize: "16px" }}>✓</span>{feature}</div>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
