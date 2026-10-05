"use client";

import { DashCard } from "@/components/dashboard/DashUi";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <DashCard className="p-6">
      <h1 className="text-base font-medium">This page could not be shown</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">The console hit an unexpected error. Try the page again.</p>
      <button type="button" className="mt-4 h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={reset}>
        Try again
      </button>
    </DashCard>
  );
}
