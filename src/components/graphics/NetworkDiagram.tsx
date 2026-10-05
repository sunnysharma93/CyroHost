export function NetworkDiagram() {
  return (
    <svg viewBox="0 0 640 420" role="img" aria-label="Schematic of a customer network reaching a BGP session, IP transit, announced routes, and an address pool" className="h-auto w-full">
      <title>Network enquiry topology</title>
      <defs>
        <pattern id="net-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--art-grid)" />
        </pattern>
      </defs>
      <rect width="640" height="420" fill="url(#net-dots)" />
      <g fill="none" stroke="var(--art-line)" strokeWidth="1.25" className="flow-line">
        <path d="M218 210 H250" />
        <path d="M390 210 H470" />
        <path d="M390 210 C430 210 430 140 470 140" />
        <path d="M390 210 C430 210 430 280 470 280" />
      </g>
      <Node x={78} y={182} label="Your network" detail="ASN or site" />
      <Node x={250} y={182} label="BGP session" detail="Prefixes" accent />
      <Node x={470} y={112} label="IP transit" detail="Bandwidth" />
      <Node x={470} y={182} label="Routes" detail="Announcements" />
      <Node x={470} y={252} label="Addresses" detail="IPv4 pool" />
      <text x="32" y="390" fill="var(--muted)" fontSize="12" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Capacity, peers, and allocations are confirmed per enquiry.
      </text>
    </svg>
  );
}

function Node({
  x,
  y,
  label,
  detail,
  accent = false,
}: {
  x: number;
  y: number;
  label: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width="140" height="56" fill="var(--art-shape)" stroke={accent ? "var(--art-line)" : "var(--line)"} />
      <text x={x + 70} y={y + 24} textAnchor="middle" fill="var(--ink)" fontSize="14" fontFamily="ui-sans-serif, system-ui, sans-serif">
        {label}
      </text>
      <text x={x + 70} y={y + 42} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="ui-monospace, monospace">
        {detail}
      </text>
    </g>
  );
}
