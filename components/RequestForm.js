'use client';

import { useEffect, useRef, useState } from 'react';

const MAX_FILES = 3;

// shrink photos before sending so the form stays fast (and under Vercel's 4.5 MB limit)
async function shrink(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch { return file; }
}

export default function RequestForm({ types }) {
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('');
  const isWebsite = type === 'Website';
  const started = useRef(Date.now());
  const [utm, setUtm] = useState({ source: '', campaign: '' });

  // ad links can carry ?utm_source=instagram&utm_campaign=easter so you can see which ads bring requests
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setUtm({ source: q.get('utm_source') || '', campaign: q.get('utm_campaign') || '' });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setState('sending'); setError('');
    const fd = new FormData(e.currentTarget);
    fd.delete('refs');
    for (const f of files) fd.append('refs', await shrink(f));
    fd.append('t', String(Date.now() - started.current));
    try {
      const res = await fetch('/api/request', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState('sent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message); setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="form-done">
        <h2>Thanks, your request is in.</h2>
        <p>I’ll come back to you with a price, a timeline and a plan for your design.</p>
        <p>Ready to go ahead? You can <a href="/contract">sign the design agreement</a> now or after we’ve talked.</p>
        <a className="btn" href="/">Back to the portfolio</a>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {/* hidden from people; bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <input type="hidden" name="utm_source" value={utm.source} />
      <input type="hidden" name="utm_campaign" value={utm.campaign} />

      <fieldset>
        <legend>About you</legend>
        <div className="row2">
          <label className="field"><span>Your name *</span><input name="name" required autoComplete="name" /></label>
          <label className="field"><span>Email *</span><input name="email" type="email" required autoComplete="email" /></label>
        </div>
        <div className="row2">
          <label className="field"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
          <label className="field"><span>Business, brand or event name</span><input name="organisation" /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>The design</legend>
        <div className="row2">
          <label className="field">
            <span>What do you need? *</span>
            <select name="type" required value={type} onChange={(e) => setType(e.target.value)}>
              <option value="" disabled>Choose one…</option>
              {types.map((t) => <option key={t}>{t}</option>)}
              <option>Website</option>
              <option>Something else</option>
            </select>
          </label>
          {!isWebsite && <label className="field">
            <span>Size or where it will be used</span>
            <select name="format" defaultValue="">
              <option value="">Not sure yet</option>
              <option>Instagram / Facebook post (square)</option>
              <option>Instagram story (tall)</option>
              <option>Print: A4 or A3 poster</option>
              <option>Banner</option>
              <option>Screen / projector (wide)</option>
              <option>More than one size</option>
            </select>
          </label>}
        </div>
        {isWebsite && (
          <>
            <div className="row2">
              <label className="field">
                <span>What is the website for? *</span>
                <select name="web_purpose" required defaultValue="">
                  <option value="" disabled>Choose one…</option>
                  <option>Wedding (RSVP)</option>
                  <option>Event</option>
                  <option>Business</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                <span>Web address</span>
                <select name="web_address" defaultValue="Free link">
                  <option>Free link</option>
                  <option>Our own address (costs extra each year)</option>
                  <option>Not sure</option>
                </select>
              </label>
            </div>
            <div className="row2">
              <label className="field">
                <span>Style</span>
                <select name="web_style" defaultValue="">
                  <option value="">Not sure yet</option>
                  <option>Luxury</option>
                  <option>Simple</option>
                  <option>Modern</option>
                  <option>Fun / colourful</option>
                </select>
              </label>
              <label className="field"><span>Colours</span><input name="web_colours" placeholder="e.g. black and gold" /></label>
            </div>
            <label className="field">
              <span>What should visitors fill in?</span>
              <input name="web_form" placeholder="e.g. name, coming or not, plus-one, food needs" />
            </label>
            <div className="field">
              <span>Extras</span>
              {['Photo gallery', 'Countdown', 'Map to the venue', 'Download guest list'].map((x) => (
                <label key={x} className="check"><input type="checkbox" name="web_extras" value={x} />{x}</label>
              ))}
            </div>
          </>
        )}
        <div className="row2">
          <label className="field"><span>Event date</span><input name="eventDate" type="date" /></label>
          <label className="field"><span>When do you need it by? *</span><input name="deadline" type="date" required /></label>
        </div>
        <label className="field">
          <span>Details *</span>
          <textarea name="details" rows={6} required placeholder={isWebsite ? 'Names, the date, the venue, and anything else you want on the site.' : 'What is it for? What should it say? Names, dates, place, colours, the feeling you want, anything you have in mind.'} />
        </label>
        <div className="row2">
          <label className="field">
            <span>Budget (NZ$)</span>
            <select name="budget" defaultValue="" key={isWebsite ? 'web' : 'design'}>
              <option value="">Not sure</option>
              {(isWebsite
                ? ['Under $300', '$300 – $500', '$500 – $800', '$800+']
                : ['Under $50', '$50 – $100', '$100 – $200', '$200+']
              ).map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Example or reference images (up to {MAX_FILES})</span>
            <input
              name="refs" type="file" accept="image/*,.pdf" multiple
              onChange={(e) => setFiles([...e.currentTarget.files].slice(0, MAX_FILES))}
            />
            {files.length > 0 && <small>{files.map((f) => f.name).join(', ')}</small>}
          </label>
        </div>
        <label className="field">
          <span>How did you hear about me?</span>
          <select name="source" defaultValue="">
            <option value="">Choose one…</option>
            <option>Google search</option>
            <option>Google Maps</option>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>TikTok</option>
            <option>YouTube</option>
            <option>An ad</option>
            <option>Church or a friend</option>
            <option>Fiverr</option>
            <option>Other</option>
          </select>
        </label>
      </fieldset>

      {state === 'error' && <p className="form-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send request'}</button>
      <p className="form-note">Send your brief and you’ll get a clear quote by email within 24 hours. No cost to ask.</p>
    </form>
  );
}
