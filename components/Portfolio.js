'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SECTIONS } from '@/lib/sections';
import { startWall } from './wall';

// Sanity images can be resized on the fly; local files are used as they are
export const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);

function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 13V9a3 3 0 0 1 3-3h13" /><path d="M16 2l4 4-4 4" /><path d="M4 17h12" /><path d="M12 13l4 4-4 4" />
  </svg>
);
const YtIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>
);

function LinkOrText({ href, children }) {
  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <>{children}</>;
}

export default function Portfolio({ settings: s, posters, start }) {
  /* ---------- Work section ---------- */
  const bySection = useMemo(() => {
    const m = {};
    posters.forEach((p) => { (m[p.section] = m[p.section] || []).push(p); });
    return m;
  }, [posters]);
  const count = (sec) => (sec.subs ? sec.subs.reduce((a, x) => a + (bySection[x.id] || []).length, 0) : (bySection[sec.id] || []).length);

  const [cat, setCat] = useState(SECTIONS[0]);
  const [sub, setSub] = useState(null);
  const pick = (sec) => { setCat(sec); setSub(sec.subs ? sec.subs[0] : null); };
  const active = sub || cat;
  const list = bySection[active.id] || [];

  /* ---------- poster viewer ---------- */
  const [vi, setVi] = useState(-1);
  const open = vi >= 0 && list.length > 0;
  const go = (d) => setVi((i) => (i + d + list.length) % list.length);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setVi(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  /* ---------- 3D wall ---------- */
  const heroRef = useRef(null), canvasRef = useRef(null), openerRef = useRef(null);
  useEffect(() => {
    const wallPosters = posters.filter((p) => p.id !== (start && start.id)).map((p) => ({ url: sized(p.url, 700), aspect: p.aspect || 0.75 }));
    const first = start ? { url: sized(start.url, 1600), aspect: start.aspect || 1.6 } : wallPosters[0];
    return startWall({ canvas: canvasRef.current, hero: heroRef.current, opener: openerRef.current, posters: wallPosters, start: first });
  }, [posters, start]);

  const vidId = youtubeId(s.featuredVideoUrl);
  const paras = (s.aboutText || '').split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <nav className="nav pad" aria-label="Main">
        <a className="brand" href="#top"><img src="/logo.webp" alt="" width="40" height="40" />KELVIN<span>MENSAH</span></a>
        <ul>
          <li><a href="#work">Work</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#youtube">YouTube</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a className="hire" href={s.fiverrUrl || '#contact'} {...(s.fiverrUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Hire me</a>
      </nav>

      <div className="hero" id="top" ref={heroRef}>
        <div className="sticky">
          <canvas id="wall" ref={canvasRef} aria-label="Wall of poster designs" />
          <div className="opener pad" ref={openerRef}>
            <h1>{s.headline}</h1>
            <p>{s.subline}</p>
            <a className="cta" href="#work">{s.buttonText} <Arrow /></a>
          </div>
        </div>
      </div>

      <main>
        <section className="block pad">
          <div className="wrap">
            <p className="eyebrow">Hello</p>
            <p className="statement">{s.statement} {s.statementSoft && <em>{s.statementSoft}</em>}</p>
          </div>
        </section>

        <section className="block pad" id="work" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="work-head">
              <h2>Work</h2>
              <div className="cats" role="group" aria-label="Sections">
                {SECTIONS.map((sec) => (
                  <button key={sec.id} aria-pressed={cat.id === sec.id} onClick={() => pick(sec)}>
                    {sec.title}<span className="n">{count(sec)}</span>
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
            <div className="grid">
              {list.length === 0 && <div className="empty">No {active.title} flyers added yet</div>}
              {list.map((p, i) => (
                <button key={p.id} className={p.aspect > 1.2 ? 'wide' : undefined} onClick={() => setVi(i)}>
                  <img src={sized(p.url, 800)} alt={p.title || `${active.title} design ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="pad" id="about">
          <div className="wrap about">
            <div>
              <p className="eyebrow">About</p>
              <p className="statement" style={{ fontSize: 'clamp(28px,3.4vw,46px)' }}>{s.aboutTitle}</p>
            </div>
            <div>
              {paras.map((t, i) => <p key={i}>{t}</p>)}
              <ul className="facts">
                <li><span>Based in</span><span>{s.location}</span></li>
                <li><span>Education</span><span>{s.education}</span></li>
                <li><span>Work</span><span><LinkOrText href={s.fiverrUrl}>Freelance on Fiverr</LinkOrText></span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="block pad" id="youtube">
          <div className="wrap video-grid">
            <div>
              <p className="eyebrow">YouTube</p>
              <p className="statement" style={{ fontSize: 'clamp(28px,3.4vw,46px)' }}>{s.featuredVideoTitle || 'Watch me design.'}</p>
              {s.youtubeUrl && (
                <a className="yt-btn" href={s.youtubeUrl} target="_blank" rel="noopener noreferrer"><YtIcon /> Visit my channel</a>
              )}
            </div>
            {vidId ? (
              <div className="video-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${vidId}`}
                  title={s.featuredVideoTitle || 'YouTube video'}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="yt-empty">Add a YouTube video link in the CMS and it will show here.</div>
            )}
          </div>
        </section>

        <section className="block pad contact" id="contact">
          <div className="wrap">
            <p className="eyebrow">Contact</p>
            <h2>{s.contactHeading}</h2>
            <div className="links">
              <div><small>Telegram channel</small><LinkOrText href={s.telegramUrl}>{s.telegramName}</LinkOrText></div>
              <div><small>Hire me</small><LinkOrText href={s.fiverrUrl}>Fiverr</LinkOrText></div>
              <div><small>YouTube</small><LinkOrText href={s.youtubeUrl}>My channel</LinkOrText></div>
              <div><small>Based in</small>{s.location}</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="pad">
        <span>© {new Date().getFullYear()} Kelvin Mensah</span>
        <span>{s.youtubeUrl ? <a href={s.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube</a> : 'Graphic design portfolio'}</span>
      </footer>

      {open && (
        <div id="viewer" role="dialog" aria-label="Poster" onClick={(e) => e.target === e.currentTarget && setVi(-1)}>
          <button className="x" aria-label="Close" onClick={() => setVi(-1)}>✕</button>
          <div className="box">
            <img src={sized(list[vi].url, 1800)} alt={list[vi].title || `Design ${vi + 1}`} />
            <div className="meta">
              <button aria-label="Previous" onClick={() => go(-1)}>◀</button>
              <span>{list[vi].title || active.title} · {vi + 1} / {list.length}</span>
              <button aria-label="Next" onClick={() => go(1)}>▶</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
