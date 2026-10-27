// Top bar for the extra pages (request form, contract).
export default function SiteNav({ settings: s }) {
  return (
    <nav className="nav pad" aria-label="Main">
      <a className="brand" href="/"><img src="/logo.webp" alt="" width="40" height="40" />KELVIN<span>MENSAH</span></a>
      <ul>
        <li><a href="/#work">Work</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/#youtube">YouTube</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
      <a className="hire" href={s.fiverrUrl || '/#contact'} {...(s.fiverrUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Hire me</a>
    </nav>
  );
}
