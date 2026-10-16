## Purpose

Stellt sicher, dass die Website datenschutzkonform arbeitet: Ohne Einwilligung werden keine Drittanbieter-Ressourcen geladen, und Einwilligungen lassen sich jederzeit nachvollziehen und widerrufen.

## ADDED Requirements

### Requirement: Keine Drittanbieter-Requests ohne Einwilligung
Beim Laden einer beliebigen Seite ohne erteilte Einwilligung SHALL der Browser ausschließlich Requests an den eigenen Origin senden.

#### Scenario: Erstbesuch
- **WHEN** ein Nutzer ohne gespeicherte Einwilligung eine beliebige Seite lädt und 5 Sekunden wartet
- **THEN** richten sich alle aufgezeichneten Netzwerk-Requests an `www.goekbau.de`

### Requirement: Keine nicht-notwendigen Cookies
Die Website SHALL ohne Einwilligung keine Cookies und keine Einträge in Local oder Session Storage setzen, außer dem technisch notwendigen Speichern der Einwilligungsentscheidung selbst.

#### Scenario: Speicher nach Erstbesuch
- **WHEN** ein Nutzer die Startseite lädt und keine Einwilligungsentscheidung trifft
- **THEN** existieren für den Origin keine Cookies und keine Storage-Einträge

### Requirement: Karte nur nach Zustimmung
Die Google-Maps-Karte auf `/kontakt/` SHALL zunächst als statischer Platzhalter erscheinen. Dieser zeigt Hinweistext, einen Button „Karte laden“ und einen externen Link „In Google Maps öffnen“. Die Karte MUST erst nach Aktivierung des Buttons geladen werden.

#### Scenario: Karte laden
- **WHEN** ein Nutzer auf „Karte laden“ klickt
- **THEN** wird die Google-Maps-Einbettung geladen und angezeigt

#### Scenario: Ohne Klick
- **WHEN** ein Nutzer die Kontaktseite lädt, ohne „Karte laden“ zu klicken
- **THEN** gibt es keinen Request an eine Google-Domain

### Requirement: Einwilligung merken und widerrufen
Eine Einwilligung für externe Medien SHALL auf Wunsch des Nutzers gespeichert werden („Immer laden“). Sie MUST über den Footer-Link „Cookie-Einstellungen“ jederzeit einsehbar und widerrufbar sein.

#### Scenario: Widerruf
- **WHEN** ein Nutzer über „Cookie-Einstellungen“ die Einwilligung für externe Medien widerruft
- **THEN** werden bei den folgenden Seitenaufrufen keine externen Medien mehr automatisch geladen

### Requirement: Kein Einwilligungsbanner ohne Bedarf
Solange die Website keine einwilligungspflichtigen Dienste automatisch lädt, SHALL kein seitenfüllendes Cookie-Banner erscheinen. Einwilligungen MUST kontextbezogen am jeweiligen Element (z. B. Karte) eingeholt werden.

#### Scenario: Erstbesuch Startseite
- **WHEN** ein Nutzer die Startseite zum ersten Mal öffnet
- **THEN** überlagert kein Cookie-Banner den Inhalt
