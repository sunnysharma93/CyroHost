"use client";

import { useState } from "react";
import { DashCard, PageIntro, WhatsAppSupport } from "@/components/dashboard/DashUi";
import { useDashboardUser } from "@/components/dashboard/DashboardSession";
import { ConsoleError, consoleJson } from "@/lib/console-api";

const kinds = [
  ["dedicated", "Dedicated Servers"],
  ["colocation", "Colocation"],
  ["enterprise", "Enterprise Infrastructure"],
] as const;

export default function DedicatedPage() {
  const user = useDashboardUser();
  const [kind, setKind] = useState<(typeof kinds)[number][0]>("dedicated");
  const [name, setName] = useState(user.fullName);
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [budget, setBudget] = useState("");
  const [requirement, setRequirement] = useState("");
  const [notice, setNotice] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  async function submit() {
    setNotice("");
    setWhatsapp("");
    try {
      const saved = await consoleJson<{ message: string; whatsappUrl: string }>("/api/enquiries", {
        method: "POST",
        body: JSON.stringify({ kind, name, email: user.email ?? "", company, region, budget, requirement }),
      });
      setNotice(saved.message);
      setWhatsapp(saved.whatsappUrl);
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The enquiry could not be saved.");
    }
  }

  return (
    <div>
      <PageIntro title="Dedicated & Colocation" lede="Tell CyroHost what you need. This page does not reserve a rack or a machine." />
      <div className="mb-3 grid gap-3 md:grid-cols-3">
        {kinds.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setKind(id)} className={`border p-4 text-left ${kind === id ? "border-[var(--dash-accent)]" : "border-[var(--dash-line)]"} bg-[var(--dash-panel)]`}>
            <p className="font-medium">{label}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">Availability is confirmed with the team. No live inventory is shown.</p>
          </button>
        ))}
      </div>
      <DashCard className="grid gap-3 p-4">
        <label className="text-sm">Name
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Email
          <input value={user.email ?? ""} readOnly className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3 text-[var(--dash-muted)]" />
        </label>
        <label className="text-sm">Company
          <input value={company} onChange={(event) => setCompany(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Region
          <input value={region} onChange={(event) => setRegion(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Budget, optional
          <input value={budget} onChange={(event) => setBudget(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Requirement
          <textarea value={requirement} onChange={(event) => setRequirement(event.target.value)} className="mt-1 min-h-28 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2" />
        </label>
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={submit}>Submit enquiry</button>
        {notice ? <p className="text-sm text-[var(--dash-muted)]">{notice}</p> : null}
        <div className="flex flex-wrap gap-2">
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center bg-[#25D366] px-3 text-sm text-white">Continue on WhatsApp</a>
          ) : null}
          <WhatsAppSupport />
        </div>
      </DashCard>
    </div>
  );
}
