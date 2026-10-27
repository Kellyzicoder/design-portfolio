import SiteNav from '@/components/SiteNav';
import RequestForm from '@/components/RequestForm';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = { title: 'Request a design · Kelvin Mensah', description: 'Tell me about the flyer, poster, banner or logo you need.' };

export default async function RequestPage() {
  const { settings, sections } = await getSiteData();
  // design types come from the Work sections (main sections and their sub-sections)
  const types = sections.flatMap((s) => (s.subs ? s.subs.map((x) => `${s.title} – ${x.title}`) : [s.title]));
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad form-page">
        <div className="wrap narrow">
          <a className="back" href="/#contact">← Back</a>
          <p className="eyebrow">Request a design</p>
          <h1>Tell me what you need.</h1>
          <p className="lead">Fill this in and I’ll reply with a price and timeline. It takes about two minutes.</p>
          <RequestForm types={types} />
        </div>
      </main>
    </>
  );
}
