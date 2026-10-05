import type { Metadata } from "next";
import { FacilitySchematic } from "@/components/graphics/FacilitySchematic";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { networkMapCities, networkMapSites } from "@/content/locations";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Network India",
  description:
    "Network India on the CyroHost site: named cities and sites from the published map, including Mumbai and Noida. A map label is not rack inventory.",
  path: "/edge/network-india",
});

export default function NetworkIndiaPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Edge", href: "/edge" }, { label: "Network India" }]} />
      <p className="kicker mt-8">Edge</p>
      <h1 className="mt-4 max-w-3xl text-4xl tracking-tight text-balance sm:text-6xl">Network India, read on this site.</h1>
      <p className="lede mt-5 max-w-2xl">
        The published map names cities and facilities. Those names are references for a conversation about routes and colocation. They are not a list of free cabinets.
      </p>
      <div className="frame frame-ticks mt-10 p-3 sm:p-6">
        <FacilitySchematic />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl tracking-tight">Cities</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {networkMapCities.map((city) => (
              <li key={city} className="border border-line px-3 py-2 text-sm">
                {city}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl tracking-tight">Named sites</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {networkMapSites.map((site) => (
              <li key={site}>{site}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/edge/colocation">Colocation enquiry</ButtonLink>
        <ButtonLink href="/labs" variant="secondary">
          Labs
        </ButtonLink>
      </div>
    </Container>
  );
}
