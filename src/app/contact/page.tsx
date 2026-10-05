import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { CopyEmail } from "@/components/contact/CopyEmail";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { links, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact sales",
  description:
    "Contact CyroHost about compute, network, colocation, or hosting. The form validates locally and only reports delivery when a webhook is configured.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="grid gap-12 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="kicker">Sales</p>
          <h1 className="mt-4 text-4xl tracking-tight sm:text-6xl">Tell us the workload.</h1>
          <p className="lede mt-5">
            Include the region, the size, and whether you need a server, a route, a rack, or a site. Payment is not collected here.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted">
            <li>
              Email <a className="text-ink" href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              WhatsApp{" "}
              <a className="text-ink" href={links.whatsappChat} target="_blank" rel="noopener noreferrer">
                {links.whatsappNumber}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              Client area{" "}
              <a className="text-ink" href="/client">
                Client area
              </a>
            </li>
            <li>
              Tickets{" "}
              <a className="text-ink" href={links.whatsapp} target="_blank" rel="noopener noreferrer">
                {links.whatsappNumber}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <p className="mt-6 text-sm leading-6 text-muted">
            Use this page for a new workload, a sales question, or a partnership. Billing, technical help, sponsorship, bug reports, and general questions belong on the{" "}
            <a className="text-ink" href="/support">support page</a>. Those buttons open WhatsApp. They do not file a ticket.
          </p>
          <div className="mt-6">
            <CopyEmail />
          </div>
        </div>
        <div className="border border-line p-5 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
