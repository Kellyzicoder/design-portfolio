import SiteNav from '@/components/SiteNav';
import DesignsGallery from '@/components/DesignsGallery';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Graphic design · Kelvin Mensah',
  description: 'Graphic design by Kelvin Mensah: brand identities, logos, event flyers, banners and social media content.',
};

export default async function DesignsPage() {
  const { settings, posters, sections } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad page-main">
        <div className="wrap">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">Graphic design</p>
          <h1>Designs</h1>
          <p className="lead">Brand identities, logos, event flyers and social content, made to stand out on a wall or in a feed.</p>
          <DesignsGallery posters={posters} sections={sections} />
        </div>
      </main>
    </>
  );
}
