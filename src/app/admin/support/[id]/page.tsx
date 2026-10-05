"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Ticket = {
  subject: string;
  status: string;
  priority: string;
  category: string;
  messages: { id: string; body: string; internal: boolean; createdAt: string }[];
};

export default function AdminTicketPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("normal");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    consoleJson<Ticket>(`/api/admin/support/tickets/${params.id}`)
      .then((next) => { setTicket(next); setStatus(next.status); setPriority(next.priority); })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "This ticket could not be loaded."));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function saveStatus() {
    try {
      await consoleJson(`/api/admin/support/tickets/${params.id}`, { method: "PATCH", body: JSON.stringify({ status, priority }) });
      setNotice("Ticket updated.");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The ticket could not be updated.");
    }
  }

  async function reply() {
    try {
      const next = await consoleJson<Ticket>(`/api/admin/support/tickets/${params.id}/messages`, { method: "POST", body: JSON.stringify({ body, internal: String(internal) }) });
      setTicket(next);
      setBody("");
      setNotice(internal ? "Internal note saved." : "Reply saved.");
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The reply could not be saved.");
    }
  }

  if (error) return <DashCard className="p-6 text-sm">{error}</DashCard>;
  if (!ticket) return <p className="text-sm text-[var(--dash-muted)]">Loading ticket…</p>;

  return (
    <div>
      <PageIntro title={ticket.subject} lede={`${ticket.category} · ${ticket.status}`} />
      <div className="space-y-2">
        {ticket.messages.map((message) => (
          <DashCard key={message.id} className="p-4 text-sm">
            <p className="text-xs text-[var(--dash-muted)]">{message.internal ? "Internal note" : "Reply"} · {new Date(message.createdAt).toLocaleString()}</p>
            <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
          </DashCard>
        ))}
      </div>
      <DashCard className="mt-3 grid gap-3 p-4 text-sm">
        <label>Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-2">
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label>Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-2">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="button" className="h-9 w-fit border border-[var(--dash-line)] px-3" onClick={saveStatus}>Save status</button>
        <label>Reply or internal note
          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-1 min-h-24 w-full border border-[var(--dash-line)] bg-transparent px-3 py-2" />
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Internal note, hidden from the customer</label>
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-white" onClick={reply}>Save message</button>
        {notice ? <p className="text-[var(--dash-muted)]">{notice}</p> : null}
      </DashCard>
    </div>
  );
}
