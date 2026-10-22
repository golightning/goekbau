import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, Heading, Section } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

/**
 * site-navigation „Fehlerseite“ – Apache liefert sie per ErrorDocument mit Status 404 aus. Liegt außerhalb der
 * Route-Group `(site)` und bindet Header, Footer und Schnellkontakt deshalb selbst ein.
 */
export default function NotFound() {
  return (
    <SiteChrome>
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
    </SiteChrome>
  );
}
