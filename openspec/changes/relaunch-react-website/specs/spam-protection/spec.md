## Purpose

Hält automatisierte und manuelle Spam-Einsendungen über die Formulare fern. Die Schutzschichten laufen ohne Drittanbieter und ohne Bilderrätsel, damit echte Interessenten und Bewerber nicht behindert werden.

## ADDED Requirements

### Requirement: Proof-of-Work-Prüfung (ALTCHA, selbst gehostet)
Jedes Formular SHALL vor dem Absenden eine unsichtbare Proof-of-Work-Aufgabe lösen, die der eigene Server ausstellt und prüft. Jede Aufgabe MUST signiert sein, höchstens 10 Minuten gültig sein und darf nur einmal verwendet werden. Es MUST dabei kein Request an Drittanbieter erfolgen.

#### Scenario: Fehlende oder gefälschte Lösung
- **WHEN** ein Request ohne gültige ALTCHA-Lösung oder mit manipulierter Signatur eingeht
- **THEN** antwortet der Endpoint mit HTTP 422 und versendet nichts

#### Scenario: Wiederverwendung
- **WHEN** eine bereits verwendete ALTCHA-Lösung erneut gesendet wird
- **THEN** wird die Übermittlung abgelehnt

#### Scenario: Keine Fremd-Requests
- **WHEN** ein Nutzer das Kontaktformular öffnet, ausfüllt und absendet
- **THEN** richten sich alle Requests ausschließlich an den eigenen Origin

### Requirement: Honeypot
Jedes Formular SHALL ein für Menschen unsichtbares, für Screenreader ausgeblendetes Köderfeld enthalten.

#### Scenario: Köderfeld ausgefüllt
- **WHEN** das Köderfeld einen Wert enthält
- **THEN** antwortet der Endpoint scheinbar erfolgreich (HTTP 200), versendet aber nichts

### Requirement: Signierter Zeitstempel
Jedes Formular SHALL einen serverseitig signierten Zeitstempel tragen. Übermittlungen schneller als 3 Sekunden oder älter als 2 Stunden nach Seitenaufruf MUST abgelehnt werden.

#### Scenario: Zu schnell
- **WHEN** eine Übermittlung 1 Sekunde nach dem Laden des Formulars eingeht
- **THEN** wird sie verworfen, ohne dass eine E-Mail versendet wird

### Requirement: Rate-Limit
Der Endpoint SHALL höchstens 5 Übermittlungen pro IP-Adresse und Stunde sowie 20 pro Tag annehmen, außerdem höchstens 3 pro Absender-E-Mail-Adresse und Stunde. IP-Adressen MUST nur gesalzen gehasht gespeichert werden, höchstens 24 Stunden lang.

#### Scenario: Limit überschritten
- **WHEN** von derselben IP innerhalb einer Stunde die 6. Übermittlung eingeht
- **THEN** antwortet der Endpoint mit HTTP 429 und einem `Retry-After`-Header

### Requirement: Inhaltsfilter
Der Endpoint SHALL Übermittlungen verwerfen, die typische Spam-Merkmale aufweisen: mehr als 2 URLs in der Nachricht, BBCode/HTML-Links, Treffer aus einer gepflegten Sperrwortliste, Nachrichten überwiegend in nicht-lateinischer Schrift oder identische Nachrichten innerhalb von 24 Stunden.

#### Scenario: Link-Spam
- **WHEN** eine Nachricht 5 URLs enthält
- **THEN** wird sie nicht zugestellt und der Nutzer erhält einen neutralen Hinweis, Links zu entfernen

### Requirement: Prüfung der Absenderadresse
Die vom Nutzer angegebene E-Mail-Adresse SHALL syntaktisch nach RFC 5322 gültig sein. Ihre Domain MUST einen MX- oder A-Eintrag besitzen. Wegwerf-E-Mail-Domains aus einer gepflegten Liste MUST abgelehnt werden.

#### Scenario: Domain ohne Mailserver
- **WHEN** ein Nutzer `max@gibts-nicht-xyz123.de` angibt
- **THEN** erhält er die Meldung, dass die E-Mail-Adresse nicht erreichbar scheint

### Requirement: Herkunftsprüfung
Der Endpoint SHALL nur Übermittlungen annehmen, deren `Origin`- bzw. `Referer`-Header auf den eigenen Origin zeigt und die ein gültiges, signiertes Formular-Token enthalten (CSRF-Schutz).

#### Scenario: Fremde Website postet
- **WHEN** eine fremde Website ein Formular an `/api/submit.php` sendet
- **THEN** antwortet der Endpoint mit HTTP 403

### Requirement: Spam-Monitoring
Der Endpoint SHALL je Tag zählen, wie viele Übermittlungen angenommen bzw. von welcher Schicht abgewiesen wurden. Die Zähler MUST ohne personenbezogene Daten auskommen und für die Agentur abrufbar sein.

#### Scenario: Auswertung
- **WHEN** die Agentur die Statistik eines Tages abruft
- **THEN** sieht sie Zähler pro Schutzschicht, aber keine IP-Adressen, Namen oder Inhalte
