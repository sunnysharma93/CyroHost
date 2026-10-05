import type { Metadata } from "next";
import { ClientFrame } from "@/components/client/ClientFrame";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { links } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Support",
  description: "Client area support opens a WhatsApp chat with CyroHost. It does not create a ticket.",
  path: "/client/tickets",
});

export default function TicketsPage() {
  return (
    <ClientFrame title="Support" lede="Open a ticket starts a WhatsApp conversation. It does not create, number, or store a ticket.">
      <div className="border border-line bg-panel p-6">
        <h2 className="text-xl">No tickets on file</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          There is no ticket database behind this page. WhatsApp is {links.whatsappNumber}. Describe the issue in the chat.
        </p>
        <div className="mt-6">
          <ButtonLink href={links.whatsapp} external>
            Open a ticket
          </ButtonLink>
        </div>
      </div>
    </ClientFrame>
  );
}
