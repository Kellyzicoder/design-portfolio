import SiteNav from '@/components/SiteNav';
import ContractForm from '@/components/ContractForm';
import { getSiteData } from '@/lib/getSiteData';
import { contractParts } from '@/lib/contract';

export const revalidate = 60;
export const metadata = { title: 'Design agreement · Kelvin Mensah', description: 'Read and sign the Kelv Studio design agreement online.', robots: { index: false } };

export default async function ContractPage() {
  const { settings } = await getSiteData();
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad form-page">
        <div className="wrap narrow">
          <a className="back" href="/#contact">← Back</a>
          <p className="eyebrow">Design agreement</p>
          <h1>Let’s make it official.</h1>
          <p className="lead">Please read the terms, fill in the project details and sign by typing your name. You’ll get a PDF copy straight away.</p>
          <ContractForm parts={contractParts(settings.contractTerms)} />
        </div>
      </main>
    </>
  );
}
