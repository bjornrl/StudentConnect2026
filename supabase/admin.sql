-- Nyttige spørringer for arrangøren. Kjøres i Supabase SQL editor,
-- der du er innlogget som eier og dermed ser alt.

-- ── 1. Ubehandlede kontaktforespørsler, med begge parter ────────────────────
select
  r.created_at            as spurt_tidspunkt,
  r.requester_name        as student,
  r.requester_email       as student_epost,
  r.requester_role        as studie,
  r.message               as begrunnelse,
  s.title                 as oppgave,
  s.company_name          as bedrift,
  s.contact_name          as bedriftskontakt,
  s.contact_email         as bedrift_epost,
  s.contact_phone         as bedrift_telefon
from public.sc_contact_requests r
join public.sc_submissions s on s.id = r.submission_id
where not r.handled
order by r.created_at desc;

-- Marker som behandlet:
-- update public.sc_contact_requests set handled = true where id = '...';


-- ── 2. Alle innmeldinger med bedrift (full oversikt) ────────────────────────
-- `bransje` viser den egenskrevne bransjen når den er valgt — ellers står det
-- bare 'annen-bransje' i lista, og selve svaret blir usynlig.
select created_at,
       case when industry_key = 'annen-bransje'
            then coalesce(industry_other, '(uten navn)')
            else industry_key end as bransje,
       subarea_key, coalesce(subarea_other,'') as annet,
       title, company_name, contact_name, contact_email, contact_phone, levels, status
from public.sc_submissions
order by created_at desc;


-- ── 3. Fordeling per bransje ────────────────────────────────────────────────
select industry_key, count(*) as antall
from public.sc_submissions
where status = 'published'
group by industry_key
order by antall desc;


-- ── 4. Skjul en innmelding fra kartet uten å slette den ─────────────────────
-- update public.sc_submissions set status = 'hidden' where id = '...';


-- ── 5. Fjern demo-dataene før arrangementet ────────────────────────────────
-- delete from public.sc_contact_requests
--  where submission_id in (select id from public.sc_submissions where company_name like 'Demo %');
-- delete from public.sc_submissions where company_name like 'Demo %';
