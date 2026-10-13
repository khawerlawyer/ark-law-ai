// pages/api/practice.js — ARK Practice (Phase 1) API
//
// Auth: every request must send  Authorization: Bearer <sessionToken>
//       (the token is issued by /api/auth/login and stored with arklaw_user).
// Data: Supabase REST with the service key. Every query is scoped to the
//       signed-in user's owner_id; the browser can never choose the owner.
//
// GET    /api/practice                         -> everything for the dashboard
// POST   /api/practice  {r, data}              -> create row
// PATCH  /api/practice  {r, id, data}          -> update row
// DELETE /api/practice  {r, id}                -> delete row
// POST   /api/practice  {action, ...}          -> create_invoice | record_payment | void_invoice | delete_invoice | save_settings

import crypto from "crypto";

const SB_URL = () => (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SB_KEY = () => process.env.SUPABASE_SERVICE_KEY || "";
const UUID   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Session ────────────────────────────────────────────────────────────────
function verifySession(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_KEY || "";
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.uid || !UUID.test(data.uid) || !data.exp || data.exp < Date.now()) return null;
    return data.uid;
  } catch { return null; }
}

// ── Supabase REST ──────────────────────────────────────────────────────────
async function sb(path, method = "GET", body) {
  const r = await fetch(SB_URL() + "/rest/v1/" + path, {
    method,
    headers: {
      apikey: SB_KEY(),
      Authorization: "Bearer " + SB_KEY(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) {
    const msg = (data && (data.message || data.details)) || ("Database error " + r.status);
    const err = new Error(msg); err.status = r.status; err.code = data && data.code; throw err;
  }
  return data;
}

// ── Resource config: table + fields the browser may set ────────────────────
const RES = {
  contacts: { table: "ark_pm_contacts", fields: ["type","name","email","phone","company","address","tags","notes","is_client"], required: ["name"] },
  matters:  { table: "ark_pm_matters",  fields: ["title","client_id","practice_area","status","description","court","case_no","opposing_party","opposing_counsel","responsible","billing_method","rate","flat_fee","open_date","close_date"], required: ["title"] },
  events:   { table: "ark_pm_events",   fields: ["matter_id","title","type","start_at","end_at","all_day","location","notes"], required: ["title","start_at"] },
  tasks:    { table: "ark_pm_tasks",    fields: ["matter_id","title","description","due_date","priority","status"], required: ["title"] },
  time:     { table: "ark_pm_time",     fields: ["matter_id","kind","date","description","hours","rate","amount","billable"], required: ["matter_id","description"] },
  invoices: { table: "ark_pm_invoices", fields: ["due_date","notes","status"], required: [] },
};

const ENUMS = {
  type_contacts: ["person","company"],
  status_matters: ["open","pending","closed"],
  billing_method: ["hourly","flat","contingency"],
  type_events: ["hearing","meeting","deadline","other"],
  priority: ["low","normal","high"],
  status_tasks: ["todo","in_progress","done"],
  kind: ["time","expense"],
  status_invoices: ["draft","sent"],          // paid/void only via actions
};

const NUM  = ["rate","flat_fee","hours","amount"];
const DATE = ["open_date","close_date","due_date","date"];
const REFS = { client_id: "ark_pm_contacts", matter_id: "ark_pm_matters" };
const round2 = n => Math.round((Number(n) || 0) * 100) / 100;

function clean(r, data, isCreate) {
  const cfg = RES[r], out = {};
  for (const f of cfg.fields) {
    if (!(f in data)) continue;
    let v = data[f];
    if (typeof v === "string") v = v.trim().slice(0, f === "description" || f === "notes" ? 20000 : 500);
    if (v === "" && (f in REFS || DATE.includes(f) || f === "end_at")) v = null;
    if (NUM.includes(f)) { v = round2(v); if (v < 0) throw httpErr(400, f + " cannot be negative"); }
    if (DATE.includes(f) && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw httpErr(400, "Invalid date for " + f);
    if ((f === "start_at" || f === "end_at") && v && isNaN(Date.parse(v))) throw httpErr(400, "Invalid " + f);
    if ((f in REFS) && v && !UUID.test(v)) throw httpErr(400, "Invalid " + f);
    if (f === "is_client" || f === "billable" || f === "all_day") v = !!v;
    const enumKey = ENUMS[f + "_" + r] ? f + "_" + r : (ENUMS[f] ? f : null);
    if (enumKey && v != null && !ENUMS[enumKey].includes(v)) throw httpErr(400, "Invalid " + f);
    out[f] = v;
  }
  if (isCreate) for (const req of cfg.required) if (out[req] === undefined || out[req] === null || out[req] === "") throw httpErr(400, req + " is required");
  return out;
}

function httpErr(status, msg) { const e = new Error(msg); e.status = status; return e; }

async function assertOwnsRefs(uid, row) {
  for (const [f, table] of Object.entries(REFS)) {
    if (!row[f]) continue;
    const hit = await sb(table + "?id=eq." + row[f] + "&owner_id=eq." + uid + "&select=id");
    if (!hit || !hit.length) throw httpErr(400, "Linked " + (f === "client_id" ? "contact" : "matter") + " not found");
  }
}

const CURRENCY_BY_COUNTRY = { pakistan: "PKR", india: "INR", bangladesh: "BDT", "united states": "USD", usa: "USD" };

async function getSettings(uid) {
  const rows = await sb("ark_pm_settings?owner_id=eq." + uid + "&select=*");
  if (rows && rows.length) return rows[0];
  let currency = "USD", jurisdiction = "", firm = "";
  try {
    const u = await sb("ark_users?id=eq." + uid + "&select=name,country");
    if (u && u[0]) {
      const c = String(u[0].country || "").toLowerCase();
      currency = CURRENCY_BY_COUNTRY[c] || "USD";
      jurisdiction = u[0].country || "";
      firm = u[0].name ? u[0].name + " Law" : "";
    }
  } catch {}
  const created = await sb("ark_pm_settings", "POST", { owner_id: uid, currency, jurisdiction, firm_name: firm });
  return created[0];
}

async function bumpCounter(uid, field) {
  const s = await getSettings(uid);
  const n = Number(s[field]) || 1;
  await sb("ark_pm_settings?owner_id=eq." + uid, "PATCH", { [field]: n + 1 });
  return { n, settings: s };
}

// ── Actions ────────────────────────────────────────────────────────────────
async function createInvoice(uid, body) {
  const matterId = body.matter_id;
  if (!UUID.test(matterId || "")) throw httpErr(400, "Choose a matter");
  const m = await sb("ark_pm_matters?id=eq." + matterId + "&owner_id=eq." + uid + "&select=*");
  if (!m || !m.length) throw httpErr(404, "Matter not found");
  const matter = m[0];

  const ids = (Array.isArray(body.entry_ids) ? body.entry_ids : []).filter(id => UUID.test(id)).slice(0, 500);
  let entries = [];
  if (ids.length) {
    entries = await sb("ark_pm_time?owner_id=eq." + uid + "&matter_id=eq." + matterId +
      "&invoice_id=is.null&billable=is.true&id=in.(" + ids.join(",") + ")&select=*&order=date.asc");
  }
  const items = entries.map(e => ({
    entry_id: e.id, kind: e.kind, date: e.date, description: e.description,
    hours: Number(e.hours) || 0, rate: Number(e.rate) || 0, amount: Number(e.amount) || 0,
  }));
  if (body.include_flat_fee && matter.billing_method === "flat" && Number(matter.flat_fee) > 0) {
    items.unshift({ kind: "flat_fee", date: body.issue_date || null, description: "Flat fee — " + matter.title, hours: 0, rate: 0, amount: Number(matter.flat_fee) });
  }
  if (!items.length) throw httpErr(400, "No unbilled entries selected");

  const { n, settings } = await bumpCounter(uid, "next_invoice_no");
  const subtotal = round2(items.reduce((s, i) => s + i.amount, 0));
  const taxRate  = body.tax_rate !== undefined ? Math.max(0, Math.min(100, Number(body.tax_rate) || 0)) : Number(settings.tax_rate) || 0;
  const tax      = round2(subtotal * taxRate / 100);
  const inv = await sb("ark_pm_invoices", "POST", {
    owner_id: uid,
    number: (settings.invoice_prefix || "INV-") + String(n).padStart(4, "0"),
    matter_id: matterId,
    client_id: matter.client_id,
    issue_date: /^\d{4}-\d{2}-\d{2}$/.test(body.issue_date || "") ? body.issue_date : new Date().toISOString().slice(0, 10),
    due_date: /^\d{4}-\d{2}-\d{2}$/.test(body.due_date || "") ? body.due_date : null,
    status: "draft",
    items, subtotal, tax_rate: taxRate, tax, total: round2(subtotal + tax),
    currency: settings.currency || "USD",
    notes: String(body.notes || "").slice(0, 5000),
  });
  if (entries.length) {
    await sb("ark_pm_time?owner_id=eq." + uid + "&id=in.(" + entries.map(e => e.id).join(",") + ")", "PATCH", { invoice_id: inv[0].id });
  }
  return inv[0];
}

async function getInvoice(uid, id) {
  if (!UUID.test(id || "")) throw httpErr(400, "Invalid invoice");
  const rows = await sb("ark_pm_invoices?id=eq." + id + "&owner_id=eq." + uid + "&select=*");
  if (!rows || !rows.length) throw httpErr(404, "Invoice not found");
  return rows[0];
}

async function recordPayment(uid, body) {
  const inv = await getInvoice(uid, body.invoice_id);
  if (inv.status === "void") throw httpErr(400, "Invoice is void");
  const amount = round2(body.amount);
  if (amount <= 0) throw httpErr(400, "Enter a payment amount");
  const balance = round2(Number(inv.total) - Number(inv.amount_paid));
  if (amount > balance + 0.001) throw httpErr(400, "Payment is more than the balance due");
  const payments = (inv.payments || []).concat([{
    amount, date: /^\d{4}-\d{2}-\d{2}$/.test(body.date || "") ? body.date : new Date().toISOString().slice(0, 10),
    method: String(body.method || "").slice(0, 60), reference: String(body.reference || "").slice(0, 120),
  }]);
  const paid = round2(Number(inv.amount_paid) + amount);
  const out = await sb("ark_pm_invoices?id=eq." + inv.id + "&owner_id=eq." + uid, "PATCH", {
    payments, amount_paid: paid, status: paid >= Number(inv.total) - 0.001 ? "paid" : (inv.status === "draft" ? "sent" : inv.status),
  });
  return out[0];
}

async function releaseEntries(uid, invoiceId) {
  await sb("ark_pm_time?owner_id=eq." + uid + "&invoice_id=eq." + invoiceId, "PATCH", { invoice_id: null });
}

async function voidInvoice(uid, body) {
  const inv = await getInvoice(uid, body.invoice_id);
  if (Number(inv.amount_paid) > 0) throw httpErr(400, "This invoice has payments recorded and cannot be voided");
  await releaseEntries(uid, inv.id);
  const out = await sb("ark_pm_invoices?id=eq." + inv.id + "&owner_id=eq." + uid, "PATCH", { status: "void" });
  return out[0];
}

async function deleteInvoice(uid, body) {
  const inv = await getInvoice(uid, body.invoice_id);
  if (inv.status !== "draft") throw httpErr(400, "Only draft invoices can be deleted. Void it instead.");
  await releaseEntries(uid, inv.id);
  await sb("ark_pm_invoices?id=eq." + inv.id + "&owner_id=eq." + uid, "DELETE");
  return { id: inv.id };
}

async function saveSettings(uid, body) {
  await getSettings(uid);
  const d = body.data || {}, out = {};
  for (const f of ["firm_name","address","jurisdiction","currency","tax_label","invoice_prefix"]) if (f in d) out[f] = String(d[f] || "").trim().slice(0, 300);
  if ("currency" in out) out.currency = out.currency.toUpperCase().slice(0, 3) || "USD";
  if ("default_rate" in d) out.default_rate = Math.max(0, round2(d.default_rate));
  if ("tax_rate" in d) out.tax_rate = Math.max(0, Math.min(100, Number(d.tax_rate) || 0));
  const rows = await sb("ark_pm_settings?owner_id=eq." + uid, "PATCH", out);
  return rows[0];
}

// ── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!SB_URL() || !SB_KEY()) return res.status(500).json({ error: "ARK Practice needs SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel." });

  const uid = verifySession(req);
  if (!uid) return res.status(401).json({ error: "Please sign in again." });

  try {
    if (req.method === "GET") {
      const q = "?owner_id=eq." + uid + "&select=*&limit=5000";
      const [settings, contacts, matters, events, tasks, time, invoices] = await Promise.all([
        getSettings(uid),
        sb("ark_pm_contacts" + q + "&order=name.asc"),
        sb("ark_pm_matters"  + q + "&order=created_at.desc"),
        sb("ark_pm_events"   + q + "&order=start_at.asc"),
        sb("ark_pm_tasks"    + q + "&order=created_at.desc"),
        sb("ark_pm_time"     + q + "&order=date.desc"),
        sb("ark_pm_invoices" + q + "&order=created_at.desc"),
      ]);
      return res.status(200).json({ settings, contacts, matters, events, tasks, time, invoices });
    }

    const body = req.body || {};

    if (req.method === "POST" && body.action) {
      const fn = { create_invoice: createInvoice, record_payment: recordPayment, void_invoice: voidInvoice, delete_invoice: deleteInvoice, save_settings: saveSettings }[body.action];
      if (!fn) return res.status(400).json({ error: "Unknown action" });
      return res.status(200).json({ row: await fn(uid, body) });
    }

    const r = body.r;
    if (!RES[r]) return res.status(400).json({ error: "Unknown resource" });
    const table = RES[r].table;

    if (req.method === "POST") {
      if (r === "invoices") return res.status(400).json({ error: "Use create_invoice" });
      const row = clean(r, body.data || {}, true);
      await assertOwnsRefs(uid, row);
      if (r === "time") {
        row.kind = row.kind || "time";
        if (row.kind === "time") row.amount = round2((row.hours || 0) * (row.rate || 0));
      }
      if (r === "matters") {
        const { n, settings } = await bumpCounter(uid, "next_matter_no");
        row.number = "M-" + String(n).padStart(4, "0");
        if (row.rate === undefined) row.rate = Number(settings.default_rate) || 0;
      }
      const created = await sb(table, "POST", { ...row, owner_id: uid });
      return res.status(200).json({ row: created[0] });
    }

    if (!UUID.test(body.id || "")) return res.status(400).json({ error: "Invalid id" });
    const where = table + "?id=eq." + body.id + "&owner_id=eq." + uid;

    if (req.method === "PATCH") {
      const row = clean(r, body.data || {}, false);
      await assertOwnsRefs(uid, row);
      if (r === "time") {
        const cur = await sb(where + "&select=*");
        if (!cur || !cur.length) return res.status(404).json({ error: "Not found" });
        if (cur[0].invoice_id) return res.status(400).json({ error: "This entry is on an invoice. Void the invoice to edit it." });
        const merged = { ...cur[0], ...row };
        if ((merged.kind || "time") === "time") row.amount = round2((merged.hours || 0) * (merged.rate || 0));
      }
      if (r === "invoices") {
        const cur = await getInvoice(uid, body.id);
        if (cur.status === "paid" || cur.status === "void") return res.status(400).json({ error: "Paid or void invoices cannot be edited" });
      }
      const updated = await sb(where, "PATCH", row);
      if (!updated || !updated.length) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ row: updated[0] });
    }

    if (req.method === "DELETE") {
      if (r === "invoices") return res.status(400).json({ error: "Use delete_invoice" });
      if (r === "time") {
        const cur = await sb(where + "&select=invoice_id");
        if (cur && cur[0] && cur[0].invoice_id) return res.status(400).json({ error: "This entry is on an invoice. Void the invoice first." });
      }
      await sb(where, "DELETE");
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    const status = e.status && e.status < 500 ? e.status : 500;
    let msg = e.message || "Server error";
    if (e.code === "23503") msg = "This record is still linked to an invoice. Void or delete the invoice first.";
    if (e.code === "42P01") msg = "ARK Practice tables are missing. Run practice-schema.sql in Supabase.";
    if (status === 500) console.error("practice api:", e.message);
    return res.status(e.code === "23503" ? 409 : status).json({ error: msg });
  }
}
