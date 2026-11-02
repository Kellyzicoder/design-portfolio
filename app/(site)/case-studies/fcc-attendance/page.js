import SiteNav from '@/components/SiteNav';
import { getSiteData } from '@/lib/getSiteData';

export const revalidate = 60;
export const metadata = {
  title: 'Church attendance app · Case study · Kelvin Mensah',
  description: 'UX/UI case study: a phone-first attendance and follow-up app for Favourite Child Church, designed, built and improved from weekly feedback.',
};

const IMG = '/case-studies/fcc';
const DEMO = 'https://fcc-welcome.vercel.app/app/?demo';

function Shot({ src, alt, w, h, caption, tall }) {
  return (
    <figure className={`cs-shot${tall ? ' tall' : ''}`}>
      <img src={`${IMG}/${src}.webp`} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export default async function FccCaseStudy() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad case">
        <div className="wrap">
          <a className="back" href="/ui-ux">← All case studies</a>
          <p className="eyebrow">Case study · UX/UI design and build</p>
          <h1>A church attendance app people use every Sunday</h1>
          <p className="lead">
            Favourite Child Church kept attendance on paper registers and Excel sheets. I designed and built a phone-first app
            so ushers can tick people in at the door and leaders can see who needs a call, then kept improving it from their feedback.
          </p>

          <dl className="cs-facts">
            <div><dt>Client</dt><dd>Favourite Child Church, Auckland</dd></div>
            <div><dt>My role</dt><dd>Solo: design, build, support</dd></div>
            <div><dt>Timeline</dt><dd>Live since October 2026, updated weekly</dd></div>
            <div><dt>Tools</dt><dd>HTML, CSS, JavaScript, Next.js, Supabase</dd></div>
          </dl>
          <p className="cs-links">
            <a href={DEMO} target="_blank" rel="noopener noreferrer">Try the demo (made-up people) ↗</a>
          </p>
        </div>

        <section className="wrap cs-section">
          <p className="eyebrow">01 · The problem</p>
          <h2>Paper registers can’t tell you who stopped coming</h2>
          <div className="cs-text">
            <p>
              Attendance lived on paper sheets and Excel files. Counting took time, and nobody could easily see who had missed
              several Sundays in a row and needed a call. Different people needed very different things:
            </p>
            <ul>
              <li><strong>Ushers</strong> at the door need to tick people in fast on a phone, often while people are arriving.</li>
              <li><strong>Pastors and shepherds</strong> need their own people and who needs follow-up.</li>
              <li><strong>Church admins</strong> need the full register, first-timers and reports.</li>
              <li><strong>The Bishop</strong> needs numbers across churches, without seeing personal details.</li>
            </ul>
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">02 · Process</p>
          <h2>Design it, approve it, ship it, listen, repeat</h2>
          <ol className="cs-steps">
            <li><strong>Start small.</strong> It began as a welcome form first-timers fill in from a QR code.</li>
            <li><strong>Approve the design.</strong> I made a dashboard preview in light and dark mode and got it approved before building the app.</li>
            <li><strong>Ship.</strong> The phone app went live with check-in, the congregation list and follow-up, installable from the home screen.</li>
            <li><strong>Listen and repeat.</strong> Every change since comes from feedback from ushers and leaders: more than 580 commits in five weeks.</li>
          </ol>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">03 · The design</p>
          <h2>Check-in built for the church door</h2>
          <div className="cs-text">
            <p>
              Check-in opens with four big numbers (checked in, adults, kids, not yet) and an A to Z list with search and team filters.
              Ushers tick names, add someone new without leaving the page, then “Save &amp; lock” so nothing is changed by accident.
              A Service | Bacenta switch lets the same screen take cell group attendance too.
            </p>
          </div>
          <Shot src="checkin" alt="Check-in page on desktop with counts, team filters and a name list" w={1600} h={859} caption="Check-in (desktop)" />

          <h2 className="cs-sub">A dashboard that points to people, not just numbers</h2>
          <div className="cs-text">
            <p>
              The dashboard shows people present at each service (tap a bar to open that day), a calendar of services, and a
              pastoral care ring. Leaders can add or move widgets, and a “Summary” button makes a short report to share on WhatsApp.
            </p>
          </div>
          <Shot src="dashboard" alt="Dashboard with people present chart and services calendar" w={1600} h={858} caption="Dashboard (desktop, dark mode)" />

          <h2 className="cs-sub">Phone first</h2>
          <div className="cs-text">
            <p>
              Most people use it on a phone, so the main pages sit in a thumb-friendly bottom bar. Follow-up shows who needs a call,
              with clear colour labels and how many services they have missed in a row.
            </p>
          </div>
          <div className="cs-grid phones4">
            <Shot src="phone-home" alt="Home dashboard on a phone" w={520} h={903} caption="Home" />
            <Shot src="phone-checkin" alt="Check-in on a phone" w={520} h={959} caption="Check-in" />
            <Shot src="phone-followup" alt="Follow-up list on a phone" w={520} h={947} caption="Follow-up" />
            <Shot src="phone-people" alt="Congregation on a phone" w={520} h={977} caption="People" />
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">04 · Changes from feedback</p>
          <h2>Small fixes that came from watching people use it</h2>
          <div className="cs-text">
            <ul>
              <li><strong>Seven filter pills became one dropdown on phones.</strong> Wider screens keep the pills, where there is room.</li>
              <li><strong>Buttons show they are busy.</strong> After a tap, a loading bar appears and only that button spins, so nothing is sent twice.</li>
              <li><strong>No more blank screens.</strong> If the app can’t load, a “not loading” page explains what to do and who to contact. A slow connection is not shown as a breakdown.</li>
              <li><strong>Old registers still count.</strong> Admins can load an old Excel register, and the app reads typed marks like ✓, P, Y or 1 and matches the names.</li>
              <li><strong>Fewer words everywhere.</strong> I cut the wording on every page and turned text links into clear buttons.</li>
              <li><strong>Colours explained.</strong> The “At a glance” view now says what the red and amber numbers mean.</li>
              <li><strong>Cell groups added.</strong> Bacentas got their own attendance, meeting days and home visits, because leaders asked for them.</li>
            </ul>
          </div>
          <Shot src="congregation" alt="Congregation list with counts, filters and pastor assignments (made-up demo data)" w={1600} h={857} caption="Congregation, with made-up demo data" />
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">05 · Trust and privacy</p>
          <h2>Each person sees only what their role needs</h2>
          <div className="cs-text">
            <p>
              Ushers see check-in, pastors see only their own people, and the Bishop sees numbers without names. The database
              enforces these rules, not just the screens. The public demo and all screenshots use made-up people.
            </p>
          </div>
        </section>

        <section className="wrap cs-section">
          <p className="eyebrow">06 · What I learned</p>
          <h2>What real users taught me</h2>
          <div className="cs-text">
            <ul>
              <li><strong>Design for the busiest moment.</strong> Sunday morning at the door is when the app has to be fastest and clearest.</li>
              <li><strong>Fewer words win.</strong> Most of my changes made the app shorter and simpler, not bigger.</li>
              <li><strong>Small releases build trust.</strong> Shipping small fixes often meant people saw their feedback turn into changes within days.</li>
              <li><strong>Plan for things going wrong.</strong> Clear error pages, busy buttons and plain-language guides kept non-technical users calm.</li>
            </ul>
            <p className="cs-next"><strong>What I’d do differently:</strong> run a short test with two or three ushers before the first launch, instead of learning everything from live Sundays.</p>
          </div>
        </section>

        <div className="wrap cs-end">
          <a className="cta" href={DEMO} target="_blank" rel="noopener noreferrer">Try the demo ↗</a>
          <a className="back" href="/ui-ux">← All case studies</a>
        </div>
      </main>
    </>
  );
}
