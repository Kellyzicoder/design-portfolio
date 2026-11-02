import SiteNav from '@/components/SiteNav';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Human Nutrition Unit redesign · Case study · Kelvin Mensah',
  description: 'UX/UI case study: redesigning the University of Auckland Human Nutrition Unit website for study participants, partners and students.',
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
            A University of Auckland capstone project for a real client. I was the lead designer on the redesign,
            working in Figma alongside a second designer, then helped build it in Next.js.
          </p>

          <dl className="cs-facts">
            <div><dt>Client</dt><dd>Human Nutrition Unit, University of Auckland</dd></div>
            <div><dt>My role</dt><dd>Lead designer (UX/UI), client meetings, front-end development</dd></div>
            <div><dt>Team</dt><dd>6 people, one semester</dd></div>
            <div><dt>Tools</dt><dd>Figma, Next.js, TypeScript, Payload CMS</dd></div>
          </dl>
          <p className="cs-links">
            <a href="https://hnu-uoa-beta.vercel.app" target="_blank" rel="noopener noreferrer">View the live build ↗</a>
          </p>
        </div>

        <section className="wrap cs-section">
          <p className="eyebrow">01 · The problem</p>
          <h2>A useful research unit, hidden behind a hard-to-use website</h2>
          <div className="cs-text">
            <p>
              The Human Nutrition Unit runs nutrition studies and works with universities, health groups and food companies.
              Its website had to serve very different people: people thinking about joining a study, partner universities
              and companies, future postgraduate students, and international students looking for internships.
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
          <p className="eyebrow">02 · Process</p>
          <h2>Listen, design, check, build</h2>
          <ol className="cs-steps">
            <li><strong>Listen.</strong> I led meetings with the client to understand their goals and who the site is for.</li>
            <li><strong>Design.</strong> I designed the full site in Figma for desktop and mobile, working alongside a second designer.</li>
            <li><strong>Check.</strong> Before handing off, I took the designs to our team lead and developers, so the designs were practical to build.</li>
            <li><strong>Build.</strong> I then helped build it: the Research page (search, filters, pagination, grid and list views) and the Collaborations page, connected to a CMS so the client can update content without code.</li>
          </ol>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">03 · The redesign</p>
          <h2>Studies people can scan in seconds</h2>
          <div className="cs-text">
            <p>
              The studies page became a list of cards. Each one shows if the study is open, its reference number, a one-line summary,
              how long it runs and who can join, with one clear “View details” button.
            </p>
          </div>
          <Shot src="new-studies" alt="Redesigned studies list with study cards" w={1280} h={1875} caption="Our Studies: one card per study" />

          <h2 className="cs-sub">One study template, with the answer first</h2>
          <div className="cs-text">
            <p>
              I designed a single study template that works for every study, so the client can add new ones through the CMS.
              Key facts sit at the top (duration, compensation, location), and a “Check if you’re eligible” box stays next to the
              content. Clear “You can join if” and “You cannot join if” lists replace paragraphs of rules.
            </p>
          </div>
          <Shot src="new-study" alt="Study template: key facts, eligibility box and who can join" w={1285} h={3028} caption="Study template (NZ Synergy Study)" tall />

          <h2 className="cs-sub">Partners and contact</h2>
          <div className="cs-text">
            <p>
              The Collaborations page shows partners, the main collaboration areas and the unit’s impact at a glance.
              The contact page became a simple form with a subject menu, with phone and address beside it.
            </p>
          </div>
          <div className="cs-grid two">
            <Shot src="new-collab" alt="Redesigned Collaborations page" w={1280} h={3004} caption="Collaborations" tall />
            <Shot src="new-contact" alt="Redesigned contact page with simple form" w={1280} h={1740} caption="Contact" />
          </div>

          <h2 className="cs-sub">Designed for mobile too</h2>
          <div className="cs-grid phones">
            <Shot src="mobile-home" alt="Mobile home page design" w={354} h={3937} caption="Home (mobile)" tall />
            <Shot src="mobile-contact" alt="Mobile contact page design" w={354} h={1715} caption="Contact (mobile)" />
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">04 · What I learned</p>
          <h2>What I’d take into my next project</h2>
          <div className="cs-text">
            <ul>
              <li><strong>Design for each visitor’s first question.</strong> A study participant wants to know “can I join?”, a partner wants to know “what do you work on?”. Putting that answer first did more than any visual polish.</li>
              <li><strong>Show developers early.</strong> Checking designs with the developers before handoff caught things that would have been hard to build, and saved rework later.</li>
              <li><strong>Design templates, not one-off pages.</strong> Because the client updates content through a CMS, each page had to work with any study or partner, not just the example in Figma.</li>
              <li><strong>Knowing the code helps the design.</strong> Building pages myself showed me what makes a Figma file easy to build from: tidy layers, clear spacing and real content.</li>
            </ul>
            <p className="cs-next"><strong>What I’d do differently:</strong> test the designs with real study participants earlier, and check colour contrast and accessibility (WCAG) from the first draft rather than at the end.</p>
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
