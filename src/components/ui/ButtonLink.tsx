import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-[var(--accent-hover)] border border-accent",
  secondary:
    "bg-panel text-ink border border-line hover:border-cyan hover:text-ink",
  text: "bg-transparent text-cyan px-0 border border-transparent hover:text-ink min-h-0",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}) {
  const classNames = `inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm font-medium tracking-wide transition-colors ${styles[variant]} ${className}`;

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classNames}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      >
        {children}
        {href.startsWith("mailto:") ? null : (
          <ArrowUpRight aria-hidden="true" className="size-4" />
        )}
        {href.startsWith("mailto:") ? null : (
          <span className="sr-only"> (opens in a new tab)</span>
        )}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
}
