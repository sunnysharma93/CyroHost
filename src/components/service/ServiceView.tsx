import Link from "next/link";
import { links, site } from "@/config/site";
import type { ServiceDocument } from "@/content/types";
import { StackDiagram } from "@/components/public/StackDiagram";
import { ServiceFlow } from "@/components/service/ServiceFlow";
import { guideForService } from "@/content/docs";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

function serviceDiagram(id: string) {
  if (id === "vps" || id === "cloud") {
    return {
      title: "A VPS request",
      note: "Configure VPS saves the size, region, and operating system you ask for. CyroHost reviews it. This page does not start a virtual machine.",
      steps: [
        { label: "Region", detail: "India or Singapore for published compute. Other places stay an enquiry." },
        { label: "Compute", detail: "vCPU and RAM from an indicative size. Confirm it before you rely on it." },
        { label: "Network", detail: "Transfer and port notes are on the pricing page. No live bandwidth graph is shown." },
        { label: "Storage", detail: "NVMe on the listed size. Extra disks are not a connected option here." },
      ],
    };
  }
  if (id === "vds" || id === "dedicated") {
    return {
      title: "A dedicated conversation",
      note: "The machine is scoped with the team. This page does not show live inventory.",
      steps: [
        { label: "Workload", detail: "What the machine has to run, and how private it needs to be." },
        { label: "Compute", detail: "A reserved or dedicated machine. Reference prices still need confirmation." },
        { label: "Network", detail: "Bandwidth and addresses are quoted. No CyroHost ASN is published." },
        { label: "Confirm", detail: "Price, site, and timing come back from CyroHost before anything is treated as available." },
      ],
    };
  }
  if (id === "storage") {
    return {
      title: "Storage is an enquiry",
      note: "Object storage is discussed. API compatibility, redundancy, and a per-gigabyte rate were not published.",
      steps: [
        { label: "Application", detail: "What you need to store, and which region you have in mind." },
        { label: "Object storage", detail: "Asked for. Not a connected bucket you can create here." },
        { label: "Volumes", detail: "Block volumes are not a connected product on this website." },
        { label: "Confirm", detail: "CyroHost says which API and redundancy apply, if any." },
      ],
    };
  }
  if (id === "rdp") {
    return {
      title: "A remote desktop enquiry",
      note: "No Windows image list was published, so none is shown.",
      steps: [
        { label: "Session", detail: "Who needs a desktop, and from where." },
        { label: "Host", detail: "The machine size is confirmed. It is not provisioned from this page." },
        { label: "Operating system", detail: "Windows is discussed. An image catalogue is not published." },
        { label: "Network", detail: "Access and the region are part of the same reply." },
      ],
    };
  }
  if (id === "games") {
    return {
      title: "A published game plan",
      note: "Minecraft, Hytale, and FiveM have public starting prices. Other titles are an enquiry.",
      steps: [
        { label: "Game", detail: "The title, and whether a public price already exists." },
        { label: "Region", detail: "India and Singapore are the published compute regions." },
        { label: "Plan", detail: "The listed starting price. Confirm it before you rely on it." },
        { label: "Host", detail: "CyroHost confirms the machine. This page does not start one." },
      ],
    };
  }
  if (id === "labs" || id === "transit" || id === "bgp" || id === "leasing") {
    return {
      title: "A network enquiry",
      note: "Transit, BGP, and address leases start from the details you already have. No ASN or owned fibre is claimed.",
      steps: [
        { label: "Your network", detail: "The commit, ASN, or prefix length you want to discuss." },
        { label: "Quote", detail: "CyroHost replies with what can be discussed. Pool size is not listed." },
        { label: "Session or prefix", detail: "A BGP session or an address lease, if one is agreed." },
        { label: "Confirm", detail: "Nothing on this page is a live route or a published capacity figure." },
      ],
    };
  }
  if (id === "edge" || id === "colocation") {
    return {
      title: "Colocation before hardware ships",
      note: "Mumbai and Noida are map names. They are not a statement that a cabinet is free.",
      steps: [
        { label: "Hardware", detail: "The equipment you would place. Do not ship it first." },
        { label: "Site", detail: "A named hall, if you have one in mind, from the Network India map." },
        { label: "Space and power", detail: "Asked for and confirmed. Not shown as available inventory." },
        { label: "Reply", detail: "CyroHost says whether that site can be discussed." },
      ],
    };
  }
  return {
    title: "A hosting enquiry",
    note: "Discord bot plans have published prices. Shared hosting does not have a public price table.",
    steps: [
      { label: "Site or bot", detail: "What you want hosted, and whether a published bot plan already fits." },
      { label: "Plan", detail: "Bot prices are published. Shared hosting is quoted." },
      { label: "Host", detail: "The machine is confirmed with CyroHost. This page does not deploy it." },
      { label: "Data", detail: "Disk on a bot plan is listed with that plan. Other storage is an enquiry." },
    ],
  };
}

const availabilityCopy: Record<ServiceDocument["availability"], string | null> = {
  published: null,
  enquiry:
    "CyroHost publishes this as a service you discuss before ordering. Figures and facilities that were not on the public pages are not filled in here.",
  unconfirmed:
    "No separate public catalogue was available for this service. Use the form to describe the requirement. Nothing on this page is a stocked plan.",
};

export function ServiceView({ service }: { service: ServiceDocument }) {
  const banner = availabilityCopy[service.availability];
  const guide = guideForService(service.id);
  const crumbs =
    service.path.split("/").filter(Boolean).length > 1
      ? [
          { label: service.group, href: groupHref(service.group) },
          { label: service.title },
        ]
      : [{ label: service.title }];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: service.group,
        item: `${site.url}${groupHref(service.group)}`,
      },
      { "@type": "ListItem", position: 3, name: service.title, item: `${site.url}${service.path}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="pt-8">
        <Breadcrumbs items={crumbs} />
        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="kicker">{service.kicker}</p>
            <h1 className="mt-4 max-w-3xl text-4xl tracking-tight text-balance sm:text-5xl lg:text-6xl">{service.title}</h1>
            <p className="lede mt-5 max-w-2xl">{service.lede}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href={service.primaryCta.href} external={service.primaryCta.external}>
              {service.primaryCta.label}
            </ButtonLink>
            {service.secondaryCta ? (
              <ButtonLink href={service.secondaryCta.href} variant="secondary" external={service.secondaryCta.external}>
                {service.secondaryCta.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
        <div className="pb-10">
          <StackDiagram {...serviceDiagram(service.id)} />
        </div>
        {banner ? <p className="mb-10 border border-line bg-panel px-4 py-3 text-sm leading-6 text-muted">{banner}</p> : null}
      </Container>
      <ServiceFlow service={service} />

      <section className="border-t border-line">
        <Container className="grid gap-12 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl tracking-tight">What it is</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{service.what}</p>
          </div>
          <div>
            <h2 className="text-2xl tracking-tight">Who it is for</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              {service.who.map((item) => (
                <li key={item} className="border-l border-cyan/40 pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">Capabilities</h2>
          <div className="mt-8 grid gap-px bg-line sm:grid-cols-3">
            {service.capabilities.map((item) => (
              <article key={item.title} className="bg-panel p-5">
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="grid gap-12 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl tracking-tight">Technical details</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              {service.technical.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl tracking-tight">Workloads</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              {service.workloads.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {service.products?.length ? (
        <section className="border-t border-line" id={service.id === "hosting" ? "discord-bots" : undefined}>
          <Container className="py-16">
            <h2 className="text-2xl tracking-tight">Published configurations</h2>
            {service.pricingNote ? <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{service.pricingNote}</p> : null}
            <div className="mt-8 space-y-8">
              {service.products.map((product) => (
                <article key={product.name} className="border border-line p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-xl">{product.name}</h3>
                    {product.sourceLabel ? <p className="text-sm text-muted">Published reference: {product.sourceLabel}</p> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{product.summary}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
                    {product.facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  {product.plans?.length ? (
                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {product.plans.map((plan) => (
                        <div key={plan.name} className="border border-line bg-panel p-4">
                          <h4 className="text-base">{plan.name}</h4>
                          <p className="mt-2 font-mono text-lg text-cyan">{plan.price}</p>
                          <p className="mt-2 text-sm leading-6 text-muted">{plan.summary}</p>
                          <ul className="mt-3 space-y-1 text-sm text-ink/90">
                            {plan.features.map((feature) => (
                              <li key={feature}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {service.links?.length ? (
        <section className="border-t border-line">
          <Container className="py-16">
            <h2 className="text-2xl tracking-tight">Related paths</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {service.links.map((item) => (
                <li key={item.href} className="py-4">
                  {item.external || item.href.startsWith("http") ? (
                    <a href={item.href} className="text-ink hover:text-cyan" target="_blank" rel="noopener noreferrer">
                      {item.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={item.href} className="text-ink hover:text-cyan">
                      {item.label}
                    </Link>
                  )}
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">Questions</h2>
          <div className="mt-6">
            <Accordion items={service.faqs} />
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="flex flex-col gap-6 py-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl tracking-tight">Next step</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              This site does not take payment or provision a server. Sign in to save a request, or describe the workload and CyroHost will say which service fits.
            </p>
            {guide ? (
              <p className="mt-4 text-sm">
                <Link href={`/docs/${guide.slug}`} className="text-cyan">
                  Guide: {guide.title}
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={service.primaryCta.href} external={service.primaryCta.external}>
              {service.primaryCta.label}
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact sales
            </ButtonLink>
            <ButtonLink href={links.whatsappChat} variant="secondary" external>
              WhatsApp
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-12">
          <h2 className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Related services</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {service.related.map((item) =>
              item.href.startsWith("http") ? (
                <li key={item.href}>
                  <a href={item.href} className="border border-line px-3 py-2 text-sm hover:border-cyan/50" target="_blank" rel="noopener noreferrer">
                    {item.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className="border border-line px-3 py-2 text-sm hover:border-cyan/50">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Container>
      </section>
    </>
  );
}

function groupHref(group: string) {
  if (group === "Cloud") return "/cloud";
  if (group === "Labs") return "/labs";
  if (group === "Edge") return "/edge";
  return "/web";
}
