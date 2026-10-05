"use client";

import { geoGraticule, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { useMemo, useState } from "react";
import landAtlas from "world-atlas/land-110m.json";
import {
  illustrativeLinks,
  lineNote,
  networkLocations,
  regionColor,
  type NetworkLocation,
} from "@/content/lastNetworks";

const width = 1000;
const height = 520;

function projectPoint(projection: GeoProjection, location: NetworkLocation) {
  const point = projection([location.lon, location.lat]);
  if (!point) return null;
  return { x: point[0], y: point[1] };
}

export function WorldMap({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const drawn = useMemo(() => {
    const topology = landAtlas as unknown as Topology;
    const land = feature(topology, topology.objects.land as GeometryCollection);
    const projection = geoNaturalEarth1().fitExtent(
      [
        [18, 16],
        [width - 18, height - 16],
      ],
      land,
    );
    const path = geoPath(projection);
    const points = new Map<string, { x: number; y: number }>();
    for (const location of networkLocations) {
      const point = projectPoint(projection, location);
      if (point) points.set(location.id, point);
    }
    const links = illustrativeLinks.flatMap(([from, to]) => {
      const start = points.get(from);
      const end = points.get(to);
      if (!start || !end) return [];
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2 - 16;
      return [`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`];
    });
    return {
      sphere: path({ type: "Sphere" }) ?? "",
      graticule: path(geoGraticule().step([30, 30])()) ?? "",
      land: path(land) ?? "",
      points,
      links,
    };
  }, []);

  const focus = networkLocations.find((location) => location.id === (hovered ?? selected)) ?? networkLocations[0];
  const focusPoint = drawn.points.get(focus.id);

  return (
    <div className="border border-line bg-panel">
      <div className="overflow-x-auto sm:overflow-visible">
      <div className="relative min-w-[640px] sm:min-w-0" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="World map with labelled CyroHost locations">
          <path d={drawn.sphere} fill="var(--art-paper)" />
          <path d={drawn.graticule} fill="none" stroke="var(--line)" strokeWidth="0.6" />
          <path d={drawn.land} fill="var(--art-shape)" stroke="var(--art-line)" strokeWidth="0.8" />
          {drawn.links.map((d) => (
            <path key={d} d={d} fill="none" stroke="var(--cyan)" strokeWidth="1.1" strokeDasharray="4 6" opacity="0.55" />
          ))}
        </svg>
        {networkLocations.map((location) => {
          const point = drawn.points.get(location.id);
          if (!point) return null;
          const active = location.id === selected || location.id === hovered;
          return (
            <button
              key={location.id}
              type="button"
              aria-pressed={location.id === selected}
              aria-label={`${location.city}, ${location.country}. ${location.region}. ${location.statusLabel}`}
              onMouseEnter={() => setHovered(location.id)}
              onMouseLeave={() => setHovered((current) => (current === location.id ? null : current))}
              onFocus={() => setHovered(location.id)}
              onBlur={() => setHovered((current) => (current === location.id ? null : current))}
              onClick={() => onSelect(location.id)}
              className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` }}
            >
              <span
                className="marker-pulse absolute size-3 rounded-full"
                style={{ background: regionColor[location.region] }}
                aria-hidden="true"
              />
              <span
                className="relative size-3 rounded-full ring-2 ring-panel"
                style={{
                  background: regionColor[location.region],
                  transform: active ? "scale(1.35)" : undefined,
                }}
                aria-hidden="true"
              />
            </button>
          );
        })}
        {focusPoint ? (
          <div
            className="pointer-events-none absolute z-10 hidden w-56 border border-line bg-panel p-3 shadow-[var(--shadow)] sm:block"
            style={{
              left: `${Math.min(78, Math.max(2, (focusPoint.x / width) * 100))}%`,
              top: `${Math.max(4, (focusPoint.y / height) * 100 - 18)}%`,
            }}
          >
            <p className="text-sm font-medium text-ink">{focus.city}</p>
            <p className="mt-1 text-xs text-muted">{focus.country}</p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-violet uppercase">{focus.region}</p>
            <p className="mt-2 text-xs leading-5 text-ink">{focus.statusLabel}</p>
          </div>
        ) : null}
      </div>
      </div>
      <p className="border-t border-line px-4 py-2 text-xs text-muted sm:hidden">Swipe sideways to move across the map.</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-4 py-3 text-[11px] tracking-[0.12em] text-muted uppercase">
        {(Object.keys(regionColor) as Array<keyof typeof regionColor>).map((region) => (
          <span key={region} className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: regionColor[region] }} aria-hidden="true" />
            {region}
          </span>
        ))}
      </div>
      <p className="border-t border-line px-4 py-3 text-xs leading-5 text-muted">{lineNote}</p>
    </div>
  );
}
