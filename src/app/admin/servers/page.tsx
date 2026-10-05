"use client";

import Link from "next/link";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";

export default function AdminServersPage() {
  return (
    <div>
      <PageIntro title="Servers" lede="No machines are provisioned from this console." />
      <DashCard className="p-5 text-sm leading-6 text-[var(--dash-muted)]">
        <p>The infrastructure provider is not connected, so this page does not list running servers, addresses, or power state.</p>
        <p className="mt-3">Customer configuration requests are in <Link href="/admin/vps-requests" className="text-[var(--dash-ink)] underline">VPS requests</Link>.</p>
      </DashCard>
    </div>
  );
}
