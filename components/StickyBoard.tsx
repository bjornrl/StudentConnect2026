"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import StickyNote from "./StickyNote";
import { noteStyle, scatter, type Placement } from "@/lib/notes";
import { EXAMPLE_NOTES } from "@/lib/examples";

/* ─────────────────────────────────────────────────────────────────────────────
   Tavla.

   Hele skjermen er kanvas. Lappene ligger fritt plassert oppå den, kan dras
   rundt og legge seg oppå hverandre — panelet med skjemaet svever over igjen.

   Lappene er EKSEMPLER, hentet fra lib/examples.ts. Ingenting av det som
   meldes inn i skjemaet havner her: innmeldingene går rett til Koblingspunkt
   og vises ikke på tavla i det hele tatt. Derfor henter denne komponenten
   ingenting fra basen — det er dét som gjør skillet umulig å rote til.

   Startposisjonene kommer fra `scatter()` i lib/notes.ts. Drar man en lapp,
   legges den nye posisjonen i `moved` og overstyrer utlegget fra da av; resten
   av veggen står i ro. Det er derfor utlegget kan regnes om fritt når vinduet
   endrer størrelse uten at det river vekk lapper folk har flyttet.

   At lappene er eksempler står nå i selve tavla og ikke bare i en kommentar:
   de ligger avslått i gråtoner, og den man peker på får farge samtidig som
   pekeren sier hva den er. Se `.board .note` og `.board-hint` i globals.css.
   ──────────────────────────────────────────────────────────────────────────── */

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

/** Det pekeren sier når den ligger på en lapp. */
const HINT = "Forslag fra oss — ikke en ekte innmelding";

export default function StickyBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const [moved, setMoved] = useState<Record<string, Placement>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [zOf, setZOf] = useState<Record<string, number>>({});

  const drag = useRef<Drag | null>(null);
  const zTop = useRef(EXAMPLE_NOTES.length + 1);

  /* Før flaten er målt gjetter vi på en vanlig skjermbredde. Utseendet er rent
     avledet av lappene og bredden, og posisjonene av utseendet — så begge kan
     regnes ut på nytt uten at noe går tapt. */
  const canvasWidth = width || 1200;

  const styled = useMemo(
    () =>
      EXAMPLE_NOTES.map((note) => ({
        id: note.id,
        note,
        // 48 px er luften på hver side, så lappen aldri stikker ut av flaten
        style: noteStyle(note, canvasWidth - 48),
      })),
    [canvasWidth]
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
  useLayoutEffect(() => {
    movedRef.current = moved;
    placementsRef.current = placements;
  }, [moved, placements]);

  /* ── pekeren som forklarer lappene ──────────────────────────────────────
     Merkelappen følger musa utenom React: `--x`/`--y` skrives rett på
     elementet. Gikk posisjonen gjennom state, ville hver piksel musa flytter
     seg tegnet hele tavla på nytt.

     Bare mus. En finger har ingen peker å henge en forklaring på, og på
     berøring finnes det ikke noe «over lappen» — der er lappen enten tatt i
     eller ikke. */
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    const hint = hintRef.current;
    if (!board || !hint) return;

    const follow = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const onNote = (event.target as Element | null)?.closest?.(".note") != null;
      hint.classList.toggle("is-on", onNote);
      if (!onNote) return;
      hint.style.setProperty("--x", `${event.clientX}px`);
      hint.style.setProperty("--y", `${event.clientY}px`);
    };

    const leave = () => hint.classList.remove("is-on");

    board.addEventListener("pointermove", follow);
    board.addEventListener("pointerleave", leave);
    return () => {
      board.removeEventListener("pointermove", follow);
      board.removeEventListener("pointerleave", leave);
    };
  }, []);

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

  return (
    /* Merkelappen ligger UTENFOR `.board`. Tavla har `z-index: 0` og lager
       dermed et eget stablingslag; alt inni det ligger under panelet, uansett
       hvilket tall man gir det. Som søsken kan den legge seg over — og det må
       den: en peker som forsvinner under panelet i det man nærmer seg det, er
       verre enn ingen peker. */
    <>
      <div className="board" ref={boardRef}>
        <div className="board-canvas" style={{ height: `${height}px` }}>
          {styled.map(({ id, note, style }, i) => {
            const at = moved[id] ?? placements.get(id) ?? { x: 0, y: 0 };
            return (
              <StickyNote
                key={id}
                submission={note}
                style={style}
                x={at.x}
                y={at.y}
                z={zOf[id] ?? i + 1}
                dragging={draggingId === id}
                onGrab={onGrab}
                onMove={onMove}
                onDrop={onDrop}
              />
            );
          })}
        </div>
      </div>

      {/* `aria-hidden`: den samme opplysningen står allerede i panelet
          («Lappene rundt er eksempler»), og en merkelapp som følger musa har
          ingenting å si til en skjermleser. */}
      <div className="board-hint" ref={hintRef} aria-hidden>
        {HINT}
      </div>
    </>
  );
}
