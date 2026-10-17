import type { Company } from "#content";
import type { Job } from "@/lib/content";
import { SITE_URL } from "@/lib/metadata";

/** career-listings „Strukturierte Stellendaten“: schema.org JobPosting – nur für Typ `job`. */
export function jobPostingJsonLd(job: Job, company: Company, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.body,
    datePosted: job.datePosted,
    ...(job.validThrough ? { validThrough: job.validThrough } : {}),
    employmentType: job.employmentType,
    directApply: true,
    url: new URL(path, SITE_URL).toString(),
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      sameAs: SITE_URL,
      logo: new URL("/brand/logo-192.png", SITE_URL).toString(),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: company.address.street,
        postalCode: company.address.postalCode,
        addressLocality: job.location.city,
        addressRegion: job.location.region,
        addressCountry: company.address.country,
      },
    },
  };
}

/** JSON-LD sicher einbetten: „<“ maskieren, damit kein </script> aus Inhalten ausbrechen kann. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
