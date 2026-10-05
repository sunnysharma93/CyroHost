"use client";

import { Bell, Menu, Moon, Plus, Search, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { dashboardCrumbs, dashboardSearchEntries } from "@/config/dashboardNav";
import { logoutSession } from "@/lib/auth-api";
import { useDashboardUser } from "@/components/dashboard/DashboardSession";

function crumbsFor(pathname: string) {
  if (pathname.endsWith("/success") && pathname.startsWith("/dashboard/requests/")) {
    return [{ label: "VPS Requests", parent: "/dashboard/requests" }, { label: "Submitted" }];
  }
  if (pathname.startsWith("/dashboard/requests/")) {
    return [{ label: "VPS Requests", parent: "/dashboard/requests" }, { label: "Request" }];
  }
  if (/^\/dashboard\/servers\/[0-9a-f-]{36}$/i.test(pathname)) {
    return [{ label: "My Servers", parent: "/dashboard/servers/mine" }, { label: "Server" }];
  }
  return dashboardCrumbs[pathname] ?? [{ label: "Console" }];
}

export function DashboardTopBar({
  onMenu,
  theme,
  onTheme,
}: {
  onMenu: () => void;
  theme: "dark" | "light";
  onTheme: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useDashboardUser();
  const crumbs = crumbsFor(pathname);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(false);
  const [menu, setMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const entries = useMemo(() => dashboardSearchEntries(), []);
  const hits = query.trim()
    ? entries.filter((item) => `${item.label} ${item.hint} ${item.keywords}`.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  useEffect(() => {
    setOpen(false);
    setNotes(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      const target = event.target as Node;
      if (!searchRef.current?.contains(target)) setOpen(false);
      if (!notesRef.current?.contains(target)) setNotes(false);
      if (!menuRef.current?.contains(target)) setMenu(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      setNotes(false);
      setMenu(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    await logoutSession();
    router.replace("/login");
  }

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--dash-line)] bg-[var(--dash-bar)] px-3 lg:gap-3 lg:px-5">
      <button type="button" className="dash-icon-btn dash-menu-btn" aria-label="Open menu" onClick={onMenu}>
        <Menu className="size-4" />
      </button>
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-sm text-[var(--dash-muted)] sm:flex">
        <Link href="/dashboard" className="hover:text-[var(--dash-ink)]">
          Console
        </Link>
        {crumbs.map((crumb) => (
          <span key={crumb.label} className="flex min-w-0 items-center gap-1">
            <span>/</span>
            {crumb.parent ? (
              <Link href={crumb.parent} className="truncate hover:text-[var(--dash-ink)]">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate text-[var(--dash-ink)]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div ref={searchRef} className="relative min-w-0 flex-1">
        <label className="sr-only" htmlFor="dash-search">
          Search servers, invoices and tickets
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[var(--dash-muted)]" />
        <input
          id="dash-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search servers, invoices, tickets…"
          className="h-9 w-full border border-[var(--dash-line)] bg-[var(--dash-input)] pr-3 pl-8 text-sm text-[var(--dash-ink)] outline-none focus:border-[var(--dash-accent)]"
        />
        {open && query.trim() ? (
          <div className="absolute top-full z-40 mt-1 w-full border border-[var(--dash-line)] bg-[var(--dash-panel)] py-1 shadow-xl">
            {hits.length ? (
              hits.slice(0, 8).map((hit) => (
                <Link
                  key={hit.href}
                  href={hit.href}
                  className="block px-3 py-2 text-sm text-[var(--dash-ink)] hover:bg-[var(--dash-hover)]"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {hit.label}
                  <span className="ml-2 text-xs text-[var(--dash-muted)]">{hit.hint}</span>
                </Link>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-[var(--dash-muted)]">
                No matching pages.
              </p>
            )}
          </div>
        ) : null}
      </div>
      <p className="hidden items-center gap-2 text-xs text-[var(--dash-muted)] xl:flex" title="CyroHost does not publish a live status page">
        <span className="size-1.5 rounded-full bg-[var(--dash-warn)]" aria-hidden="true" />
        No public status
      </p>
      <Link href="/dashboard/servers" className="dash-deploy shrink-0" aria-label="Deploy">
        <Plus className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Deploy</span>
      </Link>
      <div ref={notesRef} className="relative">
        <button type="button" className="dash-icon-btn" aria-label="Notifications" aria-expanded={notes} onClick={() => setNotes((value) => !value)}>
          <Bell className="size-4" />
        </button>
        {notes ? (
          <div className="absolute right-0 z-40 mt-1 w-72 border border-[var(--dash-line)] bg-[var(--dash-panel)] p-3 text-sm shadow-xl">
            <p className="font-medium text-[var(--dash-ink)]">Notifications</p>
            <p className="mt-2 text-[var(--dash-muted)]">Recent account activity is listed on the overview.</p>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="dash-icon-btn"
        aria-label={theme === "dark" ? "Switch dashboard to light" : "Switch dashboard to dark"}
        onClick={onTheme}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
      <div ref={menuRef} className="relative">
        <button type="button" className="dash-avatar" aria-label="Account menu" aria-expanded={menu} onClick={() => setMenu((value) => !value)}>
          {initials || <UserRound className="size-4" />}
        </button>
        {menu ? (
          <div className="absolute right-0 z-40 mt-1 w-56 border border-[var(--dash-line)] bg-[var(--dash-panel)] py-1 shadow-xl">
            <p className="px-3 py-2 text-sm text-[var(--dash-ink)]">{user.fullName}</p>
            <p className="px-3 pb-2 text-xs text-[var(--dash-muted)]">{user.email ?? "No email on this account"}</p>
            {user.platformRole === "ADMIN" ? (
              <Link href="/admin" className="block px-3 py-2 text-sm hover:bg-[var(--dash-hover)]" onClick={() => setMenu(false)}>
                Admin
              </Link>
            ) : null}
            <Link href="/dashboard/account/profile" className="block px-3 py-2 text-sm hover:bg-[var(--dash-hover)]" onClick={() => setMenu(false)}>
              Profile
            </Link>
            <Link href="/dashboard/account/security" className="block px-3 py-2 text-sm hover:bg-[var(--dash-hover)]" onClick={() => setMenu(false)}>
              Security & Team
            </Link>
            <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--dash-hover)]" onClick={logout}>
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
