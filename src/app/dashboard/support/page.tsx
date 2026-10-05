"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorPanel, PageSkeleton, pushToast } from "@/components/dashboard/DashFeedback";
import { DashCard, PageIntro, WhatsAppSupport } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Ticket = { id: string; subject: string; category: string; priority: string; status: string; updatedAt: string };

export default function SupportPage() {
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("servers");
  const [priority, setPriority] = useState("normal");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState("");

  function load() {
    setLoadError("");
    consoleJson<{ items: Ticket[] }>("/api/support/tickets")
      .then((next) => setItems(next.items))
      .catch((reason: unknown) => setLoadError(reason instanceof ConsoleError ? reason.message : "Tickets could not be loaded."));
  }

  useEffect(() => {
    load();
  }, []);

  async function createTicket() {
    if (pending) return;
    setPending(true);
    try {
      const ticket = await consoleJson<Ticket>("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({ subject, body, category, priority }),
      });
      setSubject("");
      setBody("");
      pushToast("success", "Support ticket saved.");
      window.location.href = `/dashboard/support/${ticket.id}`;
    } catch (reason) {
      const message = reason instanceof ConsoleError ? reason.message : "The ticket could not be saved.";
      setNotice(message);
      pushToast("error", "Unable to save the support ticket.");
      setPending(false);
    }
  }

  return (
    <div>
      <PageIntro title="Support Tickets" lede="Tickets are stored for the signed-in account. WhatsApp remains available on +91 95288 39776." />
      <div className="mb-4"><WhatsAppSupport /></div>
      <DashCard className="grid gap-3 p-4">
        <label className="text-sm">Subject
          <input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3 text-sm" />
        </label>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm">
            {["account", "billing", "servers", "network", "other"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm">
            {["low", "normal", "high"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <label className="text-sm">Description
          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-1 min-h-24 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2 text-sm" />
        </label>
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-sm text-white disabled:opacity-50" disabled={pending} onClick={createTicket}>{pending ? "Saving…" : "Open ticket"}</button>
      </DashCard>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
      <div className="mt-3">
        {loadError ? <ErrorPanel title="Unable to load your tickets." message={loadError} onRetry={load} /> : null}
        {!items && !loadError ? <PageSkeleton label="Loading tickets" /> : null}
        {items && items.length === 0 ? (
          <DashCard className="p-6">
            <h2 className="text-base font-medium">You don&apos;t have any support tickets.</h2>
            <p className="mt-2 text-sm text-[var(--dash-muted)]">Open a ticket above, or continue on WhatsApp.</p>
          </DashCard>
        ) : null}
        {items?.map((ticket) => (
          <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`} className="mb-2 block border border-[var(--dash-line)] bg-[var(--dash-panel)] p-4">
            <p className="text-sm font-medium">{ticket.subject}</p>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">{ticket.status} · {ticket.priority} · {ticket.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
