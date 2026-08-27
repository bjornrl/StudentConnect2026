"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NodeMap from "@/components/NodeMap";
import NodeDetail from "@/components/NodeDetail";
import FilterMenu from "@/components/FilterMenu";
import type { PublicSubmission } from "@/lib/types";

export default function PresentationPage() {
  const [submissions, setSubmissions] = useState<PublicSubmission[]>([]);
  const [selected, setSelected] = useState<PublicSubmission | null>(null);
  const [active, setActive] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions", { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json.submissions)) setSubmissions(json.submissions);
    } catch {
      /* behold det vi allerede viser */
    }
  }, []);

  useEffect(() => {
    load();
    // nye innmeldinger fra /edit skal dukke opp på storskjermen av seg selv
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [dark]);

  const toggle = (key: string) =>
    setActive((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const enterFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <main className="present">
      <div className="present-topbar">
        <div className="present-title">
          <span>Student Connect 2026</span>
          <strong>Oppgavekart</strong>
        </div>
        <div className="present-actions">
          <button onClick={() => setDark((d) => !d)}>{dark ? "Lyst" : "Mørkt"}</button>
          <button onClick={enterFullscreen}>Fullskjerm</button>
          <Link href="/edit">Meld inn</Link>
        </div>
      </div>

      <FilterMenu
        submissions={submissions}
        active={active}
        onToggle={toggle}
        onClear={() => {
          setActive([]);
          setQuery("");
        }}
        query={query}
        onQuery={setQuery}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />

      <NodeMap
        submissions={submissions}
        activeIndustries={active}
        query={query}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />

      <NodeDetail submission={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
