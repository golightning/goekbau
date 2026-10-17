## Purpose

Legt messbare Grenzwerte für Ladezeit und Ressourcenverbrauch fest, damit die Website auch mobil auf der Baustelle schnell lädt und die Verbesserung gegenüber WordPress nachweisbar bleibt.

## ADDED Requirements

### Requirement: Core Web Vitals
Jede Seite SHALL im Lighthouse-Mobilprofil (simuliertes langsames 4G) erreichen: LCP ≤ 2,5 s (Seiten mit vollflächigem Foto-Hero: ≤ 3,0 s), CLS ≤ 0,1, TBT ≤ 200 ms und Performance-Score ≥ 90. Grenzwerte angepasst nach Messung am 17.10.2026 (Entscheidung Auftraggeber: Next.js behalten).

#### Scenario: Lighthouse in der Pipeline
- **WHEN** die Pipeline Lighthouse CI gegen Startseite, Über uns, Karriere und Kontakt ausführt
- **THEN** erreicht jede Seite die genannten Grenzwerte, andernfalls schlägt der Build fehl

### Requirement: Ressourcen-Budget
Die Startseite SHALL beim initialen Laden höchstens 30 Requests, höchstens 160 KB JavaScript (komprimiert) und höchstens 40 KB CSS (komprimiert) übertragen. Die Grundlast von React 19 und Next.js beträgt rund 125 KB.

#### Scenario: Budget überschritten
- **WHEN** eine Änderung das JavaScript der Startseite über 160 KB komprimiert anwachsen lässt
- **THEN** schlägt die Budget-Prüfung fehl

### Requirement: Optimierte Bilder
Bilder SHALL in modernen Formaten (AVIF/WebP mit Fallback), in passenden Größen per `srcset` und mit festen Abmessungen ausgeliefert werden. Bilder unterhalb des sichtbaren Bereichs MUST lazy geladen werden. Das LCP-Bild MUST priorisiert geladen werden.

#### Scenario: Smartphone lädt Hero
- **WHEN** ein Smartphone mit 390 px Breite die Startseite lädt
- **THEN** wird eine Hero-Bildvariante von höchstens 800 px Breite geladen, nicht das Original

### Requirement: Caching
Gehashte Build-Assets SHALL mit `Cache-Control: public, max-age=31536000, immutable` ausgeliefert werden, HTML-Seiten mit einer Revalidierung bei jedem Aufruf.

#### Scenario: Wiederholter Besuch
- **WHEN** ein Nutzer nach einem Deployment die Seite erneut lädt
- **THEN** erhält er das neue HTML, während unveränderte Assets aus dem Browser-Cache kommen
