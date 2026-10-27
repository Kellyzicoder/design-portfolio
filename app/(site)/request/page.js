import SiteNav from '@/components/SiteNav';
import RequestForm from '@/components/RequestForm';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = { title: 'Request a design · Kelvin Mensah', description: 'Start your project with Kelv Studio: logos, brand identities, event flyers, banners and social media design.' };

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
          <h1>Let’s make it impossible to ignore.</h1>
          <p className="lead">Tell me about your brand, event or idea. I’ll come back with a clear price, timeline and a plan to make it stand out.</p>
          <RequestForm types={types} />
        </div>
      </main>
    </>
  );
}
