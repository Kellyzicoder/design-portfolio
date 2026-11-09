import AskForm from './AskForm';

/* Building blocks for the service pages (Designs, UI/UX, Printing):
   a short brief, a few examples, then a contact section to get a quote or ask a question. */

export function ServiceBrief({ items, steps }) {
  return (
    <div className="svc-brief">
      <div>
        <h2>What I do</h2>
        <ul className="svc-list">
          {items.map(([title, text]) => <li key={title}><b>{title}</b><span>{text}</span></li>)}
        </ul>
      </div>
      {steps && (
        <div>
          <h2>How it works</h2>
          <ol className="svc-steps">
            {steps.map(([title, text]) => <li key={title}><b>{title}</b><span>{text}</span></li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

export function ServiceWork({ title = 'Recent work', more = '/work', moreLabel = 'See all my work', children }) {
  return (
    <section className="svc-work">
      <div className="work-head">
        <h2>{title}</h2>
        <a className="svc-more" href={more}>{moreLabel} <span aria-hidden="true">→</span></a>
      </div>
      {children}
    </section>
  );
}

export function ServiceContact({ topic, quoteHref, quoteLabel = 'Get a quote', quoteText, email }) {
  return (
    <section className="svc-contact" id="contact">
      <div className="svc-quote">
        <p className="eyebrow">Contact</p>
        <h2>Ready to start?</h2>
        <p>{quoteText}</p>
        <a className="btn" href={quoteHref}>{quoteLabel}</a>
        {email && <p className="svc-mail">Or email <a href={`mailto:${email}`}>{email}</a></p>}
      </div>
      <div className="svc-ask">
        <h3>Have a question first?</h3>
        <p>Ask anything: prices, timing, or whether I can help with your idea.</p>
        <AskForm topic={topic} />
      </div>
    </section>
  );
}
