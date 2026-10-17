import type { Metadata } from "next";
import { isProductionSite } from "./site-env";

export const SITE_URL = "https://www.goekbau.de";
export const TITLE_SUFFIX = "GÖK Bauüberwachung Bahn";
export const DEFAULT_OG_IMAGE = { url: "/brand/og-default.jpg", width: 1200, height: 630 };

type Seo = {
  title: string;
  description: string;
  noindex?: boolean;
  ogImage?: { src: string; width: number; height: number };
};

/** seo-metadata: eindeutiger Titel mit Suffix, Beschreibung, Canonical mit Schrägstrich, OG/Twitter, de_DE. */
export function pageMetadata(seo: Seo, path: string): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const image = seo.ogImage
    ? { url: seo.ogImage.src, width: seo.ogImage.width, height: seo.ogImage.height }
    : DEFAULT_OG_IMAGE;
  return {
    // absolut statt Template: Das Root-Template greift nicht für die Startseite (gleiches Segment)
    title: { absolute: `${seo.title} | ${TITLE_SUFFIX}` },
    description: seo.description,
    alternates: { canonical },
    robots: !isProductionSite
      ? { index: false, follow: false }
      : seo.noindex
        ? { index: false, follow: true }
        : undefined,
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: TITLE_SUFFIX,
      url: canonical,
      title: `${seo.title} | ${TITLE_SUFFIX}`,
      description: seo.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seo.title} | ${TITLE_SUFFIX}`,
      description: seo.description,
      images: [image.url],
    },
  };
}
