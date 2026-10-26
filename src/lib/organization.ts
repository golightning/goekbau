import type { Company } from "#content";
import { SITE_URL } from "@/lib/metadata";

/**
 * seo-metadata „Strukturierte Unternehmensdaten“: aus derselben Quelle wie Footer und Kontaktseite.
 * Bewusst ohne E-Mail-Adresse (email-security) – Kontaktweg ist die Kontaktseite.
 */
export function organizationJsonLd(company: Company) {
  const sameAs = Object.values(company.social).filter((v): v is string => Boolean(v));
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organisation`,
    name: company.name,
    url: `${SITE_URL}/`,
    logo: new URL("/brand/logo-192.png", SITE_URL).toString(),
    image: new URL("/brand/og-default.jpg", SITE_URL).toString(),
    description: company.tagline,
    foundingDate: String(company.foundingYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: company.address.country,
    },
    areaServed: { "@type": "Country", name: "Deutschland" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: new URL("/kontakt/", SITE_URL).toString(),
      availableLanguage: ["de"],
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}
