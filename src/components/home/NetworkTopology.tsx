"use client";

import Link from "next/link";
import { useState } from "react";
import { links } from "@/config/site";

const places = [
  {
    id: "india",
    name: "India",
    kind: "Published compute",
    body: "A published compute region. The VPS pages do not name a city for it.",
    href: "/cloud/vps",
    action: "Read the VPS notes",
  },
  {
    id: "singapore",
    name: "Singapore",
    kind: "Published compute",
    body: "A published compute region, described as an Intel line. No city-level hall is claimed.",
    href: "/cloud/vps",
    action: "Read the VPS notes",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    kind: "Network India map",
    body: "A name on the Network India map. Not an instant-deploy VPS city, and not confirmed cabinet inventory.",
    href: "/edge/network-india",
    action: "Open Network India",
  },
  {
    id: "noida",
    name: "Noida",
    kind: "Network India map",
    body: "A name on the Network India map. A bare-metal figure on the pricing page is a reference and still needs confirmation.",
    href: "/pricing#bare-metal",
    action: "See the reference price",
  },
  {
    id: "japan",
    name: "Japan",
    kind: "Enquiry",
    body: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/contact",
    action: "Talk to CyroHost",
  },
  {
    id: "netherlands",
    name: "Netherlands",
    kind: "Enquiry",
    body: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/contact",
    action: "Talk to CyroHost",
  },
  {
    id: "uk",
    name: "United Kingdom",
    kind: "Enquiry",
    body: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/contact",
    action: "Talk to CyroHost",
  },
  {
    id: "usa",
    name: "United States",
    kind: "On demand",
    body: "Named as on demand, not an instant-deploy region. No capacity figure is published.",
    href: "/locations",
    action: "Location notes",
  },
  {
    id: "canada",
    name: "Canada",
    kind: "Enquiry",
    body: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/contact",
    action: "Talk to CyroHost",
  },
  {
    id: "nz",
    name: "New Zealand",
    kind: "Enquiry",
    body: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/contact",
    action: "Talk to CyroHost",
  },
] as const;

export function NetworkTopology() {
  const [id, setId] = useState<(typeof places)[number]["id"]>("india");
  const place = places.find((item) => item.id === id) ?? places[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="border border-line bg-panel">
        <div className="border-b border-line px-5 py-4">
          <p className="text-sm font-medium">Locations of interest</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Select a place to read how CyroHost describes it. Markers are labels, not live routes, latency, or capacity.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2">
          {places.map((item) => {
            const on = item.id === id;
            return (
              <li key={item.id} className="border-t border-line sm:[&:nth-child(-n+2)]:border-t-0">
                <button
                  type="button"
                  onClick={() => setId(item.id)}
                  aria-pressed={on}
                  className={`flex w-full items-start justify-between gap-3 px-5 py-4 text-left ${on ? "bg-raised" : "hover:bg-raised"}`}
                >
                  <span>
                    <span className="block text-sm text-ink">{item.name}</span>
                    <span className="mt-1 block text-xs tracking-[0.08em] text-muted uppercase">{item.kind}</span>
                  </span>
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${item.kind === "Published compute" ? "bg-mint" : "bg-orange"}`} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="border border-line bg-panel p-5">
        <p className="font-mono text-[10px] tracking-[0.16em] text-violet uppercase">{place.kind}</p>
        <h3 className="mt-3 text-2xl font-light tracking-tight">{place.name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{place.body}</p>
        <Link href={place.href} className="mt-5 inline-flex min-h-11 items-center text-sm text-cyan">
          {place.action}
        </Link>
        <a href={links.whatsapp} className="mt-2 block text-sm text-muted hover:text-ink" target="_blank" rel="noopener noreferrer">
          WhatsApp {links.whatsappNumber}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </aside>
    </div>
  );
}
