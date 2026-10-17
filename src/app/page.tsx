import type { Metadata } from "next";
import { BlockCta, BlockIntro, CtaBand } from "@/components/content/Blocks";
import { ProjectCards, ServiceAreaOverview, TeamGrid } from "@/components/content/Collections";
import { Hero } from "@/components/content/Hero";
import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";
import { getBlock, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const page = getPage("home");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

/** company-pages „Startseite“: Hero, Kurzvorstellung, Leistungen, Projekte, Team, Karriere, Kontakt-CTA. */
export default function HomePage() {
  const intro = getBlock(page, "intro");
  const leistungen = getBlock(page, "leistungen");
  const projekte = getBlock(page, "projekte");
  const team = getBlock(page, "team");
  const karriere = getBlock(page, "karriere");
  const kontakt = getBlock(page, "kontakt");

  return (
    <main id="inhalt">
      <Hero hero={page.hero}>
        <LinkButton href="/kontakt/">Kontakt aufnehmen</LinkButton>
        <LinkButton href="/leistungen/" variant="inverse">
          Unsere Leistungen
        </LinkButton>
      </Hero>

      <Section labelledBy="intro">
        <BlockIntro block={intro} headingId="intro" />
        <BlockCta block={intro} variant="secondary" />
      </Section>

      <Section tone="mist" labelledBy="leistungen">
        <BlockIntro block={leistungen} headingId="leistungen" />
        <div className="mt-12">
          <ServiceAreaOverview />
        </div>
        <BlockCta block={leistungen} />
      </Section>

      <Section labelledBy="projekte">
        <BlockIntro block={projekte} headingId="projekte" />
        <div className="mt-10">
          <ProjectCards />
        </div>
      </Section>

      <Section tone="bronze" labelledBy="team">
        <BlockIntro block={team} headingId="team" />
        <div className="mt-10">
          <TeamGrid limit={3} />
        </div>
        <BlockCta block={team} variant="secondary" />
      </Section>

      <Section labelledBy="karriere">
        <BlockIntro block={karriere} headingId="karriere" />
        <BlockCta block={karriere} />
      </Section>

      <CtaBand block={kontakt} />
    </main>
  );
}
