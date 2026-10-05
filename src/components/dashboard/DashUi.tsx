"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { links } from "@/config/site";
import { loadCatalog, type CatalogResult } from "@/lib/dashboard-api";

export function PageIntro({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-medium tracking-tight text-[var(--dash-ink)]">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--dash-muted)]">{lede}</p>
    </div>
  );
}

export function DashCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-[var(--dash-line)] bg-[var(--dash-panel)] ${className}`}>{children}</section>;
}

export function EmptyState({
  title,
  body,
  endpoint,
  actions,
}: {
  title: string;
  body: string;
  endpoint?: string;
  actions?: React.ReactNode;
}) {
  return (
    <DashCard className="p-6">
      <h2 className="text-base font-medium text-[var(--dash-ink)]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-muted)]">{body}</p>
      {endpoint ? <p className="mt-3 font-mono text-xs text-[var(--dash-muted)]">Missing endpoint: {endpoint}</p> : null}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </DashCard>
  );
}

export function CatalogPanel<T>({
  result,
  title,
  emptyTitle,
  children,
}: {
  result: CatalogResult<T> | null;
  title: string;
  emptyTitle: string;
  children: (items: T[]) => React.ReactNode;
}) {
  if (!result) {
    return (
      <DashCard className="p-6">
        <p className="text-sm text-[var(--dash-muted)]">Loading {title.toLowerCase()}…</p>
      </DashCard>
    );
  }
  if (result.status === "ready") return <>{children(result.items)}</>;
  return <EmptyState title={emptyTitle} body={result.message} endpoint={result.endpoint} />;
}

export function useCatalog<T>(path: string, label: string) {
  const [result, setResult] = useState<CatalogResult<T> | null>(null);
  useEffect(() => {
    let cancel = false;
    loadCatalog<T>(path, label).then((next) => {
      if (!cancel) setResult(next);
    });
    return () => {
      cancel = true;
    };
  }, [label, path]);
  return result;
}

export function WhatsAppSupport() {
  return (
    <a
      href={links.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center justify-center bg-[#25D366] px-3 text-sm text-white"
    >
      WhatsApp support
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-9 items-center justify-center bg-[var(--dash-accent)] px-3 text-sm text-white">
      {children}
    </Link>
  );
}

export function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-9 items-center justify-center border border-[var(--dash-line)] px-3 text-sm text-[var(--dash-ink)]">
      {children}
    </Link>
  );
}
