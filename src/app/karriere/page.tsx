import type { Metadata } from "next";
import { BlockIntro } from "@/components/content/Blocks";
import { Hero } from "@/components/content/Hero";
import { OfferList } from "@/components/careers/OfferList";
import { Heading, Section } from "@/components/ui/Layout";
import { getBlock, getPage, liveJobs, liveTrainings } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const page = getPage("karriere");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

/** career-listings „Karriere-Übersicht“: Einleitung, Angebot, Anforderungen, Stellen, Ausbildung, Bewerbung. */
export default function CareersPage() {
  const intro = getBlock(page, "intro");
  const angebot = getBlock(page, "angebot");
  const anforderungen = getBlock(page, "anforderungen");
  const stellen = getBlock(page, "stellen");
  const ausbildung = getBlock(page, "ausbildung");
  const initiativ = getBlock(page, "initiativ");
  const bewerbung = getBlock(page, "bewerbung");

  return (
    <main id="inhalt">
      <Hero hero={page.hero} />

      <Section labelledBy="intro">
        <BlockIntro block={intro} headingId="intro" />
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {[angebot, anforderungen].map((block) => (
            <div key={block.id} className="rounded-lg bg-bronze-50 p-6 md:p-8">
              <Heading level={3}>{block.title}</Heading>
              <ul className="mt-5 space-y-4">
                {(block.items ?? []).map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span aria-hidden="true" className="mt-1 text-bronze-700">
                      ✓
                    </span>
                    <span>
                      <span className="font-semibold">{item.title}</span>
                      {item.body && <span className="block text-slate">{item.body}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist" id="stellen" labelledBy="stellen-titel">
        <BlockIntro block={stellen} headingId="stellen-titel" />
        <div className="mt-8">
          <OfferList
            offers={liveJobs()}
            emptyText="Derzeit sind keine Stellen ausgeschrieben. Wir freuen uns trotzdem über Ihre Initiativbewerbung."
          />
        </div>
      </Section>

      <Section id="ausbildung" labelledBy="ausbildung-titel">
        <BlockIntro block={ausbildung} headingId="ausbildung-titel" />
        <div className="mt-8">
          <OfferList
            offers={liveTrainings()}
            emptyText="Aktuell bieten wir keine Ausbildungsgänge an. Sprechen Sie uns gern an."
          />
        </div>
      </Section>

      <Section tone="bronze" id="bewerbung" labelledBy="bewerbung-titel">
        <BlockIntro block={bewerbung} headingId="bewerbung-titel" />
        <p className="mt-4 max-w-2xl text-lg">
          <strong>{initiativ.title}</strong> {initiativ.body?.replace(/<[^>]+>/g, "").trim()}
        </p>
        <div className="mt-8" data-slot="bewerbungsformular" data-position="Initiativbewerbung" />
      </Section>
    </main>
  );
}
