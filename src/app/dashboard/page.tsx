"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { useDashboardUser } from "@/components/dashboard/DashboardSession";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type Dashboard = {
  user: { fullName: string; email: string | null; status: string; createdAt?: string };
  account: { name: string; role: string };
  infrastructure: { connected: boolean; message: string };
  billing: { connected: boolean };
  vpsRequests: Record<string, number>;
  recentVpsRequests: { id: string; requestNumber: string; planName: string; status: string; createdAt: string }[];
  recentActivity: { id: string; action: string; createdAt: string }[];
  recentTickets: { id: string; subject: string; status: string }[];
};

const actions = [
  ["Deploy VPS", "Choose a published plan and send a configuration request.", "/dashboard/servers"],
  ["My Servers", "Open saved server records for this account.", "/dashboard/servers/mine"],
  ["VPS Requests", "Follow the requests you have submitted.", "/dashboard/requests"],
  ["Support", "Open a ticket with the CyroHost team.", "/dashboard/support"],
  ["Billing", "Invoices, wallet, and offers stored for this account.", "/dashboard/billing/invoices"],
] as const;

const statuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "PROVISIONING", "ACTIVE", "REJECTED", "CANCELLED"] as const;

export default function OverviewPage() {
  const session = useDashboardUser();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    setError("");
    consoleJson<Dashboard>("/api/dashboard")
      .then((next) => {
        if (!cancel) setData(next);
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof ConsoleError ? reason.message : "The console API is not reachable.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt]);

  if (error) {
    return (
      <div>
        <PageIntro title="Overview" lede="The console could not load this account." />
        <ErrorPanel title="Unable to load your account." message={error} onRetry={() => setAttempt((value) => value + 1)} />
      </div>
    );
  }
  if (!data) return <PageSkeleton label="Loading your account" />;

  return (
    <div>
      <PageIntro title={`Welcome back, ${data.user.fullName}`} lede="Requests, support, and account access. Live servers appear here only after an infrastructure provider is connected." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map(([title, body, href]) => (
          <Link key={href} href={href} className="border border-[var(--dash-line)] bg-[var(--dash-panel)] p-5 hover:border-[var(--dash-accent)]">
            <p className="text-base font-medium">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">{body}</p>
          </Link>
        ))}
      </div>

      <DashCard className="mt-3 p-5">
        <h2 className="text-sm font-medium">Infrastructure summary</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">{data.infrastructure.message}</p>
      </DashCard>

      <DashCard className="mt-3 p-5">
        <h2 className="text-sm font-medium">VPS request status</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map((status) => (
            <div key={status} className="border border-[var(--dash-line)] px-3 py-2">
              <p className="text-xs tracking-[0.12em] text-[var(--dash-muted)] uppercase">{requestStatusLabel(status)}</p>
              <p className="mt-1 text-xl font-light">{data.vpsRequests[status] ?? 0}</p>
            </div>
          ))}
        </div>
        {data.recentVpsRequests.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--dash-muted)]">No VPS requests yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {data.recentVpsRequests.map((item) => (
              <li key={item.id}>
                <Link href={`/dashboard/requests/${item.id}`} className="hover:text-[var(--dash-accent)]">
                  {item.requestNumber} · {item.planName}
                </Link>
                <span className="ml-2 text-xs text-[var(--dash-muted)]">{requestStatusLabel(item.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </DashCard>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <DashCard className="p-5">
          <h2 className="text-sm font-medium">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--dash-muted)]">No account activity yet.</p>
          ) : (
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
        <DashCard className="p-5">
          <h2 className="text-sm font-medium">Support</h2>
          {data.recentTickets.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--dash-muted)]">No tickets yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link href={`/dashboard/support/${ticket.id}`} className="hover:text-[var(--dash-accent)]">{ticket.subject}</Link>
                  <span className="ml-2 text-xs text-[var(--dash-muted)]">{ticket.status}</span>
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-5 text-sm font-medium">Account</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-[var(--dash-muted)]">Name</dt><dd>{session.fullName}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--dash-muted)]">Email</dt><dd>{session.email ?? "No email"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--dash-muted)]">Created</dt><dd>{data.user.createdAt ? new Date(data.user.createdAt).toLocaleString() : "Not recorded"}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-[var(--dash-muted)]">{data.billing.connected ? "Billing provider is connected." : "Payment gateway not configured."}</p>
        </DashCard>
      </div>
    </div>
  );
}
