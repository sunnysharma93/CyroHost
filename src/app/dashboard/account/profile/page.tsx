"use client";

import { useEffect, useState } from "react";
import { DashCard, PageIntro } from "@/components/dashboard/DashUi";
import { ConsoleError, consoleJson } from "@/lib/console-api";

type Profile = {
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  timezone: string;
  role: string;
  emailChange: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    consoleJson<Profile>("/api/account/profile").then(setProfile).catch((reason: unknown) => setNotice(reason instanceof ConsoleError ? reason.message : "Profile could not be loaded."));
  }, []);

  async function save() {
    if (!profile) return;
    try {
      const next = await consoleJson<Profile>("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName: profile.fullName, phone: profile.phone ?? "", company: profile.company ?? "", timezone: profile.timezone }),
      });
      setProfile(next);
      setNotice("Profile saved.");
    } catch (reason) {
      setNotice(reason instanceof ConsoleError ? reason.message : "Profile could not be saved.");
    }
  }

  if (!profile) return <p className="text-sm text-[var(--dash-muted)]">{notice || "Loading profile…"}</p>;

  return (
    <div>
      <PageIntro title="Profile" lede={`${profile.role}. ${profile.emailChange}`} />
      <DashCard className="grid gap-3 p-4">
        <label className="text-sm">Full name
          <input value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Email
          <input value={profile.email ?? ""} readOnly className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3 text-[var(--dash-muted)]" />
        </label>
        <label className="text-sm">Phone
          <input value={profile.phone ?? ""} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Company
          <input value={profile.company ?? ""} onChange={(event) => setProfile({ ...profile, company: event.target.value })} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <label className="text-sm">Timezone
          <input value={profile.timezone} onChange={(event) => setProfile({ ...profile, timezone: event.target.value })} className="mt-1 h-9 w-full border border-[var(--dash-line)] bg-transparent px-3" />
        </label>
        <button type="button" className="h-9 w-fit bg-[var(--dash-accent)] px-3 text-sm text-white" onClick={save}>Save profile</button>
      </DashCard>
      {notice ? <p className="mt-3 text-sm text-[var(--dash-muted)]" role="status">{notice}</p> : null}
    </div>
  );
}
