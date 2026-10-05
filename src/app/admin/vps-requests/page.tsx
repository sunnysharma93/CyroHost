"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type Row = { id: string; requestNumber: string; planName: string; regionName: string; osName: string; status: string; serverName: string; createdAt: string };

function RequestList() {
  const initial = useSearchParams().get("status") ?? "";
  const [status, setStatus] = useState(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ status, q: query, page: String(page) });
    consoleJson<{ items: Row[]; total: number }>(`/api/admin/vps-requests?${params}`)
      .then((body) => {
        const next = [...body.items];
        if (sort === "plan") next.sort((a, b) => a.planName.localeCompare(b.planName));
        setItems(next);
        setTotal(body.total);
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Requests could not be loaded."));
  }, [page, query, sort, status]);

  return (
    <div>
      <PageIntro title="VPS requests" lede="Search and update request status. Changing a status does not provision a server." />
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={query} onChange={(event) => { setPage(0); setQuery(event.target.value); }} aria-label="Search requests" placeholder="Request ID, server, or hostname" className="h-9 min-w-0 flex-1 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
        <select value={status} aria-label="Filter by status" onChange={(event) => { setPage(0); setStatus(event.target.value); }} className="h-9 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-2 text-sm">
          <option value="">All statuses</option>
          {["PENDING", "UNDER_REVIEW", "APPROVED", "PROVISIONING", "ACTIVE", "REJECTED", "CANCELLED"].map((value) => <option key={value} value={value}>{requestStatusLabel(value)}</option>)}
        </select>
        <select value={sort} aria-label="Sort requests" onChange={(event) => setSort(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-2 text-sm">
          <option value="newest">Newest</option>
          <option value="plan">Plan name</option>
        </select>
      </div>
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading requests…</p> : null}
      {items && items.length === 0 ? <DashCard className="p-5 text-sm text-[var(--dash-muted)]">No matching requests.</DashCard> : null}
      {items && items.length > 0 ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]"><tr>{["Request", "Server", "Plan", "Region", "OS", "Status", "Created"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2"><Link href={`/admin/vps-requests/${item.id}`} className="hover:text-[var(--dash-accent)]">{item.requestNumber}</Link></td>
                  <td className="px-3 py-2">{item.serverName}</td>
                  <td className="px-3 py-2">{item.planName}</td>
                  <td className="px-3 py-2">{item.regionName}</td>
                  <td className="px-3 py-2">{item.osName}</td>
                  <td className="px-3 py-2">{requestStatusLabel(item.status)}</td>
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
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

export default function AdminRequestsPage() {
  return <Suspense fallback={<p className="text-sm text-[var(--dash-muted)]">Loading requests…</p>}><RequestList /></Suspense>;
}
