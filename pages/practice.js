// pages/practice.js — ARK Practice: legal practice management (Phase 1)
import { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";

const NAVY = "#021A4A", NAVY2 = "#0B2A63", GOLD = "#C9A84C", CREAM = "#F5F0E8", CREAM2 = "#EDE6D8";
const LINE = "#E3D9C6", INK = "#1A1209", MUTED = "#7A6A55", WHITE = "#FFFFFF";
const OK = "#1E6B34", WARN = "#8A5A00", BAD = "#A11D1D";

const PRACTICE_AREAS = ["Civil Litigation","Criminal Defense","Family","Corporate & Commercial","Property & Real Estate","Banking & Finance","Tax","Labour & Employment","Constitutional","Intellectual Property","Immigration","Arbitration","Other"];

// ── helpers ────────────────────────────────────────────────────────────────
const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dayKey = (dt) => { const d = new Date(dt); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const fmtDate = (iso) => { if (!iso) return ""; const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso); return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); };
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
const toLocalInput = (iso) => { if (!iso) return ""; const d = new Date(iso); const p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes()); };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hms = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 3600)).padStart(2, "0") + ":" + String(Math.floor((s % 3600) / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: "currency", currency: cur || "USD", maximumFractionDigits: 2 }).format(Number(n) || 0); } catch { return (cur || "") + " " + (Number(n) || 0).toFixed(2); } };

function readSession() {
  try { const u = JSON.parse(localStorage.getItem("arklaw_user") || "null"); return u && u.sessionToken ? u : null; } catch { return null; }
}

// ── small UI pieces ────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const I = {
  dash: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
  matter: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
  contact: <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></>,
  cal: <><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></>,
  task: <><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M8 12l3 3 5-6"/></>,
  time: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></>,
  bill: <><path d="M6 2.5h9l3.5 3.5V21.5H6z"/><path d="M9.5 10h6M9.5 14h6M9.5 18h3"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  play: <><path d="M7 4.5v15l12-7.5z"/></>,
  stop: <><rect x="6" y="6" width="12" height="12" rx="1.5"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16 16"/></>,
  x: <><path d="M6 6l12 12M18 6 6 18"/></>,
  back: <><path d="M15 18l-6-6 6-6"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/></>,
  print: <><path d="M6 9V2.5h12V9M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7.5"/></>,
};

const Btn = ({ children, onClick, kind = "primary", small, disabled, type = "button", style }) => {
  const k = {
    primary: { background: NAVY, color: WHITE, border: "1px solid " + NAVY },
    gold:    { background: GOLD, color: NAVY, border: "1px solid " + GOLD },
    ghost:   { background: WHITE, color: INK, border: "1px solid " + LINE },
    danger:  { background: WHITE, color: BAD, border: "1px solid #F2BDBD" },
  }[kind];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...k, padding: small ? "6px 11px" : "9px 16px", borderRadius: 9, fontSize: small ? 12 : 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", whiteSpace: "nowrap", ...style }}>
      {children}
    </button>
  );
};

const TONES = {
  open: [OK, "#ECF7EF", "#B7DFC2"], paid: [OK, "#ECF7EF", "#B7DFC2"], done: [OK, "#ECF7EF", "#B7DFC2"],
  pending: [WARN, "#FFF6E3", "#F1D8A0"], sent: [WARN, "#FFF6E3", "#F1D8A0"], in_progress: [WARN, "#FFF6E3", "#F1D8A0"], high: [BAD, "#FDECEC", "#F2BDBD"],
  overdue: [BAD, "#FDECEC", "#F2BDBD"], hearing: [BAD, "#FDECEC", "#F2BDBD"], deadline: [WARN, "#FFF6E3", "#F1D8A0"],
  closed: [MUTED, "#F1EEE8", "#DDD4C6"], void: [MUTED, "#F1EEE8", "#DDD4C6"], draft: [NAVY, "#EAF0FB", "#C5D3EE"], todo: [NAVY, "#EAF0FB", "#C5D3EE"],
  meeting: [NAVY, "#EAF0FB", "#C5D3EE"], other: [MUTED, "#F1EEE8", "#DDD4C6"], low: [MUTED, "#F1EEE8", "#DDD4C6"], normal: [NAVY, "#EAF0FB", "#C5D3EE"],
};
const Badge = ({ v, label }) => {
  const t = TONES[v] || [MUTED, "#F1EEE8", "#DDD4C6"];
  return <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase", color: t[0], background: t[1], border: "1px solid " + t[2], borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>{label || String(v || "").replace("_", " ")}</span>;
};

const Card = ({ children, style, pad = 18 }) => <div style={{ background: WHITE, border: "1px solid " + LINE, borderRadius: 14, padding: pad, boxShadow: "0 1px 2px rgba(2,26,74,0.04)", ...style }}>{children}</div>;
const H2 = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
    <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, color: INK, margin: 0 }}>{children}</h2>{right}
  </div>
);
const Empty = ({ text, action }) => (
  <div style={{ textAlign: "center", padding: "34px 16px", color: MUTED, fontSize: 13.5 }}>
    <div style={{ marginBottom: action ? 12 : 0 }}>{text}</div>{action}
  </div>
);

const inputStyle = { width: "100%", padding: "9px 11px", border: "1px solid " + LINE, borderRadius: 9, fontSize: 13.5, background: "#FFFDF8", color: INK, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.6px", textTransform: "uppercase", color: MUTED, marginBottom: 5 };

function Field({ f, value, onChange }) {
  const v = value == null ? "" : value;
  let input;
  if (f.type === "select") input = (
    <select value={v} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      {(f.blank !== false) && <option value="">{f.blank || "Select..."}</option>}
      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  else if (f.type === "textarea") input = <textarea value={v} onChange={(e) => onChange(e.target.value)} rows={f.rows || 3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} placeholder={f.placeholder} />;
  else if (f.type === "checkbox") input = (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: INK, cursor: "pointer", paddingTop: 6 }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: NAVY }} />{f.checkLabel}
    </label>
  );
  else input = <input type={f.type || "text"} value={v} step={f.step} min={f.min} onChange={(e) => onChange(e.target.value)} style={inputStyle} placeholder={f.placeholder} />;
  return (
    <div style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
      {f.type !== "checkbox" && <label style={labelStyle}>{f.label}{f.required ? " *" : ""}</label>}
      {f.type === "checkbox" && <label style={labelStyle}>{f.label}</label>}
      {input}
      {f.hint && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>{f.hint}</div>}
    </div>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, background: "rgba(2,16,46,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 14, backdropFilter: "blur(2px)" }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ background: CREAM, borderRadius: 16, width: "100%", maxWidth: wide ? 820 : 600, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg," + NAVY + "," + NAVY2 + ")", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "2px solid " + GOLD }}>
          <div style={{ flex: 1, color: WHITE, fontWeight: 800, fontSize: 15 }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ background: "rgba(255,255,255,0.12)", border: "none", color: WHITE, width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={I.x} size={15} /></button>
        </div>
        <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: "12px 18px", borderTop: "1px solid " + LINE, background: CREAM2, display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>{footer}</div>}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <Card pad={16} style={{ flex: "1 1 180px", minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.7px", textTransform: "uppercase", color: MUTED }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, fontWeight: 700, color: tone || NAVY, margin: "6px 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: MUTED }}>{sub}</div>}
    </Card>
  );
}

const th = { textAlign: "left", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px", textTransform: "uppercase", color: MUTED, padding: "9px 10px", borderBottom: "1px solid " + LINE, whiteSpace: "nowrap" };
const td = { padding: "11px 10px", borderBottom: "1px solid #F0E9DC", fontSize: 13.5, color: INK, verticalAlign: "top" };

// ── form specs ─────────────────────────────────────────────────────────────
function specs(data) {
  const matterOpts = data.matters.map((m) => ({ value: m.id, label: m.number + " · " + m.title }));
  const clientOpts = data.contacts.map((c) => ({ value: c.id, label: c.name + (c.company ? " (" + c.company + ")" : "") }));
  return {
    contacts: { title: "Contact", fields: [
      { k: "name", label: "Full name / organisation", required: true, full: true },
      { k: "type", label: "Type", type: "select", blank: false, options: [{ value: "person", label: "Person" }, { value: "company", label: "Company" }] },
      { k: "is_client", label: "Client", type: "checkbox", checkLabel: "This contact is a client" },
      { k: "email", label: "Email", type: "email" }, { k: "phone", label: "Phone" },
      { k: "company", label: "Company" }, { k: "tags", label: "Tags", placeholder: "e.g. witness, referral" },
      { k: "address", label: "Address", full: true }, { k: "notes", label: "Notes", type: "textarea", full: true },
    ], defaults: { type: "person", is_client: true } },
    matters: { title: "Matter", fields: [
      { k: "title", label: "Matter title", required: true, full: true, placeholder: "e.g. Ahmed v. City Developers" },
      { k: "client_id", label: "Client", type: "select", options: clientOpts, blank: "No client yet" },
      { k: "practice_area", label: "Practice area", type: "select", options: PRACTICE_AREAS.map((p) => ({ value: p, label: p })) },
      { k: "status", label: "Status", type: "select", blank: false, options: [{ value: "open", label: "Open" }, { value: "pending", label: "Pending" }, { value: "closed", label: "Closed" }] },
      { k: "responsible", label: "Responsible lawyer" },
      { k: "court", label: "Court / forum" }, { k: "case_no", label: "Case / suit number" },
      { k: "opposing_party", label: "Opposing party", hint: "Checked against your contacts for conflicts" }, { k: "opposing_counsel", label: "Opposing counsel" },
      { k: "billing_method", label: "Billing method", type: "select", blank: false, options: [{ value: "hourly", label: "Hourly" }, { value: "flat", label: "Flat fee" }, { value: "contingency", label: "Contingency" }] },
      { k: "rate", label: "Hourly rate", type: "number", step: "0.01", min: "0" },
      { k: "flat_fee", label: "Flat fee", type: "number", step: "0.01", min: "0" },
      { k: "open_date", label: "Open date", type: "date" }, { k: "close_date", label: "Close date", type: "date" },
      { k: "description", label: "Description / scope", type: "textarea", full: true },
    ], defaults: { status: "open", billing_method: "hourly", open_date: todayISO() } },
    events: { title: "Calendar event", fields: [
      { k: "title", label: "Title", required: true, full: true, placeholder: "e.g. Hearing — bail application" },
      { k: "type", label: "Type", type: "select", blank: false, options: [{ value: "hearing", label: "Hearing" }, { value: "meeting", label: "Meeting" }, { value: "deadline", label: "Deadline" }, { value: "other", label: "Other" }] },
      { k: "matter_id", label: "Matter", type: "select", options: matterOpts, blank: "Not linked to a matter" },
      { k: "start_at", label: "Starts", type: "datetime-local", required: true }, { k: "end_at", label: "Ends", type: "datetime-local" },
      { k: "location", label: "Location / court room", full: true }, { k: "notes", label: "Notes", type: "textarea", full: true },
    ], defaults: { type: "meeting" } },
    tasks: { title: "Task", fields: [
      { k: "title", label: "Task", required: true, full: true },
      { k: "matter_id", label: "Matter", type: "select", options: matterOpts, blank: "Not linked to a matter" },
      { k: "due_date", label: "Due date", type: "date" },
      { k: "priority", label: "Priority", type: "select", blank: false, options: [{ value: "low", label: "Low" }, { value: "normal", label: "Normal" }, { value: "high", label: "High" }] },
      { k: "status", label: "Status", type: "select", blank: false, options: [{ value: "todo", label: "To do" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Done" }] },
      { k: "description", label: "Details", type: "textarea", full: true },
    ], defaults: { priority: "normal", status: "todo" } },
    time: { title: "Time / expense entry", fields: [
      { k: "matter_id", label: "Matter", type: "select", options: matterOpts, required: true, full: true },
      { k: "kind", label: "Entry type", type: "select", blank: false, options: [{ value: "time", label: "Time" }, { value: "expense", label: "Expense" }] },
      { k: "date", label: "Date", type: "date" },
      { k: "description", label: "Description", required: true, full: true, placeholder: "e.g. Drafted written statement" },
      { k: "hours", label: "Hours", type: "number", step: "0.1", min: "0", showIf: (r) => r.kind !== "expense" },
      { k: "rate", label: "Rate / hour", type: "number", step: "0.01", min: "0", showIf: (r) => r.kind !== "expense" },
      { k: "amount", label: "Amount", type: "number", step: "0.01", min: "0", showIf: (r) => r.kind === "expense" },
      { k: "billable", label: "Billable", type: "checkbox", checkLabel: "Bill this to the client" },
    ], defaults: { kind: "time", date: todayISO(), billable: true } },
  };
}

// ── page ───────────────────────────────────────────────────────────────────
export default function Practice() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  const [data, setData] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [view, setView] = useState("dashboard");
  const [matterId, setMatterId] = useState(null);
  const [modal, setModal] = useState(null);         // {kind, r?, row?, ...}
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timer, setTimer] = useState(null);         // {matterId, description, startedAt}
  const [, setTick] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth < 860);
    onR(); window.addEventListener("resize", onR);
    setSession(readSession());
    try { const t = JSON.parse(localStorage.getItem("arkpm_timer") || "null"); if (t && t.startedAt) setTimer(t); } catch {}
    setBooting(false);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const notify = (msg, bad) => { setToast({ msg, bad }); setTimeout(() => setToast(null), 3200); };

  const api = useCallback(async (method, body) => {
    const r = await fetch("/api/practice", {
      method,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + (session && session.sessionToken) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { setSession(null); throw new Error("Your session expired. Please sign in again."); }
    if (!r.ok) throw new Error(j.error || "Something went wrong");
    return j;
  }, [session]);

  const load = useCallback(async () => {
    setLoadErr("");
    try { setData(await api("GET")); } catch (e) { setLoadErr(e.message); }
  }, [api]);

  useEffect(() => { if (session) load(); }, [session, load]);

  // ── mutations ──
  const upsert = async (r, row, id) => {
    const res = id ? await api("PATCH", { r, id, data: row }) : await api("POST", { r, data: row });
    setData((d) => ({ ...d, [r]: id ? d[r].map((x) => (x.id === id ? res.row : x)) : [res.row, ...d[r]] }));
    return res.row;
  };
  const remove = async (r, id) => {
    await api("DELETE", { r, id });
    setData((d) => ({ ...d, [r]: d[r].filter((x) => x.id !== id) }));
  };
  const action = async (name, payload) => {
    const res = await api("POST", { action: name, ...payload });
    await load();
    return res.row;
  };

  // ── timer ──
  const startTimer = (mId, description) => {
    if (!mId) return notify("Choose a matter before starting the timer", true);
    const t = { matterId: mId, description: description || "", startedAt: Date.now() };
    setTimer(t); try { localStorage.setItem("arkpm_timer", JSON.stringify(t)); } catch {}
  };
  const stopTimer = () => {
    if (!timer) return;
    const hours = Math.max(0.1, Math.ceil(((Date.now() - timer.startedAt) / 3600000) * 10) / 10);
    const m = data && data.matters.find((x) => x.id === timer.matterId);
    setModal({ kind: "form", r: "time", row: { kind: "time", date: todayISO(), billable: true, matter_id: timer.matterId, description: timer.description, hours, rate: m ? m.rate : (data && data.settings.default_rate) } });
    setTimer(null); try { localStorage.removeItem("arkpm_timer"); } catch {}
  };

  // ── sign in ──
  if (booting) return null;
  if (!session) return <SignIn onDone={(u) => { setSession(u); }} />;

  const cur = data ? data.settings.currency : "USD";
  const S = data ? specs(data) : null;
  const byId = (arr, id) => (arr || []).find((x) => x.id === id);
  const openForm = (r, row) => setModal({ kind: "form", r, row: row || null });
  const goMatter = (id) => { setMatterId(id); setView("matter"); window.scrollTo(0, 0); };

  const nav = [
    ["dashboard", "Dashboard", I.dash], ["matters", "Matters", I.matter], ["contacts", "Contacts", I.contact],
    ["calendar", "Calendar", I.cal], ["tasks", "Tasks", I.task], ["time", "Time & Expenses", I.time],
    ["billing", "Billing", I.bill], ["settings", "Settings", I.gear],
  ];

  const timerMatter = timer && data && byId(data.matters, timer.matterId);

  return (
    <>
      <Head>
        <title>ARK Practice — Legal Practice Management | ARK LAW AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{"html,body{margin:0;background:" + CREAM + ";font-family:'DM Sans',system-ui,sans-serif;color:" + INK + "}*{box-sizing:border-box}button:focus-visible,input:focus,select:focus,textarea:focus{outline:2px solid " + GOLD + ";outline-offset:1px}.arkrow:hover{background:#FBF7EE}@media print{.noprint{display:none!important}}"}</style>

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside className="noprint" style={{ width: isMobile ? "100%" : 228, flexShrink: 0, background: "linear-gradient(180deg," + NAVY + ",#03133A)", color: WHITE, position: isMobile ? "static" : "sticky", top: 0, height: isMobile ? "auto" : "100vh", zIndex: 50, display: "flex", flexDirection: isMobile ? "column" : "column", borderRight: isMobile ? "none" : "1px solid #0E2D66" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: isMobile ? "10px 14px" : "18px 18px 14px", textDecoration: "none", borderBottom: "1px solid rgba(201,168,76,0.25)" }}>
            <img src="/ark-logo-us.png" alt="" style={{ width: 32, height: 32, objectFit: "contain", filter: "brightness(1.15)" }} />
            <div>
              <div style={{ color: WHITE, fontWeight: 800, letterSpacing: "1px", fontSize: 13.5 }}>ARK PRACTICE</div>
              <div style={{ color: GOLD, fontSize: 10.5, letterSpacing: "0.6px" }}>by ARK LAW AI</div>
            </div>
          </a>
          <nav style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 2, padding: isMobile ? "6px 8px" : "12px 10px", overflowX: isMobile ? "auto" : "visible", flex: isMobile ? "none" : 1 }}>
            {nav.map(([id, label, icon]) => {
              const active = view === id || (id === "matters" && view === "matter");
              return (
                <button key={id} onClick={() => { setView(id); window.scrollTo(0, 0); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: isMobile ? "8px 11px" : "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", textAlign: "left", background: active ? "rgba(201,168,76,0.16)" : "transparent", color: active ? GOLD : "rgba(255,255,255,0.78)", boxShadow: active && !isMobile ? "inset 3px 0 0 " + GOLD : "none" }}>
                  <Icon d={icon} size={16} />{label}
                </button>
              );
            })}
          </nav>
          {!isMobile && (
            <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12 }}>
              <div style={{ color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>Signed in as</div>
              <div style={{ color: WHITE, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name || session.email}</div>
              <button onClick={() => { try { localStorage.removeItem("arklaw_user"); } catch {} setSession(null); setData(null); }} style={{ marginTop: 8, background: "none", border: "none", color: GOLD, padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>Sign out</button>
            </div>
          )}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Top bar */}
          <div className="noprint" style={{ display: "flex", alignItems: "center", gap: 10, padding: isMobile ? "10px 12px" : "12px 24px", borderBottom: "1px solid " + LINE, background: "rgba(245,240,232,0.92)", backdropFilter: "blur(6px)", position: "sticky", top: 0, zIndex: 40, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 140px", maxWidth: 420, minWidth: 0 }}>
              <span style={{ position: "absolute", left: 10, top: 9, color: MUTED }}><Icon d={I.search} size={15} /></span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search matters, contacts, invoices..." style={{ ...inputStyle, paddingLeft: 32, background: WHITE }} />
              {query.trim() && data && <SearchResults q={query} data={data} onPick={(t, id) => { setQuery(""); if (t === "matter") goMatter(id); else if (t === "contact") setModal({ kind: "contact", id }); else setModal({ kind: "invoice", id }); }} />}
            </div>
            {!isMobile && <div style={{ flex: 1 }} />}
            {timer ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: NAVY, color: WHITE, padding: "6px 6px 6px 12px", borderRadius: 999 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E5484D", boxShadow: "0 0 0 3px rgba(229,72,77,0.25)" }} />
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800, fontSize: 13 }}>{hms(Date.now() - timer.startedAt)}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{timerMatter ? timerMatter.number : ""}</span>
                <button onClick={stopTimer} style={{ background: GOLD, color: NAVY, border: "none", borderRadius: 999, padding: "5px 11px", fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}><Icon d={I.stop} size={12} />Stop</button>
              </div>
            ) : (
              <Btn kind="ghost" small onClick={() => setModal({ kind: "timer" })}><Icon d={I.play} size={13} />Start timer</Btn>
            )}
            <NewMenu onPick={(r) => openForm(r)} />
          </div>

          <div style={{ padding: isMobile ? 12 : "22px 24px 60px", maxWidth: 1240 }}>
            {loadErr && (
              <Card style={{ borderColor: "#F2BDBD", background: "#FFF7F7", marginBottom: 16 }}>
                <div style={{ color: BAD, fontWeight: 700, marginBottom: 6 }}>Could not load ARK Practice</div>
                <div style={{ fontSize: 13.5, color: INK, marginBottom: 10 }}>{loadErr}</div>
                <Btn small onClick={load}>Try again</Btn>
              </Card>
            )}
            {!data && !loadErr && <div style={{ padding: 60, textAlign: "center", color: MUTED }}>Loading your practice...</div>}

            {data && view === "dashboard" && <Dashboard data={data} cur={cur} goMatter={goMatter} setView={setView} openForm={openForm} upsert={upsert} notify={notify} />}
            {data && view === "matters" && <Matters data={data} goMatter={goMatter} openForm={openForm} />}
            {data && view === "matter" && byId(data.matters, matterId) && (
              <MatterDetail m={byId(data.matters, matterId)} data={data} cur={cur} back={() => setView("matters")} openForm={openForm} setModal={setModal}
                upsert={upsert} startTimer={startTimer} timer={timer} notify={notify} />
            )}
            {data && view === "contacts" && <Contacts data={data} openForm={openForm} setModal={setModal} />}
            {data && view === "calendar" && <Calendar data={data} openForm={openForm} goMatter={goMatter} isMobile={isMobile} />}
            {data && view === "tasks" && <Tasks data={data} openForm={openForm} upsert={upsert} notify={notify} goMatter={goMatter} />}
            {data && view === "time" && <TimeView data={data} cur={cur} openForm={openForm} goMatter={goMatter} />}
            {data && view === "billing" && <Billing data={data} cur={cur} setModal={setModal} goMatter={goMatter} />}
            {data && view === "settings" && <Settings data={data} action={action} notify={notify} />}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modal && modal.kind === "form" && S && (
        <FormModal spec={S[modal.r]} r={modal.r} row={modal.row} data={data} onClose={() => setModal(null)}
          onSave={async (row) => { const saved = await upsert(modal.r, row, modal.row && modal.row.id); setModal(null); notify(S[modal.r].title + " saved"); if (modal.r === "matters" && !(modal.row && modal.row.id)) goMatter(saved.id); }}
          onDelete={modal.row && modal.row.id ? async () => { await remove(modal.r, modal.row.id); setModal(null); notify(S[modal.r].title + " deleted"); if (modal.r === "matters") setView("matters"); } : null} />
      )}
      {modal && modal.kind === "timer" && data && (
        <TimerStart data={data} onClose={() => setModal(null)} onStart={(mId, desc) => { startTimer(mId, desc); setModal(null); }} />
      )}
      {modal && modal.kind === "contact" && data && byId(data.contacts, modal.id) && (
        <ContactCard c={byId(data.contacts, modal.id)} data={data} cur={cur} onClose={() => setModal(null)} onEdit={() => openForm("contacts", byId(data.contacts, modal.id))} goMatter={(id) => { setModal(null); goMatter(id); }} />
      )}
      {modal && modal.kind === "newInvoice" && data && (
        <NewInvoice data={data} cur={cur} preMatter={modal.matterId} onClose={() => setModal(null)}
          onCreate={async (payload) => { const inv = await action("create_invoice", payload); notify("Invoice " + inv.number + " created"); setModal({ kind: "invoice", id: inv.id }); }} />
      )}
      {modal && modal.kind === "invoice" && data && byId(data.invoices, modal.id) && (
        <InvoiceView inv={byId(data.invoices, modal.id)} data={data} onClose={() => setModal(null)} action={action} upsert={upsert} notify={notify} />
      )}

      {toast && (
        <div className="noprint" style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: toast.bad ? BAD : NAVY, color: WHITE, padding: "10px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, zIndex: 2000, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", borderLeft: "4px solid " + (toast.bad ? "#FFB4B4" : GOLD) }}>{toast.msg}</div>
      )}
    </>
  );
}

// ── Sign in ────────────────────────────────────────────────────────────────
function SignIn({ onDone }) {
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Sign in failed");
      if (!j.user || !j.user.sessionToken) throw new Error("ARK Practice is not enabled on this server yet (no session token). Make sure the latest login.js is deployed.");
      try { localStorage.setItem("arklaw_user", JSON.stringify(j.user)); } catch {}
      onDone(j.user);
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 10%, #0E2D66, " + NAVY + " 55%, #010E2A)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <Head><title>Sign in — ARK Practice</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" /></Head>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 400, background: CREAM, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ padding: "26px 26px 18px", textAlign: "center", borderBottom: "2px solid " + GOLD, background: WHITE }}>
          <img src="/ark-logo-us.png" alt="ARK LAW AI" style={{ width: 54, height: 54, objectFit: "contain" }} />
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, color: NAVY, marginTop: 6 }}>ARK Practice</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>Matters, calendar, time and billing in one place</div>
        </div>
        <div style={{ padding: 24, display: "grid", gap: 12 }}>
          <div><label style={labelStyle}>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" /></div>
          <div><label style={labelStyle}>Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="current-password" /></div>
          {err && <div style={{ fontSize: 13, color: BAD, background: "#FDECEC", border: "1px solid #F2BDBD", borderRadius: 8, padding: "8px 10px" }}>{err}</div>}
          <Btn type="submit" disabled={busy} style={{ justifyContent: "center", padding: "11px 16px" }}>{busy ? "Signing in..." : "Sign in with your ARK LAW AI account"}</Btn>
          <div style={{ fontSize: 12.5, color: MUTED, textAlign: "center" }}>No account yet? <a href="/" style={{ color: NAVY, fontWeight: 700 }}>Create one on ARK LAW AI</a></div>
        </div>
      </form>
    </div>
  );
}

// ── top bar widgets ────────────────────────────────────────────────────────
function NewMenu({ onPick }) {
  const [open, setOpen] = useState(false);
  const items = [["matters", "Matter"], ["contacts", "Contact"], ["time", "Time entry"], ["tasks", "Task"], ["events", "Calendar event"]];
  return (
    <div style={{ position: "relative" }}>
      <Btn small kind="gold" onClick={() => setOpen((o) => !o)}><Icon d={I.plus} size={14} sw={2.5} />New</Btn>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: WHITE, border: "1px solid " + LINE, borderRadius: 11, boxShadow: "0 14px 40px rgba(2,26,74,0.16)", zIndex: 61, minWidth: 180, overflow: "hidden" }}>
            {items.map(([r, label]) => (
              <button key={r} onClick={() => { setOpen(false); onPick(r); }} className="arkrow"
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13.5, fontFamily: "inherit", color: INK }}>{label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SearchResults({ q, data, onPick }) {
  const s = q.trim().toLowerCase();
  const hit = (...v) => v.some((x) => String(x || "").toLowerCase().includes(s));
  const res = [
    ...data.matters.filter((m) => hit(m.title, m.number, m.case_no, m.opposing_party)).slice(0, 6).map((m) => ["matter", m.id, m.number + " · " + m.title, "Matter"]),
    ...data.contacts.filter((c) => hit(c.name, c.email, c.company, c.phone)).slice(0, 6).map((c) => ["contact", c.id, c.name, c.is_client ? "Client" : "Contact"]),
    ...data.invoices.filter((i) => hit(i.number)).slice(0, 4).map((i) => ["invoice", i.id, i.number, "Invoice"]),
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", background: WHITE, border: "1px solid " + LINE, borderRadius: 11, boxShadow: "0 14px 40px rgba(2,26,74,0.16)", zIndex: 70, overflow: "hidden" }}>
      {res.length === 0 && <div style={{ padding: 12, fontSize: 13, color: MUTED }}>No matches</div>}
      {res.map(([t, id, label, tag]) => (
        <button key={t + id} onClick={() => onPick(t, id)} className="arkrow" style={{ display: "flex", width: "100%", gap: 10, alignItems: "center", padding: "9px 12px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase", color: MUTED, width: 56 }}>{tag}</span>
          <span style={{ fontSize: 13.5, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── generic form modal ─────────────────────────────────────────────────────
function FormModal({ spec, r, row, data, onClose, onSave, onDelete }) {
  const [v, setV] = useState(() => ({ ...spec.defaults, ...(r === "time" && !row ? { rate: data.settings.default_rate } : {}), ...(r === "matters" && !row ? { rate: data.settings.default_rate } : {}), ...(row || {}) }));
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [confirmDel, setConfirmDel] = useState(false);
  const set = (k, val) => setV((p) => {
    const n = { ...p, [k]: val };
    if (r === "time" && k === "matter_id" && !(row && row.id)) { const m = data.matters.find((x) => x.id === val); if (m && Number(m.rate) > 0) n.rate = m.rate; }
    return n;
  });

  const conflicts = useMemo(() => {
    if (r !== "matters") return [];
    const name = String(v.opposing_party || "").trim().toLowerCase();
    if (name.length < 3) return [];
    const words = name.split(/\s+/).filter((w) => w.length > 2);
    const match = (s) => { const t = String(s || "").toLowerCase(); return t.includes(name) || (words.length > 1 && words.every((w) => t.includes(w))); };
    return [
      ...data.contacts.filter((c) => match(c.name) || match(c.company)).map((c) => (c.is_client ? "Client" : "Contact") + ": " + c.name),
      ...data.matters.filter((m) => m.id !== v.id && (match(m.title))).map((m) => "Matter: " + m.number + " " + m.title),
    ].slice(0, 6);
  }, [r, v.opposing_party, v.id, data]);

  const fields = spec.fields.filter((f) => !f.showIf || f.showIf(v));
  const save = async () => {
    setErr("");
    for (const f of fields) if (f.required && (v[f.k] === undefined || v[f.k] === null || String(v[f.k]).trim() === "")) return setErr(f.label + " is required");
    const out = {};
    for (const f of spec.fields) if (f.k in v) out[f.k] = v[f.k];
    if (r === "events") {
      out.start_at = v.start_at ? new Date(v.start_at).toISOString() : null;
      out.end_at = v.end_at ? new Date(v.end_at).toISOString() : null;
    }
    if (r === "time" && out.kind === "expense") { out.hours = 0; out.rate = 0; }
    setBusy(true);
    try { await onSave(out); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const shown = { ...v };
  if (r === "events") { shown.start_at = v.start_at && v.start_at.length > 16 ? toLocalInput(v.start_at) : v.start_at; shown.end_at = v.end_at && v.end_at.length > 16 ? toLocalInput(v.end_at) : v.end_at; }
  const locked = r === "time" && row && row.invoice_id;

  return (
    <Modal title={(row && row.id ? "Edit " : "New ") + spec.title.toLowerCase()} onClose={onClose}
      footer={<>
        {onDelete && !confirmDel && <Btn kind="danger" small onClick={() => setConfirmDel(true)} style={{ marginRight: "auto" }} disabled={locked}><Icon d={I.trash} size={13} />Delete</Btn>}
        {onDelete && confirmDel && <Btn kind="danger" small style={{ marginRight: "auto" }} onClick={async () => { setBusy(true); try { await onDelete(); } catch (e) { setErr(e.message); setConfirmDel(false); } setBusy(false); }}>Confirm delete</Btn>}
        <Btn kind="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={busy || locked}>{busy ? "Saving..." : "Save"}</Btn>
      </>}>
      {locked && <div style={{ fontSize: 13, color: WARN, background: "#FFF6E3", border: "1px solid #F1D8A0", borderRadius: 9, padding: "9px 11px", marginBottom: 12 }}>This entry is on an invoice. Void that invoice to edit or delete it.</div>}
      {r === "matters" && conflicts.length > 0 && (
        <div style={{ marginBottom: 14, border: "1px solid #F2BDBD", background: "#FDECEC", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontWeight: 800, color: BAD, fontSize: 13, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Icon d={I.shield} size={14} />Possible conflict of interest</div>
          {conflicts.map((c, i) => <div key={i} style={{ fontSize: 13, color: INK }}>{c}</div>)}
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>The opposing party matches existing records. Review before accepting this matter.</div>
        </div>
      )}
      {r === "matters" && conflicts.length === 0 && String(v.opposing_party || "").trim().length >= 3 && (
        <div style={{ marginBottom: 14, fontSize: 12.5, color: OK, display: "flex", alignItems: "center", gap: 6 }}><Icon d={I.shield} size={14} />No conflicts found in your contacts or matters.</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 13 }}>
        {fields.map((f) => <Field key={f.k} f={f} value={shown[f.k]} onChange={(val) => set(f.k, val)} />)}
      </div>
      {r === "time" && v.kind !== "expense" && (
        <div style={{ marginTop: 12, fontSize: 13, color: MUTED }}>Amount: <b style={{ color: INK }}>{money((Number(v.hours) || 0) * (Number(v.rate) || 0), data.settings.currency)}</b></div>
      )}
      {err && <div style={{ marginTop: 12, fontSize: 13, color: BAD }}>{err}</div>}
    </Modal>
  );
}

function TimerStart({ data, onClose, onStart }) {
  const open = data.matters.filter((m) => m.status !== "closed");
  const [mId, setM] = useState(open[0] ? open[0].id : ""), [desc, setDesc] = useState("");
  return (
    <Modal title="Start timer" onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onStart(mId, desc)} disabled={!mId}><Icon d={I.play} size={13} />Start</Btn></>}>
      {open.length === 0 ? <Empty text="Create a matter first, then track time against it." /> : (
        <div style={{ display: "grid", gap: 13 }}>
          <Field f={{ label: "Matter", type: "select", blank: false, options: open.map((m) => ({ value: m.id, label: m.number + " · " + m.title })) }} value={mId} onChange={setM} />
          <Field f={{ label: "What are you working on?", placeholder: "e.g. Research on limitation period" }} value={desc} onChange={setDesc} />
          <div style={{ fontSize: 12.5, color: MUTED }}>The timer keeps running if you switch pages or close the tab. Stop it to save a time entry.</div>
        </div>
      )}
    </Modal>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ data, cur, goMatter, setView, openForm, upsert, notify }) {
  const today = todayISO();
  const openMatters = data.matters.filter((m) => m.status !== "closed");
  const unbilled = data.time.filter((t) => t.billable && !t.invoice_id);
  const unbilledAmt = unbilled.reduce((s, t) => s + Number(t.amount), 0);
  const outstanding = data.invoices.filter((i) => i.status === "sent" || (i.status === "draft"));
  const outstandingAmt = outstanding.reduce((s, i) => s + Number(i.total) - Number(i.amount_paid), 0);
  const monthStart = today.slice(0, 8) + "01";
  const hoursMonth = data.time.filter((t) => t.kind === "time" && t.date >= monthStart).reduce((s, t) => s + Number(t.hours), 0);
  const collectedMonth = data.invoices.reduce((s, i) => s + (i.payments || []).filter((p) => p.date >= monthStart).reduce((a, p) => a + Number(p.amount), 0), 0);
  const upcoming = data.events.filter((e) => dayKey(e.start_at) >= today).slice(0, 7);
  const dueTasks = data.tasks.filter((t) => t.status !== "done").sort((a, b) => String(a.due_date || "9999").localeCompare(String(b.due_date || "9999"))).slice(0, 7);
  const mName = (id) => { const m = data.matters.find((x) => x.id === id); return m ? m.number + " · " + m.title : ""; };

  const isNew = data.matters.length === 0 && data.contacts.length === 0;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, color: MUTED, fontWeight: 700 }}>{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: NAVY, margin: "2px 0 0" }}>{data.settings.firm_name || "Your practice"}</h1>
      </div>

      {isNew && (
        <Card style={{ marginBottom: 18, background: "linear-gradient(135deg," + NAVY + "," + NAVY2 + ")", border: "none", color: WHITE }}>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, marginBottom: 6 }}>Welcome to ARK Practice</div>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", marginBottom: 14, maxWidth: 620 }}>Start by adding a client, open a matter for them, then track time and send your first invoice. Your firm name, currency and default rate are in Settings.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn kind="gold" small onClick={() => openForm("contacts")}>1. Add a client</Btn>
            <Btn kind="ghost" small onClick={() => openForm("matters")}>2. Open a matter</Btn>
            <Btn kind="ghost" small onClick={() => setView("settings")}>Firm settings</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <Stat label="Open matters" value={openMatters.length} sub={data.matters.length + " total"} />
        <Stat label="Unbilled work" value={money(unbilledAmt, cur)} sub={unbilled.length + " entries ready to invoice"} tone="#8A6A1E" />
        <Stat label="Outstanding" value={money(outstandingAmt, cur)} sub={outstanding.length + " unpaid invoices"} tone={outstandingAmt > 0 ? WARN : NAVY} />
        <Stat label="This month" value={hoursMonth.toFixed(1) + " h"} sub={money(collectedMonth, cur) + " collected"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
        <Card>
          <H2 right={<Btn kind="ghost" small onClick={() => setView("calendar")}>Calendar</Btn>}>Upcoming</H2>
          {upcoming.length === 0 ? <Empty text="No upcoming hearings or meetings." action={<Btn small kind="ghost" onClick={() => openForm("events")}>Add event</Btn>} /> : upcoming.map((e) => (
            <div key={e.id} className="arkrow" onClick={() => openForm("events", e)} style={{ display: "flex", gap: 12, padding: "10px 6px", borderBottom: "1px solid #F0E9DC", cursor: "pointer", borderRadius: 6 }}>
              <div style={{ width: 46, textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase" }}>{new Date(e.start_at).toLocaleDateString(undefined, { month: "short" })}</div>
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 21, color: NAVY, lineHeight: 1 }}>{new Date(e.start_at).getDate()}</div>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>{e.title}<Badge v={e.type} /></div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{e.all_day ? "All day" : fmtTime(e.start_at)}{e.location ? " · " + e.location : ""}{e.matter_id ? " · " + mName(e.matter_id) : ""}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <H2 right={<Btn kind="ghost" small onClick={() => setView("tasks")}>All tasks</Btn>}>Tasks due</H2>
          {dueTasks.length === 0 ? <Empty text="Nothing outstanding." action={<Btn small kind="ghost" onClick={() => openForm("tasks")}>Add task</Btn>} /> : dueTasks.map((t) => {
            const overdue = t.due_date && t.due_date < today;
            return (
              <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 4px", borderBottom: "1px solid #F0E9DC" }}>
                <input type="checkbox" checked={false} onChange={async () => { try { await upsert("tasks", { status: "done" }, t.id); notify("Task completed"); } catch (e) { notify(e.message, true); } }} style={{ marginTop: 3, width: 16, height: 16, accentColor: NAVY, cursor: "pointer" }} aria-label={"Complete " + t.title} />
                <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openForm("tasks", t)}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: overdue ? BAD : MUTED, marginTop: 2 }}>{t.due_date ? (overdue ? "Overdue · " : "Due ") + fmtDate(t.due_date) : "No due date"}{t.matter_id ? " · " + mName(t.matter_id) : ""}</div>
                </div>
                {t.priority === "high" && <Badge v="high" />}
              </div>
            );
          })}
        </Card>

        <Card>
          <H2 right={<Btn kind="ghost" small onClick={() => openForm("matters")}><Icon d={I.plus} size={13} />Matter</Btn>}>Recent matters</H2>
          {openMatters.length === 0 ? <Empty text="No open matters yet." /> : openMatters.slice(0, 6).map((m) => {
            const c = data.contacts.find((x) => x.id === m.client_id);
            return (
              <div key={m.id} className="arkrow" onClick={() => goMatter(m.id)} style={{ padding: "10px 6px", borderBottom: "1px solid #F0E9DC", cursor: "pointer", borderRadius: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 11.5, fontWeight: 800, color: GOLD }}>{m.number}</span><span style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span></div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{c ? c.name : "No client"}{m.practice_area ? " · " + m.practice_area : ""}</div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── Matters ────────────────────────────────────────────────────────────────
function Matters({ data, goMatter, openForm }) {
  const [status, setStatus] = useState("open");
  const list = data.matters.filter((m) => status === "all" || m.status === status);
  const unbilledBy = (id) => data.time.filter((t) => t.matter_id === id && t.billable && !t.invoice_id).reduce((s, t) => s + Number(t.amount), 0);
  return (
    <div>
      <H2 right={<Btn small onClick={() => openForm("matters")}><Icon d={I.plus} size={13} />New matter</Btn>}>Matters</H2>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["open", "pending", "closed", "all"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (status === s ? NAVY : LINE), background: status === s ? NAVY : WHITE, color: status === s ? WHITE : INK, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
            {s} ({s === "all" ? data.matters.length : data.matters.filter((m) => m.status === s).length})
          </button>
        ))}
      </div>
      <Card pad={0} style={{ overflowX: "auto" }}>
        {list.length === 0 ? <Empty text="No matters here." action={<Btn small onClick={() => openForm("matters")}>Open a matter</Btn>} /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead><tr><th style={th}>Matter</th><th style={th}>Client</th><th style={th}>Practice area</th><th style={th}>Court / case</th><th style={th}>Status</th><th style={{ ...th, textAlign: "right" }}>Unbilled</th></tr></thead>
            <tbody>{list.map((m) => {
              const c = data.contacts.find((x) => x.id === m.client_id);
              return (
                <tr key={m.id} className="arkrow" onClick={() => goMatter(m.id)} style={{ cursor: "pointer" }}>
                  <td style={td}><div style={{ fontSize: 11.5, fontWeight: 800, color: GOLD }}>{m.number}</div><div style={{ fontWeight: 700 }}>{m.title}</div></td>
                  <td style={td}>{c ? c.name : <span style={{ color: MUTED }}>None</span>}</td>
                  <td style={td}>{m.practice_area || <span style={{ color: MUTED }}>-</span>}</td>
                  <td style={td}>{m.court || "-"}{m.case_no ? <div style={{ fontSize: 12, color: MUTED }}>{m.case_no}</div> : null}</td>
                  <td style={td}><Badge v={m.status} /></td>
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(unbilledBy(m.id), data.settings.currency)}</td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function MatterDetail({ m, data, cur, back, openForm, setModal, upsert, startTimer, timer, notify }) {
  const [tab, setTab] = useState("overview");
  const c = data.contacts.find((x) => x.id === m.client_id);
  const time = data.time.filter((t) => t.matter_id === m.id);
  const tasks = data.tasks.filter((t) => t.matter_id === m.id);
  const events = data.events.filter((e) => e.matter_id === m.id);
  const invoices = data.invoices.filter((i) => i.matter_id === m.id);
  const unbilled = time.filter((t) => t.billable && !t.invoice_id);
  const unbilledAmt = unbilled.reduce((s, t) => s + Number(t.amount), 0);
  const billed = invoices.filter((i) => i.status !== "void").reduce((s, i) => s + Number(i.total), 0);
  const paid = invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
  const hours = time.filter((t) => t.kind === "time").reduce((s, t) => s + Number(t.hours), 0);
  const tabs = [["overview", "Overview"], ["time", "Time & expenses (" + time.length + ")"], ["tasks", "Tasks (" + tasks.filter((t) => t.status !== "done").length + ")"], ["events", "Calendar (" + events.length + ")"], ["invoices", "Invoices (" + invoices.length + ")"]];
  const row = (label, value) => value ? <div style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid #F0E9DC", fontSize: 13.5 }}><div style={{ width: 150, color: MUTED, flexShrink: 0 }}>{label}</div><div style={{ minWidth: 0, wordBreak: "break-word" }}>{value}</div></div> : null;

  return (
    <div>
      <button onClick={back} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, padding: 0, marginBottom: 10, fontFamily: "inherit" }}><Icon d={I.back} size={14} />All matters</button>
      <Card style={{ marginBottom: 14, borderTop: "3px solid " + GOLD }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 12, fontWeight: 800, color: GOLD }}>{m.number}</span><Badge v={m.status} />{m.practice_area && <span style={{ fontSize: 12, color: MUTED }}>{m.practice_area}</span>}</div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, color: NAVY, margin: "4px 0 2px" }}>{m.title}</h1>
            <div style={{ fontSize: 13.5, color: MUTED }}>{c ? <>Client: <b style={{ color: INK }}>{c.name}</b></> : "No client linked"}{m.court ? " · " + m.court : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!timer && m.status !== "closed" && <Btn small kind="gold" onClick={() => startTimer(m.id, "")}><Icon d={I.play} size={12} />Start timer</Btn>}
            <Btn small kind="ghost" onClick={() => openForm("time", { kind: "time", date: todayISO(), billable: true, matter_id: m.id, rate: m.rate })}><Icon d={I.plus} size={12} />Time</Btn>
            <Btn small kind="ghost" onClick={() => setModal({ kind: "newInvoice", matterId: m.id })} disabled={unbilled.length === 0 && !(m.billing_method === "flat" && Number(m.flat_fee) > 0)}><Icon d={I.bill} size={13} />Invoice</Btn>
            <Btn small kind="ghost" onClick={() => openForm("matters", m)}><Icon d={I.edit} size={12} />Edit</Btn>
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: "1px solid " + LINE }}>
          {[["Hours logged", hours.toFixed(1)], ["Unbilled", money(unbilledAmt, cur)], ["Billed", money(billed, cur)], ["Collected", money(paid, cur)], ["Balance due", money(billed - paid, cur)]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px", textTransform: "uppercase", color: MUTED }}>{l}</div><div style={{ fontWeight: 800, fontSize: 16, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{v}</div></div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid " + LINE, marginBottom: 14, overflowX: "auto" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "9px 13px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", color: tab === id ? NAVY : MUTED, borderBottom: "2px solid " + (tab === id ? GOLD : "transparent"), marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
          <Card>
            <H2>Matter details</H2>
            {row("Responsible", m.responsible)}{row("Court / forum", m.court)}{row("Case number", m.case_no)}
            {row("Opposing party", m.opposing_party)}{row("Opposing counsel", m.opposing_counsel)}
            {row("Billing", m.billing_method === "hourly" ? "Hourly at " + money(m.rate, cur) : m.billing_method === "flat" ? "Flat fee of " + money(m.flat_fee, cur) : "Contingency")}
            {row("Opened", fmtDate(m.open_date))}{row("Closed", m.close_date ? fmtDate(m.close_date) : "")}
            {m.description && <div style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.description}</div>}
          </Card>
          <Card>
            <H2>Client</H2>
            {c ? (<>{row("Name", c.name)}{row("Email", c.email)}{row("Phone", c.phone)}{row("Company", c.company)}{row("Address", c.address)}
              <div style={{ marginTop: 10 }}><Btn small kind="ghost" onClick={() => setModal({ kind: "contact", id: c.id })}>Open contact</Btn></div></>) : <Empty text="No client linked to this matter." action={<Btn small kind="ghost" onClick={() => openForm("matters", m)}>Link a client</Btn>} />}
          </Card>
        </div>
      )}
      {tab === "time" && <TimeTable entries={time} data={data} cur={cur} openForm={openForm} hideMatter add={() => openForm("time", { kind: "time", date: todayISO(), billable: true, matter_id: m.id, rate: m.rate })} />}
      {tab === "tasks" && <TaskList tasks={tasks} data={data} openForm={openForm} upsert={upsert} notify={notify} hideMatter add={() => openForm("tasks", { matter_id: m.id, priority: "normal", status: "todo" })} />}
      {tab === "events" && (
        <Card>
          <H2 right={<Btn small kind="ghost" onClick={() => openForm("events", { matter_id: m.id, type: "hearing" })}><Icon d={I.plus} size={12} />Event</Btn>}>Hearings and meetings</H2>
          {events.length === 0 ? <Empty text="No events on this matter." /> : events.map((e) => (
            <div key={e.id} className="arkrow" onClick={() => openForm("events", e)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 6px", borderBottom: "1px solid #F0E9DC", cursor: "pointer", flexWrap: "wrap" }}>
              <div style={{ width: 150, fontSize: 13, color: MUTED }}>{fmtDate(e.start_at)} {e.all_day ? "" : fmtTime(e.start_at)}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>{e.title}</div><Badge v={e.type} />
            </div>
          ))}
        </Card>
      )}
      {tab === "invoices" && <InvoiceTable invoices={invoices} data={data} setModal={setModal} hideMatter />}
    </div>
  );
}

// ── Contacts ───────────────────────────────────────────────────────────────
function Contacts({ data, openForm, setModal }) {
  const [filter, setFilter] = useState("all"), [conflictQ, setCQ] = useState("");
  const list = data.contacts.filter((c) => filter === "all" || (filter === "clients" ? c.is_client : !c.is_client));
  const cq = conflictQ.trim().toLowerCase();
  const hits = cq.length < 2 ? null : [
    ...data.contacts.filter((c) => [c.name, c.company, c.email].some((x) => String(x || "").toLowerCase().includes(cq))).map((c) => ({ id: c.id, t: "contact", label: c.name, sub: c.is_client ? "Existing client" : "Contact" + (c.tags ? " · " + c.tags : "") })),
    ...data.matters.filter((m) => [m.opposing_party, m.opposing_counsel, m.title].some((x) => String(x || "").toLowerCase().includes(cq))).map((m) => ({ id: m.id, t: "matter", label: m.number + " · " + m.title, sub: "Opposing: " + (m.opposing_party || "-") + (m.opposing_counsel ? " / " + m.opposing_counsel : "") })),
  ];
  return (
    <div>
      <H2 right={<Btn small onClick={() => openForm("contacts")}><Icon d={I.plus} size={13} />New contact</Btn>}>Contacts</H2>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, fontWeight: 800, color: NAVY, fontSize: 14 }}><Icon d={I.shield} size={16} color={GOLD} />Conflict check</div>
        <input value={conflictQ} onChange={(e) => setCQ(e.target.value)} placeholder="Type a prospective client or opposing party name" style={inputStyle} />
        {hits && (hits.length === 0
          ? <div style={{ marginTop: 10, fontSize: 13, color: OK, fontWeight: 700 }}>No matches in your contacts or matters.</div>
          : <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, color: BAD, fontWeight: 700, marginBottom: 6 }}>{hits.length} possible match{hits.length > 1 ? "es" : ""} — review before taking the matter</div>
              {hits.slice(0, 10).map((h) => (
                <div key={h.t + h.id} style={{ padding: "7px 0", borderBottom: "1px solid #F0E9DC", fontSize: 13.5 }}><b>{h.label}</b> <span style={{ color: MUTED }}>— {h.sub}</span></div>
              ))}
            </div>)}
      </Card>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["all", "All"], ["clients", "Clients"], ["others", "Other contacts"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (filter === k ? NAVY : LINE), background: filter === k ? NAVY : WHITE, color: filter === k ? WHITE : INK, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>
      <Card pad={0} style={{ overflowX: "auto" }}>
        {list.length === 0 ? <Empty text="No contacts yet." action={<Btn small onClick={() => openForm("contacts")}>Add a contact</Btn>} /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Phone</th><th style={th}>Matters</th><th style={th}>Type</th></tr></thead>
            <tbody>{list.map((c) => (
              <tr key={c.id} className="arkrow" onClick={() => setModal({ kind: "contact", id: c.id })} style={{ cursor: "pointer" }}>
                <td style={td}><b>{c.name}</b>{c.company && <div style={{ fontSize: 12, color: MUTED }}>{c.company}</div>}</td>
                <td style={td}>{c.email || "-"}</td><td style={td}>{c.phone || "-"}</td>
                <td style={td}>{data.matters.filter((m) => m.client_id === c.id).length}</td>
                <td style={td}>{c.is_client ? <Badge v="open" label="Client" /> : <Badge v="other" label={c.type} />}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function ContactCard({ c, data, cur, onClose, onEdit, goMatter }) {
  const matters = data.matters.filter((m) => m.client_id === c.id);
  const invoices = data.invoices.filter((i) => i.client_id === c.id && i.status !== "void");
  const due = invoices.reduce((s, i) => s + Number(i.total) - Number(i.amount_paid), 0);
  return (
    <Modal title={c.name} onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Close</Btn><Btn onClick={onEdit}><Icon d={I.edit} size={13} />Edit</Btn></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 14, fontSize: 13.5 }}>
        {[["Email", c.email], ["Phone", c.phone], ["Company", c.company], ["Tags", c.tags], ["Address", c.address], ["Balance due", money(due, cur)]].filter(([, v]) => v).map(([l, v]) => (
          <div key={l}><div style={labelStyle}>{l}</div><div style={{ wordBreak: "break-word" }}>{v}</div></div>
        ))}
      </div>
      {c.notes && <div style={{ fontSize: 13.5, whiteSpace: "pre-wrap", background: WHITE, border: "1px solid " + LINE, borderRadius: 10, padding: 12, marginBottom: 14 }}>{c.notes}</div>}
      <div style={labelStyle}>Matters</div>
      {matters.length === 0 ? <div style={{ fontSize: 13, color: MUTED }}>No matters for this contact.</div> : matters.map((m) => (
        <div key={m.id} className="arkrow" onClick={() => goMatter(m.id)} style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 6px", borderBottom: "1px solid " + LINE, cursor: "pointer" }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: GOLD }}>{m.number}</span><span style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{m.title}</span><Badge v={m.status} />
        </div>
      ))}
    </Modal>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────
function Calendar({ data, openForm, goMatter, isMobile }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = todayISO();
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first); start.setDate(1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const evBy = {}; data.events.forEach((e) => { const k = dayKey(e.start_at); (evBy[k] = evBy[k] || []).push(e); });
  const taskBy = {}; data.tasks.filter((t) => t.due_date && t.status !== "done").forEach((t) => { (taskBy[t.due_date] = taskBy[t.due_date] || []).push(t); });
  const color = { hearing: BAD, deadline: WARN, meeting: NAVY, other: MUTED };
  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const agenda = data.events.filter((e) => dayKey(e.start_at) >= today).slice(0, 20);

  return (
    <div>
      <H2 right={<div style={{ display: "flex", gap: 6 }}>
        <Btn small kind="ghost" onClick={() => shift(-1)}>&lsaquo;</Btn>
        <Btn small kind="ghost" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</Btn>
        <Btn small kind="ghost" onClick={() => shift(1)}>&rsaquo;</Btn>
        <Btn small onClick={() => openForm("events")}><Icon d={I.plus} size={13} />Event</Btn>
      </div>}>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</H2>

      {!isMobile ? (
        <Card pad={0} style={{ overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} style={{ ...th, borderBottom: "1px solid " + LINE, textAlign: "center" }}>{d}</div>)}
            {days.map((d, i) => {
              const k = dayKey(d), inMonth = d.getMonth() === cursor.getMonth(), ev = evBy[k] || [], tk = taskBy[k] || [];
              return (
                <div key={i} onClick={() => openForm("events", { type: "meeting", start_at: k + "T09:00" })}
                  style={{ minHeight: 104, padding: 6, borderRight: (i % 7 !== 6) ? "1px solid #F0E9DC" : "none", borderBottom: i < 35 ? "1px solid #F0E9DC" : "none", background: inMonth ? WHITE : "#FAF6EE", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4, color: k === today ? WHITE : inMonth ? INK : "#B8AC98", background: k === today ? NAVY : "transparent", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{d.getDate()}</div>
                  {ev.slice(0, 3).map((e) => (
                    <div key={e.id} onClick={(x) => { x.stopPropagation(); openForm("events", e); }} title={e.title}
                      style={{ fontSize: 11, padding: "2px 5px", borderRadius: 4, marginBottom: 2, background: "rgba(2,26,74,0.05)", borderLeft: "3px solid " + (color[e.type] || NAVY), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: INK }}>
                      {e.all_day ? "" : fmtTime(e.start_at) + " "}{e.title}
                    </div>
                  ))}
                  {ev.length > 3 && <div style={{ fontSize: 10.5, color: MUTED }}>+{ev.length - 3} more</div>}
                  {tk.length > 0 && <div style={{ fontSize: 10.5, color: WARN, fontWeight: 700 }}>{tk.length} task{tk.length > 1 ? "s" : ""} due</div>}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <Card>
        <H2>Agenda</H2>
        {agenda.length === 0 ? <Empty text="Nothing scheduled ahead." /> : agenda.map((e) => {
          const m = data.matters.find((x) => x.id === e.matter_id);
          return (
            <div key={e.id} className="arkrow" onClick={() => openForm("events", e)} style={{ display: "flex", gap: 12, padding: "10px 6px", borderBottom: "1px solid #F0E9DC", cursor: "pointer", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: color[e.type] || NAVY }} />
              <div style={{ width: 130, fontSize: 12.5, color: MUTED }}>{fmtDate(e.start_at)}<br />{e.all_day ? "All day" : fmtTime(e.start_at)}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{e.location}{m ? (e.location ? " · " : "") : ""}{m && <span onClick={(x) => { x.stopPropagation(); goMatter(m.id); }} style={{ color: NAVY, fontWeight: 700 }}>{m.number}</span>}</div>
              </div>
              <Badge v={e.type} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Tasks ──────────────────────────────────────────────────────────────────
function Tasks({ data, openForm, upsert, notify, goMatter }) {
  return <TaskList tasks={data.tasks} data={data} openForm={openForm} upsert={upsert} notify={notify} goMatter={goMatter} title="Tasks" add={() => openForm("tasks")} />;
}

function TaskList({ tasks, data, openForm, upsert, notify, hideMatter, add, title, goMatter }) {
  const [show, setShow] = useState("open");
  const today = todayISO();
  const list = tasks.filter((t) => show === "all" || (show === "open" ? t.status !== "done" : t.status === "done"))
    .sort((a, b) => String(a.due_date || "9999").localeCompare(String(b.due_date || "9999")));
  const toggle = async (t) => { try { await upsert("tasks", { status: t.status === "done" ? "todo" : "done" }, t.id); } catch (e) { notify(e.message, true); } };
  return (
    <div>
      {title && <H2 right={<Btn small onClick={add}><Icon d={I.plus} size={13} />New task</Btn>}>{title}</H2>}
      <Card>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
          {[["open", "Open"], ["done", "Completed"], ["all", "All"]].map(([k, l]) => (
            <button key={k} onClick={() => setShow(k)} style={{ padding: "5px 12px", borderRadius: 999, border: "1px solid " + (show === k ? NAVY : LINE), background: show === k ? NAVY : WHITE, color: show === k ? WHITE : INK, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
          ))}
          <div style={{ flex: 1 }} />
          {!title && <Btn small kind="ghost" onClick={add}><Icon d={I.plus} size={12} />Task</Btn>}
        </div>
        {list.length === 0 ? <Empty text="No tasks here." /> : list.map((t) => {
          const m = data.matters.find((x) => x.id === t.matter_id);
          const overdue = t.status !== "done" && t.due_date && t.due_date < today;
          return (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 4px", borderBottom: "1px solid #F0E9DC" }}>
              <input type="checkbox" checked={t.status === "done"} onChange={() => toggle(t)} style={{ marginTop: 3, width: 16, height: 16, accentColor: NAVY, cursor: "pointer" }} aria-label={"Toggle " + t.title} />
              <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openForm("tasks", t)}>
                <div style={{ fontSize: 13.5, fontWeight: 600, textDecoration: t.status === "done" ? "line-through" : "none", color: t.status === "done" ? MUTED : INK }}>{t.title}</div>
                <div style={{ fontSize: 12, color: overdue ? BAD : MUTED, marginTop: 2 }}>
                  {t.due_date ? (overdue ? "Overdue · " : "Due ") + fmtDate(t.due_date) : "No due date"}
                  {!hideMatter && m && <> · <span onClick={(x) => { x.stopPropagation(); goMatter && goMatter(m.id); }} style={{ color: NAVY, fontWeight: 700 }}>{m.number}</span></>}
                </div>
              </div>
              {t.status === "in_progress" && <Badge v="in_progress" />}
              {t.priority !== "normal" && <Badge v={t.priority} />}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Time ───────────────────────────────────────────────────────────────────
function TimeView({ data, cur, openForm, goMatter }) {
  const [range, setRange] = useState("month");
  const today = todayISO();
  const from = range === "week" ? addDays(today, -6) : range === "month" ? today.slice(0, 8) + "01" : "0000";
  const entries = data.time.filter((t) => t.date >= from);
  const hours = entries.filter((t) => t.kind === "time").reduce((s, t) => s + Number(t.hours), 0);
  const billableH = entries.filter((t) => t.kind === "time" && t.billable).reduce((s, t) => s + Number(t.hours), 0);
  const value = entries.filter((t) => t.billable).reduce((s, t) => s + Number(t.amount), 0);
  return (
    <div>
      <H2 right={<Btn small onClick={() => openForm("time")}><Icon d={I.plus} size={13} />New entry</Btn>}>Time & expenses</H2>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["week", "Last 7 days"], ["month", "This month"], ["all", "All time"]].map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (range === k ? NAVY : LINE), background: range === k ? NAVY : WHITE, color: range === k ? WHITE : INK, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <Stat label="Hours" value={hours.toFixed(1)} sub={billableH.toFixed(1) + " billable"} />
        <Stat label="Utilisation" value={hours ? Math.round((billableH / hours) * 100) + "%" : "-"} sub="billable share of hours" />
        <Stat label="Billable value" value={money(value, cur)} sub="time + expenses" />
      </div>
      <TimeTable entries={entries} data={data} cur={cur} openForm={openForm} goMatter={goMatter} />
    </div>
  );
}

function TimeTable({ entries, data, cur, openForm, hideMatter, add, goMatter }) {
  return (
    <Card pad={0} style={{ overflowX: "auto" }}>
      {add && <div style={{ padding: "12px 14px 0", display: "flex", justifyContent: "flex-end" }}><Btn small kind="ghost" onClick={add}><Icon d={I.plus} size={12} />Entry</Btn></div>}
      {entries.length === 0 ? <Empty text="No entries yet." /> : (
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead><tr><th style={th}>Date</th>{!hideMatter && <th style={th}>Matter</th>}<th style={th}>Description</th><th style={{ ...th, textAlign: "right" }}>Hours</th><th style={{ ...th, textAlign: "right" }}>Amount</th><th style={th}>Status</th></tr></thead>
          <tbody>{entries.map((t) => {
            const m = data.matters.find((x) => x.id === t.matter_id);
            const inv = t.invoice_id && data.invoices.find((x) => x.id === t.invoice_id);
            return (
              <tr key={t.id} className="arkrow" onClick={() => openForm("time", t)} style={{ cursor: "pointer" }}>
                <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDate(t.date)}</td>
                {!hideMatter && <td style={td}>{m ? <span onClick={(x) => { if (goMatter) { x.stopPropagation(); goMatter(m.id); } }} style={{ color: NAVY, fontWeight: 700 }}>{m.number}</span> : "-"}</td>}
                <td style={td}>{t.kind === "expense" && <Badge v="other" label="Expense" />} {t.description}</td>
                <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{t.kind === "time" ? Number(t.hours).toFixed(1) : "-"}</td>
                <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(t.amount, cur)}</td>
                <td style={td}>{inv ? <Badge v={inv.status} label={inv.number} /> : t.billable ? <Badge v="draft" label="Unbilled" /> : <Badge v="other" label="Non-billable" />}</td>
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </Card>
  );
}

// ── Billing ────────────────────────────────────────────────────────────────
function Billing({ data, cur, setModal, goMatter }) {
  const unbilledByMatter = data.matters.map((m) => {
    const e = data.time.filter((t) => t.matter_id === m.id && t.billable && !t.invoice_id);
    return { m, count: e.length, amount: e.reduce((s, t) => s + Number(t.amount), 0) };
  }).filter((x) => x.count > 0);
  const outstanding = data.invoices.filter((i) => i.status === "sent" || i.status === "draft").reduce((s, i) => s + Number(i.total) - Number(i.amount_paid), 0);
  const today = todayISO();
  const overdue = data.invoices.filter((i) => i.status === "sent" && i.due_date && i.due_date < today);
  const collected = data.invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
  return (
    <div>
      <H2 right={<Btn small onClick={() => setModal({ kind: "newInvoice" })}><Icon d={I.plus} size={13} />New invoice</Btn>}>Billing</H2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Stat label="Ready to bill" value={money(unbilledByMatter.reduce((s, x) => s + x.amount, 0), cur)} sub={unbilledByMatter.length + " matters"} />
        <Stat label="Outstanding" value={money(outstanding, cur)} sub={overdue.length + " overdue"} tone={overdue.length ? BAD : NAVY} />
        <Stat label="Collected (all time)" value={money(collected, cur)} tone={OK} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <H2>Unbilled work</H2>
        {unbilledByMatter.length === 0 ? <Empty text="No unbilled time or expenses." /> : unbilledByMatter.map(({ m, count, amount }) => (
          <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 4px", borderBottom: "1px solid #F0E9DC", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, cursor: "pointer" }} onClick={() => goMatter(m.id)}><span style={{ fontSize: 11.5, fontWeight: 800, color: GOLD }}>{m.number}</span> <b style={{ fontSize: 13.5 }}>{m.title}</b><div style={{ fontSize: 12, color: MUTED }}>{count} entries</div></div>
            <div style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{money(amount, cur)}</div>
            <Btn small kind="gold" onClick={() => setModal({ kind: "newInvoice", matterId: m.id })}>Create invoice</Btn>
          </div>
        ))}
      </Card>
      <InvoiceTable invoices={data.invoices} data={data} setModal={setModal} />
    </div>
  );
}

function InvoiceTable({ invoices, data, setModal, hideMatter }) {
  const today = todayISO();
  return (
    <Card pad={0} style={{ overflowX: "auto" }}>
      <div style={{ padding: "14px 16px 4px" }}><H2>Invoices</H2></div>
      {invoices.length === 0 ? <Empty text="No invoices yet." /> : (
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead><tr><th style={th}>Invoice</th>{!hideMatter && <th style={th}>Matter</th>}<th style={th}>Issued</th><th style={th}>Due</th><th style={{ ...th, textAlign: "right" }}>Total</th><th style={{ ...th, textAlign: "right" }}>Balance</th><th style={th}>Status</th></tr></thead>
          <tbody>{invoices.map((i) => {
            const m = data.matters.find((x) => x.id === i.matter_id);
            const over = i.status === "sent" && i.due_date && i.due_date < today;
            return (
              <tr key={i.id} className="arkrow" onClick={() => setModal({ kind: "invoice", id: i.id })} style={{ cursor: "pointer" }}>
                <td style={{ ...td, fontWeight: 800 }}>{i.number}</td>
                {!hideMatter && <td style={td}>{m ? m.number + " · " + m.title : "-"}</td>}
                <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDate(i.issue_date)}</td>
                <td style={{ ...td, whiteSpace: "nowrap", color: over ? BAD : INK }}>{i.due_date ? fmtDate(i.due_date) : "-"}</td>
                <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(i.total, i.currency)}</td>
                <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{i.status === "void" ? "-" : money(Number(i.total) - Number(i.amount_paid), i.currency)}</td>
                <td style={td}><Badge v={over ? "overdue" : i.status} label={over ? "Overdue" : undefined} /></td>
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </Card>
  );
}

function NewInvoice({ data, cur, preMatter, onClose, onCreate }) {
  const candidates = data.matters.filter((m) => data.time.some((t) => t.matter_id === m.id && t.billable && !t.invoice_id) || (m.billing_method === "flat" && Number(m.flat_fee) > 0));
  const [mId, setM] = useState(preMatter || (candidates[0] && candidates[0].id) || "");
  const entries = data.time.filter((t) => t.matter_id === mId && t.billable && !t.invoice_id);
  const [sel, setSel] = useState(() => new Set(entries.map((e) => e.id)));
  const matter = data.matters.find((m) => m.id === mId);
  const [flat, setFlat] = useState(true);
  const [issue, setIssue] = useState(todayISO()), [due, setDue] = useState(addDays(todayISO(), 14));
  const [tax, setTax] = useState(data.settings.tax_rate || 0), [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  useEffect(() => { setSel(new Set(data.time.filter((t) => t.matter_id === mId && t.billable && !t.invoice_id).map((e) => e.id))); }, [mId, data.time]);
  const useFlat = matter && matter.billing_method === "flat" && Number(matter.flat_fee) > 0 && flat;
  const subtotal = entries.filter((e) => sel.has(e.id)).reduce((s, e) => s + Number(e.amount), 0) + (useFlat ? Number(matter.flat_fee) : 0);
  const taxAmt = Math.round(subtotal * (Number(tax) || 0)) / 100;
  const create = async () => {
    setErr(""); setBusy(true);
    try { await onCreate({ matter_id: mId, entry_ids: Array.from(sel), include_flat_fee: !!useFlat, issue_date: issue, due_date: due, tax_rate: Number(tax) || 0, notes }); }
    catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal wide title="New invoice" onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={create} disabled={busy || !mId || subtotal <= 0}>{busy ? "Creating..." : "Create draft invoice"}</Btn></>}>
      {candidates.length === 0 ? <Empty text="There is no unbilled work to invoice yet. Log time or expenses on a matter first." /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}><Field f={{ label: "Matter", type: "select", blank: false, options: candidates.map((m) => ({ value: m.id, label: m.number + " · " + m.title })) }} value={mId} onChange={setM} /></div>
            <Field f={{ label: "Issue date", type: "date" }} value={issue} onChange={setIssue} />
            <Field f={{ label: "Due date", type: "date" }} value={due} onChange={setDue} />
            <Field f={{ label: (data.settings.tax_label || "Tax") + " %", type: "number", step: "0.01", min: "0" }} value={tax} onChange={setTax} />
          </div>
          {matter && matter.billing_method === "flat" && Number(matter.flat_fee) > 0 && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, marginBottom: 10, cursor: "pointer" }}><input type="checkbox" checked={flat} onChange={(e) => setFlat(e.target.checked)} style={{ accentColor: NAVY }} />Include flat fee of {money(matter.flat_fee, cur)}</label>
          )}
          <div style={{ background: WHITE, border: "1px solid " + LINE, borderRadius: 11, overflow: "hidden", marginBottom: 12 }}>
            {entries.length === 0 ? <div style={{ padding: 12, fontSize: 13, color: MUTED }}>No unbilled entries on this matter.</div> : entries.map((e) => (
              <label key={e.id} className="arkrow" style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 12px", borderBottom: "1px solid #F0E9DC", cursor: "pointer", fontSize: 13.5 }}>
                <input type="checkbox" checked={sel.has(e.id)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(e.id)) n.delete(e.id); else n.add(e.id); return n; })} style={{ accentColor: NAVY }} />
                <span style={{ width: 92, color: MUTED, fontSize: 12.5 }}>{fmtDate(e.date)}</span>
                <span style={{ flex: 1 }}>{e.description}</span>
                <span style={{ color: MUTED, fontSize: 12.5 }}>{e.kind === "time" ? Number(e.hours).toFixed(1) + " h" : "Expense"}</span>
                <span style={{ width: 100, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(e.amount, cur)}</span>
              </label>
            ))}
          </div>
          <Field f={{ label: "Notes on invoice", type: "textarea", rows: 2, placeholder: "e.g. Payment by bank transfer within 14 days" }} value={notes} onChange={setNotes} />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 24, fontSize: 13.5, flexWrap: "wrap" }}>
            <span>Subtotal <b>{money(subtotal, cur)}</b></span><span>{data.settings.tax_label || "Tax"} <b>{money(taxAmt, cur)}</b></span><span>Total <b style={{ color: NAVY, fontSize: 16 }}>{money(subtotal + taxAmt, cur)}</b></span>
          </div>
        </>
      )}
      {err && <div style={{ marginTop: 10, fontSize: 13, color: BAD }}>{err}</div>}
    </Modal>
  );
}

function InvoiceView({ inv, data, onClose, action, upsert, notify }) {
  const m = data.matters.find((x) => x.id === inv.matter_id);
  const c = data.contacts.find((x) => x.id === inv.client_id);
  const s = data.settings;
  const balance = Number(inv.total) - Number(inv.amount_paid);
  const [pay, setPay] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn, okMsg) => { setBusy(true); try { await fn(); if (okMsg) notify(okMsg); } catch (e) { notify(e.message, true); } setBusy(false); };

  const printIt = () => {
    const rows = (inv.items || []).map((it) => "<tr><td>" + esc(it.date ? fmtDate(it.date) : "") + "</td><td>" + esc(it.description) + "</td><td class='r'>" + (it.kind === "time" ? Number(it.hours).toFixed(1) : "") + "</td><td class='r'>" + (it.kind === "time" ? esc(money(it.rate, inv.currency)) : "") + "</td><td class='r'>" + esc(money(it.amount, inv.currency)) + "</td></tr>").join("");
    const html = "<!doctype html><html><head><meta charset='utf-8'><title>" + esc(inv.number) + "</title><style>body{font-family:Georgia,serif;color:#1A1209;max-width:780px;margin:36px auto;padding:0 24px}h1{color:#021A4A;margin:0}table{width:100%;border-collapse:collapse;margin-top:22px;font-family:Arial,sans-serif;font-size:13px}th{text-align:left;border-bottom:2px solid #C9A84C;padding:8px;font-size:11px;text-transform:uppercase;color:#7A6A55}td{padding:8px;border-bottom:1px solid #E3D9C6;vertical-align:top}.r{text-align:right}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #021A4A;padding-bottom:16px}.muted{color:#7A6A55;font-size:13px;font-family:Arial,sans-serif}.tot{margin-left:auto;width:280px;margin-top:14px;font-family:Arial,sans-serif;font-size:14px}.tot div{display:flex;justify-content:space-between;padding:4px 0}.big{font-size:18px;font-weight:bold;color:#021A4A;border-top:2px solid #021A4A;padding-top:8px!important}</style></head><body>" +
      "<div class='top'><div><h1>" + esc(s.firm_name || "Invoice") + "</h1><div class='muted' style='white-space:pre-line'>" + esc(s.address) + "</div></div><div style='text-align:right'><div style='font-size:22px;color:#021A4A'>INVOICE</div><div class='muted'>" + esc(inv.number) + "<br>Issued " + esc(fmtDate(inv.issue_date)) + (inv.due_date ? "<br>Due " + esc(fmtDate(inv.due_date)) : "") + "</div></div></div>" +
      "<div style='display:flex;gap:40px;margin-top:18px'><div><div class='muted'>BILL TO</div><div>" + esc(c ? c.name : "") + "</div><div class='muted' style='white-space:pre-line'>" + esc(c ? [c.company, c.address, c.email].filter(Boolean).join("\n") : "") + "</div></div><div><div class='muted'>MATTER</div><div>" + esc(m ? m.number + " - " + m.title : "") + "</div></div></div>" +
      "<table><thead><tr><th>Date</th><th>Description</th><th class='r'>Hours</th><th class='r'>Rate</th><th class='r'>Amount</th></tr></thead><tbody>" + rows + "</tbody></table>" +
      "<div class='tot'><div><span>Subtotal</span><span>" + esc(money(inv.subtotal, inv.currency)) + "</span></div><div><span>" + esc(s.tax_label || "Tax") + " (" + Number(inv.tax_rate) + "%)</span><span>" + esc(money(inv.tax, inv.currency)) + "</span></div><div class='big'><span>Total</span><span>" + esc(money(inv.total, inv.currency)) + "</span></div>" + (Number(inv.amount_paid) > 0 ? "<div><span>Paid</span><span>" + esc(money(inv.amount_paid, inv.currency)) + "</span></div><div><b>Balance due</b><b>" + esc(money(balance, inv.currency)) + "</b></div>" : "") + "</div>" +
      (inv.notes ? "<p class='muted' style='margin-top:28px;white-space:pre-line'>" + esc(inv.notes) + "</p>" : "") +
      "<p class='muted' style='margin-top:40px;font-size:11px'>Prepared with ARK Practice by ARK LAW AI</p><script>window.onload=function(){window.print()}</script></body></html>";
    const w = window.open("", "_blank");
    if (!w) return notify("Allow pop-ups to print the invoice", true);
    w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <Modal wide title={"Invoice " + inv.number} onClose={onClose} footer={<>
      {inv.status === "draft" && <Btn kind="danger" small style={{ marginRight: "auto" }} disabled={busy} onClick={() => run(async () => { await action("delete_invoice", { invoice_id: inv.id }); onClose(); }, "Draft deleted")}>Delete draft</Btn>}
      {inv.status === "sent" && Number(inv.amount_paid) === 0 && <Btn kind="danger" small style={{ marginRight: "auto" }} disabled={busy} onClick={() => run(() => action("void_invoice", { invoice_id: inv.id }), "Invoice voided")}>Void</Btn>}
      <Btn kind="ghost" onClick={printIt}><Icon d={I.print} size={13} />Print / PDF</Btn>
      {inv.status === "draft" && <Btn kind="ghost" disabled={busy} onClick={() => run(() => upsert("invoices", { status: "sent" }, inv.id), "Marked as sent")}>Mark as sent</Btn>}
      {(inv.status === "draft" || inv.status === "sent") && balance > 0 && <Btn onClick={() => setPay({ amount: balance.toFixed(2), date: todayISO(), method: "Bank transfer", reference: "" })}>Record payment</Btn>}
    </>}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <Badge v={inv.status} /><span style={{ fontSize: 13, color: MUTED }}>Issued {fmtDate(inv.issue_date)}{inv.due_date ? " · Due " + fmtDate(inv.due_date) : ""}</span>
        <span style={{ marginLeft: "auto", fontSize: 13.5 }}>Balance <b style={{ color: NAVY, fontSize: 16 }}>{money(inv.status === "void" ? 0 : balance, inv.currency)}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 14, fontSize: 13.5 }}>
        <div><div style={labelStyle}>Bill to</div>{c ? c.name : "No client"}</div>
        <div><div style={labelStyle}>Matter</div>{m ? m.number + " · " + m.title : "-"}</div>
      </div>
      <div style={{ background: WHITE, border: "1px solid " + LINE, borderRadius: 11, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead><tr><th style={th}>Date</th><th style={th}>Description</th><th style={{ ...th, textAlign: "right" }}>Hours</th><th style={{ ...th, textAlign: "right" }}>Amount</th></tr></thead>
          <tbody>{(inv.items || []).map((it, k) => (
            <tr key={k}><td style={{ ...td, whiteSpace: "nowrap" }}>{it.date ? fmtDate(it.date) : ""}</td><td style={td}>{it.description}</td><td style={{ ...td, textAlign: "right" }}>{it.kind === "time" ? Number(it.hours).toFixed(1) : ""}</td><td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(it.amount, inv.currency)}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, marginLeft: "auto", maxWidth: 300, fontSize: 13.5 }}>
        {[["Subtotal", inv.subtotal], [(s.tax_label || "Tax") + " (" + Number(inv.tax_rate) + "%)", inv.tax], ["Total", inv.total], ["Paid", inv.amount_paid]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontWeight: l === "Total" ? 800 : 400, color: l === "Total" ? NAVY : INK }}><span>{l}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{money(v, inv.currency)}</span></div>
        ))}
      </div>
      {(inv.payments || []).length > 0 && (
        <div style={{ marginTop: 14 }}><div style={labelStyle}>Payments</div>{inv.payments.map((p, k) => <div key={k} style={{ fontSize: 13, padding: "4px 0" }}>{fmtDate(p.date)} · {money(p.amount, inv.currency)} · {p.method}{p.reference ? " · " + p.reference : ""}</div>)}</div>
      )}
      {pay && (
        <div style={{ marginTop: 16, background: WHITE, border: "1px solid " + GOLD, borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 800, color: NAVY, marginBottom: 10 }}>Record payment</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
            <Field f={{ label: "Amount", type: "number", step: "0.01", min: "0" }} value={pay.amount} onChange={(v) => setPay({ ...pay, amount: v })} />
            <Field f={{ label: "Date", type: "date" }} value={pay.date} onChange={(v) => setPay({ ...pay, date: v })} />
            <Field f={{ label: "Method", type: "select", blank: false, options: ["Bank transfer", "Cash", "Cheque", "Card", "Online", "Other"].map((x) => ({ value: x, label: x })) }} value={pay.method} onChange={(v) => setPay({ ...pay, method: v })} />
            <Field f={{ label: "Reference" }} value={pay.reference} onChange={(v) => setPay({ ...pay, reference: v })} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <Btn small kind="ghost" onClick={() => setPay(null)}>Cancel</Btn>
            <Btn small disabled={busy} onClick={() => run(async () => { await action("record_payment", { invoice_id: inv.id, ...pay, amount: Number(pay.amount) }); setPay(null); }, "Payment recorded")}>Save payment</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────
function Settings({ data, action, notify }) {
  const [v, setV] = useState({ ...data.settings });
  const [busy, setBusy] = useState(false);
  const f = [
    { k: "firm_name", label: "Firm name", full: true }, { k: "address", label: "Firm address (shown on invoices)", type: "textarea", full: true, rows: 2 },
    { k: "jurisdiction", label: "Jurisdiction", type: "select", options: ["Pakistan", "India", "Bangladesh", "United States", "Other"].map((x) => ({ value: x, label: x })) },
    { k: "currency", label: "Currency", type: "select", blank: false, options: [["PKR", "PKR — Pakistani rupee"], ["INR", "INR — Indian rupee"], ["BDT", "BDT — Bangladeshi taka"], ["USD", "USD — US dollar"], ["GBP", "GBP — Pound sterling"], ["AED", "AED — UAE dirham"], ["EUR", "EUR — Euro"]].map(([a, b]) => ({ value: a, label: b })) },
    { k: "default_rate", label: "Default hourly rate", type: "number", step: "0.01", min: "0" },
    { k: "tax_label", label: "Tax name", placeholder: "e.g. GST, Sales tax" }, { k: "tax_rate", label: "Default tax %", type: "number", step: "0.01", min: "0" },
    { k: "invoice_prefix", label: "Invoice number prefix" },
  ];
  return (
    <div style={{ maxWidth: 760 }}>
      <H2>Firm settings</H2>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 13 }}>
          {f.map((x) => <Field key={x.k} f={x} value={v[x.k]} onChange={(val) => setV((p) => ({ ...p, [x.k]: val }))} />)}
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <Btn disabled={busy} onClick={async () => { setBusy(true); try { await action("save_settings", { data: v }); notify("Settings saved"); } catch (e) { notify(e.message, true); } setBusy(false); }}>{busy ? "Saving..." : "Save settings"}</Btn>
        </div>
      </Card>
      <Card style={{ marginTop: 14 }}>
        <H2>Security</H2>
        <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.7 }}>Your practice data is stored in ARK LAW AI's database and is only reachable through your signed-in session. Each firm account can only read its own matters, contacts and invoices.</div>
      </Card>
    </div>
  );
}
