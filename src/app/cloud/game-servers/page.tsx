import type { Metadata } from "next";
import { ServiceView } from "@/components/service/ServiceView";
import { getService } from "@/content/services";
import { pageMeta } from "@/lib/seo";

const service = getService("games");

export const metadata: Metadata = pageMeta({
  title: service.seoTitle,
  description: service.seoDescription,
  path: service.path,
});

export default function Page() {
  return <ServiceView service={service} />;
}
