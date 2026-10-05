const WHATSAPP = "https://wa.me/919528839776?text=";

function enquire(message: string) {
  return `${WHATSAPP}${encodeURIComponent(message)}`;
}

const vpsPlans = [
  { name: "Nano", price: "₹604", cpu: "1", ram: "1 GB", disk: "48 GB", transfer: "5 TB", port: "1 Gbps", os: "Linux only" },
  { name: "Micro", price: "₹806", cpu: "2", ram: "2 GB", disk: "48 GB", transfer: "5 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "Small", price: "₹1,009", cpu: "2", ram: "4 GB", disk: "48 GB", transfer: "5 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "Medium", price: "₹1,590", cpu: "4", ram: "8 GB", disk: "48 GB", transfer: "2 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "Large", price: "₹2,168", cpu: "4", ram: "16 GB", disk: "48 GB", transfer: "10 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "XLarge", price: "₹2,554", cpu: "8", ram: "16 GB", disk: "48 GB", transfer: "10 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "2XLarge", price: "₹3,903", cpu: "8", ram: "32 GB", disk: "48 GB", transfer: "20 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "3XLarge", price: "₹4,867", cpu: "16", ram: "32 GB", disk: "48 GB", transfer: "20 TB", port: "10 Gbps", os: "Windows Server available" },
  { name: "4XLarge", price: "₹7,758", cpu: "32", ram: "64 GB", disk: "48 GB", transfer: "20 TB", port: "10 Gbps", os: "Windows Server available" },
] as const;

function PlanCard({
  name,
  price,
  rows,
  os,
  message,
}: {
  name: string;
  price: string;
  rows: { label: string; value: string }[];
  os: string;
  message: string;
}) {
  return (
    <article className="flex h-full flex-col bg-panel p-6 transition-colors hover:bg-raised sm:p-8">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">{name}</p>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-light tracking-tight text-ink sm:text-5xl">{price}</span>
        <span className="text-sm text-muted">/month</span>
      </p>
      <dl className="mt-5 flex-1 border-t border-line text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 border-b border-line py-2.5">
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-right text-ink">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-b border-line py-2.5">
          <dt className="text-muted">OS</dt>
          <dd className="text-right text-ink">{os}</dd>
        </div>
      </dl>
      <a
        href={enquire(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center justify-center bg-accent px-4 text-sm text-accent-ink hover:bg-[var(--accent-hover)]"
      >
        Enquire on WhatsApp
        <span className="sr-only"> about {name} (opens in a new tab)</span>
      </a>
    </article>
  );
}

export function InfrastructurePricing({ preview = false }: { preview?: boolean }) {
  const plans = preview ? vpsPlans.slice(0, 3) : vpsPlans;

  return (
    <div className="space-y-20">
      <section id={preview ? undefined : "cloud-vps"} aria-labelledby={preview ? undefined : "vps-heading"}>
        {preview ? null : (
          <>
            <p className="font-mono text-xs tracking-[0.18em] text-cyan">01 · Cloud VPS Plans</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h2 id="vps-heading" className="display text-[clamp(2rem,4vw,3.4rem)]">
                Nine plans, one price each.
              </h2>
              <p className="text-sm leading-7 text-muted">
                Nine monthly sizes. Windows Server is listed on every plan except Nano, and it still depends on what is actually available when you enquire.
              </p>
            </div>
          </>
        )}
        <div className={`${preview ? "" : "mt-10"} grid items-stretch gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-3`}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              os={plan.os}
              rows={[
                { label: "vCPU", value: plan.cpu },
                { label: "RAM", value: plan.ram },
                { label: "NVMe", value: plan.disk },
                { label: "Transfer", value: `${plan.transfer} / month` },
                { label: "Port", value: plan.port },
              ]}
              message={`Hi CyroHost, I am interested in the ${plan.name} VPS plan. Please share availability, final pricing, and deployment details.`}
            />
          ))}
        </div>
      </section>

      {preview ? null : (
      <section aria-labelledby="custom-heading">
        <h2 id="custom-heading" className="text-2xl font-light tracking-tight">
          Custom Build
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Ask for a shape inside the ranges below. Component rates are a starting point for that conversation, not a guaranteed quote for a specific machine.
        </p>
        <article className="lift mt-6 flex h-full max-w-xl flex-col border border-line bg-panel p-5">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Custom Build</p>
          <ul className="mt-4 space-y-2 text-sm text-ink">
            <li>₹135 / vCPU / month</li>
            <li>₹125 / GB RAM</li>
            <li>₹5.78 / GB NVMe</li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-muted">Configurable range: 1–64 vCPU, 1–256 GB RAM, 48–2000 GB NVMe.</p>
          <a
            href={enquire(
              "Hi CyroHost, I would like a Custom Build VPS. I want to discuss the CPU, RAM, and storage I need. Please share availability and final pricing.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center justify-center bg-accent px-4 text-sm text-accent-ink hover:bg-[var(--accent-hover)]"
          >
            Enquire on WhatsApp
            <span className="sr-only"> about Custom Build (opens in a new tab)</span>
          </a>
        </article>
      </section>
      )}

      {preview ? null : (
      <section id="bare-metal" aria-labelledby="metal-heading">
        <p className="font-mono text-xs tracking-[0.18em] text-cyan">02</p>
        <h2 id="metal-heading" className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">
          Bare Metal Plans
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          This specification was supplied as reference information. Confirm it with CyroHost before treating it as a live offer.
        </p>
        <article className="lift mt-8 flex h-full max-w-xl flex-col border border-line bg-panel p-5">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Platinum-tier — Noida, India</p>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl tracking-tight text-ink">₹15,420</span>
            <span className="text-sm text-muted">/month</span>
          </p>
          <p className="mt-2 text-sm text-muted">Setup fee ₹1,927</p>
          <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-4 text-sm text-ink">
            <li>Dedicated compute</li>
            <li>Xeon Platinum processors</li>
            <li>SSD storage</li>
            <li>Enterprise-grade network connectivity</li>
          </ul>
          <a
            href={enquire(
              "Hi CyroHost, I am interested in the Platinum-tier Bare Metal plan in Noida. Please confirm availability, final pricing, the setup fee, and deployment details.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center justify-center bg-accent px-4 text-sm text-accent-ink hover:bg-[var(--accent-hover)]"
          >
            Enquire on WhatsApp
            <span className="sr-only"> about Platinum-tier Bare Metal (opens in a new tab)</span>
          </a>
        </article>
      </section>
      )}

      {preview ? null : (
      <p className="border border-line bg-raised px-4 py-3 text-sm leading-6 text-muted">
        Prices are indicative and subject to confirmation. Final pricing, server availability, billing terms, taxes, and setup fees will be confirmed by the CyroHost team.
      </p>
      )}
    </div>
  );
}
