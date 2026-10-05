import type { ReactNode } from "react";
import { ClientNav } from "@/components/client/ClientNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";

export function ClientFrame({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-10">
      <Breadcrumbs
        items={title === "Client area" ? [{ label: "Client area" }] : [{ label: "Client area", href: "/client" }, { label: title }]}
      />
      <p className="kicker mt-8">Not connected</p>
      <h1 className="mt-4 max-w-3xl text-4xl tracking-tight text-balance sm:text-5xl">{title}</h1>
      <p className="lede mt-4 max-w-2xl">{lede}</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[200px_1fr]">
        <ClientNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
