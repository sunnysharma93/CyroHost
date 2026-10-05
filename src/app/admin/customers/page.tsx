"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Customer = {
  id: string;
  fullName: string;
  email: string | null;
  status: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  requests: number;
};

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Customer[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ q: query, page: String(page) });
    consoleJson<{ items: Customer[]; total: number }>(`/api/admin/customers?${params}`)
      .then((body) => {
        setItems(body.items);
        setTotal(body.total);
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Customers could not be loaded."));
  }, [page, query]);

  return (
    <div>
      <PageIntro title="Customers" lede="Account records. Passwords are not shown." />
      <input value={query} onChange={(event) => { setPage(0); setQuery(event.target.value); }} aria-label="Search customers" placeholder="Search name or email" className="mb-3 h-9 w-full border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading customers…</p> : null}
      {items ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]">
              <tr>{["Name", "Email", "Registered", "Status", "Last login", "Requests"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2"><Link href={`/admin/customers/${item.id}`} className="hover:text-[var(--dash-accent)]">{item.fullName}</Link></td>
                  <td className="px-3 py-2">{item.email}</td>
                  <td className="px-3 py-2">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString() : "None recorded"}</td>
                  <td className="px-3 py-2">{item.requests}</td>
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
