"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { INDUSTRIES, LEVELS, OTHER_KEY } from "@/lib/taxonomy";
import { contrastingInk, hoverVars } from "@/lib/color";
import { PARTNERS, type Partner } from "@/lib/partners";
import type { PublicSubmission } from "@/lib/types";

const OSLO_LOGO_SRC = "/logos/oslo-kommune.png";
const osloPartner = PARTNERS.find((p) => p.src === OSLO_LOGO_SRC);

/* ─────────────────────────────────────────────────────────────────────────────
   Figma «Editorial» (node 129:170).

   Målene i designet er px på et 2013 px bredt artboard. De ligger som
   cqi-baserte clamp()-tokens i globals.css (text-display, p-card, gap-stack …)
   og regnes mot skjemaets egen bredde — derfor `@container` på scrollflaten
   under. Skjemaruta er halve skjermen på desktop og hele på mobil, så alt her
   må holde seg innenfor den beholderen: cqi-verdier utenfor `@container` faller
   tilbake på vindusbredden og blir feil.
   ──────────────────────────────────────────────────────────────────────────── */

/** Det hvite kortet. Tre av dem i designet. */
const CARD = "flex w-full flex-col items-start gap-card rounded-card bg-card p-card";

/** Overskriften over hver bolk: «Utfordringen», «Folka», «Bransjen». */
const EYEBROW = "w-full text-eyebrow font-light text-ink/50";
const DISPLAY = "w-full text-display font-light text-ink [overflow-wrap:break-word]";
const LEAD = "m-0 w-full text-lead font-medium text-ink [overflow-wrap:break-word]";

/* Feltene er en strek under teksten, ikke en boks. Selve inputen er usynlig —
   raden rundt den bærer streken, så den ligger i ro når teksten vokser. */
const FIELD_ROW =
  "relative flex w-full items-start border-b-2 border-ink/25 py-field " +
  "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 " +
  "after:origin-left after:bg-accent-green after:content-[''] " +
  "after:transition-transform after:duration-500 after:ease-out " +
  "motion-reduce:after:transition-none";

function fieldRow(filled: boolean) {
  return filled
    ? `${FIELD_ROW} after:scale-x-100`
    : `${FIELD_ROW} after:scale-x-0 focus-within:after:scale-x-100`;
}
const FIELD =
  "min-w-0 flex-1 border-0 bg-transparent text-field font-normal text-ink " +
  "placeholder:text-ink/50 outline-none focus:outline-none focus-visible:outline-none";

/* Fargene står ikke her, men i av/på-grenene: Tailwind sorterer utilities etter
   egenskap og ikke etter rekkefølgen i strengen, så en `bg-card` her ville slått
   «på»-fargen uansett hvor den kom. */
const CHIP =
  "flex shrink-0 flex-col items-start rounded-card border p-card text-field font-light " +
  "transition-colors duration-150 ease-[ease]";
const CHIP_OFF =
  "border-ink/70 bg-card text-ink/70 " +
  "hover:border-[var(--hover)] hover:bg-[var(--hover)] hover:text-[var(--hover-ink)] " +
  "active:border-press active:bg-press active:text-bg";

const GROUP = "flex w-full flex-col items-start gap-field";
const GROUP_LABEL = "w-full text-field font-normal text-ink";
const CHIP_ROW = "flex w-full flex-wrap content-start items-start gap-chip";

/* Bunnlinja ligger utenfor `@container`, så den holder seg til faste rem. */
const BTN_PRIMARY =
  "rounded-full border border-ink bg-ink px-[1.35rem] py-[0.62rem] font-medium text-bg " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-[ease] " +
  "enabled:hover:border-[var(--hover)] enabled:hover:bg-[var(--hover)] enabled:hover:text-[var(--hover-ink)] " +
  "enabled:active:border-press enabled:active:bg-press enabled:active:text-bg " +
  "disabled:cursor-not-allowed disabled:opacity-[0.28]";
const BTN_GHOST =
  "rounded-full border border-line bg-transparent px-[1.35rem] py-[0.62rem] font-medium text-ink-2 " +
  "transition-[background-color,border-color,color] duration-150 ease-[ease] " +
  "enabled:hover:border-[var(--hover)] enabled:hover:bg-[var(--hover)] enabled:hover:text-[var(--hover-ink)] " +
  "enabled:active:border-press enabled:active:bg-press enabled:active:text-bg " +
  "disabled:cursor-not-allowed disabled:opacity-30";

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <Image
      className="w-auto max-w-[160px] object-contain"
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
      <div className="@container overflow-y-auto">
        <section className={`${CARD} m-[max(2rem,5cqi)]`}>
          <span className={EYEBROW}>Publisert</span>
          <h2 className={DISPLAY}>Oppgaven er publisert</h2>
          <p className={LEAD}>
            Den ligger nå som en node i kartet ved siden av. Kontaktinformasjonen deres vises ikke
            offentlig — studenter må be om den gjennom oss.
          </p>
          <div className="flex flex-wrap gap-chip">
            <button
              className={`${BTN_PRIMARY} max-mobile:grow max-mobile:basis-full`}
              style={hoverVars(0) as CSSProperties}
              onClick={() => reset(true)}
            >
              Legg inn en oppgave til
            </button>
            <button
              className={`${BTN_GHOST} max-mobile:grow max-mobile:basis-full`}
              style={hoverVars(2) as CSSProperties}
              onClick={() => reset(false)}
            >
              Ny bedrift
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* `@container` gjør at cqi-tokenene måler seg mot denne ruta og ikke mot
          vindusbredden — kortene er nøyaktig så brede som innholdsboksen her. */}
      <form
        className="@container relative min-h-0 flex-1 overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !saving) submit();
        }}
      >
        {/* Luften og avstanden mellom kortene står her, ikke på <form>: cqi på
            selve beholder-elementet ville målt seg mot vinduet. */}
        <div className="flex flex-col gap-stack p-[max(2rem,5cqi)]">
        {/* ── hva er dette ───────────────────────────────────────────────── */}
        <section className="flex w-full flex-col items-start gap-card">
          <h1 className="w-full text-display font-medium text-ink [overflow-wrap:break-word]">Student Connect 2026</h1>
          <p className="m-0 w-full text-field leading-[1.45] font-normal text-ink [overflow-wrap:break-word]">
            Student Connect 2026 kobler bedrifter med studenter som leter etter noe å skrive om.
            Meld inn en utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om — så
            blir det en node i et felles kart, gruppert etter bransje og koblet til andre som jobber
            med det samme.
          </p>
          <p className="m-0 w-full text-field leading-[1.45] font-normal text-ink [overflow-wrap:break-word]">
            Studenter som finner noe de vil ta tak i, sender en forespørsel gjennom oss.
            Kontaktinformasjonen deres vises aldri offentlig i kartet.
          </p>

          <div className={GROUP}>
            <span className={GROUP_LABEL}>Samarbeidspartnere</span>
            <div className="flex w-full items-center justify-between">
              {PARTNERS.filter((p) => p.src !== OSLO_LOGO_SRC).map((p) => (
                <PartnerLogo key={p.src} partner={p} />
              ))}
            </div>
          </div>
          {osloPartner && (
            <div className={GROUP}>
              <span className={GROUP_LABEL}>i samarbeid med</span>
              <div className="flex flex-wrap items-center gap-x-card gap-y-field">
                <PartnerLogo partner={osloPartner} />
              </div>
            </div>
          )}
        </section>

        {/* ── 1. utfordringen ─────────────────────────────────────────────── */}
        <section className={CARD}>
          <span className={EYEBROW}>Utfordringen</span>
          <h2 className={DISPLAY}>Hva vil dere utforske?</h2>
          <p className={LEAD}>
            En utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om. Det trenger
            ikke være ferdig formulert som en oppgave.
          </p>

          <div className={fieldRow(title.trim().length > 0)}>
            <label className="sr-only" htmlFor="title">
              Kort tittel
            </label>
            <input
              id="title"
              className={FIELD}
              placeholder="Ombruk av stål i rehabiliteringsprosjekter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className={fieldRow(challenge.trim().length > 0)}>
            <label className="sr-only" htmlFor="challenge">
              Beskriv utfordringen
            </label>
            <textarea
              id="challenge"
              className={`${FIELD} min-h-editor resize-none leading-[1.35]`}
              placeholder="Hva er problemet, hvorfor er det interessant, og hva slags svar hadde vært nyttig for dere?"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              maxLength={4000}
            />
          </div>

          <div className={GROUP}>
            <span className={GROUP_LABEL}>Dette kan være en:</span>
            <div className={CHIP_ROW}>
              {LEVELS.map((l, i) => (
                <button
                  key={l.key}
                  type="button"
                  className={`${CHIP} ${
                    levels.includes(l.key) ? "border-accent-green bg-accent-green text-ink" : CHIP_OFF
                  }`}
                  style={hoverVars(i) as CSSProperties}
                  onClick={() => toggleLevel(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. kontakt ──────────────────────────────────────────────────── */}
        {/* Skyggen ligger bare på dette kortet i Figma-fila. */}
        <section className={`${CARD} shadow-[0_1.14cqi_0.6cqi_rgba(0,0,0,0.25)]`}>
          <span className={EYEBROW}>Folka</span>
          <h2 className={DISPLAY}>Hvem er dere?</h2>
          <p className={LEAD}>
            Dette vises ikke i kartet. Studenter som vil ta kontakt sender en forespørsel, og vi
            formidler den videre til dere.
          </p>

          <div className={fieldRow(companyName.trim().length > 0)}>
            <label className="sr-only" htmlFor="company">
              Bedrift
            </label>
            <input
              id="company"
              className={FIELD}
              placeholder="Bedrift"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className={fieldRow(contactName.trim().length > 0)}>
            <label className="sr-only" htmlFor="cname">
              Kontaktperson
            </label>
            <input
              id="cname"
              className={FIELD}
              placeholder="Kontaktperson"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className={fieldRow(contactEmail.trim().length > 0)}>
            <label className="sr-only" htmlFor="cmail">
              E-post
            </label>
            <input
              id="cmail"
              className={FIELD}
              type="email"
              placeholder="E-post"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className={fieldRow(contactPhone.trim().length > 0)}>
            <label className="sr-only" htmlFor="cphone">
              Telefon (valgfritt)
            </label>
            <input
              id="cphone"
              className={FIELD}
              placeholder="Telefon (valgfritt)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          {error && <p className="m-0 w-full text-field font-normal text-danger">{error}</p>}
        </section>

        {/* ── 3. bransje ──────────────────────────────────────────────────── */}
        <section className={CARD}>
          <span className={EYEBROW}>Bransjen</span>
          <h2 className={DISPLAY}>Hvilken bransje jobber dere innenfor?</h2>

          <div className={GROUP}>
            <span className={GROUP_LABEL}>
              Velg den som passer best — den bestemmer hvor i kartet dere havner:
            </span>
            <div className={CHIP_ROW}>
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.key}
                  type="button"
                  className={`${CHIP} ${
                    industryKey === ind.key
                      ? "border-[var(--opt-color)] bg-[var(--opt-color)] text-[var(--opt-ink)]"
                      : CHIP_OFF
                  }`}
                  style={
                    {
                      /* Hover, valgt tilstand og prikken i kartet leser alle
                         `ind.color`, så de kan ikke komme i utakt. */
                      ["--hover"]: ind.color,
                      ["--hover-ink"]: contrastingInk(ind.color),
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
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 max-mobile:flex-col max-mobile:items-stretch max-mobile:gap-[0.6rem] max-mobile:pb-[max(0.9rem,env(safe-area-inset-bottom))]">
          <p className="m-0 min-w-0 text-[0.85rem] text-ink-3 max-mobile:text-center" aria-live="polite">
            {hint}
          </p>
          <button
            type="button"
            className={`${BTN_PRIMARY} flex-none max-mobile:w-full max-mobile:py-[0.8rem]`}
            style={hoverVars(5) as CSSProperties}
            disabled={!canSubmit || saving}
            onClick={submit}
          >
            {saving ? "Publiserer…" : "Publiser oppgaven"}
          </button>
        </div>

        </div>

        {/* Enter i et tekstfelt skal sende inn — knappen under gjør det samme. */}
        <button
          type="submit"
          className="pointer-events-none absolute h-px w-px border-0 p-0 opacity-0"
          tabIndex={-1}
          aria-hidden
          disabled={!canSubmit}
        />
      </form>
    </div>
  );
}
