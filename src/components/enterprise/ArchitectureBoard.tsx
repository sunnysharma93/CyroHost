"use client";

import { useState } from "react";

const boards = [
  {
    id: "web",
    label: "Web application",
    title: "A site in front of an application",
    body: "Ask whether web hosting or a VPS fits. This drawing is an example of the conversation, not a deployed design.",
    nodes: ["Browser", "Hosting or VPS", "Application"],
  },
  {
    id: "data",
    label: "Data",
    title: "An application and its data",
    body: "Database hosting is not a published product. Describe the engine and the region, and the team will say what can be quoted.",
    nodes: ["Application", "Database", "Backup enquiry"],
  },
  {
    id: "network",
    label: "Private network",
    title: "Addresses and a session",
    body: "Transit, BGP, and address leases are separate enquiries. No CyroHost ASN or private fabric is published.",
    nodes: ["Your network", "Quoted session", "Prefixes you bring"],
  },
  {
    id: "recovery",
    label: "Recovery",
    title: "A second copy, if one is offered",
    body: "No disaster-recovery product or recovery-time figure is published. Ask what backup or second region applies to the service you want.",
    nodes: ["Primary enquiry", "Copy you ask for", "Restore, confirmed later"],
  },
] as const;

export function ArchitectureBoard() {
  const [active, setActive] = useState<(typeof boards)[number]["id"]>("web");
  const board = boards.find((item) => item.id === active) ?? boards[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Example architectures">
        {boards.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === active}
            onClick={() => setActive(item.id)}
            className={`min-h-11 border px-3 text-sm ${item.id === active ? "border-accent bg-accent text-accent-ink" : "border-line text-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <article className="mt-4 grid min-h-72 gap-8 border border-line bg-panel p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]" role="tabpanel">
        <div>
          <h3 className="text-3xl font-light tracking-tight">{board.title}</h3>
          <p className="mt-4 text-sm leading-7 text-muted">{board.body}</p>
        </div>
        <svg viewBox="0 0 460 180" className="h-44 w-full" aria-hidden="true">
          <line x1="76" y1="90" x2="384" y2="90" stroke="var(--cyan)" className="flow-line" />
          {board.nodes.map((node, index) => (
            <g key={node} transform={`translate(${76 + index * 154} 90)`}>
              <rect x="-64" y="-36" width="128" height="72" fill="var(--art-paper)" stroke="var(--violet)" />
              <text textAnchor="middle" y="4" fill="var(--ink)" fontSize="12">
                {node}
              </text>
            </g>
          ))}
        </svg>
      </article>
    </div>
  );
}
