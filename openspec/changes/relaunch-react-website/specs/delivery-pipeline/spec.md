## Purpose

Regelt, wie Code- und Inhaltsänderungen geprüft, gebaut und über IONOS Deploy Now in Staging und Produktion ausgeliefert werden.

## ADDED Requirements

### Requirement: Automatisches Deployment aus Git
Jeder Push auf `main` im Repository `golightning/goekbau` SHALL nach erfolgreichen Prüfungen automatisch in die Produktion deployt werden. Pushes auf andere Branches SHALL in eine Staging-Umgebung deployt werden.

#### Scenario: Merge in main
- **WHEN** ein Pull Request in `main` gemergt wird und alle Prüfungen bestehen
- **THEN** ist die Änderung ohne manuellen Schritt auf `https://www.goekbau.de` live

#### Scenario: Feature-Branch
- **WHEN** ein Branch `feature/neue-stelle` gepusht wird
- **THEN** ist er unter einer eigenen Staging-URL erreichbar, die nicht indexiert wird

### Requirement: Qualitäts-Gates vor dem Deployment
Vor jedem Deployment SHALL die Pipeline ausführen: Typprüfung, Linting, Inhalts-Validierung, Unit-Tests, Build, Redirect-Tests, Barrierefreiheits-Prüfung, Performance-Budget sowie die Sicherheitsprüfungen aus `web-security`. Schlägt eine Prüfung fehl, MUST das Deployment unterbleiben.

#### Scenario: Fehlgeschlagene Prüfung
- **WHEN** die Barrierefreiheits-Prüfung einen kritischen Verstoß meldet
- **THEN** wird nicht deployt und die bisherige Version bleibt live

### Requirement: Geheimnisse außerhalb des Codes
SMTP-Zugangsdaten und Empfängeradressen SHALL ausschließlich als Secrets der Hosting- bzw. CI-Umgebung konfiguriert werden und MUST nie im Repository oder im ausgelieferten Frontend-Bundle stehen.

#### Scenario: Secret-Scan
- **WHEN** ein Commit ein Passwort-ähnliches Literal oder eine Datei `.env` enthält
- **THEN** schlägt die Secret-Prüfung fehl

### Requirement: Rücksetzbarkeit
Ein fehlerhaftes Produktions-Deployment SHALL innerhalb von 15 Minuten auf die vorherige Version zurückgesetzt werden können, durch Revert-Commit oder erneutes Deployment eines früheren Commits.

#### Scenario: Rollback
- **WHEN** nach einem Deployment ein schwerer Fehler entdeckt wird
- **THEN** ist durch Revert des Merge-Commits innerhalb von 15 Minuten wieder die Vorversion live
