// 3D previews for the Printing page, built in code with Three.js.
// Studio lighting + reflections (RoomEnvironment), soft shadow on the floor, and models
// for mugs, bottles, paper prints, stickers, banners, flags and signs.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ITEMS } from '@/lib/printItems';

const loadImg = (src) => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; });

// ---------- textures ----------

// draw one side's design onto a canvas covering `face` (a box in the 400 x 440 mockup units),
// placed exactly like the flat mockup. `clip` = an outline path to cut the canvas to (transparent outside).
async function faceCanvas(area, face, design, { px = 1024, bg = '#ffffff', clip } = {}) {
  const c = document.createElement('canvas');
  c.width = px; c.height = Math.round(px * (face.h / face.w));
  const ctx = c.getContext('2d');
  const s = c.width / face.w;
  if (clip) {
    ctx.save(); ctx.scale(s, s); ctx.translate(-face.x, -face.y);
    ctx.clip(new Path2D(clip));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  if (design) {
    const img = await loadImg(design.src);
    const w = design.scale * area.w, h = w * (design.h0 / design.w0);
    const cx = area.x + design.cx * area.w, cy = area.y + design.cy * area.h;
    ctx.save();
    ctx.beginPath(); ctx.rect((area.x - face.x) * s, (area.y - face.y) * s, area.w * s, area.h * s); ctx.clip();
    ctx.drawImage(img, (cx - w / 2 - face.x) * s, (cy - h / 2 - face.y) * s, w * s, h * s);
    ctx.restore();
  }
  if (clip) ctx.restore();
  return c;
}

const texture = (canvas) => {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// a design wrapped round a cylinder: the print area sits on the front
async function wrapTexture(area, design, radius, height, printH) {
  const W = 2048, H = Math.round(W * (height / (2 * Math.PI * radius)));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  const ph = H * (printH / height), pw = ph * (area.w / area.h);
  const part = await faceCanvas(area, area, design, { px: Math.round(pw) });
  ctx.drawImage(part, (W - pw) / 2, (H - ph) / 2, pw, ph);
  return texture(c);
}

// one edge strip of a picture, mirrored (for canvas prints wrapped round the frame)
function edgeStrip(src, side, frac = 0.05) {
  const W = src.width, H = src.height;
  const sx = Math.max(2, Math.round(W * frac)), sy = Math.max(2, Math.round(H * frac));
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  if (side === 'right' || side === 'left') {
    c.width = sx; c.height = H;
    ctx.translate(sx, 0); ctx.scale(-1, 1);
    ctx.drawImage(src, side === 'right' ? W - sx : 0, 0, sx, H, 0, 0, sx, H);
  } else {
    c.width = W; c.height = sy;
    ctx.translate(0, sy); ctx.scale(1, -1);
    ctx.drawImage(src, 0, side === 'top' ? 0 : H - sy, W, sy, 0, 0, W, sy);
  }
  return texture(c);
}

// ---------- materials ----------
const paper = (opts = {}) => new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0, ...opts });
const vinyl = (opts = {}) => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0, ...opts });
const fabric = (opts = {}) => new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, side: THREE.DoubleSide, ...opts });
const ceramic = (opts = {}) => new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, ...opts });
const metal = (color = 0xc4c8cf, rough = 0.32) => new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: rough });

// ---------- shapes from the 2D mockup ----------

// size of the 2D outline (in mockup units) and how big it is in 3D (longest side = `size` units)
function bodyOf(item, side = 'front') {
  const s = item.sides[side];
  const body = s.shapes.filter((x) => !x.line).slice(-1)[0];
  const pts = (body.d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
  const face = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  return { d: body.d, face, area: s.area };
}

// a flat sheet cut to the item's outline, with the design printed on it.
// wave(x, y) lets fabric items ripple (x, y from 0 to 1 across the sheet).
async function cutSheet(item, design, { size = 3, side = 'front', mat = vinyl, wave, segs = 1, back = true } = {}) {
  const { d, face, area } = bodyOf(item, side);
  const k = size / Math.max(face.w, face.h);
  const w = face.w * k, h = face.h * k;
  const geo = new THREE.PlaneGeometry(w, h, wave ? 64 : segs, wave ? 64 : segs);
  if (wave) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, wave(p.getX(i) / w + 0.5, p.getY(i) / h + 0.5) * size);
    geo.computeVertexNormals();
  }
  const map = texture(await faceCanvas(area, face, design, { clip: d }));
  const m = mat({ map, transparent: true, alphaTest: 0.5, side: back ? THREE.DoubleSide : THREE.FrontSide });
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  // 2D mockup point -> 3D point on this sheet (for poles, grommets, ...)
  const at = (x, y) => new THREE.Vector3((x - face.x) * k - w / 2, h / 2 - (y - face.y) * k, 0);
  return { mesh, w, h, k, at };
}

// ---------- the models ----------

async function mug(item, designs) {
  const g = new THREE.Group();
  const r = 1, H = 2.3, wall = 0.07, round = 0.12;
  const white = ceramic({ color: 0xffffff });
  const area = item.sides.front.area;
  // printed straight wall (thetaStart = PI puts the middle of the print facing you)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, H - round * 2, 128, 1, true, Math.PI),
    ceramic({ map: await wrapTexture(area, designs.front, r, H - round * 2, (H - round * 2) * 0.86) })
  );
  // rounded bottom edge, lip and inside, as one turned (lathe) shape
  const pts = [];
  for (let i = 0; i <= 8; i++) { const a = (Math.PI / 2) * (i / 8); pts.push(new THREE.Vector2(r - round + Math.sin(a) * round, -H / 2 + round - Math.cos(a) * round)); }
  const bottom = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, -H / 2), ...pts], 128), white);
  // outside wall up to the rim, a rounded lip, then down the inside to the floor of the mug
  const lip = [new THREE.Vector2(r, H / 2 - round), new THREE.Vector2(r, H / 2)];
  for (let i = 1; i <= 10; i++) { const a = Math.PI * (i / 10); lip.push(new THREE.Vector2(r - wall / 2 + Math.cos(a) * wall / 2, H / 2 + Math.sin(a) * wall / 2)); }
  lip.push(new THREE.Vector2(r - wall, -H / 2 + wall + 0.06), new THREE.Vector2(r - wall - 0.06, -H / 2 + wall), new THREE.Vector2(0, -H / 2 + wall));
  const top = new THREE.Mesh(new THREE.LatheGeometry(lip, 128), ceramic({ color: 0xffffff, side: THREE.DoubleSide }));
  // handle: a smooth C-shaped tube
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(r - 0.05, 0.62, 0), new THREE.Vector3(r + 0.85, 0.78, 0),
    new THREE.Vector3(r + 0.85, -0.62, 0), new THREE.Vector3(r - 0.05, -0.5, 0)
  );
  const handle = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.1, 20, false), white);
  for (const m of [body, bottom, top, handle]) { m.castShadow = true; g.add(m); }
  return g;
}

async function bottle(item, designs) {
  const g = new THREE.Group();
  const r = 0.8, H = 2.7, round = 0.14;
  const white = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const steel = metal();
  const area = item.sides.front.area;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, H, 128, 1, true, Math.PI),
    new THREE.MeshPhysicalMaterial({ roughness: 0.45, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.3, map: await wrapTexture(area, designs.front, r, H, H * 0.82) })
  );
  // rounded base and curved shoulder up to the neck
  const base = [new THREE.Vector2(0, -H / 2 - round)];
  for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + (Math.PI / 2) * (i / 8); base.push(new THREE.Vector2(r - round + Math.cos(t) * round, -H / 2 + Math.sin(t) * round)); }
  const bottomPart = new THREE.Mesh(new THREE.LatheGeometry(base, 128), steel);
  const sh = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; sh.push(new THREE.Vector2(r - r * 0.5 * Math.sin((t * Math.PI) / 2), H / 2 + t * 0.55)); }
  sh.push(new THREE.Vector2(r * 0.5, H / 2 + 0.75));
  const shoulder = new THREE.Mesh(new THREE.LatheGeometry(sh, 128), white);
  // cap with grip ridges
  const capG = new THREE.CylinderGeometry(r * 0.56, r * 0.56, 0.5, 96, 1);
  const pos = capG.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), a = Math.atan2(z, x), rr = Math.hypot(x, z);
    if (rr > r * 0.5) { const f = 1 + 0.025 * Math.cos(a * 48); pos.setX(i, x * f); pos.setZ(i, z * f); }
  }
  capG.computeVertexNormals();
  const cap = new THREE.Mesh(capG, new THREE.MeshStandardMaterial({ color: 0x23252b, roughness: 0.45 }));
  cap.position.y = H / 2 + 0.75 + 0.25;
  for (const m of [body, bottomPart, shoulder, cap]) { m.castShadow = true; g.add(m); }
  return g;
}

// paper: flyers, posters, business cards, booklets (a slight natural curl, front and back)
async function sheet(itemKey, item, designs) {
  const g = new THREE.Group();
  const { face } = bodyOf(item);
  const k = 3 / Math.max(face.w, face.h);
  const w = face.w * k, h = face.h * k;
  const thick = { card: 0.03, booklet: 0.09 }[itemKey] || 0.008;
  const front = paper({ map: texture(await faceCanvas(item.sides.front.area, face, designs.front)) });
  const backMat = item.sides.back
    ? paper({ map: texture(await faceCanvas(item.sides.back.area, face, designs.back)) })
    : paper({ color: 0xf4f4f2 });
  if (itemKey === 'card' || itemKey === 'booklet') {
    const edge = paper({ color: 0xf6f6f3 });
    const geo = new RoundedBoxGeometry(w, h, thick, 2, itemKey === 'booklet' ? 0.012 : 0.004);
    const m = new THREE.Mesh(geo, [edge, edge, edge, edge, front, backMat]);
    m.castShadow = true; g.add(m);
    if (itemKey === 'booklet') {
      // spine and page edges
      const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, h - 0.03, thick * 0.8), paper({ color: 0xfbfbf8 }));
      pages.position.x = 0.02; g.add(pages);
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(thick / 2, thick / 2, h, 16, 1, false, Math.PI, Math.PI), front);
      spine.position.x = -w / 2; g.add(spine);
    }
    return g;
  }
  // thin sheet: bend it a little like real paper
  const geo = new THREE.PlaneGeometry(w, h, 40, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / w; p.setZ(i, -0.18 * (x * x * 4) * (w / 3)); }
  geo.computeVertexNormals();
  const f = new THREE.Mesh(geo, front);
  const b = new THREE.Mesh(geo.clone(), backMat);
  b.rotation.y = Math.PI; b.position.z = -thick;
  // the back mesh is turned round, so flip its curl to match the front
  const bp = b.geometry.attributes.position;
  for (let i = 0; i < bp.count; i++) bp.setZ(i, -bp.getZ(i));
  b.geometry.computeVertexNormals();
  f.castShadow = b.castShadow = true;
  g.add(f, b);
  return g;
}

// stickers and labels: cut to shape, a thin white backing, slight gloss
async function sticker(item, designs) {
  const g = new THREE.Group();
  const s = await cutSheet(item, designs.front, { size: 2.6, mat: (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2, ...o }), back: false });
  // plain white back, same shape
  const backing = (await cutSheet(item, null, { size: 2.6, mat: paper, back: false })).mesh;
  backing.rotation.y = Math.PI;
  backing.position.z = -0.012;
  g.add(s.mesh, backing);
  return g;
}

async function banner(item, designs) {
  const g = new THREE.Group();
  const s = await cutSheet(item, designs.front, { size: 3.4, wave: (x, y) => 0.006 * Math.sin(x * 9) * (1 - y * 0.3) });
  g.add(s.mesh);
  // metal eyelets (grommets) round the edge
  const ring = new THREE.TorusGeometry(0.035, 0.012, 10, 24), steel = metal();
  const nx = 6, ny = 3;
  for (let i = 0; i <= nx; i++) for (const y of [0, 1]) {
    const e = new THREE.Mesh(ring, steel); e.position.set(-s.w / 2 + 0.08 + (s.w - 0.16) * (i / nx), s.h / 2 - 0.08 - (s.h - 0.16) * y, 0.004); g.add(e);
  }
  for (let j = 1; j < ny; j++) for (const x of [0, 1]) {
    const e = new THREE.Mesh(ring, steel); e.position.set(-s.w / 2 + 0.08 + (s.w - 0.16) * x, s.h / 2 - 0.08 - (s.h - 0.16) * (j / ny), 0.004); g.add(e);
  }
  return g;
}

async function pullup(item, designs) {
  const g = new THREE.Group();
  const s = await cutSheet(item, designs.front, { size: 3.6, back: false });
  g.add(s.mesh);
  const alu = metal(0xc9ccd2, 0.28);
  const base = new THREE.Mesh(new RoundedBoxGeometry(s.w * 1.06, 0.16, 0.34, 3, 0.05), alu);
  base.position.set(0, -s.h / 2 - 0.06, 0.02); base.castShadow = true;
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, s.w * 1.02, 16), alu);
  rail.rotation.z = Math.PI / 2; rail.position.set(0, s.h / 2, 0.01);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, s.h, 12), alu);
  pole.position.set(0, 0, -0.06);
  const feet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.9), alu);
  feet.position.set(0, -s.h / 2 - 0.13, 0.05);
  g.add(base, rail, pole, feet);
  return g;
}

// feather and beach (teardrop) flags: printed fabric on a bent pole, on a cross base
async function flag(item, designs, kind) {
  const g = new THREE.Group();
  const s = await cutSheet(item, designs.front, {
    size: 3.8, mat: fabric,
    wave: (x, y) => 0.012 * Math.sin(x * 5 + y * 3) * x + 0.008 * Math.sin(y * 11) * x,
  });
  g.add(s.mesh);
  // the pole follows the flag's left (and top) edge
  const pts = kind === 'beach'
    ? [s.at(164, 430), s.at(164, 396), s.at(164, 200), s.at(165, 112), s.at(180, 62), s.at(214, 42), s.at(248, 40)]
    : [s.at(150, 430), s.at(150, 300), s.at(150, 120), s.at(152, 24), s.at(200, 24), s.at(250, 30)];
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => p.setZ(-0.02)));
  const fibre = new THREE.MeshStandardMaterial({ color: 0x2a2c31, roughness: 0.35, metalness: 0.4 });
  const pole = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.025, 12, false), fibre);
  pole.castShadow = true;
  g.add(pole);
  // cross base
  const foot = s.at(kind === 'beach' ? 164 : 150, 430);
  const legGeo = new THREE.BoxGeometry(1.1, 0.04, 0.06);
  for (const a of [0, Math.PI / 2]) {
    const leg = new THREE.Mesh(legGeo, metal(0x5b6069, 0.4)); leg.rotation.y = a; leg.position.copy(foot); leg.position.z = -0.02; leg.castShadow = true; g.add(leg);
  }
  return g;
}

async function corflute(item, designs) {
  const g = new THREE.Group();
  const s = await cutSheet(item, designs.front, { size: 3, back: false, mat: (o) => new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }) });
  const board = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, 0.05), new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.6 }));
  board.position.z = -0.026; board.castShadow = true;
  g.add(board, s.mesh);
  // H-shaped wire stake
  const wire = metal(0x8a8f99, 0.45);
  for (const x of [-0.22, 0.22]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.7, 10), wire);
    leg.position.set(x, -s.h / 2 - 0.6, -0.026); leg.castShadow = true; g.add(leg);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 10), wire);
  bar.rotation.z = Math.PI / 2; bar.position.set(0, -s.h / 2 - 0.12, -0.026); g.add(bar);
  return g;
}

// canvas print: the picture wraps round the wooden frame (mirrored edges), linen texture feel
async function canvasPrint(item, designs) {
  const g = new THREE.Group();
  const { face, area } = bodyOf(item);
  const k = 3 / Math.max(face.w, face.h);
  const w = face.w * k, h = face.h * k, d = 0.16;
  const pic = await faceCanvas(area, face, designs.front);
  const m = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.9 });
  const back = new THREE.MeshStandardMaterial({ color: 0xd9c7a3, roughness: 0.95 });
  // box faces: right, left, top, bottom, front, back
  const box = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.01), [
    m(edgeStrip(pic, 'right')), m(edgeStrip(pic, 'left')), m(edgeStrip(pic, 'top')), m(edgeStrip(pic, 'bottom')), m(texture(pic)), back,
  ]);
  box.castShadow = true;
  g.add(box);
  return g;
}

export async function buildModel(itemKey, designs) {
  const item = ITEMS[itemKey];
  switch (itemKey) {
    case 'mug': return mug(item, designs);
    case 'bottle': return bottle(item, designs);
    case 'flyer': case 'poster': case 'card': case 'booklet': return sheet(itemKey, item, designs);
    case 'sticker': case 'label': return sticker(item, designs);
    case 'banner': return banner(item, designs);
    case 'pullup': return pullup(item, designs);
    case 'flag': return flag(item, designs, 'feather');
    case 'beachflag': return flag(item, designs, 'beach');
    case 'corflute': return corflute(item, designs);
    case 'canvas': return canvasPrint(item, designs);
    default: return new THREE.Group();
  }
}

// ---------- the scene ----------

export function createScene(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // soft studio reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.6, 8);
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 });
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xc9ced8, 0.35));

  // floor that only shows the shadow
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 3;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI * 0.55; // don't go under the floor
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.4;
  const stopSpin = () => { controls.autoRotate = false; };
  renderer.domElement.addEventListener('pointerdown', stopSpin);

  const size = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(el); size();

  let raf, model = null;
  const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
  loop();

  // stand the model on the floor, centred, and frame it
  function setModel(next) {
    if (model) { scene.remove(model); dispose(model); }
    model = next;
    if (!model) return;
    const box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    model.position.x -= c.x; model.position.z -= c.z; model.position.y -= box.min.y;
    scene.add(model);
    const tall = sz.y, big = Math.max(sz.x, sz.y, sz.z);
    controls.target.set(0, tall / 2, 0);
    const dist = Math.max(5, big * 2.9);
    const dir = camera.position.clone().sub(controls.target).normalize();
    if (dir.y < 0.05) dir.y = 0.12;
    camera.position.copy(controls.target).add(dir.normalize().multiplyScalar(dist));
    key.position.set(3, tall + 4, 4);
    key.target = model;
  }

  function destroy() {
    cancelAnimationFrame(raf); ro.disconnect();
    renderer.domElement.removeEventListener('pointerdown', stopSpin);
    if (model) dispose(model);
    envTex.dispose(); pmrem.dispose();
    controls.dispose(); renderer.dispose();
    el.removeChild(renderer.domElement);
  }
  return { setModel, destroy, renderer, scene, camera };
}

export function dispose(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    ms.forEach((m) => { if (m.map) m.map.dispose(); if (m.alphaMap && m.alphaMap !== m.map) m.alphaMap.dispose(); m.dispose(); });
  });
}
