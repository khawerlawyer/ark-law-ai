const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve the frontend ──────────────────────────────────────────
app.get("/", (req, res) => res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ARK Law AI</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D1B2A;font-family:'Segoe UI',sans-serif;height:100vh;overflow:hidden;color:#FAF6EE}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2B3F57;border-radius:3px}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
.dot{width:7px;height:7px;border-radius:50%;background:#C9A84C;display:inline-block;margin:0 2px;animation:bounce 1.2s infinite ease-in-out}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
button{cursor:pointer;font-family:inherit}
textarea,input{font-family:inherit}
textarea::placeholder,input::placeholder{color:#6E8099}
.qbtn:hover{border-color:#C9A84C!important;color:#C9A84C!important}
.area-btn:hover{background:#1E2D40!important;color:#C9A84C!important}
</style>
</head>
<body>
<div style="display:flex;flex-direction:column;height:100vh">

  <header style="display:flex;align-items:center;justify-content:space-between;padding:0 1rem;height:60px;border-bottom:1px solid #2B3F57;background:#162032;flex-shrink:0;gap:8px">
    <div style="display:flex;align-items:center;gap:8px">
      <button onclick="toggleSidebar()" style="background:transparent;border:none;color:#C9A84C;font-size:20px;padding:4px 6px;border-radius:6px">☰</button>
      <div>
        <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#C9A84C;letter-spacing:.06em">⚖️ ARK Law AI</div>
        <div style="font-size:9px;color:#6E8099;letter-spacing:.1em;text-transform:uppercase">Legal Intelligence Platform</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:3px;background:#0D1B2A;border:1px solid #2B3F57;border-radius:40px;padding:3px">
      <button onclick="setJur('pk')" id="jbtn-pk" style="border:none;background:transparent;color:#6E8099;font-size:11px;padding:4px 9px;border-radius:40px">🇵🇰 PK</button>
      <button onclick="setJur('both')" id="jbtn-both" style="border:none;background:rgba(201,168,76,0.15);color:#C9A84C;font-size:11px;padding:4px 9px;border-radius:40px">⚖ Both</button>
      <button onclick="setJur('us')" id="jbtn-us" style="border:none;background:transparent;color:#6E8099;font-size:11px;padding:4px 9px;border-radius:40px">🇺🇸 US</button>
    </div>
  </header>

  <div style="display:flex;flex:1;overflow:hidden;position:relative">
    <div id="overlay" onclick="toggleSidebar()" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:10"></div>

    <aside id="sidebar" style="position:absolute;top:0;left:0;bottom:0;z-index:20;width:240px;background:#162032;border-right:1px solid #2B3F57;display:flex;flex-direction:column;overflow-y:auto;transform:translateX(-100%);transition:transform .25s ease">
      <div style="font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#6E8099;margin:16px 12px 8px">Practice Areas</div>
      <button class="area-btn" onclick="setArea('general')" id="area-general" style="display:flex;align-items:center;gap:9px;width:100%;background:#1E2D40;border:none;color:#C9A84C;font-size:13px;font-weight:500;padding:7px 10px;border-radius:7px;text-align:left">⚖️ General Legal</button>
      <button class="area-btn" onclick="setArea('criminal')" id="area-criminal" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">🔒 Criminal Law</button>
      <button class="area-btn" onclick="setArea('corporate')" id="area-corporate" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">🏢 Corporate & Business</button>
      <button class="area-btn" onclick="setArea('family')" id="area-family" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">👨‍👩‍👧 Family & Matrimonial</button>
      <button class="area-btn" onclick="setArea('property')" id="area-property" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">🏠 Property & Real Estate</button>
      <button class="area-btn" onclick="setArea('labour')" id="area-labour" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">👷 Labour & Employment</button>
      <button class="area-btn" onclick="setArea('constitutional')" id="area-constitutional" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">📜 Constitutional Law</button>
      <button class="area-btn" onclick="setArea('ip')" id="area-ip" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">💡 IP & Technology</button>
      <button class="area-btn" onclick="setArea('immigration')" id="area-immigration" style="display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;color:#B8C4D0;font-size:13px;padding:7px 10px;border-radius:7px;text-align:left">✈️ Immigration</button>
      <div style="height:1px;background:#2B3F57;margin:8px 10px"></div>
      <div style="font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#6E8099;margin:8px 12px">Quick Queries</div>
      <button class="qbtn" onclick="sendQuick('Key differences between criminal procedure in Pakistan and the USA?')" style="display:block;width:calc(100% - 20px);margin:0 10px 5px;background:transparent;border:1px solid #2B3F57;color:#6E8099;font-size:11.5px;padding:6px 9px;border-radius:7px;text-align:left;line-height:1.4">Criminal procedure: Pakistan vs USA?</button>
      <button class="qbtn" onclick="sendQuick('Explain bail laws under Pakistan CrPC and US federal law.')" style="display:block;width:calc(100% - 20px);margin:0 10px 5px;background:transparent;border:1px solid #2B3F57;color:#6E8099;font-size:11.5px;padding:6px 9px;border-radius:7px;text-align:left;line-height:1.4">Bail laws: Pakistan CrPC vs US federal</button>
      <button class="qbtn" onclick="sendQuick('Grounds for divorce under Pakistani and US family law?')" style="display:block;width:calc(100% - 20px);margin:0 10px 5px;background:transparent;border:1px solid #2B3F57;color:#6E8099;font-size:11.5px;padding:6px 9px;border-radius:7px;text-align:left;line-height:1.4">Divorce grounds: Pakistan vs US</button>
      <button class="qbtn" onclick="sendQuick('Draft a non-disclosure agreement clause valid in both Pakistan and USA.')" style="display:block;width:calc(100% - 20px);margin:0 10px 5px;background:transparent;border:1px solid #2B3F57;color:#6E8099;font-size:11.5px;padding:6px 9px;border-radius:7px;text-align:left;line-height:1.4">Draft NDA clause for both jurisdictions</button>
      <button class="qbtn" onclick="sendQuick('IP registration: IPO-Pakistan vs USPTO.')" style="display:block;width:calc(100% - 20px);margin:0 10px 5px;background:transparent;border:1px solid #2B3F57;color:#6E8099;font-size:11.5px;padding:6px 9px;border-radius:7px;text-align:left;line-height:1.4">IP registration: IPO-Pakistan vs USPTO</button>
      <button class="qbtn" onclick="sendQuick('Constitutional rights of accused: Article 10-A vs US 5th and 6th Amendments.')" style="display:block;width:calc(100% - 20px);margin:0 10px 5px;background:transparent;border:1px solid #2B3F57;color:#6E8099;font-size:11.5px;padding:6px 9px;border-radius:7px;text-align:left;line-height:1.4">Rights of accused: Art 10-A vs 5th/6th Amendment</button>
    </aside>

    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
      <div id="jur-banner" style="display:flex;align-items:center;gap:8px;padding:7px 1.25rem;font-size:12px;font-weight:500;border-bottom:1px solid #2B3F57;flex-shrink:0;background:rgba(201,168,76,0.08);color:#C9A84C">
        <div id="jur-dot" style="width:7px;height:7px;border-radius:50%;background:#C9A84C;flex-shrink:0"></div>
        <span id="jur-banner-text">Answering under both Pakistani and US law</span>
      </div>

      <div id="messages" style="flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:.875rem">
        <div id="welcome" style="background:#1E2D40;border:1px solid #2B3F57;border-radius:14px;padding:1.75rem;text-align:center;max-width:520px;margin:1.5rem auto;width:100%">
          <div style="font-size:40px;margin-bottom:12px">⚖️</div>
          <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#C9A84C;margin-bottom:8px">ARK Law AI</div>
          <div style="font-size:13.5px;color:#B8C4D0;line-height:1.6;margin-bottom:16px">AI-powered legal research for <span style="color:#3EB489;font-weight:600">Pakistani</span> and <span style="color:#5B8DD9;font-weight:600">US law</span>.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left">
            <div style="background:#162032;border:1px solid #2B3F57;border-radius:8px;padding:9px 11px;font-size:12px;color:#B8C4D0">📚 Statutory research</div>
            <div style="background:#162032;border:1px solid #2B3F57;border-radius:8px;padding:9px 11px;font-size:12px;color:#B8C4D0">⚖️ Comparative analysis</div>
            <div style="background:#162032;border:1px solid #2B3F57;border-radius:8px;padding:9px 11px;font-size:12px;color:#B8C4D0">📝 Document drafting</div>
            <div style="background:#162032;border:1px solid #2B3F57;border-radius:8px;padding:9px 11px;font-size:12px;color:#B8C4D0">🔍 Case law research</div>
          </div>
          <div style="margin-top:14px;font-size:12px;color:#6E8099">Tap ☰ for practice areas & quick queries</div>
        </div>
      </div>

      <div style="padding:.875rem 1rem 1rem;border-top:1px solid #2B3F57;background:#162032;flex-shrink:0">
        <div id="input-wrap" style="display:flex;align-items:flex-end;gap:8px;background:#1E2D40;border:1px solid #2B3F57;border-radius:12px;padding:8px 12px">
          <textarea id="msg-input" rows="1" placeholder="Ask about Pakistani or US law..."
            style="flex:1;background:transparent;border:none;outline:none;color:#FAF6EE;font-size:13.5px;resize:none;min-height:24px;max-height:120px;line-height:1.5"
            oninput="autoResize(this)" onkeydown="handleKey(event)"></textarea>
          <button id="send-btn" onclick="sendMessage()" style="width:36px;height:36px;background:#2B3F57;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#FAF6EE;font-size:18px">➤</button>
        </div>
        <div style="text-align:center;margin-top:6px;font-size:11px;color:#6E8099">⚠️ For research & reference only — not a substitute for legal counsel &nbsp;|&nbsp; <span style="color:#C9A84C;opacity:.7">ARK Law AI — Justice S. A. Rabbani Law</span></div>
      </div>
    </div>
  </div>
</div>

<script>
let jurisdiction='both',practiceArea='general',history=[],loading=false;
const jurConfig={pk:{color:'#3EB489',bg:'rgba(62,180,137,0.08)',banner:'Answering under Pakistani law',btnBg:'rgba(62,180,137,0.15)'},us:{color:'#5B8DD9',bg:'rgba(91,141,217,0.08)',banner:'Answering under US law',btnBg:'rgba(91,141,217,0.15)'},both:{color:'#C9A84C',bg:'rgba(201,168,76,0.08)',banner:'Answering under both Pakistani and US law',btnBg:'rgba(201,168,76,0.15)'}};
const areaLabels={general:'general legal matters',criminal:'criminal law and criminal procedure',corporate:'corporate, business, and commercial law',family:'family law, matrimonial law, and succession',property:'property law, real estate, and land acquisition',labour:'labour law and employment law',constitutional:'constitutional law and fundamental rights',ip:'intellectual property and technology law',immigration:'immigration and nationality law'};
const jurLabels={pk:'🇵🇰 Pakistan Law',us:'🇺🇸 US Law',both:'🇵🇰🇺🇸 Both Jurisdictions'};
function toggleSidebar(){const sb=document.getElementById('sidebar'),ov=document.getElementById('overlay'),open=sb.style.transform==='translateX(0px)'||sb.style.transform==='translateX(0)';sb.style.transform=open?'translateX(-100%)':'translateX(0)';ov.style.display=open?'none':'block';}
function setJur(j){jurisdiction=j;['pk','both','us'].forEach(x=>{const b=document.getElementById('jbtn-'+x);b.style.background=x===j?jurConfig[x].btnBg:'transparent';b.style.color=x===j?jurConfig[x].color:'#6E8099';});const bn=document.getElementById('jur-banner');bn.style.background=jurConfig[j].bg;bn.style.color=jurConfig[j].color;document.getElementById('jur-dot').style.background=jurConfig[j].color;document.getElementById('jur-banner-text').textContent=jurConfig[j].banner;}
function setArea(a){document.getElementById('area-'+practiceArea).style.background='transparent';document.getElementById('area-'+practiceArea).style.color='#B8C4D0';practiceArea=a;document.getElementById('area-'+a).style.background='#1E2D40';document.getElementById('area-'+a).style.color='#C9A84C';toggleSidebar();}
function buildSystem(){const jur={pk:'You are answering ONLY under Pakistani law. Cite relevant Pakistani legislation and precedents.',us:'You are answering ONLY under US law. Cite relevant federal legislation and precedents.',both:'You are answering under BOTH Pakistani and US law with clear sections for each jurisdiction.'};return 'You are ARK Law AI, expert legal assistant for '+areaLabels[practiceArea]+'. '+jur[jurisdiction]+' Be precise, cite statutes and case law, end with research-only disclaimer.';}
function fmt(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong style="color:#C9A84C">$1</strong>').replace(/^#{1,3} (.+)$/gm,'<div style="color:#C9A84C;font-weight:600;margin:10px 0 5px">$1</div>').replace(/^- (.+)$/gm,'<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#C9A84C">•</span><span>$1</span></div>').replace(/\n\n/g,'<br/>').replace(/\n/g,'<br/>');}
function addMsg(type,text,jur){const w=document.getElementById('welcome');if(w)w.remove();const msgs=document.getElementById('messages');const isU=type==='user',isE=type==='error';const d=document.createElement('div');d.style.cssText='display:flex;flex-direction:'+(isU?'row-reverse':'row')+';gap:10px;max-width:780px;margin-left:'+(isU?'auto':'0');d.innerHTML='<div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:'+(isU?'#1E2D40':'linear-gradient(135deg,#C9A84C,#8A6A1F)')+';border:'+(isU?'1px solid #2B3F57':'none')+';color:'+(isU?'#B8C4D0':'#0D1B2A')+';font-size:'+(isU?14:10)+'px;font-weight:700;font-family:Georgia,serif">'+(isU?'👤':'ARK')+'</div><div><div style="padding:11px 15px;border-radius:'+(isU?'12px 4px 12px 12px':'4px 12px 12px 12px')+';background:'+(isU?'rgba(91,141,217,0.1)':isE?'rgba(224,85,85,0.1)':'#1E2D40')+';border:1px solid '+(isU?'rgba(91,141,217,0.2)':isE?'rgba(224,85,85,0.3)':'#2B3F57')+';font-size:13.5px;line-height:1.7;color:#FAF6EE;max-width:660px">'+(isU?text.replace(/&/g,'&amp;').replace(/</g,'&lt;'):fmt(text))+'</div>'+(type==='ai'?'<div style="font-size:11px;color:#6E8099;margin-top:4px;display:flex;gap:6px"><span style="padding:2px 7px;border-radius:10px;font-size:10px;background:'+jurConfig[jur]?.bg+';color:'+jurConfig[jur]?.color+'">'+jurLabels[jur]+'</span><span>'+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</span></div>':'')+'</div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function addLoading(){const msgs=document.getElementById('messages');const d=document.createElement('div');d.id='loading-msg';d.style='display:flex;gap:10px';d.innerHTML='<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#8A6A1F);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#0D1B2A;font-family:Georgia,serif;flex-shrink:0">ARK</div><div style="padding:12px 16px;border-radius:4px 12px 12px 12px;background:#1E2D40;border:1px solid #2B3F57"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function removeLoading(){const l=document.getElementById('loading-msg');if(l)l.remove();}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';document.getElementById('input-wrap').style.borderColor=el.value?'#C9A84C':'#2B3F57';document.getElementById('send-btn').style.background=el.value.trim()?'#C9A84C':'#2B3F57';}
function handleKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}
function sendQuick(q){document.getElementById('msg-input').value=q;autoResize(document.getElementById('msg-input'));toggleSidebar();sendMessage();}
async function sendMessage(){
  const inp=document.getElementById('msg-input'),msg=inp.value.trim();
  if(!msg||loading)return;
  inp.value='';inp.style.height='auto';
  document.getElementById('input-wrap').style.borderColor='#2B3F57';
  document.getElementById('send-btn').style.background='#2B3F57';
  history.push({role:'user',content:msg});
  addMsg('user',msg);addLoading();loading=true;
  try{
    const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:buildSystem(),messages:history})});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Server error');
    if(!data.reply)throw new Error('Empty response');
    history.push({role:'assistant',content:data.reply});
    removeLoading();addMsg('ai',data.reply,jurisdiction);
  }catch(err){history.pop();removeLoading();addMsg('error','❌ '+err.message);}
  finally{loading=false;}
}
</script>
</body>
</html>`));

// ── API route (server-side — no CORS issues) ────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages, system } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in .env" });
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system,
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "API error" });
    const reply = (data.content || []).map(b => b.text || "").join("").trim();
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`ARK Law AI running on port ${PORT}`));
