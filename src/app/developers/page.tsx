import type { Metadata } from "next";
import Link from "next/link";
import { CodeSample } from "@/components/developers/CodeSample";
import { StackDiagram } from "@/components/public/StackDiagram";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Developers",
  description:
    "The only HTTP endpoint on this CyroHost site is the contact form. Provisioning, tokens, and a public API are not published.",
  path: "/developers",
});

const requestExample = `POST /api/contact
Content-Type: application/json

{
  "name": "Asha Raman",
  "email": "asha@example.com",
  "organisation": "Northwind",
  "interest": "VPS",
  "message": "India region, 4 vCPU, 8 GB RAM. Please confirm availability and the final price.",
  "companyWebsite": ""
}`;

const responses = `200  { "delivered": true }
400  { "delivered": false, "error": "invalid_json" }
400  { "delivered": false, "error": "validation", "fields": { } }
502  { "delivered": false, "error": "upstream" }
503  { "delivered": false, "error": "not_configured", "message": "No delivery endpoint is configured. The enquiry was not sent." }`;

const illustrative = `# Illustrative only. This path does not exist.
# CyroHost has not published a provisioning API or an API token.

POST /vps
Authorization: Bearer <token>

{ "plan": "Small", "region": "India" }`;

export default function DevelopersPage() {
  return (
    <div className="joy-grid">
      <Container className="py-16 sm:py-24">
        <p className="kicker">Developers</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h1 className="display max-w-3xl">One endpoint on this site. No provisioning API.</h1>
          <p className="text-sm leading-7 text-muted">
            This website accepts a contact enquiry at <span className="font-mono text-ink">POST /api/contact</span>. It does not create servers, issue API tokens, or expose a catalogue API. Examples that are not that route are marked illustrative.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/docs">Explore developer resources</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact form
          </ButtonLink>
        </div>
        <div className="mt-12">
          <StackDiagram
            title="What a developer can call today"
            note="The only HTTP route on this website is the contact enquiry. A provisioning API, webhook for servers, and public token are not published."
            steps={[
              { label: "Application", detail: "Your service. This site does not deploy it." },
              { label: "POST /api/contact", detail: "Validated JSON. An empty honeypot. A configured webhook, or a 503." },
              { label: "CyroHost team", detail: "A person reads the enquiry. Delivery is not provisioning." },
              { label: "Compute, network, storage", detail: "Quoted or confirmed afterwards. No catalogue API is exposed here." },
            ]}
          />
        </div>
      </Container>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-20">
          <p className="font-mono text-xs tracking-[0.18em] text-cyan">01 · How a message moves</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,4vw,3.2rem)]">Form, validation, then a webhook — or a clear refusal.</h2>
          <ol className="mt-10 grid gap-px border border-line bg-line md:grid-cols-4">
            {[
              ["01", "Write it", "The contact form or a JSON body with the same fields."],
              ["02", "Check it", "Name, email, interest, and message are validated. The honeypot must stay empty."],
              ["03", "Deliver it", "A configured webhook can accept the payload. If none is set, nothing is sent."],
              ["04", "Say so", "200 means delivered. 503 means the enquiry was not sent."],
            ].map(([index, title, body]) => (
              <li key={index} className="min-h-52 bg-panel p-6 sm:p-8">
                <span className="font-mono text-xs text-violet">{index}</span>
                <p className="mt-4 text-2xl font-light tracking-tight">{title}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="grid gap-8 py-16 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="border border-line bg-panel p-4 lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">On this site</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#contact-api" className="text-cyan">POST /api/contact</a></li>
              <li><a href="#errors" className="text-cyan">Responses</a></li>
              <li><a href="#not-an-api" className="text-cyan">What is not published</a></li>
              <li><Link href="/docs" className="text-cyan">Guides</Link></li>
              <li><Link href="/products" className="text-cyan">Products</Link></li>
            </ul>
          </aside>
          <div className="min-w-0 space-y-12">
            <article id="contact-api">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-mint px-2 py-1 font-mono text-[11px] text-mint">POST</span>
                <span className="font-mono text-sm">/api/contact</span>
                <span className="border border-line px-2 py-1 font-mono text-[11px] text-muted">This website</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                Sends the same fields as the contact form. <span className="font-mono">companyWebsite</span> must stay empty. If <span className="font-mono">CONTACT_WEBHOOK_URL</span> is unset, the handler returns 503 and the enquiry is not sent.
              </p>
              <div className="mt-4">
                <CodeSample label="Request" code={requestExample} />
              </div>
            </article>
            <article id="errors">
              <h2 className="text-2xl tracking-tight">Responses</h2>
              <p className="mt-3 text-sm leading-6 text-muted">These are the statuses the route returns. A 200 means the configured webhook accepted the payload. It does not mean a server was provisioned.</p>
              <div className="mt-4">
                <CodeSample label="Status" code={responses} />
              </div>
            </article>
            <article id="not-an-api" className="border border-line bg-panel p-6">
              <h2 className="text-2xl tracking-tight">Not a public API</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                There is no published authentication scheme, scoped token, or endpoint for creating a VPS, reading invoices, or opening a ticket. The block below is a shape only. Calling it will not work.
              </p>
              <div className="mt-4">
                <CodeSample label="Illustrative · do not call" code={illustrative} />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                Guides cover ordering, regions, and published prices. Support stays on WhatsApp and the contact form.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link href="/docs/ordering" className="text-sm text-cyan">How ordering works</Link>
                <Link href="/support" className="text-sm text-cyan">Support</Link>
              </div>
            </article>
          </div>
        </Container>
      </section>
    </div>
  );
}
