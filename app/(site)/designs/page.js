import SiteNav from '@/components/SiteNav';
import ShowcaseGrid from '@/components/ShowcaseGrid';
import { ServiceBrief, ServiceWork, ServiceContact } from '@/components/ServiceSections';
import { getSiteData } from '@/lib/getSiteData';
import { spread } from '@/lib/spread';

export const revalidate = 60;
export const metadata = {
  title: 'Graphic design · Kelv Studio',
  description: 'Graphic design by Kelv Studio in Auckland: logos, brand identities, event flyers, social media graphics, banners and backdrops.',
};

export default async function DesignsPage() {
  const { settings, posters } = await getSiteData();
  // your best pieces (ticked "featured" in the Studio), up to 8
  const picked = posters.filter((p) => p.featured);
  const showcase = spread(picked.length ? picked : posters).slice(0, 8);
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad page-main">
        <div className="wrap">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">Graphic design</p>
          <h1>Designs that get noticed.</h1>
          <p className="lead">Logos, flyers and social content made to stop the scroll and get your message across in a second. For businesses, events, creators and churches, from one flyer to a full campaign.</p>
          <ServiceBrief
            items={[
              ['Logos & brand identity', 'A logo, colours and type that make your brand easy to remember.'],
              ['Event flyers & posters', 'Concerts, launches, services and conferences, with countdowns and speaker flyers.'],
              ['Social media graphics', 'Posts, stories and carousels sized for every platform.'],
              ['Birthday & celebration flyers', 'Honour someone special with a design people love to share.'],
              ['Banners, backdrops & pull-ups', 'Large designs for stages and events, set up ready to print.'],
              ['Shirts & merch', 'Team shirts and merch designs, with mockups before printing.'],
            ]}
            steps={[
              ['Send your brief', 'Tell me what you need, when, and share any ideas.'],
              ['Get a quote', 'You get a clear price and timeline by email within 24 hours.'],
              ['Drafts & changes', 'I share drafts and improve them with your feedback.'],
              ['Final files', 'You get print-ready and social-ready files in every size you need.'],
            ]}
          />
          <ServiceWork title="Recent designs">
            <ShowcaseGrid posters={showcase} label="Design" />
          </ServiceWork>
          <ServiceContact
            topic="Designs"
            quoteHref="/request"
            quoteLabel="Request a design quote"
            quoteText="Send your brief and you’ll get a clear quote by email within 24 hours. No cost to ask."
            email={settings.email}
          />
        </div>
      </main>
    </>
  );
}
