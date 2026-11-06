import SiteNav from '@/components/SiteNav';
import MonthlyForm from '@/components/MonthlyForm';
import { getSiteData } from '@/lib/getSiteData';
import { RATE } from '@/lib/monthlyPlan';

export const revalidate = 60;
// a private link for clients: kept out of Google and out of the menu
export const metadata = { title: 'Monthly design plan · Kelv Studio', description: 'Choose and sign your monthly design plan with Kelv Studio.', robots: { index: false, follow: false } };

export default async function MonthlyPage() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap" />
      <main className="pad form-page">
        <div className="wrap narrow">
          <a className="back" href="/">← Back</a>
          <p className="eyebrow">Monthly design plan</p>
          <h1>Fresh designs, every week.</h1>
          <p className="lead">Pick how many designs you need each week, read the terms and sign by typing your name. NZ${RATE} per design, paid monthly upfront. You’ll get a signed PDF copy straight away.</p>
          <MonthlyForm />
        </div>
      </main>
    </>
  );
}
