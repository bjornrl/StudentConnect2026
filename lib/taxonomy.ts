/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DETTE ER DEN ENESTE FILEN DU TRENGER Å ENDRE FOR Å BYTTE UT SPØRSMÅLENE.
 *
 *  Skjemaet spør om bransje og en fritekst-utfordring. Nodekartet grupperer og
 *  kobler etter `industry`. Endrer du listene under, endrer kartet seg
 *  automatisk.
 *
 *  `subareas` brukes ikke lenger av skjemaet — feltet «ansvarsområde» er tatt
 *  bort. Listene står igjen fordi innmeldinger fra før den endringen har en
 *  `subarea_key`, og trenger etiketten sin for å vises riktig.
 *
 *  Regler:
 *   • `key` må være unik og bør ikke endres etter at data er samlet inn
 *     (nøkkelen lagres i databasen). Endre gjerne `label` fritt.
 *   • `color` styrer fargen på nodene i den bransjen — og er samme farge som
 *     bransjeknappen i skjemaet får på hover og når den er valgt. Verdiene
 *     er grøntonene fra forsiden (HOVER_GREENS i lib/color.ts). Paletten har
 *     sju farger og lista her har ti bransjer, så tre par deler farge.
 *   • Hver bransje får automatisk et «Annet» valg med fritekstfelt.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SubArea = {
  key: string;
  label: string;
};

export type Industry = {
  key: string;
  label: string;
  /** Kort forklaring vist under knappen. */
  hint: string;
  color: string;
  subareas: SubArea[];
};

export const OTHER_KEY = "annet";

export const INDUSTRIES: Industry[] = [
  {
    key: "bygg-anlegg",
    label: "Bygg og anlegg",
    hint: "Entreprenør, rådgivende ingeniør, arkitektur, eiendom",
    color: "#71fbb4",
    subareas: [
      { key: "prosjektering", label: "Prosjektering og teknisk rådgivning" },
      { key: "prosjektledelse", label: "Prosjekt- og byggeledelse" },
      { key: "konstruksjon", label: "Konstruksjon og bæresystemer" },
      { key: "bim-digital", label: "BIM og digitale byggeprosesser" },
      { key: "baerekraft-bygg", label: "Bærekraft, materialbruk og ombruk" },
      { key: "hms-kvalitet", label: "HMS, kvalitet og risiko" },
      { key: "drift-vedlikehold", label: "Drift, forvaltning og vedlikehold" },
      { key: "areal-plan", label: "Areal-, by- og reguleringsplanlegging" },
    ],
  },
  {
    key: "energi",
    label: "Energi og kraft",
    hint: "Fornybar, olje og gass, nett, energisystemer",
    color: "#9ff3e2",
    subareas: [
      { key: "fornybar", label: "Fornybar produksjon (vind, sol, vann)" },
      { key: "olje-gass", label: "Olje, gass og undervannsteknologi" },
      { key: "nett-distribusjon", label: "Kraftnett og distribusjon" },
      { key: "energilagring", label: "Energilagring og fleksibilitet" },
      { key: "hydrogen-ccs", label: "Hydrogen, CCS og nye energibærere" },
      { key: "energieffektivisering", label: "Energieffektivisering" },
      { key: "marked-analyse", label: "Kraftmarked og analyse" },
    ],
  },
  {
    key: "forsvar",
    label: "Forsvar og sikkerhet",
    hint: "Forsvarsindustri, beredskap, sikkerhet",
    color: "#c8fb89",
    subareas: [
      { key: "materiell", label: "Materiell og systemutvikling" },
      { key: "beredskap", label: "Beredskap og krisehåndtering" },
      { key: "cyber", label: "Cybersikkerhet og informasjonssikring" },
      { key: "logistikk-forsvar", label: "Logistikk og forsyning" },
      { key: "infrastruktur-forsvar", label: "Forsvarsbygg og infrastruktur" },
      { key: "autonomi", label: "Autonome systemer og sensorteknologi" },
    ],
  },
  {
    key: "transport",
    label: "Transport og samferdsel",
    hint: "Bane, vei, kollektiv, logistikk",
    color: "#7fb447",
    subareas: [
      { key: "bane-skinne", label: "Bane og skinnegående transport" },
      { key: "vei-infrastruktur", label: "Vei og infrastruktur" },
      { key: "kollektiv-drift", label: "Kollektivdrift og ruteplanlegging" },
      { key: "signal-styring", label: "Signal-, styrings- og sikringssystemer" },
      { key: "logistikk", label: "Logistikk og forsyningskjeder" },
      { key: "mobilitet", label: "Mobilitetstjenester og reisedata" },
      { key: "vedlikehold-transport", label: "Vedlikehold og tilstandsovervåking" },
    ],
  },
  {
    key: "helse",
    label: "Helse og medisinsk teknologi",
    hint: "Sykehus, medtech, diagnostikk, helsedata",
    color: "#6d906e",
    subareas: [
      { key: "medisinsk-utstyr", label: "Medisinsk utstyr og instrumentering" },
      { key: "bildediagnostikk", label: "Bildediagnostikk og sensorikk" },
      { key: "helsedata", label: "Helsedata, journal og analyse" },
      { key: "pasientforlop", label: "Pasientforløp og tjenestedesign" },
      { key: "biomedisin", label: "Biomedisin og laboratorieteknologi" },
      { key: "velferdsteknologi", label: "Velferdsteknologi og hjemmeoppfølging" },
    ],
  },
  {
    key: "it-data",
    label: "IT, data og digitalisering",
    hint: "Programvare, data, KI, plattformer",
    color: "#cbf863",
    subareas: [
      { key: "systemutvikling", label: "System- og programvareutvikling" },
      { key: "data-plattform", label: "Dataplattform og integrasjoner" },
      { key: "ki-maskinlaering", label: "KI og maskinlæring" },
      { key: "sky-drift", label: "Sky, drift og infrastruktur" },
      { key: "informasjonssikkerhet", label: "Informasjonssikkerhet" },
      { key: "digital-tjenesteutvikling", label: "Digital tjenesteutvikling og UX" },
      { key: "digitale-tvillinger", label: "Digitale tvillinger og simulering" },
    ],
  },
  {
    key: "industri-automasjon",
    label: "Industri og automasjon",
    hint: "Produksjon, prosess, robotikk, vedlikehold",
    color: "#affd86",
    subareas: [
      { key: "produksjon", label: "Produksjon og prosessindustri" },
      { key: "automasjon-robot", label: "Automasjon og robotikk" },
      { key: "prosesstyring", label: "Prosesstyring og instrumentering" },
      { key: "materialteknologi", label: "Materialteknologi og metallurgi" },
      { key: "vedlikehold-industri", label: "Prediktivt vedlikehold" },
      { key: "sirkulaer-produksjon", label: "Sirkulær produksjon og ombruk" },
      { key: "tekniske-installasjoner", label: "Tekniske installasjoner og VVS" },
    ],
  },
  {
    key: "vann-miljo",
    label: "Vann, miljø og klima",
    hint: "VA, klimatilpasning, miljøteknologi",
    color: "#71fbb4",
    subareas: [
      { key: "vann-avlop", label: "Vann og avløp" },
      { key: "overvann", label: "Overvann og klimatilpasning" },
      { key: "miljoovervaking", label: "Miljøovervåking og måledata" },
      { key: "avfall-gjenvinning", label: "Avfall og gjenvinning" },
      { key: "utslipp-klimaregnskap", label: "Utslipp og klimaregnskap" },
      { key: "natur-okologi", label: "Natur, økologi og arealbruk" },
    ],
  },
  {
    key: "radgivning-finans",
    label: "Rådgivning og finans",
    hint: "Revisjon, konsulent, økonomi, forretningsutvikling",
    color: "#9ff3e2",
    subareas: [
      { key: "revisjon-regnskap", label: "Revisjon og regnskap" },
      { key: "forretningsradgivning", label: "Forretnings- og strategirådgivning" },
      { key: "baerekraftsrapportering", label: "Bærekraftsrapportering og CSRD" },
      { key: "risiko-compliance", label: "Risiko, compliance og internkontroll" },
      { key: "dataanalyse-finans", label: "Dataanalyse og beslutningsstøtte" },
      { key: "organisasjon-endring", label: "Organisasjon og endringsledelse" },
    ],
  },
  {
    key: "offentlig-utdanning",
    label: "Offentlig sektor og utdanning",
    hint: "Kommune, stat, universitet, interesseorganisasjon",
    color: "#c8fb89",
    subareas: [
      { key: "tjenesteutvikling-off", label: "Tjenesteutvikling og innbyggerdialog" },
      { key: "forvaltning", label: "Forvaltning, regelverk og saksbehandling" },
      { key: "forskning-formidling", label: "Forskning, undervisning og formidling" },
      { key: "innkjop", label: "Innkjøp og anskaffelser" },
      { key: "arbeidsliv", label: "Arbeidsliv, rekruttering og kompetanse" },
      { key: "samfunnsplanlegging", label: "Samfunns- og beredskapsplanlegging" },
    ],
  },
];

/** Nivåene en oppgave kan passe for. */
export const LEVELS = [
  { key: "bachelor", label: "Bacheloroppgave" },
  { key: "master", label: "Masteroppgave" },
  { key: "prosjekt", label: "Prosjekt- eller sommerjobb" },
  { key: "internship", label: "Internship" },
] as const;

/* ── Oppslag ──────────────────────────────────────────────────────────────── */

const industryByKey = new Map(INDUSTRIES.map((i) => [i.key, i]));

export function getIndustry(key: string): Industry | undefined {
  return industryByKey.get(key);
}

export function industryLabel(key: string): string {
  return industryByKey.get(key)?.label ?? "Ukjent bransje";
}

export function industryColor(key: string): string {
  return industryByKey.get(key)?.color ?? "#9AA0A6";
}

export function subareaLabel(industryKey: string, subareaKey: string, other?: string | null): string {
  if (subareaKey === OTHER_KEY) return other?.trim() || "Annet";
  const found = industryByKey
    .get(industryKey)
    ?.subareas.find((s) => s.key === subareaKey);
  return found?.label ?? subareaKey;
}

/** Alle gyldige (bransje, ansvarsområde)-par, brukt til validering. */
export function isValidPair(industryKey: string, subareaKey: string): boolean {
  const industry = industryByKey.get(industryKey);
  if (!industry) return false;
  if (subareaKey === OTHER_KEY) return true;
  return industry.subareas.some((s) => s.key === subareaKey);
}
