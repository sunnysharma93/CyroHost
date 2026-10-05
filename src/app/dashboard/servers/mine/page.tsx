"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro, PrimaryLink } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type ServerRow = {
  id: string;
  name: string;
  hostname: string;
  status: string;
  planName: string;
  price: string | null;
  cpu: number | null;
  ramGb: number | null;
  diskGb: number | null;
  regionName: string;
  osFamily: string;
  createdAt: string;
};

type Page = { items: ServerRow[]; page: number; total: number; message: string };

export default function MyServersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ q: query, status, page: String(page), sort, direction: "desc" });
    consoleJson<Page>(`/api/servers?${params.toString()}`)
      .then((next) => {
        setData(next);
        setError("");
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Servers could not be loaded."));
  }, [attempt, page, query, sort, status]);

  return (
    <div>
      <PageIntro title="My Servers" lede="Records saved for this account. A requested row is not a running machine." />
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => {
            setPage(0);
            setQuery(event.target.value);
          }}
          placeholder="Search name, plan, or region"
          aria-label="Search servers"
          className="h-9 min-w-0 flex-1 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm"
        />
        <select
          value={status}
          aria-label="Filter by status"
          onChange={(event) => {
            setPage(0);
            setStatus(event.target.value);
          }}
          className="h-9 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sort} aria-label="Sort servers" onChange={(event) => setSort(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-2 text-sm">
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
        </select>
        <PrimaryLink href="/dashboard/servers">Cloud VPS</PrimaryLink>
      </div>
      {error ? <ErrorPanel title="Unable to load your servers." message={error} onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {!data && !error ? <PageSkeleton label="Loading servers" /> : null}
      {data && data.items.length === 0 ? (
        <DashCard className="p-6">
          <h2 className="text-base font-medium">You don&apos;t have any VPS yet.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">{data.message || "Deploy your first cloud server and manage it from here."}</p>
          <div className="mt-4"><PrimaryLink href="/dashboard/servers">Configure a VPS</PrimaryLink></div>
        </DashCard>
      ) : null}
      {data && data.items.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto border border-[var(--dash-line)] md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs tracking-[0.08em] text-[var(--dash-muted)] uppercase">
                <tr>
                  {["Name", "Status", "Plan", "Region", "OS", "Resources", "Created"].map((label) => (
                    <th key={label} className="px-3 py-2 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((server) => (
                  <tr key={server.id} className="border-t border-[var(--dash-line)]">
                    <td className="px-3 py-2">
                      <Link href={`/dashboard/servers/${server.id}`} className="font-medium hover:text-[var(--dash-accent)]">{server.name}</Link>
                      <p className="text-xs text-[var(--dash-muted)]">{server.hostname}</p>
                    </td>
                    <td className="px-3 py-2">{server.status}</td>
                    <td className="px-3 py-2">{server.planName}{server.price ? ` · ${server.price}` : ""}</td>
                    <td className="px-3 py-2">{server.regionName}</td>
                    <td className="px-3 py-2">{server.osFamily}</td>
                    <td className="px-3 py-2">{server.cpu ?? "—"} vCPU · {server.ramGb ?? "—"} GB · {server.diskGb ?? "—"} GB</td>
                    <td className="px-3 py-2">{new Date(server.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {data.items.map((server) => (
              <Link key={server.id} href={`/dashboard/servers/${server.id}`} className="border border-[var(--dash-line)] bg-[var(--dash-panel)] p-4">
                <p className="font-medium">{server.name}</p>
                <p className="mt-1 text-sm text-[var(--dash-muted)]">{server.status} · {server.planName} · {server.regionName}</p>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button>
            <span className="text-[var(--dash-muted)]">{data.total} total</span>
            <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={(page + 1) * 20 >= data.total} onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
