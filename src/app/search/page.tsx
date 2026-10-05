import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";
import { searchContent } from "@/lib/search";

export const metadata = pageMeta({
  title: "Search",
  description: "Search CyroHost services, guides, and pages on this website.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = searchContent(query);

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <div className="max-w-3xl py-10">
        <p className="kicker">Search</p>
        <h1 className="mt-4 text-4xl tracking-tight sm:text-5xl">Find a service or a guide.</h1>
        <form action="/search" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="q" className="sr-only">
            Search services and guides
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="VPS, transit, colocation, bots"
            className="min-h-12 flex-1 border border-line bg-panel px-3 text-base text-ink"
          />
          <button type="submit" className="min-h-12 bg-accent px-5 text-sm font-medium text-accent-ink">
            Search
          </button>
        </form>
      </div>
      <p className="text-sm text-muted">
        {query ? `${results.length} results for “${query}”` : `${results.length} pages`}
      </p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {results.map((item) => (
          <li key={item.href + item.title}>
            <Link href={item.href} className="block py-5 hover:text-cyan">
              <span className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">{item.kind}</span>
              <span className="mt-2 block text-lg text-ink">{item.title}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{item.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      {results.length === 0 ? (
        <p className="py-10 text-sm text-muted">Nothing matched. Try VPS, BGP, or bots, or browse the service menus.</p>
      ) : null}
    </Container>
  );
}
