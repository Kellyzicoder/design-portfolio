import { notFound } from 'next/navigation';
import SectionPage from '@/components/SectionPage';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;

function findSection(sections, key) {
  for (const s of sections) {
    if (s.id === key) return { section: s, parent: null };
    for (const x of s.subs || []) if (x.id === key) return { section: x, parent: s };
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { sections } = await getSiteData();
  const found = findSection(sections, params.section);
  return { title: found ? `${found.section.title} · Kelvin Mensah` : 'Kelvin Mensah' };
}

export default async function WorkSection({ params }) {
  const { settings, posters, sections } = await getSiteData();
  const found = findSection(sections, params.section);
  if (!found) notFound();
  const { section, parent } = found;

  // a main section with sub-sections shows each sub-section in turn
  const groups = (section.subs || [section]).map((g) => ({
    id: g.id,
    title: g.title,
    posters: posters.filter((p) => p.section === g.id),
  }));

  // all the sections you can jump to from here
  const links = sections.flatMap((s) =>
    s.subs ? s.subs.map((x) => ({ id: x.id, title: x.title, group: s.title })) : [{ id: s.id, title: s.title }]
  );

  return <SectionPage settings={settings} section={section} parent={parent} groups={groups} links={links} />;
}
