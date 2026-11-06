'use client';

import { useRef, useState } from 'react';
import { contractParts } from '@/lib/contract';
import { RATE, MAX_PER_WEEK, DESIGN_TYPES, BRIEF_DAYS, perMonth, monthlyPrice, readyDay, monthlyTerms } from '@/lib/monthlyPlan';

const STEPS = ['Your details', 'Your plan', 'Terms', 'Review & sign'];
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
const nzd = (n) => `NZ$${Number(n).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const longDate = (iso) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/*
  Monthly design plan, signed online in 4 short steps:
  1 your details · 2 choose the plan · 3 read the terms · 4 review the summary and sign.
*/
export default function MonthlyForm() {
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ name: '', email: '', phone: '', organisation: '', perWeek: '3', briefDay: 'Monday', start: '', notes: '', signature: '', website: '' });
  const [types, setTypes] = useState([]);
  const [readTerms, setReadTerms] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const started = useRef(Date.now());
  const top = useRef(null);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const n = perMonth(v.perWeek);
  const price = monthlyPrice(v.perWeek);
  const parts = contractParts(monthlyTerms({ perWeek: v.perWeek, briefDay: v.briefDay }));
  const toggle = (t) => setTypes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));

  // what has to be filled in before moving on from each step
  const problem = (s) => {
    if (s === 0) { if (!v.name.trim()) return 'Please add your full name.'; if (!isEmail(v.email)) return 'Please add a valid email address.'; }
    if (s === 1) { if (!types.length) return 'Please pick at least one kind of design.'; if (!v.start) return 'Please choose a start date.'; }
    if (s === 2 && !readTerms) return 'Please tick that you have read the terms.';
    if (s === 3) {
      if (!v.signature.trim()) return 'Type your full name to sign.';
      if (!agree) return 'Please tick “I agree” to sign.';
    }
    return '';
  };
  const go = (to) => {
    if (to > step) { const p = problem(step); if (p) { setError(p); return; } }
    setError(''); setStep(to);
    top.current && top.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function sign() {
    const p = problem(3); if (p) { setError(p); return; }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/contract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, kind: 'monthly', types, agree: true, t: Date.now() - started.current }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong. Please try again.');
      setDone(out);
      top.current && top.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { setError(e.message); }
    setSending(false);
  }

  if (done) {
    return (
      <div className="agree-done" ref={top}>
        <span className="agree-done-icon"><Check /></span>
        <h2>Monthly plan signed</h2>
        <p>Thank you, {v.name.split(' ')[0]}. Your signed plan has been sent to Kelv Studio. You’ll get the first month’s invoice by email. Download your copy and keep it for your records.</p>
        {done.pdf && <a className="btn" href={`data:application/pdf;base64,${done.pdf}`} download={done.filename}>Download signed agreement (PDF)</a>}
        <a className="agree-link" href="/">Back to the portfolio</a>
      </div>
    );
  }

  return (
    <div className="agree" ref={top}>
      {/* progress */}
      <ol className="agree-steps" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>
            <button type="button" onClick={() => i < step && go(i)} disabled={i > step}>
              <span className="dot">{i < step ? <Check /> : i + 1}</span>
              <span className="lbl"><small>Step {i + 1}/{STEPS.length}</small>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="agree-card">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" value={v.website} onChange={set('website')} />

        {step === 0 && (
          <section>
            <h2>Your details</h2>
            <p className="agree-sub">These appear on the agreement as the client.</p>
            <div className="row2">
              <label className="field"><span>Full name *</span><input value={v.name} onChange={set('name')} autoComplete="name" /></label>
              <label className="field"><span>Email *</span><input type="email" value={v.email} onChange={set('email')} autoComplete="email" /></label>
            </div>
            <div className="row2">
              <label className="field"><span>Phone</span><input type="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" /></label>
              <label className="field"><span>Business, brand or event name</span><input value={v.organisation} onChange={set('organisation')} /></label>
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2>Your plan</h2>
            <p className="agree-sub">Choose how many designs you need. NZ${RATE} per design, paid monthly upfront.</p>
            <label className="field"><span>How many designs a week? *</span>
              <select value={v.perWeek} onChange={set('perWeek')}>
                {Array.from({ length: MAX_PER_WEEK }, (_, i) => i + 1).map((k) => (
                  <option key={k} value={k}>{k} a week · {perMonth(k)} a month · {nzd(monthlyPrice(k))}/month</option>
                ))}
              </select>
            </label>
            <div className="field">
              <span>What kinds of designs? *</span>
              <div className="ps-chips"><div className="ps-group"><div>
                {DESIGN_TYPES.map((t) => (
                  <button type="button" key={t} aria-pressed={types.includes(t)} onClick={() => toggle(t)}>{t}</button>
                ))}
              </div></div></div>
            </div>
            <div className="row2">
              <label className="field"><span>Which day will you send the week’s details?</span>
                <select value={v.briefDay} onChange={set('briefDay')}>{BRIEF_DAYS.map((d) => <option key={d}>{d}</option>)}</select>
              </label>
              <label className="field"><span>Start date *</span><input type="date" value={v.start} onChange={set('start')} /></label>
            </div>
            <label className="field"><span>Anything else I should know?</span><textarea rows={3} value={v.notes} onChange={set('notes')} placeholder="e.g. brand colours, the events coming up, sizes you need" /></label>
            <p className="agree-note"><b>{nzd(price)} per month</b> for up to {n} designs. You send details by {v.briefDay}, and designs are ready by {readyDay(v.briefDay)}.</p>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>Terms and conditions</h2>
            <p className="agree-sub">Plain-English terms that protect both of us. Please read them before signing.</p>
            <ol className="clauses">
              {parts.filter((p) => p.heading).map((p, i) => {
                const m = p.heading.match(/^(\d+)[.)]\s*(.*)$/);
                return (
                  <li key={i}>
                    <span className="num">{m ? m[1] : i + 1}</span>
                    <div><h3>{m ? m[2] : p.heading}</h3><p>{p.body}</p></div>
                  </li>
                );
              })}
            </ol>
            <label className="check agree-check">
              <input type="checkbox" checked={readTerms} onChange={(e) => setReadTerms(e.target.checked)} />
              <span>I have read the terms and conditions.</span>
            </label>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Review &amp; sign</h2>
            <p className="agree-sub">Check the summary, then sign by typing your full name. Kelv Studio will confirm the plan with you in writing and send the first invoice.</p>

            <div className="overview">
              <div className="ov-head">
                <span className="ov-doc" aria-hidden="true">PDF</span>
                <div><b>Monthly Design Plan Agreement</b><small>Kelv Studio · {today}</small></div>
              </div>
              <div className="ov-grid">
                <div className="ov-box">
                  <small>Parties</small>
                  <p><b>Kelv Studio</b> <span className="tag">Designer</span></p>
                  <p><b>{v.name || '—'}</b> <span className="tag blue">Client</span></p>
                  {v.organisation && <p className="muted">{v.organisation}</p>}
                </div>
                <div className="ov-box">
                  <small>Plan</small>
                  <p><b>{n} designs a month</b> ({v.perWeek} a week)</p>
                  <p className="muted">{types.join(', ')}</p>
                  <small>Starts</small>
                  <p>{longDate(v.start)} · details by {v.briefDay}</p>
                </div>
                <div className="ov-box">
                  <small>Monthly price</small>
                  <p><b>{nzd(price)}</b></p>
                  <small>Payment terms</small>
                  <p>Paid upfront each month. Extra designs {nzd(RATE)} each.</p>
                </div>
              </div>
            </div>

            <label className="field"><span>Type your full name to sign *</span><input value={v.signature} onChange={set('signature')} autoComplete="off" placeholder={v.name || 'Your full name'} /></label>
            <div className="sig-preview" aria-live="polite">
              <span className="sig-name">{v.signature || ' '}</span>
              <span className="sig-line" />
              <span className="sig-cap">Client signature · {today}</span>
            </div>
            <label className="check agree-check">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to the monthly plan terms, and I understand that typing my name counts as my signature.</span>
            </label>
          </section>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="agree-nav">
          {step > 0 ? <button type="button" className="btn btn-quiet" onClick={() => go(step - 1)}>Back</button> : <span />}
          {step < 3
            ? <button type="button" className="btn" onClick={() => go(step + 1)}>Continue</button>
            : <button type="button" className="btn" onClick={sign} disabled={sending}>{sending ? 'Signing…' : 'Sign agreement'}</button>}
        </div>
      </div>
    </div>
  );
}
