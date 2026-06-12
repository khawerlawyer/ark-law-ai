// pages/pakistan-tools.js
// ARK LAW AI — Legal Tools for Pakistan

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

const GREEN="#2E7D32", CREAM="#F5F0E8", CREAM_MID="#EDE8DF";
const BORDER="#C8BFB0", TEXT="#1A1209", MUTED="#7A6A55";

const TOOLS = [
  { id:"research",   icon:"🔍", label:"Legal Research",        desc:"Structured research with statutes & case law" },
  { id:"summarize",  icon:"📋", label:"Judgment Summary",       desc:"Paste a judgment, get a structured summary"  },
  { id:"redline",    icon:"📝", label:"Contract Redlining",     desc:"Risk-flag every clause with suggested rewrites" },
  { id:"compliance", icon:"⚠️", label:"Compliance Check",       desc:"Business compliance under Pakistani law"     },
  { id:"clauses",    icon:"📚", label:"Clause Library",         desc:"Standard clauses with 3 variations each"    },
];

const SYSTEM_PROMPTS = {
  research:
    "You are ARK Law AI, an expert Pakistani law research assistant. Provide structured legal research. Format your response with these sections: ## Legal Question, ## Applicable Law (with exact statute sections), ## Key Case Law (3-5 real Pakistani cases with court and year), ## Legal Analysis, ## Practical Guidance, ## Professional Disclaimer by ARK LAW AI. Only cite real Pakistani laws and real cases. If unsure of a citation, say so explicitly.",
  summarize:
    "You are ARK Law AI, a Pakistani law expert specializing in judgment analysis. Summarize the provided judgment using these exact sections: ## Case Name & Citation, ## Court & Bench, ## Parties (Appellant vs Respondent with brief description), ## Facts (5-8 bullet points), ## Legal Issues (numbered), ## Held (decision on each issue), ## Ratio Decidendi (binding legal principle), ## Obiter Dicta (non-binding observations if any), ## Legal Significance (what this case established), ## Professional Disclaimer by ARK LAW AI.",
  redline:
    "You are ARK Law AI, a Pakistani contract law specialist. Analyze the contract clause by clause. For each clause provide: the clause name/type, Risk Level (use exactly: HIGH RISK / MEDIUM RISK / LOW RISK / SAFE), the issue it poses under Pakistani law, and a Suggested Rewrite. Use this format: ### Clause: [name] then Risk Level: then Issue: then Under Pakistani Law: then Suggested Rewrite: [new clause text]. End with ## Overall Risk Assessment summarizing total HIGH/MEDIUM/LOW findings, ## Top 3 Priority Changes, and ## Professional Disclaimer by ARK LAW AI.",
  compliance:
    "You are ARK Law AI, a Pakistani regulatory compliance expert. Analyze the described business situation and provide: ## Compliance Risk Assessment - Pakistan, ## Applicable Regulatory Framework (list ALL relevant Pakistani laws, regulations, and regulatory bodies), ## HIGH RISK Issues (with specific law references and penalties), ## MEDIUM RISK Issues (with law references), ## LOW RISK Advisory (best practices), ## Required Registrations and Licenses (every required registration with the responsible authority), ## Required Actions in priority order (numbered), ## Penalties for Non-Compliance (specific penalties under Pakistani law for HIGH risk items), ## Professional Disclaimer by ARK LAW AI.",
  clauses:
    "You are ARK Law AI, a Pakistani contract drafting specialist. Provide a complete clause library entry. Include: ## Clause: [Clause Name] with Jurisdiction: Pakistan and Governed by: [relevant Pakistani law]. Then provide exactly 3 versions: ### Version 1 - Standard (Balanced) with Risk Level, Best used when, and full Clause Text in proper legal language. ### Version 2 - Client-Protective (Strong) with same subsections. ### Version 3 - Counterparty-Protective (use with caution) with same subsections. Then add: ## Negotiation Notes (key points to negotiate), ## Pakistani Law Context (relevant statutes, cases, regulations), ## Common Mistakes to Avoid (3-5 common drafting errors).",
};

const SUGGESTIONS = {
  research:   ["Grounds for divorce in Pakistan","Bail application under CrPC","Property rights of women under Muslim family law","Contract breach remedies under Contract Act 1872","FIR registration procedure","Cybercrime penalties under PECA 2016","Rights of tenants under Rent Restriction Ordinance"],
  summarize:  [],
  redline:    [],
  compliance: ["Technology Startup","E-commerce Business","Law Firm","Real Estate Developer","Financial Services / Fintech","NGO / Non-Profit","Manufacturing Company","Healthcare / Clinic","Import / Export Business","Employment Matter"],
  clauses:    ["Force Majeure","Arbitration","Confidentiality / NDA","Indemnification","Limitation of Liability","Termination","Governing Law","Intellectual Property","Non-Compete","Payment Terms","Warranty Disclaimer","Dispute Resolution","Liquidated Damages","Assignment","Severability"],
};

export default function PakistanTools() {
  const [activeTool, setActiveTool]   = useState("research");
  const [input,      setInput]        = useState("");
  const [secondary,  setSecondary]    = useState(""); // compliance type / clause search
  const [result,     setResult]       = useState("");
  const [loading,    setLoading]      = useState(false);
  const [error,      setError]        = useState("");

  const runTool = async () => {
    const q = activeTool === "clauses" ? secondary : input;
    if (!q.trim()) { setError("Please enter your question or paste your text."); return; }
    setLoading(true); setResult(""); setError("");

    const userMsg = activeTool === "research"   ? "Research question: " + q
                  : activeTool === "summarize"  ? "Please summarize this judgment:\n\n" + q.substring(0, 8000)
                  : activeTool === "redline"    ? "Please redline this contract:\n\n" + q.substring(0, 7000)
                  : activeTool === "compliance" ? "Assess compliance risks for:\n\nBusiness type: " + secondary + "\n\n" + input
                  : "Provide clause library entry for: " + q + " clause under Pakistani law";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [
          { role: "user", content: "[System: " + SYSTEM_PROMPTS[activeTool] + "]" },
          { role: "user", content: userMsg },
        ]}),
      });
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let out = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        dec.decode(value, { stream: true }).split("\n").forEach(line => {
          if (!line.startsWith("data: ")) return;
          const d = line.slice(6).trim();
          if (d === "[DONE]") return;
          try { const p = JSON.parse(d); if (p.content) { out += p.content; setResult(out); } } catch {}
        });
      }
    } catch (e) { setError("Error: " + e.message); }
    setLoading(false);
  };

  const renderResult = (text) => text.split("\n").map((line, i) => {
    if (line.startsWith("## "))    return <div key={i} style={{fontSize:17,fontWeight:800,color:TEXT,marginTop:22,marginBottom:8,paddingBottom:6,borderBottom:"2px solid #EDE8DF"}}>{line.slice(3)}</div>;
    if (line.startsWith("### "))   return <div key={i} style={{fontSize:14,fontWeight:700,color:GREEN,marginTop:14,marginBottom:6}}>{line.slice(4)}</div>;
    if (/^#+/.test(line))          return <div key={i} style={{fontSize:13,fontWeight:700,color:TEXT,marginTop:10,marginBottom:4}}>{line.replace(/^#+\s*/,"")}</div>;
    if (/HIGH RISK/.test(line))    return <div key={i} style={{padding:"6px 10px",background:"#FEF2F2",borderLeft:"3px solid #DC2626",borderRadius:"0 6px 6px 0",marginBottom:6,fontSize:13}}>{line}</div>;
    if (/MEDIUM RISK/.test(line))  return <div key={i} style={{padding:"6px 10px",background:"#FFFBEB",borderLeft:"3px solid #F59E0B",borderRadius:"0 6px 6px 0",marginBottom:6,fontSize:13}}>{line}</div>;
    if (/LOW RISK|SAFE/.test(line))return <div key={i} style={{padding:"6px 10px",background:"#F0FAF4",borderLeft:"3px solid #2E7D32",borderRadius:"0 6px 6px 0",marginBottom:6,fontSize:13}}>{line}</div>;
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) return <div key={i} style={{fontWeight:700,color:TEXT,marginBottom:3}}>{line.slice(2,-2)}</div>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:GREEN,flexShrink:0}}>•</span><span style={{fontSize:13}}>{line.slice(2)}</span></div>;
    if (/^\d+\./.test(line)) return <div key={i} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:GREEN,fontWeight:700,flexShrink:0}}>{line.match(/^\d+/)[0]}.</span><span style={{fontSize:13}}>{line.replace(/^\d+\.\s*/,"")}</span></div>;
    if (line.trim() === "---") return <hr key={i} style={{border:"none",borderTop:"1px solid #EDE8DF",margin:"12px 0"}}/>;
    if (!line.trim()) return <div key={i} style={{height:6}}/>;
    return <div key={i} style={{fontSize:13,color:"#3A2A18",marginBottom:3,lineHeight:1.7}}>{line}</div>;
  });

  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <>
      <Head>
        <title>ARK LAW AI — Legal Tools Pakistan</title>
        <meta name="description" content="Legal research, judgment summarization, contract redlining, compliance checks and clause library for Pakistani law."/>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:${CREAM};color:${TEXT};font-family:"DM Sans",sans-serif;min-height:100vh;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:${CREAM_MID};}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
        textarea,input{font-family:"DM Sans",sans-serif;}
        textarea:focus,input:focus{outline:none;border-color:${GREEN}!important;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .tool-tab{padding:9px 16px;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s;white-space:nowrap;display:flex;align-items:center;gap:6px;font-family:"DM Sans",sans-serif;}
        .tool-tab:hover{background:#F5F0E8;}
        .chip{padding:5px 12px;background:#F5F0E8;color:#3A2A18;border:1px solid ${BORDER};border-radius:20px;font-size:11px;cursor:pointer;font-weight:500;transition:all 0.15s;font-family:"DM Sans",sans-serif;}
        .chip:hover,.chip.active{background:${GREEN};color:white;border-color:${GREEN};}
        .run-btn{padding:11px 32px;background:${GREEN};color:white;border:none;border-radius:9px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;transition:background 0.15s;font-family:"DM Sans",sans-serif;}
        .run-btn:hover{background:#1B5E20;}
        .run-btn:disabled{background:#C8BFB0;cursor:not-allowed;}
      `}</style>

      {/* Header */}
      <div style={{background:CREAM_MID,borderBottom:`1px solid ${BORDER}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="/ark-logo-us.png" alt="ARK" style={{width:36,height:36,objectFit:"contain"}}/>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:"#021A4A",letterSpacing:"0.8px"}}>ARK LAW AI</div>
            <div style={{fontSize:10,color:MUTED}}>Legal Tools — Pakistan</div>
          </div>
        </div>
        <Link href="/pakistan" style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",background:"white",color:MUTED,border:`1px solid ${BORDER}`,borderRadius:8,textDecoration:"none",fontSize:12,fontWeight:600}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Back to Chat
        </Link>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px 60px"}}>

        {/* Title */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <h1 style={{fontSize:22,fontWeight:800,color:TEXT}}>Legal Tools</h1>
            <span style={{fontSize:11,color:MUTED,background:CREAM_MID,padding:"2px 10px",borderRadius:10,border:`1px solid ${BORDER}`}}>Pakistan Law</span>
          </div>
          <p style={{fontSize:13,color:MUTED}}>Powered by ARK LAW AI — select a tool and get structured legal output instantly.</p>
        </div>

        {/* Tool tabs */}
        <div style={{display:"flex",gap:2,borderBottom:`2px solid ${BORDER}`,overflowX:"auto",marginBottom:24}}>
          {TOOLS.map(t => (
            <button key={t.id} className="tool-tab"
              onClick={() => { setActiveTool(t.id); setResult(""); setError(""); setInput(""); setSecondary(""); }}
              style={{background:activeTool===t.id?CREAM:"transparent",color:activeTool===t.id?GREEN:MUTED,borderBottom:activeTool===t.id?`2px solid ${GREEN}`:"2px solid transparent",marginBottom:"-2px"}}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tool panel */}
        <div style={{background:"white",border:`1px solid ${BORDER}`,borderRadius:12,padding:24,marginBottom:20,boxShadow:"0 2px 12px rgba(180,160,100,0.08)"}}>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:17,fontWeight:800,color:TEXT,marginBottom:4}}>{tool.icon} {tool.label}</div>
            <div style={{fontSize:13,color:MUTED}}>{tool.desc}</div>
          </div>

          {/* Compliance: type selector first */}
          {activeTool === "compliance" && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:GREEN,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.6px"}}>Business Type (optional)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {SUGGESTIONS.compliance.map(s => (
                  <button key={s} className={"chip" + (secondary===s?" active":"")} onClick={() => setSecondary(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Clause library: search input */}
          {activeTool === "clauses" ? (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:GREEN,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.6px"}}>Select or Search Clause Type</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
                {SUGGESTIONS.clauses.map(s => (
                  <button key={s} className={"chip" + (secondary===s?" active":"")} onClick={() => setSecondary(s)}>{s}</button>
                ))}
              </div>
              <input value={secondary} onChange={e => setSecondary(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") runTool(); }}
                placeholder="Or type a custom clause e.g. liquidated damages, step-in rights..."
                style={{width:"100%",padding:"10px 14px",background:"#FAF8F4",border:`1px solid ${BORDER}`,borderRadius:8,fontSize:13,color:TEXT}}/>
            </div>
          ) : (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:GREEN,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.6px"}}>
                {activeTool==="research" ? "Your Legal Question" : activeTool==="summarize" ? "Paste Judgment Text" : activeTool==="redline" ? "Paste Contract Text" : "Describe Your Situation"}
              </div>
              {/* Quick suggestions for research */}
              {activeTool === "research" && (
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
                  {SUGGESTIONS.research.map(s => (
                    <button key={s} className="chip" onClick={() => setInput(s)}>{s}</button>
                  ))}
                </div>
              )}
              <textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder={
                  activeTool==="research"   ? "e.g. What are the grounds for dissolution of marriage under Pakistani law? What statutes and cases apply?" :
                  activeTool==="summarize"  ? "Paste the full text of the court judgment here..." :
                  activeTool==="redline"    ? "Paste the contract text here — employment agreement, sale deed, lease, service contract, etc." :
                  "Describe your business activities, location, employee count, specific concerns..."
                }
                style={{width:"100%",minHeight:activeTool==="summarize"||activeTool==="redline"?200:120,padding:"10px 14px",background:"#FAF8F4",border:`1px solid ${BORDER}`,borderRadius:8,fontSize:13,color:TEXT,resize:"vertical",lineHeight:1.6}}/>
              {(activeTool==="summarize"||activeTool==="redline") && (
                <div style={{fontSize:11,color:"#9A8A75",marginTop:4}}>
                  {activeTool==="summarize" ? "Tip: You can paste even very long judgments — ARK will extract the key parts." : "Tip: Paste the full contract text for a thorough clause-by-clause analysis."}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{padding:"10px 14px",background:"#FEF2F2",border:"1px solid #F0B8C0",borderRadius:8,fontSize:13,color:"#DC2626",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{background:"none",border:"none",cursor:"pointer",color:"#DC2626",fontSize:16}}>&#x2715;</button>
            </div>
          )}

          <button className="run-btn" onClick={runTool} disabled={loading}>
            {loading
              ? <><div style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Processing...</>
              : <>{tool.icon} Run {tool.label}</>
            }
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{background:"white",border:`1px solid ${BORDER}`,borderRadius:12,padding:24,boxShadow:"0 2px 12px rgba(180,160,100,0.08)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,paddingBottom:14,borderBottom:`1px solid ${CREAM_MID}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:24,height:24,objectFit:"contain"}}/>
                <span style={{fontSize:13,fontWeight:700,color:GREEN}}>ARK Law AI Result</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={() => navigator.clipboard.writeText(result).then(() => alert("Copied!"))}
                  style={{padding:"6px 14px",background:CREAM,color:TEXT,border:`1px solid ${BORDER}`,borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5,fontFamily:"DM Sans,sans-serif"}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Result
                </button>
                <Link href="/pakistan" style={{padding:"6px 14px",background:GREEN,color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5,textDecoration:"none"}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Continue in Chat
                </Link>
              </div>
            </div>
            <div style={{lineHeight:1.8}}>
              {renderResult(result)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
