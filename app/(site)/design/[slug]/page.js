import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import BackLink from '@/components/BackLink';
import DesignGalleryView from '@/components/DesignGalleryView';
import { getSiteData } from '@/lib/getSiteData';
import { SECTIONS as DEFAULT_SECTIONS } from '@/lib/sections';
import { designHref, idFromSlug, sizedUrl } from '@/lib/designUrl';

export const revalidate = 60;

// the brief is shown under the title, so the side box has My role and Process
const STORY = [['work', 'My role'], ['process', 'Process']];

async function load(slug) {
  const data = await getSiteData();
  const id = idFromSlug(slug);
  const i = data.posters.findIndex((p) => p.id === id);
  if (i < 0) return null;
  const SECTIONS = data.sections && data.sections.length ? data.sections : DEFAULT_SECTIONS;
  const names = {};
  SECTIONS.forEach((s) => { names[s.id] = s.title; (s.subs || []).forEach((x) => { names[x.id] = x.title; }); });
  // previous / next design in the same section
  const same = data.posters.filter((p) => p.section === data.posters[i].section);
  const j = same.findIndex((p) => p.id === id);
  return {
    ...data,
    p: data.posters[i],
    section: names[data.posters[i].section] || 'Design',
    prev: same.length > 1 ? same[(j - 1 + same.length) % same.length] : null,
    next: same.length > 1 ? same[(j + 1) % same.length] : null,
  };
}

export async function generateMetadata({ params }) {
  const d = await load(params.slug);
  if (!d) return { title: 'Design · Kelvin Mensah' };
  return {
    title: `${d.p.title} · ${d.section} · Kelvin Mensah`,
    description: d.p.brief || `${d.p.title}: ${d.section.toLowerCase()} design by Kelvin Mensah (Kelv Studio), Auckland.`,
    openGraph: { images: [sizedUrl(d.p.url, 1200)] },
  };
}

export default async function DesignPage({ params }) {
  const d = await load(params.slug);
  if (!d) notFound();
  const { p, settings, section, prev, next } = d;
  const images = [{ url: p.url, aspect: p.aspect, lqip: p.lqip, label: '' }, ...(p.more || [])];
  const story = STORY.filter(([k]) => p[k]);
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad case design-page">
        <div className="wrap">
          <BackLink fallback="/work#designs">← Back</BackLink>
          <p className="eyebrow">{section}</p>
          <h1>{p.title}</h1>
          {p.brief && <p className="lead">{p.brief}</p>}

          <dl className="cs-facts dp-facts">
            <div><dt>Type</dt><dd>{section}</dd></div>
            {p.tools && <div><dt>Tools</dt><dd>{p.tools}</dd></div>}
            <div><dt>Images</dt><dd>{images.length}</dd></div>
          </dl>

          <DesignGalleryView title={p.title} images={images} />

          {story.length > 0 && (
            <div className="dp-story">
              {story.map(([k, h]) => (
                <section key={k}><h2>{h}</h2><p>{p[k]}</p></section>
              ))}
              <div className="dp-cta-box">
                <h2>Like this?</h2>
                <p>Send your brief and get a clear quote by email within 24 hours.</p>
                <a className="btn" href="/request">Request a design like this</a>
              </div>
            </div>
          )}

          {(prev || next) && (
            <nav className="dp-nav" aria-label="More designs">
              {prev && <a href={designHref(prev)}><small>← Previous</small><b>{prev.title}</b></a>}
              {next && <a href={designHref(next)} className="dp-next"><small>Next →</small><b>{next.title}</b></a>}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
