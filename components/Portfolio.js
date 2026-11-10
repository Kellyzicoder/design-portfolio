'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SECTIONS as DEFAULT_SECTIONS } from '@/lib/sections';
import { startWall } from './wall';
import SiteNav from './SiteNav';
import HeroTools from './HeroTools';
import Reviews from './Reviews';
import { spread, mixSections } from '@/lib/spread';

// Sanity images can be resized on the fly; local files are used as they are
export const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
// small version for the wall tiles
const small = (p) => p.thumb || sized(p.url, 520);
// a blurred preview behind an image, so nothing is ever blank while it loads
const blur = (p) => (p.lqip ? { backgroundImage: `url(${p.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined);

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

export default function Portfolio({ settings: s, posters, start, testimonials = [], googleReviews = null, sections, videos = [] }) {
  const SECTIONS = sections && sections.length ? sections : DEFAULT_SECTIONS;
  /* ---------- Selected work: a few designs for the Designs card ---------- */
  const preview = useMemo(() => {
    const picked = posters.filter((p) => p.featured);
    const order = SECTIONS.flatMap((x) => (x.subs ? x.subs.map((y) => y.id) : [x.id]));
    return (picked.length ? spread(picked) : spread(mixSections(posters, order))).filter((p) => (p.aspect || 0.75) < 1).slice(0, 3);
  }, [posters, SECTIONS]);

  /* ---------- 3D wall ---------- */
  const heroRef = useRef(null), canvasRef = useRef(null), openerRef = useRef(null);
  useEffect(() => {
    // only the designs ticked "Show in the opening wall"; if none are ticked, use them all
    const picked = posters.filter((p) => p.onWall);
    // phones get smaller copies: the tiles are small there, so big files only slow the page down
    const phone = innerWidth < 640;
    const tile = (p) => (phone ? sized(p.url, 360) || small(p) : small(p));
    const wallPosters = (picked.length ? picked : posters).filter((p) => p.id !== (start && start.id)).map((p) => ({ url: tile(p), lqip: p.lqip, aspect: p.aspect || 0.75 }));
    const first = start ? { url: sized(start.url, phone ? 1000 : 1600), lqip: start.lqip, aspect: start.aspect || 1.6 } : wallPosters[0];
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
      <SiteNav settings={s} home extra={testimonials.length + ((googleReviews && googleReviews.reviews.length) || 0) > 0 ? [{ href: '#kind-words', label: 'Kind words' }] : []} />

      <div className="hero" id="top" ref={heroRef}>
        <div className="sticky">
          <canvas id="wall" ref={canvasRef} aria-label="Wall of poster designs" />
          <div className="opener pad" ref={openerRef}>
            <HeroTools />
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
              <h2>Selected work</h2>
              <p className="eyebrow" style={{ margin: 0 }}>Two sides of how I design</p>
            </div>
            <div className="pick-grid">
              <a className="pick" href="/ui-ux">
                <span className="pick-img uiux"><img src="/case-studies/hnu/cover.webp" alt="" width="1600" height="1000" loading="lazy" decoding="async" /></span>
                <span className="pick-text">
                  <small>UI/UX design</small>
                  <b>Websites and apps, from Figma to code</b>
                  <em>View case studies <span aria-hidden="true">→</span></em>
                </span>
              </a>
              <a className="pick" href="/work#designs">
                <span className="pick-img posters">
                  {preview.map((p) => <img key={p.id} src={sized(p.url, 500)} alt="" loading="lazy" decoding="async" style={blur(p)} />)}
                </span>
                <span className="pick-text">
                  <small>Graphic design</small>
                  <b>Brands, flyers and social content</b>
                  <em>View all designs <span aria-hidden="true">→</span></em>
                </span>
              </a>
            </div>
          </div>
        </section>

        <Reviews testimonials={testimonials} google={googleReviews} />

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
            <div className="cta-row">
              <a className="btn btn-light" href="/request">Request a design</a>
              <a className="btn btn-ghost" href="/contract">Sign the design agreement</a>
            </div>
            <div className="links">
              {s.email && <div><small>Email</small><a href={`mailto:${s.email}`}>{s.email}</a></div>}
              <div><small>Hire me</small><LinkOrText href={s.fiverrUrl}>Fiverr</LinkOrText></div>
              <div><small>YouTube</small><LinkOrText href={s.youtubeUrl}>My channel</LinkOrText></div>
              <div><small>Based in</small>{s.location}</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="pad">
        <span>© {new Date().getFullYear()} Kelvin Mensah</span>
        <span>{s.youtubeUrl ? <a href={s.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube</a> : 'UI/UX and graphic design portfolio'}</span>
      </footer>

    </>
  );
}
