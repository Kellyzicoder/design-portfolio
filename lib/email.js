// Sends email through Resend (resend.com). Needs RESEND_API_KEY set in Vercel.
// Until a domain is verified in Resend, emails can only go to the Resend account's own address,
// so sign up to Resend with the same email as CONTACT_TO_EMAIL.

export const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'kelvstudio.design@gmail.com';
const FROM = process.env.RESEND_FROM || 'Kelv Studio <onboarding@resend.dev>';

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// rows: [[label, value], ...] -> simple HTML table for the email body
export function table(rows) {
  return `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#5d6470;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`
    )
    .join('')}</table>`;
}

export async function sendEmail({ subject, html, replyTo, attachments }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Email is not set up yet (RESEND_API_KEY is missing).');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO_EMAIL],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments && attachments.length ? { attachments } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Email failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
