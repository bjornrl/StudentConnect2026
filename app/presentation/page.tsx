"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import NodeMap from "@/components/NodeMap";
import NodeDetail from "@/components/NodeDetail";
import FilterMenu from "@/components/FilterMenu";
import { useIsMobile } from "@/lib/useMediaQuery";
import { takeJustPublished } from "@/lib/justPublished";
import { hoverVars } from "@/lib/color";
import type { PublicSubmission } from "@/lib/types";
import type { CSSProperties } from "react";

export default function PresentationPage() {
  const isMobile = useIsMobile();

  const [submissions, setSubmissions] = useState<PublicSubmission[]>([]);
  const [selected, setSelected] = useState<PublicSubmission | null>(null);
  const [active, setActive] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  /* Kommer man hit rett fra en publisering på mobil, skal noden peke seg ut og
     kvitteringen vises her — kartet er kvitteringen. Id-en hentes i en ref, så
     vi slipper å sette state før listen faktisk er lastet.
     `undefined` betyr «ikke lest ennå». Det skillet trengs fordi React kjører
     effekter to ganger i dev: takeJustPublished() tømmer lageret, så andre
     runde ville ellers overskrevet id-en med null før første load() rakk å
     bruke den. */
  const justPublishedRef = useRef<string | null | undefined>(undefined);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions", { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json.submissions)) setSubmissions(json.submissions);

      // først når noden finnes i listen har det noe for seg å peke på den
      const id = justPublishedRef.current;
      if (id) {
        justPublishedRef.current = null;
        setHighlightId(id);
        setPublished(true);
      }
    } catch {
      /* behold det vi allerede viser */
    }
  }, []);

  useEffect(() => {
    if (justPublishedRef.current === undefined) {
      justPublishedRef.current = takeJustPublished();
    }
    load();

    // nye innmeldinger fra /edit skal dukke opp på storskjermen av seg selv
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, [load]);

  // pulsen på den nye noden skal ikke bli stående og blinke i all evighet
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 9000);
    return () => clearTimeout(t);
  }, [highlightId]);

  /* Filteret dekker halve skjermen på en telefon, så det starter sammenslått
     der. Justeres under render slik at brukeren fortsatt kan åpne det selv. */
  const [prevMobile, setPrevMobile] = useState(isMobile);
  if (isMobile !== prevMobile) {
    setPrevMobile(isMobile);
    setCollapsed(isMobile);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [dark]);

  const toggle = (key: string) =>
    setActive((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const enterFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <main className="present">
      <div className="present-topbar">
        <div className="present-title">
          <span>Student Connect 2026</span>
          <strong>Oppgavekart</strong>
        </div>
        <div className="present-actions">
          <button onClick={() => setDark((d) => !d)}>{dark ? "Lyst" : "Mørkt"}</button>
          {/* Fullskjerm-API-et finnes ikke på iOS Safari — skjules på mobil i CSS */}
          <button className="present-fullscreen" onClick={enterFullscreen}>
            Fullskjerm
          </button>
          <Link className="present-cta" href="/edit">
            Meld inn
          </Link>
        </div>
      </div>

      <FilterMenu
        submissions={submissions}
        active={active}
        onToggle={toggle}
        onClear={() => {
          setActive([]);
          setQuery("");
        }}
        query={query}
        onQuery={setQuery}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />

      <NodeMap
        submissions={submissions}
        activeIndustries={active}
        query={query}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        highlightId={highlightId}
      />

      <NodeDetail submission={selected} onClose={() => setSelected(null)} />

      {/* skuffen dekker banneret på mobil, så de skal ikke vises samtidig */}
      {published && !selected && (
        <div className="present-published" role="status">
          <div className="present-published-text">
            <strong>Oppgaven er publisert</strong>
            <span>Den ligger i kartet nå — noden som pulserer er deres.</span>
          </div>
          <Link className="btn-primary" href="/edit" style={hoverVars(4) as CSSProperties}>
            Meld inn en ny utfordring
          </Link>
          <button
            className="present-published-close"
            onClick={() => setPublished(false)}
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
