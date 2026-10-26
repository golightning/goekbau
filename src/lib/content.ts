// Zugriffsschicht auf die validierten Inhalte (.velite, erzeugt von `velite build --strict`).
import {
  company,
  jobs,
  legal,
  pages,
  partners,
  projects,
  serviceAreas,
  services,
  stats,
  team,
  trainings,
  type Job,
  type Page,
  type Training,
} from "#content";

export { company };
export type { Job, Page, Training };
export type Block = Page["blocks"][number];
export type Offer = Job | Training;

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function getPage(slug: string): Page {
  const page = pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Seite "${slug}" fehlt in content/pages/`);
  return page;
}

/** Pflicht-Block einer Seite – fehlt er, bricht der Build ab statt still eine Lücke zu rendern. */
export function getBlock(page: Page, id: string): Block {
  const block = page.blocks.find((b) => b.id === id);
  if (!block) throw new Error(`Block "${id}" fehlt in content/pages/${page.slug}.yaml`);
  return block;
}

export function getLegal(slug: string) {
  const entry = legal.find((l) => l.slug === slug);
  if (!entry) throw new Error(`Rechtstext "${slug}" fehlt in content/legal/`);
  return entry;
}

export const serviceAreasSorted = () => [...serviceAreas].sort(byOrder);
export const servicesByArea = (areaId: string) => services.filter((s) => s.area === areaId).sort(byOrder);
export const projectsSorted = () => [...projects].sort(byOrder);
export const teamSorted = () => [...team].sort(byOrder);
export const partnersSorted = () => [...partners].sort(byOrder);
export const statsSorted = () => [...stats].sort(byOrder);

/** career-listings „Veröffentlichungsstatus“: nur `published` und nicht abgelaufen (Stichtag = Build). */
export function isLive(offer: Offer, now: Date = new Date()): boolean {
  if (offer.status !== "published") return false;
  if (offer.validThrough && new Date(offer.validThrough) < now) return false;
  return true;
}

const byDateDesc = (a: Offer, b: Offer) => b.datePosted.localeCompare(a.datePosted);
export const liveJobs = (now?: Date) => jobs.filter((j) => isLive(j, now)).sort(byDateDesc);
export const liveTrainings = (now?: Date) => trainings.filter((t) => isLive(t, now)).sort(byDateDesc);
export const allOffers = (): Offer[] => [...jobs, ...trainings];

export function offerPath(offer: Offer): string {
  return offer.type === "job" ? `/karriere/stellen/${offer.slug}/` : `/karriere/ausbildung/${offer.slug}/`;
}

export function emailFor(id: "general" | "management" | "careers"): string {
  return (company.emails.find((e) => e.id === id) ?? company.emails[0]!).address;
}

export function whatsappUrl(): string {
  return `https://wa.me/${company.whatsapp.e164.replace(/^\+/, "")}`;
}
