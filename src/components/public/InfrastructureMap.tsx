"use client";

import { geoGraticule, geoNaturalEarth1, geoPath } from "d3-geo";
import Link from "next/link";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { useMemo, useState } from "react";
import landAtlas from "world-atlas/land-110m.json";
import { globeKindLabel, globeSites, type GlobeKind } from "@/content/globe";
import { links } from "@/config/site";

const width = 1000;
const height = 520;

const kindDot: Record<GlobeKind, string> = {
  verified: "bg-mint",
  map: "bg-orange",
  request: "bg-violet",
  illustrative: "bg-muted",
};

export function InfrastructureMap() {
  const [selected, setSelected] = useState("india");
  const [hovered, setHovered] = useState<string | null>(null);
  const drawn = useMemo(() => {
    const topology = landAtlas as unknown as Topology;
    const land = feature(topology, topology.objects.land as GeometryCollection);
    const projection = geoNaturalEarth1().fitExtent(
      [
        [16, 12],
        [width - 16, height - 12],
      ],
      land,
    );
    const path = geoPath(projection);
    const points = new Map<string, { x: number; y: number }>();
    for (const site of globeSites) {
      const point = projection([site.lon, site.lat]);
      if (point) points.set(site.id, { x: point[0], y: point[1] });
    }
    return {
      sphere: path({ type: "Sphere" }) ?? "",
      graticule: path(geoGraticule().step([30, 30])()) ?? "",
      land: path(land) ?? "",
      points,
    };
  }, []);

  const focus = globeSites.find((site) => site.id === (hovered ?? selected)) ?? globeSites[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="border border-line bg-panel">
        <div className="overflow-x-auto">
          <div className="relative min-w-[36rem]" style={{ aspectRatio: `${width} / ${height}` }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="World map of labelled CyroHost locations">
              <path d={drawn.sphere} fill="var(--art-paper)" />
              <path d={drawn.graticule} fill="none" stroke="var(--line)" strokeWidth="0.6" />
              <path d={drawn.land} fill="var(--art-shape)" stroke="var(--art-line)" strokeWidth="0.7" />
            </svg>
            {globeSites.map((site) => {
              const point = drawn.points.get(site.id);
              if (!point) return null;
              const active = site.id === selected || site.id === hovered;
              return (
                <button
                  key={site.id}
                  type="button"
                  aria-pressed={site.id === selected}
                  aria-label={`${site.name}. ${globeKindLabel[site.kind]}`}
                  onMouseEnter={() => setHovered(site.id)}
                  onMouseLeave={() => setHovered((current) => (current === site.id ? null : current))}
                  onFocus={() => setHovered(site.id)}
                  onBlur={() => setHovered((current) => (current === site.id ? null : current))}
                  onClick={() => setSelected(site.id)}
                  className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                  style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` }}
                >
                  <span className={`size-2.5 rounded-full ring-2 ring-panel ${kindDot[site.kind]} ${active ? "scale-125" : ""}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line px-4 py-3 text-[11px] tracking-[0.12em] text-muted uppercase">
          {(Object.keys(globeKindLabel) as GlobeKind[]).map((kind) => (
            <span key={kind} className="inline-flex items-center gap-2">
              <span className={`size-2 rounded-full ${kindDot[kind]}`} aria-hidden="true" />
              {globeKindLabel[kind]}
            </span>
          ))}
        </div>
        <div className="grid border-t border-line sm:grid-cols-2">
          {globeSites.map((site) => (
            <button
              key={`list-${site.id}`}
              type="button"
              aria-pressed={site.id === selected}
              onClick={() => setSelected(site.id)}
              className={`flex min-h-11 items-center justify-between gap-3 border-t border-line px-4 text-left text-sm sm:[&:nth-child(-n+2)]:border-t-0 ${site.id === selected ? "bg-raised text-ink" : "text-muted hover:text-ink"}`}
            >
              <span>{site.name}</span>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase">{globeKindLabel[site.kind]}</span>
            </button>
          ))}
        </div>
        <p className="border-t border-line px-4 py-3 text-xs leading-5 text-muted">
          Coastlines are a geographic reference. Markers are labels, not live routes, latency, or capacity.
        </p>
      </div>
      <aside className="border border-line bg-panel p-5">
        <p className="font-mono text-[10px] tracking-[0.16em] text-violet uppercase">{globeKindLabel[focus.kind]}</p>
        <h3 className="mt-3 text-2xl font-light tracking-tight">{focus.name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{focus.detail}</p>
        <Link href={focus.href} className="mt-5 inline-flex min-h-11 items-center text-sm text-cyan">
          {focus.hrefLabel}
        </Link>
        <a href={links.whatsapp} className="mt-2 block text-sm text-muted hover:text-ink" target="_blank" rel="noopener noreferrer">
          WhatsApp {links.whatsappNumber}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </aside>
    </div>
  );
}
