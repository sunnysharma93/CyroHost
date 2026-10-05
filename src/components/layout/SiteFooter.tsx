import Image from "next/image";
import Link from "next/link";
import { links, site } from "@/config/site";

const columns = [
  {
    title: "Products",
    items: [
      { label: "All products", href: "/products" },
      { label: "Cloud VPS", href: "/cloud/vps" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
      { label: "Object storage", href: "/cloud/storage" },
      { label: "Game servers", href: "/cloud/game-servers" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { label: "Global infrastructure", href: "/global-infrastructure" },
      { label: "Location notes", href: "/locations" },
      { label: "Network India", href: "/edge/network-india" },
      { label: "Colocation", href: "/edge/colocation" },
      { label: "IP transit", href: "/labs/ip-transit" },
      { label: "Last Networks", href: "/last-networks" },
    ],
  },
  {
    title: "Developers",
    items: [
      { label: "Developers", href: "/developers" },
      { label: "Guides", href: "/docs" },
      { label: "Ordering", href: "/docs/ordering" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Support", href: "/support" },
      { label: "Login", href: "/login" },
      { label: "Customer dashboard", href: "/dashboard" },
      { label: "WhatsApp", href: links.whatsapp },
    ],
  },
];

const social = [
  { label: "Instagram", href: links.instagram },
  { label: "YouTube", href: links.youtube },
  { label: "Discord", href: links.discord },
  { label: "WhatsApp channel", href: links.whatsappChannel },
  { label: "Telegram", href: links.telegram },
  { label: "LinkedIn", href: links.linkedin },
];

function Column({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const external = item.href.startsWith("http");
          return (
            <li key={item.href + item.label}>
              {external ? (
                <a href={item.href} className="text-sm text-muted hover:text-ink" target="_blank" rel="noopener noreferrer">
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link href={item.href} className="text-sm text-muted hover:text-ink">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-raised">
      <div className="shell grid gap-10 py-14 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="CyroHost home">
            <span className="grid size-9 place-items-center">
              <Image src="/brand/logo.png" width={28} height={28} alt="" className="wordmark-mark" />
            </span>
            <span className="text-lg text-ink">CyroHost</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Cloud compute, networking, and storage. India and Singapore are published compute regions. This website does not take payment or provision a server.
          </p>
          <p className="mt-4 text-sm text-muted">
            <a className="text-ink hover:text-cyan" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="mt-2 text-sm text-muted">
            WhatsApp{" "}
            <a className="text-ink hover:text-cyan" href={links.whatsappChat} target="_blank" rel="noopener noreferrer">
              {links.whatsappNumber}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {columns.map((column) => (
            <Column key={column.title} title={column.title} items={column.items} />
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {social.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm text-muted hover:text-ink" target="_blank" rel="noopener noreferrer">
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">© {new Date().getFullYear()} CyroHost. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
