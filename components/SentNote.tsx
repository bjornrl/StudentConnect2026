"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { noteStyle } from "@/lib/notes";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Lappen som sendes av gårde.

   Den som melder inn skal se at det de skrev faktisk gikk et sted. Men det de
   skriver havner IKKE på tavla — lappene der er eksempler — så den kan ikke
   lande. Derfor løfter den seg ut av feltet, får farge, driver opp og bort og
   toner ut. Bevegelsen sier «sendt», ikke «hengt opp».

   Kortet finnes bare mens animasjonen går. Det er `position: fixed`, tegnes
   over alt annet, og er `aria-hidden` — kvitteringen som betyr noe er teksten
   i toasten, ikke dette.
   ──────────────────────────────────────────────────────────────────────────── */

type Props = {
  submission: PublicSubmission;
  /** Ruta i panelet kortet løfter seg ut av. */
  from: DOMRect;
  /** Kalles når det er ute av bildet, så siden kan kaste det. */
  onDone: () => void;
};

export default function SentNote({ submission, from, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      onDone();
      return;
    }

    /* `onDone` fjerner kortet fra DOM-en. Da må den bare kalles når
       animasjonen faktisk kom til veis ende — ikke når den avbrytes. React
       kjører effekter to ganger i dev, og en avbrutt animasjon som meldte seg
       ferdig ville revet kortet vekk før det rakk å bevege seg. */
    let cancelled = false;
    const whenDone = (animation: Animation) => {
      animation.finished.then(() => !cancelled && onDone()).catch(() => {});
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420 });
      whenDone(fade);
      return () => {
        cancelled = true;
        fade.cancel();
      };
    }

    const style = noteStyle(submission, from.width);

    /* Fargen kommer først et stykke ut i bevegelsen. Da leser den som at
       tanken blir til en lapp — ikke som at en ferdig lapp flytter seg. */
    const animation = el.animate(
      [
        {
          transform: "translate(0px, 0px) scale(1) rotate(0deg)",
          backgroundColor: "#fefefe",
          color: "#101110",
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate(18px, -34px) scale(1.02) rotate(${style.tilt}deg)`,
          backgroundColor: style.color.bg,
          color: style.color.ink,
          opacity: 1,
          offset: 0.34,
        },
        /* Kortet skal rekke å BLI en lapp før det forsvinner. Uten dette
           stoppet begynner uttoningen i det fargen lander, og man ser aldri
           helt hva det var som ble sendt. */
        {
          opacity: 1,
          offset: 0.62,
        },
        {
          transform: `translate(76px, -210px) scale(0.9) rotate(${(style.tilt * 1.8).toFixed(2)}deg)`,
          backgroundColor: style.color.bg,
          color: style.color.ink,
          opacity: 0,
          offset: 1,
        },
      ],
      /* Rolig med vilje. Kortet skal rekke å bli lest som «det jeg skrev ble
         til en lapp, og lappen dro» — går det fortere, ser man bare at noe
         glapp. Kvitteringen i globals.css venter på at denne er ferdig, så
         endres tallet her, må `animation-delay` på `.toast` følge etter. */
      { duration: 1600, easing: "cubic-bezier(0.32, 0, 0.2, 1)" }
    );

    whenDone(animation);
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [submission, from, onDone]);

  return (
    <div
      ref={ref}
      className="note is-sent"
      aria-hidden
      style={
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          minHeight: `${from.height}px`,
          fontSize: "22px",
        } as CSSProperties
      }
    >
      {submission.title && <p className="note-title">{submission.title}</p>}
      <p className="note-quote">{`“${submission.challenge}”`}</p>
    </div>
  );
}
