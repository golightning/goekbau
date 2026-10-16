## Purpose

Definiert, welche Inhaltstypen es gibt, wo sie liegen, wie sie validiert werden und wie Änderungen live gehen, damit Inhalte ohne Komponenten-Änderungen sicher gepflegt werden können.

## ADDED Requirements

### Requirement: Inhalte im Repository
Alle redaktionellen Inhalte SHALL als versionierte Dateien im Repository vorliegen, getrennt vom Komponentencode: Seitentexte, Leistungen, Leistungsbereiche, Projekte, Teammitglieder, Partner, Kennzahlen, Stellen- und Ausbildungsangebote, Unternehmensstammdaten.

#### Scenario: Text ändern
- **WHEN** ein Redakteur einen Absatz auf der Über-uns-Seite ändern will
- **THEN** genügt dafür die Änderung einer Inhaltsdatei, ohne Komponentencode anzufassen

### Requirement: Schema-Validierung beim Build
Jeder Inhaltstyp SHALL ein Schema mit Pflichtfeldern und Feldtypen haben. Verstößt eine Inhaltsdatei gegen ihr Schema, MUST der Build mit Fehlermeldung abbrechen, die Datei und Feld nennt.

#### Scenario: Pflichtfeld fehlt
- **WHEN** einem Stellenangebot das Feld `title` fehlt
- **THEN** bricht der Build ab und die Meldung nennt Dateipfad und Feld `title`

### Requirement: Unternehmensstammdaten als einzige Quelle
Firmenname, Anschrift, Telefon, E-Mail-Adressen, WhatsApp-Nummer, Social-Profile und Geschäftsführung SHALL an genau einer Stelle gepflegt werden. Alle Seiten, strukturierten Daten und Formular-E-Mails MUST diese Quelle verwenden.

#### Scenario: Doppelte Pflege verhindert
- **WHEN** die Telefonnummer im Code an einer zweiten Stelle als Literal auftaucht
- **THEN** meldet die Lint-Prüfung einen Fehler

### Requirement: Bilder mit Pflicht-Alternativtext
Jedes inhaltliche Bild SHALL im Inhaltsmodell einen Alternativtext haben oder ausdrücklich als dekorativ markiert sein.

#### Scenario: Bild ohne Alt-Text
- **WHEN** ein Teammitglied ein Foto ohne `alt` und ohne `decorative: true` hat
- **THEN** bricht der Build ab

### Requirement: Übernahme aus WordPress
Der Erstbestand der Inhalte SHALL aus der bestehenden WordPress-Installation übernommen werden: Texte redaktionell bereinigt, Bilder in Originalauflösung. Eine Gegenüberstellung MUST dokumentieren, welcher WordPress-Inhalt wohin migriert, verworfen oder zusammengeführt wurde.

#### Scenario: Migrationsnachweis
- **WHEN** die Migration abgeschlossen ist
- **THEN** listet `research/wp-audit/MIGRATION.md` für jede der 12 WordPress-Seiten ihr Ziel bzw. den Grund des Verwerfens

### Requirement: Änderungs-Workflow
Inhaltsänderungen SHALL über einen Pull Request in `main` live gehen. Jeder Pull Request MUST vor dem Merge eine Vorschau in der Staging-Umgebung erhalten.

#### Scenario: Neue Stelle veröffentlichen
- **WHEN** ein Pull Request mit einem neuen Stellenangebot gemergt wird
- **THEN** ist die Stelle nach erfolgreichem Deployment ohne weitere manuelle Schritte auf `/karriere/` sichtbar
