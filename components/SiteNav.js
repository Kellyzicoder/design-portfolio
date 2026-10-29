// Floating pill navbar used on every page: logo, links, and an email button on the right.
export default function SiteNav({ settings: s, home = false, extra = [] }) {
  const base = home ? '' : '/';
  const links = [
    { href: `${base}#work`, label: 'Work' },
    ...extra.map((x) => ({ href: `${base}${x.href}`, label: x.label })),
    { href: `${base}#about`, label: 'About' },
    { href: `${base}#youtube`, label: 'YouTube' },
    { href: `${base}#contact`, label: 'Contact' },
  ];
  const email = s.email;
  const cta = email
    ? { href: `mailto:${email}`, long: 'Contact me', short: 'Contact me' }
    : { href: s.fiverrUrl || `${base}#contact`, long: 'Contact me', short: 'Contact me', ext: !!s.fiverrUrl };

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-pill">
        <a className="nav-logo" href={home ? '#top' : '/'} aria-label="Kelvin Mensah, home">
          <img src="/logo.webp" alt="" width="40" height="40" />
        </a>
        <ul>
          {links.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
        </ul>
        <a className="nav-cta" href={cta.href} {...(cta.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          <span className="long">{cta.long}</span><span className="short">{cta.short}</span>
        </a>
      </div>
    </nav>
  );
}
