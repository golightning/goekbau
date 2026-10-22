# Tasks

## 1. Bestand und Ziel

- [x] 1.1 `PRODUCT.md` mit Zielgruppen, Leistungen (angeboten/in Vorbereitung), Haupthandlung, Belegen getrennt nach Stammdaten, Firmenangaben und geprüften Belegen, mit Quellen und offenen Inhaltsfragen; geprüft: jede Angabe nennt ihre Quelle in `content/` oder `research/`, Foto-Projekt-Zuordnung als unbestätigt vermerkt
- [x] 1.2 Bestandsaufnahme der heutigen Startseite unter `bestand/` (1500 × 750 und 390 × 844, erster Bildschirm und ganze Seite); geprüft: vier Screenshots vorhanden, Stand 2f37112
- [ ] 1.3 Offene Inhaltsfragen aus `PRODUCT.md` an den Kunden geben und Antworten mit Datum in `PRODUCT.md` nachtragen; bis dahin gelten sie in den Entwürfen als gekennzeichnete Annahmen; geprüft: jede Frage hat eine Antwort oder den Vermerk „offen, Entwurf mit Annahme“

## 2. Vorbereitung der Live-Seite (ohne Verhaltensänderung)

- [x] 2.1 Referenz der Live-Seiten aus dem aktuellen Build sichern (Skript `scripts/page-snapshot.mjs`): je Route inkl. 404 Landmarks, Überschriften-Hierarchie, Textinhalte, Links, Metadaten (Titel, Beschreibung, Canonical, Robots, Open Graph, JSON-LD) aus dem gerenderten DOM sowie Screenshots bei 1500 × 750 und 390 × 844; geprüft: Referenz für alle Routen vorhanden, zweiter Lauf gegen denselben Build meldet keine Unterschiede
- [x] 2.2 Route-Group `(site)`: Live-Seiten nach `src/app/(site)/`, Header, Footer und Schnellkontakt aus `src/app/layout.tsx` nach `src/app/(site)/layout.tsx`; `src/app/not-found.tsx` bindet Header, Footer und Schnellkontakt selbst ein; geprüft: Vergleich mit 2.1 ohne Unterschied in Struktur, Inhalten, Links und Metadaten, Screenshots innerhalb der Toleranz, 404-Seite mit Navigation, Footer und Schnellkontakt, `pnpm check` ohne Testanpassung grün

## 3. Entwurfs-Infrastruktur

- [ ] 3.1 `pageExtensions` in `next.config.ts` um `draft.tsx` nur im Entwicklungsmodus und bei angefordertem Prüfbuild erweitern; Entwurfs-Layout `src/app/entwurf/layout.draft.tsx` ohne Live-Header/-Footer; geprüft: `pnpm dev` liefert `/entwurf/a/` mit Platzhalter und genau einem Header und Footer (aus dem Entwurf), `pnpm build` erzeugt kein `out/entwurf`
- [ ] 3.2 Kanarienvogel: `src/drafts/canary.ts` (eindeutige Zeichenkette) und `src/drafts/assets/canary.svg` (eindeutige Datei), von jeder Entwurfsseite gerendert bzw. importiert; geprüft: Zeichenkette und Datei erscheinen auf `/entwurf/a/` im Dev
- [ ] 3.3 Prüfbuild `pnpm drafts:build`: optimierter Build mit Entwurfsrouten über `distDir` nach `out-drafts/`, zusammengesetzt mit derselben `.htaccess`, CSP-Hashes und Headern nach `dist/drafts-check/`, ausgeliefert im Compose-Profil `drafts` auf Port 8081; kein Deploy-Pfad kennt ihn; geprüft: `/entwurf/a/` auf 8081 liefert 200 ohne CSP-Verstoß in der Konsole, `dist/site` bleibt unberührt
- [ ] 3.4 `scripts/check-artifact.mjs`: im auslieferbaren Artefakt Abbruch bei Kanarien-Zeichenkette, bei Dateien mit dem SHA-256 einer Datei aus `src/drafts/assets/` und bei Verzeichnis `entwurf`; Positivkontrolle im Prüfbuild (muss beides finden); geprüft: Unit-Tests mit präpariertem Artefakt (schlägt fehl), sauberem Artefakt (besteht) und Prüfbuild ohne Kanarienvogel (schlägt fehl)
- [ ] 3.5 E2E-Test: `/entwurf/a/`, `/entwurf/b/` und `/entwurf/c/` liefern 404 auf dem Nachbau des auslieferbaren Artefakts; geprüft: Test grün in `pnpm e2e`
- [ ] 3.6 `scripts/draft-compare.mjs` und `pnpm drafts:compare` gegen Prüfbuild und Ist-Stand: Screenshots bei 1500 × 750 und 390 × 844, Messung bei zusätzlich 1280 × 720 und 1920 × 1080 (horizontaler Überlauf, abgeschnittener Text, überlagerte Textkästen, CSP-Verstöße), initiales JS (gzip) und LCP aus dem Prüfbuild, Tabelle mit Datum in `vergleich/`; geprüft: Lauf gegen den Ist-Stand erzeugt Screenshots und eine Tabelle ohne Befunde

## 4. Entwurf A, technisch-präzise

- [ ] 4.1 Zuordnung Prüfaufgabe → angebotene Leistung als Daten unter `src/drafts/`, unbestätigte Zuordnungen als Annahme markiert; geprüft: Unit-Test, dass jede Aufgabe eine Leistung mit Status `offered` referenziert
- [ ] 4.2 Entwurf A unter `/entwurf/a/` mit eigenem Header und Footer, allen Kerninhalten, Querschnittszeichnung als SVG, einer Signatur-Bewegung, vollständig sichtbar ohne JS und bei reduzierter Bewegung; geprüft: `pnpm drafts:compare` ohne Befunde, Screenshots selbst angesehen, axe ohne serious/critical im Prüfbuild

## 5. Entwurf B, fotografisch-dokumentarisch

- [ ] 5.1 Entwurf B unter `/entwurf/b/` mit eigenem Header und Footer, allen Kerninhalten, eigenen Bautagebuch-Fotos als Träger, Stempel lesbar, Foto-Projekt-Zuordnung als Annahme gekennzeichnet, einer Signatur-Bewegung, Fotobedarf im Entwurf benannt; geprüft wie 4.2

## 6. Entwurf C, regional-vernetzt

- [ ] 6.1 Entwurf C unter `/entwurf/c/` mit eigenem Header und Footer, allen Kerninhalten, Streckenschema nur aus `content/projects/` mit Hinweis „Schema, nicht maßstäblich“, Firmensitz als Ausgangspunkt, einer Signatur-Bewegung; geprüft wie 4.2 und Unit-Test, dass das Schema genau die Strecken des Inhaltsmodells zeigt

## 7. Vorlage und Wahl

- [ ] 7.1 Vergleichspaket vorlegen: Screenshots Ist-Stand und A/B/C bei 1500 × 750 und 390 × 844 nebeneinander, Messtabelle aus dem Prüfbuild, Liste der Annahmen, Frage, ob Header und Footer auf alle Unterseiten übertragen werden; geprüft: Inhaber hat das Paket erhalten
- [ ] 7.2 Wahl und Varianten des Inhabers mit Datum unter „Gewählte Richtung“ in `design.md` festhalten (`/opsx:update`); Delta für die Anforderung „Startseite“ und, falls Header/Footer übertragen werden, für die betroffenen Anforderungen ergänzen; geprüft: `openspec validate redesign-home-page --strict`
- [ ] 7.3 Optional, nur auf Wunsch: 3D-Logo-Versuch (img2threejs) als Variante der gewählten Richtung, Vergleich Wiedererkennbarkeit, zusätzlicher Download separat, mobile Darstellung, gemessen im Prüfbuild; initiales JS ≤ 160 KB; geprüft: Tabelle in `vergleich/3d.md`

## 8. Übernahme nach Freigabe

- [ ] 8.1 Kundenbestätigung für alle als Annahme gekennzeichneten Inhalte der gewählten Richtung einholen; unbestätigte Teile werden nicht übernommen; geprüft: Liste in `PRODUCT.md` mit Datum je Bestätigung
- [ ] 8.2 Gewählte Richtung in `src/app/(site)/page.tsx`, Startseiten-Inhalte und je nach Entscheidung Header und Footer der Live-Seite überführen, Tests anpassen; geprüft: `pnpm check` grün, Lighthouse CI innerhalb Budget, ZAP-Baseline ohne FAIL
- [ ] 8.3 Screenshots der übernommenen Startseite (und betroffener Unterseiten) neben dem gewählten Entwurf vorlegen; geprüft: Freigabe des Inhabers liegt vor
- [ ] 8.4 Nach Freigabe: Entwürfe, `src/app/entwurf/`, `src/drafts/`, Prüfbuild und Compose-Profil `drafts` entfernen, committen; geprüft: `pnpm build` und Artefaktprüfung grün, kein Verweis auf Entwürfe im Repository außer in diesem Change
