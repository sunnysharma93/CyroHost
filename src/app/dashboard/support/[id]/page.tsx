"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  messages: { id: string; body: string; createdAt: string }[];
};

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    consoleJson<Ticket>(`/api/support/tickets/${params.id}`).then(setTicket).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Ticket not found."));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function reply() {
    try {
      const next = await consoleJson<Ticket>(`/api/support/tickets/${params.id}/messages`, { method: "POST", body: JSON.stringify({ body }) });
      setTicket(next);
      setBody("");
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The reply could not be saved.");
    }
  }

  async function setStatus(status: "open" | "closed") {
    const next = await consoleJson<Ticket>(`/api/support/tickets/${params.id}/status`, { method: "POST", body: JSON.stringify({ status }) });
    setTicket(next);
  }

  if (!ticket) return <p className="text-sm text-[var(--dash-muted)]">{notice || "Loading ticket…"}</p>;

  return (
    <div>
      <PageIntro title={ticket.subject} lede={`Status: ${ticket.status}. This conversation is limited to the signed-in account.`} />
      <div className="grid gap-3">
        {ticket.messages.map((message) => (
          <DashCard key={message.id} className="p-4 text-sm">
            <p className="whitespace-pre-wrap">{message.body}</p>
            <p className="mt-2 text-xs text-[var(--dash-muted)]">{new Date(message.createdAt).toLocaleString()}</p>
          </DashCard>
        ))}
      </div>
      <DashCard className="mt-3 grid gap-3 p-4">
        <textarea value={body} onChange={(event) => setBody(event.target.value)} aria-label="Reply" className="min-h-24 border border-[var(--dash-line)] bg-transparent px-3 py-2 text-sm" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={reply}>Reply</button>
          {ticket.status === "open" ? (
            <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={() => setStatus("closed")}>Close</button>
          ) : (
            <button type="button" className="h-9 border border-[var(--dash-line)] px-3 text-sm" onClick={() => setStatus("open")}>Reopen</button>
          )}
          <Link href="/dashboard/support" className="inline-flex h-9 items-center text-sm text-[var(--dash-muted)]">All tickets</Link>
        </div>
      </DashCard>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
    </div>
  );
}
