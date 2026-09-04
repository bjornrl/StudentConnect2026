"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { PARTNERS } from "@/lib/partners";

/* ─────────────────────────────────────────────────────────────────────────────
   «Om oss».

   Forsiden forteller hva dette er; her ligger resten — hva Koblingspunkt gjør
   med det man melder inn, og hvem vi gjør det sammen med. Ett klikk unna, og
   uten å stå i veien.

   Ruta er formet som en av lappene på tavla: samme rosa fra paletten, samme
   24 px hjørner, en anelse på skakke, og merkelappen øverst er den samme
   svarte brikka som signerer lappene. Da leser den som noe som hører hjemme
   på tavla i stedet for som et systemvindu lagt oppå den. Helningen er
   mindre enn på lappene med vilje — fire grader på en liten lapp er sjarm,
   fire grader på et helt tekstavsnitt er slitsomt å lese.

   Partnerlogoene står på en hvit stripe inni. De er tegnet for lys bakgrunn,
   og flere av dem har sin egen flate — rett på rosa hadde de blitt grå
   firkanter.

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
      /* Klikk utenfor lappen lukker. Selve <dialog> fyller skjermen, så et
         treff på den og ikke på innholdet betyr «ved siden av». */
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="about-card">
        {/* Utenfor scrollflaten, så den blir stående når teksten rulles. */}
        <button className="about-close" onClick={onClose} aria-label="Lukk">
          ✕
        </button>

        <div className="about-scroll">
          <p className="about-eyebrow">Student Connect 2026</p>
          <h2 className="about-title">Koblingspunkt</h2>

          <p className="about-lead">
            Vi inviterer bedrifter i Oslo til å melde inn temaer de gjerne vil vite mer om, eller
            utfordringer de vil ha løst. Lappene på tavla er eksempler på hva en utfordring kan
            være.
          </p>
          <p className="about-body">
            Koblingspunkt matcher utfordringene med studenter og studentteam. De kan skape nye
            løsninger, gi nye perspektiver og energi inn i innovasjonsarbeidet deres. Det er
            uforpliktende å melde inn, og det dere sender inn er kun tilgjengelig for oss.
          </p>

          <div className="about-more">
            <p className="about-more-label">Les mer om prosjektet her:</p>
            <a
              className="about-more-btn"
              href="https://www.punktoslo.no/artikler/koblingspunkt-oslo-kobler-studentene-og-naeringslivet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Les mer
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="about-partners">
            <p className="about-partners-label">I samarbeid med</p>
            <div className="about-logos">
              {PARTNERS.map((p) => (
                <a
                  key={p.src}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    style={{ height: p.displayHeight, width: "auto" }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
