"use client";

import { useEffect, useState } from "react";
import { industryColor, industryLabel, subareaLabel, OTHER_KEY, LEVELS } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

type Props = {
  submission: PublicSubmission | null;
  onClose: () => void;
};

export default function NodeDetail({ submission, onClose }: Props) {
  /* Skuffen skal gli ut igjen når man lukker. Derfor beholder vi den siste
     noden og lar panelet stå montert — ellers rykker det bare bort. */
  const [shown, setShown] = useState<PublicSubmission | null>(submission);
  const [asking, setAsking] = useState(false);
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  /* Klikk på en ny node skal bytte innhold og nullstille kontaktskjemaet.
     Justeres under render — det er Reacts anbefalte måte å utlede state fra
     props på, og slipper en effekt som trigger en render til. Lukking (null)
     bytter ikke innhold; da skal teksten bli stående mens skuffen glir ut. */
  const currentId = submission?.id ?? null;
  const [prevId, setPrevId] = useState(currentId);
  if (currentId !== prevId) {
    setPrevId(currentId);
    if (submission) {
      setShown(submission);
      setAsking(false);
      setSent(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (!submission) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submission, onClose]);

  // før første åpning finnes ikke panelet i det hele tatt
  if (!shown) return null;

  const open = Boolean(submission);
  const color = industryColor(shown.industry_key);

  /* Ansvarsområdet er tatt ut av skjemaet. Eldre innmeldinger har fortsatt ett,
     og skal vise det; nye lagres som «annet» uten fritekst og får ingen tagg. */
  const subarea =
    shown.subarea_key === OTHER_KEY && !shown.subarea_other?.trim()
      ? null
      : subareaLabel(shown.industry_key, shown.subarea_key, shown.subarea_other);

  async function sendRequest() {
    if (!shown) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: shown.id,
          requester_name: name.trim(),
          requester_email: email.trim(),
          requester_role: role.trim() || null,
          message: message.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Noe gikk galt.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  const canSend = name.trim().length >= 2 && email.trim().includes("@");

  return (
    <aside
      className={`detail ${open ? "is-open" : ""}`}
      style={{ ["--accent" as string]: color }}
      aria-hidden={!open}
    >
      <button className="detail-close" onClick={onClose} aria-label="Lukk">
        ✕
      </button>

      <div className="detail-tags">
        <span className="detail-tag detail-tag-industry">{industryLabel(shown.industry_key)}</span>
        {subarea && <span className="detail-tag">{subarea}</span>}
      </div>

      <h2 className="detail-title">{shown.title}</h2>
      <p className="detail-challenge">{shown.challenge}</p>

      {shown.levels.length > 0 && (
        <div className="detail-levels">
          {shown.levels.map((l) => (
            <span key={l} className="q-chip is-static">
              {LEVELS.find((x) => x.key === l)?.label ?? l}
            </span>
          ))}
        </div>
      )}

      <div className="detail-contact">
        {sent ? (
          <div className="detail-sent">
            <strong>Forespørselen er sendt.</strong>
            <span>Vi setter deg i kontakt med bedriften så snart vi rekker det.</span>
          </div>
        ) : asking ? (
          <div className="detail-form">
            <h3>Be om kontaktinfo</h3>
            <input
              className="q-input"
              placeholder="Navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="q-input"
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="q-input"
              placeholder="Studie / rolle (valgfritt)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <textarea
              className="q-textarea"
              rows={3}
              placeholder="Kort om hvorfor du er interessert (valgfritt)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="q-error">{error}</p>}
            <div className="detail-form-actions">
              <button className="btn-ghost" onClick={() => setAsking(false)}>
                Avbryt
              </button>
              <button className="btn-primary" disabled={!canSend || saving} onClick={sendRequest}>
                {saving ? "Sender…" : "Send forespørsel"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="detail-hidden-note">
              Bedriften bak denne oppgaven vises ikke offentlig.
            </p>
            <button className="btn-primary detail-ask" onClick={() => setAsking(true)}>
              Be om kontaktinfo
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
