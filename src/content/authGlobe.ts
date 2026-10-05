export type AuthPlace = {
  id: string;
  name: string;
  label: string;
  labelShift?: [number, number];
  lat: number;
  lon: number;
  color: string;
  status: string;
  note: string;
};

export const authPlaces: AuthPlace[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    label: "Mumbai",
    labelShift: [-7, -6],
    lat: 19.08,
    lon: 72.88,
    color: "#3ddec8",
    status: "Network map",
    note: "Named on the Network India map. Not an orderable server city.",
  },
  {
    id: "noida",
    name: "Noida",
    label: "Noida",
    labelShift: [6, 5],
    lat: 28.54,
    lon: 77.39,
    color: "#8fd9c8",
    status: "Network map",
    note: "Named on the Network India map. Not confirmed as a live server.",
  },
  {
    id: "singapore",
    name: "Singapore",
    label: "Singapore",
    labelShift: [-6, 4],
    lat: 1.35,
    lon: 103.82,
    color: "#1fbfa7",
    status: "Published region",
    note: "Published compute region. No city-level hall is claimed.",
  },
  {
    id: "japan",
    name: "Japan",
    label: "Japan",
    labelShift: [4, 6],
    lat: 36.2,
    lon: 138.25,
    color: "#9b8cff",
    status: "Location of interest",
    note: "Location of interest. No public page confirms a server in Japan.",
  },
  {
    id: "netherlands",
    name: "Netherlands",
    label: "Netherlands",
    labelShift: [-8, -8],
    lat: 52.13,
    lon: 5.29,
    color: "#7eb6ff",
    status: "Location of interest",
    note: "Location of interest. No public page confirms a server in the Netherlands.",
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    label: "UK",
    labelShift: [9, -6],
    lat: 54.0,
    lon: -2.0,
    color: "#c4b5fd",
    status: "Location of interest",
    note: "Location of interest. No public page confirms a server in the United Kingdom.",
  },
  {
    id: "united-states",
    name: "United States",
    label: "USA",
    lat: 39.8,
    lon: -98.6,
    color: "#f0a36a",
    status: "On request",
    note: "On request. Not instant deploy, and no capacity figure is published.",
  },
  {
    id: "canada",
    name: "Canada",
    label: "Canada",
    lat: 56.13,
    lon: -106.35,
    color: "#6ec8ff",
    status: "Location of interest",
    note: "Location of interest. No public page confirms a server in Canada.",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    label: "New Zealand",
    lat: -40.9,
    lon: 174.89,
    color: "#8fd9a8",
    status: "Location of interest",
    note: "Location of interest. No public page confirms a server in New Zealand.",
  },
];

export const authArcs = [
  ["mumbai", "noida"],
  ["mumbai", "singapore"],
  ["singapore", "japan"],
  ["singapore", "netherlands"],
  ["netherlands", "united-kingdom"],
  ["united-kingdom", "united-states"],
  ["united-states", "canada"],
  ["singapore", "new-zealand"],
] as const;

export const authArcNote =
  "Connection lines are a diagram only. They are not fibre routes, latency, or live status.";
