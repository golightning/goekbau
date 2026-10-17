import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, Heading, Section } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

/** site-navigation „Fehlerseite“ – Apache liefert sie per ErrorDocument mit Status 404 aus. */
export default function NotFound() {
  return (
    <main id="inhalt">
      <Section>
        <Eyebrow>Fehler 404</Eyebrow>
        <Heading level={1}>Diese Seite gibt es nicht</Heading>
        <p className="mt-4 max-w-prose text-lg">
          Vielleicht wurde sie verschoben oder die Adresse enthält einen Tippfehler.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="/">Zur Startseite</LinkButton>
          <LinkButton href="/kontakt/" variant="secondary">
            Kontakt aufnehmen
          </LinkButton>
        </div>
      </Section>
    </main>
  );
}
