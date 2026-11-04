// Things people can get printed, drawn as simple outlines on a 400 x 440 canvas.
// "area" is where a design can go on each side (same 400 x 440 units).

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const COLOURS = [
  { name: 'White', fill: '#ffffff' },
  { name: 'Black', fill: '#1b1c20' },
  { name: 'Navy', fill: '#1f2a44' },
  { name: 'Grey', fill: '#b9bcc3' },
  { name: 'Red', fill: '#c8202b' },
  { name: 'Cream', fill: '#efe6d2' },
];

const TEE_BODY = 'M118 42 L162 28 L238 28 L282 42 L362 92 L330 156 L294 140 L294 422 L106 422 L106 140 L70 156 L38 92 Z';
const HOODIE_BODY = 'M122 52 L160 34 L240 34 L278 52 L340 104 L384 334 L344 346 L298 170 L298 422 L102 422 L102 170 L56 346 L16 334 L60 104 Z';

export const ITEMS = {
  tee: {
    label: 'T-shirt',
    sizes: APPAREL_SIZES,
    colours: true,
    sides: {
      front: {
        shapes: [
          { d: TEE_BODY },
          { d: 'M162 28 Q200 66 238 28', line: true },
        ],
        area: { x: 138, y: 96, w: 124, h: 170 },
      },
      back: {
        shapes: [
          { d: TEE_BODY },
          { d: 'M162 28 Q200 44 238 28', line: true },
        ],
        area: { x: 132, y: 80, w: 136, h: 190 },
      },
    },
  },
  hoodie: {
    label: 'Hoodie',
    sizes: APPAREL_SIZES,
    colours: true,
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
        shapes: [
          { d: HOODIE_BODY },
          { d: 'M150 50 Q200 -6 250 50 Q228 82 200 84 Q172 82 150 50 Z', line: true },
        ],
        area: { x: 130, y: 104, w: 140, h: 180 },
      },
    },
  },
  tote: {
    label: 'Tote bag',
    sizes: null,
    colours: true,
    sides: {
      front: {
        shapes: [
          { d: 'M150 132 Q150 40 200 40 Q250 40 250 132', line: true, thick: true },
          { d: 'M86 128 L314 128 L322 424 L78 424 Z' },
        ],
        area: { x: 112, y: 162, w: 176, h: 220 },
      },
    },
  },
  banner: {
    label: 'Banner',
    sizes: null,
    colours: false,
    bannerSizes: ['Pull-up banner (850 × 2000 mm)', '1200 × 600 mm', '1800 × 900 mm', '2400 × 1200 mm', '3000 × 1000 mm', 'Custom size'],
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
};

export const ITEM_KEYS = Object.keys(ITEMS);
