-- Seed data for sc_examples table
-- These are the mockup examples currently in lib/examples.ts

insert into public.sc_examples (id, industry_key, subarea_key, title, challenge, display_order, status) values
  (
    'integrasjon-mellom-gamle-fagsystemer',
    'it-data',
    'annet',
    'Integrasjon mellom gamle fagsystemer',
    'Mye av tiden går med til å flytte data mellom systemer som ikke snakker sammen. Vi vil kartlegge hvor kostnaden faktisk ligger og hva som er verdt å erstatte.',
    1,
    'published'
  ),
  (
    'csrd-praksis-mellomstore-bedrifter',
    'radgivning-finans',
    'annet',
    'CSRD i praksis for mellomstore bedrifter',
    'Kravene er skrevet for store selskaper. Vi vil finne ut hva som er tilstrekkelig for en bedrift med to hundre ansatte, uten å bygge et helt rapporteringsapparat.',
    2,
    'published'
  ),
  (
    'digitale-tjenester-innbyggere-lav',
    'offentlig-utdanning',
    'annet',
    'Digitale tjenester for innbyggere med lav digital kompetanse',
    'Tjenestene våre fungerer godt for de fleste, men ikke for alle. Vi vil forstå hvor folk faller av, og hva som skal til for at de kommer i mål.',
    3,
    'published'
  )
on conflict (id) do nothing;
