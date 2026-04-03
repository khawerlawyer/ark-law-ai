import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const COLORS = {
  primary: "#5A7A3D",
  primaryLight: "#C4D600",
  background: "#F5F5F0",
  cardBg: "#FAFAF8",
  white: "#FFFFFF",
  text: { primary: "#2C3E1F", secondary: "#6B7C5E", muted: "#9CA89F" },
  gray: { 50: "#FAFAF8", 100: "#F5F5F0", 200: "#E8E8E0", 300: "#D4D4C8", 400: "#A8A89F", 500: "#7C7C73", 600: "#5C5C54", 700: "#3F3F38", 800: "#2C2C26", 900: "#1A1A16" },
  gold: "#C9A84C",
  navy: "#0D1B2A"
};

const GOLD = COLORS.gold;
const NAVY = COLORS.navy;
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
  // Auth state
  const [user, setUser] = useState(null);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showMyAccountPopup, setShowMyAccountPopup] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userTokens, setUserTokens] = useState(500000); // Starting tokens - 500K FREE!
  
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
  const [draftStep, setDraftStep] = useState("type-selection"); // type-selection, gathering-info, generating, completed
  const [draftRequirements, setDraftRequirements] = useState({});
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [doc1, setDoc1] = useState(null);
  
  // Voice functionality state
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

  const CONDUCT_PK = [
    { 
      text: "Maintain integrity and honesty in all professional dealings", 
      source: "https://www.pbc.org.pk/rules-and-regulations",
      title: "Professional Integrity - Pakistan Bar Council"
    },
    { 
      text: "Provide competent and ethical legal counsel", 
      source: "https://www.pbc.org.pk/code-of-conduct",
      title: "Competence & Ethics - Legal Practitioners Act"
    },
    { 
      text: "Protect client confidentiality and privilege", 
      source: "https://www.pbc.org.pk/rules-and-regulations",
      title: "Confidentiality Rules - Bar Council"
    },
    { 
      text: "Avoid conflicts of interest", 
      source: "https://www.pbc.org.pk/code-of-conduct",
      title: "Conflict of Interest - Professional Standards"
    },
    { 
      text: "Charge fair and reasonable fees", 
      source: "https://www.pbc.org.pk/rules-and-regulations",
      title: "Fee Guidelines - Pakistan Bar Council"
    },
    { 
      text: "Respect the rule of law and Constitution", 
      source: "https://www.supremecourt.gov.pk/",
      title: "Constitutional Obligations - Supreme Court"
    },
    { 
      text: "Promote access to justice for all", 
      source: "https://www.pbc.org.pk/",
      title: "Access to Justice - Bar Council Mission"
    },
    { 
      text: "Continue professional development and training", 
      source: "https://www.pbc.org.pk/",
      title: "CPD Requirements - Pakistan Bar Council"
    },
    { 
      text: "Treat opposing counsel with respect and courtesy", 
      source: "https://www.pbc.org.pk/code-of-conduct",
      title: "Professional Courtesy - Code of Conduct"
    },
    { 
      text: "Disclose material facts and evidence", 
      source: "https://www.pbc.org.pk/rules-and-regulations",
      title: "Disclosure Obligations - Bar Rules"
    },
    { 
      text: "Never mislead courts or clients", 
      source: "https://www.pbc.org.pk/code-of-conduct",
      title: "Truthfulness Standards - Professional Ethics"
    },
    { 
      text: "Uphold the honour and dignity of the profession", 
      source: "https://www.pbc.org.pk/",
      title: "Professional Honor - Pakistan Bar Council"
    },
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

  // Mobile detection
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-send greeting on mount
  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "Welcome to ARK Law AI - Your trusted legal companion for Pakistani law.\n\nHow may I assist you today?",
    };
    setMessages([greeting]);
    setNameAsked(true); // Always mark as asked - never ask for name
  }, []); // Only run once on mount

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('arklaw_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Load user's tokens
        if (userData.tokens !== undefined) {
          setUserTokens(userData.tokens);
        }
        
        // Load chat history
        if (userData.chatHistory && userData.chatHistory.length > 0) {
          setChatHistory(userData.chatHistory);
        }
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat history when NEW messages are added
  useEffect(() => {
    if (user && messages.length > 1) {
      const userMessages = messages.filter(m => m.role === 'user');
      
      // Only save if we have new messages
      if (userMessages.length > lastSavedCountRef.current) {
        const newMessages = userMessages.slice(lastSavedCountRef.current);
        
        if (newMessages.length > 0) {
          const newHistory = newMessages.map((msg) => ({
            id: Date.now() + Math.random(),
            question: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
            timestamp: new Date().toISOString(),
          }));
          
          // Load existing history and append new ones
          const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
          const mergedHistory = [...existingHistory, ...newHistory].slice(-50); // Keep last 50
          localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(mergedHistory));
          setChatHistory(mergedHistory);
          
          // Update the ref
          lastSavedCountRef.current = userMessages.length;
          
          console.log('✅ Saved chat history:', mergedHistory.length, 'items');
        }
      }
    }
  }, [messages, user]);

  // Load chat history when user logs in
  useEffect(() => {
    if (user) {
      const history = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
      setChatHistory(history);
      console.log('📜 Loaded chat history:', history.length, 'items');
      
      // Set initial count
      const userMessages = messages.filter(m => m.role === 'user');
      lastSavedCountRef.current = userMessages.length;
    }
  }, [user]);

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

  const sendMessage = async (msg = null, skipNameCheck = false) => {
    const userMessage = msg || input;
    if (!userMessage.trim() && uploadedFiles.length === 0) return;

    // Deduct tokens (estimate: ~100 tokens per message + 500 per file)
    const tokensToDeduct = 100 + (uploadedFiles.length * 500);
    if (userTokens > 0) {
      setUserTokens(prev => Math.max(0, prev - tokensToDeduct));
    }

    // Process uploaded files
    let fileContents = [];
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          // Read file as base64 for images
          if (file.type.startsWith('image/')) {
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            
            fileContents.push({
              type: 'image',
              name: file.name,
              data: base64
            });
          } 
          // Read text files
          else if (file.type.includes('text') || file.name.endsWith('.txt')) {
            const text = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsText(file);
            });
            
            fileContents.push({
              type: 'text',
              name: file.name,
              data: text
            });
          }
          // For PDFs and other documents
          else {
            fileContents.push({
              type: 'document',
              name: file.name,
              size: file.size,
              message: `[Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Content extraction not yet supported. Please describe what you need help with regarding this document.]`
            });
          }
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }
    }

    // Build user message content
    let messageContent = userMessage.trim();
    
    // Add file information to message
    if (fileContents.length > 0) {
      messageContent += "\n\n📎 Attached Files:\n";
      fileContents.forEach(file => {
        if (file.type === 'text') {
          messageContent += `\n--- ${file.name} ---\n${file.data}\n`;
        } else if (file.type === 'document') {
          messageContent += `\n${file.message}\n`;
        } else if (file.type === 'image') {
          messageContent += `\n[Image: ${file.name}]\n`;
        }
      });
    }

    const updatedMessages = [...messages, { role: "user", content: messageContent }];

    setMessages(updatedMessages);
    setInput("");
    setUploadedFiles([]); // Clear uploaded files after sending
    setLoading(true);

    // Add empty assistant message for streaming
    const streamingMessageIndex = updatedMessages.length;
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

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
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                // Update the message in real-time with streaming effect
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[streamingMessageIndex] = {
                    role: "assistant",
                    content: accumulatedContent
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setLoading(false);
      
      // Manually save to chat history if user is logged in
      if (user) {
        const historyItem = {
          id: Date.now() + Math.random(),
          question: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
          timestamp: new Date().toISOString(),
        };
        
        const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
        const updatedHistory = [...existingHistory, historyItem].slice(-50);
        localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedHistory));
        setChatHistory(updatedHistory);
        
        console.log('💾 Manually saved to history:', historyItem.question);
      }
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[streamingMessageIndex] = {
          role: "assistant",
          content: `❌ Error: ${error.message}. Please try again.`,
        };
        return newMessages;
      });
      setLoading(false);
    }
  };

  // Voice Input - Speech Recognition
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text-to-Speech - Read answer aloud with FEMALE PAKISTANI voice
  const speakText = (text, messageIndex) => {
    // Stop any current speech
    if (isSpeaking && currentSpeakingIndex === messageIndex) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      return;
    }

    // Stop any other speech
    window.speechSynthesis.cancel();

    // Clean the text - remove special characters but keep periods for pauses
    const cleanText = text.replace(/[•\n]/g, ' ').replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings for FEMALE voice with Pakistani accent
    utterance.rate = 0.85; // Natural speaking pace
    utterance.pitch = 1.1; // Slightly higher pitch for feminine voice
    utterance.volume = 1.0;
    utterance.lang = 'en-IN'; // Indian English (closest to Pakistani accent)

    // Wait for voices to load, then select best female voice
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      
      console.log('Available voices:', voices.map(v => v.name + ' (' + v.lang + ')'));
      
      // Priority order: Find female voice with South Asian/Pakistani accent
      const femaleVoice = 
        // First: Indian/Pakistani English female voices
        voices.find(v => (v.lang.includes('en-IN') || v.lang.includes('en-PK')) && 
                        (v.name.toLowerCase().includes('female') || v.name.includes('Heera') || v.name.includes('Swara'))) ||
        // Second: Specific Indian female names
        voices.find(v => v.name.includes('Veena') || v.name.includes('Heera') || v.name.includes('Swara') || v.name.includes('Neerja')) ||
        // Third: Google Indian English (usually female)
        voices.find(v => v.lang.includes('en-IN')) ||
        // Fourth: Any explicit female voice
        voices.find(v => v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('male')) ||
        // Fifth: Common female voice names
        voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')) ||
        // Sixth: Microsoft female voices
        voices.find(v => v.name.includes('Microsoft Zira')) ||
        voices.find(v => v.name.includes('Microsoft Heera')) ||
        // Seventh: Google US Female
        voices.find(v => v.name.includes('Google US English Female')) ||
        // Eighth: Any UK English female
        voices.find(v => v.lang.includes('en-GB') && v.name.toLowerCase().includes('female')) ||
        // Ninth: Default to first available female voice
        voices.find(v => v.name.toLowerCase().includes('female')) ||
        // Tenth: Default to first available English voice
        voices.find(v => v.lang.includes('en'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('✅ Selected voice:', femaleVoice.name, '- Language:', femaleVoice.lang);
      } else {
        console.log('⚠️ No specific female voice found, using default');
      }
    };

    // Set voice immediately if available
    setVoice();

    // Also set voice when voices are loaded (for some browsers)
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingIndex(messageIndex);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
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

  const generateDocument = async (requirements) => {
    setDraftGenerating(true);
    setDraftStep("generating");

    try {
      const prompt = `You are an expert Pakistani legal document drafter. Generate a complete, professionally formatted legal document based on these requirements:

Document Type: ${draftType}
Requirements: ${JSON.stringify(requirements, null, 2)}

CRITICAL INSTRUCTIONS:
1. Follow Pakistani legal document format and conventions
2. Include all necessary legal clauses as per Pakistani law
3. Use proper Pakistani legal terminology
4. Include all standard sections for this document type
5. Add witness and notary sections where applicable
6. Format with proper headings, numbering, and structure
7. Make it court-ready and professionally formatted
8. Include all parties' complete details
9. Add governing law as Pakistani law
10. Include jurisdiction clauses (Pakistani courts)

Generate the COMPLETE document text ready for immediate use.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          
        }),
      });

      const data = await res.json();
      
      setDraftContent(data.reply);
      setDraftTitle(`${draftType.charAt(0).toUpperCase() + draftType.slice(1)} - ${new Date().toLocaleDateString("en-PK")}`);
      setDraftStep("completed");
    } catch (error) {
      alert("Failed to generate document. Please try again.");
      setDraftStep("gathering-info");
    } finally {
      setDraftGenerating(false);
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

  const compareDocuments = async () => {
    if (!doc1 || !doc2) {
      alert("Please upload both documents");
      return;
    }
    if (!compareFocus.trim()) {
      alert("Please specify a focal point for comparison");
      return;
    }

    // Check file sizes (API limit is typically 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (doc1.size > maxSize) {
      alert(`Document 1 is too large (${(doc1.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB. Please use a smaller file or compress it.`);
      return;
    }
    if (doc2.size > maxSize) {
      alert(`Document 2 is too large (${(doc2.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB. Please use a smaller file or compress it.`);
      return;
    }

    setComparingDocs(true);
    setComparisonResult("");

    try {
      // Read files as base64 for API
      const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const doc1Base64 = await readFileAsBase64(doc1);
      const doc2Base64 = await readFileAsBase64(doc2);

      // Determine file types
      const getMediaType = (filename) => {
        const ext = filename.toLowerCase().split('.').pop();
        if (ext === 'pdf') return 'application/pdf';
        if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (ext === 'doc') return 'application/msword';
        return 'application/pdf';
      };

      const doc1MediaType = getMediaType(doc1.name);
      const doc2MediaType = getMediaType(doc2.name);

      // Call AI to compare documents with file attachments
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: doc1MediaType,
                    data: doc1Base64
                  }
                },
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: doc2MediaType,
                    data: doc2Base64
                  }
                },
                {
                  type: "text",
                  text: `You are a legal document comparison expert specializing in Pakistani law. 

I have uploaded two legal documents for comparison:
- Document 1: ${doc1.name} (${(doc1.size / 1024).toFixed(1)}KB)
- Document 2: ${doc2.name} (${(doc2.size / 1024).toFixed(1)}KB)

IMPORTANT INSTRUCTIONS:
- These documents may contain scanned images or be image-based PDFs. Please use OCR to extract and read all text from any images.
- If the documents are scanned or image-based, extract all visible text carefully before comparison.
- Compare all content whether it's native text or text extracted from images.

PRIMARY FOCUS: "${compareFocus}"

Please provide a comprehensive comparison report with the following sections:

1. EXECUTIVE SUMMARY
Brief overview of the comparison findings (2-3 sentences)

2. DOCUMENT ANALYSIS
- Document 1: Type of document, key sections identified
- Document 2: Type of document, key sections identified
- Note if documents contained scanned images/OCR was used

3. KEY DIFFERENCES
List and explain all significant differences between the documents, especially focusing on "${compareFocus}". Number each difference clearly with specific clause references.

4. SIMILARITIES
Common provisions or clauses found in both documents with references

5. LEGAL IMPLICATIONS UNDER PAKISTANI LAW
Analysis of how the differences affect legal rights, obligations, and risks under:
- Pakistan Penal Code (PPC)
- Code of Criminal Procedure (CrPC)
- Contract Act, 1872
- Other relevant Pakistani laws and regulations

6. RISK ASSESSMENT
Identify potential legal risks or vulnerabilities in each document

7. RECOMMENDATIONS
Practical advice on:
- Which document provisions are more favorable or protective
- What changes or additions might be beneficial
- Red flags or concerns to address

8. DETAILED FOCAL POINT ANALYSIS: ${compareFocus}
In-depth analysis specifically addressing the focal point requested with:
- Specific clause references from both documents
- Comparative analysis of the provisions
- Legal implications and recommendations

Format the report professionally with clear headings, numbered points, and organized sections. Use bullet points where appropriate.`
                }
              ]
            }
          ],
          
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Handle specific error codes
        if (res.status === 413) {
          throw new Error(`Files are too large for the server to process. Document 1: ${(doc1.size / 1024 / 1024).toFixed(2)}MB, Document 2: ${(doc2.size / 1024 / 1024).toFixed(2)}MB. Try compressing the PDFs or using smaller files (max 5MB each).`);
        } else if (res.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        } else if (res.status === 500) {
          throw new Error("Server error. The documents may be corrupted or in an unsupported format.");
        }
        
        throw new Error(errorData.error || `API returned status ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.reply) {
        throw new Error("No response received from AI");
      }

      setComparisonResult(data.reply);
    } catch (error) {
      console.error("Comparison error:", error);
      setComparisonResult(`❌ Error comparing documents: ${error.message}\n\n📋 TROUBLESHOOTING:\n\n✓ File Size Limits:\n  - Document 1: ${(doc1.size / 1024 / 1024).toFixed(2)}MB\n  - Document 2: ${(doc2.size / 1024 / 1024).toFixed(2)}MB\n  - Maximum: 5MB per file\n\n✓ File Requirements:\n  - Valid PDF, DOC, or DOCX format\n  - Not password-protected\n  - Not corrupted\n  - Scanned PDFs are supported (OCR enabled)\n\n✓ Solutions:\n  - Compress large PDF files using online tools\n  - Remove unnecessary pages\n  - Reduce image quality in the PDF\n  - Split large documents into sections\n\n✓ If issue persists, contact support with error details.`);
    } finally {
      setComparingDocs(false);
    }
  };

  const downloadComparisonPDF = () => {
    if (!comparisonResult) return;

    const timestamp = new Date().toLocaleDateString("en-PK");
    const pdfContent = `
ARK LAW AI - LEGAL DOCUMENT COMPARISON REPORT
${"=".repeat(80)}

Date: ${timestamp}
Focal Point: ${compareFocus}
Document 1: ${doc1?.name || "Document 1"}
Document 2: ${doc2?.name || "Document 2"}

${"=".repeat(80)}

${comparisonResult}

${"=".repeat(80)}

This comparison report was generated by ARK Law AI and should be reviewed by a 
qualified Pakistani lawyer before making any legal decisions.

Generated by: ARK Law AI - The Legal Intelligence Engine
By Attorney & AI Innovator Khawer Rabbani
    `.trim();

    // For now, download as TXT (PDF generation requires additional library)
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ARK_Document_Comparison_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Also trigger print dialog for PDF save
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ARK Law AI - Document Comparison Report</title>
        <style>
          @page { margin: 2cm; }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #C9A84C;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #0D1B2A;
            font-size: 24pt;
            margin: 10px 0;
          }
          .header .tagline {
            color: #3EB489;
            font-size: 10pt;
            font-style: italic;
          }
          .metadata {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #C9A84C;
            margin-bottom: 30px;
          }
          .metadata div {
            margin: 5px 0;
          }
          .content {
            white-space: pre-wrap;
            text-align: justify;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #C9A84C;
            text-align: center;
            font-size: 9pt;
            color: #666;
          }
          h2 {
            color: #0D1B2A;
            border-bottom: 2px solid #3EB489;
            padding-bottom: 5px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ARK LAW AI</h1>
          <div class="tagline">The Legal Intelligence Engine</div>
          <div class="tagline">by Attorney & AI Innovator Khawer Rabbani</div>
          <h2 style="border: none; margin-top: 20px;">LEGAL DOCUMENT COMPARISON REPORT</h2>
        </div>
        
        <div class="metadata">
          <div><strong>Report Date:</strong> ${timestamp}</div>
          <div><strong>Focal Point:</strong> ${compareFocus}</div>
          <div><strong>Document 1:</strong> ${doc1?.name || "Document 1"}</div>
          <div><strong>Document 2:</strong> ${doc2?.name || "Document 2"}</div>
        </div>
        
        <div class="content">${comparisonResult.replace(/\n/g, '<br>')}</div>
        
        <div class="footer">
          <p><strong>DISCLAIMER:</strong> This comparison report was generated by ARK Law AI and should be reviewed by a qualified Pakistani lawyer before making any legal decisions.</p>
          <p style="margin-top: 10px;">This AI Initiative is Dedicated to the Legacy, Legal Acumen and Wisdom of<br>Honorable Mr. Justice S. A. Rabbani, Legendary Jurist of Pakistan</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const openConductSource = (conduct) => {
    const newWindow = window.open("", "_blank", "width=900,height=700");
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${conduct.title} - ARK Law AI</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: #F5F1E8;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .header {
            background: #0D1B2A;
            padding: 20px;
            border-bottom: 3px solid #C9A84C;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .header h1 {
            color: #C9A84C;
            margin: 0;
            font-size: 20px;
          }
          .header .subtitle {
            color: #3EB489;
            font-size: 11px;
            margin-top: 3px;
          }
          .toolbar {
            background: #162032;
            padding: 15px 20px;
            border-bottom: 1px solid #2B3F57;
            display: flex;
            gap: 10px;
          }
          .toolbar button {
            padding: 8px 16px;
            background: #C9A84C;
            color: #0D1B2A;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
          }
          .toolbar button:hover {
            background: #E5C887;
          }
          .content {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .conduct-box {
            background: white;
            padding: 30px;
            border-radius: 8px;
            border-left: 5px solid #C9A84C;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }
          .conduct-box h2 {
            color: #0D1B2A;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 24px;
            border-bottom: 2px solid #3EB489;
            padding-bottom: 10px;
          }
          .conduct-text {
            font-size: 16px;
            line-height: 1.8;
            color: #333;
            margin-bottom: 20px;
          }
          .source-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            border-left: 3px solid #3EB489;
            margin-top: 20px;
          }
          .source-info strong {
            color: #0D1B2A;
          }
          iframe {
            width: 100%;
            height: 600px;
            border: 2px solid #2B3F57;
            border-radius: 4px;
            margin-top: 20px;
          }
          .footer {
            background: #0D1B2A;
            color: #C9A84C;
            text-align: center;
            padding: 15px;
            font-size: 10px;
            border-top: 2px solid #C9A84C;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="/ark-logo.png" alt="ARK" width="40" height="40" />
            <div>
              <h1>ARK Law AI</h1>
              <div class="subtitle">Code of Conduct for Attorneys in Pakistan</div>
            </div>
          </div>
        </div>
        <div class="toolbar">
          <button onclick="window.print()">🖨️ Print</button>
          <button onclick="window.close()">✕ Close</button>
        </div>
        <div class="content">
          <div class="conduct-box">
            <h2>${conduct.title}</h2>
            <div class="conduct-text">
              <strong>Code of Conduct Point:</strong><br/>
              ${conduct.text}
            </div>
            <div class="source-info">
              <strong>📚 Source:</strong> ${conduct.title}<br/>
              <strong>🔗 Reference:</strong> Pakistan Bar Council<br/>
              <strong>📖 More Information:</strong> <a href="${conduct.source}" target="_blank" style="color: #3EB489;">${conduct.source}</a>
            </div>
          </div>
          
          <div class="conduct-box">
            <h2>📄 Official Source Document</h2>
            <iframe src="${conduct.source}" frameborder="0"></iframe>
          </div>
        </div>
        <div class="footer">
          This AI Initiative is Dedicated to the Legacy, Legal Acumen and Wisdom of<br/>
          Honorable Mr. Justice S. A. Rabbani, Legendary Jurist of Pakistan
        </div>
      </body>
      </html>
    `);
  };

  const openLinkInNewWindow = (url) => {
    const newWindow = window.open("", "_blank", "width=900,height=700");
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ARK Law AI - Link Viewer</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: #F5F1E8;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .header {
            background: #0D1B2A;
            padding: 20px;
            border-bottom: 2px solid #C9A84C;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .header h1 {
            color: #C9A84C;
            margin: 0;
            font-size: 20px;
          }
          .toolbar {
            background: #162032;
            padding: 15px 20px;
            border-bottom: 1px solid #2B3F57;
            display: flex;
            gap: 10px;
          }
          .toolbar button {
            padding: 8px 16px;
            background: #C9A84C;
            color: #0D1B2A;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
          }
          .toolbar button:hover {
            background: #E5C887;
          }
          .content {
            padding: 20px;
          }
          iframe {
            width: 100%;
            height: calc(100vh - 150px);
            border: 1px solid #2B3F57;
            border-radius: 4px;
            background: white;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/ark-logo.png" alt="ARK" width="40" height="40" />
          <h1>ARK Law AI - Link Viewer</h1>
        </div>
        <div class="toolbar">
          <button onclick="window.print()">🖨️ Print</button>
          <button onclick="history.back()">⬅️ Go Back</button>
          <button onclick="window.close()">✕ Close</button>
        </div>
        <div class="content">
          <iframe src="${url}" frameborder="0"></iframe>
        </div>
      </body>
      </html>
    `);
  };

  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let currentParagraph = [];
    
    // Helper function to parse markdown formatting in text
    const parseMarkdown = (text) => {
      const parts = [];
      let remaining = text;
      let key = 0;
      
      while (remaining.length > 0) {
        // Check for ***bold italic***
        const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/);
        if (boldItalicMatch) {
          parts.push(
            <strong key={key++} style={{ fontStyle: 'italic' }}>
              {boldItalicMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldItalicMatch[0].length);
          continue;
        }
        
        // Check for **bold**
        const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
        if (boldMatch) {
          parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
          remaining = remaining.slice(boldMatch[0].length);
          continue;
        }
        
        // Check for *italic*
        const italicMatch = remaining.match(/^\*(.+?)\*/);
        if (italicMatch) {
          parts.push(<em key={key++}>{italicMatch[1]}</em>);
          remaining = remaining.slice(italicMatch[0].length);
          continue;
        }
        
        // Regular character
        const nextSpecial = remaining.search(/\*/);
        if (nextSpecial === -1) {
          parts.push(remaining);
          break;
        } else if (nextSpecial > 0) {
          parts.push(remaining.slice(0, nextSpecial));
          remaining = remaining.slice(nextSpecial);
        } else {
          parts.push(remaining[0]);
          remaining = remaining.slice(1);
        }
      }
      
      return parts;
    };
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for images: ![alt](url) or just image URLs
      const imageMatch = trimmedLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      const urlMatch = trimmedLine.match(/^(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))$/i);
      
      if (imageMatch || urlMatch) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {parseMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        
        const imgUrl = imageMatch ? imageMatch[2] : urlMatch[1];
        const imgAlt = imageMatch ? imageMatch[1] : 'Image';
        
        elements.push(
          <div key={`img-${index}`} style={{ marginBottom: '16px', marginTop: '16px' }}>
            <img 
              src={imgUrl} 
              alt={imgAlt}
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '8px',
                border: '2px solid #C9A84C',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      }
      // Check if line is a bullet point
      else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {parseMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        
        const bulletText = trimmedLine.substring(1).trim();
        elements.push(
          <div key={`bullet-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px', lineHeight: '1.6' }}>
            <span style={{ color: '#C9A84C', fontWeight: 'bold', flexShrink: 0 }}>•</span>
            <span>{parseMarkdown(bulletText)}</span>
          </div>
        );
      }
      // Check if line is a header (***text*** or ends with :)
      else if (trimmedLine.length > 0 && (
        trimmedLine.startsWith('***') && trimmedLine.endsWith('***') ||
        (trimmedLine.endsWith(':') && trimmedLine.length < 60)
      )) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {parseMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        
        const headerText = trimmedLine.replace(/^\*\*\*|\*\*\*$/g, '');
        elements.push(
          <h3 key={`h-${index}`} style={{ 
            fontWeight: 'bold', 
            fontStyle: 'italic',
            color: '#0D1B2A', 
            marginTop: '16px', 
            marginBottom: '8px',
            fontSize: '15px'
          }}>
            {headerText}
          </h3>
        );
      }
      // Empty line - flush paragraph
      else if (trimmedLine.length === 0) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {parseMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
      }
      // Regular text line
      else {
        currentParagraph.push(trimmedLine);
      }
    });
    
    // Flush any remaining paragraph
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-final`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
          {parseMarkdown(currentParagraph.join(' '))}
        </p>
      );
    }
    
    return <div style={{ whiteSpace: 'normal' }}>{elements}</div>;
  };

  return (
    <>
      <Head>
        <title>ARK Law AI — Pakistan Legal Intelligence Engine by Khawer Rabbani</title>
        <meta
          name="description"
          content="ARK Law AI: Expert AI legal assistant for Pakistani law. Open for all - utilize and get benefit."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <style>{`
        * {

  return (
    <>
      <Head>
        <title>ARK Law AI - Pakistani Legal Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          background: #F5F5F0; 
        }
        .card { 
          background: #FAFAF8; 
          border-radius: 16px; 
          padding: 24px; 
          border: 1px solid #E8E8E0; 
        }
        .btn-lime { 
          background: #C4D600; 
          color: #2C3E1F; 
          border: none; 
          padding: 10px 24px; 
          border-radius: 8px; 
          font-weight: 700; 
          cursor: pointer; 
        }
        .badge-new { 
          background: #C4D600; 
          color: #2C3E1F; 
          padding: 4px 12px; 
          border-radius: 6px; 
          font-size: 11px; 
          font-weight: 700; 
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: COLORS.background }}>
        
        {/* HEADER */}
        <header style={{ background: COLORS.white, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.gray[200]}`, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px" }} />
            <span style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text.primary }}>ARK Law AI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!user ? (
              <>
                <button onClick={() => setShowLoginPopup(true)} style={{ padding: "8px 20px", background: "transparent", border: "none", color: COLORS.text.secondary, fontWeight: 600, cursor: "pointer" }}>Log in</button>
                <button onClick={() => setShowSignupPopup(true)} className="btn-lime" style={{ display: "flex", alignItems: "center", gap: "6px" }}><span>👤</span> Sign up</button>
              </>
            ) : (
              <>
                <div style={{ padding: "8px 16px", background: COLORS.gray[100], borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>{userTokens.toLocaleString()} Credits</div>
                <button onClick={() => setShowMyAccountPopup(true)} style={{ padding: "8px 16px", background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>{user.name}</button>
              </>
            )}
          </div>
        </header>

        {/* BANNER */}
        <div style={{ background: COLORS.gray[100], padding: "12px 40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", borderBottom: `1px solid ${COLORS.gray[200]}` }}>
          <span className="badge-new">New</span>
          <span style={{ fontSize: "14px", color: COLORS.text.primary }}>ARK Law AI just got smarter! Explore improved answers and Pro features.</span>
          <button onClick={() => setShowUpgradePopup(true)} style={{ background: "transparent", border: "none", color: COLORS.primary, fontWeight: 600, cursor: "pointer" }}>See what's new →</button>
        </div>

        {/* MAIN */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr 320px", gap: "24px" }}>
          
          {/* LEFT */}
          {!isMobile && (
            <div>
              <div className="card" style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>Meet the Founder</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src="/khawer-profile.jpeg" alt="Khawer" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>Khawer Rizvi</div>
                    <div style={{ fontSize: "11px", color: COLORS.text.muted }}>Founder & CEO</div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>Features</h3>
                <div onClick={() => setShowDraftPopup(true)} style={{ padding: "16px", background: COLORS.gray[100], borderRadius: "12px", marginBottom: "12px", cursor: "pointer" }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px" }}>📊</div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Draft Documents</div>
                  <div style={{ fontSize: "12px", color: COLORS.text.muted }}>Create legal documents</div>
                </div>
                <div onClick={() => setShowComparePopup(true)} style={{ padding: "16px", background: COLORS.gray[100], borderRadius: "12px", cursor: "pointer" }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px" }}>⚖️</div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Compare Documents</div>
                  <div style={{ fontSize: "12px", color: COLORS.text.muted }}>Analyze differences</div>
                </div>
              </div>
            </div>
          )}

          {/* CENTER */}
          <div>
            {messages.length <= 1 && (
              <div className="card" style={{ textAlign: "center", padding: "60px 40px", marginBottom: "24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚖️</div>
                <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px", color: COLORS.text.primary }}>Hello! I'm ARK Law AI</h1>
                <p style={{ fontSize: "16px", color: COLORS.text.secondary, marginBottom: "32px" }}>Ask questions, get insights, and explore Pakistani law.</p>
              </div>
            )}

            {messages.length > 1 && (
              <div style={{ marginBottom: "24px" }}>
                {messages.slice(1).map((msg, i) => (
                  <div key={i} className="card" style={{ marginBottom: "16px", background: msg.role === "user" ? `${COLORS.primary}10` : COLORS.white, borderLeft: `4px solid ${msg.role === "user" ? COLORS.primary : COLORS.gold}` }}>
                    <div style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="card">
              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: "16px", padding: "12px", background: COLORS.gray[100], borderRadius: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {uploadedFiles.map((file, i) => (
                    <div key={i} style={{ padding: "6px 12px", background: COLORS.white, borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{file.name}</span>
                      <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask anything about Pakistani law..." style={{ flex: 1, padding: "14px 16px", border: `1px solid ${COLORS.gray[200]}`, borderRadius: "10px", fontSize: "14px", outline: "none" }} />
                <label style={{ width: "44px", height: "44px", background: COLORS.gray[100], borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <span>📎</span>
                  <input type="file" multiple onChange={(e) => { const files = Array.from(e.target.files); if (files.length > 0) setUploadedFiles(prev => [...prev, ...files]); }} style={{ display: "none" }} />
                </label>
                <button onClick={startVoiceInput} style={{ width: "44px", height: "44px", background: isListening ? COLORS.primary : COLORS.gray[100], color: isListening ? COLORS.white : COLORS.text.primary, borderRadius: "10px", border: "none", cursor: "pointer" }}>🎤</button>
                <button onClick={() => sendMessage()} disabled={loading} style={{ width: "44px", height: "44px", background: COLORS.primary, color: COLORS.white, borderRadius: "10px", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>➤</button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          {!isMobile && (
            <div>
              <div className="card" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #E5C887)`, marginBottom: "24px" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>👑</div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: COLORS.navy }}>Upgrade to Pro</h3>
                <p style={{ fontSize: "13px", marginBottom: "16px", color: COLORS.navy }}>Unlock advanced features</p>
                <button onClick={() => setShowUpgradePopup(true)} style={{ width: "100%", padding: "12px", background: COLORS.white, color: COLORS.navy, border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>✨ Go Pro</button>
              </div>
              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Quick Queries</h3>
                {QUICK_QUERIES_PK.map((q, i) => (
                  <button key={i} onClick={() => setInput(q)} style={{ width: "100%", padding: "12px 16px", background: COLORS.white, border: `1px solid ${COLORS.gray[200]}`, borderRadius: "8px", marginBottom: "8px", cursor: "pointer", textAlign: "left" }}><span>🔍</span> {q}</button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ background: COLORS.navy, color: COLORS.white, padding: "40px", marginTop: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>ARK Law AI</div>
          <div style={{ fontSize: "13px", opacity: 0.7 }}>© 2025 ARK Law AI. All rights reserved. | ✨ Designed by ARK Lex AI LLC</div>
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
