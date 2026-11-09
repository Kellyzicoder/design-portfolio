'use client';

import { useEffect, useState } from 'react';

// Floating pill navbar used on every page: logo, links, and a Contact me button on the right.
// Services opens a small menu with UI/UX, Designs and Printing.
// Contact me opens a small menu: request a design quote, get a printing quote, or email.
// On phones the links and the contact options move into a menu opened by the ☰ button.
export default function SiteNav({ settings: s, home = false, extra = [] }) {
  const base = home ? '' : '/';
  const links = [
    { id: 'services', label: 'Services', children: [
      { href: '/ui-ux', label: 'UI/UX', note: 'Websites and apps' },
      { href: '/designs', label: 'Designs', note: 'Flyers, logos and social media' },
      { href: '/printing', label: 'Printing', note: 'Shirts, mugs, banners, flyers and more' },
    ] },
    ...extra.map((x) => ({ href: `${base}${x.href}`, label: x.label })),
    { href: `${base}#about`, label: 'About' },
    { href: `${base}#youtube`, label: 'YouTube' },
  ];
  const contact = [
    { href: '/request', label: 'Request a design quote', note: 'Logos, flyers, social media, websites' },
    { href: '/printing', label: 'Get a printing quote', note: 'Shirts, mugs, banners, flyers and more' },
    s.email && { href: `mailto:${s.email}`, label: 'Email me', note: s.email },
  ].filter(Boolean);

  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(null); // which small menu is open: 'services', 'contact' or null
  const toggle = (id) => setDrop((d) => (d === id ? null : id));
  const close = () => { setOpen(false); setDrop(null); };
  // close menus with Escape, and the small menus when clicking elsewhere
  useEffect(() => {
    if (!open && !drop) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onClick = (e) => { if (drop && !e.target.closest('[data-drop]')) setDrop(null); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onClick); };
  }, [open, drop]);

  return (
    <nav className={`nav${open ? ' open' : ''}`} aria-label="Main">
      <div className="nav-pill">
        <a className="nav-logo" href={home ? '#top' : '/'} aria-label="Kelvin Mensah, home">
          <img src="/logo.webp" alt="" width="40" height="40" />
        </a>
        <ul>
          {links.map((l) => (l.children ? (
            <li key={l.id} className="nav-has-drop" data-drop>
              <button type="button" className="nav-link" aria-haspopup="true" aria-expanded={drop === l.id} aria-controls={`nav-${l.id}-menu`} onClick={() => toggle(l.id)}>
                {l.label}
                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="nav-drop nav-drop-left" id={`nav-${l.id}-menu`} hidden={drop !== l.id}>
                {l.children.map((c) => <a key={c.href} href={c.href} onClick={close}><b>{c.label}</b><small>{c.note}</small></a>)}
              </div>
            </li>
          ) : <li key={l.href}><a href={l.href}>{l.label}</a></li>))}
        </ul>
        <div className="nav-contact" data-drop>
          <button type="button" className="nav-cta" aria-haspopup="true" aria-expanded={drop === 'contact'} aria-controls="nav-contact-menu" onClick={() => toggle('contact')}>
            Contact me
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="nav-drop" id="nav-contact-menu" hidden={drop !== 'contact'}>
            {contact.map((c) => (
              <a key={c.href} href={c.href} onClick={close}><b>{c.label}</b><small>{c.note}</small></a>
            ))}
          </div>
        </div>
        <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
      <div className="nav-menu" id="nav-menu" hidden={!open}>
        <ul>
          {links.map((l) => (l.children ? (
            <li key={l.id} className="nav-menu-group">
              <span>{l.label}</span>
              {l.children.map((c) => <a key={c.href} href={c.href} onClick={close}>{c.label}</a>)}
            </li>
          ) : <li key={l.href}><a href={l.href} onClick={close}>{l.label}</a></li>))}
        </ul>
        <a className="nav-menu-cta" href={contact[0].href} onClick={close}>{contact[0].label}</a>
        <div className="nav-menu-more">
          {contact.slice(1).map((c) => <a key={c.href} href={c.href} onClick={close}>{c.label}</a>)}
        </div>
      </div>
    </nav>
  );
}
