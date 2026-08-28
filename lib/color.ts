/** Hvit eller nesten-svart, avhengig av hva som gir best kontrast mot `hex`. */
export function contrastingInk(hex: string): "#ffffff" | "#101110" {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join("") : raw;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "#101110";

  const toLin = (channel: number) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const L =
    0.2126 * toLin((n >> 16) & 255) +
    0.7152 * toLin((n >> 8) & 255) +
    0.0722 * toLin(n & 255);

  const vsWhite = 1.05 / (L + 0.05);
  const vsBlack = (L + 0.05) / 0.05;
  return vsWhite >= vsBlack ? "#ffffff" : "#101110";
}

/** Paletten fra forsiden, uten den mørke skoggrønne som er reserved for :active. */
export const HOVER_GREENS = [
  "#cbf863",
  "#affd86",
  "#71fbb4",
  "#9ff3e2",
  "#c8fb89",
  "#7fb447",
  "#6d906e",
] as const;

/** Samme mørkegrønne på alle knapper når de trykkes inn. */
export const PRESS_GREEN = "#0a1d06";

export function hoverVars(index: number): { "--hover": string; "--hover-ink": string } {
  const bg = HOVER_GREENS[((index % HOVER_GREENS.length) + HOVER_GREENS.length) % HOVER_GREENS.length];
  return { "--hover": bg, "--hover-ink": contrastingInk(bg) };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Lesbarhet på kartet.

   Grøntonene over er laget som flater bak mørk tekst — som prikker og etiketter
   på den lyse kartflata forsvinner de (ned mot 1.04:1). `readableOn` beholder
   kuløren og tar bare ned lysheten til fargen når kontrastkravet.

   Resultatet ligger i mellomsjiktet og fungerer på begge kartbakgrunner: en
   farge som treffer 3:1 mot #efefef lander rundt 5,5:1 mot #0a0b0a i mørkt
   tema, så vi slipper én palett per tema.
   ──────────────────────────────────────────────────────────────────────────── */

type Rgb = [number, number, number];

function toRgb(hex: string): Rgb {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join("") : raw;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  const p = (c: number) => Math.round(c).toString(16).padStart(2, "0");
  return `#${p(r)}${p(g)}${p(b)}`;
}

function relLuminance([r, g, b]: Rgb): number {
  const f = (channel: number) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG-kontrast mellom to farger. */
export function contrastRatio(a: string, b: string): number {
  const la = relLuminance(toRgb(a));
  const lb = relLuminance(toRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0)) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255];
}

/**
 * Samme kulør som `hex`, mørknet akkurat nok til å nå `target` kontrast mot
 * `bg`. Er fargen lys nok fra før, returneres den urørt.
 */
export function readableOn(hex: string, bg: string, target: number): string {
  if (contrastRatio(hex, bg) >= target) return hex;
  const [h, s, lightness] = rgbToHsl(toRgb(hex));
  /* Kontrasten mot en lys flate vokser når lysheten synker, så vi leter etter
     den lyseste varianten som fortsatt holder kravet. */
  let lo = 0;
  let hi = lightness;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(toHex(hslToRgb(h, s, mid)), bg) >= target) lo = mid;
    else hi = mid;
  }
  return toHex(hslToRgb(h, s, lo));
}
