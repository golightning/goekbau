## Purpose

Erhält Suchmaschinen-Rankings und externe Links nach der WordPress-Ablösung, indem jede bisherige URL weiter erreichbar ist oder dauerhaft umgeleitet wird.

## ADDED Requirements

### Requirement: Bestehende Seiten-URLs bleiben erreichbar
Die Pfade `/`, `/uber-uns/`, `/leistungen/`, `/karriere/`, `/kontakt/`, `/impressum/` und `/datenschutz/` SHALL nach dem Relaunch unverändert mit HTTP 200 antworten.

#### Scenario: Alte Über-uns-URL
- **WHEN** jemand `https://www.goekbau.de/uber-uns/` aufruft
- **THEN** antwortet der Server mit 200 und zeigt die Über-uns-Seite

### Requirement: Umleitung der Stellenanzeigen
Die alten Stellen-URLs SHALL per HTTP 301 auf ihre neuen Ziele umleiten: `/stellenanzeige-2/` → Stelle „Bauüberwacher Bahn Ob/KIB“, `/stellenanzeige-3/` → Stelle „Fachbauüberwacher Oberbau“, `/stellenanzeige-4/` → Ausbildung „Funktionsausbildung Fachbauüberwacher Oberbau“, `/stellenanzeige-5/` → Ausbildung „Funktionsausbildung Bauüberwacher Bahn Ob/KIB“, `/stellenanzeige-6/` → Ausbildung „Komplettausbildung“.

#### Scenario: Alte Stellen-URL
- **WHEN** jemand `/stellenanzeige-3/` aufruft
- **THEN** antwortet der Server mit 301 und `Location` zeigt auf die Detailseite der Stelle „Fachbauüberwacher Oberbau“ unter `/karriere/stellen/…/`

#### Scenario: Ziel nicht mehr veröffentlicht
- **WHEN** das Ziel einer Umleitung nicht mehr veröffentlicht ist
- **THEN** leitet die alte URL per 301 auf `/karriere/` weiter

### Requirement: Kanonischer Host und Protokoll
Aufrufe über `http://` oder ohne `www` SHALL in genau einem Schritt per 301 auf `https://www.goekbau.de` mit identischem Pfad umgeleitet werden.

#### Scenario: Apex-Domain
- **WHEN** jemand `http://goekbau.de/kontakt/` aufruft
- **THEN** folgt genau eine 301-Umleitung auf `https://www.goekbau.de/kontakt/`

### Requirement: Alte Sitemaps und WordPress-Pfade
Die Pfade `/sitemap_index.xml`, `/page-sitemap.xml` und `/wp-sitemap.xml` SHALL per 301 auf `/sitemap.xml` umleiten. Die Pfade `/feed/` und `/comments/feed/` SHALL auf `/` umleiten. Die Präfixe `/wp-admin/`, `/wp-login.php`, `/wp-json/`, `/xmlrpc.php` und `/wp-content/` SHALL mit HTTP 410 antworten.

#### Scenario: Altes Sitemap-Indexfile
- **WHEN** eine Suchmaschine `/sitemap_index.xml` abruft
- **THEN** wird sie per 301 auf `/sitemap.xml` umgeleitet

#### Scenario: WordPress-Login-Scanner
- **WHEN** ein Bot `/wp-login.php` aufruft
- **THEN** antwortet der Server mit 410 ohne PHP-Ausführung einer WordPress-Installation

### Requirement: Redirect-Liste ist geprüft
Alle Umleitungen SHALL in einer versionierten Liste gepflegt sein. Ein automatischer Test MUST jede Quelle gegen Statuscode und Ziel prüfen.

#### Scenario: Redirect-Test schlägt fehl
- **WHEN** ein Redirect-Ziel auf eine nicht existierende Seite zeigt
- **THEN** schlägt die Pipeline vor dem Deployment fehl
