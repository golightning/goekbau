import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import {
  CareerInverted,
  ContactRows,
  FigureLines,
  IntroColumn,
  ProjectScatter,
  ServicePoster,
  TeamFacts,
} from "@/components/home/HomeSections";
import { company, getBlock, getPage } from "@/lib/content";
import { serializeJsonLd } from "@/lib/job-posting";
import { pageMetadata } from "@/lib/metadata";
import { organizationJsonLd } from "@/lib/organization";

const page = getPage("home");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

/**
 * Startseite – Richtung „Der Name als Monument“ (design-taste-frontend, 17.10.2026).
 * Argument: wer wir sind → was wir überwachen → wo schon geleistet → in Zahlen → Team → Karriere → Kontakt.
 * Idee: GÖKs eigenes Baustellenfoto trägt den ersten Bildschirm, der Name ist das Monument.
 */
export default function HomePage() {
  return (
    <main id="inhalt">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd(company)) }}
      />
      <HomeHero hero={page.hero} />
      <IntroColumn block={getBlock(page, "intro")} />
      <ServicePoster block={getBlock(page, "leistungen")} />
      <ProjectScatter block={getBlock(page, "projekte")} />
      <FigureLines block={getBlock(page, "kennzahlen")} />
      <TeamFacts block={getBlock(page, "team")} />
      <CareerInverted block={getBlock(page, "karriere")} />
      <ContactRows block={getBlock(page, "kontakt")} />
    </main>
  );
}
