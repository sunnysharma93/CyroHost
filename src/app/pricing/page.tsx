import { InfrastructurePricing } from "@/components/pricing/InfrastructurePricing";
import { PriceBoard } from "@/components/pricing/PriceBoard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { links } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pricing built around your infrastructure",
  description:
    "Indicative CyroHost Cloud VPS and bare metal prices, plus previously published Minecraft, Hytale, and Discord bot figures. Final pricing is confirmed by the team.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="joy-grid">
    <Container className="py-16 sm:py-24">
      <Breadcrumbs items={[{ label: "Pricing" }]} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="kicker">Pricing</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,5.4vw,4.4rem)]">Pricing built around your infrastructure.</h1>
        </div>
        <p className="lede">
          Explore our VPS and dedicated server options. Tell us your requirements, and our team will help you choose the right configuration.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="#cloud-vps">See the sizes</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Ask for a quote
        </ButtonLink>
      </div>
      <div className="mt-16">
        <InfrastructurePricing />
      </div>
      <div className="mt-16 border-t border-line pt-12">
        <p className="kicker">Also published</p>
        <h2 className="mt-3 text-2xl font-light tracking-tight">Game and bot prices copied earlier</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Minecraft, Hytale, and Discord bot figures were copied on 3 October 2026. They are separate from the indicative VPS and bare metal cards above.
        </p>
        <div className="mt-8">
          <PriceBoard />
        </div>
      </div>
      <div className="mt-12 flex flex-wrap gap-3 border-t border-line py-10">
        <ButtonLink href="/contact">Ask about a quoted service</ButtonLink>
        <ButtonLink href={links.whatsapp} variant="secondary" external>
          WhatsApp {links.whatsappNumber}
        </ButtonLink>
        <ButtonLink href="/docs/published-prices" variant="secondary">
          Price notes
        </ButtonLink>
      </div>
    </Container>
    </div>
  );
}
