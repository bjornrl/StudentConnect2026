-- Skille testdata fra ekte innmeldinger i sc_submissions.
--
-- Skjemaet har vært i drift en stund før noen ekte bedrift har meldt inn noe,
-- og tabellen er full av utviklertesting: et bulk-seedet demo-sett (23 rader,
-- alle med IDENTISK created_at — de ble satt inn i én batch, ikke tastet inn
-- av mennesker), «Testbedrift»/«Probe»/«Rollback Probe»-rader fra manuell
-- testing, og noen innmeldinger fra @comte.no — det er byrået som drifter
-- dette prosjektet (se lib/partners.ts og README), ikke en ekstern bedrift.
--
-- `is_test` er nullable-fri med default false: nye innmeldinger fra skjemaet
-- regnes som ekte helt til noen sier noe annet. Kolonnen leses aldri av
-- sc_submissions_public-viewet (den lister eksplisitte kolonner), så den kan
-- ikke lekke til frontend.

alter table public.sc_submissions
  add column if not exists is_test boolean not null default false;

create index if not exists sc_submissions_is_test_idx
  on public.sc_submissions (is_test);

-- ── Bakgrunnsmerking av kjent testdata ──────────────────────────────────────

-- 1) Bulk-seedet demo-sett: alle satt inn i samme millisekund.
update public.sc_submissions
  set is_test = true
  where created_at = timestamptz '2026-08-26 11:47:53.483434+00';

-- 2) Comte (byrået bak siden) som tester skjemaet selv.
update public.sc_submissions
  set is_test = true
  where contact_email ilike '%@comte.no';

-- 3) «Testbedrift»-varianter.
update public.sc_submissions
  set is_test = true
  where company_name ilike 'testbedrift%'
     or contact_email ilike '%@testbedrift.no'
     or contact_email = 'bjorn@tst.no';

-- 4) Samme «Murmester Olsen»-innmelding sendt tre ganger på under en time.
update public.sc_submissions
  set is_test = true
  where company_name ilike 'murmester olsen';

-- 5) Eksplisitte prober (rollback-testing, tom seed-probe).
update public.sc_submissions
  set is_test = true
  where company_name ilike '%probe%'
     or id = '00000000-0000-4000-8000-000000000001';

-- 6) Tastetull / gibberish-innhold fra manuell klikktesting.
update public.sc_submissions
  set is_test = true
  where company_name in ('TestbedriftBjrøn', 'adadadawd')
     or title in ('Testttest', 'awdawdada', 'hjg');

-- 7) Spøkeinnmelding («liksom@liksom.no» = «yeah right»).
update public.sc_submissions
  set is_test = true
  where contact_email = 'liksom@liksom.no';

-- 8) Helt tomme innsendinger: verken bedrift eller tittel oppgitt — samme som
--    å trykke «send» uten å fylle ut noe. Treffer IKKE rader som har fått en
--    ekte tittel (f.eks. «Sykkelparkering ved knutepunkt»), for de kan være
--    ekte, anonyme innmeldinger.
update public.sc_submissions
  set is_test = true
  where company_name = '(ikke oppgitt)'
    and title = '(uten tittel)';

notify pgrst, 'reload schema';
