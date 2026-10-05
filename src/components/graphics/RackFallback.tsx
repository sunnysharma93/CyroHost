export function RackFallback() {
  return (
    <svg viewBox="0 0 640 720" aria-hidden="true" className="h-full w-full">
      <title>Infrastructure core</title>
      <defs>
        <linearGradient id="rack-glow" x1="0" x2="1">
          <stop offset="0" stopColor="var(--art-fill-mint)" />
          <stop offset="1" stopColor="var(--art-fill-violet)" />
        </linearGradient>
        <radialGradient id="ambient" cx="50%" cy="45%" r="50%">
          <stop offset="0" stopColor="var(--art-fill-violet)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--art-paper)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="720" fill="url(#ambient)" />
      <g fill="none" stroke="var(--art-line)" strokeWidth="1.2" opacity="0.85" className="flow-line">
        <path d="M210 180 C 150 180, 120 140, 96 120" />
        <path d="M430 230 C 500 210, 540 180, 560 150" />
        <path d="M430 470 C 510 500, 540 540, 548 590" />
        <path d="M210 500 C 140 540, 110 580, 92 620" />
      </g>
      <g fontFamily="ui-monospace, monospace" fontSize="13" fill="var(--ink)">
        <circle cx="96" cy="112" r="7" fill="var(--art-line)" />
        <text x="78" y="96">
          Compute
        </text>
        <circle cx="566" cy="142" r="7" fill="var(--art-ink)" />
        <text x="500" y="126">
          Network
        </text>
        <circle cx="552" cy="598" r="7" fill="var(--art-accent)" />
        <text x="490" y="630">
          Storage
        </text>
        <circle cx="86" cy="628" r="7" fill="var(--art-line)" />
        <text x="62" y="656">
          Edge
        </text>
      </g>
      <g transform="translate(210 150)">
        <rect x="0" y="0" width="220" height="420" fill="var(--art-shape)" stroke="var(--art-ink)" strokeOpacity="0.45" />
        {Array.from({ length: 7 }).map((_, index) => (
          <g key={index} transform={`translate(16 ${28 + index * 54})`}>
            <rect width="188" height="36" fill="url(#rack-glow)" stroke="var(--art-line)" strokeOpacity="0.35" />
            <circle cx="18" cy="18" r="3" fill="var(--art-line)" />
            <circle cx="30" cy="18" r="3" fill="var(--art-ink)" opacity="0.8" />
            <rect x="48" y="15" width="92" height="6" fill="var(--art-shape)" />
          </g>
        ))}
      </g>
    </svg>
  );
}
