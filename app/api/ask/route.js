import { NextResponse } from 'next/server';
import { sendEmail, table, esc, isEmail } from '@/lib/email';
import { notifyCrm } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const field = (fd, k, max = 2000) => String(fd.get(k) || '').trim().slice(0, max);

// "Ask a question" on the service pages: emails the question to Kelv Studio.
export async function POST(req) {
  let fd;
  try { fd = await req.formData(); } catch { return NextResponse.json({ error: 'The form could not be read. Please try again.' }, { status: 400 }); }

  // bots: hidden field filled in, or sent too fast to be a person
  if (field(fd, 'website') || Number(fd.get('t') || 0) < 2500) return NextResponse.json({ ok: true });

  const name = field(fd, 'name', 120);
  const email = field(fd, 'email', 200);
  const message = field(fd, 'message', 4000);
  const topic = field(fd, 'topic', 60) || 'General';
  if (!name || !isEmail(email) || !message) {
    return NextResponse.json({ error: 'Please fill in your name, a valid email and your question.' }, { status: 400 });
  }

  try {
    await sendEmail({
      subject: `New question (${topic}) from ${name}`,
      replyTo: email,
      html: `<h2 style="font-family:Arial,sans-serif">New question</h2>${table([
        ['Name', name], ['Email', email], ['Asked on', `${topic} page`], ['Question', message],
      ])}<p style="font-family:Arial,sans-serif;color:#5d6470">Reply to this email to answer ${esc(name)} directly.</p>`,
    });
  } catch (e) {
    console.error('Ask form failed:', e.message);
    return NextResponse.json({ error: 'Sorry, your question could not be sent right now. Please email kelvstudio.design@gmail.com instead.' }, { status: 500 });
  }

  await notifyCrm({ title: `New question (${topic})`, body: `${name}: ${message.slice(0, 120)}`, url: '/' });
  return NextResponse.json({ ok: true });
}
