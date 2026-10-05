import Link from "next/link";
import { docs } from "@/content/docs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Guides",
  description:
    "CyroHost guides for ordering, regions, published prices, support, VPS details, and network enquiries. No unpublished specifications are filled in.",
  path: "/docs",
});

export default function DocsPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Guides" }]} />
      <div className="max-w-3xl py-10">
        <p className="kicker">Knowledge base</p>
        <h1 className="mt-4 text-4xl tracking-tight text-balance sm:text-5xl">Notes for a technical buyer.</h1>
        <p className="lede mt-5">
          Short guides built from the public pages. They say what is listed, what is quoted, and what this website cannot do yet.
        </p>
      </div>
      <ul className="grid gap-4 pb-16 md:grid-cols-2">
        {docs.map((article) => (
          <li key={article.slug}>
            <Link href={`/docs/${article.slug}`} className="panel lift block h-full p-6">
              <h2 className="text-2xl tracking-tight">{article.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{article.lede}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
