import { getSiteData } from '@/lib/getSiteData';
import { designHref } from '@/lib/designUrl';

// The list of pages Google should find (served at kelvstudio.com/sitemap.xml).
const SITE = 'https://kelvstudio.com';
export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const page = (path, priority, changeFrequency = 'monthly') => ({ url: `${SITE}${path}`, lastModified: now, changeFrequency, priority });
  const pages = [
    page('', 1, 'weekly'),
    page('/ui-ux', 0.9),
    page('/work', 0.9, 'weekly'),
    page('/designs', 0.9, 'weekly'),
    page('/printing', 0.9),
    page('/request', 0.8),
    page('/contract', 0.4),
    page('/case-studies/hnu', 0.7),
    page('/case-studies/fcc-attendance', 0.7),
  ];
  // one page per Work section (and sub-section) from the CMS
  try {
    const { sections, posters } = await getSiteData();
    // one page per design
    for (const p of posters) if (p.id) pages.push(page(designHref(p), 0.5));
    for (const s of sections) {
      pages.push(page(`/work/${s.id}`, 0.6, 'weekly'));
      for (const x of s.subs || []) pages.push(page(`/work/${x.id}`, 0.5, 'weekly'));
    }
  } catch {}
  return pages;
}
