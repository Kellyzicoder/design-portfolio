'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ITEMS } from '@/lib/printItems';

// Items that have a 3D view (built here in code). Clothing, caps and flags will use Blender models later.
// depth = how thick the flat items are, in the same units as their size (the longest side is 3 units).
const FLAT = { flyer: 0.01, poster: 0.01, card: 0.025, booklet: 0.07, sticker: 0.012, label: 0.012, banner: 0.012, pullup: 0.012, corflute: 0.05, canvas: 0.2 };

// the face of the item the texture covers (most items: the print area itself)
const FACE = { sticker: { x: 90, y: 80, w: 220, h: 280 } };

const loadImg = (src) => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; });

// draw one side's design onto a canvas covering `face`, placed exactly like the flat mockup
async function faceCanvas(area, face, design, px = 1024, bg = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = px; c.height = Math.round(px * (face.h / face.w));
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  if (design) {
    const img = await loadImg(design.src);
    const s = c.width / face.w;
    const w = design.scale * area.w, h = w * (design.h0 / design.w0);
    const cx = area.x + design.cx * area.w, cy = area.y + design.cy * area.h;
    ctx.save();
    ctx.beginPath(); ctx.rect((area.x - face.x) * s, (area.y - face.y) * s, area.w * s, area.h * s); ctx.clip();
    ctx.drawImage(img, (cx - w / 2 - face.x) * s, (cy - h / 2 - face.y) * s, w * s, h * s);
    ctx.restore();
  }
  return c;
}

const texture = (canvas) => {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const mat = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, ...opts });

// a design wrapped round a cylinder: the print area sits on the front, the handle side stays plain
async function wrapTexture(area, design, radius, height, printH) {
  const W = 2048, H = Math.round(W * (height / (2 * Math.PI * radius)));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  const ph = H * (printH / height), pw = ph * (area.w / area.h);
  const part = await faceCanvas(area, area, design, Math.round(pw));
  ctx.drawImage(part, (W - pw) / 2, (H - ph) / 2, pw, ph);
  return texture(c);
}

async function buildModel(itemKey, designs) {
  const item = ITEMS[itemKey];
  const g = new THREE.Group();
  const white = mat({ color: 0xffffff });

  if (FLAT[itemKey] !== undefined) {
    const area = item.sides.front.area;
    const face = FACE[itemKey] || area;
    const k = 3 / Math.max(face.w, face.h);
    const w = face.w * k, h = face.h * k, d = FLAT[itemKey] * (itemKey === 'canvas' ? 1 : 3);
    const front = mat({ map: texture(await faceCanvas(area, face, designs.front)) });
    const back = item.sides.back
      ? mat({ map: texture(await faceCanvas(item.sides.back.area, FACE[itemKey] || item.sides.back.area, designs.back)) })
      : mat({ color: itemKey === 'canvas' ? 0xd9c7a3 : 0xf2f2f2 });
    const edge = mat({ color: itemKey === 'corflute' ? 0xe9e9e9 : 0xf7f7f7 });
    // box faces: right, left, top, bottom, front, back
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [edge, edge, edge, edge, front, back]));

    if (itemKey === 'pullup') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, 0.12, 0.28), mat({ color: 0xb8bcc4, metalness: 0.6, roughness: 0.35 }));
      base.position.set(0, -h / 2 - 0.06, 0);
      g.add(base);
    }
    if (itemKey === 'corflute') {
      const stakeMat = mat({ color: 0x8a8f99, metalness: 0.5, roughness: 0.4 });
      for (const x of [-w * 0.15, w * 0.15]) {
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 12), stakeMat);
        stake.position.set(x, -h / 2 - 0.6, -d);
        g.add(stake);
      }
      g.position.y = 0.5;
    }
    return g;
  }

  const area = item.sides.front.area;
  if (itemKey === 'mug') {
    const r = 1, height = 2.3;
    // thetaStart = PI puts the middle of the texture on the side facing you
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, height, 96, 1, true, Math.PI),
      mat({ map: await wrapTexture(area, designs.front, r, height, height * 0.78), side: THREE.FrontSide })
    );
    const inside = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.94, height, 96, 1, true), mat({ color: 0xf1f1f1, side: THREE.BackSide }));
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(r, 96), white);
    bottom.rotation.x = Math.PI / 2; bottom.position.y = -height / 2;
    const rim = new THREE.Mesh(new THREE.RingGeometry(r * 0.94, r, 96), white);
    rim.rotation.x = -Math.PI / 2; rim.position.y = height / 2;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.11, 20, 48, Math.PI), white);
    handle.rotation.z = -Math.PI / 2; handle.position.x = r;
    g.add(body, inside, bottom, rim, handle);
    return g;
  }

  if (itemKey === 'bottle') {
    const r = 0.8, height = 3;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, height, 96, 1, false, Math.PI),
      [mat({ map: await wrapTexture(area, designs.front, r, height, height * 0.8) }), white, white]
    );
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r, 0.6, 96), white);
    shoulder.position.y = height / 2 + 0.3;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.48, r * 0.48, 0.55, 64), mat({ color: 0x2a2c31, roughness: 0.4 }));
    cap.position.y = height / 2 + 0.6 + 0.27;
    g.add(body, shoulder, cap);
    g.position.y = -0.35;
    return g;
  }
  return g;
}

export default function Print3D({ itemKey, designs }) {
  const box = useRef(null);
  const three = useRef(null);

  // set up the scene once
  useEffect(() => {
    const el = box.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.4, 7.5);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9bec8, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 5);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(-4, 2, -4);
    scene.add(key, rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 3.5;
    controls.maxDistance = 12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.6;
    const stopSpin = () => { controls.autoRotate = false; };
    renderer.domElement.addEventListener('pointerdown', stopSpin);

    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el); size();

    let raf;
    const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    loop();

    three.current = { scene, model: null };
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', stopSpin);
      controls.dispose(); renderer.dispose();
      el.removeChild(renderer.domElement);
      three.current = null;
    };
  }, []);

  // rebuild the model when the item or design changes
  useEffect(() => {
    let cancelled = false;
    buildModel(itemKey, designs).then((model) => {
      const t = three.current;
      if (cancelled || !t) return dispose(model);
      if (t.model) { t.scene.remove(t.model); dispose(t.model); }
      t.model = model;
      t.scene.add(model);
    });
    return () => { cancelled = true; };
  }, [itemKey, designs]);

  return <div ref={box} className="ps-3d" aria-label="3D preview. Drag to turn it around, scroll or pinch to zoom." role="img" />;
}

function dispose(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
  });
}
