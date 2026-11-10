'use client';

import { useEffect, useMemo, useState } from 'react';
import { SECTIONS as DEFAULT_SECTIONS } from '@/lib/sections';
import Viewer, { hasCaption } from './Viewer';
import { spread, mixSections } from '@/lib/spread';

// Sanity images can be resized on the fly; local files are used as they are
const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
const blur = (p) => (p.lqip ? { backgroundImage: `url(${p.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined);
const onImgLoad = (e) => e.currentTarget.classList.add('loaded');

/* The graphic design gallery: category tabs, sub-category chips, a masonry grid and the full-screen viewer. */
export default function DesignsGallery({ posters, sections }) {
  const SECTIONS = sections && sections.length ? sections : DEFAULT_SECTIONS;
  const bySection = useMemo(() => {
    const m = {};
    posters.forEach((p) => { (m[p.section] = m[p.section] || []).push(p); });
    return m;
  }, [posters]);

  // section id -> name shown on each design ("Logos", "Easter"...)
  const sectionName = useMemo(() => {
    const m = {};
    SECTIONS.forEach((s) => { m[s.id] = s.title; (s.subs || []).forEach((x) => { m[x.id] = x.title; }); });
    return m;
  }, [SECTIONS]);

  // "Featured" opens first: the designs ticked as featured, or else a mix of every section
  const featuredList = useMemo(() => {
    const picked = posters.filter((p) => p.featured);
    if (picked.length) return spread(picked);
    const order = SECTIONS.flatMap((s) => (s.subs ? s.subs.map((x) => x.id) : [s.id]));
    return spread(mixSections(posters, order));
  }, [posters, SECTIONS]);
  const FEATURED = { id: 'featured', title: 'Featured' };
  const TABS = [FEATURED, ...SECTIONS];
  const count = (sec) => (sec.id === 'featured' ? featuredList.length : sec.subs ? sec.subs.reduce((a, x) => a + (bySection[x.id] || []).length, 0) : (bySection[sec.id] || []).length);

  const [cat, setCat] = useState(FEATURED);
  const [sub, setSub] = useState(null);
  const pick = (sec) => { setCat(sec); setSub(sec.subs ? sec.subs[0] : null); };
  const active = sub || cat;
  const isFeatured = active.id === 'featured';
  const list = useMemo(() => (isFeatured ? featuredList : spread(bySection[active.id] || [])), [isFeatured, featuredList, bySection, active.id]);

  const [vi, setVi] = useState(-1);
  const open = vi >= 0 && vi < list.length;
  const LIMIT = isFeatured ? 24 : 16; // designs shown per tab before "Show all"
  const shownList = list.slice(0, LIMIT);
  useEffect(() => setVi(-1), [cat, sub]);

  return (
    <>
      <div className="work-head">
        <div className="cats" role="group" aria-label="Sections">
          {TABS.map((sec) => (
            <button key={sec.id} aria-pressed={cat.id === sec.id} onClick={() => pick(sec)}>
              {sec.title}{sec.id !== 'featured' && <span className="n">{count(sec)}</span>}
            </button>
          ))}
        </div>
      </div>
      {cat.subs && (
        <div className="subcats" role="group" aria-label={`${cat.title} types`}>
          {cat.subs.map((x) => (
            <button key={x.id} aria-pressed={sub && sub.id === x.id} onClick={() => setSub(x)}>{x.title}</button>
          ))}
        </div>
      )}
      <div className={`masonry${isFeatured ? ' big' : ''}`} key={active.id}>
        {list.length === 0 && <div className="empty">No {active.title} designs added yet</div>}
        {shownList.map((p, i) => (
          <button key={p.id} onClick={() => setVi(i)} style={{ ...blur(p), aspectRatio: String(p.aspect || 0.75), '--i': i }}>
            <img src={sized(p.url, isFeatured ? 600 : 400)} alt={p.title || `${active.title} design ${i + 1}`} loading="lazy" decoding="async" onLoad={onImgLoad} ref={(el) => { if (el && el.complete && el.naturalWidth) el.classList.add('loaded'); }} />
            {p.more && p.more.length > 0 && <span className="count" aria-label={`${p.more.length + 1} images`}>+{p.more.length}</span>}
            <span className="cap"><b>{p.title}</b><small>{sectionName[p.section] || ''}{hasCaption(p) ? ' · Read the story' : ''}</small></span>
          </button>
        ))}
      </div>
      {!isFeatured && list.length > LIMIT && (
        <div className="show-more">
          <a href={`/work/${active.id}`}>Show all {list.length} {active.title} <span aria-hidden="true">→</span></a>
        </div>
      )}
      {open && <Viewer list={list} index={vi} label={active.title} onClose={() => setVi(-1)} onIndex={setVi} />}
    </>
  );
}
