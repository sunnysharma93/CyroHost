import Link from "next/link";
import { notFound } from "next/navigation";
import { docs, getDoc } from "@/content/docs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return docs.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getDoc(slug);
  if (!article) return {};
  return pageMeta({
    title: article.title,
    description: article.lede,
    path: `/docs/${article.slug}`,
  });
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getDoc(slug);
  if (!article) notFound();

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Guides", href: "/docs" }, { label: article.title }]} />
      <article className="max-w-3xl py-10">
        <p className="kicker">Guide</p>
        <h1 className="mt-4 text-4xl tracking-tight text-balance sm:text-5xl">{article.title}</h1>
        <p className="lede mt-5">{article.lede}</p>
        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-7 text-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Related</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {article.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="border border-line px-3 py-2 text-sm hover:border-cyan/50">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Container>
  );
}
