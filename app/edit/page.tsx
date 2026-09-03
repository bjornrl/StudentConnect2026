"use client";

import { useCallback, useEffect, useState } from "react";
import StickyBoard, { type Arrival } from "@/components/StickyBoard";
import Questionnaire from "@/components/Questionnaire";
import BoardNav from "@/components/BoardNav";
import AboutDialog from "@/components/AboutDialog";
import { useIsMobile } from "@/lib/useMediaQuery";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Tavla — hele siden.

   Skjermen er ikke lenger delt i to. Den ER kanvaset: lappene ligger fritt
   utover hele flaten, og panelet med skjemaet svever oppå og kan slås av.
   Da får man både lest tavla og skrevet på den uten å bytte side, og
   /presentation trengs ikke lenger.

   Publiseringen er ett sammenhengende sveip: panelet trekker seg unna i det
   lappen flyr ut av feltet man skrev i, får farge underveis og lander på
   tavla. Derfor eier siden både panelets av/på og innflygingen — de to må
   skje i takt.
   ──────────────────────────────────────────────────────────────────────────── */

export default function EditPage() {
  const isMobile = useIsMobile();

  const [submissions, setSubmissions] = useState<PublicSubmission[]>([]);
  const [arrival, setArrival] = useState<Arrival | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions", { cache: "no-store" });
      const json = await res.json();
      if (!Array.isArray(json.submissions)) return;

      setSubmissions((prev) => {
        const server = json.submissions as PublicSubmission[];
        /* En lapp vi nettopp har publisert kan ligge her før basen rekker å
           svare med den. Da skal den bli stående — ellers ville den blinket
           bort og kommet tilbake. */
        const seen = new Set(server.map((s) => s.id));
        return [...server, ...prev.filter((s) => !seen.has(s.id))];
      });
    } catch {
      /* behold det vi allerede viser */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    /* `load` er async — den setter ingen state før nettverket har svart, så
       den kaskaderende rendringen regelen advarer mot kan ikke oppstå her.
       Regelen ser bare at en funksjon som kaller setState kalles i kroppen. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // andre kan henge opp lapper samtidig — hent inn nye jevnlig
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, [load]);

  /* Panelet dekker halve skjermen på en telefon, så der starter tavla åpen.
     Justeres under render slik at brukeren fortsatt kan åpne panelet selv. */
  const [prevMobile, setPrevMobile] = useState(isMobile);
  if (isMobile !== prevMobile) {
    setPrevMobile(isMobile);
    setPanelOpen(!isMobile);
  }

  // kvitteringen skal si fra og så gi seg
  useEffect(() => {
    if (!justPublished) return;
    const t = setTimeout(() => setJustPublished(false), 6000);
    return () => clearTimeout(t);
  }, [justPublished]);

  const onArrived = useCallback(() => setArrival(null), []);

  const onPublished = (submission: PublicSubmission, from: DOMRect) => {
    setSubmissions((prev) =>
      prev.some((s) => s.id === submission.id) ? prev : [...prev, submission]
    );
    /* Panelet må vekk før lappen lander — ellers lander den bak panelet, og
       hele poenget med bevegelsen er at man ser hvor tanken tok veien. */
    setPanelOpen(false);
    setArrival({ id: submission.id, from });
    setJustPublished(true);
  };

  return (
    <main className="edit">
      <StickyBoard
        submissions={submissions}
        arrival={arrival}
        onArrived={onArrived}
        loaded={loaded}
      />

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

      {justPublished && (
        <p className="toast" role="status">
          Lappen er hengt opp på tavla.
        </p>
      )}

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
