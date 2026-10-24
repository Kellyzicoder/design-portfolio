// The sections shown on the site. The CMS uses the same list, so a poster's
// "section" value must be one of the ids below.
export const SECTIONS = [
  { id: 'birthday', title: 'Birthday Flyers' },
  {
    id: 'church',
    title: 'Church Flyers',
    subs: [
      { id: 'easter', title: 'Easter' },
      { id: 'valentines', title: 'Valentines' },
      { id: 'parents', title: "Father's Day & Mother's Day" },
      { id: 'international', title: 'International Sunday' },
    ],
  },
  { id: 'social', title: 'Social Media' },
  { id: 'banners', title: 'Banners' },
];

// Flat list for the CMS dropdown.
export const SECTION_OPTIONS = SECTIONS.flatMap((s) =>
  s.subs
    ? s.subs.map((x) => ({ title: `${s.title} – ${x.title}`, value: x.id }))
    : [{ title: s.title, value: s.id }]
);
