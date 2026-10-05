"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type RequestRow = {
  id: string;
  requestNumber: string;
  planName: string;
  regionName: string;
  osName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function RequestsPage() {
  const [items, setItems] = useState<RequestRow[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    setError("");
    consoleJson<{ items: RequestRow[] }>("/api/vps-requests")
      .then((body) => {
        if (!cancel) setItems(body.items);
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof ConsoleError ? reason.message : "Requests could not be loaded.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt]);

  return (
    <div>
      <PageIntro title="VPS Requests" lede="Requests saved for this account. A pending request is not an active server." />
      {error ? <ErrorPanel title="Unable to load your requests." message={error} onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {!items && !error ? <PageSkeleton label="Loading requests" /> : null}
      {items && items.length === 0 ? (
        <DashCard className="p-6">
          <h2 className="text-base font-medium">You don&apos;t have any VPS requests yet.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">Choose a plan and send a configuration. A request is reviewed before anything is provisioned.</p>
          <Link href="/dashboard/servers" className="mt-4 inline-flex h-9 items-center bg-[var(--dash-accent)] px-3 text-sm text-white">Configure a VPS</Link>
        </DashCard>
      ) : null}
      {items && items.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto border border-[var(--dash-line)] md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs tracking-[0.08em] text-[var(--dash-muted)] uppercase">
                <tr>{["Request ID", "Plan", "Region", "OS", "Status", "Created", "Updated", "Action"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--dash-line)]">
                    <td className="px-3 py-2">{item.requestNumber}</td>
                    <td className="px-3 py-2">{item.planName}</td>
                    <td className="px-3 py-2">{item.regionName}</td>
                    <td className="px-3 py-2">{item.osName}</td>
                    <td className="px-3 py-2">{requestStatusLabel(item.status)}</td>
                    <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{new Date(item.updatedAt).toLocaleString()}</td>
                    <td className="px-3 py-2"><Link href={`/dashboard/requests/${item.id}`} className="hover:text-[var(--dash-accent)]">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <Link key={item.id} href={`/dashboard/requests/${item.id}`} className="border border-[var(--dash-line)] bg-[var(--dash-panel)] p-4">
                <p className="font-medium">{item.requestNumber}</p>
                <p className="mt-1 text-sm text-[var(--dash-muted)]">{item.planName} · {item.regionName} · {requestStatusLabel(item.status)}</p>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
