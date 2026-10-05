export type MapKind = "compute" | "on-demand" | "named" | "network-map" | "unpublished";

export type MapPoint = {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
  kind: MapKind;
  products: string[];
  specs: string;
  useCases: string[];
  href: string;
  hrefLabel: string;
};

export const mapKindLabel: Record<MapKind, string> = {
  compute: "Published compute",
  "on-demand": "On demand",
  named: "Named on a product page",
  "network-map": "Network map",
  unpublished: "Not published",
};

export const mapPoints: MapPoint[] = [
  {
    id: "india",
    name: "India",
    country: "India",
    x: 69.2,
    y: 42,
    kind: "compute",
    products: ["VPS (AMD and Intel lines)", "Minecraft", "Hytale", "FiveM", "Discord bot hosting"],
    specs: "Public pages name the region, not a city. Minecraft in India is listed from ₹100/mo on AMD EPYC 4464P. VPS price, RAM, disk, and OS images are not published.",
    useCases: ["Workloads aimed at an India compute region", "Game servers with a published India starting price"],
    href: "/cloud/vps",
    hrefLabel: "Explore India compute pages",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    x: 66.4,
    y: 46.5,
    kind: "network-map",
    products: ["Named on the Network India map"],
    specs: "The map names Web Werks Mumbai, GPX-2 / Equinix MB2, Sify Rabale, and CtrlS Mumbai. That is not a VPS order city, and cabinet space is not confirmed.",
    useCases: ["Reading which Mumbai sites the network map names", "Starting a colocation enquiry, which still has to be confirmed"],
    href: "/edge/network-india",
    hrefLabel: "Open the Network India map",
  },
  {
    id: "noida",
    name: "Noida",
    country: "India",
    x: 71.6,
    y: 36.5,
    kind: "network-map",
    products: ["Named on the Network India map"],
    specs: "The map names Sify Noida and Yotta DC Noida near Delhi. Those names are not published VPS regions, and rack space is not confirmed.",
    useCases: ["Reading which Noida sites the network map names"],
    href: "/edge/network-india",
    hrefLabel: "Open the Network India map",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    x: 78.4,
    y: 54,
    kind: "compute",
    products: ["VPS (Intel line)", "Minecraft", "Hytale", "FiveM"],
    specs: "A Singapore VPS page describes Intel server-grade CPUs. Minecraft is listed from ₹80/mo on Intel Xeon E-2136. Discord bot hosting does not name Singapore. VPS price, RAM, and disk are not published.",
    useCases: ["Workloads aimed at the published Singapore compute region"],
    href: "/cloud/vps",
    hrefLabel: "Explore the Singapore compute pages",
  },
  {
    id: "germany",
    name: "Germany",
    country: "Germany",
    x: 55.5,
    y: 30,
    kind: "named",
    products: ["Appears on the VPS location list", "Appears on the Discord bot location list"],
    specs: "No separate Germany order page or price was published. Do not treat this as an instant-deploy region.",
    useCases: ["Asking sales whether a Germany listing still applies to a specific product"],
    href: "/cloud/vps",
    hrefLabel: "Read the VPS location notes",
  },
  {
    id: "united-states",
    name: "United States",
    country: "United States",
    x: 24,
    y: 40,
    kind: "on-demand",
    products: ["VPS, Minecraft, Hytale, and FiveM mark the United States as on demand"],
    specs: "It is not presented as an instant-deploy region. No latency or capacity figure is published.",
    useCases: ["Asking whether an on-demand United States deployment is possible for a named product"],
    href: "/cloud/vps",
    hrefLabel: "Read the on-demand note",
  },
  {
    id: "japan",
    name: "Japan",
    country: "Japan",
    x: 86,
    y: 34,
    kind: "unpublished",
    products: ["No public CyroHost product page names Japan"],
    specs: "No hardware, network, price, or availability record was published for Japan.",
    useCases: ["It is not an orderable location"],
    href: "/locations",
    hrefLabel: "See how locations are labelled",
  },
  {
    id: "netherlands",
    name: "Netherlands",
    country: "Netherlands",
    x: 49.5,
    y: 32,
    kind: "unpublished",
    products: ["No public CyroHost product page names the Netherlands"],
    specs: "No hardware, network, price, or availability record was published for the Netherlands.",
    useCases: ["It is not an orderable location"],
    href: "/locations",
    hrefLabel: "See how locations are labelled",
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    country: "United Kingdom",
    x: 45.5,
    y: 22,
    kind: "unpublished",
    products: ["No public CyroHost product page names the United Kingdom"],
    specs: "No hardware, network, price, or availability record was published for the United Kingdom.",
    useCases: ["It is not an orderable location"],
    href: "/locations",
    hrefLabel: "See how locations are labelled",
  },
  {
    id: "canada",
    name: "Canada",
    country: "Canada",
    x: 16,
    y: 18,
    kind: "unpublished",
    products: ["No public CyroHost product page names Canada"],
    specs: "No hardware, network, price, or availability record was published for Canada.",
    useCases: ["It is not an orderable location"],
    href: "/locations",
    hrefLabel: "See how locations are labelled",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    country: "New Zealand",
    x: 94,
    y: 78,
    kind: "unpublished",
    products: ["No public CyroHost product page names New Zealand"],
    specs: "No hardware, network, price, or availability record was published for New Zealand.",
    useCases: ["It is not an orderable location"],
    href: "/locations",
    hrefLabel: "See how locations are labelled",
  },
];

export const mapRelations = [
  {
    from: "india",
    to: "singapore",
    label: "India and Singapore are both published compute regions. The line is not a fibre route.",
  },
  {
    from: "mumbai",
    to: "noida",
    label: "Mumbai and Noida are both names on the Network India map. The line is not fibre CyroHost owns.",
  },
] as const;
