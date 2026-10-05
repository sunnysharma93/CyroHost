"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type Detail = {
  fullName: string;
  email: string | null;
  status: string;
  phone: string | null;
  company: string | null;
  timezone: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  requests: { id: string; requestNumber: string; status: string; planName: string }[];
  tickets: { id: string; subject: string; status: string }[];
  activity: { id: string; action: string; createdAt: string; ip: string | null; userAgent: string | null }[];
};

export default function AdminCustomerPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Detail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<Detail>(`/api/admin/customers/${params.id}`)
      .then(setItem)
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "This customer could not be loaded."));
  }, [params.id]);

  if (error) return <DashCard className="p-6 text-sm">{error}</DashCard>;
  if (!item) return <p className="text-sm text-[var(--dash-muted)]">Loading customer…</p>;

  return (
    <div>
      <PageIntro title={item.fullName} lede={item.email ?? "No email"} />
      <DashCard className="grid gap-2 p-4 text-sm sm:grid-cols-2">
        <p>Status: {item.status}</p>
        <p>Phone: {item.phone || "None"}</p>
        <p>Company: {item.company || "None"}</p>
        <p>Timezone: {item.timezone || "None"}</p>
        <p>Registered: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "None"}</p>
        <p>Last login: {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString() : "None recorded"}</p>
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">VPS requests</h2>
        {item.requests.length === 0 ? <p className="mt-2 text-sm text-[var(--dash-muted)]">None.</p> : (
          <ul className="mt-2 space-y-1 text-sm">
            {item.requests.map((request) => (
              <li key={request.id}><Link href={`/admin/vps-requests/${request.id}`} className="hover:text-[var(--dash-accent)]">{request.requestNumber}</Link> · {request.planName} · {requestStatusLabel(request.status)}</li>
            ))}
          </ul>
        )}
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">Tickets</h2>
        {item.tickets.length === 0 ? <p className="mt-2 text-sm text-[var(--dash-muted)]">None.</p> : (
          <ul className="mt-2 space-y-1 text-sm">
            {item.tickets.map((ticket) => (
              <li key={ticket.id}><Link href={`/admin/support/${ticket.id}`} className="hover:text-[var(--dash-accent)]">{ticket.subject}</Link> · {ticket.status}</li>
            ))}
          </ul>
        )}
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">Activity</h2>
        {item.activity.length === 0 ? <p className="mt-2 text-sm text-[var(--dash-muted)]">None.</p> : (
          <ul className="mt-2 space-y-2 text-sm">
            {item.activity.map((event) => (
              <li key={event.id}>{event.action.replaceAll("_", " ")} · {new Date(event.createdAt).toLocaleString()} · {event.ip || "No IP"}</li>
            ))}
          </ul>
        )}
      </DashCard>
    </div>
  );
}
