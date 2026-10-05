"use client";

import { useState } from "react";
import { site } from "@/config/site";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className="min-h-11 border border-line px-3 text-sm text-ink">
      {copied ? "Email copied" : "Copy support email"}
    </button>
  );
}
