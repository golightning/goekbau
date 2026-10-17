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
- *Risiko*: Nicht verifiziert ist, ob Deploy Now im PHP-Projekt `.htaccess` (mod_rewrite, mod_headers) voll unterstützt, ob es ein beschreibbares Verzeichnis außerhalb des Document Roots gibt (Rate-Limit, ALTCHA-Replay), welche PHP-Extensions verfügbar sind (`fileinfo`, `gd`/`imagick`, `zip`, `zlib`, `openssl`) und ob ausgehende HTTPS- und SMTP-Verbindungen erlaubt sind. → Hosting-Test (Task 12.1) bewusst erst vor Go-live (Entscheidung Auftraggeber 17.10.2026). Bis dahin ist der Docker-Nachbau (Task 1.3) die Referenz; der Code bleibt hosting-neutral (Apache + PHP 8.3, keine IONOS-Spezifika).

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

### D7 – Formulare: JS-gestützt + PHP-Endpoint
- **Kein No-JS-Absenden** (Entscheidung Auftraggeber 17.10.2026): Ohne JS ließe sich ALTCHA umgehen. Ohne JS zeigt `<noscript>` deshalb Telefon, WhatsApp und E-Mail statt des Formulars. Der Endpoint lehnt Requests ohne gültiges ALTCHA ab.
- Beim Fokussieren oder Laden holt das Formular per `GET /api/challenge.php` eine signierte ALTCHA-Challenge und ein Formular-Token (HMAC über Formular-ID und Ausstellzeit). Statischer Export und Zeitfenster-Prüfung sind damit vereinbar.
- Mit JS übernimmt eine Client-Komponente: Validierung mit demselben Feld-Schema (Zod → JSON-Schema-Export für PHP oder ein gespiegeltes, getestetes Regelset), `fetch` mit `Accept: application/json`. Antworten: 200 / 422 (Feldfehler) / 429 / 502.
- PHP-Seite als Pipeline mit festen Stufen (Details in D11): Methode/Größe → Origin/CSRF → Spam-Schichten → Feldvalidierung → Upload-Prüfung → Versand → Aufräumen (`finally`). Jede Stufe ist eine eigene, einzeln getestete Klasse. Versand mit PHPMailer über SMTP (IONOS-Postfach, z. B. `website@goekbau.de`), `Reply-To` = Nutzer.
- Konfiguration (SMTP-Host/User/Passwort, Empfänger je Formular, HMAC-Secret) kommt aus Deploy-Now-Runtime-Secrets (GitHub Secrets → Runtime-Config), nie aus dem Repo.
- *Alternative*: Next Server Actions sind im statischen Export nicht möglich.
- Der Spam-Schutz ist ALTCHA, selbst gehostet (Entscheidung des Auftraggebers). Google reCAPTCHA v2 aus dem WordPress-Bestand entfällt.

### D8 – Einwilligung ohne CMP
Es gibt keine Tracker und keine Google Fonts. Damit bleibt nur Google Maps einwilligungspflichtig. Eine eigene Komponente `ExternalMediaConsent` zeigt einen statischen Platzhalter (Screenshot der Karte, selbst gehostet), den Button „Karte laden“ und den Link „In Google Maps öffnen“. Bei „Immer laden“ wird **nur dann** `localStorage["consent.externalMedia"]` gesetzt. Die Seite „Cookie-Einstellungen“ (`/datenschutz/#einstellungen` bzw. ein Dialog) zeigt und widerruft das. Das CookieYes-Banner entfällt (`privacy-consent` → Szenario „Kein Banner“).
- Die CSP erlaubt `frame-src https://www.google.com https://maps.google.com`. Weitere Fremd-Origins gibt es nicht.

### D11 – Sicherheitsarchitektur (Security first)
Zielniveau: **OWASP ASVS Level 2**. Grundprinzip: Defense in Depth, keine Drittanbieter-Verarbeitung personenbezogener Daten, und jede Schicht ist automatisiert testbar.

**Request-Pipeline in `api/submit.php`** (Abbruch bei der ersten verletzten Stufe, und bevor teure Arbeit anfällt):
1. `POST`-only, `Content-Length` ≤ 11 MB (zusätzlich `LimitRequestBody` bzw. `post_max_size`) → sonst 405/413
2. `Origin`/`Referer` = eigener Origin + signiertes Formular-Token (HMAC, enthält Formular-ID und Zeitstempel) → sonst 403
3. Honeypot → Fake-200 · Zeitfenster 3 s – 2 h → verwerfen
4. **ALTCHA**-Verifikation (PHP-Bibliothek `altcha-org/altcha`, HMAC-Key aus Secret) inkl. Replay-Schutz (benutzte Challenges bis Ablauf gespeichert)
5. Rate-Limit (gesalzene IP-Hashes + E-Mail-Hashes, Sliding Window, Dateispeicher außerhalb des Webroots, TTL 24 h) → 429 + `Retry-After`
6. Feldvalidierung (gemeinsames Regelset, D7) + E-Mail-Prüfung (RFC 5322, MX/A-Lookup mit 2 s Timeout, Wegwerf-Domain-Liste `disposable-email-domains` als versionierte Datei) + Inhaltsfilter (URL-Anzahl, BBCode/HTML-Links, Sperrwörter, Schriftsystem-Anteil, Duplikat-Hash 24 h)
7. Upload-Prüfung (siehe unten)
8. Versand (siehe Mail) → Ergebnis
9. `finally`: Temp-Dateien löschen, Zähler für Monitoring erhöhen (nur Schicht und Ergebnis)

**Datei-Scan – „bestes kostenloses Setup“** (`upload-security`):
| Schicht | Umsetzung | Fängt |
|---|---|---|
| 1. Allowlist + Magic Bytes | `finfo` + eigene Signaturprüfung; nur PDF/DOCX/JPG/PNG | getarnte Executables, Archive, Makro-Altformate |
| 2. Archiv-Bomben-Schutz | `ZipArchive` mit Statistik vor dem Entpacken (Einträge, Größe, Ratio, Pfade) | Zip-Bomben, Path Traversal |
| 3. Entschärfung Bilder | GD bzw. Imagick: Dekodieren und neu Kodieren, EXIF entfernen | Polyglots, angehängte Payloads, Exploits in Metadaten |
| 4. PDF-Inspektion | eigener Scanner: alle `FlateDecode`-Streams und `ObjStm` werden begrenzt dekomprimiert, `#xx`-Escapes in Namen normalisiert, Suche nach `/JavaScript /JS /Launch /EmbeddedFile /RichMedia /XFA /OpenAction`+Aktion, Verschlüsselung. Im Zweifel (nicht parsebar) **ablehnen** | aktive PDF-Inhalte, auch verschleiert |
| 5. DOCX-Inspektion | `[Content_Types].xml` und `*.rels` prüfen: `vbaProject.bin`, `oleObject*`, `activeX*`, `TargetMode="External"` | Makros, OLE, Remote-Template-Injection |
| 6. Hash-Reputation | SHA-256 → **abuse.ch MalwareBazaar** (`get_info`, kostenloser Auth-Key, 3 s Timeout). Es wird **nur der Hash** übertragen | bekannte Malware-Samples |
| 7. Postfach-Scan | Virenschutz des IONOS-Postfachs auf Empfängerseite (Aktivierung prüfen, Task 8.7) | signaturbasierte Erkennung beim Empfang |

- Bewusst ausgeschlossen: **VirusTotal, MetaDefender und ähnliche „kostenlose“ Scan-APIs**. Dort hochgeladene Dateien werden Dritten (Security-Community) zugänglich. Für Lebensläufe ist das ein DSGVO-Verstoß.
- Upgrade-Pfad, falls später gewünscht: Ein eigener ClamAV-Dienst (IONOS-VPS) lässt sich als Schicht 6b einhängen, ohne die Specs zu ändern.
- Dateinamen in der E-Mail werden neutral vergeben (`bewerbung-<n>.<ext>`). Die E-Mail enthält pro Anhang Typ, Größe, SHA-256 und Prüfergebnis.

**Mail** (`email-security`):
- PHPMailer mit `SMTPSecure` = TLS, `SMTPAutoTLS`, Peer-Verifikation an, kein Fallback auf `mail()`. `From`/`Sender` sind fest (`website@goekbau.de`). Header-Werte laufen durch einen eigenen Sanitizer (CR/LF/Steuerzeichen, Länge) und zusätzlich durch die PHPMailer-Prüfung. Der Body ist `text/plain`.
- DNS: SPF `include:_spf-eu.ionos.com` (genauen Wert aus der IONOS-Doku übernehmen), DKIM über IONOS aktivieren, DMARC `p=quarantine; rua=…` und nach 30 Tagen `p=reject`.
- **Überwachung über einen unabhängigen Weg**: Ein täglicher GitHub-Actions-Job schickt eine synthetische Testanfrage mit eigenem Test-Token an die Produktion. Der Endpoint sendet sie an eine Agentur-Testadresse und meldet das SMTP-Ergebnis. Bei Fehlschlag schlägt der Workflow fehl, und GitHub benachrichtigt die Agentur. Dieser Weg funktioniert auch, wenn SMTP selbst kaputt ist. Das schließt die heutige Lücke (Mails scheitern seit Monaten unbemerkt).

**Adress-Schutz**: Eine Komponente `<ProtectedEmail>` rendert serverseitig nur eine kodierte Form (z. B. ROT-verschobene oder Base64-codierte Teile in `data-*`) plus den lesbaren Fallback „info [at] goekbau.de“. Clientseitig wird beim Hydrieren ein echter `mailto:`-Link mit `aria-label` erzeugt. JSON-LD, Meta-Daten und Sitemap enthalten keine Adressen. Ein Build-Test durchsucht `out/**/*.html` nach `@goekbau.de` und schlägt bei Treffern fehl.

**CSP bei statischem Next.js-Export**: Next legt Inline-Skripte (RSC-Payload `self.__next_f.push`) ins HTML, Nonces gehen ohne Server nicht. Lösung:
- Ein Post-Build-Script berechnet je HTML-Datei die SHA-256-Hashes aller Inline-Skripte und setzt sie in ein `<meta http-equiv="Content-Security-Policy">` mit `script-src 'self' 'sha256-…'`.
- Die `.htaccess` liefert zusätzlich eine Header-CSP mit den Direktiven, die per Meta nicht wirken (`frame-ancestors 'none'`, `report-to`). Beide Policies gelten gleichzeitig, es gilt also die Schnittmenge.
- ALTCHA braucht `worker-src 'self' blob:`. Ein E2E-Test prüft, dass keine CSP-Violations auftreten.

**Server-Härtung (`.htaccess` + `.user.ini`)**: `Options -Indexes`; Deny für `vendor/`, `config/`, `storage/`, Dotfiles, `composer.*`, `*.md`, `*.log`; PHP-Ausführung nur für `api/submit.php` (alles andere unter `api/` → 404); `expose_php=Off`, `display_errors=Off`, `log_errors=On`; Header-Unset `X-Powered-By`. Temp- und Rate-Limit-Speicher liegen außerhalb des Document Roots, falls Deploy Now das erlaubt (Spike 1.3). Andernfalls kommen sie in ein per `.htaccess` komplett gesperrtes Verzeichnis.

**Lieferkette und Prüfungen**:
- Dependabot (npm, Composer, GitHub Actions)
- `pnpm audit --prod` / `composer audit` (Fail ab „high“)
- CodeQL (JS/TS) + Semgrep (PHP-Regeln, OWASP)
- gitleaks
- OWASP ZAP Baseline-Scan gegen den Docker-Nachbau bei jedem PR. Vor dem Go-live ein aktiver ZAP-Scan gegen Staging mit Fokus auf den Formular-Endpoint.
- Actions sind auf Commit-SHAs gepinnt, Lockfiles sind Pflicht.

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
| Security | Malware-Testkorpus (EICAR, PDF mit `/JavaScript` inkl. verschleierter Varianten, DOCX mit Makro/OLE/externer Vorlage, Zip-Bombe, Polyglot-PNG), Header-Injection-Fälle, CSP-Violation-Check, ZAP Baseline, CodeQL/Semgrep, Dependency-Audit | `upload-security`, `email-security`, `web-security`, `spam-protection` |

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
- [Spam trotz aller Schichten] → Die Monitoring-Zähler (`spam-protection`) zeigen, welche Schicht greift. Sperrwortliste und ALTCHA-Komplexität sind ohne Code-Änderung konfigurierbar.
- [Der eigene PDF-Scanner übersieht eine Verschleierungstechnik] → Bei Parse-Zweifeln wird abgelehnt (fail-closed). Der Testkorpus wächst mit bekannten Techniken. Dazu kommen der Postfach-Scan als zweite Linie und ClamAV als Upgrade-Pfad.
- [Die strenge Prüfung lehnt legitime Bewerbungs-PDFs ab, z. B. Formulare mit `/OpenAction`] → Die Fehlermeldung nennt einen konkreten Ausweg („als PDF drucken/exportieren“) und den Alternativweg per E-Mail. Die Ablehnungsquote wird über die Zähler beobachtet.
- [MalwareBazaar nicht erreichbar oder Key ungültig] → Fail-open mit Kennzeichnung „[Anhang ungeprüft]“ (Schichten 1–5 + 7 greifen weiter). Der Ausfall wird im täglichen Monitoring sichtbar.
- [Hash-basierte CSP bricht nach Next-Update] → Der E2E-Test auf CSP-Violations läuft bei jedem PR.
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
