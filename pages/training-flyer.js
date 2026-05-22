// pages/training-flyer.js
// Self-contained flyer page - no external HTML file needed

export default function TrainingFlyer() {
  const LOGO = "/ark-logo-us.png";
  const TRAINER = "/trainer-khawer.png";
  const QR = "/training-qr.png";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Montserrat:wght@400;600;700;800;900&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:#060d18;font-family:'Montserrat',sans-serif;}
        .page-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px 20px;}
        .top-bar{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;justify-content:center;}
        .btn-gold{padding:10px 24px;background:linear-gradient(135deg,#C9A84C,#E8C96A);color:#021A4A;font-weight:800;font-size:13px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;display:inline-block;box-shadow:0 4px 16px rgba(201,168,76,0.4);}
        .btn-outline{padding:10px 20px;background:transparent;color:#C9A84C;border:1px solid rgba(201,168,76,0.45);font-weight:700;font-size:12px;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-block;}
        .flyer{width:820px;max-width:100%;background:#0D1B2A;position:relative;overflow:hidden;border:1px solid rgba(201,168,76,0.25);box-shadow:0 0 80px rgba(201,168,76,0.12),0 40px 80px rgba(0,0,0,0.9);}
        .flyer-bg{position:absolute;inset:0;background-image:radial-gradient(ellipse at 15% 10%,rgba(201,168,76,0.07) 0%,transparent 45%),radial-gradient(ellipse at 85% 90%,rgba(2,26,74,0.5) 0%,transparent 50%),repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(201,168,76,0.018) 70px,rgba(201,168,76,0.018) 71px),repeating-linear-gradient(90deg,transparent,transparent 70px,rgba(201,168,76,0.018) 70px,rgba(201,168,76,0.018) 71px);pointer-events:none;z-index:0;}
        .rel{position:relative;z-index:1;}
        /* Header */
        .hdr{background:linear-gradient(120deg,#021A4A 0%,#0a1628 55%,#0D1B2A 100%);padding:20px 32px;border-bottom:3px solid #C9A84C;display:flex;align-items:center;justify-content:space-between;}
        .logo-grp{display:flex;align-items:center;gap:14px;}
        .logo-box{width:68px;height:68px;background:white;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:6px;box-shadow:0 4px 16px rgba(0,0,0,0.4),0 0 0 2px rgba(201,168,76,0.5);flex-shrink:0;}
        .logo-img{width:56px;height:56px;object-fit:contain;}
        .logo-name{font-family:'Montserrat',sans-serif;font-size:24px;font-weight:900;color:white;letter-spacing:2.5px;line-height:1;}
        .logo-tag{font-size:9.5px;color:rgba(201,168,76,0.75);letter-spacing:2px;text-transform:uppercase;margin-top:3px;}
        .free-pill{display:inline-block;background:linear-gradient(135deg,#C9A84C,#E8C96A);padding:6px 18px;border-radius:5px;font-size:18px;font-weight:900;color:#021A4A;box-shadow:0 4px 18px rgba(201,168,76,0.5);}
        .free-sub{font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:1.5px;text-transform:uppercase;margin-top:5px;text-align:right;}
        /* Hero */
        .hero{background:linear-gradient(130deg,#021A4A 0%,#051e3e 50%,#0a1628 100%);padding:30px 32px 26px;display:flex;align-items:center;gap:30px;}
        .event-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.35);color:#C9A84C;font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;margin-bottom:18px;}
        .ldot{width:5px;height:5px;background:#C9A84C;border-radius:50%;animation:blink 1.5s infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        .htitle{font-family:'Playfair Display',serif;font-size:62px;font-weight:900;color:white;line-height:0.95;letter-spacing:-1px;margin-bottom:10px;}
        .htitle .gold{color:#C9A84C;}
        .hsub{font-size:16px;font-weight:600;color:rgba(255,255,255,0.8);line-height:1.45;margin-bottom:12px;}
        .hmotto{font-family:'Crimson Pro',serif;font-style:italic;font-size:14px;color:rgba(201,168,76,0.65);}
        .live-badge{background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.45);color:#f87171;font-size:10px;font-weight:700;letter-spacing:2px;padding:5px 14px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;}
        .rdot{width:6px;height:6px;background:#f87171;border-radius:50%;animation:blink 1.5s infinite;}
        .wb{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:#C9A84C;line-height:1.2;}
        .wo{font-size:10px;color:rgba(255,255,255,0.4);margin-top:5px;}
        /* Info strip */
        .istrip{display:grid;grid-template-columns:repeat(4,1fr);background:#C9A84C;}
        .icell{padding:15px 16px;text-align:center;border-right:1px solid rgba(2,26,74,0.18);}
        .icell:last-child{border-right:none;}
        .iem{font-size:20px;margin-bottom:3px;}
        .ilbl{font-size:8.5px;font-weight:700;color:rgba(2,26,74,0.55);letter-spacing:1.2px;text-transform:uppercase;}
        .ival{font-size:13.5px;font-weight:900;color:#021A4A;margin-top:3px;line-height:1.25;}
        .isub{font-size:9px;color:rgba(2,26,74,0.55);margin-top:2px;}
        /* 3 cols */
        .cols{display:grid;grid-template-columns:1fr 1.1fr 1fr;padding:26px 32px;border-bottom:1px solid rgba(201,168,76,0.12);}
        .col{padding-right:20px;}
        .col:last-child{padding-right:0;}
        .col+.col{border-left:1px solid rgba(201,168,76,0.1);padding-left:20px;}
        .ctitle{font-size:9px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid rgba(201,168,76,0.25);padding-bottom:9px;margin-bottom:13px;display:flex;align-items:center;gap:7px;}
        .ctitle::before{content:'';width:3px;height:12px;background:#C9A84C;border-radius:2px;flex-shrink:0;}
        .ai{display:flex;align-items:center;gap:9px;margin-bottom:8px;}
        .adot{width:6px;height:6px;border-radius:50%;background:#C9A84C;flex-shrink:0;}
        .atxt{font-size:11.5px;color:rgba(255,255,255,0.78);}
        .rbox{background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:12px 14px;margin-top:14px;}
        .rtitle{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;}
        .ri{display:flex;gap:9px;align-items:center;margin-bottom:8px;}
        .si{display:flex;gap:11px;align-items:flex-start;margin-bottom:11px;}
        .sn{width:24px;height:24px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#C9A84C,#E8C96A);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#021A4A;}
        .st{font-size:11px;font-weight:700;color:white;line-height:1.3;}
        .sd{font-size:8.5px;font-weight:700;color:#C9A84C;margin:1px 0;}
        .sc{font-size:9.5px;color:rgba(255,255,255,0.5);line-height:1.5;}
        .li{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;}
        .lic{width:30px;height:30px;border-radius:7px;flex-shrink:0;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.22);display:flex;align-items:center;justify-content:center;font-size:14px;}
        .lts{font-size:11px;font-weight:700;color:white;display:block;margin-bottom:1px;}
        .ltt{font-size:10px;color:rgba(255,255,255,0.55);line-height:1.45;}
        /* Bottom */
        .btm{display:grid;grid-template-columns:1.05fr 1fr;padding:24px 32px;}
        .tc{padding-right:24px;border-right:1px solid rgba(201,168,76,0.12);}
        .ti{display:flex;gap:18px;align-items:flex-start;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.18);border-radius:14px;padding:18px;}
        .tp{width:96px;height:96px;border-radius:10px;object-fit:cover;object-position:top;border:2px solid rgba(201,168,76,0.4);flex-shrink:0;box-shadow:0 6px 20px rgba(0,0,0,0.5);}
        .tn{font-size:15px;font-weight:800;color:white;margin-bottom:1px;}
        .tr2{font-size:9.5px;color:#C9A84C;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:9px;}
        .tb{font-size:10.5px;color:rgba(255,255,255,0.65);line-height:1.9;}
        .tq{font-family:'Crimson Pro',serif;font-style:italic;font-size:11.5px;color:rgba(255,255,255,0.42);line-height:1.55;margin-top:9px;border-top:1px solid rgba(201,168,76,0.15);padding-top:8px;}
        .rc{padding-left:24px;}
        .slbl{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;display:flex;align-items:center;gap:7px;}
        .slbl::before{content:'';width:3px;height:12px;background:#C9A84C;border-radius:2px;display:inline-block;}
        .rsub{font-size:10.5px;color:rgba(255,255,255,0.55);margin-bottom:14px;text-align:center;}
        .qbox{background:white;border-radius:12px;width:148px;height:148px;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(201,168,76,0.35);padding:8px;}
        .qimg{width:132px;height:132px;object-fit:contain;display:block;}
        .wpill{display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35);color:#4ade80;font-size:9px;font-weight:700;padding:3px 11px;border-radius:20px;margin:0 auto 10px;}
        .furl{background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.3);border-radius:8px;padding:8px 12px;text-align:center;font-size:11px;color:#C9A84C;font-weight:700;margin-bottom:11px;}
        .rnte{font-size:9px;color:rgba(255,255,255,0.38);line-height:1.6;text-align:center;}
        /* Footer */
        .ftr{background:linear-gradient(120deg,#021A4A,#0D1B2A);border-top:2px solid #C9A84C;padding:15px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;}
        .fct{font-size:10.5px;color:rgba(255,255,255,0.6);line-height:1.8;}
        .fct strong{color:#C9A84C;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:2px;}
        .fmid{text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;}
        .flb{width:48px;height:48px;background:white;border-radius:10px;padding:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.4),0 0 0 1px rgba(201,168,76,0.4);}
        .flg{width:40px;height:40px;object-fit:contain;}
        .fmot{font-family:'Crimson Pro',serif;font-style:italic;font-size:10.5px;color:rgba(201,168,76,0.7);line-height:1.5;}
        .frt{text-align:right;font-size:10.5px;color:rgba(255,255,255,0.6);line-height:1.8;}
        .frt strong{color:#C9A84C;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:2px;}
        .tbar{background:#C9A84C;padding:9px 32px;text-align:center;font-size:11px;font-weight:800;color:#021A4A;letter-spacing:2px;text-transform:uppercase;}
        @media print{.top-bar{display:none;}.page-wrap{padding:0;}.flyer{box-shadow:none;border:none;}}
      `}</style>

      <div className="page-wrap">
        <div className="top-bar">
          <a href="https://forms.gle/n1unvjgw672rX5j19" target="_blank" className="btn-gold">Register Free &rarr;</a>
          <button className="btn-outline" onClick={()=>window.print()}>Print / Save PDF</button>
          <a href="/" className="btn-outline">&larr; Back to ARK LAW AI</a>
        </div>

        <div className="flyer">
          <div className="flyer-bg"/>

          {/* HEADER */}
          <div className="hdr rel">
            <div className="logo-grp">
              <div className="logo-box">
                <img className="logo-img" src={LOGO} alt="ARK LAW AI"/>
              </div>
              <div>
                <div className="logo-name">ARK LAW AI</div>
                <div className="logo-tag">The Intelligent Legal Assistant Engine</div>
              </div>
            </div>
            <div>
              <div className="free-pill">100% FREE</div>
              <div className="free-sub">Live Webinar &middot; Open for All</div>
            </div>
          </div>

          {/* HERO */}
          <div className="hero rel">
            <div style={{flex:1}}>
              <div className="event-tag"><div className="ldot"/>&nbsp;Live Online Training &middot; June 13, 2026</div>
              <div className="htitle"><span className="gold">AI</span> FOR<br/>LAWYERS</div>
              <div className="hsub">Practical Use of AI in Legal Research,<br/>Drafting &amp; Workflow</div>
              <div className="hmotto">Empowering Legal Professionals. Enhancing Justice.</div>
            </div>
            <div style={{flexShrink:0,textAlign:"center"}}>
              <div className="live-badge"><div className="rdot"/>&nbsp;LIVE SESSION</div>
              <div className="wb">100% FREE<br/>Webinar</div>
              <div className="wo">A Free Opportunity for Our Legal Community</div>
            </div>
          </div>

          {/* INFO STRIP */}
          <div className="istrip rel">
            <div className="icell"><div className="iem">📅</div><div className="ilbl">Date</div><div className="ival">Friday, June 13, 2026</div></div>
            <div className="icell"><div className="iem">🕐</div><div className="ilbl">Time</div><div className="ival">12:00 PM &ndash; 2:00 PM</div><div className="isub">Pakistan Standard Time</div></div>
            <div className="icell"><div className="iem">💻</div><div className="ilbl">Platform</div><div className="ival">Zoom</div><div className="isub">Live Interactive Session</div></div>
            <div className="icell"><div className="iem">💰</div><div className="ilbl">Investment</div><div className="ival">100% FREE</div><div className="isub">Open for All</div></div>
          </div>

          {/* 3 COLUMNS */}
          <div className="cols rel">
            <div className="col">
              <div className="ctitle">Who Should Attend</div>
              {["Lawyers & Advocates","Junior Associates","Law Students & Researchers","Legal Counsel & In-House Teams","Judicial Officers (where permitted)","Law Firms & Legal Departments"].map(t=>(
                <div key={t} className="ai"><div className="adot"/><div className="atxt">{t}</div></div>
              ))}
              <div className="rbox">
                <div className="rtitle">You Will Receive</div>
                {[["📜","E-Certificate of Participation"],["📄","Free AI Prompts PDF Guide"],["📚","Legal AI Starter Guide"],["🤝","ARK LAW AI Community Access"]].map(([ic,tx])=>(
                  <div key={tx} className="ri"><span style={{fontSize:14}}>{ic}</span><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>{tx}</span></div>
                ))}
              </div>
            </div>
            <div className="col">
              <div className="ctitle">Session Outline &mdash; 2 Hours</div>
              {[
                ["Understanding AI for Legal Practice","15 MINS","What is Generative AI? Claude vs ChatGPT vs Gemini. Legal use cases & ethical boundaries."],
                ["AI for Legal Research","25 MINS","Case summarization, issue spotting, research acceleration & comparative analysis."],
                ["AI for Drafting Assistance","25 MINS","Legal notices, contracts, clauses, opinions & client communication drafts."],
                ["Prompt Engineering for Lawyers","25 MINS","How to ask AI correctly. Role-based & context prompting. Structured draft refinement."],
                ["Live Demo of ARK LAW AI","15 MINS","Research workflow demonstration. AI features & practical applications."],
                ["Interactive Q&A","15 MINS","Ask questions and get expert answers live."],
              ].map(([t,d,c],i)=>(
                <div key={i} className="si">
                  <div className="sn">{i+1}</div>
                  <div><div className="st">{t}</div><div className="sd">{d}</div><div className="sc">{c}</div></div>
                </div>
              ))}
            </div>
            <div className="col">
              <div className="ctitle">What You Will Learn</div>
              {[
                ["🤖","AI Assists, Lawyers Decide","AI is your assistant, not a replacement. Human judgment always comes first."],
                ["⚖️","Ethical & Responsible Use","Safe, ethical & professional use of AI in legal practice."],
                ["📊","Real-World Applications","Practical examples from Pakistani legal context."],
                ["⚡","Save Time. Do More.","Boost productivity, deliver better results, serve more clients."],
                ["🔒","Data Privacy Matters","Understand privacy, confidentiality & secure AI usage."],
              ].map(([ic,t,d])=>(
                <div key={t} className="li"><div className="lic">{ic}</div><div><span className="lts">{t}</span><span className="ltt">{d}</span></div></div>
              ))}
              <div style={{marginTop:14,background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.22)",borderRadius:10,padding:"12px 13px"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#C9A84C",marginBottom:5}}>Learn. Apply. Elevate.</div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,0.65)",lineHeight:1.6}}>Discover how AI can save time, enhance accuracy, and boost your legal practice.</div>
                <div style={{marginTop:9,paddingTop:9,borderTop:"1px solid rgba(201,168,76,0.15)",fontSize:10,fontWeight:700,color:"white"}}>⭐ LIMITED SEATS — Register Today!</div>
              </div>
            </div>
          </div>

          {/* TRAINER + REGISTER */}
          <div className="btm rel">
            <div className="tc">
              <div className="slbl">Your Trainer</div>
              <div className="ti">
                <img className="tp" src={TRAINER} alt="Khawer Rabbani"/>
                <div>
                  <div className="tn">Khawer Rabbani, LLB</div>
                  <div className="tr2">CEO & Founder — ARK LAW AI</div>
                  <div className="tb">
                    <span style={{color:"#C9A84C"}}>✦</span> Judicial Trainer<br/>
                    <span style={{color:"#C9A84C"}}>✦</span> Legal Tech Innovator<br/>
                    <span style={{color:"#C9A84C"}}>✦</span> Cricket Writer / Analyst
                  </div>
                  <div className="tq">"Bridging Law, Technology &amp; Justice to build a smarter legal future."</div>
                </div>
              </div>
            </div>
            <div className="rc">
              <div className="slbl">Register Now &mdash; It&apos;s Free!</div>
              <div className="rsub">Scan the QR code or click the link below</div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                <div className="wpill">✓ Working Link — Scan &amp; Register</div>
              </div>
              <a href="https://forms.gle/n1unvjgw672rX5j19" target="_blank" style={{display:"block",textDecoration:"none"}}>
                <div className="qbox"><img className="qimg" src={QR} alt="QR Code — Scan to Register"/></div>
              </a>
              <div className="furl">🔗 forms.gle/n1unvjgw672rX5j19</div>
              <div className="rnte">Zoom link shared after registration.<br/>E-Certificate issued to all participants.</div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="ftr rel">
            <div className="fct">
              <strong>Contact</strong>
              📱 +92-320-9233064<br/>
              ✉️ ceo@arklaw.ai<br/>
              🌐 www.arklaw.ai
            </div>
            <div className="fmid">
              <div className="flb"><img className="flg" src={LOGO} alt="ARK LAW AI"/></div>
              <div className="fmot">Free Knowledge. Powerful Tools.<br/>Better Practice. Stronger Community.</div>
            </div>
            <div className="frt">
              <strong>Spread the Word</strong>
              Share with your colleagues<br/>and be part of the<br/>AI-powered legal transformation.
            </div>
          </div>
          <div className="tbar rel">Join Us in Building a Smarter, Faster &amp; More Just Legal System with AI</div>
        </div>
      </div>
    </>
  );
}
