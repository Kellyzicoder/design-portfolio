import SiteNav from '@/components/SiteNav';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Human Nutrition Unit redesign · Case study · Kelvin Mensah',
  description: 'UX/UI case study: redesigning the University of Auckland Human Nutrition Unit website, from Figma prototype to coded pages.',
};

const IMG = '/case-studies/hnu';

function Shot({ src, alt, w, h, caption, tall }) {
  return (
    <figure className={`cs-shot${tall ? ' tall' : ''}`}>
      <img src={`${IMG}/${src}.webp`} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export default async function HnuCaseStudy() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad case">
        <div className="wrap">
          <a className="back" href="/">← Back</a>
          <p className="eyebrow">Case study · UX/UI design</p>
          <h1>Redesigning the Human Nutrition Unit website</h1>
          <p className="lead">
            A one-semester University of Auckland capstone for a real client. I owned the high-fidelity Figma design,
            redesigned the key pages, presented them to the client, and then coded pages myself in Next.js.
          </p>

          <dl className="cs-facts">
            <div><dt>Client</dt><dd>Human Nutrition Unit, University of Auckland</dd></div>
            <div><dt>My role</dt><dd>Design lead (Figma), front-end developer</dd></div>
            <div><dt>Team</dt><dd>6 people, one semester (2026)</dd></div>
            <div><dt>Tools</dt><dd>Figma, Next.js, TypeScript, Payload CMS</dd></div>
          </dl>
          <p className="cs-links">
            <a href="https://hnu-uoa-beta.vercel.app" target="_blank" rel="noopener noreferrer">View the live build ↗</a>
          </p>
        </div>

        <section className="wrap cs-section">
          <p className="eyebrow">01 · The problem</p>
          <h2>A busy research unit with a website that was hard to use</h2>
          <div className="cs-text">
            <p>
              The Human Nutrition Unit runs nutrition studies and works with universities, health groups and food companies.
              Its website has to serve very different people: people thinking about joining a study, research partners,
              donors, future postgraduate students and international interns.
            </p>
            <p>The old site made all of them work hard:</p>
            <ul>
              <li>The home page was mostly a block of text, with no clear next step for any visitor.</li>
              <li>Each study was one long article, so key facts like length, location and who can join were buried.</li>
              <li>The contact page mixed three audiences into one form, and the form showed a broken reCAPTCHA error.</li>
            </ul>
          </div>
          <div className="cs-grid three">
            <Shot src="old-home" alt="Old HNU home page: text-heavy layout" w={1600} h={911} caption="Old home page" />
            <Shot src="old-study" alt="Old NZ Synergy study page: long article" w={1600} h={911} caption="Old study page" />
            <Shot src="old-contact" alt="Old contact page with broken reCAPTCHA" w={1600} h={908} caption="Old contact page" />
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">02 · My role and process</p>
          <h2>From a cancelled project to a client-approved design</h2>
          <div className="cs-text">
            <p>
              Our first project was cancelled in week 2, and we were moved to the Human Nutrition Unit. After the first client
              meeting, the team gave me ownership of the high-fidelity Figma design.
            </p>
          </div>
          <ol className="cs-steps">
            <li><strong>Prototype.</strong> I built the first interactive Figma prototype: home page, navigation, reusable components, and mobile versions of each layout.</li>
            <li><strong>Critique.</strong> In week 8 a teammate said our home page lacked hierarchy and clarity. The team agreed, and I rebuilt it from scratch with a cleaner, research-focused layout.</li>
            <li><strong>Client review.</strong> I redesigned the Collaborations page, presented it at our weekly client meeting, and reworked the content flow based on their feedback.</li>
            <li><strong>Build.</strong> Teammates coded from my designs while I answered layout questions. I coded the Research page (filters, pagination, grid and list views) and the Collaborations page.</li>
          </ol>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">03 · The pages I designed</p>
          <h2>Collaborations: partners and impact at a glance</h2>
          <div className="cs-text">
            <p>
              The old site had no clear way to show who the unit works with. I designed a page that leads with partner logos,
              then four collaboration areas (academic, clinical, government and industry), and ends with the unit’s impact.
              After presenting it to the client, I changed the content flow so it matched how the unit really works with partners.
            </p>
          </div>
          <Shot src="new-collab" alt="Redesigned Collaborations page" w={1280} h={3004} caption="Collaborations page: designed, presented to the client, then coded by me" tall />

          <h2 className="cs-sub">Home: rebuilt after an honest critique</h2>
          <div className="cs-text">
            <p>
              My second home page gives each visitor a clear path: a strong headline with “Read more” and “Participate in a study”
              buttons, a short “Who we are”, what the unit does, key numbers, and a donation call to action. I also designed the
              Donation page, following University of Auckland branding with the main call to action above the fold.
            </p>
          </div>
          <div className="cs-grid phones">
            <Shot src="mobile-home" alt="Mobile home page design" w={354} h={3937} caption="Home (mobile)" tall />
          </div>

          <h2 className="cs-sub">Team pages in the same system</h2>
          <div className="cs-text">
            <p>
              My teammate Ayush Kumar designed the Studies pages and the main Contact layout. I reviewed the Contact page and adjusted
              spacing and layout so every page matched the same design system.
            </p>
          </div>
          <div className="cs-grid two">
            <Shot src="new-studies" alt="Studies list with study cards" w={1280} h={1875} caption="Our Studies (designed by Ayush Kumar)" />
            <Shot src="new-contact" alt="Contact page with simple form" w={1280} h={1740} caption="Contact (layout by Ayush, refined by me)" />
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">04 · The live build</p>
          <h2>From Figma to a working website</h2>
          <div className="cs-text">
            <p>
              The team built the site in Next.js and TypeScript. I coded the Research page myself: search by title or DOI,
              sorting, filters by category and staff member, pagination, and grid and list views. On phones the filters fold
              into one “Filters” button so the results stay easy to reach.
            </p>
          </div>
          <Shot src="live-home" alt="Live HNU home page on desktop" w={1600} h={1003} caption="Home page, live site" />
          <div className="cs-grid build">
            <Shot src="live-research" alt="Live Research page on desktop with search, sort and category filters" w={1600} h={1004} caption="Research page (coded by me), desktop" />
            <Shot src="live-research-mobile" alt="Live Research page on a phone" w={600} h={1342} caption="Research page, mobile" />
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">05 · What I learned</p>
          <h2>What I’d take into my next project</h2>
          <div className="cs-text">
            <ul>
              <li><strong>Critique makes the work better.</strong> It stung to hear our home page wasn’t good enough after hours of work. Rebuilding it gave us a much stronger design system for every other page.</li>
              <li><strong>Iteration with the client is the job.</strong> The client’s feedback on the Collaborations page meant more changes in a busy week, but the final page fits how the unit really works.</li>
              <li><strong>Designs are instructions for developers.</strong> Once teammates coded from my Figma files, I saw how much clear, consistent components and spacing matter when several people build from the same source.</li>
              <li><strong>Knowing the code helps the design.</strong> Coding the Research and Collaborations pages myself, and fixing merge conflicts along the way, taught me what makes a design easy to build.</li>
              <li><strong>Accessibility is not optional.</strong> A public research site serves everyone, so strong colour contrast, clear hierarchy and simple navigation are a responsibility, not a style choice.</li>
            </ul>
            <p className="cs-next">
              <strong>What I’d do differently:</strong> share rough wireframes and a few layout options with the team and the client
              much earlier, before polishing anything in high fidelity. Both our big redesigns would have been small changes at the wireframe stage.
            </p>
          </div>
        </section>

        <div className="wrap cs-end">
          <a className="cta" href="https://hnu-uoa-beta.vercel.app" target="_blank" rel="noopener noreferrer">View the live build ↗</a>
          <a className="back" href="/">← Back to all work</a>
        </div>
      </main>
    </>
  );
}
