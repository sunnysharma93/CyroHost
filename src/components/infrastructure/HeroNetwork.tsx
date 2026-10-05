export function HeroNetwork() {
  return (
    <div className="frame frame-ticks min-w-0 p-3 sm:p-5">
      <svg viewBox="0 0 640 460" className="h-auto w-full" role="img" aria-labelledby="hero-net-title hero-net-desc">
        <title id="hero-net-title">Schematic of regions and a server rack</title>
        <desc id="hero-net-desc">
          A diagram linking a server rack to India and Singapore, the published compute regions, and to Mumbai and Noida as names on the Network India map.
        </desc>
        <rect width="640" height="460" fill="var(--art-paper)" />
        <g stroke="var(--art-grid)" strokeWidth="1">
          {Array.from({ length: 8 }, (_, index) => (
            <line key={`v${index}`} x1={40 + index * 78} y1="24" x2={40 + index * 78} y2="250" />
          ))}
          {Array.from({ length: 4 }, (_, index) => (
            <line key={`h${index}`} x1="40" y1={40 + index * 60} x2="600" y2={40 + index * 60} />
          ))}
        </g>
        <path d="M120 90h150M270 90 H390" fill="none" stroke="var(--art-line)" strokeDasharray="5 7" />
        <path d="M120 150h250" fill="none" stroke="var(--art-ink)" strokeDasharray="5 7" />
        <path d="M180 200h220" fill="none" stroke="var(--art-accent)" strokeDasharray="5 7" />
        <g>
          <rect x="70" y="70" width="36" height="36" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
          <text x="116" y="92" fill="var(--ink)" fontSize="13">
            India
          </text>
          <rect x="360" y="64" width="36" height="36" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
          <text x="406" y="86" fill="var(--ink)" fontSize="13">
            Singapore
          </text>
          <rect x="150" y="176" width="28" height="28" fill="var(--art-fill-orange)" stroke="var(--art-accent)" />
          <text x="188" y="196" fill="var(--ink)" fontSize="13">
            Mumbai
          </text>
          <rect x="390" y="176" width="28" height="28" fill="var(--art-fill-violet)" stroke="var(--art-ink)" />
          <text x="428" y="196" fill="var(--ink)" fontSize="13">
            Noida
          </text>
        </g>
        <g transform="translate(250 270)">
          <rect x="0" y="0" width="140" height="160" fill="var(--art-shape)" stroke="var(--art-line)" />
          {[18, 48, 78, 108, 138].map((y) => (
            <rect key={y} x="12" y={y} width="116" height="18" fill="var(--art-paper)" stroke="var(--line)" />
          ))}
        </g>
        <text x="40" y="448" fill="var(--muted)" fontSize="12">
          Solid regions are published compute. Mumbai and Noida are map names, not order cities.
        </text>
      </svg>
    </div>
  );
}
