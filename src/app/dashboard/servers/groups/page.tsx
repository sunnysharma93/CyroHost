"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Group = { id: string; name: string; serverIds: string[] };
type Server = { id: string; name: string; status: string };

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ items: Group[] }>("/api/server-groups").then((body) => setGroups(body.items)).catch(() => setNotice("Groups could not be loaded."));
    consoleJson<{ items: Server[] }>("/api/servers?size=50").then((body) => setServers(body.items.filter((item) => item.status !== "cancelled"))).catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, []);

  async function createGroup() {
    try {
      await consoleJson("/api/server-groups", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      setNotice("Group saved for this account.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The group could not be saved.");
    }
  }

  async function rename(group: Group) {
    const next = window.prompt("Group name", group.name);
    if (!next) return;
    try {
      await consoleJson(`/api/server-groups/${group.id}`, { method: "PATCH", body: JSON.stringify({ name: next }) });
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The group could not be renamed.");
    }
  }

  async function remove(group: Group) {
    if (!window.confirm(`Delete the group ${group.name}? Servers stay on the account.`)) return;
    await consoleJson(`/api/server-groups/${group.id}`, { method: "DELETE" });
    load();
  }

  async function assign(groupId: string, serverId: string) {
    if (!serverId) return;
    await consoleJson(`/api/server-groups/${groupId}/servers`, { method: "POST", body: JSON.stringify({ serverId }) });
    load();
  }

  async function unassign(groupId: string, serverId: string) {
    await consoleJson(`/api/server-groups/${groupId}/servers/${serverId}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageIntro title="Server Groups" lede="Groups organise this account's server requests. They do not create infrastructure." />
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Group name" placeholder="Group name" className="h-9 min-w-48 flex-1 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
        <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={createGroup}>Create group</button>
      </div>
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
      {groups.length === 0 ? <DashCard className="p-6 text-sm text-[var(--dash-muted)]">No server groups yet.</DashCard> : null}
      <div className="grid gap-3">
        {groups.map((group) => (
          <DashCard key={group.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium">{group.name}</h2>
              <div className="flex gap-2">
                <button type="button" className="h-8 border border-[var(--dash-line)] px-2 text-xs" onClick={() => rename(group)}>Rename</button>
                <button type="button" className="h-8 border border-[var(--dash-line)] px-2 text-xs" onClick={() => remove(group)}>Delete</button>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {group.serverIds.length === 0 ? <li className="text-[var(--dash-muted)]">No servers in this group.</li> : null}
              {group.serverIds.map((id) => (
                <li key={id} className="flex items-center justify-between gap-2">
                  <span>{servers.find((server) => server.id === id)?.name ?? id}</span>
                  <button type="button" className="text-xs text-[var(--dash-muted)]" onClick={() => unassign(group.id, id)}>Remove</button>
                </li>
              ))}
            </ul>
            <select aria-label={`Assign a server to ${group.name}`} className="mt-3 h-9 w-full border border-[var(--dash-line)] bg-transparent px-2 text-sm" defaultValue="" onChange={(event) => assign(group.id, event.target.value)}>
              <option value="">Assign a server</option>
              {servers.filter((server) => !group.serverIds.includes(server.id)).map((server) => (
                <option key={server.id} value={server.id}>{server.name}</option>
              ))}
            </select>
          </DashCard>
        ))}
      </div>
    </div>
  );
}
