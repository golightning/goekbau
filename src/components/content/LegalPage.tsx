import { Prose } from "@/components/content/Prose";
import { Container, Heading } from "@/components/ui/Layout";
import { getLegal } from "@/lib/content";

const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" });

export function LegalPage({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const entry = getLegal(slug);
  return (
    <main id="inhalt">
      <Container className="py-16 md:py-24">
        <Heading level={1}>{entry.title}</Heading>
        <p className="mt-3 text-sm text-slate">Stand: {dateFormat.format(new Date(entry.updated))}</p>
        <Prose html={entry.body} className="mt-10" />
        {children}
      </Container>
    </main>
  );
}
