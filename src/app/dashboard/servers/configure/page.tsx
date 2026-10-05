"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ErrorPanel, PageSkeleton, pushToast } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { useDashboardUser } from "@/components/dashboard/DashboardSession";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { regionAvailabilityLabel } from "@/lib/request-status";

type Plan = { id: string; name: string; price: string; cpu: number; ramGb: number; diskGb: number; transfer: string; port: string; windows: boolean };
type Region = { id: string; name: string; availability: string; note: string };
type Os = { id: string; name: string; family: string; note: string };
type Catalog = { plans: Plan[]; regions: Region[]; operatingSystems: Os[]; note: string };

const steps = ["Plan", "Region", "Operating system", "Server details", "Optional configuration", "Review"] as const;

function ConfigureWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useDashboardUser();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState(params.get("plan") ?? "");
  const [regionId, setRegionId] = useState("");
  const [osId, setOsId] = useState("");
  const [serverName, setServerName] = useState("");
  const [hostname, setHostname] = useState("");
  const [sshPublicKey, setSshPublicKey] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancel = false;
    setError("");
    consoleJson<Catalog>("/api/catalog")
      .then((next) => {
        if (cancel) return;
        setCatalog(next);
        setPlanId((current) => current || next.plans[0]?.id || "");
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof ConsoleError ? reason.message : "The plan catalogue could not be loaded.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt]);

  const plan = useMemo(() => catalog?.plans.find((item) => item.id === planId) ?? null, [catalog, planId]);
  const region = catalog?.regions.find((item) => item.id === regionId) ?? null;
  const os = catalog?.operatingSystems.find((item) => item.id === osId) ?? null;
  const windowsBlocked = os?.family === "windows" && plan && !plan.windows;

  function next() {
    setNotice("");
    if (step === 0 && !plan) return setNotice("Choose a plan.");
    if (step === 1 && !region) return setNotice("Choose a region.");
    if (step === 2 && (!os || windowsBlocked)) return setNotice(windowsBlocked ? "Nano is Linux only on the published price list." : "Choose an operating system.");
    if (step === 3 && serverName.trim().length < 2) return setNotice("Enter a server name.");
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function submit() {
    if (!plan || !region || !os) return;
    setBusy(true);
    setNotice("");
    try {
      const created = await consoleJson<{ id: string }>("/api/vps-requests", {
        method: "POST",
        body: JSON.stringify({
          planId: plan.id,
          regionId: region.id,
          osId: os.id,
          serverName,
          hostname,
          sshPublicKey: os.family === "linux" ? sshPublicKey : "",
          adminUsername: os.family === "windows" ? adminUsername : "",
          additionalRequirements,
        }),
      });
      router.push(`/dashboard/requests/${created.id}/success`);
    } catch (reason) {
      const message = reason instanceof ConsoleError ? reason.message : "The request could not be saved.";
      setNotice(message);
      pushToast("error", "Unable to submit VPS request.");
      setBusy(false);
    }
  }

  if (error) return <ErrorPanel title="Unable to load the catalogue." message={error} onRetry={() => setAttempt((value) => value + 1)} />;
  if (!catalog) return <PageSkeleton label="Loading the catalogue" />;

  return (
    <div>
      <PageIntro title="Configure VPS" lede="This sends a request for review. It does not provision a server." />
      <ol className="mb-5 flex flex-wrap gap-2 text-xs tracking-[0.12em] uppercase">
        {steps.map((label, index) => (
          <li key={label} className={`border px-2 py-1 ${index === step ? "border-[var(--dash-accent)] text-[var(--dash-ink)]" : "border-[var(--dash-line)] text-[var(--dash-muted)]"}`}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      {step === 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {catalog.plans.map((item) => (
            <button key={item.id} type="button" onClick={() => setPlanId(item.id)} className={`border p-4 text-left ${planId === item.id ? "border-[var(--dash-accent)]" : "border-[var(--dash-line)]"} bg-[var(--dash-panel)]`}>
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-lg font-light">{item.price}/month</p>
              <p className="mt-2 text-xs text-[var(--dash-muted)]">{item.cpu} vCPU · {item.ramGb} GB RAM · {item.diskGb} GB NVMe · {item.transfer} · {item.port}</p>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {catalog.regions.map((item) => (
            <button key={item.id} type="button" onClick={() => setRegionId(item.id)} className={`border p-4 text-left ${regionId === item.id ? "border-[var(--dash-accent)]" : "border-[var(--dash-line)]"} bg-[var(--dash-panel)]`}>
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-xs tracking-[0.08em] text-[var(--dash-muted)] uppercase">{regionAvailabilityLabel(item.availability)}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">{item.note}</p>
            </button>
          ))}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {catalog.operatingSystems.map((item) => {
            const blocked = item.family === "windows" && plan && !plan.windows;
            return (
              <button key={item.id} type="button" disabled={Boolean(blocked)} onClick={() => setOsId(item.id)} className={`border p-4 text-left disabled:opacity-50 ${osId === item.id ? "border-[var(--dash-accent)]" : "border-[var(--dash-line)]"} bg-[var(--dash-panel)]`}>
                <p className="font-medium">{item.name}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">{blocked ? "Nano is Linux only on the published price list." : item.note}</p>
              </button>
            );
          })}
        </div>
      ) : null}
      {step === 3 ? (
        <DashCard className="grid gap-3 p-4">
          <label className="text-sm">Server name
            <input value={serverName} onChange={(event) => setServerName(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
          </label>
          <label className="text-sm">Hostname
            <input value={hostname} onChange={(event) => setHostname(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
          </label>
          {os?.family === "windows" ? (
            <label className="text-sm">Admin username
              <input value={adminUsername} onChange={(event) => setAdminUsername(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
            </label>
          ) : (
            <label className="text-sm">SSH public key
              <textarea value={sshPublicKey} onChange={(event) => setSshPublicKey(event.target.value)} placeholder="ssh-ed25519 …" className="mt-1 min-h-24 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2" />
            </label>
          )}
          <label className="text-sm">Additional requirements
            <textarea value={additionalRequirements} onChange={(event) => setAdditionalRequirements(event.target.value)} className="mt-1 min-h-24 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2" />
          </label>
        </DashCard>
      ) : null}
      {step === 4 ? (
        <DashCard className="p-5 text-sm leading-6 text-[var(--dash-muted)]">
          Additional storage, backups, a public IPv4, IPv6, a firewall, and monitoring are not offered as selectable options here. They are confirmed with the CyroHost team after the request is reviewed.
        </DashCard>
      ) : null}
      {step === 5 && plan && region && os ? (
        <DashCard className="p-5">
          <h2 className="text-sm font-medium">Final review</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-[var(--dash-muted)]">Customer</dt><dd>{user.fullName}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Email</dt><dd>{user.email}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Plan</dt><dd>{plan.name}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">vCPU</dt><dd>{plan.cpu}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">RAM</dt><dd>{plan.ramGb} GB</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Storage</dt><dd>{plan.diskGb} GB NVMe</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Bandwidth</dt><dd>{plan.transfer} · {plan.port}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Region</dt><dd>{region.name} · {regionAvailabilityLabel(region.availability)}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Operating system</dt><dd>{os.name}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Server name</dt><dd>{serverName}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Hostname</dt><dd>{hostname || "None"}</dd></div>
            <div><dt className="text-[var(--dash-muted)]">Estimated recurring price</dt><dd>{plan.price}/month, indicative</dd></div>
          </dl>
          <p className="mt-3 text-sm text-[var(--dash-muted)]">Additional requirements: {additionalRequirements || "None"}</p>
          <p className="mt-3 text-sm text-[var(--dash-muted)]">{catalog.note}</p>
        </DashCard>
      ) : null}
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm disabled:opacity-40" disabled={step === 0 || busy} onClick={() => setStep((value) => value - 1)}>Back</button>
        {step < steps.length - 1 ? (
          <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={next}>Continue</button>
        ) : (
          <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white disabled:opacity-40" disabled={busy} onClick={submit}>Submit VPS Request</button>
        )}
      </div>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading the catalogue" />}>
      <ConfigureWizard />
    </Suspense>
  );
}
