-- «Annen bransje»: bedriften skriver bransjen sin selv når lista i
-- lib/taxonomy.ts ikke har den.
--
-- Egen kolonne, og IKKE gjenbruk av `subarea_other`. De to svarer på hvert
-- sitt spørsmål — bransje og ansvarsområde — og ansvarsområde-feltet er tatt
-- ut av skjemaet, ikke ut av basen. Deler de plass, kolliderer de den dagen
-- det feltet kommer tilbake, og da er det ingen måte å vite hva som var hva i
-- radene som allerede ligger der.
--
-- Nullable med vilje: den fylles bare når `industry_key = 'annen-bransje'`.

alter table public.sc_submissions
  add column if not exists industry_other text;

-- PostgREST cacher skjemaet; uten dette avvises INSERT-er med den nye
-- kolonnen som «Could not find the 'industry_other' column in the schema
-- cache» helt til cachen tilfeldigvis fornyes.
notify pgrst, 'reload schema';
