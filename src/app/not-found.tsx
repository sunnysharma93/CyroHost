import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="kicker">404</p>
      <h1 className="mt-4 text-4xl tracking-tight">That page is not on this site.</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
        The address does not match a CyroHost service page. Use the service index or contact sales if you were following an older link.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/search" variant="secondary">
          Search the site
        </ButtonLink>
      </div>
    </Container>
  );
}
