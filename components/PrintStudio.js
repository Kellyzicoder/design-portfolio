'use client';

import { useEffect, useRef, useState } from 'react';
import { ITEMS, ITEM_KEYS, COLOURS, DARK_COLOURS, GROUPS } from '@/lib/printItems';

const W = 400, H = 440;
const MAX_TOTAL = 4 * 1024 * 1024; // everything sent together must stay under Vercel's 4.5 MB limit
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// read an image file, and keep a copy small enough to send (PNG keeps see-through backgrounds)
async function loadDesign(file) {
  const src = await new Promise((ok, bad) => {
    const r = new FileReader();
    r.onload = () => ok(r.result); r.onerror = bad; r.readAsDataURL(file);
  });
  const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; });
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  let upload = file;
  if (file.size > 1.5 * 1024 * 1024) {
    const s = Math.min(1, 1800 / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.round(w0 * s); c.height = Math.round(h0 * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    if (blob) upload = new File([blob], file.name.replace(/\.\w+$/, '') + '.png', { type: 'image/png' });
  }
  return { src, w0, h0, name: file.name, upload };
}

// turn one side's mockup (without the dashed box and handles) into a JPEG
async function snapshot(svg) {
  const copy = svg.cloneNode(true);
  copy.querySelectorAll('.ui').forEach((n) => n.remove());
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('width', 800); copy.setAttribute('height', 880);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  try {
    const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const c = document.createElement('canvas');
    c.width = 800; c.height = 880;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#eef0f3'; ctx.fillRect(0, 0, 800, 880);
    ctx.drawImage(img, 0, 0, 800, 880);
    return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
  } finally { URL.revokeObjectURL(url); }
}

function Mockup({ itemKey, side, colour, design, onMove, svgRef, hidden }) {
  const item = ITEMS[itemKey];
  const { shapes, area } = item.sides[side];
  const fill = item.colours ? colour.fill : '#ffffff';
  const dark = DARK_COLOURS.includes(colour.name) && item.colours;
  // signs and paper: the design is cut to the item's own shape, not just a box
  const body = item.bleed ? shapes.filter((s) => !s.line).slice(-1)[0] : null;
  const stroke = dark ? 'rgba(255,255,255,.28)' : 'rgba(11,12,15,.28)';
  const drag = useRef(null);
  const clipId = `clip-${itemKey}-${side}`;

  const toSvg = (e) => {
    const svg = svgRef.current;
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };

  let box = null;
  if (design) {
    const w = design.scale * area.w;
    const h = w * (design.h0 / design.w0);
    const cx = area.x + design.cx * area.w, cy = area.y + design.cy * area.h;
    box = { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
  }

  const start = (mode) => (e) => {
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, p: toSvg(e), d: { ...design } };
  };
  const move = (e) => {
    const s = drag.current;
    if (!s) return;
    const p = toSvg(e);
    if (s.mode === 'move') {
      onMove({ cx: clamp(s.d.cx + (p.x - s.p.x) / area.w, 0, 1), cy: clamp(s.d.cy + (p.y - s.p.y) / area.h, 0, 1) });
    } else {
      const half = Math.abs(p.x - (area.x + s.d.cx * area.w));
      onMove({ scale: clamp((half * 2) / area.w, 0.1, 1.5) });
    }
  };
  const end = () => { drag.current = null; };

  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={`ps-svg${hidden ? ' ps-off' : ''}`}
      role="img" aria-label={`${item.label} ${side}${design ? ' with your design' : ''}`}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end}
    >
      <defs>
        <clipPath id={clipId}>{body ? <path d={body.d} /> : <rect x={area.x} y={area.y} width={area.w} height={area.h} />}</clipPath>
        <linearGradient id={`shade-${itemKey}-${side}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".10" />
          <stop offset=".22" stopColor="#000" stopOpacity="0" />
          <stop offset=".78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".10" />
        </linearGradient>
      </defs>
      {shapes.filter((s) => !s.line).map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          <path d={s.d} fill={`url(#shade-${itemKey}-${side})`} />
        </g>
      ))}
      {design && (
        <image
          href={design.src} x={box.x} y={box.y} width={box.w} height={box.h}
          preserveAspectRatio="none" clipPath={`url(#${clipId})`}
          style={{ cursor: 'move', touchAction: 'none' }} onPointerDown={start('move')}
        />
      )}
      {shapes.filter((s) => s.line).map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={stroke} strokeWidth={s.thick ? 9 : 1.5} strokeLinecap="round" />
      ))}
      <rect className="ui" x={area.x} y={area.y} width={area.w} height={area.h} fill="none" stroke={dark ? '#fff' : '#2f2fe4'} strokeOpacity=".55" strokeDasharray="5 5" pointerEvents="none" />
      {design && (
        <g className="ui">
          <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke="#2f2fe4" strokeWidth="1.2" pointerEvents="none" />
          <circle cx={box.x + box.w} cy={box.y + box.h} r="9" fill="#2f2fe4" stroke="#fff" strokeWidth="2"
            style={{ cursor: 'nwse-resize', touchAction: 'none' }} onPointerDown={start('size')} aria-label="Drag to resize" />
        </g>
      )}
    </svg>
  );
}

export default function PrintStudio() {
  const [itemKey, setItemKey] = useState('tee');
  const [colour, setColour] = useState(COLOURS[0]);
  const [side, setSide] = useState('front');
  const [designs, setDesigns] = useState({}); // { front: {...}, back: {...} }
  const [qty, setQty] = useState({});
  const [option, setOption] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const started = useRef(Date.now());
  const frontRef = useRef(null), backRef = useRef(null);
  const [utm, setUtm] = useState({ source: '', campaign: '' });

  const item = ITEMS[itemKey];
  const sides = Object.keys(item.sides);
  const total = item.sizes ? item.sizes.reduce((n, s) => n + (Number(qty[s]) || 0), 0) : Number(qty.all) || 0;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setUtm({ source: q.get('utm_source') || '', campaign: q.get('utm_campaign') || '' });
    const pick = q.get('item');
    if (pick && ITEMS[pick]) setItemKey(pick);
  }, []);

  function chooseItem(k) {
    setItemKey(k); setSide('front'); setQty({});
    // designs keep their place, but a back design is dropped for things with one side
    setOption(ITEMS[k].options && ITEMS[k].options.length === 1 ? ITEMS[k].options[0] : '');
    if (!ITEMS[k].sides.back) setDesigns((d) => (d.front ? { front: d.front } : {}));
  }

  async function onFile(e) {
    const file = e.currentTarget.files && e.currentTarget.files[0];
    e.currentTarget.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { setError('Please upload a PNG, JPG or WebP image. PNG with a see-through background looks best.'); setState('error'); return; }
    try {
      const d = await loadDesign(file);
      const area = item.sides[side].area;
      const ratio = (area.h / area.w) * (d.w0 / d.h0);
      // paper and signs: cover the whole thing; clothing and mugs: fit inside the print area
      const fit = item.bleed ? Math.max(1, ratio) : Math.min(1, ratio) * 0.85;
      setDesigns((all) => ({ ...all, [side]: { ...d, cx: 0.5, cy: item.bleed ? 0.5 : 0.42, scale: fit } }));
      if (state === 'error') { setState('idle'); setError(''); }
    } catch {
      setError('That image could not be opened. Please try a different file.'); setState('error');
    }
  }

  const update = (patch) => setDesigns((all) => ({ ...all, [side]: { ...all[side], ...patch } }));
  const remove = () => setDesigns((all) => { const n = { ...all }; delete n[side]; return n; });
  const current = designs[side];

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const placed = sides.filter((s) => designs[s]);
    if (!placed.length) { setError('Please upload your design first.'); setState('error'); return; }
    if (total < 1) { setError('Please add how many you need.'); setState('error'); return; }
    if (item.options && !option) { setError(`Please choose a ${item.optionLabel.toLowerCase()}.`); setState('error'); return; }
    setState('sending');
    try {
      const fd = new FormData(e.currentTarget);
      fd.append('item', itemKey);
      fd.append('colour', item.colours ? colour.name : '');
      fd.append('size_option', item.options ? option : '');
      fd.append('quantity', String(total));
      fd.append('sizes', JSON.stringify(item.sizes ? Object.fromEntries(item.sizes.filter((s) => Number(qty[s]) > 0).map((s) => [s, Number(qty[s])])) : {}));
      fd.append('placement', JSON.stringify(Object.fromEntries(placed.map((s) => [s, { x: +designs[s].cx.toFixed(3), y: +designs[s].cy.toFixed(3), width: +designs[s].scale.toFixed(3) }]))));
      fd.append('t', String(Date.now() - started.current));
      let bytes = 0;
      for (const s of placed) {
        const shot = await snapshot((s === 'back' ? backRef : frontRef).current);
        if (shot) { fd.append(`mockup_${s}`, new File([shot], `mockup-${s}.jpg`, { type: 'image/jpeg' })); bytes += shot.size; }
        fd.append(`design_${s}`, designs[s].upload); bytes += designs[s].upload.size;
      }
      if (bytes > MAX_TOTAL) throw new Error('Your design files are too big to send here. Please send a smaller image, and I’ll ask for the full-size file by email.');
      const res = await fetch('/api/print-quote', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState('sent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message); setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="form-done">
        <h2>Thanks, your quote request is in.</h2>
        <p>I’ll check your design and email you a price and delivery time. If you’re happy with it, you’ll get a secure link to pay online.</p>
        <a className="btn" href="/">Back to the portfolio</a>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <input type="hidden" name="utm_source" value={utm.source} />
      <input type="hidden" name="utm_campaign" value={utm.campaign} />

      <div className="ps">
        <div className="ps-stage">
          {sides.length > 1 && (
            <div className="ps-sides" role="group" aria-label="Side">
              {sides.map((s) => (
                <button type="button" key={s} aria-pressed={side === s} onClick={() => setSide(s)}>
                  {s === 'front' ? 'Front' : 'Back'}{designs[s] ? ' •' : ''}
                </button>
              ))}
            </div>
          )}
          <div className="ps-canvas">
            <Mockup itemKey={itemKey} side="front" colour={colour} design={designs.front} onMove={update} svgRef={frontRef} hidden={side !== 'front'} />
            {item.sides.back && <Mockup itemKey={itemKey} side="back" colour={colour} design={designs.back} onMove={update} svgRef={backRef} hidden={side !== 'back'} />}
          </div>
          <p className="ps-hint">{current ? 'Drag your design to move it. Drag the blue dot to resize.' : 'Your design goes inside the dashed box.'}</p>
        </div>

        <div className="ps-panel">
          <fieldset>
            <legend>1. Pick an item</legend>
            <div className="ps-chips" role="group" aria-label="Item">
              {GROUPS.map((g) => (
                <div className="ps-group" key={g.key}>
                  <span>{g.label}</span>
                  <div>
                    {ITEM_KEYS.filter((k) => ITEMS[k].group === g.key).map((k) => (
                      <button type="button" key={k} aria-pressed={itemKey === k} onClick={() => chooseItem(k)}>{ITEMS[k].label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {item.colours && (
              <div className="field">
                <span>Colour: {colour.name}</span>
                <div className="ps-swatches" role="group" aria-label="Colour">
                  {COLOURS.map((c) => (
                    <button type="button" key={c.name} aria-pressed={colour.name === c.name} aria-label={c.name} title={c.name}
                      style={{ background: c.fill }} onClick={() => setColour(c)} />
                  ))}
                </div>
              </div>
            )}
            {item.options && (
              <label className="field">
                <span>{item.optionLabel} *</span>
                <select value={option} onChange={(e) => setOption(e.target.value)}>
                  <option value="" disabled>Choose one…</option>
                  {item.options.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend>2. Add your design{sides.length > 1 ? ` (${side})` : ''}</legend>
            <label className="field">
              <span>PNG, JPG or WebP. A see-through PNG looks best.</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
            </label>
            {current && (
              <>
                <label className="field">
                  <span>Size</span>
                  <input type="range" min="0.1" max="1.5" step="0.01" value={current.scale} onChange={(e) => update({ scale: Number(e.target.value) })} />
                </label>
                <div className="ps-row">
                  <small className="ps-file">{current.name}</small>
                  <button type="button" className="ps-link" onClick={() => update({ cx: 0.5 })}>Centre</button>
                  <button type="button" className="ps-link" onClick={remove}>Remove</button>
                </div>
              </>
            )}
          </fieldset>

          <fieldset>
            <legend>3. How many?</legend>
            {item.sizes ? (
              <div className="ps-sizes">
                {item.sizes.map((s) => (
                  <label key={s} className="field">
                    <span>{s}</span>
                    <input type="number" inputMode="numeric" min="0" max="99999" value={qty[s] || ''} placeholder="0"
                      onChange={(e) => setQty((q) => ({ ...q, [s]: e.target.value }))} />
                  </label>
                ))}
              </div>
            ) : (
              <label className="field">
                <span>Quantity</span>
                <input type="number" inputMode="numeric" min="1" max="99999" value={qty.all || ''} placeholder={item.bulk ? '100' : '1'}
                  onChange={(e) => setQty({ all: e.target.value })} />
              </label>
            )}
            <small className="ps-total">Total: {total}</small>
          </fieldset>
        </div>
      </div>

      <fieldset>
        <legend>4. Your details</legend>
        <div className="row2">
          <label className="field"><span>Your name *</span><input name="name" required autoComplete="name" /></label>
          <label className="field"><span>Email *</span><input name="email" type="email" required autoComplete="email" /></label>
        </div>
        <div className="row2">
          <label className="field"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
          <label className="field"><span>Business, church or event name</span><input name="organisation" /></label>
        </div>
        <div className="row2">
          <label className="field"><span>When do you need it by?</span><input name="deadline" type="date" /></label>
          <label className="field">
            <span>How did you hear about me?</span>
            <select name="source" defaultValue="">
              <option value="">Choose one…</option>
              <option>Google search</option>
              <option>Google Maps</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>TikTok</option>
              <option>YouTube</option>
              <option>An ad</option>
              <option>Church or a friend</option>
              <option>Other</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Anything else?</span>
          <textarea name="notes" rows={4} placeholder="Delivery area, paper or finish you want, number of booklet pages, or if you want me to design it for you." />
        </label>
      </fieldset>

      {state === 'error' && <p className="form-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Get a quote'}</button>
      <p className="form-note">No cost to ask. You’ll get a price by email, then a secure link to pay online if you want to go ahead.</p>
    </form>
  );
}
