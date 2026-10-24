import { SECTIONS } from './sections';

// All sections from the CMS, in order. "parent" is the key of the section it sits inside.
export const SECTIONS_QUERY = `*[_type == "section" && defined(key.current)] | order(coalesce(order, 999) asc, title asc){
  _id, title, "key": key.current, "parent": parent->key.current
}`;

// Flat CMS list -> [{ id, title, subs?: [{ id, title }] }]  (same shape as lib/sections.js)
export function buildTree(list) {
  if (!list || !list.length) return SECTIONS;
  const top = list.filter((s) => !s.parent);
  return top.map((t) => {
    const subs = list.filter((s) => s.parent === t.key).map((s) => ({ id: s.key, title: s.title }));
    return subs.length ? { id: t.key, title: t.title, subs } : { id: t.key, title: t.title };
  });
}

// The sections a poster can go in: top-level ones without sub-sections, plus every sub-section.
export function pickable(tree) {
  return tree.flatMap((s) =>
    s.subs ? s.subs.map((x) => ({ title: `${s.title} – ${x.title}`, value: x.id })) : [{ title: s.title, value: s.id }]
  );
}

// First time only: copy the starting sections into the CMS so they can be edited.
// Keys stay the same, so posters already uploaded keep their section.
export async function seedSectionsIfEmpty(client) {
  const count = await client.fetch('count(*[_type == "section"])');
  if (count > 0) return false;
  const tx = client.transaction();
  SECTIONS.forEach((s, i) => {
    tx.createIfNotExists({ _id: `section-${s.id}`, _type: 'section', title: s.title, key: { _type: 'slug', current: s.id }, order: (i + 1) * 10 });
    (s.subs || []).forEach((x, j) => {
      tx.createIfNotExists({
        _id: `section-${x.id}`, _type: 'section', title: x.title, key: { _type: 'slug', current: x.id }, order: (j + 1) * 10,
        parent: { _type: 'reference', _ref: `section-${s.id}` },
      });
    });
  });
  await tx.commit();
  return true;
}
