import SiteNav from '@/components/SiteNav';
import PrintStudio from '@/components/PrintStudio';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Printing · Kelv Studio',
  description: 'Custom t-shirts, hoodies, tote bags and banners. Upload your design, see it on a live mockup and get a quote from Kelv Studio.',
};

export default async function PrintingPage() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad form-page">
        <div className="wrap">
          <a className="back" href="/">← Back</a>
          <p className="eyebrow">Apparel &amp; banner printing</p>
          <h1>Your design, printed.</h1>
          <p className="lead">Pick an item, upload your design and see how it looks. Send it over and I’ll email you a price and delivery time.</p>
          <PrintStudio />
        </div>
      </main>
    </>
  );
}
