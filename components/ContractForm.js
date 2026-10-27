'use client';

import { useRef, useState } from 'react';

export default function ContractForm({ parts }) {
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [pdf, setPdf] = useState(null);
  const started = useRef(Date.now());
  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

  async function onSubmit(e) {
    e.preventDefault();
    setState('sending'); setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    data.agree = !!data.agree;
    data.t = Date.now() - started.current;
    try {
      const res = await fetch('/api/contract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong. Please try again.');
      setPdf(out);
      setState('sent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message); setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="form-done">
        <h2>Signed. Thank you!</h2>
        <p>Your signed agreement has been sent to Kelvin. Keep a copy for yourself:</p>
        {pdf && pdf.pdf && <a className="btn" href={`data:application/pdf;base64,${pdf.pdf}`} download={pdf.filename}>Download signed copy (PDF)</a>}
        <p><a href="/">Back to the portfolio</a></p>
      </div>
    );
  }

  return (
    <>
      <div className="terms" tabIndex={0} aria-label="Agreement terms">
        {parts.map((p, i) => (
          <div key={i}>
            {p.heading && <h3>{p.heading}</h3>}
            {p.body && <p>{p.body}</p>}
          </div>
        ))}
      </div>

      <form className="form" onSubmit={onSubmit}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

        <fieldset>
          <legend>Your details</legend>
          <div className="row2">
            <label className="field"><span>Full name *</span><input name="name" required autoComplete="name" /></label>
            <label className="field"><span>Email *</span><input name="email" type="email" required autoComplete="email" /></label>
          </div>
          <div className="row2">
            <label className="field"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
            <label className="field"><span>Church, business or event name</span><input name="organisation" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>The project</legend>
          <label className="field"><span>What is being designed? *</span><input name="project" required placeholder="e.g. Easter Sunday flyer + Instagram story" /></label>
          <div className="row2">
            <label className="field"><span>Agreed price (NZ$)</span><input name="price" inputMode="decimal" placeholder="e.g. 80" /></label>
            <label className="field"><span>Delivery date</span><input name="deadline" type="date" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Sign</legend>
          <label className="field">
            <span>Type your full name to sign *</span>
            <input name="signature" required className="sig" autoComplete="off" />
          </label>
          <label className="check">
            <input type="checkbox" name="agree" required />
            <span>I have read and agree to the terms above. Date: {today}</span>
          </label>
        </fieldset>

        {state === 'error' && <p className="form-error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Signing…' : 'Sign agreement'}</button>
      </form>
    </>
  );
}
