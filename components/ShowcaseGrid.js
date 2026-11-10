'use client';

import { useState } from 'react';
import Viewer, { hasCaption } from './Viewer';

// Sanity images can be resized on the fly; local files are used as they are
const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
const blur = (p) => (p.lqip ? { backgroundImage: `url(${p.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined);
const onImgLoad = (e) => e.currentTarget.classList.add('loaded');

/* A small set of designs on a service page. Click one to open it full size with its caption. */
export default function ShowcaseGrid({ posters, label = 'Work' }) {
  const [vi, setVi] = useState(-1);
  if (!posters.length) return null;
  return (
    <>
      <div className="masonry big showcase">
        {posters.map((p, i) => (
          <button key={p.id} onClick={() => setVi(i)} style={{ ...blur(p), aspectRatio: String(p.aspect || 0.75), '--i': i }}>
            <img src={sized(p.url, 600)} alt={p.title || `${label} ${i + 1}`} loading="lazy" decoding="async" onLoad={onImgLoad} ref={(el) => { if (el && el.complete && el.naturalWidth) el.classList.add('loaded'); }} />
            {p.more && p.more.length > 0 && <span className="count" aria-label={`${p.more.length + 1} images`}>+{p.more.length}</span>}
            <span className="cap"><b>{p.title}</b><small>{hasCaption(p) ? 'Read the story' : label}</small></span>
          </button>
        ))}
      </div>
      {vi >= 0 && vi < posters.length && <Viewer list={posters} index={vi} label={label} onClose={() => setVi(-1)} onIndex={setVi} />}
    </>
  );
}
