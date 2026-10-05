import { locations, type LocationStatus } from "@/content/locations";

const tone: Record<LocationStatus, string> = {
  "Published compute region": "border-cyan/50 text-cyan",
  "Named on product pages": "border-blue/40 text-blue",
  "On demand": "border-violet/40 text-violet",
  "Network map": "border-line text-muted",
};

export function LocationSchematic() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="panel p-4 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">Schematic</p>
        <svg viewBox="0 0 360 420" role="img" aria-label="Stylized map marking Mumbai and Noida on a Network India drawing, separate from India and Singapore compute regions" className="mt-4 h-auto w-full">
          <title>Location schematic</title>
          <path
            d="M150 36 C186 42 214 70 228 108 C246 112 268 140 262 176 C286 196 292 236 270 268 C276 304 250 348 214 372 C176 392 132 374 118 338 C86 328 62 286 74 244 C48 214 58 164 90 142 C96 96 118 52 150 36 Z"
            fill="var(--art-shape)"
            stroke="var(--art-line)"
          />
          <g fill="var(--art-line)">
            <circle cx="132" cy="214" r="5" />
            <circle cx="168" cy="128" r="5" />
          </g>
          <g fill="var(--ink)" fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif">
            <text x="84" y="236">
              Mumbai
            </text>
            <text x="180" y="124">
              Noida
            </text>
          </g>
          <text x="24" y="408" fill="var(--muted)" fontSize="12" fontFamily="ui-sans-serif, system-ui, sans-serif">
            Map names are not live cabinet inventory.
          </text>
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {locations.map((location) => (
          <article key={location.name} className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg text-ink">{location.name}</h3>
              <p className={`border px-2 py-1 font-mono text-[10px] tracking-wide uppercase ${tone[location.status]}`}>
                {location.status}
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{location.detail}</p>
            <p className="mt-3 font-mono text-[11px] tracking-wider text-ink/80 uppercase">{location.appliesTo}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
