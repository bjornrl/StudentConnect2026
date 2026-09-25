import Image from "next/image";

/** Et av ikonene fra Punkt Oslo-settet (public/kp/icon-01…10.png). Rent dekorativt. */
export default function Icon({ n, className }: { n: number; className?: string }) {
  return (
    <Image
      src={`/kp/icon-${String(n).padStart(2, "0")}.png`}
      alt=""
      width={96}
      height={96}
      aria-hidden
      className={className}
    />
  );
}
