export function FacilitySchematic() {
  return (
    <svg viewBox="0 0 560 420" role="img" aria-label="Stylized datacenter aisle with racks, a power rail, and a cross-connect tray" className="h-auto w-full">
      <title>Colocation enquiry schematic</title>
      <rect width="560" height="420" fill="var(--art-paper)" />
      <g opacity="0.35" stroke="var(--art-accent)" fill="none">
        <path d="M40 70 H520" />
        <path d="M40 350 H520" />
      </g>
      {[120, 230, 340].map((x) => (
        <g key={x}>
          <rect x={x} y="96" width="78" height="230" fill="var(--art-shape)" stroke="var(--line)" />
          {Array.from({ length: 8 }).map((_, index) => (
            <rect key={index} x={x + 10} y={112 + index * 26} width="58" height="16" fill={index % 3 === 0 ? "var(--art-shape)" : "var(--art-shape)"} stroke="var(--art-grid)" />
          ))}
        </g>
      ))}
      <rect x="70" y="48" width="420" height="14" fill="none" stroke="var(--art-line)" />
      <text x="70" y="40" fill="var(--art-line)" fontSize="12" fontFamily="ui-monospace, monospace">
        CROSS-CONNECT
      </text>
      <text x="70" y="390" fill="var(--muted)" fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Space, power, and connectivity are scoped with sales.
      </text>
    </svg>
  );
}
