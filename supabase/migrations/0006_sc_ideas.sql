-- Koblingspunkt — innsendte tanker fra skjemaet på forsiden.
--
-- Skjemaet er mye enklere enn det gamle (sc_submissions): én fritekst, noen
-- valgfrie temaer og kontaktinfo. Det har derfor sin egen tabell i stedet for
-- å presse seg inn i sc_submissions med sentinel-verdier for tittel og bransje.
--
-- Anon kan bare sette inn. Ingen SELECT noe sted — innsendingene leses kun fra
-- Supabase-dashbordet (eller med service-rollen).

create table if not exists public.sc_ideas (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  idea          text not null check (char_length(idea) between 3 and 4000),
  topics        text[] not null default '{}',

  company_name  text not null check (char_length(company_name) between 1 and 200),
  contact_name  text not null check (char_length(contact_name) between 1 and 120),
  contact_email text not null check (char_length(contact_email) between 3 and 200),

  handled       boolean not null default false,
  is_test       boolean not null default false
);

create index if not exists sc_ideas_created_at_idx on public.sc_ideas (created_at desc);

alter table public.sc_ideas enable row level security;

drop policy if exists sc_ideas_insert_anon on public.sc_ideas;
create policy sc_ideas_insert_anon
  on public.sc_ideas for insert to anon, authenticated
  with check (handled = false and is_test = false);

revoke all on public.sc_ideas from anon, authenticated;
grant insert on public.sc_ideas to anon, authenticated;

notify pgrst, 'reload schema';
