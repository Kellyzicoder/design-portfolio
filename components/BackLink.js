'use client';

/* "← Back": goes back to where you came from on this site (keeping your tab and scroll),
   or to a sensible page if you arrived from somewhere else. */
export default function BackLink({ fallback = '/', children = '← Back' }) {
  function onClick(e) {
    try {
      const cameFromSite = sessionStorage.getItem('kvBack') === '1' ||
        (document.referrer && new URL(document.referrer).origin === location.origin);
      if (cameFromSite && history.length > 1) {
        e.preventDefault();
        sessionStorage.removeItem('kvBack');
        history.back();
      }
    } catch {}
  }
  return <a className="back" href={fallback} onClick={onClick}>{children}</a>;
}
