"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NodeMap from "@/components/NodeMap";
import Questionnaire from "@/components/Questionnaire";
import NodeDetail from "@/components/NodeDetail";
import { useIsMobile } from "@/lib/useMediaQuery";
import { setJustPublished } from "@/lib/justPublished";
import type { PublicSubmission } from "@/lib/types";

export default function EditPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

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
    // på mobil vises ikke kartet her, så da er det ingenting å hente
    if (isMobile) {
      setLoading(false);
      return;
    }
    load();
    // andre kan fylle ut samtidig — hent inn nye noder jevnlig
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, [load, isMobile]);

  useEffect(() => {
    router.prefetch("/presentation");
  }, [router]);

  const onPublished = (submission: PublicSubmission) => {
    /* Mobil: skjemaet står alene på siden, så kvitteringen er kartet selv.
       Desktop: kartet ligger allerede ved siden av — bli stående. */
    if (isMobile) {
      setJustPublished(submission.id);
      router.push("/presentation");
      return;
    }
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
          {/* <span className="home-eyebrow">Student Connect 2026</span> */}
          <h1>Student Connect 2026</h1>
          {/* <p>
            Alt står på én side. Noden dukker opp i kartet med én gang dere publiserer.{" "}
            <Link href="/presentation">Se kartet i fullskjerm →</Link>
          </p> */}
        </header>
        <Questionnaire
          onPublished={onPublished}
          onIndustryPreview={setPreview}
          /* mobil hopper videre til kartet i stedet for å vise kvittering her */
          showReceipt={!isMobile}
        />
      </section>

      {/* Kartet tas helt ut på mobil — ikke bare skjules — så animasjonsløkka
          ikke maler batteriet mens man fyller ut skjemaet. */}
      {!isMobile && (
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
      )}
    </main>
  );
}
