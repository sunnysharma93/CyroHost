export type GlobeKind = "verified" | "map" | "request" | "illustrative";

export type GlobeSite = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: GlobeKind;
  markerColor: string;
  detail: string;
  href: string;
  hrefLabel: string;
};

export const globeKindLabel: Record<GlobeKind, string> = {
  verified: "Published compute",
  map: "Network map",
  request: "On request",
  illustrative: "Enquiry",
};

export const globeSites: GlobeSite[] = [
  {
    id: "india",
    name: "India",
    lat: 22.5,
    lon: 79,
    kind: "verified",
    markerColor: "#1f7a4d",
    detail: "Published compute region. The public pages do not name a city for the VPS region.",
    href: "/cloud/vps",
    hrefLabel: "VPS notes",
  },
  {
    id: "singapore",
    name: "Singapore",
    lat: 1.35,
    lon: 103.82,
    kind: "verified",
    markerColor: "#0f6e62",
    detail: "Published compute region, described as an Intel line. No city-level hall is claimed.",
    href: "/cloud/vps",
    hrefLabel: "VPS notes",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    lat: 19.08,
    lon: 72.88,
    kind: "map",
    markerColor: "#c47a2c",
    detail: "Named on the Network India map. Not a VPS order city, and rack space is not confirmed.",
    href: "/edge/network-india",
    hrefLabel: "Network India",
  },
  {
    id: "noida",
    name: "Noida",
    lat: 28.54,
    lon: 77.39,
    kind: "map",
    markerColor: "#d4893a",
    detail: "Named on the Network India map. A bare-metal reference price also names Noida and still needs confirmation.",
    href: "/pricing#bare-metal",
    hrefLabel: "Bare metal note",
  },
  {
    id: "germany",
    name: "Germany",
    lat: 51.16,
    lon: 10.45,
    kind: "request",
    markerColor: "#5c3d9e",
    detail: "Named on some product lists. There is no separate Germany order page.",
    href: "/cloud/vps",
    hrefLabel: "VPS notes",
  },
  {
    id: "united-states",
    name: "United States",
    lat: 39.8,
    lon: -98.6,
    kind: "request",
    markerColor: "#e07a3d",
    detail: "Marked on demand. It is not presented as instant deploy, and no capacity figure is published.",
    href: "/locations",
    hrefLabel: "Location notes",
  },
  {
    id: "japan",
    name: "Japan",
    lat: 36.2,
    lon: 138.25,
    kind: "illustrative",
    markerColor: "#2a9d8f",
    detail: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/locations",
    hrefLabel: "How labels work",
  },
  {
    id: "netherlands",
    name: "Netherlands",
    lat: 52.13,
    lon: 5.29,
    kind: "illustrative",
    markerColor: "#7c5cbf",
    detail: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/locations",
    hrefLabel: "How labels work",
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    lat: 54.0,
    lon: -2.0,
    kind: "illustrative",
    markerColor: "#3d6b9a",
    detail: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/locations",
    hrefLabel: "How labels work",
  },
  {
    id: "canada",
    name: "Canada",
    lat: 56.13,
    lon: -106.35,
    kind: "illustrative",
    markerColor: "#d4a017",
    detail: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/locations",
    hrefLabel: "How labels work",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    lat: -40.9,
    lon: 174.89,
    kind: "illustrative",
    markerColor: "#1f7a4d",
    detail: "Listed for infrastructure enquiry. Not described as an operational CyroHost data centre.",
    href: "/locations",
    hrefLabel: "How labels work",
  },
];

export const globeArcNote =
  "Markers are labels on a diagram. They are not fibre routes, latency figures, capacity, or proof of a live network.";
