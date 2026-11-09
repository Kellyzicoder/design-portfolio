// Things people can get printed, drawn as simple outlines on a 400 x 440 canvas.
// "area" is where a design can go on each side (same 400 x 440 units).
// "bleed" items (paper, signs) are covered edge to edge by the design when it is first added.
// "options" is a list the customer picks from (paper size, banner size, mug size, ...).

// orders of this many or more are bulk orders (made in bulk by a factory, lower price per item)
export const BULK_MIN = 50;

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// colours for clothing, caps, bags, mugs and bottles
export const COLOURS = [
  { name: 'White', fill: '#ffffff' },
  { name: 'Black', fill: '#1b1c20' },
  { name: 'Charcoal', fill: '#3d4047' },
  { name: 'Grey', fill: '#b9bcc3' },
  { name: 'Navy', fill: '#1f2a44' },
  { name: 'Royal blue', fill: '#2346a8' },
  { name: 'Sky blue', fill: '#8cc4ea' },
  { name: 'Red', fill: '#c8202b' },
  { name: 'Maroon', fill: '#6b1f2a' },
  { name: 'Forest green', fill: '#24533a' },
  { name: 'Pink', fill: '#f1a7c1' },
  { name: 'Yellow', fill: '#f5d040' },
  { name: 'Cream', fill: '#efe6d2' },
];
// prints (flags, banners, signs, paper, stickers) are full colour, so any background colour works
export const isHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ''));
// is this colour dark? (then lines and the dashed box are drawn light)
export function isDark(hex) {
  const m = String(hex || '').match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return false;
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

export const GROUPS = [
  { key: 'apparel', label: 'Clothing & bags' },
  { key: 'drinkware', label: 'Caps & mugs' },
  { key: 'stickers', label: 'Stickers & labels' },
  { key: 'paper', label: 'Paper prints' },
  { key: 'signs', label: 'Signs & displays' },
];

const TEE_BODY = 'M118 42 L162 28 L238 28 L282 42 L362 92 L330 156 L294 140 L294 422 L106 422 L106 140 L70 156 L38 92 Z';
const HOODIE_BODY = 'M122 52 L160 34 L240 34 L278 52 L340 104 L384 334 L344 346 L298 170 L298 422 L102 422 L102 170 L56 346 L16 334 L60 104 Z';

// a sheet of paper (A sizes are 1 : 1.414), centred on the canvas
const sheet = (h = 400) => {
  const w = Math.round(h / 1.414), x = Math.round((400 - w) / 2), y = Math.round((440 - h) / 2);
  return { d: `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`, area: { x, y, w, h } };
};
const rect = (x, y, w, h) => ({ d: `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`, area: { x, y, w, h } });

const A = sheet();
const CARD = rect(30, 110, 340, 220);
const STICKER = { d: 'M90 110 Q90 80 120 80 L280 80 Q310 80 310 110 L310 330 Q310 360 280 360 L120 360 Q90 360 90 330 Z', area: { x: 104, y: 94, w: 192, h: 252 } };

export const ITEMS = {
  // ---------- clothing & bags ----------
  tee: {
    group: 'apparel', label: 'T-shirt', sizes: APPAREL_SIZES, colours: true,
    sides: {
      front: { shapes: [{ d: TEE_BODY }, { d: 'M162 28 Q200 66 238 28', line: true }], area: { x: 138, y: 96, w: 124, h: 170 } },
      back: { shapes: [{ d: TEE_BODY }, { d: 'M162 28 Q200 44 238 28', line: true }], area: { x: 132, y: 80, w: 136, h: 190 } },
    },
  },
  hoodie: {
    group: 'apparel', label: 'Hoodie', sizes: APPAREL_SIZES, colours: true,
    sides: {
      front: {
        shapes: [
          { d: HOODIE_BODY },
          { d: 'M160 34 Q200 112 240 34', line: true },
          { d: 'M150 300 L250 300 L272 368 L128 368 Z', line: true },
          { d: 'M190 74 L186 118 M210 74 L214 118', line: true },
        ],
        area: { x: 146, y: 120, w: 108, h: 120 },
      },
      back: {
        shapes: [{ d: HOODIE_BODY }, { d: 'M150 50 Q200 -6 250 50 Q228 82 200 84 Q172 82 150 50 Z', line: true }],
        area: { x: 130, y: 104, w: 140, h: 180 },
      },
    },
  },
  tote: {
    group: 'apparel', label: 'Tote bag', colours: true,
    sides: {
      front: {
        shapes: [{ d: 'M150 132 Q150 40 200 40 Q250 40 250 132', line: true, thick: true }, { d: 'M86 128 L314 128 L322 424 L78 424 Z' }],
        area: { x: 112, y: 162, w: 176, h: 220 },
      },
    },
  },

  // ---------- caps & mugs ----------
  cap: {
    group: 'drinkware', label: 'Cap', colours: true,
    sides: {
      front: {
        shapes: [
          { d: 'M70 280 Q70 120 200 110 Q330 120 330 280 Z' },
          { d: 'M40 300 Q200 250 360 300 Q200 370 40 300 Z' },
          { d: 'M200 104 a6 6 0 1 0 0.1 0', line: true },
        ],
        area: { x: 130, y: 160, w: 140, h: 100 },
      },
    },
  },
  mug: {
    group: 'drinkware', label: 'Mug', colours: true, optionLabel: 'Mug size', options: ['11 oz (330 ml)', '15 oz (440 ml)'],
    sides: {
      front: {
        shapes: [
          { d: 'M290 170 Q370 170 370 250 Q370 330 290 330', line: true, thick: true },
          { d: 'M80 110 L300 110 L300 360 Q300 380 280 380 L100 380 Q80 380 80 360 Z' },
          { d: 'M80 110 Q190 124 300 110', line: true },
        ],
        area: { x: 100, y: 140, w: 180, h: 210 },
      },
    },
  },
  bottle: {
    group: 'drinkware', label: 'Water bottle', colours: true, optionLabel: 'Bottle size', options: ['500 ml', '750 ml'],
    sides: {
      front: {
        shapes: [
          { d: 'M168 30 L232 30 L232 80 L168 80 Z' },
          { d: 'M160 80 L240 80 Q290 110 290 160 L290 400 Q290 420 270 420 L130 420 Q110 420 110 400 L110 160 Q110 110 160 80 Z' },
        ],
        area: { x: 124, y: 180, w: 152, h: 200 },
      },
    },
  },

  // ---------- stickers & labels ----------
  sticker: {
    group: 'stickers', label: 'Stickers', bleed: true, bulk: true,
    optionLabel: 'Sticker size', options: ['50 × 50 mm', '75 × 75 mm', '100 × 100 mm', 'A5 sticker sheet', 'Custom size'],
    sides: { front: { shapes: [{ d: STICKER.d }], area: STICKER.area } },
  },
  label: {
    group: 'stickers', label: 'Product labels', bleed: true, bulk: true,
    optionLabel: 'Label size', options: ['50 × 30 mm', '70 × 50 mm', '100 × 70 mm', 'Round 50 mm', 'Custom size'],
    sides: { front: { shapes: [{ d: rect(40, 130, 320, 200).d }], area: rect(40, 130, 320, 200).area } },
  },

  // ---------- paper prints ----------
  flyer: {
    group: 'paper', label: 'Flyers', bleed: true, bulk: true,
    optionLabel: 'Flyer size', options: ['A6 (105 × 148 mm)', 'A5 (148 × 210 mm)', 'A4 (210 × 297 mm)', 'DL (99 × 210 mm)'],
    sides: { front: { shapes: [{ d: A.d }], area: A.area }, back: { shapes: [{ d: A.d }], area: A.area } },
  },
  poster: {
    group: 'paper', label: 'Posters', bleed: true, bulk: true,
    optionLabel: 'Poster size', options: ['A3 (297 × 420 mm)', 'A2 (420 × 594 mm)', 'A1 (594 × 841 mm)', 'A0 (841 × 1189 mm)'],
    sides: { front: { shapes: [{ d: A.d }], area: A.area } },
  },
  card: {
    group: 'paper', label: 'Business cards', bleed: true, bulk: true,
    optionLabel: 'Card size', options: ['Standard (90 × 55 mm)'],
    sides: { front: { shapes: [{ d: CARD.d }], area: CARD.area }, back: { shapes: [{ d: CARD.d }], area: CARD.area } },
  },
  booklet: {
    group: 'paper', label: 'Booklets', bleed: true, bulk: true,
    optionLabel: 'Booklet size', options: ['A5 (148 × 210 mm)', 'A4 (210 × 297 mm)'],
    sides: {
      front: { shapes: [{ d: A.d }, { d: `M${A.area.x + 6} ${A.area.y} L${A.area.x + 6} ${A.area.y + A.area.h}`, line: true }], area: A.area },
      back: { shapes: [{ d: A.d }], area: A.area },
    },
  },

  // ---------- signs & displays ----------
  banner: {
    group: 'signs', label: 'Vinyl banner', bleed: true,
    optionLabel: 'Banner size', options: ['1200 × 600 mm', '1800 × 900 mm', '2400 × 1200 mm', '3000 × 1000 mm', 'Custom size'],
    sides: {
      front: {
        shapes: [
          { d: 'M18 130 L382 130 L382 330 L18 330 Z' },
          { d: 'M30 142 a5 5 0 1 0 0.1 0 M370 142 a5 5 0 1 0 0.1 0 M30 318 a5 5 0 1 0 0.1 0 M370 318 a5 5 0 1 0 0.1 0', line: true },
        ],
        area: { x: 18, y: 130, w: 364, h: 200 },
      },
    },
  },
  pullup: {
    group: 'signs', label: 'Pull-up banner', bleed: true,
    optionLabel: 'Pull-up size', options: ['850 × 2000 mm', '1000 × 2000 mm', '1200 × 2000 mm'],
    sides: {
      front: {
        shapes: [{ d: 'M130 418 L270 418 L274 432 L126 432 Z' }, { d: rect(116, 8, 168, 410).d }],
        area: { x: 116, y: 8, w: 168, h: 410 },
      },
    },
  },
  flag: {
    group: 'signs', label: 'Feather flag', bleed: true,
    optionLabel: 'Flag size', options: ['Small (2.2 m)', 'Medium (3.2 m)', 'Large (4.5 m)'],
    sides: {
      front: {
        shapes: [
          { d: 'M150 430 L150 110 Q150 26 242 24', line: true, thick: true },
          { d: 'M152 372 L152 110 Q153 30 240 28 L240 372 Z' },
        ],
        area: { x: 152, y: 28, w: 88, h: 344 },
      },
    },
  },
  beachflag: {
    group: 'signs', label: 'Beach flag', bleed: true,
    optionLabel: 'Flag size', options: ['Small (2.0 m)', 'Medium (2.8 m)', 'Large (3.4 m)', 'Extra large (4.5 m)'],
    sides: {
      front: {
        shapes: [
          { d: 'M164 396 L164 430 M136 430 L192 430', line: true, thick: true },
          { d: 'M164 396 L164 112 Q168 34 248 40 Q328 50 318 160 Q304 300 164 396 Z' },
        ],
        area: { x: 170, y: 64, w: 136, h: 270 },
      },
    },
  },
  corflute: {
    group: 'signs', label: 'Corflute sign', bleed: true,
    optionLabel: 'Sign size', options: ['A3 (297 × 420 mm)', 'A2 (420 × 594 mm)', '600 × 900 mm', 'Custom size'],
    sides: {
      front: {
        shapes: [{ d: 'M170 320 L170 430 M230 320 L230 430', line: true, thick: true }, { d: rect(40, 90, 320, 230).d }],
        area: { x: 40, y: 90, w: 320, h: 230 },
      },
    },
  },
  canvas: {
    group: 'signs', label: 'Canvas print', bleed: true,
    optionLabel: 'Canvas size', options: ['300 × 400 mm', '400 × 600 mm', '600 × 900 mm', 'Custom size'],
    sides: {
      front: {
        shapes: [{ d: 'M86 52 L318 52 L326 60 L326 396 L318 404 L86 404 Z' }, { d: rect(76, 44, 240, 352).d }],
        area: { x: 76, y: 44, w: 240, h: 352 },
      },
    },
  },
};

export const ITEM_KEYS = Object.keys(ITEMS);

// items with a 3D view (built in code). Clothing, caps and tote bags will use 3D model files later.
export const ITEMS_3D = ['mug', 'bottle', 'sticker', 'label', 'flyer', 'poster', 'card', 'booklet', 'banner', 'pullup', 'flag', 'beachflag', 'corflute', 'canvas'];
