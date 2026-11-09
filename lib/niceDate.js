// "2026-11-09" -> "Mon 9 Nov 2026" (for emails and phone alerts)
export const niceDate = (v) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v || '')
    ? new Intl.DateTimeFormat('en-NZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${v}T12:00:00Z`))
    : v || '';
