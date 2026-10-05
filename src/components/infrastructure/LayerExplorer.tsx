"use client";

import Link from "next/link";
import { useState } from "react";

const layers = [
  {
    id: "00",
    title: "Physical infrastructure",
    body: "Colocation is an enquiry for your own hardware: space, power, and connectivity are confirmed before anything is shipped. The Network India map names sites in Mumbai, Noida, and other cities. CyroHost does not claim to own those halls, the fibre, or the power plant.",
    details: ["Colocation is quoted, not listed as a cabinet price", "Map names are not confirmed rack inventory", "No owned-fibre or owned-data-centre claim is published"],
    href: "/edge/colocation",
    link: "Colocation enquiry",
  },
  {
    id: "01",
    title: "Compute",
    body: "Cloud pages cover VPS, VDS, RDP, and dedicated servers. India is published as AMD and Intel VPS lines. Singapore is published as an Intel VPS line. Indicative VPS sizes are listed separately and still need confirmation. Game servers add Minecraft, Hytale, and FiveM.",
    details: ["Indicative VPS sizes are on the pricing page and must be confirmed", "VDS and RDP have no separate public catalogue", "A Noida bare-metal figure is a reference price, not a confirmed live offer"],
    href: "/cloud",
    link: "Explore Cloud",
  },
  {
    id: "02",
    title: "Network",
    body: "Labs covers IP transit, BGP sessions, and IPv4 leasing for operators. You bring the commit, the ASN, or the prefix length. No CyroHost ASN, upstream list, or owned address space is published.",
    details: ["Transit, BGP, and leases are quoted", "Network India is a published route map, not a rate card", "Shield is named separately as protection, without a published mitigation size"],
    href: "/labs",
    link: "Explore Labs",
  },
  {
    id: "03",
    title: "Storage",
    body: "S3-compatible storage is offered as an enquiry. API compatibility, redundancy, and price were not published, so this layer does not invent a storage fabric.",
    details: ["No published capacity or per-gigabyte price", "Game plans that list disk, such as Discord bots, are product storage, not this object-storage service"],
    href: "/cloud/storage",
    link: "Storage enquiry",
  },
  {
    id: "04",
    title: "Security",
    body: "The public site names Shield as network and DDoS protection for applications, platforms, and gaming. Mitigation size, inclusion on every port, and tenant-isolation details are not published.",
    details: ["Ask which protection applies to the plan you order", "No uptime percentage or scrubbing capacity is shown", "Support does not pretend to be a live status feed"],
    href: "/cloud",
    link: "Read the Cloud notes on Shield",
  },
  {
    id: "05",
    title: "Platform and services",
    body: "Web hosting is scoped when a public price table is missing. Discord bot plans are published. The client area on this site shows account screens and does not create a session or take payment. Support opens WhatsApp.",
    details: ["Guides explain ordering, regions, and published prices", "Contact form says so when a message is not delivered", "No single public API or console claim is made here"],
    href: "/web",
    link: "Explore Web",
  },
] as const;

export function LayerExplorer() {
  const [active, setActive] = useState(0);
  const layer = layers[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="layer-deck relative h-[440px]" role="tablist" aria-label="Infrastructure layers">
        {layers.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`layer-tab-${item.id}`}
            aria-selected={index === active}
            aria-controls={`layer-panel-${item.id}`}
            onClick={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            className={`layer-plate absolute inset-x-0 border px-4 py-3 text-left ${index === active ? "border-violet bg-panel text-ink" : "border-line bg-raised text-muted"}`}
            style={{ transform: `translateY(${index * 54}px) translateZ(${index === active ? 28 : 0}px)`, zIndex: index === active ? 8 : index }}
          >
            <span className="font-mono text-[10px] tracking-[0.16em] text-violet">Layer {item.id}</span>
            <span className="mt-1 block text-sm">{item.title}</span>
          </button>
        ))}
      </div>
      <article
        role="tabpanel"
        id={`layer-panel-${layer.id}`}
        aria-labelledby={`layer-tab-${layer.id}`}
        className="panel min-w-0 p-6 sm:p-8"
      >
        <p className="kicker">Layer {layer.id}</p>
        <h3 className="mt-3 text-3xl tracking-tight">{layer.title}</h3>
        <LayerArt id={layer.id} />
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{layer.body}</p>
        <ul className="mt-5 space-y-2 text-sm leading-6 text-muted">
          {layer.details.map((detail) => (
            <li key={detail} className="border-l-2 border-cyan pl-3">
              {detail}
            </li>
          ))}
        </ul>
        <Link href={layer.href} className="mt-6 inline-flex min-h-11 items-center text-sm text-cyan">
          {layer.link}
        </Link>
      </article>
    </div>
  );
}

function LayerArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 640 120" className="mt-6 h-24 w-full" aria-hidden="true">
      <rect x="0" y="0" width="640" height="120" fill="var(--art-shape)" />
      {id === "00" ? (
        <>
          <rect x="40" y="28" width="70" height="64" fill="var(--art-fill-orange)" stroke="var(--art-accent)" />
          <rect x="130" y="28" width="70" height="64" fill="var(--art-paper)" stroke="var(--art-line)" />
          <rect x="220" y="28" width="70" height="64" fill="var(--art-paper)" stroke="var(--art-line)" />
        </>
      ) : null}
      {id === "01" ? (
        <>
          <rect x="48" y="36" width="180" height="48" fill="var(--art-paper)" stroke="var(--art-line)" />
          <rect x="70" y="52" width="48" height="8" fill="var(--art-fill-mint)" />
          <rect x="128" y="52" width="48" height="8" fill="var(--art-fill-violet)" />
        </>
      ) : null}
      {id === "02" ? (
        <>
          <circle cx="80" cy="60" r="18" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
          <circle cx="220" cy="60" r="18" fill="var(--art-fill-violet)" stroke="var(--art-ink)" />
          <circle cx="360" cy="60" r="18" fill="var(--art-fill-orange)" stroke="var(--art-accent)" />
          <path d="M98 60h104M238 60h104" stroke="var(--art-line)" />
        </>
      ) : null}
      {id === "03" ? (
        <>
          <rect x="60" y="34" width="90" height="52" fill="var(--art-fill-violet)" stroke="var(--art-ink)" />
          <rect x="170" y="34" width="90" height="52" fill="var(--art-paper)" stroke="var(--art-line)" />
          <rect x="280" y="34" width="90" height="52" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
        </>
      ) : null}
      {id === "04" ? (
        <path d="M80 78l40-46h80l40 46-40 22H120z" fill="var(--art-fill-mint)" stroke="var(--art-line)" />
      ) : null}
      {id === "05" ? (
        <>
          <rect x="48" y="28" width="220" height="64" fill="var(--art-paper)" stroke="var(--art-line)" />
          <path d="M70 52h80M70 68h120" stroke="var(--art-ink)" />
        </>
      ) : null}
    </svg>
  );
}
