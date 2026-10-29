import { NextResponse } from 'next/server';
import { sendEmail, table, isEmail } from '@/lib/email';
import { insertRow, uploadFile, dbReady, safeName } from '@/lib/db';
import { contractParts } from '@/lib/contract';
import { contractPdf } from '@/lib/contractPdf';
import { getSiteData } from '@/lib/getSiteData';
import { notifyCrm } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const str = (v, max = 500) => String(v ?? '').trim().slice(0, max);

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'The form could not be read. Please try again.' }, { status: 400 }); }
  if (str(b.website) || Number(b.t || 0) < 3000) return NextResponse.json({ ok: true });

  const price = str(b.price, 20).replace(/[^\d.]/g, '');
  const c = {
    name: str(b.name, 120),
    email: str(b.email, 200),
    phone: str(b.phone, 40),
    organisation: str(b.organisation, 200),
    project: str(b.project, 500),
    price: price ? Number(price) : null,
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(str(b.deadline, 10)) ? str(b.deadline, 10) : null,
    signature: str(b.signature, 120),
  };
  if (!c.name || !isEmail(c.email) || !c.project || !c.signature || b.agree !== true) {
    return NextResponse.json({ error: 'Please fill in your name, email and project, type your name to sign, and tick "I agree".' }, { status: 400 });
  }

  const { settings } = await getSiteData();
  const terms = settings.contractTerms;
  const parts = contractParts(terms);
  const signedAt = new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'long', timeStyle: 'short' });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();

  let bytes;
  try {
    bytes = Buffer.from(await contractPdf({ parts, c: { ...c, ip }, signedAt }));
  } catch (e) {
    console.error('PDF failed', e);
    return NextResponse.json({ error: 'Sorry, the agreement could not be created. Please try again.' }, { status: 500 });
  }
  const filename = `Kelv-Studio-agreement-${safeName(c.name)}.pdf`;

  let saved = false, emailed = false;
  const problems = [];

  if (dbReady) {
    try {
      const path = await uploadFile(`contracts/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${filename}`, bytes, 'application/pdf');
      await insertRow('contracts', {
        ...c, terms: terms || parts.map((p) => [p.heading, p.body].filter(Boolean).join('\n')).join('\n\n'),
        ip, user_agent: str(req.headers.get('user-agent'), 300), pdf_path: path,
      });
      saved = true;
    } catch (e) { problems.push(e.message); }
  }

  try {
    await sendEmail({
      subject: `Signed agreement: ${c.project} (${c.name})`,
      replyTo: c.email,
      html: `<h2 style="font-family:Arial,sans-serif">Design agreement signed</h2>${table([
        ['Client', c.name], ['Email', c.email], ['Phone', c.phone], ['Church / business', c.organisation],
        ['Project', c.project], ['Agreed price', c.price != null ? `NZ$${c.price.toFixed(2)}` : ''], ['Delivery date', c.deadline],
        ['Signed', `${c.signature} · ${signedAt}`],
      ])}<p style="font-family:Arial,sans-serif;color:#5d6470">The signed PDF is attached.</p>`,
      attachments: [{ filename, content: bytes.toString('base64') }],
    });
    emailed = true;
  } catch (e) { problems.push(e.message); }

  if (!saved && !emailed) {
    console.error('Contract form failed:', problems);
    return NextResponse.json({ error: 'Sorry, the agreement could not be sent right now. Please try again later.' }, { status: 500 });
  }
  if (problems.length) console.warn('Contract form partly failed:', problems);
  await notifyCrm({
    title: 'Agreement signed',
    body: `${c.name}: ${c.project}${c.price != null ? ` · NZ$${c.price.toFixed(2)}` : ''}`,
    url: '/orders',
  });
  return NextResponse.json({ ok: true, filename, pdf: bytes.toString('base64') });
}
