// pages/feedback.js — ARK LAW AI Feedback Form

import { useState } from "react";
import Head from "next/head";

const BLUE  = "#021A4A";
const GOLD  = "#C9A84C";
const CREAM = "#F5F0E8";
const BORDER = "#C8BFB0";
const TEXT   = "#1A1209";
const MUTED  = "#7A6A55";

export default function Feedback() {
  const [form,       setForm]       = useState({ name:"", location:"", issue:"" });
  const [submitted,  setSubmitted]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.issue.trim()) {
      setError("Please fill in all fields before submitting.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Detect which version the user came from
      const version = document.referrer.includes("/pakistan") ? "Pakistan"
                    : document.referrer.includes("/india")    ? "India"
                    : document.referrer.includes("/bangladesh") ? "Bangladesh"
                    : document.referrer.includes("/usa")      ? "USA"
                    : "Unknown";

      const entry = {
        name: form.name.trim(),
        location: form.location.trim(),
        issue: form.issue.trim(),
        version,
        timestamp: new Date().toISOString(),
      };

      // Try API first
      let apiSuccess = false;
      try {
        const res2 = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        const d = await res2.json();
        if (res2.ok && d.success) apiSuccess = true;
        else if (d.error === "TABLE_MISSING") {
          // Table not created yet — still save locally
          console.warn("ark_feedback table missing in Supabase. Create it with: id(bigint), name(text), location(text), issue(text), version(text), submitted_at(timestamptz)");
        }
      } catch(e) { /* network issue — fallback to localStorage */ }

      // Always save to localStorage as backup
      const existing = JSON.parse(localStorage.getItem("arklaw_feedback") || "[]");
      existing.push(entry);
      localStorage.setItem("arklaw_feedback", JSON.stringify(existing));

      await new Promise(r => setTimeout(r, 400));
      setSubmitted(true);
    } catch(err) {
      setError("Failed to submit. Please try again.");
    }
    setLoading(false);
  };

  const inpStyle = {
    width: "100%", padding: "11px 14px",
    background: "#FDFAF5", border: `1.5px solid ${BORDER}`,
    borderRadius: "10px", fontSize: 14, color: TEXT,
    outline: "none", fontFamily: "DM Sans, sans-serif",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <Head>
        <title>ARK LAW AI — Phase 1 Controlled Testing 2026</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Crimson+Pro:ital,wght@1,300&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{min-height:100vh;background:${CREAM};font-family:"DM Sans",sans-serif;display:flex;align-items:center;justify-content:center;}
        input:focus,textarea:focus,select:focus{border-color:${BLUE}!important;outline:none;box-shadow:0 0 0 3px ${BLUE}12;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes checkPop{0%{transform:scale(0)}80%{transform:scale(1.15)}100%{transform:scale(1)}}
      `}</style>

      {/* Subtle watermark */}
      <img src="/ark-logo-us.png" alt="" style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:380,height:380,objectFit:"contain",opacity:0.04,pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:480,margin:"32px auto",padding:"0 16px",animation:"fadeUp 0.5s ease"}}>

        {/* Card */}
        <div style={{background:"#FFFFFF",borderRadius:20,border:`1px solid ${BORDER}`,boxShadow:"0 12px 48px rgba(180,160,100,0.14)",overflow:"hidden"}}>

          {/* Header */}
          <div style={{background:BLUE,padding:"24px 28px",display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:50,height:50,objectFit:"contain"}}/>
            </div>
            <div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:20,fontWeight:800,color:"white",letterSpacing:"0.5px",
                background:`linear-gradient(120deg,white 0%,white 35%,#A8C8FF 50%,white 65%,white 100%)`,
                backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                backgroundClip:"text",animation:"shimmer 4s linear infinite"}}>
                ARK LAW AI
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:2,fontFamily:"Crimson Pro,serif",fontStyle:"italic"}}>
                Feedback — Phase 1 Controlled Testing 2026
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{padding:"28px 28px 24px"}}>
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <p style={{fontSize:13,color:MUTED,marginBottom:22,lineHeight:1.6}}>
                  Thank you for participating in ARK LAW AI's Phase 1 Controlled Testing 2026. Please share your experience, issues, or suggestions below.
                </p>

                {/* Name */}
                <div style={{marginBottom:16}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>
                    Full Name <span style={{color:"#DC2626"}}>*</span>
                  </label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Khawer Rabbani"
                    style={inpStyle}
                    onFocus={e=>e.target.style.borderColor=BLUE}
                    onBlur={e=>e.target.style.borderColor=BORDER}/>
                </div>

                {/* Location */}
                <div style={{marginBottom:16}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>
                    Location <span style={{color:"#DC2626"}}>*</span>
                  </label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="e.g. Karachi, Pakistan"
                    style={inpStyle}
                    onFocus={e=>e.target.style.borderColor=BLUE}
                    onBlur={e=>e.target.style.borderColor=BORDER}/>
                </div>

                {/* Issue */}
                <div style={{marginBottom:20}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>
                    Issue / Feedback <span style={{color:"#DC2626"}}>*</span>
                  </label>
                  <textarea name="issue" value={form.issue} onChange={handleChange}
                    placeholder="Describe the issue or share your feedback in detail..."
                    rows={5}
                    style={{...inpStyle,resize:"vertical",minHeight:110,lineHeight:1.6}}
                    onFocus={e=>e.target.style.borderColor=BLUE}
                    onBlur={e=>e.target.style.borderColor=BORDER}/>
                </div>

                {/* Error */}
                {error && (
                  <div style={{padding:"9px 14px",background:"#FEF2F2",border:"1px solid #F0B8C0",borderRadius:8,fontSize:13,color:"#DC2626",marginBottom:16}}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  style={{width:"100%",padding:"13px 0",background:loading?"#C8BFB0":BLUE,color:"white",border:"none",
                    borderRadius:10,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",
                    fontFamily:"DM Sans,sans-serif",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
                  onMouseEnter={e=>{if(!loading)e.currentTarget.style.background="#0A2A6A";}}
                  onMouseLeave={e=>{if(!loading)e.currentTarget.style.background=BLUE;}}>
                  {loading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Submit Feedback
                    </>
                  )}
                </button>

                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </form>
            ) : (
              /* Success state */
              <div style={{textAlign:"center",padding:"20px 0 10px"}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:"#F0FAF4",border:"2px solid #A8D5B5",
                  display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",
                  animation:"checkPop 0.4s ease"}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{fontSize:20,fontWeight:800,color:BLUE,marginBottom:8,fontFamily:"DM Sans,sans-serif"}}>
                  Thank You, {form.name.split(" ")[0]}!
                </div>
                <p style={{fontSize:13,color:MUTED,lineHeight:1.7,marginBottom:22}}>
                  Your feedback has been received. Our team will review it and get back to you if needed.
                </p>
                <div style={{background:"#F5F0E8",borderRadius:12,padding:"14px 18px",textAlign:"left",marginBottom:20,border:`1px solid ${BORDER}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>Your submission</div>
                  {[["Name",form.name],["Location",form.location],["Issue",form.issue]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",gap:10,marginBottom:6,fontSize:13}}>
                      <span style={{color:MUTED,minWidth:60,fontWeight:600}}>{k}:</span>
                      <span style={{color:TEXT,flex:1,wordBreak:"break-word"}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>window.close()}
                  style={{padding:"10px 28px",background:BLUE,color:"white",border:"none",borderRadius:9,
                    cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"DM Sans,sans-serif"}}>
                  Close Window
                </button>
                <button onClick={()=>{setSubmitted(false);setForm({name:"",location:"",issue:""}); }}
                  style={{marginLeft:10,padding:"10px 20px",background:"transparent",color:MUTED,
                    border:`1px solid ${BORDER}`,borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"DM Sans,sans-serif"}}>
                  Submit Another
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{padding:"12px 28px",borderTop:`1px solid #EDE8DF`,background:"#F9F6F0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:"#B0A080",fontFamily:"Crimson Pro,serif",fontStyle:"italic"}}>
              ARK Lex AI LLC · arklaw.ai
            </span>
            <div style={{display:"flex",gap:6}}>
              {["🇵🇰","🇺🇸","🇮🇳","🇧🇩"].map(f=>(
                <span key={f} style={{fontSize:14}}>{f}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
