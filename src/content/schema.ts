// Inhaltsmodell (content-model): Schemas aller Inhaltstypen.
// Verstöße brechen `velite build` mit Datei- und Feldangabe ab.
import { defineCollection, s } from "velite";

// --- gemeinsame Bausteine -------------------------------------------------------------------------

/** Bild mit Pflicht-Alternativtext oder ausdrücklicher Markierung als dekorativ. */
export const imageWithAlt = s
  .object({
    src: s.image(),
    alt: s.string().min(3).optional(),
    decorative: s.boolean().optional(),
    credit: s.string().optional(),
  })
  .refine((img) => Boolean(img.alt) !== Boolean(img.decorative), {
    message:
      "Bild braucht entweder einen Alternativtext (alt) oder decorative: true – nicht beides, nicht keins",
  });

/** seo-metadata: Titel ≤ 60 Zeichen (vor Suffix), Beschreibung 70–160 Zeichen. */
export const seo = s.object({
  title: s.string().min(3).max(60),
  description: s.string().min(70).max(160),
  ogImage: s.image().optional(),
  noindex: s.boolean().default(false),
});

const legacyPath = s.string().regex(/^\/[a-z0-9\-/]*\/$/, "alter Pfad muss mit / beginnen und enden");
const markdownBlock = s.markdown();

// --- Stammdaten -----------------------------------------------------------------------------------

export const company = defineCollection({
  name: "Company",
  pattern: "company.yaml",
  single: true,
  schema: s.object({
    name: s.string(),
    shortName: s.string(),
    claim: s.string(),
    tagline: s.string(),
    foundingYear: s.number().int().min(1900),
    managingDirector: s.string(),
    address: s.object({
      street: s.string(),
      postalCode: s.string().regex(/^\d{5}$/),
      city: s.string(),
      district: s.string().optional(),
      country: s.literal("DE"),
    }),
    geo: s.object({ lat: s.number(), lng: s.number() }).optional(),
    phone: s.object({ display: s.string(), e164: s.string().regex(/^\+\d{8,15}$/) }),
    whatsapp: s.object({ e164: s.string().regex(/^\+\d{8,15}$/) }),
    emails: s
      .array(
        s.object({
          id: s.enum(["general", "management", "careers"]),
          label: s.string(),
          address: s.string().email(),
        }),
      )
      .min(1),
    register: s.object({ court: s.string(), number: s.string() }).optional(),
    vatId: s.string().optional(),
    social: s
      .object({
        linkedin: s.string().url().optional(),
        xing: s.string().url().optional(),
        instagram: s.string().url().optional(),
        facebook: s.string().url().optional(),
        youtube: s.string().url().optional(),
      })
      .default({}),
    agency: s.object({ name: s.string(), url: s.string().url() }),
  }),
});

// --- Seiten ---------------------------------------------------------------------------------------

export const pages = defineCollection({
  name: "Page",
  pattern: "pages/*.yaml",
  schema: s.object({
    slug: s.slug("pages"),
    path: s.string().regex(/^\/([a-z0-9-]+\/)*$/),
    seo,
    hero: s.object({
      eyebrow: s.string().optional(),
      title: s.string(),
      lead: s.string().optional(),
      image: imageWithAlt.optional(),
    }),
    blocks: s
      .array(
        s.object({
          id: s.string().regex(/^[a-z0-9-]+$/),
          eyebrow: s.string().optional(),
          title: s.string().optional(),
          body: markdownBlock.optional(),
          items: s.array(s.object({ title: s.string(), body: s.string().optional() })).optional(),
          cta: s.object({ label: s.string(), href: s.string() }).optional(),
          image: imageWithAlt.optional(),
        }),
      )
      .default([]),
  }),
});

export const legal = defineCollection({
  name: "LegalPage",
  pattern: "legal/*.md",
  schema: s.object({
    slug: s.slug("pages"),
    path: s.string().regex(/^\/([a-z0-9-]+\/)*$/),
    title: s.string(),
    seo,
    updated: s.isodate(),
    body: s.markdown(),
  }),
});

// --- Leistungen, Projekte, Team, Partner, Kennzahlen ---------------------------------------------

export const serviceAreas = defineCollection({
  name: "ServiceArea",
  pattern: "service-areas.yaml",
  schema: s.object({
    id: s.slug("service-areas"),
    title: s.string(),
    summary: s.string(),
    order: s.number().int(),
  }),
});

export const services = defineCollection({
  name: "Service",
  pattern: "services/*.yaml",
  schema: s.object({
    id: s.slug("services"),
    title: s.string(),
    summary: s.string(),
    area: s.string(),
    status: s.enum(["offered", "planned"]),
    /** Plakat-Zeile der Startseite: kurzes Wort groß, Detail klein am rechten Rand */
    poster: s.object({ label: s.string().max(16), detail: s.string().max(32) }).optional(),
    order: s.number().int(),
  }),
});

export const projects = defineCollection({
  name: "Project",
  pattern: "projects/*.yaml",
  schema: s.object({
    slug: s.slug("projects"),
    line: s.string(),
    section: s.string(),
    region: s.string().optional(),
    period: s.string().optional(),
    services: s.array(s.string()).default([]),
    image: imageWithAlt.optional(),
    featured: s.boolean().default(false),
    order: s.number().int(),
  }),
});

export const team = defineCollection({
  name: "TeamMember",
  pattern: "team/*.yaml",
  schema: s.object({
    slug: s.slug("team"),
    name: s.string(),
    role: s.string(),
    qualifications: s.array(s.string()).default([]),
    photo: imageWithAlt.optional(),
    order: s.number().int(),
  }),
});

export const partners = defineCollection({
  name: "Partner",
  pattern: "partners/*.yaml",
  schema: s.object({
    slug: s.slug("partners"),
    name: s.string(),
    url: s.string().url().optional(),
    logo: imageWithAlt,
    order: s.number().int(),
  }),
});

export const stats = defineCollection({
  name: "Stat",
  pattern: "stats.yaml",
  schema: s.object({
    id: s.slug("stats"),
    label: s.string(),
    value: s.number(),
    prefix: s.string().optional(),
    suffix: s.string().optional(),
    grouping: s.boolean().default(true),
    /** Ganzer Satz neben der Zahl (Startseite) */
    sentence: s.string().max(90).optional(),
    order: s.number().int(),
  }),
});

// --- Karriere -------------------------------------------------------------------------------------

const offerBase = {
  slug: s.slug("careers"),
  title: s.string().min(5),
  status: s.enum(["draft", "published"]),
  summary: s.string().min(20).max(300),
  datePosted: s.isodate(),
  validThrough: s.isodate().optional(),
  location: s.object({ city: s.string(), region: s.string() }),
  legacyPaths: s.array(legacyPath).default([]),
  seo,
  body: s.markdown(),
};

export const jobs = defineCollection({
  name: "Job",
  pattern: "careers/jobs/*.md",
  schema: s.object({
    ...offerBase,
    type: s.literal("job"),
    employmentType: s.array(s.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY"])).min(1),
  }),
});

export const trainings = defineCollection({
  name: "Training",
  pattern: "careers/trainings/*.md",
  schema: s.object({
    ...offerBase,
    type: s.literal("training"),
    duration: s.string().optional(),
  }),
});

export const collections = {
  company,
  pages,
  legal,
  serviceAreas,
  services,
  projects,
  team,
  partners,
  stats,
  jobs,
  trainings,
};
