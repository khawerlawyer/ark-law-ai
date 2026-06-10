// pages/blog.js — ARK LAW AI Blog

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const NAVY="#021A4A", CREAM="#F5F0E8", CREAM_MID="#EDE8DF";
const GOLD="#C9A84C", BORDER="#C8BFB0", TEXT="#1A1209", MUTED="#7A6A55";
const GREEN="#2E7D32", RED="#DC2626";

const CATEGORIES = ["Legal Research","Case Analysis","Pakistani Law","Indian Law","US Law","Bangladesh Law","Legal Technology","AI & Law","Corporate Law","Family Law","Criminal Law","General"];
const COUNTRIES  = ["Pakistan","India","United States","Bangladesh","Other"];
const PROFESSIONS = ["Advocate","Barrister","Solicitor","Judge","Law Student","Legal Researcher","Professor","Corporate Counsel","Paralegal","Other"];

const GUIDELINES = [
  { icon:"✍️", title:"Original Content",     desc:"All submissions must be original work. Plagiarism will result in immediate rejection. You may cite and quote sources with proper attribution." },
  { icon:"⚖️", title:"Legal Accuracy",        desc:"Content must be legally accurate. Cite relevant statutes, case law, and authoritative sources. Clearly distinguish between legal facts and personal opinion." },
  { icon:"🌍", title:"Jurisdiction Clarity",  desc:"Clearly state which jurisdiction your article covers. ARK LAW AI covers Pakistani, Indian, US, and Bangladeshi law — focus on one of these." },
  { icon:"📏", title:"Length & Format",        desc:"Articles should be 800–3000 words. Use clear headings, numbered sections, and bullet points where appropriate. Plain language is preferred over excessive legalese." },
  { icon:"🚫", title:"No Advertising",         desc:"No promotional content, advertisements, or self-serving articles. Content must provide genuine educational value to the legal community." },
  { icon:"🔒", title:"Confidentiality",        desc:"Do not include real client names, case numbers, or confidential information. Anonymize all case studies and real-world examples." },
  { icon:"📧", title:"Review Process",         desc:"All submissions are reviewed by the ARK LAW AI editorial team. You will be notified by email within 5–7 business days of submission." },
  { icon:"📜", title:"Rights & Attribution",   desc:"By submitting, you grant ARK LAW AI the right to publish your article. You will be credited as the author on all published content." },
];

export default function Blog() {
  const [view,      setView]      = useState("home"); // home | submit | post
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selPost,   setSelPost]   = useState(null);
  const [selCat,    setSelCat]    = useState("All");
  const [form,      setForm]      = useState({ title:"", author_name:"", author_email:"", profession:"", country:"", category:"Legal Research", content:"", excerpt:"" });
  const [submitting,setSubmitting]= useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredPosts = selCat === "All" ? posts : posts.filter(p => p.category === selCat);

  const handleSubmit = async () => {
    if (!form.title.trim())        return setFormError("Please enter a title.");
    if (!form.author_name.trim())  return setFormError("Please enter your name.");
    if (!form.author_email.trim()) return setFormError("Please enter your email.");
    if (!form.content.trim() || form.content.length < 300) return setFormError("Article must be at least 300 characters.");
    setSubmitting(true); setFormError("");
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) { setSubmitted(true); setForm({ title:"", author_name:"", author_email:"", profession:"", country:"", category:"Legal Research", content:"", excerpt:"" }); }
      else setFormError(data.error || "Submission failed. Please try again.");
    } catch (e) { setFormError("Network error. Please try again."); }
    setSubmitting(false);
  };

  const openPost = async (post) => {
    setSelPost(post); setView("post");
    // increment views
    fetch(`/api/blog?id=${post.id}`, { method: "PATCH" }).catch(() => {});
    window.scrollTo(0, 0);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { day:"numeric", month:"long", year:"numeric" }) : "";
  const readTime = (content) => Math.max(1, Math.ceil((content || "").split(" ").length / 200)) + " min read";

  return (
    <>
      <Head>
        <title>ARK LAW AI Blog — Legal Insights & Analysis</title>
        <meta name="description" content="Legal articles, case analysis, and AI in law insights from ARK LAW AI. Covering Pakistani, Indian, US and Bangladeshi law."/>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      </Head>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:${CREAM};color:${TEXT};font-family:"DM Sans",sans-serif;min-height:100vh;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${CREAM_MID};}::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
        a{text-decoration:none;color:inherit;}
        textarea,input,select{font-family:"DM Sans",sans-serif;}
        textarea:focus,input:focus,select:focus{outline:none;border-color:${NAVY}!important;}
        .post-card{background:white;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;transition:all 0.2s;cursor:pointer;}
        .post-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(2,26,74,0.1);}
        .cat-chip{padding:5px 14px;border-radius:20px;border:1px solid ${BORDER};background:transparent;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s;font-family:"DM Sans",sans-serif;color:${MUTED};}
        .cat-chip.active{background:${NAVY};color:white;border-color:${NAVY};}
        .cat-chip:hover:not(.active){background:${CREAM_MID};color:${TEXT};}
        .prose h2{font-family:"Playfair Display",serif;font-size:20px;font-weight:700;color:${TEXT};margin:24px 0 10px;}
        .prose h3{font-size:16px;font-weight:700;color:${TEXT};margin:20px 0 8px;}
        .prose p{font-size:15px;line-height:1.85;color:#2A1E10;margin-bottom:14px;}
        .prose ul,.prose ol{padding-left:24px;margin-bottom:14px;}
        .prose li{font-size:15px;line-height:1.8;color:#2A1E10;margin-bottom:4px;}
        .prose blockquote{border-left:3px solid ${GOLD};padding:10px 16px;background:${CREAM_MID};border-radius:0 8px 8px 0;margin:16px 0;font-style:italic;color:${MUTED};}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.3s ease both;}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{background:"white",borderBottom:"1px solid "+BORDER,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/ark-logo-us.png" alt="ARK" style={{width:36,height:36,objectFit:"contain"}}/>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:NAVY,letterSpacing:"0.8px"}}>ARK LAW AI</div>
              <div style={{fontSize:10,color:MUTED}}>Legal Blog</div>
            </div>
          </Link>
          <nav style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>{setView("home");setSelPost(null);}} style={{padding:"7px 16px",background:view==="home"?CREAM_MID:"transparent",color:view==="home"?TEXT:MUTED,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Blog</button>
            <button onClick={()=>{setView("guidelines");}} style={{padding:"7px 16px",background:view==="guidelines"?CREAM_MID:"transparent",color:view==="guidelines"?TEXT:MUTED,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Guidelines</button>
            <button onClick={()=>{setView("submit");setSubmitted(false);}} style={{padding:"7px 18px",background:NAVY,color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>Submit Article</button>
          </nav>
        </div>
      </header>

      {/* ── HOME / BLOG LIST ── */}
      {view === "home" && (
        <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px 60px"}}>
          {/* Hero */}
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${NAVY}15`,color:NAVY,padding:"4px 14px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>
              Legal Insights & Analysis
            </div>
            <h1 style={{fontFamily:"Playfair Display,serif",fontSize:42,fontWeight:800,color:TEXT,marginBottom:10}}>ARK LAW AI Blog</h1>
            <p style={{fontSize:15,color:MUTED,maxWidth:560,margin:"0 auto",lineHeight:1.7}}>Expert legal articles, case analysis, and AI in law insights from lawyers, advocates, and legal researchers across Pakistan, India, USA and Bangladesh.</p>
          </div>

          {/* Category filter */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32,justifyContent:"center"}}>
            {["All",...CATEGORIES].map(c=>(
              <button key={c} className={"cat-chip"+(selCat===c?" active":"")} onClick={()=>setSelCat(c)}>{c}</button>
            ))}
          </div>

          {/* Posts grid */}
          {loading ? (
            <div style={{textAlign:"center",padding:"60px 0",color:MUTED}}>
              <div style={{width:32,height:32,border:"3px solid "+BORDER,borderTopColor:NAVY,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
              Loading articles...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>📝</div>
              <div style={{fontSize:18,fontWeight:700,color:TEXT,marginBottom:8}}>No articles yet</div>
              <div style={{fontSize:14,color:MUTED,marginBottom:20}}>Be the first to contribute to the ARK LAW AI legal community.</div>
              <button onClick={()=>setView("submit")} style={{padding:"10px 24px",background:NAVY,color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>Submit an Article</button>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20}}>
              {filteredPosts.map((post,i) => (
                <div key={post.id} className="post-card fade-up" style={{animationDelay:`${i*0.05}s`}} onClick={()=>openPost(post)}>
                  <div style={{background:`linear-gradient(135deg,${NAVY},#0a2a5e)`,padding:"20px 20px 16px",position:"relative"}}>
                    <span style={{display:"inline-block",background:`${GOLD}30`,color:GOLD,fontSize:10,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",padding:"3px 10px",borderRadius:20,marginBottom:10}}>{post.category}</span>
                    <h2 style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"white",lineHeight:1.35,marginBottom:8}}>{post.title}</h2>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{readTime(post.content)}</div>
                  </div>
                  <div style={{padding:"16px 20px 20px"}}>
                    <p style={{fontSize:13,color:MUTED,lineHeight:1.65,marginBottom:14}}>{post.excerpt || post.content?.substring(0,160)}...</p>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:TEXT}}>{post.author_name}</div>
                        <div style={{fontSize:11,color:MUTED}}>{post.profession}{post.country?` · ${post.country}`:""}</div>
                      </div>
                      <div style={{fontSize:11,color:MUTED}}>{fmtDate(post.published_at||post.submitted_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit CTA */}
          <div style={{marginTop:48,background:`linear-gradient(135deg,${NAVY},#0a2a5e)`,borderRadius:16,padding:"32px 40px",textAlign:"center",color:"white"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:24,fontWeight:700,marginBottom:8}}>Share Your Legal Knowledge</div>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.7)",marginBottom:20,maxWidth:500,margin:"0 auto 20px"}}>Are you a lawyer, advocate, or legal researcher? Contribute to the ARK LAW AI community blog.</p>
            <button onClick={()=>setView("submit")} style={{padding:"11px 28px",background:GOLD,color:NAVY,border:"none",borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:800,fontFamily:"inherit"}}>Submit Your Article &rarr;</button>
          </div>
        </div>
      )}

      {/* ── FULL POST ── */}
      {view === "post" && selPost && (
        <div style={{maxWidth:780,margin:"0 auto",padding:"32px 24px 60px"}}>
          <button onClick={()=>{setView("home");setSelPost(null);}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"white",color:MUTED,border:"1px solid "+BORDER,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,marginBottom:24,fontFamily:"inherit"}}>
            &larr; Back to Blog
          </button>
          <span style={{display:"inline-block",background:`${NAVY}15`,color:NAVY,fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",padding:"4px 12px",borderRadius:20,marginBottom:14}}>{selPost.category}</span>
          <h1 style={{fontFamily:"Playfair Display,serif",fontSize:34,fontWeight:800,color:TEXT,lineHeight:1.25,marginBottom:16}}>{selPost.title}</h1>
          <div style={{display:"flex",alignItems:"center",gap:16,paddingBottom:20,borderBottom:"1px solid "+BORDER,marginBottom:28}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${NAVY},#2a4a8e)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"white",flexShrink:0}}>
              {selPost.author_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:TEXT}}>{selPost.author_name}</div>
              <div style={{fontSize:12,color:MUTED}}>{selPost.profession}{selPost.country?` · ${selPost.country}`:""} · {fmtDate(selPost.published_at||selPost.submitted_at)} · {readTime(selPost.content)}</div>
            </div>
          </div>
          <div className="prose">
            {selPost.content?.split("\n").map((line,i) => {
              if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
              if (line.startsWith("> ")) return <blockquote key={i}>{line.slice(2)}</blockquote>;
              if (line.startsWith("- ") || line.startsWith("• ")) return <ul key={i}><li>{line.slice(2)}</li></ul>;
              if (!line.trim()) return <br key={i}/>;
              return <p key={i}>{line}</p>;
            })}
          </div>
          <div style={{marginTop:32,padding:"16px 20px",background:CREAM_MID,borderRadius:10,border:"1px solid "+BORDER,fontSize:12,color:MUTED,lineHeight:1.6}}>
            <strong style={{color:TEXT}}>Professional Disclaimer by ARK LAW AI:</strong> This article is for informational purposes only and does not constitute legal advice. Always consult a qualified attorney for your specific legal needs.
          </div>
          <div style={{marginTop:24,display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={()=>{navigator.clipboard.writeText(window.location.href).then(()=>alert("Link copied!"));}} style={{padding:"8px 16px",background:"white",color:TEXT,border:"1px solid "+BORDER,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>🔗 Copy Link</button>
            <a href={"https://wa.me/?text="+encodeURIComponent(selPost.title+" - "+window.location.href)} target="_blank" rel="noopener noreferrer" style={{padding:"8px 16px",background:"#25D366",color:"white",borderRadius:8,fontSize:12,fontWeight:600,display:"inline-block"}}>WhatsApp</a>
            <a href={"https://twitter.com/intent/tweet?text="+encodeURIComponent(selPost.title)+"&url="+encodeURIComponent(window.location.href)} target="_blank" rel="noopener noreferrer" style={{padding:"8px 16px",background:"black",color:"white",borderRadius:8,fontSize:12,fontWeight:600,display:"inline-block"}}>X</a>
          </div>
        </div>
      )}

      {/* ── GUIDELINES ── */}
      {view === "guidelines" && (
        <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px 60px"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <h1 style={{fontFamily:"Playfair Display,serif",fontSize:36,fontWeight:800,color:TEXT,marginBottom:10}}>Submission Guidelines</h1>
            <p style={{fontSize:15,color:MUTED,maxWidth:520,margin:"0 auto",lineHeight:1.7}}>Before submitting your article, please read these guidelines carefully. Submissions that do not comply will be rejected.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))",gap:16,marginBottom:40}}>
            {GUIDELINES.map((g,i) => (
              <div key={i} style={{background:"white",border:"1px solid "+BORDER,borderRadius:12,padding:"20px 22px",display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{fontSize:28,flexShrink:0}}>{g.icon}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:5}}>{g.title}</div>
                  <div style={{fontSize:13,color:MUTED,lineHeight:1.65}}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:`linear-gradient(135deg,${NAVY},#0a2a5e)`,borderRadius:14,padding:"28px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:"white",marginBottom:4}}>Ready to submit?</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.65)"}}>Review period: 5–7 business days. Email confirmation sent.</div>
            </div>
            <button onClick={()=>setView("submit")} style={{padding:"11px 28px",background:GOLD,color:NAVY,border:"none",borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:800,fontFamily:"inherit",flexShrink:0}}>Submit Your Article &rarr;</button>
          </div>
        </div>
      )}

      {/* ── SUBMIT FORM ── */}
      {view === "submit" && (
        <div style={{maxWidth:720,margin:"0 auto",padding:"40px 24px 60px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <h1 style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:800,color:TEXT,marginBottom:8}}>Submit an Article</h1>
            <p style={{fontSize:14,color:MUTED}}>Share your legal expertise with the ARK LAW AI community. <button onClick={()=>setView("guidelines")} style={{background:"none",border:"none",color:NAVY,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",textDecoration:"underline"}}>Read guidelines first &rarr;</button></p>
          </div>

          {submitted ? (
            <div style={{background:"white",border:"1px solid "+BORDER,borderRadius:16,padding:"48px 32px",textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:16}}>🎉</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:24,fontWeight:700,color:TEXT,marginBottom:8}}>Article Submitted!</div>
              <div style={{fontSize:14,color:MUTED,marginBottom:24,lineHeight:1.7}}>Thank you for your contribution. Our editorial team will review your submission within 5–7 business days. You will receive a confirmation email shortly.</div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button onClick={()=>{setView("home");setSubmitted(false);}} style={{padding:"10px 24px",background:NAVY,color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>Back to Blog</button>
                <button onClick={()=>setSubmitted(false)} style={{padding:"10px 24px",background:"white",color:MUTED,border:"1px solid "+BORDER,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Submit Another</button>
              </div>
            </div>
          ) : (
            <div style={{background:"white",border:"1px solid "+BORDER,borderRadius:16,padding:"32px",boxShadow:"0 2px 12px rgba(2,26,74,0.06)"}}>

              {/* Author info */}
              <div style={{fontSize:12,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:"1px",marginBottom:16,paddingBottom:8,borderBottom:"1px solid "+CREAM_MID}}>Author Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
                {[
                  {label:"Full Name *",     key:"author_name",  placeholder:"Your full name"},
                  {label:"Email Address *", key:"author_email", placeholder:"your@email.com"},
                  {label:"Profession",      key:"profession",   type:"select", options:PROFESSIONS},
                  {label:"Country",         key:"country",      type:"select", options:COUNTRIES},
                ].map(({label,key,placeholder,type,options}) => (
                  <div key={key}>
                    <div style={{fontSize:12,fontWeight:600,color:MUTED,marginBottom:5}}>{label}</div>
                    {type === "select" ? (
                      <select value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                        style={{width:"100%",padding:"9px 12px",background:"#FAF8F4",border:"1px solid "+BORDER,borderRadius:8,fontSize:13,color:TEXT}}>
                        <option value="">Select...</option>
                        {options.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}
                        style={{width:"100%",padding:"9px 12px",background:"#FAF8F4",border:"1px solid "+BORDER,borderRadius:8,fontSize:13,color:TEXT}}/>
                    )}
                  </div>
                ))}
              </div>

              {/* Article info */}
              <div style={{fontSize:12,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:"1px",marginBottom:16,paddingBottom:8,borderBottom:"1px solid "+CREAM_MID}}>Article Details</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:MUTED,marginBottom:5}}>Article Title *</div>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Understanding Bail Law in Pakistan: A Comprehensive Guide"
                  style={{width:"100%",padding:"10px 12px",background:"#FAF8F4",border:"1px solid "+BORDER,borderRadius:8,fontSize:14,color:TEXT}}/>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:MUTED,marginBottom:5}}>Category</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {CATEGORIES.map(c=>(
                    <button key={c} onClick={()=>setForm(p=>({...p,category:c}))}
                      style={{padding:"5px 12px",background:form.category===c?NAVY:"#F5F0E8",color:form.category===c?"white":MUTED,border:`1px solid ${form.category===c?NAVY:BORDER}`,borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"inherit",transition:"all 0.15s"}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{fontSize:12,fontWeight:600,color:MUTED}}>Article Content * <span style={{fontWeight:400}}>(minimum 300 characters)</span></div>
                  <div style={{fontSize:11,color:form.content.length<300?RED:GREEN}}>{form.content.length} characters</div>
                </div>
                <div style={{fontSize:11,color:MUTED,marginBottom:6}}>Use ## for headings, ### for subheadings, - for bullet points, {">"} for quotes</div>
                <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}
                  placeholder={"## Introduction\n\nWrite your article here...\n\n## Section 1\n\nYour content...\n\n## Conclusion\n\nYour conclusion..."}
                  style={{width:"100%",minHeight:320,padding:"12px",background:"#FAF8F4",border:"1px solid "+BORDER,borderRadius:8,fontSize:13,color:TEXT,resize:"vertical",lineHeight:1.7}}/>
              </div>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:12,fontWeight:600,color:MUTED,marginBottom:5}}>Short Excerpt <span style={{fontWeight:400}}>(optional — shown in blog listing)</span></div>
                <textarea value={form.excerpt} onChange={e=>setForm(p=>({...p,excerpt:e.target.value}))} placeholder="A 1-2 sentence summary of your article (max 300 characters)..."
                  style={{width:"100%",minHeight:70,padding:"10px 12px",background:"#FAF8F4",border:"1px solid "+BORDER,borderRadius:8,fontSize:13,color:TEXT,resize:"vertical",lineHeight:1.6}}/>
              </div>

              {/* Agreement */}
              <div style={{background:CREAM_MID,borderRadius:10,padding:"14px 16px",marginBottom:20,fontSize:12,color:MUTED,lineHeight:1.7}}>
                By submitting this article, you confirm that: (1) the content is original and your own work, (2) you have the right to publish it, (3) it does not violate any laws or third-party rights, and (4) you grant ARK LAW AI the right to publish and display this article.
              </div>

              {formError && (
                <div style={{padding:"10px 14px",background:"#FEF2F2",border:"1px solid #F0B8C0",borderRadius:8,fontSize:13,color:RED,marginBottom:16}}>{formError}</div>
              )}

              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setView("guidelines")} style={{padding:"10px 20px",background:"white",color:MUTED,border:"1px solid "+BORDER,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Read Guidelines</button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{padding:"11px 32px",background:submitting?"#C8BFB0":NAVY,color:"white",border:"none",borderRadius:9,cursor:submitting?"not-allowed":"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
                  {submitting?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>Submitting...</>:"Submit Article →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{background:NAVY,borderTop:"2px solid "+GOLD,padding:"20px 24px",marginTop:40}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/ark-logo-us.png" alt="ARK" style={{width:28,height:28,objectFit:"contain",filter:"brightness(1.2)"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"white"}}>ARK LAW AI Blog</span>
          </div>
          <div style={{display:"flex",gap:16}}>
            {[{label:"Pakistan",href:"/pakistan"},{label:"India",href:"/india"},{label:"USA",href:"/usa"},{label:"Bangladesh",href:"/bangladesh"},{label:"Home",href:"/"}].map(l=>(
              <Link key={l.label} href={l.href} style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:500}}>{l.label}</Link>
            ))}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>© {new Date().getFullYear()} ARK LAW AI</div>
        </div>
      </footer>
    </>
  );
}
