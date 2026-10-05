"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type Overview = {
  customers: number;
  registrationsToday: number;
  logins: number;
  failedLogins: number;
  openTickets: number;
  infrastructure: string;
  vpsRequests: Record<string, number>;
  recentActivity: { id: string; action: string; createdAt: string; ip: string | null }[];
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    setError("");
    consoleJson<Overview>("/api/admin/overview")
      .then((next) => {
        if (!cancel) setData(next);
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof ConsoleError ? reason.message : "The admin API is not reachable.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt]);

  if (error) return <ErrorPanel title="Unable to load the admin overview." message={error} onRetry={() => setAttempt((value) => value + 1)} />;
  if (!data) return <PageSkeleton label="Loading admin overview" />;

  const cards = [
    ["Customers", data.customers],
    ["Registrations, last 24 hours", data.registrationsToday],
    ["Logins recorded", data.logins],
    ["Failed logins recorded", data.failedLogins],
    ["Open tickets", data.openTickets],
    ["Pending VPS requests", data.vpsRequests.PENDING ?? 0],
    ["Active VPS requests", data.vpsRequests.ACTIVE ?? 0],
  ] as const;

  return (
    <div>
      <PageIntro title="Admin overview" lede="Counts come from the database. Infrastructure capacity is not shown until a provider is connected." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <DashCard key={label} className="p-4">
            <p className="text-xs tracking-[0.12em] text-[var(--dash-muted)] uppercase">{label}</p>
            <p className="mt-2 text-2xl font-light">{value}</p>
          </DashCard>
        ))}
      </div>
      <DashCard className="mt-3 p-4 text-sm text-[var(--dash-muted)]">
        Infrastructure provider: {data.infrastructure === "connected" ? "connected" : "not connected"}.
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">VPS requests</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {Object.entries(data.vpsRequests).map(([status, count]) => (
            <Link key={status} href={`/admin/vps-requests?status=${status}`} className="border border-[var(--dash-line)] px-2 py-1">
              {requestStatusLabel(status)} {count}
            </Link>
          ))}
        </div>
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">Recent activity</h2>
        {data.recentActivity.length === 0 ? <p className="mt-3 text-sm text-[var(--dash-muted)]">No activity yet.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {data.recentActivity.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-[var(--dash-line)] pb-2">
                <span>{item.action.replaceAll("_", " ")}</span>
                <span className="text-xs text-[var(--dash-muted)]">{new Date(item.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </DashCard>
    </div>
  );
}
