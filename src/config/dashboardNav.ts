export type DashLink = {
  href: string;
  label: string;
  keywords: string;
};

export type DashItem =
  | { kind: "link"; href: string; label: string; icon: string; keywords: string }
  | { kind: "group"; id: string; label: string; icon: string; children: DashLink[] };

export type DashSection = {
  id: string;
  label: string;
  items: DashItem[];
};

export const dashboardNav: DashSection[] = [
  {
    id: "main",
    label: "Main",
    items: [{ kind: "link", href: "/dashboard", label: "Overview", icon: "overview", keywords: "home overview summary" }],
  },
  {
    id: "servers",
    label: "Servers",
    items: [
      {
        kind: "group",
        id: "vps",
        label: "Cloud VPS",
        icon: "vps",
        children: [
          { href: "/dashboard/servers", label: "Cloud VPS", keywords: "vps plans configure" },
          { href: "/dashboard/servers/mine", label: "My Servers", keywords: "servers list machines" },
          { href: "/dashboard/requests", label: "VPS Requests", keywords: "requests orders enquiry" },
          { href: "/dashboard/servers/groups", label: "Server Groups", keywords: "groups tags folders" },
        ],
      },
      {
        kind: "link",
        href: "/dashboard/dedicated",
        label: "Dedicated & Colocation",
        icon: "dedicated",
        keywords: "bare metal colocation rack",
      },
    ],
  },
  {
    id: "network",
    label: "Network & Edge",
    items: [
      { kind: "link", href: "/dashboard/network/ip", label: "IP Addresses", icon: "ip", keywords: "ipv4 ipv6 addresses" },
      { kind: "link", href: "/dashboard/network/dns", label: "DNS", icon: "dns", keywords: "dns records zones" },
      { kind: "link", href: "/dashboard/network/cdn", label: "CDN & Load Balancing", icon: "cdn", keywords: "cdn load balancer" },
      { kind: "link", href: "/dashboard/network/proxy", label: "Proxy", icon: "proxy", keywords: "proxy reverse" },
      { kind: "link", href: "/dashboard/network/ddos", label: "DDoS Protection", icon: "ddos", keywords: "shield ddos protection" },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    items: [
      { kind: "link", href: "/dashboard/storage/object", label: "Object Storage", icon: "object", keywords: "s3 buckets objects" },
      { kind: "link", href: "/dashboard/storage/volumes", label: "Storage Volumes", icon: "volume", keywords: "block volumes disks" },
    ],
  },
  {
    id: "billing",
    label: "Billing & Support",
    items: [
      { kind: "link", href: "/dashboard/billing/wallet", label: "Wallet & Payments", icon: "wallet", keywords: "wallet balance payments" },
      { kind: "link", href: "/dashboard/billing/invoices", label: "Invoices", icon: "invoice", keywords: "invoices bills" },
      { kind: "link", href: "/dashboard/billing/offers", label: "Offers & Coupons", icon: "offer", keywords: "offers coupons discounts" },
      { kind: "link", href: "/dashboard/support", label: "Support Tickets", icon: "ticket", keywords: "tickets support help" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { kind: "link", href: "/dashboard/account/profile", label: "Profile", icon: "profile", keywords: "profile name email" },
      { kind: "link", href: "/dashboard/account/security", label: "Security & Team", icon: "security", keywords: "password team members" },
      { kind: "link", href: "/dashboard/account/tokens", label: "API Tokens", icon: "token", keywords: "api tokens keys" },
    ],
  },
];

export const dashboardCrumbs: Record<string, { label: string; parent?: string }[]> = {
  "/dashboard": [{ label: "Overview" }],
  "/dashboard/servers": [{ label: "Cloud VPS" }],
  "/dashboard/servers/mine": [{ label: "Cloud VPS", parent: "/dashboard/servers" }, { label: "My Servers" }],
  "/dashboard/servers/configure": [{ label: "Cloud VPS", parent: "/dashboard/servers" }, { label: "Configure" }],
  "/dashboard/servers/deploy": [{ label: "Cloud VPS", parent: "/dashboard/servers" }, { label: "Configure" }],
  "/dashboard/requests": [{ label: "VPS Requests" }],
  "/dashboard/servers/groups": [{ label: "Cloud VPS", parent: "/dashboard/servers" }, { label: "Server Groups" }],
  "/dashboard/dedicated": [{ label: "Dedicated & Colocation" }],
  "/dashboard/network/ip": [{ label: "Network & Edge" }, { label: "IP Addresses" }],
  "/dashboard/network/dns": [{ label: "Network & Edge" }, { label: "DNS" }],
  "/dashboard/network/cdn": [{ label: "Network & Edge" }, { label: "CDN & Load Balancing" }],
  "/dashboard/network/proxy": [{ label: "Network & Edge" }, { label: "Proxy" }],
  "/dashboard/network/ddos": [{ label: "Network & Edge" }, { label: "DDoS Protection" }],
  "/dashboard/storage/object": [{ label: "Storage" }, { label: "Object Storage" }],
  "/dashboard/storage/volumes": [{ label: "Storage" }, { label: "Storage Volumes" }],
  "/dashboard/billing/wallet": [{ label: "Billing" }, { label: "Wallet & Payments" }],
  "/dashboard/billing/invoices": [{ label: "Billing" }, { label: "Invoices" }],
  "/dashboard/billing/offers": [{ label: "Billing" }, { label: "Offers & Coupons" }],
  "/dashboard/support": [{ label: "Support Tickets" }],
  "/dashboard/account/profile": [{ label: "Account" }, { label: "Profile" }],
  "/dashboard/account/security": [{ label: "Account" }, { label: "Security & Team" }],
  "/dashboard/account/tokens": [{ label: "Account" }, { label: "API Tokens" }],
};

export function dashboardSearchEntries() {
  return dashboardNav.flatMap((section) =>
    section.items.flatMap((item) => {
      if (item.kind === "link") {
        return [{ href: item.href, label: item.label, hint: section.label, keywords: item.keywords }];
      }
      return item.children.map((child) => ({
        href: child.href,
        label: child.label,
        hint: item.label,
        keywords: child.keywords,
      }));
    }),
  );
}
