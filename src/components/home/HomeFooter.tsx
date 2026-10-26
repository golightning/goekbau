import Link from "next/link";
import { ProtectedEmail } from "@/components/ProtectedEmail";
import { company, projectsSorted } from "@/lib/content";
import { legalNav, mainNav } from "@/lib/navigation";

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  xing: "XING",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

const heading = "mb-4 font-accent text-xs font-semibold tracking-[0.22em] text-bronze-300 uppercase";
const link = "underline-offset-4 hover:text-bronze-300 hover:underline";
const inner = "mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10";

/** Footer der Startseite: Inhalte wie SiteFooter (site-navigation), Gestaltung der Richtung „Netzplan“. */
export function HomeFooter() {
  const socials = Object.entries(company.social).filter(([, url]) => Boolean(url)) as [string, string][];
  const lines = projectsSorted().map((p) => p.line.replace("Strecke ", ""));

  return (
    <footer className="hp-dark overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="hp-sleepers h-7 w-full opacity-40" />
      <div className={`${inner} grid gap-10 py-16 text-[0.95rem] md:grid-cols-2 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <p className="font-heading text-2xl font-bold">{company.claim}</p>
          <p className="mt-3 max-w-sm leading-relaxed text-white/75">{company.tagline}</p>
          <p className="mt-5 max-w-sm leading-relaxed text-white/75">
            Projekte unter anderem auf den Strecken {lines.join(", ")}.
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-3" aria-label="Social Media">
              {socials.map(([network, url]) => (
                <li key={network}>
                  <a href={url} className={link} rel="noopener noreferrer" target="_blank">
                    {socialLabels[network] ?? network}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Fußnavigation" className="lg:col-span-2">
          <h2 className={heading}>Navigation</h2>
          <ul className="space-y-2 text-white/80">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={heading}>Kontakt</h2>
          <address className="space-y-3 leading-relaxed text-white/80 not-italic">
            <p>
              {company.name}
              <br />
              {company.address.street}
              <br />
              {company.address.postalCode} {company.address.city}
              {company.address.district ? `-${company.address.district}` : ""}
            </p>
            <p>
              <ProtectedEmail address={company.emails[0]!.address} className={link} />
            </p>
          </address>
        </div>

        <nav aria-label="Rechtliches" className="lg:col-span-3">
          <h2 className={heading}>Rechtliches</h2>
          <ul className="space-y-2 text-white/80">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/datenschutz/#einstellungen" className={link}>
                Cookie-Einstellungen
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div
          className={`${inner} flex flex-col gap-2 pt-6 pb-24 text-sm text-white/70 md:flex-row md:justify-between`}
        >
          <p>
            © {new Date().getFullYear()} {company.name}
          </p>
          <p>
            Website von{" "}
            <a href={company.agency.url} className={link} rel="noopener" target="_blank">
              {company.agency.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
