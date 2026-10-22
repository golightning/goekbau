import type { Metadata } from "next";
import { CtaBand } from "@/components/content/Blocks";
import { ServiceAreas } from "@/components/content/Collections";
import { Hero } from "@/components/content/Hero";
import { Section } from "@/components/ui/Layout";
import { getBlock, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const page = getPage("leistungen");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

/** company-pages „Leistungen“: nach Bereich gruppiert, geplante Leistungen als „in Vorbereitung“. */
export default function ServicesPage() {
  const geplant = getBlock(page, "geplant");
  const kontakt = getBlock(page, "kontakt");
  return (
    <main id="inhalt">
      <Hero hero={page.hero} />
      <Section>
        <ServiceAreas plannedNote={geplant.body?.replace(/<[^>]+>/g, "").trim()} />
      </Section>
      <CtaBand block={kontakt} />
    </main>
  );
}
