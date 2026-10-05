"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashCard, GhostLink, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { requestStatusLabel } from "@/lib/request-status";

type RequestDetail = {
  id: string;
  requestNumber: string;
  status: string;
  whatsappUrl: string;
  provisioned: boolean;
};

export default function RequestSuccessPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<RequestDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleJson<RequestDetail>(`/api/vps-requests/${params.id}`)
      .then((next) => {
        setItem(next);
        const key = `cyro-wa-${next.id}`;
        if (!sessionStorage.getItem(key) && next.whatsappUrl) {
          sessionStorage.setItem(key, "1");
          window.open(next.whatsappUrl, "_blank", "noopener,noreferrer");
        }
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "This request could not be loaded."));
  }, [params.id]);

  if (error) return <DashCard className="p-6 text-sm">{error}</DashCard>;
  if (!item) return <p className="text-sm text-[var(--dash-muted)]">Loading confirmation…</p>;

  return (
    <div>
      <PageIntro title="Your VPS request has been submitted." lede="The CyroHost team will review it. This does not mean a server is active." />
      <DashCard className="p-5">
        <p className="text-sm text-[var(--dash-muted)]">Request ID</p>
        <p className="mt-1 text-xl font-medium">{item.requestNumber}</p>
        <p className="mt-4 text-sm text-[var(--dash-muted)]">Status</p>
        <p className="mt-1">{item.status === "PENDING" ? "Pending Review" : requestStatusLabel(item.status)}</p>
      </DashCard>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/dashboard/requests/${item.id}`} className="inline-flex h-9 items-center bg-[var(--dash-accent)] px-3 text-sm text-white">View Request</Link>
        <a href={item.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center bg-[#25D366] px-3 text-sm text-white">Continue to WhatsApp</a>
        <GhostLink href="/dashboard">Back to Dashboard</GhostLink>
      </div>
    </div>
  );
}
