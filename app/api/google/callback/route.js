import { NextResponse } from 'next/server';

// One-time setup, step 2: Google sends you back here. Shows the refresh token to paste into Vercel as GBP_REFRESH_TOKEN.
// Only works while GBP_SETUP=on is set in Vercel. Turn it off again after.
export const dynamic = 'force-dynamic';

const page = (title, body) =>
  new NextResponse(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<body style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;line-height:1.5;color:#111">
<h1 style="font-size:24px">${title}</h1>${body}</body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }
  );

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function GET(req) {
  if (process.env.GBP_SETUP !== 'on') return new NextResponse('Not found', { status: 404 });
  const u = new URL(req.url);
  const code = u.searchParams.get('code');
  if (!code) return page('Google sign-in was cancelled', `<p>${esc(u.searchParams.get('error') || 'No code was returned.')}</p>`);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GBP_CLIENT_ID || '',
      client_secret: process.env.GBP_CLIENT_SECRET || '',
      redirect_uri: `${u.origin}/api/google/callback`,
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.refresh_token) {
    return page('Something went wrong', `<p>Google said: <code>${esc(data.error_description || data.error || res.status)}</code></p><p>Check GBP_CLIENT_ID and GBP_CLIENT_SECRET in Vercel, and that this address is an authorised redirect URI: <code>${esc(u.origin)}/api/google/callback</code></p>`);
  }
  return page(
    'Connected. One last step',
    `<ol><li>Copy this key:</li></ol>
<textarea readonly onclick="this.select()" style="width:100%;height:90px;font:14px monospace;padding:10px">${esc(data.refresh_token)}</textarea>
<ol start="2"><li>In Vercel → design-portfolio → Settings → Environment Variables, add <b>GBP_REFRESH_TOKEN</b> with this value (Production).</li>
<li>Delete <b>GBP_SETUP</b> (so this page switches off), then redeploy.</li></ol>
<p style="color:#666">Keep this key private: don’t share it or paste it in chats.</p>`
  );
}
