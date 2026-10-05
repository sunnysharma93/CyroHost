import type { Metadata } from "next";
import { networkMapCities, networkMapSites } from "@/content/locations";
import { LocationMap } from "@/components/infrastructure/LocationMap";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Infrastructure locations",
  description:
    "How CyroHost locations differ: India and Singapore for published compute, Germany and on-demand US on product pages, and Mumbai and Noida on the Network India map.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Locations" }]} />
      <p className="kicker mt-8">Geography</p>
      <h1 className="mt-4 max-w-3xl text-4xl tracking-tight sm:text-6xl">Global Infrastructure. Closer to Your Users.</h1>
      <p className="lede mt-5 max-w-2xl">
        Choose infrastructure based on your workload and target audience. India and Singapore are published compute regions. Mumbai and Noida are map names. The diagram below uses the same labels as the homepage globe. Nothing here is a live latency or capacity reading.
      </p>
      <div id="map" className="mt-10">
        <LocationMap />
      </div>
      <section className="mt-14 grid gap-10 border-t border-line py-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl tracking-tight">Cities on the Network India map</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {networkMapCities.map((city) => (
              <li key={city} className="border border-line px-3 py-2 text-sm">
                {city}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl tracking-tight">Sites named on that map</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {networkMapSites.map((site) => (
              <li key={site}>{site}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-muted">
            These names are copied from the published map. They are not a list of facilities with confirmed rack inventory.
          </p>
        </div>
      </section>
      <ButtonLink href="/edge/network-india">Network India</ButtonLink>
    </Container>
  );
}
