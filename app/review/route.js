import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

// kelvstudio.com/review: a short link to send clients, which opens the Google review box for Kelv Studio.
// The link can be changed in the Studio (Site settings → Contact & YouTube → Google review link).
const GOOGLE_REVIEW = 'https://search.google.com/local/writereview?placeid=ChIJxT-yasM_DW0RrIGV92N6h0A';

export const revalidate = 300;

export async function GET() {
  let link = '';
  try {
    if (client) link = await client.fetch('*[_type == "siteSettings"][0].reviewLink');
  } catch {}
  return NextResponse.redirect(link && /^https:\/\//.test(link) ? link : GOOGLE_REVIEW, 307);
}
