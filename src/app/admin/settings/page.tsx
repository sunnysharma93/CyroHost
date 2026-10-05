"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Notice = { id: string; kind: string; subject: string; status: string; createdAt: string };

export default function AdminSettingsPage() {
  const [items, setItems] = useState<Notice[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<{ items: Notice[] }>("/api/admin/notifications")
      .then((body) => setItems(body.items))
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Notification status could not be loaded."));
  }, []);

  const unconfigured = items?.some((item) => item.status === "NOT_CONFIGURED");

  return (
    <div>
      <PageIntro title="Settings" lede="Email uses MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, and ADMIN_NOTIFICATION_EMAIL. The first administrator is created from CYROHOST_ADMIN_EMAIL and CYROHOST_ADMIN_PASSWORD. Further administrators are granted from Users / Team." />
      {error ? <DashCard className="p-4 text-sm">{error}</DashCard> : null}
      {unconfigured ? <DashCard className="mb-3 p-4 text-sm">Email notification is not configured. Requests and sign-ins are still saved.</DashCard> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading notification status…</p> : null}
      {items && items.length === 0 ? <DashCard className="p-5 text-sm text-[var(--dash-muted)]">No notification events yet.</DashCard> : null}
      {items && items.length > 0 ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]"><tr>{["Kind", "Subject", "Status", "Time"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--dash-line)]">
                  <td className="px-3 py-2">{item.kind}</td>
                  <td className="px-3 py-2">{item.subject}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
