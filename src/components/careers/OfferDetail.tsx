import Link from "next/link";
import { Prose } from "@/components/content/Prose";
import { Container, Eyebrow, Heading } from "@/components/ui/Layout";
import { company, offerPath, type Offer } from "@/lib/content";
import { jobPostingJsonLd, serializeJsonLd } from "@/lib/job-posting";

const employment: Record<string, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  CONTRACTOR: "Freie Mitarbeit",
  TEMPORARY: "Befristet",
};

/** career-listings „Detailseiten“: Titel, Beschreibung, Aufgaben, Anforderungen, Bewerbung. */
export function OfferDetail({ offer }: { offer: Offer }) {
  const isJob = offer.type === "job";
  return (
    <main id="inhalt">
      {isJob && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(jobPostingJsonLd(offer, company, offerPath(offer))),
          }}
        />
      )}
      <div className="bg-bronze-50">
        <Container className="py-14 md:py-20">
          <nav aria-label="Brotkrumen" className="mb-6 font-accent text-sm">
            <ol className="flex flex-wrap gap-2 text-slate">
              <li>
                <Link href="/karriere/" className="text-bronze-800 underline underline-offset-4">
                  Karriere
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{isJob ? "Stellenangebot" : "Aus- und Weiterbildung"}</li>
            </ol>
          </nav>
          <Eyebrow>{isJob ? "Stellenangebot" : "Aus- und Weiterbildung"}</Eyebrow>
          <Heading level={1} className="max-w-4xl">
            {offer.title}
          </Heading>
          <p className="mt-5 max-w-3xl text-lg">{offer.summary}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-accent text-sm">
            <div className="flex gap-2">
              <dt className="text-slate">Ort:</dt>
              <dd className="font-semibold">
                {offer.location.city}, {offer.location.region}
              </dd>
            </div>
            {isJob && (
              <div className="flex gap-2">
                <dt className="text-slate">Anstellung:</dt>
                <dd className="font-semibold">{offer.employmentType.map((t) => employment[t]).join(", ")}</dd>
              </div>
            )}
            {!isJob && offer.duration && (
              <div className="flex gap-2">
                <dt className="text-slate">Dauer:</dt>
                <dd className="font-semibold">{offer.duration}</dd>
              </div>
            )}
          </dl>
        </Container>
      </div>
      <Container className="grid gap-14 py-14 md:py-20 lg:grid-cols-[3fr_2fr]">
        <Prose html={offer.body} />
        <aside aria-labelledby="bewerbung-titel" className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-bronze-200 bg-white p-6 shadow-sm md:p-8">
            <Heading level={2} id="bewerbung-titel" size={3}>
              {isJob ? "Bewerben Sie sich für diese Stelle" : "Interesse an der Ausbildung?"}
            </Heading>
            <div className="mt-6" data-slot="bewerbungsformular" data-position={offer.title} />
          </div>
        </aside>
      </Container>
    </main>
  );
}
