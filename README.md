# Student Connect 2026 — oppgavekart

Bedrifter melder inn utfordringer de vil at studenter skal utforske. Hver innmelding blir
en node i et felles kart, gruppert etter bransje og koblet sammen med andre som har samme
ansvarsområde.

## Kom i gang

```bash
cp .env.example .env.local     # nøklene ligger allerede i .env.example
npm install
npm run dev
```

- `http://localhost:3000/edit` — skjema til venstre, kart til høyre
- `http://localhost:3000/presentation` — kartet i fullskjerm, med filter

## De to visningene

**`/edit`** — fire steg: bransje → ansvarsområde → utfordringen → kontaktinfo.
Når man publiserer, dukker noden opp i kartet med én gang og pulserer i noen sekunder.
Kartet henter også inn andres innmeldinger hvert 20. sekund, så flere kan fylle ut samtidig.

**`/presentation`** — bare kartet. Filtrer på bransje, søk i teksten, klikk en node for å
lese utfordringen. Har lys/mørk modus (mørk er som regel best på projektor) og en
fullskjermknapp. Henter nye noder hvert 10. sekund, så skjermen holder seg oppdatert
gjennom hele dagen uten at noen trenger å laste den på nytt.

## Slik bytter du ut spørsmålene

Alt ligger i **`lib/taxonomy.ts`**. Rediger `INDUSTRIES` — bransjer, ansvarsområder,
farger og hjelpetekst. Skjema, filtermeny og kart følger automatisk etter.

Én regel: `key`-verdiene lagres i databasen. Endre gjerne `label` når som helst, men ikke
endre en `key` etter at det er kommet inn svar — da mister de radene tilhørigheten sin.
Hver bransje får automatisk et «Annet»-valg med fritekstfelt.

## Hvordan kartet er bygget

`components/NodeMap.tsx` kjører en kraftsimulering (`d3-force`) som aldri stopper helt,
så kartet flyter sakte i stedet for å stivne:

- hver bransje har et ankerpunkt i en ring rundt sentrum, som driver langsomt omkring
- noder trekkes mot ankeret til sin egen bransje, og dyttes fra hverandre
- noder som deler **bransje + ansvarsområde** kobles med en myk bue
- bak hver klynge ligger et svakt fargefelt med bransjenavnet over

Filtrering dimmer i stedet for å fjerne, slik at kartet ikke hopper. Zoom med scroll,
panorer ved å dra.

## Personvern

Bedriftsnavn og kontaktinfo lagres, men er **ikke** tilgjengelig gjennom API-et.

- `sc_submissions` har row level security uten SELECT-policy, og anon-rollen har kun
  INSERT. Ingen kan lese tabellen med den offentlige nøkkelen.
- Alt publikum ser kommer fra viewet `sc_submissions_public`, som ikke inneholder
  kontaktkolonnene i det hele tatt.
- Studenter som vil i kontakt sender en forespørsel fra detaljpanelet. Den havner i
  `sc_contact_requests`, som også er lukket for lesing — dere henter den ut selv.

Testet: anon kan sette inn, men blir nektet SELECT og UPDATE på `sc_submissions`,
nektet SELECT på `sc_contact_requests`, og kan ikke sette inn rader med `status = 'hidden'`.

> **Ikke «fiks» denne advarselen:** Supabase-linteren flagger
> `sc_submissions_public` som *Security Definer View*. Det er med vilje — det er
> nettopp derfor viewet kan lese en tabell som anon-rollen ikke har tilgang til.
> Setter du `security_invoker = on`, blir kartet tomt.

## Hente ut kontaktforespørsler

Kjør i Supabase SQL editor (se også `supabase/admin.sql`):

```sql
select r.created_at, r.requester_name, r.requester_email, r.requester_role, r.message,
       s.title, s.company_name, s.contact_name, s.contact_email, s.contact_phone
from public.sc_contact_requests r
join public.sc_submissions s on s.id = r.submission_id
where not r.handled
order by r.created_at desc;
```

## Database

Tabellene ligger i Supabase-prosjektet `Disposable-camera-wedding-app`
(`dhhclddelbwfcfewsymu`), prefikset `sc_` slik at de ikke kolliderer med Fotorace-tabellene.
Skjemaet i sin helhet ligger i `supabase/migrations/`.

Det ligger 23 demo-innmeldinger inne så kartet har noe å vise. Slett dem med:

```sql
delete from public.sc_submissions where company_name like 'Demo %';
```

## Miljøvariabler på Netlify

Netlify-teamet (Comte) har **delte miljøvariabler på team-nivå**, blant annet
`NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY`. De arves av alle
sites i teamet, og flere av sitene bruker helt forskjellige Supabase-prosjekter.
Derfor er begge to satt **på site-nivå** for `studentconnect2026`
(Site configuration → Environment variables → *Add a variable*), slik at
team-verdiene aldri får virkning her:

| Variabel | Verdi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dhhclddelbwfcfewsymu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | den publiserbare nøkkelen (`sb_publishable_…`) til samme prosjekt |

Begge er `NEXT_PUBLIC_`, altså bakt inn i bygget. **En endring får først effekt
etter en ny deploy** — endrer du dem, må du trigge *Deploys → Trigger deploy →
Clear cache and deploy site*.

Blandes URL fra ett prosjekt med nøkkel fra et annet, stopper `lib/supabase.ts`
det med en tydelig feilmelding. Uten den sperren svarer Supabase enten
*Invalid API key* eller *Could not find the table 'public.sc_submissions' in the
schema cache* — begge ser ut som databasefeil, men er konfigfeil.

Mangler tabellene faktisk i prosjektet URL-en peker på, lim inn
`supabase/setup.sql` i SQL-editoren der og kjør den.
