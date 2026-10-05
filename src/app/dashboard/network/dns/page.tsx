"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Zone = { id: string; name: string; published: boolean; provider: string; records?: RecordRow[] };
type RecordRow = { id: string; type: string; host: string; value: string; ttl: number };

export default function DnsPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Zone | null>(null);
  const [host, setHost] = useState("@");
  const [type, setType] = useState("A");
  const [value, setValue] = useState("");
  const [ttl, setTtl] = useState("300");
  const [editing, setEditing] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ items: Zone[]; message: string }>("/api/network/dns/zones").then((body) => {
      setZones(body.items);
      setMessage(body.message);
    }).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "DNS could not be loaded."));
  }

  useEffect(() => {
    load();
  }, []);

  async function openZone(id: string) {
    const zone = await consoleJson<Zone>(`/api/network/dns/zones/${id}`);
    setSelected(zone);
  }

  async function createZone() {
    try {
      await consoleJson("/api/network/dns/zones", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      setNotice("Zone saved. It is not published to a DNS provider.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The zone could not be saved.");
    }
  }

  function editRecord(record: RecordRow) {
    setEditing(record.id);
    setHost(record.host);
    setType(record.type);
    setValue(record.value);
    setTtl(String(record.ttl));
  }

  async function addRecord() {
    if (!selected) return;
    try {
      const path = editing
        ? `/api/network/dns/zones/${selected.id}/records/${editing}`
        : `/api/network/dns/zones/${selected.id}/records`;
      await consoleJson(path, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ host, type, value, ttl }),
      });
      setValue("");
      setEditing("");
      setNotice(editing ? "Record updated. It is still not published." : "Record saved. It is not published to a DNS provider.");
      await openZone(selected.id);
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The record could not be saved.");
    }
  }

  async function removeRecord(recordId: string) {
    if (!selected || !window.confirm("Delete this saved record? It was not published.")) return;
    await consoleJson(`/api/network/dns/zones/${selected.id}/records/${recordId}`, { method: "DELETE" });
    await openZone(selected.id);
  }

  async function removeZone(id: string) {
    if (!window.confirm("Delete this saved zone and its records?")) return;
    await consoleJson(`/api/network/dns/zones/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  }

  return (
    <div>
      <PageIntro title="DNS" lede={message || "Zones are stored for this account and are not sent to a DNS provider."} />
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Zone name" placeholder="example.com" className="h-9 min-w-48 flex-1 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
        <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={createZone}>Add zone</button>
      </div>
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
      {zones.length === 0 ? <DashCard className="p-6 text-sm text-[var(--dash-muted)]">No DNS zones saved for this account.</DashCard> : null}
      <div className="grid gap-2">
        {zones.map((zone) => (
          <button key={zone.id} type="button" className="border border-[var(--dash-line)] bg-[var(--dash-panel)] p-4 text-left text-sm" onClick={() => openZone(zone.id)}>
            {zone.name} · {zone.published ? "published" : "not published"}
          </button>
        ))}
      </div>
      {selected ? (
        <DashCard className="mt-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{selected.name}</h2>
            <button type="button" className="text-xs" onClick={() => removeZone(selected.id)}>Delete zone</button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-[var(--dash-muted)] uppercase">
                <tr>{["Host", "Type", "Value", "TTL", ""].map((label) => <th key={label} className="px-2 py-2 font-medium">{label}</th>)}</tr>
              </thead>
              <tbody>
                {selected.records?.map((record) => (
                  <tr key={record.id} className="border-t border-[var(--dash-line)]">
                    <td className="px-2 py-2">{record.host}</td>
                    <td className="px-2 py-2">{record.type}</td>
                    <td className="px-2 py-2">{record.value}</td>
                    <td className="px-2 py-2">{record.ttl}</td>
                    <td className="px-2 py-2">
                      <button type="button" className="mr-3" onClick={() => editRecord(record)}>Edit</button>
                      <button type="button" onClick={() => removeRecord(record.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <input value={host} onChange={(event) => setHost(event.target.value)} aria-label="Host" className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm" />
            <select value={type} aria-label="Record type" onChange={(event) => setType(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm">
              {["A", "AAAA", "CNAME", "MX", "TXT", "NS"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={value} onChange={(event) => setValue(event.target.value)} aria-label="Record value" className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm" />
            <input value={ttl} onChange={(event) => setTtl(event.target.value)} aria-label="TTL" className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={addRecord}>{editing ? "Save record" : "Add record"}</button>
            {editing ? <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={() => setEditing("")}>Cancel edit</button> : null}
          </div>
        </DashCard>
      ) : null}
    </div>
  );
}
