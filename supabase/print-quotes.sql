-- Kelv Studio: print quote requests from kelvstudio.com/printing
-- Paste all of this into Supabase → SQL Editor → Run. Safe to run more than once.

create table if not exists public.print_quotes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  phone        text,
  organisation text,
  item         text not null,            -- T-shirt, Hoodie, Tote bag, Banner
  colour       text,
  banner_size  text,
  quantity     integer not null default 1,
  sizes        jsonb not null default '{}',  -- e.g. {"M": 4, "L": 2}
  placement    jsonb not null default '{}',  -- where the design sits on each side
  deadline     date,
  notes        text,
  source       text,
  utm_source   text,
  utm_campaign text,
  files        jsonb not null default '{}',  -- design + mockup images (in the "uploads" storage bucket)
  quote_amount numeric(10,2),              -- filled in when you send the quote
  stripe_invoice_id text,                  -- the Stripe invoice you sent them
  status       text not null default 'new' -- new, quoted, paid, printing, sent, lost
);

create index if not exists print_quotes_created_idx on public.print_quotes (created_at desc);

-- only the website's server (secret key) can read or write
alter table public.print_quotes enable row level security;
