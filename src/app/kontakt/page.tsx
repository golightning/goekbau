import type { Metadata } from "next";
import { Hero } from "@/components/content/Hero";
import { ExternalMap } from "@/components/consent/ExternalMap";
import { FormSection } from "@/forms/FormSection";
import { ProtectedEmail } from "@/components/ProtectedEmail";
import { Heading, Section } from "@/components/ui/Layout";
import { company, getBlock, getPage, telUrl, whatsappUrl } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const page = getPage("kontakt");

export const metadata: Metadata = pageMetadata(page.seo, page.path);

/**
 * company-pages „Kontaktseite“: Formular (primär, email-security), Anschrift in <address>, Telefon,
 * WhatsApp, E-Mails, Karte. Formular folgt in Gruppe 7, Karten-Platzhalter in Gruppe 9.
 */
export default function ContactPage() {
  const formular = getBlock(page, "formular");
  const anfahrt = getBlock(page, "anfahrt");
  const { address } = company;
  const link = "font-semibold text-bronze-800 underline underline-offset-4";

  return (
    <main id="inhalt">
      <Hero hero={page.hero} />
      <Section>
        <div className="grid gap-14 lg:grid-cols-[3fr_2fr]">
          <section aria-labelledby="formular" id="formular-bereich">
            <Heading level={2} id="formular">
              {formular.title}
            </Heading>
            <div className="mt-6">
              <FormSection form="contact" />
            </div>
          </section>

          <aside aria-labelledby="kontaktdaten" className="space-y-8">
            <Heading level={2} id="kontaktdaten" size={3}>
              Kontaktdaten
            </Heading>
            <address className="space-y-6 not-italic">
              <div>
                <p className="font-accent text-sm font-semibold text-slate">Anschrift</p>
                <p className="mt-1">
                  {company.name}
                  <br />
                  {address.street}
                  <br />
                  {address.postalCode} {address.city}
                  {address.district ? `-${address.district}` : ""}
                </p>
              </div>
              <div>
                <p className="font-accent text-sm font-semibold text-slate">Telefon</p>
                <p className="mt-1">
                  <a href={telUrl()} className={link}>
                    {company.phone.display}
                  </a>
                </p>
              </div>
              <div>
                <p className="font-accent text-sm font-semibold text-slate">WhatsApp</p>
                <p className="mt-1">
                  <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={link}>
                    Nachricht per WhatsApp
                    <span className="sr-only"> (öffnet in neuem Fenster)</span>
                  </a>
                </p>
              </div>
              <div>
                <p className="font-accent text-sm font-semibold text-slate">E-Mail</p>
                <ul className="mt-1 space-y-1">
                  {company.emails.map((e) => (
                    <li key={e.id}>
                      <span className="text-slate">{e.label}: </span>
                      <ProtectedEmail address={e.address} className={link} />
                    </li>
                  ))}
                </ul>
              </div>
            </address>
          </aside>
        </div>
      </Section>
      <Section tone="mist" labelledBy="anfahrt">
        <Heading level={2} id="anfahrt">
          {anfahrt.title}
        </Heading>
        <div className="mt-6">
          <ExternalMap
            label={company.name}
            query={`${address.street}, ${address.postalCode} ${address.city}`}
            addressLines={[
              address.street,
              `${address.postalCode} ${address.city}${address.district ? `-${address.district}` : ""}`,
            ]}
          />
        </div>
      </Section>
    </main>
  );
}
