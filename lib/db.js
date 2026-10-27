// Saves form entries to Supabase (used later by the CRM app).
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in Vercel. Server-side only.

const URL_ = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const dbReady = !!(URL_ && KEY);

const headers = (extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, ...extra });

// insert one row, returns it
export async function insertRow(table, row) {
  if (!dbReady) throw new Error('Database is not set up yet (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing).');
  const res = await fetch(`${URL_}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Save failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return (await res.json())[0];
}

// upload a file to the private "uploads" bucket, returns its path
export async function uploadFile(path, bytes, contentType) {
  if (!dbReady) throw new Error('Database is not set up yet.');
  const res = await fetch(`${URL_}/storage/v1/object/uploads/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': contentType || 'application/octet-stream', 'x-upsert': 'true' }),
    body: bytes,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return path;
}

export const safeName = (name) => String(name || 'file').replace(/[^\w.-]+/g, '-').slice(-80);
