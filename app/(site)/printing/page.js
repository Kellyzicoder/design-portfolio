import SiteNav from '@/components/SiteNav';
import PrintStudio from '@/components/PrintStudio';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Printing · Kelv Studio',
  description: 'Custom printing in Auckland: t-shirts, hoodies, caps, mugs, stickers, flyers, posters, business cards, banners and signs. Upload your design, see a live mockup and get a quote from Kelv Studio.',
};

export default async function PrintingPage() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad form-page">
        <div className="wrap">
          <a className="back" href="/">← Back</a>
          <p className="eyebrow">Printing</p>
          <h1>Your design, printed.</h1>
          <p className="lead">Clothing, mugs, stickers, flyers, banners and signs. Pick an item, upload your design and see how it looks. Send it over and I’ll email you a price and delivery time.</p>
          <PrintStudio />
        </div>
      </main>
    </>
  );
}
