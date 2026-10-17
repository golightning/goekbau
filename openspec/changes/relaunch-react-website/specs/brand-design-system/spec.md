## Purpose

Legt das Corporate Design der GÖK Bauüberwachung Bahn GmbH als verbindliche Tokens fest und regelt deren Anwendung, damit alle Seiten konsistent, responsiv und markengerecht aussehen.

## ADDED Requirements

### Requirement: Farbpalette
Die Website SHALL ausschließlich Farben aus der definierten Palette verwenden: Primär/Bronze `#A6875C`, Bronze-Hell `#E2C398`, Sekundär `#54595F`, Text `#141414`, Fläche-Hell `#EEEEEE`, Fläche-Weiß `#FFFFFF`, davon abgeleitete Abstufungen sowie funktionale Statusfarben für Fehler und Erfolg. Alle MUST im Design-System dokumentiert sein.

#### Scenario: Undokumentierte Farbe im Code
- **WHEN** eine Komponente eine Farbe verwendet, die nicht als Token definiert ist
- **THEN** schlägt die automatische Stil-Prüfung im Build fehl

#### Scenario: Primäraktion
- **WHEN** eine primäre Handlungsaufforderung (z. B. „Kontakt aufnehmen“) dargestellt wird
- **THEN** verwendet sie die Primärfarbe Bronze als Hintergrund oder Akzent

### Requirement: Typografie
Die Website SHALL genau zwei Schriftfamilien verwenden: Raleway (Überschriften, Navigation, Buttons, Akzente) und Roboto Slab (Fließtext). Poppins aus dem Elementor-Kit entfällt (Design-Durchgang 17.10.2026: zwei Familien tragen die Marke, eine dritte kostet Ladezeit ohne eigene Stimme). Alle Schriftdateien MUST vom eigenen Origin ausgeliefert werden.

#### Scenario: Schriften geladen
- **WHEN** eine beliebige Seite geladen wird
- **THEN** stammen alle Schrift-Requests vom Origin `goekbau.de` und keiner von `fonts.googleapis.com` oder `fonts.gstatic.com`

#### Scenario: Schriftladen verzögert
- **WHEN** eine Webfont noch nicht geladen ist
- **THEN** bleibt der Text mit einer metrisch angepassten Systemschrift lesbar (`font-display: swap`)

### Requirement: Responsives Layout
Jede Seite SHALL ab 320 px Viewport-Breite ohne horizontales Scrollen nutzbar sein. Sie SHALL mindestens die Layoutstufen Mobil (< 768 px), Tablet (768–1023 px) und Desktop (≥ 1024 px) unterstützen, bei einer maximalen Breite von 1140–1280 px für Textspalten. Bild-, Plakat- und Anzeigeflächen (z. B. Hero, Leistungs-Plakat, Wortmarke) MAY die volle Viewport-Breite mit Seitenrand nutzen; Fließtext MUST dabei auf eine lesbare Zeilenlänge (höchstens ca. 75 Zeichen) begrenzt bleiben.

#### Scenario: Schmaler Viewport
- **WHEN** eine Seite in 320 px Breite angezeigt wird
- **THEN** gibt es keinen horizontalen Scrollbalken und alle Inhalte sind erreichbar

### Requirement: Bewegung und Animation
Animationen SHALL nur dekorativ sein und MUST abgeschaltet werden, wenn das Betriebssystem `prefers-reduced-motion: reduce` meldet. Inhalte MUST ohne JavaScript sichtbar sein.

#### Scenario: Reduzierte Bewegung
- **WHEN** ein Nutzer mit `prefers-reduced-motion: reduce` die Startseite öffnet
- **THEN** laufen keine Einblend-, Slider- oder Zähleranimationen und alle Inhalte sind sofort im Endzustand sichtbar

#### Scenario: Kennzahlen ohne JavaScript
- **WHEN** die Seite „Über uns“ ohne JavaScript geladen wird
- **THEN** zeigen die Kennzahlen ihre tatsächlichen Werte und nicht „0“

### Requirement: Logo und Markenelemente
Die Website SHALL das GÖK-Logo als Vektorgrafik (SVG) oder in hochauflösender Rasterversion darstellen und Favicons in den gängigen Größen (inkl. Apple-Touch-Icon) bereitstellen.

#### Scenario: Hochauflösendes Display
- **WHEN** das Logo auf einem Display mit Pixeldichte 2× angezeigt wird
- **THEN** ist es scharf und nicht verpixelt
