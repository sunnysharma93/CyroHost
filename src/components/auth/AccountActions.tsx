"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { authFetch, currentUser, type AuthUser } from "@/lib/auth-api";

export function AccountActions({ stacked = false, registerLabel = "Create Account" }: { stacked?: boolean; registerLabel?: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancel = false;
    currentUser()
      .then((next) => {
        if (!cancel) setUser(next);
      })
      .catch(() => {
        if (!cancel) setUser(null);
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function logout() {
    setPending(true);
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // The API may be offline. Clear the visible session either way.
    }
    setUser(null);
    setPending(false);
  }

  if (user) {
    return (
      <div className={stacked ? "grid gap-2" : "flex items-center gap-2"}>
        <Link href="/dashboard" className="truncate px-1 text-sm text-ink hover:text-cyan">
          {user.fullName}
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center border border-line bg-panel px-4 text-sm text-ink hover:border-cyan disabled:opacity-60"
        >
          {pending ? "Signing out…" : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <div className={stacked ? "grid gap-2" : "flex items-center gap-2"}>
      <ButtonLink href="/login" variant="secondary">
        Login
      </ButtonLink>
      <ButtonLink href="/register">{registerLabel}</ButtonLink>
    </div>
  );
}
