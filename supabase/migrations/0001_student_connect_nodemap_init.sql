-- Student Connect 2026 — oppgavekartlegging
-- Tabellene er prefikset sc_ for å kunne leve side om side med Fotorace-tabellene.

create table if not exists public.sc_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- taksonomi (nøklene er definert i lib/taxonomy.ts)
  industry_key  text not null,
  subarea_key   text not null,
  subarea_other text,

  -- det offentlige innholdet
  title         text not null check (char_length(title) between 3 and 120),
  challenge     text not null check (char_length(challenge) between 10 and 4000),
  levels        text[] not null default '{}',

  status        text not null default 'published'
                check (status in ('draft','published','hidden')),

  -- privat innhold: aldri eksponert gjennom det offentlige viewet
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

-- Ingen SELECT-policy noe sted => kontaktinfo er utilgjengelig via API-et.

-- ── Offentlig leseflate: view uten de private kolonnene ─────────────────────
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
