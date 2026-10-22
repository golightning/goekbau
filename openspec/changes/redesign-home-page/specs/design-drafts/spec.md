## Purpose

Gestaltungsentwürfe für die Website lassen sich lokal ansehen, messen und vergleichen, ohne die Live-Seite oder das auslieferbare Artefakt zu verändern.

## ADDED Requirements

### Requirement: Entwürfe nicht im auslieferbaren Artefakt
Entwurfsseiten SHALL nur im lokalen Entwicklungsserver und in einem ausdrücklich angeforderten, nie deployten Prüfbuild erreichbar sein. Das auslieferbare Artefakt MUST weder Entwurfsrouten noch Inhalte oder Dateien aus Entwürfen enthalten. Der Nachweis MUST über die Build-Ausgabe erfolgen, mit einem absichtlich eingeschleusten Test-Inhalt und einer Test-Datei. Die Prüfung MUST deren Fehlen im auslieferbaren Artefakt und deren Vorhandensein im Prüfbuild bestätigen; schlägt eine der beiden Seiten fehl, bricht der Build ab.

#### Scenario: Entwurf lokal
- **WHEN** der Entwicklungsserver läuft und `/entwurf/a/` aufgerufen wird
- **THEN** zeigt er Entwurf A der Startseite

#### Scenario: Entwurfsrouten im auslieferbaren Artefakt
- **WHEN** das auslieferbare Artefakt auf dem lokalen Nachbau läuft und `/entwurf/a/`, `/entwurf/b/` oder `/entwurf/c/` aufgerufen wird
- **THEN** antwortet der Server jeweils mit 404

#### Scenario: Test-Inhalt gelangt in das Artefakt
- **WHEN** der eingeschleuste Test-Inhalt oder eine Datei mit dem Inhalt der Test-Datei im auslieferbaren Artefakt gefunden wird
- **THEN** bricht die Artefaktprüfung mit einer Meldung ab, die die betroffene Datei nennt

#### Scenario: Erkennung defekt
- **WHEN** die Artefaktprüfung im Prüfbuild den Test-Inhalt oder die Test-Datei nicht findet
- **THEN** bricht die Prüfung ab, weil ihr negatives Ergebnis im auslieferbaren Artefakt sonst nichts beweist

### Requirement: Vollständige Entwürfe, Live-Seite unberührt
Jeder Entwurf SHALL die Startseite mit eigenem Header und Footer zeigen, ohne dass Header, Footer oder Schnellkontakt der Live-Seite zusätzlich erscheinen. Entwürfe MUST die Live-Seite unverändert lassen: Startseite, Unterseiten, Fehlerseite, Header, Footer und gemeinsame Styles. Eine strukturelle Vorbereitung im Code, die Entwürfe ohne Live-Header und -Footer ermöglicht, MUST für alle Live-Seiten dieselbe gerenderte Seitenstruktur, dieselben Inhalte, Links und Metadaten und eine unveränderte Darstellung ergeben. Interne Routingdaten des Frameworks im HTML MAY sich ändern. Die Fehlerseite MUST Navigation, Footer und Schnellkontakt behalten.

#### Scenario: Entwurf mit eigenem Header und Footer
- **WHEN** `/entwurf/b/` im Entwicklungsserver aufgerufen wird
- **THEN** enthält die Seite genau einen Header und genau einen Footer, beide aus Entwurf B

#### Scenario: Live-Seiten nach der Vorbereitung
- **WHEN** die Live-Seiten vor und nach der strukturellen Vorbereitung gebaut und verglichen werden
- **THEN** sind sichtbare Seitenstruktur (Landmarks, Überschriften), Textinhalte, Links, Metadaten (Titel, Beschreibung, Canonical, Robots, JSON-LD) und Screenshots bei 1500 × 750 und 390 × 844 gleich, und die bestehenden Funktionstests laufen ohne Anpassung durch

#### Scenario: Fehlerseite nach der Vorbereitung
- **WHEN** nach der Vorbereitung eine unbekannte URL aufgerufen wird
- **THEN** antwortet der Server mit 404 und die Fehlerseite zeigt Navigation, Footer und Schnellkontakt wie zuvor

### Requirement: Messung nur im Prüfbuild
Größe des initialen JavaScripts, LCP und CSP-Verstöße eines Entwurfs SHALL nur im Prüfbuild gemessen werden, der optimiert gebaut und mit denselben Sicherheitsregeln (`.htaccess`, CSP, Header) ausgeliefert wird wie das auslieferbare Artefakt. Werte aus dem Entwicklungsserver MUST NOT als Nachweis für Budgets verwendet werden.

#### Scenario: Budgetangabe
- **WHEN** für einen Entwurf eine JavaScript-Größe oder ein LCP-Wert genannt wird
- **THEN** stammt der Wert aus dem Prüfbuild und ist mit Datum und Messgröße in `vergleich/` belegt

### Requirement: Vergleichbare Entwürfe
Alle Entwürfe einer Vergleichsrunde SHALL dieselben Kerninhalte aus dem Inhaltsmodell zeigen und bei 1500 × 750 und 390 × 844 Pixeln neben dem heutigen Stand dokumentiert werden. Ein Entwurf MUST in jeder dokumentierten Größe sowie bei 1280 × 720 und 1920 × 1080 ohne horizontales Scrollen, ohne überlagerte und ohne abgeschnittene Schrift darstellbar sein; andernfalls wird er nicht zur Auswahl gestellt.

#### Scenario: Kerninhalte
- **WHEN** zwei Entwürfe derselben Runde verglichen werden
- **THEN** zeigen beide Haupthandlung, angebotene und geplante Leistungen, Projekte, Kennzahlen, Team, Karriere und Kontakt aus denselben Inhaltsdateien

#### Scenario: Darstellungsfehler
- **WHEN** in einem Entwurf bei einer der geprüften Größen Schrift abgeschnitten wird oder Elemente einander überlagern
- **THEN** wird der Entwurf vor der Vorlage korrigiert und nicht als Stilmittel begründet

### Requirement: Fachlich korrekte Grafiken
Grafiken, die GÖKs Arbeit darstellen, SHALL fachlich stimmen. Eine Streckengrafik MUST als Schema gekennzeichnet sein, solange keine geprüften Geometrien vorliegen, und MUST nur Projektabschnitte aus dem Inhaltsmodell zeigen. Eine Darstellung von Prüfaufgaben MUST nur Aufgaben zeigen, die angebotenen Leistungen zugeordnet sind; unbestätigte Zuordnungen MUST als Annahme gekennzeichnet sein. Leistungen „in Vorbereitung“ MUST als solche gekennzeichnet sein.

#### Scenario: Streckenschema
- **WHEN** ein Entwurf die Projektstrecken zeigt
- **THEN** trägt die Grafik einen sichtbaren Hinweis „Schema, nicht maßstäblich“ und enthält genau die Strecken aus dem Inhaltsmodell

#### Scenario: Prüfaufgabe ohne Leistung
- **WHEN** eine Prüfaufgabe keiner angebotenen Leistung zugeordnet ist
- **THEN** erscheint sie nicht in der Grafik

### Requirement: Fachliche Klärung vor Übernahme
Inhalte, die in Entwürfen als Annahme gekennzeichnet sind (Zuordnung von Prüfaufgaben zu Leistungen, Zuordnung von Fotos zu Projekten, Nennung von Partnern als Referenz), MUST vor ihrer Übernahme in die Live-Seite vom Kunden bestätigt sein; unbestätigte Annahmen werden nicht übernommen.

#### Scenario: Unbestätigte Partnernennung
- **WHEN** die gewählte Richtung Partnerlogos als Referenzen zeigt und keine Freigabe des Kunden vorliegt
- **THEN** wird dieser Teil nicht in die Live-Seite übernommen
