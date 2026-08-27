"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { INDUSTRIES, LEVELS, OTHER_KEY } from "@/lib/taxonomy";
import { contrastingInk } from "@/lib/color";
import { PARTNERS, type Partner } from "@/lib/partners";
import type { PublicSubmission } from "@/lib/types";

const OSLO_LOGO_SRC = "/logos/oslo-kommune.png";
const osloPartner = PARTNERS.find((p) => p.src === OSLO_LOGO_SRC);

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <Image
      src={partner.src}
      alt={partner.alt}
      width={partner.width}
      height={partner.height}
      style={{ height: partner.displayHeight }}
    />
  );
}

type Props = {
  onPublished: (submission: PublicSubmission) => void;
  /** Lar kartet markere bransjen mens man fyller ut. */
  onIndustryPreview?: (industryKey: string | null) => void;
  /**
   * Vis kvitteringen her etter publisering. Sett false når siden selv tar over
   * — på mobil sendes man videre til kartet, som er kvitteringen i seg selv.
   */
  showReceipt?: boolean;
};

/** «bransje, tittel og e-post» */
function joinNo(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} og ${parts[parts.length - 1]}`;
}

export default function Questionnaire({
  onPublished,
  onIndustryPreview,
  showReceipt = true,
}: Props) {
  const [industryKey, setIndustryKey] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [challenge, setChallenge] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = (keepCompany = true) => {
    setIndustryKey(null);
    setTitle("");
    setChallenge("");
    setLevels([]);
    if (!keepCompany) {
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    }
    setDone(false);
    setError(null);
    onIndustryPreview?.(null);
  };

  const toggleLevel = (key: string) =>
    setLevels((prev) => (prev.includes(key) ? prev.filter((l) => l !== key) : [...prev, key]));

  /* Alt står framme samtidig, så i stedet for å sperre veien videre sier vi
     rett ut hva som mangler før man kan publisere. */
  const missing: string[] = [];
  if (title.trim().length < 3) missing.push("tittel");
  if (challenge.trim().length < 10) missing.push("beskrivelse av utfordringen");
  if (companyName.trim().length < 2) missing.push("bedrift");
  if (!contactEmail.trim().includes("@")) missing.push("e-post");
  if (!industryKey) missing.push("bransje");
  const canSubmit = missing.length === 0;

  /* Hele lista blir tre linjer grå tekst over knappen på en telefon. To navn
     og et antall sier like mye, og holder seg på én linje. */
  const hint = canSubmit
    ? "Klar til å publiseres."
    : missing.length <= 2
      ? `Mangler ${joinNo(missing)}.`
      : `Mangler ${missing.slice(0, 2).join(", ")} og ${missing.length - 2} felt til.`;

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry_key: industryKey,
          /* Ansvarsområdet er tatt ut av skjemaet, men kolonnen i basen er
             fortsatt `not null`. «annet» uten fritekst er sentinelen for «ikke
             oppgitt» — den finnes fra før og slipper gjennom valideringen. */
          subarea_key: OTHER_KEY,
          subarea_other: null,
          title: title.trim(),
          challenge: challenge.trim(),
          levels,
          company_name: companyName.trim(),
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Noe gikk galt.");
      onPublished(json.submission as PublicSubmission);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  /* ── kvittering ─────────────────────────────────────────────────────────── */
  if (done && showReceipt) {
    return (
      <div className="q-done">
        <div className="q-done-mark" aria-hidden>
          ✓
        </div>
        <h2>Oppgaven er publisert</h2>
        <p>
          Den ligger nå som en node i kartet ved siden av. Kontaktinformasjonen deres vises ikke
          offentlig — studenter må be om den gjennom oss.
        </p>
        <div className="q-done-actions">
          <button className="btn-primary" onClick={() => reset(true)}>
            Legg inn en oppgave til
          </button>
          <button className="btn-ghost" onClick={() => reset(false)}>
            Ny bedrift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="q">
      <form
        className="q-body"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !saving) submit();
        }}
      >
        {/* ── hva er dette ───────────────────────────────────────────────── */}
        <section className="q-intro">
          <p>
            Student Connect 2026 kobler bedrifter med studenter som leter etter noe å skrive om.
            Meld inn en utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om — så
            blir det en node i et felles kart, gruppert etter bransje og koblet til andre som jobber
            med det samme.
          </p>
          <p>
            Studenter som finner noe de vil ta tak i, sender en forespørsel gjennom oss.
            Kontaktinformasjonen deres vises aldri offentlig i kartet.
          </p>

          <span className="q-intro-label">Samarbeidspartnere</span>
          <div className="q-intro-logos">
            {PARTNERS.filter((p) => p.src !== OSLO_LOGO_SRC).map((p) => (
              <PartnerLogo key={p.src} partner={p} />
            ))}
          </div>
          {osloPartner && (
            <>
              <span className="q-intro-label">i samarbeid med</span>
              <div className="q-intro-logos">
                <PartnerLogo partner={osloPartner} />
              </div>
            </>
          )}
        </section>

        {/* ── 1. utfordringen ─────────────────────────────────────────────── */}
        <section className="q-section bg-accent-blue">

          <div className="q-section-head">
            <h1>Hva vil dere utforske?</h1>
          </div>

          <p className="q-lead">
            En utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om. Det trenger
            ikke være ferdig formulert som en oppgave.
          </p>

          {/* <label className="q-label" htmlFor="title">
            Kort tittel
          </label> */}
          <input
            id="title"
            className="q-input"
            style={{ fontWeight: "bold", marginBottom: "1.5rem" }}
            placeholder="Overskrift. F.eks: Ombruk av stål i rehabiliteringsprosjekter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          {/* <span className="q-counter">{title.length}/120</span> */}

          {/* <label className="q-label" htmlFor="challenge">
            Beskriv utfordringen
          </label> */}
          <textarea
            id="challenge"
            className="q-textarea"
            style={{ fontWeight: "bold", marginBottom: "1.5rem" }}
            rows={7}
            placeholder="Hva er problemet, hvorfor er det interessant, og hva slags svar hadde vært nyttig for dere?"
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            maxLength={4000}
          />
          {/* <span className="q-counter">{challenge.length}/4000</span> */}



          <label className="q-label">Dette kan være en:</label>
          <div className="q-chips">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                type="button"
                className={`q-chip ${levels.includes(l.key) ? "is-on" : ""}`}
                onClick={() => toggleLevel(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 2. kontakt ──────────────────────────────────────────────────── */}
        <section className="q-section bg-accent-red">
          <div className="q-section-head">
            <h2>Hvem er dere?</h2>
          </div>
          <p className="q-lead q-lead-note">
            Dette vises <strong>ikke</strong> i kartet. Studenter som vil ta kontakt sender en
            forespørsel, og vi formidler den videre til dere.
          </p>

          <label className="q-label" htmlFor="company">
            Bedrift
          </label>
          <input
            id="company"
            className="q-input"
            placeholder="Bedriftens navn"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <label className="q-label" htmlFor="cname">
            Kontaktperson
          </label>
          <input
            id="cname"
            className="q-input"
            placeholder="Navn"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />

          <div className="q-row">
            <div>
              <label className="q-label" htmlFor="cmail">
                E-post
              </label>
              <input
                id="cmail"
                className="q-input"
                type="email"
                placeholder="navn@bedrift.no"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="q-label" htmlFor="cphone">
                Telefon <span className="q-optional">(valgfritt)</span>
              </label>
              <input
                id="cphone"
                className="q-input"
                placeholder="+47"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="q-error">{error}</p>}
        </section>

        {/* ── 3. bransje ──────────────────────────────────────────────────── */}
        <section className="q-section bg-accent-green">
          <div className="q-section-head">
            <h2>Hvilken bransje jobber dere innenfor?</h2>
          </div>
          <p className="q-lead">Velg den som passer best. Den bestemmer hvor i kartet dere havner.</p>
          <div className="q-chips">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.key}
                type="button"
                className={`q-chip ${industryKey === ind.key ? "is-on" : ""}`}
                style={
                  {
                    ["--opt-color"]: ind.color,
                    ["--opt-ink"]: contrastingInk(ind.color),
                  } as CSSProperties
                }
                onMouseEnter={() => onIndustryPreview?.(ind.key)}
                onMouseLeave={() => onIndustryPreview?.(industryKey)}
                onClick={() => {
                  setIndustryKey(ind.key);
                  onIndustryPreview?.(ind.key);
                }}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </section>

        {/* Enter i et tekstfelt skal sende inn — knappen under gjør det samme. */}
        <button type="submit" className="q-submit-hidden" tabIndex={-1} aria-hidden disabled={!canSubmit} />
      </form>

      <div className="q-nav">
        <p className="q-nav-hint" aria-live="polite">
          {hint}
        </p>
        <button
          type="button"
          className="btn-primary"
          disabled={!canSubmit || saving}
          onClick={submit}
        >
          {saving ? "Publiserer…" : "Publiser oppgaven"}
        </button>
      </div>
    </div>
  );
}
