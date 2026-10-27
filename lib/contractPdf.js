import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// the built-in PDF fonts only know basic Latin letters, so swap anything else
const clean = (s) =>
  String(s ?? '')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/…/g, '...')
    .replace(/[^\x20-\x7E\n -ÿ]/g, '?');

// Builds the signed agreement as a PDF. Returns the PDF bytes.
export async function contractPdf({ parts, c, signedAt }) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Design agreement - ${clean(c.name)}`);
  pdf.setAuthor('Kelv Studio');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const ink = rgb(0.04, 0.05, 0.06), soft = rgb(0.36, 0.39, 0.44);

  const W = 595.28, H = 841.89, M = 56, maxW = W - M * 2;
  let page = pdf.addPage([W, H]);
  let y = H - M;

  const newPageIfNeeded = (need) => { if (y - need < M) { page = pdf.addPage([W, H]); y = H - M; } };
  const lines = (text, f, size) => {
    const out = [];
    for (const para of clean(text).split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/)) {
        const test = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > maxW && line) { out.push(line); line = word; } else line = test;
      }
      out.push(line);
    }
    return out;
  };
  const write = (text, { f = font, size = 10.5, color = ink, gap = 4, after = 0 } = {}) => {
    for (const l of lines(text, f, size)) {
      newPageIfNeeded(size + gap);
      page.drawText(l, { x: M, y: y - size, size, font: f, color });
      y -= size + gap;
    }
    y -= after;
  };

  write('KELV STUDIO', { f: bold, size: 11, color: soft, after: 6 });
  write('Design agreement', { f: bold, size: 24, after: 6 });
  write('Between Kelv Studio (Kelvin Mensah, Auckland, New Zealand) and the client below.', { color: soft, after: 14 });

  const row = (k, v) => v && write(`${k}: ${v}`, { gap: 5 });
  row('Client', c.name);
  row('Email', c.email);
  row('Phone', c.phone);
  row('Church / business', c.organisation);
  row('Project', c.project);
  row('Agreed price', c.price != null && c.price !== '' ? `NZ$${Number(c.price).toFixed(2)}` : '');
  row('Delivery date', c.deadline);
  y -= 12;

  for (const p of parts) {
    if (p.heading) write(p.heading, { f: bold, size: 12, gap: 5, after: 2 });
    if (p.body) write(p.body, { after: 10 });
  }

  newPageIfNeeded(110);
  y -= 8;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: soft });
  y -= 18;
  write('Signed by the client', { f: bold, size: 12, after: 4 });
  write(c.signature, { f: italic, size: 20, after: 4 });
  write(`Signed online on ${signedAt} (NZ time). Typed name used as signature; the client ticked "I agree".`, { size: 9, color: soft });
  if (c.ip) write(`IP address: ${c.ip}`, { size: 9, color: soft });

  return pdf.save();
}
