-- Student Connect 2026 — kjør hele filen i Supabase SQL editor
-- (SQL Editor → New query → lim inn → Run).
--
-- Bruk det SAME prosjektet som NEXT_PUBLIC_SUPABASE_URL peker på.
-- Etterpå: Settings → API → Reload schema cache, eller stol på NOTIFY under.

-- ── Tabeller ────────────────────────────────────────────────────────────────
create table if not exists public.sc_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  industry_key  text not null,
  -- Fylles bare når industry_key = 'annen-bransje': da står bransjenavnet her,
  -- skrevet av bedriften selv. Se OTHER_INDUSTRY i lib/taxonomy.ts.
  industry_other text,
  subarea_key   text not null,
  subarea_other text,
  title         text not null check (char_length(title) between 3 and 120),
  challenge     text not null check (char_length(challenge) between 10 and 4000),
  levels        text[] not null default '{}',
  status        text not null default 'published'
                check (status in ('draft','published','hidden')),
  company_name  text not null,
  contact_name  text,
  contact_email text,
  contact_phone text,
  edit_token    uuid not null default gen_random_uuid()
);

create index if not exists sc_submissions_industry_idx on public.sc_submissions (industry_key);
create index if not exists sc_submissions_status_idx   on public.sc_submissions (status);

create table if not exists public.sc_contact_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  submission_id   uuid not null references public.sc_submissions(id) on delete cascade,
  requester_name  text not null,
  requester_email text not null,
  requester_role  text,
  message         text,
  handled         boolean not null default false
);

create index if not exists sc_contact_requests_submission_idx
  on public.sc_contact_requests (submission_id);

-- ── Row level security ──────────────────────────────────────────────────────
alter table public.sc_submissions      enable row level security;
alter table public.sc_contact_requests enable row level security;

drop policy if exists sc_submissions_insert_anon on public.sc_submissions;
create policy sc_submissions_insert_anon
  on public.sc_submissions for insert to anon, authenticated
  with check (status = 'published');

drop policy if exists sc_contact_requests_insert_anon on public.sc_contact_requests;
create policy sc_contact_requests_insert_anon
  on public.sc_contact_requests for insert to anon, authenticated
  with check (true);

-- ── Offentlig leseflate uten kontaktinfo ────────────────────────────────────
create or replace view public.sc_submissions_public
with (security_invoker = off) as
  select
    id,
    created_at,
    industry_key,
    subarea_key,
    subarea_other,
    title,
    challenge,
    levels
  from public.sc_submissions
  where status = 'published';

-- ── Grants (uten SELECT på sc_submissions — det holder kontaktinfo skjult) ──
grant usage on schema public to anon, authenticated;

revoke all on public.sc_submissions      from anon, authenticated;
revoke all on public.sc_contact_requests from anon, authenticated;

grant insert on public.sc_submissions      to anon, authenticated;
grant insert on public.sc_contact_requests to anon, authenticated;
grant select on public.sc_submissions_public to anon, authenticated;

-- Tving PostgREST til å se de nye objektene med en gang
notify pgrst, 'reload schema';
