export type LocationStatus =
  | "Published compute region"
  | "Named on product pages"
  | "On demand"
  | "Network map";

export type LocationEntry = {
  name: string;
  status: LocationStatus;
  detail: string;
  appliesTo: string;
};

export const locations: LocationEntry[] = [
  {
    name: "India",
    status: "Published compute region",
    detail:
      "VPS is published as AMD and Intel lines. Minecraft, Hytale, FiveM, and Discord bot pages also name India. The public pages do not name a city for the compute region.",
    appliesTo: "VPS, game servers, Discord bot hosting",
  },
  {
    name: "Singapore",
    status: "Published compute region",
    detail:
      "A Singapore VPS page describes Intel server-grade CPUs. Minecraft, Hytale, and FiveM pages also name Singapore. Discord bot hosting does not.",
    appliesTo: "VPS, Minecraft, Hytale, FiveM",
  },
  {
    name: "Germany",
    status: "Named on product pages",
    detail:
      "The VPS location list and the Discord bot location list include Germany. No separate Germany order page or price was published.",
    appliesTo: "VPS location list, Discord bot hosting",
  },
  {
    name: "United States",
    status: "On demand",
    detail:
      "VPS, Minecraft, Hytale, and FiveM pages mark the United States as on demand. It is not presented as an instant-deploy region.",
    appliesTo: "VPS, Minecraft, Hytale, FiveM",
  },
  {
    name: "Mumbai",
    status: "Network map",
    detail:
      "The Network India map names Mumbai sites, including Web Werks Mumbai, GPX-2 / Equinix MB2, Sify Rabale, and CtrlS Mumbai. That map is not a VPS order form.",
    appliesTo: "Network India visualization",
  },
  {
    name: "Noida",
    status: "Network map",
    detail:
      "The Network India map names Sify Noida and Yotta DC Noida near Delhi. Rack space at those sites is not confirmed as an orderable product.",
    appliesTo: "Network India visualization",
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
