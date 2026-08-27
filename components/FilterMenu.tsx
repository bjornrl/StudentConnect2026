"use client";

import { INDUSTRIES } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

type Props = {
  submissions: PublicSubmission[];
  active: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
  query: string;
  onQuery: (q: string) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

export default function FilterMenu({
  submissions,
  active,
  onToggle,
  onClear,
  query,
  onQuery,
  collapsed = false,
  onToggleCollapsed,
}: Props) {
  const counts = new Map<string, number>();
  for (const s of submissions) {
    counts.set(s.industry_key, (counts.get(s.industry_key) ?? 0) + 1);
  }

  return (
    <div className={`filters ${collapsed ? "is-collapsed" : ""}`}>
      <div className="filters-head">
        <div>
          <strong>{submissions.length}</strong> oppgaver
        </div>
        {onToggleCollapsed && (
          <button className="filters-collapse" onClick={onToggleCollapsed} aria-label="Vis/skjul filter">
            {collapsed ? "☰" : "–"}
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          <input
            className="filters-search"
            placeholder="Søk i oppgavene…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />

          <ul className="filters-list">
            {INDUSTRIES.map((ind) => {
              const n = counts.get(ind.key) ?? 0;
              const on = active.includes(ind.key);
              return (
                <li key={ind.key}>
                  <button
                    className={`filters-item ${on ? "is-on" : ""} ${n === 0 ? "is-empty" : ""}`}
                    style={{ ["--opt-color" as string]: ind.color }}
                    onClick={() => onToggle(ind.key)}
                    disabled={n === 0}
                  >
                    <span className="filters-dot" />
                    <span className="filters-name">{ind.label}</span>
                    <span className="filters-count">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {(active.length > 0 || query) && (
            <button className="btn-ghost filters-clear" onClick={onClear}>
              Nullstill filter
            </button>
          )}
        </>
      )}
    </div>
  );
}
