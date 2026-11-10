'use client';

import { designHref } from './designUrl';

// open a design's own page; remember we came from inside the site so "← Back" returns to the same spot
export function openDesign(router, p) {
  try { sessionStorage.setItem('kvBack', '1'); } catch {}
  router.push(designHref(p));
}
