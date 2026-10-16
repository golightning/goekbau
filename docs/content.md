# Inhalte pflegen

Alle Texte, Bilder und Stammdaten liegen in `content/`. Komponenten-Code muss für Inhaltsänderungen nicht angefasst werden. Jede Änderung wird beim Build gegen ein Schema geprüft (`src/content/schema.ts`). Bei einem Fehler bricht der Build mit Datei- und Feldangabe ab.

```
content/
  company.yaml              Stammdaten (Name, Adresse, Telefon, E-Mails, Social) – einzige Quelle
  pages/*.yaml              Seiten: SEO, Hero, Textblöcke
  legal/*.md                Impressum, Datenschutz
  service-areas.yaml        Leistungsbereiche
  services/*.yaml           Leistungen (status: offered | planned)
  projects/*.yaml           Referenzprojekte
  team/*.yaml               Teammitglieder (Foto optional)
  partners/*.yaml           Kunden/Partner mit Logo
  stats.yaml                Kennzahlen
  careers/jobs/*.md         Stellenangebote
  careers/trainings/*.md    Aus- und Weiterbildungsangebote
  media/                    Originalbilder
```

## Ablauf

1. Branch anlegen: `git switch -c inhalt/neue-stelle`
2. Datei ändern oder anlegen (Beispiele unten)
3. Lokal prüfen: `pnpm content` (nur Validierung) oder `pnpm dev` (Vorschau unter http://localhost:3000)
4. Committen, pushen, Pull Request öffnen. Die CI prüft alles; nach dem Merge in `main` geht die Änderung live (sobald Deploy Now angebunden ist).

## Neue Stelle veröffentlichen

Datei `content/careers/jobs/<slug>.md` anlegen – am einfachsten eine bestehende kopieren:

```markdown
---
type: job
slug: sicherungsueberwacher # wird zur URL /karriere/stellen/sicherungsueberwacher/
title: Sicherungsüberwacher (SIPO)
status: published # draft = nicht sichtbar
summary: 20–300 Zeichen Kurzbeschreibung für die Übersicht.
datePosted: 2026-11-01
validThrough: 2027-01-31 # optional: danach automatisch ausgeblendet
employmentType: [FULL_TIME] # FULL_TIME | PART_TIME | CONTRACTOR | TEMPORARY
location: { city: Senden, region: Bayern }
seo:
  title: Stelle Sicherungsüberwacher (m/w/d) # max. 60 Zeichen, eindeutig
  description: 70–160 Zeichen für Google und Social-Media-Vorschau.
---

## Beschreibung

…

## Ihre Aufgaben

- …

## Ihr Profil

- …
```

Ausbildungsangebote funktionieren genauso unter `content/careers/trainings/` mit `type: training` (ohne `employmentType`).
Eine Stelle entfernen: `status: draft` setzen oder `validThrough` in die Vergangenheit legen. Hat sie `legacyPaths`, leiten diese Adressen dann automatisch auf `/karriere/` um.

## Kennzahl ändern

In `content/stats.yaml` den `value` anpassen, z. B. `value: 60000`. Die Zahl erscheint auf „Über uns“ – formatiert mit Tausenderpunkt.

## Bild hinzufügen

1. Originaldatei (JPG/PNG, gern groß) nach `content/media/<bereich>/` legen, sprechender Dateiname in Kleinbuchstaben.
2. In der YAML-Datei referenzieren – **immer mit Alternativtext**, der beschreibt, was zu sehen ist:

   ```yaml
   photo:
     src: ../media/team/max-muster.jpg
     alt: Porträt von Max Muster auf einer Baustelle
   ```

   Rein schmückende Bilder statt `alt` mit `decorative: true` markieren.

3. Verkleinerte Varianten (WebP/AVIF) erzeugt der Build automatisch.
4. Herkunft und Lizenz in `research/wp-audit/MIGRATION.md` (Abschnitt Medien) bzw. künftig `content/media/SOURCES.md` vermerken.

## Stammdaten ändern

Telefon, E-Mail, Adresse nur in `content/company.yaml` ändern – Footer, Kontaktseite, Impressum und strukturierte Daten übernehmen das automatisch. Ein Test schlägt fehl, wenn solche Daten irgendwo im Code fest eingetragen werden.

## Offene Punkte markieren

Was noch vom Kunden kommen muss, mit `⟦OFFEN: …⟧` markieren. Lokal und auf Staging sichtbar, ein Produktions-Build (`SITE_ENV=production pnpm assemble`) bricht ab, solange ein solcher Marker existiert.
