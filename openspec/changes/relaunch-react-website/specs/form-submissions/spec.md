## Purpose

Nimmt Kontaktanfragen und Bewerbungen inklusive Dateianhängen sicher entgegen, prüft sie und stellt sie per E-Mail an GÖK zu, ohne Drittanbieter-Dienste.

## ADDED Requirements

### Requirement: Kontaktanfrage
Das Kontaktformular SHALL die Felder Name (Pflicht), E-Mail (Pflicht), Telefon (optional), Nachricht (Pflicht) und eine Bestätigung der Datenschutzhinweise (Pflicht) enthalten.

#### Scenario: Gültige Anfrage
- **WHEN** ein Nutzer alle Pflichtfelder gültig ausfüllt und absendet
- **THEN** antwortet der Endpoint mit Erfolg, an die konfigurierte Empfängeradresse geht eine E-Mail mit allen Feldern und der Nutzer sieht eine Erfolgsmeldung auf derselben Seite

#### Scenario: Ungültige E-Mail
- **WHEN** ein Nutzer „max@“ als E-Mail eingibt und absendet
- **THEN** wird nichts versendet und am Feld erscheint eine verständliche deutsche Fehlermeldung, die per `aria-describedby` mit dem Feld verknüpft ist

### Requirement: Bewerbung
Das Bewerbungsformular SHALL die Felder Name, E-Mail, Telefon (optional), Position, Nachricht (optional), Dateianhänge und Datenschutzbestätigung enthalten. Pflicht sind Name, E-Mail, Position, mindestens ein Anhang und die Datenschutzbestätigung.

#### Scenario: Bewerbung mit Anhängen
- **WHEN** ein Nutzer eine gültige Bewerbung mit zwei PDF-Dateien sendet
- **THEN** erhält die Empfängeradresse eine E-Mail mit beiden Dateien als Anhang und der Position im Betreff

### Requirement: Anhänge nur nach Sicherheitsprüfung
Dateianhänge SHALL nur zugestellt werden, wenn sie alle Prüfungen aus `upload-security` bestanden haben. Das Formular MUST erlaubte Formate (PDF, DOCX, JPG, PNG) und Grenzen (5 Dateien, 10 MB) vor dem Hochladen anzeigen und im Browser vorprüfen.

#### Scenario: Vorabhinweis im Browser
- **WHEN** ein Nutzer eine 12-MB-Datei auswählt
- **THEN** zeigt das Formular sofort, noch vor dem Absenden, einen Hinweis auf die 10-MB-Grenze

#### Scenario: Abgelehnter Anhang
- **WHEN** ein Anhang eine Prüfung aus `upload-security` nicht besteht
- **THEN** wird die gesamte Bewerbung nicht zugestellt, und der Nutzer erfährt, welche Datei aus welchem Grund abgelehnt wurde

### Requirement: Serverseitige Validierung
Der Endpoint SHALL alle Eingaben serverseitig unabhängig von der Browser-Validierung prüfen. Bei Fehlern MUST er mit HTTP 422 und feldbezogenen Fehlern antworten und keine E-Mail versenden.

#### Scenario: Umgehung der Browser-Prüfung
- **WHEN** ein Request ohne Pflichtfeld „E-Mail“ direkt an den Endpoint geschickt wird
- **THEN** antwortet der Endpoint mit 422 und versendet nichts

### Requirement: Spam-Abwehr vor Zustellung
Jede Übermittlung SHALL alle Schichten aus `spam-protection` durchlaufen, bevor sie verarbeitet oder zugestellt wird.

#### Scenario: Reihenfolge der Prüfungen
- **WHEN** eine Bewerbung mit Anhängen eingeht, die die Spam-Prüfung nicht besteht
- **THEN** werden die Anhänge nicht inhaltlich verarbeitet und nichts wird versendet

### Requirement: Zustellung und Antwortadresse
E-Mails SHALL gemäß `email-security` zugestellt werden. Die E-Mail-Adresse des Nutzers MUST als `Reply-To` gesetzt sein, und Zugangsdaten MUST außerhalb des Repositorys konfiguriert sein. Betreff und Text MUST deutsch sein und Formulartyp sowie, bei Bewerbungen, die Position nennen.

#### Scenario: Antworten auf Anfrage
- **WHEN** GÖK in seinem Mailprogramm auf eine Kontaktanfrage antwortet
- **THEN** geht die Antwort an die vom Nutzer angegebene E-Mail-Adresse

#### Scenario: Versand schlägt fehl
- **WHEN** der SMTP-Server nicht erreichbar ist
- **THEN** antwortet der Endpoint mit HTTP 502 und der Nutzer sieht eine Fehlermeldung mit WhatsApp und E-Mail als Alternative

### Requirement: Datensparsamkeit
Der Endpoint SHALL Formulardaten und Anhänge nicht dauerhaft auf dem Server speichern. Temporäre Dateien MUST nach dem Versandversuch gelöscht werden, und Logs MUST keine Formularinhalte enthalten.

#### Scenario: Nach dem Versand
- **WHEN** eine Bewerbung verarbeitet wurde, erfolgreich oder nicht
- **THEN** befinden sich keine Anhänge des Requests mehr im Dateisystem des Servers

### Requirement: Bedienbarkeit ohne Seitenwechsel
Formulare SHALL ohne Seitenneuladen absenden, während des Sendens einen Ladezustand zeigen und Doppel-Absendungen verhindern. Weil der Spam-Schutz (`spam-protection`, ALTCHA) JavaScript erfordert, MUST ohne JavaScript statt des Formulars ein Hinweis mit den alternativen Kontaktwegen (WhatsApp, E-Mail) erscheinen (Entscheidung Auftraggeber 17.10.2026: Sicherheit vor No-JS; ohne Telefon: Entscheidung Auftraggeber 25.10.2026: keine Telefonnummer auf der Website, um Spam-Anrufe zu vermeiden).

#### Scenario: Doppelklick
- **WHEN** ein Nutzer den Absenden-Button zweimal schnell klickt
- **THEN** wird genau eine Übermittlung ausgelöst

#### Scenario: JavaScript deaktiviert
- **WHEN** ein Nutzer die Kontaktseite ohne JavaScript öffnet
- **THEN** sieht er statt des Formulars einen Hinweis mit WhatsApp-Link und E-Mail-Adresse, und es gibt keinen Weg, das Formular ohne Spam-Prüfung abzusenden
