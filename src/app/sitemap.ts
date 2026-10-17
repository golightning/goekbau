import type { MetadataRoute } from "next";
import { getLegal, liveJobs, liveTrainings, offerPath } from "@/lib/content";
import { SITE_URL } from "@/lib/metadata";

export const dynamic = "force-static";

/** seo-metadata „Sitemap und robots.txt“: alle indexierbaren Seiten, ohne 404, Styleguide und Ergebnisseiten. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const pages = ["/", "/uber-uns/", "/leistungen/", "/karriere/", "/kontakt/"].map((path) => ({
    url: url(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  const legal = ["impressum", "datenschutz", "barrierefreiheit"].map((slug) => {
    const entry = getLegal(slug);
    return {
      url: url(entry.path),
      lastModified: entry.updated,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    };
  });
  const offers = [...liveJobs(), ...liveTrainings()].map((o) => ({
    url: url(offerPath(o)),
    lastModified: o.datePosted,
    changeFrequency: "weekly" as const,
    priority: o.type === "job" ? 0.9 : 0.7,
  }));
  return [...pages, ...offers, ...legal];
}
