"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { INDUSTRIES, LEVELS, OTHER_KEY } from "@/lib/taxonomy";
import { contrastingInk, hoverVars } from "@/lib/color";
import { PARTNERS } from "@/lib/partners";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Skjemaet.

   Målene ligger som cqi-baserte clamp()-tokens i globals.css (text-display,
   p-card, gap-stack …) og regnes mot skjemaets egen bredde — derfor
   `@container` på scrollflaten under. Skjemaruta er halve skjermen på desktop
   og hele på mobil, så alt her må holde seg innenfor den beholderen:
   cqi-verdier utenfor `@container` faller tilbake på vindusbredden og blir feil.

   Hierarkiet følger forsiden: innenfor et kort er avstandene med vilje ujevne.
   Ingressen ligger tett på overskriften fordi den hører til den, mens feltene
   får tydelig mer luft over seg — luften sier hvor et nytt trinn begynner. En
   jevn `gap` gjorde tidligere alle ledd like viktige.

   Klassestrengene må stå som hele literaler — Tailwind leser kildefila som
   tekst og finner ikke klasser satt sammen med `${...}`.
   ──────────────────────────────────────────────────────────────────────────── */

/** Det hvite kortet. Ett per trinn. */
const CARD =
  "flex w-full flex-col items-start rounded-card border border-ink/10 bg-card p-card " +
  "shadow-[0_1px_2px_rgba(16,17,16,0.04),0_10px_30px_rgba(16,17,16,0.06)]";

/* Overskriftsrekka i et kort. Ingressen er ikke lenger `font-medium` — den
   konkurrerte med overskriften over seg. */
const EYEBROW = "w-full text-eyebrow font-normal tracking-[0.12em] uppercase text-ink/60";
const DISPLAY = "mt-[0.5rem] w-full text-display font-light text-ink [overflow-wrap:break-word]";
const LEAD = "m-0 mt-[0.55rem] w-full text-lead font-normal text-ink-2 [overflow-wrap:break-word]";

/** Feltbolken under ingressen. Den store luften over er trinnskillet. */
const FIELDS = "mt-[1.6rem] flex w-full flex-col gap-[1.15rem]";
const GROUP = "mt-[1.6rem] flex w-full flex-col items-start gap-field";

/* Etikettene står nå permanent over feltet. Placeholder alene forsvinner idet
   man begynner å skrive, og da er det ikke lenger mulig å se hva raden var. */
const FIELD_LABEL = "text-[0.75rem] font-normal tracking-[0.1em] uppercase text-ink/65";

/* Feltene er en strek under teksten, ikke en boks. Selve inputen er usynlig —
   raden rundt den bærer streken, så den ligger i ro når teksten vokser. */
const FIELD_ROW =
  "relative flex w-full items-start border-b-2 border-ink/20 pb-[0.5rem] " +
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
  "placeholder:text-ink/40 outline-none focus:outline-none focus-visible:outline-none";

/* Fargene står ikke her, men i av/på-grenene: Tailwind sorterer utilities etter
   egenskap og ikke etter rekkefølgen i strengen, så en `bg-card` her ville slått
   «på»-fargen uansett hvor den kom.
   Brikkene var tidligere like store som kortene rundt seg — `p-card` og
   `text-field` ga dem 60 px høyde. De er tilleggsopplysninger, ikke innhold, og
   står nå som brikker. */
const CHIP =
  "flex shrink-0 items-center rounded-full border px-[0.95rem] py-[0.48rem] " +
  "text-[0.95rem] font-normal transition-colors duration-150 ease-[ease] " +
  /* En finger trenger mer enn en musepeker: ~44 px trykkflate på mobil. */
  "max-mobile:px-[1.05rem] max-mobile:py-[0.66rem]";
const CHIP_OFF =
  "border-ink/25 bg-card text-ink-2 " +
  "hover:border-[var(--hover)] hover:bg-[var(--hover)] hover:text-[var(--hover-ink)] " +
  "active:border-press active:bg-press active:text-bg";

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

/** «01 / Utfordringen» — tallet gir bolkene rekkefølge, ikke bare navn. */
function StepEyebrow({ step, children }: { step: string; children: ReactNode }) {
  return (
    <span className={EYEBROW}>
      <span className="font-medium text-ink/85">{step}</span>
      <span className="mx-[0.55em] text-ink/25">/</span>
      {children}
    </span>
  );
}

/** Etikett + understreket felt. Etiketten blir stående når feltet fylles ut. */
function Field({
  id,
  label,
  filled,
  children,
}: {
  id: string;
  label: string;
  filled: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-[0.3rem]">
      <label className={FIELD_LABEL} htmlFor={id}>
        {label}
      </label>
      <div className={fieldRow(filled)}>{children}</div>
    </div>
  );
}

/* Logoene skal kjennes igjen, ikke konkurrere med feltene. Gråtoner i hvile,
   full farge når man ser nærmere etter — samme behandling som på forsiden. */
function PartnerRow() {
  return (
    <div className="flex w-full flex-col items-start gap-[0.9rem]">
      <span className={FIELD_LABEL}>I samarbeid med</span>
      <div className="group flex flex-wrap items-center gap-x-[1.75rem] gap-y-[1rem]">
        {PARTNERS.map((p) => (
          <Image
            key={p.src}
            className="w-auto max-w-[130px] object-contain opacity-70 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0"
            src={p.src}
            alt={p.alt}
            width={p.width}
            height={p.height}
            style={{ height: p.displayHeight }}
          />
        ))}
      </div>
    </div>
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
  if (challenge.trim().length < 10) missing.push("beskrivelse");
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
        <section className={`${CARD} m-[max(1.5rem,4cqi)]`}>
          <span className={EYEBROW}>Publisert</span>
          <h2 className={DISPLAY}>Oppgaven er publisert</h2>
          <p className={LEAD}>
            Den ligger nå som en node i kartet ved siden av. Kontaktinformasjonen deres vises ikke
            offentlig — studenter må be om den gjennom oss.
          </p>
          <div className="mt-[1.6rem] flex flex-wrap gap-[0.6rem]">
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
        <div className="flex flex-col gap-stack p-[max(1.5rem,4cqi)]">
          {/* ── innledning ───────────────────────────────────────────────── */}
          {/* Kort. Den som er her har allerede lest forsiden og klikket seg
              hit; oppgaven nå er å fylle ut, ikke å bli overtalt på nytt. */}
          <section className="flex w-full flex-col items-start">
            <Link
              href="/"
              className="text-[0.85rem] font-medium text-ink no-underline transition-colors duration-150 hover:text-ink-2"
            >
              ← Koblingspunkt
            </Link>

            <span className="mt-[1.4rem] w-full text-eyebrow font-normal tracking-[0.12em] uppercase text-ink/60">
              Student Connect 2026
            </span>
            {/* Ett trinn større enn kortoverskriftene under — sidens tittel
                skal ikke være like tung som bolkene den samler. */}
            <h1 className="mt-[0.5rem] w-full text-[clamp(2rem,5.6cqi,3.4rem)] leading-[1.02] font-light tracking-[-0.02em] text-ink [overflow-wrap:break-word]">
              Meld inn en utfordring
            </h1>
            <p className="m-0 mt-[0.7rem] w-full text-lead font-normal text-ink-2 [overflow-wrap:break-word]">
              Det dere melder inn blir en node i et felles kart, gruppert etter bransje og koblet
              til andre som jobber med det samme. Studenter som vil ta tak i noe, sender en
              forespørsel gjennom oss — kontaktinformasjonen deres vises aldri offentlig.
            </p>
          </section>

          {/* ── 1. utfordringen ───────────────────────────────────────────── */}
          <section className={CARD}>
            <StepEyebrow step="01">Utfordringen</StepEyebrow>
            <h2 className={DISPLAY}>Hva vil dere utforske?</h2>
            <p className={LEAD}>
              En utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om. Det trenger
              ikke være ferdig formulert som en oppgave.
            </p>

            <div className={FIELDS}>
              <Field id="title" label="Kort tittel" filled={title.trim().length > 0}>
                <input
                  id="title"
                  className={FIELD}
                  placeholder="Ombruk av stål i rehabiliteringsprosjekter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </Field>

              <Field
                id="challenge"
                label="Beskriv utfordringen"
                filled={challenge.trim().length > 0}
              >
                <textarea
                  id="challenge"
                  className={`${FIELD} min-h-editor resize-none leading-[1.45]`}
                  placeholder="Hva er problemet, hvorfor er det interessant, og hva slags svar hadde vært nyttig for dere?"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  maxLength={4000}
                />
              </Field>
            </div>

            <div className={GROUP}>
              <span className={FIELD_LABEL}>Dette kan være en</span>
              <div className={CHIP_ROW}>
                {LEVELS.map((l, i) => (
                  <button
                    key={l.key}
                    type="button"
                    className={`${CHIP} ${
                      levels.includes(l.key)
                        ? "border-accent-green bg-accent-green text-ink"
                        : CHIP_OFF
                    }`}
                    style={hoverVars(i) as CSSProperties}
                    aria-pressed={levels.includes(l.key)}
                    onClick={() => toggleLevel(l.key)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── 2. kontakt ────────────────────────────────────────────────── */}
          <section className={CARD}>
            <StepEyebrow step="02">Folka</StepEyebrow>
            <h2 className={DISPLAY}>Hvem er dere?</h2>
            <p className={LEAD}>
              Dette vises ikke i kartet. Studenter som vil ta kontakt sender en forespørsel, og vi
              formidler den videre til dere.
            </p>

            <div className={FIELDS}>
              <Field id="company" label="Bedrift" filled={companyName.trim().length > 0}>
                <input
                  id="company"
                  className={FIELD}
                  placeholder="Navnet på bedriften"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Field>

              <Field id="cname" label="Kontaktperson" filled={contactName.trim().length > 0}>
                <input
                  id="cname"
                  className={FIELD}
                  placeholder="Fornavn og etternavn"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </Field>

              <Field id="cmail" label="E-post" filled={contactEmail.trim().length > 0}>
                <input
                  id="cmail"
                  className={FIELD}
                  type="email"
                  placeholder="navn@bedrift.no"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </Field>

              <Field
                id="cphone"
                label="Telefon (valgfritt)"
                filled={contactPhone.trim().length > 0}
              >
                <input
                  id="cphone"
                  className={FIELD}
                  placeholder="+47 000 00 000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </Field>
            </div>

            {error && (
              <p className="m-0 mt-[1.1rem] w-full text-[0.9rem] font-normal text-danger">
                {error}
              </p>
            )}
          </section>

          {/* ── 3. bransje ────────────────────────────────────────────────── */}
          <section className={CARD}>
            <StepEyebrow step="03">Bransjen</StepEyebrow>
            <h2 className={DISPLAY}>Hvilken bransje jobber dere innenfor?</h2>
            <p className={LEAD}>
              Velg den som passer best — den bestemmer hvor i kartet dere havner.
            </p>

            <div className={GROUP}>
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
                    aria-pressed={industryKey === ind.key}
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

          <PartnerRow />

          {/* Publiseringslinja følger med nedover. Skjemaet er langt nok til at
              knappen ellers ligger utenfor skjermen hele veien, og da er det
              heller ikke synlig hva som mangler. */}
          <div className="sticky bottom-[max(0.85rem,env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-4 rounded-[1.75rem] border border-line bg-card/92 px-[1.15rem] py-[0.8rem] shadow-[0_6px_24px_rgba(16,17,16,0.12)] backdrop-blur-md max-mobile:flex-col max-mobile:items-stretch max-mobile:gap-[0.7rem]">
            <p
              className="m-0 min-w-0 text-[0.85rem] text-ink-2 max-mobile:text-center"
              aria-live="polite"
            >
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
