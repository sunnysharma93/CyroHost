"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Event = { id: string; userId: string | null; action: string; createdAt: string; ip: string | null; userAgent: string | null; metadata: string | null };

export default function AdminActivityPage() {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Event[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ items: Event[]; total: number }>(`/api/admin/activity?page=${page}`)
      .then((body) => { setItems(body.items); setTotal(body.total); })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Activity could not be loaded."));
  }, [page]);

  return (
    <div>
      <PageIntro title="Activity logs" lede="Authentication, requests, and account actions. Passwords and tokens are not stored here." />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading activity…</p> : null}
      {items ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]"><tr>{["User", "Event", "Date", "IP", "Device", "Status"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2">{item.userId ?? "Unknown"}</td>
                  <td className="px-3 py-2">{item.action.replaceAll("_", " ")}</td>
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{item.ip || "None"}</td>
                  <td className="max-w-48 truncate px-3 py-2">{item.userAgent || "None"}</td>
                  <td className="px-3 py-2">{item.metadata || "Recorded"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2 text-sm">
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span className="self-center text-[var(--dash-muted)]">{total} total</span>
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={(page + 1) * 30 >= total} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    </div>
  );
}
