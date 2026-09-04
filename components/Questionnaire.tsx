"use client";

import { useRef, useState } from "react";
import { INDUSTRIES, OTHER_INDUSTRY } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Panelet.

   Det er ikke en halv skjerm, men en rute som ligger OPPÅ tavla og kan slås
   av. Da tåler det ikke å være løst organisert: tre bolker, nummererte, slik
   at man ser hvor mange ting man blir bedt om før man begynner.

   01 Utfordringen · 02 Folka · 03 Bransjen

   Luften mellom trinnene er ujevn med vilje. Tittelfeltet ligger tett på
   utfordringsfeltet fordi de hører sammen; en bolk starter med en hårstrek og
   tydelig mer luft, fordi det er dét som sier at et nytt trinn begynner.

   Innsendingslinja ligger UTENFOR scrollflaten, ikke nederst i den. Skjemaet
   er langt nok til at knappen ellers ville ligget utenfor ruta hele veien —
   og da ser man heller ikke hva som mangler.

   Nivåene («Dette kan være en bacheloroppgave …») står fortsatt kommentert ut
   nederst.
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

/** «bedrift, e-post og bransje» */
function joinNo(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} og ${parts[parts.length - 1]}`;
}

/** «01 · Utfordringen» — tallet gir bolkene rekkefølge, ikke bare navn. */
function Step({ n, children }: { n: string; children: string }) {
  return (
    <p className="panel-step">
      <span>{n}</span>
      {children}
    </p>
  );
}

/**
 * Etikett over en strek. Streken ER hele rammen — ingen boks.
 *
 * `filled` er det som gjør at fargestreken blir stående etter at man har
 * forlatt feltet. Uten den ville man bare sett hvilket felt man står i, og
 * ikke hvilke man er ferdig med — og i en rute med sju felt er dét det man
 * lurer på.
 */
function Field({
  id,
  label,
  optional = false,
  filled,
  innerRef,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  filled: boolean;
  innerRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div className={`field${filled ? " is-filled" : ""}`} ref={innerRef}>
      <label className="field-label" htmlFor={id}>
        {label}
        {optional && <span className="field-optional"> — valgfritt</span>}
      </label>
      {children}
    </div>
  );
}

export default function Questionnaire({ onPublished, onCollapse }: Props) {
  const [title, setTitle] = useState("");
  const [challenge, setChallenge] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [industryKey, setIndustryKey] = useState<string | null>(null);
  const [industryOther, setIndustryOther] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Lappen flyr ut fra selve utfordringsfeltet — det er der teksten sto, så
     det er derfra bevegelsen leses som «det jeg skrev ble til den lappen».
     Ruta klemmes innenfor panelet: har man scrollet ned til kontaktfeltene,
     ligger utfordringsfeltet utenfor synsfeltet, og lappen ville kommet
     flyvende fra et sted som ikke finnes. */
  const formRef = useRef<HTMLFormElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);

  function flightOrigin(): DOMRect {
    const field = flightRef.current?.getBoundingClientRect();
    const panel = formRef.current?.getBoundingClientRect();
    if (!field) return new DOMRect(0, 0, 300, 200);
    if (!panel) return field;
    const top = Math.min(Math.max(field.top, panel.top), panel.bottom - field.height);
    return new DOMRect(field.left, top, field.width, field.height);
  }

  /* Alt står framme samtidig, så i stedet for å sperre veien videre sier vi
     rett ut hva som mangler før man kan sende inn. Tittelen er ikke med —
     den er valgfri. */
  const otherIndustryChosen = industryKey === OTHER_INDUSTRY;

  const missing: string[] = [];
  if (challenge.trim().length < MIN_CHALLENGE) missing.push("utfordringen");
  if (companyName.trim().length < 2) missing.push("bedrift");
  if (!contactEmail.trim().includes("@")) missing.push("e-post");
  /* «Annen bransje» er ikke et svar i seg selv — den åpner bare feltet der
     svaret skal stå. Derfor teller den som manglende bransje til feltet er
     fylt ut, og ikke som et eget punkt i lista: den som nettopp trykket på
     brikka ser feltet rett under, og «mangler bransjenavn» hadde vært å
     forklare noe man allerede har foran seg. */
  if (!industryKey || (otherIndustryChosen && industryOther.trim().length < 2)) {
    missing.push("bransje");
  }
  const canSubmit = missing.length === 0;

  async function submit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          challenge: challenge.trim(),
          industry_key: industryKey,
          industry_other: otherIndustryChosen ? industryOther.trim() : null,
          company_name: companyName.trim(),
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Noe gikk galt.");

      onPublished(json.submission, flightOrigin());

      /* Bedrift, kontakt og bransje blir stående: melder man inn én
         utfordring, melder man som regel inn to. */
      setTitle("");
      setChallenge("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  /* Kvitteringen etter innsending ligger på siden, ikke her: kortet som løfter
     seg ut av feltet og toasten sier fra sammen, og en tredje melding i denne
     linja hadde bare vært støy.
     Hele lista blir tre linjer grå tekst på en smal rute. To navn og et antall
     sier like mye, og holder seg på én linje. */
  const hint = error
    ? error
    : canSubmit
      ? "Klar til å sendes."
      : missing.length <= 2
        ? `Mangler ${joinNo(missing)}.`
        : `Mangler ${missing.slice(0, 2).join(", ")} og ${missing.length - 2} felt til.`;

  return (
    <form
      className="panel-form"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="panel-scroll">
        <header className="panel-head">
          <div className="panel-head-row">
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
            En utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om. Den går rett
            til oss i Koblingspunkt. Lappene rundt er eksempler — deres egen havner ikke på tavla.
          </p>
        </header>

        {/* ── 01 utfordringen ──────────────────────────────────────────────── */}
        <Step n="01">Utfordringen</Step>

        <Field id="title" label="Kort tittel" optional filled={title.trim().length > 0}>
          <input
            id="title"
            className="field-input"
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
          innerRef={flightRef}
        >
          <textarea
            id="challenge"
            className="field-input field-textarea"
            placeholder="Hva er problemet, hvorfor er det interessant?"
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            maxLength={4000}
          />
        </Field>

        {/* ── 02 folka ─────────────────────────────────────────────────────── */}
        <Step n="02">Folka</Step>
        <p className="panel-note">
          Vi trenger dette for å kunne komme tilbake til dere. Ingenting av det dere fyller ut
          vises offentlig.
        </p>

        <Field id="company" label="Bedrift" filled={companyName.trim().length > 0}>
          <input
            id="company"
            className="field-input"
            placeholder="Navnet på bedriften"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={120}
          />
        </Field>

        <Field id="cname" label="Kontaktperson" optional filled={contactName.trim().length > 0}>
          <input
            id="cname"
            className="field-input"
            placeholder="Fornavn og etternavn"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            maxLength={120}
          />
        </Field>

        <Field id="cmail" label="E-post" filled={contactEmail.trim().length > 0}>
          <input
            id="cmail"
            className="field-input"
            type="email"
            placeholder="navn@bedrift.no"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            maxLength={200}
          />
        </Field>

        <Field id="cphone" label="Telefon" optional filled={contactPhone.trim().length > 0}>
          <input
            id="cphone"
            className="field-input"
            placeholder="+47 000 00 000"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            maxLength={40}
          />
        </Field>

        {/* ── 03 bransjen ──────────────────────────────────────────────────── */}
        <Step n="03">Bransjen</Step>
        <p className="panel-note">
          Velg den som passer best. Den hjelper oss å finne studenter med riktig fagbakgrunn.
        </p>

        <div className="chip-row" role="group" aria-label="Bransje">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.key}
              type="button"
              /* Valgt bransje er den samme svarte brikka som signerer
                 eksempellappene — samme språk, ett valg om gangen. */
              className={`chip${industryKey === ind.key ? " is-on" : ""}`}
              aria-pressed={industryKey === ind.key}
              onClick={() => setIndustryKey(ind.key)}
            >
              {ind.label}
            </button>
          ))}

          {/* Lista er vår, ikke verdens. Den som ikke finner seg selv i den
              skal slippe å velge noe som er omtrent riktig — et omtrentlig
              svar her er verre enn intet svar, for det er dette vi sorterer
              studenter etter. Brikka står sist og er stiplet: den er en
              utgang fra lista, ikke ett punkt til i den. */}
          <button
            type="button"
            className={`chip chip-other${otherIndustryChosen ? " is-on" : ""}`}
            aria-pressed={otherIndustryChosen}
            onClick={() => setIndustryKey(otherIndustryChosen ? null : OTHER_INDUSTRY)}
          >
            Annen bransje
          </button>
        </div>

        {/* Feltet finnes bare når brikka er valgt. Det står ikke og venter
            tomt under lista resten av tiden — da hadde skjemaet sett ut som
            om det spør om bransje to ganger. */}
        {otherIndustryChosen && (
          <Field
            id="industry-other"
            label="Hvilken bransje?"
            filled={industryOther.trim().length > 0}
          >
            <input
              id="industry-other"
              className="field-input"
              placeholder="Skriv inn bransjen deres"
              value={industryOther}
              onChange={(e) => setIndustryOther(e.target.value)}
              maxLength={80}
              autoFocus
            />
          </Field>
        )}

        {/* ── Kommentert ut inntil videre ──────────────────────────────────────
            Nivåene: «Dette kan være en bacheloroppgave / masteroppgave /
            prosjekt- eller sommerjobb / internship». LEVELS ligger klar i
            lib/taxonomy.ts, og API-et tar imot feltet allerede — det er bare
            flervalg i stedet for enkeltvalg, ellers likt bransjeraden over.

            <Step n="04">Omfanget</Step>
            <div className="chip-row" role="group" aria-label="Omfang">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  className={`chip${levels.includes(l.key) ? " is-on" : ""}`}
                  aria-pressed={levels.includes(l.key)}
                  onClick={() => toggleLevel(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
        ─────────────────────────────────────────────────────────────────────── */}
      </div>

      {/* Utenfor scrollflaten: den skal stå stille mens skjemaet rulles, slik at
          det alltid er synlig hva som mangler. */}
      <div className={`publish${error ? " is-error" : ""}`}>
        <p className="publish-hint" aria-live="polite">
          {hint}
        </p>
        <button className="publish-btn" type="submit" disabled={!canSubmit || saving}>
          {saving ? "Sender…" : "Send inn utfordringen"}
        </button>
      </div>
    </form>
  );
}
