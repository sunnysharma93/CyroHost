export type DocSection = {
  heading: string;
  paragraphs: string[];
};

export type DocArticle = {
  slug: string;
  title: string;
  lede: string;
  sections: DocSection[];
  related: { label: string; href: string }[];
};

export const docs: DocArticle[] = [
  {
    slug: "ordering",
    title: "How ordering works",
    lede: "This website explains published services. It does not take payment, create an account, or file a ticket.",
    sections: [
      {
        heading: "What you can do here",
        paragraphs: [
          "Read the service pages, compare the prices that were published on 3 October 2026, and send a question by WhatsApp or the contact form.",
          "The client area is a layout for services, invoices, support, and account. Signing in does not check a password or create a session. Nothing on that page can be paid.",
        ],
      },
      {
        heading: "What still needs a person",
        paragraphs: [
          "VPS disk, memory, and monthly price are not on the public pages. Transit, BGP, address leasing, colocation, bare metal, and general website hosting are quoted.",
          "The contact form stores nothing unless a delivery webhook is configured. If it is not, the form says the message was not sent.",
        ],
      },
    ],
    related: [
      { label: "Published prices", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Client area", href: "/client" },
    ],
  },
  {
    slug: "regions",
    title: "Regions and place names",
    lede: "India and Singapore are the published compute regions. A city on the network map is not a VPS location you can select.",
    sections: [
      {
        heading: "Compute",
        paragraphs: [
          "VPS pages publish India as AMD and Intel lines, and Singapore as an Intel line. Germany is named on the VPS location list. The United States is marked on demand. Neither has a published plan table.",
          "Minecraft, Hytale, and FiveM name India, Singapore, and the United States on demand. Discord bot plans name India, Germany, and the United States. Singapore is not on that bot list.",
        ],
      },
      {
        heading: "The network map",
        paragraphs: [
          "Network India names Mumbai, Noida, and other sites. Those labels describe the map. They are not a statement that a cabinet is free or that a virtual server deploys in that city.",
        ],
      },
    ],
    related: [
      { label: "Locations", href: "/locations" },
      { label: "Network India", href: "/edge/network-india" },
      { label: "VPS", href: "/cloud/vps" },
    ],
  },
  {
    slug: "published-prices",
    title: "Published prices",
    lede: "Only figures printed on the public product pages are repeated here. They were copied on 3 October 2026 and should be confirmed before you pay.",
    sections: [
      {
        heading: "Listed",
        paragraphs: [
          "Minecraft starts at ₹80 per month in Singapore on an Intel Xeon E-2136, and ₹100 per month in India on an AMD EPYC 4464P.",
          "Hytale lists Initiate ₹1,000, Adventure ₹1,700, Champion ₹2,600, and Ascendant ₹4,000. The same page also says plans start from ₹100 per GB per month. Both statements are published. This site does not merge them into a new rate. The tier cards do not label a billing period.",
          "Discord bots: Starter ₹39 per month (1 GB RAM, 5 GB NVMe, 2 databases), Coder ₹59 (2 GB, 10 GB, 3 databases), Developer ₹110 (4 GB, 25 GB, 5 databases).",
        ],
      },
      {
        heading: "Not listed",
        paragraphs: [
          "General VPS, VDS, remote desktop, object storage, dedicated servers, FiveM, IP transit, BGP, IP leasing, colocation, and general website hosting have no public price table.",
          "The client portal timed out during research, so these figures were not rechecked in a live catalogue.",
        ],
      },
    ],
    related: [
      { label: "Price comparison", href: "/pricing" },
      { label: "Game servers", href: "/cloud/game-servers" },
      { label: "Discord bot plans", href: "/web/hosting#discord-bots" },
    ],
  },
  {
    slug: "support",
    title: "Support channels",
    lede: "Support buttons open WhatsApp. They do not create a ticket, choose a department, or confirm that a message arrived.",
    sections: [
      {
        heading: "WhatsApp",
        paragraphs: [
          "The number is +91 95288 39776. Ticket-style buttons use https://wa.me/919528839776 with no prefilled text. The floating chat button adds a short greeting.",
          "The support page groups questions into general inquiry, purchase and billing, sales and partnership, sponsorship, technical support, and bug report. Choosing a category still opens the same WhatsApp chat. The category is not sent.",
        ],
      },
      {
        heading: "Email and the form",
        paragraphs: [
          "Sales email is admin@cyrohost.com. The privacy address published on the official privacy page is cyrohost07@gmail.com.",
          "A public status hostname was not available when this site was built, so no live incident state is shown. For an outage, use WhatsApp or email.",
        ],
      },
    ],
    related: [
      { label: "Support", href: "/support" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    slug: "vps-details",
    title: "What the VPS pages actually say",
    lede: "Regions and processor families are published. Prices, disk sizes, memory, and operating system images are not.",
    sections: [
      {
        heading: "Published lines",
        paragraphs: [
          "India is described as AMD and Intel. The AMD page talks about desktop-class CPUs and single-thread performance. The Intel India page talks about server-grade CPUs. Singapore is described as server-grade Intel.",
          "Minecraft CPU names belong to those game cards. India Minecraft names an AMD EPYC 4464P. Singapore Minecraft names an Intel Xeon E-2136. Do not treat those chips as the specification of every VPS.",
        ],
      },
      {
        heading: "Confirm before you depend on it",
        paragraphs: [
          "No operating system list was published. Ask before you assume Windows or a particular Linux image.",
          "The panel host vps.cyrohost.com did not resolve on 3 October 2026. This site does not link to it.",
        ],
      },
    ],
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Game servers", href: "/cloud/game-servers" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
    ],
  },
  {
    slug: "network-enquiry",
    title: "What to include in a network enquiry",
    lede: "Transit, BGP, address leasing, and colocation are quoted. The useful message is the one that names the technical requirement.",
    sections: [
      {
        heading: "Transit and BGP",
        paragraphs: [
          "For transit, include the commit, the location, and whether you need IPv6. Providers and sizes are not listed on this site.",
          "For BGP, include your ASN, the prefixes you want to announce, and the site where the session should land.",
        ],
      },
      {
        heading: "Addresses and colocation",
        paragraphs: [
          "For IP leasing, include the prefix length and the term. Inventory is confirmed in the reply, not on the page.",
          "For colocation, include the hardware, the power draw, and whether you need a cross-connect or remote hands. A name on the Network India map is not available cabinet space.",
        ],
      },
    ],
    related: [
      { label: "IP transit", href: "/labs/ip-transit" },
      { label: "BGP", href: "/labs/bgp" },
      { label: "IP leasing", href: "/labs/ip-leasing" },
      { label: "Colocation", href: "/edge/colocation" },
    ],
  },
];

export function getDoc(slug: string) {
  return docs.find((article) => article.slug === slug);
}

const guideByService: Record<string, string> = {
  vps: "vps-details",
  games: "published-prices",
  hosting: "published-prices",
  labs: "network-enquiry",
  transit: "network-enquiry",
  bgp: "network-enquiry",
  leasing: "network-enquiry",
  edge: "network-enquiry",
  colocation: "network-enquiry",
  cloud: "ordering",
  web: "ordering",
  vds: "ordering",
  rdp: "ordering",
  storage: "ordering",
  dedicated: "ordering",
};

export function guideForService(id: string) {
  const slug = guideByService[id];
  return slug ? getDoc(slug) : undefined;
}
