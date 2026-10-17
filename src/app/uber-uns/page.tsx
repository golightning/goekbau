import type { Metadata } from "next";
import { BlockIntro, CtaBand } from "@/components/content/Blocks";
import { PartnerLogos, ProjectCards, StatList, TeamGrid } from "@/components/content/Collections";
import { Hero } from "@/components/content/Hero";
import { Prose } from "@/components/content/Prose";
import { Heading, Section } from "@/components/ui/Layout";
import { getBlock, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const page = getPage("uber-uns");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

/** company-pages „Über uns“: Profil, Werte, Kennzahlen, Projekte, Team, Partner. */
export default function AboutPage() {
  const profil = getBlock(page, "profil");
  const zitat = getBlock(page, "zitat");
  const werte = getBlock(page, "werte");
  const kennzahlen = getBlock(page, "kennzahlen");
  const projekte = getBlock(page, "projekte");
  const team = getBlock(page, "team");
  const partner = getBlock(page, "partner");
  const kontakt = getBlock(page, "kontakt");
  const [mainValues, promises] = [
    (werte.items ?? []).filter((i) => i.body),
    (werte.items ?? []).filter((i) => !i.body),
  ];

  return (
    <main id="inhalt">
      <Hero hero={page.hero} />

      <Section labelledBy="profil">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
          <BlockIntro block={profil} headingId="profil" />
          {zitat.body && (
            <figure className="rounded-lg border-l-4 border-bronze-500 bg-bronze-50 p-8">
              <blockquote className="font-heading text-xl font-semibold italic">
                <Prose html={zitat.body} />
              </blockquote>
              <figcaption className="mt-4 font-accent text-sm text-slate">– {zitat.title}</figcaption>
            </figure>
          )}
        </div>
      </Section>

      <Section tone="mist" labelledBy="werte">
        <BlockIntro block={werte} headingId="werte" />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {mainValues.map((v) => (
            <li key={v.title} className="rounded-lg bg-white p-6 shadow-sm">
              <Heading level={3} size={4}>
                {v.title}
              </Heading>
              <p className="mt-2 text-slate">{v.body}</p>
            </li>
          ))}
        </ul>
        {promises.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-3" aria-label="Unser Versprechen">
            {promises.map((v) => (
              <li
                key={v.title}
                className="rounded-full border-2 border-bronze-500 px-5 py-2 font-accent text-sm font-semibold"
              >
                {v.title}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="bronze" labelledBy="kennzahlen">
        <BlockIntro block={kennzahlen} headingId="kennzahlen" />
        <div className="mt-10">
          <StatList />
        </div>
      </Section>

      <Section labelledBy="projekte">
        <BlockIntro block={projekte} headingId="projekte" />
        <div className="mt-10">
          <ProjectCards />
        </div>
      </Section>

      <Section tone="mist" id="team" labelledBy="team-titel">
        <BlockIntro block={team} headingId="team-titel" />
        <div className="mt-10">
          <TeamGrid />
        </div>
      </Section>

      <Section labelledBy="partner">
        <BlockIntro block={partner} headingId="partner" />
        <div className="mt-10">
          <PartnerLogos />
        </div>
      </Section>

      <CtaBand block={kontakt} />
    </main>
  );
}
