"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Offer = { id: string; code: string; title: string; description: string; eligibility: string | null; active: boolean; expiresAt: string | null };

export default function AdminOffersPage() {
  const [items, setItems] = useState<Offer[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ offers: Offer[] }>("/api/admin/billing")
      .then((body) => setItems(body.offers))
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Offers could not be loaded."));
  }, []);

  return (
    <div>
      <PageIntro title="Offers" lede="Only offers stored in the database are listed." />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {items && items.length === 0 ? <DashCard className="p-5 text-sm text-[var(--dash-muted)]">No offers or coupons are configured.</DashCard> : null}
      <div className="grid gap-3">
        {items?.map((offer) => (
          <DashCard key={offer.id} className="p-4 text-sm">
            <p className="font-medium">{offer.title} · {offer.code}</p>
            <p className="mt-2 text-[var(--dash-muted)]">{offer.description}</p>
            <p className="mt-2 text-xs text-[var(--dash-muted)]">{offer.eligibility || "No eligibility note"} · {offer.active ? "Active" : "Inactive"} · {offer.expiresAt ? new Date(offer.expiresAt).toLocaleString() : "No expiry"}</p>
          </DashCard>
        ))}
      </div>
    </div>
  );
}
