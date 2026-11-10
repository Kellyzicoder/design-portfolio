-- Reviews written on kelvstudio.com/review. They wait as "pending" until approved in the CRM app.
-- Run once in Supabase → SQL Editor.
create table if not exists public.site_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  company text,
  rating int check (rating between 1 and 5),
  text text not null,
  status text not null default 'pending' -- pending | approved | hidden
);
-- only the website and CRM (with the secret key) can read or write it
alter table public.site_reviews enable row level security;
