"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Invoice = { id: string; number: string; amountCents: number; currency: string; status: string; issuedAt: string };

export default function AdminBillingPage() {
  const [provider, setProvider] = useState("");
  const [message, setMessage] = useState("");
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ provider: string; message: string; invoices: Invoice[] }>("/api/admin/billing")
      .then((body) => { setProvider(body.provider); setMessage(body.message); setInvoices(body.invoices); })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Billing could not be loaded."));
  }, []);

  return (
    <div>
      <PageIntro title="Billing" lede={message || "Loading billing records."} />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      <DashCard className="p-4 text-sm text-[var(--dash-muted)]">Payment provider: {provider || "checking"}.</DashCard>
      {invoices && invoices.length === 0 ? <DashCard className="mt-3 p-5 text-sm text-[var(--dash-muted)]">No invoices are stored.</DashCard> : null}
      {invoices && invoices.length > 0 ? (
        <div className="mt-3 overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]"><tr>{["Number", "Amount", "Status", "Issued"].map((label) => <th key={label} className="px-3 py-2">{label}</th>)}</tr></thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2">{invoice.number}</td>
                  <td className="px-3 py-2">{(invoice.amountCents / 100).toFixed(2)} {invoice.currency}</td>
                  <td className="px-3 py-2">{invoice.status}</td>
                  <td className="px-3 py-2">{new Date(invoice.issuedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
