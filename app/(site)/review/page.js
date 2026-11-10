import SiteNav from '@/components/SiteNav';
import ReviewForm from '@/components/ReviewForm';
import { getSiteData } from '@/lib/getSiteData';

// kelvstudio.com/review: the link sent to clients after a job. They can review on Google or right here.
const GOOGLE_REVIEW = 'https://search.google.com/local/writereview?placeid=ChIJxT-yasM_DW0RrIGV92N6h0A';

export const revalidate = 60;
export const metadata = { title: 'Leave a review · Kelv Studio', description: 'Worked with Kelv Studio? Leave a review on Google or here on the site.' };

export default async function ReviewPage() {
  const { settings } = await getSiteData();
  // the Google link can be changed in the Studio (Site settings → Google review link)
  const google = settings.reviewLink && /^https:\/\//.test(settings.reviewLink) ? settings.reviewLink : GOOGLE_REVIEW;
  return (
    <>
      <SiteNav settings={settings} />
      <main className="pad form-page">
        <div className="wrap narrow">
          <a className="back" href="/">← Home</a>
          <p className="eyebrow">Leave a review</p>
          <h1>Thanks for working with me.</h1>
          <p className="lead">A few words about how it went helps other people trust Kelv Studio. Pick whichever is easiest for you.</p>
          <div className="review-pick">
            <a className="review-google" href={google} target="_blank" rel="noopener noreferrer">
              <span><b>Review on Google</b><small>Opens Google. Needs a Google account.</small></span>
              <span aria-hidden="true">↗</span>
            </a>
            <section className="review-here">
              <h2>Or write it here</h2>
              <p>No account needed. It shows on the site once I’ve checked it.</p>
              <ReviewForm />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
