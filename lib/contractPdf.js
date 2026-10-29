import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { LOGO_PNG } from './logoPng';

// the built-in PDF fonts only know basic Latin letters, so swap anything else
const clean = (s) =>
  String(s ?? '')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/…/g, '...')
    .replace(/[^\x20-\x7E\n -ÿ]/g, '?');

const nzd = (n) => `NZ$${Number(n).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const longDate = (iso) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');

// colours
const INK = rgb(0.043, 0.047, 0.059);
const SOFT = rgb(0.365, 0.392, 0.439);
const LINE = rgb(0.86, 0.87, 0.89);
const FILL = rgb(0.965, 0.969, 0.976);
const BLUE = rgb(0.184, 0.184, 0.894);

/*
  Builds the signed Design Services Agreement as a professional A4 PDF.
  c: { ref, name, email, phone, organisation, project, price, deadline, signature, ip }
  parts: [{ heading, body }] from the contract wording in the CMS
  Returns the PDF bytes.
*/
export async function contractPdf({ parts, c, signedAt, signedDate }) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Design Services Agreement ${c.ref || ''} - ${clean(c.name)}`);
  pdf.setAuthor('Kelv Studio');
  pdf.setSubject('Design Services Agreement');
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const script = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const logo = await pdf.embedPng(Buffer.from(LOGO_PNG, 'base64'));

  const W = 595.28, H = 841.89, M = 54, maxW = W - M * 2, BOTTOM = 64;
  let page, y;

  const wrap = (text, f, size, width) => {
    const out = [];
    for (const para of clean(text).split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const test = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > width && line) { out.push(line); line = word; } else line = test;
      }
      out.push(line);
    }
    return out;
  };
  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = H - M;
    // small running header on later pages
    if (pdf.getPageCount() > 1) {
      page.drawText('KELV STUDIO', { x: M, y: y - 8, size: 8, font: bold, color: SOFT });
      const t = 'Design Services Agreement';
      page.drawText(t, { x: W - M - reg.widthOfTextAtSize(t, 8), y: y - 8, size: 8, font: reg, color: SOFT });
      page.drawLine({ start: { x: M, y: y - 16 }, end: { x: W - M, y: y - 16 }, thickness: 0.5, color: LINE });
      y -= 36;
    }
  };
  const need = (h) => { if (y - h < BOTTOM) newPage(); };
  const text = (s, x, yy, size, f = reg, color = INK) => page.drawText(clean(s), { x, y: yy, size, font: f, color });
  const para = (s, { x = M, width = maxW, size = 10, f = reg, color = INK, lead = 1.5, after = 0 } = {}) => {
    for (const l of wrap(s, f, size, width)) {
      need(size * lead);
      text(l, x, y - size, size, f, color);
      y -= size * lead;
    }
    y -= after;
  };
  const label = (s, x, yy) => text(s.toUpperCase(), x, yy, 7.5, bold, SOFT);

  /* ---------- page 1 header ---------- */
  newPage();
  page.drawImage(logo, { x: M, y: y - 40, width: 40, height: 40 });
  text('KELV STUDIO', M + 52, y - 16, 13, bold);
  text('Graphic design  ·  Auckland, New Zealand', M + 52, y - 31, 8.5, reg, SOFT);
  const rx = W - M;
  const right = (s, yy, size, f = reg, color = INK) => text(s, rx - f.widthOfTextAtSize(clean(s), size), yy, size, f, color);
  right('AGREEMENT NO.', y - 12, 7.5, bold, SOFT);
  right(c.ref || '-', y - 24, 10, bold);
  right('DATE', y - 38, 7.5, bold, SOFT);
  right(signedDate, y - 50, 10);
  y -= 66;
  page.drawRectangle({ x: M, y, width: maxW, height: 2.5, color: BLUE });
  y -= 34;

  text('Design Services Agreement', M, y, 24, bold);
  y -= 22;
  para(`This agreement is made on ${signedDate} between Kelv Studio (the "Designer") and the client named below (the "Client").`, { size: 10, color: SOFT, after: 14 });

  /* ---------- parties ---------- */
  const colW = (maxW - 14) / 2;
  const party = (x, title, lines) => {
    const h = 20 + lines.length * 14 + 14;
    page.drawRectangle({ x, y: y - h, width: colW, height: h, color: FILL, borderColor: LINE, borderWidth: 0.6 });
    label(title, x + 14, y - 18);
    lines.forEach((l, i) => text(l.t, x + 14, y - 36 - i * 14, l.b ? 11 : 9.5, l.b ? bold : reg, l.b ? INK : SOFT));
    return h;
  };
  const designer = [{ t: 'Kelv Studio', b: true }, { t: 'Kelvin Mensah' }, { t: 'Auckland, New Zealand' }, { t: 'kelvstudio.design@gmail.com' }];
  const client = [{ t: c.name, b: true }, c.organisation && { t: c.organisation }, { t: c.email }, c.phone && { t: c.phone }].filter(Boolean);
  while (client.length < designer.length) client.push({ t: '' });
  need(110);
  const ph = Math.max(party(M, 'Designer', designer), party(M + colW + 14, 'Client', client));
  y -= ph + 26;

  /* ---------- project summary ---------- */
  const depositPct = (() => { const m = parts.map((p) => p.body).join(' ').match(/(\d{1,3})\s?%\s+deposit/i); return m ? Number(m[1]) : 50; })();
  const rows = [['Project', c.project]];
  if (c.price != null) {
    const dep = Math.round(c.price * depositPct) / 100;
    rows.push(['Agreed price', nzd(c.price)], [`Deposit (${depositPct}%)`, `${nzd(dep)}  -  due before work starts`], ['Balance', `${nzd(c.price - dep)}  -  due before final files are sent`]);
  } else {
    rows.push(['Agreed price', 'To be confirmed in writing']);
  }
  rows.push(['Delivery date', c.deadline ? longDate(c.deadline) : 'To be agreed']);
  need(30);
  text('Project summary', M, y - 13, 13, bold);
  y -= 26;
  const labW = 120;
  rows.forEach(([k, v], i) => {
    const ls = wrap(v, reg, 10, maxW - labW - 28);
    const h = Math.max(1, ls.length) * 14 + 14;
    need(h);
    if (i === 0) page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
    page.drawRectangle({ x: M, y: y - h, width: labW, height: h, color: FILL });
    text(k, M + 12, y - 18, 9, bold, SOFT);
    ls.forEach((l, j) => text(l, M + labW + 14, y - 18 - j * 14, 10));
    y -= h;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
  });
  y -= 30;

  /* ---------- terms ---------- */
  need(40);
  text('Terms and conditions', M, y - 13, 13, bold);
  y -= 30;
  const ind = 26;
  for (const p of parts) {
    if (!p.heading) { // closing line, e.g. "By signing below, you agree to these terms."
      y -= 4;
      para(p.body, { size: 10, f: italic, color: SOFT, after: 6 });
      continue;
    }
    const m = p.heading.match(/^(\d+)[.)]\s*(.*)$/);
    const num = m ? m[1] : '', head = m ? m[2] : p.heading;
    const bodyLines = wrap(p.body || '', reg, 9.5, maxW - ind);
    need(16 + Math.min(3, bodyLines.length) * 14.5); // keep the heading with its first lines
    text(num, M, y - 11, 11, bold, BLUE);
    text(head, M + ind, y - 11, 11, bold);
    y -= 19;
    for (const l of bodyLines) { need(14.5); text(l, M + ind, y - 9.5, 9.5, reg, rgb(0.17, 0.18, 0.21)); y -= 14.5; }
    y -= 10;
  }

  /* ---------- signatures ---------- */
  need(170);
  y -= 14;
  text('Signatures', M, y - 13, 13, bold);
  y -= 34;
  const sig = (x, role, signName, name, sub, date, pending) => {
    label(role, x, y);
    if (pending) text(signName, x, y - 40, 11, italic, SOFT);
    else text(signName, x, y - 40, 24, script);
    page.drawLine({ start: { x, y: y - 50 }, end: { x: x + colW - 10, y: y - 50 }, thickness: 0.8, color: INK });
    text(name, x, y - 66, 10, bold);
    text(sub, x, y - 80, 9, reg, SOFT);
    text(date, x, y - 94, 9, reg, SOFT);
  };
  sig(M, 'Client', c.signature, c.name, c.organisation || c.email, `Signed electronically on ${signedAt}`);
  // Kelvin doesn't sign automatically: the price and date the client typed still need his OK
  sig(M + colW + 14, 'Designer', 'Awaiting confirmation', 'Kelvin Mensah', 'Kelv Studio', 'To be confirmed in writing', true);
  y -= 116;
  para(`The Client signed this agreement online by typing their full name and ticking "I agree"${c.ip ? ` (IP address ${c.ip})` : ''}. The price and delivery date above were entered by the Client and become final once Kelv Studio confirms them in writing (by email or message). Both parties keep a copy of this PDF as the record of the agreement.`, { size: 8, color: SOFT });

  /* ---------- footer on every page ---------- */
  const pages = pdf.getPages();
  pages.forEach((pg, i) => {
    pg.drawLine({ start: { x: M, y: 44 }, end: { x: W - M, y: 44 }, thickness: 0.5, color: LINE });
    pg.drawText(clean(`Kelv Studio  ·  Agreement ${c.ref || ''}`), { x: M, y: 30, size: 8, font: reg, color: SOFT });
    const t = `Page ${i + 1} of ${pages.length}`;
    pg.drawText(t, { x: W - M - reg.widthOfTextAtSize(t, 8), y: 30, size: 8, font: reg, color: SOFT });
  });

  return pdf.save();
}
