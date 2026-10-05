import type { Metadata } from "next";
import { NetworkDiagram } from "@/components/graphics/NetworkDiagram";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Network services",
  description:
    "CyroHost network services cover IP transit, BGP, and IP leasing as enquiries, plus the published Network India route map.",
  path: "/network",
});

export default function NetworkPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Network" }]} />
      <div className="grid items-end gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="kicker">Labs</p>
          <h1 className="mt-4 text-4xl tracking-tight sm:text-6xl">Network, described as an enquiry.</h1>
          <p className="lede mt-5">
            Transit, BGP sessions, and address leases are for operators and hosting businesses. The public artifact is a map, not a rate card, and it is not a claim that CyroHost owns fibre or an autonomous system.
          </p>
        </div>
        <div className="frame frame-ticks p-4">
          <NetworkDiagram />
        </div>
      </div>
      <div className="grid gap-6 border-t border-line py-12 md:grid-cols-3">
        {[
          ["/labs/ip-transit", "IP transit", "Bandwidth, location, and address family. No published commit or upstream name."],
          ["/labs/bgp", "BGP", "ASN, prefixes, and where the session should land. No published CyroHost ASN."],
          ["/labs/ip-leasing", "IP leasing", "Prefix length and term. Pool size is not listed."],
        ].map(([href, title, body]) => (
          <article key={href} className="border border-line p-5">
            <h2 className="text-xl">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            <a href={href} className="mt-4 inline-block text-sm text-cyan">
              Read the service
            </a>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 pb-8">
        <ButtonLink href="/contact">Talk to sales</ButtonLink>
        <ButtonLink href="/edge/network-india" variant="secondary">
          Network India
        </ButtonLink>
      </div>
    </Container>
  );
}
