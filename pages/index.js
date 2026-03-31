import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";

var GOLD = "#C9A84C";
var NAVY = "#0D1B2A";
var NAVY_MID = "#162032";
var NAVY_SURFACE = "#1E2D40";
var NAVY_BORDER = "#2B3F57";
var TEXT_PRIMARY = "#FAF6EE";
var TEXT_SECONDARY = "#B8C4D0";
var TEXT_MUTED = "#6E8099";
var ACCENT_PK = "#3EB489";
var ACCENT_US = "#5B8DD9";

var CONDUCT = [
  { text: "Maintain absolute honesty and integrity in all court dealings.", pk: true },
  { text: "Preserve client confidentiality at all times without exception.", pk: true },
  { text: "Disclose any conflicts of interest promptly to the client.", pk: true },
  { text: "Charge only fair and reasonable fees for services rendered.", pk: true },
  { text: "Never mislead the court through false statements or omissions.", pk: true },
  { text: "Uphold the dignity and decorum of the legal profession always.", pk: true },
  { text: "Provide competent and diligent representation to every client.", pk: true },
  { text: "Respect opposing counsel and maintain courteous conduct.", pk: true },
  { text: "Withdraw from representation if instructed to act dishonestly.", pk: true },
  { text: "Comply fully with Pakistan Bar Council rules and regulations.", pk: true },
  { text: "Never accept a case without adequate competence or preparation.", pk: true },
  { text: "Protect client funds in trust and maintain separate accounts.", pk: true },
  { text: "Advocate zealously for clients within the bounds of the law.", pk: false },
  { text: "Maintain candor toward the tribunal — never make false statements.", pk: false },
  { text: "Preserve client confidentiality under ABA Model Rules.", pk: false },
  { text: "Avoid conflicts of interest between current and former clients.", pk: false },
  { text: "Communicate promptly and keep clients reasonably informed.", pk: false },
  { text: "Charge reasonable fees and explain billing arrangements clearly.", pk: false },
  { text: "Provide competent representation with relevant legal knowledge.", pk: false },
  { text: "Never obstruct opposing party access to evidence.", pk: false },
  { text: "Maintain independence of professional judgment at all times.", pk: false },
  { text: "Comply with state bar rules and continuing legal education.", pk: false },
  { text: "Safeguard client property and funds held in trust accounts.", pk: false },
  { text: "Respect rights of third persons and avoid harassment or threats.", pk: false },
];

var AREAS_EN = [
  { id: "general", label: "General Legal", icon: "⚖️" },
  { id: "criminal", label: "Criminal Law", icon: "🔒" },
  { id: "corporate", label: "Corporate & Business", icon: "🏢" },
  { id: "family", label: "Family & Matrimonial", icon: "👨‍👩‍👧" },
  { id: "property", label: "Property & Real Estate", icon: "🏠" },
  { id: "labour", label: "Labour & Employment", icon: "👷" },
  { id: "constitutional", label: "Constitutional Law", icon: "📜" },
  { id: "ip", label: "IP & Technology", icon: "💡" },
  { id: "immigration", label: "Immigration", icon: "✈️" },
];

var QUICK_EN = [
  "Criminal procedure differences: Pakistan vs USA?",
  "Bail laws: Pakistan CrPC vs US federal law?",
  "Divorce grounds: Pakistan vs USA?",
  "Draft an NDA clause valid in both Pakistan and USA.",
  "IP registration: IPO-Pakistan vs USPTO?",
  "Rights of accused: Article 10-A vs US 5th and 6th Amendments?",
];

var AREA_LABELS_EN = {
  general: "general legal matters",
  criminal: "criminal law and criminal procedure",
  corporate: "corporate, business, and commercial law",
  family: "family law, matrimonial law, and succession",
  property: "property law, real estate, and land acquisition",
  labour: "labour law and employment law",
  constitutional: "constitutional law and fundamental rights",
  ip: "intellectual property and technology law",
  immigration: "immigration and nationality law",
};

var DEFAULT_NEWS = [
  { text: "Pakistan Supreme Court issues landmark ruling on digital privacy rights", pk: true },
  { text: "US Supreme Court reviews AI liability in landmark tech case", pk: false },
  { text: "Lahore High Court strengthens tenants rights in property disputes", pk: true },
  { text: "US Congress passes new cybersecurity legislation for financial sector", pk: false },
  { text: "Pakistan enacts amendments to Companies Act improving corporate governance", pk: true },
  { text: "Federal court upholds new US immigration processing reforms", pk: false },
  { text: "Pakistan Federal Shariat Court reviews family law inheritance provisions", pk: true },
  { text: "US Department of Justice announces major antitrust enforcement action", pk: false },
  { text: "Islamabad High Court rules on constitutional right to information", pk: true },
  { text: "US Senate passes bipartisan criminal justice reform legislation", pk: false },
  { text: "Pakistan Labour Court strengthens worker protections in tech sector", pk: true },
  { text: "Supreme Court of US decides major intellectual property case", pk: false },
  { text: "Pakistan Securities Commission issues new fintech regulatory framework", pk: true },
  { text: "US courts expand protections for whistleblowers in corporate cases", pk: false },
  { text: "Pakistan bar councils push for legal aid expansion nationwide", pk: true },
  { text: "New US federal rules on AI-generated evidence in court proceedings", pk: false },
];

var DOC_TYPES = [
  "Contract","Non-Disclosure Agreement","Employment Agreement","Sale Agreement",
  "Lease Agreement","Power of Attorney","Affidavit","Legal Notice",
  "Partnership Deed","Memorandum of Understanding","Will & Testament",
  "Settlement Agreement","Loan Agreement","Service Agreement"
];

function buildSystem(area, jur) {
  var areaLabel = AREA_LABELS_EN[area];
  var jurMap = {
    pk: "You are answering ONLY under Pakistani law. Cite Pakistani legislation (PPC, CrPC, CPC, MFLO 1961, Companies Act 2017, Constitution 1973) and court precedents.",
    us: "You are answering ONLY under US law. Cite federal legislation, FRCP, FRCRP, UCC, US Constitution and court precedents.",
    both: "You are answering under BOTH Pakistani and US law with clear sections for each jurisdiction and comparative analysis.",
  };
  return "You are ARK Law AI, a warm and professional AI legal assistant specializing in " + areaLabel + ". " + jurMap[jur] + "\n\nCONVERSATION RULES:\n1. FIRST MESSAGE: On the very first user message, greet warmly and ask their name in one line.\n2. PERSONALIZATION: Once you know the name, address the user by name in every reply.\n3. ONE QUICK QUESTION: Ask maximum ONE very short one-line clarifying question, then immediately give a full detailed answer.\n4. FOCUSED ANSWERS: Give complete well-cited answers with specific statutes and case law.\n5. WARM TONE: Be warm and natural like a knowledgeable legal advisor.\n6. DISCLAIMER: End every detailed answer with: This is for research only and not a substitute for legal counsel.";
}

function fmt(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong style=\"color:#C9A84C\">$1</strong>")
    .replace(/^#{1,3} (.+)$/gm, "<div style=\"color:#C9A84C;font-weight:600;margin:10px 0 5px\">$1</div>")
    .replace(/^- (.+)$/gm, "<div style=\"display:flex;gap:8px;margin:3px 0\"><span style=\"color:#C9A84C\">&#8226;</span><span>$1</span></div>")
    .replace(/\n\n/g, "<br/>").replace(/\n/g, "<br/>");
}

function ArkLogo(props) {
  var s = props.size || 44;
  return (
    <svg width={s} height={s} viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="sc2"><path d="M100 8 L175 32 L175 105 C175 158 140 188 100 205 C60 188 25 158 25 105 L25 32 Z" /></clipPath></defs>
      <path d="M100 8 L175 32 L175 105 C175 158 140 188 100 205 C60 188 25 158 25 105 L25 32 Z" fill="#0D1B2A" />
      <rect x="25" y="8" width="75" height="200" fill="#01411C" clipPath="url(#sc2)" />
      <rect x="100" y="8" width="75" height="200" fill="#B22234" clipPath="url(#sc2)" />
      <rect x="100" y="32" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="52" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="72" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="92" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="112" width="75" height="10" fill="white" opacity="0.85" clipPath="url(#sc2)" />
      <rect x="100" y="8" width="38" height="48" fill="#3C3B6E" clipPath="url(#sc2)" />
      <circle cx="108" cy="20" r="2.5" fill="white" /><circle cx="120" cy="20" r="2.5" fill="white" /><circle cx="132" cy="20" r="2.5" fill="white" />
      <circle cx="108" cy="34" r="2.5" fill="white" /><circle cx="120" cy="34" r="2.5" fill="white" /><circle cx="132" cy="34" r="2.5" fill="white" />
      <circle cx="62" cy="108" r="22" fill="none" stroke="white" strokeWidth="2" clipPath="url(#sc2)" />
      <circle cx="70" cy="108" r="16" fill="#01411C" clipPath="url(#sc2)" />
      <polygon points="78,95 80,103 89,103 82,108 85,117 78,112 71,117 74,108 67,103 76,103" fill="white" clipPath="url(#sc2)" />
      <line x1="100" y1="9" x2="100" y2="203" stroke="#C9A84C" strokeWidth="1.2" opacity="0.9" />
      <g transform="translate(100,118)">
        <line x1="-32" y1="0" x2="32" y2="0" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="-22" x2="0" y2="12" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="-25" r="3" fill="#C9A84C" />
        <line x1="-32" y1="0" x2="-27" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-32" y1="0" x2="-37" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-39" y1="14" x2="-25" y2="14" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="0" x2="27" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="32" y1="0" x2="37" y2="14" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="25" y1="14" x2="39" y2="14" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <path d="M100 8 L175 32 L175 105 C175 158 140 188 100 205 C60 188 25 158 25 105 L25 32 Z" fill="none" stroke="#C9A84C" strokeWidth="2" />
      <text x="100" y="218" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" fill="#C9A84C" letterSpacing="4">ARK</text>
    </svg>
  );
}

export default function App() {
  var jurS = useState("both"); var jur = jurS[0]; var setJur = jurS[1];
  var areaS = useState("general"); var area = areaS[0]; var setArea = areaS[1];
  var msgS = useState([]); var messages = msgS[0]; var setMessages = msgS[1];
  var inpS = useState(""); var input = inpS[0]; var setInput = inpS[1];
  var loadS = useState(false); var loading = loadS[0]; var setLoading = loadS[1];
  var greetS = useState(false); var greeted = greetS[0]; var setGreeted = greetS[1];
  var newsS = useState(DEFAULT_NEWS.concat(DEFAULT_NEWS)); var newsItems = newsS[0]; var setNewsItems = newsS[1];
  var leftS = useState(false); var showLeft = leftS[0]; var setShowLeft = leftS[1];
  var rightS = useState(false); var showRight = rightS[0]; var setShowRight = rightS[1];
  var popupS = useState(false); var showPopup = popupS[0]; var setShowPopup = popupS[1];
  var codeS = useState(""); var codeInput = codeS[0]; var setCodeInput = codeS[1];
  var codeMsgS = useState(""); var codeMsg = codeMsgS[0]; var setCodeMsg = codeMsgS[1];
  var successS = useState(false); var showSuccess = successS[0]; var setShowSuccess = successS[1];
  var timerS = useState(180); var guestMinsLeft = timerS[0]; var setGuestMinsLeft = timerS[1];
  var newsPopupS = useState(null); var newsPopup = newsPopupS[0]; var setNewsPopup = newsPopupS[1];
  var newsAnswerS = useState(""); var newsAnswer = newsAnswerS[0]; var setNewsAnswer = newsAnswerS[1];
  var newsLoadingS = useState(false); var newsLoading = newsLoadingS[0]; var setNewsLoading = newsLoadingS[1];
  var docFileS = useState(null); var docFile = docFileS[0]; var setDocFile = docFileS[1];
  var docTextS = useState(""); var docText = docTextS[0]; var setDocText = docTextS[1];
  var docResultS = useState(""); var docResult = docResultS[0]; var setDocResult = docResultS[1];
  var docErrorS = useState(""); var docError = docErrorS[0]; var setDocError = docErrorS[1];
  var docStepS = useState("upload"); var docStep = docStepS[0]; var setDocStep = docStepS[1];
  var showDraftS = useState(false); var showDraft = showDraftS[0]; var setShowDraft = showDraftS[1];
  var draftTitleS = useState(""); var draftTitle = draftTitleS[0]; var setDraftTitle = draftTitleS[1];
  var draftBodyS = useState(""); var draftBody = draftBodyS[0]; var setDraftBody = draftBodyS[1];
  var draftTypeS = useState("Contract"); var draftType = draftTypeS[0]; var setDraftType = draftTypeS[1];
  var draftLoadingS = useState(false); var draftLoading = draftLoadingS[0]; var setDraftLoading = draftLoadingS[1];
  var messagesEnd = useRef(null);
  var history = useRef([]);
  var draftAreaRef = useRef(null);
  var userInfo = useUser(); var user = userInfo.user;
  var clerk = useClerk();
  var router = useRouter();
  var conductDouble = CONDUCT.concat(CONDUCT);
  var trialDaysLeft = 7;
  if (user && user.createdAt) {
    var msPerDay = 1000 * 60 * 60 * 24;
    var daysSince = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / msPerDay);
    trialDaysLeft = Math.max(0, 7 - daysSince);
  }

  var jurConfig = {
    pk: { color: ACCENT_PK, bg: "rgba(62,180,137,0.08)", banner: "Answering under Pakistani law" },
    us: { color: ACCENT_US, bg: "rgba(91,141,217,0.08)", banner: "Answering under US law" },
    both: { color: GOLD, bg: "rgba(201,168,76,0.08)", banner: "Answering under both Pakistani and US law" },
  };

  useEffect(function() {
    if (messagesEnd.current) messagesEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(function() {
    if (user) return;
    var now = Date.now();
    var cookieMatch = document.cookie.match(/ark_guest_start=(\d+)/);
    var start;
    if (cookieMatch) {
      start = parseInt(cookieMatch[1]);
      if (now - start > 180 * 60 * 1000) { start = now; document.cookie = "ark_guest_start=" + start + "; path=/; max-age=14400"; }
    } else {
      start = now; document.cookie = "ark_guest_start=" + start + "; path=/; max-age=14400";
    }
    setGuestMinsLeft(Math.max(0, 180 - Math.floor((now - start) / 60000)));
    var interval = setInterval(function() {
      setGuestMinsLeft(Math.max(0, 180 - Math.floor((Date.now() - start) / 60000)));
    }, 10000);
    return function() { clearInterval(interval); };
  }, [user]);

  useEffect(function() {
    if (!greeted) {
      setGreeted(true);
      var greeting = "Welcome to ARK Law AI! Before we begin, may I know your name?";
      history.current = [{ role: "assistant", content: greeting }];
      setMessages([{ type: "ai", text: greeting, jur: "both" }]);
    }
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: "You are a legal news aggregator. Return ONLY a JSON array of 16 legal news headlines, 8 from Pakistan and 8 from USA. Each: {\"text\":\"headline max 80 chars\",\"pk\":true or false}. Just the JSON array.",
        messages: [{ role: "user", content: "Give me 16 current legal news headlines as JSON array." }],
      }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      try {
        var clean = data.reply.replace(/```json/g, "").replace(/```/g, "").trim();
        var items = JSON.parse(clean);
        if (Array.isArray(items) && items.length > 0) setNewsItems(items.concat(items));
      } catch(e) {}
    }).catch(function() {});
  }, []);

  function openNewsPopup(item) {
    setNewsPopup(item); setNewsAnswer(""); setNewsLoading(true);
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: "You are ARK Law AI, a professional legal news analyst. Explain the legal significance, relevant laws, and implications of the given headline. Cite specific statutes or cases. End with: This is for research only and not a substitute for legal counsel.",
        messages: [{ role: "user", content: "Explain this legal news: " + item.text }],
      }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      setNewsAnswer(data.reply || "Unable to load."); setNewsLoading(false);
    }).catch(function() { setNewsAnswer("Unable to load."); setNewsLoading(false); });
  }

  function handleDocUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    setDocFile(file); setDocResult(""); setDocError(""); setDocStep("reading");
    var ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      var reader = new FileReader();
      reader.onload = function(ev) {
        var text = "";
        try {
          var arr = new Uint8Array(ev.target.result); var str = "";
          for (var i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
          var matches = str.match(/BT[\s\S]*?ET/g) || [];
          matches.forEach(function(m) { var t = m.match(/\(([^)]+)\)/g) || []; t.forEach(function(s) { text += s.replace(/[()]/g, "") + " "; }); });
          if (text.trim().length < 50) text = str.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 8000);
        } catch(err) { text = "Could not extract PDF text."; }
        setDocText(text || "PDF extraction limited. Try DOCX for better results."); setDocStep("ready");
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === "docx" || ext === "doc") {
      var script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
      script.onload = function() {
        var reader2 = new FileReader();
        reader2.onload = function(ev2) {
          window.mammoth.extractRawText({ arrayBuffer: ev2.target.result })
            .then(function(result) { setDocText(result.value || "Could not extract text."); setDocStep("ready"); })
            .catch(function() { setDocText("Could not read document."); setDocStep("ready"); });
        };
        reader2.readAsArrayBuffer(file);
      };
      document.head.appendChild(script);
    } else { setDocError("Please upload a PDF, DOCX or DOC file."); setDocStep("upload"); }
  }

  function analyzeDoc() {
    if (!docText.trim()) return;
    setDocStep("analyzing");
    var sysDoc = "You are ARK Law AI, an expert legal document analyst. Analyze the provided document under " +
      (jur === "pk" ? "Pakistani law (PPC, CrPC, Constitution 1973, Companies Act 2017, MFLO 1961)" : jur === "us" ? "US law (federal legislation, UCC, US Constitution)" : "both Pakistani and US law") +
      ". Provide: 1) Document summary, 2) Legal issues or risks, 3) Improvement suggestions with citations, 4) Revised clauses where applicable. End with a research-only disclaimer.";
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: sysDoc, messages: [{ role: "user", content: "Analyze this legal document:\n\n" + docText.slice(0, 8000) }] }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) throw new Error(data.error);
      setDocResult(data.reply); setDocStep("done");
    }).catch(function(err) { setDocError("Error: " + err.message); setDocStep("ready"); });
  }

  function downloadDocResult() {
    var content = "ARK LAW AI — LEGAL DOCUMENT ANALYSIS\n=====================================\n";
    content += "Document: " + (docFile ? docFile.name : "Unknown") + "\nDate: " + new Date().toLocaleDateString() + "\nJurisdiction: " + (jur === "pk" ? "Pakistan" : jur === "us" ? "USA" : "Pakistan & USA") + "\n\n";
    content += docResult.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") + "\n\n";
    content += "=====================================\nFor research only — not a substitute for qualified legal counsel.\nARK LAW AI — The Legal Intelligence Engine by Attorney & AI Innovator Khawer Rabbani\n";
    var blob = new Blob([content], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = "ARK_Legal_Analysis_" + new Date().toISOString().slice(0, 10) + ".txt"; a.click(); URL.revokeObjectURL(url);
  }

  function applyFormat(tag) {
    var ta = draftAreaRef.current; if (!ta) return;
    var start = ta.selectionStart; var end = ta.selectionEnd;
    var sel = draftBody.slice(start, end);
    var before = draftBody.slice(0, start); var after = draftBody.slice(end);
    var result = draftBody;
    if (tag === "bold") result = before + "**" + sel + "**" + after;
    else if (tag === "h1") result = before + "\n# " + sel + "\n" + after;
    else if (tag === "h2") result = before + "\n## " + sel + "\n" + after;
    else if (tag === "bullet") result = before + "\n- " + sel + after;
    else if (tag === "upper") result = before + sel.toUpperCase() + after;
    else if (tag === "clear") result = before + sel.replace(/\*\*|#+ |^- /gm, "") + after;
    setDraftBody(result);
  }

  function aiDraftAssist() {
    if (!draftTitle.trim()) return;
    setDraftLoading(true);
    var sys = "You are ARK Law AI, an expert legal document drafter. Draft a complete professional legal document under " +
      (jur === "pk" ? "Pakistani law" : jur === "us" ? "US law" : "both Pakistani and US law") +
      ". Use proper legal language, structure, and formatting. Include all necessary clauses, definitions, and signature blocks.";
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: sys,
        messages: [{ role: "user", content: "Draft a complete " + draftType + " titled: " + draftTitle + (draftBody.trim() ? "\n\nAdditional instructions:\n" + draftBody : "") }],
      }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.reply) setDraftBody(data.reply.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
      setDraftLoading(false);
    }).catch(function() { setDraftLoading(false); });
  }

  function downloadDraft(format) {
    var content = draftTitle + "\n" + "=".repeat(Math.min(draftTitle.length, 60)) + "\n\n" + draftBody;
    if (format === "doc" || format === "docx") {
      var html = "<html><head><meta charset='utf-8'><style>body{font-family:Times New Roman,serif;font-size:12pt;margin:2cm;line-height:1.6}h1{font-size:16pt;text-align:center}h2{font-size:14pt}strong{font-weight:bold}</style></head><body>";
      html += "<h1>" + draftTitle + "</h1>";
      html += "<p><em>" + draftType + " | " + (jur==="pk"?"Pakistan":jur==="us"?"USA":"Pakistan & USA") + " | " + new Date().toLocaleDateString() + "</em></p><hr>";
      html += "<div>" + draftBody.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/\n/g,"<br>") + "</div>";
      html += "<p style='margin-top:40px;font-size:9pt;color:#666'>Generated by ARK LAW AI | For research only — not a substitute for legal counsel</p></body></html>";
      var blob = new Blob([html], { type: "application/msword" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.download = draftTitle.replace(/\s+/g,"_") + "." + format; a.click(); URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      var win = window.open("", "_blank");
      win.document.write("<html><head><title>" + draftTitle + "</title><style>body{font-family:Times New Roman,serif;font-size:12pt;margin:2cm;line-height:1.8}h1{font-size:16pt;text-align:center}h2{font-size:13pt}strong{font-weight:bold}.footer{margin-top:40px;font-size:8pt;color:#888;border-top:1px solid #ccc;padding-top:8pt}@media print{.footer{position:fixed;bottom:0}}</style></head><body>");
      win.document.write("<h1>" + draftTitle + "</h1><p style='text-align:center;color:#666;font-size:10pt'>" + draftType + " | " + (jur==="pk"?"Pakistan Law":jur==="us"?"US Law":"Pakistan & US Law") + " | " + new Date().toLocaleDateString() + "</p><hr style='margin:16pt 0'>");
      win.document.write("<div>" + draftBody.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/\n/g,"<br>") + "</div>");
      win.document.write("<div class='footer'>Generated by ARK LAW AI — The Legal Intelligence Engine by Attorney & AI Innovator Khawer Rabbani | For research only — not a substitute for legal counsel</div></body></html>");
      win.document.close(); setTimeout(function() { win.print(); }, 500);
    }
  }

  function submitCode() {
    if (codeInput.trim().toUpperCase() === "JUSTICESARABBANI") {
      document.cookie = "ark_guest_start=" + Date.now() + "; path=/; max-age=86400";
      setGuestMinsLeft(1440); setShowPopup(false); setCodeInput(""); setCodeMsg(""); setShowSuccess(true);
    } else { setCodeMsg("error"); }
  }

  function send(text) {
    var msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    history.current = history.current.concat([{ role: "user", content: msg }]);
    setMessages(function(prev) { return prev.concat([{ type: "user", text: msg }]); });
    setLoading(true);
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: buildSystem(area, jur), messages: history.current }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) throw new Error(data.error);
      history.current = history.current.concat([{ role: "assistant", content: data.reply }]);
      setMessages(function(prev) { return prev.concat([{ type: "ai", text: data.reply, jur: jur }]); });
    }).catch(function(err) {
      history.current = history.current.slice(0, -1);
      setMessages(function(prev) { return prev.concat([{ type: "error", text: "Error: " + err.message }]); });
    }).finally(function() { setLoading(false); });
  }

  return (
    <div>
      <Head>
        <title>ARK LAW AI — The Legal Intelligence Engine by Attorney & AI Innovator Khawer Rabbani</title>
        <meta name="description" content="ARK LAW AI — The Legal Intelligence Engine for Pakistani and US law." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:title" content="ARK LAW AI — The Legal Intelligence Engine by Attorney & AI Innovator Khawer Rabbani" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <style>{[
        "* { box-sizing: border-box; margin: 0; padding: 0; }",
        "html, body { height: 100%; background: #0D1B2A; }",
        "#__next { height: 100%; }",
        "@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }",
        "@keyframes tickerScrollH { 0%{ transform: translateX(0); } 100%{ transform: translateX(-50%); } }",
        "@keyframes tickerScroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }",
        "::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#2B3F57;border-radius:3px}",
        "input::placeholder{color:#6E8099} textarea::placeholder{color:#6E8099}",
        ".qbtn:hover{border-color:#C9A84C!important;color:#C9A84C!important}",
        ".abtn:hover{background:#1E2D40!important;color:#C9A84C!important}",
        "#conduct-ticker{animation:tickerScroll 70s linear infinite}",
        "#conduct-ticker:hover{animation-play-state:paused}",
        ".left-panel{display:flex} .right-panel{display:flex}",
        "@media(max-width:768px){.left-panel{display:none!important}.right-panel{display:none!important}.desktop-auth{display:none!important}.mobile-menu-bar{display:flex!important}}",
        ".mobile-menu-bar{display:none}",
        ".mobile-drawer{position:fixed;top:0;left:0;right:0;bottom:0;z-index:100;background:rgba(0,0,0,0.7)}",
        ".mobile-panel{position:fixed;bottom:0;left:0;right:0;background:#162032;border-top:1px solid #2B3F57;border-radius:16px 16px 0 0;max-height:80vh;overflow-y:auto;padding:16px}",
      ].join(" ")}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:NAVY, color:TEXT_PRIMARY, fontFamily:"'Segoe UI',sans-serif" }}>

        {/* HEADER */}
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 10px", height:76, borderBottom:"1px solid "+NAVY_BORDER, background:"#1E3A5F", flexShrink:0, gap:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
            <ArkLogo size={54} />
            <div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:GOLD }}>ARK LAW AI</div>
              <div style={{ fontSize:10, color:TEXT_MUTED, textTransform:"uppercase", letterSpacing:".04em" }}>The Legal Intelligence Engine</div>
              <div style={{ fontSize:10, color:ACCENT_PK }}>by Atty. & AI Innovator Khawer Rabbani</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }} className="desktop-auth">
            {!user && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ background:guestMinsLeft>60?"rgba(62,180,137,0.1)":"rgba(224,85,85,0.1)", border:"1px solid "+(guestMinsLeft>60?ACCENT_PK:"#E05555"), borderRadius:20, padding:"4px 10px", fontSize:10, color:guestMinsLeft>60?ACCENT_PK:"#E05555", fontWeight:600, whiteSpace:"nowrap" }}>
                  {"⏱ "+(guestMinsLeft>=60?Math.floor(guestMinsLeft/60)+"h "+(guestMinsLeft%60)+"m":guestMinsLeft+"m")}
                </div>
                <button onClick={function(){setShowPopup(true);}} style={{ background:"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:20, padding:"5px 10px", color:NAVY, fontFamily:"inherit", fontSize:10, fontWeight:700, cursor:"pointer" }}>✨ More time?</button>
                <button onClick={function(){window.location.href="/sign-up";}} style={{ background:"linear-gradient(135deg,#C9A84C,#a07830)", border:"none", borderRadius:20, padding:"5px 10px", color:NAVY, fontFamily:"inherit", fontSize:10, fontWeight:700, cursor:"pointer" }}>⭐ Free Trial</button>
                <button onClick={function(){window.location.href="/sign-in";}} style={{ background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:20, padding:"5px 10px", color:TEXT_SECONDARY, fontFamily:"inherit", fontSize:10, cursor:"pointer" }}>🔑 Login</button>
              </div>
            )}
            {user && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ background:trialDaysLeft>0?"rgba(62,180,137,0.15)":"rgba(224,85,85,0.15)", border:"1px solid "+(trialDaysLeft>0?ACCENT_PK:"#E05555"), borderRadius:20, padding:"4px 10px", fontSize:10, color:trialDaysLeft>0?ACCENT_PK:"#E05555", fontWeight:600 }}>
                  {trialDaysLeft>0?"⭐ "+trialDaysLeft+"d left":"⚠️ Expired"}
                </div>
                <div style={{ background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:20, padding:"4px 10px", fontSize:10, color:TEXT_SECONDARY }}>
                  {"👤 "+(user.unsafeMetadata&&user.unsafeMetadata.fullName?user.unsafeMetadata.fullName:(user.firstName||user.emailAddresses[0].emailAddress.split("@")[0]))}
                </div>
                <button onClick={function(){clerk.signOut();}} style={{ background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:20, padding:"4px 10px", color:TEXT_MUTED, fontFamily:"inherit", fontSize:10, cursor:"pointer" }}>Out</button>
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
            <div style={{ display:"flex", gap:2, background:NAVY, border:"1px solid "+NAVY_BORDER, borderRadius:30, padding:3 }}>
              <button style={{ border:"none", borderRadius:30, padding:"4px 12px", fontSize:12, cursor:"default", background:"rgba(201,168,76,0.2)", color:GOLD, fontFamily:"inherit", fontWeight:500 }}>EN</button>
              <button disabled style={{ border:"none", borderRadius:30, padding:"4px 12px", fontSize:12, cursor:"not-allowed", background:"transparent", color:TEXT_MUTED, fontFamily:"inherit", fontWeight:500, opacity:0.4 }} title="Urdu — Coming Soon">اردو</button>
            </div>
            <div style={{ display:"flex", gap:2, background:NAVY, border:"1px solid "+NAVY_BORDER, borderRadius:30, padding:3 }}>
              {[["pk","🇵🇰 PK"],["both","⚖ Both"],["us","🇺🇸 US"]].map(function(item) {
                var j=item[0]; var lbl=item[1];
                return <button key={j} onClick={function(){setJur(j);}} style={{ border:"none", borderRadius:30, padding:"4px 10px", fontSize:12, cursor:"pointer", background:jur===j?(j==="pk"?"rgba(62,180,137,0.15)":j==="us"?"rgba(91,141,217,0.15)":"rgba(201,168,76,0.15)"):"transparent", color:jur===j?jurConfig[j].color:TEXT_MUTED, fontFamily:"inherit" }}>{lbl}</button>;
              })}
            </div>
          </div>
        </header>

        {/* NEWS TICKER */}
        <div style={{ background:NAVY, borderBottom:"1px solid "+NAVY_BORDER, height:36, overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center" }}>
          <div style={{ background:GOLD, color:NAVY, fontSize:12, fontWeight:700, padding:"0 16px", height:"100%", display:"flex", alignItems:"center", flexShrink:0, letterSpacing:".06em", whiteSpace:"nowrap" }}>⚖ NEWS</div>
          <div style={{ flex:1, overflow:"hidden", height:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", height:"100%", animation:"tickerScrollH 480s linear infinite", width:"max-content" }}>
              {newsItems.concat(newsItems).map(function(item,i) {
                return <span key={i} onClick={function(){openNewsPopup(item);}} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"0 32px", fontSize:13, color:item.pk?ACCENT_PK:ACCENT_US, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{item.pk?"🇵🇰":"🇺🇸"}&nbsp;{item.text}&nbsp;<span style={{ color:NAVY_BORDER, fontSize:9 }}>◆</span></span>;
              })}
            </div>
          </div>
        </div>

        {/* MOBILE MENU BAR */}
        <div className="mobile-menu-bar" style={{ background:NAVY_MID, borderBottom:"1px solid "+NAVY_BORDER, padding:"6px 12px", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {!user && (
            <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, flexWrap:"wrap" }}>
              <div style={{ background:guestMinsLeft>60?"rgba(62,180,137,0.1)":"rgba(224,85,85,0.1)", border:"1px solid "+(guestMinsLeft>60?ACCENT_PK:"#E05555"), borderRadius:20, padding:"4px 10px", fontSize:10, color:guestMinsLeft>60?ACCENT_PK:"#E05555", fontWeight:600 }}>
                {"⏱ "+(guestMinsLeft>=60?Math.floor(guestMinsLeft/60)+"h "+(guestMinsLeft%60)+"m":guestMinsLeft+"m")+" free"}
              </div>
              <button onClick={function(){setShowPopup(true);}} style={{ background:"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:20, padding:"4px 10px", color:NAVY, fontFamily:"inherit", fontSize:10, fontWeight:700, cursor:"pointer" }}>✨ More time?</button>
              <button onClick={function(){window.location.href="/sign-up";}} style={{ background:"linear-gradient(135deg,#C9A84C,#a07830)", border:"none", borderRadius:20, padding:"4px 10px", color:NAVY, fontFamily:"inherit", fontSize:10, fontWeight:700, cursor:"pointer" }}>⭐ Free Trial</button>
              <button onClick={function(){window.location.href="/sign-in";}} style={{ background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:20, padding:"4px 10px", color:TEXT_SECONDARY, fontFamily:"inherit", fontSize:10, cursor:"pointer" }}>🔑 Login</button>
            </div>
          )}
          {user && (
            <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
              <div style={{ background:trialDaysLeft>0?"rgba(62,180,137,0.15)":"rgba(224,85,85,0.15)", border:"1px solid "+(trialDaysLeft>0?ACCENT_PK:"#E05555"), borderRadius:20, padding:"4px 10px", fontSize:10, color:trialDaysLeft>0?ACCENT_PK:"#E05555", fontWeight:600 }}>
                {trialDaysLeft>0?"⭐ "+trialDaysLeft+"d left":"⚠️ Expired"}
              </div>
              <div style={{ background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:20, padding:"4px 10px", fontSize:10, color:TEXT_SECONDARY }}>
                {"👤 "+(user.unsafeMetadata&&user.unsafeMetadata.fullName?user.unsafeMetadata.fullName:(user.firstName||user.emailAddresses[0].emailAddress.split("@")[0]))}
              </div>
              <button onClick={function(){clerk.signOut();}} style={{ background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:20, padding:"4px 10px", color:TEXT_MUTED, fontFamily:"inherit", fontSize:10, cursor:"pointer" }}>Sign out</button>
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={function(){setShowLeft(true);}} style={{ background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:8, padding:"5px 10px", color:GOLD, fontFamily:"inherit", fontSize:11, cursor:"pointer" }}>📜 Conduct</button>
            <button onClick={function(){setShowRight(true);}} style={{ background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:8, padding:"5px 10px", color:GOLD, fontFamily:"inherit", fontSize:11, cursor:"pointer" }}>⚖️ Menu</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

          {/* LEFT BAR */}
          <div className="left-panel" style={{ width:270, flexShrink:0, borderRight:"1px solid "+NAVY_BORDER, background:NAVY_MID, flexDirection:"column", overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center", padding:"10px 8px 8px", borderBottom:"1px solid "+NAVY_BORDER, flexShrink:0, background:NAVY }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:54, height:54, borderRadius:"50%", border:"2px solid "+ACCENT_PK, overflow:"hidden", margin:"0 auto 4px" }}>
                  <img src="/jinnah.jpeg" alt="Jinnah" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                </div>
                <div style={{ fontSize:9, color:ACCENT_PK, fontWeight:600 }}>FOUNDER OF PAKISTAN</div>
                <div style={{ fontSize:8, color:TEXT_MUTED }}>Quaid-e-Azam M. A. Jinnah</div>
              </div>
              <div style={{ fontSize:14, color:GOLD, fontWeight:700 }}>⚖</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:54, height:54, borderRadius:"50%", border:"2px solid "+ACCENT_US, overflow:"hidden", margin:"0 auto 4px" }}>
                  <img src="/washington.jpeg" alt="Washington" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                </div>
                <div style={{ fontSize:9, color:ACCENT_US, fontWeight:600 }}>USA — FOUNDING FATHER</div>
                <div style={{ fontSize:8, color:TEXT_MUTED }}>G. Washington</div>
              </div>
            </div>
            <div style={{ padding:"6px 10px", borderBottom:"1px solid "+NAVY_BORDER, flexShrink:0, textAlign:"center" }}>
              <div style={{ fontSize:10, fontWeight:700, color:GOLD, letterSpacing:".1em", textTransform:"uppercase" }}>Attorney Code of Conduct</div>
            </div>
            <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
              <div id="conduct-ticker" style={{ position:"absolute", top:0, left:0, right:0 }}>
                {conductDouble.map(function(item,i) {
                  return (
                    <div key={i} style={{ padding:"7px 12px", borderBottom:"1px solid rgba(43,63,87,0.5)", display:"flex", gap:7, alignItems:"flex-start" }}>
                      <span style={{ fontSize:11, flexShrink:0, marginTop:1 }}>{item.pk?"🇵🇰":"🇺🇸"}</span>
                      <span style={{ fontSize:11, color:TEXT_SECONDARY, lineHeight:1.5 }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CHAT */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"6px 16px", fontSize:12, fontWeight:500, borderBottom:"1px solid "+NAVY_BORDER, flexShrink:0, background:jurConfig[jur].bg, color:jurConfig[jur].color, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:jurConfig[jur].color, flexShrink:0 }} />
              {jurConfig[jur].banner}
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:12 }}>
              {messages.map(function(msg,i) {
                var isUser=msg.type==="user"; var isError=msg.type==="error";
                return (
                  <div key={i} style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", gap:8, maxWidth:760, marginLeft:isUser?"auto":0 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, overflow:"hidden", border:"1px solid "+(isUser?NAVY_BORDER:GOLD) }}>
                      {isUser ? <div style={{ width:"100%", height:"100%", background:NAVY_SURFACE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>👤</div>
                        : <img src="/khawer.jpeg" alt="ARK" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />}
                    </div>
                    <div style={{ padding:"10px 14px", borderRadius:isUser?"12px 4px 12px 12px":"4px 12px 12px 12px", background:isUser?"rgba(91,141,217,0.1)":isError?"rgba(224,85,85,0.1)":NAVY_SURFACE, border:"1px solid "+(isUser?"rgba(91,141,217,0.2)":isError?"rgba(224,85,85,0.3)":NAVY_BORDER), fontSize:13, lineHeight:1.8, color:TEXT_PRIMARY, maxWidth:640 }}
                      dangerouslySetInnerHTML={{ __html:isUser?msg.text.replace(/&/g,"&amp;").replace(/</g,"&lt;"):fmt(msg.text) }} />
                  </div>
                );
              })}
              {loading && (
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, overflow:"hidden", border:"1px solid "+GOLD }}>
                    <img src="/khawer.jpeg" alt="ARK" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                  </div>
                  <div style={{ padding:"10px 14px", borderRadius:"4px 12px 12px 12px", background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, display:"flex", gap:4, alignItems:"center" }}>
                    {[0,0.2,0.4].map(function(d,i){ return <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:GOLD,animation:"bounce 1.2s "+d+"s infinite ease-in-out" }} />; })}
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
            <div style={{ padding:"10px 12px 12px", borderTop:"1px solid "+NAVY_BORDER, background:NAVY_MID, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:NAVY_SURFACE, border:"1px solid "+GOLD, borderRadius:10, padding:"6px 10px" }}>
                <input value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"){e.preventDefault();send();}}}
                  placeholder="Ask about Pakistani or US law..."
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color:TEXT_PRIMARY, fontFamily:"inherit", fontSize:13, height:34 }} />
                <button onClick={function(){send();}} style={{ background:GOLD, border:"none", borderRadius:8, padding:"6px 18px", color:NAVY, fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer", height:34, flexShrink:0 }}>SEND</button>
              </div>
              <div style={{ textAlign:"center", marginTop:5, fontSize:10, color:TEXT_MUTED }}>
                ⚠️ For research only — not a substitute for legal counsel<br />
                <span style={{ color:GOLD, opacity:0.8, fontSize:9 }}>This AI Initiative is Dedicated to the Legacy, Legal Acumen and Wisdom of Honorable Mr. Justice S. A. Rabbani, Legendary Jurist of Pakistan</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="right-panel" style={{ width:240, flexShrink:0, borderLeft:"1px solid "+NAVY_BORDER, background:NAVY_MID, flexDirection:"column", overflowY:"auto", display:"flex" }}>
            <div style={{ fontSize:10, fontWeight:600, color:TEXT_MUTED, letterSpacing:".1em", textTransform:"uppercase", margin:"14px 12px 6px" }}>PRACTICE AREAS</div>
            {AREAS_EN.map(function(a) {
              return <button key={a.id} className="abtn" onClick={function(){setArea(a.id);}} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", border:"none", textAlign:"left", background:area===a.id?NAVY_SURFACE:"transparent", color:area===a.id?GOLD:TEXT_SECONDARY, fontFamily:"inherit", fontSize:13, padding:"7px 10px", borderRadius:7, cursor:"pointer", fontWeight:area===a.id?600:400 }}><span>{a.icon}</span>{a.label}</button>;
            })}

            <div style={{ height:1, background:NAVY_BORDER, margin:"8px 10px" }} />

            {/* DOCUMENT DRAFTING BUTTON */}
            <div style={{ margin:"4px 8px 4px" }}>
              <button onClick={function(){setShowDraft(true);}} style={{ width:"100%", background:"linear-gradient(135deg,#1a2a4a,#2a1a4a)", border:"1px solid "+ACCENT_US, borderRadius:12, padding:"12px", cursor:"pointer", textAlign:"left" }}
                onMouseOver={function(e){e.currentTarget.style.borderColor=GOLD;}}
                onMouseOut={function(e){e.currentTarget.style.borderColor=ACCENT_US;}}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:18 }}>✍️</span>
                  <div style={{ fontSize:12, fontWeight:700, color:GOLD }}>Legal Document Drafting</div>
                </div>
                <div style={{ fontSize:10, color:TEXT_MUTED, lineHeight:1.5 }}>Create & download legal documents with AI assistance</div>
                <div style={{ marginTop:7, display:"flex", gap:4 }}>
                  {["📄 DOC","📋 PDF","📝 DOCX"].map(function(f) {
                    return <span key={f} style={{ fontSize:9, color:ACCENT_US, background:"rgba(91,141,217,0.1)", border:"1px solid rgba(91,141,217,0.3)", borderRadius:4, padding:"2px 6px" }}>{f}</span>;
                  })}
                </div>
              </button>
            </div>

            {/* DOCUMENT ANALYZER */}
            <div style={{ margin:"4px 8px 4px", background:"linear-gradient(135deg,rgba(201,168,76,0.06),rgba(91,141,217,0.06))", border:"1px solid "+GOLD, borderRadius:12, overflow:"hidden", flexShrink:0 }}>
              <div style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.2),rgba(62,180,137,0.2))", padding:"10px 12px", borderBottom:"1px solid rgba(201,168,76,0.3)" }}>
                <div style={{ fontSize:12, fontWeight:700, color:GOLD }}>📄 Legal Document Analyzer</div>
                <div style={{ fontSize:10, color:TEXT_MUTED, marginTop:2 }}>Upload • Analyze • Download Report</div>
              </div>
              <div style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", gap:3, marginBottom:10 }}>
                  {["upload","ready","analyzing","done"].map(function(step,i) {
                    var steps=["upload","ready","analyzing","done"]; var cur=steps.indexOf(docStep==="reading"?"upload":docStep);
                    return <div key={step} style={{ flex:1, height:3, borderRadius:2, background:cur>i?GOLD:cur===i?ACCENT_US:NAVY_BORDER, transition:"background .3s" }} />;
                  })}
                </div>
                {(docStep==="upload"||docStep==="reading") && (
                  <label style={{ display:"block", cursor:"pointer" }}>
                    <div style={{ border:"2px dashed "+(docStep==="reading"?GOLD:NAVY_BORDER), borderRadius:10, padding:"14px 8px", textAlign:"center", background:"rgba(0,0,0,0.2)" }}>
                      {docStep==="reading" ? <div style={{ color:GOLD, fontSize:12 }}>⏳ Reading document...</div> : <>
                        <div style={{ fontSize:22, marginBottom:4 }}>📂</div>
                        <div style={{ fontSize:11, color:TEXT_SECONDARY, marginBottom:3 }}>Drop file here or click to browse</div>
                        <div style={{ fontSize:10, color:TEXT_MUTED }}>PDF • DOCX • DOC</div>
                      </>}
                    </div>
                    <input type="file" accept=".pdf,.docx,.doc" onChange={handleDocUpload} style={{ display:"none" }} />
                    {docError && <div style={{ fontSize:11, color:"#E05555", marginTop:6, textAlign:"center" }}>{docError}</div>}
                  </label>
                )}
                {docStep==="ready" && (
                  <div>
                    <div style={{ background:NAVY, border:"1px solid "+ACCENT_PK, borderRadius:8, padding:"7px 10px", marginBottom:8, display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ fontSize:14 }}>✅</span>
                      <div><div style={{ fontSize:10, color:ACCENT_PK, fontWeight:600 }}>{docFile&&docFile.name}</div><div style={{ fontSize:9, color:TEXT_MUTED }}>{docText.length} chars extracted</div></div>
                    </div>
                    <button onClick={analyzeDoc} style={{ width:"100%", background:"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:8, padding:"8px", color:NAVY, fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer", marginBottom:5 }}>⚖️ Analyze with ARK Law AI</button>
                    <button onClick={function(){setDocStep("upload");setDocFile(null);setDocText("");}} style={{ width:"100%", background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:8, padding:"5px", color:TEXT_MUTED, fontFamily:"inherit", fontSize:10, cursor:"pointer" }}>🔄 Upload different file</button>
                  </div>
                )}
                {docStep==="analyzing" && (
                  <div style={{ textAlign:"center", padding:"10px 0" }}>
                    <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:6 }}>{[0,0.2,0.4].map(function(d,i){ return <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:GOLD,animation:"bounce 1.2s "+d+"s infinite ease-in-out" }} />; })}</div>
                    <div style={{ fontSize:11, color:TEXT_SECONDARY }}>Analyzing document...</div>
                    <div style={{ fontSize:10, color:TEXT_MUTED, marginTop:3 }}>15–30 seconds</div>
                  </div>
                )}
                {docStep==="done" && docResult && (
                  <div>
                    <div style={{ background:"rgba(62,180,137,0.1)", border:"1px solid "+ACCENT_PK, borderRadius:8, padding:"7px 10px", marginBottom:7 }}>
                      <div style={{ fontSize:11, color:ACCENT_PK, fontWeight:600 }}>✅ Analysis Complete!</div>
                      <div style={{ fontSize:9, color:TEXT_MUTED, marginTop:2 }}>{docFile&&docFile.name}</div>
                    </div>
                    <button onClick={downloadDocResult} style={{ width:"100%", background:"linear-gradient(135deg,#3EB489,#2a7a5a)", border:"none", borderRadius:8, padding:"8px", color:"white", fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer", marginBottom:5 }}>⬇️ Download Analysis Report</button>
                    <button onClick={function(){setDocStep("upload");setDocFile(null);setDocText("");setDocResult("");}} style={{ width:"100%", background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:8, padding:"5px", color:TEXT_MUTED, fontFamily:"inherit", fontSize:10, cursor:"pointer" }}>🔄 Analyze another document</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ height:1, background:NAVY_BORDER, margin:"8px 10px" }} />
            <div style={{ fontSize:10, fontWeight:600, color:TEXT_MUTED, letterSpacing:".1em", textTransform:"uppercase", margin:"6px 12px" }}>QUICK QUERIES</div>
            {QUICK_EN.map(function(q,i) {
              return <button key={i} className="qbtn" onClick={function(){send(q);}} style={{ display:"block", width:"calc(100% - 16px)", margin:"0 8px 4px", background:"transparent", border:"1px solid "+NAVY_BORDER, color:TEXT_MUTED, fontFamily:"inherit", fontSize:11, padding:"6px 8px", borderRadius:7, cursor:"pointer", textAlign:"left", lineHeight:1.6 }}>{q}</button>;
            })}
          </div>
        </div>

        {/* MOBILE DRAWERS */}
        {showLeft && (
          <div className="mobile-drawer" onClick={function(){setShowLeft(false);}}>
            <div className="mobile-panel" onClick={function(e){e.stopPropagation();}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:GOLD }}>Attorney Code of Conduct</div>
                <button onClick={function(){setShowLeft(false);}} style={{ background:"transparent", border:"none", color:TEXT_MUTED, fontSize:20, cursor:"pointer" }}>✕</button>
              </div>
              {CONDUCT.map(function(item,i) {
                return <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid rgba(43,63,87,0.5)", display:"flex", gap:8 }}><span style={{ fontSize:12, flexShrink:0 }}>{item.pk?"🇵🇰":"🇺🇸"}</span><span style={{ fontSize:12, color:TEXT_SECONDARY, lineHeight:1.5 }}>{item.text}</span></div>;
              })}
            </div>
          </div>
        )}
        {showRight && (
          <div className="mobile-drawer" onClick={function(){setShowRight(false);}}>
            <div className="mobile-panel" onClick={function(e){e.stopPropagation();}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:GOLD }}>Practice Areas & Quick Queries</div>
                <button onClick={function(){setShowRight(false);}} style={{ background:"transparent", border:"none", color:TEXT_MUTED, fontSize:20, cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
                {AREAS_EN.map(function(a) {
                  return <button key={a.id} onClick={function(){setArea(a.id);setShowRight(false);}} style={{ display:"flex", alignItems:"center", gap:6, background:area===a.id?NAVY_SURFACE:NAVY, border:"1px solid "+(area===a.id?GOLD:NAVY_BORDER), color:area===a.id?GOLD:TEXT_SECONDARY, fontFamily:"inherit", fontSize:12, padding:"8px 10px", borderRadius:8, cursor:"pointer" }}><span>{a.icon}</span>{a.label}</button>;
                })}
              </div>
              {QUICK_EN.map(function(q,i) {
                return <button key={i} onClick={function(){send(q);setShowRight(false);}} style={{ display:"block", width:"100%", marginBottom:6, background:"transparent", border:"1px solid "+NAVY_BORDER, color:TEXT_MUTED, fontFamily:"inherit", fontSize:12, padding:"8px 10px", borderRadius:8, cursor:"pointer", textAlign:"left", lineHeight:1.5 }}>{q}</button>;
              })}
            </div>
          </div>
        )}

        {/* DOCUMENT DRAFTING POPUP */}
        {showDraft && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:997, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px" }}>
            <div style={{ background:NAVY_MID, border:"1px solid "+NAVY_BORDER, borderRadius:16, width:"100%", maxWidth:820, height:"90vh", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderBottom:"1px solid "+NAVY_BORDER, background:"linear-gradient(135deg,#1a2a4a,#1a1a3a)", borderRadius:"16px 16px 0 0", flexShrink:0 }}>
                <ArkLogo size={32} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, color:GOLD }}>ARK LAW AI — Legal Document Drafting</div>
                  <div style={{ fontSize:10, color:TEXT_MUTED, marginTop:1 }}>Create professional legal documents with AI assistance</div>
                </div>
                <button onClick={function(){setShowDraft(false);}} style={{ background:"rgba(224,85,85,0.15)", border:"1px solid rgba(224,85,85,0.4)", borderRadius:8, padding:"5px 12px", color:"#E05555", fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer" }}>✕ Close</button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderBottom:"1px solid "+NAVY_BORDER, background:NAVY, flexShrink:0, flexWrap:"wrap" }}>
                <select value={draftType} onChange={function(e){setDraftType(e.target.value);}} style={{ background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:6, padding:"4px 8px", color:TEXT_PRIMARY, fontFamily:"inherit", fontSize:11, cursor:"pointer" }}>
                  {DOC_TYPES.map(function(t){ return <option key={t} value={t}>{t}</option>; })}
                </select>
                <div style={{ width:1, height:20, background:NAVY_BORDER }} />
                {[["B","bold"],["H1","h1"],["H2","h2"],["•","bullet"],["↑","upper"],["✕","clear"]].map(function(item) {
                  return <button key={item[0]} onClick={function(){applyFormat(item[1]);}} style={{ background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:5, padding:"3px 8px", color:TEXT_SECONDARY, fontFamily:"inherit", fontSize:11, cursor:"pointer" }}>{item[0]}</button>;
                })}
                <div style={{ width:1, height:20, background:NAVY_BORDER }} />
                <button onClick={aiDraftAssist} disabled={draftLoading||!draftTitle.trim()} style={{ background:draftLoading||!draftTitle.trim()?"rgba(201,168,76,0.2)":"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:6, padding:"4px 12px", color:draftLoading||!draftTitle.trim()?GOLD:NAVY, fontFamily:"inherit", fontSize:11, fontWeight:700, cursor:draftLoading||!draftTitle.trim()?"not-allowed":"pointer" }}>
                  {draftLoading?"⏳ Drafting...":"✨ AI Draft"}
                </button>
                <div style={{ flex:1 }} />
                {[["DOC","doc",ACCENT_US],["PDF","pdf","#E05555"],["DOCX","docx",ACCENT_PK]].map(function(item) {
                  return <button key={item[0]} onClick={function(){downloadDraft(item[1]);}} disabled={!draftBody.trim()} style={{ background:"transparent", border:"1px solid "+item[2], borderRadius:6, padding:"4px 10px", color:item[2], fontFamily:"inherit", fontSize:11, fontWeight:600, cursor:draftBody.trim()?"pointer":"not-allowed", opacity:draftBody.trim()?1:0.4 }}>⬇️ {item[0]}</button>;
                })}
              </div>
              <div style={{ padding:"10px 16px 0", flexShrink:0 }}>
                <input value={draftTitle} onChange={function(e){setDraftTitle(e.target.value);}} placeholder="Document Title (e.g. Non-Disclosure Agreement between XYZ and ABC)"
                  style={{ width:"100%", background:NAVY_SURFACE, border:"1px solid "+(draftTitle?GOLD:NAVY_BORDER), borderRadius:8, padding:"10px 14px", color:TEXT_PRIMARY, fontFamily:"Georgia,serif", fontSize:15, fontWeight:600, outline:"none" }} />
              </div>
              <div style={{ display:"flex", gap:10, padding:"6px 16px", flexShrink:0 }}>
                <div style={{ fontSize:10, color:TEXT_MUTED }}>📋 <span style={{ color:ACCENT_US }}>{draftType}</span></div>
                <div style={{ fontSize:10, color:TEXT_MUTED }}>⚖️ <span style={{ color:GOLD }}>{jur==="pk"?"Pakistan Law":jur==="us"?"US Law":"Pakistan & US Law"}</span></div>
                <div style={{ fontSize:10, color:TEXT_MUTED }}>📅 {new Date().toLocaleDateString()}</div>
              </div>
              <div style={{ flex:1, padding:"0 16px 10px", overflow:"hidden", display:"flex", flexDirection:"column" }}>
                {draftLoading ? (
                  <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                    <div style={{ display:"flex", gap:5 }}>{[0,0.2,0.4].map(function(d,i){ return <div key={i} style={{ width:10,height:10,borderRadius:"50%",background:GOLD,animation:"bounce 1.2s "+d+"s infinite ease-in-out" }} />; })}</div>
                    <div style={{ fontSize:13, color:TEXT_SECONDARY }}>ARK Law AI is drafting your document...</div>
                    <div style={{ fontSize:11, color:TEXT_MUTED }}>This may take 15–30 seconds</div>
                  </div>
                ) : (
                  <textarea ref={draftAreaRef} value={draftBody} onChange={function(e){setDraftBody(e.target.value);}}
                    placeholder={"Start typing here...\n\nOr fill in the title above and click '✨ AI Draft' to generate a complete "+draftType+" automatically.\n\nTips:\n• Select text and click B for bold\n• H1 / H2 for headings\n• • for bullet points"}
                    style={{ flex:1, width:"100%", background:NAVY_SURFACE, border:"1px solid "+NAVY_BORDER, borderRadius:10, padding:"16px", color:TEXT_PRIMARY, fontFamily:"'Courier New',monospace", fontSize:12, lineHeight:1.8, resize:"none", outline:"none" }}
                  />
                )}
              </div>
              <div style={{ padding:"8px 16px", borderTop:"1px solid "+NAVY_BORDER, flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"center", background:NAVY }}>
                <div style={{ fontSize:10, color:TEXT_MUTED }}>{draftBody.trim()?draftBody.trim().split(/\s+/).length+" words | "+draftBody.length+" chars":"Start typing or use AI Draft"}</div>
                <div style={{ fontSize:10, color:TEXT_MUTED }}>⚠️ For research only — not a substitute for legal counsel</div>
              </div>
            </div>
          </div>
        )}

        {/* NEWS DETAIL POPUP */}
        {newsPopup && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:998, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
            <div style={{ background:NAVY_MID, border:"1px solid "+NAVY_BORDER, borderRadius:16, width:"100%", maxWidth:680, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 20px", borderBottom:"1px solid "+NAVY_BORDER, background:NAVY, borderRadius:"16px 16px 0 0", flexShrink:0 }}>
                <ArkLogo size={36} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:700, color:GOLD }}>ARK LAW AI — Legal News</div>
                  <div style={{ fontSize:11, color:newsPopup.pk?ACCENT_PK:ACCENT_US, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{newsPopup.pk?"🇵🇰 Pakistan":"🇺🇸 USA"} — {newsPopup.text}</div>
                </div>
                <button onClick={function(){setNewsPopup(null);setNewsAnswer("");}} style={{ background:"rgba(224,85,85,0.15)", border:"1px solid rgba(224,85,85,0.4)", borderRadius:8, padding:"6px 14px", color:"#E05555", fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer" }}>✕ Close</button>
              </div>
              <div style={{ padding:"14px 20px 10px", borderBottom:"1px solid "+NAVY_BORDER, flexShrink:0 }}>
                <div style={{ fontSize:15, fontWeight:700, color:TEXT_PRIMARY, lineHeight:1.5 }}>{newsPopup.text}</div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
                {newsLoading ? (
                  <div style={{ display:"flex", alignItems:"center", gap:10, color:TEXT_MUTED, fontSize:13 }}>
                    <div style={{ display:"flex", gap:4 }}>{[0,0.2,0.4].map(function(d,i){ return <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:GOLD,animation:"bounce 1.2s "+d+"s infinite ease-in-out" }} />; })}</div>
                    ARK Law AI is analysing this news...
                  </div>
                ) : <div style={{ fontSize:13, lineHeight:1.8, color:TEXT_SECONDARY }} dangerouslySetInnerHTML={{ __html:fmt(newsAnswer) }} />}
              </div>
              <div style={{ padding:"12px 20px", borderTop:"1px solid "+NAVY_BORDER, flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:10, color:TEXT_MUTED }}>⚠️ For research only — not a substitute for legal counsel</div>
                <button onClick={function(){setNewsPopup(null);setNewsAnswer("");}} style={{ background:"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:8, padding:"8px 20px", color:NAVY, fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer" }}>✕ Close Window</button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS POPUP */}
        {showSuccess && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 16px" }}>
            <div style={{ background:NAVY_MID, border:"2px solid "+GOLD, borderRadius:18, padding:"32px 28px", maxWidth:440, width:"100%", textAlign:"center" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><ArkLogo size={64} /></div>
              <div style={{ width:54, height:54, borderRadius:"50%", background:"rgba(62,180,137,0.15)", border:"2px solid "+ACCENT_PK, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:26 }}>✅</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:GOLD, marginBottom:6 }}>Magic Code Accepted!</div>
              <div style={{ height:1, background:"linear-gradient(to right,transparent,"+GOLD+",transparent)", margin:"10px 0 16px" }} />
              <div style={{ fontSize:13, color:TEXT_SECONDARY, lineHeight:1.8, marginBottom:24 }}>
                You have entered the correct magic code dedicated to <strong style={{ color:GOLD }}>Honorable Justice S. A. Rabbani</strong>, legendary jurist of Pakistan.<br /><br />
                Now you are able to utilize this <strong style={{ color:GOLD }}>AI Legal Assistant for 24 hours</strong> without even signing up for a 7-day free trial.
              </div>
              <button onClick={function(){setShowSuccess(false);}} style={{ background:"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:10, padding:"12px 48px", color:NAVY, fontFamily:"inherit", fontSize:14, fontWeight:700, cursor:"pointer" }}>OK — Let's Go! ⚖️</button>
            </div>
          </div>
        )}

        {/* CODE POPUP */}
        {showPopup && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 16px" }}>
            <div style={{ background:NAVY_MID, border:"1px solid "+GOLD, borderRadius:16, padding:"28px 24px", maxWidth:420, width:"100%", textAlign:"center" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><ArkLogo size={56} /></div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:GOLD, marginBottom:4 }}>ARK LAW AI</div>
              <div style={{ fontSize:11, color:TEXT_MUTED, marginBottom:18 }}>The Legal Intelligence Engine</div>
              <div style={{ fontSize:13, color:TEXT_SECONDARY, lineHeight:1.7, marginBottom:10 }}>To verify you are human and extend your free access to <strong style={{ color:GOLD }}>24 hours</strong>, enter the code below:</div>
              <div style={{ background:NAVY, border:"1px solid "+GOLD, borderRadius:10, padding:"10px 16px", marginBottom:14, fontSize:16, fontWeight:700, color:GOLD, letterSpacing:".15em" }}>JUSTICESARABBANI</div>
              <input type="text" value={codeInput} onChange={function(e){setCodeInput(e.target.value);setCodeMsg("");}} onKeyDown={function(e){if(e.key==="Enter")submitCode();}}
                placeholder="Type the code here..."
                style={{ width:"100%", background:NAVY_SURFACE, border:"1px solid "+(codeMsg==="error"?"#E05555":NAVY_BORDER), borderRadius:8, padding:"10px 14px", color:TEXT_PRIMARY, fontFamily:"inherit", fontSize:14, outline:"none", marginBottom:8, textAlign:"center", letterSpacing:".1em" }} />
              {codeMsg==="error" && <div style={{ fontSize:12, color:"#E05555", marginBottom:8 }}>❌ Incorrect code. Please try again.</div>}
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:8 }}>
                <button onClick={submitCode} style={{ background:"linear-gradient(135deg,#C9A84C,#8A6A1F)", border:"none", borderRadius:8, padding:"9px 24px", color:NAVY, fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer" }}>Submit Code</button>
                <button onClick={function(){setShowPopup(false);setCodeInput("");setCodeMsg("");}} style={{ background:"transparent", border:"1px solid "+NAVY_BORDER, borderRadius:8, padding:"9px 24px", color:TEXT_MUTED, fontFamily:"inherit", fontSize:13, cursor:"pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
