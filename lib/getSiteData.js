import { client, SETTINGS_QUERY, POSTERS_QUERY, TESTIMONIALS_QUERY } from '@/lib/sanity';
import { DEFAULT_SETTINGS, LOCAL_POSTERS, LOCAL_START } from '@/lib/defaults';
import { nameFromFile } from '@/lib/fileName';
import { SECTIONS_QUERY, buildTree } from '@/lib/sectionTree';
import { getSiteReviews } from '@/lib/db';

// Everything the pages need from the CMS, with the starter content as a fallback.
export async function getSiteData() {
  let cms = null;
  let cmsPosters = [];
  let testimonials = [];
  let sectionList = [];
  // approved reviews from kelvstudio.com/review (newest first, before the Studio ones)
  const siteReviews = getSiteReviews();
  if (client) {
    try {
      [cms, cmsPosters, testimonials, sectionList] = await Promise.all([
        client.fetch(SETTINGS_QUERY),
        client.fetch(POSTERS_QUERY),
        client.fetch(TESTIMONIALS_QUERY),
        client.fetch(SECTIONS_QUERY),
      ]);
    } catch (e) {
      console.error('Could not load from Sanity', e);
    }
  }

  // empty CMS fields fall back to the default text
  const settings = { ...DEFAULT_SETTINGS };
  for (const [k, v] of Object.entries(cms || {})) if (v !== null && v !== '' && v !== undefined) settings[k] = v;

  // posters without a title use their file name
  if (cmsPosters) cmsPosters = cmsPosters.map((p) => ({ ...p, title: p.title || nameFromFile(p.file) }));
  const posters = cmsPosters && cmsPosters.length ? cmsPosters : LOCAL_POSTERS;
  const start =
    (cms && cms.start && cms.start.url && cms.start) ||
    (cmsPosters && cmsPosters.length ? cmsPosters.find((p) => p.aspect > 1.2) || cmsPosters[0] : LOCAL_START);

  return { settings, posters, start, testimonials: [...(await siteReviews), ...(testimonials || [])], sections: buildTree(sectionList) };
}
