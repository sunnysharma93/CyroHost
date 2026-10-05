"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/client", label: "Overview" },
  { href: "/client/services", label: "Services" },
  { href: "/client/invoices", label: "Invoices" },
  { href: "/client/tickets", label: "Support" },
  { href: "/client/account", label: "Account" },
  { href: "/client/login", label: "Sign in" },
];

export function ClientNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Client area" className="flex gap-2 overflow-x-auto border-b border-line pb-4 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      {items.map((item) => {
        const current = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`shrink-0 px-3 py-2 text-sm ${current ? "bg-panel text-ink" : "text-muted hover:text-ink"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
