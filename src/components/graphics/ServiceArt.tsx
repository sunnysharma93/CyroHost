const labels: Record<string, string> = {
  cloud: "Illustration of a virtual server rack with network links",
  vps: "Illustration of stacked virtual machines on one host",
  vds: "Illustration of reserved processor and memory blocks",
  rdp: "Illustration of a remote desktop session",
  storage: "Illustration of object storage buckets",
  dedicated: "Illustration of a single physical server",
  games: "Illustration of game server nodes",
  labs: "Illustration of a network exchange",
  transit: "Illustration of traffic crossing between networks",
  bgp: "Illustration of two networks exchanging routes",
  leasing: "Illustration of leased address blocks",
  edge: "Illustration of equipment at the edge of a network",
  colocation: "Illustration of customer hardware in a shared hall",
  web: "Illustration of a site served from hosted infrastructure",
  hosting: "Illustration of an application and its database",
};

export function ServiceArt({ id }: { id: string }) {
  const label = labels[id] ?? "Infrastructure illustration";
  return (
    <div className="frame frame-ticks overflow-hidden">
      <svg viewBox="0 0 960 420" role="img" aria-label={label} className="block h-auto w-full">
        <rect width="960" height="420" fill="var(--art-paper)" />
        <g stroke="var(--art-grid)" strokeWidth="1">
          {Array.from({ length: 12 }, (_, index) => (
            <line key={`v${index}`} x1={80 + index * 72} y1="36" x2={80 + index * 72} y2="384" />
          ))}
          {Array.from({ length: 6 }, (_, index) => (
            <line key={`h${index}`} x1="48" y1={48 + index * 64} x2="912" y2={48 + index * 64} />
          ))}
        </g>
        <Scene id={id} />
      </svg>
    </div>
  );
}

function Scene({ id }: { id: string }) {
  if (id === "transit" || id === "labs") return <Transit />;
  if (id === "bgp") return <Bgp />;
  if (id === "leasing") return <Addresses />;
  if (id === "colocation" || id === "edge") return <Hall />;
  if (id === "storage") return <Buckets />;
  if (id === "rdp") return <Desktop />;
  if (id === "games") return <Players />;
  if (id === "web" || id === "hosting") return <Site />;
  if (id === "dedicated" || id === "vds") return <Machine />;
  return <Rack />;
}

function Rack() {
  return (
    <g>
      <rect x="330" y="54" width="300" height="312" fill="var(--art-shape)" stroke="var(--art-line)" />
      {Array.from({ length: 6 }, (_, index) => (
        <g key={index} transform={`translate(354 ${78 + index * 46})`}>
          <rect width="252" height="32" fill={index % 2 ? "var(--art-fill-violet)" : "var(--art-fill-mint)"} />
          <circle cx="16" cy="16" r="4" fill="var(--art-line)" />
          <circle cx="32" cy="16" r="4" fill="var(--art-accent)" />
        </g>
      ))}
      <path d="M180 160 H330 M630 160 H800 M800 160 V250 H860" fill="none" stroke="var(--art-line)" strokeWidth="2" />
      <rect x="132" y="136" width="48" height="48" fill="var(--art-shape)" stroke="var(--art-ink)" />
      <rect x="836" y="226" width="48" height="48" fill="var(--art-shape)" stroke="var(--art-accent)" />
    </g>
  );
}

function Machine() {
  return (
    <g>
      <rect x="250" y="90" width="460" height="240" fill="var(--art-shape)" stroke="var(--art-line)" />
      <rect x="278" y="122" width="180" height="176" fill="var(--art-fill-mint)" />
      <rect x="486" y="122" width="190" height="80" fill="var(--art-fill-violet)" />
      <rect x="486" y="218" width="190" height="80" fill="var(--art-fill-orange)" />
      <circle cx="310" cy="158" r="6" fill="var(--art-line)" />
      <text x="278" y="78" fill="var(--art-line)" fontSize="14" fontFamily="ui-monospace, monospace">
        RESERVED
      </text>
    </g>
  );
}

function Desktop() {
  return (
    <g>
      <rect x="180" y="48" width="600" height="300" fill="var(--art-shape)" stroke="var(--art-line)" />
      <rect x="204" y="72" width="360" height="220" fill="var(--art-shape)" stroke="var(--art-ink)" />
      <rect x="588" y="72" width="168" height="48" fill="var(--art-fill-mint)" />
      <rect x="588" y="136" width="168" height="48" fill="var(--art-fill-violet)" />
      <rect x="588" y="200" width="168" height="48" fill="var(--art-fill-orange)" />
      <rect x="420" y="348" width="120" height="16" fill="var(--art-shape)" />
    </g>
  );
}

function Buckets() {
  return (
    <g>
      {[0, 1, 2].map((column) => (
        <g key={column} transform={`translate(${150 + column * 230} 80)`}>
          <path d="M20 40 H180 L160 250 H40 Z" fill="var(--art-shape)" stroke="var(--art-line)" />
          <ellipse cx="100" cy="40" rx="80" ry="18" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
          {[0, 1, 2].map((row) => (
            <rect key={row} x={48 + (row % 2) * 28} y={80 + row * 42} width="36" height="28" fill={row === 1 ? "var(--art-accent)" : "var(--art-ink)"} />
          ))}
        </g>
      ))}
    </g>
  );
}

function Transit() {
  return (
    <g fill="none" strokeWidth="2">
      <path d="M120 210 H300" stroke="var(--art-line)" />
      <path d="M420 210 H660" stroke="var(--art-ink)" />
      <path d="M780 210 H860" stroke="var(--art-accent)" />
      <path d="M360 120 V300" stroke="var(--art-line)" />
      <rect x="300" y="150" width="120" height="120" fill="var(--art-shape)" stroke="var(--art-line)" />
      <rect x="80" y="174" width="72" height="72" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
      <rect x="660" y="150" width="120" height="120" fill="var(--art-shape)" stroke="var(--art-ink)" />
      <circle cx="860" cy="210" r="22" fill="var(--art-shape)" stroke="var(--art-accent)" />
    </g>
  );
}

function Bgp() {
  return (
    <g>
      <rect x="80" y="90" width="280" height="240" fill="var(--art-shape)" stroke="var(--art-line)" />
      <rect x="600" y="90" width="280" height="240" fill="var(--art-shape)" stroke="var(--art-accent)" />
      <path d="M360 170 H600 M360 250 H600" fill="none" stroke="var(--art-ink)" strokeWidth="3" />
      <text x="110" y="140" fill="var(--art-line)" fontSize="18" fontFamily="ui-monospace, monospace">
        ASN
      </text>
      <text x="630" y="140" fill="var(--art-ink)" fontSize="18" fontFamily="ui-monospace, monospace">
        ASN
      </text>
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="110" y={170 + row * 42} width="180" height="28" fill="var(--art-fill-mint)" />
          <rect x="630" y={170 + row * 42} width="180" height="28" fill="var(--art-fill-orange)" />
        </g>
      ))}
    </g>
  );
}

function Addresses() {
  return (
    <g>
      {Array.from({ length: 16 }, (_, index) => {
        const column = index % 8;
        const row = Math.floor(index / 8);
        const leased = index < 6 || (index > 8 && index < 12);
        return (
          <rect
            key={index}
            x={120 + column * 92}
            y={110 + row * 100}
            width="76"
            height="64"
            fill={leased ? "var(--art-fill-violet)" : "var(--art-shape)"}
            stroke={leased ? "var(--art-line)" : "var(--line)"}
          />
        );
      })}
    </g>
  );
}

function Hall() {
  return (
    <g>
      <rect x="80" y="60" width="800" height="300" fill="none" stroke="var(--art-line)" />
      {[0, 1, 2, 3].map((index) => (
        <g key={index} transform={`translate(${120 + index * 190} 100)`}>
          <rect width="140" height="210" fill="var(--art-shape)" stroke={index === 1 ? "var(--art-accent)" : "var(--art-ink)"} />
          {Array.from({ length: 5 }, (_, row) => (
            <rect key={row} x="16" y={18 + row * 36} width="108" height="22" fill={row % 2 ? "var(--art-fill-mint)" : "var(--art-fill-violet)"} />
          ))}
        </g>
      ))}
    </g>
  );
}

function Players() {
  return (
    <g>
      <rect x="360" y="70" width="240" height="280" fill="var(--art-shape)" stroke="var(--art-line)" />
      {[0, 1, 2, 3].map((index) => (
        <rect key={index} x="384" y={98 + index * 58} width="192" height="40" fill={index === 2 ? "var(--art-fill-orange)" : "var(--art-fill-mint)"} />
      ))}
      <circle cx="180" cy="140" r="36" fill="var(--art-fill-violet)" />
      <circle cx="180" cy="280" r="36" fill="var(--art-fill-mint)" />
      <circle cx="780" cy="210" r="36" fill="var(--art-fill-orange)" />
      <path d="M216 140 H360 M216 280 H360 M600 210 H744" fill="none" stroke="var(--art-line)" strokeWidth="2" />
    </g>
  );
}

function Site() {
  return (
    <g>
      <rect x="120" y="70" width="420" height="280" fill="var(--art-shape)" stroke="var(--art-line)" />
      <rect x="148" y="98" width="364" height="36" fill="var(--art-fill-mint)" />
      <rect x="148" y="154" width="220" height="160" fill="var(--art-fill-violet)" />
      <rect x="384" y="154" width="128" height="72" fill="var(--art-fill-orange)" />
      <rect x="384" y="242" width="128" height="72" fill="var(--art-fill-mint)" />
      <rect x="620" y="130" width="210" height="160" fill="var(--art-shape)" stroke="var(--art-ink)" />
      <path d="M540 210 H620" fill="none" stroke="var(--art-line)" strokeWidth="2" />
      <text x="650" y="180" fill="var(--art-line)" fontSize="16" fontFamily="ui-monospace, monospace">
        DATA
      </text>
    </g>
  );
}
