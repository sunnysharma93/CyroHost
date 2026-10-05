"use client";

import {
  Activity,
  Bell,
  ChevronDown,
  CreditCard,
  Database,
  Globe,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Network,
  Plus,
  Receipt,
  Server,
  Shield,
  ShieldCheck,
  Tag,
  Ticket,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { dashboardNav, type DashItem } from "@/config/dashboardNav";

const icons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  vps: Server,
  dedicated: HardDrive,
  ip: Network,
  dns: Globe,
  cdn: Activity,
  proxy: Shield,
  ddos: ShieldCheck,
  object: Database,
  volume: HardDrive,
  wallet: Wallet,
  invoice: Receipt,
  offer: Tag,
  ticket: Ticket,
  profile: UserRound,
  security: Users,
  token: KeyRound,
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/dashboard/servers") return pathname === href;
  if (href === "/dashboard/servers/mine") {
    return pathname === href || /^\/dashboard\/servers\/[0-9a-f-]{36}$/i.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name }: { name: string }) {
  const Icon = icons[name] ?? LayoutDashboard;
  return <Icon className="size-4 shrink-0" aria-hidden="true" />;
}

function Item({ item, pathname, onNavigate }: { item: DashItem; pathname: string; onNavigate: () => void }) {
  const openByDefault = item.kind === "group" && item.children.some((child) => isActive(pathname, child.href));
  const [open, setOpen] = useState(openByDefault);

  if (item.kind === "link") {
    const active = isActive(pathname, item.href);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`dash-nav-link ${active ? "is-active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <NavIcon name={item.icon} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button type="button" className="dash-nav-link w-full" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <NavIcon name={item.icon} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <div className={`dash-subnav grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <ul className="mt-0.5 ml-4 overflow-hidden border-l border-[var(--dash-line)] pl-2" inert={open ? undefined : true}>
          {item.children.map((child) => {
            const active = isActive(pathname, child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className={`dash-nav-link ${active ? "is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const sections = useMemo(() => dashboardNav, []);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    const previous = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    asideRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      {open ? <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Close menu" onClick={onClose} /> : null}
      <aside ref={asideRef} className={`dash-sidebar ${open ? "is-open" : ""}`} tabIndex={-1}>
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--dash-line)] px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5" onClick={onClose}>
            <Image src="/brand/logo.png" alt="" width={28} height={28} />
            <span className="truncate text-sm tracking-tight text-[var(--dash-ink)]">
              Cyro<span className="text-[var(--dash-muted)]">Host</span>
            </span>
          </Link>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Console">
          {sections.map((section) => (
            <div key={section.id} className="mb-4">
              <p className="px-2 pb-1 text-[10px] font-medium tracking-[0.16em] text-[var(--dash-muted)] uppercase">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Item key={item.kind === "link" ? item.href : item.id} item={item} pathname={pathname} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-[var(--dash-line)] p-3">
          <Link href="/" className="dash-nav-link" onClick={onClose}>
            <Globe className="size-4" aria-hidden="true" />
            Marketing site
          </Link>
          <Link href="/dashboard/servers" className="dash-nav-link mt-1" onClick={onClose}>
            <Plus className="size-4" aria-hidden="true" />
            Configure a VPS
          </Link>
          <p className="mt-2 px-2 text-[11px] leading-4 text-[var(--dash-muted)]">
            <Bell className="mr-1 inline size-3" aria-hidden="true" />
            <CreditCard className="mr-1 inline size-3" aria-hidden="true" />
            This console can save a deployment request. A machine is not provisioned until an infrastructure provider is connected.
          </p>
        </div>
      </aside>
    </>
  );
}

