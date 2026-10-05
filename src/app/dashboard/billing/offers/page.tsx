"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro, WhatsAppSupport } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Offer = { id: string; title: string; description: string; code: string; eligibility: string | null; expiresAt: string | null; claimable: boolean };

export default function OffersPage() {
  const [items, setItems] = useState<Offer[] | null>(null);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    consoleJson<{ items: Offer[]; message: string }>("/api/billing/offers")
      .then((body) => {
        setItems(body.items);
        setMessage(body.message);
      })
      .catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Offers could not be loaded."));
  }, []);

  async function apply() {
    try {
      await consoleJson("/api/billing/offers/apply", { method: "POST", body: JSON.stringify({ code }) });
      setNotice("Coupon applied.");
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The coupon could not be applied.");
    }
  }

  return (
    <div>
      <PageIntro title="Offers & Coupons" lede="Only offers stored for CyroHost are listed. A coupon is not applied unless the billing provider accepts it." />
      {items && items.length === 0 ? (
        <DashCard className="p-6">
          <h2 className="text-base font-medium">No offers are configured</h2>
          <p className="mt-2 text-sm text-[var(--dash-muted)]">{message}</p>
          <div className="mt-4"><WhatsAppSupport /></div>
        </DashCard>
      ) : null}
      <div className="grid gap-3">
        {items?.map((offer) => (
          <DashCard key={offer.id} className="p-4">
            <h2 className="text-base font-medium">{offer.title}</h2>
            <p className="mt-2 text-sm text-[var(--dash-muted)]">{offer.description}</p>
            <p className="mt-2 font-mono text-sm">{offer.code}</p>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">{offer.eligibility ?? "Eligibility was not set."}</p>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">Expiry: {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : "Not set"}</p>
          </DashCard>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={code} onChange={(event) => setCode(event.target.value)} aria-label="Coupon code" placeholder="Coupon code" className="h-9 min-w-40 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={apply}>Apply coupon</button>
      </div>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
    </div>
  );
}
