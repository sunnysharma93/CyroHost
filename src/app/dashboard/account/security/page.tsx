"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Session = { id: string; createdAt: string; expiresAt: string; current: boolean; rememberMe: boolean };
type Member = { id: string; email: string; role: string; status: string; accountId: string };

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Member[]>([]);
  const [mail, setMail] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    consoleJson<{ items: Session[] }>("/api/account/sessions").then((body) => setSessions(body.items)).catch(() => undefined);
    consoleJson<{ items: Member[]; invitations: Member[]; mail: string }>("/api/account/members").then((body) => {
      setMembers(body.items);
      setInvitations(body.invitations);
      setMail(body.mail);
    }).catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, []);

  async function changePassword() {
    try {
      await consoleJson("/api/account/password", { method: "POST", body: JSON.stringify({ currentPassword, password, confirmPassword }) });
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setNotice("Password updated.");
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "Password could not be changed.");
    }
  }

  async function revoke() {
    if (!window.confirm("Sign out every other session?")) return;
    try {
      const body = await consoleJson<{ message: string }>("/api/account/sessions/revoke-others", { method: "POST" });
      setNotice(body.message);
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "Sessions could not be updated.");
    }
  }

  async function invite() {
    try {
      const body = await consoleJson<{ message?: string }>("/api/account/members", { method: "POST", body: JSON.stringify({ email, role }) });
      setNotice(body.message ?? "Invitation saved.");
      setEmail("");
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The invitation could not be saved.");
    }
  }

  async function accept(id: string) {
    const body = await consoleJson<{ accountId: string }>(`/api/account/invitations/${id}/accept`, { method: "POST" });
    await consoleJson("/api/account/active", { method: "POST", body: JSON.stringify({ accountId: body.accountId }) });
    setNotice("Invitation accepted. This browser is now using that account.");
    load();
  }

  async function remove(member: Member) {
    if (!window.confirm(`Remove ${member.email} from this account?`)) return;
    try {
      await consoleJson(`/api/account/members/${member.id}`, { method: "DELETE" });
      load();
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "The member could not be removed.");
    }
  }

  return (
    <div>
      <PageIntro title="Security & Team" lede="Password changes and team membership are stored for this account. Roles are Owner, Admin, Billing, Member, and Viewer." />
      <DashCard className="grid gap-3 p-4">
        <h2 className="text-sm font-medium">Password</h2>
        <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} aria-label="Current password" placeholder="Current password" className="h-9 border border-[var(--dash-line)] bg-transparent px-3 text-sm" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="New password" placeholder="New password" className="h-9 border border-[var(--dash-line)] bg-transparent px-3 text-sm" />
        <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-label="Confirm new password" placeholder="Confirm new password" className="h-9 border border-[var(--dash-line)] bg-transparent px-3 text-sm" />
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={changePassword}>Update password</button>
      </DashCard>
      <DashCard className="mt-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Active sessions</h2>
          <button type="button" className="h-8 border border-[var(--dash-line)] px-2 text-xs" onClick={revoke}>Log out others</button>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {sessions.map((session) => (
            <li key={session.id}>{session.current ? "This session" : "Other session"} · expires {new Date(session.expiresAt).toLocaleString()}</li>
          ))}
        </ul>
      </DashCard>
      <DashCard className="mt-3 p-4">
        <h2 className="text-sm font-medium">Team</h2>
        <p className="mt-1 text-xs text-[var(--dash-muted)]">Mail delivery is {mail === "configured" ? "configured" : "not configured"}.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-2">
              <span>{member.email} · {member.role} · {member.status}</span>
              {member.role !== "OWNER" ? <button type="button" className="text-xs" onClick={() => remove(member)}>Remove</button> : null}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Invite email" placeholder="Email" className="h-9 min-w-48 flex-1 border border-[var(--dash-line)] bg-transparent px-3 text-sm" />
          <select aria-label="Role" value={role} onChange={(event) => setRole(event.target.value)} className="h-9 border border-[var(--dash-line)] bg-transparent px-2 text-sm">
            {["ADMIN", "BILLING", "MEMBER", "VIEWER"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button type="button" className="h-9 bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={invite}>Invite</button>
        </div>
        {invitations.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Invitations for you</h3>
            {invitations.map((inviteRow) => (
              <button key={inviteRow.id} type="button" className="mt-2 block text-sm underline" onClick={() => accept(inviteRow.id)}>
                Accept {inviteRow.role} invitation
              </button>
            ))}
          </div>
        ) : null}
      </DashCard>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
    </div>
  );
}
