## Purpose

Härtet Website, Server-Endpoint und Lieferkette gegen Angriffe. Maßstab ist OWASP ASVS Level 2. Jede Härtung ist automatisiert überprüfbar.

## ADDED Requirements

### Requirement: Sicherheits-Header
Alle Antworten SHALL HTTPS erzwingen und mindestens diese Header senden: `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (Kamera, Mikrofon, Geolocation, Payment u. a. deaktiviert) und `Cross-Origin-Opener-Policy: same-origin`.

#### Scenario: Header-Prüfung
- **WHEN** eine beliebige Seite der Produktion abgerufen wird
- **THEN** enthält die Antwort alle genannten Header

### Requirement: Strikte Content Security Policy
Jede Seite SHALL eine CSP ohne `unsafe-eval` haben. Skripte MUST nur vom eigenen Origin oder über SHA-256-Hashes erlaubt sein. Zusätzlich gelten `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` und `frame-ancestors 'none'`. Fremd-Origins sind nur für die Google-Maps-Einbettung (`frame-src`) zulässig.

#### Scenario: Eingeschleustes Skript
- **WHEN** ein Inline-Skript ohne passenden Hash in eine Seite gelangt
- **THEN** führt der Browser es nicht aus und meldet eine CSP-Verletzung

#### Scenario: Einbettung in fremde Seite
- **WHEN** eine fremde Website versucht, goekbau.de in einem iframe einzubetten
- **THEN** verweigert der Browser die Darstellung

### Requirement: Server-Härtung
Der Webserver SHALL keine Verzeichnislisten zeigen. Er MUST den Zugriff auf Konfigurations-, Abhängigkeits- und versteckte Dateien sperren (`vendor/`, `config/`, `.*`, `composer.*`, `*.md`, `*.log`) und PHP nur für den Formular-Endpoint ausführen. Fehlermeldungen MUST NOT Stacktraces, Pfade oder Versionsnummern enthalten.

#### Scenario: Zugriff auf Abhängigkeiten
- **WHEN** jemand `/vendor/composer/installed.json` oder `/.env` aufruft
- **THEN** antwortet der Server mit 403 oder 404 ohne Inhalt

#### Scenario: Provozierter Fehler
- **WHEN** der Endpoint mit einem fehlerhaften Request zum Absturz gebracht werden soll
- **THEN** enthält die Antwort nur eine generische Fehlermeldung und keine internen Details

#### Scenario: Server-Signatur
- **WHEN** die Response-Header einer beliebigen Seite gelesen werden
- **THEN** enthalten sie keinen `X-Powered-By`-Header mit PHP-Version

### Requirement: Strikte Endpoint-Schnittstelle
Der Formular-Endpoint SHALL nur `POST` mit `multipart/form-data` oder `application/x-www-form-urlencoded` annehmen, die Request-Größe auf 11 MB begrenzen und unbekannte Felder ignorieren. Andere Methoden MUST mit HTTP 405 beantwortet werden.

#### Scenario: GET auf den Endpoint
- **WHEN** jemand `GET /api/submit.php` aufruft
- **THEN** antwortet der Server mit 405

### Requirement: Abhängigkeits- und Code-Scanning
Die Pipeline SHALL bei jedem Pull Request Abhängigkeiten (npm, Composer) auf bekannte Schwachstellen prüfen, statische Sicherheitsanalyse (SAST) für TypeScript und PHP ausführen und nach Secrets scannen. Funde der Schwere „high“ oder „critical“ MUST das Mergen blockieren. Abhängigkeits-Updates MUST automatisiert als Pull Requests vorgeschlagen werden.

#### Scenario: Verwundbare Abhängigkeit
- **WHEN** eine Abhängigkeit mit bekannter kritischer Schwachstelle eingeführt wird
- **THEN** schlägt der Sicherheits-Check fehl und der PR kann nicht gemergt werden

### Requirement: Dynamischer Sicherheitstest
Vor jedem Produktions-Deployment SHALL ein automatisierter DAST-Baseline-Scan gegen den Prod-Nachbau laufen. Vor dem Go-live MUST zusätzlich ein vollständiger aktiver Scan des Formular-Endpoints ohne Funde der Schwere „high“ abgeschlossen sein.

#### Scenario: Go-live-Freigabe
- **WHEN** der Go-live freigegeben werden soll
- **THEN** liegt ein Scan-Bericht ohne offene Funde der Schwere „high“ oder „critical“ vor

### Requirement: Datenschutzfreundliches Logging
Server-Logs des Endpoints SHALL nur Zeitstempel, Ergebnis-Code und auslösende Schutzschicht enthalten. IP-Adressen MUST gekürzt oder gehasht werden, Formularinhalte, E-Mail-Adressen und Dateinamen MUST NOT protokolliert werden. Logs MUST nach höchstens 14 Tagen gelöscht werden.

#### Scenario: Log nach Bewerbung
- **WHEN** eine Bewerbung verarbeitet wurde
- **THEN** enthält das Log weder Namen noch E-Mail-Adresse noch Dateinamen des Bewerbers

### Requirement: Meldestelle für Sicherheitslücken
Die Website SHALL unter `/.well-known/security.txt` eine gültige security.txt (RFC 9116) mit Kontakt und Ablaufdatum bereitstellen.

#### Scenario: Sicherheitsforscher sucht Kontakt
- **WHEN** jemand `/.well-known/security.txt` aufruft
- **THEN** erhält er eine gültige Datei mit Kontaktweg und `Expires`-Datum in der Zukunft
