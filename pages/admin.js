// pages/admin.js — ARK LAW AI Admin Panel (Cream Theme)

import { useState, useEffect } from "react";
import Head from "next/head";

const CREAM="#F5F0E8",CREAM_CARD="#FFFFFF",CREAM_MID="#EDE8DF",BORDER="#C8BFB0",BORDER_LIGHT="#DDD6CB";
const TEXT="#1A1209",TEXT_MID="#3A2A18",TEXT_MUTED="#7A6A55",TEXT_DIM="#9A8A75";
const GOLD="#C9A84C",GREEN="#2E7D32",RED="#DC2626",BLUE="#021A4A";
const SHADOW="0 2px 12px rgba(180,160,100,0.12)";

export default function AdminPanel() {
  const [authed,setAuthed]=useState(false);
  const [checking,setChecking]=useState(true);
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [tab,setTab]=useState("dashboard");
  const [msg,setMsg]=useState("");
  const [visitors,setVisitors]=useState([]);
  const [editTokens,setEditTokens]=useState("");

  const [arkModal, setArkModal] = useState(null);
  const arkAlert  = (message, title="ARK LAW AI", icon="ℹ️") => new Promise(r => setArkModal({type:"alert",  title, message, icon, resolve:r}));
  const arkConfirm = (message, title="ARK LAW AI", icon="❓", confirmLabel="Confirm", confirmColor="#1A1209") => new Promise(r => setArkModal({type:"confirm", title, message, icon, confirmLabel, confirmColor, resolve:r}));

  const [usTheme,setUsTheme]=useState(()=>{try{return localStorage.getItem("arklaw_us_theme")||"chatgpt";}catch{return"chatgpt";}});
  const [pkTheme,setPkTheme]=useState(()=>{try{return localStorage.getItem("arklaw_pk_theme")||"chatgpt";}catch{return"chatgpt";}});

  useEffect(()=>{
    try{
      const u=JSON.parse(localStorage.getItem("arklaw_user")||"{}");
      if(u?.email?.toLowerCase()==="khawer.profession@gmail.com"){setAuthed(true);fetchUsers();loadVisitors();}
    }catch{}
    setChecking(false);
  },[]);

  const loadVisitors=()=>{try{setVisitors(JSON.parse(localStorage.getItem("arklaw_visitors")||"[]"));}catch{}};
  const fetchUsers=async()=>{
    setLoading(true);
    try{const res=await fetch("/api/admin/users");const d=await res.json();if(res.ok)setUsers(d.users||[]);else setMsg("Error: "+(d.error||"Unknown"));}
    catch(e){setMsg("Failed: "+e.message);}finally{setLoading(false);}
  };
  const updateTokens=async(uid,val)=>{
    try{const res=await fetch("/api/auth/save-history",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:uid,tokens:Number(val)})});
    const d=await res.json();
    if(res.ok){setMsg("✅ Credits updated");setUsers(p=>p.map(u=>u.id===uid?{...u,tokens:Number(val)}:u));if(selected?.id===uid)setSelected(p=>({...p,tokens:Number(val)}));}
    else setMsg("❌ "+d.error);}catch(e){setMsg("❌ "+e.message);}
  };
  const deleteUser=async(uid,email)=>{
    const _del = await arkConfirm("Delete user "+email+"?\nThis action cannot be undone.", "Delete User", "🗑️", "Delete", "#DC2626"); if(!_del) return;
    try{const res=await fetch("/api/admin/delete-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:uid})});
    const d=await res.json();
    if(res.ok){setMsg("✅ Deleted");setUsers(p=>p.filter(u=>u.id!==uid));setSelected(null);}else setMsg("❌ "+d.error);}catch(e){setMsg("❌ "+e.message);}
  };

  const getSessions=u=>{try{return JSON.parse(u.chat_history||"[]");}catch{return[];}};
  const getTotalMsgs=u=>getSessions(u).reduce((a,s)=>a+(s.messages?.length||0),0);
  const getEstTime=u=>{const ex=getSessions(u).reduce((a,s)=>{const m=s.messages||[];return a+Math.min(m.filter(x=>x.role==="user").length,m.filter(x=>x.role==="assistant").length);},0);return ex*2;};
  const fmtTime=m=>m<1?"< 1 min":m<60?m+" min":Math.floor(m/60)+"h "+(m%60)+"m";

  const filtered=users.filter(u=>
    u.email?.toLowerCase().includes(search.toLowerCase())||
    u.name?.toLowerCase().includes(search.toLowerCase())||
    u.city?.toLowerCase().includes(search.toLowerCase())||
    u.country?.toLowerCase().includes(search.toLowerCase())||
    u.profession?.toLowerCase().includes(search.toLowerCase())
  );

  const totalTokens=users.reduce((s,u)=>s+(u.tokens||0),0);
  const activeToday=users.filter(u=>u.last_login&&new Date(u.last_login)>new Date(Date.now()-86400000)).length;
  const active7d=users.filter(u=>u.last_login&&new Date(u.last_login)>new Date(Date.now()-7*86400000)).length;
  const byCountry=users.reduce((acc,u)=>{const c=u.country||"Unknown";acc[c]=(acc[c]||0)+1;return acc;},{});
  const byProfession=users.reduce((acc,u)=>{const p=u.profession||"Unknown";acc[p]=(acc[p]||0)+1;return acc;},{});

  const TABS=[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"users",icon:"👥",label:"Users"},{id:"activity",icon:"📈",label:"Activity"},{id:"visitors",icon:"👁️",label:"Visitors"},{id:"tokens",icon:"⚡",label:"Credits"},{id:"theme",icon:"🎨",label:"Themes"}];
  const card={background:CREAM_CARD,border:"1px solid "+BORDER_LIGHT,borderRadius:12,padding:"16px 18px",boxShadow:SHADOW};
  const inp={width:"100%",padding:"8px 11px",background:CREAM_CARD,border:"1px solid "+BORDER,borderRadius:7,color:TEXT,fontSize:13,outline:"none",fontFamily:"inherit"};
  const btn=(bg=BLUE)=>({padding:"7px 16px",background:bg,color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"});

  if(checking)return <div style={{background:CREAM,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:BLUE,fontFamily:"DM Sans,sans-serif",fontSize:16}}>Checking access...</div>;
  if(!authed)return(
    <div style={{background:CREAM,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:16}}>🔒</div>
        <div style={{fontSize:20,fontWeight:700,color:RED,marginBottom:8}}>Access Denied</div>
        <div style={{fontSize:13,color:TEXT_MUTED}}>Restricted to administrators only.</div>
        <button onClick={()=>window.close()} style={{marginTop:20,...btn(BLUE)}}>Close</button>
      </div>
    </div>
  );

  return(
    <>
      <Head>
        <title>ARK LAW AI — Admin Panel</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:${CREAM};color:${TEXT};font-family:"DM Sans",sans-serif;min-height:100vh;}
        ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:${CREAM_MID};}::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
        table{border-collapse:collapse;width:100%;}
        th{background:${CREAM_MID};color:${TEXT_MUTED};font-size:10px;text-transform:uppercase;letter-spacing:0.6px;padding:10px 12px;text-align:left;border-bottom:1px solid ${BORDER};}
        td{padding:10px 12px;font-size:13px;border-bottom:1px solid ${BORDER_LIGHT};color:${TEXT_MID};vertical-align:middle;}
        tr:hover td{background:#FAF8F4;cursor:pointer;}
        .tab-btn{padding:9px 16px;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.15s;font-family:"DM Sans",sans-serif;display:flex;align-items:center;gap:6px;}
        a{text-decoration:none;}
        input:focus,select:focus{border-color:${BLUE}!important;outline:none;}
      `}</style>

      {/* Header */}
      <div style={{background:CREAM_CARD,borderBottom:"2px solid "+BORDER,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="/ark-logo-us.png" alt="ARK" style={{width:40,height:40,objectFit:"contain"}}/>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:BLUE,letterSpacing:"0.5px"}}>ARK LAW AI</div>
            <div style={{fontSize:10,color:TEXT_MUTED}}>Admin Control Panel</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:11,color:TEXT_MUTED}}>🔑 <b style={{color:TEXT}}>Khawer Rabbani</b></span>
          <button onClick={fetchUsers} style={btn(BLUE)}>🔄 Refresh</button>
          <button onClick={()=>window.close()} style={btn(RED)}>✕ Close</button>
        </div>
      </div>

      <div style={{padding:"20px 24px"}}>
        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:22}}>
          {[
            {label:"Total Users",value:users.length,icon:"👥",color:BLUE},
            {label:"Active Today",value:activeToday,icon:"🟢",color:GREEN},
            {label:"Active 7 Days",value:active7d,icon:"📅",color:"#B35400"},
            {label:"Total Sessions",value:users.reduce((a,u)=>a+getSessions(u).length,0),icon:"💬",color:"#006A4E"},
            {label:"Low Credits",value:users.filter(u=>(u.tokens||0)<50000).length,icon:"⚠️",color:RED},
            {label:"Credits Pool",value:((totalTokens/1000000).toFixed(1))+"M",icon:"⚡",color:GOLD},
          ].map(({label,value,icon,color})=>(
            <div key={label} style={{...card}}>
              <div style={{fontSize:22,marginBottom:5}}>{icon}</div>
              <div style={{fontSize:22,fontWeight:800,color}}>{value}</div>
              <div style={{fontSize:11,color:TEXT_MUTED,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,borderBottom:"2px solid "+BORDER_LIGHT}}>
          {TABS.map(t=>(
            <button key={t.id} className="tab-btn"
              style={{background:tab===t.id?CREAM_CARD:"transparent",color:tab===t.id?BLUE:TEXT_MUTED,borderBottom:tab===t.id?"2px solid "+BLUE:"2px solid transparent",marginBottom:"-2px"}}
              onClick={()=>setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {msg&&<div style={{margin:"12px 0",padding:"9px 14px",background:msg.startsWith("✅")?"#F0FAF4":"#FEF2F2",border:"1px solid "+(msg.startsWith("✅")?"#A8D5B5":"#F0B8C0"),borderRadius:8,fontSize:13,display:"flex",justifyContent:"space-between",color:msg.startsWith("✅")?GREEN:RED}}>
          <span>{msg}</span><button onClick={()=>setMsg("")} style={{background:"none",border:"none",cursor:"pointer",color:TEXT_MUTED,fontSize:16}}>✕</button>
        </div>}

        <div style={{background:CREAM_CARD,border:"1px solid "+BORDER_LIGHT,borderRadius:"0 12px 12px 12px",padding:18}}>

          {/* DASHBOARD */}
          {tab==="dashboard"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{...card}}>
                <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:12}}>🌍 Users by Country</div>
                {Object.entries(byCountry).sort((a,b)=>b[1]-a[1]).map(([c,n])=>(
                  <div key={c} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:12,color:TEXT_MID,minWidth:130}}>{c}</span>
                    <div style={{flex:1,height:7,background:BORDER_LIGHT,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(4,(n/users.length)*100)+"%",background:BLUE,borderRadius:4}}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:BLUE,minWidth:22,textAlign:"right"}}>{n}</span>
                  </div>
                ))}
              </div>
              <div style={{...card}}>
                <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:12}}>💼 By Profession</div>
                {Object.entries(byProfession).sort((a,b)=>b[1]-a[1]).map(([p,n])=>(
                  <div key={p} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:12,color:TEXT_MID,minWidth:130}}>{p}</span>
                    <div style={{flex:1,height:7,background:BORDER_LIGHT,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(4,(n/users.length)*100)+"%",background:GREEN,borderRadius:4}}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:GREEN,minWidth:22,textAlign:"right"}}>{n}</span>
                  </div>
                ))}
              </div>
              <div style={{gridColumn:"1 / -1"}}>
                <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:12}}>🆕 Recent Signups</div>
                <table><thead><tr><th>Name</th><th>Email</th><th>Country</th><th>Profession</th><th>City</th><th>Joined</th></tr></thead>
                <tbody>{[...users].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,8).map(u=>(
                  <tr key={u.id} onClick={()=>{setSelected(u);setEditTokens(u.tokens||0);setTab("users");}}>
                    <td style={{fontWeight:600,color:TEXT}}>{u.name}</td><td style={{color:TEXT_MUTED}}>{u.email}</td>
                    <td><span style={{background:CREAM_MID,borderRadius:4,padding:"2px 7px",fontSize:11}}>{u.country||"—"}</span></td>
                    <td>{u.profession}</td><td>{u.city}</td>
                    <td style={{color:TEXT_MUTED,fontSize:12}}>{u.created_at?new Date(u.created_at).toLocaleDateString():"—"}</td>
                  </tr>
                ))}</tbody></table>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab==="users"&&(
            <div style={{display:"flex",gap:16}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, city, country, profession..." style={{...inp,flex:1}}/>
                  <button onClick={fetchUsers} style={btn(BLUE)}>🔄 Refresh</button>
                  <span style={{fontSize:11,color:TEXT_MUTED,whiteSpace:"nowrap"}}>{filtered.length}/{users.length}</span>
                </div>
                {loading?<div style={{textAlign:"center",padding:40,color:TEXT_MUTED}}>Loading...</div>:(
                  <div style={{overflowX:"auto",maxHeight:"60vh",overflowY:"auto"}}>
                    <table><thead><tr>
                      <th>Name</th><th>Email</th><th>Country</th><th>City</th><th>Province</th><th>Profession</th><th>Credits</th><th>Sessions</th><th>Est Time</th><th>Last Login</th><th>Joined</th><th>Actions</th>
                    </tr></thead><tbody>
                      {filtered.map(u=>(
                        <tr key={u.id} onClick={()=>{setSelected(u);setEditTokens(u.tokens||0);}} style={{background:selected?.id===u.id?"#FAF8F4":""}}>
                          <td style={{fontWeight:600,color:TEXT}}>{u.name}</td>
                          <td style={{color:TEXT_MUTED,fontSize:12}}>{u.email}</td>
                          <td><span style={{background:CREAM_MID,borderRadius:4,padding:"2px 7px",fontSize:11}}>{u.country||"—"}</span></td>
                          <td>{u.city}</td><td>{u.province}</td><td>{u.profession}</td>
                          <td><span style={{color:(u.tokens||0)>100000?GREEN:(u.tokens||0)>50000?GOLD:RED,fontWeight:700}}>{((u.tokens||0)/1000).toFixed(0)}K</span></td>
                          <td style={{color:BLUE,fontWeight:600}}>{getSessions(u).length}</td>
                          <td style={{color:TEXT_MUTED,fontSize:12}}>{fmtTime(getEstTime(u))}</td>
                          <td style={{color:TEXT_MUTED,fontSize:12}}>{u.last_login?new Date(u.last_login).toLocaleDateString():"Never"}</td>
                          <td style={{color:TEXT_MUTED,fontSize:12}}>{u.created_at?new Date(u.created_at).toLocaleDateString():"—"}</td>
                          <td><button onClick={e=>{e.stopPropagation();deleteUser(u.id,u.email);}} style={{...btn(RED),padding:"3px 8px",fontSize:10}}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody></table>
                  </div>
                )}
              </div>
              {/* Detail panel */}
              {selected&&(
                <div style={{width:290,flexShrink:0,background:CREAM_MID,borderRadius:12,border:"1px solid "+BORDER,padding:16,overflowY:"auto",maxHeight:"75vh"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"center"}}>
                    <span style={{fontSize:14,fontWeight:700,color:BLUE}}>User Detail</span>
                    <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:TEXT_MUTED,fontSize:18}}>✕</button>
                  </div>
                  <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,"+BLUE+",#2E6BC4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"white",marginBottom:12}}>
                    {selected.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {[
                    ["Full Name",selected.name],["Email",selected.email],["Profession",selected.profession],
                    ["City",selected.city],["State/Province",selected.province],["Country",selected.country],
                    ["Joined",selected.created_at?new Date(selected.created_at).toLocaleDateString():"—"],
                    ["Last Login",selected.last_login?new Date(selected.last_login).toLocaleString():"Never"],
                    ["Sessions",getSessions(selected).length+" sessions"],
                    ["Total Messages",getTotalMsgs(selected)+" msgs"],
                    ["Avg Msgs/Session",getSessions(selected).length?Math.round(getTotalMsgs(selected)/getSessions(selected).length)+" msgs":"—"],
                    ["Est Total Time",fmtTime(getEstTime(selected))],
                    ["Credits Left",(selected.tokens||0).toLocaleString()],
                    ["Credits Used",(500000-(selected.tokens||0)).toLocaleString()],
                    ["Usage %",Math.round((1-(selected.tokens||0)/500000)*100)+"%"],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid "+BORDER_LIGHT,padding:"5px 0",fontSize:11}}>
                      <span style={{color:TEXT_MUTED}}>{k}</span>
                      <span style={{color:TEXT,fontWeight:600,textAlign:"right",maxWidth:155,wordBreak:"break-all"}}>{v||"—"}</span>
                    </div>
                  ))}
                  {/* Session breakdown */}
                  {getSessions(selected).length>0&&(
                    <div style={{marginTop:14}}>
                      <div style={{fontSize:12,fontWeight:700,color:BLUE,marginBottom:8}}>🕐 Session Activity</div>
                      <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
                        {getSessions(selected).map((s,i)=>{
                          const msgs=s.messages||[];
                          const uM=msgs.filter(m=>m.role==="user").length;
                          const aM=msgs.filter(m=>m.role==="assistant").length;
                          return(
                            <div key={i} style={{background:CREAM_CARD,borderRadius:8,padding:"7px 10px",border:"1px solid "+BORDER_LIGHT}}>
                              <div style={{fontSize:11,fontWeight:700,color:TEXT,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i+1}. {s.title||"Untitled"}</div>
                              <div style={{display:"flex",gap:8,fontSize:10,flexWrap:"wrap"}}>
                                <span style={{color:GREEN}}>💬 {uM}Q</span>
                                <span style={{color:TEXT_MUTED}}>🤖 {aM}A</span>
                                <span style={{color:GOLD}}>⏱ {fmtTime(Math.min(uM,aM)*2)}</span>
                                {s.pinned&&<span>📌</span>}
                                {s.isGroup&&<span>👥</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{marginTop:6,padding:"7px 10px",background:"#FAF8F4",borderRadius:8,border:"1px solid "+BORDER,display:"flex",justifyContent:"space-between",fontSize:12}}>
                        <span style={{color:TEXT_MUTED}}>Total est. time</span>
                        <span style={{color:BLUE,fontWeight:700}}>{fmtTime(getEstTime(selected))}</span>
                      </div>
                    </div>
                  )}
                  {/* Adjust credits */}
                  <div style={{marginTop:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:BLUE,marginBottom:8}}>⚡ Adjust Credits</div>
                    <div style={{height:5,background:BORDER_LIGHT,borderRadius:3,marginBottom:8,overflow:"hidden"}}>
                      <div style={{height:"100%",width:Math.max(2,(selected.tokens||0)/500000*100)+"%",background:(selected.tokens||0)>100000?GREEN:GOLD,borderRadius:3}}/>
                    </div>
                    <div style={{display:"flex",gap:6,marginBottom:8}}>
                      <input type="number" value={editTokens} onChange={e=>setEditTokens(e.target.value)} style={{...inp,flex:1}}/>
                      <button onClick={()=>updateTokens(selected.id,editTokens)} style={btn(GREEN)}>Set</button>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {[100,250,500,1000].map(k=>(
                        <button key={k} onClick={()=>{updateTokens(selected.id,k*1000);setEditTokens(k*1000);}} style={{padding:"4px 10px",background:CREAM_MID,color:BLUE,border:"1px solid "+BORDER,borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700}}>{k}K</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={()=>deleteUser(selected.id,selected.email)} style={{...btn(RED),width:"100%",marginTop:14,padding:"9px 0"}}>🗑 Delete User</button>
                </div>
              )}
            </div>
          )}

          {/* ACTIVITY */}
          {tab==="activity"&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:14}}>📈 Full Activity Log</div>
              <div style={{overflowX:"auto"}}>
                <table><thead><tr>
                  <th>User</th><th>Email</th><th>Country</th><th>City</th><th>Sessions</th><th>Questions</th><th>AI Answers</th><th>Est Time</th><th>Credits Used</th><th>Credits Left</th><th>Last Active</th>
                </tr></thead><tbody>
                  {[...users].sort((a,b)=>getSessions(b).length-getSessions(a).length).map(u=>{
                    const ss=getSessions(u);
                    const allM=ss.flatMap(s=>s.messages||[]);
                    const uM=allM.filter(m=>m.role==="user").length;
                    const aM=allM.filter(m=>m.role==="assistant").length;
                    return(
                      <tr key={u.id} onClick={()=>{setSelected(u);setEditTokens(u.tokens||0);}}>
                        <td style={{fontWeight:600,color:TEXT}}>{u.name}</td>
                        <td style={{color:TEXT_MUTED,fontSize:12}}>{u.email}</td>
                        <td><span style={{background:CREAM_MID,borderRadius:4,padding:"2px 6px",fontSize:11}}>{u.country||"—"}</span></td>
                        <td>{u.city}</td>
                        <td style={{color:BLUE,fontWeight:700}}>{ss.length}</td>
                        <td style={{color:GREEN,fontWeight:600}}>{uM}</td>
                        <td style={{color:TEXT_MUTED}}>{aM}</td>
                        <td style={{color:GOLD,fontWeight:600}}>{fmtTime(getEstTime(u))}</td>
                        <td style={{color:RED}}>{(500000-(u.tokens||0)).toLocaleString()}</td>
                        <td style={{color:(u.tokens||0)>100000?GREEN:RED,fontWeight:700}}>{(u.tokens||0).toLocaleString()}</td>
                        <td style={{color:TEXT_MUTED,fontSize:12}}>{u.last_login?new Date(u.last_login).toLocaleString():"Never"}</td>
                      </tr>
                    );
                  })}
                </tbody></table>
              </div>
            </div>
          )}

          {/* VISITORS */}
          {tab==="visitors"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:700,color:TEXT}}>👁️ Non-Logged-In Visitor Activity</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={loadVisitors} style={btn(BLUE)}>🔄 Refresh</button>
                  <button onClick={async()=>{const ok=await arkConfirm("Clear all visitor tracking data?\nThis cannot be undone.", "Clear Visitors", "⚠️", "Clear", "#DC2626"); if(ok){localStorage.removeItem("arklaw_visitors");setVisitors([]);}}} style={btn(RED)}>🗑 Clear</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:16}}>
                {[
                  {label:"Total Visits",value:visitors.length,color:BLUE},
                  {label:"Unique Pages",value:[...new Set(visitors.map(v=>v.page))].length,color:GREEN},
                  {label:"Today",value:visitors.filter(v=>new Date(v.time)>new Date(Date.now()-86400000)).length,color:GOLD},
                  {label:"Landing Page",value:visitors.filter(v=>v.page==="/").length,color:TEXT_MID},
                ].map(({label,value,color})=>(
                  <div key={label} style={{...card}}>
                    <div style={{fontSize:20,fontWeight:800,color}}>{value}</div>
                    <div style={{fontSize:11,color:TEXT_MUTED,marginTop:3}}>{label}</div>
                  </div>
                ))}
              </div>
              {visitors.length===0?(
                <div style={{textAlign:"center",padding:"30px 20px",color:TEXT_MUTED}}>
                  <div style={{fontSize:32,marginBottom:10}}>👁️</div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>No visitor data yet</div>
                  <div style={{fontSize:12,marginBottom:16}}>Add this snippet to each page's useEffect to track non-logged-in visitors:</div>
                  <div style={{background:CREAM_MID,borderRadius:8,padding:"14px 16px",textAlign:"left",fontSize:11,fontFamily:"monospace",color:TEXT_MID,border:"1px solid "+BORDER}}>
                    {"useEffect(()=>{"}<br/>
                    {"  if(!user){"}<br/>
                    {"    const v={page:window.location.pathname,"}<br/>
                    {"      time:new Date().toISOString(),"}<br/>
                    {"      ua:navigator.userAgent.substring(0,80)};"}<br/>
                    {"    const arr=JSON.parse(localStorage.getItem"}<br/>
                    {"      (\"arklaw_visitors\")||\"[]\");"}<br/>
                    {"    arr.push(v); if(arr.length>500) arr.shift();"}<br/>
                    {"    localStorage.setItem(\"arklaw_visitors\","}<br/>
                    {"      JSON.stringify(arr));"}<br/>
                    {"  }"}<br/>
                    {"},[user]);"}
                  </div>
                </div>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table><thead><tr><th>#</th><th>Page</th><th>Time</th><th>Browser / Device</th></tr></thead>
                  <tbody>
                    {[...visitors].reverse().map((v,i)=>(
                      <tr key={i}>
                        <td style={{color:TEXT_DIM,fontSize:11}}>{visitors.length-i}</td>
                        <td style={{fontWeight:600,color:BLUE}}>{v.page||"/"}</td>
                        <td style={{color:TEXT_MUTED,fontSize:12}}>{new Date(v.time).toLocaleString()}</td>
                        <td style={{color:TEXT_DIM,fontSize:11,maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ua||"—"}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}
            </div>
          )}

          {/* CREDITS */}
          {tab==="tokens"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:16}}>
                {[
                  {label:"Total Remaining",value:totalTokens.toLocaleString(),color:BLUE},
                  {label:"Avg per User",value:users.length?Math.round(totalTokens/users.length).toLocaleString():"0",color:GREEN},
                  {label:"Total Used",value:(users.length*500000-totalTokens).toLocaleString(),color:RED},
                  {label:"Below 50K",value:users.filter(u=>(u.tokens||0)<50000).length,color:RED},
                ].map(({label,value,color})=>(
                  <div key={label} style={{...card}}>
                    <div style={{fontSize:20,fontWeight:800,color}}>{value}</div>
                    <div style={{fontSize:11,color:TEXT_MUTED,marginTop:3}}>{label}</div>
                  </div>
                ))}
              </div>
              <table><thead><tr><th>User</th><th>Email</th><th>Country</th><th>Remaining</th><th>Used</th><th>Usage</th><th>Quick Set</th></tr></thead>
              <tbody>
                {[...users].sort((a,b)=>(a.tokens||0)-(b.tokens||0)).map(u=>{
                  const pct=Math.round((u.tokens||0)/500000*100);
                  return(
                    <tr key={u.id}>
                      <td style={{fontWeight:600,color:TEXT}}>{u.name}</td>
                      <td style={{color:TEXT_MUTED,fontSize:12}}>{u.email}</td>
                      <td style={{fontSize:12}}>{u.country||"—"}</td>
                      <td><span style={{color:(u.tokens||0)>100000?GREEN:(u.tokens||0)>50000?GOLD:RED,fontWeight:700}}>{(u.tokens||0).toLocaleString()}</span></td>
                      <td style={{color:TEXT_MUTED}}>{(500000-(u.tokens||0)).toLocaleString()}</td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:80,height:6,background:BORDER_LIGHT,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(2,pct)+"%",background:pct>50?GREEN:pct>20?GOLD:RED,borderRadius:3}}/></div>
                          <span style={{fontSize:11,color:TEXT_MUTED}}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:4}}>
                          {[100,250,500].map(k=>(
                            <button key={k} onClick={()=>updateTokens(u.id,k*1000)} style={{padding:"3px 7px",background:CREAM_MID,color:BLUE,border:"1px solid "+BORDER,borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700}}>{k}K</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>
          )}

          {/* THEMES */}
          {tab==="theme"&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:6}}>🎨 Version Theme Settings</div>
              <p style={{fontSize:12,color:TEXT_MUTED,marginBottom:20,lineHeight:1.6}}>Switch between ChatGPT-style and Classic ARK layout for each country version.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[
                  {flag:"us",label:"United States",theme:usTheme,setTheme:setUsTheme,key:"arklaw_us_theme",route:"/usa",classicRoute:"/usa-classic",accentColor:RED},
                  {flag:"pk",label:"Pakistan",theme:pkTheme,setTheme:setPkTheme,key:"arklaw_pk_theme",route:"/pakistan",classicRoute:"/pakistan-classic",accentColor:GREEN},
                ].map(({flag,label,theme,setTheme,key,route,classicRoute,accentColor})=>(
                  <div key={flag} style={{...card}}>
                    <div style={{fontWeight:700,color:TEXT,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                      <img src={"https://flagcdn.com/w40/"+flag+".png"} style={{width:24,height:16,borderRadius:2,border:"1px solid "+BORDER}}/> {label}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      {[{val:"chatgpt",label:"ChatGPT Style"},{val:"classic",label:"Classic ARK"}].map(({val,lab})=>(
                        <div key={val} onClick={()=>{setTheme(val);localStorage.setItem(key,val);setMsg("✅ "+label+" theme → "+val);}}
                          style={{padding:"11px 14px",border:"2px solid "+(theme===val?accentColor:BORDER),borderRadius:10,cursor:"pointer",background:theme===val?CREAM_MID:CREAM_CARD,transition:"all 0.15s"}}>
                          <div style={{fontSize:13,fontWeight:700,color:theme===val?accentColor:TEXT}}>{val==="chatgpt"?"ChatGPT Style":"Classic ARK"} {theme===val&&"✓"}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <a href={route} target="_blank" style={{...btn(accentColor),display:"inline-block",fontSize:11}}>Open ↗</a>
                      <a href={classicRoute} target="_blank" style={{padding:"7px 14px",background:CREAM_MID,color:TEXT,border:"1px solid "+BORDER,borderRadius:7,fontSize:11,fontWeight:600,display:"inline-block"}}>Classic ↗</a>
                    </div>
                  </div>
                ))}
                {[{flag:"in",label:"India",color:"#B35400",route:"/india"},{flag:"bd",label:"Bangladesh",color:"#006A4E",route:"/bangladesh"}].map(({flag,label,color,route})=>(
                  <div key={flag} style={{...card}}>
                    <div style={{fontWeight:700,color:TEXT,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                      <img src={"https://flagcdn.com/w40/"+flag+".png"} style={{width:24,height:16,borderRadius:2,border:"1px solid "+BORDER}}/> {label}
                    </div>
                    <a href={route} target="_blank" style={{...btn(color),display:"inline-flex",alignItems:"center",gap:5,fontSize:11}}>Open {label} ↗</a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      {/* ── ARK Modal ── */}
      {arkModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
          <div style={{background:"#FFFFFF",borderRadius:"18px",width:"90%",maxWidth:"400px",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",border:"1px solid "+BORDER,overflow:"hidden"}}>
            <div style={{padding:"18px 20px 14px",borderBottom:"1px solid #EDE8DF",display:"flex",alignItems:"center",gap:"12px"}}>
              <img src="/ark-logo-us.png" alt="ARK" style={{width:32,height:32,objectFit:"contain",flexShrink:0}}/>
              <div style={{fontSize:15,fontWeight:800,color:BLUE,fontFamily:"DM Sans,sans-serif"}}>{arkModal.title}</div>
              <div style={{marginLeft:"auto",fontSize:22}}>{arkModal.icon}</div>
            </div>
            <div style={{padding:"18px 20px"}}>
              <div style={{fontSize:14,color:TEXT_MID,lineHeight:1.65,whiteSpace:"pre-line"}}>{arkModal.message}</div>
            </div>
            <div style={{padding:"12px 20px 16px",display:"flex",gap:"8px",justifyContent:"flex-end",background:"#F9F6F0",borderTop:"1px solid #EDE8DF"}}>
              {arkModal.type!=="alert" && (
                <button onClick={()=>{const r=arkModal.resolve;setArkModal(null);r(false);}}
                  style={{padding:"8px 18px",background:"transparent",color:TEXT_MUTED,border:"1px solid "+BORDER,borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:500}}>
                  Cancel
                </button>
              )}
              <button onClick={()=>{const r=arkModal.resolve;setArkModal(null);r(arkModal.type==="confirm"?true:undefined);}}
                style={{padding:"8px 20px",background:arkModal.confirmColor||BLUE,color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:13,fontWeight:700}}>
                {arkModal.confirmLabel||"OK"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
