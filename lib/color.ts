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
