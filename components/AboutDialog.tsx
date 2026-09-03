"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { PARTNERS } from "@/lib/partners";

/* ─────────────────────────────────────────────────────────────────────────────
   «Om oss».

   Forsiden er borte — tavla er forsiden. Det som sto der og fortsatt må sies
   (hva Koblingspunkt er, hva som skjer med det man melder inn, og hvem vi gjør
   det sammen med) ligger her i stedet, ett klikk unna og uten å stå i veien.

   Native <dialog> er brukt med vilje: den gir fokusfelle, Escape og
   bakgrunnsblokkering uten at vi må skrive det selv — og gjør det riktigere
   enn en håndlaget variant ville gjort.
   ──────────────────────────────────────────────────────────────────────────── */

type Props = { open: boolean; onClose: () => void };

export default function AboutDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="about"
      onClose={onClose}
      /* Klikk utenfor kortet lukker. Selve <dialog> fyller skjermen, så et
         treff på den og ikke på innholdet betyr «ved siden av». */
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="about-card">
        <button className="about-close" onClick={onClose} aria-label="Lukk">
          ✕
        </button>

        <p className="about-eyebrow">Student Connect 2026</p>
        <h2 className="about-title">Koblingspunkt</h2>

        <p className="about-lead">
          Vi inviterer bedrifter i Oslo til å melde inn temaer de gjerne vil vite mer om, eller
          utfordringer de vil ha løst. Hver innmelding blir en lapp på tavla.
        </p>
        <p className="about-body">
          Koblingspunkt matcher utfordringene med studenter og studentteam. De kan skape nye
          løsninger, gi nye perspektiver og energi inn i innovasjonsarbeidet deres. Det er
          uforpliktende å registrere, og ved å registrere godkjenner dere at vi kan ta kontakt for
          å bidra med studenter som kan løse utfordringen.
        </p>

        <div className="about-partners">
          <p className="about-partners-label">I samarbeid med</p>
          <div className="about-logos">
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
        </div>
      </div>
    </dialog>
  );
}
