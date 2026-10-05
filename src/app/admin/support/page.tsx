"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Ticket = { id: string; subject: string; category: string; priority: string; status: string; updatedAt: string };

export default function AdminSupportPage() {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ items: Ticket[]; total: number }>(`/api/admin/support/tickets?page=${page}`)
      .then((body) => { setItems(body.items); setTotal(body.total); })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Tickets could not be loaded."));
  }, [page]);

  return (
    <div>
      <PageIntro title="Support" lede="Tickets from every account." />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading tickets…</p> : null}
      {items && items.length === 0 ? <DashCard className="p-5 text-sm text-[var(--dash-muted)]">No tickets.</DashCard> : null}
      {items && items.length > 0 ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]"><tr>{["Subject", "Category", "Priority", "Status", "Updated"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2"><Link href={`/admin/support/${item.id}`} className="hover:text-[var(--dash-accent)]">{item.subject}</Link></td>
                  <td className="px-3 py-2">{item.category}</td>
                  <td className="px-3 py-2">{item.priority}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{new Date(item.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2 text-sm">
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span className="self-center text-[var(--dash-muted)]">{total} total</span>
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={(page + 1) * 20 >= total} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    </div>
  );
}
