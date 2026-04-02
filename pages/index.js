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
  // Auth state
  const [user, setUser] = useState(null);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
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
      content: "Welcome to ARK Law AI - Your trusted legal companion for Pakistani law.\n\nHow may I assist you with your legal questions today?",
    };
    setMessages([greeting]);
    setNameAsked(true); // Always mark as asked - never ask for name
  }, []); // Only run once on mount

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

  const sendMessage = async (msg = null, skipNameCheck = false) => {
    const userMessage = msg || input;
    if (!userMessage.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: userMessage }];

    setMessages(updatedMessages);
    setInput("");
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
          stream: true,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedContent += data.content;
                // Update the message in real-time
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

      // If no streaming data was received, fall back to regular response
      if (!accumulatedContent) {
        const data = await res.json();
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[streamingMessageIndex] = {
            role: "assistant",
            content: data.reply
          };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, streamingMessageIndex),
        {
          role: "assistant",
          content: `❌ Error: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
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
    // Split content into lines
    const lines = content.split('\n');
    const elements = [];
    let currentParagraph = [];
    
    lines.forEach((line, index) => {
      // Trim the line
      const trimmedLine = line.trim();
      
      // Check if line is a bullet point
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        // Flush current paragraph if exists
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {currentParagraph.join(' ')}
            </p>
          );
          currentParagraph = [];
        }
        
        // Add bullet point
        const bulletText = trimmedLine.substring(1).trim();
        elements.push(
          <div key={`bullet-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px', lineHeight: '1.6' }}>
            <span style={{ color: '#C9A84C', fontWeight: 'bold', flexShrink: 0 }}>•</span>
            <span>{bulletText}</span>
          </div>
        );
      }
      // Check if line looks like a header (short line, possibly ends with colon, or all caps)
      else if (trimmedLine.length > 0 && trimmedLine.length < 60 && 
               (trimmedLine.endsWith(':') || trimmedLine === trimmedLine.toUpperCase() || 
                /^[A-Z][^.!?]*:?$/.test(trimmedLine))) {
        // Flush current paragraph if exists
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {currentParagraph.join(' ')}
            </p>
          );
          currentParagraph = [];
        }
        
        // Add header
        elements.push(
          <h3 key={`h-${index}`} style={{ 
            fontWeight: 'bold', 
            fontStyle: 'italic',
            color: '#0D1B2A', 
            marginTop: '16px', 
            marginBottom: '8px',
            fontSize: '15px'
          }}>
            {trimmedLine}
          </h3>
        );
      }
      // Empty line - flush paragraph
      else if (trimmedLine.length === 0) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
              {currentParagraph.join(' ')}
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
          {currentParagraph.join(' ')}
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
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          height: 100%;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        #__next {
          height: 100%;
          overflow: hidden;
        }
        @keyframes scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .news-ticker-content {
          animation: scroll 120s linear infinite;
          will-change: transform;
        }
        @keyframes conductScroll {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes flagWave {
          0%, 100% { transform: perspective(400px) rotateY(0deg); }
          25% { transform: perspective(400px) rotateY(-15deg); }
          50% { transform: perspective(400px) rotateY(0deg); }
          75% { transform: perspective(400px) rotateY(15deg); }
        }
        @keyframes flagRipple {
          0%, 100% { d: path("M 0 0 L 52 0 L 52 36 L 0 36 Z"); }
          25% { d: path("M 0 0 Q 13 2 26 0 T 52 0 L 52 36 Q 39 34 26 36 T 0 36 Z"); }
          50% { d: path("M 0 0 Q 13 -2 26 0 T 52 0 L 52 36 Q 39 38 26 36 T 0 36 Z"); }
          75% { d: path("M 0 0 Q 13 2 26 0 T 52 0 L 52 36 Q 39 34 26 36 T 0 36 Z"); }
        }
        .conduct-ticker { 
          animation: conductScroll 60s linear infinite;
          will-change: transform;
        }
        .conduct-ticker:hover { animation-play-state: paused; }
        .pakistan-flag {
          animation: flagWave 3s ease-in-out infinite;
          transform-origin: left center;
          display: inline-block;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(201,168,76,0.5); }
          50% { box-shadow: 0 0 25px rgba(201,168,76,0.8); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: NAVY, color: TEXT_PRIMARY, fontFamily: "Segoe UI, Tahoma, sans-serif", overflow: "hidden" }}>
        {/* HEADER */}
        <header style={{ background: NAVY, padding: "8px 20px", borderBottom: `1px solid ${NAVY_BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          {/* LEFT - LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/ark-logo.png" alt="ARK" style={{ width: "48px", height: "48px" }} />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: GOLD }}>ARK Law AI</div>
              <div style={{ fontSize: 10, color: TEXT_PRIMARY }}>The Legal Intelligence Engine</div>
              <div style={{ fontSize: 9, color: GOLD, fontStyle: "italic", marginTop: "2px" }}>میرا فاضل دوست</div>
              <div 
                onClick={() => setShowLinkedInPopup(true)}
                style={{ 
                  fontSize: 8, 
                  color: ACCENT_PK, 
                  cursor: "pointer",
                  textDecoration: "underline",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
                onMouseLeave={(e) => e.currentTarget.style.color = ACCENT_PK}
              >
                by Attorney & AI Innovator Khawer Rabbani
              </div>
            </div>
          </div>

          {/* CENTER - USER INFO & BANNER */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            
            {/* Open for All Banner */}
            <div style={{ 
              padding: "6px 20px", 
              background: `linear-gradient(135deg, ${GOLD}, #E5C887)`, 
              color: NAVY, 
              border: `2px solid ${GOLD}`, 
              borderRadius: "4px", 
              fontSize: 13, 
              fontWeight: 700, 
              boxShadow: `0 0 15px rgba(201,168,76,0.5)`,
              animation: "glow 2s ease-in-out infinite",
              textAlign: "center",
              letterSpacing: "0.3px",
              whiteSpace: "nowrap"
            }}>
              ✨ Open for All! ✨
            </div>
            
            {/* Contact Email */}
            <a href="mailto:contact@arklaw.ai" style={{ 
              fontSize: 11, 
              color: ACCENT_PK, 
              textDecoration: "none", 
              padding: "6px 0px", 
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = GOLD;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = ACCENT_PK;
            }}
            >
              <span style={{ color: TEXT_MUTED, fontSize: 10 }}>Contact us:</span>
              📧 contact@arklaw.ai
            </a>
            
            {/* Auth Buttons */}
            <button 
              onClick={() => setShowLoginPopup(true)}
              style={{ 
                padding: "6px 16px", 
                background: GOLD, 
                color: NAVY, 
                border: `2px solid ${GOLD}`, 
                borderRadius: "4px", 
                cursor: "pointer", 
                fontSize: 11, 
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Login
            </button>
            <button 
              onClick={() => setShowSignupPopup(true)}
              style={{ 
                padding: "6px 16px", 
                background: ACCENT_PK, 
                color: NAVY, 
                border: `2px solid ${ACCENT_PK}`, 
                borderRadius: "4px", 
                cursor: "pointer", 
                fontSize: 11, 
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Sign Up
            </button>
          </div>

          {/* RIGHT - PAKISTAN FLAG & LANGUAGE TOGGLE */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Animated Waving Pakistan Flag */}
            <div className="pakistan-flag" style={{ width: "56px", height: "38px", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "2px", overflow: "visible", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", perspective: "400px" }}>
              <svg viewBox="0 0 56 38" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#01863F", stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: "#01A550", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#01863F", stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#F8F8F8", stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: "#FFFFFF", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#F0F0F0", stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.8" floodOpacity="0.4"/>
                  </filter>
                  <clipPath id="flagClip">
                    <path>
                      <animate attributeName="d" 
                        values="M 0 0 L 56 0 L 56 38 L 0 38 Z;
                                M 0 0 Q 14 2 28 0 T 56 0 L 56 38 Q 42 36 28 38 T 0 38 Z;
                                M 0 0 Q 14 -2 28 0 T 56 0 L 56 38 Q 42 40 28 38 T 0 38 Z;
                                M 0 0 Q 14 2 28 0 T 56 0 L 56 38 Q 42 36 28 38 T 0 38 Z;
                                M 0 0 L 56 0 L 56 38 L 0 38 Z"
                        dur="2.5s" 
                        repeatCount="indefinite"/>
                    </path>
                  </clipPath>
                </defs>
                
                <g clipPath="url(#flagClip)">
                  {/* Green section with gradient */}
                  <rect x="0" y="0" width="56" height="38" fill="url(#greenGradient)"/>
                  
                  {/* White stripe */}
                  <rect x="0" y="0" width="14" height="38" fill="url(#whiteGradient)"/>
                  
                  {/* Crescent shadow layer */}
                  <g filter="url(#shadow)">
                    <circle cx="32" cy="19" r="8.5" fill="#FFFFFF"/>
                    <circle cx="34.5" cy="19" r="7.5" fill="url(#greenGradient)"/>
                  </g>
                  
                  {/* Star with shadow */}
                  <g transform="translate(42, 19)" filter="url(#shadow)">
                    <polygon points="0,-6.5 2,-2 7,-2 3,1 4.5,6 0,3 -4.5,6 -3,1 -7,-2 -2,-2" 
                             fill="#FFFFFF" 
                             stroke="#F5F5F5" 
                             strokeWidth="0.3"/>
                  </g>
                  
                  {/* Wave ripple effect */}
                  <g opacity="0.25">
                    <path fill="#FFFFFF">
                      <animate attributeName="d" 
                        values="M 14 0 Q 24 3 35 0 T 56 0 L 56 38 Q 45 35 35 38 T 14 38 Z;
                                M 14 0 Q 24 -3 35 0 T 56 0 L 56 38 Q 45 41 35 38 T 14 38 Z;
                                M 14 0 Q 24 3 35 0 T 56 0 L 56 38 Q 45 35 35 38 T 14 38 Z"
                        dur="2s" 
                        repeatCount="indefinite"/>
                    </path>
                  </g>
                  
                  {/* Shimmer waves */}
                  <g opacity="0.15">
                    <rect x="0" y="0" width="56" height="38" fill="url(#whiteGradient)">
                      <animate attributeName="opacity" 
                        values="0.1;0.2;0.1" 
                        dur="3s" 
                        repeatCount="indefinite"/>
                    </rect>
                  </g>
                </g>
                
                {/* Flag pole shadow */}
                <line x1="0" y1="0" x2="0" y2="38" stroke="#333" strokeWidth="0.5" opacity="0.3"/>
              </svg>
            </div>
            
            <button style={{ padding: "6px 12px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
              EN
            </button>
            <button style={{ padding: "6px 12px", background: NAVY_SURFACE, color: TEXT_MUTED, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", cursor: "pointer", fontSize: 11, opacity: 0.4 }} title="Urdu — Coming Soon">
              اردو
            </button>
          </div>
        </header>

        {/* NEWS TICKER - CONTINUOUS INFINITE LOOP */}
        <div style={{ background: NAVY_MID, borderBottom: `1px solid ${NAVY_BORDER}`, overflow: "hidden", display: "flex", alignItems: "center", height: "28px", padding: "5px 20px", flexShrink: 0 }}>
          <span style={{ color: GOLD, fontWeight: 600, flexShrink: 0, marginRight: "20px", fontSize: 12, whiteSpace: "nowrap" }}>⚖ LEGAL NEWS</span>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div className="news-ticker-wrapper">
              <div className="news-ticker-content" style={{ 
                display: "flex", 
                gap: "80px", 
                whiteSpace: "nowrap",
                width: "max-content"
              }}>
                {/* First set of news items */}
                {(newsItems.length > 0 ? newsItems : [
                  "🇵🇰 Supreme Court Ruling on Constitutional Rights",
                  "🇵🇰 New Tax Amendment Affects Business Sector",
                  "🇵🇰 Family Court Interprets Guardianship Laws",
                  "🇵🇰 Labour Ministry Issues Worker Protection Guidelines",
                  "🇵🇰 High Court Decision on Property Disputes",
                  "🇵🇰 Procedural Changes in Criminal Courts"
                ]).map((item, i) => (
                  <button 
                    key={`news-1-${i}`} 
                    onClick={() => newsItems.length > 0 ? handleNewsClick(item) : null} 
                    style={{ 
                      background: "none", 
                      border: "none", 
                      color: ACCENT_PK, 
                      cursor: newsItems.length > 0 ? "pointer" : "default", 
                      fontSize: 12, 
                      padding: "0", 
                      flexShrink: 0, 
                      fontWeight: 500, 
                      textDecoration: "none", 
                      whiteSpace: "nowrap" 
                    }}
                  >
                    {item}
                  </button>
                ))}
                {/* Second set - exact duplicate for seamless loop */}
                {(newsItems.length > 0 ? newsItems : [
                  "🇵🇰 Supreme Court Ruling on Constitutional Rights",
                  "🇵🇰 New Tax Amendment Affects Business Sector",
                  "🇵🇰 Family Court Interprets Guardianship Laws",
                  "🇵🇰 Labour Ministry Issues Worker Protection Guidelines",
                  "🇵🇰 High Court Decision on Property Disputes",
                  "🇵🇰 Procedural Changes in Criminal Courts"
                ]).map((item, i) => (
                  <button 
                    key={`news-2-${i}`} 
                    onClick={() => newsItems.length > 0 ? handleNewsClick(item) : null} 
                    style={{ 
                      background: "none", 
                      border: "none", 
                      color: ACCENT_PK, 
                      cursor: newsItems.length > 0 ? "pointer" : "default", 
                      fontSize: 12, 
                      padding: "0", 
                      flexShrink: 0, 
                      fontWeight: 500, 
                      textDecoration: "none", 
                      whiteSpace: "nowrap" 
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* LEFT SIDEBAR - Document Tools */}
          {!isMobile && (
            <div style={{ width: "220px", background: NAVY_SURFACE, borderRight: `1px solid ${NAVY_BORDER}`, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <img src="/jinnah.jpeg" alt="Jinnah" style={{ width: "50px", height: "50px", borderRadius: "50%", border: `2px solid ${ACCENT_PK}` }} />
                  <div style={{ fontSize: 8, color: ACCENT_PK, fontWeight: 600, marginTop: "3px" }}>FOUNDER OF</div>
                  <div style={{ fontSize: 8, color: ACCENT_PK, fontWeight: 600 }}>PAKISTAN</div>
                  <div style={{ fontSize: 7, color: TEXT_MUTED }}>Quaid-e-Azam</div>
                  <div style={{ fontSize: 7, color: TEXT_MUTED }}>M. A. Jinnah</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <img src="/rabbani.jpeg" alt="Justice Rabbani" style={{ width: "50px", height: "50px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  <div style={{ fontSize: 8, color: ACCENT_PK, fontWeight: 600, marginTop: "3px" }}>HONORABLE</div>
                  <div style={{ fontSize: 8, color: ACCENT_PK, fontWeight: 600 }}>JUSTICE</div>
                  <div style={{ fontSize: 7, color: TEXT_MUTED }}>S. A. Rabbani</div>
                  <div style={{ fontSize: 7, color: TEXT_MUTED }}>Fmr. Judge, Superior Courts</div>
                  <div style={{ fontSize: 6, color: ACCENT_PK, marginTop: "2px", fontStyle: "italic" }}>Inspiration for ARK LAW AI</div>
                </div>
              </div>

              {/* Document Analyzer */}
              <div style={{ padding: "12px", background: `linear-gradient(135deg, ${GOLD}20, ${ACCENT_PK}20)`, borderRadius: "6px", border: `2px solid ${ACCENT_PK}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GOLD, marginBottom: "8px", textAlign: "center" }}>📂 ANALYZE DOCUMENTS</div>
                <div style={{ fontSize: 9, color: TEXT_MUTED, marginBottom: "8px", textAlign: "center" }}>Upload legal documents for analysis</div>
                <input type="file" accept=".pdf,.docx,.doc" style={{ width: "100%", fontSize: 10, padding: "6px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", color: CREAM, cursor: "pointer" }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => alert("Feature coming soon: Document analysis");
                    reader.readAsArrayBuffer(file);
                  }
                }} />
                <div style={{ display: "flex", gap: "4px", marginTop: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, borderRadius: "3px" }}>📄 PDF</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: ACCENT_PK, color: NAVY, borderRadius: "3px" }}>📋 DOCX</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, borderRadius: "3px" }}>📑 DOC</span>
                </div>
              </div>

              {/* Document Comparison */}
              <div style={{ padding: "12px", background: `linear-gradient(135deg, ${GOLD}20, ${ACCENT_PK}20)`, borderRadius: "6px", border: `2px solid ${GOLD}`, cursor: "pointer" }} onClick={() => setShowComparePopup(true)}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GOLD, marginBottom: "4px", textAlign: "center" }}>⚖️ COMPARE DOCUMENTS</div>
                <div style={{ fontSize: 9, color: TEXT_MUTED, marginBottom: "8px", textAlign: "center" }}>Upload 2 documents to compare</div>
                <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: ACCENT_PK, color: NAVY, borderRadius: "3px" }}>📄 DOC 1</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: ACCENT_PK, color: NAVY, borderRadius: "3px" }}>📄 DOC 2</span>
                </div>
              </div>

              {/* Document Drafting */}
              <div style={{ padding: "12px", background: `linear-gradient(135deg, ${GOLD}20, ${ACCENT_PK}20)`, borderRadius: "6px", border: `2px solid ${ACCENT_PK}`, cursor: "pointer" }} onClick={() => setShowDraftPopup(true)}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GOLD, marginBottom: "4px", textAlign: "center" }}>✍️ DRAFT DOCUMENTS</div>
                <div style={{ fontSize: 9, color: TEXT_MUTED, marginBottom: "8px", textAlign: "center" }}>Create contracts, affidavits & more</div>
                <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, borderRadius: "3px" }}>📄 DOC</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: ACCENT_PK, color: NAVY, borderRadius: "3px" }}>📋 PDF</span>
                  <span style={{ fontSize: 8, padding: "2px 6px", background: GOLD, color: NAVY, borderRadius: "3px" }}>📑 DOCX</span>
                </div>
              </div>

              {/* KACHOKAY QUOTE BOX */}
              <div style={{ 
                marginTop: "auto",
                padding: "6px", 
                background: `linear-gradient(135deg, ${GOLD}15, ${ACCENT_PK}15)`, 
                borderRadius: "4px", 
                border: `1px solid ${GOLD}`,
                textAlign: "center"
              }}>
                <img 
                  src="/kachokay.jpg" 
                  alt="Kachokay" 
                  style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "50%", 
                    border: `2px solid ${GOLD}`,
                    marginBottom: "4px",
                    objectFit: "cover"
                  }} 
                />
                <div style={{ fontSize: 8, color: GOLD, fontWeight: 700, marginBottom: "2px" }}>
                  Everyday a New Kachokay Quote
                </div>
                <div style={{ fontSize: 6, color: ACCENT_PK, fontStyle: "italic" }}>
                  (Coming Soon!)
                </div>
              </div>
            </div>
          )}

          {/* CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: CREAM, position: "relative" }}>
            {/* Watermark Logo */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.08, pointerEvents: "none", zIndex: 0 }}>
              <img src="/ark-logo.png" alt="ARK Watermark" style={{ width: "400px", height: "400px" }} />
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "10px" }}>
                  {msg.role === "assistant" && (
                    <img src="/ark-logo.png" alt="ARK Law AI" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  )}
                  <div style={{ maxWidth: "70%", position: "relative" }}>
                    <div style={{ padding: "10px 14px", borderRadius: "8px", background: msg.role === "user" ? GOLD : "white", color: msg.role === "user" ? NAVY : "#333", fontSize: 13, lineHeight: "1.4", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                      {renderMessageContent(msg.content)}
                    </div>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => speakText(msg.content, i)}
                        style={{
                          marginTop: "6px",
                          padding: "6px 12px",
                          background: currentSpeakingIndex === i ? ACCENT_PK : GOLD,
                          color: NAVY,
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
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

            {/* INPUT AREA */}
            <div style={{ padding: "15px", borderTop: `1px solid ${NAVY_BORDER}`, display: "flex", gap: "8px" }}>
              <button 
                onClick={startVoiceInput}
                disabled={loading || isListening}
                style={{ 
                  padding: "10px 16px", 
                  background: isListening ? ACCENT_PK : NAVY_SURFACE, 
                  color: isListening ? NAVY : TEXT_PRIMARY,
                  border: `1px solid ${isListening ? ACCENT_PK : NAVY_BORDER}`, 
                  borderRadius: "4px", 
                  cursor: loading || isListening ? "not-allowed" : "pointer", 
                  fontWeight: 600, 
                  fontSize: 16,
                  transition: "all 0.3s",
                  animation: isListening ? "pulse 1.5s infinite" : "none"
                }}
                title="Click to speak your question"
              >
                {isListening ? "🎤 Listening..." : "🎤"}
              </button>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === "Enter" && sendMessage()} 
                placeholder={isListening ? "Listening..." : "Ask ARK Law AI or click mic to speak..."} 
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  background: NAVY_SURFACE, 
                  border: `1px solid ${NAVY_BORDER}`, 
                  color: TEXT_PRIMARY, 
                  borderRadius: "4px", 
                  fontSize: 13 
                }} 
              />
              <button 
                onClick={() => sendMessage()} 
                disabled={loading || isListening} 
                style={{ 
                  padding: "10px 20px", 
                  background: GOLD, 
                  color: NAVY, 
                  border: "none", 
                  borderRadius: "4px", 
                  cursor: loading || isListening ? "not-allowed" : "pointer", 
                  fontWeight: 600, 
                  fontSize: 13,
                  opacity: loading || isListening ? 0.5 : 1
                }}
              >
                SEND
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Quick Queries & Practice Areas */}
          {!isMobile && (
            <div style={{ width: "220px", background: NAVY_SURFACE, borderLeft: `1px solid ${NAVY_BORDER}`, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
              
              {/* QUICK QUERIES */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginBottom: "8px", textAlign: "center" }}>💬 QUICK LEGAL QUERIES</div>
                {QUICK_QUERIES_PK.map((query, i) => (
                  <button key={i} onClick={() => sendMessage(query, true)} style={{ display: "block", width: "100%", padding: "8px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_SECONDARY, cursor: "pointer", marginBottom: "6px", borderRadius: "4px", fontSize: 9, textAlign: "left", lineHeight: "1.4", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${GOLD}15`;
                    e.currentTarget.style.borderColor = GOLD;
                    e.currentTarget.style.color = TEXT_PRIMARY;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = NAVY;
                    e.currentTarget.style.borderColor = NAVY_BORDER;
                    e.currentTarget.style.color = TEXT_SECONDARY;
                  }}
                  >
                    {query}
                  </button>
                ))}
              </div>

              {/* Practice Areas */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginBottom: "6px" }}>⚖️ PRACTICE AREAS</div>
                {PRACTICE_AREAS_PK.map((area) => (
                  <button key={area.id} onClick={() => sendMessage(`Tell me about ${area.label} in Pakistan`, true)} style={{ display: "block", width: "100%", padding: "6px", background: NAVY, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, cursor: "pointer", marginBottom: "4px", borderRadius: "4px", fontSize: 10, textAlign: "left" }}>
                    {area.icon} {area.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ padding: "8px 20px", borderTop: `1px solid ${NAVY_BORDER}`, fontSize: 9, color: TEXT_MUTED, position: "relative" }}>
          <div style={{ textAlign: "center" }}>⚠️ For legal information only — not a substitute for consulting a qualified Pakistani lawyer</div>
          <div style={{ textAlign: "center", color: GOLD, marginTop: "3px", fontSize: 8 }}>This AI Initiative is Dedicated to the Legacy, Legal Acumen and Wisdom of Honorable Mr. Justice S. A. Rabbani, Legendary Jurist of Pakistan</div>
          
          {/* Golden Banner - Bottom Right */}
          <div style={{ 
            position: "absolute", 
            bottom: "8px", 
            right: "20px",
            padding: "6px 16px",
            background: `linear-gradient(135deg, ${GOLD}, #E5C887)`,
            color: NAVY,
            borderRadius: "4px",
            fontSize: 9,
            fontWeight: 700,
            boxShadow: `0 2px 8px ${GOLD}40`,
            border: `1px solid ${GOLD}`,
            letterSpacing: "0.3px"
          }}>
            ✨ Designed & Developed by ARK Lex AI LLC.
          </div>
        </footer>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, padding: "40px", borderRadius: "12px", border: `2px solid ${ACCENT_PK}`, maxWidth: "450px", textAlign: "center" }}>
            <img src="/ark-logo.png" alt="ARK" style={{ width: "60px", height: "60px", margin: "0 auto 15px" }} />
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
                <img src="/ark-logo.png" alt="ARK" style={{ width: "40px", height: "40px" }} />
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

      {/* DOCUMENT DRAFTING POPUP - AI POWERED */}
      {showDraftPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: NAVY_SURFACE, borderRadius: "12px", width: "90%", maxWidth: "800px", maxHeight: "90vh", overflow: "auto", border: `3px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}50` }}>
            
            {/* HEADER */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_MID})`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "40px", height: "40px" }} />
                <div>
                  <h3 style={{ color: GOLD, margin: 0, fontSize: 18 }}>✍️ AI Legal Document Drafting</h3>
                  <div style={{ color: ACCENT_PK, fontSize: 10, marginTop: "3px" }}>Powered by ARK Law AI - Pakistani Law Compliant</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDraftPopup(false);
                  setDraftStep("type-selection");
                  setDraftContent("");
                  setDraftRequirements({});
                }} 
                style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div style={{ padding: "25px" }}>
              
              {/* STEP 1: DOCUMENT TYPE SELECTION */}
              {draftStep === "type-selection" && (
                <div>
                  <h4 style={{ color: GOLD, fontSize: 15, marginBottom: "15px", fontWeight: 700 }}>📋 Step 1: Select Document Type</h4>
                  
                  <select 
                    value={draftType} 
                    onChange={(e) => setDraftType(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      background: NAVY, 
                      border: `2px solid ${NAVY_BORDER}`, 
                      color: TEXT_PRIMARY, 
                      borderRadius: "6px", 
                      marginBottom: "20px", 
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
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
                    <div style={{ color: TEXT_SECONDARY, fontSize: 11, lineHeight: "1.6" }}>
                      1. Select the document type you need<br/>
                      2. Provide required information in the form<br/>
                      3. AI will generate a complete, court-ready document<br/>
                      4. Edit the document if needed<br/>
                      5. Download in Word or PDF format
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!draftType) {
                        alert("Please select a document type");
                        return;
                      }
                      setDraftStep("gathering-info");
                    }}
                    disabled={!draftType}
                    style={{ 
                      width: "100%", 
                      padding: "14px", 
                      background: draftType ? `linear-gradient(135deg, ${GOLD}, #E5C887)` : NAVY_BORDER, 
                      color: NAVY, 
                      border: "none", 
                      borderRadius: "6px", 
                      cursor: draftType ? "pointer" : "not-allowed", 
                      fontWeight: 700, 
                      fontSize: 14,
                      boxShadow: draftType ? `0 4px 15px ${GOLD}40` : "none"
                    }}
                  >
                    Next: Provide Information →
                  </button>
                </div>
              )}

              {/* STEP 2: GATHERING INFORMATION */}
              {draftStep === "gathering-info" && (
                <div>
                  <h4 style={{ color: GOLD, fontSize: 15, marginBottom: "8px", fontWeight: 700 }}>
                    📝 Step 2: Provide Document Information
                  </h4>
                  <p style={{ color: TEXT_MUTED, fontSize: 11, marginBottom: "20px" }}>
                    Fill in the details below. AI will generate a complete Pakistani legal document.
                  </p>

                  {/* DYNAMIC FORM BASED ON DOCUMENT TYPE */}
                  <div style={{ maxHeight: "400px", overflowY: "auto", padding: "5px" }}>
                    
                    {/* RENTAL AGREEMENT FIELDS */}
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

                    {/* AFFIDAVIT FIELDS */}
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
                          <textarea placeholder="Facts to be stated under oath * (Describe all facts in detail)" onChange={(e) => setDraftRequirements({...draftRequirements, facts: e.target.value})} style={{ width: "100%", height: "120px", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", marginBottom: "10px", fontSize: 12, fontFamily: "Arial, sans-serif" }} />
                          <input placeholder="Authority/Court where to be filed *" onChange={(e) => setDraftRequirements({...draftRequirements, authority: e.target.value})} style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
                        </div>
                      </div>
                    )}

                    {/* NDA FIELDS */}
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

                    {/* GENERIC FORM FOR OTHER DOCUMENT TYPES */}
                    {!["rental-agreement", "affidavit", "nda"].includes(draftType) && (
                      <div>
                        <div style={{ background: NAVY, padding: "15px", borderRadius: "6px", marginBottom: "15px", border: `1px solid ${GOLD}40` }}>
                          <h5 style={{ color: ACCENT_PK, fontSize: 12, marginBottom: "12px", fontWeight: 600 }}>📋 Document Information</h5>
                          <textarea 
                            placeholder={`Provide all necessary details for ${draftType}:\n\n• Party names and addresses\n• Terms and conditions\n• Duration/timeline\n• Special clauses\n• Any other relevant information`}
                            onChange={(e) => setDraftRequirements({...draftRequirements, generalInfo: e.target.value})} 
                            style={{ width: "100%", height: "250px", padding: "12px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12, fontFamily: "Arial, sans-serif", lineHeight: "1.6" }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BUTTONS */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button 
                      onClick={() => setDraftStep("type-selection")}
                      style={{ 
                        flex: 1, 
                        padding: "12px", 
                        background: NAVY_SURFACE, 
                        color: TEXT_PRIMARY, 
                        border: `1px solid ${NAVY_BORDER}`, 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={() => generateDocument(draftRequirements)}
                      disabled={draftGenerating}
                      style={{ 
                        flex: 2, 
                        padding: "12px", 
                        background: draftGenerating ? NAVY_BORDER : `linear-gradient(135deg, ${ACCENT_PK}, #2D9B6E)`, 
                        color: draftGenerating ? TEXT_MUTED : "white", 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: draftGenerating ? "not-allowed" : "pointer", 
                        fontWeight: 700, 
                        fontSize: 14,
                        boxShadow: draftGenerating ? "none" : `0 4px 15px ${ACCENT_PK}40`
                      }}
                    >
                      {draftGenerating ? "⏳ Generating Document..." : "🚀 Generate Document with AI"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: GENERATING */}
              {draftStep === "generating" && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <img src="/ark-logo.png" alt="ARK" style={{ width: "80px", height: "80px", marginBottom: "20px", opacity: 0.8, animation: "pulse 2s infinite" }} />
                  <h4 style={{ color: GOLD, fontSize: 16, marginBottom: "15px", fontWeight: 700 }}>⏳ Generating Your Legal Document...</h4>
                  <p style={{ color: TEXT_SECONDARY, fontSize: 13, lineHeight: "1.6" }}>
                    Our AI is drafting a comprehensive, Pakistani law-compliant document based on your requirements.
                    <br/>This may take a few moments.
                  </p>
                  <div style={{ marginTop: "20px", padding: "15px", background: NAVY, borderRadius: "6px", border: `1px solid ${GOLD}30` }}>
                    <div style={{ color: ACCENT_PK, fontSize: 11, marginBottom: "8px" }}>✓ Analyzing requirements</div>
                    <div style={{ color: ACCENT_PK, fontSize: 11, marginBottom: "8px" }}>✓ Applying Pakistani legal format</div>
                    <div style={{ color: ACCENT_PK, fontSize: 11, marginBottom: "8px" }}>✓ Including all necessary clauses</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>⏳ Finalizing document...</div>
                  </div>
                </div>
              )}

              {/* STEP 4: COMPLETED - EDITABLE DOCUMENT */}
              {draftStep === "completed" && (
                <div>
                  <h4 style={{ color: GOLD, fontSize: 15, marginBottom: "8px", fontWeight: 700 }}>
                    ✅ Document Generated Successfully!
                  </h4>
                  <p style={{ color: TEXT_MUTED, fontSize: 11, marginBottom: "15px" }}>
                    Your {draftType} has been generated. You can edit it below and download in Word or PDF format.
                  </p>

                  {/* EDITABLE DOCUMENT AREA */}
                  <textarea 
                    value={draftContent} 
                    onChange={(e) => setDraftContent(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      height: "400px", 
                      padding: "15px", 
                      background: "white", 
                      border: `2px solid ${GOLD}`, 
                      color: "#000", 
                      borderRadius: "6px", 
                      marginBottom: "15px", 
                      fontSize: 13, 
                      fontFamily: "'Times New Roman', serif",
                      lineHeight: "1.8",
                      whiteSpace: "pre-wrap"
                    }} 
                  />

                  {/* STATS */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", padding: "10px", background: NAVY, borderRadius: "4px" }}>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>
                      📝 Words: <span style={{ color: ACCENT_PK, fontWeight: 600 }}>{draftContent.split(/\s+/).filter(Boolean).length}</span>
                    </div>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>
                      📊 Characters: <span style={{ color: ACCENT_PK, fontWeight: 600 }}>{draftContent.length}</span>
                    </div>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>
                      📄 Pages: <span style={{ color: ACCENT_PK, fontWeight: 600 }}>{Math.ceil(draftContent.split(/\s+/).filter(Boolean).length / 500)}</span>
                    </div>
                  </div>

                  {/* DISCLAIMER */}
                  <div style={{ background: `${GOLD}15`, padding: "12px", borderRadius: "6px", borderLeft: `4px solid ${GOLD}`, marginBottom: "20px" }}>
                    <div style={{ color: GOLD, fontSize: 10, fontWeight: 600, marginBottom: "5px" }}>⚠️ IMPORTANT LEGAL DISCLAIMER</div>
                    <div style={{ color: TEXT_SECONDARY, fontSize: 10, lineHeight: "1.5" }}>
                      This document is AI-generated for reference purposes only. Please have it reviewed and verified by a qualified Pakistani lawyer before execution or filing in court.
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => {
                        setDraftStep("type-selection");
                        setDraftContent("");
                        setDraftRequirements({});
                      }}
                      style={{ 
                        flex: 1, 
                        padding: "12px", 
                        background: NAVY_SURFACE, 
                        color: TEXT_PRIMARY, 
                        border: `1px solid ${NAVY_BORDER}`, 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      🔄 New Document
                    </button>
                    <button 
                      onClick={() => downloadDraft("docx")} 
                      style={{ 
                        flex: 1, 
                        padding: "12px", 
                        background: ACCENT_PK, 
                        color: NAVY, 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontWeight: 700, 
                        fontSize: 12,
                        boxShadow: `0 2px 8px ${ACCENT_PK}40`
                      }}
                    >
                      📥 Download DOCX
                    </button>
                    <button 
                      onClick={() => downloadDraft("pdf")} 
                      style={{ 
                        flex: 1, 
                        padding: "12px", 
                        background: `linear-gradient(135deg, ${GOLD}, #E5C887)`, 
                        color: NAVY, 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontWeight: 700, 
                        fontSize: 12,
                        boxShadow: `0 2px 8px ${GOLD}40`
                      }}
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT COMPARISON POPUP */}
      {showComparePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: POPUP_DARK, borderRadius: "12px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto", border: `2px solid ${GOLD}` }}>
            <div style={{ background: NAVY, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${NAVY_BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "32px", height: "32px" }} />
                <h3 style={{ color: GOLD, margin: 0 }}>⚖️ Compare Legal Documents</h3>
              </div>
              <button onClick={() => setShowComparePopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 24, cursor: "pointer" }}>
                ✕
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ color: GOLD, fontSize: 12, fontWeight: 600, display: "block", marginBottom: "8px" }}>📄 Document 1</label>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setDoc1(e.target.files?.[0])} style={{ width: "100%", padding: "8px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 11 }} />
                {doc1 && (
                  <div style={{ marginTop: "5px", fontSize: 10, color: doc1.size > 5*1024*1024 ? "#ff6b6b" : ACCENT_PK }}>
                    {doc1.name} - {(doc1.size / 1024 / 1024).toFixed(2)}MB {doc1.size > 5*1024*1024 && "⚠️ TOO LARGE (Max 5MB)"}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ color: GOLD, fontSize: 12, fontWeight: 600, display: "block", marginBottom: "8px" }}>📄 Document 2</label>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setDoc2(e.target.files?.[0])} style={{ width: "100%", padding: "8px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 11 }} />
                {doc2 && (
                  <div style={{ marginTop: "5px", fontSize: 10, color: doc2.size > 5*1024*1024 ? "#ff6b6b" : ACCENT_PK }}>
                    {doc2.name} - {(doc2.size / 1024 / 1024).toFixed(2)}MB {doc2.size > 5*1024*1024 && "⚠️ TOO LARGE (Max 5MB)"}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: "15px", padding: "10px", background: NAVY_SURFACE, borderRadius: "4px", borderLeft: `3px solid ${ACCENT_PK}` }}>
                <div style={{ fontSize: 10, color: TEXT_MUTED, lineHeight: "1.6" }}>
                  ℹ️ <strong>Supported:</strong> PDF, DOC, DOCX (max 5MB each)<br/>
                  ✓ Scanned PDFs supported (OCR enabled)<br/>
                  ✓ Image-based documents supported
                </div>
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ color: GOLD, fontSize: 12, fontWeight: 600, display: "block", marginBottom: "8px" }}>🎯 Focal Point for Comparison</label>
                <input type="text" value={compareFocus} onChange={(e) => setCompareFocus(e.target.value)} placeholder="e.g., payment terms, liability clauses, termination conditions..." style={{ width: "100%", padding: "10px", background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, color: TEXT_PRIMARY, borderRadius: "4px", fontSize: 12 }} />
              </div>

              {comparingDocs && (
                <div style={{ marginBottom: "15px", padding: "20px", background: NAVY, borderRadius: "6px", border: `1px solid ${GOLD}`, textAlign: "center" }}>
                  <div style={{ color: GOLD, fontSize: 14, fontWeight: 600, marginBottom: "10px" }}>⏳ Analyzing Documents...</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 11 }}>AI is comparing the documents and analyzing differences based on your focal point</div>
                </div>
              )}

              {comparisonResult && !comparingDocs && (
                <div style={{ marginBottom: "15px", padding: "15px", background: NAVY, borderRadius: "6px", border: `1px solid ${ACCENT_PK}` }}>
                  <div style={{ color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: "10px" }}>📊 Comparison Report</div>
                  <div style={{ color: TEXT_PRIMARY, fontSize: 11, lineHeight: "1.6", whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto" }}>
                    {comparisonResult}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { setShowComparePopup(false); setDoc1(null); setDoc2(null); setCompareFocus(""); setComparisonResult(""); }} style={{ flex: 1, padding: "10px", background: NAVY_SURFACE, color: TEXT_PRIMARY, border: `1px solid ${NAVY_BORDER}`, borderRadius: "4px", cursor: "pointer", fontSize: 12 }}>
                  Close
                </button>
                <button onClick={compareDocuments} disabled={comparingDocs} style={{ flex: 1, padding: "10px", background: comparingDocs ? NAVY_BORDER : GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: comparingDocs ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 12, boxShadow: `0 0 15px rgba(201,168,76,0.5)` }}>
                  {comparingDocs ? "⏳ Analyzing..." : "🔍 Compare Documents"}
                </button>
                {comparisonResult && (
                  <button onClick={downloadComparisonPDF} style={{ flex: 1, padding: "10px", background: ACCENT_PK, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                    📄 Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE POPUP - KHAWER RABBANI */}
      {showLinkedInPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: POPUP_DARK, borderRadius: "12px", width: "90%", maxWidth: "1000px", maxHeight: "90vh", overflow: "auto", border: `2px solid ${GOLD}`, boxShadow: `0 0 30px rgba(201,168,76,0.3)` }}>
            {/* POPUP HEADER */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY_SURFACE}, ${NAVY_MID})`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img src="/ark-logo.png" alt="ARK" style={{ width: "50px", height: "50px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <img src="/khawer-profile.jpeg" alt="Khawer Rabbani" style={{ width: "60px", height: "60px", borderRadius: "50%", border: `2px solid ${GOLD}` }} />
                  <div>
                    <div style={{ color: GOLD, fontWeight: 700, fontSize: 18 }}>Khawer Rabbani</div>
                    <div style={{ color: ACCENT_PK, fontSize: 12, marginTop: "3px" }}>Attorney & AI Innovator</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 10, marginTop: "2px" }}>Founder & CEO, ARK LAW AI</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowLinkedInPopup(false)} style={{ background: "none", border: "none", color: GOLD, fontSize: 28, cursor: "pointer", padding: "0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>

            {/* POPUP CONTENT - PDF VIEWER */}
            <div style={{ padding: "0", background: CREAM }}>
              <iframe 
                src="/KRprofile.pdf#toolbar=0" 
                style={{ 
                  width: "100%", 
                  height: "75vh", 
                  border: "none",
                  background: "white"
                }}
                title="Khawer Rabbani Professional Profile"
              />
            </div>

            {/* POPUP FOOTER */}
            <div style={{ padding: "15px 25px", borderTop: `2px solid ${GOLD}`, background: NAVY_SURFACE, display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: TEXT_MUTED }}>
                📧 khawer.rabbani@gmail.com
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a 
                  href="https://www.linkedin.com/in/khawerrabbani/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    padding: "10px 20px", 
                    background: "#0077B5", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: "pointer", 
                    fontWeight: 600, 
                    fontSize: 12,
                    textDecoration: "none",
                    display: "inline-block"
                  }}
                >
                  🔗 LinkedIn Profile
                </a>
                <button 
                  onClick={() => window.open('/KRprofile.pdf', '_blank')}
                  style={{ 
                    padding: "10px 20px", 
                    background: ACCENT_PK, 
                    color: NAVY, 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: "pointer", 
                    fontWeight: 600, 
                    fontSize: 12
                  }}
                >
                  📄 Download Profile
                </button>
                <button onClick={() => setShowLinkedInPopup(false)} style={{ padding: "10px 20px", background: GOLD, color: NAVY, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                  }),
                });

                const data = await res.json();

                if (res.ok) {
                  localStorage.setItem('arklaw_user', JSON.stringify(data.user));
                  setUser(data.user);
                  setShowLoginPopup(false);
                  alert(`Welcome back, ${data.user.name}!`);
                } else {
                  alert(data.error || 'Invalid email or password');
                }
              } catch (error) {
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
              
              try {
                const res = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    name: formData.get('name'),
                    age: formData.get('age'),
                    profession: formData.get('profession'),
                    barOfPractice: formData.get('barOfPractice'),
                    city: formData.get('city'),
                    province: formData.get('province'),
                    country: formData.get('country'),
                  }),
                });

                const data = await res.json();

                if (res.ok) {
                  setShowSignupPopup(false);
                  alert('Account created successfully! Please login with your credentials.');
                  setShowLoginPopup(true);
                } else {
                  alert(data.error || 'Signup failed. Please try again.');
                }
              } catch (error) {
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

    </>
  );
}
