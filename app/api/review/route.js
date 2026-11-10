import { NextResponse } from 'next/server';
import { sendEmail, table, esc, isEmail } from '@/lib/email';
import { notifyCrm } from '@/lib/notify';
import { insertRow } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const field = (fd, k, max = 2000) => String(fd.get(k) || '').trim().slice(0, max);

// a review written on kelvstudio.com/review: saved as "pending", then Kelvin approves it in the CRM app
export async function POST(req) {
  let fd;
  try { fd = await req.formData(); } catch { return NextResponse.json({ error: 'The form could not be read. Please try again.' }, { status: 400 }); }

  // bots: hidden field filled in, or sent too fast to be a person
  if (field(fd, 'website') || Number(fd.get('t') || 0) < 3000) return NextResponse.json({ ok: true });

  const name = field(fd, 'name', 80);
  const company = field(fd, 'company', 100);
  const text = field(fd, 'text', 1500);
  const email = field(fd, 'email', 200);
  const rating = Math.round(Number(fd.get('rating')));
  if (!name || !text || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: 'Please add a star rating, your name and your review.' }, { status: 400 });
  }
  if (email && !isEmail(email)) return NextResponse.json({ error: 'That email doesn’t look right. You can leave it empty.' }, { status: 400 });

  try {
    await insertRow('site_reviews', { name, company: company || null, text, email: email || null, rating, status: 'pending' });
  } catch (e) {
    console.error('Review save failed:', e.message);
    return NextResponse.json({ error: 'Sorry, your review could not be saved right now. Please try again later.' }, { status: 500 });
  }

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  try {
    await sendEmail({
      subject: `New review to approve: ${stars} from ${name}`,
      replyTo: email || undefined,
      html: `<h2 style="font-family:Arial,sans-serif">New review to approve</h2>${table([
        ['Rating', stars], ['Name', name], ['Business', company], ['Email', email], ['Review', text],
      ])}<p style="font-family:Arial,sans-serif;color:#5d6470">It won’t show on kelvstudio.com until you approve it in the CRM app (Reviews).</p>`,
    });
  } catch (e) {
    console.warn('Review email failed:', e.message); // the review is saved, so still say thanks
  }
  await notifyCrm({ title: 'New review to approve', body: `${stars} ${name}: ${text.slice(0, 110)}`, url: '/reviews' });
  return NextResponse.json({ ok: true });
}
