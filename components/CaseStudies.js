// UI/UX case study cards. Add a new object here for each new case study.
export const CASE_STUDIES = [
  {
    href: '/case-studies/hnu',
    image: '/case-studies/hnu/cover.webp',
    alt: 'Human Nutrition Unit live website: home page on desktop and Research page on a phone',
    label: 'Case study · University of Auckland client',
    title: 'Redesigning the Human Nutrition Unit website',
    text: 'Design lead on a 6-person team: Figma prototype, client reviews, redesigned pages for desktop and mobile, then coded in Next.js.',
  },
];

export default function CaseStudies() {
  return (
    <div className="case-list">
      {CASE_STUDIES.map((c) => (
        <a key={c.href} className="case-card" href={c.href}>
          <span className="case-card-img">
            <img src={c.image} alt={c.alt} width="1600" height="1000" loading="lazy" decoding="async" />
          </span>
          <span className="case-card-text">
            <small>{c.label}</small>
            <b>{c.title}</b>
            <span>{c.text}</span>
            <em>Read the case study <span aria-hidden="true">→</span></em>
          </span>
        </a>
      ))}
    </div>
  );
}
