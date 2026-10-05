import type { ServiceDocument } from "@/content/types";
import { Container } from "@/components/ui/Container";

const flows: Record<string, { title: string; note: string; steps: string[] }> = {
  vps: {
    title: "VPS enquiry",
    note: "Indicative sizes are on the pricing page. Final price and availability are confirmed before anything is deployed.",
    steps: ["Choose a listed size or describe a custom build", "Confirm region, operating system, and price", "Deployment is arranged with CyroHost, not on this page"],
  },
  vds: {
    title: "VDS enquiry",
    note: "No separate public catalogue is published for VDS.",
    steps: ["Describe the reserved resources you need", "Confirm whether a configuration is available", "Ordering stays with the CyroHost team"],
  },
  rdp: {
    title: "Remote desktop enquiry",
    note: "A Windows image list was not published. Availability is confirmed per request.",
    steps: ["Name the workload and the region", "Ask which desktop image applies", "Access details arrive only after confirmation"],
  },
  dedicated: {
    title: "Bare metal enquiry",
    note: "The Noida Platinum figure is a supplied reference. Treat it as unconfirmed until CyroHost replies.",
    steps: ["Share the processor, disk, and site you have in mind", "Confirm the monthly price and any setup fee", "Delivery is scheduled outside this website"],
  },
  storage: {
    title: "Storage enquiry",
    note: "S3 compatibility, redundancy, and price were not published.",
    steps: ["Describe the data and the region", "Ask which API and retention apply", "Capacity is quoted, not assumed"],
  },
  games: {
    title: "Game server order",
    note: "Minecraft, Hytale, and FiveM prices that are public stay on their page. FiveM remains quote-based.",
    steps: ["Read the published plan or request a quote", "Confirm the region and game", "Provisioning is not completed on this site"],
  },
  transit: {
    title: "Transit enquiry",
    note: "No ASN, upstream, or owned route is published.",
    steps: ["Name the commit and the site", "Ask which handoff is possible", "The reply confirms capacity"],
  },
  bgp: {
    title: "BGP enquiry",
    note: "Bring your ASN and prefixes. This page does not publish a CyroHost ASN.",
    steps: ["Share the ASN and prefix list", "Confirm the session location", "Filters and timing are agreed in the reply"],
  },
  leasing: {
    title: "Address lease enquiry",
    note: "Pool size is not listed. Prefix length and term are quoted.",
    steps: ["Name the prefix length and term", "Describe how the space will be announced", "Assignment is confirmed before use"],
  },
  colocation: {
    title: "Colocation enquiry",
    note: "Mumbai and Noida are map names. Space and power are confirmed before hardware ships.",
    steps: ["Share space, power, and the site", "Wait for a confirmation of the hall", "Ship hardware only after that reply"],
  },
  hosting: {
    title: "Web hosting enquiry",
    note: "Shared hosting has no public price table. Discord bot plans that are published stay separate.",
    steps: ["Describe the site or choose a published bot plan", "Confirm what is included", "This site does not provision the account"],
  },
  cloud: {
    title: "Cloud enquiry",
    note: "VPS sizes on the pricing page are indicative. VDS, RDP, storage, and bare metal are confirmed per request.",
    steps: ["Pick the service that matches the workload", "Confirm region, size, and price", "Nothing on this site provisions the server"],
  },
  labs: {
    title: "Network enquiry",
    note: "Transit, BGP, and address leases are quoted. No ASN or owned route is published.",
    steps: ["Name the commit, ASN, or prefix", "Name the site if you already know it", "Capacity is confirmed in the reply"],
  },
  edge: {
    title: "Edge enquiry",
    note: "Colocation is confirmed before hardware ships. Mumbai and Noida are map names.",
    steps: ["Share space, power, and the site", "Wait for confirmation of the hall", "Ship hardware only after that reply"],
  },
  web: {
    title: "Web enquiry",
    note: "Web hosting is scoped when a price table is missing. Published bot plans stay on the hosting page.",
    steps: ["Describe the site or the bot plan", "Confirm what is included", "Ordering stays off this page"],
  },
};

const groupFallback: Record<string, string> = {
  Cloud: "vps",
  Labs: "transit",
  Edge: "colocation",
  Web: "hosting",
};

export function ServiceFlow({ service }: { service: ServiceDocument }) {
  const flow = flows[service.id] ?? flows[groupFallback[service.group] ?? "vps"];

  return (
    <section className="border-t border-line" aria-label={flow.title}>
      <Container className="grid gap-6 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="kicker">Request path</p>
          <h2 className="mt-3 text-2xl tracking-tight">{flow.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{flow.note}</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {flow.steps.map((step, index) => (
            <li key={step} className="border border-line bg-panel p-4">
              <span className="font-mono text-xs tracking-[0.14em] text-violet">0{index + 1}</span>
              <p className="mt-3 text-sm leading-6">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
