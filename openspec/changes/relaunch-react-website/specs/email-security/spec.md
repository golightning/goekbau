## Purpose

Schützt die E-Mail-Kommunikation von GÖK. E-Mail-Adressen sollen nicht automatisiert abgegriffen werden können, Formular-Mails sollen zuverlässig, unverfälscht und verschlüsselt zugestellt werden, und die Domain `goekbau.de` darf nicht für gefälschte Absender missbraucht werden können.

## ADDED Requirements

### Requirement: Schutz vor Adress-Harvesting
E-Mail-Adressen SHALL im ausgelieferten HTML nicht im Klartext stehen, auch nicht in `mailto:`-Links, JSON-LD oder Meta-Daten. Mit JavaScript MUST ein funktionsfähiger, für Screenreader korrekt benannter `mailto:`-Link entstehen. Ohne JavaScript MUST die Adresse für Menschen lesbar sein (z. B. „info [at] goekbau.de“).

#### Scenario: Quelltext-Crawler
- **WHEN** ein Crawler das HTML aller Seiten nach dem Muster `…@goekbau.de` durchsucht
- **THEN** findet er keine Treffer

#### Scenario: Nutzer klickt E-Mail
- **WHEN** ein Nutzer mit aktiviertem JavaScript auf die E-Mail-Adresse klickt
- **THEN** öffnet sich sein Mailprogramm mit der korrekten Adresse

### Requirement: Kontaktformular als bevorzugter Weg
Kontaktbereiche SHALL das Kontaktformular als primären Kontaktweg anbieten und E-Mail-Adressen nur sekundär zeigen.

#### Scenario: Kontaktseite
- **WHEN** ein Nutzer die Kontaktseite öffnet
- **THEN** steht das Formular vor bzw. über den E-Mail-Adressen

### Requirement: Fester, authentifizierter Absender
Formular-Mails SHALL immer von einem festen Postfach der Domain `goekbau.de` über SMTP mit Authentifizierung und TLS (STARTTLS oder SMTPS, mindestens TLS 1.2, Zertifikatsprüfung aktiv) gesendet werden. Nutzereingaben MUST NOT als `From`- oder `Sender`-Adresse verwendet werden.

#### Scenario: Unverschlüsselte Verbindung
- **WHEN** der SMTP-Server kein TLS anbietet oder sein Zertifikat ungültig ist
- **THEN** wird nicht gesendet, und der Endpoint antwortet mit HTTP 502

### Requirement: Schutz vor Header-Injection
Alle Nutzereingaben, die in E-Mail-Header einfließen (Reply-To, Name, Position im Betreff), SHALL von CR/LF und Steuerzeichen bereinigt und in der Länge begrenzt werden. Die Reply-To-Adresse MUST eine einzelne, validierte Adresse sein.

#### Scenario: Injection-Versuch
- **WHEN** im Namensfeld `Max\r\nBcc: opfer@example.com` eingegeben wird
- **THEN** enthält die versendete E-Mail keinen zusätzlichen `Bcc`-Header

### Requirement: Sichere Mail-Inhalte
Der E-Mail-Text SHALL als reiner Text (`text/plain; charset=UTF-8`) versendet werden. Er MUST alle Nutzereingaben unverändert als Text enthalten, ohne HTML-Interpretation und ohne aktive Links, die aus Nutzereingaben entstehen.

#### Scenario: HTML in der Nachricht
- **WHEN** ein Nutzer `<a href="https://phish.example">Rechnung</a>` als Nachricht sendet
- **THEN** zeigt die E-Mail diesen Text wörtlich als Text an

### Requirement: Domain-Authentifizierung
Die Domain `goekbau.de` SHALL einen SPF-Eintrag, eine DKIM-Signatur für ausgehende Mails und eine DMARC-Policy veröffentlichen. Die Policy beginnt mit `p=quarantine` und Reporting und wird nach 30 Tagen ohne Fehlzustellungen auf `p=reject` verschärft.

#### Scenario: DNS-Prüfung
- **WHEN** die DNS-Einträge von `goekbau.de` abgefragt werden
- **THEN** existieren gültige SPF-, DKIM- und DMARC-Einträge, und eine Formular-Testmail besteht SPF, DKIM und DMARC (`dmarc=pass` im Header)

### Requirement: Zustellungsüberwachung
Fehlgeschlagene Zustellungen SHALL nicht unbemerkt bleiben. Nach 3 Fehlschlägen innerhalb von 24 Stunden MUST eine Warnung an eine separat konfigurierte Agentur-Adresse gehen. Diese Warnung enthält keine Formularinhalte.

#### Scenario: Zugangsdaten abgelaufen
- **WHEN** die SMTP-Anmeldung dreimal an einem Tag fehlschlägt
- **THEN** erhält die Agentur über einen unabhängigen Versandweg eine Warnung mit Fehlerart und Zeitpunkt
