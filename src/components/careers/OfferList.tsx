import Link from "next/link";
import { Heading } from "@/components/ui/Layout";
import { offerPath, type Offer } from "@/lib/content";

type Props = {
  offers: Offer[];
  headingLevel?: 3 | 4;
  emptyText: string;
};

/** career-listings „Karriere-Übersicht“: Titel, Kurzbeschreibung, Link – oder Leer-Zustand. */
export function OfferList({ offers, headingLevel = 3, emptyText }: Props) {
  if (offers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-bronze-300 bg-bronze-50 p-6" data-empty>
        {emptyText}
      </p>
    );
  }
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {offers.map((offer) => (
        <li
          key={offer.slug}
          className="relative flex flex-col rounded-lg border border-bronze-200 bg-white p-6 shadow-sm focus-within:ring-3 focus-within:ring-bronze-700 hover:border-bronze-500"
        >
          <Heading level={headingLevel} size={4}>
            <Link href={offerPath(offer)} className="after:absolute after:inset-0">
              {offer.title}
            </Link>
          </Heading>
          <p className="mt-3 flex-1 text-slate">{offer.summary}</p>
          <p aria-hidden="true" className="mt-4 font-accent text-sm font-semibold text-bronze-800">
            Details ansehen →
          </p>
        </li>
      ))}
    </ul>
  );
}
