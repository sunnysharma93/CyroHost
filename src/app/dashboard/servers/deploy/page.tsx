"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DeployRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/servers/configure");
  }, [router]);
  return <p className="text-sm text-[var(--dash-muted)]">Opening VPS configuration…</p>;
}
