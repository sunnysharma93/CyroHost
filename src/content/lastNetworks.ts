export type NetworkStatus = "published" | "map" | "request" | "enquiry";

export type NetworkRegion = "Asia-Pacific" | "Europe" | "North America" | "Oceania";

export type NetworkLocation = {
  id: string;
  city: string;
  country: string;
  place: string;
  region: NetworkRegion;
  lat: number;
  lon: number;
  flag: string;
  status: NetworkStatus;
  statusLabel: string;
  description: string;
};

export const networkStatusLabel: Record<NetworkStatus, string> = {
  published: "Published compute",
  map: "Network map",
  request: "On request",
  enquiry: "Location information available on enquiry",
};

export const regionColor: Record<NetworkRegion, string> = {
  "Asia-Pacific": "var(--cyan)",
  Europe: "var(--violet)",
  "North America": "var(--orange)",
  Oceania: "var(--mint)",
};

export const networkLocations: NetworkLocation[] = [
  {
    id: "mumbai",
    city: "Mumbai",
    country: "India",
    place: "Mumbai, India",
    region: "Asia-Pacific",
    lat: 19.076,
    lon: 72.8777,
    flag: "🇮🇳",
    status: "map",
    statusLabel: networkStatusLabel.map,
    description: "Named on the Network India map. This is not a VPS order city, and rack space is not confirmed.",
  },
  {
    id: "noida",
    city: "Noida",
    country: "India",
    place: "Noida, India",
    region: "Asia-Pacific",
    lat: 28.5355,
    lon: 77.391,
    flag: "🇮🇳",
    status: "map",
    statusLabel: networkStatusLabel.map,
    description: "Named on the Network India map. A bare-metal reference price also names Noida and still needs confirmation.",
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    place: "Singapore",
    region: "Asia-Pacific",
    lat: 1.3521,
    lon: 103.8198,
    flag: "🇸🇬",
    status: "published",
    statusLabel: networkStatusLabel.published,
    description: "Published compute region, described as an Intel line. The marker is the country, not a named hall.",
  },
  {
    id: "japan",
    city: "Japan",
    country: "Japan",
    place: "Japan",
    region: "Asia-Pacific",
    lat: 36.2048,
    lon: 138.2529,
    flag: "🇯🇵",
    status: "enquiry",
    statusLabel: networkStatusLabel.enquiry,
    description: "No public CyroHost page names Japan as a compute region. Ask before treating a city or a hall as available.",
  },
  {
    id: "netherlands",
    city: "Netherlands",
    country: "Netherlands",
    place: "the Netherlands",
    region: "Europe",
    lat: 52.1326,
    lon: 5.2913,
    flag: "🇳🇱",
    status: "enquiry",
    statusLabel: networkStatusLabel.enquiry,
    description: "No public CyroHost page names the Netherlands. No city, hall, or capacity is listed here.",
  },
  {
    id: "united-kingdom",
    city: "United Kingdom",
    country: "United Kingdom",
    place: "the United Kingdom",
    region: "Europe",
    lat: 54.7024,
    lon: -3.2766,
    flag: "🇬🇧",
    status: "enquiry",
    statusLabel: networkStatusLabel.enquiry,
    description: "No public CyroHost page names the United Kingdom. No city, hall, or capacity is listed here.",
  },
  {
    id: "united-states",
    city: "United States",
    country: "United States",
    place: "the United States",
    region: "North America",
    lat: 39.8283,
    lon: -98.5795,
    flag: "🇺🇸",
    status: "request",
    statusLabel: networkStatusLabel.request,
    description: "Marked on demand. It is not instant deploy, and no city or capacity figure is published.",
  },
  {
    id: "canada",
    city: "Canada",
    country: "Canada",
    place: "Canada",
    region: "North America",
    lat: 56.1304,
    lon: -106.3468,
    flag: "🇨🇦",
    status: "enquiry",
    statusLabel: networkStatusLabel.enquiry,
    description: "No public CyroHost page names Canada. No city, hall, or capacity is listed here.",
  },
  {
    id: "new-zealand",
    city: "New Zealand",
    country: "New Zealand",
    place: "New Zealand",
    region: "Oceania",
    lat: -40.9006,
    lon: 174.886,
    flag: "🇳🇿",
    status: "enquiry",
    statusLabel: networkStatusLabel.enquiry,
    description: "No public CyroHost page names New Zealand. No city, hall, or capacity is listed here.",
  },
];

export const illustrativeLinks = [
  ["mumbai", "noida"],
  ["singapore", "japan"],
  ["netherlands", "united-kingdom"],
  ["united-states", "canada"],
] as const;

export const lineNote =
  "Dashed lines are a diagram only. They are not fibre routes, latency figures, or live links.";

export function locationMessage(place: string) {
  return `Hi CyroHost, I would like to enquire about infrastructure availability in ${place}. Please share the available services and details.`;
}

export function locationWhatsApp(place: string) {
  return `https://wa.me/919528839776?text=${encodeURIComponent(locationMessage(place))}`;
}
