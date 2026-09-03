/* ─────────────────────────────────────────────────────────────────────────────
   Post-it-lappene.

   Alt som gir en lapp utseendet sitt — farge, bredde, høyde, tekststørrelse og
   helning — regnes ut her, og bare ut fra id-en. Det er med vilje: to lapper
   ved siden av hverandre skal se ulike ut, men den SAMME lappen skal se lik ut
   hver gang siden lastes, ellers flytter tavla på seg mens man ser på den.
   Math.random() ville dessuten gitt ulikt resultat på server og klient og
   ødelagt hydreringen.

   Variasjonen er styrt, ikke tilfeldig: hver størrelse har en grunnverdi og
   får lov til å bevege seg 80–120 % rundt den. Da blir veggen levende uten at
   én lapp plutselig er dobbelt så stor som naboen.
   ──────────────────────────────────────────────────────────────────────────── */

import type { PublicSubmission } from "./types";

/* ── paletten ─────────────────────────────────────────────────────────────── */

export type NoteColor = {
  /** Flaten på lappen. */
  bg: string;
  /** Tekstfargen som holder kontrast mot `bg`. */
  ink: string;
};

/** Fargene fra Figma-fila. Rekkefølgen bestemmer hvilke naboer som møtes. */
export const NOTE_COLORS: NoteColor[] = [
  { bg: "#cce848", ink: "#101110" }, // lime
  { bg: "#4896fc", ink: "#ffffff" }, // blå
  { bg: "#ff8048", ink: "#101110" }, // oransje
  { bg: "#ffb3f3", ink: "#101110" }, // rosa
  { bg: "#8694fd", ink: "#ffffff" }, // blålilla
];

/* ── grunnverdiene ────────────────────────────────────────────────────────── */

/** Bredde, høyde og tekst har hver sin grunnverdi og varierer 80–120 % rundt den. */
const BASE_WIDTH = 310;
const BASE_HEIGHT = 200;
export const BASE_TEXT = 28;
const MIN_TEXT = 22;
const MAX_TEXT = 34;
/** Hvor mye hver verdi får lov til å bevege seg: ±20 %. */
const SPREAD = 0.2;
/** Helningen. Mer enn dette begynner teksten å bli slitsom å lese. */
const MAX_TILT = 4;

/** Luften inne i lappen, og plassen tag-brikken tar. Brukes til høydeanslaget. */
const NOTE_PADDING = 16;
const TAG_HEIGHT = 26;

/* ── deterministisk «tilfeldighet» ────────────────────────────────────────── */

/** FNV-1a. Gjør en id om til ett 32-bits tall. */
function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Et tall i [0,1) fra `seed`. `salt` skiller de ulike egenskapene fra
 * hverandre, slik at bredde og høyde på samme lapp ikke får identisk verdi.
 */
function unit(seed: number, salt: number): number {
  let x = (seed ^ Math.imul(salt + 1, 0x9e3779b9)) >>> 0;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return x / 4294967296;
}

/** Grunnverdien ganget med noe mellom 0,8 og 1,2. */
function varied(base: number, u: number): number {
  return base * (1 - SPREAD + u * (SPREAD * 2));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ── utseendet ────────────────────────────────────────────────────────────── */

export type NoteStyle = {
  color: NoteColor;
  width: number;
  /** Anslått høyde. Settes som `min-height` OG brukes til utlegget, så de to
      aldri kommer i utakt. */
  height: number;
  fontSize: number;
  /** Grader. Negativ er mot klokka. */
  tilt: number;
};

/**
 * Hvor mye tekst det er på lappen, som et tall mellom 0 (kort) og 1 (langt).
 * 40 tegn regnes som kort, 320 som langt.
 */
function density(chars: number): number {
  return clamp((chars - 40) / (320 - 40), 0, 1);
}

/**
 * `maxWidth` er hvor bred lappen har lov til å bli. På en telefon er flaten
 * smalere enn grunnbredden, og da må bredden ned FØR høyden anslås — ellers
 * regner vi med færre linjer enn teksten faktisk får, og lappene legger seg
 * for tett.
 */
export function noteStyle(submission: PublicSubmission, maxWidth = Infinity): NoteStyle {
  const seed = hash32(submission.id);
  const chars = submission.title.length + submission.challenge.length;

  /* Tekststørrelsen er ikke bare pynt: mye tekst på en liten lapp må settes
     mindre for å få plass, og en kort tanke tåler — og fortjener — å rope.
     Derfor bestemmer tekstmengden hovedtrekket, og slumpen legger bare på en
     knapp piksel eller to slik at to like lange lapper ikke blir identiske. */
  const fromLength = MAX_TEXT - density(chars) * (MAX_TEXT - MIN_TEXT);
  const jitter = (unit(seed, 3) - 0.5) * 3;
  const fontSize = Math.round(clamp(fromLength + jitter, MIN_TEXT, MAX_TEXT));

  const width = Math.min(
    Math.round(varied(BASE_WIDTH, unit(seed, 1))),
    Math.max(220, Math.round(maxWidth))
  );

  /* Høydeanslag. Tegnbredden er ca. 0,5 em i en grotesk, og vi runder
     konservativt oppover — anslår vi for lavt, legger utlegget lappene for
     tett og de klipper hverandre. */
  const perLine = Math.max(8, Math.floor((width - NOTE_PADDING * 2) / (fontSize * 0.5)));
  const lines = Math.ceil(chars / perLine) + (submission.title ? 1 : 0);
  const needed = NOTE_PADDING * 2 + lines * fontSize * 1.18 + TAG_HEIGHT;
  const height = Math.round(Math.max(varied(BASE_HEIGHT, unit(seed, 2)), needed));

  return {
    color: NOTE_COLORS[seed % NOTE_COLORS.length],
    width,
    height,
    fontSize,
    tilt: Number((-MAX_TILT + unit(seed, 4) * MAX_TILT * 2).toFixed(2)),
  };
}

/* ── utlegget på tavla ────────────────────────────────────────────────────── */

export type Placement = { x: number; y: number };

/**
 * Et felt midt på flaten som skal stå fritt. Forsiden bruker det til
 * heltekstblokka: kolonnene som ligger bak den starter under den i stedet for
 * øverst, og de som går klar av den holder seg utenfor kanten hele veien.
 * Uten dette havner sitatene under overskriften, og ingen av delene leses.
 */
export type ClearArea = { width: number; height: number };

/**
 * Luft over lappene. Den øverste raden får trekke seg 40 px opp (se y-spennet
 * under), så tallet må ha rom for det og fortsatt klare navigasjonslinja, som
 * slutter på 57.
 */
const TOP = 118;

/**
 * Loddrett slingringsmonn per lapp. `Y_LIFT` er hvor langt den får trekke seg
 * OPP i naboen over — det er den som lager overlappingen — og `Y_DROP` hvor
 * mye luft den kan få i stedet. Tallene står her fordi de også bestemmer hvor
 * langt ned et fritt felt må starte for å faktisk bli fritt.
 */
const Y_LIFT = 40;
const Y_DROP = 90;
const SIDE = 24;
/**
 * Smaleste kolonne vi godtar. Luften er rikelig med vilje — den er
 * slingringsmonnet lappene sprer seg i. Krymper kolonnen i takt med lappene,
 * får vi bare flere og tettere kolonner, og veggen blir et rutenett igjen.
 */
const MIN_COLUMN = Math.round(BASE_WIDTH * (1 + SPREAD)) + 90;
/**
 * Og bredeste. Uten et tak fordeles all overskuddsplass på en vid skjerm som
 * mellomrom, og veggen faller fra hverandre i enkeltstående øyer.
 */
const MAX_COLUMN = Math.round(MIN_COLUMN * 1.4);

/**
 * Sprer lappene utover flaten.
 *
 * Kolonnene fylles etter murverksprinsippet: hver lapp legges i den kolonnen
 * som har kommet kortest, så veggen vokser jevnt i stedet for å bli en trapp.
 * Innenfor kolonnen får lappen slingringsmonn både i x og y, og y-monnet kan
 * være negativt — det er dét som gjør at lapper legger seg delvis oppå
 * hverandre, slik ekte post-it-lapper gjør.
 *
 * Resultatet er bare STARTposisjonen. Drar man en lapp, overstyrer den
 * posisjonen dette utlegget.
 */
export function scatter(
  notes: { id: string; style: NoteStyle }[],
  canvasWidth: number,
  clear?: ClearArea
): { placements: Map<string, Placement>; height: number } {
  const usable = Math.max(1, canvasWidth - SIDE * 2);
  const columns = Math.max(1, Math.floor(usable / MIN_COLUMN));
  /* Kolonnene deler flaten mellom seg i stedet for å ligge samlet i midten med
     brede, døde marger. Taket hindrer at de blir så brede at lappene mister
     kontakten med hverandre — og på en telefon, der flaten er smalere enn én
     kolonne, er kolonnen rett og slett så bred som flaten tillater. */
  const colWidth =
    columns === 1
      ? Math.min(MIN_COLUMN, usable)
      : Math.min(MAX_COLUMN, usable / columns);
  /* Det som eventuelt blir til overs fordeles likt, så veggen står midt på
     flaten i stedet for å klistre seg til venstre kant. */
  const left = SIDE + Math.max(0, usable - columns * colWidth) / 2;

  /* Feltet som skal stå fritt, i x-koordinater. En kolonne er «bak» det så
     snart den så vidt overlapper — halve lapper inn i overskriften er verre
     enn ingen. */
  const band =
    clear && clear.width > 0
      ? { from: canvasWidth / 2 - clear.width / 2, to: canvasWidth / 2 + clear.width / 2 }
      : null;
  const colLeft = (c: number) => left + c * colWidth;
  const behindClear = (c: number) =>
    band !== null && colLeft(c) < band.to && colLeft(c) + colWidth > band.from;

  /* Kolonnene bak det frie feltet starter under det — pluss Y_LIFT, ellers
     ville den første lappen i kolonnen trukket seg opp i feltet igjen. */
  const bottoms = Array.from({ length: columns }, (_, c) =>
    behindClear(c) && clear ? Math.max(TOP, clear.height + Y_LIFT) : TOP
  );
  const placements = new Map<string, Placement>();

  for (const { id, style } of notes) {
    let col = 0;
    for (let i = 1; i < columns; i += 1) {
      if (bottoms[i] < bottoms[col]) col = i;
    }

    const seed = hash32(id);

    /* Kolonnene holder veggen i balanse, men de skal ikke SYNES. Lappen får
       først spille på ledig plass i sin egen kolonne, og deretter drive et
       stykke ut av den — det er drivet som bryter rutenettet og lar naboer i
       to kolonner gå over hverandre. Klemmen holder den innenfor flaten. */
    const slack = Math.max(0, colWidth - style.width);
    const drift = (unit(seed, 7) - 0.5) * colWidth * 0.36;
    let x = left + col * colWidth + unit(seed, 5) * slack + drift;

    /* Går kolonnen klar av det frie feltet, skal drivet ikke få bære lappen
       inn i det likevel. En kolonne som går klar har per definisjon plass til
       den bredeste lappen sin utenfor kanten, så klemmen kan ikke skyve den
       ut av flaten. */
    if (band && !behindClear(col)) {
      x =
        colLeft(col) + colWidth / 2 < canvasWidth / 2
          ? Math.min(x, band.from - style.width)
          : Math.max(x, band.to);
    }

    x = clamp(x, SIDE, Math.max(SIDE, canvasWidth - SIDE - style.width));

    /* Noen lapper skyver seg godt opp i naboen over, andre får luft. Spennet
       er bredt fordi det er her den loddrette uroen kommer fra. */
    const y = bottoms[col] + (-Y_LIFT + unit(seed, 6) * (Y_LIFT + Y_DROP));

    placements.set(id, { x: Math.round(x), y: Math.round(y) });
    bottoms[col] = y + style.height;
  }

  return { placements, height: Math.max(...bottoms, TOP) + 80 };
}
