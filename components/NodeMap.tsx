"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { INDUSTRIES, industryColor, industryLabel } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

type MapNode = SimulationNodeDatum & {
  id: string;
  submission: PublicSubmission;
  radius: number;
  /** fase-forskyvning så nodene ikke puster i takt */
  phase: number;
};

type MapLink = SimulationLinkDatum<MapNode> & { key: string };

type Props = {
  submissions: PublicSubmission[];
  /** Nøkler til bransjer som skal vises. Tom = alle. */
  activeIndustries?: string[];
  /** Fritekstsøk. */
  query?: string;
  selectedId?: string | null;
  onSelect?: (submission: PublicSubmission | null) => void;
  /** Node som nettopp ble publisert — pulserer en liten stund. */
  highlightId?: string | null;
  /** Viser bransjenavn ute i kartet. */
  showClusterLabels?: boolean;
  className?: string;
};

/** Faste ankerpunkter: bransjene fordeles jevnt rundt et sentrum. */
function anchorFor(industryKey: string, w: number, h: number, t: number) {
  const index = INDUSTRIES.findIndex((i) => i.key === industryKey);
  const total = INDUSTRIES.length;
  const safeIndex = index < 0 ? total : index;
  const angle = (safeIndex / total) * Math.PI * 2 - Math.PI / 2;

  const rx = w * 0.31;
  const ry = h * 0.31;

  // langsom, organisk drift så kartet aldri står helt stille
  const drift = 0.045;
  const wobbleX = Math.sin(t * 0.00021 + safeIndex * 1.7) * w * drift;
  const wobbleY = Math.cos(t * 0.00017 + safeIndex * 2.3) * h * drift;

  return {
    x: w / 2 + Math.cos(angle) * rx + wobbleX,
    y: h / 2 + Math.sin(angle) * ry + wobbleY,
  };
}

export default function NodeMap({
  submissions,
  activeIndustries = [],
  query = "",
  selectedId = null,
  onSelect,
  highlightId = null,
  showClusterLabels = true,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 700 });
  const [, forceRender] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const nodesRef = useRef<MapNode[]>([]);
  const linksRef = useRef<MapLink[]>([]);
  const simRef = useRef<Simulation<MapNode, MapLink> | null>(null);
  const clockRef = useRef(0);

  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const movedRef = useRef(false);

  /* ── størrelse ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── hvilke noder er «aktive» etter filtrering ──────────────────────────── */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const set = new Set<string>();
    for (const s of submissions) {
      const byIndustry =
        activeIndustries.length === 0 || activeIndustries.includes(s.industry_key);
      const byQuery =
        q.length === 0 ||
        s.title.toLowerCase().includes(q) ||
        s.challenge.toLowerCase().includes(q);
      if (byIndustry && byQuery) set.add(s.id);
    }
    return set;
  }, [submissions, activeIndustries, query]);

  /* ── bygg/oppdater simuleringen når datasettet endres ───────────────────── */
  useEffect(() => {
    const existing = new Map(nodesRef.current.map((n) => [n.id, n]));

    const nodes: MapNode[] = submissions.map((s) => {
      const prev = existing.get(s.id);
      if (prev) {
        prev.submission = s;
        return prev;
      }
      // nye noder starter nær ankeret sitt, ikke midt i kartet
      const a = anchorFor(s.industry_key, size.w, size.h, clockRef.current);
      return {
        id: s.id,
        submission: s,
        radius: 9 + Math.min(9, Math.sqrt(s.challenge.length) * 0.55),
        phase: Math.random() * Math.PI * 2,
        x: a.x + (Math.random() - 0.5) * 40,
        y: a.y + (Math.random() - 0.5) * 40,
      };
    });

    // koblinger: noder som deler bransje OG ansvarsområde
    const groups = new Map<string, MapNode[]>();
    for (const n of nodes) {
      const key = `${n.submission.industry_key}::${n.submission.subarea_key}::${
        n.submission.subarea_key === "annet"
          ? (n.submission.subarea_other ?? "").trim().toLowerCase()
          : ""
      }`;
      const arr = groups.get(key);
      if (arr) arr.push(n);
      else groups.set(key, [n]);
    }

    const links: MapLink[] = [];
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      // ring i stedet for full graf: holder tegningen lett og lesbar
      for (let i = 0; i < group.length; i++) {
        const a = group[i];
        const b = group[(i + 1) % group.length];
        if (group.length === 2 && i === 1) break;
        links.push({ key: `${a.id}-${b.id}`, source: a, target: b });
      }
    }

    nodesRef.current = nodes;
    linksRef.current = links;

    const sim =
      simRef.current ??
      forceSimulation<MapNode, MapLink>()
        .alphaDecay(0)
        .velocityDecay(0.42);

    sim
      .nodes(nodes)
      .force(
        "link",
        forceLink<MapNode, MapLink>(links)
          .id((d) => d.id)
          .distance(58)
          .strength(0.42)
      )
      .force("charge", forceManyBody<MapNode>().strength(-118).distanceMax(340))
      .force(
        "collide",
        forceCollide<MapNode>().radius((d) => d.radius + 8).strength(0.9)
      )
      .force(
        "x",
        forceX<MapNode>()
          .x((d) => anchorFor(d.submission.industry_key, size.w, size.h, clockRef.current).x)
          .strength(0.075)
      )
      .force(
        "y",
        forceY<MapNode>()
          .y((d) => anchorFor(d.submission.industry_key, size.w, size.h, clockRef.current).y)
          .strength(0.075)
      )
      .alpha(0.75);

    simRef.current = sim;
    sim.stop();
  }, [submissions, size.w, size.h]);

  /* ── animasjonsløkke: kartet «flyter» kontinuerlig ──────────────────────── */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      clockRef.current += dt;

      const sim = simRef.current;
      if (sim) {
        // hold litt liv i systemet uten at det blir urolig
        sim.alpha(Math.max(sim.alpha() * 0.995, 0.035));
        sim.tick();
        forceRender((v) => (v + 1) % 1_000_000);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── pan og zoom ────────────────────────────────────────────────────────── */
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setView((v) => {
      const k = Math.min(3.2, Math.max(0.45, v.k * (e.deltaY < 0 ? 1.09 : 1 / 1.09)));
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      return {
        k,
        x: px - ((px - v.x) / v.k) * k,
        y: py - ((py - v.y) / v.k) * k,
      };
    });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    movedRef.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const resetView = () => setView({ k: 1, x: 0, y: 0 });

  /* ── klyngesentre for etiketter og glød ─────────────────────────────────────
     Regnes hver frame (posisjonene flytter seg), men i to lineære pass.      */
  const clusters = (() => {
    const grouped = new Map<string, MapNode[]>();
    for (const n of nodesRef.current) {
      const arr = grouped.get(n.submission.industry_key);
      if (arr) arr.push(n);
      else grouped.set(n.submission.industry_key, [n]);
    }
    const out: { key: string; x: number; y: number; count: number; r: number }[] = [];
    for (const [key, group] of grouped) {
      let sx = 0;
      let sy = 0;
      for (const n of group) {
        sx += n.x ?? 0;
        sy += n.y ?? 0;
      }
      const cx = sx / group.length;
      const cy = sy / group.length;
      let maxD = 0;
      for (const n of group) {
        const d = Math.hypot((n.x ?? 0) - cx, (n.y ?? 0) - cy);
        if (d > maxD) maxD = d;
      }
      out.push({ key, x: cx, y: cy, count: group.length, r: Math.max(70, maxD + 46) });
    }
    return out;
  })();

  const nodes = nodesRef.current;
  const links = linksRef.current;
  const isFiltered = activeIndustries.length > 0 || query.trim().length > 0;

  return (
    <div
      ref={wrapRef}
      className={`nodemap ${className ?? ""}`}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg width={size.w} height={size.h} role="img" aria-label="Kart over innsendte oppgaver">
        <defs>
          {INDUSTRIES.map((i) => (
            <radialGradient key={i.key} id={`glow-${i.key}`}>
              <stop offset="0%" stopColor={i.color} stopOpacity="0.16" />
              <stop offset="60%" stopColor={i.color} stopOpacity="0.06" />
              <stop offset="100%" stopColor={i.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {/* mykt felt bak hver bransjeklynge */}
          {clusters.map((c) => {
            const dim = isFiltered && !nodes.some((n) => n.submission.industry_key === c.key && matches.has(n.id));
            return (
              <circle
                key={`halo-${c.key}`}
                cx={c.x}
                cy={c.y}
                r={c.r}
                fill={`url(#glow-${c.key})`}
                opacity={dim ? 0.18 : 1}
                pointerEvents="none"
              />
            );
          })}

          {/* koblinger mellom noder som deler ansvarsområde */}
          <g>
            {links.map((l) => {
              const s = l.source as MapNode;
              const t = l.target as MapNode;
              if (!s || !t || typeof s.x !== "number" || typeof t.x !== "number") return null;
              const active = matches.has(s.id) && matches.has(t.id);
              const mx = (s.x + t.x) / 2;
              const my = (s.y! + t.y!) / 2;
              const bow = Math.sin(clockRef.current * 0.0004 + s.phase) * 9;
              return (
                <path
                  key={l.key}
                  d={`M ${s.x} ${s.y} Q ${mx + bow} ${my - bow} ${t.x} ${t.y}`}
                  fill="none"
                  stroke={industryColor(s.submission.industry_key)}
                  strokeWidth={active ? 1.4 : 0.8}
                  strokeOpacity={active ? 0.4 : 0.09}
                  pointerEvents="none"
                />
              );
            })}
          </g>

          {/* bransjeetiketter */}
          {showClusterLabels &&
            clusters.map((c) => (
              <text
                key={`label-${c.key}`}
                x={c.x}
                y={c.y - c.r + 22}
                textAnchor="middle"
                className="nodemap-cluster-label"
                fill={industryColor(c.key)}
                pointerEvents="none"
              >
                {industryLabel(c.key)}
                <tspan className="nodemap-cluster-count"> · {c.count}</tspan>
              </text>
            ))}

          {/* nodene */}
          <g>
            {nodes.map((n) => {
              if (typeof n.x !== "number" || typeof n.y !== "number") return null;
              const on = matches.has(n.id);
              const color = industryColor(n.submission.industry_key);
              const isSelected = selectedId === n.id;
              const isHover = hoverId === n.id;
              const breathe = 1 + Math.sin(clockRef.current * 0.0012 + n.phase) * 0.05;
              const r = n.radius * breathe * (isSelected ? 1.5 : isHover ? 1.28 : 1);

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  opacity={on ? 1 : 0.16}
                  style={{ cursor: "pointer" }}
                  onPointerEnter={() => setHoverId(n.id)}
                  onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (movedRef.current) return;
                    onSelect?.(isSelected ? null : n.submission);
                  }}
                >
                  {highlightId === n.id && (
                    <circle r={r} fill="none" stroke={color} strokeWidth={2} className="nodemap-pulse" />
                  )}
                  {(isSelected || isHover) && (
                    <circle r={r + 7} fill="none" stroke={color} strokeWidth={1.2} strokeOpacity={0.5} />
                  )}
                  <circle
                    r={r}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.86}
                    stroke="var(--map-node-ring)"
                    strokeWidth={1.5}
                  />
                  {(isHover || isSelected) && (
                    <text
                      className="nodemap-node-label"
                      y={-r - 12}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {n.submission.title.length > 46
                        ? n.submission.title.slice(0, 45) + "…"
                        : n.submission.title}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {nodes.length === 0 && (
        <div className="nodemap-empty">
          <p>Ingen oppgaver ennå.</p>
          <span>Den første noden dukker opp her så snart et skjema er publisert.</span>
        </div>
      )}

      <div className="nodemap-controls">
        <button type="button" onClick={() => setView((v) => ({ ...v, k: Math.min(3.2, v.k * 1.2) }))} aria-label="Zoom inn">
          +
        </button>
        <button type="button" onClick={() => setView((v) => ({ ...v, k: Math.max(0.45, v.k / 1.2) }))} aria-label="Zoom ut">
          −
        </button>
        <button type="button" onClick={resetView} aria-label="Nullstill visning">
          ⟳
        </button>
      </div>
    </div>
  );
}
