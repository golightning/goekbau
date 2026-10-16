# Design

## Context

- Ist-Zustand und Befunde: `research/wp-audit/AUDIT.md`. Motivation: siehe `proposal.md`.
- **Hosting-Vorgabe**: IONOS Deploy Now. Deploy Now baut per GitHub Actions und kann statische Sites oder PHP-Projekte (PHP ≤ 8.3, Apache) ausliefern, aber kein Node-SSR. Folge: Alles, was zur Laufzeit serverseitig passieren muss (Formularversand), läuft in PHP. Alles andere entsteht zur Build-Zeit.
- **Inhaltspflege**: durch die Agentur (Lightning Solutions) über Git, mit PRs gegen `golightning/goekbau`.
- **Design-Vorgabe**: Farben und Typografie aus dem Elementor-Kit werden Corporate Design. Layout und Komponenten dürfen modernisiert werden, der Grundaufbau (5 Hauptseiten) bleibt.

## Goals / Non-Goals

**Goals:**
- Eine Codebasis, die vollständig statisches HTML erzeugt, plus genau ein schlanker PHP-Endpoint.
- Lokale Entwicklung und CI bilden die Produktionsumgebung (Apache + PHP) realistisch nach, sodass Redirects, Header und Formulare vor dem Deployment getestet werden.
- Inhalte sind typisiert und validiert. Die Agentur kann sie ohne Komponenten-Kenntnis ändern.

**Non-Goals:**
- Kein CMS mit Admin-Oberfläche in dieser Change. Das Inhaltsmodell ist aber so geschnitten, dass später ein Git-basiertes CMS (z. B. Keystatic) aufgesetzt werden kann.
- Keine Mehrsprachigkeit, kein Blog, kein Tracking/Analytics. Ein späteres, einwilligungsfreies Analytics wäre eine eigene Change.
- Keine Bewerberverwaltung (ATS). Bewerbungen gehen per E-Mail ein.

## Decisions

### D1 – Next.js (App Router) mit statischem Export
`output: "export"`, `trailingSlash: true`. Alle Seiten sind React Server Components und werden zu HTML. Client-Komponenten (`"use client"`) gibt es nur für die mobile Navigation, Formulare, den Karten-Platzhalter und den Kennzahlen-Zähler.

- *Warum*: React als Hauptframework (Kundenwunsch), das größte Ökosystem, und die Agentur kennt es. Der statische Export passt exakt zu Deploy Now.
- *Alternativen*:
  - **Astro + React-Islands**: noch weniger JS (kein React-Runtime auf rein statischen Seiten), eingebaute Bildoptimierung und Content Collections. Verworfen, weil React dort nur Insel-Technologie ist. Es bleibt der **Fallback, falls das JS-Budget (`performance-budget`) mit Next.js nicht hält**.
  - **React Router v7 mit Prerender**: technisch geeignet, aber das kleinere Ökosystem bringt keinen Vorteil.
  - **Vite-SPA**: schlechter für SEO und die Ladezeit ohne JS. Widerspricht `seo-metadata` und `brand-design-system` (Inhalte ohne JS sichtbar).
- *Konsequenzen*: Kein `next/image`-Optimizer zur Laufzeit, kein Middleware-Support und keine Next-Redirects. Diese Aufgaben übernehmen D3 und D4.

### D2 – Deploy Now als **PHP-Projekt**
Das Build-Artefakt ist ein Ordner mit dem Next-Export (`out/`), `api/submit.php`, `vendor/` (Composer: PHPMailer) und `.htaccess`. Deploy Now erzeugt den GitHub-Workflow. Dieser wird um die Qualitäts-Gates ergänzt (D9).

- *Warum*: Ein statisches Deploy-Now-Projekt kann keine Formulare verarbeiten. Ein PHP-Projekt liefert statische Dateien und PHP aus einer Hand aus, ohne zusätzlichen Dienst (Datensparsamkeit, keine Drittanbieter).
- *Alternativen*: ein statisches Projekt plus Formular-SaaS (Formspree, Web3Forms). Verworfen wegen Drittanbieter-Datenübermittlung und der Upload-Grenzen. Ein separater IONOS-Webspace nur für PHP wäre doppelte Infrastruktur.
- *Risiko*: Ob Deploy Now `.htaccess` (mod_rewrite, mod_headers) im PHP-Projekt voll unterstützt, ist **nicht verifiziert** → Spike-Task 1.3 vor allem anderen.

### D3 – Redirects, 410, Header und Caching über `.htaccess`
Eine versionierte Datei `config/redirects.ts` (Quelle, Ziel, Status) erzeugt zur Build-Zeit den Rewrite-Block der `.htaccess`. Daneben stehen dort die Sicherheits-Header (CSP, HSTS …) und die Cache-Header (`/_next/static/*` immutable, HTML `no-cache`).
- Die Ziele der `/stellenanzeige-N/`-Redirects werden aus dem Inhaltsmodell aufgelöst: Jedes Angebot hat ein Feld `legacyPaths`. So können Redirect-Liste und Inhalte nicht auseinanderlaufen. Ein abgelaufenes oder entferntes Angebot fällt automatisch auf `/karriere/` zurück.
- `www`/HTTPS-Kanonisierung: zunächst in Deploy Now/DNS. Falls das dort nicht in einem Schritt geht, per `.htaccess`.
- *Alternative*: Redirects als HTML-Meta-Refresh-Seiten. Verworfen, weil das kein echter 301 ist und SEO-Wert verloren geht.

### D4 – Bilder zur Build-Zeit optimieren
`next-image-export-optimizer` erzeugt AVIF- und WebP-Varianten in festen Breiten (400/800/1200/1600/2000) beim Build. Komponenten nutzen dessen `<Image>` mit `sizes`. Originale liegen in `content/media/`.
- *Alternative*: Ein eigenes `sharp`-Script ist flexibler, aber mehr Eigenbau. Es bleibt der Fallback, falls die Library mit der aktuellen Next-Major nicht kompatibel ist.

### D5 – Inhaltsschicht: Velite (Zod-Schemas) über YAML/MDX
Struktur in `content/`:
```
content/
  company.yaml            # Stammdaten (Single Source, content-model)
  pages/*.mdx             # Seitentexte + SEO-Felder je Seite
  services/*.yaml         # Leistungen  (area, status: offered|planned, order)
  service-areas.yaml
  projects/*.yaml         # Strecke, Abschnitt, Zeitraum, Rolle, Bild
  team/*.yaml             # Name, Rolle(n), Qualifikationen, Foto?
  partners/*.yaml         # Logo, Name, URL
  stats.yaml              # Kennzahlen
  careers/jobs/*.mdx      # type=job,      slug, status, datePosted, validThrough?, employmentType, legacyPaths
  careers/trainings/*.mdx # type=training, slug, status, legacyPaths
  media/                  # Originalbilder
```
Velite validiert beim Build mit Zod, prüft Bild-Referenzen und erzeugt typisierte Daten für die Komponenten. Der Build bricht bei Schemafehlern mit Datei- und Feldangabe ab (`content-model`). Eindeutige Slugs, Pflicht-`alt` und SEO-Feldlängen sind als Zod-Refinements bzw. als Post-Validierung umgesetzt.
- *Alternativen*: Contentlayer ist nicht mehr gepflegt. Ein eigener Loader (gray-matter + Zod) wäre mehr Eigenbau ohne Vorteil. Ein Headless CMS ist ein Non-Goal.

### D6 – Design-System: Tailwind CSS v4 mit eigenen Tokens
Die Tokens stehen in `@theme` (Farben, Fonts, Abstände, Breakpoints `md: 768`, `lg: 1024`, Container 1200 px). Die **Default-Farbpalette von Tailwind wird entfernt**, sodass nur Marken-Tokens existieren. Eine nicht definierte Farbe erzeugt dann keine Klasse. Ergänzend verbieten ein ESLint-Plugin (`better-tailwindcss` o. ä.) und eine Stylelint-Regel Arbitrary Values wie `bg-[#…]` (`brand-design-system` → Szenario „Undokumentierte Farbe“).
- **Kontrast-Tokens**: Bronze `#A6875C` hat auf Weiß rund 3,3:1. Für Text und kleine Buttons wird daher ein Token `bronze-700` (dunkler, ≥ 4,5:1, Wert wird in Task 2.1 berechnet) eingeführt. `#A6875C` bleibt für Flächen, große Schrift und Dekor.
- **Schriften**: `next/font/local` mit selbst gehosteten WOFF2-Dateien (Subsets latin + latin-ext für ä/ö/ü/ß, variable Fonts, wo verfügbar). `next/font` erzeugt die metrisch angepassten Fallbacks automatisch.
- **UI-Bausteine**: eigene, schlanke Komponenten (Button, Section, Card, Field, Tabs/Disclosure). Für zugängliche interaktive Primitive (Dialog/Menü, Disclosure) dient Radix UI bzw. React Aria als Basis, keine komplette UI-Library.
- *Alternative*: CSS Modules mit Custom Properties. Ebenfalls valide, aber Tailwind beschleunigt den Komponentenbau, und das Token-Lock ist einfacher durchzusetzen.

### D7 – Formulare: progressive Enhancement + PHP-Endpoint
- HTML-`<form method="post" action="/api/submit.php" enctype="multipart/form-data">` funktioniert ohne JS. PHP antwortet dann mit 303 auf `/kontakt/danke/` bzw. `/kontakt/fehler/` (`noindex`).
- Mit JS übernimmt eine Client-Komponente: Validierung mit demselben Feld-Schema (Zod → JSON-Schema-Export für PHP oder ein gespiegeltes, getestetes Regelset), `fetch` mit `Accept: application/json`. Antworten: 200 / 422 (Feldfehler) / 429 / 502.
- PHP-Seite: `finfo` für MIME-Prüfung, Größen- und Anzahl-Limits, Honeypot, Mindestzeit (signierter Zeitstempel im Hidden-Feld, HMAC mit Secret), Rate-Limit über eine Datei in `sys_get_temp_dir()` mit **gehashter IP** und 1 h TTL. Versand mit PHPMailer über SMTP (IONOS-Postfach, z. B. `website@goekbau.de`), `Reply-To` = Nutzer. Temporäre Uploads werden im `finally` gelöscht. Logs enthalten nur Ergebnis-Codes.
- Konfiguration (SMTP-Host/User/Passwort, Empfänger je Formular, HMAC-Secret) kommt aus Deploy-Now-Runtime-Secrets (GitHub Secrets → Runtime-Config), nie aus dem Repo.
- *Alternative*: Next Server Actions sind im statischen Export nicht möglich.

### D8 – Einwilligung ohne CMP
Es gibt keine Tracker und keine Google Fonts. Damit bleibt nur Google Maps einwilligungspflichtig. Eine eigene Komponente `ExternalMediaConsent` zeigt einen statischen Platzhalter (Screenshot der Karte, selbst gehostet), den Button „Karte laden“ und den Link „In Google Maps öffnen“. Bei „Immer laden“ wird **nur dann** `localStorage["consent.externalMedia"]` gesetzt. Die Seite „Cookie-Einstellungen“ (`/datenschutz/#einstellungen` bzw. ein Dialog) zeigt und widerruft das. Das CookieYes-Banner entfällt (`privacy-consent` → Szenario „Kein Banner“).
- Die CSP erlaubt `frame-src https://www.google.com https://maps.google.com`. Weitere Fremd-Origins gibt es nicht.

### D9 – Teststrategie und CI
| Ebene | Werkzeug | Deckt ab |
|---|---|---|
| Content | Velite-Build | Schemas, Slugs, Alt-Texte, SEO-Längen |
| Unit | Vitest | Hilfsfunktionen, Redirect-Generator, Formular-Schema |
| PHP | PHPUnit | Validierung, Upload-Prüfung, Honeypot, Rate-Limit, Mailer-Mock |
| E2E | Playwright gegen **`php:8.3-apache`-Container** mit `out/` + `api/` + `.htaccess` und **Mailpit** als SMTP | Navigation, Formulare inkl. Upload, Redirect-Statuscodes, 404/410, Header, „keine Fremd-Requests“ |
| A11y | `@axe-core/playwright` auf allen Routen | `accessibility` |
| Performance | Lighthouse CI (mobil) + Bundle-Budget | `performance-budget` |
| Secrets | gitleaks | `delivery-pipeline` |

Der Docker-basierte Prod-Nachbau ist der zentrale Hebel: `.htaccess`- und PHP-Verhalten werden vor Deploy Now getestet. Lokal startet `docker compose up` dieselbe Umgebung.

### D10 – Informationsarchitektur (Refresh)
- Die Hauptnavigation bleibt gleich. Neu im Footer: „Barrierefreiheit“ und „Cookie-Einstellungen“.
- **Startseite**: Hero ohne Slider (ein starkes Motiv statt zweier identischer Slides), Leistungen als Bereichs-Übersicht statt 13 Kacheln, Projekte als Karten, Team-Teaser, Karriere-Teaser.
- **Leistungen**: gegliedert in „Bauüberwachung Oberbau“ (angeboten) und „Schienentechnik“ (in Vorbereitung).
- **Projekte**: als strukturierte Referenzen (Strecken-Nr., Abschnitt, Leistung, Zeitraum) statt eines Image-Accordions.
- **Karriere**: Trennung in Stellen und Aus-/Weiterbildung, Detailseiten unter `/karriere/stellen/…` und `/karriere/ausbildung/…`.

## Risks / Trade-offs

- [Deploy Now ignoriert Teile der `.htaccess` (z. B. Header oder 410)] → Spike 1.3 zuerst. Fallback: Header per PHP-Front-Controller nur für HTML oder ein Wechsel zu IONOS-Webspace mit SFTP-Deployment aus GitHub Actions.
- [Next.js liefert ~90 KB React-Runtime auch auf rein statischen Seiten] → Budget 120 KB ist darauf ausgelegt. Wird es gerissen, folgt ein Wechsel zu Astro + React (D1-Fallback). Komponenten bleiben React und sind portierbar.
- [IONOS-SMTP lehnt E-Mails mit fremdem `From` ab] → `From` ist immer ein eigenes Postfach, die Nutzeradresse steht nur in `Reply-To`.
- [Spam trotz Honeypot/Rate-Limit] → Das Monitoring der Zustellmenge erfolgt in der ersten Woche manuell. Eskalation: selbst gehostetes Proof-of-Work-Captcha (z. B. ALTCHA), kein Google reCAPTCHA.
- [Inhaltliche Zulieferungen (Team-Fotos, Projektdetails, Partner-Logos) fehlen zum Go-live] → Das Inhaltsmodell erlaubt optionale Bilder mit Platzhaltern (`company-pages` → „Teammitglied ohne Foto“). Der Go-live hängt nicht davon ab.
- [Bewerbungsanhänge per E-Mail sind sensible Daten] → TLS-SMTP, keine Speicherung auf dem Server, und die Datenschutzerklärung beschreibt den Weg.
- [Agentur ist einziger Redakteur] → bewusste Entscheidung. Das Inhaltsmodell ist CMS-tauglich geschnitten (Non-Goal-Hinweis).

## Migration Plan

1. **Inhalte sichern**: WordPress-Export (`.wpress` bzw. XML) nach `_wp-export/` (gitignored), Originalbilder aus `uploads/` extrahieren, Elementor-JSON pro Seite für die Textübernahme auswerten.
2. **Parallelbetrieb**: Die neue Site läuft auf der Deploy-Now-Staging-URL, WordPress bleibt live.
3. **Abnahme** auf Staging durch GÖK (Inhalte, Formulare mit echtem Postfach).
4. **Cutover**: Custom Domain `www.goekbau.de` und `goekbau.de` in Deploy Now hinterlegen und die DNS-Einträge A/AAAA/CNAME umstellen. **MX- und Mail-Einträge bleiben unverändert.** Das TLS-Zertifikat stellt Deploy Now aus.
5. **Nachkontrolle** (Tag 0–7): Redirect-Crawl gegen die alte Sitemap, Google Search Console (Sitemap neu einreichen, Abdeckung prüfen), Formular-Testsendungen.
6. **Rollback**: Bis zur Abschaltung bleiben die alten DNS-Werte dokumentiert. Ein Zurückstellen der DNS-Einträge reaktiviert WordPress (TTL vorher auf 300 s senken).
7. **Abschaltung** nach 30 Tagen ohne Rollback: WordPress-Backup archivieren, Installation löschen, Plugin-Lizenzen kündigen.

## Open Questions

- Empfängeradressen: Laut WP-Export gehen heute beide Formulare an `deniz.goek@goekbau.de`. Zu bestätigen: Bleibt das so, und welches IONOS-Postfach wird SMTP-Absender? Reine Konfiguration.
- Umgang mit den 248 in WordPress gespeicherten Einsendungen und den 18 Bewerbungsdateien vor der Abschaltung: Export an den Kunden oder Löschung nach Aufbewahrungsfrist (DSGVO). Betrifft Task 11.5, nicht die Architektur.
- Existieren echte Social-Media-Profile? Wenn nicht, werden keine Icons angezeigt (bereits spezifiziert).
- Freigabe von Kennzahlen, Projektdetails, Team-Rollen und Partner-Logos (Bildrechte) durch GÖK. Inhalt, nicht Struktur.
- Genauer Wortlaut der Rechtstexte (Impressum/Datenschutz), bei Bedarf über einen Generator oder den Anwalt des Kunden.
