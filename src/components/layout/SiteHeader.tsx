"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AccountActions } from "@/components/auth/AccountActions";
import { ButtonLink } from "@/components/ui/ButtonLink";

const nav = [
  { label: "Products", href: "/products" },
  { label: "Global Infrastructure", href: "/global-infrastructure" },
  { label: "Developers", href: "/developers" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
] as const;

function active(pathname: string, href: string) {
  if (href === "/products") return pathname === "/products" || pathname.startsWith("/cloud") || pathname.startsWith("/labs") || pathname.startsWith("/web");
  if (href === "/global-infrastructure") {
    return pathname === href || pathname.startsWith("/locations") || pathname.startsWith("/edge") || pathname.startsWith("/network") || pathname.startsWith("/last-networks");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="CyroHost home" onClick={onNavigate}>
      <Image src="/brand/logo.png" width={28} height={28} alt="" className="wordmark-mark size-7" />
      <span className="truncate text-[15px] tracking-tight text-ink">
        Cyro<span className="text-muted">Host</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const menuId = useId();
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobile) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobile(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobile]);

  return (
    <header className={`site-header sticky top-0 z-40 border-b ${scrolled ? "is-scrolled" : ""}`}>
      <div className="shell flex h-16 items-center gap-6">
        <Wordmark />
        <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const on = active(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`px-2.5 py-2 text-sm transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <span className={on ? "border-b border-violet pb-0.5" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <AccountActions registerLabel="Get Started" />
        </div>
        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center border border-line lg:hidden"
          aria-expanded={mobile}
          aria-controls={menuId}
          onClick={() => setMobile((value) => !value)}
        >
          {mobile ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
          <span className="sr-only">{mobile ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {mobile ? (
        <div id={menuId} className="border-t border-line bg-navy lg:hidden">
          <nav aria-label="Mobile" className="shell grid max-h-[calc(100dvh-4rem)] gap-1 overflow-y-auto py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-1 py-3 text-sm text-ink"
                aria-current={active(pathname, item.href) ? "page" : undefined}
                onClick={() => setMobile(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid gap-2 border-t border-line pt-3">
              <AccountActions stacked registerLabel="Get Started" />
              <ButtonLink href="/contact" variant="secondary">
                Talk to CyroHost
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
