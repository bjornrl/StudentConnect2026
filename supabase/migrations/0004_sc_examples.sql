-- Examples/mockup suggestions table
-- Separate from sc_submissions to distinguish between placeholder examples shown on the site
-- and actual user submissions

create table if not exists public.sc_examples (
  id            text primary key,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- taksonomi (nøklene er definert i lib/taxonomy.ts)
  industry_key  text not null,
  subarea_key   text not null default 'annet',
  subarea_other text,

  -- eksempel innhold
  title         text not null check (char_length(title) between 3 and 120),
  challenge     text not null check (char_length(challenge) between 10 and 4000),
  levels        text[] not null default '{}',

  status        text not null default 'published'
                check (status in ('draft','published','hidden')),

  -- display order on the board
  display_order integer not null default 0
);

create index if not exists sc_examples_industry_idx on public.sc_examples (industry_key);
create index if not exists sc_examples_status_idx   on public.sc_examples (status);
create index if not exists sc_examples_order_idx    on public.sc_examples (display_order);

-- ── Row level security ──────────────────────────────────────────────────────
alter table public.sc_examples enable row level security;

drop policy if exists sc_examples_select_published on public.sc_examples;
create policy sc_examples_select_published
  on public.sc_examples for select to anon, authenticated
  using (status = 'published');

-- ── Offentlig leseflate: view med samme struktur som PublicSubmission ────────
create or replace view public.sc_examples_public
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
  from public.sc_examples
  where status = 'published'
  order by display_order asc;
