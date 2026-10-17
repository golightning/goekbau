import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferDetail } from "@/components/careers/OfferDetail";
import { liveJobs, offerPath } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

// Nur veröffentlichte, nicht abgelaufene Angebote erhalten eine Seite (career-listings).
export const dynamicParams = false;

export function generateStaticParams() {
  return liveJobs().map((o) => ({ slug: o.slug }));
}

function find(slug: string) {
  const offer = liveJobs().find((o) => o.slug === slug);
  if (!offer) notFound();
  return offer;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const offer = find((await params).slug);
  return pageMetadata(offer.seo, offerPath(offer));
}

export default async function JobPage({ params }: Params) {
  return <OfferDetail offer={find((await params).slug)} />;
}
