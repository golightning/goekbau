# Tasks

## 1. Fundament & lokaler Prod-Nachbau

- [ ] 1.1 Git-Remote `golightning/goekbau` einrichten, Branch-Schutz für `main` (PR + grüne Checks) aktivieren; verifizieren: direkter Push auf `main` wird abgelehnt
- [x] 1.2 Next.js (App Router, TypeScript strict, `output: "export"`, `trailingSlash: true`), pnpm, ESLint, Prettier, Vitest aufsetzen; verifizieren: `pnpm build` erzeugt `out/index.html`, `pnpm lint && pnpm test` grün
- [x] 1.3 Lokalen Prod-Nachbau anlegen: `docker-compose.yml` mit `php:8.3-apache` (mod_rewrite/headers) + Mailpit, mountet `out/`, `api/`, `.htaccess`; verifizieren: `docker compose up` liefert `http://localhost:8080/` und Mailpit-UI erreichbar
- [ ] 1.4 CI in GitHub Actions (ohne Deployment) mit Gates für jeden PR: Typecheck, Lint, Test, Build, gitleaks, Start des Docker-Nachbaus + E2E; verifizieren: absichtlich roter Test macht den PR-Check rot
- [ ] 1.5 Lieferketten-Sicherheit einrichten: Dependabot (npm, Composer, Actions), `pnpm audit --prod`/`composer audit` (Fail ab high), CodeQL (JS/TS), Semgrep (PHP), Actions auf Commit-SHAs gepinnt, Lockfiles Pflicht; verifizieren: Test-PR mit bekannt verwundbarer Abhängigkeit wird blockiert

## 2. Design-System

- [x] 2.1 Tokens in Tailwind v4 `@theme` anlegen (Farben inkl. `bronze-700` mit berechnetem Kontrast ≥ 4,5:1, Typo-Skala, Spacing, Breakpoints, Container), Tailwind-Default-Farben entfernen; verifizieren: Unit-Test prüft Kontrastwerte der Token-Paare, Klasse `bg-red-500` erzeugt kein CSS
- [x] 2.2 Lint-Regeln gegen Arbitrary Colors (`bg-[#…]`, Inline-Hex) einrichten; verifizieren: Fixture-Datei mit `#ff0000` lässt `pnpm lint` fehlschlagen
- [x] 2.3 Raleway, Roboto Slab, Poppins als WOFF2 (latin + latin-ext) selbst hosten via `next/font/local`; verifizieren: Playwright-Test zeichnet Requests auf, keiner an `fonts.googleapis.com`/`fonts.gstatic.com`
- [x] 2.4 Logo als SVG nachbauen bzw. hochauflösend aufbereiten, Favicons + Apple-Touch-Icon + OG-Standardbild (1200×630) erzeugen; verifizieren: visuelle Prüfung bei 2× DPR, Dateien in `public/`
- [x] 2.5 Basiskomponenten bauen (Button, Link, Section, Container, Card, Heading, Field, Disclosure, Tabs) inkl. Fokus-Stilen und Reduced-Motion-Varianten; verifizieren: Komponenten-Übersichtsseite `/_styleguide/` (nur dev/staging, `noindex`) + axe-Test ohne serious/critical

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
- [ ] 7.2 PHP-Endpoint-Gerüst `api/submit.php` (Composer, PSR-4, PHP 8.3 strict types) als Stufen-Pipeline laut design.md D11 mit austauschbaren Stufen; Feldvalidierung → 422 (deutsche, feldbezogene Meldungen), Temp-Dateien im `finally` löschen; verifizieren: PHPUnit für Pipeline-Reihenfolge (Abbruch vor Upload-Verarbeitung bei Spam) und Validierung
- [ ] 7.3 Konfiguration über Deploy-Now-Runtime-Secrets (SMTP, Empfänger je Formular, HMAC-Secrets für Formular-Token/ALTCHA/IP-Salt, MalwareBazaar-Key, Monitoring-Test-Token) + `.env.example` ohne Werte; verifizieren: gitleaks grün, Endpoint verweigert Betrieb ohne vollständige Konfiguration mit generischer 503 und klarer Log-Meldung
- [ ] 7.4 React-Formular-Komponenten (Labels, Pflichtkennzeichnung, `aria-describedby`-Fehler, Live-Region, Ladezustand, Doppelklick-Schutz, vorbelegte Position, Datei-Vorprüfung Typ/Größe/Anzahl, ALTCHA-Widget) mit No-JS-Fallback auf `/kontakt/danke/` bzw. `/kontakt/fehler/` (`noindex`); verifizieren: Playwright gegen Docker+Mailpit – Kontakt und Bewerbung mit 2 PDFs kommen an, JS deaktiviert → Ergebnisseite, 12-MB-Datei wird vor dem Absenden gemeldet
- [ ] 7.5 Echte Zustellung auf Staging mit IONOS-SMTP testen; verifizieren: Testmail kommt im Kundenpostfach an, Antworten gehen an `Reply-To`, Header zeigt `spf=pass dkim=pass dmarc=pass`

## 8. Sicherheit (Spam, Uploads, E-Mail, Härtung)

- [ ] 8.1 Spam-Schichten: signiertes Formular-Token + Origin-Prüfung (403), Honeypot (Fake-200), Zeitfenster 3 s–2 h, ALTCHA selbst gehostet (`altcha-org/altcha` PHP + Widget, Replay-Speicher), Rate-Limit IP/E-Mail mit gesalzenen Hashes (429 + `Retry-After`); verifizieren: PHPUnit je Schicht + Playwright: fremder Origin → 403, 6. Request → 429, wiederverwendete ALTCHA-Lösung abgelehnt, keine Fremd-Requests beim Ausfüllen
- [ ] 8.2 Inhalts- und Adressfilter: URL-Zähler, BBCode/HTML-Links, Sperrwortliste (konfigurierbar), Schriftsystem-Anteil, Duplikat-Hash 24 h, RFC-5322-Prüfung, MX/A-Lookup (2 s Timeout), Wegwerf-Domain-Liste als versionierte Datei; verifizieren: PHPUnit mit Spam-Korpus (≥ 30 echte Spam-Muster aus den WP-Einsendungen, anonymisiert) und Ham-Korpus (≥ 10 legitime Anfragen) – 0 False Positives im Ham-Korpus
- [ ] 8.3 Upload-Schichten 1–2: Allowlist PDF/DOCX/JPG/PNG mit Magic-Byte- + Endungs- + MIME-Abgleich, Grenzen 5 Dateien/10 MB vor Verarbeitung, ZIP-Statistik (Einträge, Größe, Ratio, Pfade) vor Entpacken; verifizieren: PHPUnit mit Testkorpus (EXE als PDF, DOC/DOCM/RTF/ZIP, Zip-Bombe, Path-Traversal-DOCX)
- [ ] 8.4 Upload-Schichten 3–5: Bild-Neukodierung ohne Metadaten, PDF-Scanner (Stream-/ObjStm-Dekompression begrenzt, `#xx`-Normalisierung, Merkmal-Liste, fail-closed), DOCX-Inspektion (Makros, OLE, ActiveX, externe Beziehungen); verifizieren: PHPUnit mit Korpus (Polyglot-PNG, EXIF-GPS-JPG, PDF mit `/JavaScript` klar + in ObjStm versteckt + hex-escaped, PDF mit `/Launch`, `/EmbeddedFile`, verschlüsseltes PDF, DOCX mit Makro/OLE/Remote-Template) + 10 legitime Lebenslauf-PDFs/DOCX (Word, LibreOffice, Google Docs, Canva-Export) werden angenommen
- [ ] 8.5 Upload-Schicht 6: SHA-256-Abgleich gegen abuse.ch MalwareBazaar (nur Hash, 3 s Timeout, fail-open mit „[Anhang ungeprüft]“), neutrale Anhangsnamen, Prüfprotokoll je Anhang in der Mail; verifizieren: PHPUnit mit gemocktem API (bekannt/unbekannt/Timeout) + Netzwerk-Mitschnitt im Docker-Nachbau zeigt keine Dateiinhalte außer per SMTP
- [ ] 8.6 Sicherer Mailversand: festes `From`, TLS mit Peer-Verifikation, kein `mail()`-Fallback, Header-Sanitizer, `text/plain`-Body, deutsche Betreffzeilen; verifizieren: PHPUnit Header-Injection-Fälle (CRLF, Unicode-Zeilentrenner) + Mailpit-Test: kein zusätzlicher Header, HTML erscheint als Text
- [ ] 8.7 E-Mail-Infrastruktur `goekbau.de`: SPF, DKIM (IONOS), DMARC `p=quarantine` mit `rua`; Virenschutz der IONOS-Empfangspostfächer prüfen/aktivieren; Termin für `p=reject` nach 30 Tagen im Runbook; verifizieren: `dig TXT` zeigt gültige Einträge, Testmail mit `dmarc=pass`, Screenshot/Notiz zum Postfach-Virenschutz in `docs/runbook-email.md`
- [ ] 8.8 Zustellungs-Monitoring: täglicher GitHub-Actions-Job sendet synthetische Anfrage mit Test-Token an Produktion (Versand an Agentur-Testadresse, keine Kundenmail), Workflow schlägt bei SMTP-Fehler fehl; Tageszähler je Schutzschicht abrufbar (geschützt per Token); verifizieren: absichtlich falsches SMTP-Passwort auf Staging → Workflow rot + GitHub-Benachrichtigung
- [ ] 8.9 E-Mail-Adress-Schutz: `<ProtectedEmail>` (kodiert im HTML, `mailto:` nach Hydrierung, lesbarer No-JS-Fallback, `aria-label`), keine Adressen in JSON-LD/Meta; verifizieren: Build-Test durchsucht `out/**/*.html` nach `@goekbau.de` → 0 Treffer, Playwright: Klick erzeugt korrekten `mailto:`
- [ ] 8.10 Server-Härtung: `.htaccess` (Options -Indexes, Deny vendor/config/storage/Dotfiles/composer/md/log, PHP nur für `api/submit.php`, Header-Unset `X-Powered-By`, HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP, Header-CSP mit `frame-ancestors 'none'`), `.user.ini` (`expose_php=Off`, `display_errors=Off`), 405 für Nicht-POST, Request-Limit 11 MB; verifizieren: `curl`-Suite gegen Docker-Nachbau und Staging für jede Regel aus `web-security`
- [ ] 8.11 Hash-basierte CSP: Post-Build-Script berechnet SHA-256 aller Inline-Skripte je HTML und setzt Meta-CSP (`script-src 'self' 'sha256-…'`, `worker-src 'self' blob:`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-src` nur Google Maps); verifizieren: Playwright über alle Routen ohne CSP-Violations, injiziertes Test-Inline-Skript wird blockiert
- [ ] 8.12 Datenschutzfreundliches Logging (Zeit, Ergebnis-Code, Schicht; IP gehasht; Rotation ≤ 14 Tage) + `/.well-known/security.txt` (RFC 9116); verifizieren: PHPUnit prüft Log-Zeilen auf Abwesenheit von Name/E-Mail/Dateiname, security.txt-Validator grün
- [ ] 8.13 DAST: OWASP ZAP Baseline gegen Docker-Nachbau in jeder PR-Pipeline (Fail ab „high“); verifizieren: CI-Report grün, absichtlich entfernter `nosniff`-Header lässt Scan fehlschlagen

## 9. Datenschutz & Einwilligung

- [ ] 9.1 `ExternalMediaConsent`-Komponente für Google Maps (statischer Platzhalter, „Karte laden“, „Immer laden“, externer Link); verifizieren: Playwright – ohne Klick kein Google-Request, nach Klick iframe geladen
- [ ] 9.2 Einstellungen „Cookie-Einstellungen“ (Anzeige + Widerruf), Storage nur nach „Immer laden“; verifizieren: Test – Erstbesuch ohne Cookies/Storage, Widerruf verhindert Auto-Laden
- [ ] 9.3 Globaler Test „nur eigener Origin“ über alle Routen ohne Einwilligung; verifizieren: Playwright-Netzwerk-Mitschnitt je Route enthält ausschließlich `localhost:8080` bzw. Produktions-Origin

## 10. SEO & Redirects

- [ ] 10.1 Metadaten je Seite aus Inhaltsmodell (Titel-Suffix, Description-Längen, Canonical mit Slash, OG/Twitter, `og:locale de_DE`), Build-Check auf Eindeutigkeit; verifizieren: Unit-Test für doppelte Titel/fehlende Description
- [ ] 10.2 `Organization`/`LocalBusiness`-JSON-LD aus Stammdaten; verifizieren: Test vergleicht JSON-LD-Telefon mit Footer-Telefon
- [ ] 10.3 `sitemap.xml` + `robots.txt` (Staging: `noindex` + Disallow); verifizieren: Test – neue Stellen-Fixture erscheint in Sitemap, 404/Danke-Seiten nicht
- [ ] 10.4 Redirect-Generator `config/redirects.ts` → `.htaccess` (Stellen aus `legacyPaths`, Sitemaps, Feeds, WP-Pfade 410, Trailing-Slash), Sicherheits- und Cache-Header; verifizieren: Vitest für Generator + Playwright/`curl`-Suite gegen Docker prüft jeden Eintrag auf Status und `Location` sowie alle Header

## 11. Qualitäts-Gates

- [ ] 11.1 axe-Prüfung über alle Routen in CI (Fail bei serious/critical); verifizieren: absichtlich entferntes Label lässt CI fehlschlagen
- [ ] 11.2 Lighthouse CI (mobil) für Start, Über uns, Karriere, Kontakt mit Assertions (LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms, Score ≥ 90) + Bundle-Budget (≤ 30 Requests, JS ≤ 120 KB, CSS ≤ 40 KB auf Startseite); verifizieren: CI-Report grün, Budget-Überschreitung per Test-Branch provoziert Fehlschlag
- [ ] 11.3 Bildpipeline (`next-image-export-optimizer`, AVIF/WebP, `srcset`, Lazy-Loading, LCP-Priorität); verifizieren: Playwright bei 390 px lädt Hero-Variante ≤ 800 px

## 12. Abnahme & Go-live

- [ ] 12.1 **Hosting-Test Deploy Now** (vorbereitet in `tools/deploy-now-spike/`, Ablauf in `docs/adr/0001-deploy-now.md`): PHP-Projekt anlegen, Spike deployen, `check.py` gegen Staging grün (`.htaccess`, Extensions, `.user.ini`-Limits, privater Speicher, HTTPS/SMTP ausgehend); bei Lücken Fallback aus design.md D2 entscheiden; verifizieren: ADR-Tabelle vollständig ausgefüllt
- [ ] 12.2 Deploy-Now-Workflow auf die echte Site umstellen (Build: Next-Export + Composer + `.htaccess`, Publish-Verzeichnis), CI-Gates aus 1.4 vor Deployment, Staging für Nicht-`main`-Branches; Spike-Endpoint und Token entfernen; verifizieren: Test-PR erzeugt Staging-URL, roter Gate verhindert Deployment, `/api/ping.php` → 404
- [ ] 12.3 Security-Abnahme vor Go-live: aktiver OWASP-ZAP-Scan gegen Staging (Fokus `api/submit.php`), Checkliste OWASP ASVS L2 (relevante Kapitel V1–V5, V7, V8, V12, V13, V14) durchgehen; verifizieren: Bericht ohne offene high/critical-Funde in `docs/security/go-live-review.md`
- [ ] 12.4 Staging-Abnahme durch GÖK (Inhalte, Bilder, Formulare an echte Postfächer); verifizieren: schriftliche Freigabe im PR/Issue
- [ ] 12.5 Cutover vorbereiten: DNS-TTL auf 300 s, alte DNS-Werte in `docs/runbook-cutover.md`, Custom Domain in Deploy Now; verifizieren: Runbook-Review
- [ ] 12.6 DNS umstellen (nur A/AAAA/CNAME, MX unverändert); verifizieren: Redirect-Crawl gegen alte Sitemap (alle 12 URLs → 200/301 korrekt), Header-Check, Formular-Testsendung in Produktion, Mail-Empfang `info@goekbau.de` unverändert
- [ ] 12.7 Google Search Console: Sitemap einreichen, Abdeckung nach 7 Tagen prüfen; verifizieren: keine neuen 404-Fehler für alte URLs
- [ ] 12.8 Nach 30 Tagen ohne Rollback: WordPress-Backup verschlüsselt archivieren, die 248 gespeicherten Formular-Einsendungen und 18 Bewerbungsdateien nach Kundenentscheidung übergeben bzw. löschen (DSGVO, Aufbewahrungsfrist), Backup des Plugins „Backup Migration“ aus dem Webspace entfernen, Installation und Plugin-Lizenzen kündigen; verifizieren: Bestätigung IONOS/Lizenzportale, Löschprotokoll, Backup-Ablageort dokumentiert
