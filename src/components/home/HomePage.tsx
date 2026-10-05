import Link from "next/link";
import { links, site } from "@/config/site";
import { GlobeStage } from "@/components/home/GlobeStage";
import { JoyPipeline } from "@/components/home/JoyPipeline";
import { InfrastructureMap } from "@/components/public/InfrastructureMap";
import { StackDiagram } from "@/components/public/StackDiagram";
import { InfrastructurePricing } from "@/components/pricing/InfrastructurePricing";
import { LastNetworks } from "@/components/networks/LastNetworks";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

const catalogue = [
  { name: "VPS", status: "Indicative", note: "Nine sizes and a custom build are listed. Confirm availability and the final price.", href: "/pricing#cloud-vps", group: "Cloud" },
  { name: "VDS", status: "Enquiry", note: "No separate public catalogue.", href: "/cloud/vds", group: "Cloud" },
  { name: "RDP", status: "Enquiry", note: "No Windows image list was published.", href: "/cloud/rdp", group: "Cloud" },
  { name: "Dedicated servers", status: "Reference", note: "A Platinum-tier Noida figure is listed and still needs confirmation.", href: "/pricing#bare-metal", group: "Cloud" },
  { name: "S3 storage", status: "Enquiry", note: "API compatibility was not published.", href: "/cloud/storage", group: "Cloud" },
  { name: "Game servers", status: "Published", note: "Minecraft from ₹80/mo in Singapore and ₹100/mo in India.", href: "/cloud/game-servers", group: "Cloud" },
  { name: "IP transit", status: "Enquiry", note: "Commit and location are quoted.", href: "/labs/ip-transit", group: "Labs" },
  { name: "BGP services", status: "Enquiry", note: "ASN and prefixes are quoted. No published ASN.", href: "/labs/bgp", group: "Labs" },
  { name: "IP leasing", status: "Enquiry", note: "Prefix length and term. Pool size is not listed.", href: "/labs/ip-leasing", group: "Labs" },
  { name: "Colocation", status: "Enquiry", note: "Space and power are confirmed before hardware ships.", href: "/edge/colocation", group: "Edge" },
  { name: "Web hosting", status: "Enquiry", note: "No public shared-hosting price table.", href: "/web/hosting", group: "Web" },
  { name: "Discord bots", status: "Published", note: "Starter ₹39, Coder ₹59, Developer ₹110 per month.", href: "/web/hosting#discord-bots", group: "Web" },
];

const solutions = [
  { title: "Designed around the workload", body: "When a public plan does not fit, describe the size, region, and software. Nothing on this page invents a custom SKU." },
  { title: "Reaches the network you already run", body: "Transit, BGP, and address leases start from the details you bring. Routes on the map are a demo, not owned fibre." },
  { title: "Places named in India", body: "Mumbai and Noida are on the Network India map. India as a compute region does not name a city." },
  { title: "One site, published prices separated", body: "Minecraft, Hytale, and Discord bots have public figures. VPS and bare-metal figures on the pricing page are indicative and still need confirmation." },
];

export function HomePage() {
  return (
    <div className="joy-grid">
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:py-24">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-cyan uppercase">Cloud infrastructure</p>
            <h1 className="display mt-5 max-w-xl">Infrastructure built for what you build next.</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
              Compute, networking, and storage for developers and businesses. India and Singapore are the published compute regions. The globe is a labelled diagram, not owned fibre, owned halls, or a live network.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/global-infrastructure">Explore infrastructure</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Talk to CyroHost
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] tracking-[0.14em] text-muted uppercase">
              <li>Published compute: India, Singapore</li>
              <li>Map names: Mumbai, Noida</li>
              <li>Prices are confirmed before an order</li>
            </ul>
          </div>
          <GlobeStage />
        </Container>
      </section>

      <section id="layers" className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">01 · What we&apos;re building</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h2 className="display text-[clamp(2rem,4vw,3.4rem)]">One catalogue. Only the layers we can describe.</h2>
            <p className="text-sm leading-7 text-muted">
              Each row is a CyroHost category or a published note. Chips link onward only when a page exists. Missing capacity stays missing.
            </p>
          </div>
          <div className="mt-10 grid border border-line bg-panel sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Regions", "India and Singapore", "Published compute. Cities are not named for the VPS region."],
              ["Map", "Mumbai and Noida", "Network India names. Not an order form."],
              ["Prices", "Labelled, then confirmed", "Games and bots are published. VPS and bare metal figures are indicative."],
              ["Support", "WhatsApp and email", "No public status page was available."],
            ].map(([kicker, title, body]) => (
              <div key={kicker} className="border-b border-line p-5 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">{kicker}</p>
                <p className="mt-2 text-lg font-medium tracking-tight">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <StackDiagram
              title="How a workload is discussed"
              note="This is the path on this website. It does not provision a machine or publish capacity that has not been confirmed."
              steps={[
                { label: "Application", detail: "The site, API, game, or network you already run." },
                { label: "Region", detail: "India or Singapore for published compute. Other places are an enquiry." },
                { label: "Compute", detail: "VPS sizes are indicative. Dedicated machines are scoped with the team." },
                { label: "Network and storage", detail: "Transit, addresses, and object storage are quoted. Nothing here is a live fabric." },
              ]}
            />
          </div>
        </Container>
      </section>

      <section id="network" className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">02 · The network we describe</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 className="display text-[clamp(2rem,4vw,3.4rem)]">
              One map, <strong className="font-medium">edge to core</strong>, labelled honestly.
            </h2>
            <p className="text-sm leading-7 text-muted">
              Filled markers are published compute regions. Other markers are names from product pages or the Network India map, or demo pins for places with no public page. Nothing here is a live route.
            </p>
          </div>
          <div className="mt-10">
            <InfrastructureMap />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/locations" variant="secondary">
              Location notes
            </ButtonLink>
            <ButtonLink href="/edge/network-india" variant="secondary">
              Network India
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">03 · Behind an order</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)]">What actually happens when you ask.</h2>
          <div className="mt-8">
            <JoyPipeline />
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">04 · Services</p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h2 className="display max-w-2xl text-[clamp(2rem,4vw,3.4rem)]">Every service. One site.</h2>
            <div className="flex flex-col items-start gap-4">
              <p className="max-w-md text-sm leading-7 text-muted">
                Published means a public price or plan exists. Enquiry means the page explains the service and does not pretend it can be ordered here.
              </p>
              <ButtonLink href="/products" variant="secondary">
                More
              </ButtonLink>
            </div>
          </div>
          <ul className="mt-10 grid border border-line bg-panel sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.map((item) => (
              <li key={item.href} className="border-b border-line sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0">
                <Link href={item.href} className="block h-full min-h-44 p-6 transition-colors hover:bg-raised sm:p-7">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">{item.group}</span>
                  <span className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xl font-light tracking-tight">{item.name}</span>
                    <span className={`border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${item.status === "Published" ? "border-mint text-mint" : "border-line text-muted"}`}>
                      {item.status}
                    </span>
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-muted">{item.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="pricing" className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-cyan">05 · Pricing</p>
              <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)]">Indicative sizes. Confirmed before you order.</h2>
            </div>
            <ButtonLink href="/pricing">More</ButtonLink>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Three of the nine VPS sizes. The full board, custom build, and Noida bare metal are on the pricing page. These figures are indicative.
          </p>
          <div className="mt-10">
            <InfrastructurePricing preview />
          </div>
        </Container>
      </section>

      <LastNetworks kicker="06 · Last Networks" />

      <section className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">07 · Solutions</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)]">Tell us the problem. We say which service fits.</h2>
          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {solutions.map((item) => (
              <article key={item.title} className="bg-panel p-6">
                <h3 className="text-xl font-medium tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">08 · Questions</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)]">Short answers, with the limits attached.</h2>
          <div className="mt-8 max-w-3xl">
            <Accordion
              items={[
                {
                  question: "Where are the servers?",
                  answer:
                    "India and Singapore are published compute regions. Mumbai and Noida are names on the Network India map, not VPS cities. Germany is named on some lists. The United States is on demand. Other countries on the demo globe are not published.",
                },
                {
                  question: "What can I order on this website?",
                  answer:
                    "You can read published prices for Minecraft, Hytale, and Discord bots. This site does not take payment, create a session, or provision a server. Quoted services start with the contact form or WhatsApp.",
                },
                {
                  question: "Is there a live status page?",
                  answer:
                    "A public status page was not available, so this site does not show uptime or an all-clear badge. Support is WhatsApp +91 95288 39776 and admin@cyrohost.com.",
                },
                {
                  question: "Do you own the fibre and the data centres?",
                  answer:
                    "No such claim is published, and this page does not add one. Colocation and network services are enquiries. The globe is a labelled demo.",
                },
              ]}
            />
          </div>
          <div className="mt-16 border border-line bg-panel px-6 py-10 sm:px-10">
            <h2 className="display max-w-3xl text-[clamp(2rem,4vw,3.2rem)]">From a published price to a workload we have to quote.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              Write to {site.email} or message WhatsApp {links.whatsappNumber}. The contact form says so when a message is not delivered.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/pricing">See published prices</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact
              </ButtonLink>
              <ButtonLink href={links.whatsapp} variant="secondary" external>
                WhatsApp
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
