"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Os = { id: string; name: string; family: string; note: string; active: boolean };

export default function AdminOsPage() {
  const [items, setItems] = useState<Os[] | null>(null);
  const [draft, setDraft] = useState({ id: "", name: "", family: "linux", note: "Confirmed when the request is reviewed.", active: true });
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ operatingSystems: Os[] }>("/api/admin/catalog").then((body) => setItems(body.operatingSystems)).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Operating systems could not be loaded."));
  }
  useEffect(() => { load(); }, []);

  async function save(os: Os, create = false) {
    try {
      await consoleJson(create ? "/api/admin/operating-systems" : `/api/admin/operating-systems/${os.id}`, {
        method: create ? "POST" : "PATCH",
        body: JSON.stringify({ ...os, active: String(os.active) }),
      });
      setNotice("Operating system saved.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The operating system could not be saved.");
    }
  }

  return (
    <div>
      <PageIntro title="Operating systems" lede="Customers only see active systems. Named images can be added here when they are actually offered." />
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      <div className="grid gap-3">
        {items?.map((os) => <OsEditor key={os.id} os={os} onSave={save} />)}
      </div>
      <DashCard className="mt-4 grid gap-2 p-4 text-sm">
        <h2 className="font-medium">Add an operating system</h2>
        <input aria-label="OS id" placeholder="id" value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
        <input aria-label="OS name" placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
        <select aria-label="Family" value={draft.family} onChange={(event) => setDraft({ ...draft, family: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2">
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
        </select>
        <textarea aria-label="Note" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} className="min-h-20 border border-[var(--dash-line)] bg-transparent px-2 py-2" />
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-white" onClick={() => save(draft, true)}>Add operating system</button>
      </DashCard>
    </div>
  );
}

function OsEditor({ os, onSave }: { os: Os; onSave: (os: Os) => void }) {
  const [draft, setDraft] = useState(os);
  return (
    <DashCard className="grid gap-2 p-4 text-sm">
      <p className="font-medium">{os.id}</p>
      <input aria-label="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <select aria-label="Family" value={draft.family} onChange={(event) => setDraft({ ...draft, family: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2">
        <option value="linux">Linux</option>
        <option value="windows">Windows</option>
      </select>
      <textarea aria-label="Note" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} className="min-h-20 border border-[var(--dash-line)] bg-transparent px-2 py-2" />
      <label className="flex items-center gap-2"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active</label>
      <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-white" onClick={() => onSave(draft)}>Save</button>
    </DashCard>
  );
}
