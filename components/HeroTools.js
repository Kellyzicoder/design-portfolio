'use client';

import { useEffect, useRef } from 'react';

/*
  Faded design-tool icons behind the headline (pen, brush, type, eyedropper...).
  They drift gently away from the cursor, each at its own depth, so the background feels alive.
  Phones and "reduce motion" get a still version.
*/
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONS = {
  pen: <><path d="M12 19l7-7 3 3-7 7-3-3z" {...P} /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" {...P} /><path d="M2 2l7.6 7.6" {...P} /><circle cx="11" cy="11" r="2" {...P} /></>,
  brush: <><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" {...P} /><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" {...P} /></>,
  type: <><path d="M4 7V4h16v3" {...P} /><path d="M9 20h6" {...P} /><path d="M12 4v16" {...P} /></>,
  eyedropper: <><path d="M2 22l1-1h3l9-9" {...P} /><path d="M3 21v-3l9-9" {...P} /><path d="M15 6l3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4z" {...P} /></>,
  crop: <><path d="M6 2v14a2 2 0 0 0 2 2h14" {...P} /><path d="M18 22V8a2 2 0 0 0-2-2H2" {...P} /></>,
  layers: <><path d="M12 2l10 5-10 5L2 7l10-5z" {...P} /><path d="M2 17l10 5 10-5" {...P} /><path d="M2 12l10 5 10-5" {...P} /></>,
  palette: <><circle cx="13.5" cy="6.5" r="1" {...P} /><circle cx="17.5" cy="10.5" r="1" {...P} /><circle cx="8.5" cy="7.5" r="1" {...P} /><circle cx="6.5" cy="12.5" r="1" {...P} /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.96 6.01 17.46 2 12 2z" {...P} /></>,
  cursor: <><path d="M4 4l7.07 17 2.51-7.39L21 11.07z" {...P} /></>,
  bezier: <><circle cx="5" cy="19" r="2" {...P} /><circle cx="19" cy="5" r="2" {...P} /><path d="M7 19c6 0 4-14 10-14" {...P} /><path d="M3 9h6M15 15h6" {...P} /></>,
  wand: <><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M12.2 6.2L11 5" {...P} /><path d="M15 9l-12 12" {...P} /></>,
  frame: <><path d="M22 6H2M22 18H2M6 2v20M18 2v20" {...P} /></>,
  shapes: <><circle cx="7" cy="7" r="4.5" {...P} /><rect x="12.5" y="12.5" width="9" height="9" rx="1" {...P} /><path d="M17 2.5l4 7h-8z" {...P} /></>,
};

// where each icon sits (percent of the screen), its size and how strongly it moves (depth)
const SPOTS = [
  ['pen', 9, 22, 46, 0.9, -12], ['type', 20, 70, 40, 0.5, 8], ['eyedropper', 6, 58, 34, 0.35, 18],
  ['layers', 15, 86, 38, 0.7, -6], ['bezier', 25, 12, 36, 0.4, 0],
  ['brush', 88, 20, 46, 0.85, 14], ['palette', 80, 66, 44, 0.6, -10], ['crop', 94, 52, 34, 0.35, 0],
  ['cursor', 75, 10, 30, 0.45, -18], ['shapes', 86, 86, 40, 0.7, 6],
  ['wand', 34, 92, 30, 0.3, 20], ['frame', 64, 92, 32, 0.3, 0],
];

export default function HeroTools() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches;
    if (still) return;
    const items = [...root.children];
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const onMove = (e) => {
      // -1 .. 1 from the centre of the screen
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(step);
    };
    function step() {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      items.forEach((el) => {
        const d = Number(el.dataset.d), r = Number(el.dataset.r);
        el.style.transform = `translate3d(${-x * d * 40}px, ${-y * d * 30}px, 0) rotate(${r + x * d * 8}deg)`;
      });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    }
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="hero-tools" ref={ref} aria-hidden="true">
      {SPOTS.map(([name, left, top, size, depth, rot], i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} data-d={depth} data-r={rot}
          className={i % 3 === 2 ? 'ht-far' : ''}
          style={{ left: `${left}%`, top: `${top}%`, transform: `rotate(${rot}deg)` }}>
          {ICONS[name]}
        </svg>
      ))}
    </div>
  );
}
