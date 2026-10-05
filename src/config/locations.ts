export type LocationStatus = "compute" | "listed" | "on-demand" | "network-map";

export type LocationEntry = {
  name: string;
  region: string;
  status: LocationStatus;
  statusLabel: string;
  detail: string;
};

export const locationStatusCopy: Record<LocationStatus, string> = {
  compute: "Published compute region",
  listed: "Named on a product page",
  "on-demand": "Listed as on-demand",
  "network-map": "Shown on the Network India map",
};

export const locations: LocationEntry[] = [
  {
    name: "India",
    region: "Compute",
    status: "compute",
    statusLabel: "Published compute region",
    detail:
      "VPS is published as India AMD and India Intel lines. Minecraft, Hytale, FiveM, and Discord bot pages also name India.",
  },
  {
    name: "Singapore",
    region: "Compute",
    status: "compute",
    statusLabel: "Published compute region",
    detail:
      "A Singapore Intel VPS page is published. Minecraft, Hytale, and FiveM pages also name Singapore. Discord bot hosting does not.",
  },
  {
    name: "Germany",
    region: "Listed",
    status: "listed",
    statusLabel: "Named on product pages",
    detail:
      "The VPS location list and the Discord bot location list include Germany. No separate Germany order page was published.",
  },
  {
    name: "United States",
    region: "On demand",
    status: "on-demand",
    statusLabel: "Listed as on-demand",
    detail:
      "VPS, Minecraft, Hytale, and FiveM pages mark the United States as on-demand. The Discord bot page also names the USA.",
  },
  {
    name: "Mumbai",
    region: "Network map",
    status: "network-map",
    statusLabel: "Network India map",
    detail:
      "The Network India map places Mumbai routes and names Web Werks Mumbai, GPX-2 / Equinix MB2, Sify Rabale, and CtrlS Mumbai. That is a map, not a VPS order location.",
  },
  {
    name: "Noida",
    region: "Network map",
    status: "network-map",
    statusLabel: "Network India map",
    detail:
      "The same map names Sify Noida and Yotta DC Noida near Delhi. Colocation at those sites has to be confirmed. They are not published as VPS regions.",
  },
];

export const networkMapSites = [
  "Sify Noida",
  "Yotta DC Noida",
  "Web Werks Delhi (NCR)",
  "Web Werks Mumbai",
  "GPX-2 / Equinix MB2",
  "Sify Rabale",
  "CtrlS Mumbai",
  "CtrlS Lucknow",
  "NIXI Indore",
  "Edge Nagpur",
  "STT Kolkata",
  "Sify Bhubaneswar",
  "STT Chennai",
  "Dhaka + BDIX",
] as const;

export const networkMapCities = [
  "Mumbai",
  "Delhi",
  "Pune",
  "Indore",
  "Lucknow",
  "Nagpur",
  "Kolkata",
  "Bhubaneswar",
  "Chennai",
  "Dhaka",
] as const;
