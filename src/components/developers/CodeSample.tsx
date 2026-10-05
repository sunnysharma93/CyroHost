"use client";

import { useState } from "react";

export function CodeSample({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{label}</p>
        <button type="button" onClick={copy} className="min-h-11 px-2 text-sm text-cyan">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}
