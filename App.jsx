import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SUPABASE_URL = "https://prulmoqajyhkzldptspy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydWxtb3Fhanloa3psZHB0c3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4Mjc5NTgsImV4cCI6MjA5NjQwMzk1OH0.6oQCZbz-YMMGpO5_oBa1T48q8JKCFiWmxweGL16L5TM";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
const ADMIN_EMAIL = "abhaycsankar@gmail.com";

const COLORS = ["#f59e0b","#10b981","#6366f1","#8b5cf6","#0ea5e9","#ec4899","#ef4444","#22c55e","#f97316"];
const ICONS = ["🌅","🏋️","📚","📖","💧","🧘","🚫","💰","💻","✨","🎯","⚡","🌟","🔧","🏃","🎵","🍎","💤","✍️","🧠"];
const CATEGORIES = ["Routine","Fitness","Study","Personal","Wellness","Career","Finance"];
const PRIORITY_COLOR = { critical:"#ef4444", high:"#f59e0b", medium:"#10b981", low:"#64748b" };
const today = () => new Date().toISOString().split("T")[0];

// ── Global Styles ─────────────────────────────────────────────────────────────
const GS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#060b14;font-family:'Inter',-apple-system,sans-serif;color:#f1f5f9}
  @keyframes float0{from{transform:translate(0,0)}to{transform:translate(30px,20px)}}
  @keyframes float1{from{transform:translate(0,0)}to{transform:translate(-20px,30px)}}
  @keyframes float2{from{transform:translate(0,0)}to{transform:translate(15px,-25px)}}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes bounceIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(16,185,129,0.2)}50%{box-shadow:0 0 40px rgba(16,185,129,0.5)}}
  .fade-up{animation:fadeInUp 0.5s ease forwards}
  .fade-in{animation:fadeIn 0.3s ease forwards}
  .bounce{animation:bounceIn 0.6s ease forwards}
  .slide-in{animation:slideIn 0.3s ease forwards}
  input,textarea,select{font-family:'Inter',-apple-system,sans-serif;color:#f1f5f9}
  input:focus,textarea:focus{border-color:rgba(16,185,129,0.5)!important;box-shadow:0 0 0 3px rgba(16,185,129,0.08)!important;outline:none!important}
  select:focus{outline:none}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}
  .nav-item:hover{background:rgba(255,255,255,0.05)!important}
  .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px 22px;transition:all 0.2s}
  .card:hover{border-color:rgba(255,255,255,0.11)}
  .btn{padding:10px 20px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:'Inter',-apple-system,sans-serif}
  .btn-primary{background:#10b981;color:#fff;box-shadow:0 4px 14px rgba(16,185,129,0.2)}
  .btn-primary:hover{background:#0d9e6e;box-shadow:0 4px 20px rgba(16,185,129,0.35);transform:translateY(-1px)}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none}
  .btn-outline{background:transparent;border:1px solid rgba(255,255,255,0.12);color:#94a3b8}
  .btn-outline:hover{border-color:rgba(255,255,255,0.25);color:#f1f5f9}
  .btn-danger{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#ef4444}
  .btn-danger:hover{background:rgba(239,68,68,0.18)}
  .btn-full{width:100%}
  .btn-sm{padding:6px 14px;font-size:12px}
  .input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:14px;transition:all 0.2s}
  .select{width:100%;background:#0d1b2e;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:14px;outline:none}
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.3px}
  .badge-green{background:rgba(16,185,129,0.15);color:#10b981}
  .badge-yellow{background:rgba(245,158,11,0.15);color:#f59e0b}
  .badge-red{background:rgba(239,68,68,0.15);color:#ef4444}
  .badge-purple{background:rgba(99,102,241,0.15);color:#6366f1}
  .badge-gray{background:rgba(100,116,139,0.15);color:#64748b}
  .habit-row:hover{background:rgba(255,255,255,0.03)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(6px)}
  .modal-box{background:#0d1b2e;border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:28px 32px;width:100%;max-width:500px;max-height:88vh;overflow-y:auto;box-shadow:0 30px 70px rgba(0,0,0,0.7)}
  .support-bubble{position:fixed;bottom:24px;right:24px;z-index:999;cursor:pointer;animation:glow 3s ease infinite}
  .toast{position:fixed;bottom:80px;right:24px;z-index:998;background:#0d1b2e;border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:12px 20px;font-size:13px;color:#10b981;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:slideIn 0.3s ease forwards}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const AnimBg = () => (
  <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
    <style>{GS}</style>
    {[{w:500,h:500,top:"-15%",left:"-10%",c:"rgba(16,185,129,0.07)",d:"8s"},
      {w:400,h:400,top:"55%",right:"-8%",c:"rgba(99,102,241,0.06)",d:"11s"},
      {w:300,h:300,top:"25%",left:"45%",c:"rgba(245,158,11,0.05)",d:"13s"},
    ].map((o,i)=>(
      <div key={i} style={{position:"absolute",width:o.w,height:o.h,borderRadius:"50%",
        background:o.c,top:o.top,left:o.left,right:o.right,filter:"blur(90px)",
        animation:`float${i} ${o.d} ease-in-out infinite alternate`}}/>
    ))}
  </div>
);

const Logo = ({size=36,animate=false}) => (
  <div className={animate?"bounce":""} style={{width:size,height:size,borderRadius:size*0.26,
    background:"linear-gradient(135deg,#10b981,#6366f1,#f59e0b)",flexShrink:0,
    display:"flex",alignItems:"center",justifyContent:"center",
    boxShadow:`0 0 ${size*0.5}px rgba(16,185,129,0.22)`}}>
    <span style={{fontSize:size*0.48}}>⚡</span>
  </div>
);

const Ring = ({pct,size=52,stroke=5,color="#10b981"}) => {
  const r=(size-stroke)/2,c=2*Math.PI*r,d=(Math.min(100,pct)/100)*c;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${d} ${c}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.8s ease"}}/>
    </svg>
  );
};

const Modal = ({title,onClose,children,wide=false}) => (
  <div className="modal-overlay fade-in">
    <div className="modal-box fade-up" style={{maxWidth:wide?720:500}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div style={{fontSize:17,fontWeight:700,color:"#f1f5f9"}}>{title}</div>
        <button className="btn btn-outline btn-sm" onClick={onClose}
          style={{width:32,height:32,padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({label,children}) => (
  <div style={{marginBottom:16}}>
    <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:6,letterSpacing:"0.5px",textTransform:"uppercase"}}>{label}</div>
    {children}
  </div>
);

const Toast = ({msg}) => msg ? <div className="toast">✅ {msg}</div> : null;

// ── Pomodoro Timer ────────────────────────────────────────────────────────────
const Pomodoro = () => {
  const [mode,setMode] = useState("focus");
  const [time,setTime] = useState(25*60);
  const [running,setRunning] = useState(false);
  const [sessions,setSessions] = useState(0);
  const intRef = useRef(null);
  const durs = {focus:25*60,short:5*60,long:15*60};
  const labels = {focus:"Focus",short:"Short Break",long:"Long Break"};
  useEffect(()=>{
    if(running){
      intRef.current = setInterval(()=>{
        setTime(t=>{ if(t<=1){ clearInterval(intRef.current); setRunning(false); if(mode==="focus") setSessions(s=>s+1); return 0; } return t-1; });
      },1000);
    } else clearInterval(intRef.current);
    return ()=>clearInterval(intRef.current);
  },[running,mode]);
  const sw = m => { setMode(m); setTime(durs[m]); setRunning(false); };
  const mn = String(Math.floor(time/60)).padStart(2,"0");
  const sc = String(time%60).padStart(2,"0");
  const pct = ((durs[mode]-time)/durs[mode])*100;
  const r=72, circ=2*Math.PI*r;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"20px 0"}}>
      <div style={{display:"flex",gap:6}}>
        {Object.keys(durs).map(m=>(
          <button key={m} onClick={()=>sw(m)} className={`btn btn-sm ${mode===m?"btn-primary":"btn-outline"}`}>{labels[m]}</button>
        ))}
      </div>
      <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width={160} height={160} style={{transform:"rotate(-90deg)"}}>
          <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8}/>
          <circle cx={80} cy={80} r={r} fill="none" stroke="#10b981" strokeWidth={8}
            strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
            style={{transition:"stroke-dasharray 1s linear",filter:"drop-shadow(0 0 8px rgba(16,185,129,0.5))"}}/>
        </svg>
        <div style={{position:"absolute",textAlign:"center"}}>
          <div style={{fontSize:36,fontWeight:700,color:"#f1f5f9",letterSpacing:"-2px"}}>{mn}:{sc}</div>
          <div style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:"1px"}}>{labels[mode]}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className={`btn ${running?"btn-danger":"btn-primary"}`} onClick={()=>setRunning(r=>!r)}>
          {running?"⏸ Pause":"▶ Start"}
        </button>
        <button className="btn btn-outline" onClick={()=>{setRunning(false);setTime(durs[mode]);}}>↺ Reset</button>
      </div>
      <div style={{fontSize:12,color:"#475569"}}>🍅 {sessions} sessions completed today</div>
    </div>
  );
};

// ── Support Chat Widget ───────────────────────────────────────────────────────
const SupportWidget = ({session, profile, isAdmin}) => {
  const [open,setOpen] = useState(false);
  const [tickets,setTickets] = useState([]);
  const [activeTicket,setActiveTicket] = useState(null);
  const [messages,setMessages] = useState([]);
  const [newMsg,setNewMsg] = useState("");
  const [subject,setSubject] = useState("");
  const [creating,setCreating] = useState(false);
  const [loading,setLoading] = useState(false);
  const msgsEnd = useRef(null);
  const uid = session?.user?.id;

  useEffect(()=>{ if(open) loadTickets(); },[open]);
  useEffect(()=>{ if(activeTicket) loadMessages(activeTicket.id); },[activeTicket]);
  useEffect(()=>{ msgsEnd.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const loadTickets = async () => {
    const {data} = await sb.from("support_tickets").select("*").eq("user_id",uid).order("created_at",{ascending:false});
    if(data) setTickets(data);
  };

  const loadMessages = async (ticketId) => {
    setLoading(true);
    const {data} = await sb.from("support_messages").select("*").eq("ticket_id",ticketId).order("created_at");
    if(data) setMessages(data);
    setLoading(false);
  };

  const createTicket = async () => {
    if(!subject.trim()) return;
    const {data} = await sb.from("support_tickets").insert({
      user_id:uid, user_name:profile?.name||"User",
      user_email:session?.user?.email, subject, status:"open"
    }).select().single();
    if(data){ setTickets(prev=>[data,...prev]); setActiveTicket(data); setCreating(false); setSubject(""); }
  };

  const sendMessage = async () => {
    if(!newMsg.trim()||!activeTicket) return;
    const {data} = await sb.from("support_messages").insert({
      ticket_id:activeTicket.id, sender_id:uid,
      sender_name:profile?.name||"User", is_admin:false, message:newMsg
    }).select().single();
    if(data){ setMessages(prev=>[...prev,data]); setNewMsg(""); }
  };

  const statusColor = {open:"#10b981",pending:"#f59e0b",closed:"#64748b"};

  return (
    <>
      {/* Bubble */}
      <div className="support-bubble" onClick={()=>setOpen(o=>!o)}
        style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#6366f1)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
          boxShadow:"0 8px 24px rgba(16,185,129,0.4)"}}>
        {open?"✕":"💬"}
      </div>

      {/* Chat Window */}
      {open&&(
        <div className="slide-in" style={{position:"fixed",bottom:92,right:24,width:360,height:500,
          background:"#0d1b2e",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,
          display:"flex",flexDirection:"column",zIndex:999,overflow:"hidden",
          boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
          {/* Header */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",
            background:"linear-gradient(135deg,rgba(16,185,129,0.1),rgba(99,102,241,0.1))"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Logo size={28}/>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>BetterME Support</div>
                <div style={{fontSize:11,color:"#10b981"}}>● We typically reply within 24hrs</div>
              </div>
            </div>
          </div>

          {!activeTicket?(
            <div style={{flex:1,overflow:"auto",padding:"16px"}}>
              {!creating?(
                <>
                  <button className="btn btn-primary btn-full" style={{marginBottom:16}}
                    onClick={()=>setCreating(true)}>+ New Support Request</button>
                  {tickets.length===0&&(
                    <div style={{textAlign:"center",padding:"32px 0",color:"#334155",fontSize:13}}>
                      <div style={{fontSize:32,marginBottom:8}}>💬</div>
                      No support tickets yet.<br/>Click above to get help!
                    </div>
                  )}
                  {tickets.map(t=>(
                    <div key={t.id} onClick={()=>{setActiveTicket(t);loadMessages(t.id);}}
                      style={{padding:"12px",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",
                        marginBottom:8,cursor:"pointer",background:"rgba(255,255,255,0.02)",transition:"all 0.2s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <div style={{fontSize:13,fontWeight:500,color:"#f1f5f9"}}>{t.subject}</div>
                        <span className="badge" style={{background:`${statusColor[t.status]}20`,color:statusColor[t.status],fontSize:10}}>
                          {t.status}
                        </span>
                      </div>
                      <div style={{fontSize:11,color:"#334155"}}>{new Date(t.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </>
              ):(
                <div>
                  <button className="btn btn-outline btn-sm" onClick={()=>setCreating(false)} style={{marginBottom:14}}>← Back</button>
                  <Field label="What do you need help with?">
                    <input className="input" value={subject} onChange={e=>setSubject(e.target.value)}
                      placeholder="e.g. Can't login to my account"/>
                  </Field>
                  <button className="btn btn-primary btn-full" onClick={createTicket}>Create Ticket</button>
                </div>
              )}
            </div>
          ):(
            <>
              <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",
                display:"flex",alignItems:"center",gap:8}}>
                <button className="btn btn-outline btn-sm" onClick={()=>setActiveTicket(null)} style={{padding:"4px 8px"}}>←</button>
                <div style={{flex:1,fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeTicket.subject}</div>
                <span className="badge" style={{background:`${statusColor[activeTicket.status]}20`,color:statusColor[activeTicket.status],fontSize:10}}>
                  {activeTicket.status}
                </span>
              </div>
              <div style={{flex:1,overflow:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                {loading&&<div style={{color:"#334155",fontSize:12,textAlign:"center"}}>Loading...</div>}
                {messages.map(m=>(
                  <div key={m.id} style={{display:"flex",justifyContent:m.is_admin?"flex-start":"flex-end"}}>
                    <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:12,fontSize:13,lineHeight:1.5,
                      background:m.is_admin?"rgba(99,102,241,0.15)":"rgba(16,185,129,0.15)",
                      border:`1px solid ${m.is_admin?"rgba(99,102,241,0.2)":"rgba(16,185,129,0.2)"}`,
                      color:"#f1f5f9"}}>
                      {m.is_admin&&<div style={{fontSize:10,color:"#6366f1",fontWeight:600,marginBottom:4}}>⚡ BetterME Support</div>}
                      {m.message}
                      <div style={{fontSize:9,color:"#334155",marginTop:4}}>
                        {new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={msgsEnd}/>
              </div>
              <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:8}}>
                <input className="input" style={{flex:1,padding:"9px 12px",fontSize:13}} value={newMsg}
                  onChange={e=>setNewMsg(e.target.value)} placeholder="Type your message..."
                  onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
                <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

// ── Admin Support Panel ───────────────────────────────────────────────────────
const AdminSupport = ({session,profile}) => {
  const [tickets,setTickets] = useState([]);
  const [active,setActive] = useState(null);
  const [messages,setMessages] = useState([]);
  const [reply,setReply] = useState("");
  const msgsEnd = useRef(null);
  const uid = session?.user?.id;

  useEffect(()=>{ loadAllTickets(); },[]);
  useEffect(()=>{ msgsEnd.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const loadAllTickets = async () => {
    const {data} = await sb.from("support_tickets").select("*").order("created_at",{ascending:false});
    if(data) setTickets(data);
  };

  const openTicket = async (t) => {
    setActive(t);
    const {data} = await sb.from("support_messages").select("*").eq("ticket_id",t.id).order("created_at");
    if(data) setMessages(data);
  };

  const sendReply = async () => {
    if(!reply.trim()||!active) return;
    const {data} = await sb.from("support_messages").insert({
      ticket_id:active.id, sender_id:uid,
      sender_name:"BetterME Support", is_admin:true, message:reply
    }).select().single();
    if(data){ setMessages(prev=>[...prev,data]); setReply(""); }
    await sb.from("support_tickets").update({status:"pending"}).eq("id",active.id);
    setTickets(prev=>prev.map(t=>t.id===active.id?{...t,status:"pending"}:t));
  };

  const closeTicket = async (id) => {
    await sb.from("support_tickets").update({status:"closed"}).eq("id",id);
    setTickets(prev=>prev.map(t=>t.id===id?{...t,status:"closed"}:t));
    if(active?.id===id) setActive(prev=>({...prev,status:"closed"}));
  };

  const statusColor = {open:"#10b981",pending:"#f59e0b",closed:"#64748b"};

  return (
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:0,height:"calc(100vh - 120px)",
      background:"rgba(255,255,255,0.02)",borderRadius:16,overflow:"hidden",
      border:"1px solid rgba(255,255,255,0.07)"}}>
      {/* Ticket List */}
      <div style={{borderRight:"1px solid rgba(255,255,255,0.07)",overflow:"auto",padding:"16px"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>
          All Tickets ({tickets.length})
        </div>
        {tickets.length===0&&<div style={{color:"#334155",fontSize:13}}>No support tickets yet</div>}
        {tickets.map(t=>(
          <div key={t.id} onClick={()=>openTicket(t)}
            style={{padding:"12px",borderRadius:11,border:`1px solid ${active?.id===t.id?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.06)"}`,
              background:active?.id===t.id?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.02)",
              marginBottom:8,cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontSize:13,fontWeight:500,color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{t.subject}</div>
              <span className="badge" style={{background:`${statusColor[t.status]}18`,color:statusColor[t.status],fontSize:9,marginLeft:6,flexShrink:0}}>
                {t.status?.toUpperCase()}
              </span>
            </div>
            <div style={{fontSize:11,color:"#475569"}}>{t.user_name||"User"}</div>
            <div style={{fontSize:10,color:"#334155"}}>{new Date(t.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      {!active?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#334155"}}>
          <div style={{fontSize:40}}>💬</div>
          <div style={{fontSize:14}}>Select a ticket to reply</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",
            display:"flex",justifyContent:"space-between",alignItems:"center",
            background:"rgba(255,255,255,0.02)"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>{active.subject}</div>
              <div style={{fontSize:12,color:"#475569"}}>{active.user_name} • {active.user_email}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <span className="badge" style={{background:`${statusColor[active.status]}18`,color:statusColor[active.status]}}>
                {active.status?.toUpperCase()}
              </span>
              {active.status!=="closed"&&(
                <button className="btn btn-outline btn-sm" onClick={()=>closeTicket(active.id)}>✓ Close</button>
              )}
            </div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
            {messages.map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:m.is_admin?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"75%",padding:"11px 16px",borderRadius:14,fontSize:13,lineHeight:1.6,
                  background:m.is_admin?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.05)",
                  border:`1px solid ${m.is_admin?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.08)"}`,color:"#f1f5f9"}}>
                  <div style={{fontSize:10,fontWeight:600,color:m.is_admin?"#10b981":"#6366f1",marginBottom:5}}>
                    {m.is_admin?"⚡ You (Support)":m.sender_name}
                  </div>
                  {m.message}
                  <div style={{fontSize:9,color:"#334155",marginTop:6}}>
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={msgsEnd}/>
          </div>
          <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:10}}>
            <textarea className="input" style={{flex:1,minHeight:44,maxHeight:100,resize:"none",padding:"10px 14px",fontSize:13}}
              value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..."
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendReply())}/>
            <button className="btn btn-primary" onClick={sendReply}>Send Reply</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Landing Page ──────────────────────────────────────────────────────────────
const Landing = ({onStart}) => (
  <div style={{minHeight:"100vh",background:"#060b14",color:"#f1f5f9",position:"relative",overflow:"hidden"}}>
    <AnimBg/>
    <nav style={{position:"relative",zIndex:10,display:"flex",justifyContent:"space-between",
      alignItems:"center",padding:"18px 60px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Logo size={34}/><span style={{fontSize:20,fontWeight:800,letterSpacing:"-0.5px"}}>BetterME</span>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn btn-outline" onClick={onStart}>Sign In</button>
        <button className="btn btn-primary" onClick={onStart}>Get Started Free →</button>
      </div>
    </nav>

    <div style={{position:"relative",zIndex:10,textAlign:"center",padding:"90px 40px 70px"}}>
      <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:8,
        background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",
        borderRadius:20,padding:"6px 16px",marginBottom:28,fontSize:13,color:"#10b981",fontWeight:500}}>
        ⚡ Your daily growth companion
      </div>
      <h1 className="fade-up" style={{fontSize:62,fontWeight:800,letterSpacing:"-2px",lineHeight:1.1,
        margin:"0 0 20px",background:"linear-gradient(135deg,#f1f5f9 0%,#10b981 50%,#6366f1 100%)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        Become a Better<br/>Version of Yourself
      </h1>
      <p className="fade-up" style={{fontSize:18,color:"#64748b",maxWidth:540,margin:"0 auto 40px",lineHeight:1.7}}>
        Track habits, crush goals, log your daily progress.<br/>
        Built for students, professionals and anyone who wants to grow.
      </p>
      <div className="fade-up" style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
        <button className="btn btn-primary" onClick={onStart}
          style={{fontSize:15,padding:"14px 32px",borderRadius:14,boxShadow:"0 6px 20px rgba(16,185,129,0.35)"}}>
          🚀 Start For Free
        </button>
        <button className="btn btn-outline" onClick={onStart} style={{fontSize:15,padding:"14px 28px",borderRadius:14}}>
          View Demo →
        </button>
      </div>
    </div>

    <div style={{position:"relative",zIndex:10,display:"grid",gridTemplateColumns:"repeat(4,1fr)",
      gap:1,background:"rgba(255,255,255,0.06)",margin:"0 60px 80px",borderRadius:16,overflow:"hidden"}}>
      {[["10K+","Active Users"],["1M+","Habits Tracked"],["98%","Satisfaction"],["Free","To Start"]].map(([v,l],i)=>(
        <div key={i} style={{background:"#060b14",padding:"28px",textAlign:"center"}}>
          <div style={{fontSize:30,fontWeight:800,color:"#10b981"}}>{v}</div>
          <div style={{fontSize:13,color:"#475569",marginTop:4}}>{l}</div>
        </div>
      ))}
    </div>

    <div style={{position:"relative",zIndex:10,padding:"0 60px 80px"}}>
      <h2 style={{fontSize:34,fontWeight:700,textAlign:"center",marginBottom:44,letterSpacing:"-0.5px"}}>Everything you need to grow</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
        {[
          {i:"✅",t:"Habit Tracker",d:"Daily habits with streaks, 7-day history and completion tracking"},
          {i:"🎯",t:"Goal Management",d:"Short, medium and long-term goals with priority and progress"},
          {i:"📝",t:"Daily Journal",d:"Log study hours, fitness, mood, water, calories every day"},
          {i:"🍅",t:"Pomodoro Timer",d:"Built-in focus timer with 25-5 min sessions for deep work"},
          {i:"📊",t:"Smart Analytics",d:"Beautiful charts built from your real personal data"},
          {i:"💬",t:"Live Support",d:"In-app chat support — get help anytime directly from the app"},
        ].map((f,i)=>(
          <div key={i} className="card" style={{padding:"24px"}}>
            <div style={{fontSize:30,marginBottom:12}}>{f.i}</div>
            <div style={{fontSize:15,fontWeight:600,color:"#f1f5f9",marginBottom:8}}>{f.t}</div>
            <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{position:"relative",zIndex:10,textAlign:"center",padding:"0 60px 80px"}}>
      <h2 style={{fontSize:34,fontWeight:700,marginBottom:44,letterSpacing:"-0.5px"}}>Simple Pricing</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:680,margin:"0 auto"}}>
        <div className="card" style={{padding:"32px",textAlign:"left"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#475569",marginBottom:12}}>FREE</div>
          <div style={{fontSize:40,fontWeight:800,marginBottom:4}}>₹0</div>
          <div style={{fontSize:13,color:"#475569",marginBottom:22}}>Forever free</div>
          {["5 habits","3 goals","Daily log","Basic analytics","Support chat"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9,fontSize:13,color:"#94a3b8"}}>
              <span style={{color:"#10b981"}}>✓</span>{f}
            </div>
          ))}
          <button className="btn btn-outline btn-full" onClick={onStart} style={{marginTop:10}}>Get Started</button>
        </div>
        <div className="card" style={{padding:"32px",textAlign:"left",
          background:"linear-gradient(135deg,rgba(16,185,129,0.07),rgba(99,102,241,0.07))",
          border:"1px solid rgba(16,185,129,0.25)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#10b981",marginBottom:12}}>PRO ⭐</div>
          <div style={{fontSize:40,fontWeight:800,marginBottom:4}}>₹99<span style={{fontSize:15,fontWeight:400,color:"#475569"}}>/mo</span></div>
          <div style={{fontSize:13,color:"#475569",marginBottom:22}}>Billed monthly via UPI</div>
          {["Unlimited habits","Unlimited goals","Full analytics","Pomodoro timer","Priority support","Export data"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9,fontSize:13,color:"#94a3b8"}}>
              <span style={{color:"#10b981"}}>✓</span>{f}
            </div>
          ))}
          <button className="btn btn-primary btn-full" onClick={onStart} style={{marginTop:10}}>Upgrade to Pro</button>
        </div>
      </div>
    </div>

    <div style={{position:"relative",zIndex:10,textAlign:"center",padding:"60px 40px 80px",
      background:"linear-gradient(180deg,transparent,rgba(16,185,129,0.04))"}}>
      <h2 style={{fontSize:38,fontWeight:800,letterSpacing:"-1px",marginBottom:14}}>Ready to grow? 🔥</h2>
      <p style={{fontSize:16,color:"#64748b",marginBottom:32}}>Join thousands already growing with BetterME</p>
      <button className="btn btn-primary" onClick={onStart}
        style={{fontSize:15,padding:"14px 36px",borderRadius:14,boxShadow:"0 6px 20px rgba(16,185,129,0.35)"}}>
        ⚡ Start Free Today
      </button>
    </div>
  </div>
);

// ── Auth Screen ───────────────────────────────────────────────────────────────
const Auth = ({onBack}) => {
  const [mode,setMode] = useState("login");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [name,setName] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");

  const handle = async () => {
    setError(""); setSuccess("");
    if(!email||!password){setError("Please fill all fields");return;}
    setLoading(true);
    try {
      if(mode==="login"){
        const {error:e} = await sb.auth.signInWithPassword({email,password});
        if(e) setError(e.message);
      } else {
        if(!name){setError("Please enter your name");setLoading(false);return;}
        const {data,error:e} = await sb.auth.signUp({email,password});
        if(e) setError(e.message);
        else if(data.user){
          await sb.from("profiles").upsert({
            id:data.user.id, name, role:"BetterME User", avatar:"👤",
            email, plan:"free", is_admin:email===ADMIN_EMAIL, is_blocked:false
          });
          setSuccess("Account created! Sign in now.");
          setMode("login");
        }
      }
    } catch(e){setError("Something went wrong. Try again.");}
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#060b14",display:"flex",position:"relative"}}>
      <AnimBg/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",position:"relative",zIndex:10}}>
        <div onClick={onBack} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:48}}>
          <Logo size={28}/><span style={{fontSize:16,fontWeight:700}}>BetterME</span>
          <span style={{fontSize:12,color:"#334155",marginLeft:4}}>← Back</span>
        </div>
        <div style={{maxWidth:400}}>
          <h1 className="fade-up" style={{fontSize:34,fontWeight:800,letterSpacing:"-1px",margin:"0 0 6px"}}>
            {mode==="login"?"Welcome back! 👋":"Join BetterME ⚡"}
          </h1>
          <p className="fade-up" style={{fontSize:14,color:"#475569",marginBottom:28}}>
            {mode==="login"?"Continue your growth journey":"Start becoming better today"}
          </p>
          <div className="card fade-up" style={{padding:"28px"}}>
            <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:12,padding:4,marginBottom:22}}>
              {["login","signup"].map(m=>(
                <div key={m} onClick={()=>{setMode(m);setError("");setSuccess("");}}
                  style={{flex:1,textAlign:"center",padding:"9px",borderRadius:10,cursor:"pointer",
                    background:mode===m?"rgba(16,185,129,0.18)":"transparent",
                    color:mode===m?"#10b981":"#475569",fontSize:13,fontWeight:600,transition:"all 0.2s"}}>
                  {m==="login"?"Sign In":"Create Account"}
                </div>
              ))}
            </div>
            {mode==="signup"&&(
              <Field label="Your Name">
                <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rahul Sharma"/>
              </Field>
            )}
            <Field label="Email">
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/>
            </Field>
            <Field label="Password">
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Min 6 characters" onKeyDown={e=>e.key==="Enter"&&handle()}/>
            </Field>
            {error&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",
              borderRadius:8,padding:"10px 14px",fontSize:13,color:"#ef4444",marginBottom:14}}>{error}</div>}
            {success&&<div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",
              borderRadius:8,padding:"10px 14px",fontSize:13,color:"#10b981",marginBottom:14}}>{success}</div>}
            <button className="btn btn-primary btn-full" onClick={handle} disabled={loading}>
              {loading?"Please wait...":mode==="login"?"Sign In →":"Create Account →"}
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"#334155"}}>🔒 Private & secure</div>
        </div>
      </div>
      <div style={{flex:1,borderLeft:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:60,position:"relative",zIndex:10,background:"rgba(16,185,129,0.02)"}}>
        <div className="bounce" style={{marginBottom:32,textAlign:"center"}}>
          <Logo size={60} animate/><div style={{fontSize:26,fontWeight:800,marginTop:14,letterSpacing:"-0.5px"}}>BetterME</div>
          <div style={{fontSize:13,color:"#475569",marginTop:4}}>Your daily growth companion</div>
        </div>
        {[["✅","Track habits with daily streaks"],["🎯","Set and crush your goals"],
          ["📝","Log daily progress & journal"],["🍅","Built-in Pomodoro timer"],
          ["💬","In-app support chat"],["🔒","100% private & secure"]
        ].map(([ic,t],i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,
            background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:12,padding:"10px 16px",width:"100%",maxWidth:320}}>
            <span style={{fontSize:18}}>{ic}</span>
            <span style={{fontSize:13,color:"#94a3b8"}}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Admin Panel ───────────────────────────────────────────────────────────────
const AdminPanel = ({onBack,session,profile}) => {
  const [users,setUsers] = useState([]);
  const [stats,setStats] = useState({users:0,habits:0,goals:0,logs:0,pro:0,tickets:0});
  const [loading,setLoading] = useState(true);
  const [selectedUser,setSelectedUser] = useState(null);
  const [adminTab,setAdminTab] = useState("overview");
  const [msg,setMsg] = useState("");

  useEffect(()=>{loadAdmin();},[]);

  const loadAdmin = async () => {
    setLoading(true);
    try {
      const [u,h,g,l,t] = await Promise.all([
        sb.from("profiles").select("*").order("created_at",{ascending:false}),
        sb.from("habits").select("id"),
        sb.from("goals").select("id"),
        sb.from("daily_logs").select("id"),
        sb.from("support_tickets").select("id,status"),
      ]);
      if(u.data) setUsers(u.data);
      setStats({
        users:u.data?.length||0, habits:h.data?.length||0,
        goals:g.data?.length||0, logs:l.data?.length||0,
        pro:u.data?.filter(x=>x.plan==="pro"||x.plan==="premium").length||0,
        tickets:t.data?.filter(x=>x.status==="open").length||0,
      });
    } catch(e){console.error(e);}
    setLoading(false);
  };

  const updateUser = async (userId,updates) => {
    await sb.from("profiles").update(updates).eq("id",userId);
    setUsers(prev=>prev.map(u=>u.id===userId?{...u,...updates}:u));
    setSelectedUser(prev=>prev?{...prev,...updates}:null);
    setMsg("Updated!"); setTimeout(()=>setMsg(""),3000);
  };

  return (
    <div style={{minHeight:"100vh",background:"#060b14",color:"#f1f5f9",position:"relative"}}>
      <AnimBg/>
      <div style={{position:"relative",zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"rgba(255,255,255,0.02)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Logo size={32}/>
          <div><div style={{fontSize:15,fontWeight:700}}>BetterME Admin</div><div style={{fontSize:11,color:"#334155"}}>Control Panel</div></div>
          <span className="badge badge-red" style={{marginLeft:8}}>🔐 Admin Only</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {msg&&<span style={{fontSize:13,color:"#10b981"}}>✅ {msg}</span>}
          <button className="btn btn-outline btn-sm" onClick={loadAdmin}>🔄 Refresh</button>
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Back to App</button>
        </div>
      </div>

      <div style={{position:"relative",zIndex:10,padding:"24px 32px"}}>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[["overview","📊 Overview"],["users","👥 Users"],["support","💬 Support"],["revenue","💰 Revenue"]].map(([id,label])=>(
            <button key={id} onClick={()=>setAdminTab(id)} className={`btn ${adminTab===id?"btn-primary":"btn-outline"}`}>{label}</button>
          ))}
        </div>

        {adminTab==="overview"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:22}}>
              {[
                {icon:"👥",label:"Users",value:stats.users,color:"#10b981"},
                {icon:"⭐",label:"Pro Users",value:stats.pro,color:"#f59e0b"},
                {icon:"✅",label:"Habits",value:stats.habits,color:"#6366f1"},
                {icon:"🎯",label:"Goals",value:stats.goals,color:"#ec4899"},
                {icon:"📝",label:"Logs",value:stats.logs,color:"#0ea5e9"},
                {icon:"💬",label:"Open Tickets",value:stats.tickets,color:"#ef4444"},
              ].map((s,i)=>(
                <div key={i} className="card" style={{textAlign:"center",padding:"16px 12px"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:"#475569",marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div className="card">
                <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>Recent Users</div>
                {users.slice(0,6).map(u=>(
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{u.avatar||"👤"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500}}>{u.name||"Unknown"}</div>
                      <div style={{fontSize:11,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email||""}</div>
                    </div>
                    <span className={`badge badge-${u.plan==="premium"?"yellow":u.plan==="pro"?"purple":"gray"}`}>{u.plan||"free"}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>Plan Distribution</div>
                {[
                  {l:"Free",c:users.filter(u=>!u.plan||u.plan==="free").length,col:"#64748b"},
                  {l:"Pro",c:users.filter(u=>u.plan==="pro").length,col:"#6366f1"},
                  {l:"Premium",c:users.filter(u=>u.plan==="premium").length,col:"#f59e0b"},
                  {l:"Blocked",c:users.filter(u=>u.is_blocked).length,col:"#ef4444"},
                ].map((p,i)=>(
                  <div key={i} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,color:"#94a3b8"}}>{p.l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:p.col}}>{p.c}</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:10}}>
                      <div style={{width:users.length?`${(p.c/users.length)*100}%`:"0%",height:"100%",background:p.col,borderRadius:10}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {adminTab==="users"&&(
          <div className="card">
            <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>
              All Users ({users.length})
            </div>
            {users.map(u=>(
              <div key={u.id} onClick={()=>setSelectedUser(u)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 10px",borderRadius:10,cursor:"pointer",
                  transition:"background 0.15s",marginBottom:2,
                  background:selectedUser?.id===u.id?"rgba(16,185,129,0.08)":"transparent",
                  border:selectedUser?.id===u.id?"1px solid rgba(16,185,129,0.2)":"1px solid transparent"}}>
                <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                  background:u.is_blocked?"rgba(239,68,68,0.2)":"linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{u.avatar||"👤"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13,fontWeight:500}}>{u.name||"Unknown"}</span>
                    {u.is_admin&&<span className="badge badge-red" style={{fontSize:9}}>ADMIN</span>}
                    {u.is_blocked&&<span className="badge badge-red" style={{fontSize:9}}>BLOCKED</span>}
                  </div>
                  <div style={{fontSize:11,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email||""}</div>
                </div>
                <span className={`badge badge-${u.plan==="premium"?"yellow":u.plan==="pro"?"purple":"gray"}`}>{u.plan||"free"}</span>
              </div>
            ))}
          </div>
        )}

        {adminTab==="support"&&<AdminSupport session={session} profile={profile}/>}

        {adminTab==="revenue"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>Revenue Estimate</div>
              {[
                {l:"Pro users × ₹99",v:`₹${users.filter(u=>u.plan==="pro").length*99}`,c:"#6366f1"},
                {l:"Premium users × ₹99",v:`₹${users.filter(u=>u.plan==="premium").length*99}`,c:"#f59e0b"},
                {l:"Total MRR",v:`₹${users.filter(u=>u.plan==="pro"||u.plan==="premium").length*99}`,c:"#10b981"},
                {l:"Annual Projection",v:`₹${users.filter(u=>u.plan==="pro"||u.plan==="premium").length*99*12}`,c:"#ec4899"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"13px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:13,color:"#94a3b8"}}>{r.l}</span>
                  <span style={{fontSize:16,fontWeight:700,color:r.c}}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>Payment Setup</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:2}}>
                <div>💳 Razorpay UPI Autopay — coming soon</div>
                <div>📱 GPay / PhonePe / Paytm support</div>
                <div>🔄 Monthly subscription management</div>
                <div>📧 Payment receipt emails</div>
              </div>
              <div style={{marginTop:16,padding:"14px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:10}}>
                <div style={{fontSize:12,color:"#10b981",fontWeight:600,marginBottom:4}}>Next Step</div>
                <div style={{fontSize:12,color:"#94a3b8"}}>Add your Razorpay API keys to enable UPI payments</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedUser&&(
        <Modal title={`Manage — ${selectedUser.name||"User"}`} onClose={()=>setSelectedUser(null)}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,
            padding:"14px",background:"rgba(255,255,255,0.03)",borderRadius:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{selectedUser.avatar||"👤"}</div>
            <div>
              <div style={{fontSize:15,fontWeight:600}}>{selectedUser.name}</div>
              <div style={{fontSize:12,color:"#475569"}}>{selectedUser.email}</div>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                <span className={`badge badge-${selectedUser.plan==="premium"?"yellow":selectedUser.plan==="pro"?"purple":"gray"}`}>{selectedUser.plan||"free"}</span>
                {selectedUser.is_admin&&<span className="badge badge-red">ADMIN</span>}
                {selectedUser.is_blocked&&<span className="badge badge-red">BLOCKED</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {l:"⭐ Give Free Premium Access",a:()=>updateUser(selectedUser.id,{plan:"premium"}),c:"rgba(245,158,11,0.1)",bc:"rgba(245,158,11,0.25)",tc:"#f59e0b"},
              {l:"↩️ Downgrade to Free",a:()=>updateUser(selectedUser.id,{plan:"free"}),c:"rgba(100,116,139,0.1)",bc:"rgba(100,116,139,0.25)",tc:"#94a3b8"},
              {l:"🔐 Make Admin",a:()=>updateUser(selectedUser.id,{is_admin:true}),c:"rgba(99,102,241,0.1)",bc:"rgba(99,102,241,0.25)",tc:"#6366f1"},
              {l:selectedUser.is_blocked?"✅ Unblock User":"🚫 Block User",
                a:()=>updateUser(selectedUser.id,{is_blocked:!selectedUser.is_blocked}),
                c:"rgba(239,68,68,0.1)",bc:"rgba(239,68,68,0.25)",tc:"#ef4444"},
            ].map((a,i)=>(
              <button key={i} className="btn" onClick={a.a}
                style={{background:a.c,border:`1px solid ${a.bc}`,color:a.tc,textAlign:"left",padding:"12px 16px"}}>
                {a.l}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function BetterME() {
  const [screen,setScreen] = useState("landing");
  const [session,setSession] = useState(null);
  const [appLoading,setAppLoading] = useState(true);
  const [profile,setProfile] = useState(null);
  const [habits,setHabits] = useState([]);
  const [goals,setGoals] = useState([]);
  const [logs,setLogs] = useState([]);
  const [habitLogs,setHabitLogs] = useState([]);
  const [tab,setTab] = useState("dashboard");
  const [habitModal,setHabitModal] = useState(null);
  const [goalModal,setGoalModal] = useState(null);
  const [logModal,setLogModal] = useState(false);
  const [profileModal,setProfileModal] = useState(false);
  const [hForm,setHForm] = useState({name:"",icon:"✨",category:"Personal",color:"#6366f1"});
  const [gForm,setGForm] = useState({title:"",description:"",deadline:"",priority:"medium",progress:0,category:"Career"});
  const [lForm,setLForm] = useState({date:today(),study_hours:"",weight:"",protein:"",water:"",calories:"",steps:"",mood:"😊",notes:""});
  const [pForm,setPForm] = useState({name:"",role:"",avatar:"👤"});
  const [toast,setToast] = useState("");

  const todayStr = today();
  const uid = session?.user?.id;
  const isAdmin = profile?.is_admin || session?.user?.email===ADMIN_EMAIL;
  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),3000); };

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{ setSession(session); if(session) setScreen("app"); setAppLoading(false); });
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,s)=>{ setSession(s); if(s) setScreen("app"); else setScreen("landing"); });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(uid) loadAll(); },[uid]);

  const loadAll = async () => {
    try {
      const [p,h,g,l,hl] = await Promise.all([
        sb.from("profiles").select("*").eq("id",uid).single(),
        sb.from("habits").select("*").eq("user_id",uid).order("created_at"),
        sb.from("goals").select("*").eq("user_id",uid).order("created_at"),
        sb.from("daily_logs").select("*").eq("user_id",uid).order("date"),
        sb.from("habit_logs").select("*").eq("user_id",uid),
      ]);
      if(p.data){setProfile(p.data);setPForm({name:p.data.name||"",role:p.data.role||"",avatar:p.data.avatar||"👤"});}
      if(h.data) setHabits(h.data);
      if(g.data) setGoals(g.data);
      if(l.data) setLogs(l.data);
      if(hl.data) setHabitLogs(hl.data);
    } catch(e){console.error(e);}
  };

  const isHabitDoneToday = id => habitLogs.some(l=>l.habit_id===id&&l.date===todayStr);

  const toggleHabit = async id => {
    const done = isHabitDoneToday(id);
    if(done){
      await sb.from("habit_logs").delete().eq("habit_id",id).eq("date",todayStr).eq("user_id",uid);
      setHabitLogs(prev=>prev.filter(l=>!(l.habit_id===id&&l.date===todayStr)));
    } else {
      const {data} = await sb.from("habit_logs").insert({user_id:uid,habit_id:id,date:todayStr,done:true}).select().single();
      if(data) setHabitLogs(prev=>[...prev,data]);
      const habit = habits.find(h=>h.id===id);
      if(habit){ await sb.from("habits").update({streak:(habit.streak||0)+1}).eq("id",id); setHabits(prev=>prev.map(h=>h.id===id?{...h,streak:(h.streak||0)+1}:h)); }
    }
  };

  const saveHabit = async () => {
    if(!hForm.name.trim()) return;
    if(habitModal==="add"){
      const {data} = await sb.from("habits").insert({...hForm,user_id:uid,streak:0}).select().single();
      if(data) setHabits(prev=>[...prev,data]);
    } else {
      await sb.from("habits").update(hForm).eq("id",habitModal.id);
      setHabits(prev=>prev.map(h=>h.id===habitModal.id?{...h,...hForm}:h));
    }
    setHabitModal(null); showToast("Habit saved!");
  };

  const deleteHabit = async id => {
    await sb.from("habit_logs").delete().eq("habit_id",id);
    await sb.from("habits").delete().eq("id",id);
    setHabits(prev=>prev.filter(h=>h.id!==id));
    setHabitModal(null); showToast("Habit deleted");
  };

  const saveGoal = async () => {
    if(!gForm.title.trim()) return;
    if(goalModal==="add"){
      const {data} = await sb.from("goals").insert({...gForm,user_id:uid,progress:Number(gForm.progress)}).select().single();
      if(data) setGoals(prev=>[...prev,data]);
    } else {
      await sb.from("goals").update({...gForm,progress:Number(gForm.progress)}).eq("id",goalModal.id);
      setGoals(prev=>prev.map(g=>g.id===goalModal.id?{...g,...gForm,progress:Number(gForm.progress)}:g));
    }
    setGoalModal(null); showToast("Goal saved!");
  };

  const deleteGoal = async id => {
    await sb.from("goals").delete().eq("id",id);
    setGoals(prev=>prev.filter(g=>g.id!==id));
    setGoalModal(null); showToast("Goal deleted");
  };

  const saveLog = async () => {
    const existing = logs.find(l=>l.date===lForm.date);
    if(existing){
      await sb.from("daily_logs").update(lForm).eq("id",existing.id);
      setLogs(prev=>prev.map(l=>l.date===lForm.date?{...l,...lForm}:l));
    } else {
      const {data} = await sb.from("daily_logs").insert({...lForm,user_id:uid}).select().single();
      if(data) setLogs(prev=>[...prev,data]);
    }
    setLogModal(false); showToast("Log saved!");
  };

  const openLog = () => {
    const existing = logs.find(l=>l.date===todayStr);
    setLForm(existing?{...existing}:{date:todayStr,study_hours:"",weight:"",protein:"",water:"",calories:"",steps:"",mood:"😊",notes:""});
    setLogModal(true);
  };

  const saveProfile = async () => {
    await sb.from("profiles").update(pForm).eq("id",uid);
    setProfile(prev=>({...prev,...pForm}));
    setProfileModal(false); showToast("Profile updated!");
  };

  const signOut = async () => { await sb.auth.signOut(); setProfile(null); setHabits([]); setGoals([]); setLogs([]); setHabitLogs([]); };

  if(appLoading) return (
    <div style={{minHeight:"100vh",background:"#060b14",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <AnimBg/><div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
        <Logo size={52} animate/><div style={{fontSize:13,color:"#475569",animation:"pulse 1.5s ease infinite"}}>Loading BetterME...</div>
      </div>
    </div>
  );

  if(screen==="landing") return <Landing onStart={()=>setScreen("auth")}/>;
  if(screen==="auth") return <Auth onBack={()=>setScreen("landing")}/>;
  if(screen==="admin") return <AdminPanel onBack={()=>setScreen("app")} session={session} profile={profile}/>;

  const completedToday = habits.filter(h=>isHabitDoneToday(h.id));
  const pct = habits.length?Math.round((completedToday.length/habits.length)*100):0;
  const todayLog = logs.find(l=>l.date===todayStr);
  const last7Logs = [...logs].sort((a,b)=>a.date>b.date?1:-1).slice(-7);
  const tts = {background:"#0a1628",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:11};
  const ct = {fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:16};

  const navItems=[
    {id:"dashboard",icon:"🏠",label:"Dashboard"},
    {id:"habits",icon:"✅",label:"Habits"},
    {id:"goals",icon:"🎯",label:"Goals"},
    {id:"dailylog",icon:"📝",label:"Daily Log"},
    {id:"analytics",icon:"📊",label:"Analytics"},
    {id:"pomodoro",icon:"🍅",label:"Pomodoro"},
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#060b14",color:"#f1f5f9",position:"relative"}}>
      <AnimBg/>
      <Toast msg={toast}/>

      {/* Sidebar */}
      <nav style={{width:210,flexShrink:0,background:"rgba(255,255,255,0.02)",borderRight:"1px solid rgba(255,255,255,0.06)",
        display:"flex",flexDirection:"column",padding:"20px 0",position:"sticky",top:0,height:"100vh",overflowY:"auto",zIndex:10}}>
        <div style={{padding:"0 16px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Logo size={32}/><div><div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.5px"}}>BetterME</div><div style={{fontSize:10,color:"#334155"}}>Personal Tracker</div></div>
          </div>
        </div>
        <div style={{padding:"0 8px",flex:1}}>
          {navItems.map(n=>(
            <div key={n.id} onClick={()=>setTab(n.id)} className="nav-item"
              style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:9,cursor:"pointer",marginBottom:2,
                background:tab===n.id?"rgba(16,185,129,0.12)":"transparent",
                border:tab===n.id?"1px solid rgba(16,185,129,0.22)":"1px solid transparent",
                color:tab===n.id?"#10b981":"#475569",fontSize:13,fontWeight:tab===n.id?600:400,transition:"all 0.15s"}}>
              <span style={{fontSize:15}}>{n.icon}</span>{n.label}
            </div>
          ))}
          {isAdmin&&(
            <div onClick={()=>setScreen("admin")} className="nav-item"
              style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:9,cursor:"pointer",marginBottom:2,
                marginTop:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",
                color:"#ef4444",fontSize:13,fontWeight:600,transition:"all 0.15s"}}>
              <span style={{fontSize:15}}>🔐</span>Admin Panel
            </div>
          )}
        </div>
        <div style={{padding:"14px",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:8}}>
          <div onClick={()=>setProfileModal(true)}
            style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:10,padding:"8px",borderRadius:10,transition:"background 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{profile?.avatar||"👤"}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.name||"My Profile"}</div>
              <div style={{fontSize:10,color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.role||"Click to edit"}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-full" onClick={signOut} style={{fontSize:12,padding:"8px"}}>Sign Out</button>
        </div>
      </nav>

      {/* Main */}
      <main style={{flex:1,overflowY:"auto",padding:"28px 32px",position:"relative",zIndex:10}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:700,margin:0,letterSpacing:"-0.5px"}}>
                  Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {(profile?.name||"there").split(" ")[0]}! 👋
                </h1>
                <p style={{fontSize:13,color:"#475569",margin:"4px 0 0"}}>
                  {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
                </p>
              </div>
              <button className="btn btn-primary" onClick={openLog} style={{display:"flex",alignItems:"center",gap:6}}>📝 Log Today</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
              {[
                {icon:"✅",label:"Today's Habits",value:`${pct}%`,sub:`${completedToday.length}/${habits.length} done`,color:"#10b981",pct},
                {icon:"🔥",label:"Best Streak",value:habits.length?`${Math.max(0,...habits.map(h=>h.streak||0))}d`:"0d",sub:"Keep going!",color:"#f59e0b",pct:65},
                {icon:"🎯",label:"Goals Active",value:goals.length,sub:`${goals.filter(g=>g.priority==="critical").length} critical`,color:"#6366f1",pct:50},
                {icon:"📅",label:"Days Logged",value:logs.length,sub:"Total entries",color:"#ec4899",pct:Math.min(100,logs.length*4)},
              ].map((s,i)=>(
                <div key={i} className="card" style={{position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-20,right:-20,width:70,height:70,borderRadius:"50%",background:`${s.color}12`}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{fontSize:22}}>{s.icon}</div><Ring pct={s.pct} size={42} stroke={4} color={s.color}/>
                  </div>
                  <div style={{fontSize:26,fontWeight:700,marginTop:8}}>{s.value}</div>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{s.label}</div>
                  <div style={{fontSize:11,color:s.color,marginTop:2}}>{s.sub}</div>
                </div>
              ))}
            </div>
            {todayLog&&(
              <div className="card" style={{marginBottom:22,background:"rgba(16,185,129,0.03)",border:"1px solid rgba(16,185,129,0.15)"}}>
                <div style={{...ct,color:"#10b981"}}>Today's Entry {todayLog.mood}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {[{l:"Study",v:todayLog.study_hours,u:"hrs",c:"#6366f1"},{l:"Weight",v:todayLog.weight,u:"kg",c:"#10b981"},
                    {l:"Protein",v:todayLog.protein,u:"g",c:"#f97316"},{l:"Water",v:todayLog.water,u:"L",c:"#0ea5e9"},
                    {l:"Calories",v:todayLog.calories,u:"kcal",c:"#f59e0b"},{l:"Steps",v:todayLog.steps,u:"",c:"#ec4899"},
                  ].filter(x=>x.v).map((x,i)=>(
                    <div key={i} style={{background:`${x.c}10`,border:`1px solid ${x.c}20`,borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
                      <div style={{fontSize:15,fontWeight:700,color:x.c}}>{x.v}<span style={{fontSize:10}}>{x.u}</span></div>
                      <div style={{fontSize:10,color:"#475569"}}>{x.l}</div>
                    </div>
                  ))}
                  {todayLog.notes&&<div style={{width:"100%",fontSize:13,color:"#94a3b8",fontStyle:"italic"}}>📝 {todayLog.notes}</div>}
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div className="card">
                <div style={ct}>Today's Habits</div>
                {habits.length===0&&<div style={{color:"#334155",fontSize:13,padding:"8px 0"}}>No habits yet!</div>}
                {habits.map(h=>(
                  <div key={h.id} onClick={()=>toggleHabit(h.id)} className="habit-row"
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",borderRadius:8,transition:"background 0.15s"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,background:isHabitDoneToday(h.id)?h.color:"rgba(255,255,255,0.05)",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,
                      boxShadow:isHabitDoneToday(h.id)?`0 0 12px ${h.color}50`:"none",transition:"all 0.3s"}}>{h.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:isHabitDoneToday(h.id)?"#f1f5f9":"#64748b"}}>{h.name}</div>
                      <div style={{fontSize:10,color:"#334155"}}>{h.category} • {h.streak||0}d 🔥</div>
                    </div>
                    <div style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${isHabitDoneToday(h.id)?h.color:"rgba(255,255,255,0.15)"}`,
                      background:isHabitDoneToday(h.id)?h.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                      {isHabitDoneToday(h.id)&&<span style={{fontSize:11,color:"#fff"}}>✓</span>}
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline btn-full"
                  onClick={()=>{setHForm({name:"",icon:"✨",category:"Personal",color:"#6366f1"});setHabitModal("add");}}
                  style={{marginTop:12,borderStyle:"dashed",borderColor:"rgba(16,185,129,0.3)",color:"#10b981"}}>
                  + Add New Habit
                </button>
              </div>
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={ct}>Your Goals</div>
                  <button className="btn btn-outline btn-sm" onClick={()=>{setGForm({title:"",description:"",deadline:"",priority:"medium",progress:0,category:"Career"});setGoalModal("add");}}>+ Add</button>
                </div>
                {goals.length===0&&<div style={{color:"#334155",fontSize:13}}>No goals yet!</div>}
                {goals.slice(0,5).map(g=>{
                  const c=PRIORITY_COLOR[g.priority];
                  return (
                    <div key={g.id} onClick={()=>{setGForm({...g});setGoalModal(g);}} style={{marginBottom:14,cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:13,fontWeight:500}}>{g.title}</span>
                        <span style={{fontSize:10,color:c,fontWeight:600}}>{g.progress}%</span>
                      </div>
                      <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:10}}>
                        <div style={{width:`${g.progress}%`,height:"100%",background:c,borderRadius:10,transition:"width 0.8s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* HABITS */}
        {tab==="habits"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:700,margin:0}}>Habits ✅</h1>
              <button className="btn btn-primary" onClick={()=>{setHForm({name:"",icon:"✨",category:"Personal",color:"#6366f1"});setHabitModal("add");}}>+ Add Habit</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {habits.map(h=>{
                const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const k=d.toISOString().split("T")[0];return {day:["S","M","T","W","T","F","S"][d.getDay()],done:habitLogs.some(l=>l.habit_id===h.id&&l.date===k)};});
                return (
                  <div key={h.id} className="card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:h.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 0 10px ${h.color}18`}}>{h.icon}</div>
                        <div><div style={{fontSize:14,fontWeight:600}}>{h.name}</div><div style={{fontSize:11,color:"#475569"}}>{h.category} • {h.streak||0} 🔥</div></div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={()=>{setHForm({name:h.name,icon:h.icon,category:h.category,color:h.color});setHabitModal(h);}}>✏️</button>
                    </div>
                    <div style={{display:"flex",gap:5,marginBottom:12}}>
                      {last7.map((d,i)=>(
                        <div key={i} style={{flex:1,textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#334155",marginBottom:3}}>{d.day}</div>
                          <div style={{height:20,borderRadius:4,background:d.done?h.color:"rgba(255,255,255,0.05)",boxShadow:d.done?`0 0 6px ${h.color}40`:"none",transition:"all 0.3s"}}/>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>toggleHabit(h.id)}
                      style={{width:"100%",padding:"8px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
                        border:`1px solid ${isHabitDoneToday(h.id)?h.color:"rgba(255,255,255,0.1)"}`,
                        background:isHabitDoneToday(h.id)?h.color+"20":"transparent",color:isHabitDoneToday(h.id)?h.color:"#475569"}}>
                      {isHabitDoneToday(h.id)?"✓ Done Today":"Mark Done Today"}
                    </button>
                  </div>
                );
              })}
              <div className="card" onClick={()=>{setHForm({name:"",icon:"✨",category:"Personal",color:"#6366f1"});setHabitModal("add");}}
                style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"1px dashed rgba(255,255,255,0.1)",minHeight:180,flexDirection:"column",gap:8,color:"#334155"}}>
                <div style={{fontSize:32}}>+</div><div style={{fontSize:13}}>Add New Habit</div>
              </div>
            </div>
          </div>
        )}

        {/* GOALS */}
        {tab==="goals"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:700,margin:0}}>Goals 🎯</h1>
              <button className="btn btn-primary" onClick={()=>{setGForm({title:"",description:"",deadline:"",priority:"medium",progress:0,category:"Career"});setGoalModal("add");}}>+ Add Goal</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {goals.map(g=>{
                const c=PRIORITY_COLOR[g.priority];
                return (
                  <div key={g.id} className="card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{flex:1,paddingRight:8}}><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{g.title}</div><div style={{fontSize:12,color:"#475569"}}>{g.description}</div></div>
                      <button className="btn btn-outline btn-sm" onClick={()=>{setGForm({...g});setGoalModal(g);}}>✏️</button>
                    </div>
                    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                      <span className="badge" style={{background:`${c}18`,color:c}}>{g.priority?.toUpperCase()}</span>
                      <span className="badge badge-gray">{g.category}</span>
                      {g.deadline&&<span className="badge badge-gray">📅 {g.deadline}</span>}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:11,color:"#475569"}}>Progress</span>
                      <span style={{fontSize:11,fontWeight:700,color:c}}>{g.progress}%</span>
                    </div>
                    <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:10}}>
                      <div style={{width:`${g.progress}%`,height:"100%",background:c,borderRadius:10,transition:"width 0.8s ease",boxShadow:`0 0 8px ${c}30`}}/>
                    </div>
                  </div>
                );
              })}
              <div className="card" onClick={()=>{setGForm({title:"",description:"",deadline:"",priority:"medium",progress:0,category:"Career"});setGoalModal("add");}}
                style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"1px dashed rgba(255,255,255,0.1)",minHeight:160,flexDirection:"column",gap:8,color:"#334155"}}>
                <div style={{fontSize:32}}>+</div><div style={{fontSize:13}}>Add New Goal</div>
              </div>
            </div>
          </div>
        )}

        {/* DAILY LOG */}
        {tab==="dailylog"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:700,margin:0}}>Daily Log 📝</h1>
              <button className="btn btn-primary" onClick={openLog}>+ Log Today</button>
            </div>
            {logs.length===0?(
              <div className="card" style={{textAlign:"center",padding:52}}>
                <div style={{fontSize:44,marginBottom:12}}>📅</div>
                <div style={{fontSize:15,color:"#94a3b8",marginBottom:8}}>No logs yet</div>
                <div style={{fontSize:13,color:"#475569",marginBottom:22}}>Start logging your daily progress!</div>
                <button className="btn btn-primary" onClick={openLog}>Log Today's Entry</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[...logs].sort((a,b)=>b.date>a.date?1:-1).map(l=>(
                  <div key={l.id||l.date} className="card" style={{cursor:"pointer"}} onClick={()=>{setLForm({...l});setLogModal(true);}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:600}}>{l.mood} {new Date(l.date+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",month:"short",day:"numeric",year:"numeric"})}</div>
                        {l.notes&&<div style={{fontSize:12,color:"#475569",marginTop:2}}>"{l.notes}"</div>}
                      </div>
                      <span style={{fontSize:11,color:"#334155"}}>✏️ Edit</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {[{l:"Study",v:l.study_hours,u:"hrs",c:"#6366f1"},{l:"Weight",v:l.weight,u:"kg",c:"#10b981"},
                        {l:"Protein",v:l.protein,u:"g",c:"#f97316"},{l:"Water",v:l.water,u:"L",c:"#0ea5e9"},
                        {l:"Calories",v:l.calories,u:"kcal",c:"#f59e0b"},{l:"Steps",v:l.steps,u:"",c:"#ec4899"},
                      ].filter(x=>x.v).map((x,i)=>(
                        <div key={i} style={{background:`${x.c}10`,border:`1px solid ${x.c}20`,borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                          <div style={{fontSize:14,fontWeight:700,color:x.c}}>{x.v}<span style={{fontSize:9}}>{x.u}</span></div>
                          <div style={{fontSize:9,color:"#475569"}}>{x.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {tab==="analytics"&&(
          <div className="fade-in">
            <h1 style={{fontSize:24,fontWeight:700,margin:"0 0 24px"}}>Analytics 📊</h1>
            {last7Logs.length<2?(
              <div className="card" style={{textAlign:"center",padding:52}}>
                <div style={{fontSize:44,marginBottom:12}}>📈</div>
                <div style={{fontSize:15,color:"#94a3b8"}}>Log at least 2 days to see your analytics!</div>
              </div>
            ):(
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
                  <div className="card">
                    <div style={ct}>Study Hours</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={last7Logs}>
                        <XAxis dataKey="date" tickFormatter={d=>d.slice(5)} tick={{fontSize:10,fill:"#475569"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:10,fill:"#475569"}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={tts}/>
                        <Bar dataKey="study_hours" fill="#6366f1" radius={[4,4,0,0]} name="Study hrs"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card">
                    <div style={ct}>Weight Trend</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={last7Logs}>
                        <XAxis dataKey="date" tickFormatter={d=>d.slice(5)} tick={{fontSize:10,fill:"#475569"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:10,fill:"#475569"}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={tts}/>
                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} dot={{fill:"#10b981",r:3}} name="Weight kg"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                  <div className="card">
                    <div style={ct}>Protein Intake</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={last7Logs}>
                        <XAxis dataKey="date" tickFormatter={d=>d.slice(5)} tick={{fontSize:10,fill:"#475569"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:10,fill:"#475569"}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={tts}/>
                        <Bar dataKey="protein" fill="#f97316" radius={[4,4,0,0]} name="Protein g"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card">
                    <div style={ct}>Habit Completion (7 days)</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
                      {habits.length===0&&<div style={{color:"#334155",fontSize:13}}>Add habits to see data</div>}
                      {habits.map(h=>{
                        const done7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return habitLogs.some(l=>l.habit_id===h.id&&l.date===d.toISOString().split("T")[0])?1:0;}).reduce((a,b)=>a+b,0);
                        return (
                          <div key={h.id}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:12,color:"#94a3b8"}}>{h.icon} {h.name}</span>
                              <span style={{fontSize:11,fontWeight:600,color:h.color}}>{done7}/7</span>
                            </div>
                            <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:10}}>
                              <div style={{width:`${(done7/7)*100}%`,height:"100%",background:h.color,borderRadius:10}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* POMODORO */}
        {tab==="pomodoro"&&(
          <div className="fade-in">
            <h1 style={{fontSize:24,fontWeight:700,margin:"0 0 24px"}}>Pomodoro Timer 🍅</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div className="card">
                <div style={ct}>Focus Timer</div>
                <Pomodoro/>
              </div>
              <div className="card">
                <div style={ct}>How to use Pomodoro</div>
                <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:8}}>
                  {[
                    {n:"1",t:"Pick a task to work on",c:"#10b981"},
                    {n:"2",t:"Set timer to 25 minutes (Focus)",c:"#6366f1"},
                    {n:"3",t:"Work until timer rings",c:"#f59e0b"},
                    {n:"4",t:"Take a 5 minute short break",c:"#0ea5e9"},
                    {n:"5",t:"Every 4 sessions take a long break",c:"#ec4899"},
                  ].map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:`${s.c}20`,border:`1px solid ${s.c}40`,
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:s.c,flexShrink:0}}>{s.n}</div>
                      <div style={{fontSize:13,color:"#94a3b8"}}>{s.t}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:24,padding:"14px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:12}}>
                  <div style={{fontSize:12,color:"#10b981",fontWeight:600,marginBottom:4}}>💡 Pro Tip</div>
                  <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>Pomodoro technique improves focus by 300%. Use it for GATE prep, assignments and deep work sessions!</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Support Widget */}
      <SupportWidget session={session} profile={profile} isAdmin={isAdmin}/>

      {/* MODALS */}
      {habitModal&&(
        <Modal title={habitModal==="add"?"Add New Habit":"Edit Habit"} onClose={()=>setHabitModal(null)}>
          <Field label="Habit Name"><input className="input" value={hForm.name} onChange={e=>setHForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Morning Run" onKeyDown={e=>e.key==="Enter"&&saveHabit()}/></Field>
          <Field label="Pick Icon">
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ICONS.map(ic=>(
                <div key={ic} onClick={()=>setHForm(p=>({...p,icon:ic}))}
                  style={{width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",transition:"all 0.15s",background:hForm.icon===ic?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.04)",border:hForm.icon===ic?"1px solid #10b981":"1px solid transparent"}}>{ic}</div>
              ))}
            </div>
          </Field>
          <Field label="Category"><select className="select" value={hForm.category} onChange={e=>setHForm(p=>({...p,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
          <Field label="Color">
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLORS.map(c=>(<div key={c} onClick={()=>setHForm(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:hForm.color===c?"3px solid #fff":"3px solid transparent",transition:"border 0.15s"}}/>))}
            </div>
          </Field>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            {habitModal!=="add"&&<button className="btn btn-danger" onClick={()=>deleteHabit(habitModal.id)}>Delete</button>}
            <button className="btn btn-outline" onClick={()=>setHabitModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveHabit}>Save Habit</button>
          </div>
        </Modal>
      )}

      {goalModal&&(
        <Modal title={goalModal==="add"?"Add New Goal":"Edit Goal"} onClose={()=>setGoalModal(null)}>
          <Field label="Goal Title"><input className="input" value={gForm.title} onChange={e=>setGForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Crack GATE 2025"/></Field>
          <Field label="Description"><input className="input" value={gForm.description} onChange={e=>setGForm(p=>({...p,description:e.target.value}))} placeholder="Brief description..."/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Category"><select className="select" value={gForm.category} onChange={e=>setGForm(p=>({...p,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
            <Field label="Priority"><select className="select" value={gForm.priority} onChange={e=>setGForm(p=>({...p,priority:e.target.value}))}>{["critical","high","medium","low"].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select></Field>
          </div>
          <Field label="Deadline"><input className="input" type="date" value={gForm.deadline} onChange={e=>setGForm(p=>({...p,deadline:e.target.value}))}/></Field>
          <Field label={`Progress: ${gForm.progress}%`}><input type="range" min={0} max={100} value={gForm.progress} onChange={e=>setGForm(p=>({...p,progress:Number(e.target.value)}))} style={{width:"100%",accentColor:"#10b981"}}/></Field>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            {goalModal!=="add"&&<button className="btn btn-danger" onClick={()=>deleteGoal(goalModal.id)}>Delete</button>}
            <button className="btn btn-outline" onClick={()=>setGoalModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveGoal}>Save Goal</button>
          </div>
        </Modal>
      )}

      {logModal&&(
        <Modal title={`Daily Log — ${lForm.date}`} onClose={()=>setLogModal(false)}>
          <Field label="Date"><input className="input" type="date" value={lForm.date} onChange={e=>setLForm(p=>({...p,date:e.target.value}))}/></Field>
          <Field label="Mood">
            <div style={{display:"flex",gap:8}}>
              {["😊","😐","😔","🔥","😴","💪"].map(m=>(
                <div key={m} onClick={()=>setLForm(p=>({...p,mood:m}))}
                  style={{width:38,height:38,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",transition:"all 0.15s",background:lForm.mood===m?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.04)",border:lForm.mood===m?"1px solid #10b981":"1px solid transparent"}}>{m}</div>
              ))}
            </div>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{l:"Study Hours",k:"study_hours",p:"e.g. 4"},{l:"Weight (kg)",k:"weight",p:"e.g. 67.5"},{l:"Protein (g)",k:"protein",p:"e.g. 110"},{l:"Water (L)",k:"water",p:"e.g. 3"},{l:"Calories",k:"calories",p:"e.g. 2200"},{l:"Steps",k:"steps",p:"e.g. 8000"}].map(({l,k,p})=>(
              <Field key={k} label={l}><input className="input" type="number" value={lForm[k]} onChange={e=>setLForm(prev=>({...prev,[k]:e.target.value}))} placeholder={p}/></Field>
            ))}
          </div>
          <Field label="Notes / Journal"><textarea className="input" value={lForm.notes} onChange={e=>setLForm(p=>({...p,notes:e.target.value}))} placeholder="How was your day? What did you learn?" style={{minHeight:80,resize:"vertical"}}/></Field>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button className="btn btn-outline" onClick={()=>setLogModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveLog}>Save Entry</button>
          </div>
        </Modal>
      )}

      {profileModal&&(
        <Modal title="Edit Profile" onClose={()=>setProfileModal(false)}>
          <Field label="Display Name"><input className="input" value={pForm.name} onChange={e=>setPForm(p=>({...p,name:e.target.value}))} placeholder="Your name"/></Field>
          <Field label="Role / Title"><input className="input" value={pForm.role} onChange={e=>setPForm(p=>({...p,role:e.target.value}))} placeholder="e.g. MSc Statistics Student"/></Field>
          <Field label="Avatar">
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["👤","🧑","👨‍💻","🧑‍🎓","👨‍🔬","🦸","🧑‍💼","👩‍💻","🧑‍🏫"].map(e=>(
                <div key={e} onClick={()=>setPForm(p=>({...p,avatar:e}))}
                  style={{width:38,height:38,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",transition:"all 0.15s",background:pForm.avatar===e?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.04)",border:pForm.avatar===e?"1px solid #10b981":"1px solid transparent"}}>{e}</div>
              ))}
            </div>
          </Field>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button className="btn btn-outline" onClick={()=>setProfileModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
