"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type Detail = {
  requestNumber: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  planName: string;
  cpu: number | null;
  ramGb: number | null;
  diskGb: number | null;
  transfer: string | null;
  port: string | null;
  regionName: string;
  osName: string;
  serverName: string;
  hostname: string | null;
  sshPublicKey: string | null;
  additionalRequirements: string | null;
  adminNotes: string | null;
  emailStatus: string;
  createdAt: string;
};

const statuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "PROVISIONING", "ACTIVE", "REJECTED", "CANCELLED"];

export default function AdminRequestPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Detail | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    consoleJson<Detail>(`/api/admin/vps-requests/${params.id}`)
      .then((next) => {
        setItem(next);
        setStatus(next.status);
        setNotes(next.adminNotes ?? "");
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "This request could not be loaded."));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!item) return;
    if (status !== item.status) {
      const warning = status === "ACTIVE"
        ? "Mark this request ACTIVE? This does not provision a server. The infrastructure provider is not connected."
        : `Change ${item.requestNumber} from ${item.status} to ${status}?`;
      if (!window.confirm(warning)) return;
    }
    setNotice("");
    try {
      await consoleJson(`/api/admin/vps-requests/${params.id}`, { method: "PATCH", body: JSON.stringify({ status, adminNotes: notes }) });
      setNotice("Status saved.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The status could not be saved.");
    }
  }

  if (error) return <DashCard className="p-6 text-sm">{error}</DashCard>;
  if (!item) return <p className="text-sm text-[var(--dash-muted)]">Loading request…</p>;

  const rows = [
    ["Customer", item.customerName],
    ["Email", item.customerEmail],
    ["Plan", item.planName],
    ["vCPU", item.cpu],
    ["RAM", item.ramGb == null ? "" : `${item.ramGb} GB`],
    ["Storage", item.diskGb == null ? "" : `${item.diskGb} GB`],
    ["Bandwidth", `${item.transfer ?? ""} · ${item.port ?? ""}`],
    ["Region", item.regionName],
    ["Operating system", item.osName],
    ["Server name", item.serverName],
    ["Hostname", item.hostname || "None"],
    ["Requirements", item.additionalRequirements || "None"],
    ["Email notice", item.emailStatus],
    ["Created", new Date(item.createdAt).toLocaleString()],
  ];

  return (
    <div>
      <PageIntro title={item.requestNumber} lede={`Current status: ${requestStatusLabel(item.status)}. This record is an enquiry, not a running server.`} />
      <DashCard className="grid gap-2 p-4 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => <p key={String(label)}><span className="text-[var(--dash-muted)]">{label}: </span>{value}</p>)}
        {item.sshPublicKey ? <p className="sm:col-span-2 break-all"><span className="text-[var(--dash-muted)]">SSH public key: </span>{item.sshPublicKey}</p> : null}
      </DashCard>
      <DashCard className="mt-3 grid gap-3 p-4">
        <label className="text-sm">Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-2">
            {statuses.map((value) => <option key={value} value={value}>{requestStatusLabel(value)}</option>)}
          </select>
        </label>
        <label className="text-sm">Internal notes
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 min-h-24 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2" />
        </label>
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={save}>Save</button>
        {notice ? <p className="text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      </DashCard>
    </div>
  );
}
