import type { Metadata } from "next";
import Link from "next/link";
import { ClientFrame } from "@/components/client/ClientFrame";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Client area",
  description: "CyroHost client area screens for services, invoices, support, and account details. Sign-in is not connected.",
  path: "/client",
});

const cards = [
  ["Services", "No servers or plans are attached, because there is no signed-in account.", "/client/services"],
  ["Invoices", "No invoices are listed. This screen does not take payment.", "/client/invoices"],
  ["Support", "Support opens a WhatsApp chat. It does not file a portal ticket.", "/client/tickets"],
  ["Account", "Profile fields are visible and are not saved.", "/client/account"],
];

export default function ClientHomePage() {
  return (
    <ClientFrame
      title="Client area"
      lede="These screens show how an account would be organised. They are not connected to billing, servers, or a login system."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(([title, body, href]) => (
          <article key={href} className="panel p-5">
            <h2 className="text-xl">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            <Link href={href} className="mt-4 inline-block text-sm text-cyan">
              Open {title.toLowerCase()}
            </Link>
          </article>
        ))}
      </div>
    </ClientFrame>
  );
}
