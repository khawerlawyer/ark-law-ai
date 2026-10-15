// pages/practice-home.js - Landing page for www.arklawpractice.com (ARK LAW Practice)
// next.config.js rewrites "/" on arklawpractice.com to this page.
import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const NAVY = "#021A4A";
const INK = "#03133A";
const GOLD = "#C9A84C";
const PARCH = "#F3EEE2";
const MUTED = "#6E6352";

const TABS = ["Matter", "Calendar", "Time", "Billing"];

const FEATURES = [
  ["Matters", "Every case in one file: court, case number, parties, opposing counsel, billing method and status. Numbered automatically."],
  ["Clients and conflict check", "Keep people and companies in one directory, and search clients and opposing parties before you take on new work."],
  ["Court calendar", "Hearings, meetings and filing deadlines on a month view and an agenda, linked to the matter they belong to."],
  ["Tasks", "Due dates and priorities for each matter, with overdue work surfaced on your dashboard."],
  ["Time and expenses", "Start a timer while you work, or log hours and expenses afterwards. Amounts are worked out from your rates."],
  ["Invoices and payments", "Turn unbilled time into a numbered tax invoice, print or save it as PDF, and record payments as they arrive."],
];

const COUNTRIES = [
  ["pk", "Pakistan", "PKR", "Rupee invoices, with your provincial sales tax rate set in settings"],
  ["us", "United States", "USD", "Dollar invoices, with hourly, flat-fee and contingency matters"],
  ["in", "India", "INR", "Rupee invoices, with GST set as your tax label and rate"],
  ["bd", "Bangladesh", "BDT", "Taka invoices, with VAT set as your tax label and rate"],
];

const NEXT = ["Trust accounts", "Documents and templates", "Client portal", "E-signatures", "Online payments", "ARK LAW AI inside matters"];

function pad(n) { return String(n).padStart(2, "0"); }

function CaseFile() {
  const [tab, setTab] = useState(0);
  const [secs, setSecs] = useState(4271);
  const [running, setRunning] = useState(true);
  const refs = useRef([]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const onKey = (e) => {
    let n = null;
    if (e.key === "ArrowRight") n = (tab + 1) % TABS.length;
    if (e.key === "ArrowLeft") n = (tab + TABS.length - 1) % TABS.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = TABS.length - 1;
    if (n !== null) { e.preventDefault(); setTab(n); refs.current[n] && refs.current[n].focus(); }
  };

  const hh = Math.floor(secs / 3600), mm = Math.floor((secs % 3600) / 60), ss = secs % 60;

  return (
    <div className="cf">
      <div className="cf-tabs" role="tablist" aria-label="ARK LAW Practice preview">
        {TABS.map((t, i) => (
          <button key={t} ref={(el) => (refs.current[i] = el)} role="tab" id={"cf-tab-" + i}
            aria-selected={tab === i} aria-controls={"cf-panel-" + i} tabIndex={tab === i ? 0 : -1}
            className={"cf-tab" + (tab === i ? " on" : "")} onClick={() => setTab(i)} onKeyDown={onKey}>{t}</button>
        ))}
      </div>
      <div className="cf-body" role="tabpanel" id={"cf-panel-" + tab} aria-labelledby={"cf-tab-" + tab}>
        <div className="cf-head">
          <div>
            <div className="cf-no">M-0012</div>
            <div className="cf-title">Aziz Textiles Ltd. v. Collector of Customs</div>
          </div>
          <span className="pill">Open</span>
        </div>

        {tab === 0 && (
          <dl className="cf-dl">
            <div><dt>Client</dt><dd>Aziz Textiles Ltd.</dd></div>
            <div><dt>Court</dt><dd>High Court, Customs Appeal 214 of 2026</dd></div>
            <div><dt>Opposing counsel</dt><dd>Legal Advisor, Customs</dd></div>
            <div><dt>Billing</dt><dd>Hourly at PKR 18,000</dd></div>
            <div><dt>Next hearing</dt><dd>Tuesday, 10:30, Court Room 4</dd></div>
            <div><dt>Open tasks</dt><dd>2, one due tomorrow</dd></div>
          </dl>
        )}

        {tab === 1 && (
          <ul className="cf-list">
            <li><span className="d"><b>Tue</b> 10:30</span><span><b>Hearing</b> Arguments on stay application</span><span className="tag h">Hearing</span></li>
            <li><span className="d"><b>Wed</b> 15:00</span><span><b>Client meeting</b> Review import documents</span><span className="tag m">Meeting</span></li>
            <li><span className="d"><b>Fri</b> All day</span><span><b>Deadline</b> File written rejoinder</span><span className="tag x">Deadline</span></li>
          </ul>
        )}

        {tab === 2 && (
          <div>
            <div className="timer">
              <div>
                <div className="t-lbl">Drafting rejoinder</div>
                <div className="t-val" aria-live="off">{pad(hh)}:{pad(mm)}:{pad(ss)}</div>
              </div>
              <button className="t-btn" onClick={() => setRunning((r) => !r)}>{running ? "Pause timer" : "Resume timer"}</button>
            </div>
            <ul className="cf-list">
              <li><span className="d">Mon</span><span>Research on valuation rulings</span><span className="amt">2.5 h</span></li>
              <li><span className="d">Mon</span><span>Court fee and certified copies</span><span className="amt">PKR 3,200</span></li>
            </ul>
          </div>
        )}

        {tab === 3 && (
          <div className="inv">
            <div className="inv-top"><b>INV-0007</b><span className="pill sent">Sent</span></div>
            <div className="inv-row"><span>Professional fees, 6.5 h</span><span>117,000</span></div>
            <div className="inv-row"><span>Expenses</span><span>3,200</span></div>
            <div className="inv-row"><span>Sales tax on services, 16%</span><span>18,720</span></div>
            <div className="inv-row tot"><span>Total (PKR)</span><span>138,920</span></div>
            <div className="inv-row paid"><span>Paid on account</span><span>50,000</span></div>
          </div>
        )}
      </div>
      <div className="cf-note">Sample matter for illustration</div>
    </div>
  );
}

export default function PracticeHome() {
  return (
    <>
      <Head>
        <title>ARK LAW Practice - Legal practice management for law firms</title>
        <meta name="description" content="Run your law practice in one place: matters, clients, court calendar, tasks, time tracking and invoicing, for firms in Pakistan, the United States, India and Bangladesh." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-512.png" />
        <meta property="og:title" content="ARK LAW Practice" />
        <meta property="og:description" content="Matters, court calendar, time and billing for law firms." />
        <meta property="og:url" content="https://www.arklawpractice.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:${NAVY};color:#1A1209;font-family:"DM Sans",system-ui,sans-serif;}
        body{overflow-x:hidden;}
        a{color:inherit;}
        :focus-visible{outline:2px solid ${GOLD};outline-offset:3px;border-radius:4px;}
        .wrap{max-width:1180px;margin:0 auto;padding:0 28px;}
        .serif{font-family:"Playfair Display",Georgia,serif;}

        .top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 0;}
        .brand{display:flex;align-items:center;gap:14px;text-decoration:none;}
        .brand img{width:64px;height:64px;border-radius:14px;background:#fff;object-fit:contain;padding:5px;box-shadow:0 0 0 1px rgba(201,168,76,0.5),0 10px 30px rgba(0,0,0,0.35);}
        .bname{color:#fff;font-weight:800;font-size:22px;letter-spacing:1.5px;line-height:1.1;}
        .bsub{color:${GOLD};font-size:13px;margin-top:3px;}
        .acts{display:flex;gap:10px;align-items:center;}
        .btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 20px;border-radius:10px;font-weight:700;font-size:14.5px;text-decoration:none;border:1px solid transparent;transition:background .15s,border-color .15s,color .15s;white-space:nowrap;}
        .btn-gold{background:${GOLD};color:${NAVY};}
        .btn-gold:hover{background:#D9BA62;}
        .btn-line{color:#fff;border-color:rgba(255,255,255,0.35);}
        .btn-line:hover{border-color:${GOLD};color:${GOLD};}

        .hero{display:grid;grid-template-columns:1fr 1.05fr;gap:56px;align-items:center;padding:40px 0 88px;}
        .hero h1{color:#fff;font-size:clamp(36px,4.6vw,58px);line-height:1.08;font-weight:700;max-width:560px;}
        .hero p{color:rgba(255,255,255,0.74);font-size:18px;line-height:1.6;margin-top:22px;max-width:500px;}
        .hero .acts{margin-top:32px;flex-wrap:wrap;}
        .hero .btn{padding:14px 24px;font-size:15.5px;}
        .fine{color:rgba(255,255,255,0.5);font-size:13.5px;margin-top:16px;}

        .cf{position:relative;filter:drop-shadow(0 30px 60px rgba(0,0,0,0.45));}
        .cf-tabs{display:flex;gap:4px;padding-left:18px;}
        .cf-tab{font:inherit;font-size:14px;font-weight:700;padding:10px 18px 9px;border:none;cursor:pointer;border-radius:10px 10px 0 0;background:#C9BC9A;color:#4A402E;}
        .cf-tab:hover{background:#D8CCAA;}
        .cf-tab.on{background:#FBF7EE;color:${NAVY};}
        .cf-body{background:#FBF7EE;border-radius:4px 16px 16px 16px;padding:24px 26px 26px;min-height:318px;border-top:3px solid ${GOLD};}
        .cf-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding-bottom:16px;border-bottom:1px solid #E3D9C6;margin-bottom:16px;}
        .cf-no{font-size:13px;font-weight:700;color:${MUTED};}
        .cf-title{font-family:"Playfair Display",Georgia,serif;font-size:21px;color:${NAVY};margin-top:3px;line-height:1.25;}
        .pill{font-size:12px;font-weight:700;padding:4px 10px;border-radius:99px;background:#E4F3E8;color:#1E6B3A;white-space:nowrap;}
        .pill.sent{background:#E7EEFB;color:#1D4A9E;}
        .cf-dl{display:grid;grid-template-columns:1fr 1fr;gap:14px 22px;}
        .cf-dl dt{font-size:12.5px;color:${MUTED};}
        .cf-dl dd{font-size:15px;font-weight:600;color:#1A1209;margin-top:2px;}
        .cf-list{list-style:none;display:grid;}
        .cf-list li{display:grid;grid-template-columns:86px 1fr auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid #EDE5D4;font-size:14.5px;}
        .cf-list li:last-child{border-bottom:none;}
        .cf-list .d{color:${MUTED};font-size:13.5px;}
        .cf-list .d b{color:#1A1209;}
        .tag{font-size:12px;font-weight:700;padding:3px 9px;border-radius:6px;}
        .tag.h{background:#FDECEC;color:#A12828;} .tag.m{background:#E7EEFB;color:#1D4A9E;} .tag.x{background:#FFF3DC;color:#8A5A00;}
        .amt{font-weight:700;}
        .timer{display:flex;justify-content:space-between;align-items:center;gap:12px;background:${NAVY};color:#fff;border-radius:12px;padding:14px 18px;margin-bottom:10px;}
        .t-lbl{font-size:13px;color:rgba(255,255,255,0.7);}
        .t-val{font-size:30px;font-weight:800;letter-spacing:1px;font-variant-numeric:tabular-nums;color:${GOLD};}
        .t-btn{font:inherit;font-size:13px;font-weight:700;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.4);border-radius:8px;padding:8px 12px;cursor:pointer;}
        .t-btn:hover{border-color:${GOLD};color:${GOLD};}
        .inv{font-size:15px;}
        .inv-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
        .inv-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #EDE5D4;font-variant-numeric:tabular-nums;}
        .inv-row.tot{font-weight:800;color:${NAVY};border-top:2px solid ${NAVY};border-bottom:none;margin-top:4px;font-size:17px;}
        .inv-row.paid{color:#1E6B3A;border-bottom:none;font-size:14px;}
        .cf-note{color:rgba(255,255,255,0.45);font-size:12.5px;margin-top:12px;text-align:right;}

        .parch{background:${PARCH};}
        .sec{padding:84px 0;}
        .sec h2{font-size:clamp(28px,3.2vw,40px);color:${NAVY};line-height:1.15;max-width:640px;}
        .lead{font-size:17px;line-height:1.65;color:#4A402E;margin-top:14px;max-width:620px;}
        .feat{display:grid;grid-template-columns:1fr 1fr;gap:0 64px;margin-top:44px;border-top:2px solid ${NAVY};}
        .feat div{padding:22px 0;border-bottom:1px solid #D9CEB6;}
        .feat h3{font-size:18px;color:${NAVY};font-weight:800;}
        .feat p{font-size:15.5px;line-height:1.6;color:#4A402E;margin-top:6px;max-width:460px;}

        .dark h2{color:#fff;}
        .dark .lead{color:rgba(255,255,255,0.7);}
        .ctry{margin-top:40px;display:grid;}
        .ctry div{display:grid;grid-template-columns:44px 190px 70px 1fr;gap:18px;align-items:center;padding:18px 0;border-bottom:1px solid rgba(255,255,255,0.12);}
        .ctry img{width:36px;height:25px;border-radius:3px;object-fit:cover;}
        .ctry b{color:#fff;font-size:17px;}
        .ctry .cur{color:${GOLD};font-weight:800;font-size:15px;}
        .ctry span{color:rgba(255,255,255,0.68);font-size:15px;line-height:1.5;}

        .two{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;}
        .sec ul.plain{list-style:none;margin-top:22px;}
        .sec ul.plain li{padding:12px 0 12px 26px;border-bottom:1px solid #D9CEB6;font-size:15.5px;line-height:1.55;color:#4A402E;position:relative;}
        .sec ul.plain li::before{content:"";position:absolute;left:2px;top:20px;width:10px;height:10px;border-radius:2px;background:${GOLD};}
        .soon{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px;}
        .soon span{font-size:14px;padding:7px 13px;border-radius:99px;border:1px solid #CDBF9F;color:#4A402E;background:#FBF7EE;}

        .cta{padding:84px 0;text-align:center;}
        .cta h2{color:#fff;font-size:clamp(28px,3.4vw,42px);}
        .cta p{color:rgba(255,255,255,0.7);font-size:17px;margin-top:12px;}
        .cta .acts{justify-content:center;margin-top:28px;flex-wrap:wrap;}
        .cta .btn{padding:14px 24px;font-size:15.5px;}
        .xlink{color:rgba(255,255,255,0.6);font-size:14.5px;margin-top:26px;}
        .xlink a{color:${GOLD};text-decoration:underline;text-underline-offset:3px;}

        .foot{border-top:1px solid rgba(255,255,255,0.1);padding:26px 0 30px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;}
        .foot a{text-decoration:none;display:flex;flex-direction:column;align-items:flex-start;gap:8px;}
        .foot img{height:44px;width:auto;filter:brightness(0) invert(1);opacity:0.9;}
        .foot .pw{font-size:12.5px;color:rgba(255,255,255,0.55);}
        .foot .pw b{color:${GOLD};font-weight:500;}
        .foot .r{font-size:12.5px;color:rgba(255,255,255,0.45);}

        @media (max-width:960px){
          .hero{grid-template-columns:1fr;gap:44px;padding-top:20px;}
          .feat,.two{grid-template-columns:1fr;gap:0 0;}
          .two{gap:48px;}
          .ctry div{grid-template-columns:40px 1fr 60px;}
          .ctry span:not(.cur){grid-column:2 / 4;}
          .ctry .cur{justify-self:end;}
        }
        @media (max-width:560px){
          .wrap{padding:0 16px;}
          .top .btn-line{display:none;}
          .brand img{width:48px;height:48px;border-radius:11px;}
          .bname{font-size:17px;}
          .bsub{font-size:12px;}
          .top .btn{padding:10px 14px;font-size:13.5px;}
          .cf-body{padding:18px 16px;}
          .cf-tab{padding:9px 11px 8px;font-size:13px;}
          .cf-tabs{padding-left:8px;}
          .cf-dl{grid-template-columns:1fr;}
          .cf-list li{grid-template-columns:64px 1fr;}
          .cf-list li > :last-child{grid-column:2;justify-self:start;}
          .sec,.cta{padding:60px 0;}
          .foot{flex-direction:column;align-items:center;text-align:center;}
          .foot a{align-items:center;}
        }
        @media (prefers-reduced-motion:reduce){*{transition:none!important;}}
      `}</style>

      <div style={{ background: "radial-gradient(1100px 600px at 85% 20%, #0E2D66 0%, " + NAVY + " 60%)" }}>
        <div className="wrap">
          <header className="top">
            <a className="brand" href="/" aria-label="ARK LAW Practice home">
              <img src="/ark-logo-us.png" alt="" />
              <span>
                <span className="bname" style={{ display: "block" }}>ARK LAW PRACTICE</span>
                <span className="bsub" style={{ display: "block" }}>Practice management for law firms</span>
              </span>
            </a>
            <nav className="acts" aria-label="Account">
              <a className="btn btn-line" href="/practice">Sign in</a>
              <a className="btn btn-gold" href="/practice?signup=1">Create free account</a>
            </nav>
          </header>

          <main>
            <section className="hero">
              <div>
                <h1 className="serif">Your whole practice, kept in one case file.</h1>
                <p>Matters, clients, hearings, hours and invoices in one secure record. Built for advocates and law firms in Pakistan, the United States, India and Bangladesh.</p>
                <div className="acts">
                  <a className="btn btn-gold" href="/practice?signup=1">Create free account</a>
                  <a className="btn btn-line" href="/practice">Sign in</a>
                </div>
                <div className="fine">Already use ARK LAW AI? Sign in with the same email and password.</div>
              </div>
              <CaseFile />
            </section>
          </main>
        </div>
      </div>

      <section className="parch sec" aria-labelledby="f-h">
        <div className="wrap">
          <h2 id="f-h" className="serif">What you can run from one file</h2>
          <p className="lead">Open a matter once, and everything that happens on it, from the first meeting to the final invoice, stays attached to it.</p>
          <div className="feat">
            {FEATURES.map(([t, d]) => (
              <div key={t}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dark" style={{ background: INK }} aria-labelledby="c-h">
        <div className="wrap">
          <h2 id="c-h" className="serif">Set up for the country you practise in</h2>
          <p className="lead">Your currency, tax label and rate, invoice numbering and firm details are set once in your settings and used on every invoice.</p>
          <div className="ctry">
            {COUNTRIES.map(([code, name, cur, note]) => (
              <div key={code}>
                <img src={"https://flagcdn.com/w80/" + code + ".png"} alt="" />
                <b>{name}</b>
                <span className="cur">{cur}</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="parch sec" aria-labelledby="s-h">
        <div className="wrap two">
          <div>
            <h2 id="s-h" className="serif">Client files stay private</h2>
            <ul className="plain">
              <li>Each firm sees only its own matters, clients and invoices. Every request is checked against your signed-in account on the server.</li>
              <li>The database is closed to the public. Only the ARK server can read or write practice records.</li>
              <li>Sign-in sessions are signed and expire after 30 days.</li>
            </ul>
          </div>
          <div>
            <h2 className="serif">Coming next</h2>
            <p className="lead">We are adding these to ARK LAW Practice next.</p>
            <div className="soon">
              {NEXT.map((x) => <span key={x}>{x}</span>)}
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: NAVY }}>
        <div className="wrap">
          <section className="cta" aria-labelledby="cta-h">
            <h2 id="cta-h" className="serif">Open your first matter today</h2>
            <p>Creating an account takes about a minute.</p>
            <div className="acts">
              <a className="btn btn-gold" href="/practice?signup=1">Create free account</a>
              <a className="btn btn-line" href="/practice">Sign in</a>
            </div>
            <div className="xlink">Need research, drafting or a judgment summary? Use <a href="https://arklaw.ai" target="_blank" rel="noopener noreferrer">ARK LAW AI</a>.</div>
          </section>

          <footer className="foot">
            <a href="https://www.arkgroup.info" target="_blank" rel="noopener noreferrer">
              <img src="/ark-group-logo.png" alt="ARK Group" />
              <span className="pw">Powered by ARK GROUP &middot; &copy; 2026-2027 &middot; <b>www.arkgroup.info</b></span>
            </a>
            <span className="r">www.arklawpractice.com</span>
          </footer>
        </div>
      </div>
    </>
  );
}
