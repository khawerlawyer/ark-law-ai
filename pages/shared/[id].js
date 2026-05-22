// pages/shared/[id].js
// Public page that displays a shared ARK Law AI conversation

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const GOLD="#C9A84C", NAVY="#021A4A", CREAM="#F5F0E8", CREAM_MID="#EDE8DF";
const BORDER="#C8BFB0", TEXT="#1A1209", TEXT_MID="#3A2A18", TEXT_MUTED="#7A6A55";
const COUNTRY_COLORS={"Pakistan":"#2E7D32","India":"#B35400","Bangladesh":"#006A4E","USA":"#BF0A30","United States":"#BF0A30"};
const COUNTRY_FLAGS={"Pakistan":"pk","India":"in","Bangladesh":"bd","USA":"us","United States":"us"};

export default function SharedChat() {
  const router = useRouter();
  const { id } = router.query;
  const [chat, setChat]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/share?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.chat) {
          const c = { ...d.chat };
          try { c.messages = JSON.parse(c.messages); } catch {}
          setChat(c);
        } else {
          setError(d.error || "Chat not found");
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load shared chat"); setLoading(false); });
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const accentColor = COUNTRY_COLORS[chat?.country] || NAVY;
  const flagCode    = COUNTRY_FLAGS[chat?.country]   || "us";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderContent = (content) => {
    if (!content) return null;
    return content.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i}/>;
      if (trimmed.startsWith("**") && trimmed.endsWith("**"))
        return <p key={i} style={{fontWeight:700,color:TEXT,marginBottom:6}}>{trimmed.slice(2,-2)}</p>;
      if (trimmed.startsWith("• ") || trimmed.startsWith("- "))
        return <div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:GOLD,flexShrink:0}}>•</span><span>{trimmed.slice(2)}</span></div>;
      return <p key={i} style={{marginBottom:6,lineHeight:1.7}}>{line}</p>;
    });
  };

  return (
    <>
      <Head>
        <title>{chat?.title || "Shared Chat"} — ARK LAW AI</title>
        <meta name="description" content="Shared legal conversation from ARK LAW AI"/>
        <meta property="og:title" content={(chat?.title || "Shared Chat") + " — ARK LAW AI"}/>
        <meta property="og:description" content="View this shared legal conversation on ARK LAW AI"/>
        <meta property="og:url" content={shareUrl}/>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Georgia&display=swap" rel="stylesheet"/>
      </Head>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:${CREAM};color:${TEXT};font-family:'DM Sans',sans-serif;min-height:100vh;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:${CREAM_MID};}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .msg-fade{animation:fadeUp 0.3s ease both;}
      `}</style>

      {/* Top bar */}
      <div style={{background:"#EDE8DF",borderBottom:`1px solid ${BORDER}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
          <img src="/ark-logo-us.png" alt="ARK" style={{width:36,height:36,objectFit:"contain"}}/>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:NAVY,fontFamily:"DM Sans,sans-serif",letterSpacing:"0.8px"}}>ARK LAW AI</div>
            <div style={{fontSize:10,color:TEXT_MUTED}}>Shared Conversation</div>
          </div>
        </a>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {chat && (
            <>
              {/* Copy link */}
              <button onClick={copyLink}
                style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:copied?"#F0FAF4":"white",color:copied?"#2E7D32":TEXT_MID,border:`1px solid ${copied?"#A8D5B5":BORDER}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.2s"}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {copied
                    ? <><polyline points="20 6 9 17 4 12"/></>
                    : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}
                </svg>
                {copied ? "Copied!" : "Copy link"}
              </button>
              {/* Share on X */}
              <a href={`https://twitter.com/intent/tweet?text=Check+out+this+legal+chat+on+ARK+LAW+AI&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{width:34,height:34,background:"black",color:"white",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Share on LinkedIn */}
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{width:34,height:34,background:"#0A66C2",color:"white",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              {/* Share on WhatsApp */}
              <a href={`https://wa.me/?text=Check+out+this+ARK+LAW+AI+legal+chat:+${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{width:34,height:34,background:"#25D366",color:"white",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L0 24l6.335-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 0 1-5.017-1.37l-.36-.214-3.727.977.995-3.635-.235-.374A9.865 9.865 0 0 1 2.118 12C2.118 6.534 6.534 2.118 12 2.118S21.882 6.534 21.882 12 17.466 21.882 12 21.882z"/></svg>
              </a>
              {/* Open ARK LAW AI */}
              <a href="/" style={{padding:"7px 14px",background:accentColor,color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,textDecoration:"none",display:"inline-block"}}>
                Try ARK LAW AI &rarr;
              </a>
            </>
          )}
        </div>
      </div>

      <div style={{maxWidth:780,margin:"0 auto",padding:"32px 20px 60px"}}>

        {loading && (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{width:40,height:40,border:`3px solid ${BORDER}`,borderTopColor:GOLD,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{color:TEXT_MUTED,fontSize:14}}>Loading shared conversation...</div>
          </div>
        )}

        {error && (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <div style={{fontSize:20,fontWeight:700,color:TEXT,marginBottom:8}}>Conversation not found</div>
            <div style={{fontSize:14,color:TEXT_MUTED,marginBottom:24}}>{error}</div>
            <a href="/" style={{padding:"10px 24px",background:NAVY,color:"white",borderRadius:8,textDecoration:"none",fontWeight:700,fontSize:14}}>Go to ARK LAW AI</a>
          </div>
        )}

        {chat && !loading && (
          <>
            {/* Chat header */}
            <div style={{background:"white",border:`1px solid ${BORDER}`,borderRadius:16,padding:"20px 24px",marginBottom:20,boxShadow:`0 2px 12px rgba(180,160,100,0.08)`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <img src="/ark-logo-us.png" alt="ARK" style={{width:32,height:32,objectFit:"contain"}}/>
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px"}}>ARK LAW AI — Shared Conversation</div>
                    </div>
                  </div>
                  <div style={{fontSize:20,fontWeight:800,color:TEXT,fontFamily:"Georgia,serif",marginBottom:8}}>{chat.title}</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                    {chat.country && (
                      <span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${accentColor}18`,color:accentColor,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>
                        {COUNTRY_FLAGS[chat.country] && <img src={`https://flagcdn.com/w20/${flagCode}.png`} style={{width:14,height:10,borderRadius:1}}/>}
                        {chat.country} Law
                      </span>
                    )}
                    <span style={{fontSize:11,color:TEXT_MUTED}}>
                      {chat.messages?.length} messages
                    </span>
                    {chat.shared_by && chat.shared_by !== "Anonymous" && (
                      <span style={{fontSize:11,color:TEXT_MUTED}}>Shared by {chat.shared_by}</span>
                    )}
                    <span style={{fontSize:11,color:TEXT_MUTED}}>
                      {chat.created_at ? new Date(chat.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : ""}
                    </span>
                    {chat.views > 0 && (
                      <span style={{fontSize:11,color:TEXT_MUTED}}>{chat.views} views</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{background:`${accentColor}10`,border:`1px solid ${accentColor}30`,borderRadius:10,padding:"10px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>⚖️</span>
              <div style={{fontSize:12,color:TEXT_MID,lineHeight:1.6}}>
                <strong>Professional Disclaimer:</strong> This conversation is for informational purposes only and does not constitute legal advice. Always consult a qualified attorney for your specific legal needs.
              </div>
            </div>

            {/* Messages */}
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {chat.messages?.map((msg, i) => (
                <div key={i} className="msg-fade" style={{padding:"20px 0",borderBottom:i < chat.messages.length-1 ? `1px solid ${BORDER}20` : "none",animationDelay:`${i*0.05}s`}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    {/* Avatar */}
                    <div style={{flexShrink:0,marginTop:2}}>
                      {msg.role === "assistant" ? (
                        <div style={{width:34,height:34,borderRadius:8,background:"white",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                          <img src="/ark-logo-us.png" alt="ARK" style={{width:26,height:26,objectFit:"contain"}}/>
                        </div>
                      ) : (
                        <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,#667eea,#764ba2)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white"}}>
                          U
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:msg.role==="assistant"?accentColor:TEXT,marginBottom:8}}>
                        {msg.role === "assistant" ? `ARK Law AI` : "User"}
                      </div>
                      <div style={{fontSize:14.5,color:TEXT_MID,lineHeight:1.75}}>
                        {renderContent(msg.content)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div style={{background:"white",border:`1px solid ${BORDER}`,borderRadius:16,padding:"24px",marginTop:32,textAlign:"center",boxShadow:`0 2px 12px rgba(180,160,100,0.08)`}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:48,height:48,objectFit:"contain",marginBottom:12}}/>
              <div style={{fontSize:18,fontWeight:800,color:TEXT,marginBottom:6,fontFamily:"Georgia,serif"}}>Try ARK LAW AI for Free</div>
              <div style={{fontSize:13,color:TEXT_MUTED,marginBottom:16}}>Get expert AI-powered legal guidance for {chat.country || "US"} law</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                <a href="/" style={{padding:"10px 28px",background:accentColor,color:"white",borderRadius:8,fontWeight:700,fontSize:14,textDecoration:"none",display:"inline-block"}}>Start Free &rarr;</a>
                <button onClick={copyLink} style={{padding:"10px 20px",background:"transparent",color:TEXT_MID,border:`1px solid ${BORDER}`,borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer"}}>
                  {copied ? "✓ Link Copied!" : "Copy Share Link"}
                </button>
              </div>
              <div style={{marginTop:16,display:"flex",gap:10,justifyContent:"center"}}>
                <a href={`https://twitter.com/intent/tweet?text=Check+out+this+legal+chat+on+ARK+LAW+AI&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  style={{width:36,height:36,background:"black",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  style={{width:36,height:36,background:"#0A66C2",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href={`https://wa.me/?text=Check+out+this+ARK+LAW+AI+legal+chat:+${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  style={{width:36,height:36,background:"#25D366",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L0 24l6.335-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 0 1-5.017-1.37l-.36-.214-3.727.977.995-3.635-.235-.374A9.865 9.865 0 0 1 2.118 12C2.118 6.534 6.534 2.118 12 2.118S21.882 6.534 21.882 12 17.466 21.882 12 21.882z"/></svg>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
