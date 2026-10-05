"use client";

import { useState } from "react";

const tabs = [
  {
    id: "compute",
    label: "Compute",
    title: "An order is a conversation, then a machine",
    body: "Published game and bot prices can be read on this site. Indicative VPS sizes are on the pricing page and must be confirmed. This site does not provision a server or take payment.",
    steps: ["Choose a published plan or describe the workload", "Confirm region, size, and operating system with CyroHost", "Payment and delivery happen outside this website"],
  },
  {
    id: "network",
    label: "Network",
    title: "Transit, BGP, and addresses are quoted",
    body: "Labs covers IP transit, BGP sessions, and IP leasing. No CyroHost ASN, upstream list, or owned fibre route is published. Bring the commit, the ASN, or the prefix length.",
    steps: ["Name the bandwidth, ASN, or prefix length", "Name the site if you already know it", "Capacity is confirmed in the reply, not on this page"],
  },
  {
    id: "storage",
    label: "Storage",
    title: "Object storage is an enquiry",
    body: "S3-compatible storage is listed as a service to discuss. API compatibility, redundancy, and price were not published, so none are invented here.",
    steps: ["Describe the workload and the region", "Ask which API and redundancy apply", "Discord bot plans list their own disk separately"],
  },
  {
    id: "edge",
    label: "Edge",
    title: "Colocation is confirmed before hardware ships",
    body: "Mumbai and Noida appear on the Network India map. Those names are not a statement that a cabinet is free, and they are not VPS cities.",
    steps: ["Share space, power, and the site you have in mind", "Wait for confirmation before shipping hardware", "Read the Network India page for the published map names"],
  },
] as const;

export function JoyPipeline() {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="What happens next">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={`min-h-11 border px-3 text-xs tracking-[0.14em] uppercase ${index === active ? "border-accent bg-accent text-accent-ink" : "border-line text-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <article className="mt-6 grid gap-8 border border-line bg-panel p-6 lg:grid-cols-[1.1fr_0.9fr]" role="tabpanel">
        <div>
          <h3 className="text-2xl font-light tracking-tight">{tab.title}</h3>
          <p className="mt-3 text-sm leading-7 text-muted">{tab.body}</p>
          <svg viewBox="0 0 360 72" className="mt-6 h-16 w-full" aria-hidden="true">
            <line x1="28" y1="36" x2="332" y2="36" stroke="var(--cyan)" className="flow-line" />
            {tab.steps.map((_, index) => (
              <g key={index} transform={`translate(${28 + index * 152} 36)`}>
                <circle r="14" fill="var(--panel)" stroke="var(--violet)" />
                <text textAnchor="middle" y="4" fill="var(--ink)" fontSize="11">
                  {index + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <ol className="space-y-4">
          {tab.steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[2rem_1fr] gap-3 text-sm">
              <span className="font-mono text-xs text-cyan">0{index + 1}</span>
              <span className="text-ink">{step}</span>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
