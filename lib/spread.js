// Keeps look-alike designs (e.g. "LP Joyce" and "LP Joyce 2") apart in a grid,
// so the same design doesn't appear twice side by side.

const NOISE = /\b(copy|final|new|version|v|landscape|portrait|story|stories|post|square|wide|ig|fb|insta|instagram|facebook|flyer|poster|banner|design|img|image|edit|edited|hbd|hbp|hfd|happy|birthday|bday|celebrating|celebration)\b/g;

// "HBD_LP-Joyce 2 (story).png" -> "hbd lp joyce" (first 3 meaningful words)
export function lookKey(p) {
  const t = String(p.title || p.file || '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[_\-()[\].,]+/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(NOISE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t.split(' ').slice(0, 3).join(' ') || String(p.id);
}

// Reorders as little as possible: each item keeps its place unless it looks like one of the
// last `gap` items placed, in which case the next different-looking item goes first.
export function spread(list, gap = 3) {
  const rest = list.map((p) => ({ p, k: lookKey(p) }));
  const out = [];
  while (rest.length) {
    const recent = out.slice(-gap).map((x) => x.k);
    let i = rest.findIndex((x) => !recent.includes(x.k));
    if (i < 0) i = 0; // nothing different left: just carry on
    out.push(rest.splice(i, 1)[0]);
  }
  return out.map((x) => x.p);
}

// one from each section in turn (Business, Birthday, Church, ...), so a mixed list feels varied
export function mixSections(posters, sectionOrder) {
  const groups = new Map(sectionOrder.map((id) => [id, []]));
  posters.forEach((p) => { if (!groups.has(p.section)) groups.set(p.section, []); groups.get(p.section).push(p); });
  const lists = [...groups.values()].filter((l) => l.length);
  const out = [];
  for (let i = 0; out.length < posters.length; i++) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
}
