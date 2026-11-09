import SiteNav from '@/components/SiteNav';
import CaseStudies from '@/components/CaseStudies';
import DesignsGallery from '@/components/DesignsGallery';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Work · Kelvin Mensah',
  description: 'All of Kelvin Mensah’s work in one place: UI/UX case studies, logos, flyers, social media, banners and printed designs.',
};

// Everything in one place: UI/UX case studies first, then every design with its section tabs.
export default async function WorkPage() {
  const { settings, posters, sections } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad page-main">
        <div className="wrap">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">Portfolio</p>
          <h1>Work</h1>
          <p className="lead">Everything I’ve made, in one place: websites and apps, logos, flyers, social content and printed designs. Open any design to read the story behind it.</p>
          <section className="svc-work" id="ui-ux">
            <div className="work-head"><h2>UI/UX case studies</h2></div>
            <CaseStudies />
          </section>
          <section className="svc-work" id="designs">
            <div className="work-head"><h2>Graphic design</h2></div>
            <DesignsGallery posters={posters} sections={sections} />
          </section>
        </div>
      </main>
    </>
  );
}
