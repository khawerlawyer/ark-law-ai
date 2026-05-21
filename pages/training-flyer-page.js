// pages/training-flyer.js — Serves the ARK LAW AI Training Flyer
import Head from "next/head";

export default function TrainingFlyer() {
  return (
    <>
      <Head>
        <title>ARK LAW AI — AI for Lawyers Training | June 13, 2026</title>
        <meta name="description" content="FREE Live Webinar: AI for Lawyers — Practical Use of AI in Legal Research, Drafting and Workflow. June 13, 2026. Register free."/>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
      </Head>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#060d18;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:30px 20px;font-family:sans-serif;}
        .actions{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;justify-content:center;}
        .btn{padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:none;text-decoration:none;display:inline-block;}
        .btn-gold{background:linear-gradient(135deg,#C9A84C,#E8C96A);color:#021A4A;}
        .btn-outline{background:transparent;color:#C9A84C;border:1px solid rgba(201,168,76,0.5);}
        @media print{.actions{display:none;}}
      `}</style>
      <div className="actions">
        <a href="https://forms.gle/n1unvjgw672rX5j19" target="_blank" className="btn btn-gold">
          Register Free &rarr;
        </a>
        <button className="btn btn-outline" onClick={() => window.print()}>
          Print / Save PDF
        </button>
        <a href="/" className="btn btn-outline">
          &larr; Back to ARK LAW AI
        </a>
      </div>
      <iframe
        src="/training-flyer.html"
        style={{width:"860px",maxWidth:"100%",height:"1500px",border:"none",borderRadius:"4px"}}
        title="ARK LAW AI Training Flyer"
      />
    </>
  );
}
