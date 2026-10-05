export function StackDiagram({
  title,
  note,
  steps,
}: {
  title: string;
  note: string;
  steps: { label: string; detail: string }[];
}) {
  return (
    <figure className="border border-line bg-panel">
      <figcaption className="border-b border-line px-5 py-4">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{note}</p>
      </figcaption>
      <ol className="grid md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="border-t border-line px-5 py-5 md:[&:nth-child(-n+2)]:border-t-0 xl:border-t-0 xl:border-l xl:first:border-l-0"
          >
            <span className="font-mono text-[10px] tracking-[0.16em] text-violet">0{index + 1}</span>
            <p className="mt-2 text-sm font-medium text-ink">{step.label}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
            {index < steps.length - 1 ? (
              <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-muted uppercase xl:hidden">Next</p>
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
