import styles from './Reviews.module.css';

// Sanity images can be resized on the fly; other images are used as they are
const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
const BADGE = { google: 'Google', fiverr: 'Fiverr' };
const month = (d) => {
  if (!d) return '';
  const t = new Date(d);
  return isNaN(t) ? '' : t.toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });
};

function Stars({ n }) {
  if (!n) return null;
  return <span className={styles.stars} aria-label={`${n} out of 5 stars`}>{'★'.repeat(n)}<span aria-hidden="true">{'★'.repeat(5 - n)}</span></span>;
}

/* "Kind words": Google reviews (pulled in automatically) plus reviews added in the Studio (Fiverr, direct). */
export default function Reviews({ testimonials = [], google = null }) {
  const list = [...((google && google.reviews) || []), ...testimonials];
  if (!list.length) return null;
  return (
    <section className="block pad" id="kind-words" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="work-head">
          <h2>Kind words</h2>
          {google && google.count > 0 ? (
            <p className={styles.summary}>
              <span className={styles.big}>{Number(google.rating || 0).toFixed(1)}</span>
              <Stars n={Math.round(google.rating || 0)} />
              <span>{google.count} Google review{google.count === 1 ? '' : 's'}</span>
              <a href="/review">Leave a review</a>
            </p>
          ) : (
            <p className="eyebrow" style={{ margin: 0 }}>From people I’ve designed for</p>
          )}
        </div>
        <div className={`quotes${list.length === 1 ? ' single' : ''}`}>
          {list.map((t) => (
            <figure key={t.id} className="quote">
              <div className={styles.top}>
                {t.rating ? <Stars n={t.rating} /> : <span className="mark" aria-hidden="true">“</span>}
                {BADGE[t.source] && <span className={`${styles.badge} ${styles[t.source]}`}>{BADGE[t.source]}</span>}
              </div>
              <blockquote>{t.feedback}</blockquote>
              <figcaption>
                {t.photo ? (
                  <img src={sized(t.photo, 120)} alt="" width="48" height="48" loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <span className="initial" aria-hidden="true">{(t.name || '?').trim().charAt(0)}</span>
                )}
                <span>
                  <b>{t.link ? <a href={t.link} target="_blank" rel="noopener noreferrer">{t.name}</a> : t.name}</b>
                  {(t.company || t.date) && <small>{[t.company, month(t.date)].filter(Boolean).join(' · ')}</small>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
