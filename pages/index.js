import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const GOLD        = "#C9A84C";
const NAVY        = "#0D1B2A";
const NAVY_MID    = "#162032";
const LIGHT_GREEN = "#4CAF7D";
const LG_HOVER    = "#3D9B6A";
const CREAM       = "#F5F1E8";

export default function Landing() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  return (
    <>
      <Head>
        <title>ARK LAW AI — Choose Your Jurisdiction</title>
        <meta name="description" content="ARK Law AI: AI-powered legal assistant for Pakistan and USA law." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; background: ${NAVY}; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes starfield {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes dividerGlow {
          0%, 100% { opacity: 0.4; box-shadow: 0 0 8px ${GOLD}40; }
          50%       { opacity: 1;   box-shadow: 0 0 20px ${GOLD}80; }
        }

        .landing-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 300px;
          height: 380px;
          border-radius: 24px;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), box-shadow 0.4s ease;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .landing-card:hover {
          transform: translateY(-14px) scale(1.03);
        }
        .landing-card .card-bg {
          position: absolute; inset: 0;
          transition: opacity 0.4s ease;
        }
        .landing-card .flag-emoji {
          font-size: 90px;
          line-height: 1;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5));
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
          animation: float 4s ease-in-out infinite;
          position: relative; z-index: 2;
        }
        .landing-card:hover .flag-emoji {
          transform: scale(1.15);
        }
        .landing-card .card-content {
          position: relative; z-index: 2;
          text-align: center;
          padding: 0 24px;
          margin-top: 18px;
        }
        .landing-card .country-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .landing-card .country-sub {
          font-family: 'Crimson Pro', serif;
          font-size: 14px;
          font-weight: 300;
          font-style: italic;
          opacity: 0.75;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .landing-card .enter-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 50px;
          font-family: 'Crimson Pro', serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }
        .pk-card .enter-btn {
          background: linear-gradient(135deg, ${LIGHT_GREEN}, #2D9B6A);
          color: white;
          box-shadow: 0 4px 16px rgba(76,175,125,0.4);
        }
        .pk-card:hover .enter-btn {
          background: linear-gradient(135deg, #5DD99A, ${LIGHT_GREEN});
          box-shadow: 0 6px 24px rgba(76,175,125,0.6);
        }
        .us-card .enter-btn {
          background: linear-gradient(135deg, #B22234, #8B0000);
          color: white;
          box-shadow: 0 4px 16px rgba(178,34,52,0.4);
        }
        .us-card:hover .enter-btn {
          background: linear-gradient(135deg, #CF3346, #B22234);
          box-shadow: 0 6px 24px rgba(178,34,52,0.6);
        }
        .pulse-ring {
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 24px;
          animation: pulse-ring 2.5s ease-out infinite;
          pointer-events: none;
        }

        @media (max-width: 700px) {
          .landing-card { width: 260px; height: 320px; }
          .landing-card .flag-emoji { font-size: 70px; }
          .landing-card .country-name { font-size: 22px; }
          .cards-row { flex-direction: column !important; gap: 24px !important; }
        }
      `}</style>

      {/* Background */}
      <div style={{
        position: "fixed", inset: 0,
        background: `radial-gradient(ellipse at 20% 50%, #0A1F12 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 30%, #0A0F1E 0%, transparent 60%),
                     radial-gradient(ellipse at 50% 90%, #0D1B0A 0%, transparent 50%),
                     ${NAVY}`,
        zIndex: 0,
      }} />

      {/* Subtle star dots */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", opacity: 0.4 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            borderRadius: "50%",
            background: "white",
            opacity: Math.random() * 0.6 + 0.2,
          }} />
        ))}
      </div>

      {/* Main layout */}
      <div style={{
        position: "relative", zIndex: 1,
        height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>

        {/* Logo + Title */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          marginBottom: "48px",
          animation: "fadeUp 0.8s ease both",
          animationDelay: "0.1s",
        }}>
          {/* Logo */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <div style={{
              position: "absolute", inset: "-12px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${GOLD}30 0%, transparent 70%)`,
            }} />
            <img src="/ark-logo.png" alt="ARK Law AI"
              style={{ width: "80px", height: "80px", position: "relative", filter: `drop-shadow(0 0 20px ${GOLD}60)` }} />
          </div>

          {/* Brand name */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            background: `linear-gradient(135deg, ${GOLD} 0%, #FFE08A 40%, ${GOLD} 60%, #B8860B 100%)`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "3px",
            animation: "shimmer 4s linear infinite",
          }}>ARK LAW AI</div>

          {/* Tagline */}
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "clamp(13px, 2vw, 16px)",
            color: "#9DB89A",
            fontStyle: "italic",
            letterSpacing: "1.5px",
            marginTop: "6px",
          }}>Your Trusted Legal Intelligence Engine</div>

          {/* Gold divider */}
          <div style={{
            width: "120px", height: "1px",
            background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
            marginTop: "16px",
            animation: "dividerGlow 3s ease-in-out infinite",
          }} />

          {/* Instruction */}
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "clamp(14px, 2.5vw, 18px)",
            color: "#B8C4D0",
            marginTop: "16px",
            letterSpacing: "0.5px",
            textAlign: "center",
          }}>Select your jurisdiction to begin</div>
        </div>

        {/* Cards row */}
        <div className="cards-row" style={{
          display: "flex", gap: "40px", alignItems: "center", justifyContent: "center",
          animation: "scaleIn 0.8s cubic-bezier(.34,1.56,.64,1) both",
          animationDelay: "0.3s",
        }}>

          {/* ── PAKISTAN CARD ── */}
          <div className="landing-card pk-card"
            style={{ boxShadow: hovered === "pk" ? `0 30px 80px rgba(76,175,125,0.35), 0 0 0 1px rgba(76,175,125,0.2)` : "0 20px 60px rgba(0,0,0,0.5)" }}
            onMouseEnter={() => setHovered("pk")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => router.push("/pakistan")}
          >
            {/* Pulse ring on hover */}
            {hovered === "pk" && <div className="pulse-ring" style={{ border: "1px solid rgba(76,175,125,0.5)" }} />}

            {/* BG gradient */}
            <div className="card-bg" style={{
              background: `linear-gradient(160deg, #0A1F12 0%, #0D2B18 40%, #071510 100%)`,
            }} />
            {/* BG pattern */}
            <div className="card-bg" style={{
              background: `radial-gradient(ellipse at 50% -20%, rgba(76,175,125,0.15) 0%, transparent 60%)`,
            }} />

            <div className="flag-emoji" style={{ animationDelay: "0s" }}>🇵🇰</div>

            <div className="card-content">
              <div className="country-name" style={{ color: "#E8F5E0" }}>Pakistan</div>
              <div className="country-sub" style={{ color: "#9DB89A" }}>
                Pakistani Law & Statutes<br/>
                Lahore · Karachi · Islamabad
              </div>
              <button className="enter-btn">
                Enter <span style={{ fontSize: 16 }}>→</span>
              </button>
            </div>

            {/* Bottom glow */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(76,175,125,0.08), transparent)",
              pointerEvents: "none",
            }} />
          </div>

          {/* ── DIVIDER ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "1px", height: "60px", background: `linear-gradient(to bottom, transparent, ${GOLD}60, transparent)` }} />
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: `1px solid ${GOLD}40`,
              background: `radial-gradient(circle, ${GOLD}15, transparent)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Playfair Display', serif",
              fontSize: "11px", color: GOLD, letterSpacing: "1px",
              fontWeight: 700,
            }}>OR</div>
            <div style={{ width: "1px", height: "60px", background: `linear-gradient(to bottom, transparent, ${GOLD}60, transparent)` }} />
          </div>

          {/* ── USA CARD ── */}
          <div className="landing-card us-card"
            style={{ boxShadow: hovered === "us" ? `0 30px 80px rgba(178,34,52,0.35), 0 0 0 1px rgba(178,34,52,0.2)` : "0 20px 60px rgba(0,0,0,0.5)" }}
            onMouseEnter={() => setHovered("us")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => router.push("/usa")}
          >
            {hovered === "us" && <div className="pulse-ring" style={{ border: "1px solid rgba(178,34,52,0.5)" }} />}

            <div className="card-bg" style={{
              background: `linear-gradient(160deg, #1A0A0E 0%, #250D12 40%, #120508 100%)`,
            }} />
            <div className="card-bg" style={{
              background: `radial-gradient(ellipse at 50% -20%, rgba(178,34,52,0.15) 0%, transparent 60%)`,
            }} />

            <div className="flag-emoji" style={{ animationDelay: "0.5s" }}>🇺🇸</div>

            <div className="card-content">
              <div className="country-name" style={{ color: "#FFF0F0" }}>United States</div>
              <div className="country-sub" style={{ color: "#C4A0A5" }}>
                US Federal & State Law<br/>
                All 50 States · Federal Courts
              </div>
              <button className="enter-btn">
                Enter <span style={{ fontSize: 16 }}>→</span>
              </button>
            </div>

            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(178,34,52,0.08), transparent)",
              pointerEvents: "none",
            }} />
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{
          marginTop: "48px",
          fontFamily: "'Crimson Pro', serif",
          fontSize: "12px",
          color: "#4A6A56",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          animation: "fadeUp 0.8s ease both",
          animationDelay: "0.6s",
          textAlign: "center",
        }}>
          Powered by ARK Lex AI LLC · © 2026
        </div>

        {/* Quranic verse - subtle */}
        <div style={{
          marginTop: "10px",
          fontFamily: "'Crimson Pro', serif",
          fontSize: "11px",
          color: "#3A5A38",
          fontStyle: "italic",
          letterSpacing: "0.5px",
          animation: "fadeUp 0.8s ease both",
          animationDelay: "0.7s",
          textAlign: "center",
        }}>
          إِنِ الْحُكْمُ إِلَّا لِلَّهِ — "It is only Allah who decides" — Al-Qur'an
        </div>
      </div>
    </>
  );
}
