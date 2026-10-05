export const site = {
  name: "CyroHost",
  url: "https://www.cyrohost.com",
  description:
    "CyroHost provides cloud compute, networking, edge infrastructure, and web hosting. India and Singapore are published compute regions.",
  email: "admin@cyrohost.com",
  privacyEmail: "cyrohost07@gmail.com",
  researchedOn: "2026-10-03",
} as const;

export const links = {
  website: "https://www.cyrohost.com/",
  client: "https://client.cyrohost.com/",
  tickets: "https://client.cyrohost.com/tickets/",
  ticketCreate: "https://client.cyrohost.com/tickets/create",
  vpsPanel: "https://vps.cyrohost.com/",
  networkIndia: "https://network-india.cyrohost.com/",
  instagram: "https://www.instagram.com/cyro.host/",
  youtube: "https://youtube.com/@cyrohost",
  youtubeTutorials: "https://www.youtube.com/channel/UCDDA_XQNPzPdFYTI1mXjwYA",
  discord: "https://discord.gg/dkkaq6xW43",
  whatsappChannel: "https://whatsapp.com/channel/0029VbD2CUvJkK74Mmw36Z41",
  whatsapp: "https://wa.me/919528839776",
  whatsappChat:
    "https://wa.me/919528839776?text=Hi%20CyroHost%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services.",
  whatsappNumber: "+91 95288 39776",
  telegram: "https://t.me/cyrocloud0",
  linkedin: "https://www.linkedin.com/in/cyrohost",
  trustpilot: "https://www.trustpilot.com/review/cyrohost.com",
  status: "https://status.cyrohost.com/",
  privacy: "https://www.cyrohost.com/privacy.html",
  terms: "https://www.cyrohost.com/tos.html",
  refund: "https://www.cyrohost.com/refund.html",
  reseller: "https://www.cyrohost.com/reseller.html",
  shield: "https://www.cyrohost.com/shield.html",
  vps: "https://www.cyrohost.com/vps.html",
  vpsIndia: "https://www.cyrohost.com/ivps.html",
  vpsIndiaAmd: "https://www.cyrohost.com/invps.html",
  vpsIndiaIntel: "https://www.cyrohost.com/iivps.html",
  vpsSingapore: "https://www.cyrohost.com/sgvps.html",
  bareMetal: "https://www.cyrohost.com/baremetal.html",
  minecraft: "https://www.cyrohost.com/minecraft.html",
  hytale: "https://www.cyrohost.com/hytale.html",
  fivem: "https://www.cyrohost.com/fivem.html",
  discordBots: "https://www.cyrohost.com/discordbot.html",
} as const;

export type NavLink = {
  label: string;
  href: string;
  description: string;
  external?: boolean;
};

export type NavGroup = {
  label: string;
  href: string;
  description: string;
  items: NavLink[];
};

export const navigation: NavGroup[] = [
  {
    label: "Cloud",
    href: "/cloud",
    description: "Virtual servers, dedicated hardware, storage enquiries, and game infrastructure.",
    items: [
      {
        label: "VPS",
        href: "/cloud/vps",
        description: "India AMD and Intel lines, plus Singapore Intel VPS pages.",
      },
      {
        label: "VDS",
        href: "/cloud/vds",
        description: "Dedicated-resource enquiries. No separate catalogue was published.",
      },
      {
        label: "RDP",
        href: "/cloud/rdp",
        description: "Remote desktop enquiries. No Windows image list was published.",
      },
      {
        label: "S3-compatible storage",
        href: "/cloud/storage",
        description: "Object storage enquiries. API compatibility was not published.",
      },
      {
        label: "Dedicated servers",
        href: "/cloud/dedicated-servers",
        description: "Bare metal, ordered by enquiry rather than a public price list.",
      },
      {
        label: "Game servers",
        href: "/cloud/game-servers",
        description: "Minecraft, Hytale, and FiveM pages with published starting points.",
      },
    ],
  },
  {
    label: "Labs",
    href: "/labs",
    description: "IP transit, BGP, and address leasing for operators and providers.",
    items: [
      {
        label: "IP Transit",
        href: "/labs/ip-transit",
        description: "Upstream bandwidth and routing enquiries.",
      },
      {
        label: "BGP services",
        href: "/labs/bgp",
        description: "ASN, prefix, and announcement enquiries.",
      },
      {
        label: "IP leasing",
        href: "/labs/ip-leasing",
        description: "IPv4 allocation enquiries. Pool sizes are not published.",
      },
    ],
  },
  {
    label: "Edge",
    href: "/edge",
    description: "Colocation enquiries and the Network India map.",
    items: [
      {
        label: "Colocation",
        href: "/edge/colocation",
        description: "Hardware placement, power, and connectivity enquiries.",
      },
      {
        label: "Network India",
        href: "/edge/network-india",
        description: "India routes and named sites, explained here.",
      },
    ],
  },
  {
    label: "Web",
    href: "/web",
    description: "Website hosting enquiries and published Discord bot plans.",
    items: [
      {
        label: "Web hosting",
        href: "/web/hosting",
        description: "Business sites and app hosting. Plan tables were not published.",
      },
      {
        label: "Discord bot hosting",
        href: "/web/hosting#discord-bots",
        description: "Published starter, coder, and developer plans.",
      },
    ],
  },
];

export const primaryNav: NavGroup[] = [
  {
    label: "Products",
    href: "/products",
    description: "Compute, network, storage, and platform services. Availability is labelled on each card.",
    items: [
      { label: "VPS", href: "/cloud/vps", description: "Indicative sizes on the pricing page. Confirm before ordering." },
      { label: "VDS", href: "/cloud/vds", description: "Reserved-resource enquiries. No separate catalogue." },
      { label: "RDP", href: "/cloud/rdp", description: "Remote desktop enquiries. Image list not published." },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers", description: "Bare metal. The Noida figure is a reference price." },
      { label: "S3 storage", href: "/cloud/storage", description: "Object storage enquiry. API compatibility not published." },
      { label: "Game servers", href: "/cloud/game-servers", description: "Minecraft, Hytale, and FiveM with published starting points." },
      { label: "IP transit", href: "/labs/ip-transit", description: "Bandwidth and routing, quoted." },
      { label: "BGP", href: "/labs/bgp", description: "Sessions and prefixes, quoted. No published ASN." },
      { label: "IP leasing", href: "/labs/ip-leasing", description: "Address space by enquiry. Pool size not listed." },
      { label: "Colocation", href: "/edge/colocation", description: "Space and power confirmed before hardware ships." },
      { label: "Web hosting", href: "/web/hosting", description: "Sites by enquiry. Discord bot plans are published." },
    ],
  },
  {
    label: "Global Infrastructure",
    href: "/global-infrastructure",
    description: "Published compute regions, map names, and illustrative pins. Not a live network.",
    items: [
      { label: "Location notes", href: "/locations", description: "How India, Singapore, Mumbai, and Noida differ." },
      { label: "Network India", href: "/edge/network-india", description: "Named sites on the India map." },
      { label: "Network notes", href: "/network", description: "What this site does and does not claim about routes." },
      { label: "Last Networks", href: "/last-networks", description: "World map of published, map-name, on-request, and enquiry locations." },
    ],
  },
  {
    label: "Developers",
    href: "/developers",
    description: "The contact endpoint on this site, plus guides. No provisioning API is published.",
    items: [
      { label: "Guides", href: "/docs", description: "Ordering, regions, and published prices." },
      { label: "Search", href: "/search", description: "Find a service or a guide." },
    ],
  },
  {
    label: "Enterprise",
    href: "/enterprise",
    description: "Custom compute, network, and colocation conversations. No SLA is published.",
    items: [
      { label: "Contact", href: "/contact", description: "Describe the workload. The form says if it was not sent." },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers", description: "Bare metal scoped with the team." },
      { label: "Colocation", href: "/edge/colocation", description: "Your hardware. Space confirmed first." },
      { label: "IP transit", href: "/labs/ip-transit", description: "Commit and location, quoted." },
    ],
  },
];

export const headerLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Last Networks", href: "/last-networks" },
] as const;
