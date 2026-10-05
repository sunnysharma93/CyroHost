"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { globeArcNote, globeKindLabel, globeSites, type GlobeKind } from "@/content/globe";

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const NetworkGlobe = dynamic(() => import("@/components/three/NetworkGlobe"), { ssr: false });

const kindDot: Record<GlobeKind, string> = {
  verified: "bg-mint",
  map: "bg-orange",
  request: "bg-violet",
  illustrative: "bg-muted",
};

function project(lat: number, lon: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = -Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  const yaw = 2.95;
  const xr = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zr = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return { x: 200 + xr * 118, y: 168 - y * 118, front: zr > -0.05 };
}

function FallbackGlobe({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 400 340" className="h-full w-full" role="img" aria-label="Static globe fallback with labelled locations">
      <circle cx="200" cy="168" r="118" fill="var(--art-paper)" stroke="var(--line)" />
      <ellipse cx="200" cy="168" rx="48" ry="118" fill="none" stroke="var(--line)" />
      <ellipse cx="200" cy="168" rx="92" ry="118" fill="none" stroke="var(--line)" />
      <ellipse cx="200" cy="168" rx="118" ry="42" fill="none" stroke="var(--line)" />
      <ellipse cx="200" cy="168" rx="118" ry="78" fill="none" stroke="var(--line)" />
      {globeSites.map((site) => {
        const point = project(site.lat, site.lon);
        if (!point.front) return null;
        const active = site.id === selected;
        return (
          <g key={site.id} transform={`translate(${point.x} ${point.y})`}>
            <circle r={active ? 7 : 4.5} fill={site.markerColor} />
            <text y={active ? -12 : -10} textAnchor="middle" fill="var(--ink)" fontSize="10">
              {site.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function GlobeStage() {
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [visible, setVisible] = useState(true);
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState("india");
  const failed = useRef(false);
  const frame = useMemo(() => ({ node: null as HTMLDivElement | null }), []);
  const site = globeSites.find((item) => item.id === selected) ?? globeSites[0];
  const showGlobe = ready && webgl && !lost;

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setCompact(narrow.matches);
      setReduce(motion.matches);
      if (!failed.current) setWebgl(canUseWebGL());
    };
    apply();
    narrow.addEventListener("change", apply);
    motion.addEventListener("change", apply);

    const theme = () => {
      const value = document.documentElement.dataset.theme;
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(value === "dark" || (value === "system" && systemDark));
    };
    theme();
    window.addEventListener("cyro-theme-change", theme);

    const node = frame.node;
    let observer: IntersectionObserver | undefined;
    if (node) {
      observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
      observer.observe(node);
    }

    return () => {
      narrow.removeEventListener("change", apply);
      motion.removeEventListener("change", apply);
      window.removeEventListener("cyro-theme-change", theme);
      observer?.disconnect();
    };
  }, [frame]);

  return (
    <div className="grid gap-4">
      <div
        ref={(node) => {
          frame.node = node;
        }}
        className="relative h-[340px] overflow-hidden border border-line bg-panel sm:h-[420px]"
        aria-busy={webgl && !showGlobe}
      >
        <div className={`absolute inset-0 ${showGlobe ? "pointer-events-none opacity-0" : "opacity-100"}`} aria-hidden={showGlobe}>
          <FallbackGlobe selected={selected} />
          {webgl && !showGlobe ? <p className="sr-only">Loading the globe</p> : null}
        </div>
        {webgl ? (
          <div className={`absolute inset-0 transition-opacity duration-700 ${showGlobe ? "opacity-100" : "opacity-0"}`}>
            <Boundary
              onError={() => {
                failed.current = true;
                setWebgl(false);
                setReady(false);
                setLost(false);
              }}
            >
              <NetworkGlobe
                key={compact ? "compact" : "desktop"}
                active={visible}
                compact={compact}
                selected={selected}
                onSelect={setSelected}
                dark={dark}
                spinning={!reduce}
                onReady={() => {
                  setLost(false);
                  setReady(true);
                }}
                onContextLost={() => {
                  setLost(true);
                  setReady(false);
                }}
              />
            </Boundary>
          </div>
        ) : null}
      </div>
      <p className="text-xs leading-5 text-muted">{globeArcNote}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-[0.12em] text-muted uppercase">
        {(Object.keys(globeKindLabel) as GlobeKind[]).map((kind) => (
          <span key={kind} className="inline-flex items-center gap-2">
            <span className={`size-2 rounded-full ${kindDot[kind]}`} aria-hidden="true" />
            {globeKindLabel[kind]}
          </span>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ul className="grid max-h-56 gap-1 overflow-auto border border-line bg-panel p-2" aria-label="Globe locations">
          {globeSites.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={item.id === selected}
                onClick={() => setSelected(item.id)}
                className={`flex min-h-11 w-full items-center justify-between gap-3 px-2 text-left text-sm ${item.id === selected ? "bg-raised text-ink" : "text-muted hover:text-ink"}`}
              >
                <span>{item.name}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase">{globeKindLabel[item.kind]}</span>
              </button>
            </li>
          ))}
        </ul>
        <article className="border border-line bg-panel p-4">
          <p className="font-mono text-[10px] tracking-[0.14em] text-violet uppercase">{globeKindLabel[site.kind]}</p>
          <h3 className="mt-2 text-xl font-medium tracking-tight">{site.name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{site.detail}</p>
          <Link href={site.href} className="mt-4 inline-flex min-h-11 items-center text-sm text-cyan">
            {site.hrefLabel}
          </Link>
        </article>
      </div>
    </div>
  );
}
