import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';
import { projectId } from '../../../lib/sanity';

export const dynamic = 'force-static';
export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  if (!projectId) {
    return (
      <p style={{ fontFamily: 'system-ui', padding: 32, maxWidth: 560 }}>
        The CMS is not connected yet. Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in the Vercel project settings
        (Settings → Environment Variables), then redeploy.
      </p>
    );
  }
  return <NextStudio config={config} />;
}
