'use client';

import { useEffect, useState } from 'react';

// Sanity images can be resized on the fly; local files are used as they are
export const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
export const GRID_W = 800; // size used in the grids (already downloaded when the viewer opens)
const FULL_W = 1600;

// the caption: brief, my role, process and tools (all optional)
const STORY = [['brief', 'Brief'], ['work', 'My role'], ['process', 'Process'], ['tools', 'Tools']];
export const hasCaption = (p) => STORY.some(([k]) => p && p[k]);

// load an image in the background so it's ready before it's needed
const warmed = new Set();
function warm(url) {
  if (!url || warmed.has(url) || typeof window === 'undefined') return;
  warmed.add(url);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
}

/*
  Full-screen poster view.
  Opens instantly with the grid-size picture (already loaded), then swaps to
  the sharp version when it arrives. The next and previous posters are loaded
  ahead of time, so the arrows feel instant.
*/
export const imagesOf = (p) => [p, ...((p && p.more) || []).filter((m) => m && m.url)];

export default function Viewer({ list, index, label, onClose, onIndex }) {
  const p = list[index];
  // a design can have more images from the same project: the arrows go through them first
  const imgs = imagesOf(p);
  const [k, setK] = useState(0);
  const cur = imgs[Math.min(k, imgs.length - 1)];
  const go = (d) => {
    const nk = k + d;
    if (nk >= 0 && nk < imgs.length) { setK(nk); return; }
    const ni = (index + d + list.length) % list.length;
    setK(d < 0 ? imagesOf(list[ni]).length - 1 : 0);
    onIndex(ni);
  };
  const [sharpReady, setSharpReady] = useState(false);
  const small = sized(cur.url, GRID_W);
  const full = sized(cur.url, FULL_W);
  const hasStory = hasCaption(p);

  useEffect(() => {
    // the rest of this project's images, so flipping through them is instant
    imgs.forEach((m) => warm(sized(m.url, GRID_W)));
  }, [p]);

  useEffect(() => {
    setSharpReady(false);
    // get the neighbours ready: small first (instant), then sharp
    [1, -1, 2].forEach((d) => warm(sized(list[(index + d + list.length) % list.length].url, GRID_W)));
    [1, -1].forEach((d) => warm(sized(list[(index + d + list.length) % list.length].url, FULL_W)));
  }, [index, list, k]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  // swipe left / right on phones
  const [touchX, setTouchX] = useState(null);

  return (
    <div
      id="viewer"
      role="dialog"
      aria-label="Poster"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      <button className="x" aria-label="Close" onClick={onClose}>✕</button>
      <div className={`box${hasStory ? ' has-story' : ''}`}>
        <div className="v-main">
        <div
          className="viewer-img"
          style={{
            aspectRatio: String(cur.aspect || 0.75),
            '--a': cur.aspect || 0.75,
          }}
        >
          {cur.lqip && <img className="v-blur" src={cur.lqip} alt="" aria-hidden="true" />}
          <img key={`s-${p.id}-${k}`} className="v-small" src={small} alt="" aria-hidden="true" decoding="async" />
          {full !== small && (
            <img
              key={`f-${p.id}-${k}`}
              className={`v-full${sharpReady ? ' ready' : ''}`}
              src={full}
              alt={`${p.title || `Design ${index + 1}`}${imgs.length > 1 ? ` (image ${k + 1} of ${imgs.length})` : ''}`}
              decoding="async"
              onLoad={() => setSharpReady(true)}
              ref={(el) => { if (el && el.complete && el.naturalWidth) setTimeout(() => setSharpReady(true)); }}
            />
          )}
        </div>
        <div className="meta">
          <button aria-label="Previous" onClick={() => go(-1)}>◀</button>
          <span>{p.title || label} · {imgs.length > 1 ? `image ${k + 1} of ${imgs.length}` : `${index + 1} / ${list.length}`}</span>
          <button aria-label="Next" onClick={() => go(1)}>▶</button>
        </div>
        {imgs.length > 1 && (
          <div className="v-thumbs" role="tablist" aria-label="Images in this project">
            {imgs.map((m, i) => (
              <button key={i} role="tab" aria-selected={i === k} aria-label={`Image ${i + 1}`} onClick={() => setK(i)}>
                <img src={sized(m.url, 160)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
        </div>
        {hasStory && (
          <aside className="v-story" key={`st-${p.id}`}>
            {p.title && <h2>{p.title}</h2>}
            {STORY.filter(([k]) => p[k]).map(([k, h]) => (
              <section key={k}><h3>{h}</h3><p>{p[k]}</p></section>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
