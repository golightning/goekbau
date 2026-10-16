## Purpose

Regelt die seitenübergreifende Orientierung: Header mit Hauptnavigation, mobile Navigation, Footer, direkte Kontaktwege und die Fehlerseite.

## ADDED Requirements

### Requirement: Hauptnavigation
Jede Seite SHALL einen Header mit Logo (Link zur Startseite) und der Hauptnavigation „Home, Über uns, Leistungen, Karriere, Kontakt“ enthalten. Der Menüpunkt der aktuellen Seite (bzw. ihres Bereichs) MUST visuell und per `aria-current="page"` markiert sein.

#### Scenario: Aktiver Bereich in Unterseite
- **WHEN** ein Nutzer eine Stellen-Detailseite unter `/karriere/…` öffnet
- **THEN** ist der Menüpunkt „Karriere“ als aktiv markiert

### Requirement: Mobile Navigation
Unterhalb von 1024 px Viewport-Breite SHALL die Hauptnavigation hinter einem Menü-Button liegen. Dieser MUST per Tastatur bedienbar sein, seinen Zustand über `aria-expanded` melden und sich mit `Escape` schließen lassen.

#### Scenario: Menü öffnen und schließen
- **WHEN** ein Nutzer auf einem Smartphone den Menü-Button antippt
- **THEN** öffnet sich die Navigation und `aria-expanded` wechselt auf `true`
- **WHEN** der Nutzer `Escape` drückt oder einen Menüpunkt wählt
- **THEN** schließt sich die Navigation und der Fokus kehrt zum Menü-Button zurück

### Requirement: Footer
Jede Seite SHALL einen Footer mit Kurzclaim, Navigation, Kontaktdaten (Telefon, E-Mail, Adresse), Links zu Impressum und Datenschutz, einem Link „Cookie-Einstellungen“ und dem Agentur-Hinweis enthalten. Social-Media-Links MUST nur erscheinen, wenn ein echtes Ziel-Profil konfiguriert ist.

#### Scenario: Kein Social-Profil hinterlegt
- **WHEN** für ein Netzwerk keine Profil-URL in den Inhalten konfiguriert ist
- **THEN** wird für dieses Netzwerk kein Icon gerendert

#### Scenario: Rechtliche Links
- **WHEN** ein Nutzer auf einer beliebigen Seite den Footer betrachtet
- **THEN** sind Impressum und Datenschutz mit höchstens einem Klick erreichbar

### Requirement: Direkte Kontaktwege
Die Website SHALL Telefonnummer und E-Mail als `tel:`- bzw. `mailto:`-Links anbieten und einen schwebenden WhatsApp-Button, der auf `https://wa.me/49…` mit vollständiger internationaler Nummer verlinkt. Der WhatsApp-Button MUST keine Drittanbieter-Ressourcen laden, bevor er geklickt wird.

#### Scenario: WhatsApp-Link
- **WHEN** ein Nutzer den WhatsApp-Button aktiviert
- **THEN** öffnet sich `https://wa.me/491621991444` in einem neuen Tab

#### Scenario: Keine Vorab-Requests
- **WHEN** eine Seite geladen wird und der WhatsApp-Button nicht geklickt wurde
- **THEN** gibt es keinen Netzwerk-Request zu einer WhatsApp- oder Meta-Domain

### Requirement: Fehlerseite
Unbekannte URLs SHALL mit HTTP-Status 404 und einer gestalteten Fehlerseite beantwortet werden, die Navigation, Footer und Links zu Startseite und Kontakt enthält.

#### Scenario: Unbekannte URL
- **WHEN** ein Nutzer `/gibt-es-nicht/` aufruft
- **THEN** antwortet der Server mit Status 404 und zeigt die Fehlerseite

### Requirement: Sprunglink
Jede Seite SHALL als erstes fokussierbares Element einen „Zum Inhalt springen“-Link besitzen, der bei Fokus sichtbar wird.

#### Scenario: Tastaturnutzer
- **WHEN** ein Nutzer auf einer Seite zum ersten Mal `Tab` drückt
- **THEN** erscheint „Zum Inhalt springen“ und führt bei Aktivierung zum Hauptinhalt
