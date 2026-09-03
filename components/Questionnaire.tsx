"use client";

import { useRef, useState } from "react";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Panelet.

   Det er ikke lenger en halv skjerm, men en rute som ligger OPPÅ tavla og kan
   slås av. Da må det være kort: én tanke er alt vi ber om.

   Hierarkiet i ruta går merkelapp → spørsmål → forklaring → felt → handling,
   og luften mellom trinnene er ujevn med vilje. Tittelfeltet ligger tett på
   utfordringsfeltet fordi de hører sammen; publiseringslinja har tydelig mer
   luft over seg fordi den er et annet slags trinn.

   Bare spørsmålet om utfordringen står igjen. «Hvem er dere», bransje og nivå
   er kommentert ut lenger nede — de skal tilbake, og da er det lettere å ha
   dem stående enn å skrive dem på nytt.
   ──────────────────────────────────────────────────────────────────────────── */

type Props = {
  /**
   * Kalles når lappen er lagret. `from` er ruta i panelet lappen skal fly ut
   * fra — det er den som gjør overgangen fra skjema til tavle sammenhengende.
   */
  onPublished: (submission: PublicSubmission, from: DOMRect) => void;
  /** Hamburgeren slår panelet av. */
  onCollapse: () => void;
};

/** Kortere enn dette er ikke en tanke, det er en tastefeil. */
const MIN_CHALLENGE = 10;

export default function Questionnaire({ onPublished, onCollapse }: Props) {
  const [title, setTitle] = useState("");
  const [challenge, setChallenge] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Lappen flyr ut fra selve utfordringsfeltet. Det er der teksten sto, så det
     er derfra bevegelsen leses som «det jeg skrev ble til den lappen». */
  const flightRef = useRef<HTMLDivElement>(null);

  const canSubmit = challenge.trim().length >= MIN_CHALLENGE;

  async function submit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), challenge: challenge.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Noe gikk galt.");

      const from = flightRef.current?.getBoundingClientRect();
      onPublished(json.submission, from ?? new DOMRect(0, 0, 300, 200));

      setTitle("");
      setChallenge("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  /* Kvitteringen etter publisering ligger på siden, ikke her: panelet trekker
     seg unna i det lappen flyr ut, så en melding i denne linja ville forsvunnet
     samtidig med at den kom. */
  const hint = error
    ? error
    : canSubmit
      ? "Klar til å henges opp."
      : "Skriv utfordringen for å publisere.";

  return (
    <form
      className="panel-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <header className="panel-head">
        <div className="panel-head-row">
          <span className="panel-badge">Student Connect 2026</span>
          <button
            type="button"
            className="panel-toggle"
            onClick={onCollapse}
            aria-label="Skjul panelet"
          >
            <span aria-hidden />
            <span aria-hidden />
            <span aria-hidden />
          </button>
        </div>

        <h1 className="panel-title">Hva vil dere utforske?</h1>
        <p className="panel-lead">
          En utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om. Det henges opp
          som en lapp på tavla, og studenter kan ta tak i den.
        </p>
      </header>

      <div className="field">
        <label className="field-label" htmlFor="title">
          Kort tittel <span className="field-optional">— valgfritt</span>
        </label>
        <input
          id="title"
          className="field-input"
          placeholder="Ombruk av stål i rehabiliteringsprosjekter"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="field" ref={flightRef}>
        <label className="field-label" htmlFor="challenge">
          Beskriv utfordringen
        </label>
        <textarea
          id="challenge"
          className="field-input field-textarea"
          placeholder="Hva er problemet, hvorfor er det interessant, og hva slags svar hadde vært nyttig for dere?"
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          maxLength={4000}
        />
      </div>

      {/* ── Kommentert ut inntil videre ────────────────────────────────────────
          «Hvem er dere» (bedrift, kontaktperson, e-post, telefon), bransjevalget
          og nivåene («Dette kan være en bacheloroppgave …»). De skal tilbake når
          tavla skal koble lapper til bedrifter igjen — API-et lagrer allerede
          feltene som «ikke oppgitt» så lenge de står stille her.

          <section className="panel-section">
            <h2 className="panel-subtitle">Hvem er dere?</h2>
            <div className="field"> … bedrift … </div>
            <div className="field"> … kontaktperson … </div>
            <div className="field"> … e-post … </div>
            <div className="field"> … telefon … </div>
          </section>

          <section className="panel-section">
            <h2 className="panel-subtitle">Hvilken bransje jobber dere innenfor?</h2>
            <div className="chip-row"> … INDUSTRIES … </div>
          </section>

          <section className="panel-section">
            <h2 className="panel-subtitle">Dette kan være en</h2>
            <div className="chip-row"> … LEVELS … </div>
          </section>
      ─────────────────────────────────────────────────────────────────────── */}

      <div className={`publish${error ? " is-error" : ""}`}>
        <p className="publish-hint" aria-live="polite">
          {hint}
        </p>
        <button className="publish-btn" type="submit" disabled={!canSubmit || saving}>
          {saving ? "Publiserer…" : "Publiser oppgaven"}
        </button>
      </div>
    </form>
  );
}
