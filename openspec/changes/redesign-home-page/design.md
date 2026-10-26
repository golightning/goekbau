# Design

## Context

Motivation: siehe proposal.md. Ziel, Zielgruppen und Belege: `PRODUCT.md`. Ausgangslage: Startseite in der Fassung von Commit 2f37112; Screenshots unter `bestand/` (1500 × 750 und 390 × 844, jeweils erster Bildschirm und ganze Seite).

Rahmen aus `relaunch-react-website`, der unverändert gilt:
- statischer Export (`output: "export"`), CSP mit Hashes, keine externen Quellen
- JavaScript ≤ 160 KB initial; LCP ≤ 3,0 s mit Foto-Hero, sonst ≤ 2,5 s
- WCAG 2.2 AA
- Inhalte aus `content/` (Velite)

Prozessreferenzen: `../kurt` und `../golightning-website`.
- **KURT:** Fachgrafiken aus dem Geschäft des Kunden (Routenlinie, bemaßter Auflieger) und eine einzige autorisierte Bewegung. Das Kundenlogo ist als 3D-Objekt nachgeladen und hat einen Vektor-Ersatz.
- **golightning:** `PRODUCT.md`, drei Entwürfe als Dev-Routen neben dem Ist-Stand, Wahl durch den Inhaber, datierte Varianten im Design-Dokument und eine Abschlussprüfung.

Lehre aus dem gescheiterten Versuch (6012614 → 2f37112): Ein bestandenes Prüfskript ist kein Gestaltungsurteil. Bewertet wird am Screenshot, so wie Inhaber und Besucher die Seite sehen.

## Goals / Non-Goals

**Goals:**
- Drei echte, voneinander unterscheidbare Startseiten-Entwürfe aus GÖKs Arbeit, zwischen denen der Inhaber wählen kann.
- Ein Vergleich, der Darstellungsfehler vor der Vorlage ausschließt.
- Übernahme der gewählten Richtung ohne Verlust bei Sicherheit, Barrierefreiheit und Performance.

**Non-Goals:**
- Neugestaltung der Unterseiten. Header und Footer werden in den Entwürfen gestaltet; ob sie auf die Unterseiten übertragen werden, entscheidet sich vor der Übernahme (D3).
- Neue Inhalte erfinden: Kundenstimmen, Zertifikate, Fallstudien, Kennzahlen.
- Geografisch genaue Karten.
- 3D als Pflichtbestandteil.

## Decisions

### D1 Drei Richtungen aus GÖKs Arbeit
- **A, technisch-präzise:** Eine Linienzeichnung im Stil eines Regelquerschnitts (Schiene, Schwelle, Schotter, Oberleitung) ordnet den Bauteilen die angebotenen Prüfaufgaben zu. Technischer Raster, Bronze für Markierungen.
- **B, fotografisch-dokumentarisch:** Die eigenen Bautagebuch-Fotos tragen die Seite. Der Stempel (Datum, Ort) bleibt sichtbar und wird zur Beschriftung, das Projekt steht als Bildunterschrift daneben. Ruhige Typografie.
- **C, regional-vernetzt:** Die belegten Projektabschnitte erscheinen als gekennzeichnetes Schema über Baden-Württemberg und Bayern, mit Streckennummer, Abschnitt und Zeitraum. Der Firmensitz Senden ist der Ausgangspunkt.

Für alle drei gilt:
- Bronze `#A6875C` verbindet die Richtungen, Hell oder Dunkel ist je Entwurf frei.
- Das vorhandene Logo bleibt.
- Die Kerninhalte sind identisch (Spec `design-drafts`).
- Jeder Entwurf hat einen eigenen Header und Footer (D3).

Alternativen:
- Drei Varianten derselben dunklen Seite: verworfen, das ist keine echte Wahl.
- Richtungen aus einer Stilbibliothek per Zufall zuteilen: verworfen, so ist der gescheiterte Versuch entstanden.

### D2 Entwurfsrouten über die Dateiendung
Entwurfsseiten heißen `src/app/entwurf/<a|b|c>/page.draft.tsx`. `next.config.ts` nimmt `draft.tsx` nur dann in `pageExtensions` auf, wenn der Entwicklungsmodus läuft oder der Prüfbuild (D4) ausdrücklich angefordert ist. App Router unterstützt `pageExtensions`, siehe `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/pageExtensions.md`. Im auslieferbaren Build ist `page.draft.tsx` keine Seite.

Entwurfskomponenten liegen unter `src/drafts/`. Bilder und sonstige Dateien, die nur Entwürfe brauchen, liegen dort und nicht unter `public/`, damit sie nur über Entwurfsseiten ins Bundle kommen.

Alternativen:
- Umgebungsvariable mit `notFound()`: verworfen, die Seite würde trotzdem exportiert.
- Separates Projekt: verworfen, Inhalte und Komponenten müssten dupliziert werden.

### D3 Vollständige Gestaltung mit Header und Footer, Live-Seite unberührt
Entscheidung des Inhabers vom 22.10.2026: Header und Footer gehören zum Re-Redesign. Jeder Entwurf zeigt die Startseite mit eigenem Header und Footer, sodass jeweils eine vollständige Gestaltung gewählt wird. Ob der gewählte Header und Footer auch auf alle Unterseiten kommt, wird vor der Übernahme geklärt (Aufgabe 7.1).

Technisch rendert das Root-Layout heute Header, Footer und Schnellkontakt für jede Seite. Ein Entwurfs-Header erschiene darunter doppelt. Deshalb kommt eine Route-Group:
- `src/app/layout.tsx` behält `html`, `body`, Schriften, `globals.css` und den Sprunglink.
- Header, Footer und Schnellkontakt wandern in `src/app/(site)/layout.tsx`, die Live-Seiten nach `src/app/(site)/`. URLs ändern sich nicht (Route-Groups erscheinen nicht im Pfad, siehe `03-file-conventions/route-groups.md`).
- `src/app/not-found.tsx` bleibt auf oberster Ebene, weil der statische Export die Fehlerseite von dort erzeugt. Sie bindet Header, Footer und Schnellkontakt selbst ein, damit die Spec „Fehlerseite“ (Navigation und Footer) und der bisherige Schnellkontakt erhalten bleiben.
- `src/app/entwurf/` liegt außerhalb von `(site)` und erbt so keinen Live-Header und -Footer. Entwurfs-Header und -Footer liegen unter `src/drafts/`.

Diese Umstrukturierung ist die einzige Änderung an Dateien der Live-Seite vor der Übernahme. Byte-gleiches HTML ist kein sinnvoller Maßstab, weil Next.js interne Routingdaten (Segment-Baum, RSC-Nutzdaten) ins HTML schreibt, die sich mit der Route-Group zwangsläufig ändern. Nachweis vor/nach für alle Live-Routen einschließlich 404:
- gleiche gerenderte Seitenstruktur (Landmarks, Überschriften-Hierarchie), Textinhalte, Links (`href`) und Metadaten (Titel, Beschreibung, Canonical, Robots, Open Graph, JSON-LD), extrahiert aus dem gerenderten DOM;
- gleiche Darstellung: Screenshots bei 1500 × 750 und 390 × 844, pixelweise verglichen mit kleiner Toleranz für Kantenglättung;
- bestehende Funktionstests ohne Anpassung grün;
- Fehlerseite mit Navigation, Footer und Schnellkontakt wie bisher.

Danach ändern Entwürfe keine Datei unter `src/components/`, `src/styles/` oder `src/app/(site)/`.

Alternativen:
- Header und Footer in Live-Komponenten per Pfadabfrage ausblenden: verworfen, das ändert Live-Komponenten für einen Entwurfszweck.
- Entwürfe nur mit Startseiten-Inhalt: verworfen nach Entscheidung des Inhabers.

### D4 Dev-Vorschau, Prüfbuild und auslieferbares Artefakt getrennt
Es gibt drei Ausgaben mit getrennten Aufgaben:
1. **Dev-Vorschau** (`pnpm dev`): zum Ansehen und Bedienen. Größe und Ladezeit von hier sind kein Nachweis.
2. **Prüfbuild** (`pnpm drafts:build`):
   - Optimierter Produktions-Build mit Entwurfsrouten, Ausgabe über `distDir` nach `out-drafts/`, zusammengesetzt wie das echte Artefakt (gleiche `.htaccess`, CSP-Hashes, Header) nach `dist/drafts-check/`.
   - Ausgeliefert von einem eigenen Container des lokalen Nachbaus auf Port 8081 (Compose-Profil `drafts`).
   - Nur hier werden initiales JavaScript (gzip), LCP und CSP-Verstöße gemessen.
   - Er wird nie deployt, und kein Deploy-Skript kennt diesen Pfad.
3. **Auslieferbares Artefakt** (`pnpm build` + `assemble` → `dist/site`): immer entwurfsfrei, siehe D5.

`scripts/draft-compare.mjs` (Playwright) arbeitet gegen den Prüfbuild und den Ist-Stand:
- Screenshots bei 1500 × 750 und 390 × 844, jeweils erster Bildschirm und ganze Seite, mit ausgelösten Scroll-Effekten.
- Zusätzliche Messung bei 1280 × 720 und 1920 × 1080: horizontales Scrollen, Textelemente mit mehr Inhalt als Kasten, sich überlagernde Textkästen, CSP-Verstöße in der Konsole.

Die Ergebnisse landen in `vergleich/` als Tabelle. Zur Vorlage gehören Screenshots, Tabelle und die bedienbare Vorschau. Ich sehe mir jeden Screenshot selbst an, bevor ich vorlege. Die Messung ersetzt den Blick nicht.

### D5 Nachweis, dass Entwürfe nicht ausgeliefert werden
Gebündelte Dateien tragen nicht zwingend Quellpfad oder Komponentennamen. Eine Textsuche nach `src/drafts/` reicht deshalb nicht.

Der Nachweis arbeitet mit einem absichtlich eingeschleusten Kanarienvogel:
- `src/drafts/canary.ts` exportiert eine eindeutige Zeichenkette, die jede Entwurfsseite rendert.
- `src/drafts/assets/canary.svg` ist eine Datei mit eindeutigem Inhalt, die jede Entwurfsseite importiert.

`scripts/check-artifact.mjs` prüft `dist/site`:
- Keine Datei enthält die Kanarien-Zeichenkette.
- Keine Datei hat den SHA-256 einer Datei unter `src/drafts/assets/`.
- Es gibt kein Verzeichnis `entwurf`.

Positivkontrolle: Dieselbe Prüfung muss im Prüfbuild `dist/drafts-check` die Kanarien-Zeichenkette und das Kanarien-Asset finden. Sonst ist die Erkennung defekt und der Build schlägt fehl.

Ein E2E-Test prüft auf dem Nachbau des auslieferbaren Artefakts, dass `/entwurf/a/`, `/entwurf/b/` und `/entwurf/c/` mit 404 antworten.

### D6 Grafiken fachlich korrekt
Die Streckengrafik (C) zeigt nur Strecken aus `content/projects/` als Schema mit dem Hinweis „Schema, nicht maßstäblich“. Die Lage ist grob relativ (Region und Reihenfolge), nicht geografisch.

Die Querschnittszeichnung (A) zeigt nur Prüfaufgaben, die einer angebotenen Leistung zugeordnet sind. Die Zuordnung steht als Daten in `src/drafts/`, und jede Zuordnung ist bis zur Bestätigung durch den Kunden als Annahme markiert (PRODUCT.md, Frage 5).

### D7 Bewegung zurückhaltend und robust
Pro Entwurf gibt es höchstens eine Signatur-Bewegung, nach dem Vorbild von KURT:
- A: Die Zeichnung baut sich auf.
- B: Fotos werden aufgedeckt.
- C: Die Strecken zeichnen sich ein.

Umsetzung mit CSS oder `IntersectionObserver` und ohne neue Abhängigkeit. Alle Inhalte sind ohne JavaScript und bei `prefers-reduced-motion` vollständig sichtbar.

GSAP wird nicht eingeführt. KURT hat es wegen unsichtbar stehengebliebener Abschnitte wieder entfernt, und es belastet das Budget.

### D8 3D-Logo als getrennter Versuch
Erst nach der Wahl, und nur wenn der Inhaber es möchte. Das Logo wird mit img2threejs als 3D-Objekt umgesetzt und in der gewählten Richtung als Variante neben die flache Fassung gestellt.

Verglichen werden:
- Wiedererkennbarkeit, als Screenshot neben dem Original
- zusätzlicher Download (three.js-Chunk, separat ausgewiesen, nachgeladen nach dem ersten Bild), gemessen im Prüfbuild (D4)
- Darstellung auf dem Handy

Das initiale JavaScript bleibt ≤ 160 KB. Ohne WebGL2 oder bei reduzierter Bewegung erscheint das flache Logo.

**Umgesetzt (25.10.2026):** Die Medaille steht am Firmensitz im Hero-Streckennetz. Ersatz ist statt des flachen Logos ein vorgerendertes Standbild desselben Modells (Empfehlung des Beraters: „3D-Logo auf allen Geräten mit statischem Fallback, bei reduzierter Bewegung ebenfalls statisch“). three.js lädt erst nach der ersten Nutzeraktion. Statisch bleibt es außerdem im Datensparmodus, auf schwachen Geräten und ohne WebGL. Messwerte in `vergleich/3d.md`.

### D9 Werkzeuge
Die Entwürfe entstehen direkt aus `PRODUCT.md` und GÖKs Material. Das Plugin impeccable (wie bei golightning) kann für Kritik und die Abschlussprüfung eingesetzt werden. Sein Urteil ergänzt die eigene Prüfung am Screenshot und die Wahl des Inhabers, ersetzt sie aber nicht. taste-skill wird für die Richtungswahl nicht verwendet.

## Risks / Trade-offs

- [Kunde kann Fachfragen (PRODUCT.md, Fragen 2, 3, 5) nicht rechtzeitig beantworten] → Entwürfe kennzeichnen Annahmen sichtbar. Die Übernahme in die Live-Seite wartet auf die Antworten zu den dort tatsächlich gezeigten Inhalten.
- [Nur vier eigene Fotos, eines davon Nachtaufnahme] → Entwurf B kann dünn wirken. Er kommt trotzdem in die Vorlage, damit der Inhaber sieht, was mit mehr Fotos möglich wäre; der Fotobedarf wird benannt.
- [Entwurfscode gelangt in Produktion] → D2 und D5: Dateiendung, Kanarien-Prüfung mit Positivkontrolle, E2E-404-Test für alle drei Routen.
- [Umstrukturierung in `(site)` verändert die Live-Seite unbemerkt] → D3: Vergleich von Struktur, Inhalten, Links, Metadaten und Screenshots vor/nach, Funktionstests unverändert; Fehlerseite bindet Header, Footer und Schnellkontakt selbst ein.
- [Messwerte aus der Dev-Vorschau werden als Budgetnachweis missverstanden] → D4: Größe und LCP nur aus dem Prüfbuild.
- [Entwurf wirkt nur in einer Fenstergröße] → D4: vier Größen gemessen, zwei dokumentiert, Darstellungsfehler blockieren die Vorlage.
- [Übernahme verschlechtert Budget oder Barrierefreiheit] → Aufgabengruppe 8 prüft gegen die bestehenden Vorgaben (Lighthouse CI, axe, ZAP, Bundle-Grenze), bevor committet wird.

## Migration Plan

1. Entwürfe leben nur im Dev, ohne Wirkung auf die Live-Seite.
2. Nach Wahl und Freigabe ersetzt die gewählte Richtung `src/app/(site)/page.tsx`, die Startseiten-Inhalte sowie, je nach Entscheidung, Header und Footer der Live-Seite. Die nicht gewählten Entwürfe, `src/app/entwurf/`, der Prüfbuild und das Compose-Profil `drafts` werden gelöscht; der Kanarienvogel bleibt bis dahin aktiv.
3. Rückweg: Revert des Übernahme-Commits. Die Startseite von 2f37112 bleibt Bezugspunkt.

## Gewählte Richtung

**25.10.2026, Inhaber (golightning):**
- Vorgelegt wurden A, B und C; am ehesten C, aber alle „zu langweilig“. Daraufhin entstand Entwurf D als mutigere Weiterentwicklung von C: dunkler Grund, große Schrift, leuchtendes Streckennetz mit fahrenden Messpunkten im Hero, Projekte als seitliche Fahrt entlang eines Gleises beim Scrollen, hochzählende Kennzahlen, Leistungen als große nummerierte Zeilen, goldenes Kontaktband. **Gewählt: D („Netzplan“).**
- Übernahme nur für die Startseite, einschließlich eigenem dunklen Header und Footer (Route-Group `(home)`); alle Unterseiten behalten den bisherigen Header und Footer. Navigation, Pflichtangaben im Footer und Schnellkontakt sind inhaltlich gleich wie auf den Unterseiten.
- Endlosbewegungen (Messpunkte, Puls, rollendes Gleis) lassen sich per Schalter anhalten (WCAG 2.2.2) und entfallen bei reduzierter Bewegung; die seitliche Fahrt wird auf dem Handy und bei reduzierter Bewegung zur senkrechten Liste.
- Display-Schrift bleibt Raleway 700 (ein Schnitt je Familie, performance-budget); der Entwurf nutzte 800.
- Die Startseite hat kein Foto-Hero mehr; damit gilt für sie das LCP-Budget der Seiten ohne Foto-Hero (2,5 s).
- Keine Telefonnummer mehr auf der gesamten Website, weder sichtbar noch als `tel:`-Link noch in JSON-LD, um Spam-Anrufe zu vermeiden (Deltas in `relaunch-react-website`: site-navigation, company-pages, seo-metadata, form-submissions).
- 3D-Logo (D8, Aufgabe 7.3) gewünscht, auf allen Geräten mit statischem Ersatz; umgesetzt, siehe D8 und `vergleich/3d.md`.

**26.10.2026, Ladezeit („optimiere, was geht, ohne beim Design zu sparen“):** Der Produktions-Build läuft mit Webpack statt Turbopack (`next build --webpack`, Dev-Server weiter Turbopack). Lighthouse CI, Median aus 5 Läufen: Startseite 2,98 → 2,74 s, Karriere 2,52 → 2,40 s, Kontakt 2,53 → 2,42 s, Über uns 2,97 → 2,73 s; E2E unverändert grün. Verworfen: Poppins nicht vorladen (Schriftwechsel, CLS 0,014). Die Startseite bleibt über 2,5 s: Real ist sie nach etwa 0,2 s gezeichnet, den Rest rechnet die Lighthouse-Simulation aus dem Framework-JavaScript hoch. Ressourcen-Zählung 35, davon gut 10 Vorab-Abrufe verlinkter Seiten nach dem Laden. Budget-Entscheidung (LCP Startseite, Anzahl Anfragen) steht beim Inhaber.
