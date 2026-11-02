'use client';

import { useEffect, useState } from 'react';

// Floating pill navbar used on every page: logo, links, and an email button on the right.
// On phones the links and the email button move into a menu opened by the ☰ button.
export default function SiteNav({ settings: s, home = false, extra = [] }) {
  const base = home ? '' : '/';
  const links = [
    { href: '/ui-ux', label: 'UI/UX' },
    { href: '/designs', label: 'Designs' },
    ...extra.map((x) => ({ href: `${base}${x.href}`, label: x.label })),
    { href: `${base}#about`, label: 'About' },
    { href: `${base}#youtube`, label: 'YouTube' },
  ];
  const email = s.email;
  const cta = email
    ? { href: `mailto:${email}`, long: 'Contact me', short: 'Contact me' }
    : { href: s.fiverrUrl || `${base}#contact`, long: 'Contact me', short: 'Contact me', ext: !!s.fiverrUrl };
  const ctaProps = cta.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  // close the menu with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav className={`nav${open ? ' open' : ''}`} aria-label="Main">
      <div className="nav-pill">
        <a className="nav-logo" href={home ? '#top' : '/'} aria-label="Kelvin Mensah, home">
          <img src="/logo.webp" alt="" width="40" height="40" />
        </a>
        <ul>
          {links.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
        </ul>
        <a className="nav-cta" href={cta.href} {...ctaProps}>
          <span className="long">{cta.long}</span><span className="short">{cta.short}</span>
        </a>
        <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
      <div className="nav-menu" id="nav-menu" hidden={!open}>
        <ul>
          {links.map((l) => <li key={l.href}><a href={l.href} onClick={close}>{l.label}</a></li>)}
        </ul>
        <a className="nav-menu-cta" href={cta.href} onClick={close} {...ctaProps}>{cta.long}</a>
      </div>
    </nav>
  );
}
