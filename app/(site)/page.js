import Portfolio from '@/components/Portfolio';
import { client, SETTINGS_QUERY, POSTERS_QUERY } from '@/lib/sanity';
import { DEFAULT_SETTINGS, LOCAL_POSTERS, LOCAL_START } from '@/lib/defaults';

// re-check the CMS for changes at most once a minute
export const revalidate = 60;

export default async function Home() {
  let cms = null;
  let cmsPosters = [];
  if (client) {
    try {
      [cms, cmsPosters] = await Promise.all([client.fetch(SETTINGS_QUERY), client.fetch(POSTERS_QUERY)]);
    } catch (e) {
      console.error('Could not load from Sanity', e);
    }
  }

  // empty CMS fields fall back to the default text
  const settings = { ...DEFAULT_SETTINGS };
  for (const [k, v] of Object.entries(cms || {})) if (v !== null && v !== '' && v !== undefined) settings[k] = v;

  const posters = cmsPosters && cmsPosters.length ? cmsPosters : LOCAL_POSTERS;
  const start =
    (cms && cms.start && cms.start.url && cms.start) ||
    (cmsPosters && cmsPosters.length ? cmsPosters.find((p) => p.aspect > 1.2) || cmsPosters[0] : LOCAL_START);

  return <Portfolio settings={settings} posters={posters} start={start} />;
}
