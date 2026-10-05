import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { links, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description:
    "How the CyroHost marketing site handles contact details, with a link to the full privacy policy published on cyrohost.com.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Privacy" }]} />
      <h1 className="mt-8 text-4xl tracking-tight sm:text-6xl">Privacy</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7 text-muted">
        <p>
          The privacy policy that covers CyroHost customer accounts is published on the existing website. Use that document for billing data, account credentials, and rights requests. This page explains the marketing site you are on now.
        </p>
        <p>
          <a className="text-cyan" href={links.privacy} target="_blank" rel="noopener noreferrer">
            Read the published privacy policy
          </a>
        </p>
        <p>
          If you use the contact form, the browser sends your name, email, organisation, selected service, and message to this site’s own API. Unless the operator has set a delivery webhook, that API refuses the message and does not store it. Do not put secrets or payment details in the form.
        </p>
        <p>
          The site does not run advertising pixels. Fonts are loaded from the application build. The optional 3D graphic is rendered in your browser and is not a camera or a tracker.
        </p>
        <p>
          Support mail for this site is {site.email}. The published privacy policy lists {site.privacyEmail} for privacy-rights requests.
        </p>
        <p>
          The published policy says services are not intended for anyone under 18, that personal information is not sold, and that people outside India remain responsible for their local privacy rules while CyroHost processes information under Indian law.
        </p>
      </div>
    </Container>
  );
}
