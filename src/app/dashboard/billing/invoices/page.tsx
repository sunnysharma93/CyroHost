"use client";

import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Invoice = { id: string; number: string; amountCents: number; currency: string; status: string; issuedAt: string };

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Invoice | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    setError("");
    consoleJson<{ items: Invoice[]; message: string }>("/api/billing/invoices")
      .then((body) => {
        if (cancel) return;
        setItems(body.items);
        setMessage(body.message);
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof ConsoleError ? reason.message : "Invoices could not be loaded.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt]);

  return (
    <div>
      <PageIntro title="Invoices" lede="Invoices are loaded for the signed-in account. This page does not take payment." />
      {error ? <ErrorPanel title="Unable to load invoices." message={error} onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {!items && !error ? <PageSkeleton label="Loading invoices" /> : null}
      {items && items.length === 0 ? (
        <DashCard className="p-6">
          <h2 className="text-base font-medium">No invoices yet.</h2>
          <p className="mt-2 text-sm text-[var(--dash-muted)]">{message || "Invoices appear after the billing provider issues one."}</p>
        </DashCard>
      ) : null}
      {items && items.length > 0 ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs tracking-[0.08em] text-[var(--dash-muted)] uppercase">
              <tr>{["Number", "Amount", "Status", "Issued", ""].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((invoice) => (
                <tr key={invoice.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2">{invoice.number}</td>
                  <td className="px-3 py-2">{(invoice.amountCents / 100).toFixed(2)} {invoice.currency}</td>
                  <td className="px-3 py-2">{invoice.status}</td>
                  <td className="px-3 py-2">{new Date(invoice.issuedAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2"><button type="button" className="text-sm" onClick={() => setOpen(invoice)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {open ? (
        <DashCard className="mt-3 p-4 text-sm">
          <p>{open.number}</p>
          <p className="mt-2 text-[var(--dash-muted)]">A downloadable document is not generated until the billing provider issues one.</p>
          <button type="button" className="mt-3 h-9 border border-[var(--dash-line)] px-3" onClick={() => setOpen(null)}>Close</button>
        </DashCard>
      ) : null}
    </div>
  );
}
