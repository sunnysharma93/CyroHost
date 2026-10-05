"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth-api";

const SessionContext = createContext<AuthUser | null>(null);

export function DashboardSession({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useDashboardUser() {
  const user = useContext(SessionContext);
  if (!user) throw new Error("Dashboard session is missing.");
  return user;
}
