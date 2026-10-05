"use client";

import { useState } from "react";
import { WorldMap } from "@/components/networks/WorldMap";
import { Container } from "@/components/ui/Container";
import { networkLocations, locationWhatsApp, regionColor } from "@/content/lastNetworks";

const statusDot: Record<(typeof networkLocations)[number]["status"], string> = {
  published: "bg-mint",
  map: "bg-orange",
  request: "bg-violet",
  enquiry: "bg-muted",
};

export function LastNetworks({
  kicker = "Last Networks",
  heading = "h2",
}: {
  kicker?: string;
  heading?: "h1" | "h2";
}) {
  const [selected, setSelected] = useState(networkLocations[0].id);
  const Title = heading;
  const active = networkLocations.find((location) => location.id === selected) ?? networkLocations[0];

  return (
    <section id="last-networks" className="border-b border-line" aria-labelledby="last-networks-heading">
      <Container className="py-16 sm:py-24">
        <p className="font-mono text-xs tracking-[0.18em] text-cyan">{kicker}</p>
        <Title id="last-networks-heading" className="display mt-4 max-w-4xl text-[clamp(2rem,4vw,3.6rem)]">
          A World of Connectivity. One Global Network.
        </Title>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
          Explore our global network locations and discover the regions where infrastructure and connectivity can support your business.
        </p>
        <div className="mt-10">
          <WorldMap selected={selected} onSelect={setSelected} />
        </div>
        <article className="mt-4 border border-line bg-panel p-5 sm:hidden" aria-live="polite">
          <p className="text-lg font-medium tracking-tight">{active.city}</p>
          <p className="mt-1 text-sm text-muted">{active.country}</p>
          <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-violet uppercase">{active.region}</p>
          <p className="mt-3 text-sm leading-6 text-ink">{active.statusLabel}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{active.description}</p>
        </article>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {networkLocations.map((location) => {
            const current = location.id === selected;
            return (
              <li key={location.id}>
                <article className={`lift flex h-full flex-col border bg-panel p-5 ${current ? "border-cyan" : "border-line"}`}>
                  <button type="button" onClick={() => setSelected(location.id)} className="text-left">
                    <span className="text-2xl" aria-hidden="true">
                      {location.flag}
                    </span>
                    <span className="mt-3 block text-xl font-light tracking-tight text-ink">{location.city}</span>
                    <span className="mt-1 block text-sm text-muted">{location.country}</span>
                    <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                      <span className="size-2 rounded-full" style={{ background: regionColor[location.region] }} aria-hidden="true" />
                      {location.region}
                    </span>
                    <span className="mt-3 flex items-start gap-2 text-sm leading-6 text-ink">
                      <span className={`mt-2 size-2 shrink-0 rounded-full ${statusDot[location.status]}`} aria-hidden="true" />
                      <span>{location.statusLabel}</span>
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-muted">{location.description}</span>
                  </button>
                  <a
                    href={locationWhatsApp(location.place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center justify-center bg-accent px-4 text-sm text-accent-ink hover:bg-[var(--accent-hover)]"
                  >
                    Enquire on WhatsApp
                    <span className="sr-only"> about {location.city} (opens in a new tab)</span>
                  </a>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
