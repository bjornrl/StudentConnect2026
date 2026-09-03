"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import StickyNote from "./StickyNote";
import { noteStyle, scatter, type Placement } from "@/lib/notes";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Tavla.

   Hele skjermen er kanvas. Lappene ligger fritt plassert oppå den, kan dras
   rundt og legge seg oppå hverandre — panelet med skjemaet svever over igjen.

   Startposisjonene kommer fra `scatter()` i lib/notes.ts. Drar man en lapp,
   legges den nye posisjonen i `moved` og overstyrer utlegget fra da av; resten
   av veggen står i ro. Det er derfor utlegget regnes om fritt når vinduet
   endrer størrelse uten at det river vekk lapper folk har flyttet.
   ──────────────────────────────────────────────────────────────────────────── */

/** Lappen som nettopp ble publisert, og ruta i panelet den skal fly ut fra. */
export type Arrival = { id: string; from: DOMRect };

type Props = {
  submissions: PublicSubmission[];
  arrival: Arrival | null;
  /** Kalles når innflygingen er ferdig, så siden kan glemme den. */
  onArrived: () => void;
  /**
   * Sant først når vi har hørt fra basen. Tom tavle og tavle-vi-ikke-har-lest
   * ser like ut, og «Tavla er tom» skal ikke stå der i det halvsekundet
   * lappene er på vei inn.
   */
  loaded: boolean;
};

type Drag = {
  id: string;
  pointerId: number;
  /** Der fingeren var da vi tok tak. */
  fromX: number;
  fromY: number;
  /** Der lappen lå da vi tok tak. */
  originX: number;
  originY: number;
  /** Blir sann først når fingeren har flyttet seg nok til at det er et dra. */
  active: boolean;
};

/** Under dette regnes bevegelsen som skjelving, ikke som et dra. */
const DRAG_SLOP = 3;

export default function StickyBoard({ submissions, arrival, onArrived, loaded }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const [moved, setMoved] = useState<Record<string, Placement>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [zOf, setZOf] = useState<Record<string, number>>({});

  const drag = useRef<Drag | null>(null);
  const zTop = useRef(0);

  /* Før flaten er målt gjetter vi på en vanlig skjermbredde. Utseendet er rent
     avledet av innmeldingene og bredden, og posisjonene av utseendet — så
     begge kan regnes ut på nytt uten at noe går tapt. */
  const canvasWidth = width || 1200;

  const styled = useMemo(
    () =>
      submissions.map((s) => ({
        id: s.id,
        submission: s,
        // 48 px er luften på hver side, så lappen aldri stikker ut av flaten
        style: noteStyle(s, canvasWidth - 48),
      })),
    [submissions, canvasWidth]
  );

  const { placements, height } = useMemo(
    () => scatter(styled, canvasWidth),
    [styled, canvasWidth]
  );

  /* Håndtakene under må ha stabil identitet — ellers tegnes hver eneste lapp
     på nytt for hver piksel man drar. Derfor leser de posisjonene gjennom
     refs i stedet for gjennom lukkinger over state. */
  const movedRef = useRef(moved);
  const placementsRef = useRef(placements);
  /* Innflygingen leser utseendet gjennom en ref og ikke direkte: kommer det
     inn nye lapper fra pollingen mens animasjonen går, skal den ikke starte
     på nytt midt i luften. */
  const styledRef = useRef(styled);
  useLayoutEffect(() => {
    movedRef.current = moved;
    placementsRef.current = placements;
    styledRef.current = styled;
  }, [moved, placements, styled]);

  /* Bredden på flaten styrer hvor mange kolonner utlegget får. */
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── dra ────────────────────────────────────────────────────────────────── */

  const onGrab = useCallback((event: PointerEvent<HTMLElement>, id: string) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    /* Vi leser posisjonen fra utlegget, ikke fra getBoundingClientRect():
       lappen er rotert, og da er den omsluttende ruta både større enn lappen
       og forskjøvet — lappen ville hoppet i det man tok tak i den. */
    const start = movedRef.current[id] ?? placementsRef.current.get(id) ?? { x: 0, y: 0 };

    drag.current = {
      id,
      pointerId: event.pointerId,
      fromX: event.clientX,
      fromY: event.clientY,
      originX: start.x,
      originY: start.y,
      active: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);

    // den man tar i, legger seg øverst i bunken
    zTop.current += 1;
    const z = zTop.current;
    setZOf((prev) => ({ ...prev, [id]: z }));
  }, []);

  const onMove = useCallback((event: PointerEvent<HTMLElement>, id: string) => {
    const d = drag.current;
    if (!d || d.id !== id || d.pointerId !== event.pointerId) return;

    const dx = event.clientX - d.fromX;
    const dy = event.clientY - d.fromY;

    /* Et klikk er ikke et dra. Løftet skal ikke slå inn før fingeren faktisk
       har beveget seg. */
    if (!d.active) {
      if (Math.hypot(dx, dy) < DRAG_SLOP) return;
      d.active = true;
      setDraggingId(id);
    }

    setMoved((prev) => ({ ...prev, [id]: { x: d.originX + dx, y: d.originY + dy } }));
  }, []);

  const onDrop = useCallback((event: PointerEvent<HTMLElement>, id: string) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    if (event.currentTarget.hasPointerCapture(d.pointerId)) {
      event.currentTarget.releasePointerCapture(d.pointerId);
    }
    drag.current = null;
    setDraggingId(null);
  }, []);

  /* ── innflyging etter publisering ───────────────────────────────────────── */

  const noteEls = useRef(new Map<string, HTMLElement>());
  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) noteEls.current.set(id, el);
    else noteEls.current.delete(id);
  }, []);

  useLayoutEffect(() => {
    if (!arrival) return;
    const el = noteEls.current.get(arrival.id);
    const board = boardRef.current;
    if (!el || !board) {
      onArrived();
      return;
    }

    /* Lappen skal være i syne før den flyr — ellers lander den utenfor
       skjermen. `center` og ikke `nearest`: landingen skal skje midt i bildet,
       ikke klistret til kanten. */
    el.scrollIntoView({ block: "center", inline: "nearest" });

    const style = styledRef.current.find((n) => n.id === arrival.id)?.style;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!style || reduce) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 }).finished
        .catch(() => {})
        .finally(onArrived);
      return;
    }

    /* FLIP: lappen står allerede på sin endelige plass, så vi regner ut hvor
       den MÅTTE stått for å dekke feltet i panelet, spiller av derfra og
       tilbake. Fargen kommer først halvveis — da leser overgangen som at
       tanken blir til en lapp, ikke som at en ferdig lapp flytter seg. */
    const to = el.getBoundingClientRect();
    const from = arrival.from;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const scale = Math.max(0.2, from.width / Math.max(1, to.width));

    const animation = el.animate(
      [
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(0deg)`,
          backgroundColor: "#fefefe",
          color: "#101110",
          boxShadow: "0 0 0 0 rgba(16,17,16,0)",
          offset: 0,
        },
        {
          backgroundColor: style.color.bg,
          color: style.color.ink,
          offset: 0.45,
        },
        {
          transform: `translate(0px, 0px) scale(1.05) rotate(${(style.tilt * 1.6).toFixed(2)}deg)`,
          offset: 0.74,
        },
        {
          transform: `translate(0px, 0px) scale(1) rotate(${style.tilt}deg)`,
          backgroundColor: style.color.bg,
          color: style.color.ink,
          offset: 1,
        },
      ],
      { duration: 820, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );

    animation.finished.catch(() => {}).finally(onArrived);
    return () => animation.cancel();
  }, [arrival, onArrived]);

  /* Nye lapper skal legge seg over de gamle uten at vi må telle dem: z-en
     følger rekkefølgen i lista, og dratte lapper får et tall over hele bunken. */
  useLayoutEffect(() => {
    zTop.current = Math.max(zTop.current, submissions.length + 1);
  }, [submissions.length]);

  return (
    <div className="board" ref={boardRef}>
      <div className="board-canvas" style={{ height: `${height}px` }}>
        {styled.map(({ id, submission, style }, i) => {
          const at = moved[id] ?? placements.get(id) ?? { x: 0, y: 0 };
          return (
            <StickyNote
              key={id}
              submission={submission}
              style={style}
              x={at.x}
              y={at.y}
              z={zOf[id] ?? i + 1}
              dragging={draggingId === id}
              onGrab={onGrab}
              onMove={onMove}
              onDrop={onDrop}
              register={register}
            />
          );
        })}
      </div>

      {loaded && submissions.length === 0 && (
        <p className="board-empty">Tavla er tom. Den første tanken kan bli deres.</p>
      )}
    </div>
  );
}
