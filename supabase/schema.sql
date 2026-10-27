-- Kelv Studio: tables for the website forms (and the CRM app later).
-- Paste all of this into Supabase → SQL Editor → Run. Safe to run more than once.

-- design requests from the website form
create table if not exists public.requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  phone        text,
  organisation text,
  design_type  text,
  format       text,
  event_date   date,
  deadline     date,
  details      text,
  budget       text,
  source       text,            -- how they heard about you (Google, Instagram, an ad, ...)
  utm_source   text,            -- filled in automatically when they come from an ad link
  utm_campaign text,
  files        text[] not null default '{}',  -- reference images (in the "uploads" storage bucket)
  status       text not null default 'new'    -- new, replied, won, lost
);

-- signed design agreements
create table if not exists public.contracts (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  phone        text,
  organisation text,
  project      text not null,
  price        numeric(10,2),
  deadline     date,
  signature    text not null,
  terms        text not null,   -- the exact wording they agreed to
  ip           text,
  user_agent   text,
  pdf_path     text             -- signed PDF (in the "uploads" storage bucket)
);

create index if not exists requests_created_idx on public.requests (created_at desc);
create index if not exists contracts_created_idx on public.contracts (created_at desc);

-- Lock the tables: only the website's server (secret key) can read or write for now.
alter table public.requests  enable row level security;
alter table public.contracts enable row level security;

-- private storage for reference images and signed PDFs
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;
