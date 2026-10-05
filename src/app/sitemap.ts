import type { MetadataRoute } from "next";
import { docs } from "@/content/docs";
import { serviceDocuments } from "@/content/services";
import { site } from "@/config/site";

const extra = [
  "/locations",
  "/network",
  "/about",
  "/contact",
  "/support",
  "/terms",
  "/privacy",
  "/edge/network-india",
  "/pricing",
  "/last-networks",
  "/products",
  "/global-infrastructure",
  "/developers",
  "/enterprise",
  "/docs",
  "/search",
  "/client",
  "/client/services",
  "/client/invoices",
  "/client/tickets",
  "/client/account",
  "/client/login",
  "/login",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...serviceDocuments.map((service) => service.path), ...docs.map((article) => `/docs/${article.slug}`), ...extra];
  return paths.map((path) => ({
    url: path === "/" ? `${site.url}/` : `${site.url}${path}`,
    lastModified: new Date("2026-10-03"),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
