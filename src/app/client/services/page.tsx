import type { Metadata } from "next";
import { ClientFrame } from "@/components/client/ClientFrame";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Services",
  description: "Service list inside the CyroHost client area. No live services are shown because sign-in is not connected.",
  path: "/client/services",
});

export default function ServicesPage() {
  return (
    <ClientFrame title="Services" lede="A signed-in account would list servers and plans here. None are loaded.">
      <div className="border border-line bg-panel p-6">
        <h2 className="text-xl">No services</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          This page does not read a control panel. Browse the public Cloud, Labs, Edge, and Web pages, or describe a workload to sales.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/cloud" variant="secondary">
            Cloud
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact
          </ButtonLink>
        </div>
      </div>
    </ClientFrame>
  );
}
