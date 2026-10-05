"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

export default function AdminInfrastructurePage() {
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ provider: string; message: string; items: unknown[] }>("/api/admin/infrastructure")
      .then((body) => { setProvider(body.provider); setMessage(body.message); })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Infrastructure status could not be loaded."));
  }, []);

  return (
    <div>
      <PageIntro title="Infrastructure" lede="Provider status only. Hardware is not listed as customer capacity." />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      <DashCard className="p-5 text-sm leading-6 text-[var(--dash-muted)]">
        <p>Provider: {provider || "checking"}.</p>
        <p className="mt-2">{message}</p>
      </DashCard>
    </div>
  );
}
