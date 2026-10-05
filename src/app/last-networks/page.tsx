import type { Metadata } from "next";
import { LastNetworks } from "@/components/networks/LastNetworks";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Last Networks",
  description:
    "A labelled world map of CyroHost locations. Singapore is published compute. Mumbai and Noida are map names. Other countries are on request or available on enquiry.",
  path: "/last-networks",
});

export default function LastNetworksPage() {
  return (
    <div className="joy-grid">
      <LastNetworks kicker="Last Networks" heading="h1" />
    </div>
  );
}
