# Tasks

## 1. Fundament & Hosting-Spike

- [ ] 1.1 Git-Remote `golightning/goekbau` einrichten, Branch-Schutz für `main` (PR + grüne Checks) aktivieren; verifizieren: direkter Push auf `main` wird abgelehnt
- [ ] 1.2 Next.js (App Router, TypeScript strict, `output: "export"`, `trailingSlash: true`), pnpm, ESLint, Prettier, Vitest aufsetzen; verifizieren: `pnpm build` erzeugt `out/index.html`, `pnpm lint && pnpm test` grün
- [ ] 1.3 **Spike Deploy Now**: PHP-Projekt mit Minimal-`out/`, `api/ping.php` und `.htaccess` (1× 301, 1× 410, 1× Custom-Header, 404-ErrorDocument) deployen; verifizieren per `curl -I` auf der Staging-URL, Ergebnis in `docs/adr/0001-deploy-now.md` dokumentieren (bei Fehlschlag: Fallback aus design.md D2 entscheiden, bevor es weitergeht)
- [ ] 1.4 Lokalen Prod-Nachbau anlegen: `docker-compose.yml` mit `php:8.3-apache` (mod_rewrite/headers) + Mailpit, mountet `out/`, `api/`, `.htaccess`; verifizieren: `docker compose up` liefert `http://localhost:8080/` und Mailpit-UI erreichbar
- [ ] 1.5 Deploy-Now-Workflow um Gates erweitern (Typecheck, Lint, Test, Build, gitleaks) und Staging-Deployments für Nicht-`main`-Branches aktivieren; verifizieren: Test-PR erzeugt Staging-URL, absichtlich roter Test verhindert Deployment

## 2. Design-System

- [ ] 2.1 Tokens in Tailwind v4 `@theme` anlegen (Farben inkl. `bronze-700` mit berechnetem Kontrast ≥ 4,5:1, Typo-Skala, Spacing, Breakpoints, Container), Tailwind-Default-Farben entfernen; verifizieren: Unit-Test prüft Kontrastwerte der Token-Paare, Klasse `bg-red-500` erzeugt kein CSS
- [ ] 2.2 Lint-Regeln gegen Arbitrary Colors (`bg-[#…]`, Inline-Hex) einrichten; verifizieren: Fixture-Datei mit `#ff0000` lässt `pnpm lint` fehlschlagen
- [ ] 2.3 Raleway, Roboto Slab, Poppins als WOFF2 (latin + latin-ext) selbst hosten via `next/font/local`; verifizieren: Playwright-Test zeichnet Requests auf, keiner an `fonts.googleapis.com`/`fonts.gstatic.com`
- [ ] 2.4 Logo als SVG nachbauen bzw. hochauflösend aufbereiten, Favicons + Apple-Touch-Icon + OG-Standardbild (1200×630) erzeugen; verifizieren: visuelle Prüfung bei 2× DPR, Dateien in `public/`
- [ ] 2.5 Basiskomponenten bauen (Button, Link, Section, Container, Card, Heading, Field, Disclosure, Tabs) inkl. Fokus-Stilen und Reduced-Motion-Varianten; verifizieren: Komponenten-Übersichtsseite `/_styleguide/` (nur dev/staging, `noindex`) + axe-Test ohne serious/critical

## 3. Inhaltsmodell & Migration

- [ ] 3.1 Velite einrichten und Zod-Schemas für `company`, `pages`, `services`, `service-areas`, `projects`, `team`, `partners`, `stats`, `careers/jobs`, `careers/trainings` anlegen (inkl. Slug-Eindeutigkeit, Pflicht-`alt`/`decorative`, SEO-Feldlängen, `legacyPaths`); verifizieren: Vitest mit gültigen und ungültigen Fixtures, Fehlermeldungen nennen Datei + Feld
- [ ] 3.2 Lint-Regel/Test gegen hartkodierte Stammdaten (Telefon, E-Mail, Adresse außerhalb `content/company.yaml`); verifizieren: Fixture mit Telefonnummer-Literal schlägt fehl
- [ ] 3.3 WordPress-Export in `_wp-export/` auswerten (Elementor-JSON je Seite, Formular-Einstellungen, Medien-Originale) bzw. – falls nicht vorhanden – Crawl aus `research/wp-audit/` nutzen; verifizieren: Originalbilder in `content/media/` mit Herkunftsliste
- [ ] 3.4 Inhalte migrieren und redaktionell bereinigen (Tippfehler B9, Widerspruch B13, Leistungs-Status, Stellen vs. Ausbildungen); verifizieren: `pnpm build` grün, `research/wp-audit/MIGRATION.md` listet alle 12 WP-Seiten mit Ziel/Begründung
- [ ] 3.5 Content-Pflege-Anleitung in `docs/content.md` (neue Stelle anlegen, Kennzahl ändern, Bild hinzufügen, PR-Workflow); verifizieren: Anleitung an einer Test-Stelle durchgespielt, Stelle erscheint auf Staging

## 4. Layout & Navigation

- [ ] 4.1 Root-Layout mit `lang="de"`, Skip-Link, Landmarks, Header (Logo, Hauptnavigation, `aria-current`), Footer (Stammdaten, Rechtliches, Cookie-Einstellungen, Barrierefreiheit, Social nur wenn konfiguriert); verifizieren: Playwright-Tests für aktiven Menüpunkt inkl. Karriere-Unterseite und fehlende Social-Icons
- [ ] 4.2 Mobile Navigation (Disclosure/Dialog, `aria-expanded`, Escape, Fokus-Rückgabe); verifizieren: Playwright-Test im 390-px-Viewport für Öffnen/Schließen/Fokus
- [ ] 4.3 WhatsApp- und Telefon-Schnellkontakt (reiner Link, `https://wa.me/491621991444` aus Stammdaten); verifizieren: Test prüft `href` und dass ohne Klick kein Request an WhatsApp/Meta erfolgt
- [ ] 4.4 404-Seite + Apache `ErrorDocument 404`; verifizieren: E2E gegen Docker-Nachbau – `/gibt-es-nicht/` → Status 404 mit gestalteter Seite

## 5. Unternehmensseiten

- [ ] 5.1 Startseite gemäß Sektionsfolge (`company-pages`), ein Hero-Motiv mit priorisiertem LCP-Bild; verifizieren: Test auf genau eine `h1`, CTA-Ziele, keine doppelten Hero-Inhalte
- [ ] 5.2 Leistungen inkl. Gruppierung nach Bereich und Kennzeichnung „in Vorbereitung“, gemeinsame Quelle mit Startseite; verifizieren: Test mit `planned`-Fixture zeigt Hinweis auf beiden Seiten
- [ ] 5.3 Über uns (Profil, Werte, Kennzahlen mit SSR-Endwert + optionaler Animation, Projekte, Team mit Initialen-Fallback, Partner); verifizieren: Test ohne JS zeigt echte Kennzahlen, Reduced-Motion-Test ohne Animation, Team-Fixture ohne Foto zeigt Initialen
- [ ] 5.4 Kontaktseite (Formular-Slot, `<address>`, Telefon, WhatsApp, E-Mails, Karten-Platzhalter); verifizieren: Test auf `<address>` und Links
- [ ] 5.5 Impressum, Datenschutz (aktualisiert auf tatsächliche Dienste: IONOS, Formular-E-Mail, Maps nach Einwilligung, WhatsApp-Link; ohne Google Fonts/CookieYes/Elementor), Barrierefreiheitserklärung; verifizieren: Review-Checkliste in PR, Footer-Links per Test

## 6. Karriere

- [ ] 6.1 Übersicht `/karriere/` mit getrennten Listen „Stellenangebote“ / „Aus- und Weiterbildung“, Leer-Zustand mit Initiativbewerbung; verifizieren: Tests mit 2/3-Fixture und 0-Jobs-Fixture
- [ ] 6.2 Detailseiten `/karriere/stellen/[slug]/` und `/karriere/ausbildung/[slug]/` via `generateStaticParams`, nur `published` und nicht abgelaufen; verifizieren: Test mit abgelaufener Fixture – nicht gelistet, keine Seite erzeugt
- [ ] 6.3 JSON-LD `JobPosting` nur für Typ `job`; verifizieren: Unit-Test validiert Pflichtfelder gegen schema.org-Definition, Ausbildungsseite ohne JobPosting

## 7. Formulare

- [ ] 7.1 Gemeinsames Feld-Schema (Kontakt, Bewerbung) als Single Source für Client-Validierung und PHP-Regeln (Export als JSON); verifizieren: Vitest + PHPUnit laufen gegen dieselben Testfälle
- [ ] 7.2 PHP-Endpoint `api/submit.php` (Composer, PHPMailer): Validierung → 422, Upload-Prüfung via `finfo` (PDF/DOC/DOCX/JPG/PNG, ≤ 5 Dateien, ≤ 10 MB), Honeypot, HMAC-Zeitstempel, Rate-Limit (gehashte IP, 5/h → 429), SMTP-Versand mit eigenem `From` + `Reply-To`, 502 bei SMTP-Fehler, Temp-Dateien im `finally` löschen, Logs ohne Inhalte; verifizieren: PHPUnit für jede Regel aus `form-submissions`
- [ ] 7.3 Konfiguration über Deploy-Now-Runtime-Secrets (SMTP, Empfänger je Formular, HMAC-Secret) + `.env.example` ohne Werte; verifizieren: gitleaks grün, Endpoint verweigert Start ohne Konfiguration mit klarer Log-Meldung
- [ ] 7.4 React-Formular-Komponenten (Labels, Pflichtkennzeichnung, `aria-describedby`-Fehler, Live-Region, Ladezustand, Doppelklick-Schutz, vorbelegte Position) mit No-JS-Fallback auf `/kontakt/danke/` bzw. `/kontakt/fehler/` (`noindex`); verifizieren: Playwright gegen Docker+Mailpit – Kontakt, Bewerbung mit 2 PDFs, `.exe` abgelehnt, > 10 MB abgelehnt, Honeypot, 6. Request → 429, JS deaktiviert → Ergebnisseite
- [ ] 7.5 Echte Zustellung auf Staging mit IONOS-SMTP testen; verifizieren: Testmail kommt im Kundenpostfach an, Antworten gehen an `Reply-To`

## 8. Datenschutz & Einwilligung

- [ ] 8.1 `ExternalMediaConsent`-Komponente für Google Maps (statischer Platzhalter, „Karte laden“, „Immer laden“, externer Link); verifizieren: Playwright – ohne Klick kein Google-Request, nach Klick iframe geladen
- [ ] 8.2 Einstellungen „Cookie-Einstellungen“ (Anzeige + Widerruf), Storage nur nach „Immer laden“; verifizieren: Test – Erstbesuch ohne Cookies/Storage, Widerruf verhindert Auto-Laden
- [ ] 8.3 Globaler Test „nur eigener Origin“ über alle Routen ohne Einwilligung; verifizieren: Playwright-Netzwerk-Mitschnitt je Route enthält ausschließlich `localhost:8080` bzw. Produktions-Origin

## 9. SEO & Redirects

- [ ] 9.1 Metadaten je Seite aus Inhaltsmodell (Titel-Suffix, Description-Längen, Canonical mit Slash, OG/Twitter, `og:locale de_DE`), Build-Check auf Eindeutigkeit; verifizieren: Unit-Test für doppelte Titel/fehlende Description
- [ ] 9.2 `Organization`/`LocalBusiness`-JSON-LD aus Stammdaten; verifizieren: Test vergleicht JSON-LD-Telefon mit Footer-Telefon
- [ ] 9.3 `sitemap.xml` + `robots.txt` (Staging: `noindex` + Disallow); verifizieren: Test – neue Stellen-Fixture erscheint in Sitemap, 404/Danke-Seiten nicht
- [ ] 9.4 Redirect-Generator `config/redirects.ts` → `.htaccess` (Stellen aus `legacyPaths`, Sitemaps, Feeds, WP-Pfade 410, Trailing-Slash), Sicherheits- und Cache-Header; verifizieren: Vitest für Generator + Playwright/`curl`-Suite gegen Docker prüft jeden Eintrag auf Status und `Location` sowie alle Header

## 10. Qualitäts-Gates

- [ ] 10.1 axe-Prüfung über alle Routen in CI (Fail bei serious/critical); verifizieren: absichtlich entferntes Label lässt CI fehlschlagen
- [ ] 10.2 Lighthouse CI (mobil) für Start, Über uns, Karriere, Kontakt mit Assertions (LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms, Score ≥ 90) + Bundle-Budget (≤ 30 Requests, JS ≤ 120 KB, CSS ≤ 40 KB auf Startseite); verifizieren: CI-Report grün, Budget-Überschreitung per Test-Branch provoziert Fehlschlag
- [ ] 10.3 Bildpipeline (`next-image-export-optimizer`, AVIF/WebP, `srcset`, Lazy-Loading, LCP-Priorität); verifizieren: Playwright bei 390 px lädt Hero-Variante ≤ 800 px

## 11. Abnahme & Go-live

- [ ] 11.1 Staging-Abnahme durch GÖK (Inhalte, Bilder, Formulare an echte Postfächer); verifizieren: schriftliche Freigabe im PR/Issue
- [ ] 11.2 Cutover vorbereiten: DNS-TTL auf 300 s, alte DNS-Werte in `docs/runbook-cutover.md`, Custom Domain in Deploy Now; verifizieren: Runbook-Review
- [ ] 11.3 DNS umstellen (nur A/AAAA/CNAME, MX unverändert); verifizieren: Redirect-Crawl gegen alte Sitemap (alle 12 URLs → 200/301 korrekt), Header-Check, Formular-Testsendung in Produktion, Mail-Empfang `info@goekbau.de` unverändert
- [ ] 11.4 Google Search Console: Sitemap einreichen, Abdeckung nach 7 Tagen prüfen; verifizieren: keine neuen 404-Fehler für alte URLs
- [ ] 11.5 Nach 30 Tagen ohne Rollback: WordPress-Backup archivieren, Installation und Plugin-Lizenzen kündigen; verifizieren: Bestätigung IONOS/Lizenzportale, Backup-Ablageort dokumentiert
