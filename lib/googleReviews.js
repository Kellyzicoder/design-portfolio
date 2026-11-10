// Google reviews for Kelv Studio, from the free Google Business Profile API.
// Needs 3 Vercel keys (see docs in the PR): GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN.
// Until they're set (or Google approves access), this returns null and the site just shows Studio reviews.

const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const HOUR = 3600;

async function token() {
  const { GBP_CLIENT_ID: id, GBP_CLIENT_SECRET: secret, GBP_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return null;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status})`);
  return (await res.json()).access_token;
}

const get = async (url, at) => {
  const res = await fetch(url, { headers: { authorization: `Bearer ${at}` }, next: { revalidate: HOUR } });
  if (!res.ok) throw new Error(`Google API ${res.status} for ${url.split('?')[0]}`);
  return res.json();
};

// which business to read: set GBP_ACCOUNT_ID / GBP_LOCATION_ID, or it finds "Kelv Studio" itself
async function findLocation(at) {
  const { GBP_ACCOUNT_ID, GBP_LOCATION_ID } = process.env;
  if (GBP_ACCOUNT_ID && GBP_LOCATION_ID) return { account: `accounts/${GBP_ACCOUNT_ID}`, location: `locations/${GBP_LOCATION_ID}` };
  const { accounts = [] } = await get('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', at);
  for (const a of accounts) {
    const { locations = [] } = await get(`https://mybusinessbusinessinformation.googleapis.com/v1/${a.name}/locations?readMask=name,title&pageSize=100`, at);
    const loc = locations.find((l) => /kelv/i.test(l.title || '')) || locations[0];
    if (loc) return { account: a.name, location: loc.name };
  }
  return null;
}

// Google adds "(Translated by Google)" versions; keep what the person actually wrote
function cleanText(t = '') {
  const original = t.split('(Original)');
  return (original.length > 1 ? original[1] : t.split('(Translated by Google)')[0]).trim();
}

export async function getGoogleReviews() {
  try {
    const at = await token();
    if (!at) return null;
    const where = await findLocation(at);
    if (!where) return null;
    const data = await get(`https://mybusiness.googleapis.com/v4/${where.account}/${where.location}/reviews?pageSize=50&orderBy=updateTime%20desc`, at);
    const reviews = (data.reviews || [])
      .map((r) => ({
        id: `g-${r.reviewId}`,
        source: 'google',
        name: (r.reviewer && r.reviewer.displayName) || 'Google user',
        photo: (r.reviewer && r.reviewer.profilePhotoUrl) || null,
        rating: STARS[r.starRating] || null,
        feedback: cleanText(r.comment),
        date: r.createTime || null,
      }))
      // only reviews with words, 4 or 5 stars, show on the site (all of them still show on Google)
      .filter((r) => r.feedback && (r.rating || 0) >= 4);
    return { rating: data.averageRating || null, count: data.totalReviewCount || 0, reviews };
  } catch (e) {
    console.error('Google reviews:', e.message);
    return null;
  }
}
