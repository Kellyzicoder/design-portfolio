import { NextResponse } from 'next/server';
import { sendEmail, table, esc, isEmail } from '@/lib/email';
import { insertRow, uploadFile, dbReady, safeName } from '@/lib/db';
import { notifyCrm } from '@/lib/notify';
import { ITEMS, COLOURS, GROUPS, isHex } from '@/lib/printItems';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 4.3 * 1024 * 1024; // all files together
const FILE_KEYS = ['design_front', 'design_back', 'mockup_front', 'mockup_back'];
const field = (fd, k, max = 2000) => String(fd.get(k) || '').trim().slice(0, max);
const dateOrNull = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const json = (v) => { try { const o = JSON.parse(v); return o && typeof o === 'object' ? o : {}; } catch { return {}; } };

export async function POST(req) {
  let fd;
  try { fd = await req.formData(); } catch { return NextResponse.json({ error: 'The form could not be read. Please try again.' }, { status: 400 }); }

  // bots: hidden field filled in, or sent too fast to be a person
  if (field(fd, 'website') || Number(fd.get('t') || 0) < 3000) return NextResponse.json({ ok: true });

  const itemKey = field(fd, 'item', 20);
  const item = ITEMS[itemKey];
  const sizes = json(field(fd, 'sizes', 500));
  const r = {
    name: field(fd, 'name', 120),
    email: field(fd, 'email', 200),
    phone: field(fd, 'phone', 40),
    organisation: field(fd, 'organisation', 200),
    item: item ? item.label : '',
    // a named colour (clothing etc.) or any #hex background colour for prints
    colour: COLOURS.some((c) => c.name === field(fd, 'colour', 30)) || (item && !item.colours && isHex(field(fd, 'colour', 30))) ? field(fd, 'colour', 30) : null,
    size_option: item && item.options && item.options.includes(field(fd, 'size_option', 80)) ? field(fd, 'size_option', 80) : null,
    quantity: Math.min(99999, Math.max(0, parseInt(field(fd, 'quantity', 7), 10) || 0)),
    sizes,
    placement: json(field(fd, 'placement', 1000)),
    deadline: dateOrNull(field(fd, 'deadline', 10)),
    notes: field(fd, 'notes', 5000),
    source: field(fd, 'source', 120),
    utm_source: field(fd, 'utm_source', 120),
    utm_campaign: field(fd, 'utm_campaign', 120),
  };

  const files = FILE_KEYS
    .map((k) => ({ key: k, f: fd.get(k) }))
    .filter(({ f }) => f && typeof f === 'object' && f.size > 0 && /^image\/(png|jpeg|webp)$/.test(f.type));
  if (!r.name || !isEmail(r.email) || !item || r.quantity < 1 || !files.some((x) => x.key.startsWith('design_'))) {
    return NextResponse.json({ error: 'Please fill in your name, a valid email, how many you need, and upload your design.' }, { status: 400 });
  }
  if (files.reduce((n, x) => n + x.f.size, 0) > MAX_BYTES) {
    return NextResponse.json({ error: 'Your files are too big. Please send a smaller image (4 MB in total).' }, { status: 400 });
  }
  const filesData = await Promise.all(files.map(async ({ key, f }) => ({ key, name: `${key}-${safeName(f.name)}`, type: f.type, bytes: Buffer.from(await f.arrayBuffer()) })));

  let saved = false, emailed = false, savedId = null;
  const problems = [];

  if (dbReady) {
    try {
      const folder = `print-quotes/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
      const paths = {};
      for (const f of filesData) paths[f.key] = await uploadFile(`${folder}/${f.name}`, f.bytes, f.type);
      const row = await insertRow('print_quotes', { ...r, files: paths });
      savedId = row && row.id;
      saved = true;
    } catch (e) { problems.push(e.message); }
  }

  const sizeText = Object.entries(sizes).map(([s, n]) => `${s} × ${n}`).join(', ');
  const what = item.colours ? [r.colour, r.item].filter(Boolean).join(' ') : `${r.item}${r.colour ? ` (background ${r.colour})` : ''}`;
  try {
    await sendEmail({
      subject: `New print quote: ${r.quantity} × ${what} for ${r.name}`,
      replyTo: r.email,
      html: `<h2 style="font-family:Arial,sans-serif">New print quote request</h2>${table([
        ['Name', r.name], ['Email', r.email], ['Phone', r.phone], ['Business / church', r.organisation],
        ['Item', what], ['Type', (GROUPS.find((g) => g.key === item.group) || {}).label], [item.optionLabel || 'Size', r.size_option], ['Quantity', r.quantity], ['Sizes', sizeText],
        ['Design on', Object.keys(r.placement).join(' and ')], ['Needed by', r.deadline],
        ['Heard about me', r.source], ['Ad source', [r.utm_source, r.utm_campaign].filter(Boolean).join(' / ')],
        ['Notes', r.notes],
      ])}<p style="font-family:Arial,sans-serif;color:#5d6470">The mockup and design files are attached. Reply to this email to send ${esc(r.name)} a quote, then send a Stripe invoice to get paid.</p>`,
      attachments: filesData.map((f) => ({ filename: f.name, content: f.bytes.toString('base64') })),
    });
    emailed = true;
  } catch (e) { problems.push(e.message); }

  if (!saved && !emailed) {
    console.error('Print quote failed:', problems);
    return NextResponse.json({ error: 'Sorry, your request could not be sent right now. Please email kelvstudio.design@gmail.com instead.' }, { status: 500 });
  }
  if (problems.length) console.warn('Print quote partly failed:', problems);
  const from = r.utm_source ? `ad: ${r.utm_source}` : r.source;
  await notifyCrm({
    title: `New print quote: ${r.quantity} × ${r.item}`,
    body: `${r.name}${r.organisation ? ` (${r.organisation})` : ''}${from ? ` · from ${from}` : ''}${r.deadline ? ` · needs it ${r.deadline}` : ''}`,
    url: savedId ? `/print-quotes/${savedId}` : '/print-quotes',
    tag: savedId ? `print-${savedId}` : undefined,
  });
  return NextResponse.json({ ok: true });
}
