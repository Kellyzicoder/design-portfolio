import { NextResponse } from 'next/server';
import { sendEmail, table, isEmail } from '@/lib/email';
import { insertRow, uploadFile, dbReady, safeName } from '@/lib/db';
import { contractParts } from '@/lib/contract';
import { contractPdf } from '@/lib/contractPdf';
import { getSiteData } from '@/lib/getSiteData';
import { notifyCrm } from '@/lib/notify';
import { DESIGN_TYPES, BRIEF_DAYS, MAX_PER_WEEK, perMonth, monthlyPrice, readyDay, monthlyTerms } from '@/lib/monthlyPlan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const str = (v, max = 500) => String(v ?? '').trim().slice(0, max);

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'The form could not be read. Please try again.' }, { status: 400 }); }
  if (str(b.website) || Number(b.t || 0) < 3000) return NextResponse.json({ ok: true });

  // monthly plan (kelvstudio.com/monthly): the price and wording are worked out here, not taken from the form
  const monthly = b.kind === 'monthly';
  const plan = monthly ? {
    perWeek: Math.max(1, Math.min(MAX_PER_WEEK, parseInt(b.perWeek, 10) || 1)),
    briefDay: BRIEF_DAYS.includes(b.briefDay) ? b.briefDay : 'Monday',
    types: (Array.isArray(b.types) ? b.types : []).filter((t) => DESIGN_TYPES.includes(t)),
    start: /^\d{4}-\d{2}-\d{2}$/.test(str(b.start, 10)) ? str(b.start, 10) : null,
    notes: str(b.notes, 2000),
  } : null;
  if (plan) {
    b.project = `Monthly design plan: ${perMonth(plan.perWeek)} designs a month (${plan.perWeek} a week)${plan.types.length ? ` - ${plan.types.join(', ')}` : ''}`;
    b.price = String(monthlyPrice(plan.perWeek));
    b.deadline = plan.start;
  }
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
  if (plan && (!plan.types.length || !plan.start)) {
    return NextResponse.json({ error: 'Please pick at least one kind of design and a start date.' }, { status: 400 });
  }
  if (!c.name || !isEmail(c.email) || !c.project || !c.signature || b.agree !== true) {
    return NextResponse.json({ error: 'Please fill in your name, email and project, type your name to sign, and tick "I agree".' }, { status: 400 });
  }

  const { settings } = await getSiteData();
  const terms = plan ? monthlyTerms(plan) : settings.contractTerms;
  const parts = contractParts(terms);
  const signedAt = new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'long', timeStyle: 'short' });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const nzDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' }).format(new Date()); // YYYY-MM-DD
  const signedDate = new Date(`${nzDay}T12:00:00Z`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  // agreement number, e.g. KS-20261029-4F7Q
  const ref = `KS-${nzDay.replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  let bytes;
  try {
    const extra = plan ? {
      title: 'Monthly Design Plan Agreement',
      rows: [
        ['Plan', c.project],
        ['Monthly price', `NZ$${c.price.toFixed(2)}  -  paid upfront before each month's work starts`],
        ['Extra designs', `NZ$${(c.price / perMonth(plan.perWeek)).toFixed(2)} each, added to the next invoice`],
        ['Weekly routine', `Details by ${plan.briefDay}, designs ready by ${readyDay(plan.briefDay)}`],
        ['Start date', plan.start ? new Date(`${plan.start}T12:00:00Z`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'To be agreed'],
        ...(plan.notes ? [['Notes', plan.notes]] : []),
      ],
    } : {};
    bytes = Buffer.from(await contractPdf({ parts, c: { ...c, ip, ref }, signedAt, signedDate, ...extra }));
  } catch (e) {
    console.error('PDF failed', e);
    return NextResponse.json({ error: 'Sorry, the agreement could not be created. Please try again.' }, { status: 500 });
  }
  const filename = `Kelv-Studio-${plan ? 'Monthly-Plan' : 'Agreement'}-${ref}-${safeName(c.name)}.pdf`;

  // test versions only: ?preview=1 returns the PDF without saving, emailing or notifying
  if (process.env.VERCEL_ENV !== 'production' && new URL(req.url).searchParams.get('preview') === '1') {
    return NextResponse.json({ ok: true, filename, pdf: bytes.toString('base64') });
  }

  let saved = false, emailed = false;
  const problems = [];

  if (dbReady) {
    try {
      const path = await uploadFile(`contracts/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${filename}`, bytes, 'application/pdf');
      const row = {
        ...c, ref, terms: terms || parts.map((p) => [p.heading, p.body].filter(Boolean).join('\n')).join('\n\n'),
        ip, user_agent: str(req.headers.get('user-agent'), 300), pdf_path: path,
      };
      try {
        await insertRow('contracts', row);
      } catch (e) {
        // the "ref" column isn't in the database yet (supabase/contract-ref.sql not run): save without it
        if (!/ref/.test(e.message)) throw e;
        const { ref: _skip, ...rest } = row;
        await insertRow('contracts', rest);
      }
      saved = true;
    } catch (e) { problems.push(e.message); }
  }

  try {
    await sendEmail({
      subject: `${plan ? 'Monthly plan signed' : 'Signed agreement'} ${ref}: ${c.project} (${c.name})`,
      replyTo: c.email,
      html: `<h2 style="font-family:Arial,sans-serif">Design agreement signed</h2>${table([
        ['Client', c.name], ['Email', c.email], ['Phone', c.phone], ['Church / business', c.organisation],
        ['Project', c.project], [plan ? 'Monthly price' : 'Agreed price', c.price != null ? `NZ$${c.price.toFixed(2)}` : ''], [plan ? 'Start date' : 'Delivery date', c.deadline],
        ...(plan ? [['Details by', plan.briefDay], ['Notes', plan.notes]] : []),
        ['Agreement no.', ref], ['Signed', `${c.signature} · ${signedAt}`],
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
    title: plan ? 'Monthly plan signed' : 'Agreement signed',
    body: `${c.name}: ${c.project}${c.price != null ? ` · NZ$${c.price.toFixed(2)}` : ''}`,
    url: '/orders',
  });
  return NextResponse.json({ ok: true, filename, pdf: bytes.toString('base64') });
}
