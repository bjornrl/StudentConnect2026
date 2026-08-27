"use client";

import { useState } from "react";
import { INDUSTRIES, LEVELS, OTHER_KEY, getIndustry } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

type Props = {
  onPublished: (submission: PublicSubmission) => void;
  /** Lar kartet markere bransjen mens man fyller ut. */
  onIndustryPreview?: (industryKey: string | null) => void;
};

const STEPS = ["Bransje", "Ansvarsområde", "Utfordring", "Kontakt"] as const;

export default function Questionnaire({ onPublished, onIndustryPreview }: Props) {
  const [step, setStep] = useState(0);
  const [industryKey, setIndustryKey] = useState<string | null>(null);
  const [subareaKey, setSubareaKey] = useState<string | null>(null);
  const [subareaOther, setSubareaOther] = useState("");
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

  const industry = industryKey ? getIndustry(industryKey) : undefined;

  const reset = (keepCompany = true) => {
    setStep(0);
    setIndustryKey(null);
    setSubareaKey(null);
    setSubareaOther("");
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

  const canContinue = (() => {
    if (step === 0) return Boolean(industryKey);
    if (step === 1) return Boolean(subareaKey) && (subareaKey !== OTHER_KEY || subareaOther.trim().length > 1);
    if (step === 2) return title.trim().length >= 3 && challenge.trim().length >= 10;
    if (step === 3) return companyName.trim().length >= 2 && contactEmail.trim().includes("@");
    return false;
  })();

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry_key: industryKey,
          subarea_key: subareaKey,
          subarea_other: subareaKey === OTHER_KEY ? subareaOther.trim() : null,
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
  if (done) {
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
      <ol className="q-steps" aria-label="Fremdrift">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={i === step ? "is-current" : i < step ? "is-done" : ""}
            onClick={() => i < step && setStep(i)}
          >
            <span className="q-step-dot">{i < step ? "✓" : i + 1}</span>
            <span className="q-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="q-body">
        {/* ── 1. bransje ─────────────────────────────────────────────────── */}
        {step === 0 && (
          <section className="q-section">
            <h2>Hvilken bransje jobber dere innenfor?</h2>
            <p className="q-lead">Velg den som passer best. Den bestemmer hvor i kartet dere havner.</p>
            <div className="q-grid">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.key}
                  type="button"
                  className={`q-option ${industryKey === ind.key ? "is-selected" : ""}`}
                  style={{ ["--opt-color" as string]: ind.color }}
                  onMouseEnter={() => onIndustryPreview?.(ind.key)}
                  onMouseLeave={() => onIndustryPreview?.(industryKey)}
                  onClick={() => {
                    setIndustryKey(ind.key);
                    setSubareaKey(null);
                    onIndustryPreview?.(ind.key);
                    setStep(1);
                  }}
                >
                  <span className="q-option-dot" />
                  <span className="q-option-text">
                    <strong>{ind.label}</strong>
                    <em>{ind.hint}</em>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── 2. ansvarsområde ───────────────────────────────────────────── */}
        {step === 1 && industry && (
          <section className="q-section">
            <h2>Hva har avdelingen eller gruppen deres ansvar for?</h2>
            <p className="q-lead">
              Innenfor <strong style={{ color: industry.color }}>{industry.label}</strong>. Noder som
              deler ansvarsområde kobles sammen i kartet.
            </p>
            <div className="q-grid">
              {industry.subareas.map((sa) => (
                <button
                  key={sa.key}
                  type="button"
                  className={`q-option ${subareaKey === sa.key ? "is-selected" : ""}`}
                  style={{ ["--opt-color" as string]: industry.color }}
                  onClick={() => {
                    setSubareaKey(sa.key);
                    setStep(2);
                  }}
                >
                  <span className="q-option-dot" />
                  <span className="q-option-text">
                    <strong>{sa.label}</strong>
                  </span>
                </button>
              ))}
              <button
                type="button"
                className={`q-option is-other ${subareaKey === OTHER_KEY ? "is-selected" : ""}`}
                style={{ ["--opt-color" as string]: industry.color }}
                onClick={() => setSubareaKey(OTHER_KEY)}
              >
                <span className="q-option-dot" />
                <span className="q-option-text">
                  <strong>Annet</strong>
                  <em>Skriv inn selv</em>
                </span>
              </button>
            </div>

            {subareaKey === OTHER_KEY && (
              <input
                className="q-input"
                autoFocus
                placeholder="Hva har dere ansvar for?"
                value={subareaOther}
                onChange={(e) => setSubareaOther(e.target.value)}
                maxLength={80}
              />
            )}
          </section>
        )}

        {/* ── 3. utfordringen ────────────────────────────────────────────── */}
        {step === 2 && (
          <section className="q-section">
            <h2>Hva vil dere utforske?</h2>
            <p className="q-lead">
              En utfordring, et spørsmål eller et tema dere gjerne skulle visst mer om. Det trenger
              ikke være ferdig formulert som en oppgave.
            </p>

            <label className="q-label" htmlFor="title">
              Kort tittel
            </label>
            <input
              id="title"
              className="q-input"
              placeholder="F.eks. «Ombruk av stål i rehabiliteringsprosjekter»"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <span className="q-counter">{title.length}/120</span>

            <label className="q-label" htmlFor="challenge">
              Beskriv utfordringen
            </label>
            <textarea
              id="challenge"
              className="q-textarea"
              rows={7}
              placeholder="Hva er problemet, hvorfor er det interessant, og hva slags svar hadde vært nyttig for dere?"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              maxLength={4000}
            />
            <span className="q-counter">{challenge.length}/4000</span>

            <label className="q-label">Passer som</label>
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
        )}

        {/* ── 4. kontakt ─────────────────────────────────────────────────── */}
        {step === 3 && (
          <section className="q-section">
            <h2>Hvem er dere?</h2>
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
        )}
      </div>

      <div className="q-nav">
        <button
          type="button"
          className="btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Tilbake
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!canContinue}
            onClick={() => setStep((s) => s + 1)}
          >
            Videre
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={!canContinue || saving} onClick={submit}>
            {saving ? "Publiserer…" : "Publiser oppgaven"}
          </button>
        )}
      </div>
    </div>
  );
}
