"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Token = { id: string; name: string; prefix: string; scopes: string; expiresAt: string | null; revokedAt: string | null };
type Created = Token & { token?: string; message?: string };

export default function TokensPage() {
  const [items, setItems] = useState<Token[]>([]);
  const [name, setName] = useState("");
  const [scope, setScope] = useState("read");
  const [days, setDays] = useState("");
  const [fresh, setFresh] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ items: Token[] }>("/api/account/tokens").then((body) => setItems(body.items)).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Tokens could not be loaded."));
  }

  useEffect(() => {
    load();
  }, []);

  async function createToken() {
    try {
      const body = await consoleJson<Created>("/api/account/tokens", {
        method: "POST",
        body: JSON.stringify({ name, scope, days: days ? Number(days) : null }),
      });
      setFresh(body.token ?? "");
      setNotice(body.message ?? "Token created.");
      setName("");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The token could not be created.");
    }
  }

  async function revoke(token: Token) {
    if (!window.confirm(`Revoke ${token.name}? Applications using it will stop.`)) return;
    await consoleJson(`/api/account/tokens/${token.id}/revoke`, { method: "POST" });
    setFresh("");
    load();
  }

  return (
    <div>
      <PageIntro title="API Tokens" lede="The full token is shown once. CyroHost stores only a hash. A revoked token cannot be retrieved." />
      {fresh ? (
        <DashCard className="mb-3 p-4">
          <p className="text-sm">Copy this token now. It will not be shown again.</p>
          <code className="mt-2 block overflow-x-auto border border-dashed border-[var(--dash-line)] p-2 text-xs">{fresh}</code>
        </DashCard>
      ) : null}
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Token name" placeholder="Token name" className="h-9 min-w-40 flex-1 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
        <select aria-label="Token scope" value={scope} onChange={(event) => setScope(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-2 text-sm">
          <option value="read">Read</option>
          <option value="write">Read and write</option>
        </select>
        <input value={days} onChange={(event) => setDays(event.target.value)} aria-label="Expiry in days" placeholder="Days" className="h-9 w-24 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm" />
        <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={createToken}>Create token</button>
      </div>
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
      {items.length === 0 ? <DashCard className="p-6 text-sm text-[var(--dash-muted)]">No API tokens for this account.</DashCard> : null}
      <div className="grid gap-2">
        {items.map((token) => (
          <DashCard key={token.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <div>
              <p className="font-medium">{token.name}</p>
              <p className="text-xs text-[var(--dash-muted)]">{token.prefix}… · {token.scopes} · {token.revokedAt ? "revoked" : "active"}</p>
            </div>
            {token.revokedAt ? null : <button type="button" className="h-8 border border-[var(--dash-line)] px-2 text-xs" onClick={() => revoke(token)}>Revoke</button>}
          </DashCard>
        ))}
      </div>
    </div>
  );
}
