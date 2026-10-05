import { docs } from "@/content/docs";
import { serviceDocuments } from "@/content/services";

export type SearchHit = {
  title: string;
  href: string;
  summary: string;
  kind: "Service" | "Guide" | "Page";
};

const pages: SearchHit[] = [
  {
    title: "Published prices",
    href: "/pricing",
    summary: "Minecraft, Hytale, and Discord bot prices copied from the public pages. Other services are quoted.",
    kind: "Page",
  },
  {
    title: "Locations",
    href: "/locations",
    summary: "India and Singapore compute regions, and how they differ from the network map.",
    kind: "Page",
  },
  {
    title: "Network",
    href: "/network",
    summary: "How CyroHost describes connectivity, without unpublished capacity figures.",
    kind: "Page",
  },
  {
    title: "Support",
    href: "/support",
    summary: "Question categories. Each one opens WhatsApp and does not file a ticket.",
    kind: "Page",
  },
  {
    title: "Contact",
    href: "/contact",
    summary: "Describe a workload. The form says when a message was not sent.",
    kind: "Page",
  },
  {
    title: "Client area",
    href: "/client",
    summary: "Services, invoices, support, and account layouts. Sign-in is not connected.",
    kind: "Page",
  },
  {
    title: "Network India",
    href: "/edge/network-india",
    summary: "Named Indian sites from the network map. Not a cabinet inventory.",
    kind: "Page",
  },
];

export function searchIndex(): SearchHit[] {
  return [
    ...serviceDocuments.map((service) => ({
      title: service.title,
      href: service.path,
      summary: service.lede,
      kind: "Service" as const,
    })),
    ...docs.map((article) => ({
      title: article.title,
      href: `/docs/${article.slug}`,
      summary: article.lede,
      kind: "Guide" as const,
    })),
    ...pages,
  ];
}

export function searchContent(query: string) {
  const needle = query.trim().toLowerCase();
  const items = searchIndex();
  if (!needle) return items;
  return items.filter((item) => `${item.title} ${item.summary} ${item.kind}`.toLowerCase().includes(needle));
}
