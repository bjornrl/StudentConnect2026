"use client";

import { useCallback, useEffect, useState } from "react";
import StickyBoard from "@/components/StickyBoard";
import SentNote from "@/components/SentNote";
import Questionnaire from "@/components/Questionnaire";
import BoardNav from "@/components/BoardNav";
import AboutDialog from "@/components/AboutDialog";
import { useIsMobile } from "@/lib/useMediaQuery";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Tavla — hele siden.

   Skjermen er ikke delt i to. Den ER kanvaset: lappene ligger fritt utover
   hele flaten, og panelet med skjemaet svever oppå og kan slås av.

   VIKTIG: lappene er eksempler (lib/examples.ts). Det som meldes inn går rett
   til Koblingspunkt og blir ALDRI en lapp. Derfor henter denne siden ingenting
   fra basen — den skriver bare til den. Skulle noen finne på å la tavla lese
   innmeldinger igjen, er skillet borte, og da lyver både merkelappen i
   navigasjonslinja og teksten i panelet.

   Innsendingen er ett sammenhengende sveip: kortet løfter seg ut av feltet man
   skrev i, får farge og driver ut av bildet. Det lander ikke noe sted — for
   det gjør det ikke i virkeligheten heller.
   ──────────────────────────────────────────────────────────────────────────── */

/** Innmeldingen som er på vei ut av bildet, og ruta den løfter seg fra. */
type Sent = { submission: PublicSubmission; from: DOMRect };

export default function EditPage() {
  const isMobile = useIsMobile();

  const [panelOpen, setPanelOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [justSent, setJustSent] = useState(false);

  /* Panelet dekker halve skjermen på en telefon, så der starter tavla åpen.
     Justeres under render slik at brukeren fortsatt kan åpne panelet selv. */
  const [prevMobile, setPrevMobile] = useState(isMobile);
  if (isMobile !== prevMobile) {
    setPrevMobile(isMobile);
    setPanelOpen(!isMobile);
  }

  /* Kvitteringen skal si fra og så gi seg. Tallet henger sammen med
     `.toast` i globals.css: der ligger både ventetiden mens lappen flyr og
     inn-, stå- og ut-bevegelsen, og til sammen er de nøyaktig like lange som
     dette. Endres det ene, må det andre følge etter — ellers klippes kortet
     bort midt i sin egen uttoning. */
  useEffect(() => {
    if (!justSent) return;
    const t = setTimeout(() => setJustSent(false), 8000);
    return () => clearTimeout(t);
  }, [justSent]);

  /* Panelet blir stående åpent: det er ingen lapp å se lande, og den som har
     meldt inn én utfordring melder ofte inn to. */
  const onPublished = (submission: PublicSubmission, from: DOMRect) => {
    setSent({ submission, from });
    setJustSent(true);
  };

  /* Stabil identitet: `SentNote` har den i effekt-avhengighetene sine, og en
     ny funksjon for hver render ville startet animasjonen på nytt midtveis. */
  const onSentDone = useCallback(() => setSent(null), []);

  return (
    <main className="edit">
      <StickyBoard />

      {/* Merkelappen i linja sier at dette er en demo — se BoardNav. */}
      <BoardNav onAbout={() => setAboutOpen(true)} demo />

      {/* Panelet blir stående montert når det er skjult, så teksten man holder
          på med ikke går tapt av å lukke det. `inert` tar det ut av
          tabrekkefølgen mens det ligger utenfor kanten. */}
      <div className={`panel${panelOpen ? " is-open" : ""}`} inert={!panelOpen}>
        <Questionnaire onPublished={onPublished} onCollapse={() => setPanelOpen(false)} />
      </div>

      {!panelOpen && (
        <button className="panel-reopen" onClick={() => setPanelOpen(true)}>
          <span className="panel-reopen-icon" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          Meld inn en utfordring
        </button>
      )}

      {sent && (
        <SentNote
          submission={sent.submission}
          from={sent.from}
          onDone={onSentDone}
        />
      )}

      {justSent && (
        <p className="toast" role="status">
          Takk — utfordringen er sendt til Koblingspunkt.
        </p>
      )}

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
