/**
 * Logoene som vises i introduksjonen på /edit. Filene ligger i public/logos.
 *
 * Skal du bytte en logo: legg filen i public/logos og oppdater raden her.
 * Bruk filnavn uten mellomrom og æ/ø/å — macOS lagrer slike tegn på en annen
 * måte enn Linux-serveren hos Netlify, og da blir bildet borte i produksjon.
 */
export type Partner = {
  src: string;
  alt: string;
  /** Bildets egne pikselmål. Brukes bare til å reservere plass mens det laster. */
  width: number;
  height: number;
  /**
   * Høyden logoen vises med, i piksler. Settes per logo fordi lik høyde ikke
   * gir lik tyngde: en høy logo med mye luft rundt merket blir liten å se på,
   * mens en flat ordmerke-logo blir dominerende. Juster til raden ser jevn ut.
   */
  displayHeight: number;
};

export const PARTNERS: Partner[] = [
  { src: "/logos/oslo-kommune.png", alt: "Oslo kommune", width: 1372, height: 934, displayHeight: 40 },
  { src: "/logos/punkt-oslo.png", alt: "Punkt Oslo", width: 6835, height: 4501, displayHeight: 42 },
  { src: "/logos/grundergarasjen.png", alt: "Gründergarasjen", width: 192, height: 192, displayHeight: 38 },
  { src: "/logos/sefio.png", alt: "SEFiO", width: 1330, height: 529, displayHeight: 26 },
  { src: "/logos/comte.png", alt: "Comte", width: 1129, height: 322, displayHeight: 24 },
];
