## Purpose

Beschreibt die Unternehmensseiten (Startseite, Über uns, Leistungen, Kontakt, Impressum, Datenschutz), ihre Pflichtsektionen und welche Inhalte sie zeigen.

## ADDED Requirements

### Requirement: Seitenbestand
Die Website SHALL folgende Seiten unter diesen Pfaden bereitstellen: `/` (Startseite), `/uber-uns/`, `/leistungen/`, `/karriere/`, `/kontakt/`, `/impressum/`, `/datenschutz/`. Alle Pfade MUST mit abschließendem Schrägstrich kanonisch sein.

#### Scenario: Pfad ohne Schrägstrich
- **WHEN** ein Nutzer `/kontakt` aufruft
- **THEN** wird er per 301 auf `/kontakt/` weitergeleitet

### Requirement: Startseite
Die Startseite SHALL in dieser Reihenfolge enthalten: Hero (Claim, Kurztext, primärer CTA zu Kontakt, sekundärer CTA zu Leistungen), Kurzvorstellung des Unternehmens, Leistungsübersicht mit Link zu `/leistungen/`, Auswahl abgeschlossener Projekte, Team-Teaser mit Link zu `/uber-uns/`, Karriere-Teaser und Kontakt-CTA.

#### Scenario: Hero ohne Wiederholung
- **WHEN** die Startseite geladen wird
- **THEN** enthält der Hero genau eine `h1` und keinen doppelten Slide-Inhalt

#### Scenario: CTA-Ziele
- **WHEN** ein Nutzer den primären Hero-CTA aktiviert
- **THEN** landet er auf `/kontakt/`

### Requirement: Leistungen
Die Seite `/leistungen/` SHALL alle Leistungen aus dem Inhaltsmodell anzeigen, gruppiert nach Leistungsbereich. Leistungen mit Status „geplant“ MUST sichtbar als „in Vorbereitung“ gekennzeichnet sein und dürfen nicht als aktuell angeboten erscheinen.

#### Scenario: Geplante Leistung
- **WHEN** eine Leistung im Inhaltsmodell den Status `planned` hat
- **THEN** zeigt die Seite sie mit dem Hinweis „in Vorbereitung“ und gestalterisch abgesetzt von angebotenen Leistungen

#### Scenario: Startseite und Leistungsseite konsistent
- **WHEN** eine Leistung im Inhaltsmodell geändert wird
- **THEN** ändert sich ihre Darstellung auf Startseite und Leistungsseite gleichermaßen (eine Quelle)

### Requirement: Über uns
Die Seite `/uber-uns/` SHALL enthalten: Unternehmensprofil, Werte, Kennzahlen, Referenzprojekte, Team und Kunden/Partner. Kennzahlen, Projekte, Team und Partner MUST aus dem Inhaltsmodell stammen.

#### Scenario: Kennzahl aktualisieren
- **WHEN** eine Kennzahl (z. B. „Stunden am Gleis“) im Inhaltsmodell geändert und neu deployt wird
- **THEN** zeigt die Seite den neuen Wert, ohne dass Komponentencode geändert wurde

#### Scenario: Teammitglied ohne Foto
- **WHEN** für ein Teammitglied kein Foto hinterlegt ist
- **THEN** wird ein neutraler Platzhalter mit Initialen angezeigt statt eines kaputten Bildes

### Requirement: Kontaktseite
Die Seite `/kontakt/` SHALL das Kontaktformular, Firmenanschrift, Telefon, WhatsApp, E-Mail-Adressen und eine Karte bzw. einen Kartenplatzhalter gemäß `privacy-consent` enthalten.

#### Scenario: Adresse maschinenlesbar
- **WHEN** die Kontaktseite gerendert wird
- **THEN** ist die Anschrift in einem `<address>`-Element ausgezeichnet

### Requirement: Rechtstexte
Die Seiten `/impressum/` und `/datenschutz/` SHALL die rechtlich erforderlichen Angaben enthalten. Die Datenschutzerklärung MUST die tatsächlich eingesetzten Dienste beschreiben (Hosting IONOS, Formularverarbeitung, Google Maps nach Einwilligung, WhatsApp-Link) und darf keine nicht mehr genutzten Dienste nennen.

#### Scenario: Entfernter Dienst
- **WHEN** ein Dienst (z. B. Google Fonts) nicht mehr eingebunden ist
- **THEN** wird er in der Datenschutzerklärung nicht mehr als genutzter Dienst aufgeführt

### Requirement: Sprachliche Qualität
Alle Seitentexte SHALL in deutscher Sprache, frei von bekannten Tipp- und Zusammenschreibfehlern und widerspruchsfrei sein. Insbesondere MUST das Unternehmen auf allen Seiten einheitlich beschrieben werden.

#### Scenario: Widerspruchsfreie Firmenbeschreibung
- **WHEN** Startseite und Über-uns-Seite das Unternehmen beschreiben
- **THEN** verwenden beide dieselbe Aussage zu Gründungsjahr und Unternehmensstatus
