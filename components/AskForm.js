'use client';

import { useRef, useState } from 'react';

/* A short "ask a question" form: name, email and a message. It emails Kelv Studio. */
export default function AskForm({ topic = 'General' }) {
  const started = useRef(Date.now());
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setState('sending');
    const fd = new FormData(e.currentTarget);
    fd.set('t', String(Date.now() - started.current));
    fd.set('topic', topic);
    try {
      const res = await fetch('/api/ask', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="form-done ask-done">
        <h3>Thanks, your message is in.</h3>
        <p>I’ll reply by email, usually within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className="form ask-form" onSubmit={onSubmit}>
      {/* hidden from people; bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <div className="row2">
        <label className="field"><span>Your name *</span><input name="name" required autoComplete="name" /></label>
        <label className="field"><span>Email *</span><input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <label className="field"><span>Your question *</span><textarea name="message" required rows={4} placeholder="Ask about prices, timing, what you need, anything." /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send question'}</button>
    </form>
  );
}
