# Proposal

## Why

goekbau.de läuft auf WordPress mit Elementor Pro und neun weiteren Plugins (PHP 8.0, End of Life). Für eine statische Broschüren-Website mit zwei Formularen lädt die Startseite 156 Requests und 27 JavaScript-Dateien. Google Fonts und Google Maps werden ohne Einwilligung geladen. Dazu kommen inhaltliche Altlasten wie doppelte Stellenanzeigen, Platzhalter-Links und Tippfehler (siehe `research/wp-audit/AUDIT.md`). Die Ablösung durch eine React-Codebasis im Git beseitigt Wartungs-, Sicherheits- und DSGVO-Risiken. Gleichzeitig ist sie die Gelegenheit, die Seite inhaltlich besser und vollständiger zu machen.

## What Changes

- Neue React-Website, die alle Seiten zur Build-Zeit als statisches HTML erzeugt und über **IONOS Deploy Now** aus `github.com/golightning/goekbau` ausgeliefert wird.
- Die Corporate-Design-Werte aus dem Elementor-Kit (Bronze `#A6875C`, Raleway, Roboto Slab; Poppins entfällt seit dem Design-Durchgang) werden als verbindliches Design-System übernommen. Layout und Komponenten werden modernisiert, der Grundaufbau bleibt (5 Hauptseiten + Recht).
- Inhalte (Leistungen, Projekte, Team, Stellen, Ausbildungen) liegen als typisierte, versionierte Dateien im Repository. Ungültige Inhalte brechen den Build ab.
- Der Karrierebereich wird neu strukturiert: **Stellenangebote** und **Ausbildungsangebote** werden getrennt und bekommen sprechende URLs unter `/karriere/…`.
- Kontakt- und Bewerbungsformular laufen über einen eigenen serverseitigen Endpoint mit Validierung, ohne Drittanbieter.
- **Security first**:
  - Mehrschichtiger Spam-Schutz mit selbst gehostetem ALTCHA statt Google reCAPTCHA.
  - Mehrstufige Prüfung und Entschärfung von Bewerbungsdateien inklusive Malware-Abgleich, bei dem nur der Hash den Server verlässt.
  - Schutz der E-Mail-Adressen vor Harvesting; SPF, DKIM und DMARC für `goekbau.de`.
  - Strikte CSP und Server-Härtung.
  - Automatisierte Sicherheitsscans in der Pipeline.
  - Zielniveau OWASP ASVS Level 2.
- Behebung der heute defekten Mail-Zustellung, die seit mindestens 02/2026 jeden Monat Fehler meldet, plus Überwachung, damit Ausfälle nicht mehr unbemerkt bleiben.
- Datenschutz by default: Schriften selbst gehostet, Google Maps erst nach Klick, keine Drittanbieter-Requests vor der Einwilligung.
- SEO-Grundlagen: `lang="de"`, eigene Meta-Daten pro Seite, Sitemap, strukturierte Daten (Organization, JobPosting).
- **BREAKING**: Die URLs `/stellenanzeige-2/` bis `/stellenanzeige-6/` entfallen und werden per 301 auf die neuen Karriere-URLs umgeleitet. WordPress-Endpunkte (`/wp-admin`, `/wp-json`, `/wp-content/…`) gibt es danach nicht mehr.
- **BREAKING**: WordPress, Elementor und alle Plugins werden nach dem Go-live abgeschaltet.

## Capabilities

### New Capabilities

- `brand-design-system`: Corporate-Design-Tokens (Farbe, Typografie, Abstände, Breakpoints) und deren verbindliche Anwendung, responsives Verhalten und Bewegung.
- `site-navigation`: Header, Hauptnavigation (Desktop/Mobil), Footer, schnelle Kontaktwege (Telefon, E-Mail, WhatsApp) und die 404-Seite.
- `company-pages`: Inhalte und Sektionen von Startseite, Über uns, Leistungen, Kontakt, Impressum und Datenschutz.
- `career-listings`: Karriere-Übersicht sowie Detailseiten für Stellen- und Ausbildungsangebote.
- `form-submissions`: Annahme, Prüfung und Zustellung von Kontaktanfragen und Bewerbungen inklusive Dateianhängen.
- `upload-security`: Typprüfung, Entschärfung und Malware-Abgleich hochgeladener Dateien, ohne Weitergabe an Dritte.
- `spam-protection`: Mehrschichtige Abwehr von Formular-Spam (ALTCHA, Honeypot, Zeitstempel, Rate-Limit, Inhalts- und Adressprüfung, CSRF).
- `email-security`: Schutz vor Adress-Harvesting, sicherer und authentifizierter Mailversand, Domain-Authentifizierung, Zustellungsüberwachung.
- `web-security`: Sicherheits-Header und CSP, Server-Härtung, Scans der Lieferkette, DAST, datensparsames Logging, security.txt.
- `privacy-consent`: Einwilligungsverwaltung und die Regel, dass vor einer Einwilligung keine Drittanbieter-Ressourcen geladen werden.
- `seo-metadata`: Seitentitel, Beschreibungen, Social-Previews, strukturierte Daten, Sitemap und robots.txt.
- `legacy-url-redirects`: Erhalt bzw. Umleitung aller bisherigen WordPress-URLs.
- `content-model`: Struktur, Validierung und Pflege-Workflow der Inhalte im Repository.
- `accessibility`: Barrierefreiheit nach WCAG 2.2 AA.
- `performance-budget`: Messbare Ladezeit- und Ressourcen-Budgets.
- `delivery-pipeline`: Build, Qualitätsprüfungen und Auslieferung über Deploy Now inklusive Staging.

### Modified Capabilities

_Keine. Es gibt noch keine bestehenden Specs._

## Impact

- **Repository**: neues Projekt in `github.com/golightning/goekbau` (bisher nur WordPress auf IONOS-Webspace).
- **Hosting**: neues IONOS-Deploy-Now-Projekt (PHP-Projekt, weil der Formular-Endpoint serverseitig laufen muss). DNS für `goekbau.de` und `www.goekbau.de` wird beim Go-live umgestellt.
- **E-Mail**: Der Formular-Versand braucht ein SMTP-Postfach auf `goekbau.de` (Zugangsdaten als GitHub Secret). Die Postfächer selbst bleiben unverändert bei IONOS. Die DNS-Zone von `goekbau.de` bekommt SPF-, DKIM- und DMARC-Einträge.
- **Externe Dienste** (alle kostenlos, ohne Weitergabe personenbezogener Daten): abuse.ch MalwareBazaar (nur SHA-256-Hashes, kostenloser API-Key). Google reCAPTCHA, Google Fonts und CookieYes entfallen.
- **Inhalte**: Texte und Bilder werden aus WordPress übernommen und redaktionell überarbeitet. Bei Team-Fotos, Projektdetails und Partner-Logos ist der Kunde zuzuarbeiten.
- **Abschaltung**: WordPress-Installation, Datenbank und Plugin-Lizenzen (Elementor Pro, Unlimited Elements Premium) entfallen nach Go-live und Abnahme.
