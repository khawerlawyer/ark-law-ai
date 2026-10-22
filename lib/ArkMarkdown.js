// lib/ArkMarkdown.js - shows ARK LAW AI answers in a clean, readable layout.
//
// Understands the Markdown that ARK writes: headings, bold/italic, numbered and bullet lists,
// tables, quotes, links, images, code, and Mermaid diagrams (```mermaid). Authority blocks
// (**Authority:** ... one field per line) are shown as compact cards. Urdu text is shown
// right-to-left automatically. Used by all four country pages.
import { useEffect, useRef, useState } from "react";

const NAVY = "#021A4A";
const INK = "#2A1E10";
const MUTED = "#7A6A55";
const LINE = "#E3D9C6";

const RTL_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;
const isRtl = (t) => {
  const s = String(t || "");
  const ar = (s.match(RTL_RE) || []).length;
  const lat = (s.match(/[A-Za-z]/g) || []).length;
  return ar > 0 && ar >= lat * 0.6;
};
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : null);

// ── Mermaid (diagrams) ───────────────────────────────────────────────────────
const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js";
let mermaidPromise = null;
export function loadMermaid() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.mermaid) return Promise.resolve(window.mermaid);
  if (!mermaidPromise) {
    mermaidPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = MERMAID_URL;
      s.async = true;
      s.onload = () => {
        const m = window.mermaid;
        if (!m) return reject(new Error("Diagram engine did not start"));
        m.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          htmlLabels: false,
          flowchart: { htmlLabels: false, curve: "basis", padding: 12 },
          themeVariables: {
            fontFamily: "DM Sans, Arial, sans-serif",
            fontSize: "14px",
            primaryColor: "#FBF7EE",
            primaryBorderColor: "#C9A84C",
            primaryTextColor: "#1A1209",
            secondaryColor: "#EEF2FA",
            tertiaryColor: "#FFFFFF",
            lineColor: NAVY,
            textColor: "#1A1209",
          },
        });
        resolve(m);
      };
      s.onerror = () => { mermaidPromise = null; s.remove(); reject(new Error("Could not load the diagram engine")); };
      document.head.appendChild(s);
    });
  }
  return mermaidPromise;
}

let diagramCount = 0;
function MermaidDiagram({ code, complete }) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!complete) return undefined;
    let alive = true;
    setFailed(false);
    loadMermaid()
      .then((m) => m.render("ark-diagram-" + (++diagramCount), code))
      .then((r) => { if (alive) setSvg(r.svg); })
      .catch(() => {
        if (alive) setFailed(true);
        // Mermaid leaves an error element in the page when a diagram cannot be drawn
        try { document.querySelectorAll('[id^="dark-diagram-"], [id^="ark-diagram-"]').forEach((el) => { if (!el.closest(".ark-diagram")) el.remove(); }); } catch {}
      });
    return () => { alive = false; };
  }, [code, complete]);

  const box = { margin: "14px 0", padding: "14px", background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: "10px", overflowX: "auto", textAlign: "center" };
  if (!complete) return <div style={{ ...box, color: MUTED, fontSize: 13 }}>Drawing diagram...</div>;
  if (failed) {
    return (
      <div style={{ ...box, textAlign: "left" }}>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Diagram (could not be drawn here)</div>
        <pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap" }}>{code}</pre>
      </div>
    );
  }
  if (!svg) return <div style={{ ...box, color: MUTED, fontSize: 13 }}>Drawing diagram...</div>;
  return <div className="ark-diagram" style={box} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function AnswerImage({ src, alt, inline: isInline }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null; // a missing image is simply left out
  if (isInline) {
    return <img src={src} alt={alt || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)}
      style={{ maxWidth: "100%", maxHeight: "320px", height: "auto", verticalAlign: "middle", borderRadius: "6px" }} />;
  }
  return (
    <figure style={{ margin: "14px 0", textAlign: "center" }}>
      <img src={src} alt={alt || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)}
        style={{ maxWidth: "100%", maxHeight: "420px", height: "auto", borderRadius: "8px", border: "1px solid " + LINE }} />
      {alt ? <figcaption style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{alt}</figcaption> : null}
    </figure>
  );
}

// ── Inline formatting ────────────────────────────────────────────────────────
const INLINE_RE = /(!\[[^\]]*\]\([^)\s]+\)|\[[^\]]+\]\([^)\s]+\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

function inline(text, accent, keyBase) {
  const out = [];
  let last = 0, m, k = 0;
  const s = String(text || "");
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    const key = keyBase + "-" + k++;
    if (t.startsWith("![")) {
      const mm = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(t);
      const url = mm && safeUrl(mm[2]);
      if (url) out.push(<AnswerImage key={key} src={url} alt={mm[1]} inline />);
    } else if (t.startsWith("[")) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t);
      const url = mm && safeUrl(mm[2]);
      out.push(url ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: "2px" }}>{mm[1]}</a> : mm ? mm[1] : t);
    } else if (t.startsWith("***")) out.push(<strong key={key}><em>{t.slice(3, -3)}</em></strong>);
    else if (t.startsWith("**")) out.push(<strong key={key} style={{ color: "#1A1209" }}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={key} style={{ background: "#F3EEE2", borderRadius: 4, padding: "1px 5px", fontSize: "0.92em" }}>{t.slice(1, -1)}</code>);
    else if (t.startsWith("*")) out.push(<em key={key}>{t.slice(1, -1)}</em>);
    else out.push(<a key={key} href={t} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: "2px", wordBreak: "break-all" }}>{t}</a>);
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

// ── Block parsing ────────────────────────────────────────────────────────────
const FIELD_RE = /^\*\*([^*]{2,40}?):?\*\*:?\s*(.*)$/;

function parseBlocks(src) {
  const lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { blocks.push({ type: "gap" }); continue; }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim().toLowerCase();
      const code = [];
      let closed = false;
      i++;
      while (i < lines.length) {
        if (lines[i].trim().startsWith("```")) { closed = true; break; }
        code.push(lines[i]);
        i++;
      }
      blocks.push({ type: lang === "mermaid" ? "mermaid" : "code", text: code.join("\n"), complete: closed });
      continue;
    }
    let m;
    if ((m = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line))) { blocks.push({ type: "heading", level: m[1].length, text: m[2] }); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { blocks.push({ type: "hr" }); continue; }

    if (line.startsWith("|") && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {
      const cells = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = cells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      i--;
      blocks.push({ type: "table", head, rows });
      continue;
    }
    const indent = Math.floor(raw.match(/^\s*/)[0].replace(/\t/g, "  ").length / 2);
    if ((m = /^[-*•+]\s+(.*)$/.exec(line))) { blocks.push({ type: "bullet", level: Math.min(indent, 3), text: m[1] }); continue; }
    if ((m = /^(\d+)[.)]\s+(.*)$/.exec(line))) { blocks.push({ type: "number", n: m[1], level: Math.min(indent, 3), text: m[2] }); continue; }
    if ((m = /^>\s?(.*)$/.exec(line))) { blocks.push({ type: "quote", text: m[1] }); continue; }
    if ((m = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line))) { blocks.push({ type: "image", alt: m[1], src: m[2] }); continue; }
    if ((m = FIELD_RE.exec(line)) && m[2]) { blocks.push({ type: "field", label: m[1].trim(), text: m[2] }); continue; }
    blocks.push({ type: "para", text: line });
  }
  return blocks;
}

// Groups neighbouring list items, fields and quotes so they can be drawn together
function group(blocks) {
  const out = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if ((b.type === "bullet" || b.type === "number") && last && last.type === "list") { last.items.push(b); continue; }
    if (b.type === "bullet" || b.type === "number") { out.push({ type: "list", items: [b] }); continue; }
    if (b.type === "field" && last && last.type === "fields") { last.items.push(b); continue; }
    if (b.type === "field") { out.push({ type: "fields", items: [b] }); continue; }
    if (b.type === "quote" && last && last.type === "quotes") { last.items.push(b); continue; }
    if (b.type === "quote") { out.push({ type: "quotes", items: [b] }); continue; }
    out.push(b);
  }
  // a run of 1-2 "**Label:** text" lines reads better as normal paragraphs
  return out.map((b) => (b.type === "fields" && b.items.length < 3 ? { type: "fieldlines", items: b.items } : b));
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ArkMarkdown({ text, accent = "#C9A84C" }) {
  const blocks = group(parseBlocks(text));
  const els = [];
  let muted = false; // text under a "Disclaimer" heading is shown smaller
  const P = { margin: "0 0 10px", lineHeight: 1.65 };

  blocks.forEach((b, idx) => {
    const key = "b" + idx;
    const smallStyle = muted ? { fontSize: "12.5px", color: MUTED } : {};
    if (b.type === "gap") return;
    if (b.type === "heading") {
      muted = /disclaimer/i.test(b.text);
      const size = b.level <= 1 ? 18 : b.level === 2 ? 16.5 : b.level === 3 ? 15 : 14.5;
      const rtl = isRtl(b.text);
      els.push(
        <div key={key} dir={rtl ? "rtl" : undefined} role="heading" aria-level={Math.min(b.level + 1, 6)}
          style={{ fontSize: muted ? 13 : size, fontWeight: 700, color: muted ? MUTED : NAVY, margin: idx === 0 ? "0 0 8px" : "16px 0 8px", lineHeight: 1.35,
            paddingBottom: b.level <= 2 && !muted ? 5 : 0, borderBottom: b.level <= 2 && !muted ? "1px solid " + LINE : "none", textAlign: rtl ? "right" : undefined }}>
          {inline(b.text, accent, key)}
        </div>
      );
      return;
    }
    if (b.type === "para") {
      const rtl = isRtl(b.text);
      els.push(<p key={key} dir={rtl ? "rtl" : undefined} style={{ ...P, ...smallStyle, textAlign: rtl ? "right" : undefined }}>{inline(b.text, accent, key)}</p>);
      return;
    }
    if (b.type === "fieldlines") {
      b.items.forEach((f, j) => {
        const rtl = isRtl(f.label + f.text);
        els.push(<p key={key + "-" + j} dir={rtl ? "rtl" : undefined} style={{ ...P, ...smallStyle, textAlign: rtl ? "right" : undefined }}><strong style={{ color: "#1A1209" }}>{f.label}:</strong> {inline(f.text, accent, key + "-" + j)}</p>);
      });
      return;
    }
    if (b.type === "fields") {
      const rtl = isRtl(b.items.map((f) => f.label + " " + f.text).join(" "));
      els.push(
        <div key={key} dir={rtl ? "rtl" : undefined}
          style={{ margin: "6px 0 14px", border: "1px solid " + LINE, borderInlineStart: "3px solid " + accent, borderRadius: "8px", background: "#FFFDF8", padding: "8px 12px", display: "grid", gridTemplateColumns: "minmax(90px, max-content) 1fr", columnGap: "14px", rowGap: "5px", fontSize: "13.5px", lineHeight: 1.5 }}>
          {b.items.map((f, j) => [
            <div key={"l" + j} style={{ color: MUTED, fontWeight: 600, whiteSpace: "nowrap" }}>{f.label}</div>,
            <div key={"v" + j} style={{ color: INK, minWidth: 0, overflowWrap: "anywhere" }}>{inline(f.text, accent, key + "-" + j)}</div>,
          ])}
        </div>
      );
      return;
    }
    if (b.type === "list") {
      const rtl = isRtl(b.items.map((x) => x.text).join(" "));
      els.push(
        <div key={key} dir={rtl ? "rtl" : undefined} style={{ margin: "2px 0 12px", ...smallStyle }}>
          {b.items.map((it, j) => (
            <div key={j} style={{ display: "flex", gap: "8px", marginBottom: "6px", lineHeight: 1.6, paddingInlineStart: it.level * 18 }}>
              <span style={{ color: it.type === "number" ? NAVY : accent, fontWeight: 700, flexShrink: 0, minWidth: it.type === "number" ? "18px" : "10px" }}>
                {it.type === "number" ? it.n + "." : it.level % 2 ? "–" : "•"}
              </span>
              <span style={{ minWidth: 0 }}>{inline(it.text, accent, key + "-" + j)}</span>
            </div>
          ))}
        </div>
      );
      return;
    }
    if (b.type === "quotes") {
      const rtl = isRtl(b.items.map((x) => x.text).join(" "));
      els.push(
        <blockquote key={key} dir={rtl ? "rtl" : undefined} style={{ margin: "6px 0 14px", padding: "8px 14px", borderInlineStart: "3px solid " + accent, background: "#FBF7EE", borderRadius: "6px", color: "#4A402E", fontStyle: "italic" }}>
          {b.items.map((q, j) => <div key={j} style={{ margin: j ? "6px 0 0" : 0, lineHeight: 1.6 }}>{inline(q.text, accent, key + "-" + j)}</div>)}
        </blockquote>
      );
      return;
    }
    if (b.type === "table") {
      const rtl = isRtl(b.head.join(" ") + " " + b.rows.flat().join(" "));
      const cols = Math.max(b.head.length, ...b.rows.map((r) => r.length));
      const cell = { padding: "7px 10px", borderBottom: "1px solid " + LINE, verticalAlign: "top", textAlign: rtl ? "right" : "left" };
      els.push(
        <div key={key} style={{ overflowX: "auto", margin: "6px 0 14px", border: "1px solid " + LINE, borderRadius: "8px" }}>
          <table dir={rtl ? "rtl" : undefined} style={{ borderCollapse: "collapse", width: "100%", fontSize: "13.5px", lineHeight: 1.5, background: "#FFFFFF" }}>
            <thead>
              <tr>{Array.from({ length: cols }, (_, c) => <th key={c} style={{ ...cell, background: "#F3EEE2", color: NAVY, fontWeight: 700, whiteSpace: "nowrap" }}>{inline(b.head[c] || "", accent, key + "-h" + c)}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} style={{ background: ri % 2 ? "#FFFDF8" : "#FFFFFF" }}>
                  {Array.from({ length: cols }, (_, c) => <td key={c} style={cell}>{inline(r[c] || "", accent, key + "-" + ri + "-" + c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      return;
    }
    if (b.type === "image") { const u = safeUrl(b.src); if (u) els.push(<AnswerImage key={key} src={u} alt={b.alt} />); return; }
    if (b.type === "hr") { els.push(<hr key={key} style={{ border: "none", borderTop: "1px solid " + LINE, margin: "14px 0" }} />); return; }
    if (b.type === "mermaid") { els.push(<MermaidDiagram key={key} code={b.text} complete={b.complete} />); return; }
    if (b.type === "code") {
      els.push(<pre key={key} style={{ margin: "6px 0 14px", padding: "10px 12px", background: "#F6F2E9", border: "1px solid " + LINE, borderRadius: "8px", fontSize: "12.5px", whiteSpace: "pre-wrap", overflowX: "auto" }}>{b.text}</pre>);
    }
  });

  return <div className="ark-md" style={{ color: INK, overflowWrap: "break-word" }}>{els}</div>;
}
