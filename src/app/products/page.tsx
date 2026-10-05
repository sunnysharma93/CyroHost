import type { Metadata } from "next";
import Link from "next/link";
import { links } from "@/config/site";
import { StackDiagram } from "@/components/public/StackDiagram";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Products",
  description:
    "CyroHost compute, network, storage, and protection. Published, indicative, and enquiry-only services are labelled separately.",
  path: "/products",
});

const bands = [
  {
    kicker: "Compute",
    title: "Cloud VPS",
    body: "Virtual machines with CPU, memory, and disk. India and Singapore are the published compute regions. Nine indicative sizes are on the pricing page and must be confirmed. Configuring a VPS on this site saves a request. It does not provision a machine.",
    href: "/cloud/vps",
    cta: "Explore Cloud VPS",
    points: ["vCPU, RAM, and NVMe are listed per indicative size", "Operating system is confirmed with the team", "Regions other than India and Singapore are an enquiry"],
  },
  {
    kicker: "Compute",
    title: "Dedicated infrastructure",
    body: "A whole machine, discussed before it is treated as available. A Platinum-tier Noida figure on the pricing page is a reference price, not a confirmed live offer.",
    href: "/cloud/dedicated-servers",
    cta: "Explore dedicated servers",
    points: ["Scoped with the team", "No public instant-deploy inventory", "Colocation is a separate enquiry for your own hardware"],
  },
  {
    kicker: "Storage",
    title: "Object storage and volumes",
    body: "Object storage is an enquiry. API compatibility, redundancy, and price were not published. Block volumes are not a connected product on this website, so none are listed as available capacity.",
    href: "/cloud/storage",
    cta: "Storage enquiry",
    points: ["No published capacity or per-gigabyte rate", "Discord bot plans list their own disk separately", "A volume cannot be created from this page"],
  },
  {
    kicker: "Network",
    title: "Network and IP infrastructure",
    body: "IP transit, BGP sessions, and address leases start from the commit, ASN, or prefix you already have. CyroHost does not publish an ASN, an upstream list, or owned fibre.",
    href: "/labs/ip-transit",
    cta: "Explore network enquiries",
    points: ["Transit, BGP, and leases are quoted", "Pool size is not listed", "Bring the technical detail you already know"],
  },
  {
    kicker: "Edge",
    title: "CDN, load balancing, and DDoS protection",
    body: "Shield is named as network and DDoS protection. No mitigation size is published, so none is shown here. CDN and load balancing are not a connected service on this site.",
    href: "/contact",
    cta: "Talk to CyroHost",
    points: ["No published scrubbing capacity", "No live traffic graph", "Ask which protection applies to the service you want"],
  },
] as const;

export default function ProductsPage() {
  return (
    <div className="joy-grid">
      <Container className="py-16 sm:py-24">
        <p className="kicker">Products</p>
        <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h1 className="display max-w-3xl">Compute, network, and storage. Each one labelled.</h1>
          <p className="text-sm leading-7 text-muted">
            A service is either published, indicative, or an enquiry. This page does not add capacity, a mitigation size, or a price that CyroHost has not already stated.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/pricing">View plans</ButtonLink>
          <ButtonLink href={links.whatsappChat} variant="secondary" external>
            Talk to CyroHost
          </ButtonLink>
        </div>
      </Container>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-20">
          <h2 className="max-w-2xl text-3xl font-light tracking-tight">From the application to the infrastructure you ask for.</h2>
          <div className="mt-8">
            <StackDiagram
              title="Product path"
              note="Each step is a conversation or a published page. A later step is not implied to be already provisioned."
              steps={[
                { label: "Application", detail: "The workload: a site, API, game, or network." },
                { label: "Edge and network", detail: "Routing, addresses, and named protection. Quoted unless a page says otherwise." },
                { label: "Compute", detail: "VPS or a dedicated machine. Indicative sizes stay on the pricing page." },
                { label: "Storage", detail: "Object storage is an enquiry. Volumes are not connected here." },
              ]}
            />
          </div>
        </Container>
      </section>

      {bands.map((band, index) => (
        <section key={band.title} className="border-t border-line">
          <Container className={`grid items-center gap-10 py-16 lg:grid-cols-2 ${index % 2 === 1 ? "" : ""}`}>
            <div className={index % 2 === 1 ? "lg:order-2" : ""}>
              <p className="font-mono text-xs tracking-[0.16em] text-cyan uppercase">{band.kicker}</p>
              <h2 className="mt-3 text-3xl font-light tracking-tight">{band.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{band.body}</p>
              <Link href={band.href} className="mt-6 inline-flex min-h-11 items-center text-sm text-cyan">
                {band.cta}
              </Link>
            </div>
            <ol className={`border border-line bg-panel ${index % 2 === 1 ? "lg:order-1" : ""}`}>
              {band.points.map((point, step) => (
                <li key={point} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-t border-line px-5 py-5 first:border-t-0">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-violet">0{step + 1}</span>
                  <span className="text-sm leading-6 text-ink">{point}</span>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      ))}

      <section className="border-t border-line">
        <Container className="flex flex-col gap-6 py-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-light tracking-tight">Need a shape that is not listed?</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">Describe the workload. The contact form says so when a message is not delivered.</p>
          </div>
          <ButtonLink href="/enterprise">Talk to CyroHost</ButtonLink>
        </Container>
      </section>
    </div>
  );
}
