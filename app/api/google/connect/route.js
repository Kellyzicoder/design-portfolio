import { NextResponse } from 'next/server';

// One-time setup: kelvstudio.com/api/google/connect starts "Sign in with Google" so the site can read your reviews.
// Only works while GBP_SETUP=on is set in Vercel. Turn it off again after.
export const dynamic = 'force-dynamic';

export function GET(req) {
  if (process.env.GBP_SETUP !== 'on' || !process.env.GBP_CLIENT_ID) return new NextResponse('Not found', { status: 404 });
  const origin = new URL(req.url).origin;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: process.env.GBP_CLIENT_ID,
    redirect_uri: `${origin}/api/google/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/business.manage',
    access_type: 'offline',
    prompt: 'consent',
  }).toString();
  return NextResponse.redirect(url.toString());
}
