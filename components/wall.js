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

  /* textures */
  const CELL_ASPECT = 1 / 1.3; // every wall tile is the same size (width ÷ height)
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const cover = (t, imgAspect, boxAspect) => { // crop to fill the tile, like object-fit: cover
    if (imgAspect > boxAspect) { t.repeat.set(boxAspect / imgAspect, 1); t.offset.set((1 - t.repeat.x) / 2, 0); }
    else { t.repeat.set(1, imgAspect / boxAspect); t.offset.set(0, (1 - t.repeat.y) / 2); }
  };
  const textures = [];
  const load = (url) => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; textures.push(t); return t; };
  const pool = (posters.length ? posters : [start]).map((p) => { const t = load(p.url); cover(t, p.aspect, CELL_ASPECT); return t; });
  const startTex = load(start.url);

  const geo = new THREE.PlaneGeometry(1, 1);
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.shadowColor = 'rgba(15,20,40,.30)'; g.shadowBlur = 20; g.shadowOffsetY = 6; g.fillStyle = 'rgba(15,20,40,.18)'; g.fillRect(22, 22, 84, 84);
    const t = new THREE.CanvasTexture(c); textures.push(t); return t;
  })();

  /* build the wall */
  let W = 1, H = 1, cw = 1, ch = 1, gap = 1, rows = [];
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

    const cols = W < 640 ? 2.4 : W < 1100 ? 4.2 : 5.2; // tiles across the screen
    gap = Math.max(10, Math.round(W * 0.012));
    cw = (W - gap * (cols + 1)) / cols; ch = cw / CELL_ASPECT;
    let nRows = Math.ceil(H / (ch + gap)) + 2; if (nRows % 2 === 0) nRows++;
    let N = Math.ceil(W / (cw + gap)) + 4; if (N % 2 === 0) N++;
    const mid = (nRows - 1) / 2, centre = (N - 1) / 2;

    for (let r = 0; r < nRows; r++) {
      const g = new THREE.Group(); g.position.y = (mid - r) * (ch + gap); wall.add(g);
      const tiles = [];
      for (let i = 0; i < N; i++) {
        const isStart = r === mid && i === centre;
        const holder = new THREE.Group();
        const sh = new THREE.Mesh(geo, mat({ map: shadowTex, transparent: true, depthWrite: false }));
        sh.position.z = -1;
        const m = new THREE.Mesh(geo, mat({ map: isStart ? startTex : pool[(i + r * 3) % pool.length], transparent: true, toneMapped: false }));
        if (isStart) { m.renderOrder = 3; sh.renderOrder = 2; }
        holder.add(sh, m); g.add(holder);
        const t = { holder, m, sh, x0: (i - centre) * (cw + gap), isStart };
        tiles.push(t); sizeTile(t, cw, ch);
      }
      rows.push({ tiles, len: N * (cw + gap), dir: r % 2 ? 1 : -1, speed: 10 + (r % 3) * 6, drift: 0, y: g.position.y });
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
    const sw0 = Math.min(W * (W < 640 ? 0.92 : 0.76), 1500), sh0 = sw0 / start.aspect;
    const top0 = Math.max(textBottom + 36, H * 0.5);
    const y0 = H / 2 - (top0 + sh0 / 2);
    const w = lerp(sw0, cw, a), h = lerp(sh0, ch, a);
    cover(startTex, start.aspect, w / h);

    rows.forEach((row) => {
      if (!reduce) row.drift += row.dir * row.speed * dt * slide;
      const push = row.dir * slide * cw * 0.9;
      row.tiles.forEach((t) => {
        let x = t.x0 + row.drift + push;
        x = (((x + row.len / 2) % row.len) + row.len) % row.len - row.len / 2; // wrap around
        if (t.isStart) {
          t.holder.position.set(lerp(0, x, a), lerp(y0 - row.y, 0, a), 1);
          sizeTile(t, w, h);
        } else {
          t.holder.position.set(x, 0, 0);
          const o = fade * clamp(1 - (Math.abs(x) / (W * 0.75)) * (1 - fade) * 1.5); // nearer tiles appear first
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
