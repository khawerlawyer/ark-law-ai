// lib/arkExport.js - turns an ARK LAW AI answer (Markdown) into a real PDF or Word (.docx) file.
//
// Runs in the user's browser and is loaded only when someone clicks Download, so pages stay fast
// and the answer is never sent anywhere else to be converted.
// Supports English, Spanish, Urdu (right-to-left), Hindi and Bangla.
//
//   import("../lib/arkExport").then(m => m.downloadAnswer({ markdown, format: "pdf", jurisdiction: "Pakistan" }))

const NAVY = "#021A4A";
const GOLD = "#C9A84C";
const INK = "#1A1209";
const MUTED = "#6E6352";
const LINE = "#D9CEB6";

// ── Text clean-up ────────────────────────────────────────────────────────────
// Document fonts cannot draw emoji. The words after ARK's status icons already say what they mean.
const EMOJI_WORDS = [[/[\u2705\u2714\u274C\u26A0\u2796\u2139]\uFE0F?\s*/g, ""]];

export function cleanAnswer(md) {
  let s = String(md || "");
  s = s.replace(/\[\[ARK_FILE:[^\]]*\]\]/g, "");          // download marker
  s = s.replace(/^\s*\[System:[\s\S]*?\]\s*/, "");          // internal instructions, if any slipped in
  for (const [re, word] of EMOJI_WORDS) s = s.replace(re, word);
  s = s.replace(/\p{Extended_Pictographic}️?/gu, "");   // any other emoji (fonts cannot draw them)
  s = s.replace(/\r\n?/g, "\n");
  return s.trim();
}

// ── Markdown → blocks ────────────────────────────────────────────────────────
function inlineRuns(text) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index) });
    const t = m[0];
    if (t.startsWith("**") || t.startsWith("__")) runs.push({ text: t.slice(2, -2), bold: true });
    else if (t.startsWith("`")) runs.push({ text: t.slice(1, -1), code: true });
    else if (t.startsWith("[")) {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t);
      runs.push({ text: mm[1] });
      if (mm[2] && mm[2] !== mm[1]) runs.push({ text: " (" + mm[2] + ")" });
    } else runs.push({ text: t.slice(1, -1), italic: true });
    last = m.index + t.length;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs.filter((r) => r.text);
}

const plain = (runs) => runs.map((r) => r.text).join("");

export function parseMarkdown(md) {
  const lines = cleanAnswer(md).split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("```")) {                       // code block
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(line))) { blocks.push({ type: "heading", level: m[1].length, runs: inlineRuns(m[2].replace(/#+\s*$/, "")) }); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { blocks.push({ type: "hr" }); continue; }

    if (line.startsWith("|") && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {   // table
      const rows = [];
      const cells = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => inlineRuns(c.trim()));
      rows.push(cells(line));
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      i--;
      const cols = Math.max(...rows.map((r) => r.length));
      rows.forEach((r) => { while (r.length < cols) r.push([]); });
      blocks.push({ type: "table", rows });
      continue;
    }
    const indent = Math.floor((raw.match(/^\s*/)[0].replace(/\t/g, "  ").length) / 2);
    if ((m = /^[-*•+]\s+(.*)$/.exec(line))) { blocks.push({ type: "bullet", level: Math.min(indent, 3), runs: inlineRuns(m[1]) }); continue; }
    if ((m = /^(\d+)[.)]\s+(.*)$/.exec(line))) { blocks.push({ type: "number", n: m[1], level: Math.min(indent, 3), runs: inlineRuns(m[2]) }); continue; }
    if ((m = /^>\s?(.*)$/.exec(line))) { blocks.push({ type: "quote", runs: inlineRuns(m[1]) }); continue; }
    blocks.push({ type: "para", runs: inlineRuns(line) });
  }
  return blocks;
}

// ── Scripts and fonts ────────────────────────────────────────────────────────
export function scriptOf(text) {
  let ar = 0, dev = 0, bn = 0, lat = 0;
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if ((c >= 0x0600 && c <= 0x06ff) || (c >= 0x0750 && c <= 0x077f) || (c >= 0xfb50 && c <= 0xfeff)) ar++;
    else if (c >= 0x0900 && c <= 0x097f) dev++;
    else if (c >= 0x0980 && c <= 0x09ff) bn++;
    else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0xc0 && c <= 0x24f)) lat++;
  }
  const best = Math.max(ar, dev, bn);
  if (best === 0 || best < lat * 0.25) return "latin";
  return best === ar ? "arabic" : best === dev ? "devanagari" : "bengali";
}

const FONT_FILES = {
  latin: ["NotoSans-Regular.ttf", "NotoSans-Bold.ttf"],
  arabic: ["NotoNaskhArabic-Regular.ttf", "NotoNaskhArabic-Bold.ttf"],
  devanagari: ["NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari-Bold.ttf"],
  bengali: ["NotoSansBengali-Regular.ttf", "NotoSansBengali-Bold.ttf"],
};
const fontCache = {};
async function fetchBytes(url) {
  if (!fontCache[url]) {
    fontCache[url] = fetch(url).then((r) => {
      if (!r.ok) throw new Error("Could not load " + url);
      return r.arrayBuffer();
    });
  }
  return fontCache[url];
}

let pdfkitPromise = null;
function loadPdfKit() {
  if (typeof window !== "undefined" && window.PDFDocument) return Promise.resolve(window.PDFDocument);
  if (!pdfkitPromise) {
    pdfkitPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/vendor/pdfkit.standalone.js";
      s.async = true;
      s.onload = () => (window.PDFDocument ? resolve(window.PDFDocument) : reject(new Error("PDF engine did not load")));
      s.onerror = () => { pdfkitPromise = null; reject(new Error("Could not load the PDF engine")); };
      document.head.appendChild(s);
    });
  }
  return pdfkitPromise;
}

// ── Titles and file names ────────────────────────────────────────────────────
export function deriveTitle(md, fallback) {
  const blocks = parseMarkdown(md);
  const h = blocks.find((b) => b.type === "heading");
  let t = h ? plain(h.runs) : "";
  if (!t) {
    const b = blocks.find((x) => x.type === "para" && x.runs.length === 1 && x.runs[0].bold);
    if (b) t = plain(b.runs);
  }
  t = (t || fallback || "ARK LAW AI Answer").replace(/[:\s]+$/, "").trim();
  return t.length > 90 ? t.slice(0, 87) + "..." : t;
}

function fileName(title, ext) {
  const d = new Date();
  const date = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  let slug = String(title || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
  if (slug.length < 3) slug = "ARK_LAW_AI_Document";
  return slug + "_" + date + "." + ext;
}

function todayText() {
  try { return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return new Date().toDateString(); }
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ── PDF ──────────────────────────────────────────────────────────────────────
async function buildPdf(blocks, { title, jurisdiction, branded }) {
  const PDFDocument = await loadPdfKit();
  const needed = new Set(["latin"]);
  for (const b of blocks) {
    const t = b.runs ? plain(b.runs) : b.rows ? b.rows.flat().map(plain).join(" ") : "";
    if (t) needed.add(scriptOf(t));
  }
  needed.add(scriptOf(title));
  const fontBytes = {};
  await Promise.all([...needed].map(async (sc) => {
    const [r, b] = FONT_FILES[sc];
    fontBytes[sc] = [await fetchBytes("/fonts/" + r), await fetchBytes("/fonts/" + b)];
  }));
  const logo = branded ? await fetchBytes("/ark-doc-logo.png").catch(() => null) : null;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 54, bottom: 70, left: 58, right: 58 },
    bufferPages: true,
    info: { Title: title, Author: "ARK LAW AI", Creator: "ARK LAW AI (arklaw.ai)", Producer: "ARK LAW AI" },
  });
  for (const sc of Object.keys(fontBytes)) {
    doc.registerFont(sc, fontBytes[sc][0]);
    doc.registerFont(sc + "-bold", fontBytes[sc][1]);
  }
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((res) => doc.on("end", res));

  const L = doc.page.margins.left;
  const W = doc.page.width - L - doc.page.margins.right;
  const bottom = () => doc.page.height - doc.page.margins.bottom;
  const ensure = (h) => { if (doc.y + h > bottom()) doc.addPage(); };
  const fontFor = (text, bold) => scriptOf(text) + (bold ? "-bold" : "");

  // Letterhead (first page)
  if (branded) {
    const top = doc.y;
    if (logo) doc.image(logo, L, top, { height: 40 });
    const tx = L + (logo ? 50 : 0);
    doc.font("latin-bold").fontSize(15).fillColor(NAVY).text("ARK LAW AI", tx, top + 4, { lineBreak: false });
    doc.font("latin").fontSize(9).fillColor(MUTED).text("Legal Intelligence" + (jurisdiction ? "  |  " + jurisdiction : ""), tx, top + 24, { lineBreak: false });
    doc.font("latin").fontSize(9).fillColor(MUTED).text(todayText(), L, top + 24, { width: W, align: "right", lineBreak: false });
    doc.moveTo(L, top + 50).lineTo(L + W, top + 50).lineWidth(1.4).strokeColor(GOLD).stroke();
    doc.x = L; doc.y = top + 64;
  }

  // Right-to-left (Urdu) text. PDFKit has no bidirectional support, so lines are built here:
  // words are wrapped in reading order, then placed from the right edge. Runs of English words
  // and numbers keep their left-to-right order, so "Section 302 PPC" and "497" read correctly.
  const ARABIC_LETTER = /[\u0621-\u064A\u066E-\u06D3\u06D5\u06FA-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const drawRtl = (runs, { x, width, size, bold, color }) => {
    const words = [];
    for (const r of runs) {
      for (const w of r.text.split(/\s+/)) if (w) words.push({ text: w, bold: !!(bold || r.bold), rtl: ARABIC_LETTER.test(w) });
    }
    const lineH = size * 1.75;
    const opt = (w) => (w.rtl ? { lineBreak: false, features: ["rtla"] } : { lineBreak: false });
    words.forEach((w) => {
      doc.font("arabic" + (w.bold ? "-bold" : "")).fontSize(size);
      w.w = doc.widthOfString(w.text, opt(w));
    });
    doc.font("arabic").fontSize(size);
    const space = doc.widthOfString(" ") * 1.7;
    const lines = [];
    let cur = [], curW = 0;
    for (const w of words) {
      const add = (cur.length ? space : 0) + w.w;
      if (cur.length && curW + add > width) { lines.push(cur); cur = [w]; curW = w.w; }
      else { cur.push(w); curW += add; }
    }
    if (cur.length) lines.push(cur);
    for (const line of lines) {
      if (doc.y + lineH > bottom()) doc.addPage();
      const y = doc.y;
      const units = [];                     // neighbouring left-to-right words stay together, in order
      for (const w of line) {
        const last = units[units.length - 1];
        if (!w.rtl && last && !last.rtl) last.words.push(w);
        else units.push({ rtl: w.rtl, words: [w] });
      }
      let xr = x + width;
      for (const u of units) {
        const uw = u.words.reduce((a, w) => a + w.w, 0) + space * (u.words.length - 1);
        let xx = xr - uw;
        for (const w of u.words) {
          doc.font("arabic" + (w.bold ? "-bold" : "")).fontSize(size).fillColor(color).text(w.text, xx, y, opt(w));
          xx += w.w + space;
        }
        xr -= uw + space;
      }
      doc.x = x;
      doc.y = y + lineH;
    }
  };

  // Writes a paragraph of inline runs (bold, italic, code).
  const writeRuns = (runs, opts) => {
    const text = plain(runs);
    const sc = scriptOf(text);
    const size = opts.size || 10.5;
    const color = opts.color || INK;
    const x = opts.x != null ? opts.x : L;
    const width = opts.width || W - (x - L);
    if (sc === "arabic") {
      drawRtl(runs, { x, width, size, bold: opts.bold, color });
      return;
    }
    runs.forEach((r, i) => {
      const bold = opts.bold || r.bold;
      doc.font(sc + (bold ? "-bold" : "")).fontSize(r.code ? size - 0.5 : size).fillColor(r.code ? "#6B3A00" : color);
      const o = { width, lineGap: 3, continued: i < runs.length - 1 };
      if (i === 0) doc.text(r.text, x, doc.y, o); else doc.text(r.text, o);
    });
    if (!runs.length) doc.text(" ", x, doc.y, { width });
  };

  // Document title
  writeRuns([{ text: title }], { size: 18, bold: true, color: NAVY });
  doc.moveDown(0.7);

  for (const b of blocks) {
    doc.x = L;
    if (b.type === "heading") {
      const size = b.level <= 1 ? 16 : b.level === 2 ? 14 : 12;
      ensure(size * 3);
      doc.moveDown(b.level <= 2 ? 0.6 : 0.4);
      writeRuns(b.runs, { size, bold: true, color: NAVY });
      if (b.level <= 2) {
        const y = doc.y + 2;
        doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.6).strokeColor(LINE).stroke();
        doc.y = y + 6;
      } else doc.moveDown(0.25);
    } else if (b.type === "para") {
      ensure(16);
      writeRuns(b.runs, {});
      doc.moveDown(0.45);
    } else if (b.type === "bullet" || b.type === "number") {
      ensure(16);
      const rtl = scriptOf(plain(b.runs)) === "arabic";
      const ind = 14 + b.level * 16;
      const mark = b.type === "bullet" ? (b.level % 2 ? "–" : "•") : b.n + ".";
      const y = doc.y;
      const markW = b.type === "bullet" ? 12 : 20;
      if (rtl) {
        doc.font("latin").fontSize(10.5).fillColor(GOLD).text(mark, L + W - ind, y, { width: markW, lineBreak: false });
        doc.y = y;
        writeRuns(b.runs, { x: L, width: W - ind - 4 });
      } else {
        doc.font("latin-bold").fontSize(10.5).fillColor(b.type === "bullet" ? GOLD : NAVY).text(mark, L + ind - markW + 8, y, { width: markW, lineBreak: false });
        doc.y = y;
        writeRuns(b.runs, { x: L + ind + 8, width: W - ind - 8 });
      }
      doc.moveDown(0.3);
    } else if (b.type === "quote") {
      ensure(18);
      const y0 = doc.y;
      writeRuns(b.runs, { x: L + 14, width: W - 14, color: "#4A402E" });
      doc.moveTo(L + 3, y0).lineTo(L + 3, doc.y).lineWidth(2.5).strokeColor(GOLD).stroke();
      doc.moveDown(0.45);
    } else if (b.type === "hr") {
      ensure(14);
      doc.moveDown(0.3);
      doc.moveTo(L, doc.y).lineTo(L + W, doc.y).lineWidth(0.8).strokeColor(GOLD).stroke();
      doc.moveDown(0.7);
    } else if (b.type === "code") {
      doc.font("latin").fontSize(9);
      const h = doc.heightOfString(b.text, { width: W - 16 }) + 12;
      ensure(Math.min(h, 200));
      const y = doc.y;
      doc.rect(L, y, W, h).fillColor("#F6F2E9").fill();
      doc.fillColor(INK).text(b.text, L + 8, y + 6, { width: W - 16 });
      doc.y = y + h + 6;
    } else if (b.type === "table") {
      const cols = b.rows[0].length;
      const lens = Array.from({ length: cols }, (_, c) => Math.max(4, ...b.rows.map((r) => Math.min(60, plain(r[c]).length))));
      const total = lens.reduce((a, n) => a + n, 0);
      const widths = lens.map((n) => Math.max(54, (n / total) * W));
      const scale = W / widths.reduce((a, n) => a + n, 0);
      for (let c = 0; c < cols; c++) widths[c] *= scale;
      const pad = 5;
      b.rows.forEach((row, ri) => {
        const head = ri === 0;
        const heights = row.map((cell, c) => {
          const t = plain(cell) || " ";
          doc.font(fontFor(t, head)).fontSize(9.5);
          const h = doc.heightOfString(t, { width: widths[c] - pad * 2 });
          return (scriptOf(t) === "arabic" ? h * 1.5 : h) + pad * 2;
        });
        const h = Math.max(...heights, 18);
        if (doc.y + h > bottom()) doc.addPage();
        const y = doc.y;
        let x = L;
        row.forEach((cell, c) => {
          if (head) doc.rect(x, y, widths[c], h).fillColor("#F3EEE2").fill();
          doc.rect(x, y, widths[c], h).lineWidth(0.6).strokeColor(LINE).stroke();
          const t = plain(cell);
          if (scriptOf(t) === "arabic") {
            doc.y = y + pad;
            drawRtl(cell, { x: x + pad, width: widths[c] - pad * 2, size: 9.5, bold: head, color: head ? NAVY : INK });
          } else {
            doc.font(fontFor(t || " ", head)).fontSize(9.5).fillColor(head ? NAVY : INK)
              .text(t, x + pad, y + pad, { width: widths[c] - pad * 2 });
          }
          x += widths[c];
        });
        doc.x = L; doc.y = y + h;
      });
      doc.moveDown(0.6);
    }
  }

  // Footer with page numbers on every page
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const y = doc.page.height - 44;
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.moveTo(L, y - 8).lineTo(L + W, y - 8).lineWidth(0.5).strokeColor(LINE).stroke();
    doc.font("latin").fontSize(8).fillColor(MUTED);
    if (branded) doc.text("Prepared with ARK LAW AI  |  arklaw.ai", L, y, { width: W, lineBreak: false });
    doc.text("Page " + (i + 1) + " of " + range.count, L, y, { width: W, align: "right", lineBreak: false });
    doc.page.margins.bottom = oldBottom;
  }
  doc.end();
  await done;
  return new Blob(chunks, { type: "application/pdf" });
}

// ── Word (.docx) ─────────────────────────────────────────────────────────────
async function buildDocx(blocks, { title, jurisdiction, branded }) {
  const d = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType,
    BorderStyle, ShadingType, Header, Footer, PageNumber, ImageRun, LevelFormat } = d;
  const logo = branded ? await fetchBytes("/ark-doc-logo.png").catch(() => null) : null;

  const runOpts = (r, extra = {}) => ({
    text: r.text,
    bold: !!(r.bold || extra.bold),
    italics: !!r.italic,
    color: (extra.color || INK).replace("#", ""),
    size: extra.size || 22,
    sizeComplexScript: extra.size || 22,
    font: r.code ? "Courier New" : undefined,
    rightToLeft: !!extra.rtl,
  });
  const para = (runs, extra = {}) => {
    const rtl = scriptOf(plain(runs)) === "arabic";
    return new Paragraph({
      bidirectional: rtl,                 // right-to-left paragraphs start on the right by themselves
      spacing: { after: extra.after != null ? extra.after : 120, line: 300 },
      heading: extra.heading,
      numbering: extra.numbering,
      indent: extra.indent,
      border: extra.border,
      children: runs.map((r) => new TextRun(runOpts(r, { ...extra, rtl }))),
    });
  };

  const body = [];
  body.push(para([{ text: title, bold: true }], { size: 34, color: NAVY, after: 240 }));
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: LINE.replace("#", "") };

  for (const b of blocks) {
    if (b.type === "heading") {
      const size = b.level <= 1 ? 30 : b.level === 2 ? 27 : 24;
      body.push(para(b.runs, {
        bold: true, size, color: NAVY, after: 100,
        heading: b.level <= 1 ? HeadingLevel.HEADING_1 : b.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
        border: b.level <= 2 ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE.replace("#", ""), space: 4 } } : undefined,
      }));
    } else if (b.type === "para") {
      body.push(para(b.runs));
    } else if (b.type === "bullet") {
      body.push(para(b.runs, { numbering: { reference: "ark-bullets", level: b.level }, after: 60 }));
    } else if (b.type === "number") {
      body.push(para(b.runs, { numbering: { reference: "ark-numbers", level: b.level }, after: 60 }));
    } else if (b.type === "quote") {
      body.push(para(b.runs, { color: "#4A402E", indent: { left: 360 }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: GOLD.replace("#", ""), space: 8 } } }));
    } else if (b.type === "hr") {
      body.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD.replace("#", ""), space: 1 } }, spacing: { after: 160 } }));
    } else if (b.type === "code") {
      b.text.split("\n").forEach((l) => body.push(para([{ text: l || " ", code: true }], { size: 19, after: 0 })));
      body.push(new Paragraph({ spacing: { after: 120 } }));
    } else if (b.type === "table") {
      body.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: b.rows.map((row, ri) => new TableRow({
          tableHeader: ri === 0,
          children: row.map((cell) => new TableCell({
            shading: ri === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "F3EEE2" } : undefined,
            borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
            margins: { top: 60, bottom: 60, left: 90, right: 90 },
            children: [para(cell.length ? cell : [{ text: "" }], { bold: ri === 0, color: ri === 0 ? NAVY : INK, size: 20, after: 0 })],
          })),
        })),
      }));
      body.push(new Paragraph({ spacing: { after: 160 } }));
    }
  }

  const headerChildren = [];
  if (branded) {
    const parts = [];
    if (logo) parts.push(new ImageRun({ data: logo, type: "png", transformation: { width: 34, height: 34 } }));
    parts.push(new TextRun({ text: (logo ? "  " : "") + "ARK LAW AI", bold: true, color: NAVY.replace("#", ""), size: 26 }));
    parts.push(new TextRun({ text: "   Legal Intelligence" + (jurisdiction ? "  |  " + jurisdiction : "") + "  |  " + todayText(), color: MUTED.replace("#", ""), size: 17 }));
    headerChildren.push(new Paragraph({ children: parts, border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: GOLD.replace("#", ""), space: 6 } }, spacing: { after: 200 } }));
  }
  const footerRuns = [];
  if (branded) footerRuns.push(new TextRun({ text: "Prepared with ARK LAW AI  |  arklaw.ai          ", color: MUTED.replace("#", ""), size: 16 }));
  const fr = (children) => new TextRun({ children, color: MUTED.replace("#", ""), size: 16 });
  footerRuns.push(fr(["Page "]), fr([PageNumber.CURRENT]), fr([" of "]), fr([PageNumber.TOTAL_PAGES]));

  const bulletLevels = [0, 1, 2, 3].map((level) => ({
    level, format: LevelFormat.BULLET, text: level % 2 ? "–" : "•", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360 + level * 360, hanging: 260 } } },
  }));
  const numberLevels = [0, 1, 2, 3].map((level) => ({
    level, format: level % 2 ? LevelFormat.LOWER_LETTER : LevelFormat.DECIMAL, text: "%" + (level + 1) + ".", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360 + level * 360, hanging: 300 } } },
  }));

  const doc = new Document({
    creator: "ARK LAW AI",
    title,
    description: "Prepared with ARK LAW AI (arklaw.ai)",
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    numbering: { config: [{ reference: "ark-bullets", levels: bulletLevels }, { reference: "ark-numbers", levels: numberLevels }] },
    sections: [{
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1134, right: 1134 } } },
      headers: headerChildren.length ? { default: new Header({ children: headerChildren }) } : undefined,
      footers: { default: new Footer({ children: [new Paragraph({ alignment: branded ? AlignmentType.LEFT : AlignmentType.RIGHT, children: footerRuns })] }) },
      children: body,
    }],
  });
  return Packer.toBlob(doc);
}

// ── Public entry point ───────────────────────────────────────────────────────
// format: "pdf" | "docx". branded=false gives a clean document (no ARK letterhead), e.g. for drafted contracts.
export async function downloadAnswer(options) {
  const { blob, name } = await makeFile(options);
  saveBlob(blob, name);
  return blob;
}

// Builds the file without downloading it.
export async function makeFile({ markdown, format = "pdf", title, jurisdiction, branded = true }) {
  const blocks = parseMarkdown(markdown);
  if (!blocks.length) throw new Error("There is nothing to download yet.");
  const docTitle = title || deriveTitle(markdown, "ARK LAW AI Answer");
  // Don't repeat the title if the answer starts with the same heading
  const first = blocks[0];
  if (first && first.type === "heading" && plain(first.runs).trim() === docTitle.trim()) blocks.shift();
  const opts = { title: docTitle, jurisdiction, branded };
  const blob = format === "docx" ? await buildDocx(blocks, opts) : await buildPdf(blocks, opts);
  return { blob, name: fileName(docTitle, format === "docx" ? "docx" : "pdf") };
}

// Which formats the answer asked for, from the [[ARK_FILE:...]] marker ARK adds when a user requests a file.
export function requestedFormats(md) {
  const m = /\[\[ARK_FILE:([a-z,\s]+)\]\]/i.exec(String(md || ""));
  if (!m) return null;
  const f = m[1].toLowerCase().split(/[,\s]+/).filter((x) => x === "pdf" || x === "docx");
  return f.length ? f : ["pdf", "docx"];
}

// Hides the marker (and a half-streamed one) from what the user sees.
export function stripFileMarker(md) {
  return String(md || "").replace(/\n?\[\[ARK_FILE:[^\]]*\]\]/g, "").replace(/\n?\[\[[A-Z_:a-z,]*\]?$/, "");
}
