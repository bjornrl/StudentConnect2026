/**
 * Logoene som vises i introduksjonen på /edit. Filene ligger i public/logos.
 *
 * Skal du bytte en logo: legg filen i public/logos og oppdater raden her.
 * Bruk filnavn uten mellomrom og æ/ø/å — macOS lagrer slike tegn på en annen
 * måte enn Linux-serveren hos Netlify, og da blir bildet borte i produksjon.
 *
 * Skaler filen ned før du legger den inn: logoene vises 24–42 px høye, så lagre
 * dem rundt 4x det (~100–170 px høye). En logo i full oppløsning laster tregt
 * helt unødvendig — og next/image velger srcset ut fra `width` under, så et
 * digert originalbilde får Next til å be om den største varianten den har.
 *
 *   magick logo.png -filter Lanczos -resize x160 -strip logo.png
 */
export type Partner = {
  src: string;
  alt: string;
  /**
   * Filens faktiske pikselmål. Reserverer plass mens bildet laster, og styrer
   * hvilken størrelse next/image henter — må stemme med filen på disk.
   */
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
  { src: "/logos/oslo-kommune.png", alt: "Oslo kommune", width: 235, height: 160, displayHeight: 40 },
  { src: "/logos/punkt-oslo.png", alt: "Punkt Oslo", width: 255, height: 168, displayHeight: 42 },
  { src: "/logos/grundergarasjen.png", alt: "Gründergarasjen", width: 192, height: 192, displayHeight: 38 },
  { src: "/logos/sefio.png", alt: "SEFiO", width: 261, height: 104, displayHeight: 26 },
  { src: "/logos/comte.png", alt: "Comte", width: 337, height: 96, displayHeight: 24 },
];
