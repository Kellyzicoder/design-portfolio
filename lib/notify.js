// Pings the CRM app so Kelvin's phone shows a notification.
// Needs NOTIFY_URL (e.g. https://kelvstudio-crm.vercel.app/api/notify) and NOTIFY_SECRET in Vercel.
export async function notifyCrm(msg) {
  const url = process.env.NOTIFY_URL, secret = process.env.NOTIFY_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.warn('CRM notify failed', e && e.message);
  }
}
