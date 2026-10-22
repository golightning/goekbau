import type { Metadata } from "next";
import { ConsentSettings } from "@/components/consent/ConsentSettings";
import { LegalPage } from "@/components/content/LegalPage";
import { Heading } from "@/components/ui/Layout";
import { getLegal } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const entry = getLegal("datenschutz");

export const metadata: Metadata = pageMetadata(entry.seo, entry.path);

export default function DatenschutzPage() {
  return (
    <LegalPage slug="datenschutz">
      <section id="einstellungen" aria-labelledby="einstellungen-titel" className="mt-16 max-w-prose">
        <Heading level={2} id="einstellungen-titel">
          Cookie- und Datenschutz-Einstellungen
        </Heading>
        <ConsentSettings />
      </section>
    </LegalPage>
  );
}
