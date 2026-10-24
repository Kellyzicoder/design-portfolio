'use client';

import { useEffect, useState } from 'react';

// Sanity images can be resized on the fly; local files are used as they are
export const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
export const GRID_W = 800; // size used in the grids (already downloaded when the viewer opens)
const FULL_W = 1600;

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
export default function Viewer({ list, index, label, onClose, onIndex }) {
  const p = list[index];
  const go = (d) => onIndex((index + d + list.length) % list.length);
  const [sharpReady, setSharpReady] = useState(false);
  const small = sized(p.url, GRID_W);
  const full = sized(p.url, FULL_W);

  useEffect(() => {
    setSharpReady(false);
    // get the neighbours ready: small first (instant), then sharp
    [1, -1, 2].forEach((d) => warm(sized(list[(index + d + list.length) % list.length].url, GRID_W)));
    [1, -1].forEach((d) => warm(sized(list[(index + d + list.length) % list.length].url, FULL_W)));
  }, [index, list]);

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
      <div className="box">
        <div
          className="viewer-img"
          style={{
            aspectRatio: String(p.aspect || 0.75),
            width: `min(calc(100vw - 32px), calc((100dvh - 150px) * ${p.aspect || 0.75}))`,
          }}
        >
          {p.lqip && <img className="v-blur" src={p.lqip} alt="" aria-hidden="true" />}
          <img key={`s-${p.id}`} className="v-small" src={small} alt="" aria-hidden="true" decoding="async" />
          {full !== small && (
            <img
              key={`f-${p.id}`}
              className={`v-full${sharpReady ? ' ready' : ''}`}
              src={full}
              alt={p.title || `Design ${index + 1}`}
              decoding="async"
              onLoad={() => setSharpReady(true)}
              ref={(el) => { if (el && el.complete && el.naturalWidth) setTimeout(() => setSharpReady(true)); }}
            />
          )}
        </div>
        <div className="meta">
          <button aria-label="Previous" onClick={() => go(-1)}>◀</button>
          <span>{p.title || label} · {index + 1} / {list.length}</span>
          <button aria-label="Next" onClick={() => go(1)}>▶</button>
        </div>
      </div>
    </div>
  );
}
