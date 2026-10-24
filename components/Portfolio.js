'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SECTIONS as DEFAULT_SECTIONS } from '@/lib/sections';
import { startWall } from './wall';
import Viewer from './Viewer';

// Sanity images can be resized on the fly; local files are used as they are
export const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
// small version for the wall tiles
const small = (p) => p.thumb || sized(p.url, 520);
// a blurred preview behind an image, so nothing is ever blank while it loads
const blur = (p) => (p.lqip ? { backgroundImage: `url(${p.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined);
const onImgLoad = (e) => e.currentTarget.classList.add('loaded');

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

export default function Portfolio({ settings: s, posters, start, testimonials = [], sections, videos = [] }) {
  const SECTIONS = sections && sections.length ? sections : DEFAULT_SECTIONS;
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
  const open = vi >= 0 && vi < list.length;
  const LIMIT = 8; // posters shown per tab before "Show all"
  const shownList = list.slice(0, LIMIT);
  useEffect(() => setVi(-1), [cat, sub]);

  /* ---------- 3D wall ---------- */
  const heroRef = useRef(null), canvasRef = useRef(null), openerRef = useRef(null);
  useEffect(() => {
    const wallPosters = posters.filter((p) => p.id !== (start && start.id)).map((p) => ({ url: small(p), lqip: p.lqip, aspect: p.aspect || 0.75 }));
    const first = start ? { url: sized(start.url, 1600), lqip: start.lqip, aspect: start.aspect || 1.6 } : wallPosters[0];
    return startWall({ canvas: canvasRef.current, hero: heroRef.current, opener: openerRef.current, posters: wallPosters, start: first });
  }, [posters, start]);

  // a pinned video (from the CMS) goes first, then the newest videos from the channel
  const pinned = youtubeId(s.featuredVideoUrl);
  const vids = pinned ? [{ id: pinned, title: '', thumb: `https://i.ytimg.com/vi/${pinned}/hqdefault.jpg` }, ...videos.filter((v) => v.id !== pinned)] : videos;
  const [playing, setPlaying] = useState(0);
  const current = vids[Math.min(playing, Math.max(vids.length - 1, 0))];
  const paras = (s.aboutText || '').split(/\n\s*\n/).filter(Boolean);

  const startUrl = start ? sized(start.url, 1600) : null;
  // ask the browser for the first design straight away, and the wall images right after
  const preloads = useMemo(() => posters.slice(0, 14).map(small), [posters]);

  return (
    <>
      {startUrl && <link rel="preload" as="image" href={startUrl} fetchPriority="high" />}
      {preloads.map((u) => <link key={u} rel="preload" as="image" href={u} />)}
      <nav className="nav pad" aria-label="Main">
        <a className="brand" href="#top"><img src="/logo.webp" alt="" width="40" height="40" />KELVIN<span>MENSAH</span></a>
        <ul>
          <li><a href="#work">Work</a></li>
          {testimonials.length > 0 && <li><a href="#kind-words">Kind words</a></li>}
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
            <div className="masonry">
              {list.length === 0 && <div className="empty">No {active.title} flyers added yet</div>}
              {shownList.map((p, i) => (
                <button key={p.id} onClick={() => setVi(i)} style={{ ...blur(p), aspectRatio: String(p.aspect || 0.75) }}>
                  <img src={sized(p.url, 800)} alt={p.title || `${active.title} design ${i + 1}`} loading="lazy" decoding="async" onLoad={onImgLoad} ref={(el) => { if (el && el.complete && el.naturalWidth) el.classList.add('loaded'); }} />
                </button>
              ))}
            </div>
            {list.length > LIMIT && (
              <div className="show-more">
                <a href={`/work/${active.id}`}>Show all {list.length} {active.title} <span aria-hidden="true">→</span></a>
              </div>
            )}
          </div>
        </section>

        {testimonials.length > 0 && (
          <section className="block pad" id="kind-words" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="work-head">
                <h2>Kind words</h2>
                <p className="eyebrow" style={{ margin: 0 }}>From people I've designed for</p>
              </div>
              <div className={`quotes${testimonials.length === 1 ? ' single' : ''}`}>
                {testimonials.map((t) => (
                  <figure key={t.id} className="quote">
                    <span className="mark" aria-hidden="true">“</span>
                    <blockquote>{t.feedback}</blockquote>
                    <figcaption>
                      {t.photo ? (
                        <img src={sized(t.photo, 120)} alt="" width="48" height="48" loading="lazy" style={blur(t)} />
                      ) : (
                        <span className="initial" aria-hidden="true">{(t.name || '?').trim().charAt(0)}</span>
                      )}
                      <span><b>{t.name}</b>{t.company && <small>{t.company}</small>}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

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
            {current ? (
              <div className="video-main">
                <div className="video-frame">
                  <iframe
                    key={current.id}
                    src={`https://www.youtube-nocookie.com/embed/${current.id}`}
                    title={current.title || 'YouTube video'}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {vids.length > 1 && (
                  <div className="video-list" role="list" aria-label="More videos">
                    {vids.slice(0, 5).map((v, i) => (
                      <button key={v.id} role="listitem" aria-pressed={i === playing} onClick={() => setPlaying(i)}>
                        <img src={v.thumb} alt="" loading="lazy" />
                        {v.title && <span>{v.title}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="yt-empty">Your newest YouTube videos will show here.</div>
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

      {open && <Viewer list={list} index={vi} label={active.title} onClose={() => setVi(-1)} onIndex={setVi} />}
    </>
  );
}
