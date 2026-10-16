## Purpose

Stellt Stellen- und Ausbildungsangebote der GÖK Bauüberwachung Bahn GmbH auffindbar dar und führt Interessierte zur Bewerbung.

## ADDED Requirements

### Requirement: Karriere-Übersicht
Die Seite `/karriere/` SHALL eine Einleitung, „Was wir bieten“, Anforderungen sowie zwei getrennte Listen enthalten: „Stellenangebote“ und „Aus- und Weiterbildung“. Jeder Listeneintrag MUST Titel, Kurzbeschreibung und einen Link zur Detailseite zeigen.

#### Scenario: Getrennte Listen
- **WHEN** das Inhaltsmodell 2 Einträge vom Typ `job` und 3 vom Typ `training` enthält
- **THEN** zeigt `/karriere/` 2 Einträge unter „Stellenangebote“ und 3 unter „Aus- und Weiterbildung“

#### Scenario: Keine offenen Stellen
- **WHEN** kein veröffentlichter Eintrag vom Typ `job` existiert
- **THEN** zeigt die Liste den Hinweis auf eine Initiativbewerbung statt einer leeren Liste

### Requirement: Detailseiten mit sprechenden URLs
Jedes veröffentlichte Angebot SHALL eine eigene Seite unter `/karriere/stellen/<slug>/` (Typ `job`) bzw. `/karriere/ausbildung/<slug>/` (Typ `training`) haben. Der Slug MUST aus dem Inhaltsmodell stammen und eindeutig sein.

#### Scenario: Detailseite aufrufen
- **WHEN** ein Nutzer `/karriere/stellen/fachbauueberwacher-oberbau/` öffnet
- **THEN** sieht er Titel, Beschreibung, Aufgaben, Anforderungen und das Bewerbungsformular für dieses Angebot

#### Scenario: Doppelter Slug
- **WHEN** zwei Angebote denselben Slug haben
- **THEN** bricht der Build mit einer Fehlermeldung ab, die beide Dateien nennt

### Requirement: Veröffentlichungsstatus
Ein Angebot SHALL nur veröffentlicht werden, wenn sein Status `published` ist. Ein Angebot mit überschrittenem Ablaufdatum (`validThrough`) MUST nicht mehr gelistet werden. Seine URL MUST per 301 auf `/karriere/` umleiten.

#### Scenario: Abgelaufenes Angebot
- **WHEN** das Ablaufdatum eines Stellenangebots beim Build in der Vergangenheit liegt
- **THEN** erscheint es nicht in der Liste und seine Detail-URL leitet auf `/karriere/` um

### Requirement: Bewerbung aus dem Angebot
Jede Detailseite SHALL das Bewerbungsformular gemäß `form-submissions` enthalten. Die Position MUST mit dem Titel des Angebots vorbelegt sein. Die Übersichtsseite SHALL ein Formular für Initiativbewerbungen enthalten.

#### Scenario: Vorbelegte Position
- **WHEN** ein Nutzer das Formular auf der Detailseite „Fachbauüberwacher Oberbau“ öffnet
- **THEN** ist das Feld „Position“ mit „Fachbauüberwacher Oberbau“ vorbelegt und änderbar

### Requirement: Strukturierte Stellendaten
Jede Detailseite vom Typ `job` SHALL strukturierte Daten vom Typ `JobPosting` (schema.org, JSON-LD) mit mindestens `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation` und `employmentType` ausgeben. Ausbildungsangebote MUST kein `JobPosting` ausgeben.

#### Scenario: Validierung
- **WHEN** eine Stellen-Detailseite gegen das schema.org-JobPosting-Schema geprüft wird
- **THEN** meldet die Prüfung keine Fehler bei Pflichtfeldern
