"use client";

import { useId, useState } from "react";

export function Accordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-start justify-between gap-6 py-5 text-left text-base text-ink"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
              >
                <span>{item.question}</span>
                <span aria-hidden="true" className="font-mono text-cyan">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className="pb-5 pr-8 text-sm leading-6 text-muted"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
