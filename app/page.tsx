"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BoardNav from "@/components/BoardNav";
import AboutDialog from "@/components/AboutDialog";
import StickyNote from "@/components/StickyNote";
import { noteStyle, scatter, type ClearArea } from "@/lib/notes";
import { EXAMPLE_NOTES } from "@/lib/examples";
import { PARTNERS } from "@/lib/partners";

/* ─────────────────────────────────────────────────────────────────────────────
   Forsiden.

   Den skal si én ting og be om én ting, og den skal se ut som stedet den
   sender deg til. Derfor er den bygget av de samme delene som tavla: samme
   flate, samme flytende linje øverst, samme lapper — bare uten at de kan tas
   i. Her er veggen et bilde av tavla, ikke tavla selv, og da skal det bare
   være ett sted å trykke.

   Lappene er de samme eksemplene som på /edit (lib/examples.ts) — ikke
   innmeldinger. Det noen skriver inn i skjemaet havner aldri på en lapp, og
   det gjelder her også. Utlegget får beskjed om å holde midten fri (`clear`),
   ellers hadde sitatene lagt seg under overskriften og ingen av delene vært
   til å lese.

   Hierarkiet er kjennemerke → spørsmål → ingress → én handling → finskrift →
   partnere, og hvert trinn er svakere enn det over. Avstandene er ujevne med
   vilje: luften over et element er det som sier at et nytt trinn begynner.
   ──────────────────────────────────────────────────────────────────────────── */

/** Nok til å lese som en vegg, få nok til at forsiden ikke blir uendelig lang. */
const WALL_SIZE = 18;

const NOTES = EXAMPLE_NOTES.slice(0, WALL_SIZE);

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [clear, setClear] = useState<ClearArea>({ width: 0, height: 0 });

  /* Flatens bredde styrer kolonnene, og heltekstblokkas mål styrer hvor stort
     hull utlegget må la stå. Begge måles — å gjette på dem ville betydd at
     lappene la seg over overskriften så snart teksten brøt på en ny linje. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!stage || !hero) return;

    const measure = () => {
      setStageWidth(stage.clientWidth);
      setClear({
        // luft på hver side, så lappene ikke klistrer seg inntil teksten
        width: hero.offsetWidth + 120,
        height: hero.offsetTop + hero.offsetHeight + 56,
      });
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  const canvasWidth = stageWidth || 1200;

  const styled = useMemo(
    () =>
      NOTES.map((note) => ({
        id: note.id,
        note,
        style: noteStyle(note, canvasWidth - 48),
      })),
    [canvasWidth]
  );

  const { placements, height } = useMemo(
    () => scatter(styled, canvasWidth, clear),
    [styled, canvasWidth, clear]
  );

  return (
    <main className="home">
      <BoardNav onAbout={() => setAboutOpen(true)} />

      <div className="home-stage" ref={stageRef} style={{ minHeight: `${height}px` }}>
        {/* Teksten står først i dokumentet fordi den er det siden handler om.
            Lappene ligger under her i markupen, men bak i lagene. */}
        <div className="home-hero" ref={heroRef}>
          <p className="home-eyebrow">Vi jakter utfordringer fra bedrifter</p>

          <h1 className="home-title">Hva vil dere utforske?</h1>

          <p className="home-lead">
            Koblingspunkt tilbyr tilgang på innovative studenter som kan gi bedrifter nye
            perspektiver, tilgang på ny kompetanse og helt nye løsninger.
          </p>

          {/* Én fylt knapp. Alt annet på siden er tekst. */}
          <Link className="home-cta" href="/edit">
            Meld inn en utfordring
            <span aria-hidden="true">→</span>
          </Link>

          {/* Finskriften bærer forbeholdet om kontaktinformasjonen, så den skal
              stå — men under handlingen og i minste trinn, ikke som et tredje
              avsnitt på linje med ingressen. Den forutsetter at bolk 02 «Folka»
              i Questionnaire.tsx faktisk spør om bedrift og e-post; blir den
              kommentert ut igjen, må denne skrives om. */}
          <p className="home-fineprint">
            Dere trenger ikke vite hvordan en masteroppgave eller et studentprosjekt skal se ut —
            dere trenger kun et ønske om å løse utfordringen. Koblingspunkt hjelper dere fra første
            idé til et konkret samarbeid og verdiskaping. Det er uforpliktende å registrere
            utfordringer. Hva som meldes inn, og av hvem, er kun tilgjengelig for oss i
            Koblingspunkt.
          </p>
        </div>

        <div className="home-wall" aria-hidden>
          {styled.map(({ id, note, style }, i) => {
            const at = placements.get(id) ?? { x: 0, y: 0 };
            return (
              <StickyNote
                key={id}
                submission={note}
                style={style}
                x={at.x}
                y={at.y}
                z={i + 1}
              />
            );
          })}
        </div>
      </div>

      {/* Høyden per logo er satt i lib/partners.ts — lik høyde gir ikke lik tyngde. */}
      <footer className="home-partners">
        <p className="home-partners-label">I samarbeid med</p>
        <div className="home-logos">
          {PARTNERS.map((p) => (
            <Image
              key={p.src}
              src={p.src}
              alt={p.alt}
              width={p.width}
              height={p.height}
              style={{ height: p.displayHeight, width: "auto" }}
            />
          ))}
        </div>
      </footer>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
