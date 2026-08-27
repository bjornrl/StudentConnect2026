"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NodeMap from "@/components/NodeMap";
import Questionnaire from "@/components/Questionnaire";
import NodeDetail from "@/components/NodeDetail";
import type { PublicSubmission } from "@/lib/types";

export default function EditPage() {
  const [submissions, setSubmissions] = useState<PublicSubmission[]>([]);
  const [selected, setSelected] = useState<PublicSubmission | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions", { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json.submissions)) setSubmissions(json.submissions);
    } catch {
      /* kartet står bare tomt hvis nettet svikter */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // andre kan fylle ut samtidig — hent inn nye noder jevnlig
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, [load]);

  const onPublished = (submission: PublicSubmission) => {
    setSubmissions((prev) =>
      prev.some((s) => s.id === submission.id) ? prev : [...prev, submission]
    );
    setHighlightId(submission.id);
    setTimeout(() => setHighlightId(null), 7000);
  };

  return (
    <main className="edit">
      <section className="edit-pane">
        <header className="edit-header">
          <span className="home-eyebrow">Student Connect 2026</span>
          <h1>Meld inn en utfordring</h1>
          <p>
            Fire korte steg. Noden dukker opp i kartet med én gang dere publiserer.{" "}
            <Link href="/presentation">Se kartet i fullskjerm →</Link>
          </p>
        </header>
        <Questionnaire onPublished={onPublished} onIndustryPreview={setPreview} />
      </section>

      <section className="edit-map">
        <div className="edit-map-badge">
          <strong>{submissions.length}</strong> {submissions.length === 1 ? "oppgave" : "oppgaver"} i kartet
          {loading && " · laster…"}
        </div>
        <NodeMap
          submissions={submissions}
          activeIndustries={preview ? [preview] : []}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          highlightId={highlightId}
        />
        <NodeDetail submission={selected} onClose={() => setSelected(null)} />
      </section>
    </main>
  );
}
