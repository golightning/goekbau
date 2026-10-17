import { Heading } from "@/components/ui/Layout";
import { cx } from "@/components/ui/cx";
import {
  partnersSorted,
  projectsSorted,
  serviceAreasSorted,
  servicesByArea,
  statsSorted,
  teamSorted,
} from "@/lib/content";
import { ContentImage } from "./ContentImage";

// --- Leistungen (company-pages „Leistungen“: geplante Leistungen sichtbar abgesetzt) ---------------

export function ServiceAreas({
  headingLevel = 2,
  plannedNote,
}: {
  headingLevel?: 2 | 3;
  plannedNote?: string;
}) {
  return (
    <div className="space-y-16">
      {serviceAreasSorted().map((area) => {
        const items = servicesByArea(area.id);
        const planned = items.length > 0 && items.every((s) => s.status === "planned");
        return (
          <section key={area.id} aria-labelledby={`bereich-${area.id}`}>
            <div className="flex flex-wrap items-baseline gap-3">
              <Heading level={headingLevel} id={`bereich-${area.id}`} size={3}>
                {area.title}
              </Heading>
              {planned && <PlannedBadge />}
            </div>
            <p className="mt-2 max-w-2xl text-slate">{area.summary}</p>
            {planned && plannedNote && <p className="mt-2 max-w-2xl text-sm text-slate">{plannedNote}</p>}
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((svc, i) => (
                <li
                  key={svc.id}
                  className={cx(
                    "flex gap-4 rounded-lg border p-5",
                    svc.status === "planned"
                      ? "border-dashed border-bronze-300 bg-bronze-50"
                      : "border-bronze-200 bg-white shadow-sm",
                  )}
                >
                  <span aria-hidden="true" className="font-accent text-2xl font-semibold text-bronze-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold">{svc.title}</p>
                    <p className="mt-1 text-slate">{svc.summary}</p>
                    {svc.status === "planned" && !planned && <PlannedBadge className="mt-3" />}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Kompakte Übersicht für die Startseite: je Bereich eine Karte mit den Leistungstiteln. */
export function ServiceAreaOverview() {
  return (
    <ul className="grid gap-6 lg:grid-cols-2">
      {serviceAreasSorted().map((area) => {
        const items = servicesByArea(area.id);
        const planned = items.length > 0 && items.every((s) => s.status === "planned");
        return (
          <li
            key={area.id}
            className={cx(
              "rounded-lg border p-6 md:p-8",
              planned
                ? "border-dashed border-bronze-300 bg-bronze-50"
                : "border-bronze-200 bg-white shadow-sm",
            )}
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <Heading level={3}>{area.title}</Heading>
              {planned && <PlannedBadge />}
            </div>
            <p className="mt-2 text-slate">{area.summary}</p>
            <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {items.map((svc) => (
                <li key={svc.id} className="flex gap-2">
                  <span aria-hidden="true" className="text-bronze-700">
                    ›
                  </span>
                  <span>{svc.title}</span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

function PlannedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block rounded-full bg-bronze-200 px-3 py-1 font-accent text-xs font-semibold text-bronze-900",
        className,
      )}
    >
      in Vorbereitung
    </span>
  );
}

// --- Projekte ---------------------------------------------------------------------------------------

export function ProjectCards({ headingLevel = 3 }: { headingLevel?: 3 | 4 }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {projectsSorted().map((p) => (
        <li key={p.slug} className="overflow-hidden rounded-lg border border-bronze-200 bg-white shadow-sm">
          {p.image && (
            <div className="aspect-4/5 overflow-hidden bg-mist">
              <ContentImage
                image={p.image}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="h-full object-cover"
              />
            </div>
          )}
          <div className="p-5">
            <p className="font-accent text-sm font-semibold text-bronze-700">{p.line}</p>
            <Heading level={headingLevel} size={4} className="mt-1">
              {p.section}
            </Heading>
            <p className="mt-2 text-sm text-slate">{[p.region, p.period].filter(Boolean).join(" · ")}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- Team (company-pages „Teammitglied ohne Foto“ → Initialen) --------------------------------------

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function TeamGrid({ headingLevel = 3, limit }: { headingLevel?: 3 | 4; limit?: number }) {
  const members = teamSorted().slice(0, limit);
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <li key={m.slug} className="flex items-center gap-5 rounded-lg border border-bronze-200 bg-white p-5">
          {m.photo ? (
            <div className="size-20 shrink-0 overflow-hidden rounded-full bg-mist">
              <ContentImage image={m.photo} sizes="80px" className="h-full object-cover" />
            </div>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-20 shrink-0 items-center justify-center rounded-full bg-bronze-100 font-heading text-2xl font-bold text-bronze-800"
            >
              {initials(m.name)}
            </span>
          )}
          <div>
            <Heading level={headingLevel} size={4}>
              {m.name}
            </Heading>
            <p className="font-accent text-sm font-semibold text-bronze-700">{m.role}</p>
            {m.qualifications.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-sm text-slate">
                {m.qualifications.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- Partner ----------------------------------------------------------------------------------------

export function PartnerLogos() {
  return (
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {partnersSorted().map((p) => {
        const logo = <ContentImage image={p.logo} sizes="160px" className="max-h-20 w-auto object-contain" />;
        return (
          <li
            key={p.slug}
            className="flex h-28 items-center justify-center rounded-lg border border-bronze-200 bg-white p-4"
          >
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>
                {logo}
                <span className="sr-only">(öffnet in neuem Fenster)</span>
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}

// --- Kennzahlen (brand-design-system „Kennzahlen ohne JavaScript“: Endwert im HTML) ---------------

const numberFormat = new Intl.NumberFormat("de-DE");

export function formatStat(value: number, grouping: boolean): string {
  return grouping ? numberFormat.format(value) : String(value);
}

export function StatList() {
  return (
    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsSorted().map((s) => (
        <div key={s.id} className="flex flex-col-reverse rounded-lg bg-white p-6 text-center shadow-sm">
          <dt className="mt-2 font-accent text-sm font-semibold text-slate">{s.label}</dt>
          <dd className="font-heading text-4xl font-bold text-bronze-800">
            {s.prefix}
            {formatStat(s.value, s.grouping)}
            {s.suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}
