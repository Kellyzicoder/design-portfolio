import { NextResponse } from 'next/server';
import { niceDate } from '@/lib/niceDate';
import { sendEmail, table, esc, isEmail } from '@/lib/email';
import { insertRow, uploadFile, dbReady, safeName } from '@/lib/db';
import { notifyCrm } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILES = 3;
const MAX_BYTES = 4 * 1024 * 1024; // all files together
const field = (fd, k, max = 2000) => String(fd.get(k) || '').trim().slice(0, max);
const dateOrNull = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export async function POST(req) {
  let fd;
  try { fd = await req.formData(); } catch { return NextResponse.json({ error: 'The form could not be read. Please try again.' }, { status: 400 }); }

  // bots: hidden field filled in, or sent too fast to be a person
  if (field(fd, 'website') || Number(fd.get('t') || 0) < 3000) return NextResponse.json({ ok: true });

  const r = {
    name: field(fd, 'name', 120),
    email: field(fd, 'email', 200),
    phone: field(fd, 'phone', 40),
    organisation: field(fd, 'organisation', 200),
    design_type: field(fd, 'type', 120),
    format: field(fd, 'format', 120),
    event_date: dateOrNull(field(fd, 'eventDate', 10)),
    deadline: dateOrNull(field(fd, 'deadline', 10)),
    details: field(fd, 'details', 5000),
    budget: field(fd, 'budget', 60),
    source: field(fd, 'source', 120),
    utm_source: field(fd, 'utm_source', 120),
    utm_campaign: field(fd, 'utm_campaign', 120),
  };
  // website requests: join the extra answers into the details, so no database change is needed
  if (r.design_type === 'Website') {
    const web = [
      ['Website for', field(fd, 'web_purpose', 120)],
      ['Web address', field(fd, 'web_address', 120)],
      ['Style', field(fd, 'web_style', 120)],
      ['Colours', field(fd, 'web_colours', 200)],
      ['Visitors fill in', field(fd, 'web_form', 500)],
      ['Extras', fd.getAll('web_extras').map((x) => String(x).slice(0, 60)).slice(0, 10).join(', ')],
    ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    if (web.length) r.details = `${web.join('\n')}\n\n${r.details}`.slice(0, 6000);
  }
  if (!r.name || !isEmail(r.email) || !r.design_type || !r.deadline || !r.details) {
    return NextResponse.json({ error: 'Please fill in your name, a valid email, what you need, the date and the details.' }, { status: 400 });
  }

  const files = fd.getAll('refs').filter((f) => f && typeof f === 'object' && f.size > 0).slice(0, MAX_FILES);
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) {
    return NextResponse.json({ error: 'The images are too big. Please send smaller ones (4 MB in total).' }, { status: 400 });
  }
  const filesData = await Promise.all(files.map(async (f) => ({ name: safeName(f.name), type: f.type, bytes: Buffer.from(await f.arrayBuffer()) })));

  let saved = false, emailed = false, savedId = null;
  const problems = [];

  if (dbReady) {
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const paths = [];
      for (const f of filesData) paths.push(await uploadFile(`requests/${stamp}/${crypto.randomUUID()}-${f.name}`, f.bytes, f.type));
      const row = await insertRow('requests', { ...r, files: paths });
      savedId = row && row.id;
      saved = true;
    } catch (e) { problems.push(e.message); }
  }

  try {
    await sendEmail({
      subject: `New design request: ${r.design_type} for ${r.name}`,
      replyTo: r.email,
      html: `<h2 style="font-family:Arial,sans-serif">New design request</h2>${table([
        ['Name', r.name], ['Email', r.email], ['Phone', r.phone], ['Church / business', r.organisation],
        ['Design', r.design_type], ['Size / use', r.format], ['Event date', niceDate(r.event_date)], ['Needed by', niceDate(r.deadline)],
        ['Budget', r.budget], ['Heard about me', r.source], ['Ad source', [r.utm_source, r.utm_campaign].filter(Boolean).join(' / ')],
        ['Details', r.details],
      ])}<p style="font-family:Arial,sans-serif;color:#5d6470">Reply to this email to answer ${esc(r.name)} directly.</p>`,
      attachments: filesData.map((f) => ({ filename: f.name, content: f.bytes.toString('base64') })),
    });
    emailed = true;
  } catch (e) { problems.push(e.message); }

  if (!saved && !emailed) {
    console.error('Request form failed:', problems);
    return NextResponse.json({ error: 'Sorry, your request could not be sent right now. Please email kelvstudio.design@gmail.com instead.' }, { status: 500 });
  }
  if (problems.length) console.warn('Request form partly failed:', problems);
  const from = r.utm_source ? `ad: ${r.utm_source}` : r.source;
  await notifyCrm({
    title: `New request: ${r.design_type}`,
    body: `${r.name}${r.organisation ? ` (${r.organisation})` : ''}${from ? ` · from ${from}` : ''}${r.deadline ? ` · needs it ${niceDate(r.deadline)}` : ''}`,
    url: savedId ? `/requests/${savedId}` : '/requests',
    tag: savedId ? `req-${savedId}` : undefined,
  });
  return NextResponse.json({ ok: true });
}
