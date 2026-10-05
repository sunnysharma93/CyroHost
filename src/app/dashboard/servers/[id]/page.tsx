"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Server = {
  id: string;
  name: string;
  hostname: string;
  status: string;
  planName: string;
  price: string | null;
  cpu: number | null;
  ramGb: number | null;
  diskGb: number | null;
  transfer: string | null;
  regionName: string;
  osFamily: string;
  hasSshKey: boolean;
  createdAt: string;
  provider: string;
};

export default function ServerDetailPage() {
  const params = useParams<{ id: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [activity, setActivity] = useState<{ id: string; action: string; createdAt: string; metadata: string | null }[]>([]);
  const [hostname, setHostname] = useState("");
  const [sshPublicKey, setSshPublicKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState("");

  const load = useCallback(() => {
    consoleJson<Server>(`/api/servers/${params.id}`)
      .then((next) => {
        setServer(next);
        setHostname(next.hostname);
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Server could not be loaded."));
    consoleJson<{ items: { id: string; action: string; createdAt: string; metadata: string | null }[] }>(`/api/servers/${params.id}/activity`)
      .then((body) => setActivity(body.items))
      .catch(() => setActivity([]));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(action: string) {
    setNotice("");
    try {
      await consoleJson(`/api/servers/${params.id}/${action}`, { method: "POST" });
      setNotice("The provider accepted the action.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The action failed.");
    }
    setConfirm("");
  }

  async function saveConfig() {
    setNotice("");
    try {
      const next = await consoleJson<Server>(`/api/servers/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          hostname,
          ...(sshPublicKey.trim() ? { sshPublicKey } : {}),
        }),
      });
      setServer(next);
      setSshPublicKey("");
      setNotice("Configuration saved on the request. Reverse DNS, firewall, and networking stay unavailable until the infrastructure provider is connected.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The configuration could not be saved.");
    }
  }

  async function cancel() {
    try {
      await consoleJson(`/api/servers/${params.id}`, { method: "DELETE" });
      setNotice("The request was cancelled. No machine was deleted.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The request could not be cancelled.");
    }
    setConfirm("");
  }

  if (error) return <DashCard className="p-6 text-sm">{error}</DashCard>;
  if (!server) return <p className="text-sm text-[var(--dash-muted)]">Loading server…</p>;

  const actions = [
    ["start", "Start"],
    ["stop", "Stop"],
    ["restart", "Restart"],
    ["reinstall", "Reinstall"],
    ["console", "Console"],
  ] as const;

  return (
    <div>
      <PageIntro title={server.name} lede="This record belongs to the signed-in account. Power actions call the infrastructure provider and do not invent a result." />
      <DashCard className="grid gap-3 p-4 sm:grid-cols-2">
        {[
          ["Status", server.status],
          ["IP address", "Not assigned"],
          ["Hostname", server.hostname],
          ["Region", server.regionName],
          ["Operating system", server.osFamily],
          ["Plan", `${server.planName}${server.price ? ` · ${server.price}/month` : ""}`],
          ["Resources", `${server.cpu ?? "—"} vCPU · ${server.ramGb ?? "—"} GB RAM · ${server.diskGb ?? "—"} GB disk`],
          ["Transfer", server.transfer ?? "—"],
          ["SSH key", server.hasSshKey ? "Saved with the request" : "None"],
          ["Created", new Date(server.createdAt).toLocaleString()],
          ["Provider", server.provider === "connected" ? "Connected" : "Not connected"],
          ["Metrics", "Not measured"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-[var(--dash-muted)]">{label}</p>
            <p className="text-sm">{value}</p>
          </div>
        ))}
      </DashCard>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map(([action, label]) => (
          <button key={action} type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={() => setConfirm(action)}>
            {label}
          </button>
        ))}
        {server.status === "requested" ? (
          <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={() => setConfirm("cancel")}>
            Cancel request
          </button>
        ) : null}
        <Link href="/dashboard/servers" className="inline-flex h-9 items-center px-3 text-sm text-[var(--dash-muted)]">All servers</Link>
      </div>
      {confirm ? (
        <DashCard className="mt-3 p-4">
          <p className="text-sm">
            {confirm === "cancel"
              ? "Cancel this unprovisioned request? This does not delete a machine."
              : `Send ${confirm} to the infrastructure provider? If the provider is not connected, nothing changes.`}
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={() => (confirm === "cancel" ? cancel() : act(confirm))}>
              Confirm
            </button>
            <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={() => setConfirm("")}>
              Back
            </button>
          </div>
        </DashCard>
      ) : null}
      <DashCard className="mt-3 grid gap-3 p-4">
        <h2 className="text-sm font-medium">Configuration</h2>
        <label className="text-sm">Hostname
          <input value={hostname} onChange={(event) => setHostname(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">SSH public key
          <textarea value={sshPublicKey} onChange={(event) => setSshPublicKey(event.target.value)} placeholder={server.hasSshKey ? "A key is already saved. Paste a replacement, or leave this blank." : "Optional public key"} className="mt-1 min-h-20 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2" />
        </label>
        <p className="text-xs leading-5 text-[var(--dash-muted)]">Reverse DNS, firewall rules, and extra networking are not available. The infrastructure provider is not connected, so those settings are not invented here.</p>
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={saveConfig}>Save configuration</button>
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">Activity</h2>
        {activity.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--dash-muted)]">No events for this request yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {activity.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-[var(--dash-line)] pb-2">
                <span>{item.action.replaceAll("_", " ")}{item.metadata ? ` · ${item.metadata}` : ""}</span>
                <span className="text-xs text-[var(--dash-muted)]">{new Date(item.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </DashCard>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
    </div>
  );
}
