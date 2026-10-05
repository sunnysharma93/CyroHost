"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Plan = { id: string; name: string; price: string; cpu: number; ramGb: number; diskGb: number; transfer: string; port: string; windows: boolean; active: boolean };

const empty = { id: "", name: "", price: "", cpu: "1", ramGb: "1", diskGb: "48", transfer: "5 TB", port: "1 Gbps", windows: false, active: true };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [draft, setDraft] = useState(empty);
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ plans: Plan[] }>("/api/admin/catalog").then((body) => setPlans(body.plans)).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Plans could not be loaded."));
  }

  useEffect(() => { load(); }, []);

  async function save(plan: Plan, previousPrice: string, create = false) {
    if (!create && plan.price !== previousPrice && !window.confirm(`Change the console catalogue price for ${plan.id} from ${previousPrice} to ${plan.price}? The public pricing page is not updated.`)) {
      return;
    }
    setNotice("");
    const body = { ...plan, cpu: String(plan.cpu), ramGb: String(plan.ramGb), diskGb: String(plan.diskGb), windows: String(plan.windows), active: String(plan.active), price: plan.price };
    try {
      await consoleJson(create ? "/api/admin/plans" : `/api/admin/plans/${plan.id}`, { method: create ? "POST" : "PATCH", body: JSON.stringify(body) });
      setNotice("Plan saved. The public pricing page is unchanged.");
      setDraft(empty);
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The plan could not be saved.");
    }
  }

  return (
    <div>
      <PageIntro title="Plans" lede="Console catalogue prices. The public pricing page keeps its own published copy." />
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      {!plans ? <p className="text-sm text-[var(--dash-muted)]">Loading plans…</p> : null}
      <div className="grid gap-3">
        {plans?.map((plan) => <PlanForm key={plan.id} plan={plan} onSave={(next) => save(next, plan.price)} />)}
      </div>
      <DashCard className="mt-4 p-4">
        <h2 className="text-sm font-medium">Add a plan</h2>
        <PlanForm plan={{ ...draft, cpu: Number(draft.cpu), ramGb: Number(draft.ramGb), diskGb: Number(draft.diskGb) }} create onSave={(next) => save(next, next.price, true)} />
      </DashCard>
    </div>
  );
}

function PlanForm({ plan, onSave, create = false }: { plan: Plan; onSave: (plan: Plan) => void; create?: boolean }) {
  const [draft, setDraft] = useState(plan);
  return (
    <form className="mt-3 grid gap-2 border border-[var(--dash-line)] p-3 text-sm md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); onSave(draft); }}>
      {create ? <input aria-label="Plan id" placeholder="id" value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" /> : <p className="self-center">{draft.id}</p>}
      <input aria-label="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <input aria-label="Price" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <input aria-label="CPU" value={draft.cpu} onChange={(event) => setDraft({ ...draft, cpu: Number(event.target.value) })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <input aria-label="RAM GB" value={draft.ramGb} onChange={(event) => setDraft({ ...draft, ramGb: Number(event.target.value) })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <input aria-label="Disk GB" value={draft.diskGb} onChange={(event) => setDraft({ ...draft, diskGb: Number(event.target.value) })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <input aria-label="Transfer" value={draft.transfer} onChange={(event) => setDraft({ ...draft, transfer: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <input aria-label="Port" value={draft.port} onChange={(event) => setDraft({ ...draft, port: event.target.value })} className="h-9 border border-[var(--dash-line)] bg-transparent px-2" />
      <label className="flex items-center gap-2"><input type="checkbox" checked={draft.windows} onChange={(event) => setDraft({ ...draft, windows: event.target.checked })} /> Windows</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active</label>
      <button type="submit" className="h-9 bg-[var(--dash-accent)] px-3 text-white">{create ? "Add plan" : "Save"}</button>
    </form>
  );
}
