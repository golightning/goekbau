## Purpose

Sorgt dafür, dass die Website für alle Menschen nutzbar ist, auch mit Tastatur, Screenreader oder eingeschränktem Sehvermögen. Maßstab ist die Konformitätsstufe WCAG 2.2 AA.

## ADDED Requirements

### Requirement: WCAG-2.2-AA-Konformität
Alle Seiten SHALL die Erfolgskriterien der WCAG 2.2 auf Stufe AA erfüllen. Automatisierte Prüfungen MUST für jede Seite ohne Verstöße der Schwere „serious“ oder „critical“ bestehen.

#### Scenario: Automatisierte Prüfung
- **WHEN** die Pipeline axe-basierte Prüfungen gegen jede gerenderte Seite ausführt
- **THEN** werden keine Verstöße der Schwere „serious“ oder „critical“ gemeldet

### Requirement: Farbkontrast
Text SHALL ein Kontrastverhältnis von mindestens 4,5:1 haben (große Schrift: 3:1), Bedienelemente und Fokusindikatoren mindestens 3:1. Die Markenfarbe Bronze `#A6875C` MUST deshalb auf Weiß nicht für normalen Fließtext verwendet werden.

#### Scenario: Weißer Text auf Bronze-Button
- **WHEN** ein Button weißen Text auf Bronze-Hintergrund zeigt
- **THEN** ist die Schrift groß/fett genug für 3:1, oder der Ton wird auf eine dunklere Bronze-Abstufung mit mindestens 4,5:1 angepasst

#### Scenario: Text auf Hero-Foto
- **WHEN** Text über einem Foto steht
- **THEN** sorgt ein Overlay dafür, dass der Kontrast an jeder Stelle des Textes mindestens 4,5:1 beträgt

### Requirement: Tastaturbedienung und Fokus
Alle interaktiven Elemente SHALL per Tastatur in logischer Reihenfolge erreichbar und bedienbar sein und einen deutlich sichtbaren Fokusindikator zeigen.

#### Scenario: Formular per Tastatur
- **WHEN** ein Nutzer das Kontaktformular nur mit der Tastatur ausfüllt und absendet
- **THEN** gelingt das vollständig, und nach dem Absenden erhält die Erfolgs- bzw. Fehlermeldung den Fokus oder wird per Live-Region angesagt

### Requirement: Semantische Struktur
Jede Seite SHALL genau eine `h1`, eine lückenlose Überschriftenhierarchie und die Landmarks `header`, `nav`, `main` und `footer` haben.

#### Scenario: Überschriftenhierarchie
- **WHEN** die Überschriften einer Seite ausgelesen werden
- **THEN** folgt auf eine `h2` keine `h4` ohne dazwischenliegende `h3`

### Requirement: Formularbeschriftungen
Jedes Formularfeld SHALL ein sichtbares, programmatisch verknüpftes Label haben. Platzhaltertext ersetzt kein Label. Pflichtfelder MUST als solche ausgewiesen sein.

#### Scenario: Screenreader liest Feld
- **WHEN** ein Screenreader das E-Mail-Feld fokussiert
- **THEN** sagt er „E-Mail, Pflichtfeld, Eingabefeld“ oder Gleichwertiges an

### Requirement: Barrierefreiheitserklärung
Die Website SHALL eine Erklärung zur Barrierefreiheit mit Kontaktmöglichkeit für Barrieremeldungen bereitstellen, verlinkt im Footer.

#### Scenario: Barriere melden
- **WHEN** ein Nutzer im Footer auf „Barrierefreiheit“ klickt
- **THEN** erreicht er die Erklärung inklusive E-Mail-Kontakt für Meldungen
