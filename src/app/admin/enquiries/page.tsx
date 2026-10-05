"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Enquiry = { id: string; kind: string; name: string; email: string; company: string | null; region: string | null; budget: string | null; requirement: string; emailStatus: string; createdAt: string };

export default function AdminEnquiriesPage() {
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ items: Enquiry[] }>("/api/admin/enquiries")
      .then((body) => setItems(body.items))
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Enquiries could not be loaded."));
  }, []);

  return (
    <div>
      <PageIntro title="Enquiries" lede="Dedicated, colocation, and enterprise requests. Nothing here reserves hardware." />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading enquiries…</p> : null}
      {items && items.length === 0 ? <DashCard className="p-5 text-sm text-[var(--dash-muted)]">No enquiries yet.</DashCard> : null}
      <div className="grid gap-3">
        {items?.map((item) => (
          <DashCard key={item.id} className="p-4 text-sm">
            <p className="font-medium">{item.kind} · {item.name}</p>
            <p className="mt-1 text-[var(--dash-muted)]">{item.email} · {item.company || "No company"} · {item.region || "No region"} · {item.budget || "No budget"}</p>
            <p className="mt-2 whitespace-pre-wrap">{item.requirement}</p>
            <p className="mt-2 text-xs text-[var(--dash-muted)]">{item.emailStatus} · {new Date(item.createdAt).toLocaleString()}</p>
          </DashCard>
        ))}
      </div>
    </div>
  );
}
