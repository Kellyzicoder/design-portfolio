'use client';

import { useState } from 'react';
import { sizedUrl } from '@/lib/designUrl';

/* A design's page: the main image big on one side, the other project images as small boxes next to it.
   Click a small box to show it big. */
export default function DesignGalleryView({ title, images }) {
  const [k, setK] = useState(0);
  const cur = images[k] || images[0];
  const many = images.length > 1;
  return (
    <div className={`dg${many ? ' dg-many' : ''}`}>
      <figure className="dg-main" style={cur.lqip ? { backgroundImage: `url(${cur.lqip})` } : undefined}>
        <img
          key={cur.url}
          src={sizedUrl(cur.url, 1400)}
          alt={cur.label ? `${title}: ${cur.label}` : title}
          style={{ aspectRatio: String(cur.aspect || 0.75) }}
          decoding="async"
        />
        {many && <figcaption>{cur.label || title} · {k + 1} of {images.length}</figcaption>}
      </figure>
      {many && (
        <div className="dg-thumbs" role="tablist" aria-label="Images in this project">
          {images.map((m, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === k}
              onClick={() => setK(i)}
              style={m.lqip ? { backgroundImage: `url(${m.lqip})` } : undefined}
            >
              <img src={sizedUrl(m.url, 400)} alt="" loading="lazy" decoding="async" />
              <span>{m.label || (i === 0 ? title : `Image ${i + 1}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
