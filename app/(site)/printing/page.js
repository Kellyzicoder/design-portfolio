import SiteNav from '@/components/SiteNav';
import PrintStudio from '@/components/PrintStudio';
import ShowcaseGrid from '@/components/ShowcaseGrid';
import { ServiceBrief, ServiceWork, ServiceContact } from '@/components/ServiceSections';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Printing · Kelv Studio',
  description: 'Custom printing in Auckland: t-shirts, hoodies, caps, mugs, stickers, flyers, posters, business cards, banners and signs. Upload your design, see a live mockup and get a quote from Kelv Studio.',
};

// designs that were printed: team shirts, backdrops, banners and pull-ups
const PRINTED = /team shirt|backdrop|banner|pull-up/i;
const NOT_PRINT = /youtube|title banner|easter/i;

export default async function PrintingPage() {
  const { settings, posters } = await getSiteData();
  const printed = posters.filter((p) => PRINTED.test(p.title || '') && !NOT_PRINT.test(p.title || '')).slice(0, 8);
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad page-main">
        <div className="wrap">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">Printing</p>
          <h1>Your design, printed.</h1>
          <p className="lead">Team shirts, merch, flyers, banners and backdrops, designed and printed in one place. Bring your own design or have me make one, see a live mockup, and get a price by email.</p>
          <ServiceBrief
            items={[
              ['Clothing', 'T-shirts, hoodies and caps for teams, events and brands.'],
              ['Mugs, stickers & labels', 'Gifts, merch and packaging.'],
              ['Paper prints', 'Flyers, posters and business cards.'],
              ['Signs & displays', 'Banners, backdrops, pull-ups and feather flags for events.'],
            ]}
            steps={[
              ['Pick an item', 'Choose what you want printed below.'],
              ['Add your design', 'Upload it and see a live mockup, or ask me to design it.'],
              ['Get a quote', 'You get a price and delivery time by email.'],
              ['Printed & delivered', 'Once you approve and pay, it’s printed and sent to you.'],
            ]}
          />
          {printed.length > 0 && (
            <ServiceWork title="Printed work">
              <ShowcaseGrid posters={printed} label="Printed design" />
            </ServiceWork>
          )}
          <section className="svc-work" id="quote">
            <div className="work-head"><h2>Get a printing quote</h2></div>
            <PrintStudio />
          </section>
          <ServiceContact
            topic="Printing"
            quoteHref="#quote"
            quoteLabel="Start a printing quote"
            quoteText="Pick an item above, add your design and send it over. You’ll get a price and delivery time by email."
            email={settings.email}
          />
        </div>
      </main>
    </>
  );
}
