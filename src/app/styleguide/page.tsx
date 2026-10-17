import type { Metadata } from "next";
import { Button, LinkButton } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { InputField, TextareaField } from "@/components/ui/Field";
import { Card, Eyebrow, Heading, Section } from "@/components/ui/Layout";
import { Tabs } from "@/components/ui/Tabs";

// Komponentenübersicht nur für Entwicklung/Staging; scripts/assemble.sh entfernt sie im Produktions-Artefakt.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

// Klassen ausgeschrieben, damit der Tailwind-Scanner sie findet
const swatches = [
  ["bronze-50", "bg-bronze-50"],
  ["bronze-100", "bg-bronze-100"],
  ["bronze-200", "bg-bronze-200"],
  ["bronze-300", "bg-bronze-300"],
  ["bronze-500", "bg-bronze-500"],
  ["bronze-700", "bg-bronze-700"],
  ["bronze-800", "bg-bronze-800"],
  ["bronze-900", "bg-bronze-900"],
  ["ink", "bg-ink"],
  ["slate", "bg-slate"],
  ["mist", "bg-mist"],
  ["danger", "bg-danger"],
  ["success", "bg-success"],
] as const;

export default function StyleguidePage() {
  return (
    <main id="inhalt">
      <Section>
        <Eyebrow>Design-System</Eyebrow>
        <Heading level={1} size="display">
          Styleguide GÖK
        </Heading>
        <p className="mt-4 max-w-prose text-lg">
          Fließtext in Roboto Slab mit Umlauten: Gleisbau, Bauüberwachung, Schweißüberwacher, Größe.
        </p>
      </Section>

      <Section tone="mist" labelledBy="farben">
        <Heading level={2} id="farben">
          Farben
        </Heading>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map(([name, bg]) => (
            <li key={name} className="text-sm">
              <span className={`block h-16 rounded-md border border-bronze-200 ${bg}`} />
              <code>{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="typo">
        <Heading level={2} id="typo">
          Typografie
        </Heading>
        <Heading level={3} className="mt-6">
          Überschrift Ebene 3 (Raleway)
        </Heading>
        <Heading level={4} className="mt-4">
          Überschrift Ebene 4
        </Heading>
        <p className="mt-4 font-accent">Navigation und Buttons in Raleway – zwei Familien tragen die Marke.</p>
      </Section>

      <Section tone="bronze" labelledBy="buttons">
        <Heading level={2} id="buttons">
          Buttons
        </Heading>
        <div className="mt-6 flex flex-wrap gap-4">
          <LinkButton href="/kontakt/">Kontakt aufnehmen</LinkButton>
          <LinkButton href="/leistungen/" variant="secondary">
            Leistungen ansehen
          </LinkButton>
          <Button disabled>Deaktiviert</Button>
        </div>
      </Section>

      <Section tone="ink" labelledBy="inverse">
        <Heading level={2} id="inverse">
          Auf dunklem Grund
        </Heading>
        <div className="mt-6">
          <LinkButton href="/karriere/" variant="inverse">
            Zur Karriere
          </LinkButton>
        </div>
      </Section>

      <Section labelledBy="formular">
        <Heading level={2} id="formular">
          Formularfelder
        </Heading>
        <form className="mt-6 grid max-w-xl gap-5" action="#">
          <InputField id="sg-name" name="name" label="Name" required autoComplete="name" />
          <InputField
            id="sg-email"
            name="email"
            type="email"
            label="E-Mail"
            required
            error="Bitte geben Sie eine gültige E-Mail-Adresse ein."
            defaultValue="max@"
          />
          <InputField id="sg-tel" name="tel" type="tel" label="Telefon" hint="Für Rückfragen, optional." />
          <TextareaField id="sg-msg" name="message" label="Nachricht" required />
        </form>
      </Section>

      <Section tone="mist" labelledBy="bausteine">
        <Heading level={2} id="bausteine">
          Karten, Aufklapper, Tabs
        </Heading>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <Heading level={3}>Karte</Heading>
            <p className="mt-2">Inhalt einer Karte.</p>
          </Card>
          <Disclosure summary="Aufklapper (details/summary)">
            <p>Funktioniert ohne JavaScript.</p>
          </Disclosure>
        </div>
        <div className="mt-8">
          <Tabs
            label="Beispiel-Tabs"
            tabs={[
              { id: "a", label: "Beschreibung", content: <p>Inhalt A</p> },
              { id: "b", label: "Anforderungen", content: <p>Inhalt B</p> },
            ]}
          />
        </div>
      </Section>
    </main>
  );
}
