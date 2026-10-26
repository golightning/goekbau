import type { Metadata } from "next";
import Link from "next/link";
import { ContentImage } from "@/components/content/ContentImage";
import { Prose } from "@/components/content/Prose";
import { ProtectedEmail } from "@/components/ProtectedEmail";
import { CountUp, MotionToggle, TrackScroller } from "@/components/home/HomeMotion";
import { NetworkMap } from "@/components/home/NetworkMap";
import { RowArrow } from "@/components/home/RowArrow";
import { LinkButton } from "@/components/ui/Button";
import {
  company,
  getBlock,
  getPage,
  liveJobs,
  liveTrainings,
  offerPath,
  projectsSorted,
  serviceAreasSorted,
  servicesByArea,
  statsSorted,
  teamSorted,
} from "@/lib/content";
import { serializeJsonLd } from "@/lib/job-posting";
import { pageMetadata } from "@/lib/metadata";
import { organizationJsonLd } from "@/lib/organization";

const page = getPage("home");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

const inner = "mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10";
const kicker = "font-accent text-xs tracking-[0.22em] uppercase";
const two = (n: number) => String(n).padStart(2, "0");

/** „Sicher bauen *am Gleis.*“ → Text zwischen Sternchen in Gold (content/pages/home.yaml) */
function emphasize(text: string) {
  return text.split(/\*(.+?)\*/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="text-bronze-300">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** „Strecke 5830 (FUB)“ → ["5830", "(FUB)"] */
function lineParts(line: string): [string, string] {
  const num = line.match(/\d+/)?.[0] ?? line;
  return [num, line.replace("Strecke", "").replace(num, "").trim()];
}

/**
 * company-pages „Startseite“ in der Richtung „Netzplan“ (redesign-home-page): Hero mit Streckennetz, Kennzahlen,
 * Projekte als Fahrt entlang des Gleises, Leistungen, Über uns mit Team, Karriere, Kontakt.
 */
export default function HomePage() {
  const intro = getBlock(page, "intro");
  const leistungen = getBlock(page, "leistungen");
  const projekte = getBlock(page, "projekte");
  const naechsterHalt = getBlock(page, "naechster-halt");
  const karriere = getBlock(page, "karriere");
  const kontakt = getBlock(page, "kontakt");
  const areas = serviceAreasSorted().map((a) => ({ ...a, services: servicesByArea(a.id) }));
  const rowStart = areas.map((_, i) => areas.slice(0, i).reduce((n, a) => n + a.services.length, 0));
  const projects = projectsSorted();
  const team = teamSorted();
  const offers = [...liveJobs(), ...liveTrainings()];
  const city = company.address.city;

  return (
    <main id="inhalt">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd(company)) }}
      />

      {/* ---------- Hero: Streckennetz ---------- */}
      <section id="hero" aria-labelledby="hero-titel" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="hp-hero-glow absolute inset-0 -z-10" />
        <div aria-hidden="true" className="hp-grain absolute inset-0 -z-10" />
        <div
          className={`${inner} grid gap-10 pt-12 pb-8 lg:min-h-[calc(100svh-8.5rem)] lg:grid-cols-12 lg:items-center lg:pt-8`}
        >
          <div className="lg:col-span-5">
            {page.hero.eyebrow && <p className={`${kicker} text-bronze-300`}>{page.hero.eyebrow}</p>}
            <h1 id="hero-titel" className="hp-display mt-6 text-[clamp(3.1rem,7vw,6.6rem)]">
              {emphasize(page.hero.title)}
            </h1>
            {page.hero.lead && (
              <p className="mt-8 max-w-[34rem] text-lg leading-relaxed text-white/80">{page.hero.lead}</p>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <LinkButton href="/kontakt/" variant="gold">
                Anfrage stellen <span aria-hidden="true">→</span>
              </LinkButton>
              <LinkButton href="/leistungen/" variant="inverse">
                Unsere Leistungen
              </LinkButton>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="hidden sm:block">
              <NetworkMap hub={city} />
            </div>
            <div className="sm:hidden">
              <NetworkMap hub={city} compact />
            </div>
            <div className="mt-4 flex justify-end">
              <MotionToggle scope="hero" />
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="hp-sleepers hp-hero-rail h-7 w-full opacity-70" />
      </section>

      {/* ---------- Kennzahlen ---------- */}
      <section aria-labelledby="zahlen" className="border-b border-white/10">
        <h2 id="zahlen" className="sr-only">
          Kennzahlen
        </h2>
        <dl className={`${inner} grid grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0`}>
          {statsSorted().map((s, i) => (
            <div
              key={s.id}
              className={[
                "flex flex-col-reverse py-10 lg:py-14",
                i % 2 ? "border-l border-white/10 pl-5 sm:pl-8" : "",
                i > 1 ? "border-t border-white/10 lg:border-t-0" : "",
                i === 2 ? "lg:border-l lg:pl-8" : "",
              ].join(" ")}
            >
              <dt className="mt-3 font-accent text-[0.7rem] tracking-[0.1em] text-white/70 uppercase hyphens-auto sm:text-xs sm:tracking-[0.22em]">
                {s.label}
              </dt>
              <dd className="hp-display text-[clamp(2.2rem,6vw,5.2rem)] text-bronze-300">
                {s.prefix}
                <CountUp value={s.value} grouping={s.grouping} />
                {s.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- Projekte: Fahrt entlang des Gleises ---------- */}
      <section id="projekte" aria-labelledby="projekte-titel" className="py-20 md:py-0">
        <TrackScroller
          rail={
            <div aria-hidden="true" className={`hp-rail mt-10 w-full ${inner}`}>
              <div className="relative">
                <div className="hp-sleepers hp-rail-bed h-6 w-full opacity-40" />
                <div className="hp-rail-fill absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-bronze-300 shadow-[0_0_18px_var(--color-bronze-300)]" />
                <div className="hp-rail-train absolute top-1/2 h-4 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_24px_var(--color-bronze-300)]" />
              </div>
              <div className={`mt-3 flex justify-between ${kicker} text-white/70`}>
                <span>{city}</span>
                <span>Ihre Baustelle</span>
              </div>
            </div>
          }
        >
          <div data-panel className="hp-panel hp-panel-text self-center px-4 sm:px-6 md:px-0">
            {projekte.eyebrow && <p className={`${kicker} text-bronze-300`}>{projekte.eyebrow}</p>}
            <h2
              id="projekte-titel"
              className="hp-display mt-5 text-[clamp(2.6rem,5vw,4.6rem)] hyphens-manual"
            >
              {projekte.title}
            </h2>
            {projekte.body && (
              <Prose
                html={projekte.body}
                className="mt-6 max-w-md text-lg text-white/80 [&_a]:text-bronze-300"
              />
            )}
          </div>

          {projects.map((p, i) => {
            const [num, suffix] = lineParts(p.line);
            return (
              <article
                key={p.slug}
                data-panel
                className="hp-panel grid items-end gap-6 px-4 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10 md:px-0"
              >
                {p.image && (
                  <div className="overflow-hidden rounded-3xl bg-white/5">
                    <ContentImage
                      image={p.image}
                      sizes="(min-width: 768px) 45vh, 92vw"
                      className="aspect-[4/3] w-full object-cover md:aspect-[3/4] md:h-[58svh] md:w-auto"
                    />
                  </div>
                )}
                <div className="pb-2">
                  <p className={`${kicker} text-white/70 tabular-nums`}>
                    {two(i + 1)} / {two(projects.length)} · {p.region}
                    {suffix && ` · ${suffix}`}
                  </p>
                  <p
                    aria-hidden="true"
                    className="hp-display hp-outline mt-4 text-[clamp(4.5rem,11vw,10rem)] tabular-nums"
                  >
                    {num}
                  </p>
                  <h3 className="mt-4 font-heading text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight font-bold text-balance">
                    <span className="sr-only">{p.line}: </span>
                    {p.section}
                  </h3>
                  <p className="mt-3 text-white/70">{p.period}</p>
                </div>
              </article>
            );
          })}

          <div data-panel className="hp-panel hp-panel-text self-center px-4 sm:px-6 md:px-0">
            {naechsterHalt.eyebrow && <p className={`${kicker} text-bronze-300`}>{naechsterHalt.eyebrow}</p>}
            <h3 className="hp-display mt-5 text-[clamp(2.4rem,4.6vw,4.2rem)]">{naechsterHalt.title}</h3>
            {naechsterHalt.body && (
              <Prose
                html={naechsterHalt.body}
                className="mt-6 max-w-md text-lg text-white/80 [&_a]:text-bronze-300"
              />
            )}
            {naechsterHalt.cta && (
              <LinkButton href={naechsterHalt.cta.href} variant="gold" className="mt-8">
                {naechsterHalt.cta.label} <span aria-hidden="true">→</span>
              </LinkButton>
            )}
          </div>
        </TrackScroller>
      </section>

      {/* ---------- Leistungen ---------- */}
      <section
        id="leistungen"
        aria-labelledby="leistungen-titel"
        className="border-t border-white/10 py-24 md:py-32"
      >
        <div className={inner}>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              {leistungen.eyebrow && <p className={`${kicker} text-bronze-300`}>{leistungen.eyebrow}</p>}
              <h2 id="leistungen-titel" className="hp-rise hp-display mt-5 text-[clamp(2.6rem,5.6vw,5.2rem)]">
                {leistungen.title}
              </h2>
            </div>
            {leistungen.body && (
              <Prose
                html={leistungen.body}
                className="text-lg text-white/80 lg:col-span-4 [&_a]:text-bronze-300"
              />
            )}
          </div>

          {areas.map((a, ai) => {
            const planned = a.services.every((s) => s.status === "planned");
            return (
              <div key={a.id} className="mt-16 md:mt-20">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-white/15 pb-4">
                  <h3 className={`${kicker} text-white/75`}>{a.title}</h3>
                  {planned && (
                    <span className="rounded-full border border-dashed border-bronze-300/70 px-3 py-1 font-accent text-[0.7rem] tracking-[0.16em] text-bronze-300 uppercase">
                      in Vorbereitung
                    </span>
                  )}
                </div>
                <ul>
                  {a.services.map((s, si) => (
                    <li key={s.id} className="hp-rise">
                      <Link
                        href={`/leistungen/#bereich-${a.id}`}
                        className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-white/10 py-6 transition-colors duration-300 hover:bg-white/[0.03] md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)_2.75rem] md:items-baseline md:gap-x-8 md:px-4 md:py-7"
                      >
                        <span className={`${kicker} pt-2 text-bronze-300 tabular-nums`}>
                          {two(rowStart[ai]! + si + 1)}
                        </span>
                        <span
                          className={`font-heading text-[clamp(1.35rem,2.6vw,2.2rem)] leading-[1.1] font-bold transition-colors duration-300 group-hover:text-bronze-300 ${planned ? "text-white/75" : ""}`}
                        >
                          {s.title}
                        </span>
                        <span className="col-start-2 leading-relaxed text-white/70 md:col-start-auto">
                          {s.summary}
                        </span>
                        <RowArrow className="hidden self-center justify-self-end md:flex" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {leistungen.cta && (
            <LinkButton href={leistungen.cta.href} variant="gold" className="mt-12">
              {leistungen.cta.label} <span aria-hidden="true">→</span>
            </LinkButton>
          )}
        </div>
      </section>

      {/* ---------- Über uns + Team ---------- */}
      <section aria-labelledby="intro-titel" className="bg-bronze-50 text-ink">
        <div className={`${inner} grid gap-14 py-24 md:py-32 lg:grid-cols-12`}>
          <div className="lg:col-span-5">
            {intro.eyebrow && <p className={`${kicker} text-bronze-700`}>{intro.eyebrow}</p>}
            <h2 id="intro-titel" className="hp-rise hp-display mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)]">
              {intro.title}
            </h2>
            {intro.body && <Prose html={intro.body} className="mt-6 max-w-lg text-lg text-ink/80" />}
            {intro.cta && (
              <LinkButton href={intro.cta.href} variant="dark" className="mt-8">
                {intro.cta.label} <span aria-hidden="true">→</span>
              </LinkButton>
            )}
          </div>
          <ul aria-label="Team" className="self-end border-t border-ink/15 lg:col-span-7">
            {team.map((m) => (
              <li
                key={m.slug}
                className="hp-rise flex items-center gap-5 border-b border-ink/15 py-5 md:gap-8"
              >
                {m.photo ? (
                  <span className="block size-16 shrink-0 overflow-hidden rounded-full bg-mist md:size-20">
                    <ContentImage image={m.photo} sizes="80px" className="h-full w-full object-cover" />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center rounded-full bg-ink font-heading text-lg font-bold text-bronze-300 md:size-20"
                  >
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-heading text-[clamp(1.3rem,2.4vw,2rem)] leading-tight font-bold">
                    {m.name}
                  </span>
                  <span className="mt-1 block text-ink/70">{m.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Karriere ---------- */}
      <section aria-labelledby="karriere-titel" className="py-24 md:py-32">
        <div className={`${inner} grid gap-14 lg:grid-cols-12`}>
          <div className="lg:col-span-5">
            {karriere.eyebrow && <p className={`${kicker} text-bronze-300`}>{karriere.eyebrow}</p>}
            <h2 id="karriere-titel" className="hp-rise hp-display mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)]">
              {karriere.title}
            </h2>
            {karriere.body && (
              <Prose
                html={karriere.body}
                className="mt-6 max-w-lg text-lg text-white/80 [&_a]:text-bronze-300"
              />
            )}
            {karriere.cta && (
              <LinkButton href={karriere.cta.href} variant="inverse" className="mt-8">
                {karriere.cta.label} <span aria-hidden="true">→</span>
              </LinkButton>
            )}
          </div>
          <ul className="self-end border-t border-white/15 lg:col-span-7">
            {offers.map((o) => (
              <li key={o.slug} className="hp-rise">
                <Link
                  href={offerPath(o)}
                  className="group flex items-center justify-between gap-6 border-b border-white/15 py-7"
                >
                  <span className="min-w-0">
                    <span className="block font-heading text-[clamp(1.3rem,2.4vw,2rem)] leading-tight font-bold transition-colors group-hover:text-bronze-300">
                      {o.title}
                    </span>
                    <span className={`mt-2 block ${kicker} text-white/70`}>
                      {o.type === "job" ? "Stelle" : "Ausbildung"} · {o.location.city}
                    </span>
                  </span>
                  <RowArrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Kontakt ---------- */}
      <section aria-labelledby="kontakt-titel" className="bg-bronze-300 text-ink">
        <div className={`${inner} py-24 md:py-32`}>
          <p className={`${kicker} text-ink/80`}>Kontakt</p>
          <h2 id="kontakt-titel" className="hp-display mt-5 max-w-[14ch] text-[clamp(2.8rem,7vw,6.6rem)]">
            {kontakt.title}
          </h2>
          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              {kontakt.body && <Prose html={kontakt.body} className="max-w-xl text-lg text-ink/85" />}
              {kontakt.cta && (
                <Link
                  href={kontakt.cta.href}
                  className="hp-display mt-8 inline-block text-[clamp(2.1rem,5.4vw,4.6rem)] underline decoration-ink/25 decoration-4 underline-offset-[0.18em] transition-colors hover:decoration-ink"
                >
                  {kontakt.cta.label} <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <p className={`${kicker} text-ink/80`}>Oder per E-Mail</p>
              <p className="mt-3 font-heading text-[clamp(1.3rem,2.2vw,1.8rem)] font-bold">
                <ProtectedEmail
                  address={company.emails[0]!.address}
                  className="underline decoration-ink/25 decoration-2 underline-offset-4 hover:decoration-ink"
                />
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
