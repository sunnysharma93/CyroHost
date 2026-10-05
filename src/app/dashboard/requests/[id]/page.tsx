"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, GhostLink, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { regionAvailabilityLabel, requestStatusLabel } from "@/lib/request-status";

type RequestDetail = {
  id: string;
  requestNumber: string;
  status: string;
  planName: string;
  price: string | null;
  cpu: number | null;
  ramGb: number | null;
  diskGb: number | null;
  transfer: string | null;
  port: string | null;
  regionName: string;
  regionAvailability: string;
  osName: string;
  osFamily: string;
  serverName: string;
  hostname: string | null;
  hasSshKey: boolean;
  adminUsername: string | null;
  additionalRequirements: string | null;
  emailStatus: string;
  createdAt: string;
  updatedAt: string;
  whatsappUrl?: string;
  customerName?: string;
  customerEmail?: string;
  provisioned: boolean;
};

const order = ["PENDING", "UNDER_REVIEW", "APPROVED", "PROVISIONING", "ACTIVE"];

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<RequestDetail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    setError("");
    consoleJson<RequestDetail>(`/api/vps-requests/${params.id}`)
      .then(setItem)
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "This request could not be loaded."));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel() {
    setNotice("");
    try {
      const next = await consoleJson<RequestDetail>(`/api/vps-requests/${params.id}/cancel`, { method: "POST", body: "{}" });
      setItem(next);
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The request could not be cancelled.");
    }
  }

  if (error) return <ErrorPanel title="Unable to load this request." message={error} onRetry={load} />;
  if (!item) return <PageSkeleton label="Loading request" />;

  const rows = [
    ["Request ID", item.requestNumber],
    ["Status", requestStatusLabel(item.status)],
    ["Customer", item.customerName ?? ""],
    ["Email", item.customerEmail ?? ""],
    ["Plan", `${item.planName}${item.price ? ` · ${item.price}/month` : ""}`],
    ["vCPU", item.cpu == null ? "" : String(item.cpu)],
    ["RAM", item.ramGb == null ? "" : `${item.ramGb} GB`],
    ["Storage", item.diskGb == null ? "" : `${item.diskGb} GB NVMe`],
    ["Bandwidth", `${item.transfer ?? ""} · ${item.port ?? ""}`],
    ["Region", `${item.regionName} · ${regionAvailabilityLabel(item.regionAvailability)}`],
    ["Operating system", item.osName],
    ["Server name", item.serverName],
    ["Hostname", item.hostname || "None"],
    ["SSH public key", item.osFamily === "linux" ? (item.hasSshKey ? "Saved with the request" : "None") : "Not used for this operating system"],
    ["Admin username", item.adminUsername || "None"],
    ["Additional requirements", item.additionalRequirements || "None"],
    ["Created", new Date(item.createdAt).toLocaleString()],
    ["Updated", new Date(item.updatedAt).toLocaleString()],
  ];

  return (
    <div>
      <PageIntro title={item.requestNumber} lede="This request is waiting for the CyroHost team. It is not a provisioned VPS." />
      <DashCard className="p-5">
        <ol className="flex flex-wrap gap-2 text-xs uppercase">
          {(item.status === "REJECTED" || item.status === "CANCELLED" ? [item.status] : order).map((status) => (
            <li key={status} className={`border px-2 py-1 ${status === item.status ? "border-[var(--dash-accent)]" : "border-[var(--dash-line)] text-[var(--dash-muted)]"}`}>
              {requestStatusLabel(status)}
            </li>
          ))}
        </ol>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}><dt className="text-[var(--dash-muted)]">{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-[var(--dash-muted)]">{emailNote(item.emailStatus)}</p>
      </DashCard>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <GhostLink href="/dashboard">Back to Dashboard</GhostLink>
        {item.whatsappUrl ? (
          <a href={item.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center bg-[#25D366] px-3 text-sm text-white">Continue to WhatsApp</a>
        ) : null}
        {item.status === "PENDING" || item.status === "UNDER_REVIEW" ? (
          <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={cancel}>Cancel request</button>
        ) : null}
        <Link href="/dashboard/requests" className="inline-flex h-9 items-center px-3 text-sm text-[var(--dash-muted)]">All requests</Link>
      </div>
    </div>
  );
}

function emailNote(status: string) {
  if (status === "SENT") return "CyroHost was notified by email.";
  if (status === "FAILED") return "The request is saved. The notification email could not be sent.";
  if (status === "NOT_CONFIGURED") return "The request is saved. Email notification is not configured.";
  return "The request is saved.";
}
