import SiteNav from '@/components/SiteNav';
import CaseStudies from '@/components/CaseStudies';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'UI/UX design · Kelvin Mensah',
  description: 'UI/UX case studies by Kelvin Mensah: websites and apps designed in Figma, tested with real clients and built in code.',
};

export default async function UiUxPage() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad page-main">
        <div className="wrap">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">UI/UX design</p>
          <h1>UI/UX</h1>
          <p className="lead">Websites and apps designed in Figma, shaped by real client feedback, then built in code. Each case study shows the problem, my process and what I learned.</p>
          <CaseStudies />
        </div>
      </main>
    </>
  );
}
