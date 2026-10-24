import * as THREE from 'three';

/*
  The opening animation.
  Start: one big design peeks up from the bottom under the headline.
  Scroll: it moves into the middle and shrinks to a tile, the other designs
  fade in around it, then the rows slide sideways (one left, the next right).
*/
export function startWall({ canvas, hero, opener, posters, start }) {
  if (!canvas || !hero || !start) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { hero.style.height = 'auto'; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10); // works in screen pixels

  /* textures: every poster keeps its real shape, nothing is cropped */
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const textures = [];
  const imgLoader = new THREE.ImageLoader(); imgLoader.setCrossOrigin('anonymous');
  // show the tiny blurred preview straight away, then swap in the real image when it arrives
  const load = (p) => {
    const t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; textures.push(t);
    const set = (img) => { if (t.userData.ready) t.dispose(); /* new size: let WebGL re-make it */ t.image = img; t.needsUpdate = true; t.userData.ready = true; };
    if (p.lqip) imgLoader.load(p.lqip, (img) => { if (!t.userData.full) set(img); });
    imgLoader.load(p.url, (img) => { t.userData.full = true; set(img); });
    return t;
  };
  const pool = (posters.length ? posters : [start]).map((p) => ({ tex: load(p), aspect: p.aspect || 0.75 }));
  const startTex = load(start);

  const geo = new THREE.PlaneGeometry(1, 1);
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.shadowColor = 'rgba(15,20,40,.30)'; g.shadowBlur = 20; g.shadowOffsetY = 6; g.fillStyle = 'rgba(15,20,40,.18)'; g.fillRect(22, 22, 84, 84);
    const t = new THREE.CanvasTexture(c); textures.push(t); return t;
  })();

  /* build the wall */
  let W = 1, H = 1, ch = 1, gap = 1, rows = [];
  const wall = new THREE.Group(); scene.add(wall);
  const materials = [];
  const mat = (opts) => { const m = new THREE.MeshBasicMaterial(opts); materials.push(m); return m; };
  const sizeTile = (t, w, h) => { t.m.scale.set(w, h, 1); t.sh.scale.set(w * 1.32, h * 1.32, 1); };

  function build() {
    materials.forEach((m) => m.dispose()); materials.length = 0;
    wall.clear(); rows = [];
    W = canvas.clientWidth; H = canvas.clientHeight;
    camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);

    // every tile is the same height; width follows the poster's own shape
    gap = Math.max(10, Math.round(W * 0.012));
    ch = Math.round(Math.min(H * 0.36, W < 640 ? W * 0.62 : 440));
    let nRows = Math.ceil(H / (ch + gap)) + 2; if (nRows % 2 === 0) nRows++;
    const mid = (nRows - 1) / 2;
    const minLen = W * 1.6 + ch * 4; // long enough that the wrap-around is never seen

    for (let r = 0; r < nRows; r++) {
      const g = new THREE.Group(); g.position.y = (mid - r) * (ch + gap); wall.add(g);
      const items = [];
      if (r === mid) items.push({ tex: startTex, aspect: start.aspect || 1.6, isStart: true });
      for (let k = 0, len = 0; len < minLen || k < 3; k++) {
        const it = pool[(k + r * 3) % pool.length];
        items.push(it); len += ch * it.aspect + gap;
      }
      // lay the row out left to right, then centre it (the start design sits at x = 0)
      let x = 0;
      const tiles = items.map((it) => {
        const w = ch * it.aspect;
        const holder = new THREE.Group();
        const sh = new THREE.Mesh(geo, mat({ map: shadowTex, transparent: true, depthWrite: false }));
        sh.position.z = -1;
        const m = new THREE.Mesh(geo, mat({ map: it.tex, transparent: true, toneMapped: false }));
        if (it.isStart) { m.renderOrder = 3; sh.renderOrder = 2; m.material.opacity = 0; sh.material.opacity = 0; }
        holder.add(sh, m); g.add(holder);
        const t = { holder, m, sh, w, x0: x + w / 2, isStart: !!it.isStart };
        sizeTile(t, w, ch);
        x += w + gap;
        return t;
      });
      const len = x;
      const shift = r === mid ? -tiles[0].x0 : -len / 2 + ((r * 97) % 200);
      tiles.forEach((t) => { t.x0 += shift; });
      rows.push({ tiles, len, dir: r % 2 ? 1 : -1, speed: 10 + (r % 3) * 6, drift: 0, y: g.position.y });
    }
  }
  build();
  const onResize = () => build();
  addEventListener('resize', onResize);

  /* scroll animation */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = THREE.MathUtils.lerp;
  const clock = new THREE.Clock();
  let pSm = 0, raf = 0;
  const progress = () => { const r = hero.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - H)); };

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    pSm += (progress() - pSm) * (reduce ? 1 : 0.12);
    const a = ease(clamp(pSm / 0.45));     // first design moves into the middle
    const fade = clamp((pSm - 0.12) / 0.33); // other designs fade in
    const slide = clamp((pSm - 0.4) / 0.6);  // rows slide sideways

    if (opener) {
      opener.style.transform = `translateY(${-a * H * 0.45}px)`;
      opener.style.opacity = clamp(1 - a * 1.6);
      opener.style.pointerEvents = a > 0.3 ? 'none' : '';
    }

    const textBottom = opener ? opener.offsetTop + opener.offsetHeight : H * 0.4;
    const sAsp = start.aspect || 1.6;
    let sw0 = Math.min(W * (W < 640 ? 0.92 : 0.76), 1500), sh0 = sw0 / sAsp;
    if (sh0 > H * 0.75) { sh0 = H * 0.75; sw0 = sh0 * sAsp; } // tall designs: limit the height
    const top0 = Math.max(textBottom + 36, H * 0.5);
    const y0 = H / 2 - (top0 + sh0 / 2);
    // same shape the whole way, so nothing is cut off
    const h = lerp(sh0, ch, a), w = h * sAsp;

    rows.forEach((row) => {
      if (!reduce) row.drift += row.dir * row.speed * dt * slide;
      const push = row.dir * slide * ch * 0.6;
      row.tiles.forEach((t) => {
        let x = t.x0 + row.drift + push;
        x = (((x + row.len / 2) % row.len) + row.len) % row.len - row.len / 2; // wrap around
        if (t.isStart) {
          t.holder.position.set(lerp(0, x, a), lerp(y0 - row.y, 0, a), 1);
          const op = startTex.userData.ready ? Math.min(1, t.m.material.opacity + dt * 4) : 0; // fade in once loaded
          t.m.material.opacity = op; t.sh.material.opacity = op;
          sizeTile(t, w, h);
        } else {
          t.holder.position.set(x, 0, 0);
          const ready = t.m.material.map.userData.ready ? 1 : 0; // never show an empty tile
          const o = ready * fade * clamp(1 - (Math.abs(x) / (W * 0.75)) * (1 - fade) * 1.5); // nearer tiles appear first
          t.m.material.opacity = o; t.sh.material.opacity = o;
          const sc = lerp(0.86, 1, fade); t.holder.scale.set(sc, sc, 1);
        }
      });
    });

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('resize', onResize);
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    geo.dispose();
    renderer.dispose();
  };
}
