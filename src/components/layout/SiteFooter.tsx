import Link from "next/link";
import { ProtectedEmail } from "@/components/ProtectedEmail";
import { Container } from "@/components/ui/Layout";
import { company } from "@/lib/content";
import { legalNav, mainNav } from "@/lib/navigation";

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  xing: "XING",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

const heading = "mb-4 font-accent text-sm font-semibold tracking-[0.15em] text-bronze-300 uppercase";
const link = "hover:text-bronze-300 underline-offset-4 hover:underline";

export function SiteFooter() {
  // site-navigation: Social-Icons nur bei echtem Profil
  const socials = Object.entries(company.social).filter(([, url]) => Boolean(url)) as [string, string][];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-2xl font-bold">{company.claim}</p>
          <p className="mt-3 text-white/85">{company.tagline}</p>
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

        <nav aria-label="Fußnavigation">
          <h2 className={heading}>Navigation</h2>
          <ul className="space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Kontakt</h2>
          <address className="space-y-2 not-italic">
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

        <nav aria-label="Rechtliches">
          <h2 className={heading}>Rechtliches</h2>
          <ul className="space-y-2">
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
      </Container>
      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-2 py-5 text-sm text-white/80 md:flex-row md:justify-between">
          <p>
            © {year} {company.name}
          </p>
          <p>
            Website von{" "}
            <a href={company.agency.url} className={link} rel="noopener" target="_blank">
              {company.agency.name}
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
