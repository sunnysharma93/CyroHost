"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Plan = {
  id: string;
  name: string;
  price: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  transfer: string;
  port: string;
  windows: boolean;
};

type Catalog = { plans: Plan[]; note: string };

export default function CloudVpsPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    setError("");
    consoleJson<Catalog>("/api/catalog")
      .then((next) => {
        if (!cancel) setCatalog(next);
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof ConsoleError ? reason.message : "The plan catalogue could not be loaded.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt]);

  return (
    <div>
      <PageIntro title="Cloud VPS" lede="Choose and configure the infrastructure you need." />
      {error ? <ErrorPanel title="Unable to load VPS plans." message={error} onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {!catalog && !error ? <PageSkeleton label="Loading plans" /> : null}
      {catalog && catalog.plans.length === 0 ? (
        <DashCard className="p-6">
          <h2 className="text-base font-medium">No VPS plans are active</h2>
          <p className="mt-2 text-sm text-[var(--dash-muted)]">Plans appear here after an administrator publishes them.</p>
        </DashCard>
      ) : null}
      {catalog && catalog.plans.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-[var(--dash-muted)]">{catalog.note}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {catalog.plans.map((plan) => (
              <DashCard key={plan.id} className="flex flex-col p-5">
                <p className="text-lg font-medium">{plan.name}</p>
                <p className="mt-1 text-2xl font-light">{plan.price}<span className="text-sm text-[var(--dash-muted)]"> /month</span></p>
                <ul className="mt-4 space-y-1 text-sm text-[var(--dash-muted)]">
                  <li>{plan.cpu} vCPU</li>
                  <li>{plan.ramGb} GB RAM</li>
                  <li>{plan.diskGb} GB NVMe</li>
                  <li>{plan.transfer} Transfer</li>
                  <li>{plan.port}</li>
                  <li>{plan.windows ? "Linux and Windows Server, subject to availability" : "Linux only"}</li>
                  <li>Regions are confirmed on request</li>
                </ul>
                <Link href={`/dashboard/servers/configure?plan=${plan.id}`} className="mt-5 inline-flex h-10 items-center justify-center bg-[var(--dash-accent)] px-3 text-sm text-white">
                  Configure VPS
                </Link>
              </DashCard>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
