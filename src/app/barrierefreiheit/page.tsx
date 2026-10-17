import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import { getLegal } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const entry = getLegal("barrierefreiheit");

export const metadata: Metadata = pageMetadata(entry.seo, entry.path);

export default function BarrierefreiheitPage() {
  return <LegalPage slug="barrierefreiheit" />;
}
