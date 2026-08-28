import Link from "next/link";
import Aurora from "@/components/Aurora";
import type { CSSProperties } from "react";
import { hoverVars } from "@/lib/color";

/* ─────────────────────────────────────────────────────────────────────────────
   Figma «Editorial» (node 130:177) — modalen på forsiden.

   Rammen er 468 px bred i Figma. Som i skjemaet er hvert mål tatt som sin andel
   av den bredden og skrevet i `cqi`, mot modalens egen bredde — `@container`
   ligger derfor på innpakningen utenfor, ikke på kortet selv (et element kan
   ikke måle seg mot sin egen beholder).
   Beholderen har max-width, så andelene trenger bare et gulv: `max()` holder
   teksten lesbar på smal skjerm, og max-width setter taket. Andelen bak hver
   verdi står i kommentaren.

   Klassestrengene må stå som hele literaler — Tailwind leser kildefila som
   tekst og finner ikke klasser satt sammen med `${...}`.
   ──────────────────────────────────────────────────────────────────────────── */

/* 12.948/468 padding · 13.745/468 luft · 0.199 px kant → hårstrek */
const CARD =
  "flex min-w-0 flex-1 flex-col items-start gap-[max(0.6rem,2.937cqi)] rounded-[max(0.9rem,2.724cqi)] " +
  "border border-ink/70 bg-card p-[max(0.75rem,2.767cqi)] leading-[0.87] text-ink/70 no-underline " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-[ease] " +
  "hover:-translate-y-0.5 hover:border-[var(--hover)] hover:bg-[var(--hover)] hover:text-[var(--hover-ink)] " +
  "active:border-press active:bg-press active:text-bg";

const CARD_TITLE = "w-full text-[max(0.95rem,3.205cqi)] font-medium"; /* 15/468 */
const CARD_BODY = "w-full text-[max(0.7rem,1.703cqi)] font-light"; /* 7.968/468 */

/* Brødteksten står som tre avsnitt i designet, skilt av blanke linjer. Her er
   de tre <p> med luft imellom — setningene brytes da der bredden tilsier, ikke
   der de tilfeldigvis brøt i en 468 px ramme. */
const BODY =
  "m-0 w-full text-center text-[max(0.85rem,2.35cqi)] leading-[1.35] font-medium text-ink"; /* 9.562/468 */

export default function Home() {
  return (
    <main className="home">
      <Aurora />

      <div className="@container w-full max-w-[700px]">
        <div className="flex w-full flex-col items-start gap-[max(1rem,5.128cqi)] rounded-[max(0.9rem,2.724cqi)] bg-card p-[max(0.9rem,2.724cqi)]">
          <p className="m-0 w-full text-[max(0.78rem,2.043cqi)] leading-[0.87] font-light text-ink/50">
            Student Connect 2026
          </p>

          <h1 className="w-full text-center text-[max(1.8rem,11.5cqi)] leading-[0.87] font-light text-ink [overflow-wrap:break-word]">
            Hva vil dere utforske?
          </h1>

          <div className="flex w-full flex-col gap-[max(0.7rem,2.043cqi)]">
            <p className={BODY}>
              Vi inviterer bedrifter i Oslo til å melde inn temaer de gjerne vil vite mer om, eller
              utfordringer de vil ha løst.
            </p>
            <p className={BODY}>
              Koblingspunkt matcher utfordringer med studenter eller studentteam. Disse kan skape
              nye løsninger, gi nye perspektiver og energi inn i bedriftenes innovasjonsarbeid.
            </p>
            <p className={BODY}>
              Det er uforpliktende å registrere utfordringer. Ved å registrere godkjenner dere at
              Koblingspunkt kan kontakt for å bidra med studenter som kan løse utfordringen.
            </p>
          </div>

          {/* Like brede (flex-1) og like høye (items-stretch). I Figma er det
              venstre kortet høyere fordi teksten er lengre — her skal de matche. */}
          <div className="flex w-full items-stretch gap-[max(0.5rem,2.564cqi)]">
            <Link href="/edit" className={CARD} style={hoverVars(1) as CSSProperties}>
              <span className={CARD_TITLE}>Fyll inn deres utfordringer →</span>
              <span className={CARD_BODY}>
                Kartet til høyre vokser for hver utfordring som sendes inn. Hva som er sendt inn, og
                av hvem – er kun tilgjengelig for oss i Koblingspunkt.
              </span>
            </Link>
            <Link href="/presentation" className={CARD} style={hoverVars(4) as CSSProperties}>
              <span className={CARD_TITLE}>Vis kartet →</span>
              <span className={CARD_BODY}>Fullskjerm for storskjerm og stand.</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
