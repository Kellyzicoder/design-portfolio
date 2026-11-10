// Each design has its own page: /design/boltx--<id>
// The name part is just for people and Google; the id after "--" is what finds the design.
export const slugify = (s) =>
  String(s || 'design')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'design';

export const designHref = (p) => `/design/${slugify(p.title)}--${p.id}`;
export const idFromSlug = (slug) => decodeURIComponent(String(slug || '')).split('--').pop();

// Sanity images can be resized on the fly; local files are used as they are
export const sizedUrl = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
