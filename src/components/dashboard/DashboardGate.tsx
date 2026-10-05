"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastHost } from "@/components/dashboard/DashFeedback";
import { DashboardSession } from "@/components/dashboard/DashboardSession";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { useConsoleScroll } from "@/components/dashboard/useConsoleScroll";
import { currentUser, type AuthUser } from "@/lib/auth-api";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [menu, setMenu] = useState(false);
  useConsoleScroll(pathname);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("cyro-dash-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
    let cancel = false;
    currentUser()
      .then((next) => {
        if (cancel) return;
        if (!next) {
          router.replace("/login");
          return;
        }
        setUser(next);
      })
      .catch(() => {
        if (!cancel) router.replace("/login");
      });
    return () => {
      cancel = true;
    };
  }, [router]);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      if (!media.matches) setMenu(false);
    };
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("cyro-dash-theme", next);
  }

  if (!user) {
    return (
      <div className="dashboard-root dash-gate bg-[#111315] text-[#c5c9d0]">
        <p className="text-sm">Checking your CyroHost session…</p>
      </div>
    );
  }

  return (
    <DashboardSession user={user}>
      <div className="dashboard-root" data-dash-theme={theme} data-drawer={menu ? "open" : "closed"}>
        <div className="dash-shell">
          <DashboardSidebar open={menu} onClose={() => setMenu(false)} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <DashboardTopBar onMenu={() => setMenu(true)} theme={theme} onTheme={toggleTheme} />
            <div id="dash-scroll" className="dash-scroll">
              <div className="dash-page p-4 lg:p-6">{children}</div>
            </div>
          </div>
        </div>
        <ToastHost />
      </div>
    </DashboardSession>
  );
}
