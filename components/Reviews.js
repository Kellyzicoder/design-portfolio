import styles from './Reviews.module.css';

// Sanity images can be resized on the fly; other images are used as they are
const sized = (url, w) => (url && url.includes('cdn.sanity.io') ? `${url}?w=${w}&fm=webp&q=80` : url);
const BADGE = { google: 'Google', fiverr: 'Fiverr', site: 'Kelv Studio' };
const month = (d) => {
  if (!d) return '';
  const t = new Date(d);
  return isNaN(t) ? '' : t.toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });
};

function Stars({ n }) {
  if (!n) return null;
  return <span className={styles.stars} aria-label={`${n} out of 5 stars`}>{'★'.repeat(n)}<span aria-hidden="true">{'★'.repeat(5 - n)}</span></span>;
}

/* "Trusted by clients": Google reviews (pulled in automatically) plus reviews added in the Studio (Fiverr, direct). */
export default function Reviews({ testimonials = [], google = null, bare = false }) {
  const list = [...((google && google.reviews) || []), ...testimonials];
  if (!list.length) return null;
  // repeat the reviews so the strip is long enough, then twice over for a seamless loop
  const base = [];
  while (base.length < Math.max(6, list.length)) base.push(...list);
  const half = base.length;
  const loop = [...base, ...base];
  return (
    <section className={bare ? 'svc-work' : 'block pad'} id="reviews" style={bare ? undefined : { paddingTop: 0 }}>
      <div className={bare ? undefined : 'wrap'}>
        <div className="work-head">
          <h2>Trusted by clients</h2>
          {google && google.count > 0 ? (
            <p className={styles.summary}>
              <span className={styles.big}>{Number(google.rating || 0).toFixed(1)}</span>
              <Stars n={Math.round(google.rating || 0)} />
              <span>{google.count} Google review{google.count === 1 ? '' : 's'}</span>
              <a href="/review">Leave a review</a>
            </p>
          ) : (
            <p className="eyebrow" style={{ margin: 0 }}>Real reviews from people I’ve worked with</p>
          )}
        </div>
        {/* the reviews slide left to right in a loop and pause under the cursor (still for "reduce motion") */}
        <div className={styles.marquee} aria-label="Reviews">
          <div className={styles.track} style={{ '--dur': `${Math.max(30, loop.length * 9)}s` }}>
          {loop.map((t, n) => (
            <figure key={`${t.id}-${n}`} className={`quote ${styles.card}`} aria-hidden={n >= half ? 'true' : undefined}>
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
      </div>
    </section>
  );
}
