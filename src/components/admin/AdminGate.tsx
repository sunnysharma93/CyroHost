"use client";

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastHost } from "@/components/dashboard/DashFeedback";
import { DashboardSession } from "@/components/dashboard/DashboardSession";
import { useConsoleScroll } from "@/components/dashboard/useConsoleScroll";
import { currentUser, logoutSession, type AuthUser } from "@/lib/auth-api";

const links = [
  ["/admin", "Overview"],
  ["/admin/users", "Users / Team"],
  ["/admin/customers", "Customers"],
  ["/admin/vps-requests", "VPS Requests"],
  ["/admin/servers", "Servers"],
  ["/admin/plans", "Plans"],
  ["/admin/regions", "Regions"],
  ["/admin/operating-systems", "Operating Systems"],
  ["/admin/support", "Support"],
  ["/admin/enquiries", "Enquiries"],
  ["/admin/billing", "Billing"],
  ["/admin/offers", "Offers"],
  ["/admin/infrastructure", "Infrastructure"],
  ["/admin/activity", "Activity Logs"],
  ["/admin/settings", "Settings"],
] as const;

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useConsoleScroll(pathname);

  useEffect(() => {
    const stored = localStorage.getItem("cyro-dash-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
    let cancel = false;
    currentUser().then((next) => {
      if (cancel) return;
      if (!next) {
        router.replace("/login");
        return;
      }
      if (next.platformRole !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
      setUser(next);
    }).catch(() => {
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

  useEffect(() => {
    if (!menu) return undefined;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("cyro-dash-theme", next);
  }

  if (!user) {
    return (
      <div className="dashboard-root dash-gate bg-[#111315] text-[#c5c9d0]">
        <p className="text-sm">Checking admin access…</p>
      </div>
    );
  }

  return (
    <DashboardSession user={user}>
      <div className="dashboard-root" data-dash-theme={theme} data-drawer={menu ? "open" : "closed"}>
        <div className="dash-shell">
          {menu ? <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Close menu" onClick={() => setMenu(false)} /> : null}
          <aside className={`dash-sidebar ${menu ? "is-open" : ""}`} aria-label="Admin navigation">
            <div className="flex h-14 shrink-0 items-center border-b border-[var(--dash-line)] px-4 text-sm">Admin</div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Admin">
              {links.map(([href, label]) => {
                const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link key={href} href={href} onClick={() => setMenu(false)} className={`dash-nav-link ${active ? "is-active" : ""}`}>
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="shrink-0 border-t border-[var(--dash-line)] p-3">
              <Link href="/dashboard" className="dash-nav-link" onClick={() => setMenu(false)}>Customer console</Link>
            </div>
          </aside>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--dash-line)] bg-[var(--dash-bar)] px-4">
              <button type="button" className="dash-icon-btn dash-menu-btn" aria-label="Open menu" onClick={() => setMenu(true)}>
                <Menu className="size-4" />
              </button>
              <p className="min-w-0 flex-1 truncate text-sm text-[var(--dash-muted)]">{user.email}</p>
              <button type="button" className="dash-icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button
                type="button"
                className="h-9 border border-[var(--dash-line)] px-3 text-sm"
                onClick={async () => {
                  await logoutSession();
                  router.replace("/login");
                }}
              >
                Log out
              </button>
            </header>
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
