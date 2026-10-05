import { links } from "@/config/site";
import type { ServiceDocument } from "@/content/types";

const contact: ServiceDocument["primaryCta"] = {
  label: "Contact sales",
  href: "/contact",
};

export const services = {
  cloud: {
    id: "cloud",
    path: "/cloud",
    group: "Cloud",
    kicker: "Compute",
    title: "Cloud infrastructure",
    lede: "Virtual servers, bare metal, game servers, and room to ask about storage or remote desktops. Only the details published by CyroHost are treated as available.",
    availability: "published",
    what: "CyroHost’s cloud category covers compute for production workloads, dedicated hardware, and gaming infrastructure. The public site also names Shield, a network and DDoS protection offer, without publishing capacity or price.",
    who: [
      "Teams hosting applications on a virtual server.",
      "Operators who want a physical machine instead of a shared virtual one.",
      "Communities running Minecraft, Hytale, or FiveM.",
    ],
    capabilities: [
      {
        title: "Regional VPS",
        body: "India is published with AMD and Intel lines. Singapore is published as an Intel line. Plan prices and disk sizes are not on those pages.",
      },
      {
        title: "Bare metal",
        body: "Dedicated servers are offered as an enquiry. No stock configurations or prices are listed.",
      },
      {
        title: "Game infrastructure",
        body: "Minecraft and Hytale pages publish starting prices and, for Hytale, four memory tiers. FiveM is quote-based.",
      },
    ],
    technical: [
      "Operating system images are not listed on the VPS pages, so image choice has to be confirmed at order time.",
      "CyroShield is described as infrastructure-level protection for applications, platforms, and gaming. Mitigation size is not stated.",
      "The client portal did not respond during research, so this page does not mirror a live catalogue.",
    ],
    workloads: [
      "Application and database hosting on a VPS.",
      "Single-tenant hardware for workloads that should not share a host.",
      "Game servers where a published plan or a quote fits.",
    ],
    links: [
      { label: "VPS", href: "/cloud/vps", description: "India and Singapore virtual servers." },
      { label: "VDS", href: "/cloud/vds", description: "Ask for a dedicated virtual allocation." },
      { label: "RDP", href: "/cloud/rdp", description: "Remote desktop enquiries." },
      { label: "Storage", href: "/cloud/storage", description: "Object storage enquiries." },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers", description: "Bare metal by enquiry." },
      { label: "Game servers", href: "/cloud/game-servers", description: "Minecraft, Hytale, and FiveM." },
    ],
    faqs: [
      {
        question: "Can I order cloud services on this website?",
        answer:
          "No. This site explains what is published and sends orders to the CyroHost client area or to sales. It does not take payment.",
      },
      {
        question: "Is every cloud product orderable today?",
        answer:
          "VPS, bare metal, and game servers appear on the public site. VDS, RDP, and S3-compatible storage did not have published specifications, so those pages are enquiries.",
      },
    ],
    primaryCta: { label: "Compare cloud services", href: "/cloud/vps" },
    secondaryCta: contact,
    related: [
      { label: "Locations", href: "/locations" },
      { label: "Network", href: "/network" },
      { label: "Web hosting", href: "/web/hosting" },
    ],
    seoTitle: "Cloud infrastructure",
    seoDescription:
      "CyroHost cloud services: India and Singapore VPS, bare metal enquiries, and published Minecraft, Hytale, and FiveM options.",
  },
  vps: {
    id: "vps",
    path: "/cloud/vps",
    group: "Cloud",
    kicker: "Virtual servers",
    title: "Virtual private servers",
    lede: "Isolated virtual machines for applications, games, and always-on workloads. Indicative sizes are on the pricing page and must be confirmed before you treat them as an offer.",
    availability: "enquiry",
    what: "A VPS is a virtual machine with its own operating system and allocated CPU, memory, and disk. CyroHost’s public VPS pages split the offer by region and processor family. Indicative monthly sizes on this site were supplied for the pricing page and are not a confirmed live catalogue.",
    who: [
      "Developers running a site, API, bot, or database.",
      "Teams that want a server in India or Singapore.",
      "Game communities that prefer a general VPS over a managed game panel.",
    ],
    capabilities: [
      {
        title: "India, two processor lines",
        body: "The India overview names AMD and Xeon. The AMD page describes desktop-class CPUs and single-thread performance. The Intel India page describes server-grade CPUs for multitasking.",
      },
      {
        title: "Singapore Intel",
        body: "The Singapore page describes reliable server-grade Intel CPUs for Minecraft, web hosting, databases, and always-on workloads.",
      },
      {
        title: "Other places, less specific",
        body: "Germany is named on the VPS location list. The United States is marked on demand. Neither has a published plan or deploy page.",
      },
    ],
    technical: [
      "Do not treat the Minecraft CPU names as the specification of every India or Singapore VPS. Minecraft India names an AMD EPYC 4464P. Minecraft Singapore names an Intel Xeon E-2136. The general VPS pages use broader AMD and Intel wording.",
      "The India AMD page and the EPYC name on the Minecraft page are different descriptions. They are not combined into one plan here.",
      "The pricing page notes Linux only on Nano, and Windows Server on the other listed sizes, subject to actual availability. That note still has to be confirmed.",
      "The separate host vps.cyrohost.com did not resolve when this site was built. Sign in and use Configure VPS to save a request. It does not provision a machine.",
    ],
    workloads: [
      "Web applications and small databases.",
      "Development and staging servers.",
      "Game servers and plugins where a general VPS is enough.",
      "Always-on tools that need a persistent machine.",
    ],
    products: [
      {
        name: "India VPS",
        summary: "Published as AMD and Intel options, with separate pages for each line.",
        sourceHref: links.vpsIndia,
        sourceLabel: "India VPS page",
        facts: [
          "Overview copy names AMD and Xeon.",
          "AMD page: desktop-class CPUs, single-thread performance, Minecraft called out.",
          "Intel page: server-grade CPUs for Minecraft, web hosting, databases, and always-on work.",
          "Indicative sizes for this region are on the pricing page. Confirm them before ordering.",
        ],
      },
      {
        name: "Singapore VPS",
        summary: "Published as an Intel line for Asia-Pacific reach.",
        sourceHref: links.vpsSingapore,
        sourceLabel: "Singapore VPS page",
        facts: [
          "Described as server-grade Intel CPUs.",
          "Positioned for Minecraft, web hosting, databases, and always-on workloads.",
          "Indicative sizes for this region are on the pricing page. Confirm them before ordering.",
        ],
      },
    ],
    pricingNote:
      "Indicative VPS sizes are on the pricing page. They were supplied as reference figures and must be confirmed. Minecraft starting prices are a different product.",
    links: [
      { label: "Pricing", href: "/pricing#cloud-vps", description: "Indicative VPS sizes. Confirm availability and the final price." },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers", description: "Physical machines, scoped with sales." },
      { label: "Locations", href: "/locations", description: "How India and Singapore differ from the network map." },
      { label: "Customer dashboard", href: "/dashboard/servers", description: "Sign in to save a VPS request. It does not provision a machine." },
    ],
    faqs: [
      {
        question: "Which operating systems are available?",
        answer:
          "The pricing page says Nano is Linux only, and that Windows Server may be available on the other listed sizes. Confirm the image before you rely on it.",
      },
      {
        question: "Is India the same thing as Mumbai or Noida?",
        answer:
          "No. Compute pages say India. Mumbai and Noida appear on the Network India map, which is a network visualization, not a VPS city picker.",
      },
      {
        question: "Where do I manage a server?",
        answer:
          "Sign in and open Configure VPS. That saves a request for the team. It does not provision a machine. The separate host vps.cyrohost.com did not resolve when this site was built.",
      },
    ],
    primaryCta: { label: "Configure VPS", href: "/dashboard/servers" },
    secondaryCta: { label: "View indicative prices", href: "/pricing#cloud-vps" },
    related: [
      { label: "Game servers", href: "/cloud/game-servers" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
      { label: "Locations", href: "/locations" },
    ],
    seoTitle: "VPS hosting in India and Singapore",
    seoDescription:
      "CyroHost VPS pages name India AMD and Intel lines and a Singapore Intel line. Indicative sizes are on the pricing page and must be confirmed.",
  },
  vds: {
    id: "vds",
    path: "/cloud/vds",
    group: "Cloud",
    kicker: "Dedicated virtual resources",
    title: "Virtual dedicated servers",
    lede: "A VDS usually means virtual hardware with reserved CPU and memory. CyroHost has not published a separate VDS catalogue.",
    availability: "unconfirmed",
    what: "On many platforms a virtual dedicated server keeps CPU, memory, and sometimes disk reserved for one customer, instead of bursting on a crowded host. That model was not documented as its own CyroHost product. The public compute offers are VPS lines and bare-metal enquiries.",
    who: [
      "Teams that need a predictable CPU allocation and want to know whether a VPS or a physical server is the closer fit.",
      "Anyone comparing a reserved virtual machine with bare metal.",
    ],
    capabilities: [
      {
        title: "Tell us the reservation",
        body: "Include cores, memory, storage, region, and whether the allocation must be pinned. Sales can say whether a published VPS line covers it or whether bare metal is the right enquiry.",
      },
      {
        title: "No invented configurations",
        body: "This page does not list cores, clocks, or prices, because none were published for a VDS product.",
      },
    ],
    technical: [
      "No VDS order URL, operating system list, or region limitation was found.",
      "India and Singapore remain the published VPS regions if a virtual server is the right shape.",
    ],
    workloads: [
      "Databases that suffer when CPU is shared.",
      "Build systems and game processes that need a stable allocation.",
      "Staging environments that should behave like a fixed-size machine.",
    ],
    faqs: [
      {
        question: "Is a CyroHost VDS the same as the India or Singapore VPS?",
        answer:
          "Not based on anything published. Use the VPS pages for virtual servers that exist in public, and this form if you specifically need reserved resources.",
      },
      {
        question: "Should I look at bare metal instead?",
        answer:
          "If you need a physical machine and can wait for a configuration quote, the dedicated server page is the published path.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "See published VPS lines", href: "/cloud/vps" },
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
    ],
    seoTitle: "Virtual dedicated server enquiries",
    seoDescription:
      "CyroHost has not published a separate VDS catalogue. Send reserved CPU, memory, storage, and region requirements for a matched quote.",
  },
  rdp: {
    id: "rdp",
    path: "/cloud/rdp",
    group: "Cloud",
    kicker: "Remote desktop",
    title: "Remote desktop servers",
    lede: "Remote desktop hosting is for people who need a Windows or graphical session on a server. CyroHost has not published an RDP plan.",
    availability: "unconfirmed",
    what: "Remote Desktop Protocol access is a way to use a full desktop on a remote machine. No CyroHost page lists RDP plans, Windows versions, user counts, or GPU options. A remote desktop may or may not be available on a VPS once an operating system is confirmed.",
    who: [
      "Teams that need a hosted Windows desktop for software that does not run headless.",
      "Operators who want to know whether a standard VPS can be used as a remote workstation.",
    ],
    capabilities: [
      {
        title: "What to include",
        body: "User count, region, Windows version if you need one, memory, and whether the desktop is for office work, browsing, or a specific application.",
      },
      {
        title: "What is not claimed",
        body: "This site does not claim Windows Server images, GPU passthrough, or Microsoft licensing. Those have to be confirmed.",
      },
    ],
    technical: [
      "No RDP port profile, license model, or snapshot policy was published.",
      "Game server pages are not remote desktop products.",
    ],
    workloads: [
      "Hosted desktops for a small team.",
      "Windows-only line-of-business software.",
      "A graphical admin session on a virtual server, if the image supports it.",
    ],
    faqs: [
      {
        question: "Do VPS plans include Windows?",
        answer:
          "The public VPS pages do not say. Ask before you assume a Windows image or an RDP seat is included.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "Review VPS regions", href: "/cloud/vps" },
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
    ],
    seoTitle: "Remote desktop hosting enquiries",
    seoDescription:
      "CyroHost has not published RDP plans or Windows images. Send user count, region, and desktop requirements for a confirmation.",
  },
  storage: {
    id: "storage",
    path: "/cloud/storage",
    group: "Cloud",
    kicker: "Object storage",
    title: "S3-compatible storage",
    lede: "Object storage for backups, media, and application data. CyroHost has not published API compatibility, capacity, or storage prices.",
    availability: "unconfirmed",
    what: "S3-compatible storage usually means an object API that applications can call with the same style of keys, buckets, and signed requests as Amazon S3. The CyroHost pages retrieved for this site do not document an object-storage endpoint, region, durability figure, or price per gigabyte. Until that exists, storage is an enquiry, not a product page with a buy button.",
    who: [
      "Applications that need a bucket for uploads or backups.",
      "Teams comparing object storage with disk on a VPS.",
    ],
    capabilities: [
      {
        title: "Ask for the interface",
        body: "Say whether you need an S3-style API, a region, a monthly capacity, and public or private buckets. Compatibility should be answered from the product, not assumed.",
      },
      {
        title: "Disk on a server is different",
        body: "VPS and game plans that mention storage are local disk on a server. That is not the same as shared object storage.",
      },
    ],
    technical: [
      "No endpoint hostname, signature version, or egress price was published.",
      "Hytale and Discord plans list NVMe or generic storage sizes for those servers only.",
    ],
    workloads: [
      "Off-server backups.",
      "Media libraries and user uploads.",
      "Build artifacts, if an S3-style API is confirmed.",
    ],
    faqs: [
      {
        question: "Is the storage API compatible with S3 tools?",
        answer:
          "That was not published. Do not point an S3 client at CyroHost until support confirms the endpoint and signature.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "See server storage on game plans", href: "/cloud/game-servers" },
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
    ],
    seoTitle: "S3-compatible storage enquiries",
    seoDescription:
      "CyroHost has not published object storage capacity, pricing, or S3 API details. Send bucket, region, and capacity requirements.",
  },
  dedicated: {
    id: "dedicated",
    path: "/cloud/dedicated-servers",
    group: "Cloud",
    kicker: "Bare metal",
    title: "Dedicated servers",
    lede: "Physical machines for workloads that should not share a host. A Platinum-tier Noida figure is on the pricing page as a reference and still needs confirmation.",
    availability: "enquiry",
    what: "A dedicated server is a physical computer reserved for one customer. A supplied reference lists a Platinum-tier machine in Noida at ₹15,420 per month with a ₹1,927 setup fee. Treat that as unconfirmed until CyroHost replies. It is not a stocked catalogue.",
    who: [
      "Workloads that need a whole machine.",
      "Companies with data-residency requirements that want to discuss where hardware sits.",
      "Hosting providers that want backend machines without buying their own fleet.",
    ],
    capabilities: [
      {
        title: "Configuration by enquiry",
        body: "The published call to action is an enterprise enquiry, not a checkout. Describe CPU, memory, storage, region, and operating system needs.",
      },
      {
        title: "What the page does claim",
        body: "The bare metal page presents resources as dedicated, pricing as something you can discuss up front, and data as remaining the customer’s. It does not publish an uptime percentage or a hardware generation.",
      },
    ],
    technical: [
      "No operating system list is attached to bare metal. Confirm the image or whether you can bring your own installer.",
      "Location is not specified on the bare metal page. India and Singapore are published for VPS, not automatically for dedicated hardware.",
      "There is no public stock-keeping unit to order from this marketing site.",
    ],
    workloads: [
      "Databases and virtualization hosts.",
      "Game or voice platforms that outgrow a VPS.",
      "Compliance-sensitive systems that need a named physical server.",
    ],
    links: [
      {
        label: "Pricing",
        href: "/pricing#bare-metal",
        description: "The Noida Platinum reference price. Confirm it before ordering.",
      },
      {
        label: "VPS",
        href: "/cloud/vps",
        description: "The published virtual-server lines, if a physical machine is more than you need.",
      },
    ],
    faqs: [
      {
        question: "Can I order a specific CPU today?",
        answer:
          "Not from a public list. Send the configuration you want and CyroHost can say whether it is available.",
      },
      {
        question: "Does bare metal include DDoS protection?",
        answer:
          "Shield is a separate published protection offer. The bare metal page does not say protection is included or name a mitigation size.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "Dedicated enquiry", href: "/dashboard/dedicated" },
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Colocation", href: "/edge/colocation" },
      { label: "Game servers", href: "/cloud/game-servers" },
    ],
    seoTitle: "Dedicated and bare metal servers",
    seoDescription:
      "CyroHost bare metal stays an enquiry. A Noida Platinum reference price is on the pricing page and must be confirmed before it is treated as a live offer.",
  },
  games: {
    id: "games",
    path: "/cloud/game-servers",
    group: "Cloud",
    kicker: "Game infrastructure",
    title: "Game servers",
    lede: "Minecraft, Hytale, and FiveM are published gaming products. Prices below are the figures on those pages, not a live checkout.",
    availability: "published",
    what: "CyroHost sells game hosting alongside general cloud servers. Minecraft and Hytale have public starting prices. FiveM is positioned as high-performance infrastructure and is quoted rather than listed as a fixed plan. Shield is described separately as network and DDoS protection for gaming and other workloads, without a published capacity.",
    who: [
      "Minecraft communities that want an India or Singapore server.",
      "Groups planning a Hytale server and comparing the four published memory tiers.",
      "FiveM communities that need a custom quote.",
    ],
    capabilities: [
      {
        title: "Managed game plans where listed",
        body: "Hytale cards name RAM, a CPU percentage, disk, and a player range. Minecraft cards name a starting monthly price and a CPU, not a full plan matrix.",
      },
      {
        title: "General game VPS",
        body: "The homepage also points game communities at Game VPS and Shield. General VPS specifications are on the VPS page and are not the same as these game cards.",
      },
    ],
    technical: [
      "India, Singapore, and United States (on demand) are named on the Minecraft, Hytale, and FiveM location blocks.",
      "Player counts on Hytale cards are the ranges printed on the page, not a benchmark run for this website.",
      "The Hytale cards show a price and the page also says service starts from ₹100 per GB per month. Those two statements are both published; this site does not reconcile them into a new rate.",
      "No order endpoint on the Hytale or Minecraft cards resolved to a working store hostname during research. Use the client area or the original product page.",
    ],
    workloads: [
      "Modded and plugin Minecraft servers.",
      "Small SMP servers and larger Hytale communities within the printed player ranges.",
      "FiveM roleplay servers scoped through a quote.",
    ],
    products: [
      {
        name: "Minecraft",
        summary: "Two published starting points, split by region.",
        sourceHref: links.minecraft,
        sourceLabel: "Minecraft page",
        facts: [
          "India: starts at ₹100 per month. CPU named on the page: AMD EPYC 4464P. Described for mods, plugins, and players.",
          "Singapore: starts at ₹80 per month. CPU named on the page: Intel Xeon E-2136. Described for small SMPs and starter servers.",
          "Locations named: India, Singapore, and the United States on demand.",
        ],
      },
      {
        name: "Hytale",
        summary: "Four published tiers. Prices are printed on the cards without a separate billing-period label on each card.",
        sourceHref: links.hytale,
        sourceLabel: "Hytale page",
        facts: [
          "The page also says plans start from ₹100 per GB per month.",
          "Locations named: India, Singapore, and the United States on demand.",
        ],
        plans: [
          {
            name: "Initiate",
            price: "₹1,000.00",
            summary: "Published as the minimum for Hytale: basic servers and some modpacks.",
            features: ["4 GB RAM", "200% CPU", "40 GB storage", "10–20 players"],
          },
          {
            name: "Adventure",
            price: "₹1,700.00",
            summary: "Basic servers and some modpacks.",
            features: ["6 GB RAM", "300% CPU", "60 GB storage", "20–40 players"],
          },
          {
            name: "Champion",
            price: "₹2,600.00",
            summary: "Advanced servers and all modpacks.",
            features: ["8 GB RAM", "400% CPU", "80 GB storage", "40–70 players"],
          },
          {
            name: "Ascendant",
            price: "₹4,000.00",
            summary: "Advanced servers and all modpacks.",
            features: ["12 GB RAM", "600% CPU", "120 GB storage", "70–120 players"],
          },
        ],
      },
      {
        name: "FiveM",
        summary: "Quote-based GTA roleplay servers. No public price table.",
        sourceHref: links.fivem,
        sourceLabel: "FiveM page",
        facts: [
          "Described as high-performance infrastructure on CyroHost’s gaming network.",
          "Locations named: India, Singapore, and the United States on demand.",
          "Custom or on-demand servers use the enquiry form on that page.",
        ],
      },
    ],
    pricingNote:
      "Figures were taken from www.cyrohost.com on 3 October 2026. The client portal timed out, so they were not rechecked in a live catalogue. Confirm the current price before paying.",
    faqs: [
      {
        question: "Does every game server include DDoS protection?",
        answer:
          "The homepage describes gaming infrastructure as DDoS-protected and publishes Shield separately. Individual Minecraft, Hytale, and FiveM cards do not state a mitigation size. Ask which protection applies to the plan you order.",
      },
      {
        question: "Are these the same machines as the general VPS?",
        answer:
          "They are related products, not identical listings. CPU names on the Minecraft cards should not be copied onto every VPS plan.",
      },
    ],
    primaryCta: { label: "View published prices", href: "/pricing" },
    secondaryCta: contact,
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Web hosting", href: "/web/hosting" },
      { label: "Locations", href: "/locations" },
    ],
    seoTitle: "Minecraft, Hytale, and FiveM servers",
    seoDescription:
      "Published CyroHost game hosting: Minecraft from ₹80 or ₹100 per month, four Hytale tiers, and quote-based FiveM in India, Singapore, or on-demand US.",
  },
  labs: {
    id: "labs",
    path: "/labs",
    group: "Labs",
    kicker: "Network engineering",
    title: "Labs",
    lede: "IP transit, BGP, and address leasing for operators, hosts, and businesses. Specifications are confirmed per enquiry.",
    availability: "enquiry",
    what: "Labs is CyroHost’s networking category: upstream connectivity, route announcements, and IP address leasing. The public Network India site is a route and site map. It does not publish bandwidth commits, peer lists, ASNs, or prefix inventory.",
    who: [
      "Network operators bringing their own ASN.",
      "Hosting providers that need transit or addresses.",
      "Businesses with a routing requirement that a normal VPS network does not cover.",
    ],
    capabilities: [
      {
        title: "Transit",
        body: "Ask for bandwidth, locations, and whether you need a default route or a fuller table.",
      },
      {
        title: "BGP",
        body: "Bring the ASN, prefixes, and the sites where sessions should land.",
      },
      {
        title: "Addressing",
        body: "Describe the prefix length and term you need. Published pool sizes were not found.",
      },
    ],
    technical: [
      "No route, ASN, or peering relationship is promised on this site.",
      "Mumbai, Noida, and other cities on the Network India map are visualization sites, not automatic turn-up locations.",
    ],
    workloads: [
      "Upstream for a hosting network.",
      "Announcing customer or provider prefixes.",
      "Short or long leases of IPv4 space.",
    ],
    links: [
      { label: "IP transit", href: "/labs/ip-transit", description: "Bandwidth and upstream enquiries." },
      { label: "BGP", href: "/labs/bgp", description: "Sessions and announcements." },
      { label: "IP leasing", href: "/labs/ip-leasing", description: "Address allocation enquiries." },
      {
        label: "Network India map",
        href: "/edge/network-india",
        description: "The India site map, explained on this website.",
      },
    ],
    faqs: [
      {
        question: "Do I need my own ASN?",
        answer:
          "For BGP announcements, yes in the usual case. Transit for a single service can sometimes be delivered without your own ASN. Say which one you need and it can be confirmed.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "Network India", href: "/edge/network-india" },
    related: [
      { label: "Network", href: "/network" },
      { label: "Colocation", href: "/edge/colocation" },
      { label: "Locations", href: "/locations" },
    ],
    seoTitle: "IP transit, BGP, and IP leasing",
    seoDescription:
      "CyroHost Labs covers IP transit, BGP announcements, and IP leasing as technical enquiries. Capacity and peer lists are not published.",
  },
  transit: {
    id: "transit",
    path: "/labs/ip-transit",
    group: "Labs",
    kicker: "Upstream",
    title: "IP transit",
    lede: "Upstream connectivity for networks that need to reach the rest of the internet. Commit sizes and providers are quoted, not listed.",
    availability: "enquiry",
    what: "IP transit is bandwidth and routing from an upstream network so your prefixes, or a default route, can reach other networks. CyroHost has not published port speeds, commit levels, burst policy, or upstream names.",
    who: [
      "ISPs and hosting networks that need an upstream.",
      "Businesses connecting a rack or a routed subnet.",
    ],
    capabilities: [
      {
        title: "What to specify",
        body: "Commit in megabits or gigabits, whether you need burst, the city or facility, interface type if you know it, and IPv4, IPv6, or both.",
      },
      {
        title: "What stays unstated",
        body: "This page does not name upstream carriers, route counts, or a service-level percentage.",
      },
    ],
    technical: [
      "A transit quote is separate from the indicative VPS transfer amounts on the pricing page.",
      "If you will announce prefixes, use the BGP page as well so the session design is included.",
    ],
    workloads: [
      "Upstream for a small hosting ASN.",
      "Backup transit for an existing network.",
      "Connectivity delivered with colocation.",
    ],
    faqs: [
      {
        question: "Can you guarantee a path to a specific network?",
        answer:
          "No path, latency, or peer is promised here. If a destination matters, name it in the enquiry so it can be checked.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "See the network map", href: "/network" },
    related: [
      { label: "BGP", href: "/labs/bgp" },
      { label: "Colocation", href: "/edge/colocation" },
    ],
    seoTitle: "IP transit enquiries",
    seoDescription:
      "Request CyroHost IP transit with your bandwidth, location, and routing needs. Port speeds and upstream providers are not published.",
  },
  bgp: {
    id: "bgp",
    path: "/labs/bgp",
    group: "Labs",
    kicker: "Routing",
    title: "BGP services",
    lede: "Sessions for networks that announce their own prefixes. Bring an ASN and the routes you intend to advertise.",
    availability: "enquiry",
    what: "BGP is how autonomous systems exchange routes. A BGP service typically means a session where your ASN announces prefixes and receives a default route or a broader table. CyroHost has not published session limits, communities, RPKI policy, or accepted prefix sizes.",
    who: [
      "Operators with an ASN and provider-independent space.",
      "Hosting companies announcing customer prefixes.",
      "Teams that are not sure whether they need a full table or a default route.",
    ],
    capabilities: [
      {
        title: "Enquiry contents",
        body: "ASN, prefixes and their lengths, whether the space is leased or yours, IRR or RPKI status if you have it, and the facility or city for the session.",
      },
      {
        title: "Filtering",
        body: "Ask whether CyroHost filters on IRR, RPKI, or a prefix list. Do not assume a particular policy is already in place.",
      },
    ],
    technical: [
      "No CyroHost ASN is published on the pages reviewed for this site, so none is displayed here.",
      "Announcing addresses that you do not hold, or that are not covered by a lease, is not something this page can approve.",
    ],
    workloads: [
      "Primary or backup announcement of an IPv4 or IPv6 prefix.",
      "A session delivered with transit or with colocation.",
      "A routed subnet for a dedicated server, if that delivery model is confirmed.",
    ],
    faqs: [
      {
        question: "Can CyroHost announce prefixes for me if I do not have an ASN?",
        answer:
          "That has to be confirmed. Standard BGP announcements use your ASN. If you need CyroHost to originate routes, say so explicitly in the enquiry.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "IP leasing", href: "/labs/ip-leasing" },
    related: [
      { label: "IP transit", href: "/labs/ip-transit" },
      { label: "Network", href: "/network" },
    ],
    seoTitle: "BGP session and announcement enquiries",
    seoDescription:
      "Ask CyroHost about BGP sessions, prefix announcements, and default or full tables. ASNs, communities, and RPKI policy are confirmed per request.",
  },
  leasing: {
    id: "leasing",
    path: "/labs/ip-leasing",
    group: "Labs",
    kicker: "Addressing",
    title: "IP leasing",
    lede: "IPv4 space for networks that need addresses without buying a block on the transfer market. Inventory and terms are not published.",
    availability: "enquiry",
    what: "IP leasing is a term arrangement for address space. You describe the prefix length, how long you need it, and whether it must be announced via BGP. CyroHost has not published pool sizes, a price per address, justification rules, or which prefixes are free.",
    who: [
      "Hosting providers that need additional IPv4.",
      "Networks waiting on a transfer or an allocation.",
      "Services that need a small routed block in a specific region.",
    ],
    capabilities: [
      {
        title: "What to ask for",
        body: "Prefix length, quantity if you need several, term, region, and whether announcement support is required.",
      },
      {
        title: "What you will not see here",
        body: "No stock list, LOA template, or rental rate is invented on this page.",
      },
    ],
    technical: [
      "Leased space and space you already hold are different requests. Say which one applies.",
      "A lease does not by itself include transit or a BGP session unless that is part of the quote.",
    ],
    workloads: [
      "Additional addresses for a hosting platform.",
      "A temporary block during a renumber.",
      "A prefix to announce from a CyroHost session, if both are approved.",
    ],
    faqs: [
      {
        question: "How large a block can I lease?",
        answer:
          "That was not published. Request the size you need and expect a yes, no, or alternative.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "BGP services", href: "/labs/bgp" },
    related: [
      { label: "IP transit", href: "/labs/ip-transit" },
      { label: "Labs", href: "/labs" },
    ],
    seoTitle: "IPv4 leasing enquiries",
    seoDescription:
      "Request IPv4 leasing from CyroHost with prefix size, term, and announcement needs. Pool sizes and rental rates are not published.",
  },
  edge: {
    id: "edge",
    path: "/edge",
    group: "Edge",
    kicker: "Facilities and connectivity",
    title: "Edge",
    lede: "Colocation enquiries and the Network India map. A site drawn on the map is not the same as a rack you can order today.",
    availability: "enquiry",
    what: "Edge covers hardware placed in a facility and the connectivity around it. CyroHost publishes a Network India map with cities and named sites. It does not publish a colocation price card, power menu, or a statement that every mapped site is an operational CyroHost facility.",
    who: [
      "Companies placing their own servers in India.",
      "Networks that want a cross-connect or a session near a mapped city.",
    ],
    capabilities: [
      {
        title: "Colocation enquiries",
        body: "Cabinet or rack units, power draw, city preference, and remote-hands needs.",
      },
      {
        title: "Network India",
        body: "An interactive map of routes and named sites, including Mumbai and Noida.",
      },
    ],
    technical: [
      "Singapore appears on compute pages. It is not a pin on the India network map.",
      "No upcoming facility is marked operational on this website.",
    ],
    workloads: [
      "Customer-owned hardware with upstream or a cross-connect.",
      "A presence next to a published network site, if space is confirmed.",
    ],
    links: [
      { label: "Colocation", href: "/edge/colocation", description: "Hardware placement enquiries." },
      {
        label: "Network India",
        href: "/edge/network-india",
        description: "Cities and named sites, on this website.",
      },
      { label: "Locations", href: "/locations", description: "How regions differ by product." },
    ],
    faqs: [
      {
        question: "Is the Noida or Mumbai site live for colocation?",
        answer:
          "The map names sites in both areas. Availability of rack space, power, and cross-connects has to be confirmed. This site does not treat the map as an inventory.",
      },
    ],
    primaryCta: { label: "Discuss colocation", href: "/edge/colocation" },
    secondaryCta: { label: "Network India", href: "/edge/network-india" },
    related: [
      { label: "IP transit", href: "/labs/ip-transit" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
    ],
    seoTitle: "Edge infrastructure and Network India",
    seoDescription:
      "CyroHost edge services cover colocation enquiries and the Network India map of cities and named sites, including Mumbai and Noida.",
  },
  colocation: {
    id: "colocation",
    path: "/edge/colocation",
    group: "Edge",
    kicker: "Your hardware",
    title: "Colocation",
    lede: "Space, power, and connectivity for equipment you own. CyroHost has not published rack rates or a facility specification sheet.",
    availability: "enquiry",
    what: "Colocation means your hardware sits in a data centre and connects to a network. A useful quote needs the amount of space, the power draw, the city or site you prefer, and how you want to connect. None of those parameters are published as a menu. The Network India map names candidate sites. It does not state that cabinets are free at each one.",
    who: [
      "Teams deploying their own servers or network gear.",
      "Providers that want a footprint in a city shown on the India map.",
    ],
    capabilities: [
      {
        title: "Hardware deployment",
        body: "Describe the devices, whether you need remote hands, and how equipment will arrive.",
      },
      {
        title: "Power and space",
        body: "Ask for rack units or a cabinet, and state the power draw. Amperage and redundancy are part of the quote, not a default.",
      },
      {
        title: "Connectivity",
        body: "Cross-connects, transit, and BGP can be requested with the space. They are separate services until a quote joins them.",
      },
    ],
    technical: [
      "Named map sites include Sify and Yotta in Noida, several Mumbai facilities, and sites in Delhi NCR, Lucknow, Indore, Nagpur, Kolkata, Bhubaneswar, Chennai, and Dhaka.",
      "Being named on the map is not confirmation of CyroHost cage inventory.",
      "No planned facility is described as open on this page.",
    ],
    workloads: [
      "A partial rack for a small cluster.",
      "Network gear that needs to sit near an existing site.",
      "Hardware that must stay in India for residency reasons, once the facility is confirmed.",
    ],
    faqs: [
      {
        question: "Which facility should I choose?",
        answer:
          "Start from the city and the networks you need to reach. Sales can say which named sites, if any, can take the deployment.",
      },
      {
        question: "Is remote hands included?",
        answer:
          "It was not published. Include it in the enquiry if you need someone on site to rack, cable, or power-cycle equipment.",
      },
    ],
    primaryCta: contact,
    secondaryCta: { label: "Network India", href: "/edge/network-india" },
    related: [
      { label: "Edge", href: "/edge" },
      { label: "IP transit", href: "/labs/ip-transit" },
      { label: "Dedicated servers", href: "/cloud/dedicated-servers" },
    ],
    seoTitle: "Colocation enquiries",
    seoDescription:
      "Ask CyroHost about colocation space, power, and connectivity. Facility names come from the Network India map and are not a live rack inventory.",
  },
  web: {
    id: "web",
    path: "/web",
    group: "Web",
    kicker: "Sites and applications",
    title: "Web",
    lede: "Hosting for websites and small applications. A public web-hosting price table was not available. Discord bot plans were.",
    availability: "published",
    what: "The CyroHost homepage lists web hosting and managed systems for businesses, built on CyroHost cloud. The linked web hosting page returned 404, and the client portal did not respond, so no shared-hosting feature table is repeated here. Discord bot hosting is a published application plan with memory, disk, and database counts.",
    who: [
      "People launching a business site who need to know which plan actually exists.",
      "Developers hosting a Discord bot on a small always-on instance.",
    ],
    capabilities: [
      {
        title: "Website hosting",
        body: "Describe the site, the stack, and whether you need email or a control panel. Those details were not on a public plan.",
      },
      {
        title: "Discord bots",
        body: "Three published tiers, from ₹39 to ₹110 per month, with RAM, NVMe, and database counts.",
      },
    ],
    technical: [
      "A VPS remains the published path when you need a full server rather than a bot plan.",
      "Managed systems for businesses are named on the homepage and not specified further.",
    ],
    workloads: [
      "Brochure and business websites.",
      "Discord bots and small persistent processes.",
      "Web apps that belong on a VPS once the requirements are clear.",
    ],
    links: [
      { label: "Web hosting", href: "/web/hosting", description: "Sites, panels, and bot plans." },
      { label: "VPS", href: "/cloud/vps", description: "When the project needs a full server." },
    ],
    faqs: [
      {
        question: "Where do I buy web hosting?",
        answer:
          "There is no working public plan URL for general web hosting. Use the client area or the contact form. Discord bot checkout was linked to a hostname that did not resolve, so that purchase also goes through the client area or the original product page.",
      },
    ],
    primaryCta: { label: "Review hosting", href: "/web/hosting" },
    secondaryCta: contact,
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Support", href: "/support" },
    ],
    seoTitle: "Web and application hosting",
    seoDescription:
      "CyroHost web hosting plans were not published. Discord bot hosting lists three monthly tiers with RAM, NVMe, and databases.",
  },
  hosting: {
    id: "hosting",
    path: "/web/hosting",
    group: "Web",
    kicker: "Web hosting",
    title: "Website and application hosting",
    lede: "Shared website plans were not available to republish. Discord bot hosting has a public tier list you can check before you order.",
    availability: "published",
    what: "Website hosting on the current CyroHost navigation points at a page that returns 404. The homepage still names web hosting and managed business systems. Until a plan table is public, website projects are scoped by enquiry: the stack, traffic expectations, and whether you want a managed panel or a VPS. Discord bot hosting is the application product with published numbers.",
    who: [
      "Businesses that want a site hosted without assembling a server.",
      "Developers running a Discord bot who can use a small RAM and disk allocation.",
      "Teams that already know they need root access and should look at VPS instead.",
    ],
    capabilities: [
      {
        title: "Control panel",
        body: "No cPanel, DirectAdmin, or other panel is named on the pages that were retrieved. Ask which panel, if any, is included.",
      },
      {
        title: "Ordering",
        body: "Purchases belong in the client area. This marketing site does not collect card numbers.",
      },
    ],
    technical: [
      "Discord bot plans name India, Germany, and the United States as data centre locations. Singapore is not on that list.",
      "The published checkout host i.cyro.host did not resolve. The product page on www.cyrohost.com is the stable public reference.",
    ],
    workloads: [
      "Company and campaign websites.",
      "Bots and small workers on the Discord plans.",
      "Applications that should move to a VPS when they need SSH, custom ports, or more disk.",
    ],
    products: [
      {
        name: "Discord bot hosting",
        summary: "Three monthly plans published on the Discord hosting page.",
        sourceHref: links.discordBots,
        sourceLabel: "Discord hosting page",
        facts: [
          "Locations named on that page: India, Germany, and the United States.",
          "Each plan lists RAM, NVMe SSD, and a database count.",
        ],
        plans: [
          {
            name: "Starter",
            price: "₹39/m",
            summary: "Described for small businesses and startups.",
            features: ["1 GB RAM", "5 GB NVMe SSD", "2 databases"],
          },
          {
            name: "Coder",
            price: "₹59/m",
            summary: "Described for growing businesses.",
            features: ["2 GB RAM", "10 GB NVMe SSD", "3 databases"],
          },
          {
            name: "Developer",
            price: "₹110/m",
            summary: "Described as the largest of the three published bot plans.",
            features: ["4 GB RAM", "25 GB NVMe SSD", "5 databases"],
          },
        ],
      },
    ],
    pricingNote:
      "Bot plan prices were published on www.cyrohost.com on 3 October 2026. General website-hosting prices were not. Confirm bot pricing in the client area before you pay.",
    faqs: [
      {
        question: "Do you offer cPanel hosting?",
        answer:
          "A control panel was not named on the public web hosting material, and that page currently 404s. Ask for the panel and the limits you need.",
      },
      {
        question: "Can I host a normal website on a Discord plan?",
        answer:
          "Those plans are published as bot hosting with a small disk and database count. A public website usually belongs on a web-hosting enquiry or a VPS.",
      },
    ],
    primaryCta: { label: "View bot prices", href: "/pricing" },
    secondaryCta: contact,
    related: [
      { label: "VPS", href: "/cloud/vps" },
      { label: "Support", href: "/support" },
      { label: "Contact", href: "/contact" },
    ],
    seoTitle: "Web hosting and Discord bot plans",
    seoDescription:
      "CyroHost website hosting plans were not published. Discord bot hosting lists Starter, Coder, and Developer tiers from ₹39 to ₹110 per month.",
  },
} satisfies Record<string, ServiceDocument>;

export function getService(id: keyof typeof services): ServiceDocument {
  return services[id];
}

export const serviceDocuments = Object.values(services);

