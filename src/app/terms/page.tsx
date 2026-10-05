import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { links } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms of service",
  description:
    "Summary of how this CyroHost marketing site should be used, with links to the controlling terms and refund policy on cyrohost.com.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Terms" }]} />
      <h1 className="mt-8 text-4xl tracking-tight sm:text-6xl">Terms of service</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7 text-muted">
        <p>
          The terms that govern CyroHost services are the terms published on the existing site. This page is a short guide to this marketing website. If the two differ, the published terms and refund policy control the service relationship.
        </p>
        <p>
          <a className="text-cyan" href={links.terms} target="_blank" rel="noopener noreferrer">
            Read the current terms
          </a>
          {" · "}
          <a className="text-cyan" href={links.refund} target="_blank" rel="noopener noreferrer">
            Read the refund policy
          </a>
        </p>
        <p>
          Those documents describe account responsibility, billing for services you actually buy, and prohibited uses such as attacks, spam, and unauthorised access. Fees and refunds are defined there, not on this page.
        </p>
        <p>
          This website does not sell services directly. Buttons that mention the client area leave this site. Do not send card numbers through the contact form.
        </p>
        <p>
          Product descriptions here are limited to what was public on 3 October 2026. A missing price means the price was not published, not that the service is free.
        </p>
      </div>
    </Container>
  );
}
