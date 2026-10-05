import type { Metadata } from "next";
import { Bug, Handshake, MessageCircle, Receipt, Sparkles, Wrench } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { links, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

const categories = [
  {
    title: "General inquiry",
    body: "Questions about CyroHost, a service, or where to start.",
    icon: MessageCircle,
  },
  {
    title: "Purchase and billing",
    body: "Payments, invoices, and billing questions for an existing account.",
    icon: Receipt,
  },
  {
    title: "Sales and partnership",
    body: "Commercial enquiries and partnership conversations.",
    icon: Handshake,
  },
  {
    title: "Sponsorship and collaboration",
    body: "Sponsorship and collaboration proposals.",
    icon: Sparkles,
  },
  {
    title: "Technical support",
    body: "Technical issues and troubleshooting on a service you already use.",
    icon: Wrench,
  },
  {
    title: "Bug report",
    body: "Unexpected behaviour in a panel, site, or service.",
    icon: Bug,
  },
];

export const metadata: Metadata = pageMeta({
  title: "Support",
  description:
    "Message CyroHost on WhatsApp about a general question, billing, sales, sponsorship, technical help, or a bug report.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Support" }]} />
      <p className="kicker mt-8">Help</p>
      <h1 className="mt-4 max-w-3xl text-4xl tracking-tight text-balance sm:text-6xl">Support, sorted by the kind of question.</h1>
      <p className="lede mt-5 max-w-2xl">
        Each category opens WhatsApp with CyroHost. It does not create a ticket, choose a department, or confirm that a message was sent. Say which topic you need in the chat.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <article key={category.title} className="panel flex min-w-0 flex-col p-5">
              <Icon aria-hidden="true" className="size-5 text-cyan" />
              <h2 className="mt-4 text-lg">{category.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">{category.body}</p>
              <div className="mt-5">
                <ButtonLink href={links.whatsapp} external>
                  Open a ticket
                </ButtonLink>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <ButtonLink href={links.whatsapp} variant="secondary" external>
          WhatsApp {links.whatsappNumber}
        </ButtonLink>
        <ButtonLink href={`mailto:${site.email}`} variant="secondary">
          {site.email}
        </ButtonLink>
        <ButtonLink href="/client" variant="secondary">
          Client area
        </ButtonLink>
      </div>
    </Container>
  );
}
