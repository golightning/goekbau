## Why

Die Startseite ist funktional und robust, überzeugt aber nicht: Stockfoto statt eigener Arbeit, Textblöcke ohne Bezug zu GÖKs Fach, kein erkennbarer Unterschied zu anderen Dienstleistern. Ein erster Neugestaltungsversuch („Der Name als Monument“, Commit 6012614) ist gescheitert und wurde zurückgenommen (2f37112): Die Richtung war zugeteilt statt vom Kunden gewählt, Darstellungsfehler wurden als Stil gerechtfertigt. Die Projekte KURT und golightning-website zeigen das bessere Vorgehen: Ziel festhalten, mehrere echte Entwürfe zeigen, der Inhaber wählt, erst dann übernehmen.

## What Changes

- `PRODUCT.md` hält Zielgruppen, tatsächliche Leistungen, die Haupthandlung und die Belege fest; Stammdaten, Firmenangaben und von uns geprüfte Belege sind getrennt, offene Inhaltsfragen benannt.
- Drei gestalterisch unterschiedliche Entwürfe **der Startseite einschließlich Header und Footer** (Entscheidung des Inhabers, 22.10.2026), als lauffähige Seiten im Entwicklungsserver: technisch-präzise (Gleiszeichnung), fotografisch-dokumentarisch (eigene Baustellenfotos), regional-vernetzt (Projektstrecken als Schema). Bronze verbindet die Richtungen; ein dunkler Grund ist eine Option, keine Vorgabe.
- Vergleichspaket: alle Entwürfe mit denselben Kerninhalten, Screenshots bei 1500 × 750 und 390 × 844 neben dem heutigen Stand, bedienbare Vorschau, Prüfung von Lesbarkeit, Navigation und Bewegung. Größe und Ladezeit werden in einem optimierten, nie deployten Prüfbuild mit denselben Sicherheitsregeln gemessen, nicht im Entwicklungsserver.
- Nachweis über die Build-Ausgabe, dass das auslieferbare Artefakt entwurfsfrei ist: eingeschleuster Test-Inhalt und Test-Datei, Positivkontrolle im Prüfbuild, 404 für alle drei Entwurfsrouten.
- Ein 3D-Logo ist ein optionaler Versuch nach der Wahl, kein Bestandteil der Entwürfe.
- Auswahl und Varianten werden mit Datum in `design.md` festgehalten; erst nach Freigabe des Inhabers wird die gewählte Richtung in die echte Startseite übernommen und die Anforderung „Startseite“ angepasst.
- Live-Seite bleibt bis zur Freigabe unverändert. Einzige Vorbereitung: Header, Footer und Schnellkontakt wandern aus dem Root-Layout in eine Route-Group `(site)`, damit Entwürfe eigene zeigen können; Struktur, Inhalte, Links, Metadaten und Darstellung der Live-Seiten bleiben gleich. Ob der gewählte Header und Footer auf alle Unterseiten übertragen wird, wird vor der Übernahme geklärt.
- Als Annahme gekennzeichnete Fachinhalte (Prüfaufgaben, Foto-Projekt-Zuordnung, Partner als Referenz) werden erst nach Bestätigung des Kunden übernommen.

## Capabilities

### New Capabilities
- `design-drafts`: Gestaltungsentwürfe sind nur im Entwicklungsserver und in einem nie deployten Prüfbuild erreichbar, zeigen jeweils eine vollständige Gestaltung, werden vergleichbar dokumentiert und gemessen und hinterlassen nachweislich keine Spuren im auslieferbaren Artefakt oder in der Live-Seite.

### Modified Capabilities
<!-- Keine in diesem Planungsschritt. Die Anforderung „Startseite“ (company-pages, Change relaunch-react-website) wird erst nach der Wahl angepasst; welche Sektionen sie verlangt, hängt von der gewählten Richtung ab. Dafür wird dann ein Delta ergänzt (Aufgabe 6.2). -->

## Impact

- Neu: `PRODUCT.md`, Entwurfsseiten unter `src/app/entwurf/` (Dateiendung `.draft.tsx`), Entwurfskomponenten, Kanarien-Inhalt und -Datei unter `src/drafts/`, Prüfbuild `pnpm drafts:build` mit Compose-Profil `drafts` (Port 8081), `scripts/draft-compare.mjs`.
- Verschoben ohne Verhaltensänderung: Live-Seiten nach `src/app/(site)/`, Header/Footer/Schnellkontakt in `src/app/(site)/layout.tsx`; `src/app/not-found.tsx` bindet Header, Footer und Schnellkontakt selbst ein.
- Geändert: `next.config.ts` (Entwurfsendung nur im Dev und im Prüfbuild), `scripts/check-artifact.mjs` (Kanarien-Prüfung mit Positivkontrolle).
- Unverändert bis zur Freigabe: Inhalt von Startseite und Unterseiten, `src/components/**`, `src/styles/**`.
- Abhängigkeiten: keine neuen für die Entwürfe. three.js nur im optionalen 3D-Versuch, separat ausgewiesen.
- Baut auf dem Change `relaunch-react-website` auf; dessen Sicherheits-, Barrierefreiheits- und Performance-Vorgaben gelten unverändert.
