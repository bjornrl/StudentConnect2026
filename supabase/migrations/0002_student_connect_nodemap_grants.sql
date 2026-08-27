-- Tabellrettigheter i tillegg til RLS-policyene.
-- RLS avgjør HVILKE rader; GRANT avgjør HVILKE operasjoner som er mulige i det hele tatt.
--
-- Merk: anon har bevisst ingen SELECT på sc_submissions. Det betyr også at
-- INSERT ... RETURNING ikke virker for anon — derfor lager API-ruten id-en selv
-- og sender den med inn, i stedet for å lese den tilbake.

revoke all on public.sc_submissions      from anon, authenticated;
revoke all on public.sc_contact_requests from anon, authenticated;

grant insert on public.sc_submissions      to anon, authenticated;
grant insert on public.sc_contact_requests to anon, authenticated;

grant select on public.sc_submissions_public to anon, authenticated;
