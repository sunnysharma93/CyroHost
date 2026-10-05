"use client";

import { useEffect, useState } from "react";

export function PageSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="dash-skeleton w-48" />
      <div className="dash-skeleton w-full max-w-xl" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="h-28 border border-[var(--dash-line)] bg-[var(--dash-panel)] p-4">
          <div className="dash-skeleton w-24" />
          <div className="dash-skeleton mt-4 w-full" />
        </div>
        <div className="h-28 border border-[var(--dash-line)] bg-[var(--dash-panel)] p-4">
          <div className="dash-skeleton w-24" />
          <div className="dash-skeleton mt-4 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ErrorPanel({
  title = "Unable to load this page.",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className="border border-[var(--dash-line)] bg-[var(--dash-panel)] p-6" role="alert">
      <h2 className="text-base font-medium text-[var(--dash-ink)]">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--dash-muted)]">{message}</p>
      <p className="mt-1 text-sm text-[var(--dash-muted)]">The server may be temporarily unavailable.</p>
      {onRetry ? (
        <button type="button" className="mt-4 h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </section>
  );
}

type Toast = { id: number; tone: "success" | "error" | "warning"; message: string };

export function pushToast(tone: Toast["tone"], message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cyro-toast", { detail: { tone, message } }));
}

export function ToastHost() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let timer = 0;
    function onToast(event: Event) {
      const detail = (event as CustomEvent<{ tone: Toast["tone"]; message: string }>).detail;
      if (!detail?.message) return;
      window.clearTimeout(timer);
      setToast({ id: Date.now(), tone: detail.tone, message: detail.message });
      timer = window.setTimeout(() => setToast(null), 4200);
    }
    window.addEventListener("cyro-toast", onToast);
    return () => {
      window.removeEventListener("cyro-toast", onToast);
      window.clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div className="dash-toast" role="status">
      <p className="text-xs tracking-[0.12em] text-[var(--dash-muted)] uppercase">{toast.tone}</p>
      <p className="mt-1 text-sm">{toast.message}</p>
    </div>
  );
}
