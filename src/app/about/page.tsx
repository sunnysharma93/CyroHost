import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About CyroHost",
  description:
    "CyroHost is a cloud, networking, edge, and web infrastructure provider with published compute in India and Singapore and a Network India map.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "About" }]} />
      <p className="kicker mt-8">Company</p>
      <h1 className="mt-4 max-w-3xl text-4xl tracking-tight sm:text-6xl">Infrastructure across compute, network, edge, and web.</h1>
      <div className="mt-8 max-w-3xl space-y-4 text-sm leading-7 text-muted">
        <p>
          CyroHost describes itself as a platform for compute, storage, networking, web, and gaming workloads. The public site names virtual servers, bare metal, web hosting, managed business systems, Minecraft, Hytale, FiveM, and Shield.
        </p>
        <p>
          This website repeats only what those pages, and the Network India map, actually state. It does not add a founding date, a headcount, an uptime percentage, or a certification, because those were not published in the sources used to build it.
        </p>
        <p>
          A reseller programme is published separately and mentions a discount of up to 30 percent. Terms for that discount are not on this site.
        </p>
        <p>
          Support email is {site.email}. The privacy policy on the current marketing site also lists {site.privacyEmail} for privacy requests.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/contact">Contact sales</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Ask about reselling
        </ButtonLink>
      </div>
    </Container>
  );
}
