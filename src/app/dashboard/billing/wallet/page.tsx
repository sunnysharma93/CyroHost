"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro, WhatsAppSupport } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

export default function WalletPage() {
  const [message, setMessage] = useState("Loading wallet…");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    consoleJson<{ message: string }>("/api/billing/wallet")
      .then((body) => setMessage(body.message))
      .catch((reason: unknown) => setMessage(reason instanceof ConsoleError ? reason.message : "Wallet could not be loaded."));
  }, []);

  async function topUp() {
    try {
      await consoleJson("/api/billing/wallet/top-up", { method: "POST" });
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "Top-up is not available.");
    }
  }

  return (
    <div>
      <PageIntro title="Wallet & Payments" lede="A balance is shown only after a billing provider confirms it. This page does not trust a browser payment result." />
      <DashCard className="p-6">
        <h2 className="text-base font-medium">Billing provider not configured</h2>
        <p className="mt-2 text-sm text-[var(--dash-muted)]">{message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={topUp}>Top up</button>
          <WhatsAppSupport />
        </div>
        {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
      </DashCard>
    </div>
  );
}
