import Link from "next/link";
import { ContentImage } from "@/components/content/ContentImage";
import { formatStat } from "@/components/content/Collections";
import { Prose } from "@/components/content/Prose";
import { LinkButton } from "@/components/ui/Button";
import { cx } from "@/components/ui/cx";
import {
  company,
  partnersSorted,
  projectsSorted,
  serviceAreasSorted,
  servicesByArea,
  statsSorted,
  teamSorted,
  telUrl,
  type Block,
} from "@/lib/content";

const margin = "px-5 lg:px-8";

/** intro – „Narrow column, empty field“: schmale Textspalte, viel freie Fläche, keine Überschrift sichtbar. */
export function IntroColumn({ block }: { block: Block }) {
  return (
    <section aria-labelledby="intro-titel" className={cx("bg-white pt-24 pb-40 lg:pt-28", margin)}>
      <h2 id="intro-titel" className="sr-only">
        {block.title}
      </h2>
      <div className="reveal w-[84%] max-w-[27rem] lg:ml-[15%] [&_p]:text-lg [&_p]:leading-relaxed [&_p+p]:mt-5 [&_strong]:font-bold">
        {block.body && <div dangerouslySetInnerHTML={{ __html: block.body }} />}
        {block.cta && (
          <p className="mt-5">
            <Link href={block.cta.href} className="link-line font-heading font-bold">
              {block.cta.label}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

/** list – „One item per poster line“: Leistungen groß links, das Detail klein rechts auf derselben Grundlinie. */
export function ServicePoster({ block }: { block: Block }) {
  const all = serviceAreasSorted().flatMap((a) => servicesByArea(a.id));
  const offered = all.filter((s) => s.status === "offered" && s.poster);
  const planned = all.filter((s) => s.status === "planned");
  return (
    <section aria-labelledby="leistungen-titel" className={cx("bg-mist py-20 lg:py-28", margin)}>
      <h2 id="leistungen-titel" className="sr-only">
        {block.title}
      </h2>
      <ul>
        {offered.map((s, i) => (
          <li
            key={s.id}
            className="reveal group flex flex-col justify-between gap-1 py-1 lg:flex-row lg:items-baseline lg:gap-8"
            style={{ "--i": i % 4 } as React.CSSProperties}
          >
            <span className="font-heading text-[9vw] leading-[0.92] font-bold tracking-[-0.03em] uppercase transition-colors group-hover:text-bronze-800 lg:text-[length:var(--text-poster)]">
              {s.poster!.label}
            </span>
            <span className="pb-4 text-base text-ink tabular-nums lg:pb-0">
              <span className="sr-only">{s.title}: </span>
              {s.poster!.detail}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-baseline lg:justify-between">
        {planned.length > 0 && (
          <p className="max-w-[52ch] text-base">
            Noch in Vorbereitung:{" "}
            {planned.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ", "}
                <span>{s.title}</span>
              </span>
            ))}
            .
          </p>
        )}
        {block.cta && (
          <Link href={block.cta.href} className="link-line font-heading text-lg font-bold">
            {block.cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

// work – „Loose scatter with pauses“: vier Plätze auf dem 12er-Raster, die Bemerkung steht in der Lücke von Reihe 2
const placements = [
  { box: "lg:col-start-1 lg:col-span-6 lg:row-start-1", ratio: "aspect-[3/2]", phone: "w-full" },
  {
    box: "lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:mt-32",
    ratio: "aspect-[4/5]",
    phone: "ml-auto w-[68%]",
  },
  { box: "lg:col-start-2 lg:col-span-6 lg:row-start-2", ratio: "aspect-video", phone: "w-[82%]" },
  { box: "lg:col-start-6 lg:col-span-5 lg:row-start-3", ratio: "aspect-[3/2]", phone: "ml-auto w-[88%]" },
];

export function ProjectScatter({ block }: { block: Block }) {
  const projects = projectsSorted();
  return (
    <section aria-labelledby="strecken-titel" className={cx("bg-white py-28 lg:py-40", margin)}>
      <h2 id="strecken-titel" className="reveal font-heading text-3xl font-bold tracking-[-0.02em]">
        {block.title}
      </h2>
      <div className="mt-16 grid grid-cols-1 gap-y-[72px] lg:grid-cols-12 lg:gap-x-6 lg:gap-y-[14vh]">
        {projects.map((p, i) => {
          const place = placements[i % placements.length]!;
          return (
            <figure key={p.slug} className={cx(place.phone, place.box, "lg:w-auto")}>
              <figcaption className="contents">
                <span className="mb-2 block text-xs text-slate">{p.line}</span>
              </figcaption>
              {p.image && (
                <div className={cx("overflow-hidden bg-mist", place.ratio)}>
                  <ContentImage
                    image={p.image}
                    sizes="(min-width: 1024px) 50vw, 90vw"
                    className="reveal-image h-full object-cover"
                  />
                </div>
              )}
              <p className="mt-3 text-base">
                {p.section}
                {p.period && <span className="text-slate"> · {p.period}</span>}
              </p>
            </figure>
          );
        })}
        {block.body && (
          <div className="reveal text-xl leading-snug lg:col-start-9 lg:col-span-3 lg:row-start-2 lg:self-end">
            <Prose html={block.body} />
          </div>
        )}
      </div>
    </section>
  );
}

/** stats – „Quiet figure lines“: Zahl rechtsbündig, ein Satz daneben, ohne die Stimme zu heben. */
export function FigureLines({ block }: { block: Block }) {
  return (
    <section aria-labelledby="zahlen-titel" className={cx("bg-white py-[18vh]", margin)}>
      <div className="lg:ml-[calc(100%/12)] lg:w-1/2">
        <h2
          id="zahlen-titel"
          className="reveal mb-14 pl-[calc(88px+24px)] font-heading text-3xl font-bold lg:pl-[calc(132px+24px)]"
        >
          {block.title}
        </h2>
        <dl className="space-y-7">
          {statsSorted().map((s, i) => (
            <div
              key={s.id}
              className="reveal grid grid-cols-[88px_1fr] items-baseline gap-x-6 lg:grid-cols-[132px_1fr]"
              style={{ "--i": i } as React.CSSProperties}
            >
              <dt className="text-right font-heading text-xl font-bold tabular-nums">
                {s.prefix}
                {formatStat(s.value, s.grouping)}
                {s.suffix}
                <span className="sr-only"> {s.label}</span>
              </dt>
              <dd className="max-w-[40ch] text-base">{s.sentence ?? s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** about – „Side facts, wide paragraph“: Eckdaten links, ein breiter Absatz, darunter Team und Partner. */
export function TeamFacts({ block }: { block: Block }) {
  const team = teamSorted();
  const partners = partnersSorted();
  const facts = [
    ["Gegründet", `Mai ${company.foundingYear}`],
    ["Sitz", `${company.address.city}-${company.address.district ?? ""}`.replace(/-$/, "")],
    ["Team", `${team.length} Fachleute`],
  ];
  const listCol = "space-y-2.5 text-base";
  return (
    <section aria-labelledby="team-titel" className={cx("bg-mist py-28 lg:py-36", margin)}>
      <h2 id="team-titel" className="sr-only">
        {block.title}
      </h2>
      <div className="grid gap-10 lg:grid-cols-[34%_1fr]">
        <dl className="reveal order-2 grid grid-cols-2 gap-5 lg:order-1 lg:block lg:w-40 lg:space-y-5">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate">{label}</dt>
              <dd className="text-base font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="reveal order-1 lg:order-2 lg:w-[86%]">
          {block.body && <Prose html={block.body} className="max-w-none text-xl leading-snug" />}
        </div>
      </div>
      <div className="mt-28 grid gap-10 lg:grid-cols-[34%_1fr]">
        <p className="font-heading text-base font-bold">Team</p>
        <ul className={cx(listCol, "reveal lg:columns-2 lg:gap-16")}>
          {team.map((m) => (
            <li key={m.slug} className="flex justify-between gap-4 break-inside-avoid">
              <span className="font-bold">{m.name}</span>
              <span className="text-right text-slate">{m.role}</span>
            </li>
          ))}
        </ul>
        <p className="font-heading text-base font-bold">Partner</p>
        <ul className={cx(listCol, "reveal lg:columns-2 lg:gap-16")}>
          {partners.map((p) => (
            <li key={p.slug} className="break-inside-avoid">
              {p.name}
            </li>
          ))}
        </ul>
      </div>
      {block.cta && (
        <p className="mt-16 lg:ml-[34%]">
          <Link href={block.cta.href} className="link-line font-heading text-lg font-bold">
            {block.cta.label}
          </Link>
        </p>
      )}
    </section>
  );
}

/** cta – „The idea again, inverted“: Karriere als umgekehrte Fläche mit großer Zeile. */
export function CareerInverted({ block }: { block: Block }) {
  const words = (block.title ?? "").split(" ");
  const last = words.pop();
  return (
    <section
      aria-labelledby="karriere-titel"
      className={cx(
        "flex min-h-[80svh] flex-col justify-between bg-ink pt-20 pb-24 text-white lg:min-h-[90svh]",
        margin,
      )}
    >
      <h2
        id="karriere-titel"
        className="reveal font-heading text-[10vw] leading-[0.9] font-bold tracking-[-0.04em] whitespace-nowrap lg:text-[9vw]"
      >
        {words.join(" ")} <br />
        {last}
      </h2>
      <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {block.body && <Prose html={block.body} className="reveal max-w-[44ch] text-lg lg:text-xl" />}
        {block.cta && (
          <LinkButton href={block.cta.href} variant="accent" className="w-full lg:w-auto">
            {block.cta.label}
          </LinkButton>
        )}
      </div>
    </section>
  );
}

/** contact – „Address in display rows“: zuerst der Gruß mit Pfeil, darunter Anschrift und Telefon in großen Zeilen. */
export function ContactRows({ block }: { block: Block }) {
  const { address } = company;
  const row = "flex min-h-[84px] items-end px-4 pb-4 lg:min-h-[150px] lg:px-5 lg:pb-6";
  const size =
    "font-heading text-[7.4vw] leading-none font-bold tracking-[-0.03em] lg:text-[clamp(2.75rem,6vw,5.5rem)]";
  return (
    <section aria-labelledby="kontakt-titel">
      <div className={cx(row, "items-center gap-6 bg-bronze-500 text-ink")}>
        <h2 id="kontakt-titel" className={size}>
          {block.title}
        </h2>
        {block.cta && (
          <Link
            href={block.cta.href}
            aria-label={block.cta.label}
            className="press ml-auto inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-ink text-white lg:ml-0 lg:size-[0.9em] lg:text-[clamp(2.75rem,6vw,5.5rem)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6 lg:size-[0.45em]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        )}
      </div>
      <address className="not-italic">
        <p className={cx(row, "bg-white")}>
          <span className={size}>{company.shortName}</span>
        </p>
        <p className={cx(row, "bg-mist")}>
          <span className={size}>{address.street}</span>
        </p>
        <p className={cx(row, "bg-white")}>
          <span className={size}>
            {address.postalCode} {address.city}
            {address.district ? `-${address.district}` : ""}
          </span>
        </p>
        <p className={cx(row, "bg-mist")}>
          <a href={telUrl()} className={cx(size, "link-line")}>
            {company.phone.display}
          </a>
        </p>
      </address>
    </section>
  );
}
