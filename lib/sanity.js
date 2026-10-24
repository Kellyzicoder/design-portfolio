import { createClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-10-01';

export const client = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

export const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  ...,
  "start": startPoster->{ "id": _id, title, section, "url": image.asset->url, "aspect": image.asset->metadata.dimensions.aspectRatio }
}`;

export const POSTERS_QUERY = `*[_type == "poster" && defined(image.asset)] | order(coalesce(order, 999) asc, _createdAt desc){
  "id": _id, title, section,
  "url": image.asset->url,
  "aspect": image.asset->metadata.dimensions.aspectRatio
}`;
