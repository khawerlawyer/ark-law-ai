import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const GOLD  = "#C9A84C";
const CREAM = "#F5F0E8";

const JURISDICTIONS = [
  { id:"pk", label:"Pakistan",      sub:"Pakistani Law & Statutes",   flag:"https://flagcdn.com/w40/pk.png", route:"/pakistan",   accent:"#2E7D32", light:"#EAF5EE", border:"#A8D5B5", detail:"All Provinces · Federal Courts · Supreme Court" },
  { id:"us", label:"United States", sub:"US Federal & State Law",     flag:"https://flagcdn.com/w40/us.png", route:"/usa",        accent:"#BF0A30", light:"#FCEEF0", border:"#F0B8C0", detail:"All 50 States · Federal Courts · Supreme Court",  passcode:"1939USA" },
  { id:"in", label:"India",         sub:"Indian Law & Statutes",      flag:"https://flagcdn.com/w40/in.png", route:"/india",      accent:"#B35400", light:"#FEF3E6", border:"#F5C89A", detail:"All States · High Courts · Supreme Court",          passcode:"1939Roorkee" },
  { id:"bd", label:"Bangladesh",    sub:"Bangladesh Law & Statutes",  flag:"https://flagcdn.com/w40/bd.png", route:"/bangladesh", accent:"#006A4E", light:"#E6F5EF", border:"#98D5B8", detail:"All Divisions · High Court · Supreme Court",        passcode:"1939BANGLA" },
];

export default function Landing() {
  const router         = useRouter();
  const [mounted,      setMounted]      = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  // Track landing page visitors
  useEffect(()=>{
    try {
      const v={page:window.location.pathname,time:new Date().toISOString(),ua:navigator.userAgent.substring(0,80)};
      const arr=JSON.parse(localStorage.getItem("arklaw_visitors")||"[]");
      arr.push(v);
      if(arr.length>500) arr.shift();
      localStorage.setItem("arklaw_visitors",JSON.stringify(arr));
    } catch(e){}
  },[]);


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
        html,body{min-height:100%;overflow-x:hidden;background:#F5F0E8;font-family:"DM Sans",sans-serif;color:#1A1209;}
        #__next{min-height:100%;}
        a{color:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes floatBg{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 10px))}}
        @keyframes bgPulse{0%,100%{opacity:0.045}50%{opacity:0.08}}
        @keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes logoGlow{0%,100%{filter:drop-shadow(0 8px 22px rgba(201,168,76,0.30))}50%{filter:drop-shadow(0 10px 30px rgba(201,168,76,0.55))}}
        .wordmark{font-family:"DM Sans",sans-serif;font-weight:800;letter-spacing:1px;line-height:1;background:linear-gradient(120deg,#021A4A 0%,#021A4A 30%,#2E6BC4 45%,#6BA3E8 50%,#2E6BC4 55%,#021A4A 70%,#021A4A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
        .brand-logo{width:112px;height:112px;object-fit:contain;border-radius:24px;background:#FFFFFF;box-shadow:0 0 0 1px rgba(201,168,76,0.35),0 10px 30px rgba(150,120,60,0.18);animation:logoFloat 6s ease-in-out infinite, logoGlow 4s ease-in-out infinite;flex-shrink:0;}
        .wrap{max-width:1180px;margin:0 auto;padding:0 28px;}
        .topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:26px;}
        .nav{display:flex;align-items:center;gap:6px;}
        .nav a{font-size:13.5px;font-weight:700;color:#4A3A28;text-decoration:none;padding:8px 13px;border-radius:9px;transition:background 0.15s;}
        .nav a:hover{background:rgba(201,168,76,0.14);}
        .nav a.cta{background:#021A4A;color:#FFFFFF;border-bottom:2px solid #C9A84C;}
        .nav a.cta:hover{background:#0B2A63;}
        .intro{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin:38px 0 24px;}
        .panels{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:stretch;}
        .panel{border-radius:22px;padding:28px;display:flex;flex-direction:column;}
        .panel-light{background:rgba(255,253,248,0.94);border:1px solid #DDD3C2;box-shadow:0 18px 50px rgba(150,120,60,0.12),0 2px 8px rgba(0,0,0,0.04);backdrop-filter:blur(8px);}
        .panel-dark{background:linear-gradient(155deg,#021A4A 0%,#0B2A63 60%,#04173F 100%);color:#FFFFFF;box-shadow:0 22px 60px rgba(2,26,74,0.35);position:relative;overflow:hidden;border:1px solid #0E2D66;}
        .eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;border-radius:999px;padding:5px 12px;align-self:flex-start;}
        .ptitle{font-family:"Playfair Display",Georgia,serif;font-size:clamp(25px,2.6vw,31px);line-height:1.15;margin:14px 0 8px;}
        .pdesc{font-size:14px;line-height:1.65;margin-bottom:20px;}
        .jgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;}
        .jcard{display:flex;align-items:center;gap:12px;padding:15px 15px 15px 18px;border-radius:14px;cursor:pointer;border:1.5px solid #E1D8C8;background:#FFFFFF;transition:all 0.18s ease;position:relative;overflow:hidden;user-select:none;text-align:left;font-family:inherit;width:100%;}
        .jcard:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,0.09);border-color:#C9A84C;}
        .jcard:focus-visible,.pcta:focus-visible,.nav a:focus-visible{outline:2px solid #C9A84C;outline-offset:2px;}
        .jcard .acc{position:absolute;left:0;top:0;bottom:0;width:4px;}
        .jcard .go{margin-left:auto;color:#B8AC98;font-size:17px;transition:transform 0.18s,color 0.18s;}
        .jcard:hover .go{transform:translateX(3px);color:#C9A84C;}
        .chips{display:flex;flex-wrap:wrap;gap:7px;}
        .chip{font-size:11.5px;border-radius:999px;padding:4px 10px;}
        .pfeat{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;margin-bottom:22px;}
        .pfi{display:flex;gap:10px;align-items:flex-start;}
        .pcta{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:14px 22px;background:#C9A84C;color:#021A4A;border-radius:12px;text-decoration:none;font-weight:800;font-size:14.5px;transition:transform 0.18s,box-shadow 0.18s;}
        .pcta:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(201,168,76,0.35);}
        .spacer{flex:1;min-height:18px;}
        @media(max-width:900px){.panels{grid-template-columns:1fr;}.intro{margin:28px 0 20px;}}
        @media(max-width:640px){
          .wrap{padding:0 16px;}.topbar{padding-top:16px;}
          .brand-logo{width:68px;height:68px;border-radius:16px;}
          .nav{display:none;}
          .panel{padding:22px 18px;border-radius:18px;}
          .jgrid{grid-template-columns:1fr;}
          .pfeat{grid-template-columns:1fr;}
        }
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}
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
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",opacity:mounted?1:0,transition:"opacity 0.5s ease"}}>

        {/* ── Top bar: brand on the left ── */}
        <header className="wrap topbar" style={{width:"100%",animation:"fadeUp 0.6s ease both"}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:18,textDecoration:"none",minWidth:0}} aria-label="ARK LAW AI home">
            <img src="/ark-logo-us.png" alt="ARK LAW AI" className="brand-logo"/>
            <div style={{minWidth:0}}>
              <div className="wordmark" style={{fontSize:"clamp(28px,4.2vw,46px)"}}>ARK LAW AI</div>
              <div style={{fontSize:"14px",color:"#8A7A65",marginTop:"7px",fontFamily:"'Crimson Pro',serif",fontStyle:"italic",letterSpacing:"0.4px"}}>Your Trusted Legal Intelligence Engine</div>
            </div>
          </a>
          <nav className="nav" aria-label="Main">
            <a href="/blog">Blog</a>
            <a href="#practice">Practice</a>
            <a href="/practice" className="cta">Sign in to Practice</a>
          </nav>
        </header>

        <main className="wrap" style={{width:"100%",flex:1}}>

          {/* ── Intro line ── */}
          <div className="intro" style={{animation:"fadeUp 0.7s ease 0.08s both"}}>
            <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(24px,3vw,34px)",lineHeight:1.2,color:"#021A4A",maxWidth:"640px",fontWeight:700}}>
              Jurisdiction-specific legal intelligence built for legal professionals.
            </h1>
            <div style={{fontSize:"12px",color:"#021A4A",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",paddingBottom:"6px"}}>
              Research &middot; Verify &middot; Draft &middot; Analyze
            </div>
          </div>

          {/* ── Two panels ── */}
          <div className="panels">

            {/* Left: AI legal intelligence + jurisdiction */}
            <section className="panel panel-light" aria-labelledby="ai-title" style={{animation:"fadeUp 0.7s ease 0.15s both"}}>
              <span className="eyebrow" style={{color:"#021A4A",background:"rgba(2,26,74,0.06)",border:"1px solid rgba(2,26,74,0.14)"}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0z"/></svg>
                AI Legal Assistant
              </span>
              <h2 id="ai-title" className="ptitle" style={{color:"#021A4A"}}>Choose your jurisdiction</h2>
              <p className="pdesc" style={{color:"#5A4A35"}}>Ask questions, research statutes and case law, summarise judgments and review contracts under the law of your country.</p>

              <div className="jgrid">
                {JURISDICTIONS.map(j => (
                  <button key={j.id} type="button" className="jcard" onClick={()=>router.push(j.route)} aria-label={"Open ARK LAW AI " + j.label}>
                    <span className="acc" style={{background:j.accent}}/>
                    <img src={j.flag} alt="" style={{width:"34px",height:"24px",objectFit:"cover",borderRadius:"4px",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/>
                    <span style={{minWidth:0,display:"block"}}>
                      <span style={{display:"block",fontSize:"14.5px",fontWeight:800,color:"#1A1209",lineHeight:1.2}}>{j.label}</span>
                      <span style={{display:"block",fontSize:"11.5px",color:"#8A7A65",marginTop:"3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.sub}</span>
                    </span>
                    <span className="go" aria-hidden="true">&rarr;</span>
                  </button>
                ))}
              </div>

              <div style={{marginTop:"16px",padding:"14px 16px",borderRadius:"14px",background:"#F7F2E8",border:"1px dashed #D8CDB8",display:"flex",gap:"12px",alignItems:"flex-start"}}>
                <span style={{width:30,height:30,borderRadius:8,background:"#021A4A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </span>
                <span style={{minWidth:0}}>
                  <span style={{display:"block",fontSize:"10.5px",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",color:"#8A7A65"}}>Try asking</span>
                  <span style={{display:"block",fontSize:"13.5px",color:"#1A1209",marginTop:"4px",lineHeight:1.5,fontStyle:"italic"}}>&ldquo;What are the grounds for bail in a non-bailable offence? Cite the governing statute and leading cases.&rdquo;</span>
                </span>
              </div>

              <div className="spacer"/>
              <div style={{borderTop:"1px solid #EAE2D3",paddingTop:"16px",marginTop:"6px"}}>
                <div style={{fontSize:"10.5px",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",color:"#8A7A65",marginBottom:"9px"}}>Included in every version</div>
                <div className="chips">
                  {["Legal research","Judgment summaries","Contract redlining","Compliance checks","Clause library","Citation check"].map(x => (
                    <span key={x} className="chip" style={{color:"#4A3A28",background:"#FFFFFF",border:"1px solid #E3D9C6"}}>{x}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Right: ARK Practice */}
            <section id="practice" className="panel panel-dark" aria-labelledby="pm-title" style={{animation:"fadeUp 0.7s ease 0.22s both",scrollMarginTop:"20px"}}>
              <div aria-hidden="true" style={{position:"absolute",right:"-120px",top:"-120px",width:"340px",height:"340px",borderRadius:"50%",background:"radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 65%)",pointerEvents:"none"}}/>
              <span className="eyebrow" style={{color:"#C9A84C",background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.4)"}}>
                New &middot; ARK Practice
              </span>
              <h2 id="pm-title" className="ptitle" style={{color:"#FFFFFF"}}>Legal practice management</h2>
              <p className="pdesc" style={{color:"rgba(255,255,255,0.72)"}}>Every matter, client, hearing, hour and invoice in one secure record, for firms in Pakistan, India, Bangladesh and the United States.</p>

              <div className="pfeat">
                {[
                  ["Matters","Court, parties, tasks and billing per case","M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
                  ["Conflict check","Search clients and opposing parties","M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
                  ["Court calendar","Hearings, meetings and deadlines","M3 9.5h18M8 2.5v4M16 2.5v4M5 4.5h14a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"],
                  ["Tasks","Due dates, priorities, overdue alerts","M8 12l3 3 5-6M5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3z"],
                  ["Time tracking","Live timer and expense logging","M12 9v4l2.5 2.5M9.5 2.5h5M20 13a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"],
                  ["Billing","Tax invoices, PDFs, payment tracking","M6 2.5h9l3.5 3.5V21.5H6zM9.5 10h6M9.5 14h6M9.5 18h3"],
                ].map(([t, d, icon]) => (
                  <div key={t} className="pfi">
                    <span style={{width:32,height:32,borderRadius:9,background:"rgba(201,168,76,0.14)",border:"1px solid rgba(201,168,76,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                    </span>
                    <span style={{minWidth:0}}>
                      <span style={{display:"block",fontSize:"13.5px",fontWeight:800,color:"#FFFFFF"}}>{t}</span>
                      <span style={{display:"block",fontSize:"12px",color:"rgba(255,255,255,0.6)",lineHeight:1.45,marginTop:"2px"}}>{d}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",position:"relative"}}>
                <a href="/practice" className="pcta">Open ARK Practice <span aria-hidden="true">&rarr;</span></a>
                <span style={{fontSize:"12.5px",color:"rgba(255,255,255,0.6)"}}>New here? Create an account in a minute</span>
              </div>

              <div className="spacer"/>
              <div style={{borderTop:"1px solid rgba(255,255,255,0.12)",paddingTop:"16px",marginTop:"6px",position:"relative"}}>
                <div style={{fontSize:"10.5px",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:"9px"}}>Coming next</div>
                <div className="chips">
                  {["Trust accounts","Documents & templates","Client portal","E-signatures","Online payments","ARK AI in matters"].map(x => (
                    <span key={x} className="chip" style={{color:"rgba(255,255,255,0.8)",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)"}}>{x}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="wrap" style={{width:"100%",padding:"26px 28px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:16,flexWrap:"wrap"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:6}}>
            <a href="https://www.arkgroup.info" target="_blank" rel="noopener noreferrer" aria-label="ARK Group">
              <img src="/ark-group-logo.png" alt="ARK Group" style={{height:"44px",width:"auto",display:"block"}}/>
            </a>
            <div style={{fontSize:"12px",color:"#A89878",fontFamily:"'Crimson Pro',serif",letterSpacing:"0.5px"}}>
              Powered by ARK GROUP &middot; &copy; 2026-2027 &middot; <a href="https://www.arkgroup.info" target="_blank" rel="noopener noreferrer" style={{color:"#C9A84C",textDecoration:"none"}}>www.arkgroup.info</a>
            </div>
          </div>
          <span style={{fontSize:"12px",color:"#A89878",fontFamily:"'Crimson Pro',serif",letterSpacing:"0.5px"}}>Pakistan &middot; United States &middot; India &middot; Bangladesh</span>
        </footer>

      </div>
    </>
  );
}
