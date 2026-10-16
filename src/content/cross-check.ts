// Sammlungsübergreifende Regeln, die ein einzelnes Schema nicht prüfen kann.
// Ein Fehler hier bricht den Build mit verständlicher Meldung ab (content-model, seo-metadata, legacy-url-redirects).

type Entry = Record<string, unknown> & {
  slug?: string;
  id?: string;
  title?: string;
  seo?: { title: string };
};
type Data = Record<string, unknown>;

export class ContentError extends Error {
  constructor(message: string) {
    super(`Inhaltsfehler: ${message}`);
    this.name = "ContentError";
  }
}

const list = (data: Data, key: string) => ((data[key] as Entry[] | undefined) ?? []).filter(Boolean);

export function crossCheck(data: Data): void {
  const problems: string[] = [];

  // Jede Leistung gehört zu einem existierenden Leistungsbereich
  const areas = new Set(list(data, "serviceAreas").map((a) => a.id));
  for (const svc of list(data, "services")) {
    if (!areas.has(svc.area as string))
      problems.push(`Leistung "${svc.id}": unbekannter Bereich "${svc.area}"`);
  }

  // Seitentitel eindeutig über Seiten, Rechtstexte und Karriere-Angebote
  const titles = new Map<string, string>();
  for (const key of ["pages", "legal", "jobs", "trainings"]) {
    for (const entry of list(data, key)) {
      const title = entry.seo?.title;
      const id = `${key}/${entry.slug}`;
      if (!title) continue;
      if (titles.has(title))
        problems.push(`doppelter SEO-Titel "${title}" in ${titles.get(title)} und ${id}`);
      else titles.set(title, id);
    }
  }

  // Alte URLs dürfen nur einem Angebot zugeordnet sein
  const legacy = new Map<string, string>();
  for (const key of ["jobs", "trainings"]) {
    for (const entry of list(data, key)) {
      for (const p of (entry.legacyPaths as string[] | undefined) ?? []) {
        if (legacy.has(p))
          problems.push(`alter Pfad ${p} doppelt: ${legacy.get(p)} und ${key}/${entry.slug}`);
        else legacy.set(p, `${key}/${entry.slug}`);
      }
    }
  }

  // Slugs über Stellen und Ausbildungen eindeutig (gemeinsamer Namensraum /karriere/…)
  const careerSlugs = new Map<string, string>();
  for (const key of ["jobs", "trainings"]) {
    for (const entry of list(data, key)) {
      const slug = entry.slug as string;
      if (careerSlugs.has(slug))
        problems.push(`Slug "${slug}" doppelt in ${careerSlugs.get(slug)} und ${key}`);
      else careerSlugs.set(slug, key);
    }
  }

  if (problems.length) throw new ContentError(`\n  - ${problems.join("\n  - ")}`);
}
