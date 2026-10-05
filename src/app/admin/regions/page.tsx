"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Region = { id: string; name: string; availability: string; note: string };

export default function AdminRegionsPage() {
  const [items, setItems] = useState<Region[] | null>(null);
  const [draft, setDraft] = useState({ id: "", name: "", availability: "ENQUIRY_ONLY", note: "Availability on request." });
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ regions: Region[] }>("/api/admin/catalog").then((body) => setItems(body.regions)).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Regions could not be loaded."));
  }
  useEffect(() => { load(); }, []);

  async function save(region: Region, create = false) {
    try {
      await consoleJson(create ? "/api/admin/regions" : `/api/admin/regions/${region.id}`, { method: create ? "POST" : "PATCH", body: JSON.stringify(region) });
      setNotice("Region saved. AVAILABLE should be used only after a provider confirms capacity.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The region could not be saved.");
    }
  }

  return (
    <div>
      <PageIntro title="Regions" lede="Availability stays on request unless a provider confirms live capacity." />
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      <div className="grid gap-3">
        {items?.map((region) => <RegionEditor key={region.id} region={region} onSave={save} />)}
      </div>
      <DashCard className="mt-4 grid gap-2 p-4 text-sm">
        <h2 className="font-medium">Add a region</h2>
        <input aria-label="Region id" placeholder="id" value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
        <input aria-label="Region name" placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
        <textarea aria-label="Region note" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} className="min-h-20 border border-[var(--dash-line)] bg-transparent px-2 py-2" />
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-white" onClick={() => save(draft, true)}>Add region</button>
      </DashCard>
    </div>
  );
}

function RegionEditor({ region, onSave }: { region: Region; onSave: (region: Region) => void }) {
  const [draft, setDraft] = useState(region);
  return (
    <DashCard className="grid gap-2 p-4 text-sm">
      <p className="font-medium">{region.id}</p>
      <input aria-label="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <select aria-label="Availability" value={draft.availability} onChange={(event) => setDraft({ ...draft, availability: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2">
        <option value="ENQUIRY_ONLY">Availability on request</option>
        <option value="AVAILABLE">Available</option>
        <option value="DISABLED">Disabled</option>
      </select>
      <textarea aria-label="Note" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} className="min-h-20 border border-[var(--dash-line)] bg-transparent px-2 py-2" />
      <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-white" onClick={() => onSave(draft)}>Save</button>
    </DashCard>
  );
}
