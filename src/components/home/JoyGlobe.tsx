"use client";

import { useState } from "react";

type Kind = "published" | "map" | "demo";

type Pin = {
  id: string;
  name: string;
  kind: Kind;
  x: number;
  y: number;
  note: string;
};

const pins: Pin[] = [
  { id: "india", name: "India", kind: "published", x: 68, y: 48, note: "Published compute region. The public pages do not name a city." },
  { id: "mumbai", name: "Mumbai", kind: "map", x: 66, y: 52, note: "Demo pin. Named on the Network India map. Not a VPS order city." },
  { id: "noida", name: "Noida", kind: "map", x: 70, y: 44, note: "Demo pin. Named on the Network India map. Rack space is not confirmed." },
  { id: "singapore", name: "Singapore", kind: "published", x: 76, y: 58, note: "Published compute region. Intel VPS page and game pages name Singapore." },
  { id: "germany", name: "Germany", kind: "map", x: 52, y: 36, note: "Named on some product lists. No separate order page was published." },
  { id: "us", name: "United States", kind: "map", x: 24, y: 42, note: "Listed as on demand. Not an instant-deploy region." },
  { id: "japan", name: "Japan", kind: "demo", x: 82, y: 40, note: "Demo pin. No public CyroHost page names Japan." },
  { id: "uk", name: "United Kingdom", kind: "demo", x: 48, y: 34, note: "Demo pin. No public CyroHost page names the United Kingdom." },
  { id: "nl", name: "Netherlands", kind: "demo", x: 51, y: 32, note: "Demo pin. No public CyroHost page names the Netherlands." },
];

const kindLabel: Record<Kind, string> = {
  published: "Published",
  map: "Named, not orderable",
  demo: "Demo · not published",
};

export function JoyGlobe() {
  const [active, setActive] = useState(pins[0]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.8fr)]">
      <div className="relative min-w-0">
        <svg viewBox="0 0 640 420" className="h-auto w-full" role="img" aria-label="Demo globe. Markers are not live network routes.">
          <defs>
            <radialGradient id="globe-shade" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="var(--panel)" />
              <stop offset="100%" stopColor="var(--raised)" />
            </radialGradient>
          </defs>
          <circle cx="250" cy="210" r="168" fill="url(#globe-shade)" stroke="var(--line)" />
          <ellipse cx="250" cy="210" rx="70" ry="168" fill="none" stroke="var(--line)" />
          <ellipse cx="250" cy="210" rx="168" ry="60" fill="none" stroke="var(--line)" />
          <path d="M90 150c80 30 160 30 320 0" fill="none" stroke="#0f62fe" strokeOpacity="0.45" />
          <path d="M120 250c90-20 180-10 250 30" fill="none" stroke="#0f62fe" strokeOpacity="0.35" />
          {pins.map((pin) => (
            <g key={pin.id} transform={`translate(${80 + pin.x * 3.2} ${40 + pin.y * 3.1})`}>
              <circle r={pin.id === active.id ? 7 : 4.5} fill={pin.kind === "demo" ? "transparent" : "#0f62fe"} stroke="#0f62fe" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        <p className="mt-2 text-xs text-muted">Demo schematic. Lines are not fibre routes, and CyroHost does not claim to own a network.</p>
      </div>
      <div className="border border-line bg-panel">
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            onClick={() => setActive(pin)}
            aria-pressed={pin.id === active.id}
            className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 ${pin.id === active.id ? "bg-raised" : ""}`}
          >
            <span className={`mt-1 h-8 w-0.5 ${pin.kind === "published" ? "bg-accent" : pin.kind === "map" ? "bg-violet" : "bg-line"}`} />
            <span>
              <span className="block font-mono text-[10px] tracking-[0.16em] text-cyan uppercase">{kindLabel[pin.kind]}</span>
              <span className="mt-1 block text-sm text-ink">{pin.name}</span>
              {pin.id === active.id ? <span className="mt-1 block text-sm leading-6 text-muted">{pin.note}</span> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
