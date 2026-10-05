"use client";

import { geoGraticule, geoNaturalEarth1, geoPath } from "d3-geo";
import Link from "next/link";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { useMemo, useState } from "react";
import landAtlas from "world-atlas/land-110m.json";
import { mapKindLabel, mapPoints, type MapKind, type MapPoint } from "@/content/map";

const width = 1000;
const height = 520;

const coords: Record<string, [number, number]> = {
  india: [79, 22.5],
  mumbai: [72.88, 19.08],
  noida: [77.39, 28.54],
  singapore: [103.82, 1.35],
  germany: [10.45, 51.16],
  "united-states": [-98.6, 39.8],
  japan: [138.25, 36.2],
  netherlands: [5.29, 52.13],
  "united-kingdom": [-2, 54],
  canada: [-106.35, 56.13],
  "new-zealand": [174.89, -40.9],
};

const kindColor: Record<MapKind, string> = {
  compute: "var(--cyan)",
  "on-demand": "var(--violet)",
  named: "var(--orange)",
  "network-map": "var(--mint)",
  unpublished: "var(--muted)",
};

export function LocationMap({ initialId = "india" }: { initialId?: string }) {
  const [activeId, setActiveId] = useState(initialId);
  const active = useMemo(() => mapPoints.find((point) => point.id === activeId) ?? mapPoints[0], [activeId]);
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
    for (const point of mapPoints) {
      const pair = coords[point.id];
      if (!pair) continue;
      const projected = projection(pair);
      if (projected) points.set(point.id, { x: projected[0], y: projected[1] });
    }
    return {
      sphere: path({ type: "Sphere" }) ?? "",
      graticule: path(geoGraticule().step([30, 30])()) ?? "",
      land: path(land) ?? "",
      points,
    };
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)]">
      <div className="panel min-w-0 p-3 sm:p-5">
        <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-labelledby="world-map-title world-map-desc">
          <title id="world-map-title">CyroHost location map</title>
          <desc id="world-map-desc">
            A world map with labelled locations. Filled markers are published compute regions. Other markers are on demand, named on a product page, on the Network India map, or not published as operational sites.
          </desc>
          <path d={drawn.sphere} fill="var(--art-paper)" />
          <path d={drawn.graticule} fill="none" stroke="var(--line)" strokeWidth="0.6" />
          <path d={drawn.land} fill="var(--art-shape)" stroke="var(--art-line)" strokeWidth="0.7" />
        </svg>
        {mapPoints.map((point) => {
          const placed = drawn.points.get(point.id);
          if (!placed) return null;
          return (
            <button
              key={`pin-${point.id}`}
              type="button"
              aria-pressed={point.id === active.id}
              aria-label={`${point.country === point.name ? point.name : `${point.country}, ${point.name}`}. ${mapKindLabel[point.kind]}`}
              onClick={() => setActiveId(point.id)}
              className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ left: `${(placed.x / width) * 100}%`, top: `${(placed.y / height) * 100}%` }}
            >
              <span
                className="size-2.5 rounded-full ring-2 ring-panel"
                style={{
                  background: point.kind === "unpublished" ? "transparent" : kindColor[point.kind],
                  border: `2px solid ${kindColor[point.kind]}`,
                  transform: point.id === active.id ? "scale(1.35)" : undefined,
                }}
                aria-hidden="true"
              />
            </button>
          );
        })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-hidden="true">
          {(Object.keys(mapKindLabel) as MapKind[]).map((kind) => (
            <span key={kind} className="inline-flex items-center gap-2 text-xs text-muted">
              <span className="size-2.5 rounded-full border" style={{ background: kind === "unpublished" ? "transparent" : kindColor[kind], borderColor: kindColor[kind] }} />
              {mapKindLabel[kind]}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          Coastlines are a geographic reference. Markers are labels. CyroHost does not claim owned fibre, owned data centres, or an autonomous system.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {mapPoints.map((point) => (
            <button
              key={point.id}
              type="button"
              aria-pressed={point.id === active.id}
              onClick={() => setActiveId(point.id)}
              className="flex min-h-11 items-center justify-between gap-3 border border-line px-3 py-2 text-left text-sm hover:border-cyan"
            >
              <span>
                <span className="block text-ink">
                  {point.country === point.name ? point.name : `${point.country} — ${point.name}`}
                </span>
                <span className="text-xs text-muted">{mapKindLabel[point.kind]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <LocationCard point={active} />
    </div>
  );
}

function LocationCard({ point }: { point: MapPoint }) {
  return (
    <article className="panel h-fit p-5 sm:p-6" aria-live="polite">
      <p className="kicker">{mapKindLabel[point.kind]}</p>
      <h3 className="mt-3 text-2xl tracking-tight">
        {point.country === point.name ? point.name : `${point.country} — ${point.name}`}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{point.specs}</p>
      <h4 className="mt-5 text-sm text-ink">What is published</h4>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-muted">
        {point.products.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h4 className="mt-5 text-sm text-ink">Relevant use</h4>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-muted">
        {point.useCases.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-5 text-muted">No latency figure is shown. None was published with a measurement method.</p>
      <Link href={point.href} className="mt-5 inline-flex min-h-11 items-center text-sm text-cyan">
        {point.hrefLabel}
      </Link>
    </article>
  );
}
