"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { geoGraticule, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { Component, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import landAtlas from "world-atlas/land-110m.json";
import { authArcNote, authArcs, authPlaces } from "@/content/authGlobe";

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

const AuthGlobe = dynamic(() => import("@/components/three/AuthGlobe"), { ssr: false });

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function facing(lon: number, lat: number, centerLon: number, centerLat: number) {
  const lambda = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda0 = (centerLon * Math.PI) / 180;
  const phi0 = (centerLat * Math.PI) / 180;
  return Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0) > 0.08;
}

function FlatGlobe({ selected, spinning }: { selected: string; spinning: boolean }) {
  const clipId = useId().replace(/:/g, "");
  const frame = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 480, height: 480 });
  const [centerLon, setCenterLon] = useState(78);
  const centerLat = 16;

  useEffect(() => {
    const node = frame.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.max(220, width), height: Math.max(220, height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!spinning) return undefined;
    const timer = window.setInterval(() => {
      setCenterLon((value) => (value + 0.7) % 360);
    }, 80);
    return () => window.clearInterval(timer);
  }, [spinning]);

  const drawn = useMemo(() => {
    const topology = landAtlas as unknown as Topology;
    const land = feature(topology, topology.objects.land as GeometryCollection);
    const radius = Math.min(size.width, size.height) * 0.38;
    const projection = geoOrthographic()
      .translate([size.width / 2, size.height / 2])
      .scale(radius)
      .rotate([-centerLon, -centerLat])
      .clipAngle(90);
    const path = geoPath(projection);
    const points = authPlaces.flatMap((place) => {
      if (!facing(place.lon, place.lat, centerLon, centerLat)) return [];
      const point = projection([place.lon, place.lat]);
      if (!point) return [];
      return [{ ...place, x: point[0], y: point[1] }];
    });
    const arcs = authArcs.flatMap(([fromId, toId]) => {
      const from = points.find((place) => place.id === fromId);
      const to = points.find((place) => place.id === toId);
      if (!from || !to) return [];
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - radius * 0.08;
      return [`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`];
    });
    const labels = points.filter((place, index) => {
      if (place.id === selected) return true;
      return !points.slice(0, index).some((other) => Math.hypot(other.x - place.x, other.y - place.y) < 54);
    });
    return {
      radius,
      land: path(land) ?? "",
      graticule: path(geoGraticule().step([20, 20])()) ?? "",
      points,
      labels,
      arcs,
    };
  }, [centerLat, centerLon, selected, size.height, size.width]);

  return (
    <div ref={frame} className="h-full w-full">
      <svg viewBox={`0 0 ${size.width} ${size.height}`} className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${clipId}-glow`} cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor="#24325c" />
            <stop offset="70%" stopColor="#10182e" />
            <stop offset="100%" stopColor="#0b1020" />
          </radialGradient>
          <clipPath id={clipId}>
            <circle cx={size.width / 2} cy={size.height / 2} r={drawn.radius} />
          </clipPath>
        </defs>
        <circle cx={size.width / 2} cy={size.height / 2} r={drawn.radius + 10} fill="none" stroke="#7dcec2" strokeOpacity="0.28" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx={size.width / 2} cy={size.height / 2} r={drawn.radius} fill={`url(#${clipId}-glow)`} />
          <path d={drawn.graticule} fill="none" stroke="rgba(125,206,194,0.18)" strokeWidth="0.7" />
          <path d={drawn.land} fill="#2a3d68" stroke="rgba(141,232,214,0.7)" strokeWidth="0.8" />
          {drawn.arcs.map((d) => (
            <path key={d} d={d} className="flow-line" fill="none" stroke="#7dcec2" strokeWidth="1.2" />
          ))}
        </g>
        {drawn.points.map((place) => (
          <g key={place.id} transform={`translate(${place.x} ${place.y})`}>
            <circle r={place.id === selected ? 10 : 7} fill={place.color} opacity="0.28" className="auth-ping" />
            <circle r={place.id === selected ? 4.5 : 3.2} fill={place.color} />
            {drawn.labels.some((label) => label.id === place.id) ? (
              <text y={-12} textAnchor="middle" fill="#e7f6f2" fontSize="11">
                {place.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AuthMapPanel() {
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState("singapore");
  const [hovered, setHovered] = useState<string | null>(null);
  const failed = useRef(false);
  const place = authPlaces.find((item) => item.id === (hovered ?? selected)) ?? authPlaces[0];
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
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      narrow.removeEventListener("change", apply);
      motion.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section
      className="relative flex w-full min-w-0 flex-col overflow-hidden bg-[#070b16] text-white md:h-full md:w-1/2 md:shrink-0"
      aria-label="Infrastructure locations of interest"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 46%, rgba(70, 48, 130, 0.45), transparent 62%), radial-gradient(ellipse 40% 30% at 18% 80%, rgba(15, 110, 98, 0.28), transparent 70%)",
        }}
      />
      <div className="relative z-10 px-5 pt-5 sm:px-8 sm:pt-7">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="CyroHost home">
          <Image src="/brand/logo.png" alt="" width={36} height={36} className="mix-blend-screen" />
          <span className="text-base tracking-tight text-white">
            Cyro<span className="text-[#9adfd4]">Host</span>
          </span>
        </Link>
        <h2 className="mt-4 max-w-md text-[1.55rem] leading-[1.15] font-light text-white sm:mt-6 sm:text-[2rem]">
          Your Infrastructure. Without Borders.
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#c5ddd7] sm:mt-3">
          Connect to cloud infrastructure across a world of possibilities.
        </p>
      </div>
      <div className="relative z-10 h-[210px] min-h-0 sm:h-[240px] md:h-auto md:min-h-0 md:flex-1">
        <div className={`absolute inset-0 ${showGlobe ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <FlatGlobe selected={selected} spinning={!reduce && !showGlobe} />
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
              <AuthGlobe
                active={visible}
                compact={compact}
                selected={selected}
                spinning={!reduce}
                onSelect={setSelected}
                onHover={setHovered}
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
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-[90%] -translate-x-1/2 border border-[#2c4158] bg-[#0d1428] px-3 py-1.5 text-center text-xs text-[#e7f6f2]">
          {place.name}
          <span className="text-[#9fb8b2]"> · {place.status}</span>
        </p>
      </div>
      <div className="relative z-10 px-5 pt-3 pb-4 sm:px-8 sm:pb-6">
        <ul className="flex gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0" aria-label="Locations of interest">
          {authPlaces.map((item) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={item.id === selected}
                onClick={() => setSelected(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(item.id)}
                onBlur={() => setHovered(null)}
                className={`min-h-11 border px-2.5 text-[11px] tracking-wide md:min-h-9 ${item.id === selected ? "border-[#7dcec2] text-white" : "border-[#2a3b52] text-[#b7c9c4] hover:border-[#7dcec2]"}`}
              >
                <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: item.color }} aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-[#d5e8e3]">{place.note}</p>
        <p className="mt-1 text-[11px] leading-5 text-[#8ea8a2]">{authArcNote}</p>
      </div>
    </section>
  );
}
