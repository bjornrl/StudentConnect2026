import type { PublicSubmission } from "./types";

/* ─────────────────────────────────────────────────────────────────────────────
 *  LAPPENE PÅ TAVLA. DETTE ER DEN ENESTE FILEN DU ENDRER FOR Å BYTTE DEM UT.
 *
 *  Lappene er REFERANSE — eksempler på hva en utfordring kan være. De har
 *  ingenting med innmeldingene å gjøre: det noen skriver inn i skjemaet blir
 *  aldri en lapp, og vises ikke på tavla i det hele tatt. Derfor står innholdet
 *  her i koden og ikke i databasen. Leser tavla fra basen igjen, er den ene
 *  tingen som skiller de to borte.
 *
 *  Regler:
 *   • `id` må være unik. Den bestemmer HELE utseendet på lappen — farge,
 *     bredde, høyde, tekststørrelse, helning og hvor den havner (se
 *     lib/notes.ts). Endrer du en id, stokker den lappen om på seg selv.
 *     Rekkefølgen i lista bestemmer hvilken kolonne de fyller.
 *   • `title` kan være tom streng. Da står bare sitatet.
 *   • `industry_key` må finnes i INDUSTRIES i lib/taxonomy.ts — den gir den
 *     svarte brikka nederst på lappen. Ukjent nøkkel gir ingen brikke.
 *   • `challenge` settes automatisk i gåseøyne. Ikke skriv dem selv.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Example = Pick<PublicSubmission, "id" | "industry_key" | "title" | "challenge">;

const EXAMPLES: Example[] = [
  {
    id: "ombruk-staal-rehabiliteringsprosjekter",
    industry_key: "bygg-anlegg",
    title: "Ombruk av stål i rehabiliteringsprosjekter",
    challenge:
      "Vi river mye bærende stål som teknisk sett har lang restlevetid, men " +
      "dokumentasjonskravene gjør ombruk tungt. Vi vil vite hva som faktisk stopper ombruk i " +
      "praksis, og hvor mye CO2 og kroner som står på spill i et typisk " +
      "rehabiliteringsprosjekt.",
  },
  {
    id: "klimagassregnskap-tidlig-prosjektfasen",
    industry_key: "bygg-anlegg",
    title: "Klimagassregnskap tidlig i prosjektfasen",
    challenge:
      "Klimaregnskapet kommer ofte for sent til å påvirke valgene som betyr mest. Kan vi lage " +
      "en enklere metode som gir brukbare tall allerede i skisseprosjektet?",
  },
  {
    id: "bim-modell-faktisk-byggeplass",
    industry_key: "bygg-anlegg",
    title: "Fra BIM-modell til faktisk byggeplass",
    challenge:
      "Modellene våre er gode, men informasjonen når ikke fram til dem som står på bygget. Vi " +
      "vil utforske hvordan modelldata kan brukes direkte i utførelsen uten at det blir enda et " +
      "system å logge seg inn i.",
  },
  {
    id: "tilstandsdata-eksisterende-bygningsmasse",
    industry_key: "bygg-anlegg",
    title: "Tilstandsdata fra eksisterende bygningsmasse",
    challenge:
      "Vi forvalter mange bygg der vi vet lite om faktisk tilstand. Hvilke målinger gir mest " +
      "innsikt per krone, og hvordan bør de settes sammen til en prioriteringsliste?",
  },
  {
    id: "isproblematikk-vindturbiner-innlandet",
    industry_key: "energi",
    title: "Isproblematikk på vindturbiner i innlandet",
    challenge:
      "Ising reduserer produksjonen og gir nedetid vi ikke klarer å forutsi godt nok. Vi vil se " +
      "på om værdata og produksjonsdata sammen kan gi bedre varsling.",
  },
  {
    id: "kapasitet-lavspentnettet-ved-rask",
    industry_key: "energi",
    title: "Kapasitet i lavspentnettet ved rask elektrifisering",
    challenge:
      "Ladepunkter og varmepumper kommer raskere enn vi klarer å bygge ut. Vi trenger bedre " +
      "metoder for å finne ut hvor flaskehalsene faktisk oppstår før de oppstår.",
  },
  {
    id: "karbonfangst-mindre-punktutslipp",
    industry_key: "energi",
    title: "Karbonfangst på mindre punktutslipp",
    challenge:
      "Fangst er modent for store anlegg, men mange norske utslippskilder er små. Hva skal til " +
      "for at fangst på et lite punktutslipp går rundt økonomisk?",
  },
  {
    id: "energibruk-eldre-naeringsbygg",
    industry_key: "energi",
    title: "Energibruk i eldre næringsbygg",
    challenge:
      "Vi ser store forskjeller mellom tilsynelatende like bygg. Vi vil forstå hvor mye som " +
      "skyldes teknisk anlegg og hvor mye som skyldes hvordan bygget faktisk brukes.",
  },
  {
    id: "tilstandsovervaaking-sporveksler",
    industry_key: "transport",
    title: "Tilstandsovervåking av sporveksler",
    challenge:
      "Sporveksler står for en uforholdsmessig stor andel av feilene våre. Kan sensordata gi " +
      "oss varsel før feilen inntreffer, og hva koster det å installere bredt?",
  },
  {
    id: "reisedata-faktisk-kapasitetsbehov",
    industry_key: "transport",
    title: "Reisedata og faktisk kapasitetsbehov",
    challenge:
      "Vi planlegger ruter på grunnlag av tellinger som er noen år gamle. Hvordan kan vi bruke " +
      "ferske data uten å gå på akkord med personvernet?",
  },
  {
    id: "siste-kilometer-inn-tette",
    industry_key: "transport",
    title: "Siste kilometer inn i tette bykjerner",
    challenge:
      "Varelevering i sentrum skaper både utslipp og trengsel. Vi vil se på om samlast eller " +
      "nye leveringsvinduer gir målbar effekt.",
  },
  {
    id: "spraakmodeller-interne-fagdokumenter",
    industry_key: "it-data",
    title: "Språkmodeller på interne fagdokumenter",
    challenge:
      "Vi sitter på tiår med rapporter som ingen rekker å lese. Vi vil vite hva som faktisk " +
      "fungerer når svarene må være etterprøvbare, ikke bare plausible.",
  },
  {
    id: "integrasjon-mellom-gamle-fagsystemer",
    industry_key: "it-data",
    title: "Integrasjon mellom gamle fagsystemer",
    challenge:
      "Mye av tiden går med til å flytte data mellom systemer som ikke snakker sammen. Vi vil " +
      "kartlegge hvor kostnaden faktisk ligger og hva som er verdt å erstatte.",
  },
  {
    id: "sikkerhet-leverandorkjeden",
    industry_key: "it-data",
    title: "Sikkerhet i leverandørkjeden",
    challenge:
      "Vi har god kontroll på egne systemer, men mindre på underleverandørenes. Hvordan bør vi " +
      "stille krav som faktisk lar seg etterprøve?",
  },
  {
    id: "prediktivt-vedlikehold-roterende-utstyr",
    industry_key: "industri-automasjon",
    title: "Prediktivt vedlikehold på roterende utstyr",
    challenge:
      "Vi har vibrasjonsdata vi ikke bruker til noe. Hva slags modeller gir tidlig nok varsel " +
      "til at vi rekker å planlegge stansen?",
  },
  {
    id: "restmaterialer-egen-produksjon",
    industry_key: "industri-automasjon",
    title: "Restmaterialer fra egen produksjon",
    challenge:
      "En del av restmaterialet vårt går til gjenvinning når det kanskje kunne blitt brukt om " +
      "igjen internt. Vi vil vite hvilke strømmer som er verdt å se nærmere på.",
  },
  {
    id: "strukturering-frie-tekstfelt-journal",
    industry_key: "helse",
    title: "Strukturering av frie tekstfelt i journal",
    challenge:
      "Mye klinisk informasjon ligger som løpende tekst. Vi vil utforske hvordan den kan gjøres " +
      "søkbar uten at pasientvernet svekkes.",
  },
  {
    id: "hjemmeoppfolging-kronisk-syke",
    industry_key: "helse",
    title: "Hjemmeoppfølging av kronisk syke",
    challenge:
      "Vi vil forstå hva som gjør at noen pasienter faktisk bruker utstyret hjemme over tid, " +
      "mens andre slutter etter få uker.",
  },
  {
    id: "overvannshaandtering-tett-bebyggelse",
    industry_key: "vann-miljo",
    title: "Overvannshåndtering i tett bebyggelse",
    challenge:
      "Kraftigere regn treffer et ledningsnett som ikke er dimensjonert for det. Hvilke lokale " +
      "tiltak gir mest effekt der det er minst plass?",
  },
  {
    id: "lekkasjesok-vannledningsnettet",
    industry_key: "vann-miljo",
    title: "Lekkasjesøk i vannledningsnettet",
    challenge:
      "Vi mister en betydelig andel av vannet på vei ut til abonnentene. Vi vil vurdere hvilke " +
      "metoder som gir best treff per krone.",
  },
  {
    id: "sensorfusjon-ubemannede-systemer",
    industry_key: "forsvar",
    title: "Sensorfusjon for ubemannede systemer",
    challenge:
      "Vi vil utforske hvordan data fra flere sensortyper kan settes sammen til et robust " +
      "situasjonsbilde også når enkelte sensorer faller ut.",
  },
  {
    id: "csrd-praksis-mellomstore-bedrifter",
    industry_key: "radgivning-finans",
    title: "CSRD i praksis for mellomstore bedrifter",
    challenge:
      "Kravene er skrevet for store selskaper. Vi vil finne ut hva som er tilstrekkelig for en " +
      "bedrift med to hundre ansatte, uten å bygge et helt rapporteringsapparat.",
  },
  {
    id: "digitale-tjenester-innbyggere-lav",
    industry_key: "offentlig-utdanning",
    title: "Digitale tjenester for innbyggere med lav digital kompetanse",
    challenge:
      "Tjenestene våre fungerer godt for de fleste, men ikke for alle. Vi vil forstå hvor folk " +
      "faller av, og hva som skal til for at de kommer i mål.",
  },
];

/* Tavla tegner PublicSubmission. Feltene som bare finnes fordi innmeldinger
   har dem — tidspunkt, ansvarsområde, nivåer — fylles ut her, én gang, i
   stedet for å ligge som støy i lista over. */
export const EXAMPLE_NOTES: PublicSubmission[] = EXAMPLES.map((e) => ({
  ...e,
  created_at: "",
  subarea_key: "annet",
  subarea_other: null,
  levels: [],
}));
