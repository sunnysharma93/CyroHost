import type { Metadata } from "next";
import { GlobeStage } from "@/components/home/GlobeStage";
import { InfrastructureMap } from "@/components/public/InfrastructureMap";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { links } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Global Infrastructure",
  description:
    "CyroHost location labels: India and Singapore for published compute, Mumbai and Noida on the Network India map, and illustrative pins where nothing is published.",
  path: "/global-infrastructure",
});

export default function GlobalInfrastructurePage() {
  return (
    <div className="joy-grid">
      <Container className="py-16 sm:py-24">
        <p className="kicker">Global infrastructure</p>
        <div className="mt-4 grid items-end gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h1 className="display max-w-xl">Infrastructure locations, labelled as they are.</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
              India and Singapore are published compute regions. Mumbai and Noida are Network India map names. Japan, the Netherlands, the United Kingdom, Canada, and New Zealand are enquiry locations. The United States is on demand. The globe is not a live network, a latency map, or proof of owned halls.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/locations">Location notes</ButtonLink>
              <ButtonLink href={links.whatsappChat} variant="secondary" external>
                Talk to CyroHost
              </ButtonLink>
            </div>
          </div>
          <GlobeStage />
        </div>
      </Container>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-20">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">01 · Topology</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.2rem)]">Select a place. Read only what is published.</h2>
          <div className="mt-8">
            <InfrastructureMap />
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="grid gap-6 py-16 sm:py-20 lg:grid-cols-3">
          <article className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-mint uppercase">Published compute</p>
            <h2 className="mt-3 text-2xl tracking-tight">India and Singapore</h2>
            <p className="mt-3 text-sm leading-6 text-muted">VPS pages name India as AMD and Intel lines, and Singapore as an Intel line. They do not name a city for the region.</p>
          </article>
          <article className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-orange uppercase">Network map</p>
            <h2 className="mt-3 text-2xl tracking-tight">Mumbai and Noida</h2>
            <p className="mt-3 text-sm leading-6 text-muted">The map names halls in those cities. That is not a VPS order city, and it is not confirmed cabinet inventory. A Noida bare-metal price on the pricing page still needs confirmation.</p>
          </article>
          <article className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-violet uppercase">On request</p>
            <h2 className="mt-3 text-2xl tracking-tight">Germany and the United States</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Germany is named on some product lists. The United States is on demand. Neither is an instant-deploy region on this site.</p>
          </article>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-cyan">02 · Hardware and protection</p>
            <h2 className="mt-4 text-3xl font-light tracking-tight">What is named, and what is not.</h2>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-muted">
              <li className="border-l-2 border-cyan pl-4">Dedicated compute is an enquiry. The pricing page holds a Platinum-tier Noida reference with a setup fee. Confirm both before treating them as an offer.</li>
              <li className="border-l-2 border-violet pl-4">Shield is named as network and DDoS protection. No mitigation size, and no statement that every port includes it, is published.</li>
              <li className="border-l-2 border-orange pl-4">CyroHost does not claim owned fibre, owned data centres, or an ASN. Colocation is space you ask about before shipping hardware.</li>
            </ul>
          </div>
          <div className="border border-line bg-panel p-6">
            <h2 className="text-xl tracking-tight">Next step</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Read the location notes, or send the region you need. Support is WhatsApp {links.whatsappNumber}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/pricing#bare-metal" variant="secondary">
                Bare metal note
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
