# Kelvin Mensah — Design Portfolio

Graphic design portfolio built with Next.js and Three.js, with a Sanity CMS at `/studio`.

## Editing content

Go to `your-site.vercel.app/studio` and sign in with your Sanity account.

- **Posters**: click *All posters* → *+* to add one. Upload the image, pick its section, publish.
- **Site text & links**: headline, about text, Telegram / Fiverr / YouTube links, the YouTube video to show, and the first design shown before the zoom out.

Changes show on the site within about a minute.

Until the CMS has posters, the site shows the starter posters in `public/posters`.

## Setup

1. Create a project at [sanity.io/manage](https://sanity.io/manage) (dataset: `production`).
2. In Vercel → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = your project ID
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
3. In sanity.io/manage → API → CORS origins, add your site URL (e.g. `https://your-site.vercel.app`) and tick **Allow credentials**.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the project ID
npm run dev
```
