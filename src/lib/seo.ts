import type { Metadata } from "next";
import { site } from "@/config/site";

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = input.path === "/" ? `${site.url}/` : `${site.url}${input.path}`;
  const title = input.title.startsWith("CyroHost") ? input.title : `${input.title} · CyroHost`;

  return {
    title: { absolute: title },
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: input.description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
    },
  };
}
