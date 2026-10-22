# Product

Grundlage für die Neugestaltung der Startseite (OpenSpec-Change `redesign-home-page`). Hält fest, wen die Seite überzeugen soll, was GÖK tatsächlich anbietet und welche Belege vorliegen. Gestaltung leitet sich daraus ab, nicht umgekehrt.

Stand: 22.10.2026. Quellen in eckigen Klammern; „offen“ heißt: vom Kunden zu bestätigen oder zu liefern.

## Platform

Web. Statische Next.js-Seite mit PHP-Formular-Endpunkt bei IONOS Deploy Now. Rahmen: OpenSpec-Change `relaunch-react-website` (Sicherheit, Barrierefreiheit, Performance-Budget).

## Users

1. **Auftraggeber** (Hauptzielgruppe der Startseite): Verantwortliche bei Bauunternehmen, Baubetreuern und Eisenbahninfrastruktur-Projekten, die für eine Gleisbaumaßnahme Bauüberwachung, Sicherungsüberwachung oder Antragswesen brauchen. Sie prüfen schnell, ob GÖK die geforderten Funktionen abdeckt, in ihrer Region arbeitet und erreichbar ist. [abgeleitet aus Leistungen und Partnerliste der bisherigen Website; welche Auftraggeber-Typen tatsächlich dominieren: offen]
2. **Bewerber**: erfahrene Fachbauüberwacher sowie Quereinsteiger für die Funktionsausbildung. [content/careers/]
3. Nachgeordnet: Partnerfirmen und Netzwerk.

## Product Purpose

Die Startseite soll Auftraggeber überzeugen, Kontakt aufzunehmen (Formular, Telefon, WhatsApp). Zweite Handlung: Bewerber finden die offenen Stellen. [bisherige Startseite: primärer CTA „Kontakt aufnehmen“; Reihenfolge der Handlungen: offen, siehe Fragen]

## Positioning

Junges, spezialisiertes Unternehmen (gegründet Mai 2023) mit erfahrenem Team aus dem Gleisbau. Bauüberwachung nach den Regelwerken der DB InfraGO, Schwerpunkt Oberbau, Einsatzgebiet Süddeutschland (Baden-Württemberg und Bayern belegt durch Projekte). [content/company.yaml, content/projects/]

## Leistungen

Angeboten [content/services/, Status `offered`], Bereich „Fachbauüberwachung Oberbau und Bauüberwachung Bahn Ob/KIB“:
- Technischer Berechtigter
- Sicherungsüberwacher
- BETRA-Antragsteller (BBP-Neo)
- Schaltantragsteller
- Anlagenbeauftragter an/nahe Oberleitungsanlagen
- DV-gestützte Inspektion
- Überwachung der vertragskonformen Bauausführung
- MKS/DAS-Befähigung

In Vorbereitung [Status `planned`; MUST als „in Vorbereitung“ erscheinen], Bereich „Fachkraft Schienentechnik (SÜ/QÜS)“:
- Fachkraft Schienentechnik (FaSt), Bauleiter Spannungsausgleich, Qualitätsüberwachung Schienenbearbeitung (QÜS), Schweißüberwacher, Schweißtechnische Arbeitsaufnahme

## Evidence on Hand

### Stammdaten (amtlich oder vom Kunden geliefert)
- GÖK Bauüberwachung Bahn GmbH, Geschäftsführer Deniz Gök, Max-Planck-Straße 16, 89250 Senden-Wullenstetten; USt-IdNr. DE455803768. [content/company.yaml]
- Telefon/WhatsApp +49 162 1991444, info@goekbau.de. [content/company.yaml]
- Handelsregister (Gericht, HRB): offen.

### Unternehmensangaben (von der bisherigen Website übernommen, von uns nicht unabhängig geprüft)
- Kennzahlen: Gründung 2023, 56.000+ Stunden am Gleis, 170+ Projekte, 21 Jahre Branchenerfahrung. [content/stats.yaml ← WordPress]
- Projekte: Strecke 4940 Goldshöfe – Ellwangen (Mai 2023), Strecke 4540 Rechtenstein – Riedlingen – Herbertingen (Mai 2023), Strecke 4930 Fornsbach – Gaildorf – Schwäbisch Hall (Juli 2023), Strecke 5830 (FUB) Passau – Obertraubling (September 2023). [content/projects/ ← WordPress]
- Team: Deniz Gök (Geschäftsführer), Cem Baris (Bauingenieur), Hasan Sefil, Marcus Gründel, Konstantin Stukal, Markus Noel (Fachbauüberwacher Oberbau). Foto nur von Deniz Gök. [content/team/]
- Partner: DB InfraGO, Gök Bauüberwachung LST, AGP Baubetreuung, Btb, KNOW Personalberatung, PD RES Railway Engineering Services. Art der Beziehung (Auftraggeber, Partner, Netzwerk): offen. [content/partners/]

### Von uns geprüfte Belege
- Eigene Baustellenfotos mit eingeblendetem Bautagebuch-Stempel. Gelesen: Goldshöfe 14.05.2023, Biberach 30.05.2023; der Monat stimmt jeweils mit der Projektangabe überein (Strecke 4940 bzw. 4540, Mai 2023). Die Zuordnung von Foto zu Strecke und Projektabschnitt ist aus dem Altbestand übernommen und unbestätigt; der Stempel allein belegt sie nicht. Fornsbach und Passau: Fotos vorhanden, Stempel nicht gelesen. [content/media/projects/]

### Nicht verwendbar
- Stockfotos aus Fotolia/Adobe Stock (Lizenznachweis fehlt). Pixabay-Fotos (Hero heute) sind lizenzrechtlich nutzbar, zeigen aber nicht GÖKs Arbeit. [research/wp-audit/MIGRATION.md]
- Keine Kundenstimmen, Zertifikate, Fallstudien oder Kundenlogos mit Freigabe. Nichts davon wird erfunden. Beispiele werden als Beispiele gekennzeichnet.

## Brand Commitments

- Name GÖK Bauüberwachung Bahn; Logo-Abzeichen (Raster, `content/media/brand/logo-goek.png`); Claim „Vorreiter im Gleisbau“.
- Corporate Design aus dem Elementor-Kit: Bronze `#A6875C` (Signalfarbe), Raleway, Roboto Slab, Poppins. [openspec: brand-design-system]
- Ansprache: „Sie“, „wir“. [bisherige Website]

## Product Principles

1. Fachlich korrekt vor beeindruckend: Grafiken und Begriffe müssen einem Fachbauüberwacher standhalten.
2. Belege vor Behauptungen: eigene Fotos, echte Strecken, gekennzeichnete Firmenangaben.
3. Schnell erreichbar: Der Weg zum Kontakt ist von jeder Stelle der Startseite kurz.
4. Robust: lesbar ohne Überlagerungen oder abgeschnittene Schrift in jeder gängigen Fenstergröße, mit und ohne Animation.

## Accessibility & Inclusion

WCAG 2.2 AA (axe ohne serious/critical), Tastaturbedienung, Touch-Ziele ≥ 44 px, `prefers-reduced-motion` respektiert. [openspec: accessibility]

## Offene Inhaltsfragen an den Kunden

1. Primäre Handlung der Startseite: Auftraggeber-Kontakt vor Bewerbung? (bisher ja)
2. Welche Auftraggeber-Typen sollen sich angesprochen fühlen (Bauunternehmen, DB-Projekte, Ingenieurbüros)?
3. Beziehung zu den sechs genannten Partnern; dürfen Logos als Referenz gezeigt werden?
4. Weitere eigene Baustellen- und Teamfotos (Freigabe der abgebildeten Personen)?
5. Welche Prüfaufgaben gehören fachlich zu welcher Leistung (Grundlage für eine Gleisquerschnitt-Grafik)?
6. Weitere Strecken/Projekte seit September 2023, die genannt werden dürfen?
7. Kennzahlen aktuell? (Stunden, Projekte)
