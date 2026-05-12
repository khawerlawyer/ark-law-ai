import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const GOLD  = "#C9A84C";
const CREAM = "#F5F0E8";

const JURISDICTIONS = [
  { id:"pk", label:"Pakistan",      sub:"Pakistani Law & Statutes",   flag:"https://flagcdn.com/w40/pk.png", route:"/pakistan",   accent:"#2E7D32", light:"#EAF5EE", border:"#A8D5B5", detail:"All Provinces · Federal Courts · Supreme Court", passcode:"1939PAK" },
  { id:"us", label:"United States", sub:"US Federal & State Law",     flag:"https://flagcdn.com/w40/us.png", route:"/usa",        accent:"#BF0A30", light:"#FCEEF0", border:"#F0B8C0", detail:"All 50 States · Federal Courts · Supreme Court",  passcode:"1939USA" },
  { id:"in", label:"India",         sub:"Indian Law & Statutes",      flag:"https://flagcdn.com/w40/in.png", route:"/india",      accent:"#B35400", light:"#FEF3E6", border:"#F5C89A", detail:"All States · High Courts · Supreme Court",          passcode:"1939Roorkee" },
  { id:"bd", label:"Bangladesh",    sub:"Bangladesh Law & Statutes",  flag:"https://flagcdn.com/w40/bd.png", route:"/bangladesh", accent:"#006A4E", light:"#E6F5EF", border:"#98D5B8", detail:"All Divisions · High Court · Supreme Court",        passcode:"1939BANGLA" },
];

export default function Landing() {
  const router         = useRouter();
  const [mounted,      setMounted]      = useState(false);
  const [lockedCard,   setLockedCard]   = useState(null);   // which card was clicked
  const [passInput,    setPassInput]    = useState("");
  const [passError,    setPassError]    = useState("");
  const [passShake,    setPassShake]    = useState(false);
  const [showPass,     setShowPass]     = useState(false);  // toggle visibility
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const openPasscode = (j) => {
    setLockedCard(j);
    setPassInput("");
    setPassError("");
    setShowPass(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closePasscode = () => {
    setLockedCard(null);
    setPassInput("");
    setPassError("");
  };

  const submitPasscode = () => {
    if (passInput === lockedCard.passcode) {
      setPassError("");
      setLockedCard(null);
      router.push(lockedCard.route);
    } else {
      setPassError("Incorrect passcode. Please try again.");
      setPassShake(true);
      setTimeout(() => setPassShake(false), 500);
      setPassInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <>
      <Head>
        <title>ARK LAW AI - Choose Your Jurisdiction</title>
        <meta name="description" content="ARK Law AI: AI-powered legal assistant for Pakistan, USA, India and Bangladesh." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-512.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-512.png" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&family=Crimson+Pro:ital,wght@0,300;1,300&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;background:#F5F0E8;font-family:"DM Sans",sans-serif;}
        #__next{height:100%;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes floatBg{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 10px))}}
        @keyframes bgPulse{0%,100%{opacity:0.045}50%{opacity:0.08}}
        .jcard{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:11px;cursor:pointer;border:1.5px solid #C8BFB0;background:#EEEBE4;transition:all 0.18s ease;position:relative;overflow:hidden;user-select:none;filter:grayscale(30%);opacity:0.82;}
        .jcard:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.1);border-color:#9A8A75!important;filter:grayscale(0%);opacity:1;}
        .jcard .acc{position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:2px 0 0 2px;transition:opacity 0.2s;}
        .lock-icon{position:absolute;top:7px;right:8px;opacity:0.45;}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
        .shake{animation:shake 0.4s ease;}
        .pass-dots input[type=password]{letter-spacing:4px;font-size:20px;}
        .enter-btn{width:100%;padding:12px 0;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.3px;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;font-family:"DM Sans",sans-serif;}
        .enter-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.14);}
        @media(max-width:480px){.grid2{grid-template-columns:1fr !important;}}
      `}</style>

      {/* Watermark background */}
      <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>

        {/* Main logo watermark */}
        <img src="/ark-logo-us.png" alt="" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"380px",height:"380px",objectFit:"cover",opacity:0.045,animation:"floatBg 9s ease-in-out infinite"}}/>

        {/* Scales of Justice - top left */}
        <svg width="200" height="200" viewBox="0 0 100 100" style={{position:"absolute",top:"5%",left:"4%",opacity:0.045,animation:"bgPulse 7s ease-in-out infinite"}}>
          <line x1="50" y1="10" x2="50" y2="82" stroke="#8A7A55" strokeWidth="2.5"/>
          <line x1="18" y1="30" x2="82" y2="30" stroke="#8A7A55" strokeWidth="2"/>
          <line x1="18" y1="30" x2="23" y2="56" stroke="#8A7A55" strokeWidth="1.8"/>
          <line x1="82" y1="30" x2="77" y2="56" stroke="#8A7A55" strokeWidth="1.8"/>
          <ellipse cx="20.5" cy="58" rx="11" ry="4.5" fill="none" stroke="#8A7A55" strokeWidth="1.8"/>
          <ellipse cx="79.5" cy="58" rx="11" ry="4.5" fill="none" stroke="#8A7A55" strokeWidth="1.8"/>
          <rect x="37" y="80" width="26" height="3.5" rx="1.75" fill="#8A7A55"/>
          <circle cx="50" cy="27" r="3.5" fill="#8A7A55"/>
        </svg>

        {/* Gavel - bottom right */}
        <svg width="190" height="190" viewBox="0 0 100 100" style={{position:"absolute",bottom:"6%",right:"5%",opacity:0.04,transform:"rotate(-30deg)",animation:"bgPulse 8s ease-in-out 1.5s infinite"}}>
          <rect x="48" y="8" width="32" height="18" rx="5" fill="#8A7A55" transform="rotate(45 64 17)"/>
          <rect x="8" y="58" width="45" height="11" rx="5" fill="#8A7A55" transform="rotate(45 30 63)"/>
          <rect x="56" y="52" width="20" height="10" rx="4" fill="#C9A84C" transform="rotate(45 66 57)"/>
        </svg>

        {/* AI circuit nodes - top right */}
        <svg width="170" height="170" viewBox="0 0 80 80" style={{position:"absolute",top:"5%",right:"4%",opacity:0.04,animation:"bgPulse 6s ease-in-out 2s infinite"}}>
          <circle cx="15" cy="15" r="3" fill="#C9A84C"/><circle cx="40" cy="15" r="3" fill="#C9A84C"/><circle cx="65" cy="15" r="3" fill="#C9A84C"/>
          <circle cx="15" cy="40" r="3" fill="#C9A84C"/><circle cx="40" cy="40" r="3.5" fill="#C9A84C"/><circle cx="65" cy="40" r="3" fill="#C9A84C"/>
          <circle cx="15" cy="65" r="3" fill="#C9A84C"/><circle cx="40" cy="65" r="3" fill="#C9A84C"/><circle cx="65" cy="65" r="3" fill="#C9A84C"/>
          <line x1="15" y1="15" x2="40" y2="15" stroke="#C9A84C" strokeWidth="1"/><line x1="40" y1="15" x2="65" y2="15" stroke="#C9A84C" strokeWidth="1"/>
          <line x1="15" y1="40" x2="40" y2="40" stroke="#C9A84C" strokeWidth="1"/><line x1="40" y1="40" x2="65" y2="40" stroke="#C9A84C" strokeWidth="1"/>
          <line x1="15" y1="65" x2="40" y2="65" stroke="#C9A84C" strokeWidth="1"/><line x1="40" y1="65" x2="65" y2="65" stroke="#C9A84C" strokeWidth="1"/>
          <line x1="15" y1="15" x2="15" y2="40" stroke="#C9A84C" strokeWidth="1"/><line x1="40" y1="15" x2="40" y2="40" stroke="#C9A84C" strokeWidth="1"/>
          <line x1="65" y1="15" x2="65" y2="40" stroke="#C9A84C" strokeWidth="1"/><line x1="15" y1="40" x2="15" y2="65" stroke="#C9A84C" strokeWidth="1"/>
          <line x1="40" y1="40" x2="40" y2="65" stroke="#C9A84C" strokeWidth="1"/><line x1="65" y1="40" x2="65" y2="65" stroke="#C9A84C" strokeWidth="1"/>
        </svg>

        {/* Open book - bottom left */}
        <svg width="155" height="155" viewBox="0 0 100 100" style={{position:"absolute",bottom:"7%",left:"4%",opacity:0.04,animation:"bgPulse 10s ease-in-out 0.5s infinite"}}>
          <path d="M50 22 Q28 20 13 28 L13 82 Q28 74 50 77 Q72 74 87 82 L87 28 Q72 20 50 22Z" fill="none" stroke="#8A7A55" strokeWidth="2.2"/>
          <line x1="50" y1="22" x2="50" y2="77" stroke="#8A7A55" strokeWidth="1.8"/>
          <line x1="18" y1="40" x2="46" y2="37" stroke="#8A7A55" strokeWidth="1.1"/><line x1="18" y1="49" x2="46" y2="46" stroke="#8A7A55" strokeWidth="1.1"/>
          <line x1="18" y1="58" x2="46" y2="55" stroke="#8A7A55" strokeWidth="1.1"/><line x1="18" y1="67" x2="46" y2="64" stroke="#8A7A55" strokeWidth="1.1"/>
          <line x1="54" y1="37" x2="82" y2="40" stroke="#8A7A55" strokeWidth="1.1"/><line x1="54" y1="46" x2="82" y2="49" stroke="#8A7A55" strokeWidth="1.1"/>
          <line x1="54" y1="55" x2="82" y2="58" stroke="#8A7A55" strokeWidth="1.1"/><line x1="54" y1="64" x2="82" y2="67" stroke="#8A7A55" strokeWidth="1.1"/>
        </svg>

        {/* Column pillar - center right edge */}
        <svg width="80" height="220" viewBox="0 0 30 80" style={{position:"absolute",top:"25%",right:"0%",opacity:0.035,animation:"bgPulse 11s ease-in-out 3s infinite"}}>
          <rect x="2" y="2" width="26" height="5" rx="1.5" fill="#8A7A55"/>
          <rect x="6" y="7" width="18" height="56" rx="2" fill="none" stroke="#8A7A55" strokeWidth="1.5"/>
          <line x1="11" y1="7" x2="11" y2="63" stroke="#8A7A55" strokeWidth="0.7"/>
          <line x1="15" y1="7" x2="15" y2="63" stroke="#8A7A55" strokeWidth="0.7"/>
          <line x1="19" y1="7" x2="19" y2="63" stroke="#8A7A55" strokeWidth="0.7"/>
          <rect x="2" y="63" width="26" height="5" rx="1.5" fill="#8A7A55"/>
          <rect x="0" y="68" width="30" height="4" rx="1.5" fill="#8A7A55"/>
        </svg>

        {/* Warm radial glows */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 20% 35%, rgba(201,168,76,0.07) 0%, transparent 55%)"}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 78% 68%, rgba(180,140,60,0.05) 0%, transparent 50%)"}}/>
      </div>

      {/* Main content */}
      <div style={{position:"relative",zIndex:1,height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",opacity:mounted?1:0,transition:"opacity 0.5s ease"}}>

        {/* Logo + brand */}
        <div style={{textAlign:"center",marginBottom:"24px",animation:"fadeUp 0.6s ease both"}}>
          <img src="/ark-logo-us.png" alt="ARK Law AI" style={{width:"200px",height:"200px",objectFit:"contain",marginBottom:"14px",filter:"drop-shadow(0 8px 24px rgba(201,168,76,0.35))"}}/>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(36px,6vw,54px)",fontWeight:800,letterSpacing:"1px",background:"linear-gradient(120deg,#021A4A 0%,#021A4A 30%,#2E6BC4 45%,#6BA3E8 50%,#2E6BC4 55%,#021A4A 70%,#021A4A 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 4s linear infinite"}}>
            ARK LAW AI
          </div>
          <div style={{fontSize:"12px",color:"#8A7A65",marginTop:"3px",fontFamily:"'Crimson Pro',serif",fontStyle:"italic",letterSpacing:"0.5px"}}>
            Your Trusted Legal Intelligence Engine
          </div>
        </div>

        {/* Selector card */}
        <div style={{width:"100%",maxWidth:"420px",background:"rgba(255,253,248,0.94)",border:"1px solid #D8D0C4",borderRadius:"18px",padding:"20px 20px 16px",boxShadow:"0 10px 40px rgba(180,160,100,0.13),0 2px 8px rgba(0,0,0,0.05)",backdropFilter:"blur(8px)",animation:"fadeUp 0.7s ease 0.1s both"}}>

          <div style={{fontSize:"11px",fontWeight:700,color:"#8A7A65",letterSpacing:"0.9px",textTransform:"uppercase",marginBottom:"11px"}}>
            Select your jurisdiction
          </div>

          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"14px"}}>
            {JURISDICTIONS.map(j => (
              <div key={j.id} className="jcard"
                onClick={()=>openPasscode(j)}>
                {/* Lock icon top-right */}
                <div className="lock-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7A6A55" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <img className="flag" src={j.flag} alt={j.label} style={{width:"30px",height:"21px",objectFit:"cover",borderRadius:"3px",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.12)",opacity:0.72}}/>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#5A4A38",lineHeight:1.2}}>{j.label}</div>
                  <div style={{fontSize:10,color:"#9A8A75",marginTop:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.sub}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Passcode Popup */}
        {lockedCard && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,animation:"fadeUp 0.2s ease"}}
            onClick={closePasscode}>
            <div onClick={e=>e.stopPropagation()} className={passShake?"shake":""} style={{background:"#FFFFFF",borderRadius:"20px",width:"90%",maxWidth:"360px",boxShadow:"0 24px 64px rgba(0,0,0,0.22)",border:"1px solid #C8BFB0",overflow:"hidden"}}>
              {/* Header */}
              <div style={{padding:"20px 22px 16px",borderBottom:"1px solid #EDE8DF",display:"flex",alignItems:"center",gap:"12px"}}>
                <img src="/ark-logo-us.png" alt="ARK" style={{width:36,height:36,objectFit:"contain",flexShrink:0}}/>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:"#021A4A",fontFamily:"DM Sans,sans-serif"}}>ARK LAW AI</div>
                  <div style={{fontSize:11,color:"#8A7A65",marginTop:"1px"}}>Restricted Access</div>
                </div>
                <button onClick={closePasscode} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#9A8A75",fontSize:20,lineHeight:1}}>✕</button>
              </div>
              {/* Flag + country */}
              <div style={{padding:"18px 22px 0",textAlign:"center"}}>
                <img src={lockedCard.flag} alt={lockedCard.label} style={{width:48,height:32,objectFit:"cover",borderRadius:5,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",marginBottom:10}}/>
                <div style={{fontSize:16,fontWeight:700,color:"#1A1209",fontFamily:"DM Sans,sans-serif"}}>{lockedCard.label}</div>
                <div style={{fontSize:12,color:"#8A7A65",marginBottom:18,marginTop:3}}>{lockedCard.sub}</div>
                <div style={{fontSize:13,color:"#3A2A18",marginBottom:12,fontWeight:500}}>Enter passcode to access</div>
                {/* Passcode input */}
                <div style={{position:"relative",marginBottom:8}}>
                  <input ref={inputRef}
                    type={showPass?"text":"password"}
                    value={passInput}
                    onChange={e=>{ setPassInput(e.target.value); setPassError(""); }}
                    onKeyDown={e=>{ if(e.key==="Enter") submitPasscode(); if(e.key==="Escape") closePasscode(); }}
                    placeholder="Enter passcode..."
                    style={{width:"100%",padding:"11px 44px 11px 16px",border:"2px solid "+(passError?"#DC2626":passInput?"#021A4A":"#C8BFB0"),borderRadius:10,fontSize:15,color:"#1A1209",outline:"none",fontFamily:"DM Sans,sans-serif",background:"#F9F6F0",letterSpacing:passInput&&!showPass?"4px":"normal",transition:"border-color 0.2s"}}
                  />
                  {/* Eye toggle */}
                  <button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#8A7A65",display:"flex",alignItems:"center"}}>
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {passError && <div style={{fontSize:12,color:"#DC2626",marginBottom:8,fontWeight:500}}>⚠️ {passError}</div>}
              </div>
              {/* Footer buttons */}
              <div style={{padding:"14px 22px 20px",display:"flex",gap:8}}>
                <button onClick={closePasscode} style={{flex:1,padding:"10px 0",background:"transparent",color:"#7A6A55",border:"1px solid #C8BFB0",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"DM Sans,sans-serif"}}>
                  Cancel
                </button>
                <button onClick={submitPasscode} disabled={!passInput}
                  style={{flex:2,padding:"10px 0",background:passInput?"#021A4A":"#C8BFB0",color:"white",border:"none",borderRadius:9,cursor:passInput?"pointer":"not-allowed",fontSize:13,fontWeight:700,fontFamily:"DM Sans,sans-serif",transition:"background 0.15s"}}
                  onMouseEnter={e=>{ if(passInput) e.currentTarget.style.background="#0A2A6A"; }}
                  onMouseLeave={e=>{ if(passInput) e.currentTarget.style.background="#021A4A"; }}>
                  Unlock Access →
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{marginTop:"18px",fontSize:"11px",color:"#B0A080",textAlign:"center",fontFamily:"'Crimson Pro',serif",letterSpacing:"0.5px",animation:"fadeUp 0.8s ease 0.3s both"}}>
          Powered by ARK Lex AI LLC &middot; &copy; 2026 &middot; <span style={{color:"#C9A84C"}}>arklaw.ai</span>
        </div>

      </div>
    </>
  );
}
