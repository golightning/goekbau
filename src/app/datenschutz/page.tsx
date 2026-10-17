import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import { getLegal } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const entry = getLegal("datenschutz");

export const metadata: Metadata = pageMetadata(entry.seo, entry.path);

export default function DatenschutzPage() {
  return <LegalPage slug="datenschutz" />;
}
