import SiteNav from '@/components/SiteNav';
import CaseStudies from '@/components/CaseStudies';
import { ServiceBrief, ServiceWork, ServiceContact } from '@/components/ServiceSections';
import { getSiteData } from '@/lib/getSiteData';
import { getGoogleReviews } from '@/lib/googleReviews';
import Reviews from '@/components/Reviews';

export const revalidate = 60;
export const metadata = {
  title: 'UI/UX & websites · Kelv Studio',
  description: 'UI/UX design and websites by Kelv Studio: websites and apps designed in Figma, tested with real clients and built in code.',
};

export default async function UiUxPage() {
  const [{ settings, testimonials }, googleReviews] = await Promise.all([getSiteData(), getGoogleReviews()]);
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad page-main">
        <div className="wrap">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">UI/UX design</p>
          <h1>Websites people enjoy using.</h1>
          <p className="lead">I design websites and apps in Figma, shape them with real feedback, then build them in code. You get something that looks good, works on every phone, and is easy for you to update.</p>
          <ServiceBrief
            items={[
              ['Websites', 'Business sites, portfolios and landing pages that load fast and look sharp.'],
              ['Web apps', 'Booking, forms, dashboards and tools built around how your people work.'],
              ['UI/UX design', 'Figma designs and clickable prototypes before anything is built.'],
              ['Redesigns', 'Fresh, modern versions of sites that feel old or are hard to use.'],
              ['Easy to update', 'Change your own text and images without touching code.'],
            ]}
            steps={[
              ['Tell me about it', 'What the site is for, who it’s for, and what you like.'],
              ['Get a quote', 'A clear price and timeline by email within 24 hours.'],
              ['Design', 'I design it in Figma and we shape it together.'],
              ['Build & launch', 'I build it, test it on every screen size and put it live.'],
            ]}
          />
          <ServiceWork title="Case studies">
            <CaseStudies />
          </ServiceWork>
          <Reviews bare testimonials={testimonials} google={googleReviews} />
          <ServiceContact
            topic="UI/UX"
            quoteHref="/request"
            quoteLabel="Request a website quote"
            quoteText="Tell me about your website or app and you’ll get a clear quote by email within 24 hours. No cost to ask."
            email={settings.email}
          />
        </div>
      </main>
    </>
  );
}
