import type { Metadata } from "next";
import { StackDiagram } from "@/components/public/StackDiagram";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { links, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Enterprise",
  description:
    "Ask CyroHost about dedicated compute, network sessions, and colocation. No SLA, certification, or customer list is published.",
  path: "/enterprise",
});

export default function EnterprisePage() {
  return (
    <div className="joy-grid">
      <Container className="py-16 sm:py-24">
        <p className="kicker">Enterprise</p>
        <h1 className="display mt-4 max-w-3xl">A workload we have to quote.</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">
          Dedicated machines, transit, BGP, address leases, and colocation start as a description of what you need. This page does not list enterprise clients, certifications, response times, or a service-level agreement, because none of those were published.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact">Start an enquiry</ButtonLink>
          <ButtonLink href={links.whatsappChat} variant="secondary" external>
            WhatsApp
          </ButtonLink>
        </div>
      </Container>

      <section className="border-t border-line">
        <Container className="py-0">
          <div className="grid gap-px border-y border-line bg-line sm:grid-cols-2">
          <article className="min-h-64 bg-panel p-8 sm:p-10">
            <p className="font-mono text-xs tracking-[0.16em] text-cyan">Compute</p>
            <h2 className="mt-4 text-3xl font-light tracking-tight">Private compute</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">VDS and dedicated servers are enquiries. A Platinum-tier Noida price and setup fee are on the pricing page as a reference. Confirm them before you plan around them.</p>
          </article>
          <article className="min-h-64 bg-panel p-8 sm:p-10">
            <p className="font-mono text-xs tracking-[0.16em] text-cyan">Network</p>
            <h2 className="mt-4 text-3xl font-light tracking-tight">Network</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">Bring the commit, the ASN, or the prefix length. CyroHost has not published an ASN, an upstream list, or owned fibre. Shield is named without a mitigation size.</p>
          </article>
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-20">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">01 · Example architectures</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.2rem)]">Drawings of a conversation, not a design we already run for you.</h2>
          <div className="mt-8">
            <StackDiagram
              title="An enterprise conversation"
              note="A drawing of the questions CyroHost asks. It is not a deployed design, an SLA, or a customer architecture."
              steps={[
                { label: "Application", detail: "What must stay private, and which region you have in mind." },
                { label: "Network", detail: "Transit, BGP, or addresses you already hold. No CyroHost ASN is published." },
                { label: "Compute", detail: "VPS, VDS, or a dedicated machine. Confirm the reference price before you plan around it." },
                { label: "Storage", detail: "Backups and object storage are asked for. They are not a published fabric." },
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">02 · How an enquiry moves</p>
          <ol className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              "Describe the workload, region, and what must stay private.",
              "CyroHost says which service fits, and what is still unknown.",
              "Price, site, and timing are confirmed in that reply.",
              "This website does not migrate, provision, or take payment.",
            ].map((step, index) => (
              <li key={step} className="min-h-44 border border-line bg-panel p-6">
                <span className="font-mono text-xs text-violet">0{index + 1}</span>
                <p className="mt-4 text-base leading-7">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-3xl font-light tracking-tight">Operations, as published</h2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-muted">
              <li>Support is WhatsApp {links.whatsappNumber} and {site.email}.</li>
              <li>No uptime percentage, audit report, or on-call commitment is shown.</li>
              <li>Signing in opens the customer dashboard. It does not take payment or provision a server.</li>
            </ul>
          </div>
          <Accordion
            items={[
              {
                question: "Is there an enterprise SLA?",
                answer: "No service-level agreement is published on this site. Ask in the enquiry if a commitment is available for the service you want.",
              },
              {
                question: "Can you migrate an existing platform?",
                answer: "Describe the current host, the data, and the window. This page does not promise a migration.",
              },
              {
                question: "Where would hardware sit?",
                answer: "India and Singapore are published compute regions. Mumbai and Noida are map names. A specific hall is confirmed before colocation hardware ships.",
              },
            ]}
          />
        </Container>
      </section>
    </div>
  );
}
