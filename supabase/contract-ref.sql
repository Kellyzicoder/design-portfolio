-- Saves the agreement number (e.g. KS-20261029-4F7Q) with each signed agreement.
-- Paste into Supabase → SQL Editor → Run. Safe to run more than once.
alter table public.contracts add column if not exists ref text;
create index if not exists contracts_ref_idx on public.contracts (ref);
