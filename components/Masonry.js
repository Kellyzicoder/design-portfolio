'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';

/*
  A steady masonry grid. Instead of letting the browser shuffle designs between columns
  (which made them jump around while images loaded), we pick the number of columns from
  the width and place each design in the shortest column, using its known shape.
  Nothing moves after that.
*/
const useIso = typeof window === 'undefined' ? () => {} : useLayoutEffect;

export default function Masonry({ items, render, className = 'masonry', minCol = 120, maxCols = 8, gap = 16, empty = null }) {
  const ref = useRef(null);
  const [cols, setCols] = useState(0); // 0 = not measured yet (stays hidden for one frame)

  useIso(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const n = Math.max(1, Math.min(maxCols, Math.floor((w + gap) / (minCol + gap))));
      setCols((c) => (c === n ? c : n));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minCol, maxCols, gap]);

  const columns = useMemo(() => {
    const n = Math.max(1, cols || 1);
    const out = Array.from({ length: n }, () => ({ h: 0, list: [] }));
    items.forEach((p, i) => {
      let best = 0;
      for (let c = 1; c < n; c++) if (out[c].h < out[best].h - 0.01) best = c;
      out[best].list.push([p, i]);
      out[best].h += 1 / (p.aspect || 0.75) + 0.05; // height for a width of 1, plus the gap
    });
    return out;
  }, [items, cols]);

  return (
    <div ref={ref} className={`${className} mgrid`} style={{ '--mgap': `${gap}px`, visibility: cols ? 'visible' : 'hidden' }}>
      {items.length === 0 ? empty : columns.map((col, c) => (
        <div className="mcol" key={c}>{col.list.map(([p, i]) => render(p, i))}</div>
      ))}
    </div>
  );
}
