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

### Requirement: Dateianhänge begrenzen
Der Endpoint SHALL nur Dateien der Typen PDF, DOC, DOCX, JPG und PNG annehmen, höchstens 5 Dateien und insgesamt höchstens 10 MB. Der Typ MUST serverseitig anhand des Dateiinhalts geprüft werden, nicht nur anhand der Endung.

#### Scenario: Unerlaubter Dateityp
- **WHEN** ein Nutzer eine `.exe`-Datei oder eine in `.pdf` umbenannte ausführbare Datei hochlädt
- **THEN** wird die Bewerbung abgelehnt und der Nutzer erhält eine Meldung zu erlaubten Dateitypen

#### Scenario: Zu groß
- **WHEN** die Anhänge zusammen größer als 10 MB sind
- **THEN** wird die Bewerbung abgelehnt und die Meldung nennt die Grenze von 10 MB

### Requirement: Serverseitige Validierung
Der Endpoint SHALL alle Eingaben serverseitig unabhängig von der Browser-Validierung prüfen. Bei Fehlern MUST er mit HTTP 422 und feldbezogenen Fehlern antworten und keine E-Mail versenden.

#### Scenario: Umgehung der Browser-Prüfung
- **WHEN** ein Request ohne Pflichtfeld „E-Mail“ direkt an den Endpoint geschickt wird
- **THEN** antwortet der Endpoint mit 422 und versendet nichts

### Requirement: Spam-Schutz ohne Drittanbieter
Der Endpoint SHALL Spam ohne externe Dienste abwehren: mit einem Honeypot-Feld, einer Mindest-Ausfüllzeit und einer Begrenzung auf 5 Übermittlungen pro IP-Adresse und Stunde.

#### Scenario: Honeypot ausgefüllt
- **WHEN** das versteckte Honeypot-Feld einen Wert enthält
- **THEN** antwortet der Endpoint scheinbar erfolgreich, versendet aber keine E-Mail

#### Scenario: Rate-Limit
- **WHEN** von derselben IP innerhalb einer Stunde eine 6. Übermittlung eingeht
- **THEN** antwortet der Endpoint mit HTTP 429 und versendet nichts

### Requirement: Zustellung und Antwortadresse
E-Mails SHALL über einen authentifizierten SMTP-Versand von einer Absenderadresse der Domain `goekbau.de` verschickt werden. Die E-Mail-Adresse des Nutzers MUST als `Reply-To` gesetzt sein. Zugangsdaten MUST außerhalb des Repositorys konfiguriert sein.

#### Scenario: Antworten auf Anfrage
- **WHEN** GÖK in seinem Mailprogramm auf eine Kontaktanfrage antwortet
- **THEN** geht die Antwort an die vom Nutzer angegebene E-Mail-Adresse

#### Scenario: Versand schlägt fehl
- **WHEN** der SMTP-Server nicht erreichbar ist
- **THEN** antwortet der Endpoint mit HTTP 502 und der Nutzer sieht eine Fehlermeldung mit Telefonnummer und E-Mail als Alternative

### Requirement: Datensparsamkeit
Der Endpoint SHALL Formulardaten und Anhänge nicht dauerhaft auf dem Server speichern. Temporäre Dateien MUST nach dem Versandversuch gelöscht werden, und Logs MUST keine Formularinhalte enthalten.

#### Scenario: Nach dem Versand
- **WHEN** eine Bewerbung verarbeitet wurde, erfolgreich oder nicht
- **THEN** befinden sich keine Anhänge des Requests mehr im Dateisystem des Servers

### Requirement: Bedienbarkeit ohne Seitenwechsel
Formulare SHALL ohne Seitenneuladen absenden, während des Sendens einen Ladezustand zeigen und Doppel-Absendungen verhindern. Ohne JavaScript MUST das Formular per normalem POST funktionieren und auf eine Ergebnisseite führen.

#### Scenario: Doppelklick
- **WHEN** ein Nutzer den Absenden-Button zweimal schnell klickt
- **THEN** wird genau eine Übermittlung ausgelöst
