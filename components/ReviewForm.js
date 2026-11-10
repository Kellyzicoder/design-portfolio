'use client';

import { useRef, useState } from 'react';

/* Review form for kelvstudio.com/review: stars, name, business (optional) and the review. */
export default function ReviewForm() {
  const started = useRef(Date.now());
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!rating) return setError('Please pick a star rating.');
    setState('sending');
    const fd = new FormData(e.currentTarget);
    fd.set('rating', String(rating));
    fd.set('t', String(Date.now() - started.current));
    try {
      const res = await fetch('/api/review', { method: 'POST', body: fd });
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
      <div className="form-done">
        <h2>Thank you!</h2>
        <p>Your review is in. It will show on the site once I’ve had a look.</p>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form className="form" onSubmit={onSubmit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <div className="field">
        <span id="stars-label">Your rating *</span>
        <div className="star-pick" role="radiogroup" aria-labelledby="stars-label" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={n <= shown ? 'on' : undefined}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >★</button>
          ))}
        </div>
      </div>
      <div className="row2">
        <label className="field"><span>Your name *</span><input name="name" required maxLength={80} autoComplete="name" /></label>
        <label className="field"><span>Business or event</span><input name="company" maxLength={100} placeholder="Optional" /></label>
      </div>
      <label className="field"><span>Your review *</span><textarea name="text" required rows={5} maxLength={1500} placeholder="What did I make for you, and how was it working together?" /></label>
      <label className="field"><span>Email</span><input name="email" type="email" maxLength={200} autoComplete="email" placeholder="Optional, never shown" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send review'}</button>
    </form>
  );
}
