'use client';

import { useState } from 'react';
import Viewer, { sized, GRID_W } from './Viewer';

const blur = (p) => (p.lqip ? { backgroundImage: `url(${p.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined);
const onImgLoad = (e) => e.currentTarget.classList.add('loaded');

/* "Show all" page for one section: every poster at its real shape, nothing cropped. */
export default function SectionPage({ settings: s, section, parent, groups, links }) {
  const all = groups.flatMap((g) => g.posters);
  const [vi, setVi] = useState(-1);
  let n = 0;

  return (
    <>
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

      <main className="pad section-page">
        <div className="wrap">
          <a className="back" href="/#work">← All work</a>
          <div className="work-head">
            <div>
              {parent && <p className="eyebrow">{parent.title}</p>}
              <h1>{section.title}</h1>
            </div>
            <p className="count">{all.length} design{all.length === 1 ? '' : 's'}</p>
          </div>

          <div className="cats" role="list" aria-label="Other sections">
            {links.map((l) => (
              <a key={l.id} role="listitem" className="chip" aria-current={l.id === section.id || groups.some((g) => g.id === l.id) ? 'page' : undefined} href={`/work/${l.id}`}>
                {l.group ? `${l.group} · ` : ''}{l.title}
              </a>
            ))}
          </div>

          {groups.map((g) => (
            <section key={g.id} className="group">
              {groups.length > 1 && <h2>{g.title}</h2>}
              {g.posters.length === 0 && <div className="empty">No {g.title} flyers added yet</div>}
              <div className="masonry">
                {g.posters.map((p) => {
                  const i = n++;
                  return (
                    <button key={p.id} onClick={() => setVi(i)} style={{ ...blur(p), aspectRatio: String(p.aspect || 0.75) }}>
                      <img
                        src={sized(p.url, GRID_W)}
                        alt={p.title || `${g.title} design`}
                        loading={i < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                        onLoad={onImgLoad}
                        ref={(el) => { if (el && el.complete && el.naturalWidth) el.classList.add('loaded'); }}
                      />
                      <span className="cap"><b>{p.title}</b><small>{g.title}</small></span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <footer className="pad"><span>© {new Date().getFullYear()} Kelvin Mensah</span><a href="/">Back to home</a></footer>

      {vi >= 0 && vi < all.length && (
        <Viewer list={all} index={vi} label={section.title} onClose={() => setVi(-1)} onIndex={setVi} />
      )}
    </>
  );
}
