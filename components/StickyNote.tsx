"use client";

import { memo, type CSSProperties, type PointerEvent } from "react";
import { getIndustry } from "@/lib/taxonomy";
import type { NoteStyle } from "@/lib/notes";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Én post-it-lapp.

   Lappen er en flate med en tanke på — ikke et kort med felter. Derfor står
   sitatet størst, tittelen er valgfri og settes i samme størrelse som resten,
   bare i halvfet, og bransjebrikken ligger nederst som en signatur.

   Komponenten er `memo`-et med vilje: mens én lapp dras, oppdateres posisjonen
   mange ganger i sekundet, og da skal ikke de nitti andre tegnes på nytt.
   ──────────────────────────────────────────────────────────────────────────── */

type Props = {
  submission: PublicSubmission;
  style: NoteStyle;
  x: number;
  y: number;
  z: number;
  dragging: boolean;
  onGrab: (event: PointerEvent<HTMLElement>, id: string) => void;
  onMove: (event: PointerEvent<HTMLElement>, id: string) => void;
  onDrop: (event: PointerEvent<HTMLElement>, id: string) => void;
  register: (id: string, el: HTMLElement | null) => void;
};

/**
 * Sitatet skal alltid stå i gåseøyne. Har noen skrevet dem selv — og det gjør
 * folk — skal de ikke bli doble, så vi tar av det ytterste laget først.
 */
function quote(text: string): string {
  const trimmed = text.trim().replace(/^["'“”«»]+/, "").replace(/["'“”«»]+$/, "");
  return `“${trimmed}”`;
}

function StickyNote({
  submission,
  style,
  x,
  y,
  z,
  dragging,
  onGrab,
  onMove,
  onDrop,
  register,
}: Props) {
  /* Bransjen er tatt ut av skjemaet, så nye lapper har ingen. Brikken vises
     bare når raden faktisk har en bransje vi kjenner igjen — eldre
     innmeldinger har det. */
  const industry = getIndustry(submission.industry_key);

  return (
    <article
      ref={(el) => register(submission.id, el)}
      className={`note${dragging ? " is-dragging" : ""}`}
      style={
        {
          "--note-bg": style.color.bg,
          "--note-ink": style.color.ink,
          "--tilt": `${style.tilt}deg`,
          left: `${x}px`,
          top: `${y}px`,
          zIndex: z,
          width: `${style.width}px`,
          minHeight: `${style.height}px`,
          fontSize: `${style.fontSize}px`,
        } as CSSProperties
      }
      onPointerDown={(e) => onGrab(e, submission.id)}
      onPointerMove={(e) => onMove(e, submission.id)}
      onPointerUp={(e) => onDrop(e, submission.id)}
      onPointerCancel={(e) => onDrop(e, submission.id)}
    >
      {/* Tittelen er valgfri. Den står i samme grad som sitatet — bare halvfet
          — slik at den leses som en overskrift uten å bli et eget nivå. */}
      {submission.title && <p className="note-title">{submission.title}</p>}

      <p className="note-quote">{quote(submission.challenge)}</p>

      {industry && <span className="note-tag">{industry.label}</span>}
    </article>
  );
}

export default memo(StickyNote);
