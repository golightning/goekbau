## Purpose

Macht die Website für Suchmaschinen und Social-Media-Vorschauen korrekt lesbar: Sprache, Titel, Beschreibungen, strukturierte Daten, Sitemap und robots.txt.

## ADDED Requirements

### Requirement: Dokumentsprache
Jede Seite SHALL `<html lang="de">` deklarieren und `og:locale` auf `de_DE` setzen.

#### Scenario: Sprachattribut
- **WHEN** eine beliebige Seite ausgeliefert wird
- **THEN** enthält das HTML-Element `lang="de"`

### Requirement: Eindeutige Titel und Beschreibungen
Jede indexierbare Seite SHALL einen eindeutigen `<title>` (höchstens 60 Zeichen vor dem Suffix „| GÖK Bauüberwachung Bahn“) und eine eindeutige Meta-Description (70–160 Zeichen) haben.

#### Scenario: Fehlende Beschreibung
- **WHEN** für eine Seite keine Meta-Description im Inhaltsmodell gepflegt ist
- **THEN** schlägt der Build mit einem Hinweis auf die betroffene Seite fehl

#### Scenario: Doppelter Titel
- **WHEN** zwei Seiten denselben Titel hätten
- **THEN** schlägt die SEO-Prüfung im Build fehl

### Requirement: Kanonische URL
Jede Seite SHALL einen `<link rel="canonical">` auf ihre absolute URL unter `https://www.goekbau.de` mit abschließendem Schrägstrich setzen.

#### Scenario: Canonical der Kontaktseite
- **WHEN** `/kontakt/` ausgeliefert wird
- **THEN** zeigt das Canonical auf `https://www.goekbau.de/kontakt/`

### Requirement: Social-Vorschau
Jede Seite SHALL Open-Graph- und Twitter-Card-Metadaten (Titel, Beschreibung, Bild mit 1200×630 px, URL) ausgeben.

#### Scenario: Seite ohne eigenes Bild
- **WHEN** für eine Seite kein eigenes Vorschaubild gepflegt ist
- **THEN** wird das Standard-Vorschaubild der Marke verwendet

### Requirement: Strukturierte Unternehmensdaten
Die Startseite SHALL JSON-LD vom Typ `Organization` (bzw. `LocalBusiness`) mit Name, Logo, Anschrift und einem `contactPoint` mit Verweis auf `/kontakt/` ausgeben. Diese Werte MUST aus derselben Quelle wie Footer und Kontaktseite stammen. E-Mail-Adressen MUST NOT enthalten sein (`email-security`), ebenso keine Telefonnummer (Entscheidung Auftraggeber 25.10.2026: keine Telefonnummer auf der Website, um Spam-Anrufe zu vermeiden).

#### Scenario: Anschrift geändert
- **WHEN** die Anschrift im Inhaltsmodell geändert wird
- **THEN** ändert sie sich in JSON-LD, Footer und Kontaktseite gleichzeitig

### Requirement: Sitemap und robots.txt
Die Website SHALL unter `/sitemap.xml` eine XML-Sitemap aller indexierbaren Seiten und unter `/robots.txt` einen Verweis auf diese Sitemap bereitstellen. Ergebnisseiten von Formularen und die 404-Seite MUST `noindex` sein und nicht in der Sitemap stehen.

#### Scenario: Neue Stelle
- **WHEN** ein neues Stellenangebot veröffentlicht und deployt wird
- **THEN** ist seine URL in `/sitemap.xml` enthalten

### Requirement: Staging nicht indexierbar
Nicht-Produktionsumgebungen SHALL per `X-Robots-Tag: noindex` bzw. `<meta name="robots" content="noindex">` von der Indexierung ausgeschlossen sein.

#### Scenario: Staging-Deployment
- **WHEN** eine Seite aus der Staging-Umgebung ausgeliefert wird
- **THEN** enthält sie eine `noindex`-Anweisung
