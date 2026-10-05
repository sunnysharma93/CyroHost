"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Person = {
  id: string;
  fullName: string;
  email: string | null;
  status: string;
  platformRole: string;
  createdAt: string | null;
  lastLoginAt: string | null;
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Person[] | null>(null);
  const [total, setTotal] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ q: query, page: String(page) });
    consoleJson<{ items: Person[]; total: number; adminCount: number }>(`/api/admin/users?${params}`)
      .then((body) => {
        setItems(body.items);
        setTotal(body.total);
        setAdminCount(body.adminCount);
        setError("");
      })
      .catch((reason: unknown) => setError(reason instanceof ConsoleError ? reason.message : "Users could not be loaded."));
  }, [page, query, revision]);

  async function changeRole(person: Person, role: "USER" | "ADMIN") {
    if (role === person.platformRole) return;
    const verb = role === "ADMIN" ? `Grant ADMIN to ${person.email}?` : `Change ${person.email} to USER?`;
    if (!window.confirm(verb)) {
      setRevision((value) => value + 1);
      return;
    }
    setPendingId(person.id);
    setNotice("");
    setError("");
    try {
      await consoleJson(`/api/admin/users/${person.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setNotice(`${person.email} is now ${role}. The new role applies on their next request.`);
      setRevision((value) => value + 1);
    } catch (reason: unknown) {
      setError(reason instanceof ConsoleError ? reason.message : "The role could not be changed.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div>
      <PageIntro title="Users / Team" lede="Platform roles. A normal registration is USER. Only an administrator can grant ADMIN." />
      <input
        value={query}
        onChange={(event) => {
          setPage(0);
          setQuery(event.target.value);
        }}
        aria-label="Search users"
        placeholder="Search name or email"
        className="mb-3 h-9 w-full border border-[var(--dash-line)] bg-[var(--dash-panel)] px-3 text-sm"
      />
      {error ? <DashCard className="mb-3 p-4 text-sm">{error}</DashCard> : null}
      {notice ? <p className="mb-3 text-sm text-[var(--dash-muted)]">{notice}</p> : null}
      {!items && !error ? <p className="text-sm text-[var(--dash-muted)]">Loading users…</p> : null}
      {items ? (
        <div className="overflow-x-auto border border-[var(--dash-line)]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--dash-muted)]">
              <tr>
                {["Name", "Email", "Role", "Registered", "Last login", "Status"].map((label) => (
                  <th key={label} className="px-3 py-2 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((person) => {
                const lastAdmin = person.platformRole === "ADMIN" && adminCount <= 1;
                return (
                  <tr key={person.id} className="border-t border-[var(--dash-line)]">
                    <td className="px-3 py-2">{person.fullName}</td>
                    <td className="px-3 py-2">{person.email}</td>
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`role-${person.id}`}>Role for {person.email}</label>
                      <select
                        id={`role-${person.id}`}
                        value={person.platformRole === "ADMIN" ? "ADMIN" : "USER"}
                        disabled={pendingId === person.id || lastAdmin}
                        onChange={(event) => changeRole(person, event.target.value === "ADMIN" ? "ADMIN" : "USER")}
                        className="h-9 border border-[var(--dash-line)] bg-[var(--dash-panel)] px-2 disabled:opacity-50"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      {lastAdmin ? <p className="mt-1 text-xs text-[var(--dash-muted)]">Last administrator</p> : null}
                    </td>
                    <td className="px-3 py-2">{person.createdAt ? new Date(person.createdAt).toLocaleString() : ""}</td>
                    <td className="px-3 py-2">{person.lastLoginAt ? new Date(person.lastLoginAt).toLocaleString() : "None recorded"}</td>
                    <td className="px-3 py-2">{person.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2 text-sm">
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span className="self-center text-[var(--dash-muted)]">{total} total</span>
        <button type="button" className="h-9 border border-[var(--dash-line)] px-3 disabled:opacity-40" disabled={(page + 1) * 20 >= total} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    </div>
  );
}
