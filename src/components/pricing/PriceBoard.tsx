"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { services } from "@/content/services";

const quoted = [
  { name: "VPS", note: "Indicative monthly sizes are on the pricing page. Confirm availability before you rely on a figure.", href: "/pricing#cloud-vps", category: "compute", places: ["india", "singapore"] },
  { name: "FiveM", note: "Quote-based. No public price table.", href: "/cloud/game-servers", category: "games", places: ["india", "singapore"] },
  { name: "Dedicated", note: "A Platinum-tier Noida reference price is on the pricing page. Confirm it before treating it as a live offer.", href: "/pricing#bare-metal", category: "compute", places: [] },
  { name: "Transit, BGP, addresses", note: "Commit, ASN, or prefix length is quoted. No public port speed.", href: "/labs", category: "network", places: [] },
  { name: "Colocation", note: "Space and power are confirmed before hardware ships.", href: "/edge/colocation", category: "edge", places: [] },
  { name: "Websites", note: "No public shared-hosting price table.", href: "/web/hosting", category: "web", places: [] },
];

type Category = "all" | "games" | "web" | "compute" | "network" | "edge";
type Place = "all" | "india" | "singapore";

export function PriceBoard({ compact = false }: { compact?: boolean }) {
  const hytale = services.games.products?.find((product) => product.name === "Hytale");
  const bots = services.hosting.products?.[0];
  const [category, setCategory] = useState<Category>("all");
  const [place, setPlace] = useState<Place>("all");
  const visibleQuoted = useMemo(
    () =>
      quoted.filter((item) => {
        const categoryOk = category === "all" || item.category === category;
        const placeOk = place === "all" || item.places.includes(place);
        return categoryOk && placeOk;
      }),
    [category, place],
  );
  const showMinecraft = category === "all" || category === "games";
  const showBots = (category === "all" || category === "web") && place !== "singapore";
  const showHytale = (category === "all" || category === "games") && (place === "all" || place === "india" || place === "singapore");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border border-line p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(
            [
              ["all", "All"],
              ["games", "Games"],
              ["web", "Web"],
              ["compute", "Compute"],
              ["network", "Network"],
              ["edge", "Edge"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={`min-h-11 border px-3 text-sm ${category === value ? "border-violet text-ink" : "border-line text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by published location">
          {(
            [
              ["all", "Any location"],
              ["india", "India"],
              ["singapore", "Singapore"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={place === value}
              onClick={() => setPlace(value)}
              className={`min-h-11 border px-3 text-sm ${place === value ? "border-cyan text-ink" : "border-line text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs leading-5 text-muted">
        Filters only hide rows. They do not create a configuration. RAM, CPU, NVMe, operating system, network speed, and DDoS size are shown only when a public plan listed them.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {showMinecraft ? (
        <article className="panel flex min-w-0 flex-col p-6">
          <p className="kicker">Minecraft</p>
          <h3 className="mt-3 text-2xl tracking-tight">Two published starting points</h3>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {place !== "india" ? (
            <div>
              <dt className="text-sm text-muted">Singapore</dt>
              <dd className="mt-1 font-mono text-2xl text-cyan">₹80/mo</dd>
              <dd className="mt-2 text-sm leading-6 text-muted">Intel Xeon E-2136. Described for small SMPs and starter servers.</dd>
            </div>
            ) : null}
            {place !== "singapore" ? (
            <div>
              <dt className="text-sm text-muted">India</dt>
              <dd className="mt-1 font-mono text-2xl text-cyan">₹100/mo</dd>
              <dd className="mt-2 text-sm leading-6 text-muted">AMD EPYC 4464P. Described for mods, plugins, and players.</dd>
            </div>
            ) : null}
          </dl>
          <Link href="/cloud/game-servers" className="mt-6 text-sm text-cyan">
            Game server details
          </Link>
        </article>
        ) : null}
        {showBots ? (
        <article className="panel flex min-w-0 flex-col p-6">
          <p className="kicker">Discord bots</p>
          <h3 className="mt-3 text-2xl tracking-tight">Three monthly plans</h3>
          <ul className="mt-6 space-y-4">
            {bots?.plans?.map((plan) => (
              <li key={plan.name} className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <span>
                  <span className="block text-ink">{plan.name}</span>
                  <span className="mt-1 block text-sm text-muted">{plan.features.join(" · ")}</span>
                </span>
                <span className="font-mono text-lg text-cyan">{plan.price}</span>
              </li>
            ))}
          </ul>
          <Link href="/web/hosting#discord-bots" className="mt-6 text-sm text-cyan">
            Bot plan details
          </Link>
        </article>
        ) : null}
      </div>

      {showHytale && hytale?.plans?.length ? (
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Hytale</p>
              <h3 className="mt-2 text-2xl tracking-tight">Four named tiers</h3>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted">
              Cards do not label a billing period. The same page also says plans start from ₹100 per GB per month.
            </p>
          </div>
          <div className={`mt-6 grid gap-3 ${compact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
            {hytale.plans.map((plan) => (
              <article key={plan.name} className="panel p-4">
                <h4 className="text-lg">{plan.name}</h4>
                <p className="mt-2 font-mono text-2xl text-cyan">{plan.price}</p>
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <Link href="/cloud/game-servers" className="mt-4 inline-block text-sm text-cyan">
            Hytale details
          </Link>
        </div>
      ) : null}

      <div>
        <p className="kicker">Quoted</p>
        <h3 className="mt-2 text-2xl tracking-tight">No public price, so none is shown</h3>
        {visibleQuoted.length === 0 ? <p className="mt-6 text-sm text-muted">Nothing quoted is published for this filter.</p> : null}
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleQuoted.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className="panel lift block h-full p-4">
                <span className="block text-ink">{item.name}</span>
                <span className="mt-2 block text-sm leading-6 text-muted">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
