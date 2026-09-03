"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BoardNav from "@/components/BoardNav";
import AboutDialog from "@/components/AboutDialog";
import StickyNote from "@/components/StickyNote";
import { noteStyle, scatter, type ClearArea } from "@/lib/notes";
import { PARTNERS } from "@/lib/partners";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Forsiden.

   Den skal si én ting og be om én ting, og den skal se ut som stedet den
   sender deg til. Derfor er den bygget av de samme delene som tavla: samme
   flate, samme flytende linje øverst, samme lapper — bare uten at de kan tas
   i. Her er veggen et bilde av tavla, ikke tavla selv, og da skal det bare
   være ett sted å trykke.

   Lappene er ekte. De hentes fra basen som på /edit, så forsiden viser hva
   folk faktisk har hengt opp i stedet for oppdiktede eksempler. Utlegget får
   beskjed om å holde midten fri (`clear`), ellers hadde sitatene lagt seg
   under overskriften og ingen av delene vært til å lese.

   Hierarkiet er kjennemerke → spørsmål → ingress → én handling → finskrift →
   partnere, og hvert trinn er svakere enn det over. Avstandene er ujevne med
   vilje: luften over et element er det som sier at et nytt trinn begynner.
   ──────────────────────────────────────────────────────────────────────────── */

/** Nok til å lese som en vegg, få nok til at forsiden ikke blir uendelig lang. */
const WALL_SIZE = 18;

export default function Home() {
  const [submissions, setSubmissions] = useState<PublicSubmission[]>([]);
  const [aboutOpen, setAboutOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [clear, setClear] = useState<ClearArea>({ width: 0, height: 0 });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions", { cache: "no-store" });
      const json = await res.json();
      if (!Array.isArray(json.submissions)) return;
      // de nyeste ligger sist i lista fra basen
      setSubmissions((json.submissions as PublicSubmission[]).slice(-WALL_SIZE));
    } catch {
      /* forsiden står fint uten lapper også */
    }
  }, []);

  useEffect(() => {
    // `load` er async og setter ingen state før nettverket har svart
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

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
      submissions.map((s) => ({
        id: s.id,
        submission: s,
        style: noteStyle(s, canvasWidth - 48),
      })),
    [submissions, canvasWidth]
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
          <p className="home-eyebrow">Student Connect 2026</p>

          <h1 className="home-title">Hva vil dere utforske?</h1>

          <p className="home-lead">
            Vi inviterer bedrifter i Oslo til å melde inn temaer de gjerne vil vite mer om, eller
            utfordringer de vil ha løst. Hver innmelding blir en lapp på tavla, og studenter kan ta
            tak i den.
          </p>

          {/* Én fylt knapp. Alt annet på siden er tekst. */}
          <Link className="home-cta" href="/edit">
            Meld inn en utfordring
            <span aria-hidden="true">→</span>
          </Link>

          {/* NB: teksten under stemmer med skjemaet slik det står nå. Kommer
              «hvem er dere» tilbake i Questionnaire.tsx, må den skrives om —
              da samler vi kontaktinformasjon igjen. */}
          <p className="home-fineprint">
            Det er uforpliktende. Vi ber ikke om kontaktinformasjon — lappene henger anonymt på
            tavla.
          </p>
        </div>

        <div className={`home-wall${submissions.length > 0 ? " is-ready" : ""}`} aria-hidden>
          {styled.map(({ id, submission, style }, i) => {
            const at = placements.get(id) ?? { x: 0, y: 0 };
            return (
              <StickyNote
                key={id}
                submission={submission}
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
